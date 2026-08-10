# Season Update Quick Reference Guide

This guide provides a high-level overview of the seasonal update process for the Raid Recap project.

> **Note:** This is the second revision of this guide. The first revision (written 2025-11-10, for TWW Season 3) predates the migration to Cloudflare Workers + D1 and the boss-ability-tagging feature. This revision adds the files/steps that migration introduced. See "What Changed Since Last Revision" at the bottom.

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
├── wow-exports/                  # gitignored wow.export CSV dumps, regenerated each season (see README.md inside)
│   └── README.md                 # Setup instructions - which DB2 tables to export and why
├── scripts/
│   ├── lookup_spell.py           # Look up name/description for specific spell IDs
│   └── build_boss_abilities.py   # Auto-build a full boss->ability list for a raid from wow-exports/
│
├── src/app/_config/
│   ├── encounters.ts             # Boss encounter IDs/names, ONE ARRAY PER RAID (additive - never delete old arrays)
│   ├── auras.ts                  # Tracked ability IDs for the CURRENT season
│   ├── awards.ts                 # Award definitions (static + seasonal)
│   └── teams.ts                  # Team configurations (still static config, not yet DB-backed - see MIGRATION_PLAN.md Phase 9)
│
├── src/app/teams/[id]/
│   └── log-puller.ts             # SEASON_START_TIME, fight segmentation, stat extraction
│
├── src/warcraft-logs/
│   ├── model/
│   │   ├── player-stats.ts       # Seasonal stat keys + generateBlankStats()
│   │   └── team-stats.ts         # allEncounters (CURRENT raid only) + bossProgression tracking
│   ├── data/
│   │   └── boss-abilities.ts     # NEW (post Nov-2025): per-boss ability + tag map, CURRENT raid only
│   └── queries/GetReport.ts      # GraphQL fragments for mechanic queries
│
├── src/app/_components/
│   ├── award-slide/slides.tsx           # UI text (season name)
│   └── team-landing/
│       ├── boss-progression-card.tsx    # NEW: "Dungeon Journal" UI, imports CURRENT raid encounters directly
│       ├── boss-details-modal.tsx       # NEW: per-boss damage/death breakdown, reads boss-abilities.ts
│       ├── add-highlight-modal.tsx      # Lists ALL raids (additive) so old highlights stay taggable
│       └── highlights-section.tsx       # Same - additive raid list
│
└── public/backgrounds/           # Background images
    └── [season-dir]/             # Season-specific images
```

## What Gets Updated

### Additive (never delete old entries)
- **encounters.ts**: Add a new exported array for the new raid. Keep old raid arrays - `add-highlight-modal.tsx` and `highlights-section.tsx` reference all of them so historical highlights stay taggable by boss.

### Repointed to the new/current raid only
- **team-stats.ts** (`allEncounters`, line ~75): swap the imported encounter array to the new raid. This drives boss-kill/wipe detection and `bossProgression`.
- **boss-progression-card.tsx**: swap the imported encounter array (used for `totalBosses`, the killed-count calc, and the boss list render). This is the "Dungeon Journal" card on the team landing page.
- **log-puller.ts**: `splitReportFights()` and `splitFightsForReport()` both reference the encounter array directly to classify boss vs. trash fights - swap to the new raid.
- **boss-abilities.ts**: replace `BossNames`/`BOSS_ABILITIES` with a fresh per-boss ability + tag map for the new raid. Powers the damage/death "Boss Report" section of `boss-details-modal.tsx`.

### New season-specific content
- **auras.ts**: New tracked ability/spell IDs, replacing (not appending to) the previous season's constants.
- **player-stats.ts**: New `TWWSeason[N]StatKeys` array. Update `SeasonalStatKeys = [...TWWSeason[N]StatKeys]` AND the loop inside `generateBlankStats()` (currently hardcoded to `TWWSeason3StatKeys` - this doesn't auto-follow `SeasonalStatKeys`, easy to miss).
- **awards.ts**: New seasonal awards referencing the new stat keys.
- **log-puller.ts**: New `SEASON_START_TIME`, new GraphQL field extraction in `extractPlayerStatsFromFightReport()`.
- **GetReport.ts**: New GraphQL fragments per mechanic.
- **slides.tsx**: Update season number in title slide text.
- **backgrounds/**: New season-specific images.

### Untouched by a season update
- **teams.ts**: Team roster config is season-agnostic (rosters/attendance overrides carry forward). Only touch it if rosters actually changed.
- Historical data in D1 (`playerStats`/`teamStats` tables) is tagged by a `season` column, so old seasons' stats/awards remain queryable and aren't affected by config changes for the new season.

## Data Flow

```
WarcraftLogs API
      ↓
GetReport.ts (GraphQL queries for mechanics)
      ↓
log-puller.ts (splitFightsForReport + extractPlayerStatsFromLog)
      ↓
ProcessReportWorkflow (Cloudflare Workflow, durable/retryable steps)
      ↓
D1 via Drizzle (playerStats, teamStats tables - one row per player per log)
      ↓
API routes (GET /api/teams/:id, /api/stats/:teamId) aggregate across logs
      ↓
