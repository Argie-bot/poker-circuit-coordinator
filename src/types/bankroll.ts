// Advanced Bankroll & Staking Management Types
// Feature #3 - Professional poker player bankroll management with staking support

import { BankrollInfo } from './index'

export interface AdvancedBankrollInfo extends BankrollInfo {
  stakingDeals: StakingDeal[];
  riskOfRuin: RiskOfRuinData;
  optimizationSettings: BankrollOptimizationSettings;
  varianceModel: VarianceModelData;
  alertSettings: BankrollAlertSettings;
  taxSettings: TaxOptimizationSettings;
}

export interface StakingDeal {
  id: string;
  investorId: string;
  investorName: string;
  percentage: number; // 0-100 (e.g., 20 for 20%)
  markup: number; // multiplier (e.g., 1.2 for 1.2x markup)
  initialInvestment: number;
  currentBalance: number;
  startDate: Date;
  endDate?: Date;
  dealType: 'tournament' | 'cash' | 'mixed';
  status: 'active' | 'paused' | 'completed' | 'pending_settlement';
  autoSettlement: boolean;
  settlementSchedule: SettlementSchedule;
  profitSplit: ProfitSplitTerms;
  lossTerms: LossTerms;
  notes?: string;
}

export interface Investor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalInvested: number;
  totalReturned: number;
  currentExposure: number;
  roi: number;
  dealHistory: StakingDeal[];
  paymentPreferences: PaymentPreferences;
  taxDocuments: TaxDocument[];
  communicationPrefs: CommunicationPreferences;
}

export interface SettlementSchedule {
  frequency: 'immediate' | 'daily' | 'weekly' | 'tournament_end' | 'monthly';
  autoPayoutThreshold: number; // minimum amount before payout
  includeExpenses: boolean;
  taxWithholding?: number; // percentage
}

export interface ProfitSplitTerms {
  playerShare: number; // percentage (after markup)
  investorShare: number; // percentage
  expenseHandling: 'split_proportionally' | 'player_covers' | 'investor_covers';
  bonusTerms?: BonusTerms;
}

export interface BonusTerms {
  performanceThresholds: PerformanceThreshold[];
  loyaltyBonus?: LoyaltyBonus;
}

export interface PerformanceThreshold {
  roiTarget: number; // percentage
  bonusMultiplier: number; // additional markup
  timeframe: 'tournament' | 'monthly' | 'yearly';
}

export interface LoyaltyBonus {
  minDealLength: number; // months
  bonusPercentage: number;
}

export interface LossTerms {
  stopLossPercentage?: number; // percentage of investment
  maxDrawdownAlert: number; // percentage
  recoveryTerms: RecoveryTerms;
}

export interface RecoveryTerms {
  breakEvenPayback: boolean;
  reducedMarkupUntilRecovery: boolean;
  reducedMarkupRate?: number;
}

export interface PaymentPreferences {
  method: 'bank_transfer' | 'paypal' | 'venmo' | 'zelle' | 'crypto' | 'check';
  accountDetails: Record<string, string>;
  minimumPayout: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD';
  taxWithholding: boolean;
}

export interface TaxDocument {
  id: string;
  type: '1099_MISC' | 'K1' | 'custom';
  year: number;
  amount: number;
  filePath?: string;
  generatedDate: Date;
  sent: boolean;
}

export interface CommunicationPreferences {
  resultNotifications: boolean;
  dailyUpdates: boolean;
  weeklyReports: boolean;
  monthlyStatements: boolean;
  alertThresholds: AlertThreshold[];
}

export interface AlertThreshold {
  type: 'big_win' | 'big_loss' | 'drawdown' | 'milestone';
  threshold: number;
  enabled: boolean;
}

export interface RiskOfRuinData {
  currentRiskPercentage: number;
  recommendations: RiskRecommendation[];
  varianceMetrics: VarianceMetrics;
  sampleSize: SampleSizeAnalysis;
  confidenceIntervals: ConfidenceInterval[];
  lastCalculated: Date;
}

export interface RiskRecommendation {
  type: 'bankroll_increase' | 'buyin_reduction' | 'game_selection' | 'variance_management';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actionItems: string[];
  potentialImpact: number;
}

export interface VarianceMetrics {
  standardDeviation: number;
  winRate: number;
  averageBuyIn: number;
  averageScore: number;
  biggestUpswing: number;
  biggestDownswing: number;
  streakData: StreakData;
}

export interface StreakData {
  longestWinStreak: number;
  longestLosingStreak: number;
  currentStreak: {
    type: 'win' | 'loss';
    count: number;
    amount: number;
  };
}

export interface SampleSizeAnalysis {
  totalTournaments: number;
  requiredSampleSize: number;
  confidence: number; // percentage
  isStatisticallySignificant: boolean;
  monthsToReliableData: number;
}

