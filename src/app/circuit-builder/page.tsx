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
  FilterIcon,
  Sparkles,
  Calendar as CalendarIcon
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

// Brand configurations with enhanced colors
const brandConfigs = {
  'all': { 
    name: 'All Circuits', 
    color: 'bg-gradient-to-r from-slate-600 to-slate-700', 
    textColor: 'text-white',
    hoverColor: 'hover:from-slate-700 hover:to-slate-800'
  },
  'wsop': { 
    name: 'WSOP', 
    color: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500', 
    textColor: 'text-slate-900 font-bold',
    hoverColor: 'hover:from-yellow-500 hover:via-yellow-600 hover:to-amber-600'
  },
  'wpt': { 
    name: 'WPT', 
    color: 'bg-gradient-to-r from-red-500 via-red-600 to-red-700', 
    textColor: 'text-white font-bold',
    hoverColor: 'hover:from-red-600 hover:via-red-700 hover:to-red-800'
  },
  'wsop-circuit': { 
    name: 'WSOP Circuit', 
    color: 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500', 
    textColor: 'text-slate-900 font-bold',
    hoverColor: 'hover:from-amber-600 hover:via-orange-600 hover:to-yellow-600'
  },
  'regional': { 
    name: 'Regional', 
    color: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500', 
    textColor: 'text-white font-bold',
    hoverColor: 'hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600'
  }
}

// Buy-in brackets
const buyInBrackets = [
  { label: 'All Buy-ins', min: 0, max: 1000000 },
  { label: '$100-500', min: 100, max: 500 },
  { label: '$500-1K', min: 500, max: 1000 },
  { label: '$1K-5K', min: 1000, max: 5000 },
  { label: '$5K+', min: 5000, max: 1000000 }
]

