import { Tournament, Circuit, Venue } from '@/types'

// MIGRATION NOTICE: This file now provides backward compatibility
// The application uses live data from multiple sources:
// - PokerAtlas API
// - WSOP Circuit scraper  
// - WPT scraper
// 
// For live data, use: import { getTournaments } from '@/data/tournaments-live'

// Major poker circuits - now enhanced with live data
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
]

// Major venues
export const venues: Venue[] = [
  {
    id: 'orleans-las-vegas',
    name: 'Orleans Hotel & Casino',
    address: {
      street: '4500 W Tropicana Ave',
      city: 'Las Vegas',
      state: 'Nevada',
      country: 'USA',
      postalCode: '89103'
    },
    coordinates: { lat: 36.1002, lng: -115.2056 },
    amenities: [
      { name: 'Free WiFi', available: true },
      { name: 'Restaurant', available: true },
      { name: 'ATM', available: true },
      { name: 'Massage Services', available: true, cost: 80 }
    ],
    parking: {
      available: true,
      cost: 'free',
      spaces: 2000,
      notes: 'Self-parking available. Valet also free.'
    },
    nearbyHotels: [
      {
        id: 'orleans-hotel',
        name: 'Orleans Hotel & Casino',
        address: {
          street: '4500 W Tropicana Ave',
          city: 'Las Vegas', 
          state: 'Nevada',
          country: 'USA',
          postalCode: '89103'
        },
        distanceFromVenue: 0,
        priceRange: '$$',
        rating: 3.8,
        amenities: ['Pool', 'Casino', 'Multiple Restaurants', 'Bowling'],
        avgNightlyRate: 89,
        groupRateAvailable: true
      },
      {
        id: 'gold-coast',
        name: 'Gold Coast Hotel & Casino',
        address: {
          street: '4000 W Flamingo Rd',
          city: 'Las Vegas',
          state: 'Nevada', 
          country: 'USA',
          postalCode: '89103'
        },
        distanceFromVenue: 1.2,
        priceRange: '$$',
        rating: 3.6,
        amenities: ['Pool', 'Casino', 'Multiple Restaurants'],
        avgNightlyRate: 79,
        groupRateAvailable: false
      }
    ],
    localTips: [
      {
        category: 'restaurant',
        title: 'Prime Rib Loft',
        description: 'Excellent buffet inside Orleans. Good value for players.',
        cost: '$$',
        rating: 4.2
      },
      {
        category: 'transportation',
        title: 'Uber/Lyft to Strip',
        description: 'About $15-20 to main Strip hotels. Free shuttle to Gold Coast.',
        cost: '$',
        rating: 4.0
      }
    ],
    timezone: 'America/Los_Angeles'
  },
  {
    id: 'bay101-san-jose',
    name: 'Bay 101 Casino',
    address: {
      street: '1801 Bering Dr',
      city: 'San Jose',
      state: 'California',
      country: 'USA',
      postalCode: '95112'
    },
    coordinates: { lat: 37.3688, lng: -121.9195 },
    amenities: [
      { name: 'Free WiFi', available: true },
      { name: 'Restaurant', available: true },
      { name: 'ATM', available: true },
      { name: 'Valet Parking', available: true, cost: 10 }
    ],
    parking: {
      available: true,
      cost: 'paid',
      spaces: 800,
      notes: '$5 self-park, $10 valet. Validated with play.'
    },
    nearbyHotels: [
      {
        id: 'doubletree-san-jose',
        name: 'DoubleTree by Hilton San Jose',
        address: {
          street: '2050 Gateway Pl',
          city: 'San Jose',
          state: 'California',
          country: 'USA', 
          postalCode: '95110'
        },
        distanceFromVenue: 2.1,
        priceRange: '$$$',
        rating: 4.1,
        amenities: ['Pool', 'Fitness Center', 'Business Center'],
        avgNightlyRate: 149,
        groupRateAvailable: true
      }
    ],
    localTips: [
      {
        category: 'restaurant',
        title: 'Smoking Section Cafe',
        description: 'On-site dining. Limited options nearby.',
        cost: '$',
        rating: 3.5
      },
      {
        category: 'safety',
        title: 'Area Safety',
        description: 'Industrial area. Stay aware of surroundings at night.',
        cost: 'free',
        rating: 3.0
      }
    ],
    timezone: 'America/Los_Angeles'
  },
  {
    id: 'horseshoe-hammond',
    name: 'Horseshoe Hammond',
    address: {
      street: '777 Casino Center Dr',
      city: 'Hammond',
      state: 'Indiana',
      country: 'USA',
      postalCode: '46320'
    },
    coordinates: { lat: 41.6171, lng: -87.4574 },
    amenities: [
      { name: 'Free WiFi', available: true },
      { name: 'Multiple Restaurants', available: true },
      { name: 'ATM', available: true },
      { name: 'Hotel', available: true }
    ],
    parking: {
      available: true,
      cost: 'paid',
      spaces: 1200,
      notes: '$10 self-park, $15 valet. Some validation available.'
    },
    nearbyHotels: [
      {
        id: 'horseshoe-hotel',
        name: 'Horseshoe Hammond Hotel',
        address: {
          street: '777 Casino Center Dr',
          city: 'Hammond',
          state: 'Indiana',
          country: 'USA',
          postalCode: '46320'
        },
        distanceFromVenue: 0,
        priceRange: '$$',
        rating: 3.9,
        amenities: ['Casino', 'Multiple Restaurants', 'Spa', 'Pool'],
        avgNightlyRate: 119,
        groupRateAvailable: true
      }
    ],
    localTips: [
      {
        category: 'transportation',
        title: 'Chicago Access',
        description: '20 minutes from downtown Chicago. Traffic can be heavy.',
        cost: '$',
        rating: 3.8
      }
    ],
    timezone: 'America/Chicago'
  }
]

