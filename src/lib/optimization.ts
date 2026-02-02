import { Tournament, TravelOption, Itinerary, RouteStop, OptimizationResult, Recommendation, Player } from '@/types'

// Distance calculation using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Cost calculation for different travel methods
export function calculateTravelCost(
  distance: number, 
  method: 'fly' | 'drive' | 'train' | 'bus',
  timeframe: number = 14 // days ahead
): number {
  const baseCosts = {
    fly: 0.25, // per mile base cost
    drive: 0.60, // includes gas, wear, time value
    train: 0.20,
    bus: 0.15
  }

  let cost = distance * baseCosts[method]

  // Add surge pricing for flights based on timeframe
  if (method === 'fly') {
    if (timeframe < 7) cost *= 2.5 // last minute booking
    else if (timeframe < 14) cost *= 1.8
    else if (timeframe < 30) cost *= 1.3
    
    // Minimum flight cost
    cost = Math.max(cost, 150)
  }

  // Add fixed costs
  switch (method) {
    case 'fly':
      cost += 50 // airport fees, baggage
      break
    case 'drive':
      cost += distance * 0.62 // IRS mileage rate
      break
    case 'train':
      cost += 25 // booking fees
      break
    case 'bus':
      cost += 15 // booking fees
      break
  }

  return Math.round(cost)
}

// Calculate accommodation costs
export function calculateAccommodationCost(
  location: string,
  nights: number,
  quality: 'budget' | 'mid-range' | 'luxury' = 'mid-range'
): number {
  const baseCosts = {
    'Las Vegas': { budget: 45, 'mid-range': 85, luxury: 200 },
    'San Jose': { budget: 80, 'mid-range': 140, luxury: 280 },
    'Chicago': { budget: 60, 'mid-range': 120, luxury: 250 },
    'Jacksonville': { budget: 55, 'mid-range': 95, luxury: 180 },
    'Milwaukee': { budget: 50, 'mid-range': 90, luxury: 160 },
    'Cherokee': { budget: 40, 'mid-range': 75, luxury: 150 },
    default: { budget: 60, 'mid-range': 110, luxury: 220 }
  }

  const cityRates = baseCosts[location as keyof typeof baseCosts] || baseCosts.default
  return cityRates[quality] * nights
}

// Traveling Salesman Problem solver (simplified greedy approach)
export function optimizeRoute(tournaments: Tournament[], homeLocation: { lat: number; lng: number } = { lat: 39.8283, lng: -98.5795 }): Tournament[] {
  if (tournaments.length <= 1) return tournaments

  const unvisited = [...tournaments]
  const route: Tournament[] = []
  let currentLocation = homeLocation

  // Start with the earliest tournament
  const firstTournament = unvisited.reduce((earliest, current) => 
    current.startDate < earliest.startDate ? current : earliest
  )
  
  route.push(firstTournament)
  unvisited.splice(unvisited.indexOf(firstTournament), 1)
  currentLocation = firstTournament.venue.coordinates

  // Greedily select nearest tournament that hasn't been visited
  while (unvisited.length > 0) {
    let nearestTournament = unvisited[0]
    let nearestDistance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      nearestTournament.venue.coordinates.lat,
      nearestTournament.venue.coordinates.lng
    )

    for (const tournament of unvisited) {
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        tournament.venue.coordinates.lat,
        tournament.venue.coordinates.lng
      )

      // Consider both distance and time constraints
      const timeWeight = Math.abs(tournament.startDate.getTime() - (route[route.length - 1]?.endDate.getTime() || 0)) / (1000 * 60 * 60 * 24)
      const weightedDistance = distance + (timeWeight > 7 ? timeWeight * 50 : 0)

      if (weightedDistance < nearestDistance) {
        nearestDistance = weightedDistance
        nearestTournament = tournament
      }
    }

    route.push(nearestTournament)
    unvisited.splice(unvisited.indexOf(nearestTournament), 1)
    currentLocation = nearestTournament.venue.coordinates
  }

  return route
}

