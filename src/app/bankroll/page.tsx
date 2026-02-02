'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calculator, 
  AlertTriangle, 
  DollarSign, 
  Target, 
  BarChart3,
  Settings,
  Plus,
  Bell
} from 'lucide-react'

// Import components we'll create
import { BankrollSummaryCard } from '@/components/bankroll/BankrollSummaryCard'
import { StakingDealsOverview } from '@/components/bankroll/StakingDealsOverview'
import { RiskOfRuinCalculator } from '@/components/bankroll/RiskOfRuinCalculator'
import { InvestorDashboard } from '@/components/bankroll/InvestorDashboard'
import { BankrollOptimizationAlerts } from '@/components/bankroll/BankrollOptimizationAlerts'
import { SettlementManager } from '@/components/bankroll/SettlementManager'
import { BankrollSettings } from '@/components/bankroll/BankrollSettings'

// Import demo data
import { useBankrollData } from '@/hooks/useBankrollData'

export default function BankrollManagementPage() {
  const { 
    bankrollData, 
    stakingDeals, 
    investors, 
    alerts, 
    settlements,
    loading,
    error,
    refreshData 
  } = useBankrollData()

  const [activeTab, setActiveTab] = useState('overview')
  const [showRiskCalculator, setShowRiskCalculator] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="max-w-7xl mx-auto">
          <Alert className="border-red-600 bg-red-900/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Bankroll Data</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Advanced Bankroll Management
              </h1>
              <p className="text-slate-300 mt-2">
                Professional staking, risk management, and bankroll optimization
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setShowRiskCalculator(true)}
                variant="outline"
                className="border-slate-600 hover:border-green-500"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Risk Calculator
              </Button>
              <Button
                onClick={refreshData}
                variant="outline"
                className="border-slate-600 hover:border-blue-500"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Total Bankroll */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Bankroll</p>
                  <p className="text-2xl font-bold text-green-400">
                    ${bankrollData?.summary.totalBankroll.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {(bankrollData?.summary.monthlyChange || 0) >= 0 ? '+' : ''}
                    {bankrollData?.summary.monthlyChange || 0}% this month
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          {/* Risk of Ruin */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Risk of Ruin</p>
                  <p className={`text-2xl font-bold ${
                    (bankrollData?.riskMetrics.currentRiskOfRuin || 0) < 5 
                      ? 'text-green-400' 
                      : (bankrollData?.riskMetrics.currentRiskOfRuin || 0) < 15
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}>
                    {bankrollData?.riskMetrics.currentRiskOfRuin.toFixed(1) || '0'}%
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {(bankrollData?.riskMetrics.currentRiskOfRuin || 0) < 5 ? 'Safe' : 
                     (bankrollData?.riskMetrics.currentRiskOfRuin || 0) < 15 ? 'Moderate' : 'High Risk'}
                  </p>
                </div>
                <Target className={`h-8 w-8 ${
                  (bankrollData?.riskMetrics.currentRiskOfRuin || 0) < 5 
                    ? 'text-green-400' 
                    : (bankrollData?.riskMetrics.currentRiskOfRuin || 0) < 15
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`} />
              </div>
            </CardContent>
          </Card>

          {/* Active Staking Deals */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Active Deals</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {bankrollData?.stakingOverview.activeDeals || 0}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    ${bankrollData?.stakingOverview.totalInvested.toLocaleString() || '0'} invested
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          {/* Pending Settlements */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Pending Settlements</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {bankrollData?.stakingOverview.pendingSettlements || 0}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Avg markup: {bankrollData?.stakingOverview.averageMarkup.toFixed(2) || '0'}x
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Alerts */}
        {alerts && alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <BankrollOptimizationAlerts alerts={alerts} />
          </motion.div>
        )}

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-slate-800 border-slate-700">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="staking" className="text-xs sm:text-sm">Staking</TabsTrigger>
              <TabsTrigger value="investors" className="text-xs sm:text-sm">Investors</TabsTrigger>
              <TabsTrigger value="settlements" className="text-xs sm:text-sm">Settlements</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <BankrollSummaryCard 
                    data={bankrollData}
                    className="h-full"
                  />
                </div>
                <div>
                  <StakingDealsOverview 
                    deals={stakingDeals}
                    className="h-full"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="staking" className="space-y-6">
              <StakingDealsOverview 
                deals={stakingDeals}
                detailed={true}
              />
            </TabsContent>

            <TabsContent value="investors" className="space-y-6">
              <InvestorDashboard 
                investors={investors}
                deals={stakingDeals}
              />
            </TabsContent>

            <TabsContent value="settlements" className="space-y-6">
              <SettlementManager 
                settlements={settlements}
                deals={stakingDeals}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <BankrollSettings 
                currentSettings={bankrollData?.optimizationSettings}
              />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Risk Calculator Modal */}
        {showRiskCalculator && (
          <RiskOfRuinCalculator 
            isOpen={showRiskCalculator}
            onClose={() => setShowRiskCalculator(false)}
            currentBankroll={bankrollData?.summary.totalBankroll || 0}
          />
        )}
      </div>
    </div>
  )
}