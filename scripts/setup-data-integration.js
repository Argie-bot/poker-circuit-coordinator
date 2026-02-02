#!/usr/bin/env node

/**
 * Data Integration Setup Script
 * Tests all data sources and provides setup guidance
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Poker Circuit Coordinator - Data Integration Setup\n');

// Check environment setup
function checkEnvironment() {
  console.log('📋 Checking environment setup...');
  
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      console.log('⚠️  .env file not found. Creating from .env.example...');
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Created .env file from template');
      console.log('📝 Please edit .env and add your API keys\n');
    } else {
      console.log('❌ Neither .env nor .env.example found');
      return false;
    }
  } else {
    console.log('✅ .env file exists');
  }
  
  // Check for required dependencies
  const packagePath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const requiredDeps = ['cheerio', 'puppeteer', 'axios'];
    
    const missing = requiredDeps.filter(dep => 
      !pkg.dependencies?.[dep] && !pkg.devDependencies?.[dep]
    );
    
    if (missing.length > 0) {
      console.log(`❌ Missing dependencies: ${missing.join(', ')}`);
      console.log('   Run: npm install cheerio puppeteer axios');
      return false;
    } else {
      console.log('✅ All required dependencies installed');
    }
  }
  
  console.log('');
  return true;
}

// Test data source connectivity
async function testDataSources() {
  console.log('🔍 Testing data source connectivity...\n');
  
  try {
    // Test PokerAtlas
    console.log('🃏 Testing PokerAtlas API...');
    try {
      const axios = require('axios');
      const response = await axios.get('https://api.pokeratlas.com/v1/status', {
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PokerCircuitCoordinator/1.0'
        }
      });
      
      if (response.status === 200) {
        console.log('✅ PokerAtlas API accessible');
        
        // Check if API key is configured
        const apiKey = process.env.POKER_ATLAS_API_KEY;
        if (!apiKey || apiKey === 'your_poker_atlas_api_key_here') {
          console.log('⚠️  PokerAtlas API key not configured');
          console.log('   Get your key from: https://www.pokeratlas.com/api');
        } else {
          console.log('✅ PokerAtlas API key configured');
        }
      }
    } catch (error) {
      console.log(`❌ PokerAtlas API error: ${error.message}`);
    }
    
    // Test WSOP website
    console.log('\n🏆 Testing WSOP website accessibility...');
    try {
      const axios = require('axios');
      const response = await axios.head('https://www.wsop.com', {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      
      if (response.status === 200) {
        console.log('✅ WSOP website accessible');
      }
    } catch (error) {
      console.log(`❌ WSOP website error: ${error.message}`);
    }
    
    // Test WPT website
    console.log('\n🌟 Testing WPT website accessibility...');
    try {
      const axios = require('axios');
      const response = await axios.head('https://www.worldpokertour.com', {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      
      if (response.status === 200) {
        console.log('✅ WPT website accessible');
      }
    } catch (error) {
      console.log(`❌ WPT website error: ${error.message}`);
    }
    
  } catch (error) {
    console.log(`❌ General connectivity error: ${error.message}`);
  }
  
  console.log('');
}

// Test Puppeteer setup
async function testPuppeteer() {
  console.log('🤖 Testing Puppeteer setup...');
  
  try {
    const puppeteer = require('puppeteer');
    console.log('✅ Puppeteer module loaded');
    
    // Try launching browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    console.log('✅ Puppeteer browser launched successfully');
    
    // Test basic page navigation
    const page = await browser.newPage();
    await page.goto('https://example.com', { timeout: 10000 });
    console.log('✅ Puppeteer page navigation works');
    
    await browser.close();
    console.log('✅ Puppeteer setup complete');
    
  } catch (error) {
    console.log(`❌ Puppeteer error: ${error.message}`);
    
    if (error.message.includes('Could not find Chromium')) {
      console.log('💡 Try running: npx puppeteer browsers install chrome');
    }
  }
  
  console.log('');
}

// Provide setup instructions
function printSetupInstructions() {
  console.log('📖 Setup Instructions:\n');
  
  console.log('1. 🔑 Configure API Keys:');
  console.log('   - Edit .env file');
  console.log('   - Get PokerAtlas API key: https://www.pokeratlas.com/api');
  console.log('   - Set POKER_ATLAS_API_KEY=your_actual_key\n');
  
  console.log('2. 🚀 Test the Integration:');
  console.log('   npm run dev');
  console.log('   Open http://localhost:3000\n');
  
  console.log('3. 🔧 Development Commands:');
  console.log('   npm run dev              # Start development server');
  console.log('   npm run build            # Build for production');
  console.log('   npm run test-data        # Test data integration\n');
  
  console.log('4. 📊 Data Source Status:');
  console.log('   - PokerAtlas: Official API (recommended)');
  console.log('   - WSOP Circuit: Web scraping (backup)');
  console.log('   - WPT: Web scraping (backup)\n');
  
  console.log('5. 🐛 Troubleshooting:');
  console.log('   - Check .env file for API keys');
  console.log('   - Verify internet connectivity');
  console.log('   - Check browser console for errors');
  console.log('   - Puppeteer issues: npx puppeteer browsers install chrome\n');
  
  console.log('📞 Need Help?');
  console.log('   - Check logs in browser console');
  console.log('   - Review data source health at /api/health');
  console.log('   - File issues on the project repository\n');
}

// Main setup function
async function runSetup() {
  try {
    const envOk = checkEnvironment();
    
    if (envOk) {
      await testDataSources();
      await testPuppeteer();
    }
    
    printSetupInstructions();
    
    console.log('🎉 Setup check complete!');
    console.log('   Start the application with: npm run dev\n');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Create package.json scripts if needed
function updatePackageJson() {
  const packagePath = path.join(process.cwd(), 'package.json');
  
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    if (!pkg.scripts) pkg.scripts = {};
    
    // Add useful scripts
    if (!pkg.scripts['test-data']) {
      pkg.scripts['test-data'] = 'node scripts/test-data-integration.js';
    }
    
    if (!pkg.scripts['setup']) {
      pkg.scripts['setup'] = 'node scripts/setup-data-integration.js';
    }
    
    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
    console.log('✅ Updated package.json with data integration scripts');
  }
}

// Run the setup
if (require.main === module) {
  updatePackageJson();
  runSetup().catch(console.error);
}

module.exports = { runSetup, testDataSources, testPuppeteer };