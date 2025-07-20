# Raid Recap

A comprehensive World of Warcraft raid team statistics and awards tracking application built with Next.js. Originally created for the **Shadow Hunters** guild on Stormrage, this tool generates end-of-season statistics, awards, and memorable moments for raid teams using the Warcraft Logs API.

## Features

- **Comprehensive Statistics Tracking**: Damage, healing, deaths, attendance, and raid-specific mechanics
- **Award System**: Both static (always available) and seasonal (raid-specific) awards
- **Multi-Team Support**: Configure multiple teams within a single guild
- **Interactive Visualizations**: Charts and graphs powered by Chart.js
- **Team Bits**: Custom awards for inside jokes and memorable raid moments
- **Attendance Tracking**: Flexible attendance calculation with manual overrides
- **Static Site Generation**: Optimized for GitHub Pages deployment

## Tech Stack

- **Framework**: Next.js 14+ with TypeScript
- **API Integration**: Apollo GraphQL Client with Warcraft Logs API
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with React integration (react-chartjs-2)
- **UI Components**: Swiper for slideshows
- **Rate Limiting**: Bottleneck for API request management
- **Code Generation**: GraphQL Code Generator for type-safe queries
- **Testing**: Jest with TypeScript support

## Prerequisites

### Warcraft Logs API Token

You'll need a Warcraft Logs API token to access raid data:

