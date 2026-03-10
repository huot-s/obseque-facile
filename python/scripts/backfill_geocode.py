"""
Backfill lat/lng for operators that were not enriched via Google Places API,
using the geocoded CSV from data.gouv.fr (BAN geocoder).

Updates operators WHERE lat IS NULL, matching by raison_sociale + code_postal.
Then calls update_operator_locations() to set PostGIS geography column.

Reads SUPABASE_URL and SUPABASE_SERVICE_KEY from environment variables.
"""

import csv
import os
import re
import sys
import unicodedata

from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
GEOCODED_CSV = os.path.join(
    DATA_DIR, "liste-des-operateurs-funeraires-habilites-08-01-2026.geocoded.csv"
)


def strip_accents(s: str) -> str:
    nfkd = unicodedata.normalize("NFKD", s)
    return "".join(c for c in nfkd if not unicodedata.combining(c))


def slugify(s: str) -> str:
    s = strip_accents(s.lower().strip())
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def fix_postal_code(cp: str) -> str:
    cp = cp.strip()
    if len(cp) < 5:
        cp = cp.zfill(5)
    return cp


def load_geocoded() -> dict[tuple[str, str], tuple[float, float]]:
    """Load geocoded CSV, keyed by (slugified raison_sociale, code_postal) -> (lat, lng)."""
    geo = {}
    with open(GEOCODED_CSV, encoding="utf-8") as f:
        reader = csv.reader(f, delimiter=";")
        next(reader)  # skip header
        for row in reader:
            if len(row) < 18:
                continue
            raison_sociale = row[0].strip()
            code_postal = fix_postal_code(row[4])
            longitude = row[9].strip()
            latitude = row[10].strip()
            result_status = row[17].strip()

            # Skip rows without valid geocoding
            if result_status != "ok" or not longitude or not latitude:
                continue

            # Skip test data
            courriel = row[5].strip()
            if courriel and "yopmail" in courriel.lower():
                continue

            try:
                lat = float(latitude)
                lng = float(longitude)
            except ValueError:
                continue

            key = (slugify(raison_sociale), code_postal)
            geo[key] = (lat, lng)
    return geo


def main():
    print("Loading geocoded data...")
    geocoded = load_geocoded()
    print(f"  {len(geocoded)} geocoded entries loaded")

    # Fetch operators not enriched via Google Places API
    print("Fetching non-enriched operators...")
    result = (
        supabase.table("operators")
        .select("id, raison_sociale, code_postal")
        .eq("is_enriched", False)
        .execute()
    )
    all_operators = result.data
    print(f"  {len(all_operators)} non-enriched operators")

    # Match and update
    updated = 0
    batch = []
    for op in all_operators:
        key = (slugify(op["raison_sociale"]), op["code_postal"])
        coords = geocoded.get(key)
        if not coords:
            continue
        lat, lng = coords
        batch.append({"id": op["id"], "lat": lat, "lng": lng})

        if len(batch) >= 50:
            for item in batch:
                supabase.table("operators").update(
                    {"lat": item["lat"], "lng": item["lng"]}
                ).eq("id", item["id"]).execute()
            updated += len(batch)
            print(f"  {updated} operators updated...")
            batch = []

    # Flush remaining
    for item in batch:
        supabase.table("operators").update(
            {"lat": item["lat"], "lng": item["lng"]}
        ).eq("id", item["id"]).execute()
    updated += len(batch)

    print(f"  Total: {updated} operators updated with geocoded coordinates")

    # Update PostGIS location column
    print("Updating PostGIS locations...")
    supabase.rpc("update_operator_locations", {}).execute()

    print("Done!")


if __name__ == "__main__":
    main()
