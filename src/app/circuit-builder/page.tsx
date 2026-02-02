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
  Info
} from 'lucide-react'
import { Tournament, Circuit, Player, CircuitSelectionForm } from '@/types'
import { tournaments, circuits, getUpcomingTournaments } from '@/data/tournaments'

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

export default function CircuitBuilderPage() {
  const [selectedTournaments, setSelectedTournaments] = useState<Tournament[]>([])
  const [filters, setFilters] = useState({
    circuits: [] as string[],
    buyInMin: 0,
    buyInMax: 5000,
    dateRange: {
      start: new Date(),
      end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 3 months
    },
    searchQuery: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [optimizationResults, setOptimizationResults] = useState<any>(null)

  // Filter tournaments based on current filters
  const filteredTournaments = useMemo(() => {
    return tournaments.filter(tournament => {
      // Circuit filter
      if (filters.circuits.length > 0 && !filters.circuits.includes(tournament.circuit.id)) {
        return false
      }

      // Buy-in filter
      if (tournament.buyIn < filters.buyInMin || tournament.buyIn > filters.buyInMax) {
        return false
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

  const optimizeCircuit = () => {
    // Mock optimization results
    const totalBuyIn = selectedTournaments.reduce((sum, t) => sum + t.buyIn, 0)
    const estimatedTravel = selectedTournaments.length * 800 // Mock travel cost
    const totalCost = totalBuyIn + estimatedTravel
    const optimizedCost = totalCost * 0.75 // 25% savings
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Circuit Builder</h1>
              <p className="text-gray-600 mt-1">Build and optimize your tournament circuit for maximum ROI</p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tournament Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Find Tournaments</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                >
                  <Filter className="h-4 w-4" />
                  <span className="text-sm">Filters</span>
                  <ChevronDown className={`h-4 w-4 transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tournaments, venues, or cities..."
                  className="input pl-10"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                />
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 border-t pt-4"
                  >
                    {/* Circuits */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Circuits</label>
                      <div className="flex flex-wrap gap-2">
                        {circuits.map(circuit => (
                          <button
                            key={circuit.id}
                            onClick={() => {
                              const newCircuits = filters.circuits.includes(circuit.id)
                                ? filters.circuits.filter(c => c !== circuit.id)
                                : [...filters.circuits, circuit.id]
                              setFilters({ ...filters, circuits: newCircuits })
                            }}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              filters.circuits.includes(circuit.id)
                                ? 'bg-primary-100 text-primary-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {circuit.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Buy-in Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Min Buy-in</label>
                        <input
                          type="number"
                          className="input"
                          value={filters.buyInMin}
                          onChange={(e) => setFilters({ ...filters, buyInMin: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Max Buy-in</label>
                        <input
                          type="number"
                          className="input"
                          value={filters.buyInMax}
                          onChange={(e) => setFilters({ ...filters, buyInMax: parseInt(e.target.value) || 5000 })}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Tournament List */}
            <div className="space-y-4">
              {filteredTournaments.length === 0 ? (
                <div className="card text-center py-8">
                  <p className="text-gray-500">No tournaments match your current filters.</p>
                </div>
              ) : (
                filteredTournaments.map((tournament, index) => (
                  <motion.div
                    key={tournament.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`card hover:shadow-md transition-shadow cursor-pointer ${
                      selectedTournaments.find(t => t.id === tournament.id) 
                        ? 'ring-2 ring-primary-500 bg-primary-50' 
                        : ''
                    }`}
                    onClick={() => {
                      const isSelected = selectedTournaments.find(t => t.id === tournament.id)
                      if (isSelected) {
                        removeTournament(tournament.id)
                      } else {
                        addTournament(tournament)
                      }
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{tournament.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tournament.circuit.type === 'wsop' ? 'bg-yellow-100 text-yellow-800' :
                            tournament.circuit.type === 'wpt' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {tournament.circuit.name}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{tournament.venue.address.city}, {tournament.venue.address.state}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{tournament.startDate.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>${tournament.buyIn.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{tournament.estimatedField} players</span>
                          </div>
                        </div>

                        {tournament.prizeGuarantee && (
                          <div className="mt-2 text-sm text-green-600">
                            ${tournament.prizeGuarantee.toLocaleString()} guaranteed
                          </div>
                        )}
                      </div>

                      <button
                        className={`ml-4 p-2 rounded-full transition-colors ${
                          selectedTournaments.find(t => t.id === tournament.id)
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          const isSelected = selectedTournaments.find(t => t.id === tournament.id)
                          if (isSelected) {
                            removeTournament(tournament.id)
                          } else {
                            addTournament(tournament)
                          }
                        }}
                      >
                        {selectedTournaments.find(t => t.id === tournament.id) ? (
                          <Minus className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Circuit Summary & Optimization */}
          <div className="space-y-6">
            {/* Selected Circuit Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Your Circuit</h3>
              
              {selectedTournaments.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Select tournaments to build your circuit</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {selectedTournaments.map(tournament => (
                      <div key={tournament.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium">{tournament.name}</p>
                          <p className="text-xs text-gray-500">
                            {tournament.venue.address.city} • {tournament.startDate.toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => removeTournament(tournament.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Circuit Stats */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Total Buy-ins</p>
                      <p className="font-semibold">${totalBuyIn.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Events</p>
                      <p className="font-semibold">{selectedTournaments.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Field</p>
                      <p className="font-semibold">{Math.round(averageField)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Expected ROI</p>
                      <p className="font-semibold text-green-600">{expectedROI}%</p>
                    </div>
                  </div>

                  <button
                    onClick={optimizeCircuit}
                    disabled={selectedTournaments.length < 2}
                    className="w-full mt-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Optimize Circuit
                  </button>
                </>
              )}
            </motion.div>

            {/* Optimization Results */}
            {optimizationResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <h3 className="font-semibold text-gray-900 mb-4">Optimization Results</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-green-700">Potential Savings</span>
                      <span className="font-bold text-green-900">${optimizationResults.savings.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-green-600">
                      {optimizationResults.savingsPercentage}% reduction in travel costs
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                    <div className="space-y-2">
                      {optimizationResults.recommendations.map((rec: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-sm font-medium">{rec.title}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {rec.priority}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                          <div className="flex justify-between text-xs">
                            <span className="text-green-600">+${rec.potentialSavings.toLocaleString()}</span>
                            <span className="text-gray-500">{rec.implementationDifficulty} to implement</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="w-full btn-primary">
                    <Plane className="h-4 w-4 mr-2" />
                    Book Optimized Route
                  </button>
                </div>
              </motion.div>
            )}

            {/* Player Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Your Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tournament ROI</span>
                  <span className="font-medium text-green-600">{mockPlayer.statistics.roi}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ITM Rate</span>
                  <span className="font-medium">{mockPlayer.statistics.itm}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bankroll</span>
                  <span className="font-medium">${(mockPlayer.bankroll.totalBankroll / 1000).toFixed(0)}k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Travel Budget</span>
                  <span className="font-medium">${(mockPlayer.bankroll.expenseFund / 1000).toFixed(0)}k</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}