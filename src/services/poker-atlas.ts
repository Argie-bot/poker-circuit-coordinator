/**
 * PokerAtlas API Service
 * Official API for tournament data - primary data source
 * Documentation: https://www.pokeratlas.com/api/docs
 */

import axios from 'axios';
import { Tournament, Venue, Circuit, Address, Coordinates } from '@/types';

// PokerAtlas API types
interface PokerAtlasEvent {
  id: string;
  name: string;
  venue: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
  };
  buy_in: number;
  start_date: string;
  end_date: string;
  guaranteed_prize?: number;
  estimated_entries?: number;
  status: 'scheduled' | 'running' | 'completed' | 'cancelled';
  registration_deadline?: string;
  late_registration_levels?: number;
  structure: {
    starting_stack?: number;
    level_duration?: number;
    type?: 'freezeout' | 'reentry' | 'rebuy';
  };
  series?: {
    name: string;
    organizer: string;
    website?: string;
  };
}

interface PokerAtlasResponse {
  events: PokerAtlasEvent[];
  total: number;
  page: number;
  has_more: boolean;
}

export class PokerAtlasService {
  private baseUrl = 'https://api.pokeratlas.com/v1';
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'PokerCircuitCoordinator/1.0'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await axios.get(`${this.baseUrl}${endpoint}`, {
      headers,
      params: {
        ...params,
        format: 'json'
      },
      timeout: 10000
    });

