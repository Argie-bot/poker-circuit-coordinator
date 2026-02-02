/**
 * Tournament Data Service
 * Aggregates data from multiple sources: PokerAtlas API, WSOP Circuit scraper, WPT scraper
 * Provides unified interface for tournament data with caching and error handling
 */

import { Tournament, Circuit, Venue } from '@/types';
import { pokerAtlas } from './poker-atlas';
import { wsopScraper } from '@/lib/scrapers/wsop-circuit';
import { wptScraper } from '@/lib/scrapers/wpt';

interface DataSourceHealth {
  name: string;
  available: boolean;
  lastChecked: Date;
  error?: string;
  rateLimitRemaining?: number;
  rateLimitReset?: Date;
}

interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  expiresAt: Date;
}

export class TournamentDataService {
  private cache = new Map<string, CacheEntry<any>>();
  private cacheExpiryMinutes = 30; // Cache for 30 minutes
  private lastHealthCheck = new Date(0);
  private healthCheckIntervalMinutes = 5;
  
  private dataSourceHealth: DataSourceHealth[] = [
    {
      name: 'PokerAtlas',
      available: false,
      lastChecked: new Date(0)
    },
    {
      name: 'WSOP Circuit',
      available: false,
      lastChecked: new Date(0)
    },
    {
      name: 'WPT',
      available: false,
      lastChecked: new Date(0)
    }
  ];

