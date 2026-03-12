import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { getAllArticles } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

const URLS_PER_SITEMAP = 5000;

export async function generateSitemaps() {
  const { count } = await supabase
    .from("operators")
    .select("id", { count: "exact", head: true });

  const totalOperators = count ?? 0;
  const operatorSitemaps = Math.ceil(totalOperators / URLS_PER_SITEMAP);

  // id 0 = static + blog + departments + cities, id 1+ = operator batches
  const ids = Array.from({ length: 1 + operatorSitemaps }, (_, i) => ({ id: i }));
  return ids;
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // Sitemap 0: static pages + blog + departments + cities
  if (id === 0) {
    const staticPages: MetadataRoute.Sitemap = [
      { url: baseUrl, changeFrequency: "weekly", priority: 1.0 },
      { url: `${baseUrl}/recherche`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${baseUrl}/prix-obseques`, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.6 },
    ];

    // Blog articles
    const articles = getAllArticles();
    const blogPages: MetadataRoute.Sitemap = articles.map((a) => ({
      url: `${baseUrl}/blog/${a.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    // Department pages
    const { data: depts } = await supabase
      .from("operators")
      .select("departement");

    const uniqueDepts = [...new Set((depts ?? []).map((d) => d.departement).filter(Boolean))];
    const deptPages: MetadataRoute.Sitemap = uniqueDepts.map((code) => ({
      url: `${baseUrl}/departement/${code}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // City pages
    const { data: cities } = await supabase
      .from("operators")
      .select("ville_slug");

    const uniqueCities = [...new Set((cities ?? []).map((c) => c.ville_slug).filter(Boolean))];
    const cityPages: MetadataRoute.Sitemap = uniqueCities.map((ville) => ({
      url: `${baseUrl}/pompes-funebres/${ville}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticPages, ...blogPages, ...deptPages, ...cityPages];
  }

  // Sitemap 1+: operator pages in batches
  const offset = (id - 1) * URLS_PER_SITEMAP;
  const { data: operators } = await supabase
    .from("operators")
    .select("slug")
    .order("id")
    .range(offset, offset + URLS_PER_SITEMAP - 1);

  return (operators ?? []).map((op) => ({
    url: `${baseUrl}/pompes/${op.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
}
