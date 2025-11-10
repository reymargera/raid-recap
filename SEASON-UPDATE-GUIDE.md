# Season Update Quick Reference Guide

This guide provides a high-level overview of the seasonal update process for the Raid Recap project.

## Overview

The Raid Recap site tracks player statistics and creates awards based on boss mechanics throughout a WoW raid season. When a new season begins, the site needs to be updated to track new encounters, mechanics, and create relevant awards.

## Update Workflow

### Option 1: Manual Update (Do It Yourself)
1. Open `.season-update-template.md`
2. Follow each step sequentially
3. Update all referenced files
4. Test and commit

### Option 2: Delegated Update (Agent/Assistant)
1. Fill out `.season-update-worksheet.md` with season info and mechanics
2. Provide both the worksheet and template to an assistant/agent
3. Review the changes
4. Test and commit

## File Structure

```
raid-recap/
├── .season-update-template.md    # Detailed step-by-step guide
├── .season-update-worksheet.md   # Data collection worksheet
├── SEASON-UPDATE-GUIDE.md        # This file - quick reference
│
├── src/app/_config/
│   ├── encounters.ts             # Boss encounter IDs and names
│   ├── auras.ts                  # Tracked ability IDs
│   ├── awards.ts                 # Award definitions
│   └── teams.ts                  # Team configurations
│
├── src/app/teams/[id]/
│   └── log-puller.ts             # Data extraction logic
│
├── src/warcraft-logs/
│   ├── model/player-stats.ts     # Stat definitions and keys
│   └── queries/GetReport.ts      # GraphQL queries
│
├── src/app/_components/
│   └── award-slide/slides.tsx    # UI text (season name)
│
└── public/backgrounds/           # Background images
    └── [season-dir]/             # Season-specific images
```

## What Gets Updated

### Configuration Files
- **encounters.ts**: Add new raid boss IDs and names
- **auras.ts**: Add tracked ability/spell IDs
- **awards.ts**: Create awards based on mechanics
- **player-stats.ts**: Define seasonal stat keys

### Logic Files
- **log-puller.ts**: Update season start date, encounter references, data extraction
- **GetReport.ts**: Add GraphQL fragments for mechanic queries

### UI Files
- **slides.tsx**: Update season number in text