export interface ConfidenceInterval {
  percentage: number; // 90, 95, 99
  lowerBound: number;
  upperBound: number;
  expectedValue: number;
}

export interface VarianceModelData {
  modelType: 'kelly_criterion' | 'simulation' | 'historical';
  parameters: VarianceModelParameters;
  projections: VarianceProjection[];
  backtestResults: BacktestResult[];
  calibrationDate: Date;
}

export interface VarianceModelParameters {
  winRate: number;
  averageMultiplier: number;
  standardDeviation: number;
  kurtosis: number;
  skewness: number;
  autocorrelation: number;
}

export interface VarianceProjection {
  timeHorizon: number; // months
  scenarios: {
    optimistic: ProjectionScenario;
    realistic: ProjectionScenario;
    pessimistic: ProjectionScenario;
  };
}

export interface ProjectionScenario {
  endingBankroll: number;
  riskOfRuin: number;
  expectedReturn: number;
  volatility: number;
  maxDrawdown: number;
}

export interface BacktestResult {
  period: {
    start: Date;
    end: Date;
  };
  actualVsPredicted: {
    actual: number;
    predicted: number;
    accuracy: number;
  };
  modelPerformance: ModelPerformanceMetrics;
}

export interface ModelPerformanceMetrics {
  meanAbsoluteError: number;
  rootMeanSquareError: number;
  r2Score: number;
  sharpeRatio: number;
}

export interface BankrollOptimizationSettings {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive' | 'custom';
  maxRiskOfRuin: number; // percentage
  targetROI: number;
  buyinStrategy: BuyinStrategy;
  stakingAllocation: StakingAllocation;
  expenseBuffer: number; // months of expenses
  emergencyFund: number;
}

export interface BuyinStrategy {
  maxBuyinPercentage: number; // of total bankroll
  recommendedRange: {
    min: number;
    max: number;
  };
  gameSelectionCriteria: GameSelectionCriteria;
  adjustmentTriggers: AdjustmentTrigger[];
}

export interface GameSelectionCriteria {
  minField: number;
  maxField: number;
  preferredStructures: string[];
  avoidCircuits: string[];
  roiThreshold: number;
}

export interface AdjustmentTrigger {
  condition: 'bankroll_change' | 'performance_change' | 'risk_increase';
  threshold: number;
  newStrategy: BuyinStrategy;
}

export interface StakingAllocation {
  maxStakedPercentage: number; // of bankroll in action
  preferredMarkupRange: {
    min: number;
    max: number;
  };
  investorDiversification: {
    maxPerInvestor: number;
    minInvestors: number;
  };
  dealStructurePreferences: DealStructurePreferences;
}

export interface DealStructurePreferences {
  preferredDealLength: number; // months
  performanceBonusesEnabled: boolean;
  autoSettlementEnabled: boolean;
  expensePassThroughEnabled: boolean;
}

export interface BankrollAlertSettings {
  alerts: BankrollAlert[];
  notificationMethods: NotificationMethod[];
  escalationRules: EscalationRule[];
}

export interface BankrollAlert {
  id: string;
  type: BankrollAlertType;
  threshold: number;
  enabled: boolean;
  frequency: 'once' | 'daily' | 'weekly';
  lastTriggered?: Date;
  message: string;
  actionRequired: boolean;
}

export type BankrollAlertType = 
  | 'buyin_exceeds_percentage'
  | 'risk_of_ruin_increased' 
  | 'drawdown_threshold'
  | 'staking_settlement_due'
  | 'bankroll_milestone'
  | 'expense_budget_exceeded'
  | 'variance_model_drift'
  | 'investor_communication_due';

export interface NotificationMethod {
  type: 'email' | 'sms' | 'push' | 'dashboard';
  enabled: boolean;
  alertTypes: BankrollAlertType[];
}

export interface EscalationRule {
  alertType: BankrollAlertType;
  timeWithoutResponse: number; // hours
  escalationAction: 'repeat' | 'escalate' | 'auto_action';
}

export interface TaxOptimizationSettings {
  playerStatus: 'recreational' | 'professional' | 'semi_professional';
  trackingMethod: 'session' | 'daily' | 'tournament';
  deductionCategories: TaxDeductionCategory[];
  estimatedTaxRate: number;
  quarterlyEstimates: boolean;
  professionalPreparationEnabled: boolean;
}

export interface TaxDeductionCategory {
  category: string;
  percentage: number; // of expenses deductible
  cap?: number; // annual cap
  documentation: DocumentationRequirement[];
}

export interface DocumentationRequirement {
  type: 'receipt' | 'mileage_log' | 'calendar' | 'bank_statement';
  required: boolean;
  notes?: string;
}

