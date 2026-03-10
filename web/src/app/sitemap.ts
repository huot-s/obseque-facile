import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/recherche`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/prix-obseques`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.6 },
  ];

  // City pages
  const { data: cities } = await supabase
    .from("operators")
    .select("ville_slug")
    .limit(5000);

  const uniqueCities = [...new Set((cities ?? []).map((c) => c.ville_slug))];
  const cityPages: MetadataRoute.Sitemap = uniqueCities.map((ville) => ({
    url: `${baseUrl}/pompes-funebres/${ville}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Operator pages (enriched only for now)
  const { data: operators } = await supabase
    .from("operators")
    .select("slug")
    .eq("is_enriched", true)
    .limit(5000);

  const operatorPages: MetadataRoute.Sitemap = (operators ?? []).map((op) => ({
    url: `${baseUrl}/pompes/${op.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...cityPages, ...operatorPages];
}
