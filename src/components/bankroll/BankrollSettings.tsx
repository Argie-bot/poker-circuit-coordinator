'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Settings,
  Target,
  DollarSign,
  Bell,
  Shield,
  Calculator,
  TrendingUp,
  Users,
  FileText,
  Save,
  RotateCcw
} from 'lucide-react'
import { BankrollOptimizationSettings } from '@/types/bankroll'

interface BankrollSettingsProps {
  currentSettings?: BankrollOptimizationSettings
  className?: string
}

const DEFAULT_SETTINGS: BankrollOptimizationSettings = {
  riskTolerance: 'moderate',
  maxRiskOfRuin: 5.0,
  targetROI: 15.0,
  buyinStrategy: {
    maxBuyinPercentage: 5.0,
    recommendedRange: {
      min: 1000,
      max: 5000
    },
    gameSelectionCriteria: {
      minField: 50,
      maxField: 1000,
      preferredStructures: ['freezeout', 'reentry'],
      avoidCircuits: [],
      roiThreshold: 10.0
    },
    adjustmentTriggers: []
  },
  stakingAllocation: {
    maxStakedPercentage: 25.0,
    preferredMarkupRange: {
      min: 1.1,
      max: 1.3
    },
    investorDiversification: {
      maxPerInvestor: 20.0,
      minInvestors: 2
    },
    dealStructurePreferences: {
      preferredDealLength: 6,
      performanceBonusesEnabled: true,
      autoSettlementEnabled: true,
      expensePassThroughEnabled: true
    }
  },
  expenseBuffer: 6,
  emergencyFund: 25000
}