1. Visit the [Warcraft Logs API Documentation](https://www.warcraftlogs.com/api/docs)
2. Follow their guide to obtain an API token
3. No special permissions required - token provides access to public logs only

### System Requirements

- Node.js 18+
- npm or yarn package manager

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd raid-recap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:
   ```env
   TOKEN=your_warcraft_logs_api_token_here
   ```

4. **Generate GraphQL Types**
   ```bash
   npm run generate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000/raid-recap`

## Available Scripts

- `npm run generate` - Generate TypeScript types from GraphQL queries
- `npm run dev` - Start development server
- `npm run build` - Build for production (includes type generation)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode

## Configuration Guide

### Team Configuration

Teams are configured in `src/app/_config/teams.ts`. Each team requires:

```typescript
export const RaidTeams: { [key: string]: TeamConfig } = {
    'your-team-id': {
        id: 'your-team-id',
        name: 'Your Team Name',
        logo: 'team-logo.png', // Optional: place in public/logos/
        guildId: 12345, // Found in Warcraft Logs guild URL
        reportFilter: (report: Report) => {
            // Filter logic to include/exclude specific reports
            return report.title.includes("Your Team");
        },
        attendancePercent: 0.25, // Minimum attendance threshold
        attendanceIncludeOverride: [123456, 789012], // Player IDs to force include
        attendanceExcludeOverride: [345678], // Player IDs to exclude
        alts: {
            "MainCharacterName": ["AltName1", "AltName2"]
        }
    }
};
```

#### Finding Guild and Player IDs

**Guild ID**: Visit your guild's Warcraft Logs page (e.g., `https://www.warcraftlogs.com/guild/id/44873`) - the ID is the number at the end of the URL.

**Player IDs**: Found in Warcraft Logs URLs when viewing individual player pages.

#### Report Filtering

The `reportFilter` function helps:
- Reduce processing time by excluding irrelevant logs
- Separate logs for guilds with multiple teams
- Exclude specific problematic reports by code

### Awards System

Awards are configured in `src/app/_config/awards.ts` and come in three types:

#### Static Awards
Always available awards like damage done, healing, deaths, attendance:
```typescript
const myAward: Award = {
    name: "Award Name",
    description: "Award description",
    stat: (p: PlayerStats) => p.damageDone('Boss'),
    supportsAveraging: true,
    background: 'background-image.jpg', // Optional
    playerFilter: (p) => p.playerClass === 'priest' // Optional filter
};
```

#### Seasonal Awards
Tied to specific raid mechanics (current season only):
```typescript
const seasonalAward: Award = {
    name: "Seasonal Award",
    description: "Raid-specific mechanic",
    stat: (p) => p.getSeaontalStat('mechanicName', 'Boss'),
    supportsAveraging: false
};
```

#### Team Bits
Inside jokes and memorable moments specific to teams:
```typescript
export const TeamBits: { [key: string]: Award[]; } = {
    'your-team-id': [customAward1, customAward2]
};
```

## Adding Custom Statistics

To add new statistics tracking:

1. **Extend Player Stats Model** (`src/warcraft-logs/model/player-stats.ts`)
   ```typescript
   // Add new stat calculation method
   myCustomStat(): number {
       // Implementation
   }
   ```

2. **Update GraphQL Query** (`src/warcraft-logs/queries/GetReport.ts`)
   ```typescript
   // Add required fields to fetch new data
   ```

3. **Extract Data** (`src/app/teams/[id]/log-puller.ts`)
   ```typescript
   // Add logic to process and store the new statistic
   ```

4. **Create Award** (`src/app/_config/awards.ts`)
   ```typescript
   // Add award using the new statistic
   ```

## Project Structure

```
src/
├── __generated__/          # Generated GraphQL types
├── app/
│   ├── _components/        # React components
│   │   ├── award-slide/    # Award presentation slides
│   │   ├── ranking-chart/  # Chart components with class styling
│   │   └── team-stats-slide/ # Team statistics display
│   ├── _config/           # Configuration files
│   │   ├── teams.ts       # Team definitions
│   │   ├── awards.ts      # Award definitions
│   │   ├── encounters.ts  # Raid encounter configurations
│   │   ├── auras.ts       # Buff/debuff tracking
│   │   └── paths.ts       # Route definitions
│   ├── teams/[id]/        # Dynamic team pages
│   │   ├── page.tsx       # Team statistics page
│   │   └── log-puller.ts  # Data fetching logic
│   ├── layout.tsx         # App layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── warcraft-logs/         # API integration
│   ├── client.ts          # Apollo GraphQL client
│   ├── duplicate-detector.ts # Log deduplication
│   ├── model/             # Data models
│   │   ├── player-stats.ts # Player statistics
│   │   └── team-stats.ts   # Team statistics
│   └── queries/           # GraphQL queries
│       ├── GetGuildReports.ts
│       └── GetReport.ts
public/
├── backgrounds/           # Award background images
├── classicons/           # WoW class icons
└── logos/               # Team logos
```

## Deployment

This application is configured for GitHub Pages deployment:

### GitHub Setup

1. **Add Repository Secret**
   - Go to Settings > Secrets and variables > Actions
   - Add secret named `TOKEN` with your Warcraft Logs API token

2. **Enable GitHub Pages**
   - Go to Settings > Pages
   - Set source to "Deploy from a branch"
   - Select the branch where your built files are pushed

### Build Configuration

The app is configured in `next.config.mjs` for static export:
- `output: 'export'` - Generates static files
- `basePath: '/raid-recap'` - GitHub Pages repository path
- `images.unoptimized: true` - Required for static export

### Manual Deployment

```bash
npm run build
```

This creates an `out/` directory with static files ready for any static hosting provider.

## Season Management

### Current Season
The application tracks the most recently completed raid season. Configuration is typically set once per season in:
- `src/app/_config/encounters.ts` - Raid encounters
- `src/app/_config/awards.ts` - Seasonal awards
- Team configurations for new rosters

### Historical Seasons
Previous seasons are preserved using git tags. To view historical data:
```bash
git tag -l              # List available seasons
git checkout v1.0       # Switch to specific season
```

## Development Workflow

### GraphQL Code Generation
The project uses GraphQL Code Generator for type safety:
- Queries are defined in `src/warcraft-logs/queries/`
- Run `npm run generate` after modifying queries
- Generated types appear in `src/__generated__/`

### Testing
- Unit tests in `src/warcraft-logs/__tests__/`
- Run tests with `npm run test`
- Watch mode: `npm run test:watch`

### API Rate Limiting
The Warcraft Logs client includes rate limiting via Bottleneck to respect API limits and prevent failures during data fetching.

## Contributing

### Adding New Teams
1. Update `src/app/_config/teams.ts` with team configuration
2. Add team logo to `public/logos/` (if desired)
3. Optionally add team-specific awards to `TeamBits`

### Adding New Guilds
The application can support multiple guilds by:
1. Adding new team configurations with different `guildId` values
2. Updating routing if needed for guild-specific pages
3. Modifying the home page to list all available teams

### Code Conventions
- TypeScript strict mode enabled
- ESLint configuration provided
- Follow existing patterns in component and configuration structure
- Use GraphQL Code Generator for all API interactions

## Troubleshooting

### Common Issues

**Build Fails During Generation**
- Ensure `TOKEN` environment variable is set
- Verify Warcraft Logs API token is valid
- Check network connectivity to Warcraft Logs API

**No Data Appearing**
- Verify guild ID is correct
- Check report filters aren't too restrictive
- Ensure reports exist for the configured time period

**Performance Issues**
- Large guilds may hit API rate limits
- Consider more restrictive report filtering
- Monitor console for API errors

**Type Errors After Query Changes**
- Run `npm run generate` after modifying GraphQL queries
- Restart development server after type generation

### Getting Help

For Warcraft Logs API issues, consult their [official documentation](https://www.warcraftlogs.com/api/docs).

For application-specific issues, check the codebase comments and existing team configurations for examples.

---

*Originally created for the Shadow Hunters guild on Stormrage. Easily adaptable for other guilds and raid teams.*
