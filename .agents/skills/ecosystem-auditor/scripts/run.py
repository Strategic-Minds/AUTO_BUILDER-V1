#!/usr/bin/env python3
"""
APEX Ecosystem Auditor — run.py
Scans Gmail, Drive, Supabase, GitHub, Vercel, ChatGPT Workspace
Compiles unified asset inventory, scores each asset, prepares migration plan.
"""

import os, sys, json, time, urllib.request, urllib.parse
from datetime import datetime, timezone

# ── Credentials ──────────────────────────────────────────────────────────────
DRIVE_TOKEN   = os.environ.get("GOOGLEDRIVE_ACCESS_TOKEN", "")
SHEETS_TOKEN  = os.environ.get("GOOGLESHEETS_ACCESS_TOKEN", "")
GMAIL_TOKEN   = os.environ.get("GMAIL_ACCESS_TOKEN", "")
SUPABASE_URL  = os.environ.get("SUPABASE_URL", "https://prhppuuwcnmfdhwsagug.supabase.co")
SUPABASE_KEY  = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", os.environ.get("SUPABASE_KEY", ""))
GITHUB_TOKEN  = os.environ.get("GITHUB_TOKEN", "")
VERCEL_TOKEN  = os.environ.get("VERCEL_TOKEN", "")
CODEX_KEY     = os.environ.get("CODEX_API_KEY", "")
MANIFEST_SHEET = "1PpB6mKvdie-lSoxY43Cyl_WhGpAcSVOUSkFEeHjKSpg"

DRIVE_MAP = {
    "AUTO_BUILDER_OS":   "0AMcYb0pLQvwIUk9PVA",
    "STRATEGIC_MINDS":   "0AMoWCk_jzUpdUk9PVA",
    "XPS":               "0AFeSGlA9oE_iUk9PVA",
}

# ── Helpers ───────────────────────────────────────────────────────────────────
def get(url, token, extra_headers=None):
    h = {"Authorization": f"Bearer {token}"}
    if extra_headers:
        h.update(extra_headers)
    req = urllib.request.Request(url, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=12) as r:
            return json.loads(r.read()), r.status
    except Exception as e:
        return {"error": str(e)}, 0

def score_asset(name, modified_days_ago, size_bytes, has_content):
    """Simple scoring: recency + size + content presence"""
    score = 0
    if modified_days_ago < 30:   score += 40
    elif modified_days_ago < 90: score += 25
    elif modified_days_ago < 365:score += 10
    if size_bytes > 10000:       score += 20
    elif size_bytes > 1000:      score += 10
    if has_content:              score += 30
    # Boost for known valuable name patterns
    valuable_keywords = ["strategy","sop","runbook","schema","architecture","brief","proposal","intel","report","template"]
    if any(k in name.lower() for k in valuable_keywords): score += 10
    # Penalize empty/test items
    if any(k in name.lower() for k in ["test","temp","draft","old","backup","copy"]): score -= 15
    return min(max(score, 0), 100)

def rating(score):
    if score >= 70: return "VALUABLE"
    if score >= 30: return "WEAK"
    return "ARCHIVE"

def categorize(name, path=""):
    text = (name + " " + path).lower()
    if any(k in text for k in ["autobuilder","auto_builder","auto builder","abs_"]): return "AUTO_BUILDER_OS"
    if any(k in text for k in ["strategic minds","sma_","consulting"]): return "STRATEGIC_MINDS"
    if any(k in text for k in ["national epoxy","nep_","epoxy pros"]): return "NEP"
    if any(k in text for k in ["epoxy will","ewcyl","ewcyl_"]): return "EWCYL"
    if any(k in text for k in ["xps","polishing","shopify"]): return "XPS"
    return "UNKNOWN"

# ── Scanners ─────────────────────────────────────────────────────────────────

def scan_drive():
    results = []
    for company, drive_id in DRIVE_MAP.items():
        url = (f"https://www.googleapis.com/drive/v3/files"
               f"?driveId={drive_id}&includeItemsFromAllDrives=true"
               f"&supportsAllDrives=true&corpora=drive"
               f"&fields=files(id,name,mimeType,size,modifiedTime,parents)"
               f"&pageSize=100&q=trashed%3Dfalse")
        data, status = get(url, DRIVE_TOKEN)
        files = data.get("files", [])
        for f in files:
            mod = f.get("modifiedTime", "")
            try:
                dt = datetime.fromisoformat(mod.replace("Z", "+00:00"))
                days_ago = (datetime.now(timezone.utc) - dt).days
            except:
                days_ago = 999
            size = int(f.get("size", 0))
            sc = score_asset(f["name"], days_ago, size, size > 0)
            results.append({
                "source": "DRIVE", "company": company,
                "name": f["name"], "id": f["id"],
                "type": f.get("mimeType", ""), "size": size,
                "days_ago": days_ago, "score": sc, "rating": rating(sc)
            })
    return results

