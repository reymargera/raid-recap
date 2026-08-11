#!/usr/bin/env python3
"""
Bulk-submit a list of Warcraft Logs report URLs/codes to a running
raid-recap instance's /api/reports/process endpoint, with a delay between
each to avoid hammering the WCL API (local dev has the Bottleneck rate
limiter disabled - see client.ts's useRateLimiter, only active when
NODE_ENV=production).

By default only processes the FIRST report, so you can confirm auth/wiring
works before committing to the full list - pass --all to run everything.

Requires ADMIN_API_KEY to be set in .dev.vars (restart the server after
adding it) - that's what authorizes the X-API-Key header this script sends.

Usage:
    python3 scripts/bulk_upload_reports.py --api-key <ADMIN_API_KEY>
    python3 scripts/bulk_upload_reports.py --api-key <ADMIN_API_KEY> --all
    python3 scripts/bulk_upload_reports.py --api-key <ADMIN_API_KEY> --all --limit 5
"""

import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.request

DEFAULT_FILE = "wow-exports/gold-logs-test.txt"
DEFAULT_TEAM = "shadow-hunters-gold-team"
DEFAULT_BASE_URL = "http://localhost:8787"
DEFAULT_DELAY = 15
POLL_INTERVAL = 3
POLL_TIMEOUT = 180
TERMINAL_STATUSES = {"complete", "errored", "terminated"}


def extract_report_codes(path: str) -> list[str]:
    with open(path) as f:
        text = f.read()
    # Report codes are alphanumeric strings after "reports/" in the URLs.
    # Not parsed as strict JSON since the file has a trailing comma.
    return re.findall(r"reports/([A-Za-z0-9]+)", text)


def post_json(url: str, body: dict, api_key: str) -> tuple[int, dict]:
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        url,
        data=data,
        method="POST",
        headers={"Content-Type": "application/json", "X-API-Key": api_key},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")


def get_json(url: str) -> tuple[int, dict]:
    try:
        with urllib.request.urlopen(url, timeout=30) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")


def process_report(base_url: str, team_id: str, report_code: str, api_key: str) -> bool:
    """Returns True if the report reached a non-error terminal state."""
    print(f"  Submitting {report_code}...")
    status, body = post_json(
        f"{base_url}/api/reports/process",
        {"teamId": team_id, "reportCode": report_code},
        api_key,
    )

    if status != 200:
        print(f"  ! Submit failed ({status}): {body.get('error', body)}")
        return False

    workflow_id = body["workflowId"]
    print(f"  Workflow {workflow_id} started, polling...")

    elapsed = 0
    while elapsed < POLL_TIMEOUT:
        time.sleep(POLL_INTERVAL)
        elapsed += POLL_INTERVAL

        status, body = get_json(f"{base_url}/api/reports/process/{workflow_id}")
        if status != 200:
            print(f"  ! Status check failed ({status}): {body.get('error', body)}")
            return False

        wf_status = body.get("status")
        if wf_status in TERMINAL_STATUSES:
            output = body.get("output")
            print(f"  Workflow {wf_status}: {output}")
            return wf_status == "complete"

        print(f"  ... still {wf_status} ({elapsed}s elapsed)")

    print(f"  ! Timed out after {POLL_TIMEOUT}s waiting for workflow {workflow_id}")
    return False


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--file", default=DEFAULT_FILE, help=f"File with report URLs (default: {DEFAULT_FILE})")
    parser.add_argument("--team", default=DEFAULT_TEAM, help=f"Team ID to upload to (default: {DEFAULT_TEAM})")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help=f"Server base URL (default: {DEFAULT_BASE_URL})")
    parser.add_argument("--api-key", required=True, help="Value matching ADMIN_API_KEY in .dev.vars")
    parser.add_argument("--delay", type=int, default=DEFAULT_DELAY, help=f"Seconds to wait between reports (default: {DEFAULT_DELAY})")
    parser.add_argument("--all", action="store_true", help="Process the full list instead of just the first report")
    parser.add_argument("--limit", type=int, help="Only process this many reports (implies --all)")
    parser.add_argument("--continue-on-error", action="store_true", help="Keep going after a failed report instead of stopping (default: stop on first failure, e.g. WCL API throttling)")
    args = parser.parse_args()

    codes = extract_report_codes(args.file)
    if not codes:
        print(f"No report codes found in {args.file}", file=sys.stderr)
        sys.exit(1)

    if args.limit:
        codes = codes[:args.limit]
    elif not args.all:
        codes = codes[:1]
        print("Test mode: processing only the first report. Pass --all to run the full list.\n")

    print(f"Found {len(codes)} report(s) to process for team '{args.team}'\n")

    results = {"complete": 0, "failed": 0}
    stopped_early = False
    for i, code in enumerate(codes):
        print(f"[{i + 1}/{len(codes)}] {code}")
        ok = process_report(args.base_url, args.team, code, args.api_key)
        results["complete" if ok else "failed"] += 1

        if not ok and not args.continue_on_error:
            remaining = len(codes) - i - 1
            print(f"\n! Stopping after failure (possible throttling) - {remaining} report(s) not attempted.")
            print("  Re-run with --continue-on-error to process failures anyway, or wait and re-run later")
            print("  (already-completed reports will just dedupe, so it's safe to re-run the same list).")
            stopped_early = True
            break

        if i < len(codes) - 1:
            print(f"  Waiting {args.delay}s before next report...\n")
            time.sleep(args.delay)

    print(f"\nDone. {results['complete']} succeeded, {results['failed']} failed out of {len(codes)}.")
    if results["failed"] > 0 or stopped_early:
        sys.exit(1)


if __name__ == "__main__":
    main()
