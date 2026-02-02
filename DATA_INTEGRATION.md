# Data Integration Guide

The Poker Circuit Coordinator now uses **real tournament data** from multiple sources instead of mock data. This document explains the integration and how to set it up.

## 🎯 Overview

### Data Sources

1. **PokerAtlas API** (Primary) ✅
   - Official REST API with comprehensive tournament data
   - Rate limited but reliable
   - Covers most US poker rooms and tournaments
   - **Status**: Active with API key

2. **WSOP Circuit Scraper** (Secondary) 🔄
   - Web scraping of WSOP.com for Circuit events
   - No official API available
   - Includes Main Events, Side Events, and schedules
   - **Status**: Web scraping with Puppeteer

3. **WPT Scraper** (Secondary) 🔄
   - Web scraping of WorldPokerTour.com
   - Covers major WPT tournaments and schedules
   - **Status**: Web scraping with Puppeteer

### Data Coverage

- **Tournament schedules** with accurate dates and times
- **Buy-in amounts** and prize guarantees  
- **Venue information** including addresses and amenities
- **Registration deadlines** and late registration periods
- **Tournament structures** (starting stacks, blind levels)
- **Circuit classifications** (WSOP, WPT, Regional, etc.)

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd poker-circuit-coordinator
npm install
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your PokerAtlas API key
# Get your key from: https://www.pokeratlas.com/api
POKER_ATLAS_API_KEY=your_actual_api_key_here
```

### 3. Run Setup Check
```bash
npm run setup
```

### 4. Test Data Integration  
```bash
npm run test-data
```

### 5. Start Development
```bash
npm run dev
```

## 📊 Data Service Architecture

### Core Components

```
TournamentDataService
├── PokerAtlasService      # REST API client
├── WSOpCircuitScraper     # Web scraping
├── WPTScraper            # Web scraping  
├── DataAggregator        # Combines sources
├── CacheManager          # 30min cache
└── HealthMonitor         # Source monitoring
```

### Usage Examples

```typescript
import { tournamentDataService } from '@/services/tournament-data-service';

// Get upcoming tournaments
const upcoming = await tournamentDataService.getUpcomingTournaments(20);

// Filter tournaments
const filtered = await tournamentDataService.getAllTournaments({
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  minBuyIn: 500,
  maxBuyIn: 2000,
  circuits: ['wsop', 'wpt'],
  states: ['NV', 'CA'],
  maxResults: 50
});

// Search tournaments
const results = await tournamentDataService.searchTournaments('Main Event');

// Check data source health
const health = tournamentDataService.getDataSourceHealth();
```

## 🔧 Configuration

### Environment Variables

```bash
# Required
POKER_ATLAS_API_KEY=your_key_here

# Optional - Data Source Control
ENABLE_POKER_ATLAS=true
ENABLE_WSOP_SCRAPING=true  
ENABLE_WPT_SCRAPING=true

# Optional - Performance Tuning
CACHE_EXPIRY_MINUTES=30
HEALTH_CHECK_INTERVAL_MINUTES=5
SCRAPING_TIMEOUT_SECONDS=30
MAX_REQUESTS_PER_MINUTE=60
```

### API Rate Limits

- **PokerAtlas**: 1000 requests/day (free tier)
- **Web Scrapers**: Self-regulated to avoid blocking
- **Caching**: 30-minute cache reduces API calls

## 🛠️ Development Commands

```bash
# Setup and testing
npm run setup           # Environment setup check
npm run test-data      # Test all data sources
npm run refresh-data   # Force refresh cached data

# Development
npm run dev            # Start dev server
npm run build          # Production build
npm run lint           # Code linting
```

## 📈 Migration from Mock Data

The application automatically handles the transition from mock to live data:

### Backward Compatibility
- Existing function signatures preserved
- Mock data available as fallback
- Gradual migration support

### Migration Steps
1. **Setup**: Configure API keys and run setup
2. **Validation**: Test data sources and connectivity  
3. **Migration**: Application automatically uses live data
4. **Monitoring**: Check data source health regularly

### Migration Utilities

```typescript
import { dataMigrationService } from '@/lib/data-migration';

// Check migration readiness
const plan = await dataMigrationService.createMigrationPlan();

// Validate data integration
const validation = await dataMigrationService.validateDataIntegration();

