'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Filter,
  Plus,
  Minus,
  Target,
  TrendingUp,
  Plane,
  ChevronDown,
  Search,
  Star,
  Info,
  X,
  Grid,
  List,
  SlidersHorizontal
} from 'lucide-react'
import { Tournament, Circuit, Player } from '@/types'
import { tournaments, circuits } from '@/data/tournaments'

// Mock player data
const mockPlayer: Player = {
  id: 'player-1',
  name: 'Alex Chen',
  email: 'alex@example.com',
  preferences: {
    travelMethods: [
      { type: 'fly', preferred: true, maxCost: 800, maxDuration: 8 },
      { type: 'drive', preferred: true, maxCost: 200, maxDuration: 12 }
    ],
    hotelQuality: 'mid-range',
    maxDaysPerTrip: 7,
    maxTravelDistance: 800,
    budgetConstraints: {
      maxTravelPerMonth: 3000,
      maxAccommodationPerNight: 150,
      maxFoodPerDay: 75,
      emergencyFund: 5000
    },
    circuitFocus: ['wsop', 'wpt', 'regional'],
    tournamentTypes: ['reentry', 'freezeout']
  },
  bankroll: {
    totalBankroll: 75000,
    tournamentBankroll: 50000,
    cashGameBankroll: 15000,
    expenseFund: 10000,
    lastUpdated: new Date()
  },
  statistics: {
    tournamentsPlayed: 47,
    totalPrizesWon: 125000,
    averageBuyIn: 1250,
    roi: 23.5,
    profitLoss: 28500,
    averageFinish: 0.35,
    itm: 28,
    biggestScore: 42000,
    bestCircuit: 'WSOP Circuit',
    yearsPlaying: 5
  }
}

// Extract unique filter values from tournaments
const getUniqueValues = (tournaments: Tournament[], key: string): string[] => {
  const values = new Set<string>()
  tournaments.forEach(tournament => {
    switch (key) {
      case 'brand':
        values.add(tournament.circuit.name)
        break
      case 'location':
        values.add(`${tournament.venue.address.city}, ${tournament.venue.address.state}`)
        break
      case 'casino':
        values.add(tournament.venue.name)
        break
      case 'gameType':
        values.add(tournament.structure.type)
        break
    }
  })
  return Array.from(values).sort()
}

// Buy-in brackets
const buyInBrackets = [
  { label: 'All', min: 0, max: 100000 },
  { label: '$100-500', min: 100, max: 500 },
  { label: '$500-1000', min: 500, max: 1000 },
  { label: '$1000-5000', min: 1000, max: 5000 },
  { label: '$5000+', min: 5000, max: 100000 }
]

// Brand styling configurations
const brandStyles = {
  'World Series of Poker': {
    primary: 'bg-yellow-500',
    secondary: 'bg-yellow-100',
    text: 'text-yellow-900',
    border: 'border-yellow-200',
    gradient: 'from-yellow-400 to-yellow-600'
  },
  'World Poker Tour': {
    primary: 'bg-red-600',
    secondary: 'bg-red-100', 
    text: 'text-red-900',
    border: 'border-red-200',
    gradient: 'from-red-500 to-red-700'
  },
  'European Poker Tour': {
    primary: 'bg-blue-600',
    secondary: 'bg-blue-100',
    text: 'text-blue-900', 
    border: 'border-blue-200',
    gradient: 'from-blue-500 to-blue-700'
  },
  'Regional Circuits': {
    primary: 'bg-green-600',
    secondary: 'bg-green-100',
    text: 'text-green-900',
    border: 'border-green-200', 
    gradient: 'from-green-500 to-green-700'
  }
}

