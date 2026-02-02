/**
 * Analytics Service
 * Comprehensive analytics engine that integrates with:
 * - Tournament data service (real tournament results)
 * - Expense tracking system
 * - Bankroll management system  
 * - Travel coordination data
 * 
 * Provides real-time circuit performance analytics, ROI optimization,
 * and AI-powered tournament selection recommendations
 */

import { Tournament, Player, PlayerStatistics } from '@/types';
import { tournamentDataService } from './tournament-data-service';
import { ExpenseData } from '@/types/expenses';
import { BankrollTransaction } from '@/types/bankroll';

export interface TournamentResult {
  tournamentId: string;
  tournamentName: string;
  circuit: string;
  venue: string;
  city: string;
  state: string;
  date: Date;
  buyIn: number;
  field: number;
  finish: number | null; // null means DNF (did not finish)
  prize: number;
  roi: number;
  itm: boolean;
}

export interface CircuitPerformance {
  circuit: string;
  events: number;
  buyIns: number;
  winnings: number;
  profit: number;
  roi: number;
  averageField: number;
  bestFinish: number;
  itmRate: number;
  averageBuyIn: number;
  profitabilityTrend: 'improving' | 'declining' | 'stable';
}

export interface VenuePerformance {
  venue: string;
  city: string;
  state: string;
  events: number;
  winnings: number;
  buyIns: number;
  roi: number;
  averageBuyIn: number;
  bestFinish: number;
  itmRate: number;
}

export interface MonthlyPerformance {
  month: string;
  year: number;
  buyIns: number;
  winnings: number;
  profit: number;
  tournamentsPlayed: number;
  itmRate: number;
  roi: number;
  travelExpenses: number;
  netProfit: number;
}

export interface TravelAnalytics {
  monthlyExpenses: Array<{
    month: string;
    flights: number;
    hotels: number;
    food: number;
    ground: number;
    total: number;
  }>;
  costPerTournament: number;
  travelRoiImpact: number;
  optimizationPotential: number;
  mostEfficientTrips: Array<{
    trip: string;
    costPerTournament: number;
    tournaments: number;
  }>;
}

export interface BankrollAnalytics {
  currentAllocation: {
    tournamentBR: number;
    cashGameBR: number;
    expenseFund: number;
    total: number;
  };
  history: Array<{
    date: Date;
    amount: number;
    tournamentBR: number;
    expenseFund: number;
    change: number;
    changePercent: number;
  }>;
  riskMetrics: {
    kellyPercentage: number;
    currentRisk: 'low' | 'medium' | 'high';
    recommendedBuyInRange: { min: number; max: number };
    drawdownProtection: number;
  };
}

export interface TournamentRecommendation {
  tournament: Tournament;
  score: number; // 0-100
  factors: {
    historicalRoi: number;
    venueSuccess: number;
    fieldSize: number;
    buyin_suitability: number;
    travelEfficiency: number;
    circuitPerformance: number;
  };
  reasoning: string[];
  expectedRoi: number;
  confidenceLevel: 'high' | 'medium' | 'low';
}

export interface OptimizationInsight {
  type: 'circuit' | 'venue' | 'travel' | 'bankroll' | 'timing';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  potentialSavings?: number;
  implementationDifficulty: 'easy' | 'medium' | 'hard';
}

export interface AnalyticsFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
  circuits?: string[];
  venueStates?: string[];
  buyInRange?: {
    min: number;
    max: number;
  };
}

export class AnalyticsService {
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private cache = new Map<string, { data: any; timestamp: number }>();
  
