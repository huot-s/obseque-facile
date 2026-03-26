-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Operators table
CREATE TABLE IF NOT EXISTS operators (
    id SERIAL PRIMARY KEY,
    raison_sociale TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    adresse TEXT,
    complement_adresse TEXT,
    ville TEXT NOT NULL,
    ville_normalized TEXT NOT NULL,
    ville_slug TEXT NOT NULL,
    code_postal TEXT NOT NULL,
    departement TEXT NOT NULL,
    region TEXT,
    courriel TEXT,
    telephone TEXT,
    mobile TEXT,
    prestations TEXT,
    -- Google enrichment (nullable)
    place_id TEXT,
    google_name TEXT,
    google_address TEXT,
    rating REAL,
    user_ratings_total INTEGER,
    website TEXT,
    google_maps_url TEXT,
    google_phone TEXT,
    lat REAL,
    lng REAL,
    location GEOGRAPHY(POINT, 4326),
    is_enriched BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Full-text search generated column
    fts tsvector GENERATED ALWAYS AS (to_tsvector('french', raison_sociale || ' ' || ville)) STORED
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_operators_ville_normalized ON operators(ville_normalized);
CREATE INDEX IF NOT EXISTS idx_operators_code_postal ON operators(code_postal);
CREATE INDEX IF NOT EXISTS idx_operators_departement ON operators(departement);
CREATE INDEX IF NOT EXISTS idx_operators_ville_slug ON operators(ville_slug);
CREATE INDEX IF NOT EXISTS idx_operators_location ON operators USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_operators_fts ON operators USING GIN(fts);

-- Service categories
CREATE TABLE IF NOT EXISTS service_categories (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL
);

-- Seed service categories
INSERT INTO service_categories (slug, label) VALUES
    ('transport-corps', 'Transport des corps'),
    ('organisation-obseques', 'Organisation des obsèques'),
    ('soins-conservation', 'Soins de conservation'),
    ('housses-cercueils-urnes', 'Housses, cercueils et urnes'),
    ('chambres-funeraires', 'Chambres funéraires'),
    ('corbillards', 'Corbillards et voitures de deuil'),
    ('fourniture-personnel', 'Fourniture de personnel et objets funéraires'),
    ('crematorium', 'Crématorium')
ON CONFLICT (slug) DO NOTHING;

-- Operator <-> service link
CREATE TABLE IF NOT EXISTS operator_services (
    operator_id INTEGER REFERENCES operators(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES service_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (operator_id, service_id)
);

-- Devis requests
CREATE TABLE IF NOT EXISTS devis_requests (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id),
    nom TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT,
    ville TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partner requests
CREATE TABLE IF NOT EXISTS partner_requests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    raison_sociale TEXT NOT NULL,
    nom_contact TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT,
    ville TEXT,
    code_postal TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RPC function for nearby operators search
CREATE OR REPLACE FUNCTION nearby_operators(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 20000,
    max_results INTEGER DEFAULT 20
)
RETURNS SETOF operators
LANGUAGE sql
STABLE
AS $$
    SELECT *
    FROM operators
    WHERE location IS NOT NULL
      AND ST_DWithin(
          location,
          ST_MakePoint(user_lng, user_lat)::geography,
          radius_meters
      )
    ORDER BY ST_Distance(
        location,
        ST_MakePoint(user_lng, user_lat)::geography
    )
    LIMIT max_results;
$$;

-- Helper function to update PostGIS location from lat/lng
CREATE OR REPLACE FUNCTION update_operator_locations()
RETURNS void
LANGUAGE sql
AS $$
    UPDATE operators
    SET location = ST_MakePoint(lng, lat)::geography
    WHERE lat IS NOT NULL AND lng IS NOT NULL AND location IS NULL;
$$;
