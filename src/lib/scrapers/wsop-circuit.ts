/**
 * WSOP Circuit Web Scraper
 * Since WSOP doesn't provide a public API, we scrape their website
 * for tournament schedules and information.
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { Tournament, Venue, Circuit, Address } from '@/types';

interface WSOpEvent {
  id: string;
  name: string;
  venue: string;
  location: string;
  buyIn: number;
  startDate: Date;
  endDate: Date;
  guaranteed?: number;
  status: 'upcoming' | 'running' | 'completed';
  eventNumber?: number;
  structure?: {
    startingStack?: number;
    levels?: number;
  };
}

export class WSOpCircuitScraper {
  private baseUrl = 'https://www.wsop.com';
  private browser?: Browser;
  private userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  /**
   * Initialize browser for scraping
   */
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
   * Scrape WSOP Circuit events from the main circuit page
   */
  async getCircuitEvents(): Promise<Tournament[]> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      await page.setUserAgent(this.userAgent);
      await page.setViewport({ width: 1920, height: 1080 });

      // Navigate to WSOP Circuit schedule
      await page.goto(`${this.baseUrl}/circuits`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for the schedule to load
      await page.waitForSelector('.circuit-schedule, .tournament-list, .event-list', { timeout: 10000 });

      const content = await page.content();
      return this.parseCircuitEvents(content);

    } catch (error) {
      console.error('Error scraping WSOP Circuit events:', error);
      return [];
    } finally {
      await page.close();
    }
  }

  /**
   * Scrape specific circuit stop details
   */
  async getCircuitStopDetails(stopUrl: string): Promise<Tournament[]> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      await page.setUserAgent(this.userAgent);
      await page.goto(stopUrl, { waitUntil: 'networkidle2' });

      await page.waitForSelector('.event-schedule, .tournament-schedule', { timeout: 10000 });

      const content = await page.content();
      return this.parseStopDetails(content);

    } catch (error) {
      console.error('Error scraping WSOP Circuit stop details:', error);
      return [];
    } finally {
      await page.close();
    }
  }

  /**
   * Parse circuit events from HTML content
   */
  private parseCircuitEvents(html: string): Tournament[] {
    const $ = cheerio.load(html);
    const tournaments: Tournament[] = [];

    // Look for circuit stop cards or event listings
    $('.circuit-stop, .event-card, .tournament-card').each((i, element) => {
      try {
        const $el = $(element);
        
        const name = $el.find('.event-name, .tournament-name, h3, h4').first().text().trim();
        const venue = $el.find('.venue-name, .location').first().text().trim();
        const location = $el.find('.city-state, .location-details').text().trim();
        
        // Extract dates
        const dateText = $el.find('.date, .event-dates').text().trim();
        const dates = this.parseDateRange(dateText);
        
        // Extract buy-in
        const buyInText = $el.find('.buy-in, .buyin, .price').text().trim();
        const buyIn = this.parseBuyIn(buyInText);
        
        // Extract guarantee
        const guaranteeText = $el.find('.guarantee, .guaranteed').text().trim();
        const guaranteed = this.parseGuarantee(guaranteeText);

        if (name && venue && dates.start && buyIn > 0) {
          const tournament: Tournament = {
            id: `wsop-${name.toLowerCase().replace(/\s+/g, '-')}-${dates.start.getTime()}`,
            name: name,
            circuit: this.getWSOpCircuit(),
            venue: this.createVenueFromScraping(venue, location),
            buyIn: buyIn,
            startDate: dates.start,
            endDate: dates.end || new Date(dates.start.getTime() + 3 * 24 * 60 * 60 * 1000), // Default 3 days
            estimatedField: this.estimateField(buyIn),
            structure: {
              type: 'reentry',
              startingStack: 25000,
              blindLevelDuration: 40,
              reentryLevels: 10
            },
            blindLevels: 40,
            prizeGuarantee: guaranteed,
            status: dates.start > new Date() ? 'upcoming' : 'completed',
            lateRegistrationLevels: 10
          };

          tournaments.push(tournament);
        }
      } catch (error) {
        console.error('Error parsing tournament element:', error);
      }
    });

    return tournaments;
  }

  /**
   * Parse specific stop details
   */
  private parseStopDetails(html: string): Tournament[] {
    const $ = cheerio.load(html);
    const tournaments: Tournament[] = [];

    // Parse individual events in the stop
    $('.event-item, .tournament-item, tr').each((i, element) => {
      try {
        const $el = $(element);
        
        const eventNumber = $el.find('.event-number, .event-id').text().trim();
        const name = $el.find('.event-name, .event-title').text().trim();
        const buyIn = this.parseBuyIn($el.find('.buy-in, .buyin').text());
        const dateTime = $el.find('.date-time, .start-time').text().trim();
        const guarantee = this.parseGuarantee($el.find('.guarantee').text());

        if (name && buyIn > 0) {
          const startDate = this.parseDateTime(dateTime);
          
          tournaments.push({
            id: `wsop-${eventNumber || i}-${name.toLowerCase().replace(/\s+/g, '-')}`,
            name: name,
            circuit: this.getWSOpCircuit(),
            venue: this.createDefaultWSOpVenue(), // We'd need to get venue from page context
            buyIn: buyIn,
            startDate: startDate || new Date(),
            endDate: new Date((startDate?.getTime() || Date.now()) + 2 * 24 * 60 * 60 * 1000),
            estimatedField: this.estimateField(buyIn),
            structure: {
              type: 'reentry',
              startingStack: 25000,
              blindLevelDuration: 40,
              reentryLevels: 10
            },
            blindLevels: 40,
            prizeGuarantee: guarantee,
            status: 'upcoming'
          });
        }
      } catch (error) {
        console.error('Error parsing event details:', error);
      }
    });

    return tournaments;
  }

  /**
   * Parse date ranges from various text formats
   */
  private parseDateRange(dateText: string): { start: Date; end?: Date } {
    if (!dateText) return { start: new Date() };

    // Handle various date formats
    const patterns = [
      // "March 15-18, 2024"
      /(\w+)\s+(\d+)-(\d+),?\s+(\d{4})/,
      // "Mar 15-18 2024"
      /(\w+)\s+(\d+)-(\d+)\s+(\d{4})/,
      // "March 15, 2024"
      /(\w+)\s+(\d+),?\s+(\d{4})/,
      // "3/15/2024 - 3/18/2024"
      /(\d+)\/(\d+)\/(\d{4})\s*-\s*(\d+)\/(\d+)\/(\d{4})/,
      // "3/15/2024"
      /(\d+)\/(\d+)\/(\d{4})/
    ];

    for (const pattern of patterns) {
      const match = dateText.match(pattern);
      if (match) {
        try {
          if (pattern.toString().includes('\\w+')) {
            // Month name format
            const month = this.parseMonthName(match[1]);
            const year = parseInt(match[4]);
            const startDay = parseInt(match[2]);
            const endDay = match[3] ? parseInt(match[3]) : startDay;
            
            return {
              start: new Date(year, month, startDay),
              end: new Date(year, month, endDay)
            };
          } else if (match.length >= 4) {
            // MM/DD/YYYY format
            const startMonth = parseInt(match[1]) - 1;
            const startDay = parseInt(match[2]);
            const startYear = parseInt(match[3]);
            
            if (match.length >= 7) {
              // Date range
              const endMonth = parseInt(match[4]) - 1;
              const endDay = parseInt(match[5]);
              const endYear = parseInt(match[6]);
              
              return {
                start: new Date(startYear, startMonth, startDay),
                end: new Date(endYear, endMonth, endDay)
              };
            }
            
            return {
              start: new Date(startYear, startMonth, startDay)
            };
          }
        } catch (error) {
          console.error('Error parsing date:', error);
        }
      }
    }

    return { start: new Date() };
  }

  private parseMonthName(monthName: string): number {
    const months = {
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
    return months[monthName.toLowerCase() as keyof typeof months] || 0;
  }

  private parseBuyIn(text: string): number {
    if (!text) return 0;
    
    const match = text.match(/\$?([\d,]+)/);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''));
    }
    return 0;
  }

  private parseGuarantee(text: string): number | undefined {
    if (!text) return undefined;
    
    const match = text.match(/\$?([\d,]+)([KM])?/);
    if (match) {
      let amount = parseInt(match[1].replace(/,/g, ''));
      if (match[2] === 'K') amount *= 1000;
      if (match[2] === 'M') amount *= 1000000;
      return amount;
    }
    return undefined;
  }

  private parseDateTime(text: string): Date | undefined {
    if (!text) return undefined;
    
    try {
      // Handle various time formats
      const date = new Date(text);
      return isNaN(date.getTime()) ? undefined : date;
    } catch {
      return undefined;
    }
  }

  private estimateField(buyIn: number): number {
    // Estimate field size based on buy-in
    if (buyIn >= 1000) return 400 + Math.floor(Math.random() * 200);
    if (buyIn >= 500) return 600 + Math.floor(Math.random() * 400);
    return 300 + Math.floor(Math.random() * 300);
  }

  private getWSOpCircuit(): Circuit {
    return {
      id: 'wsop-circuit',
      name: 'World Series of Poker Circuit',
      organizer: 'Caesars Entertainment',
      type: 'wsop',
      website: 'https://www.wsop.com',
      seasonStart: new Date(new Date().getFullYear(), 0, 1),
      seasonEnd: new Date(new Date().getFullYear(), 11, 31)
    };
  }

  private createVenueFromScraping(venueName: string, location: string): Venue {
    // Parse location (e.g., "Las Vegas, NV")
    const [city, state] = location.split(',').map(s => s.trim());
    
    return {
      id: `wsop-${venueName.toLowerCase().replace(/\s+/g, '-')}`,
      name: venueName,
      address: {
        street: '',
        city: city || '',
        state: state || '',
        country: 'USA',
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
      timezone: 'America/New_York'
    };
  }

  private createDefaultWSOpVenue(): Venue {
    return {
      id: 'wsop-unknown-venue',
      name: 'WSOP Circuit Venue',
      address: {
        street: '',
        city: '',
        state: '',
        country: 'USA',
        postalCode: ''
      },
      coordinates: { lat: 0, lng: 0 },
      amenities: [],
      parking: { available: true, cost: 'free' },
      nearbyHotels: [],
      localTips: [],
      timezone: 'America/New_York'
    };
  }

  /**
   * Clean up browser resources
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
    }
  }

  /**
   * Check if WSOP website is accessible
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const response = await axios.head(this.baseUrl, { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export const wsopScraper = new WSOpCircuitScraper();