// Transaction and Settlement Types
export interface StakingTransaction {
  id: string;
  dealId: string;
  type: 'investment' | 'payout' | 'expense_adjustment' | 'settlement';
  amount: number;
  description: string;
  tournamentRef?: string;
  expenseRef?: string;
  date: Date;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
  confirmationNumber?: string;
  taxReportable: boolean;
}

export interface SettlementCalculation {
  dealId: string;
  period: {
    start: Date;
    end: Date;
  };
  totalWinnings: number;
  totalExpenses: number;
  netProfit: number;
  playerShare: number;
  investorShare: number;
  markup: number;
  fees: SettlementFee[];
  finalPayout: number;
  taxWithholding?: number;
  breakdown: SettlementBreakdown;
}

export interface SettlementFee {
  type: 'processing' | 'tax_prep' | 'admin' | 'platform';
  amount: number;
  percentage?: number;
  description: string;
}

export interface SettlementBreakdown {
  tournaments: TournamentResult[];
  expenses: ExpenseAllocation[];
  adjustments: SettlementAdjustment[];
}

export interface TournamentResult {
  tournamentId: string;
  buyIn: number;
  prize: number;
  netResult: number;
  investorAllocation: number;
  playerAllocation: number;
  markup: number;
  date: Date;
}

export interface ExpenseAllocation {
  expenseId: string;
  totalAmount: number;
  investorPortion: number;
  playerPortion: number;
  category: string;
  date: Date;
}

export interface SettlementAdjustment {
  type: 'bonus' | 'penalty' | 'correction' | 'fee';
  amount: number;
  reason: string;
  affectsInvestor: boolean;
  affectsPlayer: boolean;
}

// Dashboard and Analytics Types
export interface BankrollDashboardData {
  summary: BankrollSummary;
  stakingOverview: StakingOverview;
  riskMetrics: RiskMetrics;
  recentActivity: RecentActivity[];
  alerts: BankrollAlert[];
  performance: PerformanceMetrics;
  projections: BankrollProjections;
  optimizationSettings?: BankrollOptimizationSettings;
}

export interface BankrollSummary {
  totalBankroll: number;
  availableBankroll: number;
  stakedAmount: number;
  monthlyChange: number;
  yearToDate: number;
  lastUpdated: Date;
}

export interface StakingOverview {
  activeDeals: number;
  totalInvested: number;
  pendingSettlements: number;
  totalReturned: number;
  averageMarkup: number;
  investorSatisfaction: number; // 0-100 score
}

export interface RiskMetrics {
  currentRiskOfRuin: number;
  recommendedBankroll: number;
  maxRecommendedBuyin: number;
  varianceScore: number;
  confidenceLevel: number;
}

export interface RecentActivity {
  id: string;
  type: 'tournament' | 'settlement' | 'investment' | 'expense' | 'adjustment';
  description: string;
  amount: number;
  date: Date;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface PerformanceMetrics {
  roi: number;
  winRate: number;
  averageScore: number;
  volumeMetrics: VolumeMetrics;
  trends: PerformanceTrend[];
}

export interface VolumeMetrics {
  tournamentsPlayed: number;
  totalBuyins: number;
  avgBuyin: number;
  hoursPlayed: number;
  biggestScore: number;
}

export interface PerformanceTrend {
  period: string;
  metric: 'roi' | 'winrate' | 'variance' | 'volume';
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface BankrollProjections {
  thirtyDay: ProjectionScenario;
  ninetyDay: ProjectionScenario;
  yearEnd: ProjectionScenario;
  assumptions: ProjectionAssumption[];
}

export interface ProjectionAssumption {
  parameter: string;
  value: number;
  confidence: number;
  basedOn: string;
}

// Integration Types with Existing Systems
export interface ExpenseBankrollIntegration {
  linkToTournament: (expenseId: string, tournamentId: string) => void;
  allocateToStakingDeals: (expenseId: string, allocation: StakingExpenseAllocation[]) => void;
  updateBankrollFromExpense: (expenseId: string, amount: number) => void;
  generateTaxDeductionReport: (period: DatePeriod) => TaxDeductionReport;
}

export interface StakingExpenseAllocation {
  dealId: string;
  percentage: number;
  amount: number;
}

export interface DatePeriod {
  start: Date;
  end: Date;
}

export interface TaxDeductionReport {
  totalDeductions: number;
  categoryBreakdown: Record<string, number>;
  documentationStatus: DocumentationStatus[];
  estimatedTaxSavings: number;
}

export interface DocumentationStatus {
  category: string;
  required: number;
  provided: number;
  missing: string[];
}

// Re-export the base BankrollInfo if needed for compatibility
export type { BankrollInfo } from './index';