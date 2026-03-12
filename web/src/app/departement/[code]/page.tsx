import { Metadata } from "next";
import Link from "next/link";
import { getOperatorsByDepartement } from "@/lib/queries";

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Pompes funèbres département ${code}`,
    description: `Trouvez des pompes funèbres dans le département ${code}. Liste des villes avec opérateurs funéraires.`,
    alternates: { canonical: `/departement/${code}` },
  };
}

export const revalidate = 3600;

export default async function DepartementPage({ params }: PageProps) {
  const { code } = await params;
  const cities = await getOperatorsByDepartement(code);

  const totalOperators = cities.reduce((sum, c) => sum + c.count, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold text-stone-900">
        Pompes funèbres — Département {code}
      </h1>
      <p className="mt-2 text-stone-600">
        {totalOperators} opérateurs funéraires dans {cities.length} villes
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => (
          <Link
            key={city.ville_slug}
            href={`/pompes-funebres/${city.ville_slug}`}
            className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-4 hover:shadow-sm transition-shadow"
          >
            <span className="font-medium text-stone-800">{city.ville}</span>
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-600">
              {city.count} opérateur{city.count !== 1 ? "s" : ""}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
