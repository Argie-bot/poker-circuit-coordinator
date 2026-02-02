'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Settings,
  Plus,
  Eye,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle
} from 'lucide-react'
import { StakingDeal } from '@/types/bankroll'

interface StakingDealsOverviewProps {
  deals: StakingDeal[]
  detailed?: boolean
  className?: string
}

export function StakingDealsOverview({ deals, detailed = false, className }: StakingDealsOverviewProps) {
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null)

  const totalInvested = deals.reduce((sum, deal) => sum + deal.initialInvestment, 0)
  const totalCurrent = deals.reduce((sum, deal) => sum + deal.currentBalance, 0)
  const totalReturn = ((totalCurrent - totalInvested) / totalInvested) * 100

  const getStatusColor = (status: StakingDeal['status']) => {
    switch (status) {
      case 'active': return 'bg-green-900/30 text-green-400 border-green-600'
      case 'pending_settlement': return 'bg-yellow-900/30 text-yellow-400 border-yellow-600'
      case 'paused': return 'bg-gray-900/30 text-gray-400 border-gray-600'
      case 'completed': return 'bg-blue-900/30 text-blue-400 border-blue-600'
      default: return 'bg-slate-900/30 text-slate-400 border-slate-600'
    }
  }

  const getStatusIcon = (status: StakingDeal['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'pending_settlement': return <Clock className="h-4 w-4" />
      case 'paused': return <AlertTriangle className="h-4 w-4" />
      default: return null
    }
  }

  if (!deals || deals.length === 0) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No Active Staking Deals</h3>
          <p className="text-slate-400 mb-4">Set up investor partnerships to share risk and increase your playing volume.</p>
          <Button variant="outline" className="border-green-600 text-green-400 hover:bg-green-600/10">
            <Plus className="h-4 w-4 mr-2" />
            Add Staking Deal
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!detailed) {
    // Compact overview for dashboard
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={className}
      >
        <Card className="bg-slate-800/50 border-slate-700 h-full">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-400" />
              Active Staking Deals
              <Badge variant="outline" className="border-blue-600 text-blue-400">
                {deals.length} Active
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Summary Metrics */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Total Invested</span>
                  <span className="font-medium">${totalInvested.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Current Value</span>
                  <span className="font-medium">${totalCurrent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Total Return</span>
                  <span className={`font-medium flex items-center gap-1 ${
                    totalReturn >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {totalReturn >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Deal List */}
            <div className="space-y-3">
              {deals.map((deal) => {
                const dealReturn = ((deal.currentBalance - deal.initialInvestment) / deal.initialInvestment) * 100
                
                return (
                  <div key={deal.id} className="bg-slate-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-200">{deal.investorName}</h4>
                        <Badge variant="outline" className={getStatusColor(deal.status)}>
                          {deal.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <span className="text-sm text-slate-400">{deal.markup}x markup</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Percentage: </span>
                        <span className="text-slate-200">{deal.percentage}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Return: </span>
                        <span className={dealReturn >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {dealReturn >= 0 ? '+' : ''}{dealReturn.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Invested</span>
                        <span>Current</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>${deal.initialInvestment.toLocaleString()}</span>
                        <span>${deal.currentBalance.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <Button 
              variant="outline" 
              className="w-full border-blue-600 text-blue-400 hover:bg-blue-600/10"
            >
              <Eye className="h-4 w-4 mr-2" />
              View All Deals
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Detailed view for staking tab
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-200">Staking Management</h2>
            <p className="text-slate-400">Manage your investor partnerships and settlements</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-slate-600">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              New Deal
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <h3 className="font-medium">Total Investment</h3>
              </div>
              <p className="text-2xl font-bold text-green-400">${totalInvested.toLocaleString()}</p>
              <p className="text-sm text-slate-400">Current value: ${totalCurrent.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                <h3 className="font-medium">Portfolio Return</h3>
              </div>
              <p className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
              </p>
              <p className="text-sm text-slate-400">
                ${(totalCurrent - totalInvested).toLocaleString()} profit
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-purple-400" />
                <h3 className="font-medium">Active Deals</h3>
              </div>
              <p className="text-2xl font-bold text-purple-400">{deals.length}</p>
              <p className="text-sm text-slate-400">
                Avg markup: {(deals.reduce((sum, d) => sum + d.markup, 0) / deals.length).toFixed(2)}x
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Deal Cards */}
        <div className="space-y-4">
          {deals.map((deal) => {
            const dealReturn = ((deal.currentBalance - deal.initialInvestment) / deal.initialInvestment) * 100
            const isExpanded = selectedDeal === deal.id
            
            return (
              <Card key={deal.id} className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <CardTitle className="text-xl text-slate-200">{deal.investorName}</CardTitle>
                        <p className="text-slate-400">
                          {deal.percentage}% stake @ {deal.markup}x markup
                        </p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(deal.status)}>
                        {getStatusIcon(deal.status)}
                        {deal.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedDeal(isExpanded ? null : deal.id)}
                      className="border-slate-600"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {isExpanded ? 'Hide' : 'Details'}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Initial Investment</p>
                      <p className="text-lg font-bold">${deal.initialInvestment.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Current Value</p>
                      <p className="text-lg font-bold">${deal.currentBalance.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Return</p>
                      <p className={`text-lg font-bold ${dealReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {dealReturn >= 0 ? '+' : ''}{dealReturn.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Deal Duration</p>
                      <p className="text-lg font-bold">
                        {Math.floor((new Date().getTime() - deal.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))} months
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Deal Progress</span>
                      <span className="text-slate-300">
                        {dealReturn >= 0 ? 'Profitable' : 'In drawdown'}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(100, Math.max(0, 50 + dealReturn))} 
                      className="h-3 bg-slate-700"
                    />
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-4 border-t border-slate-700"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-slate-300 mb-3">Deal Terms</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Settlement Schedule:</span>
                              <span className="text-slate-200">{deal.settlementSchedule.frequency}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Auto Settlement:</span>
                              <span className="text-slate-200">{deal.autoSettlement ? 'Enabled' : 'Manual'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Expense Handling:</span>
                              <span className="text-slate-200">{deal.profitSplit.expenseHandling}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-slate-300 mb-3">Risk Management</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Stop Loss:</span>
                              <span className="text-slate-200">{deal.lossTerms.stopLossPercentage}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Drawdown Alert:</span>
                              <span className="text-slate-200">{deal.lossTerms.maxDrawdownAlert}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Break Even Payback:</span>
                              <span className="text-slate-200">{deal.lossTerms.recoveryTerms.breakEvenPayback ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <Button variant="outline" size="sm" className="border-blue-600 text-blue-400">
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Deal
                        </Button>
                        <Button variant="outline" size="sm" className="border-green-600 text-green-400">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Process Settlement
                        </Button>
                        <Button variant="outline" size="sm" className="border-slate-600">
                          View History
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}