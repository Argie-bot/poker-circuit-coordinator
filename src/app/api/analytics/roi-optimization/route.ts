import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId') || 'player-1';

    // Get ROI optimization data
    const optimization = await analyticsService.getROIOptimization(playerId);

    return NextResponse.json({
      success: true,
      data: optimization,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('ROI Optimization API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch ROI optimization data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { playerId, targetROI, constraints } = await request.json();
    
    // Get optimization with custom parameters
    const optimization = await analyticsService.getROIOptimization(playerId);
    
    // Apply any custom constraints or targets
    const customizedOptimization = {
      ...optimization,
      targetROI,
      constraints,
      customRecommendations: optimization.optimizationSteps.filter(step => 
        constraints?.includeTypes?.includes(step.action.toLowerCase()) ?? true
      )
    };

    return NextResponse.json({
      success: true,
      data: customizedOptimization,
      message: 'Custom ROI optimization generated successfully'
    });

  } catch (error) {
    console.error('ROI Optimization API POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate custom ROI optimization',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}