// Generate travel options between two locations
export function generateTravelOptions(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  fromCity: string,
  toCity: string,
  date: Date,
  playerPreferences: Player['preferences']
): TravelOption[] {
  const distance = calculateDistance(fromLat, fromLng, toLat, toLng)
  const daysAhead = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  
  const options: TravelOption[] = []

  // Flying option
  if (playerPreferences.travelMethods.some(m => m.type === 'fly') && distance > 200) {
    const cost = calculateTravelCost(distance, 'fly', daysAhead)
    const duration = Math.max(2, distance / 500) // minimum 2 hours for flights
    
    options.push({
      id: `fly-${fromCity}-${toCity}`,
      type: 'fly',
      cost,
      duration,
      carbonFootprint: distance * 0.24, // kg CO2 per mile
      provider: 'Airlines',
      departure: {
        location: `${fromCity} Airport`,
        time: new Date(date.getTime() - 2 * 60 * 60 * 1000) // 2 hours before
      },
      arrival: {
        location: `${toCity} Airport`,
        time: new Date(date.getTime() + duration * 60 * 60 * 1000)
      },
      notes: daysAhead < 14 ? 'Book soon to avoid higher prices' : undefined
    })
  }

  // Driving option
  if (playerPreferences.travelMethods.some(m => m.type === 'drive') && distance <= playerPreferences.maxTravelDistance) {
    const cost = calculateTravelCost(distance, 'drive', daysAhead)
    const duration = distance / 55 // average 55 mph including stops
    
    options.push({
      id: `drive-${fromCity}-${toCity}`,
      type: 'drive',
      cost,
      duration,
      carbonFootprint: distance * 0.89, // kg CO2 per mile for cars
      departure: {
        location: fromCity,
        time: new Date(date.getTime() - duration * 60 * 60 * 1000)
      },
      arrival: {
        location: toCity,
        time: date
      },
      notes: duration > 8 ? 'Consider overnight stop' : 'Direct drive'
    })
  }

  // Bus option for budget-conscious players
  if (distance < 1000 && distance > 100) {
    const cost = calculateTravelCost(distance, 'bus', daysAhead)
    const duration = distance / 45 // slower with stops
    
    options.push({
      id: `bus-${fromCity}-${toCity}`,
      type: 'bus',
      cost,
      duration,
      carbonFootprint: distance * 0.14, // kg CO2 per mile
      provider: 'Greyhound/Megabus',
      departure: {
        location: `${fromCity} Bus Station`,
        time: new Date(date.getTime() - duration * 60 * 60 * 1000)
      },
      arrival: {
        location: `${toCity} Bus Station`,
        time: date
      },
      notes: 'Budget option, longer travel time'
    })
  }

  return options.sort((a, b) => a.cost - b.cost)
}