// Tournament data
export const tournaments: Tournament[] = [
  // WSOP Circuit Events
  {
    id: 'wsop-orleans-main',
    name: 'WSOP Circuit Orleans Main Event',
    circuit: circuits[0],
    venue: venues[0],
    buyIn: 1700,
    startDate: new Date('2024-02-15T12:00:00'),
    endDate: new Date('2024-02-18T22:00:00'),
    estimatedField: 850,
    structure: {
      type: 'reentry',
      startingStack: 25000,
      blindLevelDuration: 40,
      reentryLevels: 10
    },
    blindLevels: 40,
    prizeGuarantee: 500000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-02-16T15:00:00'),
    lateRegistrationLevels: 10
  },
  {
    id: 'wsop-orleans-opening',
    name: 'WSOP Circuit Orleans Opening Event',
    circuit: circuits[0],
    venue: venues[0],
    buyIn: 400,
    startDate: new Date('2024-02-10T11:00:00'),
    endDate: new Date('2024-02-11T20:00:00'),
    estimatedField: 450,
    structure: {
      type: 'reentry',
      startingStack: 15000,
      blindLevelDuration: 30,
      reentryLevels: 8
    },
    blindLevels: 30,
    prizeGuarantee: 100000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-02-10T17:00:00'),
    lateRegistrationLevels: 8
  },
  
  // WPT Events
  {
    id: 'wpt-bay101-main',
    name: 'WPT Bay 101 Shooting Star',
    circuit: circuits[1],
    venue: venues[1],
    buyIn: 3500,
    startDate: new Date('2024-02-22T12:00:00'),
    endDate: new Date('2024-02-26T22:00:00'),
    estimatedField: 320,
    structure: {
      type: 'freezeout',
      startingStack: 40000,
      blindLevelDuration: 60,
    },
    blindLevels: 60,
    prizeGuarantee: 1000000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-02-22T19:00:00'),
    lateRegistrationLevels: 6
  },
  
  // MSPT Events
  {
    id: 'mspt-hammond-main',
    name: 'MSPT Hammond Main Event',
    circuit: circuits[3],
    venue: venues[2],
    buyIn: 1100,
    startDate: new Date('2024-03-01T12:00:00'),
    endDate: new Date('2024-03-03T22:00:00'),
    estimatedField: 450,
    structure: {
      type: 'reentry',
      startingStack: 25000,
      blindLevelDuration: 40,
      reentryLevels: 12
    },
    blindLevels: 40,
    prizeGuarantee: 300000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-03-02T15:00:00'),
    lateRegistrationLevels: 12
  },
  
  // Additional upcoming tournaments
  {
    id: 'wsop-vegas-spring',
    name: 'WSOP Las Vegas Spring Series',
    circuit: circuits[0],
    venue: venues[0],
    buyIn: 565,
    startDate: new Date('2024-03-15T11:00:00'),
    endDate: new Date('2024-03-16T20:00:00'),
    estimatedField: 680,
    structure: {
      type: 'reentry',
      startingStack: 20000,
      blindLevelDuration: 30,
      reentryLevels: 10
    },
    blindLevels: 30,
    prizeGuarantee: 200000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-03-15T17:00:00'),
    lateRegistrationLevels: 10
  },
  {
    id: 'wpt-bestbet-main',
    name: 'WPT bestbet Scramble',
    circuit: circuits[1],
    venue: {
      ...venues[0],
      id: 'bestbet-jacksonville',
      name: 'bestbet Jacksonville',
      address: {
        street: '13250 Racetrack Rd',
        city: 'Jacksonville',
        state: 'Florida',
        country: 'USA',
        postalCode: '32218'
      },
      coordinates: { lat: 30.4518, lng: -81.6556 }
    },
    buyIn: 3500,
    startDate: new Date('2024-03-28T12:00:00'),
    endDate: new Date('2024-04-01T22:00:00'),
    estimatedField: 420,
    structure: {
      type: 'reentry',
      startingStack: 40000,
      blindLevelDuration: 60,
      reentryLevels: 8
    },
    blindLevels: 60,
    prizeGuarantee: 1500000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-03-29T19:00:00'),
    lateRegistrationLevels: 8
  },
  {
    id: 'mspt-potawatomi-main',
    name: 'MSPT Potawatomi Main Event',
    circuit: circuits[3],
    venue: {
      ...venues[2],
      id: 'potawatomi-milwaukee',
      name: 'Potawatomi Casino Milwaukee',
      address: {
        street: '1721 W Canal St',
        city: 'Milwaukee',
        state: 'Wisconsin',
        country: 'USA',
        postalCode: '53233'
      },
      coordinates: { lat: 43.0268, lng: -87.9273 }
    },
    buyIn: 1100,
    startDate: new Date('2024-04-12T12:00:00'),
    endDate: new Date('2024-04-14T22:00:00'),
    estimatedField: 380,
    structure: {
      type: 'reentry',
      startingStack: 25000,
      blindLevelDuration: 40,
      reentryLevels: 12
    },
    blindLevels: 40,
    prizeGuarantee: 250000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-04-13T15:00:00'),
    lateRegistrationLevels: 12
  },
  {
    id: 'wsop-cherokee-main', 
    name: 'WSOP Circuit Cherokee Main Event',
    circuit: circuits[0],
    venue: {
      ...venues[0],
      id: 'cherokee-nc',
      name: 'Harrah\'s Cherokee Casino Resort',
      address: {
        street: '777 Casino Dr',
        city: 'Cherokee',
        state: 'North Carolina',
        country: 'USA',
        postalCode: '28719'
      },
      coordinates: { lat: 35.4758, lng: -83.3099 }
    },
    buyIn: 1700,
    startDate: new Date('2024-04-25T12:00:00'),
    endDate: new Date('2024-04-28T22:00:00'),
    estimatedField: 550,
    structure: {
      type: 'reentry',
      startingStack: 25000,
      blindLevelDuration: 40,
      reentryLevels: 10
    },
    blindLevels: 40,
    prizeGuarantee: 400000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-04-26T15:00:00'),
    lateRegistrationLevels: 10
  }
]