export function BankrollSettings({ currentSettings, className }: BankrollSettingsProps) {
  const [settings, setSettings] = useState<BankrollOptimizationSettings>(
    currentSettings || DEFAULT_SETTINGS
  )
  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState('risk')

  const updateSetting = (path: string, value: any) => {
    const keys = path.split('.')
    const newSettings = JSON.parse(JSON.stringify(settings))
    
    let current = newSettings
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value
    
    setSettings(newSettings)
    setHasChanges(true)
  }

  const handleSave = () => {
    // In real implementation, this would save to backend
    console.log('Saving settings:', settings)
    setHasChanges(false)
  }

  const handleReset = () => {
    setSettings(currentSettings || DEFAULT_SETTINGS)
    setHasChanges(false)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-200">Bankroll Settings</h2>
          <p className="text-slate-400">Configure your risk management and optimization preferences</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={!hasChanges}
            className="border-slate-600"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!hasChanges}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-700">
          <TabsTrigger value="risk">Risk Management</TabsTrigger>
          <TabsTrigger value="buyin">Buy-in Strategy</TabsTrigger>
          <TabsTrigger value="staking">Staking</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="risk" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Tolerance */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-green-400" />
                  Risk Tolerance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="risk-tolerance">Risk Profile</Label>
                  <Select 
                    value={settings.riskTolerance} 
                    onValueChange={(value) => updateSetting('riskTolerance', value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="conservative">Conservative (Low risk, steady growth)</SelectItem>
                      <SelectItem value="moderate">Moderate (Balanced risk/reward)</SelectItem>
                      <SelectItem value="aggressive">Aggressive (High risk, high reward)</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="max-risk-ruin">Maximum Risk of Ruin (%)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={[settings.maxRiskOfRuin]}
                      onValueChange={(value) => updateSetting('maxRiskOfRuin', value[0])}
                      max={20}
                      min={0.5}
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="w-16 text-sm font-mono">{settings.maxRiskOfRuin.toFixed(1)}%</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Probability of losing entire bankroll
                  </p>
                </div>

                <div>
                  <Label htmlFor="target-roi">Target ROI (%)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={[settings.targetROI]}
                      onValueChange={(value) => updateSetting('targetROI', value[0])}
                      max={30}
                      min={5}
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="w-16 text-sm font-mono">{settings.targetROI.toFixed(1)}%</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Annual return target for strategy optimization
                  </p>
                </div>

                <div>
                  <Label htmlFor="emergency-fund">Emergency Fund</Label>
                  <Input
                    id="emergency-fund"
                    type="number"
                    value={settings.emergencyFund}
                    onChange={(e) => updateSetting('emergencyFund', Number(e.target.value))}
                    className="bg-slate-700 border-slate-600 mt-2"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Reserved funds not included in bankroll calculations
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Expense Buffer */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-400" />
                  Financial Buffers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="expense-buffer">Expense Buffer (months)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={[settings.expenseBuffer]}
                      onValueChange={(value) => updateSetting('expenseBuffer', value[0])}
                      max={12}
                      min={1}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-16 text-sm font-mono">{settings.expenseBuffer} mo</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Months of living expenses to keep separate
                  </p>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-300 mb-3">Risk Assessment</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Risk Level:</span>
                      <span className="text-green-400">
                        {settings.maxRiskOfRuin < 3 ? 'Very Low' : 
                         settings.maxRiskOfRuin < 7 ? 'Low' : 
                         settings.maxRiskOfRuin < 15 ? 'Moderate' : 'High'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Strategy:</span>
                      <span className="text-slate-200">
                        {settings.riskTolerance.charAt(0).toUpperCase() + settings.riskTolerance.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Buffer Coverage:</span>
                      <span className="text-blue-400">{settings.expenseBuffer} months</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="buyin" className="space-y-6 mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-green-400" />
                Buy-in Strategy Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label>Maximum Buy-in (% of bankroll)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={[settings.buyinStrategy.maxBuyinPercentage]}
                      onValueChange={(value) => updateSetting('buyinStrategy.maxBuyinPercentage', value[0])}
                      max={10}
                      min={1}
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="w-16 text-sm font-mono">{settings.buyinStrategy.maxBuyinPercentage.toFixed(1)}%</span>
                  </div>
                </div>

                <div>
                  <Label>ROI Threshold (%)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={[settings.buyinStrategy.gameSelectionCriteria.roiThreshold]}
                      onValueChange={(value) => updateSetting('buyinStrategy.gameSelectionCriteria.roiThreshold', value[0])}
                      max={25}
                      min={0}
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="w-16 text-sm font-mono">{settings.buyinStrategy.gameSelectionCriteria.roiThreshold.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label>Minimum Buy-in Range</Label>
                  <Input
                    type="number"
                    value={settings.buyinStrategy.recommendedRange.min}
                    onChange={(e) => updateSetting('buyinStrategy.recommendedRange.min', Number(e.target.value))}
                    className="bg-slate-700 border-slate-600 mt-2"
                  />
                </div>

                <div>
                  <Label>Maximum Buy-in Range</Label>
                  <Input
                    type="number"
                    value={settings.buyinStrategy.recommendedRange.max}
                    onChange={(e) => updateSetting('buyinStrategy.recommendedRange.max', Number(e.target.value))}
                    className="bg-slate-700 border-slate-600 mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label>Minimum Field Size</Label>
                  <Input
                    type="number"
                    value={settings.buyinStrategy.gameSelectionCriteria.minField}
                    onChange={(e) => updateSetting('buyinStrategy.gameSelectionCriteria.minField', Number(e.target.value))}
                    className="bg-slate-700 border-slate-600 mt-2"
                  />
                </div>

                <div>
                  <Label>Maximum Field Size</Label>
                  <Input
                    type="number"
                    value={settings.buyinStrategy.gameSelectionCriteria.maxField}
                    onChange={(e) => updateSetting('buyinStrategy.gameSelectionCriteria.maxField', Number(e.target.value))}
                    className="bg-slate-700 border-slate-600 mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staking" className="space-y-6 mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-400" />
                Staking Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label>Maximum Staked Percentage</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={[settings.stakingAllocation.maxStakedPercentage]}
                      onValueChange={(value) => updateSetting('stakingAllocation.maxStakedPercentage', value[0])}
                      max={50}
                      min={10}
                      step={5}
                      className="flex-1"
                    />
                    <span className="w-16 text-sm font-mono">{settings.stakingAllocation.maxStakedPercentage.toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Maximum percentage of bankroll that can be staked
                  </p>
                </div>

                <div>
                  <Label>Maximum Per Investor</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={[settings.stakingAllocation.investorDiversification.maxPerInvestor]}
                      onValueChange={(value) => updateSetting('stakingAllocation.investorDiversification.maxPerInvestor', value[0])}
                      max={40}
                      min={10}
                      step={5}
                      className="flex-1"
                    />
                    <span className="w-16 text-sm font-mono">{settings.stakingAllocation.investorDiversification.maxPerInvestor.toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Maximum percentage from single investor
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label>Minimum Markup</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={[settings.stakingAllocation.preferredMarkupRange.min]}
                      onValueChange={(value) => updateSetting('stakingAllocation.preferredMarkupRange.min', value[0])}
                      max={2.0}
                      min={1.0}
                      step={0.05}
                      className="flex-1"
                    />
                    <span className="w-16 text-sm font-mono">{settings.stakingAllocation.preferredMarkupRange.min.toFixed(2)}x</span>
                  </div>
                </div>

                <div>
                  <Label>Maximum Markup</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={[settings.stakingAllocation.preferredMarkupRange.max]}
                      onValueChange={(value) => updateSetting('stakingAllocation.preferredMarkupRange.max', value[0])}
                      max={3.0}
                      min={1.1}
                      step={0.05}
                      className="flex-1"
                    />
                    <span className="w-16 text-sm font-mono">{settings.stakingAllocation.preferredMarkupRange.max.toFixed(2)}x</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-300">Deal Preferences</h4>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-Settlement</Label>
                      <p className="text-xs text-slate-400">Process settlements automatically</p>
                    </div>
                    <Switch
                      checked={settings.stakingAllocation.dealStructurePreferences.autoSettlementEnabled}
                      onCheckedChange={(checked) => 
                        updateSetting('stakingAllocation.dealStructurePreferences.autoSettlementEnabled', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Performance Bonuses</Label>
                      <p className="text-xs text-slate-400">Enable performance-based bonuses</p>
                    </div>
                    <Switch
                      checked={settings.stakingAllocation.dealStructurePreferences.performanceBonusesEnabled}
                      onCheckedChange={(checked) => 
                        updateSetting('stakingAllocation.dealStructurePreferences.performanceBonusesEnabled', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Expense Pass-Through</Label>
                      <p className="text-xs text-slate-400">Share expenses with investors</p>
                    </div>
                    <Switch
                      checked={settings.stakingAllocation.dealStructurePreferences.expensePassThroughEnabled}
                      onCheckedChange={(checked) => 
                        updateSetting('stakingAllocation.dealStructurePreferences.expensePassThroughEnabled', checked)
                      }
                    />
                  </div>

                  <div>
                    <Label>Preferred Deal Length (months)</Label>
                    <Input
                      type="number"
                      value={settings.stakingAllocation.dealStructurePreferences.preferredDealLength}
                      onChange={(e) => updateSetting('stakingAllocation.dealStructurePreferences.preferredDealLength', Number(e.target.value))}
                      className="bg-slate-700 border-slate-600 mt-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6 mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-yellow-400" />
                Alert Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-400">Configure when you want to receive bankroll optimization alerts.</p>
              
              {/* Alert toggles and thresholds would go here */}
              <div className="text-center py-8">
                <Bell className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Alert configuration coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6 mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Calculator className="h-5 w-5 text-purple-400" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-400">Advanced configuration options for power users.</p>
              
              <div className="text-center py-8">
                <Calculator className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Advanced settings coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Changes Bar */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800 border border-slate-600 rounded-lg p-4 shadow-lg z-50"
        >
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">You have unsaved changes</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleReset}>
                Discard
              </Button>
              <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                Save Changes
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}