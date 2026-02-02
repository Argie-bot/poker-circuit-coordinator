'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calculator, 
  AlertTriangle, 
  TrendingUp, 
  Target,
  BarChart3,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface RiskOfRuinCalculatorProps {
  isOpen: boolean
  onClose: () => void
  currentBankroll: number
}

interface CalculationInputs {
  bankroll: number
  averageBuyIn: number
  roi: number
  standardDeviation: number
  winRate: number
  sampleSize: number
}

interface RiskResult {
  riskOfRuin: number
  recommendedBankroll: number
  maxSafeBuyIn: number
  confidenceLevel: number
  kellyCriterion: number
  timeToDoubling: number
  varianceFactors: VarianceFactor[]
}

interface VarianceFactor {
  factor: string
  impact: 'low' | 'medium' | 'high'
  description: string
  value: number
}

interface SimulationResult {
  trial: number
  finalBankroll: number
  maxDrawdown: number
  timeToRuin?: number
}

export function RiskOfRuinCalculator({ isOpen, onClose, currentBankroll }: RiskOfRuinCalculatorProps) {
  const [inputs, setInputs] = useState<CalculationInputs>({
    bankroll: currentBankroll,
    averageBuyIn: 1650,
    roi: 18.5,
    standardDeviation: 2.1,
    winRate: 23.4,
    sampleSize: 200
  })

  const [result, setResult] = useState<RiskResult | null>(null)
  const [simulations, setSimulations] = useState<SimulationResult[]>([])
  const [activeTab, setActiveTab] = useState('calculator')
  const [isCalculating, setIsCalculating] = useState(false)

  // Monte Carlo simulation parameters
  const [simulationParams, setSimulationParams] = useState({
    trials: 10000,
    timeHorizon: 1000, // tournaments
    includeVariance: true
  })

  const calculateRiskOfRuin = () => {
    setIsCalculating(true)
    
    // Simplified risk of ruin calculation (Kelly Criterion based)
    const expectedValue = inputs.roi / 100
    const variance = Math.pow(inputs.standardDeviation, 2)
    const kellyCriterion = expectedValue / variance
    const riskPerTournament = inputs.averageBuyIn / inputs.bankroll
    
    // Basic risk of ruin formula (simplified)
    const riskOfRuin = Math.max(0, Math.min(100, 
      Math.pow((1 - expectedValue) / (1 + expectedValue), inputs.bankroll / inputs.averageBuyIn) * 100
    ))

    // Recommendations based on Kelly Criterion
    const optimalBankroll = inputs.averageBuyIn * (1 / kellyCriterion) * 20 // Conservative multiplier
    const maxSafeBuyIn = inputs.bankroll * kellyCriterion * 0.25 // Conservative Kelly
    
    // Time calculations
    const avgProfit = inputs.averageBuyIn * (inputs.roi / 100)
    const timeToDoubling = inputs.bankroll / avgProfit

    // Variance analysis
    const varianceFactors: VarianceFactor[] = [
      {
        factor: 'Game Selection',
        impact: inputs.standardDeviation > 3 ? 'high' : inputs.standardDeviation > 2 ? 'medium' : 'low',
        description: 'Field size and structure variance',
        value: inputs.standardDeviation
      },
      {
        factor: 'Sample Size',
        impact: inputs.sampleSize < 100 ? 'high' : inputs.sampleSize < 300 ? 'medium' : 'low',
        description: 'Statistical confidence in ROI',
        value: inputs.sampleSize
      },
      {
        factor: 'Win Rate',
        impact: inputs.winRate < 15 ? 'high' : inputs.winRate < 25 ? 'medium' : 'low',
        description: 'Consistency of profitable results',
        value: inputs.winRate
      }
    ]

    const newResult: RiskResult = {
      riskOfRuin: Math.max(0.1, riskOfRuin),
      recommendedBankroll: optimalBankroll,
      maxSafeBuyIn: Math.min(maxSafeBuyIn, inputs.bankroll * 0.1),
      confidenceLevel: Math.min(95, 60 + (inputs.sampleSize / 10)),
      kellyCriterion: kellyCriterion * 100,
      timeToDoubling: timeToDoubling,
      varianceFactors
    }

    setResult(newResult)
    
    // Run Monte Carlo simulation
    setTimeout(() => {
      runMonteCarloSimulation()
      setIsCalculating(false)
    }, 500)
  }

  const runMonteCarloSimulation = () => {
    const trials = simulationParams.trials
    const results: SimulationResult[] = []
    
    for (let i = 0; i < Math.min(trials, 1000); i++) { // Limit for demo
      let bankroll = inputs.bankroll
      let maxDrawdown = 0
      let timeToRuin: number | undefined
      
      for (let tournament = 0; tournament < simulationParams.timeHorizon; tournament++) {
        // Random tournament result based on inputs
        const random = Math.random()
        let tournamentResult: number
        
        if (random < inputs.winRate / 100) {
          // Win - use geometric distribution for prize size
          const multiplier = 1 + Math.random() * 10 // Simplified prize distribution
          tournamentResult = inputs.averageBuyIn * multiplier - inputs.averageBuyIn
        } else {
          // Loss
          tournamentResult = -inputs.averageBuyIn
        }
        
        // Add variance
        if (simulationParams.includeVariance) {
          const varianceAdjustment = (Math.random() - 0.5) * inputs.standardDeviation * inputs.averageBuyIn
          tournamentResult += varianceAdjustment
        }
        
        bankroll += tournamentResult
        const drawdown = ((inputs.bankroll - bankroll) / inputs.bankroll) * 100
        maxDrawdown = Math.max(maxDrawdown, drawdown)
        
        if (bankroll <= 0) {
          timeToRuin = tournament
          break
        }
      }
      
      results.push({
        trial: i,
        finalBankroll: Math.max(0, bankroll),
        maxDrawdown,
        timeToRuin
      })
    }
    
    setSimulations(results)
  }

  const updateInput = (field: keyof CalculationInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }))
  }

  const getRiskColor = (risk: number) => {
    if (risk < 5) return 'text-green-400'
    if (risk < 15) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getRiskLevel = (risk: number) => {
    if (risk < 5) return 'Low Risk'
    if (risk < 15) return 'Medium Risk'
    return 'High Risk'
  }

  // Chart data for risk visualization
  const bankrollSizeData = Array.from({ length: 10 }, (_, i) => {
    const size = inputs.bankroll * (0.5 + i * 0.1)
    const riskAtSize = Math.pow((1 - inputs.roi/100) / (1 + inputs.roi/100), size / inputs.averageBuyIn) * 100
    return {
      bankrollSize: size / 1000,
      risk: Math.max(0.1, riskAtSize)
    }
  })

  const buyinSizeData = Array.from({ length: 20 }, (_, i) => {
    const buyin = inputs.averageBuyIn * (0.2 + i * 0.1)
    const riskAtBuyin = Math.pow((1 - inputs.roi/100) / (1 + inputs.roi/100), inputs.bankroll / buyin) * 100
    return {
      buyinSize: buyin,
      risk: Math.max(0.1, Math.min(100, riskAtBuyin))
    }
  })

  useEffect(() => {
    if (inputs.bankroll > 0 && inputs.averageBuyIn > 0) {
      calculateRiskOfRuin()
    }
  }, [inputs])

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <Calculator className="h-6 w-6 text-green-400" />
                Risk of Ruin Calculator
                <Badge variant="outline" className="border-green-600 text-green-400">
                  Advanced Variance Modeling
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                <TabsTrigger value="calculator">Calculator</TabsTrigger>
                <TabsTrigger value="simulation">Monte Carlo</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="calculator" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Input Panel */}
                  <Card className="bg-slate-900/50 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-lg">Input Parameters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label htmlFor="bankroll">Current Bankroll</Label>
                        <Input
                          id="bankroll"
                          type="number"
                          value={inputs.bankroll}
                          onChange={(e) => updateInput('bankroll', Number(e.target.value))}
                          className="bg-slate-800 border-slate-600"
                        />
                      </div>

                      <div>
                        <Label htmlFor="buyin">Average Buy-in</Label>
                        <Input
                          id="buyin"
                          type="number"
                          value={inputs.averageBuyIn}
                          onChange={(e) => updateInput('averageBuyIn', Number(e.target.value))}
                          className="bg-slate-800 border-slate-600"
                        />
                      </div>

                      <div>
                        <Label htmlFor="roi">ROI (%)</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <Slider
                            value={[inputs.roi]}
                            onValueChange={(value) => updateInput('roi', value[0])}
                            max={50}
                            min={-20}
                            step={0.5}
                            className="flex-1"
                          />
                          <span className="w-16 text-sm font-mono">{inputs.roi.toFixed(1)}%</span>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="std">Standard Deviation</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <Slider
                            value={[inputs.standardDeviation]}
                            onValueChange={(value) => updateInput('standardDeviation', value[0])}
                            max={5}
                            min={1}
                            step={0.1}
                            className="flex-1"
                          />
                          <span className="w-16 text-sm font-mono">{inputs.standardDeviation.toFixed(1)}</span>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="winrate">Win Rate (%)</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <Slider
                            value={[inputs.winRate]}
                            onValueChange={(value) => updateInput('winRate', value[0])}
                            max={50}
                            min={5}
                            step={0.5}
                            className="flex-1"
                          />
                          <span className="w-16 text-sm font-mono">{inputs.winRate.toFixed(1)}%</span>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="sample">Sample Size (tournaments)</Label>
                        <Input
                          id="sample"
                          type="number"
                          value={inputs.sampleSize}
                          onChange={(e) => updateInput('sampleSize', Number(e.target.value))}
                          className="bg-slate-800 border-slate-600"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Results Panel */}
                  <Card className="bg-slate-900/50 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-lg">Risk Assessment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {isCalculating ? (
                        <div className="animate-pulse space-y-4">
                          <div className="h-4 bg-slate-700 rounded"></div>
                          <div className="h-8 bg-slate-700 rounded"></div>
                          <div className="h-4 bg-slate-700 rounded"></div>
                        </div>
                      ) : result ? (
                        <>
                          <div className="text-center">
                            <h3 className="text-lg font-medium text-slate-300 mb-2">Risk of Ruin</h3>
                            <div className={`text-4xl font-bold ${getRiskColor(result.riskOfRuin)}`}>
                              {result.riskOfRuin.toFixed(2)}%
                            </div>
                            <Badge variant="outline" className={`mt-2 ${
                              result.riskOfRuin < 5 ? 'border-green-600 text-green-400' :
                              result.riskOfRuin < 15 ? 'border-yellow-600 text-yellow-400' :
                              'border-red-600 text-red-400'
                            }`}>
                              {getRiskLevel(result.riskOfRuin)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-slate-400">Recommended Bankroll</p>
                              <p className="text-xl font-bold text-blue-400">
                                ${result.recommendedBankroll.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-400">Max Safe Buy-in</p>
                              <p className="text-xl font-bold text-green-400">
                                ${result.maxSafeBuyIn.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-slate-400">Kelly Criterion</p>
                              <p className="text-lg font-bold">{result.kellyCriterion.toFixed(2)}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-400">Confidence Level</p>
                              <p className="text-lg font-bold">{result.confidenceLevel.toFixed(0)}%</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-slate-400 mb-2">Time to Double Bankroll</p>
                            <p className="text-lg font-bold text-purple-400">
                              {result.timeToDoubling.toFixed(0)} tournaments
                            </p>
                          </div>

                          <div>
                            <h4 className="font-medium text-slate-300 mb-3">Variance Factors</h4>
                            <div className="space-y-2">
                              {result.varianceFactors.map((factor, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <span className="text-sm text-slate-400">{factor.factor}</span>
                                  <Badge variant="outline" className={
                                    factor.impact === 'high' ? 'border-red-600 text-red-400' :
                                    factor.impact === 'medium' ? 'border-yellow-600 text-yellow-400' :
                                    'border-green-600 text-green-400'
                                  }>
                                    {factor.impact}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : null}
                    </CardContent>
                  </Card>
                </div>

                {/* Risk Visualization */}
                {result && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-slate-900/50 border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-sm">Risk vs Bankroll Size</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={bankrollSizeData}>
                              <defs>
                                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis dataKey="bankrollSize" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1f2937', 
                                  border: '1px solid #374151',
                                  borderRadius: '8px',
                                  color: '#fff'
                                }}
                                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Risk of Ruin']}
                                labelFormatter={(value: number) => `Bankroll: $${(value * 1000).toLocaleString()}`}
                              />
                              <Area
                                type="monotone"
                                dataKey="risk"
                                stroke="#ef4444"
                                strokeWidth={2}
                                fill="url(#riskGradient)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-sm">Risk vs Buy-in Size</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={buyinSizeData}>
                              <defs>
                                <linearGradient id="buyinGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis dataKey="buyinSize" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1f2937', 
                                  border: '1px solid #374151',
                                  borderRadius: '8px',
                                  color: '#fff'
                                }}
                                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Risk of Ruin']}
                                labelFormatter={(value: number) => `Buy-in: $${value.toLocaleString()}`}
                              />
                              <Area
                                type="monotone"
                                dataKey="risk"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                fill="url(#buyinGradient)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="simulation" className="space-y-6 mt-6">
                <Card className="bg-slate-900/50 border-slate-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                      Monte Carlo Simulation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <Label>Simulation Trials</Label>
                        <Input
                          type="number"
                          value={simulationParams.trials}
                          onChange={(e) => setSimulationParams(prev => ({
                            ...prev, 
                            trials: Number(e.target.value)
                          }))}
                          className="bg-slate-800 border-slate-600"
                        />
                      </div>
                      <div>
                        <Label>Time Horizon (tournaments)</Label>
                        <Input
                          type="number"
                          value={simulationParams.timeHorizon}
                          onChange={(e) => setSimulationParams(prev => ({
                            ...prev, 
                            timeHorizon: Number(e.target.value)
                          }))}
                          className="bg-slate-800 border-slate-600"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-8">
                        <input
                          type="checkbox"
                          checked={simulationParams.includeVariance}
                          onChange={(e) => setSimulationParams(prev => ({
                            ...prev, 
                            includeVariance: e.target.checked
                          }))}
                        />
                        <Label>Include Variance</Label>
                      </div>
                    </div>

                    <Button 
                      onClick={calculateRiskOfRuin}
                      disabled={isCalculating}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isCalculating ? 'Running Simulation...' : 'Run New Simulation'}
                    </Button>

                    {simulations.length > 0 && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="bg-slate-800/50 border-slate-700">
                          <CardContent className="p-4">
                            <h4 className="font-medium text-slate-300 mb-2">Ruin Rate</h4>
                            <p className="text-2xl font-bold text-red-400">
                              {((simulations.filter(s => s.timeToRuin !== undefined).length / simulations.length) * 100).toFixed(1)}%
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                          <CardContent className="p-4">
                            <h4 className="font-medium text-slate-300 mb-2">Avg Final Bankroll</h4>
                            <p className="text-2xl font-bold text-green-400">
                              ${(simulations.reduce((sum, s) => sum + s.finalBankroll, 0) / simulations.length).toLocaleString()}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                          <CardContent className="p-4">
                            <h4 className="font-medium text-slate-300 mb-2">Max Drawdown</h4>
                            <p className="text-2xl font-bold text-yellow-400">
                              {(simulations.reduce((sum, s) => sum + s.maxDrawdown, 0) / simulations.length).toFixed(1)}%
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6 mt-6">
                <Card className="bg-slate-900/50 border-slate-600">
                  <CardHeader>
                    <CardTitle>Bankroll Management Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result && (
                      <>
                        <div className="space-y-3">
                          {result.riskOfRuin < 5 ? (
                            <div className="flex items-start gap-3 p-3 bg-green-900/20 rounded-lg border border-green-600">
                              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-green-400">Excellent Bankroll Management</h4>
                                <p className="text-sm text-slate-300">Your risk of ruin is very low. You can continue with your current strategy.</p>
                              </div>
                            </div>
                          ) : result.riskOfRuin < 15 ? (
                            <div className="flex items-start gap-3 p-3 bg-yellow-900/20 rounded-lg border border-yellow-600">
                              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-yellow-400">Moderate Risk</h4>
                                <p className="text-sm text-slate-300">Consider reducing buy-ins or increasing bankroll to improve safety.</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3 p-3 bg-red-900/20 rounded-lg border border-red-600">
                              <XCircle className="h-5 w-5 text-red-400 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-red-400">High Risk</h4>
                                <p className="text-sm text-slate-300">Your current strategy has significant ruin risk. Consider major adjustments.</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-slate-300 mb-3">Recommended Actions</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                              <li>• Target bankroll: ${result.recommendedBankroll.toLocaleString()}</li>
                              <li>• Max buy-in: ${result.maxSafeBuyIn.toLocaleString()}</li>
                              <li>• Kelly percentage: {result.kellyCriterion.toFixed(1)}%</li>
                              <li>• Increase sample size to improve confidence</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-300 mb-3">Risk Factors</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                              {result.varianceFactors.map((factor, index) => (
                                <li key={index}>• {factor.factor}: {factor.impact} impact</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={onClose} className="border-slate-600">
                Close
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                Apply Recommendations
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}