// LIVE DATA INTEGRATION: These functions will use real tournament data in production
// import { tournamentDataService } from '@/services/tournament-data-service'

// Static tournament data (mock) - for fallback only
export const mockTournaments: Tournament[] = [
  // Keeping a few sample tournaments for development/testing
  {
    id: 'mock-wsop-main',
    name: 'Sample WSOP Circuit Event',
    circuit: circuits[0],
    venue: venues[0],
    buyIn: 1700,
    startDate: new Date('2024-03-15T12:00:00'),
    endDate: new Date('2024-03-18T22:00:00'),
    estimatedField: 400,
    structure: {
      type: 'reentry',
      startingStack: 25000,
      blindLevelDuration: 40,
      reentryLevels: 10
    },
    blindLevels: 40,
    prizeGuarantee: 300000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-03-16T15:00:00'),
    lateRegistrationLevels: 10
  }
]

// Live data functions - these connect to real sources (placeholder implementations)
export async function getTournamentsByCircuit(circuitId: string): Promise<Tournament[]> {
  // TODO: Implement live data integration
  return mockTournaments.filter(t => t.circuit.id === circuitId)
}

export async function getUpcomingTournaments(limit?: number): Promise<Tournament[]> {
  // TODO: Implement live data integration
  const upcoming = mockTournaments
    .filter(t => t.status === 'upcoming' && t.startDate > new Date())
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
  
  return limit ? upcoming.slice(0, limit) : upcoming
}

export async function getTournamentsByDateRange(startDate: Date, endDate: Date): Promise<Tournament[]> {
  // TODO: Implement live data integration
  return mockTournaments.filter(t => 
    t.startDate >= startDate && t.startDate <= endDate
  )
}

export async function searchTournaments(query: string): Promise<Tournament[]> {
  // TODO: Implement live data integration
  const lowerQuery = query.toLowerCase()
  return mockTournaments.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.venue.name.toLowerCase().includes(lowerQuery) ||
    t.venue.address.city.toLowerCase().includes(lowerQuery) ||
    t.circuit.name.toLowerCase().includes(lowerQuery)
  )
}

// New live data functions
export async function getTournaments(filters?: {
  startDate?: Date;
  endDate?: Date;
  minBuyIn?: number;
  maxBuyIn?: number;
  circuits?: string[];
  states?: string[];
  maxResults?: number;
}): Promise<Tournament[]> {
  // TODO: Implement live data integration with filters
  return mockTournaments
}

// Data source health check
export function getDataSourceHealth() {
  return {
    status: 'mock',
    lastUpdate: new Date(),
    sources: ['mock-data']
  }
}

// Force refresh data
export async function refreshTournamentData(): Promise<void> {
  // TODO: Implement live data refresh
  console.log('Tournament data refresh - placeholder implementation')
}

// Backward compatibility: Export static tournaments for immediate use
// Note: In production, components should use the async functions above
// export const tournaments = mockTournaments // Commented out to avoid duplicate export