    return response.data;
  }

  /**
   * Fetch tournaments by date range
   */
  async getTournaments(
    startDate: Date,
    endDate: Date,
    filters?: {
      minBuyIn?: number;
      maxBuyIn?: number;
      state?: string;
      city?: string;
      venue?: string;
      guaranteeMin?: number;
    }
  ): Promise<Tournament[]> {
    const params = {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      per_page: 100,
      ...filters
    };

    try {
      const data = await this.makeRequest<PokerAtlasResponse>('/tournaments', params);
      return data.events.map(event => this.mapToTournament(event));
    } catch (error) {
      console.error('Error fetching PokerAtlas tournaments:', error);
      return [];
    }
  }

  /**
   * Search tournaments by venue
   */
  async getTournamentsByVenue(venueId: string): Promise<Tournament[]> {
    try {
      const data = await this.makeRequest<PokerAtlasResponse>('/tournaments', {
        venue_id: venueId,
        per_page: 50
      });
      return data.events.map(event => this.mapToTournament(event));
    } catch (error) {
      console.error('Error fetching PokerAtlas tournaments by venue:', error);
      return [];
    }
  }

  /**
   * Get tournament details by ID
   */
  async getTournamentById(id: string): Promise<Tournament | null> {
    try {
      const data = await this.makeRequest<{event: PokerAtlasEvent}>(`/tournaments/${id}`);
      return this.mapToTournament(data.event);
    } catch (error) {
      console.error('Error fetching PokerAtlas tournament:', error);
      return null;
    }
  }

  /**
   * Map PokerAtlas event to our Tournament type
   */
  private mapToTournament(event: PokerAtlasEvent): Tournament {
    // Map venue
    const venue: Venue = {
      id: `pa-${event.venue.id}`,
      name: event.venue.name,
      address: this.parseAddress(event.venue.address, event.venue.city, event.venue.state, event.venue.zip),
      coordinates: {
        lat: event.venue.latitude || 0,
        lng: event.venue.longitude || 0
      },
      amenities: [], // PokerAtlas doesn't provide detailed amenity info
      parking: {
        available: true,
        cost: 'free' // Default assumption
      },
      nearbyHotels: [],
      localTips: [],
      timezone: this.getTimezoneForState(event.venue.state)
    };

    // Determine circuit type
    const circuit = this.determineCircuit(event.series?.name, event.series?.organizer);

    // Map tournament structure
    const structure = {
      type: (event.structure.type || 'reentry') as any,
      startingStack: event.structure.starting_stack || 20000,
      blindLevelDuration: event.structure.level_duration || 40,
      reentryLevels: event.late_registration_levels || 10
    };

    // Map status
    const statusMap = {
      'scheduled': 'upcoming' as const,
      'running': 'running' as const,
      'completed': 'completed' as const,
      'cancelled': 'cancelled' as const
    };

    return {
      id: `pa-${event.id}`,
      name: event.name,
      circuit,
      venue,
      buyIn: event.buy_in,
      startDate: new Date(event.start_date),
      endDate: new Date(event.end_date),
      estimatedField: event.estimated_entries || 200,
      structure,
      blindLevels: structure.blindLevelDuration,
      prizeGuarantee: event.guaranteed_prize,
      status: statusMap[event.status] || 'upcoming',
      registrationDeadline: event.registration_deadline ? new Date(event.registration_deadline) : undefined,
      lateRegistrationLevels: event.late_registration_levels
    };
  }

  private parseAddress(addressStr: string, city: string, state: string, zip: string): Address {
    return {
      street: addressStr,
      city,
      state,
      country: 'USA', // PokerAtlas is primarily US-focused
      postalCode: zip
    };
  }

  private determineCircuit(seriesName?: string, organizer?: string): Circuit {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Default circuit for PokerAtlas events
    let circuitType: Circuit['type'] = 'regional';
    let name = 'Regional Tournament';
    let organizerName = organizer || 'Tournament Organizer';
    let website = 'https://www.pokeratlas.com';

    if (seriesName) {
      const series = seriesName.toLowerCase();
      
      if (series.includes('wsop') || series.includes('world series')) {
        circuitType = 'wsop';
        name = 'World Series of Poker Circuit';
        organizerName = 'Caesars Entertainment';
        website = 'https://www.wsop.com';
      } else if (series.includes('wpt') || series.includes('world poker tour')) {
        circuitType = 'wpt';
        name = 'World Poker Tour';
        organizerName = 'WPT Enterprises';
        website = 'https://www.worldpokertour.com';
      } else if (series.includes('ept') || series.includes('european')) {
        circuitType = 'ept';
        name = 'European Poker Tour';
        organizerName = 'PokerStars';
        website = 'https://www.pokerstars.com/ept';
      } else {
        name = seriesName;
      }
    }

    return {
      id: `pa-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      organizer: organizerName,
      type: circuitType,
      website,
      seasonStart: new Date(currentYear, 0, 1),
      seasonEnd: new Date(currentYear, 11, 31)
    };
  }

  private getTimezoneForState(state: string): string {
    // Map US states to timezones (simplified)
    const timezoneMap: Record<string, string> = {
      'CA': 'America/Los_Angeles',
      'NV': 'America/Los_Angeles',
      'TX': 'America/Chicago',
      'FL': 'America/New_York',
      'NY': 'America/New_York',
      'NJ': 'America/New_York',
      'PA': 'America/New_York',
      'IL': 'America/Chicago',
      'IN': 'America/New_York',
      'OH': 'America/New_York',
      'MI': 'America/New_York',
      'WI': 'America/Chicago',
      'MN': 'America/Chicago',
      'AZ': 'America/Phoenix',
      'CO': 'America/Denver',
      'WA': 'America/Los_Angeles',
      'OR': 'America/Los_Angeles'
    };

    return timezoneMap[state?.toUpperCase()] || 'America/New_York';
  }

  /**
   * Check API connectivity and rate limits
   */
  async checkStatus(): Promise<{
    connected: boolean;
    rateLimitRemaining?: number;
    rateLimitReset?: Date;
    error?: string;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/status`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PokerCircuitCoordinator/1.0',
          ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
        },
        timeout: 5000
      });

      return {
        connected: true,
        rateLimitRemaining: response.headers['x-ratelimit-remaining'] 
          ? parseInt(response.headers['x-ratelimit-remaining']) 
          : undefined,
        rateLimitReset: response.headers['x-ratelimit-reset']
          ? new Date(parseInt(response.headers['x-ratelimit-reset']) * 1000)
          : undefined
      };
    } catch (error: any) {
      return {
        connected: false,
        error: error.message || 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const pokerAtlas = new PokerAtlasService(
  process.env.POKER_ATLAS_API_KEY
);