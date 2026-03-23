import { supabase } from "./supabase";

export const DEFAULT_OPERATOR_NAME = "Pompes Funèbres";

export interface Operator {
  id: number;
  raison_sociale: string;
  slug: string;
  adresse: string;
  complement_adresse: string | null;
  ville: string;
  ville_slug: string;
  code_postal: string;
  departement: string;
  region: string | null;
  courriel: string | null;
  telephone: string | null;
  mobile: string | null;
  prestations: string | null;
  place_id: string | null;
  google_name: string | null;
  google_address: string | null;
  rating: number | null;
  user_ratings_total: number | null;
  website: string | null;
  google_maps_url: string | null;
  google_phone: string | null;
  lat: number | null;
  lng: number | null;
  is_enriched: boolean;
  services: string[];
}

export interface SearchParams {
  query?: string;
  departement?: string;
  codePostal?: string;
  minRating?: number;
  services?: string[];
  page?: number;
  perPage?: number;
}

export interface SearchResult {
  operators: Operator[];
  total: number;
  page: number;
  totalPages: number;
}

const OPERATOR_SELECT = `
  id, raison_sociale, slug, adresse, complement_adresse, ville, ville_slug,
  code_postal, departement, region, courriel, telephone, mobile, prestations,
  place_id, google_name, google_address, rating, user_ratings_total,
  website, google_maps_url, google_phone, lat, lng, is_enriched
`;

async function attachServices(operators: Operator[]): Promise<Operator[]> {
  if (operators.length === 0) return operators;

  const ids = operators.map((op) => op.id);
  const serviceMap = new Map<number, string[]>();

  // Batch IDs to avoid PostgREST URL length limits
  const BATCH_SIZE = 300;
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const { data: links } = await supabase
      .from("operator_services")
      .select("operator_id, service_categories(slug)")
      .in("operator_id", batch);

    for (const link of links ?? []) {
      const slug = (link.service_categories as unknown as { slug: string })?.slug;
      if (!slug) continue;
      const existing = serviceMap.get(link.operator_id) ?? [];
      existing.push(slug);
      serviceMap.set(link.operator_id, existing);
    }
  }

  return operators.map((op) => ({
    ...op,
    services: serviceMap.get(op.id) ?? [],
  }));
}

export async function searchOperators(params: SearchParams): Promise<SearchResult> {
  const { query, departement, codePostal, minRating, services, page = 1, perPage = 20 } = params;
  const limit = Math.min(perPage, 20);
  const offset = (page - 1) * limit;

  let queryBuilder = supabase
    .from("operators")
    .select(OPERATOR_SELECT, { count: "exact" });

  if (query) {
    // Search by city name or postal code
    const trimmed = query.trim();
    if (/^\d{2,5}$/.test(trimmed)) {
      queryBuilder = queryBuilder.like("code_postal", `${trimmed}%`);
    } else {
      queryBuilder = queryBuilder.textSearch(
        "fts",
        trimmed.split(/\s+/).join(" & "),
        { type: "plain", config: "french" }
      );
    }
  }

  if (departement) {
    queryBuilder = queryBuilder.eq("departement", departement);
  }

  if (codePostal) {
    queryBuilder = queryBuilder.eq("code_postal", codePostal);
  }

  if (minRating) {
    queryBuilder = queryBuilder.gte("rating", minRating);
  }

  // Order: enriched first (with ratings), then by rating desc
  queryBuilder = queryBuilder
    .order("is_enriched", { ascending: false })
    .order("rating", { ascending: false, nullsFirst: false })
    .order("raison_sociale", { ascending: true });

  // When filtering by services, fetch all matching operators then filter
  // post-query (service filtering requires the junction table).
  if (services && services.length > 0) {
    const { data, error } = await queryBuilder;

    if (error) {
      console.error("Search error:", error);
      return { operators: [], total: 0, page, totalPages: 0 };
    }

    let operators = (data ?? []).map((op) => ({ ...op, services: [] as string[] }));
    operators = await attachServices(operators);
    operators = operators.filter((op) =>
      services.every((s) => op.services.includes(s))
    );

    const total = operators.length;
    return {
      operators: operators.slice(offset, offset + limit),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  queryBuilder = queryBuilder.range(offset, offset + limit - 1);
  const { data, count, error } = await queryBuilder;

  if (error) {
    console.error("Search error:", error);
    return { operators: [], total: 0, page, totalPages: 0 };
  }

  let operators = (data ?? []).map((op) => ({ ...op, services: [] as string[] }));
  operators = await attachServices(operators);

  const total = count ?? 0;
  return {
    operators,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getOperatorBySlug(slug: string): Promise<Operator | null> {
  const { data, error } = await supabase
    .from("operators")
    .select(OPERATOR_SELECT)
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  const [operator] = await attachServices([{ ...data, services: [] }]);
  return operator;
}

export async function getOperatorsByVille(villeSlug: string): Promise<Operator[]> {
  const { data } = await supabase
    .from("operators")
    .select(OPERATOR_SELECT)
    .eq("ville_slug", villeSlug)
    .order("is_enriched", { ascending: false })
    .order("rating", { ascending: false, nullsFirst: false })
    .order("raison_sociale", { ascending: true })
    .limit(50);

  const operators = (data ?? []).map((op) => ({ ...op, services: [] as string[] }));
  return attachServices(operators);
}

export async function getOperatorsByDepartement(
  code: string
): Promise<{ ville: string; ville_slug: string; count: number }[]> {
  const { data } = await supabase
    .from("operators")
    .select("ville, ville_slug")
    .eq("departement", code);

  if (!data) return [];

  const cityMap = new Map<string, { ville: string; ville_slug: string; count: number }>();
  for (const row of data) {
    const existing = cityMap.get(row.ville_slug);
    if (existing) {
      existing.count++;
    } else {
      cityMap.set(row.ville_slug, {
        ville: row.ville,
        ville_slug: row.ville_slug,
        count: 1,
      });
    }
  }

  return Array.from(cityMap.values()).sort((a, b) => b.count - a.count);
}

export async function getAllVilleSlugs(): Promise<string[]> {
  const { data } = await supabase
    .from("operators")
    .select("ville_slug");

  if (!data) return [];
  return [...new Set(data.map((r) => r.ville_slug).filter(Boolean))];
}

export async function getPopularCities(
  limit: number = 30
): Promise<{ ville: string; ville_slug: string; count: number }[]> {
  const { data } = await supabase
    .from("operators")
    .select("ville, ville_slug");

  if (!data) return [];

  const cityMap = new Map<string, { ville: string; ville_slug: string; count: number }>();
  for (const row of data) {
    if (!row.ville_slug) continue;
    const existing = cityMap.get(row.ville_slug);
    if (existing) {
      existing.count++;
    } else {
      cityMap.set(row.ville_slug, {
        ville: row.ville,
        ville_slug: row.ville_slug,
        count: 1,
      });
    }
  }

  return Array.from(cityMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getNearbyOperators(
  lat: number,
  lng: number,
  radiusKm: number = 20,
  limit: number = 20
): Promise<Operator[]> {
  // Use PostGIS ST_DWithin for geo proximity search
  const { data } = await supabase.rpc("nearby_operators", {
    user_lat: lat,
    user_lng: lng,
    radius_meters: radiusKm * 1000,
    max_results: limit,
  });

  if (!data) return [];
  const operators = data.map((op: Record<string, unknown>) => ({ ...op, services: [] as string[] }));
  return attachServices(operators);
}