// Main optimization function
export function optimizeCircuit(
  tournaments: Tournament[],
  player: Player,
  homeLocation = { lat: 39.8283, lng: -98.5795, city: 'Home' }
): OptimizationResult {
  if (tournaments.length === 0) {
    return {
      originalCost: 0,
      optimizedCost: 0,
      savings: 0,
      savingsPercentage: 0,
      recommendations: [],
      alternativeRoutes: []
    }
  }

  // Calculate original cost (individual trips from home)
  let originalCost = 0
  tournaments.forEach(tournament => {
    const distance = calculateDistance(
      homeLocation.lat,
      homeLocation.lng,
      tournament.venue.coordinates.lat,
      tournament.venue.coordinates.lng
    )
    
    originalCost += tournament.buyIn
    originalCost += calculateTravelCost(distance, 'fly') * 2 // round trip
    originalCost += calculateAccommodationCost(
      tournament.venue.address.city,
      3, // average 3 nights
      player.preferences.hotelQuality
    )
    originalCost += 75 * 3 // food costs
  })

  // Optimize route
  const optimizedRoute = optimizeRoute(tournaments)
  let optimizedCost = 0
  let totalDistance = 0
  
  // Calculate optimized circuit cost
  optimizedCost += optimizedRoute.reduce((sum, t) => sum + t.buyIn, 0) // buy-ins don't change

  // Travel costs for optimized route
  let currentLocation = homeLocation
  for (let i = 0; i < optimizedRoute.length; i++) {
    const tournament = optimizedRoute[i]
    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      tournament.venue.coordinates.lat,
      tournament.venue.coordinates.lng
    )
    
    totalDistance += distance
    const travelMethod = distance > 500 ? 'fly' : 'drive'
    optimizedCost += calculateTravelCost(distance, travelMethod)
    
    // Accommodation - longer stays for consecutive events in same city
    const sameCity = optimizedRoute.filter(t => t.venue.address.city === tournament.venue.address.city)
    const nights = sameCity.length > 1 ? sameCity.length + 1 : 3
    
    if (i === 0 || optimizedRoute[i-1].venue.address.city !== tournament.venue.address.city) {
      optimizedCost += calculateAccommodationCost(
        tournament.venue.address.city,
        nights,
        player.preferences.hotelQuality
      )
    }
    
    // Food costs
    optimizedCost += 75 * nights
    
    currentLocation = { 
      lat: tournament.venue.coordinates.lat,
      lng: tournament.venue.coordinates.lng,
      city: tournament.venue.address.city
    }
  }

  // Return trip home
  if (optimizedRoute.length > 0) {
    const lastVenue = optimizedRoute[optimizedRoute.length - 1].venue
    const returnDistance = calculateDistance(
      lastVenue.coordinates.lat,
      lastVenue.coordinates.lng,
      homeLocation.lat,
      homeLocation.lng
    )
    const returnMethod = returnDistance > 500 ? 'fly' : 'drive'
    optimizedCost += calculateTravelCost(returnDistance, returnMethod)
  }

  const savings = originalCost - optimizedCost
  const savingsPercentage = originalCost > 0 ? (savings / originalCost) * 100 : 0

  // Generate recommendations
  const recommendations: Recommendation[] = []

  if (savings > 500) {
    recommendations.push({
      type: 'travel',
      priority: 'high',
      title: 'Circuit Route Optimization',
      description: `Follow the optimized route to save ${Math.round(savingsPercentage)}% on travel costs by reducing total distance traveled.`,
      potentialSavings: savings * 0.6,
      implementationDifficulty: 'easy'
    })
  }

  if (tournaments.length >= 3) {
    recommendations.push({
      type: 'accommodation',
      priority: 'medium',
      title: 'Extended Stay Discounts',
      description: 'Book longer stays in cities with multiple events for weekly rates instead of nightly.',
      potentialSavings: savings * 0.25,
      implementationDifficulty: 'easy'
    })
  }

  if (tournaments.some(t => t.venue.address.city === 'Las Vegas') && tournaments.length >= 2) {
    recommendations.push({
      type: 'accommodation',
      priority: 'medium',
      title: 'Las Vegas Hub Strategy',
      description: 'Use Las Vegas as a base for West Coast events to take advantage of comp rates and central location.',
      potentialSavings: savings * 0.2,
      implementationDifficulty: 'medium'
    })
  }

  const groupBookingTournaments = tournaments.filter(t => t.venue.nearbyHotels.some(h => h.groupRateAvailable))
  if (groupBookingTournaments.length >= 2) {
    recommendations.push({
      type: 'accommodation',
      priority: 'high',
      title: 'Group Booking Coordination',
      description: `${groupBookingTournaments.length} events offer group rates. Coordinate with other players for additional savings.`,
      potentialSavings: savings * 0.15,
      implementationDifficulty: 'medium'
    })
  }

  if (player.bankroll.totalBankroll < originalCost * 10) {
    recommendations.push({
      type: 'budget',
      priority: 'high',
      title: 'Bankroll Management Alert',
      description: 'Consider reducing circuit size or focusing on lower buy-in events to maintain proper bankroll management.',
      potentialSavings: originalCost * 0.3,
      implementationDifficulty: 'hard'
    })
  }

  return {
    originalCost: Math.round(originalCost),
    optimizedCost: Math.round(optimizedCost),
    savings: Math.round(savings),
    savingsPercentage: Math.round(savingsPercentage),
    recommendations: recommendations.slice(0, 5), // Limit to top 5
    alternativeRoutes: [] // Could implement alternative route suggestions
  }
}

