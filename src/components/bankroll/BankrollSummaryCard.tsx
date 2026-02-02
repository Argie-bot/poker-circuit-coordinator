'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target,
  AlertCircle,
  DollarSign 
} from 'lucide-react'
import { BankrollDashboardData } from '@/types/bankroll'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface BankrollSummaryCardProps {
  data: BankrollDashboardData | null
  className?: string
}

// Mock chart data for visualization
const performanceData = [
  { month: 'Aug', value: 115000, profit: 2500 },
  { month: 'Sep', value: 118500, profit: 3500 },
  { month: 'Oct', value: 122000, profit: 3500 },
  { month: 'Nov', value: 125800, profit: 3800 },
  { month: 'Dec', value: 121200, profit: -4600 },
  { month: 'Jan', value: 127500, profit: 6300 }
]

const allocationData = [
  { name: 'Available', value: 102000, color: '#10b981' },
  { name: 'Staked', value: 25500, color: '#3b82f6' }
]

export function BankrollSummaryCard({ data, className }: BankrollSummaryCardProps) {
  if (!data) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-700 rounded mb-4"></div>
            <div className="h-32 bg-slate-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const bankrollUtilization = (data.summary.stakedAmount / data.summary.totalBankroll) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="bg-slate-800/50 border-slate-700 h-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-green-400" />
            Bankroll Overview
            <Badge variant="outline" className="border-green-600 text-green-400">
              {data.riskMetrics.currentRiskOfRuin < 5 ? 'Safe' : 
               data.riskMetrics.currentRiskOfRuin < 15 ? 'Moderate' : 'High Risk'}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Main Metrics */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Bankroll</p>
              <p className="text-3xl font-bold text-green-400">
                ${data.summary.totalBankroll.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {data.summary.monthlyChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
                <span className={`text-sm ${
                  data.summary.monthlyChange >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {data.summary.monthlyChange >= 0 ? '+' : ''}{data.summary.monthlyChange}% this month
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-slate-400 mb-1">Available</p>
              <p className="text-2xl font-bold text-blue-400">
                ${data.summary.availableBankroll.toLocaleString()}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {((data.summary.availableBankroll / data.summary.totalBankroll) * 100).toFixed(1)}% of total
              </p>
            </div>
          </div>

          {/* Bankroll Utilization */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-slate-400">Bankroll Utilization</p>
              <p className="text-sm font-medium">{bankrollUtilization.toFixed(1)}%</p>
            </div>
            <Progress 
              value={bankrollUtilization} 
              className="h-3 bg-slate-700"
            />
            <p className="text-xs text-slate-400 mt-1">
              ${data.summary.stakedAmount.toLocaleString()} currently staked
            </p>
          </div>

          {/* Performance Chart */}
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-3">6-Month Performance</h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="bankrollGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis hide />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#bankrollGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
            <div className="text-center">
              <p className="text-sm text-slate-400">Year to Date</p>
              <p className="text-lg font-bold text-green-400">
                +{data.summary.yearToDate}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-400">Risk of Ruin</p>
              <p className={`text-lg font-bold ${
                data.riskMetrics.currentRiskOfRuin < 5 
                  ? 'text-green-400' 
                  : data.riskMetrics.currentRiskOfRuin < 15
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`}>
                {data.riskMetrics.currentRiskOfRuin.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-400">Max Buy-in</p>
              <p className="text-lg font-bold text-blue-400">
                ${(data.riskMetrics.maxRecommendedBuyin / 1000).toFixed(0)}K
              </p>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-green-400" />
              <h4 className="font-medium text-green-400">Risk Assessment</h4>
            </div>
            <p className="text-sm text-slate-300 mb-2">
              Your current bankroll management is within safe parameters.
            </p>
            <div className="flex gap-2 text-xs">
              <Badge variant="secondary" className="bg-green-900/30 text-green-400 border-green-600">
                Conservative risk profile
              </Badge>
              <Badge variant="secondary" className="bg-blue-900/30 text-blue-400 border-blue-600">
                Optimal staking allocation
              </Badge>
            </div>
          </div>

          {/* Recent Activity Summary */}
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-3">Recent Activity</h4>
            <div className="space-y-2">
              {data.recentActivity.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.impact === 'positive' ? 'bg-green-400' : 
                      activity.impact === 'negative' ? 'bg-red-400' : 'bg-yellow-400'
                    }`} />
                    <span className="text-sm text-slate-300 truncate">
                      {activity.description}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${
                    activity.amount >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {activity.amount >= 0 ? '+' : ''}${Math.abs(activity.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}