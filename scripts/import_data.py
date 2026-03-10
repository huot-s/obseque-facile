"""
Import operators from CSV + enriched JSON into Supabase.
Reads SUPABASE_URL and SUPABASE_SERVICE_KEY from environment variables.
"""

import csv
import json
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
CSV_FILE = os.path.join(DATA_DIR, "liste-des-operateurs-funeraires-habilites-08-01-2026.csv")
ENRICHED_FILE = os.path.join(DATA_DIR, "enriched_600.json")
PRICING_FILE = os.path.join(DATA_DIR, "prix_obseques_region.json")

# Service category matching rules
SERVICE_MATCHES = [
    ("transport-corps", "transport des corps"),
    ("organisation-obseques", "organisation des obsèques"),
    ("soins-conservation", "soins de conservation"),
    ("housses-cercueils-urnes", "fourniture des housses"),
    ("chambres-funeraires", "chambres funéraires"),
    ("corbillards", "corbillards"),
    ("fourniture-personnel", "fourniture de personnel"),
    ("crematorium", "crématorium"),
]


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


def get_departement(code_postal: str) -> str:
    prefix = code_postal[:2]
    if prefix == "20":
        # Corsica: 20000-20190 = 2A, 20200+ = 2B
        num = int(code_postal[:5]) if code_postal[:5].isdigit() else 20000
        return "2A" if num < 20200 else "2B"
    return prefix


def parse_services(prestations: str) -> list[str]:
    lower = prestations.lower()
    return [slug for slug, match in SERVICE_MATCHES if match in lower]


def load_enriched() -> dict[str, dict]:
    """Load enriched data, keyed by (raison_sociale_normalized, code_postal)."""
    try:
        with open(ENRICHED_FILE, encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Warning: {ENRICHED_FILE} not found, skipping enrichment")
        return {}

    enriched = {}
    for entry in data:
        source = entry.get("source", entry)
        match = entry.get("google_match")
        if not match:
            continue
        key = (
            slugify(source.get("raison_sociale", "")),
            fix_postal_code(source.get("code_postal", "")),
        )
        enriched[key] = match
    return enriched


def load_dept_to_region() -> dict[str, str]:
    with open(PRICING_FILE, encoding="utf-8") as f:
        data = json.load(f)
    return data.get("departement_to_region", {})


def read_csv():
    operators = []
    with open(CSV_FILE, encoding="utf-8") as f:
        reader = csv.reader(f, delimiter=";")
        next(reader)  # skip header
        for row in reader:
            if len(row) < 9:
                continue
            entry = {
                "raison_sociale": row[0].strip(),
                "adresse": row[1].strip(),
                "complement_adresse": row[2].strip() or None,
                "ville": row[3].strip(),
                "code_postal": fix_postal_code(row[4]),
                "courriel": row[5].strip() or None,
                "telephone": row[6].strip() or None,
                "mobile": row[7].strip() or None,
                "prestations": row[8].strip() or None,
            }
            # Skip test data
            if entry["courriel"] and "yopmail" in entry["courriel"].lower():
                continue
            operators.append(entry)
    return operators


def main():
    print("Loading data...")
    operators = read_csv()
    enriched = load_enriched()
    dept_to_region = load_dept_to_region()
    print(f"  CSV: {len(operators)} operators")
    print(f"  Enriched: {len(enriched)} entries")

    # Fetch service category IDs
    result = supabase.table("service_categories").select("id, slug").execute()
    service_id_map = {row["slug"]: row["id"] for row in result.data}

    # Track slugs to ensure uniqueness
    slug_counts: dict[str, int] = {}

    print("Importing operators...")
    batch_size = 100
    all_service_links = []

    for i in range(0, len(operators), batch_size):
        batch = operators[i : i + batch_size]
        rows = []

        for op in batch:
            dept = get_departement(op["code_postal"])
            region = dept_to_region.get(dept)
            ville_normalized = strip_accents(op["ville"].lower())
            ville_slug = slugify(op["ville"])

            base_slug = slugify(f"{op['raison_sociale']}-{op['ville']}")
            slug_counts[base_slug] = slug_counts.get(base_slug, 0) + 1
            slug = base_slug if slug_counts[base_slug] == 1 else f"{base_slug}-{slug_counts[base_slug]}"

            # Check enrichment
            key = (slugify(op["raison_sociale"]), op["code_postal"])
            match = enriched.get(key)

            row = {
                "raison_sociale": op["raison_sociale"],
                "slug": slug,
                "adresse": op["adresse"],
                "complement_adresse": op["complement_adresse"],
                "ville": op["ville"],
                "ville_normalized": ville_normalized,
                "ville_slug": ville_slug,
                "code_postal": op["code_postal"],
                "departement": dept,
                "region": region,
                "courriel": op["courriel"],
                "telephone": op["telephone"],
                "mobile": op["mobile"],
                "prestations": op["prestations"],
                "is_enriched": match is not None,
            }

            if match:
                row.update(
                    {
                        "place_id": match.get("place_id"),
                        "google_name": match.get("google_name"),
                        "google_address": match.get("google_address"),
                        "rating": match.get("rating"),
                        "user_ratings_total": match.get("user_ratings_total"),
                        "website": match.get("website"),
                        "google_maps_url": match.get("google_maps_url"),
                        "google_phone": match.get("phone"),
                        "lat": match.get("lat"),
                        "lng": match.get("lng"),
                    }
                )

            rows.append(row)

        # Insert batch
        result = supabase.table("operators").insert(rows).execute()

        # Collect service links
        for inserted_row in result.data:
            op_id = inserted_row["id"]
            prestations = inserted_row.get("prestations") or ""
            services = parse_services(prestations)
            for svc_slug in services:
                svc_id = service_id_map.get(svc_slug)
                if svc_id:
                    all_service_links.append(
                        {"operator_id": op_id, "service_id": svc_id}
                    )

        done = min(i + batch_size, len(operators))
        print(f"  {done}/{len(operators)} operators imported")

    # Insert service links in batches
    print(f"Importing {len(all_service_links)} service links...")
    for i in range(0, len(all_service_links), 500):
        batch = all_service_links[i : i + 500]
        supabase.table("operator_services").insert(batch).execute()

    # Update PostGIS location for enriched operators
    print("Updating PostGIS locations...")
    supabase.rpc(
        "update_operator_locations",
        {},
    ).execute()

    print("Done!")


if __name__ == "__main__":
    main()
