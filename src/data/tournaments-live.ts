/**
 * Live Tournament Data
 * Replaces the mock data with real API and scraping sources
 */

import { Tournament, Circuit, Venue } from '@/types';
import { tournamentDataService } from '@/services/tournament-data-service';

// Live circuit definitions - these are now backed by real data
export const circuits: Circuit[] = [
  {
    id: 'wsop',
    name: 'World Series of Poker',
    organizer: 'Caesars Entertainment',
    type: 'wsop',
    website: 'https://www.wsop.com',
    seasonStart: new Date('2024-01-01'),
    seasonEnd: new Date('2024-12-31')
  },
  {
    id: 'wpt',
    name: 'World Poker Tour',
    organizer: 'WPT Enterprises',
    type: 'wpt',
    website: 'https://www.worldpokertour.com',
    seasonStart: new Date('2024-01-01'),
    seasonEnd: new Date('2024-12-31')
  },
  {
    id: 'ept',
    name: 'European Poker Tour',
    organizer: 'PokerStars',
    type: 'ept',
    website: 'https://www.pokerstars.com/ept',
    seasonStart: new Date('2024-01-01'),
    seasonEnd: new Date('2024-12-31')
  },
  {
    id: 'regional',
    name: 'Regional Circuits',
    organizer: 'Various',
    type: 'regional',
    website: 'https://www.pokeratlas.com',
    seasonStart: new Date('2024-01-01'),
    seasonEnd: new Date('2024-12-31')
  }
];

// Venues are now dynamically populated from scraped data
export const venues: Venue[] = [];

/**
 * Get all tournaments from live data sources
 */
export async function getTournaments(filters?: {
  startDate?: Date;
  endDate?: Date;
  minBuyIn?: number;
  maxBuyIn?: number;
  circuits?: string[];
  states?: string[];
  maxResults?: number;
}): Promise<Tournament[]> {
  return await tournamentDataService.getAllTournaments(filters);
}

/**
 * Get tournaments by circuit type
 */
export async function getTournamentsByCircuit(circuitId: string): Promise<Tournament[]> {
  const circuit = circuits.find(c => c.id === circuitId);
  if (!circuit) {
    return [];
  }
  
  return await tournamentDataService.getTournamentsByCircuit(circuit.type);
}

/**
 * Get upcoming tournaments (next 30 days)
 */
export async function getUpcomingTournaments(limit?: number): Promise<Tournament[]> {
  return await tournamentDataService.getUpcomingTournaments(limit);
}

/**
 * Get tournaments within a date range
 */
export async function getTournamentsByDateRange(startDate: Date, endDate: Date): Promise<Tournament[]> {
  return await tournamentDataService.getAllTournaments({
    startDate,
    endDate
  });
}

/**
 * Search tournaments by name, venue, or location
 */
export async function searchTournaments(query: string): Promise<Tournament[]> {
  return await tournamentDataService.searchTournaments(query);
}

/**
 * Get tournaments by buy-in range
 */
export async function getTournamentsByBuyInRange(
  minBuyIn: number, 
  maxBuyIn?: number
): Promise<Tournament[]> {
  return await tournamentDataService.getAllTournaments({
    minBuyIn,
    maxBuyIn
  });
}

/**
 * Get tournaments by state/region
 */
export async function getTournamentsByStates(states: string[]): Promise<Tournament[]> {
  return await tournamentDataService.getAllTournaments({
    states
  });
}

/**
 * Get data source health information
 */
export function getDataSourceHealth() {
  return tournamentDataService.getDataSourceHealth();
}

/**
 * Force refresh all data sources
 */
export async function refreshTournamentData(): Promise<void> {
  await tournamentDataService.refreshAllData();
}

/**
 * Get popular tournament filters
 */
