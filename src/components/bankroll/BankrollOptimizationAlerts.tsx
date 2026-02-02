'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Target,
  Users,
  Bell,
  X,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react'
import { BankrollAlert, BankrollAlertType } from '@/types/bankroll'

interface BankrollOptimizationAlertsProps {
  alerts: BankrollAlert[]
  onDismissAlert?: (alertId: string) => void
  onTakeAction?: (alertId: string, action: string) => void
}

const ALERT_CONFIG: Record<BankrollAlertType, {
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  priority: 'low' | 'medium' | 'high'
  category: 'risk' | 'opportunity' | 'action' | 'info'
}> = {
  buyin_exceeds_percentage: {
    icon: AlertTriangle,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-600',
    priority: 'high',
    category: 'risk'
  },
  risk_of_ruin_increased: {
    icon: Target,
    color: 'text-red-400',
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-600',
    priority: 'high',
    category: 'risk'
  },
  drawdown_threshold: {
    icon: TrendingUp,
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/20',
    borderColor: 'border-orange-600',
    priority: 'medium',
    category: 'risk'
  },
  staking_settlement_due: {
    icon: Users,
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-600',
    priority: 'medium',
    category: 'action'
  },
  bankroll_milestone: {
    icon: DollarSign,
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-600',
    priority: 'low',
    category: 'opportunity'
  },
  expense_budget_exceeded: {
    icon: AlertTriangle,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-600',
    priority: 'medium',
    category: 'action'
  },
  variance_model_drift: {
    icon: Zap,
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-600',
    priority: 'low',
    category: 'info'
  },
  investor_communication_due: {
    icon: Bell,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-900/20',
    borderColor: 'border-cyan-600',
    priority: 'medium',
    category: 'action'
  }
}

const SAMPLE_ALERTS: BankrollAlert[] = [
  {
    id: 'alert_buyin_high',
    type: 'buyin_exceeds_percentage',
    threshold: 5,
    enabled: true,
    frequency: 'once',
    message: 'WSOP Main Event buy-in ($10,000) exceeds 5% of current bankroll. Consider smaller tournaments.',
    actionRequired: true
  },
  {
    id: 'alert_settlement_due',
    type: 'staking_settlement_due',
    threshold: 30,
    enabled: true,
    frequency: 'daily',
    lastTriggered: new Date('2026-02-01'),
    message: 'Sarah Chen quarterly settlement is due. Cherokee Main Event result needs processing.',
    actionRequired: true
  },
  {
    id: 'alert_milestone',
    type: 'bankroll_milestone',
    threshold: 125000,
    enabled: true,
    frequency: 'once',
    message: 'Congratulations! You\'ve reached your $125K bankroll milestone. Consider increasing buy-in limits.',
    actionRequired: false
  },
  {
    id: 'alert_variance_drift',
    type: 'variance_model_drift',
    threshold: 10,
    enabled: true,
    frequency: 'weekly',
    message: 'Your variance model may need recalibration. Recent results show 15% deviation from expected.',
    actionRequired: false
  }
]

