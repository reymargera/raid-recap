#!/usr/bin/env python3
"""
Generate the BossNames + BOSS_ABILITIES TypeScript block for
src/warcraft-logs/data/boss-abilities.ts from one or more
build_boss_abilities.py output CSVs.

This is a full REPLACEMENT generator (matching the "seasonal is current-only"
pattern) - it emits a complete BossNames/BOSS_ABILITIES block for whichever
raids you pass in, in encounter order, ready to paste over the previous
season's data.

Usage:
    python3 scripts/generate_boss_abilities_ts.py \
        wow-exports/voidspire-abilities.csv \
        wow-exports/dreamrift-abilities.csv \
        wow-exports/march-on-queldanas-abilities.csv \
        wow-exports/sporefall-abilities.csv
"""

import argparse
import csv
import sys
from collections import OrderedDict


def esc(s: str) -> str:
    return s.replace("'", "\\'")


def tags_to_ts(tags_field: str) -> str:
    tags = [t.strip() for t in tags_field.split(",") if t.strip()]
    if not tags:
        return "[]"
    return "[" + ", ".join(f"AbilityTag.{t}" for t in tags) + "]"


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("csv_files", nargs="+", help="build_boss_abilities.py output CSVs, in raid order")
    args = parser.parse_args()

    # boss_id -> { name, abilities: [ {guid, name, tags} ] }, preserving first-seen order
    bosses = OrderedDict()

    for path in args.csv_files:
        with open(path, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                encounter_id = row["encounter_id"]
                if encounter_id not in bosses:
                    bosses[encounter_id] = {"name": row["fight"], "abilities": []}
                bosses[encounter_id]["abilities"].append(row)

    names_lines = []
    for encounter_id, data in bosses.items():
        names_lines.append(f"    {encounter_id}: '{esc(data['name'])}',")

    abilities_lines = []
    for encounter_id, data in bosses.items():
        abilities_lines.append(f"    [{encounter_id}, [ // {data['name']}")
        for a in data["abilities"]:
            abilities_lines.append(
                f"        {{ guid: {a['guid']}, name: '{esc(a['name'])}', tags: {tags_to_ts(a['tags'])} }},"
            )
        abilities_lines.append("    ]],")

    print("const BossNames = {")
    print("\n".join(names_lines))
    print("} as const;\n")

    print("export type BossEncounterId = keyof typeof BossNames;\n")

    print("export const BOSS_ABILITIES = new Map<BossEncounterId, BossAbilityInfo[]>([")
    print("\n".join(abilities_lines))
    print("]);")

    total_abilities = sum(len(d["abilities"]) for d in bosses.values())
    print(f"\n// {len(bosses)} bosses, {total_abilities} abilities", file=sys.stderr)


if __name__ == "__main__":
    main()