UI Components (Team Landing Page: boss-progression-card, boss-details-modal / Awards: slides.tsx)
```

Reports are processed one at a time (via the "Upload Logs" modal or `POST /api/reports/process`), not as a single bulk site build. There's also a bulk `fetchTeamStats()` path in `log-puller.ts` still present for guild-wide pulls, but the per-report workflow is the primary flow in production.

## Key Concepts

### Encounters
Each raid boss has a unique encounter ID that WarcraftLogs uses to identify fights. Each raid gets its own exported array in `encounters.ts`; the "current season" files (`team-stats.ts`, `boss-progression-card.tsx`, `log-puller.ts`) each independently import whichever array represents the active raid.

### Auras (Abilities)
Each mechanic in WoW has a spell/ability ID. These are added to `auras.ts` so the system knows what to look for in combat logs.

### Seasonal Stats
Mechanics are tracked as "seasonal stats" - numeric values stored per player (e.g., "times stood in fire", "debuff uptime"). These are defined in `player-stats.ts`.

### Boss Abilities & Tags
Independent from seasonal stats/awards: `boss-abilities.ts` maps each boss's encounter ID to the abilities that hit the raid, tagged (`Avoidable`, `Unavoidable`, `DoT`, `AoE`, `TankBuster`, etc.). This powers the per-boss damage/death breakdown in the boss-details modal on the team landing page - separate from the seasonal-award system.

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
- **Ability IDs**: Run `scripts/build_boss_abilities.py <JournalInstanceID>` against `wow-exports/` (see its README) to get every boss's abilities with real names/descriptions in one pass, or check the ability in a real report's WarcraftLogs tables
- **Mechanic behavior**: Watch boss guides or pull logs to understand mechanics

### Testing
- Run `npm run dev` locally and process one real report from the new season through the "Upload Logs" modal (or `curl -X POST /api/reports/process`)
- Use `npm run db:studio` to inspect the resulting `playerStats`/`teamStats` rows in D1
- Check WarcraftLogs GraphQL explorer to prototype queries before wiring them into `GetReport.ts`
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

2. **player-stats.ts**: Add `'timesHitByFire'` to the new season's stat keys array

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
   const timesHitByFire = sumByPlayer(getTableDataEntries(report?.fireBreathHits), (d: any) => 1);
   ```

5. **awards.ts**: Create award:
   ```typescript
   const mostFireBreaths: Award = {
       name: 'Flame Grilled',
       description: 'Most Times Hit By Boss Fire Breath',
       stat: (p) => p.getSeaontalStat('timesHitByFire', 'Boss'),
       background: 'season4/fire-boss.webp',
       supportsAveraging: false,
   };
   ```

## Troubleshooting

### Stats not appearing
- Check ability ID is correct
- Verify GraphQL query syntax
- Ensure extraction mapping is correct (guid vs name)
- Check null handling (`?? {}` / `?? []`)

### TypeScript errors
- Ensure stat key is in the new season's `TWWSeason[N]StatKeys` array
- Verify `generateBlankStats()` loops over the new key array (it's hardcoded, not derived from `SeasonalStatKeys`)
- Run `npm run generate` (GraphQL codegen) after modifying queries

### Awards showing wrong data
- Check stat key matches between player-stats and awards
- Verify math is correct (e.g., converting ms to seconds)
- Check player filters if applicable

### Boss Progression card / Dungeon Journal showing 0 bosses or wrong bosses
- Confirm `team-stats.ts` and `boss-progression-card.tsx` both import the new raid's encounter array, not the old one

### Boss details modal has no damage/death data
- Confirm the boss's encounter ID exists in `boss-abilities.ts`'s `BossNames`/`BOSS_ABILITIES` map

## Getting Help

1. Consult `.season-update-template.md` for detailed instructions
2. Reference previous season's commit history for patterns (`git log --oneline | grep -i season`)
3. Test queries in WarcraftLogs GraphQL explorer
4. Check WarcraftLogs API documentation for data types

## What Changed Since Last Revision

The v1.0 template (2025-11-10) was written against the static-export/GitHub-Pages architecture and a single-raid data model. Since then:
- The app moved to Cloudflare Workers + D1 (Drizzle ORM) with per-report processing via a Cloudflare Workflow, not a full static build (see `MIGRATION_PLAN.md`).
- The Team Landing Page shipped, adding `boss-progression-card.tsx` and `boss-details-modal.tsx`, both of which hardcode references to the current raid's encounters independent of `log-puller.ts`.
- `boss-abilities.ts` was added as a separate per-boss ability/tag system (see `BOSS_ABILITIES_PLAN.md`), unrelated to the seasonal-award pipeline but requiring its own per-season update.
- `encounters.ts` became additive across raids (rather than replaced each season) because highlight-tagging needs historical raids available.

## Version History

- **v1.0** (2025-11-10): Initial template creation for Season 3 update (static-export architecture)
- **v2.0** (2026-08-08): Revised for Cloudflare/D1 architecture, boss-progression card, and boss-abilities tagging system

---

**Remember**: Take your time, test thoroughly, and don't hesitate to reference previous season implementations as examples. The pattern is consistent across seasons!
