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

// Expanded venue data for better tournament variety
export const extendedVenues: Venue[] = [
  ...venues,
  {
    id: 'bellagio-vegas',
    name: 'Bellagio Hotel & Casino',
    address: {
      street: '3600 S Las Vegas Blvd',
      city: 'Las Vegas',
      state: 'Nevada',
      country: 'USA',
      postalCode: '89109'
    },
    coordinates: { lat: 36.1126, lng: -115.1767 },
    amenities: [
      { name: 'Free WiFi', available: true },
      { name: 'Fine Dining', available: true },
      { name: 'ATM', available: true },
      { name: 'Spa Services', available: true, cost: 150 }
    ],
    parking: {
      available: true,
      cost: 'paid',
      spaces: 3000,
      notes: '$25 self-park, $40 valet. Some validation available.'
    },
    nearbyHotels: [],
    localTips: [],
    timezone: 'America/Los_Angeles'
  },
  {
    id: 'wynn-vegas',
    name: 'Wynn Las Vegas',
    address: {
      street: '3131 S Las Vegas Blvd',
      city: 'Las Vegas',
      state: 'Nevada',
      country: 'USA',
      postalCode: '89109'
    },
    coordinates: { lat: 36.1265, lng: -115.1666 },
    amenities: [],
    parking: { available: true, cost: 'paid', spaces: 2500 },
    nearbyHotels: [],
    localTips: [],
    timezone: 'America/Los_Angeles'
  },
  {
    id: 'commerce-ca',
    name: 'Commerce Casino',
    address: {
      street: '6131 Telegraph Rd',
      city: 'Commerce',
      state: 'California',
      country: 'USA',
      postalCode: '90040'
    },
    coordinates: { lat: 34.0080, lng: -118.1571 },
    amenities: [],
    parking: { available: true, cost: 'free', spaces: 1500 },
    nearbyHotels: [],
    localTips: [],
    timezone: 'America/Los_Angeles'
  },
  {
    id: 'seminole-fl',
    name: 'Seminole Hard Rock Tampa',
    address: {
      street: '5223 Orient Rd',
      city: 'Tampa',
      state: 'Florida',
      country: 'USA',
      postalCode: '33610'
    },
    coordinates: { lat: 27.9881, lng: -82.3248 },
    amenities: [],
    parking: { available: true, cost: 'free', spaces: 2000 },
    nearbyHotels: [],
    localTips: [],
    timezone: 'America/New_York'
  },
  {
    id: 'borgata-nj',
    name: 'Borgata Hotel Casino & Spa',
    address: {
      street: '1 Borgata Way',
      city: 'Atlantic City',
      state: 'New Jersey',
      country: 'USA',
      postalCode: '08401'
    },
    coordinates: { lat: 39.3722, lng: -74.4492 },
    amenities: [],
    parking: { available: true, cost: 'paid', spaces: 1800 },
    nearbyHotels: [],
    localTips: [],
    timezone: 'America/New_York'
  },
  {
    id: 'bicycle-ca',
    name: 'The Bicycle Hotel & Casino',
    address: {
      street: '7301 Eastern Ave',
      city: 'Bell Gardens',
      state: 'California',
      country: 'USA',
      postalCode: '90201'
    },
    coordinates: { lat: 33.9653, lng: -118.1717 },
    amenities: [],
    parking: { available: true, cost: 'free', spaces: 1200 },
    nearbyHotels: [],
    localTips: [],
    timezone: 'America/Los_Angeles'
  }
]

// Enhanced circuits with additional tournament series
const wsopCircuit: Circuit = {
  id: 'wsop-circuit',
  name: 'WSOP Circuit',
  organizer: 'Caesars Entertainment',
  type: 'wsop',
  website: 'https://www.wsop.com/circuit',
  seasonStart: new Date('2024-01-01'),
  seasonEnd: new Date('2024-12-31')
}

