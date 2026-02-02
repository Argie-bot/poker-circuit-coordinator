import { NextRequest, NextResponse } from 'next/server';
import { cardPlayerScraper } from '@/lib/scrapers/card-player';
import { wsopScraper } from '@/lib/scrapers/wsop-circuit';
import { wptScraper } from '@/lib/scrapers/wpt';
import { pokerAtlas } from '@/services/poker-atlas';
import { Tournament } from '@/types';
import fs from 'fs/promises';
import path from 'path';

// Cache configuration
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
const CACHE_FILE_PATH = path.join(process.cwd(), '.cache', 'tournaments.json');

interface CachedData {
  tournaments: Tournament[];
  lastUpdated: number;
  sources: {
    cardPlayer: { count: number; lastUpdated: number; error?: string };
    wsop: { count: number; lastUpdated: number; error?: string };
    wpt: { count: number; lastUpdated: number; error?: string };
    pokerAtlas: { count: number; lastUpdated: number; error?: string };
  };
}

async function ensureCacheDirectory(): Promise<void> {
  const cacheDir = path.dirname(CACHE_FILE_PATH);
  try {
    await fs.access(cacheDir);
  } catch {
    await fs.mkdir(cacheDir, { recursive: true });
  }
}

async function readCache(): Promise<CachedData | null> {
  try {
    await ensureCacheDirectory();
    const data = await fs.readFile(CACHE_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function writeCache(data: CachedData): Promise<void> {
  try {
    await ensureCacheDirectory();
    await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing cache:', error);
  }
}

function isCacheValid(cache: CachedData): boolean {
  return Date.now() - cache.lastUpdated < CACHE_TTL;
}

async function fetchFromSource(
  source: string,
  fetcher: () => Promise<Tournament[]>
): Promise<{ tournaments: Tournament[]; error?: string }> {
  try {
    console.log(`Fetching tournaments from ${source}...`);
    const tournaments = await fetcher();
    console.log(`${source}: Found ${tournaments.length} tournaments`);
    return { tournaments };
  } catch (error) {
    console.error(`Error fetching from ${source}:`, error);
    return {
      tournaments: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function fetchAllTournaments(forceRefresh = false): Promise<CachedData> {
  const cache = await readCache();
  
  if (!forceRefresh && cache && isCacheValid(cache)) {
    console.log('Returning cached tournament data');
    return cache;
  }

  console.log('Fetching fresh tournament data from all sources...');

  // Fetch from all sources in parallel
  const [cardPlayerResult, wsopResult, wptResult, pokerAtlasResult] = await Promise.allSettled([
    fetchFromSource('CardPlayer', () => cardPlayerScraper.fetchTournaments()),
    fetchFromSource('WSOP Circuit', () => wsopScraper.getCircuitEvents()),
    fetchFromSource('WPT', () => wptScraper.getWPTEvents()),
    fetchFromSource('PokerAtlas', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6); // 6 months ahead
      return await pokerAtlas.getTournaments(startDate, endDate);
    }),
  ]);

  // Process results
  const allTournaments: Tournament[] = [];
  const now = Date.now();
  const sources = {
    cardPlayer: { count: 0, lastUpdated: now, error: undefined as string | undefined },
    wsop: { count: 0, lastUpdated: now, error: undefined as string | undefined },
    wpt: { count: 0, lastUpdated: now, error: undefined as string | undefined },
    pokerAtlas: { count: 0, lastUpdated: now, error: undefined as string | undefined }
  };

  // CardPlayer
  if (cardPlayerResult.status === 'fulfilled') {
    const result = cardPlayerResult.value;
    allTournaments.push(...result.tournaments);
    sources.cardPlayer.count = result.tournaments.length;
    if (result.error) sources.cardPlayer.error = result.error;
  } else {
    sources.cardPlayer.error = cardPlayerResult.reason?.message || 'Fetch failed';
  }

  // WSOP
  if (wsopResult.status === 'fulfilled') {
    const result = wsopResult.value;
    allTournaments.push(...result.tournaments);
    sources.wsop.count = result.tournaments.length;
    if (result.error) sources.wsop.error = result.error;
  } else {
    sources.wsop.error = wsopResult.reason?.message || 'Fetch failed';
  }

  // WPT
  if (wptResult.status === 'fulfilled') {
    const result = wptResult.value;
    allTournaments.push(...result.tournaments);
    sources.wpt.count = result.tournaments.length;
    if (result.error) sources.wpt.error = result.error;
  } else {
    sources.wpt.error = wptResult.reason?.message || 'Fetch failed';
  }

  // PokerAtlas
  if (pokerAtlasResult.status === 'fulfilled') {
    const result = pokerAtlasResult.value;
    allTournaments.push(...result.tournaments);
    sources.pokerAtlas.count = result.tournaments.length;
    if (result.error) sources.pokerAtlas.error = result.error;
  } else {
    sources.pokerAtlas.error = pokerAtlasResult.reason?.message || 'Fetch failed';
  }

  // Remove duplicates based on name, venue, and date
  const uniqueTournaments = removeDuplicates(allTournaments);

  // Sort by start date
  uniqueTournaments.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  console.log(`Total tournaments fetched: ${allTournaments.length}, unique: ${uniqueTournaments.length}`);

  const cachedData: CachedData = {
    tournaments: uniqueTournaments,
    lastUpdated: now,
    sources
  };

  // Save to cache
  await writeCache(cachedData);

  return cachedData;
}

function removeDuplicates(tournaments: Tournament[]): Tournament[] {
  const seen = new Set<string>();
  return tournaments.filter(tournament => {
    // Create a key based on name, venue, and date
    const key = `${tournament.name.toLowerCase()}-${tournament.venue.name.toLowerCase()}-${tournament.startDate.toISOString().split('T')[0]}`;
    
    if (seen.has(key)) {
      return false;
    }
    
    seen.add(key);
    return true;
  });
}

function filterTournaments(tournaments: Tournament[], filters: any): Tournament[] {
  return tournaments.filter(tournament => {
    // Date range filter
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      if (tournament.startDate < startDate) return false;
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      if (tournament.startDate > endDate) return false;
    }

    // Buy-in range filter
    if (filters.minBuyIn && tournament.buyIn < filters.minBuyIn) return false;
    if (filters.maxBuyIn && tournament.buyIn > filters.maxBuyIn) return false;

    // Circuit filter
    if (filters.circuits && filters.circuits.length > 0) {
      if (!filters.circuits.includes(tournament.circuit.type)) return false;
    }

    // State filter
    if (filters.states && filters.states.length > 0) {
      if (!filters.states.includes(tournament.venue.address.state)) return false;
    }

    // Game type filter
    if (filters.gameType && filters.gameType !== 'all') {
      const tournamentName = tournament.name.toLowerCase();
      switch (filters.gameType) {
        case 'plo':
          if (!tournamentName.includes('plo') && !tournamentName.includes('omaha')) return false;
          break;
        case 'mixed':
          if (!tournamentName.includes('horse') && !tournamentName.includes('8-game') && !tournamentName.includes('mixed')) return false;
          break;
        case 'holdem':
        default:
          if (tournamentName.includes('plo') || tournamentName.includes('omaha') || tournamentName.includes('horse') || tournamentName.includes('8-game')) return false;
      }
    }

    // Search query filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      const searchableText = [
        tournament.name,
        tournament.venue.name,
        tournament.venue.address.city,
        tournament.venue.address.state,
        tournament.circuit.name
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) return false;
    }

    return true;
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filters = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      minBuyIn: searchParams.get('minBuyIn') ? parseInt(searchParams.get('minBuyIn')!) : undefined,
      maxBuyIn: searchParams.get('maxBuyIn') ? parseInt(searchParams.get('maxBuyIn')!) : undefined,
      circuits: searchParams.get('circuits')?.split(','),
      states: searchParams.get('states')?.split(','),
      gameType: searchParams.get('gameType'),
      search: searchParams.get('search'),
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      forceRefresh: searchParams.get('refresh') === 'true'
    };

    // Fetch tournaments (cached or fresh)
    const data = await fetchAllTournaments(filters.forceRefresh);
    
    // Apply filters
    let tournaments = filterTournaments(data.tournaments, filters);
    
    // Apply limit
    if (filters.limit && filters.limit > 0) {
      tournaments = tournaments.slice(0, filters.limit);
    }

    // Return response with metadata
    return NextResponse.json({
      tournaments,
      meta: {
        total: tournaments.length,
        lastUpdated: data.lastUpdated,
        sources: data.sources,
        filters: {
          ...filters,
          forceRefresh: undefined // Don't return this in response
        }
      }
    });

  } catch (error) {
    console.error('Tournament API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch tournaments',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: Add POST endpoint to force refresh
export async function POST() {
  try {
    const data = await fetchAllTournaments(true);
    
    return NextResponse.json({
      success: true,
      message: 'Tournament data refreshed',
      meta: {
        total: data.tournaments.length,
        lastUpdated: data.lastUpdated,
        sources: data.sources
      }
    });

  } catch (error) {
    console.error('Tournament refresh error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to refresh tournaments',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}