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
  SlidersHorizontal,
  Check,
  ChevronRight,
  Trophy,
  Building,
  MapIcon,
  FilterIcon
} from 'lucide-react'
import { Tournament, Circuit, Player } from '@/types'
import { circuits } from '@/data/tournaments'
import { useTournaments } from '@/hooks/use-tournaments'

// Tournament series interface for grouping
interface TournamentSeries {
  id: string
  name: string
  circuit: Circuit
  venue: any
  location: string
  dateRange: {
    start: Date
    end: Date
  }
  events: Tournament[]
  totalEvents: number
  buyInRange: {
    min: number
    max: number
  }
}

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

// Brand configurations with colors
const brandConfigs = {
  'all': { name: 'All', color: 'bg-slate-600', textColor: 'text-white' },
  'wsop': { name: 'WSOP', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600', textColor: 'text-black' },
  'wpt': { name: 'WPT', color: 'bg-gradient-to-r from-red-500 to-red-600', textColor: 'text-white' },
  'wsop-circuit': { name: 'WSOP Circuit', color: 'bg-gradient-to-r from-amber-500 to-amber-600', textColor: 'text-black' },
  'regional': { name: 'Regional', color: 'bg-gradient-to-r from-blue-500 to-blue-600', textColor: 'text-white' }
}

// Buy-in brackets
const buyInBrackets = [
  { label: 'All', min: 0, max: 1000000 },
  { label: '$100-500', min: 100, max: 500 },
  { label: '$500-1K', min: 500, max: 1000 },
  { label: '$1K-5K', min: 1000, max: 5000 },
  { label: '$5K+', min: 5000, max: 1000000 }
]

// Game type options
const gameTypes = [
  { value: 'all', label: 'All Games' },
  { value: 'holdem', label: 'Hold\'em' },
  { value: 'plo', label: 'PLO' },
  { value: 'mixed', label: 'Mixed' }
]

// Month options for filter
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function CircuitBuilderPage() {
  const [selectedEvents, setSelectedEvents] = useState<Tournament[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [selectedYear] = useState<number>(new Date().getFullYear())
  const [searchQuery, setSearchQuery] = useState('')
  const [buyInFilter, setBuyInFilter] = useState('All')
  const [gameTypeFilter, setGameTypeFilter] = useState('all')
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set())
  const [showCircuitPanel, setShowCircuitPanel] = useState(false)

  // Fetch tournaments using the live data hook
  const {
    tournaments,
    meta,
    loading,
    error,
    refetch,
    refresh
  } = useTournaments({
    startDate: new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0],
    endDate: new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0]
  })

  // Group tournaments into series by venue and approximate date range
  const groupedTournaments = useMemo(() => {
    const groups = new Map<string, Tournament[]>()
    
    tournaments.forEach(tournament => {
      // Group by venue and month
      const key = `${tournament.venue.id}-${tournament.startDate.getMonth()}-${tournament.startDate.getFullYear()}`
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(tournament)
    })

    const series: TournamentSeries[] = []
    groups.forEach((events, key) => {
      if (events.length === 0) return
      
      const firstEvent = events[0]
      const venue = firstEvent.venue
      const circuit = firstEvent.circuit
      
      // Sort events by start date
      events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      
      const buyIns = events.map(e => e.buyIn)
      const minBuyIn = Math.min(...buyIns)
      const maxBuyIn = Math.max(...buyIns)
      
      // Create series name based on circuit and venue
      let seriesName = `${circuit.name} at ${venue.name}`
      if (events.length > 1) {
        const monthName = months[events[0].startDate.getMonth()]
        seriesName = `${circuit.name} ${venue.name} - ${monthName} ${events[0].startDate.getFullYear()}`
      }

      series.push({
        id: key,
        name: seriesName,
        circuit,
        venue,
        location: `${venue.address.city}, ${venue.address.state}`,
        dateRange: {
          start: events[0].startDate,
          end: events[events.length - 1].endDate
        },
        events,
        totalEvents: events.length,
        buyInRange: { min: minBuyIn, max: maxBuyIn }
      })
    })

    return series.sort((a, b) => a.dateRange.start.getTime() - b.dateRange.start.getTime())
  }, [])

  // Filter series based on current filters
  const filteredSeries = useMemo(() => {
    return groupedTournaments.filter(series => {
      // Brand filter
      if (selectedBrand !== 'all') {
        const brandMap: Record<string, string> = {
          'wsop': 'wsop',
          'wsop-circuit': 'wsop',
          'wpt': 'wpt',
          'regional': 'regional'
        }
        if (brandMap[selectedBrand] !== series.circuit.type) {
          return false
        }
      }

      // Month filter
      if (series.dateRange.start.getMonth() !== selectedMonth || 
          series.dateRange.start.getFullYear() !== selectedYear) {
        return false
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchable = [
          series.name,
          series.venue.name,
          series.location,
          ...series.events.map(e => e.name)
        ].join(' ').toLowerCase()
        
        if (!searchable.includes(query)) {
          return false
        }
      }

      // Buy-in filter
      if (buyInFilter !== 'All') {
        const bracket = buyInBrackets.find(b => b.label === buyInFilter)
        if (bracket) {
          const hasEventInRange = series.events.some(event => 
            event.buyIn >= bracket.min && event.buyIn <= bracket.max
          )
          if (!hasEventInRange) {
            return false
          }
        }
      }

      // Game type filter
      if (gameTypeFilter !== 'all') {
        const hasMatchingGameType = series.events.some(event => {
          const eventName = event.name.toLowerCase()
          switch (gameTypeFilter) {
            case 'plo':
              return eventName.includes('plo') || eventName.includes('omaha')
            case 'mixed':
              return eventName.includes('horse') || eventName.includes('8-game') || 
                     eventName.includes('mixed') || eventName.includes('h.o.r.s.e')
            case 'holdem':
            default:
              return !eventName.includes('plo') && !eventName.includes('omaha') && 
                     !eventName.includes('horse') && !eventName.includes('8-game') &&
                     !eventName.includes('mixed')
          }
        })
        if (!hasMatchingGameType) {
          return false
        }
      }

      return true
    })
  }, [groupedTournaments, selectedBrand, selectedMonth, selectedYear, searchQuery, buyInFilter, gameTypeFilter])

  const addEvent = (event: Tournament) => {
    if (!selectedEvents.find(e => e.id === event.id)) {
      setSelectedEvents([...selectedEvents, event])
      setShowCircuitPanel(true)
    }
  }

  const removeEvent = (eventId: string) => {
    setSelectedEvents(selectedEvents.filter(e => e.id !== eventId))
  }

  const toggleSeriesExpansion = (seriesId: string) => {
    const newExpanded = new Set(expandedSeries)
    if (newExpanded.has(seriesId)) {
      newExpanded.delete(seriesId)
    } else {
      newExpanded.add(seriesId)
    }
    setExpandedSeries(newExpanded)
  }

  const clearAllFilters = () => {
    setSelectedBrand('all')
    setSearchQuery('')
    setBuyInFilter('All')
    setGameTypeFilter('all')
  }

  // Handle month change - refetch data
  const handleMonthChange = (newMonth: number) => {
    setSelectedMonth(newMonth)
    refetch({
      startDate: new Date(selectedYear, newMonth, 1).toISOString().split('T')[0],
      endDate: new Date(selectedYear, newMonth + 1, 0).toISOString().split('T')[0]
    })
  }

  // Force refresh data
  const refreshData = () => {
    // Use the refresh function instead of refetch for force refresh
    refresh()
  }

  // Calculate circuit summary stats
  const totalBuyIn = selectedEvents.reduce((sum, e) => sum + e.buyIn, 0)
  const averageField = selectedEvents.length > 0 
    ? selectedEvents.reduce((sum, e) => sum + e.estimatedField, 0) / selectedEvents.length 
    : 0
  const estimatedTravel = selectedEvents.length * 800 // Mock travel cost
  const totalCost = totalBuyIn + estimatedTravel

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with brand tabs - CardPlayer style */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Poker Tournament Schedule</h1>
                <p className="text-slate-300 text-sm mt-1">
                  Find and build your perfect poker circuit
                </p>
              </div>
              <div className="text-right text-sm text-slate-300">
                <div>Schedule</div>
                <div className="text-xs text-slate-400">Showing {months[selectedMonth]} {selectedYear}</div>
              </div>
            </div>
            
            {/* Brand Filter Tabs */}
            <div className="flex space-x-1 mb-4 overflow-x-auto">
              {Object.entries(brandConfigs).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedBrand(key)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                    selectedBrand === key 
                      ? `${config.color} ${config.textColor} shadow-lg transform scale-105` 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {config.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by series, casino, or location..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              {/* Month/Year Filter */}
              <select 
                value={selectedMonth}
                onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {months.map((month, idx) => (
                  <option key={idx} value={idx}>{month} {selectedYear}</option>
                ))}
              </select>

              {/* Refresh Button */}
              <button
                onClick={refreshData}
                disabled={loading}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh tournament data"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>

              {/* Game Type Filter */}
              <select 
                value={gameTypeFilter}
                onChange={(e) => setGameTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {gameTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              {/* Buy-in Filter */}
              <select 
                value={buyInFilter}
                onChange={(e) => setBuyInFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {buyInBrackets.map((bracket) => (
                  <option key={bracket.label} value={bracket.label}>{bracket.label}</option>
                ))}
              </select>

              {/* Clear Filters */}
              {(selectedBrand !== 'all' || searchQuery || buyInFilter !== 'All' || gameTypeFilter !== 'all') && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Tournament Table */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              {/* Table Header - Desktop */}
              <div className="hidden md:grid md:grid-cols-6 bg-gray-50 border-b border-gray-200 px-6 py-3 text-sm font-medium text-gray-700">
                <div>Dates</div>
                <div className="col-span-2">Series/Event Name</div>
                <div>Casino</div>
                <div>Location</div>
                <div className="text-center">Select</div>
              </div>

              {/* Tournament Series List */}
              <div className="divide-y divide-gray-200">
                {loading ? (
                  <div className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading tournaments...</p>
                    {meta && (
                      <p className="text-xs text-gray-400 mt-2">
                        Last updated: {new Date(meta.lastUpdated).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : error ? (
                  <div className="px-6 py-12 text-center">
                    <div className="h-12 w-12 mx-auto mb-4 text-red-400">⚠️</div>
                    <p className="text-red-600 mb-2">Error loading tournaments</p>
                    <p className="text-sm text-gray-500 mb-4">{error}</p>
                    <button
                      onClick={refreshData}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredSeries.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No tournaments match your current filters.</p>
                    <button
                      onClick={clearAllFilters}
                      className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  filteredSeries.map((series) => (
                    <div key={series.id}>
                      {/* Series Header Row */}
                      <div className="px-6 py-4 hover:bg-gray-50 cursor-pointer">
                        <div className="md:grid md:grid-cols-6 md:items-center space-y-3 md:space-y-0">
                          {/* Dates */}
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400 md:hidden" />
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                {series.dateRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {series.dateRange.start.toDateString() !== series.dateRange.end.toDateString() && (
                                  <span> - {series.dateRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                )}
                              </div>
                              <div className="text-gray-500">
                                {series.dateRange.start.getFullYear()}
                              </div>
                            </div>
                          </div>

                          {/* Series Name */}
                          <div className="md:col-span-2">
                            <div className="flex items-center space-x-2">
                              <Building className="h-4 w-4 text-gray-400 md:hidden" />
                              <div>
                                <div className="font-semibold text-gray-900">{series.name}</div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    series.circuit.type === 'wsop' ? 'bg-yellow-100 text-yellow-800' :
                                    series.circuit.type === 'wpt' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {series.circuit.name}
                                  </span>
                                  {series.totalEvents > 1 && (
                                    <span className="text-xs text-gray-500">
                                      {series.totalEvents} events
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Casino */}
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4 text-gray-400 md:hidden" />
                            <div className="text-sm text-gray-900">{series.venue.name}</div>
                          </div>

                          {/* Location */}
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400 md:hidden" />
                            <div className="text-sm text-gray-500">{series.location}</div>
                          </div>

                          {/* Select Button */}
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => toggleSeriesExpansion(series.id)}
                              className="flex items-center space-x-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                            >
                              <span className="text-sm">
                                {expandedSeries.has(series.id) ? 'Hide' : 'View'} Events
                              </span>
                              <ChevronRight className={`h-4 w-4 transition-transform ${
                                expandedSeries.has(series.id) ? 'rotate-90' : ''
                              }`} />
                            </button>
                          </div>
                        </div>

                        {/* Buy-in Range - Mobile */}
                        <div className="mt-2 md:hidden flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>
                              ${series.buyInRange.min.toLocaleString()}
                              {series.buyInRange.min !== series.buyInRange.max && 
                                ` - $${series.buyInRange.max.toLocaleString()}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Events */}
                      <AnimatePresence>
                        {expandedSeries.has(series.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-gray-50 border-t border-gray-200"
                          >
                            <div className="px-6 py-4">
                              <div className="space-y-3">
                                {series.events.map((event) => {
                                  const isSelected = selectedEvents.some(e => e.id === event.id)
                                  return (
                                    <div
                                      key={event.id}
                                      className={`bg-white rounded-lg border p-4 transition-all ${
                                        isSelected 
                                          ? 'border-green-300 bg-green-50 ring-2 ring-green-200' 
                                          : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-start justify-between mb-2">
                                            <div>
                                              <h4 className="font-medium text-gray-900">{event.name}</h4>
                                              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                                <div className="flex items-center space-x-1">
                                                  <Calendar className="h-4 w-4" />
                                                  <span>
                                                    {event.startDate.toLocaleDateString()} - {event.endDate.toLocaleDateString()}
                                                  </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                  <DollarSign className="h-4 w-4" />
                                                  <span>${event.buyIn.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                  <Users className="h-4 w-4" />
                                                  <span>{event.estimatedField} players</span>
                                                </div>
                                                {event.prizeGuarantee && (
                                                  <div className="flex items-center space-x-1 text-green-600">
                                                    <Trophy className="h-4 w-4" />
                                                    <span>${event.prizeGuarantee.toLocaleString()} GTD</span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {/* Add to Circuit Button */}
                                        <button
                                          onClick={() => isSelected ? removeEvent(event.id) : addEvent(event)}
                                          className={`ml-4 px-4 py-2 rounded-lg font-medium transition-all ${
                                            isSelected
                                              ? 'bg-green-600 text-white hover:bg-green-700'
                                              : 'bg-blue-600 text-white hover:bg-blue-700'
                                          }`}
                                        >
                                          {isSelected ? (
                                            <div className="flex items-center space-x-2">
                                              <Check className="h-4 w-4" />
                                              <span>Added</span>
                                            </div>
                                          ) : (
                                            <div className="flex items-center space-x-2">
                                              <Plus className="h-4 w-4" />
                                              <span>Add to Circuit</span>
                                            </div>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Circuit Summary Sidebar */}
          <AnimatePresence>
            {selectedEvents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                className="lg:w-80"
              >
                <div className="bg-white rounded-lg shadow border border-gray-200 sticky top-24">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Your Circuit</h3>
                      <button
                        onClick={() => setSelectedEvents([])}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Circuit Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{selectedEvents.length}</div>
                        <div className="text-xs text-gray-600">Events</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">${totalBuyIn.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Total Buy-ins</div>
                      </div>
                    </div>

                    {/* Selected Events List */}
                    <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                      {selectedEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {event.name}
                            </div>
                            <div className="text-xs text-gray-600 flex items-center space-x-2">
                              <span>{event.startDate.toLocaleDateString()}</span>
                              <span>•</span>
                              <span>${event.buyIn.toLocaleString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeEvent(event.id)}
                            className="ml-2 p-1 text-gray-400 hover:text-red-600 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Circuit Summary */}
                    <div className="border-t border-gray-200 pt-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Buy-ins:</span>
                        <span className="font-medium text-gray-900">${totalBuyIn.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Est. Travel:</span>
                        <span className="font-medium text-gray-900">${estimatedTravel.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                        <span className="text-gray-600 font-medium">Total Cost:</span>
                        <span className="font-bold text-gray-900">${totalCost.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 mt-6">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                        <div className="flex items-center justify-center space-x-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>Optimize Circuit</span>
                        </div>
                      </button>
                      <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                        <div className="flex items-center justify-center space-x-2">
                          <Plane className="h-4 w-4" />
                          <span>Plan Travel</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Data Source Information */}
        {meta && (
          <div className="mt-8 bg-gray-50 rounded-lg p-4 border">
            <div className="text-sm text-gray-600">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Live Tournament Data</span>
                <span className="text-xs">Last updated: {new Date(meta.lastUpdated).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className={`p-2 rounded ${meta.sources.cardPlayer.error ? 'bg-red-100' : 'bg-green-100'}`}>
                  <div className="font-medium">CardPlayer</div>
                  <div>{meta.sources.cardPlayer.count} events</div>
                  {meta.sources.cardPlayer.error && (
                    <div className="text-red-600 text-[10px]">Error</div>
                  )}
                </div>
                <div className={`p-2 rounded ${meta.sources.wsop.error ? 'bg-red-100' : 'bg-green-100'}`}>
                  <div className="font-medium">WSOP Circuit</div>
                  <div>{meta.sources.wsop.count} events</div>
                  {meta.sources.wsop.error && (
                    <div className="text-red-600 text-[10px]">Error</div>
                  )}
                </div>
                <div className={`p-2 rounded ${meta.sources.wpt.error ? 'bg-red-100' : 'bg-green-100'}`}>
                  <div className="font-medium">WPT</div>
                  <div>{meta.sources.wpt.count} events</div>
                  {meta.sources.wpt.error && (
                    <div className="text-red-600 text-[10px]">Error</div>
                  )}
                </div>
                <div className={`p-2 rounded ${meta.sources.pokerAtlas.error ? 'bg-red-100' : 'bg-green-100'}`}>
                  <div className="font-medium">PokerAtlas</div>
                  <div>{meta.sources.pokerAtlas.count} events</div>
                  {meta.sources.pokerAtlas.error && (
                    <div className="text-red-600 text-[10px]">Error</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}