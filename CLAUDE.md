# Obseque - Online Funeral Directory for France

## Project Goal
Build a searchable online directory of funeral operators in France, aiming to be more useful and actionable than existing competitors (e.g. comparobseques.com which is essentially empty).

## Tech Stack
- **Frontend:** Next.js (App Router) + Tailwind CSS
- **Database:** Supabase (PostgreSQL + PostGIS)
- **Map:** Leaflet (vanilla, not react-leaflet) via client component `MapWrapper.tsx`
- **Blog:** MDX rendered with `next-mdx-remote/rsc`
- **Data scripts:** Python (uv) for enrichment and import
- **Hosting target:** Hetzner VPS + Coolify

## Project Structure
```
obseque/
├── web/                         # Next.js app
│   └── src/
│       ├── app/
│       │   ├── page.tsx                    # Landing page (SSG)
│       │   ├── recherche/page.tsx          # Search results (SSR)
│       │   ├── pompes/[slug]/page.tsx      # Operator detail (ISR, JSON-LD)
│       │   ├── pompes-funebres/[ville]/    # City SEO pages (ISR)
│       │   ├── departement/[code]/         # Département pages (ISR)
│       │   ├── prix-obseques/              # Pricing info (SSG)
│       │   ├── blog/ + blog/[slug]/        # Blog index + MDX articles
│       │   ├── api/search/route.ts         # Search API
│       │   ├── api/devis/route.ts          # Devis submission
│       │   └── sitemap.ts                  # Dynamic sitemap
│       ├── components/                     # SearchBar, OperatorCard, Map, DevisForm, etc.
│       ├── lib/                            # supabase.ts, queries.ts, pricing.ts, services.ts, blog.ts
│       ├── content/blog/                   # MDX articles
│       └── data/prix_obseques_region.json  # Regional pricing data
├── scripts/
│   ├── schema.sql              # Supabase schema (PostGIS, FTS, RPC functions)
│   └── import_data.py          # CSV + enriched JSON → Supabase
├── data/
│   ├── liste-des-operateurs-funeraires-habilites-08-01-2026.csv
│   ├── enriched_600.json       # 600 operators enriched via Google Places API
│   └── prix_obseques_region.json
└── enrich_test.py              # Google Places API enrichment script
```

## Data Source
- **Primary dataset:** `data/liste-des-operateurs-funeraires-habilites-08-01-2026.csv` from data.gouv.fr
- ~9,437 licensed funeral operators ("opérateurs funéraires habilités")
- CSV format, `;` separated, 9 columns: raison sociale, adresse, complément, ville, code postal, courriel, téléphone, mobile, prestations

## Data Quality Notes
- Last row is test data: "OF TEST" with `@yopmail.com` email — filtered out in import
- Some postal codes are incomplete (e.g. `3000` instead of `03000`) — padded to 5 digits in import
- Prestations field is long text — parsed into 8 service categories via substring matching

## Service Categories
| Slug | Label | Count |
|------|-------|-------|
| fourniture-personnel | Fourniture de personnel et objets funéraires | ~8,219 |
| organisation-obseques | Organisation des obsèques | ~7,472 |
| housses-cercueils-urnes | Housses, cercueils et urnes | ~7,436 |
| transport-corps | Transport des corps | ~7,256 |
| corbillards | Corbillards et voitures de deuil | ~6,968 |
| soins-conservation | Soins de conservation | ~5,102 |
| chambres-funeraires | Chambres funéraires | ~3,934 |
| crematorium | Crématorium | ~800 |

## Google Places API Enrichment
- Uses **Places API v1** (new): single POST to `places.googleapis.com/v1/places:searchText`
- Field mask at **Enterprise tier** (no reviews to avoid Enterprise+Atmosphere pricing):
  `places.id, displayName, formattedAddress, location, rating, userRatingCount, websiteUri, googleMapsUri, nationalPhoneNumber, regularOpeningHours`
- Cost: ~$35 per 1,000 requests (1,000 free/month)
- 600 operators enriched so far, stored in `data/enriched_600.json`
- Script: `enrich_test.py` (reads `GOOGLE_PLACES_API_KEY` env var)

## Database (Supabase)
- **operators** table: all CSV fields + Google enrichment + PostGIS `location` + `fts` generated column (tsvector)
- **service_categories** table: 8 canonical services with slugs
- **operator_services** table: many-to-many link
- **devis_requests** table: quote requests with status tracking
- **RPC functions:** `nearby_operators(lat, lng, radius, limit)`, `update_operator_locations()`
- Env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`

## Regional Pricing Data
- Source: Silver Alliance / Simplifia study 2024
- 7 regions with specific averages, national average as fallback
- Stored in `data/prix_obseques_region.json` with département→region mapping
- National: average €4,789 / inhumation €5,044 / crémation €4,434

## Blog Articles (MDX)
- `que-faire-deces.mdx` — Step-by-step guide when someone dies
- `droits-familles-obseques.mdx` — Family rights regarding funerals
- Metadata defined in `src/lib/blog.ts` (ARTICLES_META)
- Rendered via `next-mdx-remote/rsc` with Tailwind Typography (`prose` classes)

## Key Architecture Decisions
- All Supabase queries are server-side only (service key never exposed to client)
- Leaflet map loaded via `MapWrapper.tsx` (client component with `dynamic` + `ssr: false`)
- Search uses `ilike` on ville/raison_sociale (FTS column exists but ilike is more forgiving)
- Pagination capped at 20 results per page (anti-scraping)
- Devis requests stored in DB (email notification TODO)

## Remaining Work
- [ ] Rate limiting middleware (60 req/min per IP on API routes)
- [ ] Email notification when devis is submitted
- [ ] Enrich remaining ~8,800 operators via Google Places API
- [ ] Deployment: Dockerfile (standalone output) + Coolify on Hetzner VPS