  /**
   * Get all tournaments from all sources
   */
  async getAllTournaments(
    filters?: {
      startDate?: Date;
      endDate?: Date;
      minBuyIn?: number;
      maxBuyIn?: number;
      circuits?: string[];
      states?: string[];
      maxResults?: number;
    }
  ): Promise<Tournament[]> {
    const cacheKey = `all-tournaments-${JSON.stringify(filters)}`;
    
    // Check cache first
    const cached = this.getFromCache<Tournament[]>(cacheKey);
    if (cached) {
      return cached;
    }

    await this.checkDataSourceHealth();

    const startDate = filters?.startDate || new Date();
    const endDate = filters?.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

    const tournaments: Tournament[] = [];

    // Fetch from all available sources in parallel
    const fetchPromises: Promise<Tournament[]>[] = [];

    // PokerAtlas
    if (this.isSourceAvailable('PokerAtlas')) {
      fetchPromises.push(
        this.fetchPokerAtlasData(startDate, endDate, filters).catch(error => {
          console.error('PokerAtlas fetch failed:', error);
          return [];
        })
      );
    }

    // WSOP Circuit
    if (this.isSourceAvailable('WSOP Circuit') && this.shouldIncludeCircuit('wsop', filters?.circuits)) {
      fetchPromises.push(
        this.fetchWSopData().catch(error => {
          console.error('WSOP Circuit fetch failed:', error);
          return [];
        })
      );
    }

    // WPT
    if (this.isSourceAvailable('WPT') && this.shouldIncludeCircuit('wpt', filters?.circuits)) {
      fetchPromises.push(
        this.fetchWPTData().catch(error => {
          console.error('WPT fetch failed:', error);
          return [];
        })
      );
    }

    // Wait for all sources to complete
    const results = await Promise.allSettled(fetchPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        tournaments.push(...result.value);
      } else {
        console.error(`Data source ${index} failed:`, result.reason);
      }
    });

    // Filter and deduplicate
    let filteredTournaments = this.applyFilters(tournaments, filters);
    filteredTournaments = this.removeDuplicates(filteredTournaments);
    filteredTournaments = this.sortTournaments(filteredTournaments);

    if (filters?.maxResults) {
      filteredTournaments = filteredTournaments.slice(0, filters.maxResults);
    }

    // Cache the results
    this.setCache(cacheKey, filteredTournaments);

    return filteredTournaments;
  }

  /**
   * Get tournaments by circuit
   */
  async getTournamentsByCircuit(circuitType: Circuit['type']): Promise<Tournament[]> {
    return this.getAllTournaments({
      circuits: [circuitType]
    });
  }

  /**
   * Get upcoming tournaments (next 30 days)
   */
  async getUpcomingTournaments(limit?: number): Promise<Tournament[]> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    return this.getAllTournaments({
      startDate: new Date(),
      endDate,
      maxResults: limit
    });
  }

  /**
   * Search tournaments by name, venue, or location
   */
  async searchTournaments(query: string): Promise<Tournament[]> {
    const allTournaments = await this.getAllTournaments();
    const lowerQuery = query.toLowerCase();

    return allTournaments.filter(tournament =>
      tournament.name.toLowerCase().includes(lowerQuery) ||
      tournament.venue.name.toLowerCase().includes(lowerQuery) ||
      tournament.venue.address.city.toLowerCase().includes(lowerQuery) ||
      tournament.venue.address.state.toLowerCase().includes(lowerQuery) ||
      tournament.circuit.name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get data source health status
   */
  getDataSourceHealth(): DataSourceHealth[] {
    return [...this.dataSourceHealth];
  }

  /**
   * Force refresh of data sources
   */
  async refreshAllData(): Promise<void> {
    this.clearCache();
    await this.checkDataSourceHealth();
    
    // Trigger a fetch to warm the cache
    await this.getAllTournaments();
  }

  /**
   * Private methods
   */

  private async fetchPokerAtlasData(
    startDate: Date,
    endDate: Date,
    filters?: any
  ): Promise<Tournament[]> {
    console.log('Fetching PokerAtlas data...');
    
    const pokerAtlasFilters = {
      minBuyIn: filters?.minBuyIn,
      maxBuyIn: filters?.maxBuyIn,
      state: filters?.states?.join(',')
    };

    return await pokerAtlas.getTournaments(startDate, endDate, pokerAtlasFilters);
  }

  private async fetchWSopData(): Promise<Tournament[]> {
    console.log('Fetching WSOP Circuit data...');
    return await wsopScraper.getCircuitEvents();
  }

  private async fetchWPTData(): Promise<Tournament[]> {
    console.log('Fetching WPT data...');
    return await wptScraper.getWPTEvents();
  }

  private async checkDataSourceHealth(): Promise<void> {
    const now = new Date();
    const timeSinceLastCheck = (now.getTime() - this.lastHealthCheck.getTime()) / (1000 * 60);

    if (timeSinceLastCheck < this.healthCheckIntervalMinutes) {
      return; // Skip if we checked recently
    }

    this.lastHealthCheck = now;

    // Check PokerAtlas
    try {
      const pokerAtlasStatus = await pokerAtlas.checkStatus();
      this.updateSourceHealth('PokerAtlas', pokerAtlasStatus.connected, pokerAtlasStatus.error, {
        rateLimitRemaining: pokerAtlasStatus.rateLimitRemaining,
        rateLimitReset: pokerAtlasStatus.rateLimitReset
      });
    } catch (error) {
      this.updateSourceHealth('PokerAtlas', false, error instanceof Error ? error.message : 'Unknown error');
    }

    // Check WSOP Circuit
    try {
      const wsopAvailable = await wsopScraper.checkAvailability();
      this.updateSourceHealth('WSOP Circuit', wsopAvailable, wsopAvailable ? undefined : 'Website not accessible');
    } catch (error) {
      this.updateSourceHealth('WSOP Circuit', false, error instanceof Error ? error.message : 'Unknown error');
    }

    // Check WPT
    try {
      const wptAvailable = await wptScraper.checkAvailability();
      this.updateSourceHealth('WPT', wptAvailable, wptAvailable ? undefined : 'Website not accessible');
    } catch (error) {
      this.updateSourceHealth('WPT', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private updateSourceHealth(
    name: string, 
    available: boolean, 
    error?: string, 
    metadata?: { rateLimitRemaining?: number; rateLimitReset?: Date }
  ): void {
    const source = this.dataSourceHealth.find(s => s.name === name);
    if (source) {
      source.available = available;
      source.lastChecked = new Date();
      source.error = error;
      source.rateLimitRemaining = metadata?.rateLimitRemaining;
      source.rateLimitReset = metadata?.rateLimitReset;
    }
  }

  private isSourceAvailable(name: string): boolean {
    const source = this.dataSourceHealth.find(s => s.name === name);
    return source?.available || false;
  }

  private shouldIncludeCircuit(circuitType: string, requestedCircuits?: string[]): boolean {
    if (!requestedCircuits || requestedCircuits.length === 0) {
      return true; // Include all circuits if none specified
    }
    return requestedCircuits.includes(circuitType);
  }

  private applyFilters(tournaments: Tournament[], filters?: any): Tournament[] {
    if (!filters) return tournaments;

    return tournaments.filter(tournament => {
      // Date filters
      if (filters.startDate && tournament.startDate < filters.startDate) {
        return false;
      }
      if (filters.endDate && tournament.startDate > filters.endDate) {
        return false;
      }

      // Buy-in filters
      if (filters.minBuyIn && tournament.buyIn < filters.minBuyIn) {
        return false;
      }
      if (filters.maxBuyIn && tournament.buyIn > filters.maxBuyIn) {
        return false;
      }

      // Circuit filters
      if (filters.circuits && !filters.circuits.includes(tournament.circuit.type)) {
        return false;
      }

      // State filters
      if (filters.states && !filters.states.includes(tournament.venue.address.state)) {
        return false;
      }

      return true;
    });
  }

  private removeDuplicates(tournaments: Tournament[]): Tournament[] {
    const uniqueKeys = new Set<string>();
    return tournaments.filter(tournament => {
      // Create a unique key based on name, venue, and date
      const key = `${tournament.name}-${tournament.venue.name}-${tournament.startDate.getTime()}`;
      
      if (uniqueKeys.has(key)) {
        return false;
      }
      
      uniqueKeys.add(key);
      return true;
    });
  }

  private sortTournaments(tournaments: Tournament[]): Tournament[] {
    return tournaments.sort((a, b) => {
      // Sort by date first
      const dateDiff = a.startDate.getTime() - b.startDate.getTime();
      if (dateDiff !== 0) {
        return dateDiff;
      }

      // Then by circuit prestige (WSOP > WPT > others)
      const circuitOrder = { 'wsop': 0, 'wpt': 1, 'ept': 2, 'regional': 3, 'local': 4 };
      const circuitDiff = (circuitOrder[a.circuit.type] || 5) - (circuitOrder[b.circuit.type] || 5);
      if (circuitDiff !== 0) {
        return circuitDiff;
      }

      // Then by buy-in (higher first)
      return b.buyIn - a.buyIn;
    });
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && entry.expiresAt > new Date()) {
      return entry.data as T;
    }
    
    if (entry) {
      this.cache.delete(key); // Remove expired entry
    }
    
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.cacheExpiryMinutes * 60 * 1000);
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  private clearCache(): void {
    this.cache.clear();
  }

  /**
   * Cleanup resources when shutting down
   */
  async cleanup(): Promise<void> {
    await wsopScraper.close();
    await wptScraper.close();
    this.clearCache();
  }
}

// Export singleton instance
export const tournamentDataService = new TournamentDataService();