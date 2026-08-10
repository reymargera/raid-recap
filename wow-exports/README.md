# wow-exports

Drop wow.export CSV dumps here at the start of each season. This folder's contents are gitignored (large, regenerated per season) - only this README is tracked, so the folder always exists and the setup is documented in-repo.

Used by `scripts/lookup_spell.py` and `scripts/build_boss_abilities.py` (see `.season-update-template.md` Step 9) to build the boss ability/tag map for `src/warcraft-logs/data/boss-abilities.ts`.

## One-time setup each season

1. Open [wow.export](https://wow.export) against the current game build
2. Export these DB2 tables as CSV (Export > Raw Client DB Files, or equivalent in whatever version you're running):
   - `Spell` → `Spell.csv`
   - `SpellName` → `SpellName.csv`
   - `JournalEncounter` → `JournalEncounter.csv`
   - `JournalEncounterSection` → `JournalEncounterSection.csv`
3. Place all four files directly in this folder (`wow-exports/`)
4. Run the scripts (from repo root):
   ```bash
   python3 scripts/build_boss_abilities.py <JournalInstanceID> --out wow-exports/<raid-name>-abilities.csv
   ```
   Repeat once per raid in the tier - a tier is usually 2-3 raids, each with its own `JournalInstanceID`.

## Finding a raid's JournalInstanceID

`JournalInstanceID` is the internal ID for a raid/dungeon zone in the Adventure Guide - not the same as the WarcraftLogs zone ID or the per-boss `DungeonEncounterID` (which *does* match WCL's encounter IDs). If you don't already know it:
```bash
grep -i "<raid name>" JournalInstance.csv   # if you've exported that table too
```
or cross-reference from a known boss: filter `JournalEncounter.csv` by `Name_lang` to find one boss in the raid, then read its `JournalInstanceID` column - all bosses in the same raid share it (see the Voidspire example in `.season-update-template.md`).

## What each table gives us

| Table | Gives us |
|---|---|
| `Spell.csv` | `Description_lang` / `AuraDescription_lang` - the actual tooltip text per ability ID. No plain name column. |
| `SpellName.csv` | `Name_lang` - the display name per ability ID, joined on `ID`. |
| `JournalEncounter.csv` | One row per boss: `Name_lang`, `DungeonEncounterID` (matches WCL), `JournalInstanceID` (which raid), `OrderIndex` (kill order) |
| `JournalEncounterSection.csv` | Adventure Guide sections per boss, `SpellID` linking each section to a specific ability - this is what lets us attribute abilities to bosses automatically instead of guessing from description text |