export function getPopularFilters() {
  return {
    buyInRanges: [
      { label: 'Low Stakes ($50-$300)', min: 50, max: 300 },
      { label: 'Mid Stakes ($300-$1,000)', min: 300, max: 1000 },
      { label: 'High Stakes ($1,000-$5,000)', min: 1000, max: 5000 },
      { label: 'High Roller ($5,000+)', min: 5000, max: undefined }
    ],
    circuits: circuits.map(c => ({ id: c.id, name: c.name, type: c.type })),
    popularStates: ['NV', 'CA', 'FL', 'TX', 'NJ', 'PA', 'NY', 'IL'],
    timeRanges: [
      { label: 'Next 7 days', days: 7 },
      { label: 'Next 30 days', days: 30 },
      { label: 'Next 3 months', days: 90 },
      { label: 'Next 6 months', days: 180 }
    ]
  };
}

/**
 * Get tournament statistics
 */
export async function getTournamentStats(): Promise<{
  totalUpcoming: number;
  totalByCircuit: Record<string, number>;
  averageBuyIn: number;
  totalGuaranteed: number;
  popularStates: Array<{ state: string; count: number }>;
}> {
  const tournaments = await getUpcomingTournaments();
  
  const stats = {
    totalUpcoming: tournaments.length,
    totalByCircuit: {} as Record<string, number>,
    averageBuyIn: 0,
    totalGuaranteed: 0,
    popularStates: [] as Array<{ state: string; count: number }>
  };

  // Calculate stats
  const stateCount = new Map<string, number>();
  let totalBuyIn = 0;
  let totalGuaranteed = 0;

  tournaments.forEach(tournament => {
    // Circuit count
    const circuitType = tournament.circuit.type;
    stats.totalByCircuit[circuitType] = (stats.totalByCircuit[circuitType] || 0) + 1;
    
    // Buy-in average
    totalBuyIn += tournament.buyIn;
    
    // Guaranteed prize total
    if (tournament.prizeGuarantee) {
      totalGuaranteed += tournament.prizeGuarantee;
    }
    
    // State popularity
    const state = tournament.venue.address.state;
    if (state) {
      stateCount.set(state, (stateCount.get(state) || 0) + 1);
    }
  });

  if (tournaments.length > 0) {
    stats.averageBuyIn = Math.round(totalBuyIn / tournaments.length);
  }
  stats.totalGuaranteed = totalGuaranteed;

  // Convert state counts to sorted array
  stats.popularStates = Array.from(stateCount.entries())
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 states

  return stats;
}

/**
 * Get venue information from live data
 */
export async function getVenues(): Promise<Venue[]> {
  const tournaments = await getUpcomingTournaments();
  const venueMap = new Map<string, Venue>();
  
  tournaments.forEach(tournament => {
    const venue = tournament.venue;
    if (!venueMap.has(venue.id)) {
      venueMap.set(venue.id, venue);
    }
  });
  
  return Array.from(venueMap.values());
}

/**
 * Export compatibility with existing mock data structure
 * This allows gradual migration from mock to live data
 */
// Export a promise for tournaments
export const tournaments = getUpcomingTournaments(50); // Get first 50 upcoming tournaments as default

// For synchronous access, use mockTournaments from tournaments.ts

// Backward compatibility functions
export { circuits as mockCircuits };
export async function getMockTournaments() {
  return await getUpcomingTournaments(20);
}

// Health check for data sources
export async function checkDataSourceHealth() {
  const health = getDataSourceHealth();
  
  console.log('Data Source Health Check:');
  health.forEach(source => {
    const status = source.available ? '✅' : '❌';
    const lastChecked = source.lastChecked.toLocaleTimeString();
    const error = source.error ? ` (${source.error})` : '';
    
    console.log(`${status} ${source.name} - Last checked: ${lastChecked}${error}`);
    
    if (source.rateLimitRemaining !== undefined) {
      console.log(`   Rate limit: ${source.rateLimitRemaining} requests remaining`);
    }
  });
  
  return health;
}

// Development helpers
export const devHelpers = {
  refreshData: refreshTournamentData,
  checkHealth: checkDataSourceHealth,
  getStats: getTournamentStats,
  clearCache: () => tournamentDataService.refreshAllData()
};