// Game type options
const gameTypes = [
  { value: 'all', label: 'All Games' },
  { value: 'holdem', label: "Hold'em" },
  { value: 'plo', label: 'PLO' },
  { value: 'mixed', label: 'Mixed Games' }
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
  const [buyInFilter, setBuyInFilter] = useState('All Buy-ins')
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
  }, [tournaments])

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
      if (buyInFilter !== 'All Buy-ins') {
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
    setBuyInFilter('All Buy-ins')
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

  // Active filters count
  const activeFiltersCount = [
    selectedBrand !== 'all',
    searchQuery.length > 0,
    buyInFilter !== 'All Buy-ins',
    gameTypeFilter !== 'all'
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Enhanced Header with CardPlayer-style branding */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 shadow-2xl">
        <div className="absolute inset-0 bg-slate-900 opacity-50" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M20 20c0 0 8-8 8-8l8 8-8 8-8-8zM0 20c0 0 8-8 8-8l8 8-8 8-8-8z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div className="mb-4 lg:mb-0">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-lg">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                      Circuit Builder
                    </h1>
                    <p className="text-slate-300 text-lg">
                      Build your perfect poker tour with AI-powered optimization
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-white text-lg font-semibold">
                  {months[selectedMonth]} {selectedYear}
                </div>
                <div className="text-slate-400 text-sm mt-1">
                  {filteredSeries.length} tournament series found
                </div>
              </div>
            </div>
            
            {/* Enhanced Brand Filter Tabs */}
            <div className="flex flex-wrap gap-3 mb-6">
              {Object.entries(brandConfigs).map(([key, config]) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedBrand(key)}
                  className={`px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 shadow-lg ${
                    selectedBrand === key 
                      ? `${config.color} ${config.textColor} shadow-2xl ring-4 ring-white ring-opacity-30` 
                      : `bg-slate-700 text-slate-300 hover:bg-slate-600 ${config.hoverColor} hover:shadow-xl`
                  }`}
                >
                  {config.name}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-lg backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Enhanced Search Bar */}
            <div className="flex-1 lg:max-w-lg">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search series, casinos, or locations..."
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500 focus:ring-opacity-20 focus:border-primary-500 transition-all duration-200 text-lg placeholder-gray-400 bg-white shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Enhanced Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Month/Year Filter */}
              <div className="relative">
                <select 
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                  className="appearance-none border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium focus:ring-4 focus:ring-primary-500 focus:ring-opacity-20 focus:border-primary-500 bg-white shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {months.map((month, idx) => (
                    <option key={idx} value={idx}>{month} {selectedYear}</option>
                  ))}
                </select>
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refreshData}
                disabled={loading}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200 flex items-center space-x-2"
                title="Refresh tournament data"
              >
                <Sparkles className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Loading...' : 'Refresh'}</span>
              </motion.button>

              {/* Game Type Filter */}
              <select 
                value={gameTypeFilter}
                onChange={(e) => setGameTypeFilter(e.target.value)}
                className="border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-primary-500 focus:ring-opacity-20 focus:border-primary-500 bg-white shadow-sm cursor-pointer"
              >
                {gameTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              {/* Buy-in Filter */}
              <select 
                value={buyInFilter}
                onChange={(e) => setBuyInFilter(e.target.value)}
                className="border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-primary-500 focus:ring-opacity-20 focus:border-primary-500 bg-white shadow-sm cursor-pointer"
              >
                {buyInBrackets.map((bracket) => (
                  <option key={bracket.label} value={bracket.label}>{bracket.label}</option>
                ))}
              </select>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearAllFilters}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                  <span>Clear Filters ({activeFiltersCount})</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Main Tournament Table */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Enhanced Table Header */}
              <div className="hidden md:grid md:grid-cols-6 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200 px-8 py-5 text-sm font-bold text-gray-700 uppercase tracking-wide">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Dates</span>
                </div>
                <div className="col-span-2 flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-gray-500" />
                  <span>Tournament Series</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span>Venue</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>Location</span>
                </div>
                <div className="text-center">
                  <span>Action</span>
                </div>
              </div>

              {/* Enhanced Tournament Series List */}
              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="px-8 py-16 text-center">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-6"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-8 w-8 bg-primary-600 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-lg font-medium">Loading tournament data...</p>
                    {meta && (
                      <p className="text-xs text-gray-400 mt-3">
                        Last updated: {new Date(meta.lastUpdated).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : error ? (
                  <div className="px-8 py-16 text-center">
                    <div className="h-16 w-16 mx-auto mb-6 text-red-400 text-6xl">⚠️</div>
                    <p className="text-red-600 text-lg font-semibold mb-2">Error loading tournaments</p>
                    <p className="text-sm text-gray-500 mb-6">{error}</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={refreshData}
                      className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl hover:from-primary-700 hover:to-primary-800 font-semibold shadow-lg transition-all duration-200"
                    >
                      Try Again
                    </motion.button>
                  </div>
                ) : filteredSeries.length === 0 ? (
                  <div className="px-8 py-16 text-center">
                    <Trophy className="h-16 w-16 mx-auto mb-6 text-gray-300" />
                    <p className="text-gray-600 text-lg font-medium mb-2">No tournaments found</p>
                    <p className="text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearAllFilters}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 font-semibold shadow-lg transition-all duration-200"
                    >
                      Clear All Filters
                    </motion.button>
                  </div>
                ) : (
                  filteredSeries.map((series, index) => (
                    <motion.div 
                      key={series.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {/* Enhanced Series Header Row */}
                      <div className="px-8 py-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 cursor-pointer transition-all duration-300 group">
                        <div className="md:grid md:grid-cols-6 md:items-center space-y-4 md:space-y-0">
                          {/* Enhanced Dates */}
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-colors">
                              <Calendar className="h-5 w-5 text-primary-600" />
                            </div>
                            <div className="text-sm">
                              <div className="font-bold text-gray-900 text-base">
                                {series.dateRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {series.dateRange.start.toDateString() !== series.dateRange.end.toDateString() && (
                                  <span className="text-gray-500"> → {series.dateRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                )}
                              </div>
                              <div className="text-gray-500 font-medium">
                                {series.dateRange.start.getFullYear()}
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Series Name */}
                          <div className="md:col-span-2">
                            <div className="flex items-start space-x-4">
                              <div className="flex-1">
                                <div className="font-bold text-gray-900 text-lg mb-2 group-hover:text-primary-700 transition-colors">
                                  {series.name}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                                    series.circuit.type === 'wsop' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200' :
                                    series.circuit.type === 'wpt' ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200' :
                                    'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
                                  }`}>
                                    {series.circuit.name}
                                  </span>
                                  {series.totalEvents > 1 && (
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold border border-gray-200">
                                      {series.totalEvents} events
                                    </span>
                                  )}
                                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold border border-green-200">
                                    ${series.buyInRange.min.toLocaleString()}
                                    {series.buyInRange.min !== series.buyInRange.max && 
                                      ` - $${series.buyInRange.max.toLocaleString()}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Casino */}
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-colors">
                              <Building className="h-5 w-5 text-slate-600" />
                            </div>
                            <div className="text-sm font-semibold text-gray-900">{series.venue.name}</div>
                          </div>

                          {/* Enhanced Location */}
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                              <MapPin className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="text-sm font-medium text-gray-700">{series.location}</div>
                          </div>

                          {/* Enhanced Select Button */}
                          <div className="flex items-center justify-center">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toggleSeriesExpansion(series.id)}
                              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-sm"
                            >
                              <span>
                                {expandedSeries.has(series.id) ? 'Hide Events' : 'View Events'}
                              </span>
                              <ChevronRight className={`h-5 w-5 transition-transform duration-300 ${
                                expandedSeries.has(series.id) ? 'rotate-90' : ''
                              }`} />
                            </motion.button>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Expanded Events */}
                      <AnimatePresence>
                        {expandedSeries.has(series.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50 border-t border-gray-200"
                          >
                            <div className="px-8 py-6">
                              <div className="grid gap-4 md:gap-6">
                                {series.events.map((event, eventIndex) => {
                                  const isSelected = selectedEvents.some(e => e.id === event.id)
                                  return (
                                    <motion.div
                                      key={event.id}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: eventIndex * 0.1 }}
                                      className={`bg-white rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-xl ${
                                        isSelected 
                                          ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 ring-4 ring-green-100 shadow-lg' 
                                          : 'border-gray-200 hover:border-primary-300 hover:shadow-lg'
                                      }`}
                                    >
                                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        <div className="flex-1">
                                          <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                              <h4 className="font-bold text-gray-900 text-xl mb-3">{event.name}</h4>
                                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-xl">
                                                  <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                                  <div>
                                                    <div className="font-semibold text-blue-900">Dates</div>
                                                    <div className="text-blue-700">
                                                      {event.startDate.toLocaleDateString()} - {event.endDate.toLocaleDateString()}
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-xl">
                                                  <DollarSign className="h-5 w-5 text-green-600 flex-shrink-0" />
                                                  <div>
                                                    <div className="font-semibold text-green-900">Buy-in</div>
                                                    <div className="text-green-700 font-bold">${event.buyIn.toLocaleString()}</div>
                                                  </div>
                                                </div>
                                                <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-xl">
                                                  <Users className="h-5 w-5 text-purple-600 flex-shrink-0" />
                                                  <div>
                                                    <div className="font-semibold text-purple-900">Field</div>
                                                    <div className="text-purple-700 font-bold">{event.estimatedField} players</div>
                                                  </div>
                                                </div>
                                                {event.prizeGuarantee && (
                                                  <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-xl">
                                                    <Trophy className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                                                    <div>
                                                      <div className="font-semibold text-yellow-900">Guarantee</div>
                                                      <div className="text-yellow-700 font-bold">${event.prizeGuarantee.toLocaleString()}</div>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {/* Enhanced Add to Circuit Button */}
                                        <div className="flex-shrink-0">
                                          <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => isSelected ? removeEvent(event.id) : addEvent(event)}
                                            className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl text-lg ${
                                              isSelected
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                                                : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700'
                                            }`}
                                          >
                                            {isSelected ? (
                                              <div className="flex items-center space-x-3">
                                                <Check className="h-5 w-5" />
                                                <span>Added to Circuit</span>
                                              </div>
                                            ) : (
                                              <div className="flex items-center space-x-3">
                                                <Plus className="h-5 w-5" />
                                                <span>Add to Circuit</span>
                                              </div>
                                            )}
                                          </motion.button>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Circuit Summary Sidebar */}
          <AnimatePresence>
            {selectedEvents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
                className="lg:w-96"
              >
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 sticky top-24 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                          <Target className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Your Circuit</h3>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedEvents([])}
                        className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all"
                      >
                        <X className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="p-8">
                    {/* Enhanced Circuit Stats */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                        <div className="text-3xl font-bold text-blue-900 mb-2">{selectedEvents.length}</div>
                        <div className="text-sm font-semibold text-blue-700">Events Selected</div>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                        <div className="text-3xl font-bold text-green-900 mb-2">${totalBuyIn.toLocaleString()}</div>
                        <div className="text-sm font-semibold text-green-700">Total Buy-ins</div>
                      </div>
                    </div>

                    {/* Enhanced Selected Events List */}
                    <div className="space-y-4 mb-8 max-h-80 overflow-y-auto custom-scrollbar">
                      {selectedEvents.map((event, index) => (
                        <motion.div 
                          key={event.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-200 hover:shadow-md transition-all group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-gray-900 truncate mb-1">
                              {event.name}
                            </div>
                            <div className="flex items-center space-x-3 text-xs text-gray-600">
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{event.startDate.toLocaleDateString()}</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center space-x-1 font-semibold text-green-600">
                                <DollarSign className="h-3 w-3" />
                                <span>${event.buyIn.toLocaleString()}</span>
                              </span>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeEvent(event.id)}
                            className="ml-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          >
                            <X className="h-4 w-4" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>

                    {/* Enhanced Circuit Summary */}
                    <div className="border-t-2 border-gray-100 pt-6 space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 font-medium">Total Buy-ins:</span>
                        <span className="font-bold text-gray-900 text-lg">${totalBuyIn.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 font-medium">Est. Travel:</span>
                        <span className="font-bold text-gray-900 text-lg">${estimatedTravel.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-base border-t-2 border-gray-200 pt-4">
                        <span className="text-gray-800 font-bold">Total Investment:</span>
                        <span className="font-black text-primary-600 text-xl">${totalCost.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div className="space-y-4 mt-8">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-4 px-6 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
                      >
                        <div className="flex items-center justify-center space-x-3">
                          <TrendingUp className="h-5 w-5" />
                          <span>Optimize Circuit</span>
                        </div>
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 px-6 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
                      >
                        <div className="flex items-center justify-center space-x-3">
                          <Plane className="h-5 w-5" />
                          <span>Plan Travel</span>
                        </div>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Enhanced Data Source Information */}
        {meta && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-white rounded-3xl p-8 border border-gray-200 shadow-lg"
          >
            <div className="text-sm text-gray-600">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <Sparkles className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="font-bold text-lg text-gray-900">Live Tournament Data</span>
                </div>
                <span className="text-xs bg-gray-100 px-3 py-2 rounded-full font-medium">
                  Last updated: {new Date(meta.lastUpdated).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className={`p-4 rounded-2xl border-2 transition-all ${meta.sources.cardPlayer.error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="font-bold text-gray-900 mb-1">CardPlayer</div>
                  <div className="text-gray-700 font-semibold">{meta.sources.cardPlayer.count} events</div>
                  {meta.sources.cardPlayer.error && (
                    <div className="text-red-600 text-[10px] mt-1 font-medium">Error</div>
                  )}
                </div>
                <div className={`p-4 rounded-2xl border-2 transition-all ${meta.sources.wsop.error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="font-bold text-gray-900 mb-1">WSOP Circuit</div>
                  <div className="text-gray-700 font-semibold">{meta.sources.wsop.count} events</div>
                  {meta.sources.wsop.error && (
                    <div className="text-red-600 text-[10px] mt-1 font-medium">Error</div>
                  )}
                </div>
                <div className={`p-4 rounded-2xl border-2 transition-all ${meta.sources.wpt.error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="font-bold text-gray-900 mb-1">WPT</div>
                  <div className="text-gray-700 font-semibold">{meta.sources.wpt.count} events</div>
                  {meta.sources.wpt.error && (
                    <div className="text-red-600 text-[10px] mt-1 font-medium">Error</div>
                  )}
                </div>
                <div className={`p-4 rounded-2xl border-2 transition-all ${meta.sources.pokerAtlas.error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="font-bold text-gray-900 mb-1">PokerAtlas</div>
                  <div className="text-gray-700 font-semibold">{meta.sources.pokerAtlas.count} events</div>
                  {meta.sources.pokerAtlas.error && (
                    <div className="text-red-600 text-[10px] mt-1 font-medium">Error</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}