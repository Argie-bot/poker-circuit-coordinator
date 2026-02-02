/**
 * Data Migration Utility
 * Handles the transition from mock tournament data to live data sources
 */

import { Tournament, Circuit, Venue } from '@/types';
// import { tournamentDataService } from '@/services/tournament-data-service';

// Import the old mock data for comparison
import { tournaments as mockTournaments, circuits as mockCircuits } from '@/data/tournaments';

export class DataMigrationService {
  /**
   * Compare mock data with live data to validate the integration
   */
  async validateDataIntegration(): Promise<{
    success: boolean;
    issues: string[];
    summary: {
      mockTournaments: number;
      liveTournaments: number;
      dataSourceHealth: any[];
    };
  }> {
    const issues: string[] = [];
    
    try {
      // Check data source health
      // const healthStatus = tournamentDataService.getDataSourceHealth();
      // const availableSources = healthStatus.filter(source => source.available);
      const healthStatus: any[] = [];
      const availableSources: any[] = [];
      
      if (availableSources.length === 0) {
        issues.push('No data sources are available');
      }
      
      // Fetch live tournaments
      // const liveTournaments = await tournamentDataService.getUpcomingTournaments(100);
      const liveTournaments: Tournament[] = [];
      
      // Compare counts
      const mockCount = mockTournaments.length;
      const liveCount = liveTournaments.length;
      
      if (liveCount === 0 && availableSources.length > 0) {
        issues.push('No live tournaments found despite available data sources');
      }
      
      // Validate tournament structure
      if (liveTournaments.length > 0) {
        const sampleTournament = liveTournaments[0];
        const requiredFields = ['id', 'name', 'circuit', 'venue', 'buyIn', 'startDate'];
        
        for (const field of requiredFields) {
          if (!(field in sampleTournament)) {
            issues.push(`Missing required field: ${field}`);
          }
        }
      }
      
      // Check for reasonable data
      const recentTournaments = liveTournaments.filter(
        t => t.startDate > new Date() && t.startDate < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      );
      
      if (recentTournaments.length === 0 && availableSources.length > 0) {
        issues.push('No tournaments found in next 90 days');
      }
      
      return {
        success: issues.length === 0,
        issues,
        summary: {
          mockTournaments: mockCount,
          liveTournaments: liveCount,
          dataSourceHealth: healthStatus
        }
      };
      
    } catch (error) {
      issues.push(`Migration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        success: false,
        issues,
        summary: {
          mockTournaments: mockTournaments.length,
          liveTournaments: 0,
          dataSourceHealth: [] // tournamentDataService.getDataSourceHealth()
        }
      };
    }
  }

  /**
   * Create a gradual migration plan
   */
  async createMigrationPlan(): Promise<{
    steps: Array<{
      step: number;
      description: string;
      action: string;
      status: 'pending' | 'ready' | 'completed' | 'failed';
      notes?: string;
    }>;
    readyToMigrate: boolean;
  }> {
    const steps: Array<{
      step: number;
      description: string;
      action: string;
      status: 'pending' | 'completed' | 'failed';
      notes?: string;
    }> = [
      {
        step: 1,
        description: 'Verify data source connectivity',
        action: 'checkDataSources',
        status: 'pending'
      },
      {
        step: 2,
        description: 'Validate PokerAtlas API',
        action: 'validatePokerAtlas',
        status: 'pending'
      },
      {
        step: 3,
        description: 'Test WSOP Circuit scraper',
        action: 'testWSopScraper',
        status: 'pending'
      },
      {
        step: 4,
        description: 'Test WPT scraper',
        action: 'testWPTScraper',
        status: 'pending'
      },
      {
        step: 5,
        description: 'Fetch sample live data',
        action: 'fetchSampleData',
        status: 'pending'
      },
      {
        step: 6,
        description: 'Validate data structure compatibility',
        action: 'validateStructure',
        status: 'pending'
      }
    ];

    // Execute each step
    try {
      // Step 1: Check data sources  
      // const healthStatus = tournamentDataService.getDataSourceHealth();
      const healthStatus: any[] = [];
      const availableCount = 0; // healthStatus.filter(s => s.available).length;
      
      steps[0].status = availableCount > 0 ? 'completed' : 'failed';
      steps[0].notes = `${availableCount}/3 data sources available`;

      // Step 2-4: Individual source testing
      const pokerAtlasHealth = healthStatus.find(s => s.name === 'PokerAtlas');
      steps[1].status = pokerAtlasHealth?.available ? 'completed' : 'failed';
      steps[1].notes = pokerAtlasHealth?.error || 'Connected';

      const wsopHealth = healthStatus.find(s => s.name === 'WSOP Circuit');
      steps[2].status = wsopHealth?.available ? 'completed' : 'failed';
      steps[2].notes = wsopHealth?.error || 'Connected';

      const wptHealth = healthStatus.find(s => s.name === 'WPT');
      steps[3].status = wptHealth?.available ? 'completed' : 'failed';
      steps[3].notes = wptHealth?.error || 'Connected';

      // Step 5: Fetch sample data
      try {
        // const sampleTournaments = await tournamentDataService.getUpcomingTournaments(5);
        const sampleTournaments: Tournament[] = [];
        steps[4].status = sampleTournaments.length > 0 ? 'completed' : 'failed';
        steps[4].notes = `Found ${sampleTournaments.length} tournaments`;

        // Step 6: Validate structure
        if (sampleTournaments.length > 0) {
          const validation = await this.validateDataIntegration();
          steps[5].status = validation.success ? 'completed' : 'failed';
          steps[5].notes = validation.issues.length > 0 ? validation.issues[0] : 'Structure valid';
        } else {
          steps[5].status = 'failed';
          steps[5].notes = 'No data to validate';
        }
      } catch (error) {
        steps[4].status = 'failed';
        steps[4].notes = error instanceof Error ? error.message : 'Fetch failed';
        steps[5].status = 'failed';
        steps[5].notes = 'Cannot validate without data';
      }

    } catch (error) {
      console.error('Migration plan creation failed:', error);
    }

    const readyToMigrate = steps.every(step => step.status === 'completed');

    return {
      steps,
      readyToMigrate
    };
  }

  /**
   * Execute the migration from mock to live data
   */
  async executeMigration(): Promise<{
    success: boolean;
    errors: string[];
    backupPath?: string;
  }> {
    const errors: string[] = [];

    try {
      // Validate readiness
      const migrationPlan = await this.createMigrationPlan();
      
      if (!migrationPlan.readyToMigrate) {
        const failedSteps = migrationPlan.steps.filter(s => s.status === 'failed');
        errors.push(`Migration not ready. Failed steps: ${failedSteps.map(s => s.description).join(', ')}`);
        
        return {
          success: false,
          errors
        };
      }

      // Backup existing data (optional)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `backup-mock-data-${timestamp}.json`;
      
      try {
        const fs = require('fs');
        fs.writeFileSync(backupPath, JSON.stringify({
          tournaments: mockTournaments,
          circuits: mockCircuits,
          timestamp: new Date().toISOString()
        }, null, 2));
      } catch (backupError) {
        console.warn('Could not create backup:', backupError);
      }

      // Test live data one more time
      // const liveTournaments = await tournamentDataService.getUpcomingTournaments(10);
      const liveTournaments: Tournament[] = [];
      
      if (liveTournaments.length === 0) {
        errors.push('Final validation failed: No live tournaments available');
        return {
          success: false,
          errors,
          backupPath
        };
      }

      // Migration successful - the app should now use live data
      console.log('✅ Migration completed successfully');
      console.log(`📊 Live data: ${liveTournaments.length} tournaments available`);
      console.log(`💾 Mock data backed up to: ${backupPath}`);

      return {
        success: true,
        errors: [],
        backupPath
      };

    } catch (error) {
      errors.push(`Migration execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        success: false,
        errors
      };
    }
  }

