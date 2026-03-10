"""
Test enrichment of 50 funeral operators using Google Places API (v1 - New).
Reads API key from GOOGLE_PLACES_API_KEY environment variable.

Pipeline: Name + Address → Text Search (single call) → place_id, rating, lat/lng
"""

import csv
import json
import os
import sys
import time
import requests

API_KEY = os.environ.get("GOOGLE_PLACES_API_KEY")
if not API_KEY:
    print("Error: GOOGLE_PLACES_API_KEY environment variable not set")
    sys.exit(1)

TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"

CSV_FILE = "liste-des-operateurs-funeraires-habilites-08-01-2026.csv"
TEST_LIMIT = 5
OUTPUT_FILE = f"enriched_{TEST_LIMIT}.json"


FIELD_MASK = ",".join(
    [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.location",
        "places.rating",
        "places.userRatingCount",
        "places.websiteUri",
        "places.googleMapsUri",
        "places.nationalPhoneNumber",
        "places.regularOpeningHours",
        "places.photos",
    ]
)


def build_query(row):
    """Build a text query from operator name + address + city."""
    parts = [row["raison_sociale"], row["adresse"], row["ville"]]
    return " ".join(p for p in parts if p)


def search_place(query):
    """Text Search (New) → returns first matching place with all details."""
    resp = requests.post(
        TEXT_SEARCH_URL,
        headers={
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY,
            "X-Goog-FieldMask": FIELD_MASK,
        },
        json={
            "textQuery": query,
            "languageCode": "fr",
            "pageSize": 1,
        },
    )
    data = resp.json()
    if resp.status_code != 200:
        print(f"API ERROR: {data}")
        return None
    places = data.get("places", [])
    return places[0] if places else None


def read_csv(path, limit):
    """Read operators from CSV, skip test data."""
    operators = []
    with open(path, encoding="utf-8") as f:
        reader = csv.reader(f, delimiter=";")
        next(reader)  # skip header
        for row in reader:
            if len(row) < 9:
                continue
            entry = {
                "raison_sociale": row[0].strip(),
                "adresse": row[1].strip(),
                "complement_adresse": row[2].strip(),
                "ville": row[3].strip(),
                "code_postal": row[4].strip(),
                "courriel": row[5].strip(),
                "telephone": row[6].strip(),
                "mobile": row[7].strip(),
                "prestations": row[8].strip(),
            }
            # Skip test data
            if "yopmail" in entry["courriel"].lower():
                continue
            operators.append(entry)
            if len(operators) >= limit:
                break
    return operators


def main():
    operators = read_csv(CSV_FILE, TEST_LIMIT)
    print(f"Loaded {len(operators)} operators from CSV")

    results = []
    matched = 0
    with_rating = 0

    for i, op in enumerate(operators):
        query = build_query(op)
        print(
            f"[{i + 1}/{len(operators)}] {op['raison_sociale']} ({op['ville']})... ",
            end="",
            flush=True,
        )

        place = search_place(query)
        if not place:
            print("NO MATCH")
            results.append({**op, "google_match": None})
            continue

        matched += 1
        location = place.get("location", {})
        rating = place.get("rating")
        if rating:
            with_rating += 1

        enriched = {
            "source": {**op},
            "google_match": {
                "place_id": place.get("id"),
                "google_name": place.get("displayName", {}).get("text"),
                "google_address": place.get("formattedAddress"),
                "rating": rating,
                "user_ratings_total": place.get("userRatingCount"),
                "website": place.get("websiteUri"),
                "google_maps_url": place.get("googleMapsUri"),
                "phone": place.get("nationalPhoneNumber"),
                "lat": location.get("latitude"),
                "lng": location.get("longitude"),
            },
        }
        results.append(enriched)
        print(
            f"OK — rating: {rating or 'N/A'} ({place.get('userRatingCount', 0)} reviews)"
        )

        # Small delay to be nice to the API
        time.sleep(0.1)

    # Save results
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print("\n--- Summary ---")
    print(f"Total operators: {len(operators)}")
    print(f"Google match:    {matched} ({matched * 100 // len(operators)}%)")
    print(f"With rating:     {with_rating} ({with_rating * 100 // len(operators)}%)")
    print(f"Results saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
