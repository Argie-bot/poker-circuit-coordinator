'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  MapPin,
  Calendar,
  Award,
  PieChart,
  LineChart,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  Brain,
  Zap,
  Bot,
  TrendingUpIcon,
  Star
} from 'lucide-react'
import { Player, PlayerStatistics, Tournament } from '@/types'
import { analyticsService, TournamentRecommendation, CircuitPerformance, MonthlyPerformance, VenuePerformance, TravelAnalytics, BankrollAnalytics, OptimizationInsight } from '@/services/analytics-service'
import { tournamentDataService } from '@/services/tournament-data-service'

// Enhanced analytics interface
interface EnhancedAnalytics {
  summary: PlayerStatistics;
  monthlyPerformance: MonthlyPerformance[];
  circuitPerformance: CircuitPerformance[];
  venuePerformance: VenuePerformance[];
  travelAnalytics: TravelAnalytics;
  bankrollAnalytics: BankrollAnalytics;
  insights: OptimizationInsight[];
  recommendations?: TournamentRecommendation[];
  roiOptimization?: any;
  circuitComparison?: any;
}

// Mock player ID - in real app this would come from authentication
const PLAYER_ID = 'player-1';
export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<'6m' | '1y' | 'all'>('6m')
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'travel' | 'bankroll' | 'recommendations'>('overview')
  const [analytics, setAnalytics] = useState<EnhancedAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData()
  }, [timeframe])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Create date filter based on timeframe
      const endDate = new Date()
      const startDate = new Date()
      
      switch (timeframe) {
        case '6m':
          startDate.setMonth(endDate.getMonth() - 6)
          break
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
        case 'all':
          startDate.setFullYear(2020) // Arbitrary early date
          break
      }

      const filter = { dateRange: { start: startDate, end: endDate } }
      
      // Load analytics data
      const [playerAnalytics, recommendations, roiOptimization] = await Promise.all([
        analyticsService.getPlayerAnalytics(PLAYER_ID, filter),
        analyticsService.getTournamentRecommendations(PLAYER_ID),
        analyticsService.getROIOptimization(PLAYER_ID)
      ])

      setAnalytics({
        ...playerAnalytics,
        recommendations: recommendations.slice(0, 10), // Top 10 recommendations
        roiOptimization
      })
    } catch (error) {
      console.error('Failed to load analytics data:', error)
      // Fall back to mock data for development
      setAnalytics(getMockAnalytics())
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAnalyticsData()
    setRefreshing(false)
  }

  // Calculate key metrics
  const totalBuyIns = analytics?.monthlyPerformance.reduce((sum, month) => sum + month.buyIns, 0) || 0
  const totalWinnings = analytics?.monthlyPerformance.reduce((sum, month) => sum + month.winnings, 0) || 0
  const totalProfit = totalWinnings - totalBuyIns
  const totalTravelExpenses = analytics?.travelAnalytics.monthlyExpenses.reduce((sum, month) => sum + month.total, 0) || 0
  const netProfit = totalProfit - totalTravelExpenses

  const bestMonth = analytics?.monthlyPerformance.reduce((best, month) => 
    month.profit > best.profit ? month : best
  )

  const bestCircuit = analytics?.circuitPerformance.reduce((best, circuit) => 
    circuit.roi > best.roi ? circuit : best
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Failed to load analytics data</p>
          <button onClick={loadAnalyticsData} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your ROI, identify profitable patterns, and optimize your circuit strategy</p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={timeframe} 
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="input"
              >
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
                <option value="all">All Time</option>
              </select>
              
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-secondary flex items-center"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              
              <button className="btn-secondary">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="btn-primary"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'performance', label: 'Performance', icon: Target },
                { id: 'recommendations', label: 'AI Recommendations', icon: Brain },
                { id: 'travel', label: 'Travel Analysis', icon: MapPin },
                { id: 'bankroll', label: 'Bankroll', icon: DollarSign }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-3 py-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Tournament ROI"
                value={`${analytics.summary.roi.toFixed(1)}%`}
                change="+5.2%"
                positive={analytics.summary.roi > 0}
                icon={TrendingUp}
              />
              <MetricCard
                title="Net Profit"
                value={`$${netProfit.toLocaleString()}`}
                change={netProfit > 0 ? `+$${Math.abs(netProfit).toLocaleString()}` : `-$${Math.abs(netProfit).toLocaleString()}`}
                positive={netProfit > 0}
                icon={DollarSign}
              />
              <MetricCard
                title="ITM Rate"
                value={`${analytics.summary.itm.toFixed(1)}%`}
                change="+3.1%"
                positive={true}
                icon={Target}
              />
              <MetricCard
                title="Avg Buy-in"
                value={`$${analytics.summary.averageBuyIn.toLocaleString()}`}
                change={`${analytics.summary.averageBuyIn > 1000 ? '+' : '-'}$150`}
                positive={analytics.summary.averageBuyIn <= 1500} // Lower buy-ins might indicate better bankroll management
                icon={Award}
              />
            </div>

            {/* Monthly Performance Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">Monthly Performance</h3>
                  <select className="text-sm border rounded px-2 py-1">
                    <option>Profit</option>
                    <option>ROI</option>
                    <option>ITM Rate</option>
                  </select>
                </div>
                <div className="space-y-3">
                  {analytics.monthlyPerformance.slice(0, 6).map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{month.month}</span>
                      <div className="flex items-center space-x-4">
                        <span className={`text-sm font-medium ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${month.profit.toLocaleString()}
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${month.profit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(100, Math.abs(month.profit) / 10000 * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Circuit Performance */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Circuit Performance</h3>
                <div className="space-y-3">
                  {analytics.circuitPerformance.slice(0, 5).map((circuit, index) => (
                    <div key={circuit.circuit} className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{circuit.circuit}</span>
                        <p className="text-xs text-gray-500">{circuit.events} events</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${circuit.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {circuit.roi.toFixed(1)}% ROI
                        </span>
                        <p className="text-xs text-gray-500">${circuit.winnings.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Insights and Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-blue-500" />
                  Key Insights
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900">🎯 Best Performance</p>
                    <p className="text-sm text-green-700">
                      {bestCircuit ? `${bestCircuit.circuit} shows your highest ROI at ${bestCircuit.roi}%` : 'No circuit data available yet'}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">📈 Profitable Trend</p>
                    <p className="text-sm text-blue-700">
                      Your last 3 months show consistent profitability
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900">💰 Cost Optimization</p>
                    <p className="text-sm text-yellow-700">
                      Travel expenses represent 18% of total costs
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
                  Recommendations
                </h3>
                <div className="space-y-3">
                  <div className="p-3 border-l-4 border-primary-500 bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">Focus on WSOP Circuit</p>
                    <p className="text-sm text-gray-600">
                      Your best ROI circuit. Consider allocating more bankroll here.
                    </p>
                  </div>
                  <div className="p-3 border-l-4 border-green-500 bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">Las Vegas Hub Strategy</p>
                    <p className="text-sm text-gray-600">
                      Orleans Casino shows strong results. Use as base for multiple events.
                    </p>
                  </div>
                  <div className="p-3 border-l-4 border-orange-500 bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">Review Regional Events</p>
                    <p className="text-sm text-gray-600">
                      -6% ROI suggests reconsidering smaller regional tournaments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Recent Tournaments */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Tournament Results</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Tournament</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Date</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Buy-in</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Field</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Finish</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Prize</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.monthlyPerformance.slice(0, 5).map((month) => (
                      <tr key={month.month} className="border-b">
                        <td className="py-3">
                          <div>
                            <p className="text-sm font-medium">{month.month}</p>
                            <p className="text-xs text-gray-500">{month.tournamentsPlayed} events played</p>
                          </div>
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          ${month.buyIns.toLocaleString()}
                        </td>
                        <td className="py-3 text-sm font-medium">
                          ${month.winnings.toLocaleString()}
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {month.tournamentsPlayed}
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          -
                        </td>
                        <td className="py-3 text-sm font-medium">
                          ${month.winnings.toLocaleString()}
                        </td>
                        <td className="py-3">
                          <span className={`text-sm font-medium ${
                            month.profit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {month.profit >= 0 ? '+' : ''}${month.profit.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Venue Analysis */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Venue Performance Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analytics.venuePerformance.map((venue) => (
                  <div key={venue.venue} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{venue.venue}</h4>
                        <p className="text-sm text-gray-600">{venue.city}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        venue.roi >= 20 ? 'bg-green-100 text-green-800' :
                        venue.roi >= 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {venue.roi}% ROI
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Events:</span>
                        <span className="ml-1 font-medium">{venue.events}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Winnings:</span>
                        <span className="ml-1 font-medium">${venue.winnings.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Avg Buy-in:</span>
                        <span className="ml-1 font-medium">${venue.averageBuyIn.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Tournament Recommendations */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Bot className="h-5 w-5 mr-2 text-blue-500" />
                  AI Tournament Recommendations
                </h3>
                <button className="btn-secondary text-sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Update
                </button>
              </div>
              
              {analytics.recommendations && analytics.recommendations.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recommendations.slice(0, 5).map((rec) => (
                    <TournamentRecommendationCard key={rec.tournament.id} recommendation={rec} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tournament recommendations available</p>
                  <p className="text-sm">Try refreshing or check back later</p>
                </div>
              )}
            </div>

            {/* ROI Optimization */}
            {analytics.roiOptimization && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUpIcon className="h-5 w-5 mr-2 text-green-500" />
                    ROI Optimization
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Current ROI</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {analytics.roiOptimization.currentROI.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Potential ROI</p>
                          <p className="text-2xl font-bold text-green-600">
                            {analytics.roiOptimization.potentialROI.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {analytics.roiOptimization.optimizationSteps.map((step: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-medium text-gray-900">{step.action}</h4>
                            <span className="text-sm font-medium text-green-600">
                              +{step.impact.toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">{step.description}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              step.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                              step.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {step.difficulty} to implement
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-500" />
                    Smart Insights
                  </h3>
                  <div className="space-y-3">
                    {analytics.insights.slice(0, 4).map((insight, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        insight.priority === 'high' ? 'border-red-500 bg-red-50' :
                        insight.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                            insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {insight.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                        <p className="text-xs font-medium text-gray-800">{insight.recommendation}</p>
                        {insight.potentialSavings && (
                          <p className="text-xs text-green-600 mt-1">
                            💰 Potential savings: ${insight.potentialSavings.toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Circuit Comparison */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
                Circuit Performance Comparison
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analytics.circuitPerformance.slice(0, 3).map((circuit) => (
                  <div key={circuit.circuit} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">{circuit.circuit}</h4>
                      <span className={`text-sm px-2 py-1 rounded ${
                        circuit.profitabilityTrend === 'improving' ? 'bg-green-100 text-green-800' :
                        circuit.profitabilityTrend === 'declining' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {circuit.profitabilityTrend}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">ROI:</span>
                        <span className={`ml-1 font-medium ${circuit.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {circuit.roi.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Events:</span>
                        <span className="ml-1 font-medium">{circuit.events}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">ITM:</span>
                        <span className="ml-1 font-medium">{circuit.itmRate.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Best:</span>
                        <span className="ml-1 font-medium">{circuit.bestFinish}{getOrdinalSuffix(circuit.bestFinish)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Travel Analysis Tab */}
        {activeTab === 'travel' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Travel Expense Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">6-Month Travel Expenses</h3>
                <div className="space-y-4">
                  {analytics.travelAnalytics.monthlyExpenses.slice(0, 6).map((month) => (
                    <div key={month.month} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                        <span className="font-medium">${month.total.toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 h-2 bg-gray-100 rounded">
                        <div className="bg-blue-500 rounded-l" style={{ width: `${(month.flights / month.total) * 100}%` }}></div>
                        <div className="bg-green-500" style={{ width: `${(month.hotels / month.total) * 100}%` }}></div>
                        <div className="bg-yellow-500" style={{ width: `${(month.food / month.total) * 100}%` }}></div>
                        <div className="bg-purple-500 rounded-r" style={{ width: `${(month.ground / month.total) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-4 gap-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded"></div>
                      <span>Flights</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded"></div>
                      <span>Hotels</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded"></div>
                      <span>Food</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded"></div>
                      <span>Ground</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Travel Efficiency Metrics</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Cost per Tournament</span>
                      <span className="font-semibold">${analytics.travelAnalytics.costPerTournament}</span>
                    </div>
                    <div className="text-xs text-gray-500">Average across all events</div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Travel ROI Impact</span>
                      <span className="font-semibold text-orange-600">{analytics.travelAnalytics.travelRoiImpact.toFixed(1)}%</span>
                    </div>
                    <div className="text-xs text-gray-500">Reduction in overall ROI due to travel costs</div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Optimization Potential</span>
                      <span className="font-semibold text-green-600">${analytics.travelAnalytics.optimizationPotential.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-500">Potential annual savings with route optimization</div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-green-700">Best Travel Month</span>
                      <span className="font-semibold text-green-800">{bestMonth?.month || 'N/A'}</span>
                    </div>
                    <div className="text-xs text-green-600">Lowest cost per tournament ratio</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Recommendations */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Travel Optimization Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Circuit Routing</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Plan multi-stop trips to reduce total flight costs by up to 40%.
                  </p>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View Route Optimizer →
                  </button>
                </div>

                <div className="p-4 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Group Bookings</h4>
                  <p className="text-sm text-green-700 mb-3">
                    Coordinate with other players for group hotel rates and shared transportation.
                  </p>
                  <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                    Find Coordination →
                  </button>
                </div>

                <div className="p-4 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Loyalty Programs</h4>
                  <p className="text-sm text-purple-700 mb-3">
                    Maximize airline and hotel loyalty benefits for frequent travel.
                  </p>
                  <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                    Setup Tracking →
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bankroll Tab */}
        {activeTab === 'bankroll' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Current Bankroll Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 card">
                <h3 className="font-semibold text-gray-900 mb-4">Bankroll History</h3>
                <div className="space-y-3">
                  {analytics.bankrollAnalytics.history.map((entry, index) => (
                    <div key={entry.date.toISOString()} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium">${entry.amount.toLocaleString()}</span>
                        {index > 0 && (
                          <span className={`text-sm ${
                            entry.amount > analytics.bankrollAnalytics.history[index - 1].amount 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {entry.amount > analytics.bankrollAnalytics.history[index - 1].amount ? '+' : ''}
                            {((entry.amount - analytics.bankrollAnalytics.history[index - 1].amount) / 1000).toFixed(1)}k
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Current Allocation</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Tournament BR</span>
                      <span className="text-sm font-medium">${analytics.bankrollAnalytics.currentAllocation.tournamentBR.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(analytics.bankrollAnalytics.currentAllocation.tournamentBR / analytics.bankrollAnalytics.currentAllocation.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Cash Game BR</span>
                      <span className="text-sm font-medium">${analytics.bankrollAnalytics.currentAllocation.cashGameBR.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(analytics.bankrollAnalytics.currentAllocation.cashGameBR / analytics.bankrollAnalytics.currentAllocation.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Expense Fund</span>
                      <span className="text-sm font-medium">${analytics.bankrollAnalytics.currentAllocation.expenseFund.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${(analytics.bankrollAnalytics.currentAllocation.expenseFund / analytics.bankrollAnalytics.currentAllocation.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bankroll Management Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  Risk Assessment
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900">✅ Adequate Bankroll</p>
                    <p className="text-sm text-green-700">
                      Your tournament BR supports your average buy-in level (40x rule met)
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900">✅ Expense Buffer</p>
                    <p className="text-sm text-green-700">
                      Travel expense fund covers 6+ months of circuit play
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900">⚠️ High-Stakes Exposure</p>
                    <p className="text-sm text-yellow-700">
                      Consider limiting $3,500+ events to 2% of tournament BR
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Recommended Actions</h3>
                <div className="space-y-3">
                  <div className="p-3 border-l-4 border-blue-500 bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">Rebalance Allocation</p>
                    <p className="text-sm text-gray-600">
                      Consider moving $5k from cash to tournament BR for circuit expansion
                    </p>
                  </div>
                  <div className="p-3 border-l-4 border-green-500 bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">Set Stop Loss</p>
                    <p className="text-sm text-gray-600">
                      Implement 20% drawdown limit with automatic budget reduction
                    </p>
                  </div>
                  <div className="p-3 border-l-4 border-purple-500 bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">Tax Planning</p>
                    <p className="text-sm text-gray-600">
                      Set aside 25% of winnings for tax obligations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}

function MetricCard({ title, value, change, positive, icon: Icon }: {
  title: string
  value: string
  change: string
  positive: boolean
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center mt-1">
            {positive ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </span>
          </div>
        </div>
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
    </div>
  )
}

function getOrdinalSuffix(num: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = num % 100
  return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]
}

// Tournament recommendation card component
function TournamentRecommendationCard({ recommendation }: { recommendation: TournamentRecommendation }) {
  const { tournament, score, factors, reasoning, expectedRoi, confidenceLevel } = recommendation
  
  const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
  const confidenceColor = confidenceLevel === 'high' ? 'bg-green-100 text-green-800' :
                          confidenceLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{tournament.name}</h4>
          <p className="text-sm text-gray-600">
            {tournament.venue.name}, {tournament.venue.address.city} • {tournament.startDate.toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500">
            ${tournament.buyIn.toLocaleString()} • {tournament.estimatedField} players
          </p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${scoreColor}`}>
            {Math.round(score)}
          </div>
          <div className="text-xs text-gray-500">AI Score</div>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">Expected ROI:</span>
          <span className={`text-sm font-medium ${expectedRoi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {expectedRoi.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Confidence:</span>
          <span className={`text-xs px-2 py-1 rounded-full ${confidenceColor}`}>
            {confidenceLevel}
          </span>
        </div>
      </div>

      {reasoning.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-1">Why this is recommended:</p>
          <ul className="space-y-1">
            {reasoning.slice(0, 2).map((reason, index) => (
              <li key={index} className="text-xs text-gray-700 flex items-start">
                <span className="text-green-500 mr-1">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="font-medium text-gray-900">{Math.round(factors.historicalRoi)}</div>
          <div className="text-gray-600">Historical</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="font-medium text-gray-900">{Math.round(factors.venueSuccess)}</div>
          <div className="text-gray-600">Venue</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="font-medium text-gray-900">{Math.round(factors.fieldSize)}</div>
          <div className="text-gray-600">Field</div>
        </div>
      </div>
    </div>
  )
}

// Mock recent tournaments data
function getMockRecentTournaments() {
  return [
    {
      id: 't1', name: 'WSOP Circuit Main Event', date: '2024-01-28', buyIn: 1700, field: 487,
      finish: 8, prize: 12400, roi: 629, venue: 'Orleans', city: 'Las Vegas, NV'
    },
    {
      id: 't2', name: 'WSOP Circuit Event #12', date: '2024-01-25', buyIn: 400, field: 312,
      finish: 45, prize: 0, roi: -100, venue: 'Orleans', city: 'Las Vegas, NV'
    },
    {
      id: 't3', name: 'WPT Bay 101 Shooting Star', date: '2024-01-18', buyIn: 3500, field: 298,
      finish: null, prize: 0, roi: -100, venue: 'Bay 101', city: 'San Jose, CA'
    },
    {
      id: 't4', name: 'MSPT Hammond Main Event', date: '2024-01-12', buyIn: 1100, field: 425,
      finish: 23, prize: 0, roi: -100, venue: 'Horseshoe Hammond', city: 'Hammond, IN'
    },
    {
      id: 't5', name: 'WSOP Circuit Ring Event', date: '2024-01-08', buyIn: 565, field: 298,
      finish: 12, prize: 1850, roi: 227, venue: 'Orleans', city: 'Las Vegas, NV'
    }
  ]
}

// Mock analytics data fallback
function getMockAnalytics(): EnhancedAnalytics {
  return {
    summary: {
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
    },
    monthlyPerformance: [
      { month: 'Jan 2024', year: 2024, buyIns: 8400, winnings: 12600, profit: 4200, tournamentsPlayed: 6, itmRate: 33, roi: 50, travelExpenses: 1670, netProfit: 2530 },
      { month: 'Dec 2023', year: 2023, buyIns: 6200, winnings: 5800, profit: -400, tournamentsPlayed: 4, itmRate: 25, roi: -6, travelExpenses: 1250, netProfit: -1650 },
      { month: 'Nov 2023', year: 2023, buyIns: 9100, winnings: 15400, profit: 6300, tournamentsPlayed: 7, itmRate: 43, roi: 69, travelExpenses: 2325, netProfit: 3975 },
      { month: 'Oct 2023', year: 2023, buyIns: 7300, winnings: 8950, profit: 1650, tournamentsPlayed: 5, itmRate: 40, roi: 23, travelExpenses: 1380, netProfit: 270 },
      { month: 'Sep 2023', year: 2023, buyIns: 5600, winnings: 4200, profit: -1400, tournamentsPlayed: 4, itmRate: 0, roi: -25, travelExpenses: 1055, netProfit: -2455 },
      { month: 'Aug 2023', year: 2023, buyIns: 11200, winnings: 18700, profit: 7500, tournamentsPlayed: 8, itmRate: 50, roi: 67, travelExpenses: 2830, netProfit: 4670 }
    ],
    circuitPerformance: [
      { circuit: 'WSOP Circuit', events: 18, buyIns: 28600, winnings: 42300, profit: 13700, roi: 48, averageField: 420, bestFinish: 1, itmRate: 44, averageBuyIn: 1589, profitabilityTrend: 'improving' },
      { circuit: 'MSPT', events: 12, buyIns: 14200, winnings: 18900, profit: 4700, roi: 33, averageField: 445, bestFinish: 2, itmRate: 42, averageBuyIn: 1183, profitabilityTrend: 'stable' },
      { circuit: 'WPT', events: 8, buyIns: 24000, winnings: 28400, profit: 4400, roi: 18, averageField: 380, bestFinish: 3, itmRate: 25, averageBuyIn: 3000, profitabilityTrend: 'declining' },
      { circuit: 'Regional', events: 9, buyIns: 7200, winnings: 6800, profit: -400, roi: -6, averageField: 220, bestFinish: 4, itmRate: 22, averageBuyIn: 800, profitabilityTrend: 'declining' }
    ],
    venuePerformance: [
      { venue: 'Orleans Casino', city: 'Las Vegas', state: 'NV', events: 8, winnings: 18200, buyIns: 12800, roi: 42, averageBuyIn: 1600, bestFinish: 1, itmRate: 50 },
      { venue: 'Horseshoe Hammond', city: 'Hammond', state: 'IN', events: 6, winnings: 11600, buyIns: 8200, roi: 41, averageBuyIn: 1367, bestFinish: 2, itmRate: 50 },
      { venue: 'Cherokee Casino', city: 'Cherokee', state: 'NC', events: 4, winnings: 6300, buyIns: 5600, roi: 13, averageBuyIn: 1400, bestFinish: 4, itmRate: 25 },
      { venue: 'Bay 101', city: 'San Jose', state: 'CA', events: 3, winnings: 8400, buyIns: 6300, roi: 33, averageBuyIn: 2100, bestFinish: 3, itmRate: 33 }
    ],
    travelAnalytics: {
      monthlyExpenses: [
        { month: '2024-01', flights: 850, hotels: 420, food: 280, ground: 120, total: 1670 },
        { month: '2023-12', flights: 620, hotels: 350, food: 195, ground: 85, total: 1250 },
        { month: '2023-11', flights: 1240, hotels: 560, food: 385, ground: 140, total: 2325 },
        { month: '2023-10', flights: 780, hotels: 280, food: 225, ground: 95, total: 1380 },
        { month: '2023-09', flights: 560, hotels: 240, food: 180, ground: 75, total: 1055 },
        { month: '2023-08', flights: 1450, hotels: 720, food: 480, ground: 180, total: 2830 }
      ],
      costPerTournament: 356,
      travelRoiImpact: -8.2,
      optimizationPotential: 2400,
      mostEfficientTrips: [
        { trip: 'Vegas Circuit (Jan 2024)', costPerTournament: 278, tournaments: 3 },
        { trip: 'Hammond Series (Oct 2023)', costPerTournament: 345, tournaments: 2 }
      ]
    },
    bankrollAnalytics: {
      currentAllocation: {
        tournamentBR: 50000,
        cashGameBR: 15000,
        expenseFund: 10000,
        total: 75000
      },
      history: [
        { date: new Date('2024-01-31'), amount: 75000, tournamentBR: 50000, expenseFund: 10000, change: 4200, changePercent: 5.9 },
        { date: new Date('2023-12-31'), amount: 70800, tournamentBR: 48000, expenseFund: 8800, change: -400, changePercent: -0.6 },
        { date: new Date('2023-11-30'), amount: 71200, tournamentBR: 47000, expenseFund: 9200, change: 5300, changePercent: 8.0 },
        { date: new Date('2023-10-31'), amount: 65900, tournamentBR: 44000, expenseFund: 7900, change: 1650, changePercent: 2.6 },
        { date: new Date('2023-09-30'), amount: 64250, tournamentBR: 43500, expenseFund: 7750, change: -1400, changePercent: -2.1 },
        { date: new Date('2023-08-31'), amount: 65650, tournamentBR: 44000, expenseFund: 8650, change: 7500, changePercent: 12.9 }
      ],
      riskMetrics: {
        kellyPercentage: 2.3,
        currentRisk: 'medium',
        recommendedBuyInRange: { min: 500, max: 2500 },
        drawdownProtection: 20
      }
    },
    insights: [
      {
        type: 'circuit',
        priority: 'high',
        title: 'Focus on WSOP Circuit',
        description: 'Your highest ROI circuit at 48.0%',
        impact: 'Could increase overall ROI by 3-5%',
        recommendation: 'Allocate 40-60% of tournament schedule to WSOP Circuit events',
        implementationDifficulty: 'medium'
      },
      {
        type: 'travel',
        priority: 'high',
        title: 'Optimize Travel Routes',
        description: 'Potential savings of $2,400 annually',
        impact: 'Reduce travel costs by 15-20%',
        recommendation: 'Use circuit routing to combine multiple tournaments per trip',
        potentialSavings: 2400,
        implementationDifficulty: 'easy'
      },
      {
        type: 'venue',
        priority: 'medium',
        title: 'Maximize Orleans Casino Events',
        description: '42.1% ROI with 8 events',
        impact: 'Strong venue performance indicates good fit',
        recommendation: 'Prioritize tournaments at Orleans Casino when available',
        implementationDifficulty: 'easy'
      }
    ]
  }
}