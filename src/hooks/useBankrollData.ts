import { useState, useEffect } from 'react'
import { 
  BankrollDashboardData, 
  StakingDeal, 
  Investor, 
  BankrollAlert, 
  SettlementCalculation,
  BankrollOptimizationSettings 
} from '@/types/bankroll'

// Demo data matching the execution specs: $127,500 bankroll with 
// Mike Johnson (20% @ 1.2x markup) and Sarah Chen (15% @ 1.15x markup)

const DEMO_BANKROLL_DATA: BankrollDashboardData = {
  summary: {
    totalBankroll: 127500,
    availableBankroll: 102000, // 20% in action
    stakedAmount: 25500,
    monthlyChange: 8.4,
    yearToDate: 23.7,
    lastUpdated: new Date()
  },
  stakingOverview: {
    activeDeals: 2,
    totalInvested: 45000,
    pendingSettlements: 1,
    totalReturned: 38400,
    averageMarkup: 1.175,
    investorSatisfaction: 94
  },
  riskMetrics: {
    currentRiskOfRuin: 2.3,
    recommendedBankroll: 120000,
    maxRecommendedBuyin: 5000,
    varianceScore: 7.2,
    confidenceLevel: 95
  },
  recentActivity: [
    {
      id: '1',
      type: 'tournament',
      description: 'WSOP Circuit Choctaw Main Event ($1,700)',
      amount: -1700,
      date: new Date('2026-02-01'),
      impact: 'negative'
    },
    {
      id: '2',
      type: 'settlement',
      description: 'Mike Johnson Q4 2025 Settlement',
      amount: 8400,
      date: new Date('2026-01-31'),
      impact: 'positive'
    },
    {
      id: '3',
      type: 'tournament',
      description: 'Cherokee Main Event 3rd Place ($24,500)',
      amount: 24500,
      date: new Date('2026-01-28'),
      impact: 'positive'
    },
    {
      id: '4',
      type: 'expense',
      description: 'Vegas travel expenses (WSOP)',
      amount: -850,
      date: new Date('2026-01-25'),
      impact: 'negative'
    }
  ],
  alerts: [],
  performance: {
    roi: 18.5,
    winRate: 23.4,
    averageScore: 12850,
    volumeMetrics: {
      tournamentsPlayed: 47,
      totalBuyins: 78500,
      avgBuyin: 1670,
      hoursPlayed: 342,
      biggestScore: 45200
    },
    trends: [
      { period: 'Jan 2026', metric: 'roi', value: 24.1, change: 5.6, trend: 'up' },
      { period: 'Dec 2025', metric: 'roi', value: 18.5, change: -2.3, trend: 'down' },
      { period: 'Nov 2025', metric: 'roi', value: 20.8, change: 7.2, trend: 'up' }
    ]
  },
  projections: {
    thirtyDay: {
      endingBankroll: 134200,
      riskOfRuin: 1.8,
      expectedReturn: 6700,
      volatility: 15.3,
      maxDrawdown: 8500
    },
    ninetyDay: {
      endingBankroll: 148600,
      riskOfRuin: 1.2,
      expectedReturn: 21100,
      volatility: 22.7,
      maxDrawdown: 15200
    },
    yearEnd: {
      endingBankroll: 186300,
      riskOfRuin: 0.8,
      expectedReturn: 58800,
      volatility: 31.4,
      maxDrawdown: 28400
    },
    assumptions: [
      { parameter: 'ROI', value: 18.5, confidence: 85, basedOn: '200-tournament sample' },
      { parameter: 'Variance', value: 2.1, confidence: 78, basedOn: 'Historical analysis' },
      { parameter: 'Game Selection', value: 1650, confidence: 92, basedOn: 'Current avg buy-in' }
    ]
  }
}

const DEMO_STAKING_DEALS: StakingDeal[] = [
  {
    id: 'deal_mike_johnson',
    investorId: 'investor_mike',
    investorName: 'Mike Johnson',
    percentage: 20,
    markup: 1.2,
    initialInvestment: 30000,
    currentBalance: 32400,
    startDate: new Date('2025-06-15'),
    dealType: 'tournament',
    status: 'active',
    autoSettlement: true,
    settlementSchedule: {
      frequency: 'monthly',
      autoPayoutThreshold: 1000,
      includeExpenses: true
    },
    profitSplit: {
      playerShare: 80,
      investorShare: 20,
      expenseHandling: 'split_proportionally'
    },
    lossTerms: {
      stopLossPercentage: 50,
      maxDrawdownAlert: 25,
      recoveryTerms: {
        breakEvenPayback: true,
        reducedMarkupUntilRecovery: false
      }
    }
  },
  {
    id: 'deal_sarah_chen',
    investorId: 'investor_sarah',
    investorName: 'Sarah Chen',
    percentage: 15,
    markup: 1.15,
    initialInvestment: 15000,
    currentBalance: 16100,
    startDate: new Date('2025-09-01'),
    dealType: 'tournament',
    status: 'active',
    autoSettlement: true,
    settlementSchedule: {
      frequency: 'tournament_end',
      autoPayoutThreshold: 500,
      includeExpenses: false
    },
    profitSplit: {
      playerShare: 85,
      investorShare: 15,
      expenseHandling: 'player_covers'
    },
    lossTerms: {
      stopLossPercentage: 40,
      maxDrawdownAlert: 20,
      recoveryTerms: {
        breakEvenPayback: true,
        reducedMarkupUntilRecovery: true,
        reducedMarkupRate: 1.05
      }
    }
  }
]