def scan_github():
    results = []
    if not GITHUB_TOKEN:
        return [{"source": "GITHUB", "error": "No token"}]
    orgs = ["Strategic-Minds", "XPS-IINTELLIGENCE-SYSTEMS"]
    for org in orgs:
        url = f"https://api.github.com/orgs/{org}/repos?per_page=50&sort=updated"
        data, status = get(url, GITHUB_TOKEN, {"Accept": "application/vnd.github.v3+json"})
        if isinstance(data, list):
            for r in data:
                days_ago = 999
                try:
                    pushed = r.get("pushed_at", "")
                    if pushed:
                        dt = datetime.fromisoformat(pushed.replace("Z", "+00:00"))
                        days_ago = (datetime.now(timezone.utc) - dt).days
                except: pass
                sc = score_asset(r["name"], days_ago, r.get("size", 0) * 1000, not r.get("empty", False))
                if r.get("archived"): sc = max(sc - 30, 0)
                results.append({
                    "source": "GITHUB", "company": categorize(r["name"]),
                    "name": r["name"], "id": r.get("html_url"),
                    "type": "repo", "size": r.get("size", 0) * 1000,
                    "days_ago": days_ago, "score": sc, "rating": rating(sc),
                    "default_branch": r.get("default_branch", "main"),
                    "description": r.get("description", ""),
                    "archived": r.get("archived", False),
                })
    return results

def scan_vercel():
    results = []
    if not VERCEL_TOKEN:
        return [{"source": "VERCEL", "error": "No token"}]
    data, status = get("https://api.vercel.com/v9/projects?limit=50", VERCEL_TOKEN)
    projects = data.get("projects", [])
    for p in projects:
        updated = p.get("updatedAt", 0)
        days_ago = max(0, int((time.time() * 1000 - updated) / 86400000)) if updated else 999
        ready = p.get("latestDeployments", [{}])[0].get("readyState", "UNKNOWN") if p.get("latestDeployments") else "UNKNOWN"
        sc = score_asset(p["name"], days_ago, 50000, ready == "READY")
        if ready == "ERROR": sc = max(sc - 20, 0)
        results.append({
            "source": "VERCEL", "company": categorize(p["name"]),
            "name": p["name"], "id": p.get("id"),
            "type": "vercel_project", "size": 50000,
            "days_ago": days_ago, "score": sc, "rating": rating(sc),
            "deploy_status": ready,
            "framework": p.get("framework", "unknown"),
        })
    return results

def scan_supabase():
    results = []
    if not SUPABASE_KEY:
        return [{"source": "SUPABASE", "error": "No key"}]
    # Get agent_memory entries
    url = f"{SUPABASE_URL}/rest/v1/agent_memory?select=id,key,importance,tags,updated_at&order=importance.desc&limit=50"
    h = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    req = urllib.request.Request(url, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            records = json.loads(r.read())
            for rec in records:
                importance = rec.get("importance", 5)
                sc = min(importance * 10, 100)
                results.append({
                    "source": "SUPABASE", "company": categorize(rec.get("key", "")),
                    "name": rec.get("key", "unknown"), "id": rec.get("id"),
                    "type": "agent_memory", "size": importance * 1000,
                    "days_ago": 0, "score": sc, "rating": rating(sc),
                    "importance": importance,
                    "tags": rec.get("tags", []),
                })
    except Exception as e:
        results.append({"source": "SUPABASE", "error": str(e)})
    return results

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print(f"APEX ECOSYSTEM AUDIT — {datetime.now().strftime('%Y-%m-%d %H:%M EST')}")
    print("=" * 60)
    print()

    all_assets = []

    print("📡 Scanning Drive...")
    drive = scan_drive()
    all_assets.extend(drive)
    print(f"   Found {len(drive)} Drive items")

    print("📡 Scanning GitHub...")
    github = scan_github()
    all_assets.extend(github)
    print(f"   Found {len(github)} GitHub repos")

    print("📡 Scanning Vercel...")
    vercel = scan_vercel()
    all_assets.extend(vercel)
    print(f"   Found {len(vercel)} Vercel projects")

    print("📡 Scanning Supabase...")
    supabase = scan_supabase()
    all_assets.extend(supabase)
    print(f"   Found {len(supabase)} Supabase memory entries")

    print()
    # Summary by source
    for source in ["DRIVE", "GITHUB", "VERCEL", "SUPABASE"]:
        items = [a for a in all_assets if a.get("source") == source]
        valuable = [a for a in items if a.get("rating") == "VALUABLE"]
        weak     = [a for a in items if a.get("rating") == "WEAK"]
        archive  = [a for a in items if a.get("rating") == "ARCHIVE"]
        print(f"{source:12} {len(items):4} total | {len(valuable):3} VALUABLE | {len(weak):3} WEAK | {len(archive):3} ARCHIVE")

    print()
    print("TOP 10 VALUABLE ASSETS:")
    top = sorted([a for a in all_assets if a.get("rating") == "VALUABLE"],
                 key=lambda x: x.get("score", 0), reverse=True)[:10]
    for i, a in enumerate(top, 1):
        print(f"  {i:2}. [{a['source']}] {a['name']} — score {a['score']} — {a.get('company','?')}")

    print()
    print("TOP 10 WEAK ASSETS (review before archiving):")
    weak_top = sorted([a for a in all_assets if a.get("rating") == "WEAK"],
                      key=lambda x: x.get("score", 0), reverse=True)[:10]
    for i, a in enumerate(weak_top, 1):
        print(f"  {i:2}. [{a['source']}] {a['name']} — score {a['score']} — {a.get('company','?')}")

    # Save full report to file
    report_path = f"/tmp/ecosystem_audit_{int(time.time())}.json"
    with open(report_path, "w") as f:
        json.dump({"timestamp": datetime.now().isoformat(), "assets": all_assets}, f, indent=2)
    print()
    print(f"Full report saved: {report_path}")
    print()
    print("=" * 60)
    print("AWAITING JEREMY APPROVAL TO MIGRATE")
    print("Say 'migrate' to move VALUABLE assets to correct Drive folders")
    print("=" * 60)

    return all_assets

if __name__ == "__main__":
    main()
