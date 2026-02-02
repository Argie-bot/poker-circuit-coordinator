import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId') || 'player-1';
    const timeframe = searchParams.get('timeframe') || '6m';

    // Create date filter based on timeframe
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '6m':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'all':
        startDate.setFullYear(2020); // Arbitrary early date
        break;
    }

    const filter = { dateRange: { start: startDate, end: endDate } };
    
    // Get analytics data
    const analytics = await analyticsService.getPlayerAnalytics(playerId, filter);
    
    return NextResponse.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { playerId, action } = await request.json();
    
    switch (action) {
      case 'refresh':
        // Force refresh analytics data
        const analytics = await analyticsService.getPlayerAnalytics(playerId);
        return NextResponse.json({
          success: true,
          data: analytics,
          message: 'Analytics data refreshed successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Analytics API POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process analytics request',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}