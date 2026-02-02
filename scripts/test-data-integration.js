#!/usr/bin/env node

/**
 * Data Integration Test Script
 * Tests the live data integration with all sources
 */

const path = require('path');

// Add the src directory to the module path
require('ts-node/register');
process.env.TS_NODE_PROJECT = path.join(__dirname, '..', 'tsconfig.json');

async function testDataIntegration() {
  console.log('🧪 Testing Poker Circuit Data Integration\n');

  try {
    // Import our data services
    const { tournamentDataService } = require('../src/services/tournament-data-service');
    const { dataMigrationService } = require('../src/lib/data-migration');

    // Test 1: Data Source Health
    console.log('1️⃣ Testing data source connectivity...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Give services time to initialize
    
    const healthStatus = tournamentDataService.getDataSourceHealth();
    
    healthStatus.forEach(source => {
      const status = source.available ? '✅' : '❌';
      const lastChecked = source.lastChecked.toLocaleString();
      const error = source.error ? ` (${source.error})` : '';
      
      console.log(`${status} ${source.name} - Last checked: ${lastChecked}${error}`);
      
      if (source.rateLimitRemaining !== undefined) {
        console.log(`   Rate limit: ${source.rateLimitRemaining} requests remaining`);
      }
    });

    const availableSources = healthStatus.filter(s => s.available).length;
    console.log(`\n📊 Summary: ${availableSources}/3 data sources available\n`);

    // Test 2: Fetch Sample Data
    console.log('2️⃣ Fetching sample tournament data...');
    
    try {
      const tournaments = await tournamentDataService.getUpcomingTournaments(5);
      
      if (tournaments.length > 0) {
        console.log(`✅ Found ${tournaments.length} tournaments`);
        
        // Show sample tournament
        const sample = tournaments[0];
        console.log('\n📝 Sample Tournament:');
        console.log(`   Name: ${sample.name}`);
        console.log(`   Circuit: ${sample.circuit.name} (${sample.circuit.type})`);
        console.log(`   Venue: ${sample.venue.name}`);
        console.log(`   Location: ${sample.venue.address.city}, ${sample.venue.address.state}`);
        console.log(`   Buy-in: $${sample.buyIn.toLocaleString()}`);
        console.log(`   Start Date: ${sample.startDate.toLocaleDateString()}`);
        
        if (sample.prizeGuarantee) {
          console.log(`   Guarantee: $${sample.prizeGuarantee.toLocaleString()}`);
        }
        
        console.log(`   Status: ${sample.status}`);
      } else {
        console.log('⚠️  No tournaments found');
        
        if (availableSources === 0) {
          console.log('   This is expected since no data sources are available');
        } else {
          console.log('   This might indicate a data fetching issue');
        }
      }
    } catch (error) {
      console.log(`❌ Error fetching tournaments: ${error.message}`);
    }

    console.log('');

    // Test 3: Test Individual Sources
    console.log('3️⃣ Testing individual data sources...\n');

    // Test PokerAtlas if available
    const pokerAtlasHealth = healthStatus.find(s => s.name === 'PokerAtlas');
    if (pokerAtlasHealth?.available) {
      console.log('🃏 Testing PokerAtlas API...');
      try {
        const { pokerAtlas } = require('../src/services/poker-atlas');
        const startDate = new Date();
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        
        const tournaments = await pokerAtlas.getTournaments(startDate, endDate);
        console.log(`✅ PokerAtlas: ${tournaments.length} tournaments found`);
      } catch (error) {
        console.log(`❌ PokerAtlas error: ${error.message}`);
      }
    } else {
      console.log('⏭️  PokerAtlas not available, skipping test');
    }

    // Test WSOP scraper if available
    const wsopHealth = healthStatus.find(s => s.name === 'WSOP Circuit');
    if (wsopHealth?.available) {
      console.log('\n🏆 Testing WSOP Circuit scraper...');
      try {
        const { wsopScraper } = require('../src/lib/scrapers/wsop-circuit');
        
        // Test with a shorter timeout for demo
        console.log('   (This may take a moment for web scraping...)');
        
        const tournaments = await Promise.race([
          wsopScraper.getCircuitEvents(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout after 30s')), 30000)
          )
        ]);
        
        console.log(`✅ WSOP Circuit: ${tournaments.length} tournaments found`);
      } catch (error) {
        console.log(`❌ WSOP Circuit error: ${error.message}`);
      }
    } else {
      console.log('\n⏭️  WSOP Circuit not available, skipping test');
    }

    // Test WPT scraper if available
    const wptHealth = healthStatus.find(s => s.name === 'WPT');
    if (wptHealth?.available) {
      console.log('\n🌟 Testing WPT scraper...');
      try {
        const { wptScraper } = require('../src/lib/scrapers/wpt');
        
        console.log('   (This may take a moment for web scraping...)');
        
        const tournaments = await Promise.race([
          wptScraper.getWPTEvents(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout after 30s')), 30000)
          )
        ]);
        
        console.log(`✅ WPT: ${tournaments.length} tournaments found`);
      } catch (error) {
        console.log(`❌ WPT error: ${error.message}`);
      }
    } else {
      console.log('\n⏭️  WPT not available, skipping test');
    }

    console.log('');

    // Test 4: Migration Status
    console.log('4️⃣ Checking migration status...');
    
    try {
      const migrationStatus = await dataMigrationService.getMigrationStatus();
      
      console.log(`Live Data Active: ${migrationStatus.isLiveDataActive ? '✅' : '❌'}`);
      console.log(`Tournament Count: ${migrationStatus.tournamentCount}`);
      
      if (migrationStatus.lastDataFetch) {
        console.log(`Last Data Fetch: ${migrationStatus.lastDataFetch.toLocaleString()}`);
      }
      
      if (migrationStatus.issues.length > 0) {
        console.log('\nIssues:');
        migrationStatus.issues.forEach(issue => {
          console.log(`⚠️  ${issue}`);
        });
      }
    } catch (error) {
      console.log(`❌ Migration status error: ${error.message}`);
    }

    console.log('');

    // Test 5: Data Validation
    console.log('5️⃣ Validating data integration...');
    
    try {
      const validation = await dataMigrationService.validateDataIntegration();
      
      if (validation.success) {
        console.log('✅ Data integration validation passed');
      } else {
        console.log('❌ Data integration validation failed:');
        validation.issues.forEach(issue => {
          console.log(`   • ${issue}`);
        });
      }
      
      console.log('\nValidation Summary:');
      console.log(`   Mock Tournaments: ${validation.summary.mockTournaments}`);
      console.log(`   Live Tournaments: ${validation.summary.liveTournaments}`);
      console.log(`   Data Sources: ${validation.summary.dataSourceHealth.length}`);
      
    } catch (error) {
      console.log(`❌ Validation error: ${error.message}`);
    }

    // Final Summary
    console.log('\n🎯 Integration Test Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (availableSources > 0) {
      console.log('✅ Data integration is working!');
      console.log(`   ${availableSources} data source(s) available`);
      console.log('   Live tournament data can be fetched');
      console.log('\n🚀 Next steps:');
      console.log('   • Start the development server: npm run dev');
      console.log('   • Navigate to the circuit builder page');
      console.log('   • Check that real tournament data is displayed');
    } else {
      console.log('⚠️  No data sources are currently available');
      console.log('\n🔧 Troubleshooting:');
      console.log('   • Check your internet connection');
      console.log('   • Verify PokerAtlas API key in .env file');
      console.log('   • Ensure firewall allows web scraping');
      console.log('   • Try running the setup script: npm run setup');
    }

    console.log('');

  } catch (error) {
    console.error('❌ Test script failed:', error);
    
    if (error.message.includes('Cannot find module')) {
      console.log('\n💡 Make sure you have installed dependencies:');
      console.log('   npm install');
    }
    
    if (error.message.includes('TypeScript')) {
      console.log('\n💡 Make sure TypeScript is properly configured:');
      console.log('   npm install -D typescript ts-node');
    }
  }
}

// Cleanup function
async function cleanup() {
  try {
    // Close any open browsers or connections
    const { wsopScraper } = require('../src/lib/scrapers/wsop-circuit');
    const { wptScraper } = require('../src/lib/scrapers/wpt');
    const { tournamentDataService } = require('../src/services/tournament-data-service');
    
    await wsopScraper.close();
    await wptScraper.close();
    await tournamentDataService.cleanup();
    
    console.log('🧹 Cleanup completed');
  } catch (error) {
    // Ignore cleanup errors
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n⏹️  Test interrupted');
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cleanup();
  process.exit(0);
});

// Run the test
if (require.main === module) {
  testDataIntegration()
    .then(() => cleanup())
    .catch(async (error) => {
      console.error('Test failed:', error);
      await cleanup();
      process.exit(1);
    });
}

module.exports = { testDataIntegration };