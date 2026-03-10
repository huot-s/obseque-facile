import { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getArticle, getAllArticles } from "@/lib/blog";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Article non trouvé" };

  return {
    title: article.title,
    description: article.description,
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/blog"
        className="text-sm text-stone-500 hover:text-stone-700 mb-6 inline-block"
      >
        &larr; Retour aux guides
      </Link>

      <article className="prose prose-stone prose-lg max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-xl prose-h2:mt-10 prose-h3:text-lg prose-a:text-stone-700 prose-a:underline prose-table:text-sm">
        <MDXRemote source={article.content} />
      </article>

      <div className="mt-12 rounded-lg border border-stone-200 bg-stone-50 p-6 text-center">
        <p className="text-lg font-semibold text-stone-800">
          Besoin de trouver des pompes funèbres ?
        </p>
        <p className="mt-1 text-sm text-stone-600">
          Comparez les opérateurs funéraires près de chez vous et demandez un devis gratuit.
        </p>
        <Link
          href="/recherche"
          className="mt-4 inline-block rounded-md bg-stone-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-stone-700 transition-colors"
        >
          Rechercher des pompes funèbres
        </Link>
      </div>
    </div>
  );
}
