'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Plane, 
  Car, 
  Hotel,
  Target,
  Zap,
  BarChart3,
  Settings,
  Bell
} from 'lucide-react'
import { DashboardStats } from '@/types'
import AnalyticsSummary from '@/components/analytics-summary'

// Mock data for demo
const mockStats: DashboardStats = {
  upcomingTournaments: 8,
  totalBudget: 25000,
  potentialSavings: 4250,
  milesThisMonth: 1850,
  roi: 23.5,
  tournamentsPlayed: 47
}

const upcomingTournaments = [
  {
    id: '1',
    name: 'WSOP Circuit Main Event',
    location: 'Las Vegas, NV',
    date: '2024-02-15',
    buyIn: 1700,
    field: 850,
    optimized: true
  },
  {
    id: '2', 
    name: 'WPT Bay 101 Shooting Star',
    location: 'San Jose, CA',
    date: '2024-02-22',
    buyIn: 3500,
    field: 320,
    optimized: false
  },
  {
    id: '3',
    name: 'Mid-States Poker Tour',
    location: 'Chicago, IL', 
    date: '2024-03-01',
    buyIn: 1100,
    field: 450,
    optimized: true
  }
]

const quickActions = [
  { icon: Target, label: 'Quick Optimize', color: 'bg-primary-500', href: '/optimize' },
  { icon: Calendar, label: 'Build Circuit', color: 'bg-poker-500', href: '/circuit-builder' },
  { icon: Users, label: 'Find Roommates', color: 'bg-green-500', href: '/coordination' },
  { icon: DollarSign, label: 'Track Expenses', color: 'bg-green-500', href: '/expenses' },
  { icon: TrendingUp, label: 'Bankroll Manager', color: 'bg-blue-600', href: '/bankroll' },
  { icon: BarChart3, label: 'Analytics', color: 'bg-purple-500', href: '/analytics' }
]

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Circuit Coordinator</span>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
              <a href="/circuit-builder" className="text-gray-500 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Circuits</a>
              <a href="/coordination" className="text-gray-500 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Travel</a>
              <a href="/expenses" className="text-gray-500 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Expenses</a>
              <a href="/bankroll" className="text-gray-500 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Bankroll</a>
              <a href="/analytics" className="text-gray-500 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Analytics</a>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
              </button>
              <button className="text-gray-400 hover:text-gray-500">
                <Settings className="h-6 w-6" />
              </button>
              <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, Alex! 👋
          </h1>
          <p className="text-gray-600">
            Your optimized travel schedule could save you <span className="font-semibold text-green-600">${mockStats.potentialSavings.toLocaleString()}</span> this circuit season.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
          {quickActions.map((action, index) => (
            <motion.a
              key={action.label}
              href={action.href}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="block p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex items-center justify-center p-2 ${action.color} rounded-lg mb-3`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-medium text-gray-900">{action.label}</h3>
            </motion.a>
          ))}
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8"
        >
          <StatCard
            title="Upcoming Events"
            value={mockStats.upcomingTournaments}
            icon={Calendar}
            color="text-blue-600"
          />
          <StatCard
            title="Travel Budget"
            value={`$${(mockStats.totalBudget / 1000).toFixed(0)}k`}
            icon={DollarSign}
            color="text-green-600"
          />
          <StatCard
            title="Potential Savings"
            value={`$${(mockStats.potentialSavings / 1000).toFixed(1)}k`}
            icon={TrendingUp}
            color="text-emerald-600"
          />
          <StatCard
            title="Miles This Month"
            value={mockStats.milesThisMonth.toLocaleString()}
            icon={Plane}
            color="text-indigo-600"
          />
          <StatCard
            title="Circuit ROI"
            value={`${mockStats.roi}%`}
            icon={BarChart3}
            color="text-purple-600"
          />
          <StatCard
            title="Events Played"
            value={mockStats.tournamentsPlayed}
            icon={Target}
            color="text-orange-600"
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Tournaments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2 card"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Tournaments</h2>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {upcomingTournaments.map((tournament, index) => (
                <motion.div
                  key={tournament.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${tournament.optimized ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <div>
                      <h3 className="font-medium text-gray-900">{tournament.name}</h3>
                      <p className="text-sm text-gray-500">{tournament.location} • {new Date(tournament.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${tournament.buyIn.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{tournament.field} players</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-primary-50 rounded-lg">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-primary-600 mr-2" />
                <span className="text-sm font-medium text-primary-900">AI Optimization Available</span>
              </div>
              <p className="text-sm text-primary-700 mt-1">
                We found 3 route optimizations that could save you $1,850 in travel costs.
              </p>
              <button className="mt-3 btn-primary">
                Optimize Now
              </button>
            </div>
          </motion.div>

          {/* Right Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Travel Overview */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Travel Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Plane className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Flights booked</span>
                  </div>
                  <span className="text-sm font-medium">3 of 8</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Hotel className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Hotels reserved</span>
                  </div>
                  <span className="text-sm font-medium">5 of 8</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Ground transport</span>
                  </div>
                  <span className="text-sm font-medium">2 of 6</span>
                </div>
              </div>
            </div>

            {/* Group Coordination */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Group Coordination</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-green-900">WSOP Circuit Vegas</span>
                    <span className="text-xs text-green-700">3 players</span>
                  </div>
                  <p className="text-xs text-green-700">Room sharing confirmed</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-yellow-900">WPT Bay 101</span>
                    <span className="text-xs text-yellow-700">Looking</span>
                  </div>
                  <p className="text-xs text-yellow-700">Seeking roommates</p>
                </div>
              </div>
              <button className="w-full mt-4 btn-secondary">
                Find Coordination
              </button>
            </div>

            {/* Analytics Summary */}
            <AnalyticsSummary playerId="player-1" />

            {/* Local Intelligence */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Local Tips</h3>
              <div className="space-y-2">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Las Vegas, NV</p>
                  <p className="text-gray-600">Free parking at Orleans. Avoid ride-shares during conventions.</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">San Jose, CA</p>
                  <p className="text-gray-600">Hotel block available until 2/15. Downtown dining expensive.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color: string
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
  )
}