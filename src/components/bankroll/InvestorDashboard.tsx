'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Mail, 
  Phone, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Star,
  MessageSquare,
  Calendar,
  FileText,
  Plus,
  Settings
} from 'lucide-react'
import { Investor, StakingDeal } from '@/types/bankroll'

interface InvestorDashboardProps {
  investors: Investor[]
  deals: StakingDeal[]
  className?: string
}

export function InvestorDashboard({ investors, deals, className }: InvestorDashboardProps) {
  const [selectedInvestor, setSelectedInvestor] = useState<string | null>(null)

  if (!investors || investors.length === 0) {
    return (
      <div className={className}>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Investors Yet</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Start building relationships with investors to grow your playing volume and reduce variance.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Investor
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getPerformanceColor = (roi: number) => {
    if (roi >= 10) return 'text-green-400'
    if (roi >= 0) return 'text-blue-400'
    return 'text-red-400'
  }

  const getSatisfactionColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-200">Investor Management</h2>
          <p className="text-slate-400">Manage relationships and communications with your investors</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-600">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Investor
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm text-slate-400">Total Investors</p>
                <p className="text-2xl font-bold text-blue-400">{investors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-sm text-slate-400">Total Invested</p>
                <p className="text-2xl font-bold text-green-400">
                  ${investors.reduce((sum, inv) => sum + inv.totalInvested, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-sm text-slate-400">Avg ROI</p>
                <p className="text-2xl font-bold text-purple-400">
                  {(investors.reduce((sum, inv) => sum + inv.roi, 0) / investors.length).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-sm text-slate-400">Satisfaction</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {(investors.reduce((sum, inv) => sum + (inv.roi > 0 ? 95 : 75), 0) / investors.length).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {investors.map((investor) => (
          <motion.div
            key={investor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-400 to-purple-500">
                      <AvatarFallback className="text-white font-semibold">
                        {getInitials(investor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg text-slate-200">{investor.name}</CardTitle>
                      <div className="flex items-center gap-4 mt-1">
                        {investor.email && (
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Mail className="h-3 w-3" />
                            {investor.email}
                          </div>
                        )}
                        {investor.phone && (
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Phone className="h-3 w-3" />
                            {investor.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPerformanceColor(investor.roi)}>
                      {investor.roi >= 0 ? '+' : ''}{investor.roi.toFixed(1)}% ROI
                    </Badge>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor((investor.roi > 0 ? 95 : 75) / 20)
                              ? 'text-yellow-400 fill-current'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Financial Overview */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Total Invested</p>
                    <p className="text-lg font-bold">${investor.totalInvested.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Current Exposure</p>
                    <p className="text-lg font-bold text-blue-400">${investor.currentExposure.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Total Returned</p>
                    <p className="text-lg font-bold text-green-400">${investor.totalReturned.toLocaleString()}</p>
                  </div>
                </div>

                {/* Performance Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Performance vs Target</span>
                    <span className={getPerformanceColor(investor.roi)}>
                      {investor.roi >= 0 ? '+' : ''}{investor.roi.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, Math.max(0, 50 + investor.roi))} 
                    className="h-3 bg-slate-700"
                  />
                </div>

                {/* Active Deals */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Active Deals</h4>
                  <div className="space-y-2">
                    {investor.dealHistory
                      .filter(deal => deal.status === 'active')
                      .map((deal) => (
                        <div key={deal.id} className="bg-slate-900/50 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-200">
                              {deal.percentage}% @ {deal.markup}x markup
                            </span>
                            <Badge variant="outline" className="text-xs border-green-600 text-green-400">
                              {deal.dealType}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
                            <span>Started: {deal.startDate.toLocaleDateString()}</span>
                            <span>Current: ${deal.currentBalance.toLocaleString()}</span>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>

                {/* Communication Preferences */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Communication</h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {investor.communicationPrefs.resultNotifications && (
                      <Badge variant="outline" className="border-blue-600 text-blue-400">
                        Result updates
                      </Badge>
                    )}
                    {investor.communicationPrefs.weeklyReports && (
                      <Badge variant="outline" className="border-green-600 text-green-400">
                        Weekly reports
                      </Badge>
                    )}
                    {investor.communicationPrefs.monthlyStatements && (
                      <Badge variant="outline" className="border-purple-600 text-purple-400">
                        Monthly statements
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-gray-600 text-gray-400">
                      {investor.paymentPreferences.method}
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-slate-700">
                  <Button size="sm" variant="outline" className="border-blue-600 text-blue-400">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Message
                  </Button>
                  <Button size="sm" variant="outline" className="border-green-600 text-green-400">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Settlement
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-600">
                    <FileText className="h-3 w-3 mr-1" />
                    Statements
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-600">
                    <Settings className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-green-400" />
            Recent Investor Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                type: 'settlement',
                investor: 'Mike Johnson',
                description: 'Q1 2026 settlement processed',
                amount: 8400,
                date: '2 days ago',
                positive: true
              },
              {
                type: 'communication',
                investor: 'Sarah Chen',
                description: 'Monthly statement sent',
                date: '1 week ago',
                positive: true
              },
              {
                type: 'deal_update',
                investor: 'Mike Johnson',
                description: 'Deal terms updated - markup adjusted to 1.25x',
                date: '2 weeks ago',
                positive: true
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.positive ? 'bg-green-400' : 'bg-yellow-400'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-slate-200">{activity.investor}</p>
                    <p className="text-xs text-slate-400">{activity.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.amount && (
                    <p className="text-sm font-bold text-green-400">
                      +${activity.amount.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-slate-400">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}