// Generate detailed itinerary from optimized route
export function generateItinerary(
  tournaments: Tournament[],
  player: Player,
  homeLocation = { lat: 39.8283, lng: -98.5795, city: 'Home' }
): Itinerary {
  const optimizedRoute = optimizeRoute(tournaments)
  const routeStops: RouteStop[] = []
  
  let currentLocation = homeLocation
  
  for (let i = 0; i < optimizedRoute.length; i++) {
    const tournament = optimizedRoute[i]
    const venue = tournament.venue
    
    // Calculate arrival date (2 days before tournament)
    const arrivalDate = new Date(tournament.startDate.getTime() - 2 * 24 * 60 * 60 * 1000)
    const departureDate = new Date(tournament.endDate.getTime() + 24 * 60 * 60 * 1000)
    
    // Generate travel options
    const travelOptions = generateTravelOptions(
      currentLocation.lat,
      currentLocation.lng,
      venue.coordinates.lat,
      venue.coordinates.lng,
      currentLocation.city,
      venue.address.city,
      arrivalDate,
      player.preferences
    )
    
    const inboundTravel = travelOptions[0] // Best option
    
    // Accommodation
    const nights = Math.ceil((departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24))
    const hotel = venue.nearbyHotels[0] // Primary hotel
    
    const accommodation = {
      hotel,
      checkIn: arrivalDate,
      checkOut: departureDate,
      roomType: 'Standard King',
      nightlyRate: hotel.avgNightlyRate || calculateAccommodationCost(venue.address.city, 1, player.preferences.hotelQuality),
      totalCost: (hotel.avgNightlyRate || calculateAccommodationCost(venue.address.city, 1, player.preferences.hotelQuality)) * nights,
      isGroupBooking: hotel.groupRateAvailable || false,
      roommates: []
    }
    
    routeStops.push({
      order: i + 1,
      tournament,
      arrivalDate,
      departureDate,
      accommodation,
      travel: {
        inbound: inboundTravel
      },
      localExpenses: [
        { category: 'food', description: 'Meals', estimatedCost: 75 * nights },
        { category: 'tips', description: 'Dealer tips', estimatedCost: 50 },
        { category: 'transportation', description: 'Local transport', estimatedCost: 30 }
      ]
    })
    
    currentLocation = { 
      lat: venue.coordinates.lat, 
      lng: venue.coordinates.lng, 
      city: venue.address.city 
    }
  }
  
  const totalCost = routeStops.reduce((sum, stop) => 
    sum + stop.tournament.buyIn + stop.accommodation.totalCost + 
    stop.travel.inbound.cost + 
    stop.localExpenses.reduce((expSum, exp) => expSum + exp.estimatedCost, 0), 0
  )
  
  const optimizationResult = optimizeCircuit(tournaments, player, homeLocation)
  
  return {
    id: `itinerary-${Date.now()}`,
    playerId: player.id,
    name: `${tournaments.length} Event Circuit`,
    tournaments,
    route: routeStops,
    totalCost,
    totalTravelTime: routeStops.reduce((sum, stop) => sum + stop.travel.inbound.duration, 0),
    costSavings: optimizationResult.savings,
    optimizationScore: Math.min(100, Math.max(0, optimizationResult.savingsPercentage)),
    created: new Date(),
    lastModified: new Date(),
    status: 'draft'
  }
}