### Assets
- **backgrounds/**: Add season-specific images

## Data Flow

```
WarcraftLogs API
      ↓
GetReport.ts (GraphQL queries for mechanics)
      ↓
log-puller.ts (Extract and organize data)
      ↓
player-stats.ts (Store in seasonal stats)
      ↓
awards.ts (Reference stats in awards)
      ↓
UI Components (Display awards and stats)
```

## Key Concepts

### Encounters
Each raid boss has a unique encounter ID that WarcraftLogs uses to identify fights. These are added to the `encounters.ts` file and used to filter which fights to analyze.

### Auras (Abilities)
Each mechanic in WoW has a spell/ability ID. These are added to `auras.ts` so the system knows what to look for in combat logs.

### Seasonal Stats
Mechanics are tracked as "seasonal stats" - numeric values stored per player (e.g., "times stood in fire", "debuff uptime"). These are defined in `player-stats.ts`.

### Awards
Awards are objects that reference a seasonal stat and provide a name, description, and background image. They're displayed as award slides in the UI.

### GraphQL Fragments
WarcraftLogs provides a GraphQL API. Each mechanic you want to track needs a GraphQL "fragment" that queries the API for that data. These are defined in `GetReport.ts`.

### Data Extraction
Once data is fetched from WarcraftLogs, it needs to be extracted and mapped to player IDs. This happens in `log-puller.ts` in the `extractPlayerStatsFromFightReport()` function.

## Common Tracking Patterns

### Count Occurrences
Track how many times something happened (e.g., "times hit by mechanic").
- **GraphQL**: Query debuff table with ability ID
- **Extract**: Count applications per player
- **Award**: Show total count

### Track Uptime
Track duration of a buff/debuff (e.g., "time spent with debuff").
- **GraphQL**: Query debuff table with ability ID
- **Extract**: Sum `totalUptime` per player
- **Award**: Display in seconds (divide by 1000)

### Track Damage
Track damage taken/done from a specific source.
- **GraphQL**: Query damage table with ability ID
- **Extract**: Sum `total` damage per player
- **Award**: Show total or average damage

### Track Deaths
Track deaths from a specific ability.
- **GraphQL**: Query deaths table with ability ID
- **Extract**: Count deaths per player
- **Award**: Show death count

### Track Casts
Track ability usage (e.g., "bombs thrown").
- **GraphQL**: Query casts table with ability ID
- **Extract**: Count `uses` per player
- **Award**: Show cast count

## Tips for Success

### Finding Information
- **Encounter IDs**: Check WarcraftLogs zone reports or GraphQL explorer
- **Ability IDs**: Extract from Wowhead URLs or WarcraftLogs ability tables
- **Mechanic behavior**: Watch boss guides or pull logs to understand mechanics

### Testing
- Use a sample report from the new season to test queries
- Check WarcraftLogs GraphQL explorer to prototype queries
- Verify stats appear correctly before creating awards

### Images
- Take screenshots during progression or find high-quality zone artwork
- Use WebP format for smaller file sizes
- Name files descriptively (e.g., `boss-mechanic.webp`)

### Naming Conventions
- **Stat keys**: camelCase, descriptive (e.g., `timesRolledOver`)
- **Constants**: PascalCase (e.g., `RollingRubbish`)
- **Awards**: Creative, often humorous names with clear descriptions

## Example: Adding a Simple Mechanic

Let's say you want to track "times hit by boss fire breath" (Ability ID: 12345):

1. **auras.ts**: Add `export const FireBreath = 12345;`

2. **player-stats.ts**: Add `'timesHitByFire'` to seasonal stat keys

3. **GetReport.ts**: Add fragment:
   ```typescript
   export const FireBreathFragment = gql`
       fragment FireBreathFragment on Report {
           fireBreathHits: table(
               fightIDs: $bossFightIds
               dataType: DamageTaken
               abilityID: 12345
           )
       }
   `;
   ```

4. **log-puller.ts**: Extract data:
   ```typescript
   const timesHitByFire = report?.fireBreathHits?.data.entries
       .reduce((map, entry) => (map[entry.guid] = entry.total || 0, map), {}) ?? {};
   ```

5. **awards.ts**: Create award:
   ```typescript
   const mostFireBreaths: Award = {
       name: 'Flame Grilled',
       description: 'Most Times Hit By Boss Fire Breath',
       stat: (p) => p.getSeaontalStat('timesHitByFire', 'Boss'),
       background: 'season3/fire-boss.webp',
       supportsAveraging: false,
   };
   ```

## Troubleshooting

### Stats not appearing
- Check ability ID is correct
- Verify GraphQL query syntax
- Ensure extraction mapping is correct (guid vs name)
- Check null handling (`?? {}`)

### TypeScript errors
- Ensure stat key is in `SeasonalStatKeys` array
- Verify `generateBlankStats()` initializes all keys
- Run type generation if needed

### Awards showing wrong data
- Check stat key matches between player-stats and awards
- Verify math is correct (e.g., converting ms to seconds)
- Check player filters if applicable

## Getting Help

1. Consult `.season-update-template.md` for detailed instructions
2. Reference previous season's commit history for patterns
3. Test queries in WarcraftLogs GraphQL explorer
4. Check WarcraftLogs API documentation for data types

## Version History

- **v1.0** (2025-11-10): Initial template creation for Season 3 update

---

**Remember**: Take your time, test thoroughly, and don't hesitate to reference previous season implementations as examples. The pattern is consistent across seasons!
