import { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Guides obsèques — Conseils et informations pratiques",
  description:
    "Guides pratiques sur les obsèques : démarches, droits des familles, coûts et choix funéraires.",
};

export default function BlogPage() {
  const articles = getAllArticles();

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-stone-900">
        Guides et informations pratiques
      </h1>
      <p className="mt-2 text-stone-600">
        Tout ce qu&apos;il faut savoir pour organiser des obsèques en France.
      </p>

      <div className="mt-8 space-y-6">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/blog/${article.slug}`}
            className="block rounded-lg border border-stone-200 bg-white p-6 hover:shadow-sm transition-shadow"
          >
            <h2 className="text-xl font-semibold text-stone-900">
              {article.title}
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              {article.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