// Get migration status
const status = await dataMigrationService.getMigrationStatus();
```

## 🔍 Monitoring & Health Checks

### Data Source Health Dashboard

The application monitors all data sources continuously:

- **Connectivity**: HTTP status and response times
- **Rate Limits**: Tracks API usage and limits
- **Error Rates**: Failed requests and retry attempts  
- **Data Quality**: Validates tournament data structure
- **Last Updated**: Timestamp of successful data fetches

### Health Check Endpoint
```
GET /api/health
```

Returns:
```json
{
  "dataSources": [
    {
      "name": "PokerAtlas",
      "available": true,
      "lastChecked": "2024-02-15T10:30:00Z",
      "rateLimitRemaining": 850,
      "rateLimitReset": "2024-02-16T00:00:00Z"
    },
    {
      "name": "WSOP Circuit", 
      "available": true,
      "lastChecked": "2024-02-15T10:29:00Z"
    },
    {
      "name": "WPT",
      "available": false,
      "lastChecked": "2024-02-15T10:28:00Z",
      "error": "Website temporarily unavailable"
    }
  ]
}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. No Data Sources Available
```
❌ No data sources are currently available
```
**Solutions**:
- Check internet connectivity
- Verify PokerAtlas API key in `.env`
- Run `npm run setup` to diagnose issues
- Check firewall/proxy settings

#### 2. PokerAtlas API Errors  
```
❌ PokerAtlas API error: Unauthorized
```
**Solutions**:
- Verify API key is correct in `.env` file
- Check API key hasn't expired
- Ensure API key has proper permissions

#### 3. Web Scraping Blocked
```
❌ WSOP/WPT website error: Request failed
```
**Solutions**:
- Check if Puppeteer is properly installed
- Try: `npx puppeteer browsers install chrome`
- Verify no VPN/proxy blocking requests
- Wait and retry (temporary blocking)

#### 4. TypeScript/Module Errors
```
❌ Cannot find module or TypeScript compilation error
```
**Solutions**:
- Run `npm install` to ensure dependencies
- Install TypeScript: `npm install -D typescript ts-node`
- Check `tsconfig.json` is properly configured

### Debug Mode

Enable debug logging:
```bash
DEBUG_DATA_SOURCES=true npm run test-data
```

### Performance Issues

If data fetching is slow:
1. Check individual data source health
2. Increase cache expiry time
3. Reduce concurrent scraping requests
4. Use only PokerAtlas API (fastest)

## 📝 Data Quality & Validation

### Automatic Validation
- **Required fields**: ID, name, circuit, venue, buy-in, dates
- **Date validation**: Start/end dates in reasonable range
- **Buy-in validation**: Positive numbers, reasonable amounts
- **Venue validation**: Address components present
- **Duplicate detection**: Remove duplicate tournaments

### Data Enrichment
- **Timezone detection**: Based on venue location
- **Field estimation**: Estimate field sizes from buy-ins
- **Structure defaults**: Fill missing tournament structure data
- **Circuit classification**: Categorize tournaments by organizer

## 🔮 Future Enhancements

### Planned Features
- **More data sources**: HPT, MSPT, local circuits
- **Real-time updates**: Live tournament status
- **Player tracking**: Results and leaderboards  
- **Venue photos**: Integration with venue image APIs
- **Weather data**: Current/forecasted weather for venues
- **Hotel pricing**: Live hotel rate integration

### API Improvements
- **GraphQL interface**: More flexible data queries
- **Webhook support**: Real-time tournament updates
- **Bulk operations**: Efficient batch data requests
- **Custom filters**: Advanced tournament filtering

## 📞 Support

### Getting Help
1. **Check the logs**: Browser console and terminal output
2. **Run diagnostics**: `npm run setup` and `npm run test-data`
3. **Review this guide**: Common issues and solutions
4. **Check data source status**: Individual API/website status
5. **File an issue**: Project repository with error details

### Contact Information  
- **Project Repository**: [GitHub Link]
- **Documentation**: This file and inline code comments
- **API Documentation**: [PokerAtlas API Docs](https://www.pokeratlas.com/api/docs)

---

🎯 **Success Indicator**: When `npm run test-data` shows ✅ for multiple data sources and returns real tournament data, the integration is working correctly!