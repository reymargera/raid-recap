#!/usr/bin/env python3
"""
Generate the encounters.ts TypeScript array for a raid directly from
JournalEncounter.csv - no hand-transcription, no typos.

Usage:
    python3 scripts/generate_encounters.py 1307 Voidspire
    # => export const VoidspireEncounters = [ ... ];

Paste the output straight into src/app/_config/encounters.ts (Step 1 of
.season-update-template.md - remember it's additive, don't remove old raids).
"""

import argparse
import csv
import sys
from pathlib import Path

DEFAULT_DIR = Path(__file__).resolve().parent.parent / "wow-exports"


def load_csv(path: Path) -> list[dict]:
    with open(path, newline="", encoding="utf-8", errors="replace") as f:
        reader = csv.reader(f, delimiter=";")
        header = next(reader)
        rows = []
        for row in reader:
            if len(row) != len(header):
                continue
            rows.append(dict(zip(header, row)))
        return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("journal_instance_id", help="JournalInstanceID for the raid")
    parser.add_argument("raid_name", help="PascalCase raid name for the exported const, e.g. Voidspire")
    parser.add_argument("--dir", default=DEFAULT_DIR, help=f"Directory containing wow-exports CSVs (default: {DEFAULT_DIR})")
    args = parser.parse_args()

    base = Path(args.dir).expanduser()
    encounters = load_csv(base / "JournalEncounter.csv")

    bosses = sorted(
        (e for e in encounters if e["JournalInstanceID"] == args.journal_instance_id),
        key=lambda e: int(e["OrderIndex"]),
    )

    if not bosses:
        print(f"No encounters found for JournalInstanceID={args.journal_instance_id}", file=sys.stderr)
        sys.exit(1)

    print(f"Found {len(bosses)} bosses for JournalInstanceID {args.journal_instance_id}", file=sys.stderr)

    lines = [f"export const {args.raid_name}Encounters = ["]
    for i, b in enumerate(bosses):
        comma = "," if i < len(bosses) - 1 else ""
        name = b["Name_lang"].replace('"', '\\"')
        lines.append("    {")
        lines.append(f'        "id": {b["DungeonEncounterID"]},')
        lines.append(f'        "name": "{name}"')
        lines.append(f"    }}{comma}")
    lines.append("];")

    print("\n".join(lines))


if __name__ == "__main__":
    main()