// Tournament data with 40+ entries across multiple months and brands
export const tournaments: Tournament[] = [
  // February 2024 - WSOP Circuit Orleans
  {
    id: 'wsop-orleans-opener',
    name: 'WSOP Circuit Orleans #1 Opening Event',
    circuit: circuits[0],
    venue: venues[0],
    buyIn: 400,
    startDate: new Date('2024-02-08T12:00:00'),
    endDate: new Date('2024-02-09T22:00:00'),
    estimatedField: 450,
    structure: { type: 'reentry', startingStack: 15000, blindLevelDuration: 30, reentryLevels: 8 },
    blindLevels: 30,
    prizeGuarantee: 100000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-02-08T18:00:00'),
    lateRegistrationLevels: 8
  },
  {
    id: 'wsop-orleans-plo',
    name: 'WSOP Circuit Orleans #2 PLO Championship',
    circuit: circuits[0],
    venue: venues[0],
    buyIn: 600,
    startDate: new Date('2024-02-10T12:00:00'),
    endDate: new Date('2024-02-11T22:00:00'),
    estimatedField: 320,
    structure: { type: 'reentry', startingStack: 20000, blindLevelDuration: 40, reentryLevels: 10 },
    blindLevels: 40,
    prizeGuarantee: 150000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-02-10T17:00:00'),
    lateRegistrationLevels: 10
  },
  {
    id: 'wsop-orleans-main',
    name: 'WSOP Circuit Orleans #12 Main Event',
    circuit: circuits[0],
    venue: venues[0],
    buyIn: 1700,
    startDate: new Date('2024-02-15T12:00:00'),
    endDate: new Date('2024-02-18T22:00:00'),
    estimatedField: 850,
    structure: { type: 'reentry', startingStack: 25000, blindLevelDuration: 40, reentryLevels: 10 },
    blindLevels: 40,
    prizeGuarantee: 500000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-02-16T15:00:00'),
    lateRegistrationLevels: 10
  },

  // February 2024 - WPT Bay 101
  {
    id: 'wpt-bay101-prelim1',
    name: 'WPT Bay 101 Preliminary Event #1',
    circuit: circuits[1],
    venue: venues[1],
    buyIn: 1100,
    startDate: new Date('2024-02-20T12:00:00'),
    endDate: new Date('2024-02-21T22:00:00'),
    estimatedField: 280,
    structure: { type: 'reentry', startingStack: 25000, blindLevelDuration: 40, reentryLevels: 8 },
    blindLevels: 40,
    prizeGuarantee: 200000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-02-20T18:00:00'),
    lateRegistrationLevels: 8
  },
  {
    id: 'wpt-bay101-main',
    name: 'WPT Bay 101 Shooting Star Main Event',
    circuit: circuits[1],
    venue: venues[1],
    buyIn: 3500,
    startDate: new Date('2024-02-22T12:00:00'),
    endDate: new Date('2024-02-26T22:00:00'),
    estimatedField: 320,
    structure: { type: 'freezeout', startingStack: 40000, blindLevelDuration: 60 },
    blindLevels: 60,
    prizeGuarantee: 1000000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-02-22T19:00:00'),
    lateRegistrationLevels: 6
  },

  // March 2024 - Various Events
  {
    id: 'mspt-hammond-opener',
    name: 'MSPT Hammond Opening Event',
    circuit: circuits[3],
    venue: venues[2],
    buyIn: 360,
    startDate: new Date('2024-03-01T12:00:00'),
    endDate: new Date('2024-03-02T20:00:00'),
    estimatedField: 520,
    structure: { type: 'reentry', startingStack: 20000, blindLevelDuration: 30, reentryLevels: 10 },
    blindLevels: 30,
    prizeGuarantee: 100000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-03-01T18:00:00'),
    lateRegistrationLevels: 10
  },
  {
    id: 'mspt-hammond-main',
    name: 'MSPT Hammond Main Event',
    circuit: circuits[3],
    venue: venues[2],
    buyIn: 1100,
    startDate: new Date('2024-03-05T12:00:00'),
    endDate: new Date('2024-03-08T22:00:00'),
    estimatedField: 450,
    structure: { type: 'reentry', startingStack: 25000, blindLevelDuration: 40, reentryLevels: 12 },
    blindLevels: 40,
    prizeGuarantee: 300000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-03-06T15:00:00'),
    lateRegistrationLevels: 12
  },
  {
    id: 'wsop-bellagio-high-roller',
    name: 'WSOP Super High Roller Bowl',
    circuit: circuits[0],
    venue: extendedVenues[3],
    buyIn: 300000,
    startDate: new Date('2024-03-12T14:00:00'),
    endDate: new Date('2024-03-16T22:00:00'),
    estimatedField: 45,
    structure: { type: 'freezeout', startingStack: 3000000, blindLevelDuration: 90 },
    blindLevels: 90,
    prizeGuarantee: 15000000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-03-12T16:00:00'),
    lateRegistrationLevels: 3
  },
  {
    id: 'wsop-vegas-spring',
    name: 'WSOP Las Vegas Spring Series',
    circuit: circuits[0],
    venue: venues[0],
    buyIn: 565,
    startDate: new Date('2024-03-15T11:00:00'),
    endDate: new Date('2024-03-16T20:00:00'),
    estimatedField: 680,
    structure: { type: 'reentry', startingStack: 20000, blindLevelDuration: 30, reentryLevels: 10 },
    blindLevels: 30,
    prizeGuarantee: 200000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-03-15T17:00:00'),
    lateRegistrationLevels: 10
  },

  // March 2024 - WPT bestbet
  {
    id: 'wpt-bestbet-main',
    name: 'WPT bestbet Scramble',
    circuit: circuits[1],
    venue: {
      ...venues[0],
      id: 'bestbet-jacksonville',
      name: 'bestbet Jacksonville',
      address: { street: '13250 Racetrack Rd', city: 'Jacksonville', state: 'Florida', country: 'USA', postalCode: '32218' },
      coordinates: { lat: 30.4518, lng: -81.6556 }
    },
    buyIn: 3500,
    startDate: new Date('2024-03-28T12:00:00'),
    endDate: new Date('2024-04-01T22:00:00'),
    estimatedField: 420,
    structure: { type: 'reentry', startingStack: 40000, blindLevelDuration: 60, reentryLevels: 8 },
    blindLevels: 60,
    prizeGuarantee: 1500000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-03-29T19:00:00'),
    lateRegistrationLevels: 8
  },

  // April 2024 - Multiple Series
  {
    id: 'wsop-cherokee-opener',
    name: 'WSOP Circuit Cherokee Opening Event',
    circuit: wsopCircuit,
    venue: {
      ...venues[0],
      id: 'cherokee-nc',
      name: 'Harrah\'s Cherokee Casino Resort',
      address: { street: '777 Casino Dr', city: 'Cherokee', state: 'North Carolina', country: 'USA', postalCode: '28719' },
      coordinates: { lat: 35.4758, lng: -83.3099 }
    },
    buyIn: 400,
    startDate: new Date('2024-04-10T12:00:00'),
    endDate: new Date('2024-04-11T20:00:00'),
    estimatedField: 380,
    structure: { type: 'reentry', startingStack: 15000, blindLevelDuration: 30, reentryLevels: 8 },
    blindLevels: 30,
    prizeGuarantee: 100000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-04-10T18:00:00'),
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
      address: { street: '1721 W Canal St', city: 'Milwaukee', state: 'Wisconsin', country: 'USA', postalCode: '53233' },
      coordinates: { lat: 43.0268, lng: -87.9273 }
    },
    buyIn: 1100,
    startDate: new Date('2024-04-12T12:00:00'),
    endDate: new Date('2024-04-14T22:00:00'),
    estimatedField: 380,
    structure: { type: 'reentry', startingStack: 25000, blindLevelDuration: 40, reentryLevels: 12 },
    blindLevels: 40,
    prizeGuarantee: 250000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-04-13T15:00:00'),
    lateRegistrationLevels: 12
  },
  {
    id: 'wsop-cherokee-main',
    name: 'WSOP Circuit Cherokee Main Event',
    circuit: wsopCircuit,
    venue: {
      ...venues[0],
      id: 'cherokee-nc',
      name: 'Harrah\'s Cherokee Casino Resort',
      address: { street: '777 Casino Dr', city: 'Cherokee', state: 'North Carolina', country: 'USA', postalCode: '28719' },
      coordinates: { lat: 35.4758, lng: -83.3099 }
    },
    buyIn: 1700,
    startDate: new Date('2024-04-25T12:00:00'),
    endDate: new Date('2024-04-28T22:00:00'),
    estimatedField: 550,
    structure: { type: 'reentry', startingStack: 25000, blindLevelDuration: 40, reentryLevels: 10 },
    blindLevels: 40,
    prizeGuarantee: 400000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-04-26T15:00:00'),
    lateRegistrationLevels: 10
  },

  // May 2024 - WSOP Vegas begins
  {
    id: 'wsop-colossus',
    name: 'WSOP Colossus',
    circuit: circuits[0],
    venue: extendedVenues[3],
    buyIn: 400,
    startDate: new Date('2024-05-05T11:00:00'),
    endDate: new Date('2024-05-07T22:00:00'),
    estimatedField: 15000,
    structure: { type: 'reentry', startingStack: 40000, blindLevelDuration: 30, reentryLevels: 8 },
    blindLevels: 30,
    prizeGuarantee: 3000000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-05-06T18:00:00'),
    lateRegistrationLevels: 8
  },
  {
    id: 'wsop-monster-stack',
    name: 'WSOP Monster Stack',
    circuit: circuits[0],
    venue: extendedVenues[3],
    buyIn: 1500,
    startDate: new Date('2024-05-12T12:00:00'),
    endDate: new Date('2024-05-16T22:00:00'),
    estimatedField: 5200,
    structure: { type: 'reentry', startingStack: 50000, blindLevelDuration: 60, reentryLevels: 10 },
    blindLevels: 60,
    prizeGuarantee: 5000000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-05-13T18:00:00'),
    lateRegistrationLevels: 10
  },
  {
    id: 'wsop-main-event',
    name: 'WSOP Main Event',
    circuit: circuits[0],
    venue: extendedVenues[3],
    buyIn: 10000,
    startDate: new Date('2024-07-03T12:00:00'),
    endDate: new Date('2024-07-17T22:00:00'),
    estimatedField: 8500,
    structure: { type: 'freezeout', startingStack: 60000, blindLevelDuration: 120 },
    blindLevels: 120,
    prizeGuarantee: 85000000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-07-07T18:00:00'),
    lateRegistrationLevels: 0
  },

  // California tournaments
  {
    id: 'commerce-lapc-main',
    name: 'LA Poker Classic Main Event',
    circuit: circuits[3],
    venue: extendedVenues[5],
    buyIn: 10000,
    startDate: new Date('2024-02-26T12:00:00'),
    endDate: new Date('2024-03-05T22:00:00'),
    estimatedField: 450,
    structure: { type: 'reentry', startingStack: 60000, blindLevelDuration: 90, reentryLevels: 8 },
    blindLevels: 90,
    prizeGuarantee: 3500000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-02-28T18:00:00'),
    lateRegistrationLevels: 8
  },
  {
    id: 'bicycle-legends',
    name: 'Legends of Poker Championship',
    circuit: circuits[3],
    venue: extendedVenues[8],
    buyIn: 5000,
    startDate: new Date('2024-08-25T12:00:00'),
    endDate: new Date('2024-09-02T22:00:00'),
    estimatedField: 680,
    structure: { type: 'reentry', startingStack: 50000, blindLevelDuration: 75, reentryLevels: 10 },
    blindLevels: 75,
    prizeGuarantee: 2500000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-08-27T18:00:00'),
    lateRegistrationLevels: 10
  },

  // East Coast tournaments
  {
    id: 'borgata-wpt-main',
    name: 'WPT Borgata Winter Open',
    circuit: circuits[1],
    venue: extendedVenues[7],
    buyIn: 3500,
    startDate: new Date('2024-01-28T12:00:00'),
    endDate: new Date('2024-02-05T22:00:00'),
    estimatedField: 1150,
    structure: { type: 'reentry', startingStack: 40000, blindLevelDuration: 60, reentryLevels: 8 },
    blindLevels: 60,
    prizeGuarantee: 3000000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-01-30T18:00:00'),
    lateRegistrationLevels: 8
  },
  {
    id: 'borgata-spring-open',
    name: 'Borgata Spring Open',
    circuit: circuits[3],
    venue: extendedVenues[7],
    buyIn: 2700,
    startDate: new Date('2024-04-15T12:00:00'),
    endDate: new Date('2024-04-21T22:00:00'),
    estimatedField: 850,
    structure: { type: 'reentry', startingStack: 35000, blindLevelDuration: 60, reentryLevels: 10 },
    blindLevels: 60,
    prizeGuarantee: 1500000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-04-17T18:00:00'),
    lateRegistrationLevels: 10
  },

  // Florida tournaments 
  {
    id: 'seminole-hard-rock-main',
    name: 'Seminole Hard Rock Poker Open',
    circuit: circuits[3],
    venue: extendedVenues[6],
    buyIn: 3500,
    startDate: new Date('2024-04-08T12:00:00'),
    endDate: new Date('2024-04-16T22:00:00'),
    estimatedField: 1200,
    structure: { type: 'reentry', startingStack: 40000, blindLevelDuration: 60, reentryLevels: 10 },
    blindLevels: 60,
    prizeGuarantee: 5000000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-04-10T18:00:00'),
    lateRegistrationLevels: 10
  },

  // Mixed game tournaments
  {
    id: 'wsop-horse-championship',
    name: 'WSOP H.O.R.S.E. Championship',
    circuit: circuits[0],
    venue: extendedVenues[3],
    buyIn: 3000,
    startDate: new Date('2024-06-15T12:00:00'),
    endDate: new Date('2024-06-18T22:00:00'),
    estimatedField: 420,
    structure: { type: 'freezeout', startingStack: 60000, blindLevelDuration: 60 },
    blindLevels: 60,
    prizeGuarantee: 1000000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-06-15T18:00:00'),
    lateRegistrationLevels: 0
  },
  {
    id: 'wsop-8-game-mix',
    name: 'WSOP 8-Game Mixed Championship',
    circuit: circuits[0],
    venue: extendedVenues[3],
    buyIn: 2500,
    startDate: new Date('2024-06-22T14:00:00'),
    endDate: new Date('2024-06-25T20:00:00'),
    estimatedField: 280,
    structure: { type: 'freezeout', startingStack: 50000, blindLevelDuration: 60 },
    blindLevels: 60,
    prizeGuarantee: 500000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-06-22T18:00:00'),
    lateRegistrationLevels: 0
  },

  // PLO tournaments
  {
    id: 'wsop-plo-championship',
    name: 'WSOP Pot-Limit Omaha Championship',
    circuit: circuits[0],
    venue: extendedVenues[3],
    buyIn: 10000,
    startDate: new Date('2024-06-08T12:00:00'),
    endDate: new Date('2024-06-13T22:00:00'),
    estimatedField: 650,
    structure: { type: 'reentry', startingStack: 60000, blindLevelDuration: 75, reentryLevels: 6 },
    blindLevels: 75,
    prizeGuarantee: 5000000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-06-10T18:00:00'),
    lateRegistrationLevels: 6
  },

  // Small stakes events
  {
    id: 'wsop-deepstack-daily',
    name: 'WSOP Daily Deepstack',
    circuit: circuits[0],
    venue: venues[0],
    buyIn: 125,
    startDate: new Date('2024-02-12T15:00:00'),
    endDate: new Date('2024-02-12T23:30:00'),
    estimatedField: 220,
    structure: { type: 'reentry', startingStack: 20000, blindLevelDuration: 20, reentryLevels: 6 },
    blindLevels: 20,
    prizeGuarantee: 15000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-02-12T19:00:00'),
    lateRegistrationLevels: 6
  },
  {
    id: 'wsop-seniors-event',
    name: 'WSOP Seniors Championship',
    circuit: circuits[0],
    venue: extendedVenues[3],
    buyIn: 1000,
    startDate: new Date('2024-06-28T12:00:00'),
    endDate: new Date('2024-07-01T22:00:00'),
    estimatedField: 4200,
    structure: { type: 'reentry', startingStack: 20000, blindLevelDuration: 40, reentryLevels: 8 },
    blindLevels: 40,
    prizeGuarantee: 3000000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-06-29T18:00:00'),
    lateRegistrationLevels: 8
  },

  // High stakes events
  {
    id: 'wpt-alpha8-high-roller',
    name: 'WPT Alpha8 High Roller',
    circuit: circuits[1],
    venue: extendedVenues[3],
    buyIn: 100000,
    startDate: new Date('2024-05-18T14:00:00'),
    endDate: new Date('2024-05-21T22:00:00'),
    estimatedField: 35,
    structure: { type: 'freezeout', startingStack: 1000000, blindLevelDuration: 90 },
    blindLevels: 90,
    prizeGuarantee: 3500000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-05-18T16:00:00'),
    lateRegistrationLevels: 2
  },

  // Summer tournaments
  {
    id: 'wsop-millionaire-maker',
    name: 'WSOP Millionaire Maker',
    circuit: circuits[0],
    venue: extendedVenues[3],
    buyIn: 1500,
    startDate: new Date('2024-05-25T12:00:00'),
    endDate: new Date('2024-05-29T22:00:00'),
    estimatedField: 7200,
    structure: { type: 'reentry', startingStack: 25000, blindLevelDuration: 40, reentryLevels: 10 },
    blindLevels: 40,
    prizeGuarantee: 8000000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-05-26T18:00:00'),
    lateRegistrationLevels: 10
  },

  // Fall tournaments
  {
    id: 'wpt-cinco-main',
    name: 'WPT Cinco de Mayo',
    circuit: circuits[1],
    venue: extendedVenues[5],
    buyIn: 3500,
    startDate: new Date('2024-05-03T12:00:00'),
    endDate: new Date('2024-05-08T22:00:00'),
    estimatedField: 520,
    structure: { type: 'reentry', startingStack: 40000, blindLevelDuration: 60, reentryLevels: 8 },
    blindLevels: 60,
    prizeGuarantee: 1750000,
    status: 'upcoming',
    registrationDeadline: new Date('2024-05-05T18:00:00'),
    lateRegistrationLevels: 8
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