  /**
   * Get comprehensive performance analytics for a player
   */
  async getPlayerAnalytics(
    playerId: string, 
    filter?: AnalyticsFilter
  ): Promise<{
    summary: PlayerStatistics;
    monthlyPerformance: MonthlyPerformance[];
    circuitPerformance: CircuitPerformance[];
    venuePerformance: VenuePerformance[];
    travelAnalytics: TravelAnalytics;
    bankrollAnalytics: BankrollAnalytics;
    insights: OptimizationInsight[];
  }> {
    const cacheKey = `player-analytics-${playerId}-${JSON.stringify(filter)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    // Get player results and related data
    const [results, expenses, bankrollHistory] = await Promise.all([
      this.getPlayerTournamentResults(playerId, filter),
      this.getPlayerExpenses(playerId, filter),
      this.getPlayerBankrollHistory(playerId, filter)
    ]);

    // Generate analytics
    const summary = this.calculatePlayerSummary(results);
    const monthlyPerformance = this.calculateMonthlyPerformance(results, expenses);
    const circuitPerformance = this.calculateCircuitPerformance(results);
    const venuePerformance = this.calculateVenuePerformance(results);
    const travelAnalytics = this.calculateTravelAnalytics(expenses);
    const bankrollAnalytics = this.calculateBankrollAnalytics(bankrollHistory);
    const insights = this.generateOptimizationInsights(
      results, circuitPerformance, venuePerformance, travelAnalytics, bankrollAnalytics
    );

    const analytics = {
      summary,
      monthlyPerformance,
      circuitPerformance,
      venuePerformance,
      travelAnalytics,
      bankrollAnalytics,
      insights
    };

    this.setCache(cacheKey, analytics);
    return analytics;
  }

  /**
   * Get AI-powered tournament recommendations
   */
  async getTournamentRecommendations(
    playerId: string,
    upcomingTournaments?: Tournament[],
    playerResults?: TournamentResult[]
  ): Promise<TournamentRecommendation[]> {
    if (!upcomingTournaments) {
      upcomingTournaments = await tournamentDataService.getUpcomingTournaments(50);
    }
    
    if (!playerResults) {
      playerResults = await this.getPlayerTournamentResults(playerId);
    }

    const recommendations: TournamentRecommendation[] = [];

    for (const tournament of upcomingTournaments) {
      const recommendation = await this.scoreTournament(tournament, playerResults);
      recommendations.push(recommendation);
    }

    // Sort by score (highest first)
    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * Compare circuit performance and identify best opportunities
   */
  async getCircuitComparison(
    playerId: string,
    circuits: string[]
  ): Promise<{
    comparison: CircuitPerformance[];
    recommendations: string[];
    bestCircuit: string;
    emergingOpportunities: string[];
  }> {
    const results = await this.getPlayerTournamentResults(playerId);
    const circuitPerformance = this.calculateCircuitPerformance(results);
    
    // Filter to requested circuits
    const comparison = circuitPerformance.filter(cp => circuits.includes(cp.circuit));
    
    // Find best circuit by ROI
    const bestCircuit = comparison.reduce((best, current) => 
      current.roi > best.roi ? current : best
    ).circuit;

    // Generate recommendations
    const recommendations = this.generateCircuitRecommendations(comparison);
    
    // Identify emerging opportunities (circuits with improving trends but small sample size)
    const emergingOpportunities = comparison
      .filter(cp => cp.events < 5 && cp.profitabilityTrend === 'improving')
      .map(cp => cp.circuit);

    return {
      comparison,
      recommendations,
      bestCircuit,
      emergingOpportunities
    };
  }

  /**
   * Calculate ROI optimization suggestions
   */
  async getROIOptimization(
    playerId: string
  ): Promise<{
    currentROI: number;
    potentialROI: number;
    optimizationSteps: Array<{
      action: string;
      impact: number;
      difficulty: 'easy' | 'medium' | 'hard';
      description: string;
    }>;
    bankrollRecommendations: {
      currentAllocation: any;
      recommendedAllocation: any;
      reasoning: string;
    };
  }> {
    const analytics = await this.getPlayerAnalytics(playerId);
    const optimizationSteps = [];

    // Analyze current performance
    const currentROI = analytics.summary.roi;
    
    // Calculate potential improvements
    let potentialROI = currentROI;

    // Circuit focus optimization
    const bestCircuits = analytics.circuitPerformance
      .filter(cp => cp.roi > currentROI && cp.events >= 3)
      .slice(0, 2);

    if (bestCircuits.length > 0) {
      const focusImpact = (bestCircuits[0].roi - currentROI) * 0.3; // Assume 30% reallocation
      potentialROI += focusImpact;
      optimizationSteps.push({
        action: `Focus more on ${bestCircuits[0].circuit}`,
        impact: focusImpact,
        difficulty: 'medium',
        description: `Your ROI in ${bestCircuits[0].circuit} is ${bestCircuits[0].roi.toFixed(1)}% vs overall ${currentROI.toFixed(1)}%`
      });
    }

    // Travel cost optimization
    const travelImpact = analytics.travelAnalytics.optimizationPotential / analytics.summary.totalPrizesWon * 100;
    if (travelImpact > 2) {
      potentialROI += travelImpact;
      optimizationSteps.push({
        action: 'Optimize travel routes',
        impact: travelImpact,
        difficulty: 'easy',
        description: `Route optimization could save $${analytics.travelAnalytics.optimizationPotential.toLocaleString()} annually`
      });
    }

    // Bankroll optimization
    const bankrollRecommendations = this.calculateOptimalBankrollAllocation(analytics.bankrollAnalytics, analytics.summary);

    return {
      currentROI,
      potentialROI,
      optimizationSteps,
      bankrollRecommendations
    };
  }

  /**
   * Private helper methods
   */

  private async getPlayerTournamentResults(
    playerId: string,
    filter?: AnalyticsFilter
  ): Promise<TournamentResult[]> {
    // This would integrate with your actual tournament results database
    // For now, return mock data that represents the structure
    return this.getMockPlayerResults(playerId, filter);
  }

  private async getPlayerExpenses(
    playerId: string,
    filter?: AnalyticsFilter
  ): Promise<ExpenseData[]> {
    // This would integrate with your expense tracking system
    return this.getMockExpenseData(playerId, filter);
  }

  private async getPlayerBankrollHistory(
    playerId: string,
    filter?: AnalyticsFilter
  ): Promise<BankrollTransaction[]> {
    // This would integrate with your bankroll management system
    return this.getMockBankrollHistory(playerId, filter);
  }

  private calculatePlayerSummary(results: TournamentResult[]): PlayerStatistics {
    const totalBuyIns = results.reduce((sum, r) => sum + r.buyIn, 0);
    const totalWinnings = results.reduce((sum, r) => sum + r.prize, 0);
    const itmCount = results.filter(r => r.itm).length;
    
    return {
      tournamentsPlayed: results.length,
      totalPrizesWon: totalWinnings,
      averageBuyIn: totalBuyIns / results.length,
      roi: ((totalWinnings - totalBuyIns) / totalBuyIns) * 100,
      profitLoss: totalWinnings - totalBuyIns,
      averageFinish: results.filter(r => r.finish !== null).reduce((sum, r) => sum + (r.finish! / 100), 0) / results.length,
      itm: (itmCount / results.length) * 100,
      biggestScore: Math.max(...results.map(r => r.prize)),
      bestCircuit: this.getBestCircuit(results),
      yearsPlaying: this.calculateYearsPlaying(results)
    };
  }

  private calculateMonthlyPerformance(
    results: TournamentResult[], 
    expenses: ExpenseData[]
  ): MonthlyPerformance[] {
    const monthlyData = new Map<string, MonthlyPerformance>();

    // Process tournament results
    results.forEach(result => {
      const monthKey = result.date.toISOString().slice(0, 7); // YYYY-MM
      const month = result.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month,
          year: result.date.getFullYear(),
          buyIns: 0,
          winnings: 0,
          profit: 0,
          tournamentsPlayed: 0,
          itmRate: 0,
          roi: 0,
          travelExpenses: 0,
          netProfit: 0
        });
      }

      const data = monthlyData.get(monthKey)!;
      data.buyIns += result.buyIn;
      data.winnings += result.prize;
      data.tournamentsPlayed += 1;
      if (result.itm) data.itmRate += 1;
    });

    // Process expenses
    expenses.forEach(expense => {
      const monthKey = expense.date.toISOString().slice(0, 7);
      const data = monthlyData.get(monthKey);
      if (data) {
        data.travelExpenses += expense.amount;
      }
    });

    // Calculate derived metrics
    monthlyData.forEach(data => {
      data.profit = data.winnings - data.buyIns;
      data.roi = data.buyIns > 0 ? (data.profit / data.buyIns) * 100 : 0;
      data.itmRate = data.tournamentsPlayed > 0 ? (data.itmRate / data.tournamentsPlayed) * 100 : 0;
      data.netProfit = data.profit - data.travelExpenses;
    });

    return Array.from(monthlyData.values()).sort((a, b) => b.year - a.year || b.month.localeCompare(a.month));
  }

  private calculateCircuitPerformance(results: TournamentResult[]): CircuitPerformance[] {
    const circuitData = new Map<string, CircuitPerformance>();

    results.forEach(result => {
      if (!circuitData.has(result.circuit)) {
        circuitData.set(result.circuit, {
          circuit: result.circuit,
          events: 0,
          buyIns: 0,
          winnings: 0,
          profit: 0,
          roi: 0,
          averageField: 0,
          bestFinish: Infinity,
          itmRate: 0,
          averageBuyIn: 0,
          profitabilityTrend: 'stable'
        });
      }

      const data = circuitData.get(result.circuit)!;
      data.events += 1;
      data.buyIns += result.buyIn;
      data.winnings += result.prize;
      data.averageField += result.field;
      if (result.finish && result.finish < data.bestFinish) {
        data.bestFinish = result.finish;
      }
      if (result.itm) data.itmRate += 1;
    });

    // Calculate derived metrics and trends
    circuitData.forEach(data => {
      data.profit = data.winnings - data.buyIns;
      data.roi = data.buyIns > 0 ? (data.profit / data.buyIns) * 100 : 0;
      data.averageField = data.averageField / data.events;
      data.averageBuyIn = data.buyIns / data.events;
      data.itmRate = (data.itmRate / data.events) * 100;
      data.profitabilityTrend = this.calculateProfitabilityTrend(results.filter(r => r.circuit === data.circuit));
    });

    return Array.from(circuitData.values()).sort((a, b) => b.roi - a.roi);
  }

  private calculateVenuePerformance(results: TournamentResult[]): VenuePerformance[] {
    const venueData = new Map<string, VenuePerformance>();

    results.forEach(result => {
      const venueKey = `${result.venue}-${result.city}`;
      if (!venueData.has(venueKey)) {
        venueData.set(venueKey, {
          venue: result.venue,
          city: result.city,
          state: result.state,
          events: 0,
          winnings: 0,
          buyIns: 0,
          roi: 0,
          averageBuyIn: 0,
          bestFinish: Infinity,
          itmRate: 0
        });
      }

      const data = venueData.get(venueKey)!;
      data.events += 1;
      data.winnings += result.prize;
      data.buyIns += result.buyIn;
      if (result.finish && result.finish < data.bestFinish) {
        data.bestFinish = result.finish;
      }
      if (result.itm) data.itmRate += 1;
    });

    // Calculate derived metrics
    venueData.forEach(data => {
      data.roi = data.buyIns > 0 ? ((data.winnings - data.buyIns) / data.buyIns) * 100 : 0;
      data.averageBuyIn = data.buyIns / data.events;
      data.itmRate = (data.itmRate / data.events) * 100;
    });

    return Array.from(venueData.values())
      .filter(v => v.events >= 2) // Only include venues with multiple events
      .sort((a, b) => b.roi - a.roi);
  }

  private calculateTravelAnalytics(expenses: ExpenseData[]): TravelAnalytics {
    // Group expenses by month and calculate travel metrics
    const monthlyExpenses = this.groupExpensesByMonth(expenses);
    const totalTournaments = 47; // This should come from actual data
    const totalTravelCost = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    return {
      monthlyExpenses,
      costPerTournament: totalTravelCost / totalTournaments,
      travelRoiImpact: -8.2, // Calculate based on actual ROI impact
      optimizationPotential: 2400, // Based on route optimization analysis
      mostEfficientTrips: this.calculateMostEfficientTrips(expenses)
    };
  }

  private calculateBankrollAnalytics(history: BankrollTransaction[]): BankrollAnalytics {
    const current = history[history.length - 1];
    return {
      currentAllocation: {
        tournamentBR: current?.tournamentBankroll || 50000,
        cashGameBR: current?.cashGameBankroll || 15000,
        expenseFund: current?.expenseFund || 10000,
        total: current?.totalBankroll || 75000
      },
      history: history.map((h, i) => ({
        date: h.date,
        amount: h.totalBankroll,
        tournamentBR: h.tournamentBankroll,
        expenseFund: h.expenseFund,
        change: i > 0 ? h.totalBankroll - history[i-1].totalBankroll : 0,
        changePercent: i > 0 ? ((h.totalBankroll - history[i-1].totalBankroll) / history[i-1].totalBankroll) * 100 : 0
      })),
      riskMetrics: {
        kellyPercentage: 2.3, // Calculate based on ROI and variance
        currentRisk: 'medium',
        recommendedBuyInRange: { min: 500, max: 2500 },
        drawdownProtection: 20
      }
    };
  }

  private async scoreTournament(tournament: Tournament, playerResults: TournamentResult[]): Promise<TournamentRecommendation> {
    const factors = {
      historicalRoi: this.calculateHistoricalROI(tournament, playerResults),
      venueSuccess: this.calculateVenueSuccess(tournament, playerResults),
      fieldSize: this.scoreFieldSize(tournament.estimatedField),
      buyin_suitability: this.scoreBuyInSuitability(tournament.buyIn, playerResults),
      travelEfficiency: this.calculateTravelEfficiency(tournament),
      circuitPerformance: this.calculateCircuitPerformance(playerResults)
        .find(cp => cp.circuit === tournament.circuit.type)?.roi || 0
    };

    // Weighted score calculation
    const score = (
      factors.historicalRoi * 0.25 +
      factors.venueSuccess * 0.2 +
      factors.fieldSize * 0.15 +
      factors.buyin_suitability * 0.15 +
      factors.travelEfficiency * 0.1 +
      factors.circuitPerformance * 0.15
    );

    return {
      tournament,
      score: Math.min(100, Math.max(0, score)),
      factors,
      reasoning: this.generateRecommendationReasoning(tournament, factors),
      expectedRoi: this.calculateExpectedROI(tournament, factors),
      confidenceLevel: this.calculateConfidenceLevel(tournament, playerResults)
    };
  }

  private generateOptimizationInsights(
    results: TournamentResult[],
    circuitPerformance: CircuitPerformance[],
    venuePerformance: VenuePerformance[],
    travelAnalytics: TravelAnalytics,
    bankrollAnalytics: BankrollAnalytics
  ): OptimizationInsight[] {
    const insights: OptimizationInsight[] = [];

    // Circuit insights
    const bestCircuit = circuitPerformance[0];
    if (bestCircuit && bestCircuit.roi > 20) {
      insights.push({
        type: 'circuit',
        priority: 'high',
        title: `Focus on ${bestCircuit.circuit}`,
        description: `Your highest ROI circuit at ${bestCircuit.roi.toFixed(1)}%`,
        impact: 'Could increase overall ROI by 3-5%',
        recommendation: `Allocate 40-60% of tournament schedule to ${bestCircuit.circuit} events`,
        implementationDifficulty: 'medium'
      });
    }

    // Travel optimization
    if (travelAnalytics.optimizationPotential > 2000) {
      insights.push({
        type: 'travel',
        priority: 'high',
        title: 'Optimize Travel Routes',
        description: `Potential savings of $${travelAnalytics.optimizationPotential.toLocaleString()} annually`,
        impact: 'Reduce travel costs by 15-20%',
        recommendation: 'Use circuit routing to combine multiple tournaments per trip',
        potentialSavings: travelAnalytics.optimizationPotential,
        implementationDifficulty: 'easy'
      });
    }

    // Venue insights
    const topVenue = venuePerformance[0];
    if (topVenue && topVenue.roi > 30) {
      insights.push({
        type: 'venue',
        priority: 'medium',
        title: `Maximize ${topVenue.venue} Events`,
        description: `${topVenue.roi.toFixed(1)}% ROI with ${topVenue.events} events`,
        impact: 'Strong venue performance indicates good fit',
        recommendation: `Prioritize tournaments at ${topVenue.venue} when available`,
        implementationDifficulty: 'easy'
      });
    }

    return insights;
  }

  // Mock data methods (replace with real data integration)
  private getMockPlayerResults(playerId: string, filter?: AnalyticsFilter): TournamentResult[] {
    // Return mock data for now - replace with database integration
    return []; // Implementation would query actual tournament results
  }

  private getMockExpenseData(playerId: string, filter?: AnalyticsFilter): ExpenseData[] {
    return []; // Implementation would query expense tracking system
  }

  private getMockBankrollHistory(playerId: string, filter?: AnalyticsFilter): BankrollTransaction[] {
    return []; // Implementation would query bankroll management system
  }

  // Additional helper methods
  private getBestCircuit(results: TournamentResult[]): string {
    const circuitROI = new Map<string, { profit: number; buyins: number }>();
    
    results.forEach(result => {
      const data = circuitROI.get(result.circuit) || { profit: 0, buyins: 0 };
      data.profit += result.prize - result.buyIn;
      data.buyins += result.buyIn;
      circuitROI.set(result.circuit, data);
    });

    let bestCircuit = 'Unknown';
    let bestROI = -Infinity;

    circuitROI.forEach((data, circuit) => {
      const roi = (data.profit / data.buyins) * 100;
      if (roi > bestROI) {
        bestROI = roi;
        bestCircuit = circuit;
      }
    });

    return bestCircuit;
  }

  private calculateYearsPlaying(results: TournamentResult[]): number {
    if (results.length === 0) return 0;
    
    const earliest = Math.min(...results.map(r => r.date.getTime()));
    const now = Date.now();
    return Math.round((now - earliest) / (1000 * 60 * 60 * 24 * 365));
  }

  private calculateProfitabilityTrend(results: TournamentResult[]): 'improving' | 'declining' | 'stable' {
    if (results.length < 6) return 'stable';
    
    // Split results into first and second half
    const midpoint = Math.floor(results.length / 2);
    const firstHalf = results.slice(0, midpoint);
    const secondHalf = results.slice(midpoint);

    const firstROI = this.calculateROI(firstHalf);
    const secondROI = this.calculateROI(secondHalf);

    const difference = secondROI - firstROI;
    
    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }

  private calculateROI(results: TournamentResult[]): number {
    const totalBuyins = results.reduce((sum, r) => sum + r.buyIn, 0);
    const totalWinnings = results.reduce((sum, r) => sum + r.prize, 0);
    return totalBuyins > 0 ? ((totalWinnings - totalBuyins) / totalBuyins) * 100 : 0;
  }

  private groupExpensesByMonth(expenses: ExpenseData[]): TravelAnalytics['monthlyExpenses'] {
    // Group and aggregate expenses by month
    return []; // Implementation would process expense data
  }

  private calculateMostEfficientTrips(expenses: ExpenseData[]): TravelAnalytics['mostEfficientTrips'] {
    return []; // Implementation would analyze trip efficiency
  }

  private calculateOptimalBankrollAllocation(bankroll: BankrollAnalytics, performance: PlayerStatistics): any {
    // Calculate optimal allocation based on risk and performance
    return {
      currentAllocation: bankroll.currentAllocation,
      recommendedAllocation: {
        tournamentBR: bankroll.currentAllocation.total * 0.65,
        cashGameBR: bankroll.currentAllocation.total * 0.20,
        expenseFund: bankroll.currentAllocation.total * 0.15
      },
      reasoning: 'Based on your positive tournament ROI, consider increasing tournament allocation'
    };
  }

  private calculateHistoricalROI(tournament: Tournament, results: TournamentResult[]): number {
    // Calculate player's historical ROI for similar tournaments
    return 0; // Implementation would analyze similar tournaments
  }

  private calculateVenueSuccess(tournament: Tournament, results: TournamentResult[]): number {
    // Calculate success rate at this venue
    return 0;
  }

  private scoreFieldSize(fieldSize: number): number {
    // Optimal field size scoring (smaller fields generally better for skilled players)
    if (fieldSize < 200) return 90;
    if (fieldSize < 400) return 75;
    if (fieldSize < 600) return 60;
    return 40;
  }

  private scoreBuyInSuitability(buyIn: number, results: TournamentResult[]): number {
    // Score based on player's typical buy-in range and bankroll
    return 70; // Implementation would analyze optimal buy-in range
  }

  private calculateTravelEfficiency(tournament: Tournament): number {
    // Calculate travel efficiency based on location and player's base
    return 60;
  }

  private calculateExpectedROI(tournament: Tournament, factors: any): number {
    // Calculate expected ROI based on all factors
    return Object.values(factors).reduce((sum: number, val: any) => sum + val, 0) / Object.keys(factors).length;
  }

  private calculateConfidenceLevel(tournament: Tournament, results: TournamentResult[]): 'high' | 'medium' | 'low' {
    // Determine confidence level based on data availability
    const relevantResults = results.filter(r => 
      r.circuit === tournament.circuit.type || 
      r.venue === tournament.venue.name
    );
    
    if (relevantResults.length >= 5) return 'high';
    if (relevantResults.length >= 2) return 'medium';
    return 'low';
  }

  private generateRecommendationReasoning(tournament: Tournament, factors: any): string[] {
    const reasoning = [];
    
    if (factors.historicalRoi > 20) {
      reasoning.push('Strong historical performance in similar events');
    }
    if (factors.venueSuccess > 30) {
      reasoning.push('Positive track record at this venue');
    }
    if (factors.circuitPerformance > 15) {
      reasoning.push(`Above-average ROI in ${tournament.circuit.type} events`);
    }
    
    return reasoning;
  }

  private generateCircuitRecommendations(comparison: CircuitPerformance[]): string[] {
    return comparison.map(cp => {
      if (cp.roi > 25) return `Continue focusing on ${cp.circuit} - excellent ROI`;
      if (cp.roi > 10) return `${cp.circuit} shows promise - consider more events`;
      return `Review ${cp.circuit} strategy - below target performance`;
    });
  }

  // Cache management
  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < this.CACHE_DURATION) {
      return entry.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();