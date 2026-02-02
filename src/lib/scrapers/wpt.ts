/**
 * World Poker Tour (WPT) Web Scraper
 * Scrapes WPT tournament schedules and information
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { Tournament, Venue, Circuit, Address } from '@/types';

interface WPTEvent {
  id: string;
  name: string;
  venue: string;
  location: string;
  buyIn: number;
  startDate: Date;
  endDate?: Date;
  guaranteed?: number;
  status: 'upcoming' | 'running' | 'completed';
  prizePool?: number;
  entrants?: number;
}

export class WPTScraper {
  private baseUrl = 'https://www.worldpokertour.com';
  private browser?: Browser;
  private userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080'
        ]
      });
    }
    return this.browser;
  }

  /**
   * Scrape WPT tournament schedule
   */
  async getWPTEvents(): Promise<Tournament[]> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      await page.setUserAgent(this.userAgent);
      await page.setViewport({ width: 1920, height: 1080 });

      // Navigate to WPT tournament schedule
      await page.goto(`${this.baseUrl}/tournaments`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for tournament listings to load
      await page.waitForSelector('.tournament-card, .event-card, .tour-event', { timeout: 10000 });

      const content = await page.content();
      return this.parseWPTEvents(content);

    } catch (error) {
      console.error('Error scraping WPT events:', error);
      
      // Fallback: try alternative schedule page
      try {
        await page.goto(`${this.baseUrl}/schedule`, { waitUntil: 'networkidle2' });
        const content = await page.content();
        return this.parseWPTEvents(content);
      } catch (fallbackError) {
        console.error('Fallback WPT scraping also failed:', fallbackError);
        return [];
      }
    } finally {
      await page.close();
    }
  }

  /**
   * Scrape specific WPT event details
   */
  async getEventDetails(eventUrl: string): Promise<Tournament | null> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      await page.setUserAgent(this.userAgent);
      await page.goto(eventUrl, { waitUntil: 'networkidle2' });

      await page.waitForSelector('.event-details, .tournament-info', { timeout: 10000 });

      const content = await page.content();
      return this.parseEventDetails(content);

    } catch (error) {
      console.error('Error scraping WPT event details:', error);
      return null;
    } finally {
      await page.close();
    }
  }

  /**
   * Parse WPT events from HTML content
   */
  private parseWPTEvents(html: string): Tournament[] {
    const $ = cheerio.load(html);
    const tournaments: Tournament[] = [];

    // Look for WPT event cards or listings
    $('.tournament-card, .event-card, .tour-event, .schedule-item').each((i, element) => {
      try {
        const $el = $(element);
        
        const name = $el.find('.event-name, .tournament-name, .title, h2, h3').first().text().trim();
        const venue = $el.find('.venue, .location-name, .casino').first().text().trim();
        const location = $el.find('.location, .city-state, .venue-location').text().trim();
        
        // Extract dates
        const dateText = $el.find('.dates, .event-dates, .start-date').text().trim();
        const dates = this.parseDateRange(dateText);
        
        // Extract buy-in
        const buyInText = $el.find('.buy-in, .buyin, .entry-fee, .price').text().trim();
        const buyIn = this.parseBuyIn(buyInText);
        
        // Extract guarantee
        const guaranteeText = $el.find('.guarantee, .guaranteed, .gtd').text().trim();
        const guaranteed = this.parseGuarantee(guaranteeText);

        // Extract prize pool if completed
        const prizeText = $el.find('.prize-pool, .total-prize').text().trim();
        const prizePool = this.parseGuarantee(prizeText);

        if (name && dates.start && buyIn > 0) {
          // Determine venue info
          const venueInfo = this.createWPTVenue(venue, location);
          
          const tournament: Tournament = {
            id: `wpt-${name.toLowerCase().replace(/\s+/g, '-')}-${dates.start.getTime()}`,
            name: this.cleanEventName(name),
            circuit: this.getWPTCircuit(),
            venue: venueInfo,
            buyIn: buyIn,
            startDate: dates.start,
            endDate: dates.end || new Date(dates.start.getTime() + 4 * 24 * 60 * 60 * 1000), // Default 4 days
            estimatedField: this.estimateWPTField(buyIn),
            structure: {
              type: 'reentry',
              startingStack: 40000,
              blindLevelDuration: 60, // WPT typically uses longer levels
              reentryLevels: 8
            },
            blindLevels: 60,
            prizeGuarantee: guaranteed || prizePool,
            status: this.determineStatus(dates.start, $el.text()),
            registrationDeadline: dates.start ? new Date(dates.start.getTime() + 7 * 60 * 60 * 1000) : undefined, // 7 hours after start
            lateRegistrationLevels: 8
          };

          tournaments.push(tournament);
        }
      } catch (error) {
        console.error('Error parsing WPT event:', error);
      }
    });

    // Remove duplicates and sort by date
    const uniqueTournaments = this.removeDuplicateTournaments(tournaments);
    return uniqueTournaments.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  private parseEventDetails(html: string): Tournament | null {
    const $ = cheerio.load(html);
    
    try {
      const name = $('.event-title, .tournament-title, h1').first().text().trim();
      const venue = $('.venue-name, .casino-name').first().text().trim();
      const location = $('.venue-location, .event-location').first().text().trim();
      
      const buyInText = $('.buy-in, .entry-fee').text().trim();
      const buyIn = this.parseBuyIn(buyInText);
      
      const dateText = $('.event-dates, .tournament-dates').text().trim();
      const dates = this.parseDateRange(dateText);
      
      const guaranteeText = $('.guarantee, .guaranteed-prize').text().trim();
      const guaranteed = this.parseGuarantee(guaranteeText);

      if (name && dates.start && buyIn > 0) {
        return {
          id: `wpt-${name.toLowerCase().replace(/\s+/g, '-')}-${dates.start.getTime()}`,
          name: this.cleanEventName(name),
          circuit: this.getWPTCircuit(),
          venue: this.createWPTVenue(venue, location),
          buyIn: buyIn,
          startDate: dates.start,
          endDate: dates.end || new Date(dates.start.getTime() + 4 * 24 * 60 * 60 * 1000),
          estimatedField: this.estimateWPTField(buyIn),
          structure: {
            type: 'reentry',
            startingStack: 40000,
            blindLevelDuration: 60,
            reentryLevels: 8
          },
          blindLevels: 60,
          prizeGuarantee: guaranteed,
          status: this.determineStatus(dates.start),
          lateRegistrationLevels: 8
        };
      }
    } catch (error) {
      console.error('Error parsing WPT event details:', error);
    }
    
    return null;
  }

  private parseDateRange(dateText: string): { start: Date; end?: Date } {
    if (!dateText) return { start: new Date() };

    const patterns = [
      // "March 15-18, 2024"
      /(\w+)\s+(\d+)-(\d+),?\s+(\d{4})/,
      // "Mar 15 - Mar 18, 2024"
      /(\w+)\s+(\d+)\s*-\s*(\w+)\s+(\d+),?\s+(\d{4})/,
      // "March 15, 2024 - March 18, 2024"
      /(\w+)\s+(\d+),?\s+(\d{4})\s*-\s*(\w+)\s+(\d+),?\s+(\d{4})/,
      // "March 15, 2024"
      /(\w+)\s+(\d+),?\s+(\d{4})/,
      // ISO format
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
            
            if (match[3] && !match[4]) {
              // Range within same month
              endDay = parseInt(match[3]);
            } else if (match[5] && match[6]) {
              // Cross-month range
              endMonth = this.parseMonthName(match[3]);
              endDay = parseInt(match[4]);
              endYear = parseInt(match[5] || match[6]);
            }
            
            return {
              start: new Date(year, month, startDay),
              end: new Date(endYear, endMonth, endDay)
            };
          } else {
            // ISO format
            const year = parseInt(match[1]);
            const month = parseInt(match[2]) - 1;
            const day = parseInt(match[3]);
            
            return {
              start: new Date(year, month, day)
            };
          }
        } catch (error) {
          console.error('Error parsing WPT date:', error);
        }
      }
    }

    // Fallback: try parsing as standard date
    try {
      const date = new Date(dateText);
      if (!isNaN(date.getTime())) {
        return { start: date };
      }
    } catch {
      // Ignore
    }

    return { start: new Date() };
  }

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

  private parseBuyIn(text: string): number {
    if (!text) return 0;
    
    // Handle formats like "$3,500", "$3.5K", "3500", etc.
    const match = text.match(/\$?([\d,]+(?:\.\d+)?)\s*([KM])?/i);
    if (match) {
      let amount = parseFloat(match[1].replace(/,/g, ''));
      if (match[2]) {
        const multiplier = match[2].toUpperCase();
        if (multiplier === 'K') amount *= 1000;
        if (multiplier === 'M') amount *= 1000000;
      }
      return Math.round(amount);
    }
    return 0;
  }

  private parseGuarantee(text: string): number | undefined {
    if (!text) return undefined;
    
    const match = text.match(/\$?([\d,]+(?:\.\d+)?)\s*([KM])?/i);
    if (match) {
      let amount = parseFloat(match[1].replace(/,/g, ''));
      if (match[2]) {
        const multiplier = match[2].toUpperCase();
        if (multiplier === 'K') amount *= 1000;
        if (multiplier === 'M') amount *= 1000000;
      }
      return Math.round(amount);
    }
    return undefined;
  }

  private cleanEventName(name: string): string {
    return name
      .replace(/^WPT\s*/i, 'WPT ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private estimateWPTField(buyIn: number): number {
    // WPT events typically have smaller but higher quality fields
    if (buyIn >= 10000) return 150 + Math.floor(Math.random() * 100);
    if (buyIn >= 5000) return 250 + Math.floor(Math.random() * 150);
    if (buyIn >= 3000) return 350 + Math.floor(Math.random() * 200);
    return 200 + Math.floor(Math.random() * 150);
  }

  private determineStatus(startDate: Date, contextText?: string): 'upcoming' | 'running' | 'completed' {
    const now = new Date();
    const daysDiff = (startDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
    
    if (contextText) {
      const lowerContext = contextText.toLowerCase();
      if (lowerContext.includes('completed') || lowerContext.includes('winner') || lowerContext.includes('champion')) {
        return 'completed';
      }
      if (lowerContext.includes('live') || lowerContext.includes('running') || lowerContext.includes('final table')) {
        return 'running';
      }
    }
    
    if (daysDiff < -7) return 'completed'; // More than a week ago
    if (daysDiff < 0 && daysDiff > -7) return 'running'; // Within the past week
    return 'upcoming';
  }

  private getWPTCircuit(): Circuit {
    return {
      id: 'wpt',
      name: 'World Poker Tour',
      organizer: 'WPT Enterprises',
      type: 'wpt',
      website: 'https://www.worldpokertour.com',
      seasonStart: new Date(new Date().getFullYear(), 0, 1),
      seasonEnd: new Date(new Date().getFullYear(), 11, 31)
    };
  }

  private createWPTVenue(venueName: string, location: string): Venue {
    if (!venueName) {
      venueName = 'WPT Venue';
    }
    
    let city = '';
    let state = '';
    
    if (location) {
      const parts = location.split(',').map(s => s.trim());
      city = parts[0] || '';
      state = parts[1] || '';
    }
    
    return {
      id: `wpt-${venueName.toLowerCase().replace(/\s+/g, '-')}`,
      name: venueName,
      address: {
        street: '',
        city,
        state,
        country: this.determineCountry(location),
        postalCode: ''
      },
      coordinates: { lat: 0, lng: 0 },
      amenities: [
        { name: 'Free WiFi', available: true },
        { name: 'Restaurant', available: true },
        { name: 'ATM', available: true },
        { name: 'VIP Services', available: true }
      ],
      parking: {
        available: true,
        cost: 'paid'
      },
      nearbyHotels: [],
      localTips: [],
      timezone: this.getTimezoneForLocation(state)
    };
  }

  private determineCountry(location: string): string {
    if (!location) return 'USA';
    
    const lowerLocation = location.toLowerCase();
    if (lowerLocation.includes('canada') || lowerLocation.includes('toronto') || lowerLocation.includes('montreal')) {
      return 'Canada';
    }
    if (lowerLocation.includes('uk') || lowerLocation.includes('london') || lowerLocation.includes('england')) {
      return 'United Kingdom';
    }
    if (lowerLocation.includes('australia') || lowerLocation.includes('sydney') || lowerLocation.includes('melbourne')) {
      return 'Australia';
    }
    
    return 'USA'; // Default assumption for WPT
  }

  private getTimezoneForLocation(state: string): string {
    const timezoneMap: Record<string, string> = {
      'CA': 'America/Los_Angeles', 'california': 'America/Los_Angeles',
      'NV': 'America/Los_Angeles', 'nevada': 'America/Los_Angeles',
      'TX': 'America/Chicago', 'texas': 'America/Chicago',
      'FL': 'America/New_York', 'florida': 'America/New_York',
      'NY': 'America/New_York', 'new york': 'America/New_York',
      'NJ': 'America/New_York', 'new jersey': 'America/New_York'
    };

    const key = state?.toLowerCase();
    return timezoneMap[key] || 'America/New_York';
  }

  private removeDuplicateTournaments(tournaments: Tournament[]): Tournament[] {
    const seen = new Set<string>();
    return tournaments.filter(tournament => {
      const key = `${tournament.name}-${tournament.startDate.getTime()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
    }
  }

  async checkAvailability(): Promise<boolean> {
    try {
      const response = await axios.head(this.baseUrl, { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export const wptScraper = new WPTScraper();