export default function CircuitBuilderPage() {
  const [selectedTournaments, setSelectedTournaments] = useState<Tournament[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState({
    brands: [] as string[],
    locations: [] as string[],
    casinos: [] as string[],
    gameTypes: [] as string[],
    buyInBracket: 'All',
    dateRange: {
      start: new Date(),
      end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 3 months
    },
    searchQuery: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [optimizationResults, setOptimizationResults] = useState<any>(null)

  // Get unique values for filters
  const uniqueBrands = getUniqueValues(tournaments, 'brand')
  const uniqueLocations = getUniqueValues(tournaments, 'location')
  const uniqueCasinos = getUniqueValues(tournaments, 'casino')
  const uniqueGameTypes = getUniqueValues(tournaments, 'gameType')

  // Filter tournaments based on current filters
  const filteredTournaments = useMemo(() => {
    return tournaments.filter(tournament => {
      // Brand filter
      if (filters.brands.length > 0 && !filters.brands.includes(tournament.circuit.name)) {
        return false
      }

      // Location filter
      const location = `${tournament.venue.address.city}, ${tournament.venue.address.state}`
      if (filters.locations.length > 0 && !filters.locations.includes(location)) {
        return false
      }

      // Casino filter
      if (filters.casinos.length > 0 && !filters.casinos.includes(tournament.venue.name)) {
        return false
      }

      // Game type filter
      if (filters.gameTypes.length > 0 && !filters.gameTypes.includes(tournament.structure.type)) {
        return false
      }

      // Buy-in bracket filter
      const bracket = buyInBrackets.find(b => b.label === filters.buyInBracket)
      if (bracket && bracket.label !== 'All') {
        if (tournament.buyIn < bracket.min || tournament.buyIn > bracket.max) {
          return false
        }
      }

      // Date range filter
      if (tournament.startDate < filters.dateRange.start || tournament.startDate > filters.dateRange.end) {
        return false
      }

      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        return (
          tournament.name.toLowerCase().includes(query) ||
          tournament.venue.name.toLowerCase().includes(query) ||
          tournament.venue.address.city.toLowerCase().includes(query)
        )
      }

      return true
    }).sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
  }, [filters])

  const addTournament = (tournament: Tournament) => {
    if (!selectedTournaments.find(t => t.id === tournament.id)) {
      setSelectedTournaments([...selectedTournaments, tournament].sort((a, b) => 
        a.startDate.getTime() - b.startDate.getTime()
      ))
    }
  }

  const removeTournament = (tournamentId: string) => {
    setSelectedTournaments(selectedTournaments.filter(t => t.id !== tournamentId))
  }

  const clearFilters = () => {
    setFilters({
      brands: [],
      locations: [],
      casinos: [],
      gameTypes: [],
      buyInBracket: 'All',
      dateRange: {
        start: new Date(),
        end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      },
      searchQuery: ''
    })
  }

  const optimizeCircuit = () => {
    // Mock optimization results
    const totalBuyIn = selectedTournaments.reduce((sum, t) => sum + t.buyIn, 0)
    const estimatedTravel = selectedTournaments.length * 800
    const totalCost = totalBuyIn + estimatedTravel
    const optimizedCost = totalCost * 0.75
    const savings = totalCost - optimizedCost

    setOptimizationResults({
      originalCost: totalCost,
      optimizedCost,
      savings,
      savingsPercentage: 25,
      recommendations: [
        {
          type: 'travel',
          priority: 'high',
          title: 'Route Optimization',
          description: 'Fly to Las Vegas, drive to California events, then fly home',
          potentialSavings: savings * 0.6,
          implementationDifficulty: 'easy'
        },
        {
          type: 'accommodation',
          priority: 'medium', 
          title: 'Group Hotel Booking',
          description: 'Coordinate with 3 other players for group rates',
          potentialSavings: savings * 0.3,
          implementationDifficulty: 'medium'
        }
      ]
    })
  }

  const totalBuyIn = selectedTournaments.reduce((sum, t) => sum + t.buyIn, 0)
  const averageField = selectedTournaments.reduce((sum, t) => sum + t.estimatedField, 0) / selectedTournaments.length || 0
  const expectedROI = mockPlayer.statistics.roi
  const hasActiveFilters = filters.brands.length > 0 || filters.locations.length > 0 || 
    filters.casinos.length > 0 || filters.gameTypes.length > 0 || filters.buyInBracket !== 'All'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tournament Browser</h1>
          <p className="text-gray-600 mt-1">
            Discover and select tournaments to build your optimal circuit
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card sticky top-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tournaments..."
                  className="input pl-10 w-full text-sm"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                {/* Brand Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Brand</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {uniqueBrands.map(brand => (
                      <label key={brand} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600"
                          checked={filters.brands.includes(brand)}
                          onChange={(e) => {
                            const newBrands = e.target.checked
                              ? [...filters.brands, brand]
                              : filters.brands.filter(b => b !== brand)
                            setFilters({ ...filters, brands: newBrands })
                          }}
                        />
                        <span className="ml-2">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Buy-in Bracket */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Buy-in Amount</label>
                  <select
                    value={filters.buyInBracket}
                    onChange={(e) => setFilters({ ...filters, buyInBracket: e.target.value })}
                    className="input w-full text-sm"
                  >
                    {buyInBrackets.map(bracket => (
                      <option key={bracket.label} value={bracket.label}>
                        {bracket.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {uniqueLocations.map(location => (
                      <label key={location} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600"
                          checked={filters.locations.includes(location)}
                          onChange={(e) => {
                            const newLocations = e.target.checked
                              ? [...filters.locations, location]
                              : filters.locations.filter(l => l !== location)
                            setFilters({ ...filters, locations: newLocations })
                          }}
                        />
                        <span className="ml-2">{location}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Game Type Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Game Type</label>
                  <div className="space-y-2">
                    {uniqueGameTypes.map(gameType => (
                      <label key={gameType} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600"
                          checked={filters.gameTypes.includes(gameType)}
                          onChange={(e) => {
                            const newGameTypes = e.target.checked
                              ? [...filters.gameTypes, gameType]
                              : filters.gameTypes.filter(gt => gt !== gameType)
                            setFilters({ ...filters, gameTypes: newGameTypes })
                          }}
                        />
                        <span className="ml-2 capitalize">{gameType.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Controls */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {filteredTournaments.length} tournaments found
                </span>
                {selectedTournaments.length > 0 && (
                  <span className="text-sm text-primary-600">
                    {selectedTournaments.length} selected
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Tournament Grid/List */}
            {filteredTournaments.length === 0 ? (
              <div className="card text-center py-12">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No tournaments match your current filters.</p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-primary-600 hover:text-primary-700 text-sm"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 gap-4' 
                : 'space-y-4'
              }>
                {filteredTournaments.map((tournament, index) => {
                  const isSelected = selectedTournaments.find(t => t.id === tournament.id)
                  const location = `${tournament.venue.address.city}, ${tournament.venue.address.state}`
                  
                  return (
                    <motion.div
                      key={tournament.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`card hover:shadow-md transition-all cursor-pointer ${
                        isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          removeTournament(tournament.id)
                        } else {
                          addTournament(tournament)
                        }
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">{tournament.name}</h4>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  tournament.circuit.type === 'wsop' ? 'bg-yellow-100 text-yellow-800' :
                                  tournament.circuit.type === 'wpt' ? 'bg-blue-100 text-blue-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {tournament.circuit.name}
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 capitalize">
                                  {tournament.structure.type.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                              </div>
                            </div>
                            <button
                              className={`p-2 rounded-full transition-colors ${
                                isSelected
                                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                  : 'bg-green-100 text-green-600 hover:bg-green-200'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (isSelected) {
                                  removeTournament(tournament.id)
                                } else {
                                  addTournament(tournament)
                                }
                              }}
                            >
                              {isSelected ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>{location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{tournament.startDate.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4" />
                              <span>${tournament.buyIn.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <span>{tournament.estimatedField} players</span>
                            </div>
                          </div>

                          <div className="text-sm text-gray-700">
                            <span className="font-medium">{tournament.venue.name}</span>
                            {tournament.prizeGuarantee && (
                              <span className="ml-2 text-green-600">
                                • ${tournament.prizeGuarantee.toLocaleString()} GTD
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected Circuit Summary - Floating Bottom Bar */}
        {selectedTournaments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div>
                  <p className="text-sm text-gray-600">Selected Tournaments</p>
                  <p className="font-semibold">{selectedTournaments.length} events</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Buy-ins</p>
                  <p className="font-semibold">${totalBuyIn.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expected ROI</p>
                  <p className="font-semibold text-green-600">{expectedROI}%</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedTournaments([])}
                  className="btn-secondary"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </button>
                <button
                  onClick={optimizeCircuit}
                  disabled={selectedTournaments.length < 2}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Optimize Circuit
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Optimization Modal */}
        <AnimatePresence>
          {optimizationResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setOptimizationResults(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Circuit Optimization Results</h3>
                  <button
                    onClick={() => setOptimizationResults(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-700">Potential Savings</span>
                      <span className="text-2xl font-bold text-green-900">
                        ${optimizationResults.savings.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-green-600">
                      {optimizationResults.savingsPercentage}% reduction in total costs
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Optimization Recommendations</h4>
                    <div className="space-y-3">
                      {optimizationResults.recommendations.map((rec: any, index: number) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-medium">{rec.title}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {rec.priority} priority
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                          <div className="flex justify-between text-sm">
                            <span className="text-green-600 font-medium">
                              Saves ${rec.potentialSavings.toLocaleString()}
                            </span>
                            <span className="text-gray-500 capitalize">
                              {rec.implementationDifficulty} to implement
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setOptimizationResults(null)}
                      className="flex-1 btn-secondary"
                    >
                      Review Later
                    </button>
                    <button className="flex-1 btn-primary">
                      <Plane className="h-4 w-4 mr-2" />
                      Book Optimized Route
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}