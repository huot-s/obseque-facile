# Obseque - Online Funeral Directory for France

## Project Goal
Build a searchable online directory of funeral operators in France, aiming to be more useful and actionable than existing competitors (e.g. comparobseques.com which is essentially empty).

## Data Source
- **Primary dataset:** `liste-des-operateurs-funeraires-habilites-08-01-2026.csv` from data.gouv.fr
- ~9,437 licensed funeral operators ("opérateurs funéraires habilités")
- CSV format, `;` separated, 9 columns:
  1. Raison sociale (company name)
  2. Adresse
  3. Complément adresse (often empty)
  4. Ville
  5. Code postal
  6. Courriel (email)
  7. Téléphone
  8. Mobile (often empty)
  9. Prestations (comma-separated list of services)

## Data Quality Notes
- Last row is test data: "OF TEST" with `@yopmail.com` email — must be filtered out
- Some postal codes are incomplete (e.g. `3000` instead of `03000`)
- Prestations field is long text, but only ~8 distinct service categories exist

## Service Categories (from Prestations field)
- Fourniture de personnel/objets funéraires (~8,219 operators)
- Organisation des obsèques (~7,472)
- Housses, cercueils, urnes (~7,436)
- Transport des corps (~7,256)
- Corbillards/voitures de deuil (~6,968)
- Soins de conservation / thanatopraxie (~5,102)
- Chambres funéraires (~3,934)
- Crématorium (~800)

## Enrichment Strategy

### Google Places API Pipeline (reviews + geocoding in one shot)
```
Name + Address (text) → Find Place API → place_id → Place Details API → rating, reviews, lat/lng
```
- Find Place: matches business from text query (no geocoding needed as input)
- Place Details fields: `rating, user_ratings_total, reviews, geometry, website, opening_hours, url`
- Estimated cost: ~$320 for full 9,400 batch ($200/month free Google credit available)
- Plan: test on 50 operators first, tune query format, then full batch
- Store `place_id` permanently for cheap future refreshes

### Additional data to source (by priority)
1. Geocoding — comes free from Places API (geometry field)
2. Google Reviews — comes from Places API (rating + up to 5 reviews)
3. Legal/practical guides — editorial content (what to do when someone dies, deadlines, rights)
4. Pricing data — data.gouv devis-types or scraping operator websites
5. Complementary services — florists, marble workers, notaires (Google Places by category)
6. Crematoria/cemeteries — data.gouv / collectivités datasets

## Key Value Proposition
The killer combo: **search by location (map) + Google reviews + price indication**
