#!/usr/bin/env python3
"""
Look up ability names + descriptions from wow.export Spell.csv / SpellName.csv dumps.

Spell.csv has ID, NameSubtext_lang (rank/subtitle, e.g. "Passive"),
Description_lang, and AuraDescription_lang, but no plain name - that lives in
the separate SpellName table, joined here on ID.

Reads from wow-exports/ by default - see wow-exports/README.md for how to
generate those files each season.

Usage:
    python3 scripts/lookup_spell.py 1260712 1233292 1218625
    python3 scripts/lookup_spell.py --file ids.txt --out wow-exports/abilities-export.csv

ids.txt format (one per line, fight name optional after a comma):
    1260712,Imperator Averzian
    1233292,Dimensius
"""

import argparse
import csv
import sys
from pathlib import Path

WOW_EXPORTS_DIR = Path(__file__).resolve().parent.parent / "wow-exports"
DEFAULT_SPELL_CSV = WOW_EXPORTS_DIR / "Spell.csv"
DEFAULT_SPELLNAME_CSV = WOW_EXPORTS_DIR / "SpellName.csv"


def load_csv_index(csv_path: str) -> dict[str, dict]:
    index = {}
    with open(csv_path, newline="", encoding="utf-8", errors="replace") as f:
        reader = csv.reader(f, delimiter=";")
        header = next(reader)
        for row in reader:
            if len(row) != len(header):
                continue
            index[row[0]] = dict(zip(header, row))
    return index


def load_ids(args) -> list[tuple[str, str]]:
    """Returns list of (spell_id, fight_hint)."""
    entries = []
    if args.file:
        with open(args.file) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                parts = [p.strip() for p in line.split(",", 1)]
                entries.append((parts[0], parts[1] if len(parts) > 1 else ""))
    entries.extend((sid, "") for sid in args.ids)
    return entries


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("ids", nargs="*", help="Spell IDs to look up")
    parser.add_argument("--file", help="Path to a file with one spell ID (optionally ',fight name') per line")
    parser.add_argument("--spell-csv", default=DEFAULT_SPELL_CSV, help=f"Path to wow.export Spell.csv (default: {DEFAULT_SPELL_CSV})")
    parser.add_argument("--name-csv", default=DEFAULT_SPELLNAME_CSV, help=f"Path to wow.export SpellName.csv (default: {DEFAULT_SPELLNAME_CSV})")
    parser.add_argument("--out", default="-", help="Output CSV path (default: stdout)")
    args = parser.parse_args()

    entries = load_ids(args)
    if not entries:
        parser.error("No spell IDs given (pass as args or --file)")

    spells = load_csv_index(Path(args.spell_csv).expanduser())
    names = load_csv_index(Path(args.name_csv).expanduser())
    print(f"Loaded {len(spells)} spells, {len(names)} names", file=sys.stderr)

    out = sys.stdout if args.out == "-" else open(args.out, "w", newline="")
    writer = csv.writer(out)
    writer.writerow(["name", "guid", "fight", "description", "aura_description", "tags"])

    for spell_id, fight_hint in entries:
        name_record = names.get(spell_id)
        spell_record = spells.get(spell_id)
        if name_record is None and spell_record is None:
            print(f"  ! {spell_id}: not found in either export", file=sys.stderr)
            continue

        name = name_record["Name_lang"] if name_record else "<UNKNOWN>"
        description = " ".join(spell_record["Description_lang"].split()) if spell_record else ""
        aura_description = " ".join(spell_record["AuraDescription_lang"].split()) if spell_record else ""
        print(f"  {spell_id} ({fight_hint or '?'}): {name} - {description[:80]}", file=sys.stderr)
        writer.writerow([name, spell_id, fight_hint, description, aura_description, ""])

    if out is not sys.stdout:
        out.close()


if __name__ == "__main__":
    main()
