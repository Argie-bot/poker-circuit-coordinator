/**
 * CardPlayer Web Scraper
 * Primary data source for poker tournament schedules
 * Scrapes https://www.cardplayer.com/poker-tournaments for comprehensive tournament data
 */

import * as cheerio from 'cheerio';
import { Tournament, Venue, Circuit, Address } from '@/types';

interface CardPlayerEvent {
  seriesName: string;
  venueName: string;
  city: string;
  state: string;
  country: string;
  startDate: Date;
  endDate: Date;
  events: {
    name: string;
    date: Date;
    buyIn?: number;
    gameType: string;
    guarantee?: number;
  }[];
}

export class CardPlayerScraper {
  private baseUrl = 'https://www.cardplayer.com';
  private userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  /**
   * Fetch tournament data from CardPlayer
   */
  async fetchTournaments(): Promise<Tournament[]> {
    try {
      // Fetch the main tournament page
      const response = await fetch(`${this.baseUrl}/poker-tournaments`, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Cache-Control': 'no-cache'
        },
      });

      if (!response.ok) {
        throw new Error(`CardPlayer fetch failed: ${response.status}`);
      }

      const html = await response.text();
      return this.parseTournamentPage(html);
    } catch (error) {
      console.error('Error fetching CardPlayer tournaments:', error);
      return [];
    }
  }

  /**
   * Parse the main tournament page HTML
   */
  private parseTournamentPage(html: string): Tournament[] {
    const $ = cheerio.load(html);
    const tournaments: Tournament[] = [];
    const events: CardPlayerEvent[] = [];

    // Look for tournament tables or cards
    $('.tournament-listing, .tournament-table, .schedule-table, table').each((i, tableElement) => {
      const $table = $(tableElement);
      
      // Skip if this doesn't look like a tournament table
      const tableText = $table.text().toLowerCase();
      if (!tableText.includes('casino') && !tableText.includes('tournament') && !tableText.includes('poker')) {
        return;
      }

      // Parse table rows
      $table.find('tr, .tournament-row').each((j, rowElement) => {
        const $row = $(rowElement);
        
        // Skip header rows
        if ($row.find('th').length > 0) return;
        
        try {
          const event = this.parseTableRow($row);
          if (event) {
            events.push(event);
          }
        } catch (error) {
          console.error('Error parsing CardPlayer row:', error);
        }
      });
    });

    // Convert CardPlayer events to Tournament objects
    events.forEach(event => {
      event.events.forEach(tournamentEvent => {
        try {
          const tournament = this.convertToTournament(event, tournamentEvent);
          if (tournament) {
            tournaments.push(tournament);
          }
        } catch (error) {
          console.error('Error converting CardPlayer event to tournament:', error);
        }
      });
    });

    return tournaments;
  }

  /**
   * Parse a table row to extract tournament information
   */
  private parseTableRow($row: any): CardPlayerEvent | null {
    const cells = $row.find('td, .cell');
    if (cells.length < 4) return null;

    try {
      // Common CardPlayer table structure: Date | Series | Casino | Location | Details  
      const dateText = cells.eq(0).text().trim();
      const seriesName = cells.eq(1).text().trim(); 
      const venueName = cells.eq(2).text().trim();
      const locationText = cells.eq(3).text().trim();

      if (!dateText || !seriesName || !venueName) {
        return null;
      }

      // Parse dates
      const dates = this.parseDateRange(dateText);
      if (!dates.start) return null;

      // Parse location
      let location = this.parseLocation(locationText);
      
      // Fallback: try to extract city from venue name if location parsing failed
      if (!location.city && !location.state) {
        location = this.extractLocationFromVenue(venueName);
      }
      
      // Parse any additional event details from the row
      const eventDetails = this.parseEventDetails($row);

      // Clean venue name after we have the location
      const cleanedVenueName = this.cleanVenueName(venueName, location.city);

      return {
        seriesName: this.cleanSeriesName(seriesName),
        venueName: cleanedVenueName,
        city: location.city,
        state: location.state,
        country: location.country,
        startDate: dates.start,
        endDate: dates.end || new Date(dates.start.getTime() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
        events: eventDetails.length > 0 ? eventDetails : [
          {
            name: seriesName,
            date: dates.start,
            gameType: 'No-Limit Hold\'em',
            buyIn: this.extractBuyIn($row.text()),
            guarantee: this.extractGuarantee($row.text())
          }
        ]
      };
    } catch (error) {
      console.error('Error parsing CardPlayer table row:', error);
      return null;
    }
  }

  /**
   * Parse date ranges from various formats
   */
  private parseDateRange(dateText: string): { start: Date; end?: Date } {
    if (!dateText) return { start: new Date() };

    // Remove extra whitespace and common prefixes
    dateText = dateText.replace(/^(date:|dates:)/i, '').trim();

    const patterns = [
      // "March 15-18, 2024"
      /(\w+)\s+(\d+)-(\d+),?\s+(\d{4})/i,
      // "Mar 15-18 2024"
      /(\w+)\s+(\d+)-(\d+)\s+(\d{4})/i,
      // "March 15, 2024 - March 18, 2024"
      /(\w+)\s+(\d+),?\s+(\d{4})\s*-\s*(\w+)\s+(\d+),?\s+(\d{4})/i,
      // "March 15, 2024"
      /(\w+)\s+(\d+),?\s+(\d{4})/i,
      // "3/15/24 - 3/18/24"
      /(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s*-\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})/,
      // "3/15/24"
      /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/,
      // ISO format "2024-03-15"
      /(\d{4})-(\d{2})-(\d{2})/
    ];

    for (const pattern of patterns) {
      const match = dateText.match(pattern);
      if (match) {
        try {
          if (pattern.toString().includes('\\w+')) {
            // Month name format
            const month = this.parseMonthName(match[1]);
            const year = parseInt(match[4] || match[3]);
            const startDay = parseInt(match[2]);
            
            let endDay = startDay;
            let endMonth = month;
            let endYear = year;
            
            if (match[3] && match[4]) {
              if (match[5] && match[6]) {
                // Cross-month range
                endMonth = this.parseMonthName(match[4]);
                endDay = parseInt(match[5]);
                endYear = parseInt(match[6]);
              } else {
                // Range within same month
                endDay = parseInt(match[3]);
              }
            }
            
            return {
              start: new Date(year, month, startDay),
              end: endDay !== startDay ? new Date(endYear, endMonth, endDay) : undefined
            };
          } else if (match[1] && match[2] && match[3]) {
            // MM/DD/YY format
            let year = parseInt(match[3]);
            if (year < 100) year += 2000; // Convert 2-digit year
            
            const month = parseInt(match[1]) - 1;
            const day = parseInt(match[2]);
            
            let endDate: Date | undefined;
            if (match[4] && match[5] && match[6]) {
              // Date range
              let endYear = parseInt(match[6]);
              if (endYear < 100) endYear += 2000;
              endDate = new Date(endYear, parseInt(match[4]) - 1, parseInt(match[5]));
            }
            
            return {
              start: new Date(year, month, day),
              end: endDate
            };
          } else if (match[1] && match[2] && match[3]) {
            // ISO format
            return {
              start: new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]))
            };
          }
        } catch (error) {
          console.error('Error parsing date:', error);
        }
      }
    }

    // Fallback: try to parse as a standard date
    try {
      const date = new Date(dateText);
      if (!isNaN(date.getTime()) && date.getFullYear() > 2020) {
        return { start: date };
      }
    } catch {
      // Ignore parsing errors
    }

    // Final fallback: return current date
    return { start: new Date() };
  }

  /**
   * Parse month name to number
   */
  private parseMonthName(monthName: string): number {
    const months: Record<string, number> = {
      'january': 0, 'jan': 0,
      'february': 1, 'feb': 1,
      'march': 2, 'mar': 2,
      'april': 3, 'apr': 3,
      'may': 4,
      'june': 5, 'jun': 5,
      'july': 6, 'jul': 6,
      'august': 7, 'aug': 7,
      'september': 8, 'sep': 8, 'sept': 8,
      'october': 9, 'oct': 9,
      'november': 10, 'nov': 10,
      'december': 11, 'dec': 11
    };
    return months[monthName.toLowerCase()] || 0;
  }

  /**
   * Parse location string to city, state, country
   */
  private parseLocation(locationText: string): { city: string; state: string; country: string } {
    if (!locationText) {
      return { city: '', state: '', country: 'USA' };
    }

    // Clean up the location text
    locationText = locationText.trim();

    // Handle common formats: "City, State", "City, State, Country", etc.
    const parts = locationText.split(',').map(part => part.trim());
    
    let city = '';
    let state = '';
    let country = 'USA';

    if (parts.length >= 2) {
      city = parts[0];
      state = this.normalizeState(parts[1]);
      
      // If there's a third part, it might be country
      if (parts.length >= 3) {
        const thirdPart = parts[2].toLowerCase();
        if (thirdPart.includes('canada') || thirdPart.includes('uk') || thirdPart.includes('mexico')) {
          country = parts[2];
        }
      }
    } else if (parts.length === 1) {
      // Single part - could be just city
      city = parts[0];
    }

    return { city, state, country };
  }

  /**
   * Extract location from venue name when location column fails
   */
  private extractLocationFromVenue(venueName: string): { city: string; state: string; country: string } {
    if (!venueName) {
      return { city: '', state: '', country: 'USA' };
    }

    // Common patterns in venue names like "Commerce Casino Commerce" or "Wynn Las Vegas"
    const knownVenues: Record<string, { city: string; state: string }> = {
      'commerce casino': { city: 'Commerce', state: 'CA' },
      'wynn las vegas': { city: 'Las Vegas', state: 'NV' },
      'bellagio': { city: 'Las Vegas', state: 'NV' },
      'aria': { city: 'Las Vegas', state: 'NV' },
      'venetian': { city: 'Las Vegas', state: 'NV' },
      'mgm grand': { city: 'Las Vegas', state: 'NV' },
      'caesars palace': { city: 'Las Vegas', state: 'NV' },
      'horseshoe': { city: 'Las Vegas', state: 'NV' },
      'bicycle casino': { city: 'Bell Gardens', state: 'CA' },
      'commerce': { city: 'Commerce', state: 'CA' },
      'borgata': { city: 'Atlantic City', state: 'NJ' },
      'foxwoods': { city: 'Mashantucket', state: 'CT' },
      'mohegan sun': { city: 'Uncasville', state: 'CT' },
      'winstar': { city: 'Thackerville', state: 'OK' },
      'hollywood': { city: 'Hollywood', state: 'FL' },
      'seminole hard rock': { city: 'Hollywood', state: 'FL' },
      'bay 101': { city: 'San Jose', state: 'CA' },
      'parx': { city: 'Bensalem', state: 'PA' }
    };

    // Try to match venue name
    const lowerVenue = venueName.toLowerCase();
    for (const [venue, location] of Object.entries(knownVenues)) {
      if (lowerVenue.includes(venue)) {
        return { ...location, country: 'USA' };
      }
    }

    // Try to extract city from duplicated patterns like "Commerce Casino Commerce"
    const words = venueName.split(/\s+/);
    if (words.length >= 3) {
      const firstWord = words[0].toLowerCase();
      const lastWord = words[words.length - 1].toLowerCase();
      
      // Check if first and last words are similar (venue name pattern)
      if (firstWord === lastWord || firstWord.includes(lastWord) || lastWord.includes(firstWord)) {
        const city = words[0];
        return {
          city: city,
          state: this.guesStateFromCity(city),
          country: 'USA'
        };
      }
    }

    // Try to extract location from patterns like "Casino Name City"
    const cityStatePattern = /([A-Za-z\s]+(?:Casino|Resort|Hotel|Club))\s+([A-Za-z\s]+)$/i;
    const match = venueName.match(cityStatePattern);
    if (match) {
      const potentialCity = match[2].trim();
      return {
        city: potentialCity,
        state: this.guesStateFromCity(potentialCity),
        country: 'USA'
      };
    }

    return { city: '', state: '', country: 'USA' };
  }

  /**
   * Guess state from city name
   */
  private guesStateFromCity(city: string): string {
    if (!city) return '';

    const cityToState: Record<string, string> = {
      'commerce': 'CA',
      'las vegas': 'NV',
      'atlantic city': 'NJ',
      'hollywood': 'FL',
      'san jose': 'CA',
      'bensalem': 'PA',
      'uncasville': 'CT',
      'thackerville': 'OK',
      'mashantucket': 'CT',
      'bell gardens': 'CA',
      'reno': 'NV',
      'biloxi': 'MS',
      'new orleans': 'LA',
      'chicago': 'IL',
      'detroit': 'MI',
      'cleveland': 'OH',
      'baltimore': 'MD',
      'philadelphia': 'PA',
      'phoenix': 'AZ',
      'tampa': 'FL',
      'miami': 'FL',
      'seattle': 'WA',
      'portland': 'OR'
    };

    const lowerCity = city.toLowerCase();
    return cityToState[lowerCity] || '';
  }

  /**
   * Normalize state name to abbreviation
   */
  private normalizeState(state: string): string {
    if (!state) return '';
    
    const stateMap: Record<string, string> = {
      'california': 'CA', 'nevada': 'NV', 'texas': 'TX', 'florida': 'FL',
      'new york': 'NY', 'new jersey': 'NJ', 'pennsylvania': 'PA',
      'illinois': 'IL', 'indiana': 'IN', 'michigan': 'MI', 'ohio': 'OH',
      'oklahoma': 'OK', 'arizona': 'AZ', 'colorado': 'CO', 'louisiana': 'LA',
      'maryland': 'MD', 'virginia': 'VA', 'north carolina': 'NC',
      'south carolina': 'SC', 'georgia': 'GA', 'alabama': 'AL',
      'tennessee': 'TN', 'kentucky': 'KY', 'mississippi': 'MS',
      'arkansas': 'AR', 'missouri': 'MO', 'kansas': 'KS', 'nebraska': 'NE',
      'iowa': 'IA', 'minnesota': 'MN', 'wisconsin': 'WI', 'oregon': 'OR',
      'washington': 'WA', 'utah': 'UT', 'montana': 'MT', 'wyoming': 'WY',
      'idaho': 'ID', 'north dakota': 'ND', 'south dakota': 'SD',
      'west virginia': 'WV', 'delaware': 'DE', 'connecticut': 'CT',
      'rhode island': 'RI', 'massachusetts': 'MA', 'vermont': 'VT',
      'new hampshire': 'NH', 'maine': 'ME', 'alaska': 'AK', 'hawaii': 'HI'
    };

    const normalized = state.toLowerCase().trim();
    
    // Return mapped value or check if it's already an abbreviation
    if (stateMap[normalized]) {
      return stateMap[normalized];
    }
    
    // If it's already a 2-letter abbreviation, return uppercase
    if (state.length === 2) {
      return state.toUpperCase();
    }
    
    return state.trim();
  }

  /**
   * Parse event details from a row
   */
  private parseEventDetails($row: any): Array<{
    name: string;
    date: Date;
    buyIn?: number;
    gameType: string;
    guarantee?: number;
  }> {
    const events = [];
    const rowText = $row.text();

    // Look for buy-in amounts and game types in the text
    const buyIn = this.extractBuyIn(rowText);
    const guarantee = this.extractGuarantee(rowText);
    const gameType = this.extractGameType(rowText);

    // For now, return a single event - we could enhance this to parse multiple events
    events.push({
      name: $row.find('td').eq(1).text().trim() || 'Tournament',
      date: new Date(), // Will be overridden by the series date
      buyIn,
      gameType,
      guarantee
    });

    return events;
  }

  /**
   * Extract buy-in amount from text
   */
  private extractBuyIn(text: string): number | undefined {
    if (!text) return undefined;

    // Look for patterns like "$1,500", "$1.5K", "1500", etc.
    const patterns = [
      /\$?([\d,]+(?:\.\d+)?)\s*[kK]\b/,  // "$1.5K" format
      /\$?([\d,]+)\s*(?:buy.?in|entry)/i, // "buy-in $1500"
      /buy.?in:?\s*\$?([\d,]+)/i,        // "Buy-in: $1500"
      /entry:?\s*\$?([\d,]+)/i,          // "Entry: $1500"
      /\$\s?([\d,]+)\b/                  // "$1500"
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let amount = parseFloat(match[1].replace(/,/g, ''));
        
        // Handle K multiplier
        if (pattern.toString().includes('[kK]')) {
          amount *= 1000;
        }
        
        // Reasonable buy-in range
        if (amount >= 50 && amount <= 1000000) {
          return Math.round(amount);
        }
      }
    }

    return undefined;
  }

  /**
   * Extract guarantee amount from text
   */
  private extractGuarantee(text: string): number | undefined {
    if (!text) return undefined;

    const patterns = [
      /([\d,]+(?:\.\d+)?)\s*[mM]\s*(?:gtd|guaranteed?|guarantee)/i,  // "1.5M GTD"
      /([\d,]+)\s*[kK]\s*(?:gtd|guaranteed?|guarantee)/i,           // "500K GTD"
      /\$\s?([\d,]+(?:\.\d+)?)\s*[mM]\s*(?:gtd|guaranteed?)/i,      // "$1.5M GTD"
      /guaranteed?:?\s*\$?([\d,]+(?:\.\d+)?)\s*[mMkK]?/i            // "Guaranteed $500K"
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let amount = parseFloat(match[1].replace(/,/g, ''));
        
        const fullMatch = match[0].toLowerCase();
        if (fullMatch.includes('m')) {
          amount *= 1000000;
        } else if (fullMatch.includes('k')) {
          amount *= 1000;
        }
        
        // Reasonable guarantee range
        if (amount >= 1000 && amount <= 100000000) {
          return Math.round(amount);
        }
      }
    }

    return undefined;
  }

  /**
   * Extract game type from text
   */
  private extractGameType(text: string): string {
    if (!text) return 'No-Limit Hold\'em';

    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('plo') || lowerText.includes('pot-limit omaha') || lowerText.includes('pot limit omaha')) {
      return 'Pot-Limit Omaha';
    }
    if (lowerText.includes('horse') || lowerText.includes('h.o.r.s.e')) {
      return 'H.O.R.S.E.';
    }
    if (lowerText.includes('8-game') || lowerText.includes('mixed')) {
      return '8-Game Mixed';
    }
    if (lowerText.includes('stud')) {
      return '7-Card Stud';
    }
    if (lowerText.includes('omaha') && !lowerText.includes('hold')) {
      return 'Omaha';
    }
    
    return 'No-Limit Hold\'em'; // Default
  }

  /**
   * Clean series name
   */
  private cleanSeriesName(name: string): string {
    return name
      .replace(/^\s*\d+\.\s*/, '') // Remove leading numbers
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Clean venue name and remove duplicated city names
   */
  private cleanVenueName(name: string, city?: string): string {
    let cleaned = name
      .replace(/casino/i, 'Casino')
      .replace(/hotel/i, 'Hotel')
      .replace(/resort/i, 'Resort')
      .replace(/\s+/g, ' ')
      .trim();

    // Remove duplicate city names (e.g., "Commerce Casino Commerce" -> "Commerce Casino")
    if (city) {
      const cityPattern = new RegExp(`\\s+${city}\\s*$`, 'i');
      cleaned = cleaned.replace(cityPattern, '');
      
      // Also check for patterns like "Commerce / Commerce" or "Commerce - Commerce"
      const duplicatePattern = new RegExp(`\\s*[/-]\\s*${city}\\s*$`, 'i');
      cleaned = cleaned.replace(duplicatePattern, '');
    }

    // Remove common redundant words
    cleaned = cleaned
      .replace(/\s+poker\s+room$/i, '')
      .replace(/\s+card\s+room$/i, '')
      .trim();

    return cleaned;
  }

  /**
   * Convert CardPlayer event to Tournament object
   */
  private convertToTournament(event: CardPlayerEvent, tournamentEvent: any): Tournament | null {
    try {
      // Create venue
      const venue: Venue = {
        id: `cp-${event.venueName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: event.venueName,
        address: {
          street: '',
          city: event.city,
          state: event.state,
          country: event.country,
          postalCode: ''
        },
        coordinates: { lat: 0, lng: 0 }, // Would need geocoding
        amenities: [
          { name: 'Free WiFi', available: true },
          { name: 'Restaurant', available: true },
          { name: 'ATM', available: true }
        ],
        parking: {
          available: true,
          cost: 'free'
        },
        nearbyHotels: [],
        localTips: [],
        timezone: this.getTimezoneForState(event.state)
      };

      // Determine circuit type
      const circuit = this.determineCircuit(event.seriesName);

      // Create tournament
      const tournament: Tournament = {
        id: `cp-${event.seriesName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${event.startDate.getTime()}`,
        name: tournamentEvent.name || event.seriesName,
        circuit,
        venue,
        buyIn: tournamentEvent.buyIn || 500, // Default buy-in
        startDate: tournamentEvent.date || event.startDate,
        endDate: event.endDate,
        estimatedField: this.estimateField(tournamentEvent.buyIn || 500),
        structure: {
          type: 'reentry',
          startingStack: 20000,
          blindLevelDuration: 30,
          reentryLevels: 8
        },
        blindLevels: 30,
        prizeGuarantee: tournamentEvent.guarantee,
        status: 'upcoming',
        lateRegistrationLevels: 8
      };

      return tournament;
    } catch (error) {
      console.error('Error converting CardPlayer event to tournament:', error);
      return null;
    }
  }

  /**
   * Determine circuit type from series name
   */
  private determineCircuit(seriesName: string): Circuit {
    const name = seriesName.toLowerCase();
    const currentYear = new Date().getFullYear();
    
    if (name.includes('wsop') || name.includes('world series')) {
      return {
        id: 'wsop-circuit',
        name: 'WSOP Circuit',
        organizer: 'Caesars Entertainment',
        type: 'wsop',
        website: 'https://www.wsop.com',
        seasonStart: new Date(currentYear, 0, 1),
        seasonEnd: new Date(currentYear, 11, 31)
      };
    }
    
    if (name.includes('wpt') || name.includes('world poker tour')) {
      return {
        id: 'wpt',
        name: 'World Poker Tour',
        organizer: 'WPT Enterprises',
        type: 'wpt',
        website: 'https://www.worldpokertour.com',
        seasonStart: new Date(currentYear, 0, 1),
        seasonEnd: new Date(currentYear, 11, 31)
      };
    }
    
    // Default to regional
    return {
      id: 'regional',
      name: 'Regional Tournament',
      organizer: 'Regional Circuit',
      type: 'regional',
      website: 'https://www.cardplayer.com',
      seasonStart: new Date(currentYear, 0, 1),
      seasonEnd: new Date(currentYear, 11, 31)
    };
  }

  /**
   * Estimate field size based on buy-in
   */
  private estimateField(buyIn: number): number {
    if (buyIn >= 5000) return 200 + Math.floor(Math.random() * 150);
    if (buyIn >= 1000) return 400 + Math.floor(Math.random() * 300);
    if (buyIn >= 500) return 600 + Math.floor(Math.random() * 400);
    return 300 + Math.floor(Math.random() * 300);
  }

  /**
   * Get timezone for state
   */
  private getTimezoneForState(state: string): string {
    const timezoneMap: Record<string, string> = {
      'CA': 'America/Los_Angeles', 'california': 'America/Los_Angeles',
      'NV': 'America/Los_Angeles', 'nevada': 'America/Los_Angeles',
      'TX': 'America/Chicago', 'texas': 'America/Chicago',
      'FL': 'America/New_York', 'florida': 'America/New_York',
      'NY': 'America/New_York', 'new york': 'America/New_York',
      'NJ': 'America/New_York', 'new jersey': 'America/New_York',
      'PA': 'America/New_York', 'pennsylvania': 'America/New_York',
      'IL': 'America/Chicago', 'illinois': 'America/Chicago',
      'IN': 'America/New_York', 'indiana': 'America/New_York'
    };

    const key = state?.toLowerCase();
    return timezoneMap[key] || 'America/New_York';
  }

  /**
   * Check if CardPlayer is accessible
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/poker-tournaments`, {
        method: 'HEAD',
        headers: { 'User-Agent': this.userAgent }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const cardPlayerScraper = new CardPlayerScraper();