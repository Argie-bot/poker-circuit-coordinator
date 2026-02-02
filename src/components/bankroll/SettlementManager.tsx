'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign, 
  Calculator, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Download,
  Send,
  Eye,
  Plus
} from 'lucide-react'
import { SettlementCalculation, StakingDeal } from '@/types/bankroll'

interface SettlementManagerProps {
  settlements: SettlementCalculation[]
  deals: StakingDeal[]
  className?: string
}

export function SettlementManager({ settlements, deals, className }: SettlementManagerProps) {
  const [selectedSettlement, setSelectedSettlement] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('pending')

  // Mock pending settlements that need processing
  const pendingSettlements = [
    {
      id: 'pending_sarah_chen',
      dealId: 'deal_sarah_chen',
      investorName: 'Sarah Chen',
      period: 'Cherokee Main Event',
      winnings: 24500,
      buyIn: 1700,
      netProfit: 22800,
      investorShare: 3420, // 15% of net
      markup: 1.15,
      daysOverdue: 2,
      autoSettlement: false
    },
    {
      id: 'pending_mike_q1',
      dealId: 'deal_mike_johnson',
      investorName: 'Mike Johnson',
      period: 'Q1 2026 Summary',
      winnings: 45200,
      expenses: 8400,
      netProfit: 36800,
      investorShare: 8832, // 20% of net + markup
      markup: 1.2,
      daysOverdue: 0,
      autoSettlement: true
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-600 text-green-400'
      case 'pending': return 'border-yellow-600 text-yellow-400'
      case 'overdue': return 'border-red-600 text-red-400'
      case 'processing': return 'border-blue-600 text-blue-400'
      default: return 'border-gray-600 text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'overdue': return <AlertCircle className="h-4 w-4" />
      case 'processing': return <Calculator className="h-4 w-4" />
      default: return null
    }
  }

  const totalPendingPayouts = pendingSettlements.reduce((sum, s) => sum + s.investorShare, 0)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-200">Settlement Management</h2>
          <p className="text-slate-400">Process investor payouts and manage settlement schedules</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-600">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Manual Settlement
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-sm text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{pendingSettlements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-sm text-slate-400">Pending Payouts</p>
                <p className="text-2xl font-bold text-green-400">
                  ${totalPendingPayouts.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm text-slate-400">This Month</p>
                <p className="text-2xl font-bold text-blue-400">{settlements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-sm text-slate-400">Total Paid</p>
                <p className="text-2xl font-bold text-purple-400">
                  ${settlements.reduce((sum, s) => sum + s.finalPayout, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
          <TabsTrigger value="pending">Pending ({pendingSettlements.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({settlements.length})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingSettlements.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-400 mb-2">All Caught Up!</h3>
                <p className="text-slate-400">No pending settlements at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingSettlements.map((settlement) => (
                <Card key={settlement.id} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <CardTitle className="text-lg text-slate-200">{settlement.investorName}</CardTitle>
                          <p className="text-slate-400">{settlement.period}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className={
                            settlement.daysOverdue > 0 ? 'border-red-600 text-red-400' : 'border-yellow-600 text-yellow-400'
                          }>
                            {settlement.daysOverdue > 0 ? `${settlement.daysOverdue} days overdue` : 'Due now'}
                          </Badge>
                          {settlement.autoSettlement && (
                            <Badge variant="outline" className="border-blue-600 text-blue-400">
                              Auto-settlement
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">
                          ${settlement.investorShare.toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-400">{settlement.markup}x markup</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Settlement Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Winnings</p>
                        <p className="text-lg font-semibold text-green-400">
                          ${settlement.winnings.toLocaleString()}
                        </p>
                      </div>
                      {settlement.buyIn && (
                        <div>
                          <p className="text-sm text-slate-400">Buy-in</p>
                          <p className="text-lg font-semibold text-red-400">
                            -${settlement.buyIn.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {settlement.expenses && (
                        <div>
                          <p className="text-sm text-slate-400">Expenses</p>
                          <p className="text-lg font-semibold text-red-400">
                            -${settlement.expenses.toLocaleString()}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-slate-400">Net Profit</p>
                        <p className="text-lg font-semibold text-blue-400">
                          ${settlement.netProfit.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Calculation Display */}
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <h4 className="font-medium text-slate-300 mb-3">Settlement Calculation</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Net profit:</span>
                          <span className="text-slate-200">${settlement.netProfit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Investor share (15%):</span>
                          <span className="text-slate-200">${(settlement.netProfit * 0.15).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Markup ({settlement.markup}x):</span>
                          <span className="text-slate-200">
                            ${((settlement.netProfit * 0.15) * (settlement.markup - 1)).toLocaleString()}
                          </span>
                        </div>
                        <hr className="border-slate-600" />
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-300">Total payout:</span>
                          <span className="text-green-400">${settlement.investorShare.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Send className="h-4 w-4 mr-2" />
                        Process Payment
                      </Button>
                      <Button variant="outline" className="border-blue-600 text-blue-400">
                        <Calculator className="h-4 w-4 mr-2" />
                        Recalculate
                      </Button>
                      <Button variant="outline" className="border-slate-600">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Statement
                      </Button>
                      <Button variant="outline" className="border-slate-600">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          <div className="space-y-4">
            {settlements.map((settlement) => {
              const deal = deals.find(d => d.id === settlement.dealId)
              const investorName = deal?.investorName || 'Unknown Investor'
              
              return (
                <Card key={settlement.dealId + settlement.period.start.toString()} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg text-slate-200">{investorName}</CardTitle>
                        <p className="text-slate-400">
                          {settlement.period.start.toLocaleDateString()} - {settlement.period.end.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-400">
                          ${settlement.finalPayout.toLocaleString()}
                        </p>
                        <Badge variant="outline" className="border-green-600 text-green-400 mt-1">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Winnings</p>
                        <p className="text-lg font-semibold text-green-400">
                          ${settlement.totalWinnings.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Expenses</p>
                        <p className="text-lg font-semibold text-red-400">
                          -${settlement.totalExpenses.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Net Profit</p>
                        <p className="text-lg font-semibold text-blue-400">
                          ${settlement.netProfit.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Tournaments</p>
                        <p className="text-lg font-semibold text-purple-400">
                          {settlement.breakdown.tournaments.length}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4 pt-4 border-t border-slate-700">
                      <Button size="sm" variant="outline" className="border-blue-600 text-blue-400">
                        <FileText className="h-4 w-4 mr-2" />
                        View Statement
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-600">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4 mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8 text-center">
              <Clock className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-blue-400 mb-2">Auto-Settlement Schedule</h3>
              <p className="text-slate-400 mb-4">
                Automated settlements are configured based on individual deal terms.
              </p>
              
              <div className="max-w-md mx-auto space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                  <span className="text-slate-300">Mike Johnson</span>
                  <Badge variant="outline" className="border-blue-600 text-blue-400">Monthly</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                  <span className="text-slate-300">Sarah Chen</span>
                  <Badge variant="outline" className="border-green-600 text-green-400">Per Tournament</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}