  /**
   * Rollback to mock data if needed
   */
  async rollbackToMockData(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Simply use the original mock data - no file changes needed
      // The application can switch between data sources programmatically
      
      return {
        success: true,
        message: 'Rolled back to mock data. Live data sources disabled.'
      };
    } catch (error) {
      return {
        success: false,
        message: `Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<{
    isLiveDataActive: boolean;
    dataSourceHealth: any[];
    lastDataFetch?: Date;
    tournamentCount: number;
    issues: string[];
  }> {
    try {
      // const healthStatus = tournamentDataService.getDataSourceHealth();
      const healthStatus: any[] = [];
      const isLiveDataActive = healthStatus.some(source => source.available);
      
      // const tournaments = await tournamentDataService.getUpcomingTournaments(1);
      const tournaments: Tournament[] = [];
      
      const issues: string[] = [];
      
      if (!isLiveDataActive) {
        issues.push('No live data sources are active');
      }
      
      if (tournaments.length === 0 && isLiveDataActive) {
        issues.push('Live sources active but no tournaments found');
      }
      
      return {
        isLiveDataActive,
        dataSourceHealth: healthStatus,
        lastDataFetch: healthStatus.length > 0 ? healthStatus[0].lastChecked : undefined,
        tournamentCount: tournaments.length,
        issues
      };
      
    } catch (error) {
      return {
        isLiveDataActive: false,
        dataSourceHealth: [],
        tournamentCount: 0,
        issues: [`Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }
}

export const dataMigrationService = new DataMigrationService();