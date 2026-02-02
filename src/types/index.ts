// Core data types for the Poker Circuit Coordinator

export interface Tournament {
  id: string;
  name: string;
  circuit: Circuit;
  venue: Venue;
  buyIn: number;
  startDate: Date;
  endDate: Date;
  estimatedField: number;
  structure: TournamentStructure;
  blindLevels: number;
  prizeGuarantee?: number;
  status: 'upcoming' | 'running' | 'completed' | 'cancelled';
  registrationDeadline?: Date;
  lateRegistrationLevels?: number;
}

export interface Circuit {
  id: string;
  name: string;
  organizer: string;
  type: 'wsop' | 'wpt' | 'ept' | 'regional' | 'local';
  website: string;
  seasonStart: Date;
  seasonEnd: Date;
}

export interface Venue {
  id: string;
  name: string;
  address: Address;
  coordinates: Coordinates;
  amenities: VenueAmenity[];
  parking: ParkingInfo;
  nearbyHotels: Hotel[];
  localTips: LocalTip[];
  timezone: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface VenueAmenity {
  name: string;
  available: boolean;
  cost?: number;
  notes?: string;
}

export interface Hotel {
  id: string;
  name: string;
  address: Address;
  distanceFromVenue: number; // miles
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  rating: number;
  amenities: string[];
  bookingUrl?: string;
  avgNightlyRate?: number;
  groupRateAvailable?: boolean;
}

export interface LocalTip {
  category: 'restaurant' | 'transportation' | 'entertainment' | 'safety' | 'other';
  title: string;
  description: string;
  cost?: 'free' | '$' | '$$' | '$$$';
  rating?: number;
}

export interface ParkingInfo {
  available: boolean;
  cost: 'free' | 'paid' | 'valet';
  spaces?: number;
  notes?: string;
}

export interface TournamentStructure {
  type: 'freezeout' | 'rebuy' | 'reentry' | 'shootout' | 'satellite';
  startingStack: number;
  blindLevelDuration: number; // minutes
  numberOfRebuyLevels?: number;
  reentryLevels?: number;
}

export interface Player {
  id: string;
  name: string;
  email: string;
  phone?: string;
  preferences: PlayerPreferences;
  bankroll: BankrollInfo;
  statistics: PlayerStatistics;
}

export interface PlayerPreferences {
  travelMethods: TravelMethod[];
  hotelQuality: 'budget' | 'mid-range' | 'luxury';
  maxDaysPerTrip: number;
  maxTravelDistance: number; // miles for driving
  budgetConstraints: BudgetConstraints;
  circuitFocus: Circuit['type'][];
  tournamentTypes: TournamentStructure['type'][];
}

export interface TravelMethod {
  type: 'fly' | 'drive' | 'train' | 'bus';
  maxCost?: number;
  maxDuration?: number; // hours
  preferred: boolean;
}

export interface BudgetConstraints {
  maxTravelPerMonth: number;
  maxAccommodationPerNight: number;
  maxFoodPerDay: number;
  emergencyFund: number;
}

export interface BankrollInfo {
  totalBankroll: number;
  tournamentBankroll: number;
  cashGameBankroll?: number;
  expenseFund: number;
  lastUpdated: Date;
}

export interface PlayerStatistics {
  tournamentsPlayed: number;
  totalPrizesWon: number;
  averageBuyIn: number;
  roi: number; // percentage
  profitLoss: number;
  averageFinish: number;
  itm: number; // percentage
  biggestScore: number;
  bestCircuit: string;
  yearsPlaying: number;
}

export interface TravelOption {
  id: string;
  type: TravelMethod['type'];
  cost: number;
  duration: number; // hours
  carbonFootprint?: number; // kg CO2
  provider?: string;
  departure: {
    location: string;
    time: Date;
  };
  arrival: {
    location: string;
    time: Date;
  };
  bookingUrl?: string;
  notes?: string;
}

export interface Itinerary {
  id: string;
  playerId: string;
  name: string;
  tournaments: Tournament[];
  route: RouteStop[];
  totalCost: number;
  totalTravelTime: number; // hours
  costSavings: number; // vs individual trips
  optimizationScore: number; // 0-100
  created: Date;
  lastModified: Date;
  status: 'draft' | 'confirmed' | 'booked' | 'completed';
}

export interface RouteStop {
  order: number;
  tournament: Tournament;
  arrivalDate: Date;
  departureDate: Date;
  accommodation: AccommodationBooking;
  travel: {
    inbound: TravelOption;
    outbound?: TravelOption;
  };
  localExpenses: LocalExpense[];
  notes?: string;
}

export interface AccommodationBooking {
  hotel: Hotel;
  checkIn: Date;
  checkOut: Date;
  roomType: string;
  nightlyRate: number;
  totalCost: number;
  isGroupBooking: boolean;
  roommates?: string[];
  confirmationNumber?: string;
  bookingUrl?: string;
}

export interface LocalExpense {
  category: 'food' | 'transportation' | 'entertainment' | 'tips' | 'other';
  description: string;
  estimatedCost: number;
  actualCost?: number;
}

export interface GroupCoordination {
  id: string;
  itineraryId: string;
  organizer: string;
  participants: string[];
  sharedAccommodations: AccommodationBooking[];
  sharedTransportation: TravelOption[];
  costSplit: CostSplit[];
  status: 'organizing' | 'confirmed' | 'completed';
}

export interface CostSplit {
  playerId: string;
  category: 'accommodation' | 'transportation' | 'food' | 'other';
  amount: number;
  paid: boolean;
}

export interface OptimizationResult {
  originalCost: number;
  optimizedCost: number;
  savings: number;
  savingsPercentage: number;
  recommendations: Recommendation[];
  alternativeRoutes: Itinerary[];
}

export interface Recommendation {
  type: 'travel' | 'accommodation' | 'timing' | 'circuit' | 'budget';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potentialSavings: number;
  implementationDifficulty: 'easy' | 'medium' | 'hard';
}

export interface WeatherInfo {
  location: string;
  date: Date;
  temperature: {
    high: number;
    low: number;
    unit: 'F' | 'C';
  };
  conditions: string;
  precipitation: number;
  windSpeed: number;
  packingRecommendations: string[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form types
export interface CircuitSelectionForm {
  selectedCircuits: string[];
  budgetMax: number;
  travelPreferences: PlayerPreferences;
  startDate: Date;
  endDate: Date;
}

export interface QuickOptimizeForm {
  tournaments: string[];
  maxBudget: number;
  prioritizeBy: 'cost' | 'time' | 'roi' | 'convenience';
}

// Dashboard types
export interface DashboardStats {
  upcomingTournaments: number;
  totalBudget: number;
  potentialSavings: number;
  milesThisMonth: number;
  roi: number;
  tournamentsPlayed: number;
}

// Re-export expense types
export * from './expenses';

// Re-export bankroll types
export * from './bankroll';