export function BankrollOptimizationAlerts({ 
  alerts = SAMPLE_ALERTS, 
  onDismissAlert,
  onTakeAction 
}: BankrollOptimizationAlertsProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)

  // Filter out dismissed alerts
  const activeAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id))
  
  // Sort by priority
  const sortedAlerts = activeAlerts.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const aPriority = ALERT_CONFIG[a.type]?.priority || 'low'
    const bPriority = ALERT_CONFIG[b.type]?.priority || 'low'
    return priorityOrder[bPriority] - priorityOrder[aPriority]
  })

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...Array.from(prev), alertId]))
    onDismissAlert?.(alertId)
  }

  const handleAction = (alertId: string, action: string) => {
    onTakeAction?.(alertId, action)
    if (action === 'resolve') {
      handleDismiss(alertId)
    }
  }

  const getActionButtons = (alert: BankrollAlert) => {
    switch (alert.type) {
      case 'buyin_exceeds_percentage':
        return [
          { label: 'Reduce Buy-in', action: 'reduce_buyin', variant: 'default' as const },
          { label: 'Increase Bankroll', action: 'increase_bankroll', variant: 'outline' as const },
          { label: 'Proceed Anyway', action: 'override', variant: 'outline' as const }
        ]
      case 'staking_settlement_due':
        return [
          { label: 'Process Settlement', action: 'process_settlement', variant: 'default' as const },
          { label: 'Contact Investor', action: 'contact_investor', variant: 'outline' as const },
          { label: 'Postpone', action: 'postpone', variant: 'outline' as const }
        ]
      case 'risk_of_ruin_increased':
        return [
          { label: 'Review Strategy', action: 'review_strategy', variant: 'default' as const },
          { label: 'Recalculate Risk', action: 'recalculate', variant: 'outline' as const }
        ]
      case 'bankroll_milestone':
        return [
          { label: 'Update Limits', action: 'update_limits', variant: 'default' as const },
          { label: 'Celebrate', action: 'celebrate', variant: 'outline' as const }
        ]
      default:
        return [
          { label: 'Review', action: 'review', variant: 'default' as const },
          { label: 'Dismiss', action: 'dismiss', variant: 'outline' as const }
        ]
    }
  }

  const getCategoryBadge = (category: string) => {
    const config = {
      risk: { label: 'Risk Alert', color: 'border-red-600 text-red-400' },
      opportunity: { label: 'Opportunity', color: 'border-green-600 text-green-400' },
      action: { label: 'Action Needed', color: 'border-blue-600 text-blue-400' },
      info: { label: 'Information', color: 'border-gray-600 text-gray-400' }
    }
    
    const categoryConfig = config[category as keyof typeof config] || config.info
    return (
      <Badge variant="outline" className={categoryConfig.color}>
        {categoryConfig.label}
      </Badge>
    )
  }

  if (activeAlerts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8"
      >
        <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-green-400 mb-2">All Clear!</h3>
        <p className="text-slate-400">No active bankroll alerts. Your management strategy is on track.</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-yellow-400" />
          <h2 className="text-lg font-semibold text-slate-200">
            Bankroll Optimization Alerts
          </h2>
          <Badge variant="outline" className="border-yellow-600 text-yellow-400">
            {activeAlerts.length} Active
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDismissedAlerts(new Set(alerts.map(a => a.id)))}
          className="border-slate-600 text-slate-400 hover:text-slate-200"
        >
          Dismiss All
        </Button>
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {sortedAlerts.map((alert, index) => {
            const config = ALERT_CONFIG[alert.type]
            const Icon = config.icon
            const isExpanded = expandedAlert === alert.id
            
            return (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`${config.bgColor} border ${config.borderColor} transition-all duration-200 ${
                  isExpanded ? 'shadow-lg' : 'hover:shadow-md'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Alert Icon */}
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
                          <Icon className={`h-5 w-5 ${config.color}`} />
                        </div>
                      </div>

                      {/* Alert Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getCategoryBadge(config.category)}
                            <Badge variant="outline" className={`text-xs ${
                              config.priority === 'high' ? 'border-red-500 text-red-400' :
                              config.priority === 'medium' ? 'border-yellow-500 text-yellow-400' :
                              'border-gray-500 text-gray-400'
                            }`}>
                              {config.priority} priority
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {alert.lastTriggered && (
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {alert.lastTriggered.toLocaleDateString()}
                              </span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDismiss(alert.id)}
                              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-200"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-slate-200 text-sm mb-3 leading-relaxed">
                          {alert.message}
                        </p>

                        {/* Action Buttons */}
                        {alert.actionRequired && (
                          <div className="flex flex-wrap gap-2">
                            {getActionButtons(alert).map((button, idx) => (
                              <Button
                                key={idx}
                                size="sm"
                                variant={button.variant}
                                onClick={() => handleAction(alert.id, button.action)}
                                className={`text-xs ${
                                  button.variant === 'default' 
                                    ? 'bg-blue-600 hover:bg-blue-700' 
                                    : 'border-slate-600 hover:border-slate-500'
                                }`}
                              >
                                {button.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-slate-600"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium text-slate-300 mb-2">Alert Settings</h4>
                            <ul className="space-y-1 text-slate-400">
                              <li>Threshold: {alert.threshold}</li>
                              <li>Frequency: {alert.frequency}</li>
                              <li>Enabled: {alert.enabled ? 'Yes' : 'No'}</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-300 mb-2">Recommendations</h4>
                            <ul className="space-y-1 text-slate-400">
                              <li>• Review current strategy</li>
                              <li>• Consider risk tolerance</li>
                              <li>• Update thresholds if needed</li>
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Toggle Details Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                      className="w-full mt-3 text-xs text-slate-400 hover:text-slate-200"
                    >
                      {isExpanded ? 'Hide Details' : 'Show Details'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Summary */}
      <Card className="bg-slate-900/30 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>
                {sortedAlerts.filter(a => ALERT_CONFIG[a.type].priority === 'high').length} High Priority
              </span>
              <span>
                {sortedAlerts.filter(a => ALERT_CONFIG[a.type].priority === 'medium').length} Medium Priority  
              </span>
              <span>
                {sortedAlerts.filter(a => ALERT_CONFIG[a.type].priority === 'low').length} Low Priority
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-400"
            >
              Configure Alerts
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}