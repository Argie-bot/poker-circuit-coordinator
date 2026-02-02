import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics-service';
import { tournamentDataService } from '@/services/tournament-data-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId') || 'player-1';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get upcoming tournaments
    const upcomingTournaments = await tournamentDataService.getUpcomingTournaments(50);
    
    // Get AI recommendations
    const recommendations = await analyticsService.getTournamentRecommendations(
      playerId,
      upcomingTournaments
    );

    return NextResponse.json({
      success: true,
      data: recommendations.slice(0, limit),
      total: recommendations.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Recommendations API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tournament recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { playerId, tournaments, filters } = await request.json();
    
    // Get custom recommendations based on specific tournaments or filters
    const recommendations = await analyticsService.getTournamentRecommendations(
      playerId,
      tournaments
    );

    return NextResponse.json({
      success: true,
      data: recommendations,
      message: 'Custom recommendations generated successfully'
    });

  } catch (error) {
    console.error('Recommendations API POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate custom recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}