const DEMO_INVESTORS: Investor[] = [
  {
    id: 'investor_mike',
    name: 'Mike Johnson',
    email: 'mike.johnson@email.com',
    phone: '+1-555-0123',
    totalInvested: 30000,
    totalReturned: 28650,
    currentExposure: 32400,
    roi: 12.3,
    dealHistory: [DEMO_STAKING_DEALS[0]],
    paymentPreferences: {
      method: 'bank_transfer',
      accountDetails: { routing: '****1234', account: '****5678' },
      minimumPayout: 1000,
      currency: 'USD',
      taxWithholding: false
    },
    taxDocuments: [
      {
        id: 'tax_mike_2025',
        type: '1099_MISC',
        year: 2025,
        amount: 3650,
        generatedDate: new Date('2026-01-15'),
        sent: true
      }
    ],
    communicationPrefs: {
      resultNotifications: true,
      dailyUpdates: false,
      weeklyReports: true,
      monthlyStatements: true,
      alertThresholds: [
        { type: 'big_win', threshold: 10000, enabled: true },
        { type: 'big_loss', threshold: 5000, enabled: true },
        { type: 'drawdown', threshold: 15, enabled: true }
      ]
    }
  },
  {
    id: 'investor_sarah',
    name: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    phone: '+1-555-0456',
    totalInvested: 15000,
    totalReturned: 9750,
    currentExposure: 16100,
    roi: 8.7,
    dealHistory: [DEMO_STAKING_DEALS[1]],
    paymentPreferences: {
      method: 'venmo',
      accountDetails: { username: '@sarah-chen' },
      minimumPayout: 500,
      currency: 'USD',
      taxWithholding: false
    },
    taxDocuments: [],
    communicationPrefs: {
      resultNotifications: true,
      dailyUpdates: false,
      weeklyReports: false,
      monthlyStatements: true,
      alertThresholds: [
        { type: 'big_win', threshold: 5000, enabled: true },
        { type: 'big_loss', threshold: 3000, enabled: true },
        { type: 'milestone', threshold: 20, enabled: true }
      ]
    }
  }
]

const DEMO_ALERTS: BankrollAlert[] = [
  {
    id: 'alert_1',
    type: 'buyin_exceeds_percentage',
    threshold: 5,
    enabled: true,
    frequency: 'once',
    message: 'Buy-in for WSOP Main Event ($10,000) exceeds 5% of bankroll recommendation',
    actionRequired: true
  },
  {
    id: 'alert_2',
    type: 'staking_settlement_due',
    threshold: 30,
    enabled: true,
    frequency: 'daily',
    lastTriggered: new Date('2026-02-01'),
    message: 'Sarah Chen settlement due - Cherokee Main Event result pending',
    actionRequired: true
  }
]

const DEMO_SETTLEMENTS: SettlementCalculation[] = [
  {
    dealId: 'deal_mike_johnson',
    period: {
      start: new Date('2026-01-01'),
      end: new Date('2026-01-31')
    },
    totalWinnings: 24500,
    totalExpenses: 3200,
    netProfit: 21300,
    playerShare: 17040,
    investorShare: 4260,
    markup: 1.2,
    fees: [
      { type: 'processing', amount: 50, description: 'Payment processing fee' }
    ],
    finalPayout: 4210,
    breakdown: {
      tournaments: [
        {
          tournamentId: 'cherokee_main',
          buyIn: 1700,
          prize: 24500,
          netResult: 22800,
          investorAllocation: 4560,
          playerAllocation: 18240,
          markup: 1.2,
          date: new Date('2026-01-28')
        }
      ],
      expenses: [
        {
          expenseId: 'exp_travel_cherokee',
          totalAmount: 850,
          investorPortion: 170,
          playerPortion: 680,
          category: 'travel',
          date: new Date('2026-01-26')
        }
      ],
      adjustments: []
    }
  }
]

export function useBankrollData() {
  const [bankrollData, setBankrollData] = useState<BankrollDashboardData | null>(null)
  const [stakingDeals, setStakingDeals] = useState<StakingDeal[]>([])
  const [investors, setInvestors] = useState<Investor[]>([])
  const [alerts, setAlerts] = useState<BankrollAlert[]>([])
  const [settlements, setSettlements] = useState<SettlementCalculation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Load demo data
      setBankrollData(DEMO_BANKROLL_DATA)
      setStakingDeals(DEMO_STAKING_DEALS)
      setInvestors(DEMO_INVESTORS)
      setAlerts(DEMO_ALERTS)
      setSettlements(DEMO_SETTLEMENTS)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bankroll data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
  }, [])

  return {
    bankrollData,
    stakingDeals,
    investors,
    alerts,
    settlements,
    loading,
    error,
    refreshData
  }
}