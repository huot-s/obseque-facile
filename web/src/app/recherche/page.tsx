import { Metadata } from "next";
import { searchOperators } from "@/lib/queries";
import SearchBar from "@/components/SearchBar";
import OperatorCard from "@/components/OperatorCard";
import Pagination from "@/components/Pagination";
import Map from "@/components/MapWrapper";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; departement?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q || "";
  return {
    title: q ? `Pompes funèbres ${q}` : "Rechercher des pompes funèbres",
    description: q
      ? `Trouvez et comparez les pompes funèbres à ${q}. Avis, services et devis gratuit.`
      : "Recherchez des pompes funèbres partout en France. Comparez les avis et demandez un devis gratuit.",
  };
}

export default async function RecherchePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const page = parseInt(params.page || "1", 10);
  const departement = params.departement;

  const results = await searchOperators({ query, departement, page });

  const mapOperators = results.operators
    .filter((op) => op.lat && op.lng)
    .map((op) => ({
      id: op.id,
      slug: op.slug,
      name: op.google_name ?? op.raison_sociale,
      lat: op.lat!,
      lng: op.lng!,
      rating: op.rating,
    }));

  const baseUrl = `/recherche?q=${encodeURIComponent(query)}${departement ? `&departement=${departement}` : ""}`;

  return (
    <div>
      <div className="mb-6">
        <SearchBar defaultValue={query} />
      </div>

      {query && (
        <p className="mb-4 text-sm text-stone-500">
          {results.total} résultat{results.total !== 1 ? "s" : ""} pour &laquo; {query} &raquo;
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          {results.operators.length === 0 ? (
            <div className="rounded-lg border border-stone-200 bg-white p-8 text-center">
              <p className="text-stone-600">Aucun résultat trouvé.</p>
              <p className="mt-1 text-sm text-stone-400">
                Essayez avec un autre terme de recherche.
              </p>
            </div>
          ) : (
            results.operators.map((op) => (
              <OperatorCard key={op.id} operator={op} />
            ))
          )}
          <Pagination
            currentPage={results.page}
            totalPages={results.totalPages}
            baseUrl={baseUrl}
          />
        </div>

        {mapOperators.length > 0 && (
          <div className="hidden lg:block">
            <div className="sticky top-4">
              <Map operators={mapOperators} className="h-[600px]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
