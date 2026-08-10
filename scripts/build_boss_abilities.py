#!/usr/bin/env python3
"""
Build a per-boss ability CSV for a raid, using wow.export dumps of
JournalEncounter, JournalEncounterSection, SpellName, and Spell.

This replaces manually pairing spell IDs with boss names (lookup_spell.py) -
JournalEncounterSection already links each ability's SpellID to a specific
JournalEncounterID (boss), in Adventure Guide presentation order.

Reads from wow-exports/ by default - see wow-exports/README.md for how to
generate those files each season.

Usage:
    python3 scripts/build_boss_abilities.py 1307 --out wow-exports/voidspire-abilities.csv

Output columns match abilities-export.csv (name,guid,fight,tags), plus a
description column for context while tagging. "fight" is populated using the
DungeonEncounterID (matches WarcraftLogs encounter IDs), not the internal
JournalEncounterID.

The "tags" column is pre-filled with keyword-based guesses from the
description text (see suggest_tags()) - these are a starting point to
review/correct, not authoritative. Tagging avoidability/mechanic type
correctly needs someone who's actually seen the fight.
"""

import argparse
import csv
import re
import sys
from pathlib import Path

DEFAULT_DIR = Path(__file__).resolve().parent.parent / "wow-exports"

# Keyword -> tag guesses, checked against the lowercased description text.
# Order matters where tags are mutually exclusive-ish (Avoidable checked
# before Unavoidable, etc.) - first match per pair wins.
TAG_KEYWORDS = [
    (r"\bunavoidable\b", "Unavoidable"),
    (r"\bavoid(a|able|ing)?\b|\bdodge\b|\bmove(ment)? out\b", "Avoidable"),
    (r"\bevery\b.{0,20}\bsec\b|\bdot\b|damage over time|\bperiodically\b.{0,20}damage", "DoT"),
    (r"\ball players?\b|\bnearby (players|allies)\b|\bwithin \d+ ?yards?\b|\bradius\b|\bseveral (players|targets)\b", "AoE"),
    (r"\bcone\b|\bfrontal\b|\bin front of\b", "Frontal"),
    (r"\bcurrent target\b|\brandom (player|enemy|target)\b|\bnearest (player|enemy|target)\b", "Targeted"),
    (r"\bknock(s|ed|ing)?\b.{0,20}\b(back|away)\b|\bstun(s|ned|ning)?\b|\broot(s|ed|ing)?\b|\bincapacitat|\bsilenc(e|ed|ing)|\bfear(s|ed)?\b", "LossOfControl"),
    (r"\bstack(s|ing)?\b.{0,20}\b(increas|reduc)|\beach (application|stack)\b", "Ramping"),
    (r"\btank\b|\bmain tank\b|\bcurrent tank\b", "TankBuster"),
    (r"\bsoak\b|\bstand in\b|\bactivat(e|ing|ed)\b.{0,20}\borb\b|\binteract\b", "Soak"),
    (r"\bleft?[- ]?behind\b|\bpool\b|\bzone\b|\bpatch\b|\bvoid-claimed space\b", "GroundHazard"),
]


def suggest_tags(description: str) -> list[str]:
    if not description:
        return []
    text = description.lower()
    tags = []
    for pattern, tag in TAG_KEYWORDS:
        if tag in tags:
            continue
        if re.search(pattern, text):
            tags.append(tag)
    return tags


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
    parser.add_argument("journal_instance_id", help="JournalInstanceID for the raid (e.g. 1307 for Voidspire)")
    parser.add_argument("--dir", default=DEFAULT_DIR, help=f"Directory containing the wow.export CSVs (default: {DEFAULT_DIR})")
    parser.add_argument("--out", default="-", help="Output CSV path (default: stdout)")
    args = parser.parse_args()

    base = Path(args.dir).expanduser()
    encounters = load_csv(base / "JournalEncounter.csv")
    sections = load_csv(base / "JournalEncounterSection.csv")
    names = load_csv(base / "SpellName.csv")
    spells = load_csv(base / "Spell.csv")

    name_idx = {n["ID"]: n["Name_lang"] for n in names}
    spell_idx = {s["ID"]: s for s in spells}

    bosses = sorted(
        (e for e in encounters if e["JournalInstanceID"] == args.journal_instance_id),
        key=lambda e: int(e["OrderIndex"]),
    )

    if not bosses:
        print(f"No encounters found for JournalInstanceID={args.journal_instance_id}", file=sys.stderr)
        sys.exit(1)

    print(f"Found {len(bosses)} bosses for JournalInstanceID {args.journal_instance_id}:", file=sys.stderr)
    for b in bosses:
        print(f"  {b['Name_lang']} (encounter id {b['DungeonEncounterID']})", file=sys.stderr)
    print(file=sys.stderr)

    out = sys.stdout if args.out == "-" else open(args.out, "w", newline="")
    writer = csv.writer(out)
    writer.writerow(["name", "guid", "fight", "encounter_id", "description", "tags"])

    seen_guids_per_boss = set()
    for boss in bosses:
        boss_sections = [s for s in sections if s["JournalEncounterID"] == boss["ID"] and s["SpellID"] not in ("", "0")]
        boss_sections.sort(key=lambda s: int(s["OrderIndex"]))

        for s in boss_sections:
            spell_id = s["SpellID"]
            key = (boss["ID"], spell_id)
            if key in seen_guids_per_boss:
                continue
            seen_guids_per_boss.add(key)

            ability_name = name_idx.get(spell_id, "<UNKNOWN>")
            spell_record = spell_idx.get(spell_id)
            description = " ".join(spell_record["Description_lang"].split()) if spell_record else ""
            tags = ", ".join(suggest_tags(description))

            writer.writerow([ability_name, spell_id, boss["Name_lang"], boss["DungeonEncounterID"], description, tags])

    if out is not sys.stdout:
        out.close()
        print(f"Wrote to {args.out}", file=sys.stderr)


if __name__ == "__main__":
    main()
