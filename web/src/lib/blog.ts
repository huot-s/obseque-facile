import fs from "fs";
import path from "path";

export interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  content: string;
}

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

const ARTICLES_META: Record<string, { title: string; description: string }> = {
  "que-faire-deces": {
    title: "Que faire lors d'un décès ? Guide étape par étape",
    description:
      "Les démarches administratives et pratiques à effectuer dans les premières heures et jours suivant un décès.",
  },
  "droits-familles-obseques": {
    title: "Les droits des familles en matière d'obsèques",
    description:
      "Libre choix de l'opérateur, devis obligatoire, prestations facultatives : connaissez vos droits.",
  },
};

export function getAllArticles(): Omit<BlogArticle, "content">[] {
  return Object.entries(ARTICLES_META).map(([slug, meta]) => ({
    slug,
    ...meta,
  }));
}

export function getArticle(slug: string): BlogArticle | null {
  const meta = ARTICLES_META[slug];
  if (!meta) return null;

  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, "utf-8");
  return { slug, ...meta, content };
}
