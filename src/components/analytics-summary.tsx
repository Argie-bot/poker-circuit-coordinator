'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Brain,
  AlertCircle,
  CheckCircle,
  BarChart3
} from 'lucide-react'

interface AnalyticsSummaryProps {
  playerId: string;
  className?: string;
}

interface SummaryData {
  roi: number;
  netProfit: number;
  itmRate: number;
  bestCircuit: string;
  topRecommendation?: {
    tournament: string;
    score: number;
    expectedRoi: number;
  };
  insights: Array<{
    type: 'positive' | 'warning' | 'neutral';
    message: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export default function AnalyticsSummary({ playerId, className = '' }: AnalyticsSummaryProps) {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSummaryData()
  }, [playerId])

  const loadSummaryData = async () => {
    try {
      // In a real implementation, this would call your analytics API
      // For now, we'll use mock data
      const mockSummary: SummaryData = {
        roi: 23.5,
        netProfit: 28500,
        itmRate: 28,
        bestCircuit: 'WSOP Circuit',
        topRecommendation: {
          tournament: 'WSOP Circuit Main Event - Orleans',
          score: 87,
          expectedRoi: 45.2
        },
        insights: [
          {
            type: 'positive',
            message: 'Your WSOP Circuit ROI increased 12% over the last 6 months',
            priority: 'high'
          },
          {
            type: 'warning',
            message: 'Travel expenses are 18% of total costs - optimization recommended',
            priority: 'medium'
          },
          {
            type: 'positive',
            message: 'Orleans Casino shows 42% ROI across 8 events',
            priority: 'medium'
          }
        ]
      }
      
      setSummary(mockSummary)
    } catch (error) {
      console.error('Failed to load analytics summary:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`card ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card ${className}`}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
          Performance Analytics
        </h3>
        <a 
          href="/analytics" 
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          View Full Analytics →
        </a>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-lg font-bold text-green-600">{summary.roi}%</span>
          </div>
          <p className="text-xs text-gray-600">Tournament ROI</p>
        </div>
        
        <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <DollarSign className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-lg font-bold text-blue-600">${(summary.netProfit / 1000).toFixed(0)}k</span>
          </div>
          <p className="text-xs text-gray-600">Net Profit</p>
        </div>
        
        <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Target className="h-4 w-4 text-purple-500 mr-1" />
            <span className="text-lg font-bold text-purple-600">{summary.itmRate}%</span>
          </div>
          <p className="text-xs text-gray-600">ITM Rate</p>
        </div>
      </div>

      {/* Top Recommendation */}
      {summary.topRecommendation && (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center mb-2">
            <Brain className="h-4 w-4 text-orange-500 mr-2" />
            <span className="text-sm font-medium text-orange-900">AI Recommendation</span>
            <span className="ml-auto bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
              Score: {summary.topRecommendation.score}
            </span>
          </div>
          <p className="text-sm text-orange-800 font-medium">{summary.topRecommendation.tournament}</p>
          <p className="text-xs text-orange-700">
            Expected ROI: {summary.topRecommendation.expectedRoi}% • High confidence match
          </p>
        </div>
      )}

      {/* Quick Insights */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Recent Insights</h4>
        {summary.insights.slice(0, 3).map((insight, index) => (
          <div key={index} className="flex items-start space-x-3">
            {insight.type === 'positive' ? (
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            ) : insight.type === 'warning' ? (
              <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            ) : (
              <BarChart3 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className="text-sm text-gray-800">{insight.message}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {insight.priority} priority
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Best Circuit Highlight */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Best Circuit Performance:</span>
          <span className="text-sm font-medium text-primary-600">{summary.bestCircuit}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex space-x-2">
        <a 
          href="/analytics?tab=recommendations"
          className="flex-1 btn-secondary text-xs py-2"
        >
          View Recommendations
        </a>
        <a 
          href="/analytics?tab=performance"
          className="flex-1 btn-primary text-xs py-2"
        >
          Full Analytics
        </a>
      </div>
    </motion.div>
  )
}