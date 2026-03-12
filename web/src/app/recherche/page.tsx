import { Metadata } from "next";
import { searchOperators, DEFAULT_OPERATOR_NAME } from "@/lib/queries";
import SearchBar from "@/components/SearchBar";
import SearchFilters from "@/components/SearchFilters";
import OperatorCard from "@/components/OperatorCard";
import Pagination from "@/components/Pagination";
import Map from "@/components/MapWrapper";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    departement?: string;
    cp?: string;
    rating?: string;
    service?: string | string[];
  }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q || "";
  return {
    title: q ? `Pompes funèbres ${q}` : "Rechercher des pompes funèbres",
    description: q
      ? `Trouvez et comparez les pompes funèbres à ${q}. Avis, services et devis gratuit.`
      : "Recherchez des pompes funèbres partout en France. Comparez les avis et demandez un devis gratuit.",
    alternates: { canonical: "/recherche" },
  };
}

export default async function RecherchePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const page = parseInt(params.page || "1", 10);
  const departement = params.departement;
  const codePostal = params.cp || undefined;
  const minRating = params.rating ? parseFloat(params.rating) : undefined;
  const services = params.service
    ? Array.isArray(params.service) ? params.service : [params.service]
    : undefined;

  const results = await searchOperators({ query, departement, codePostal, minRating, services, page });

  const mapOperators = results.operators
    .filter((op) => op.lat && op.lng)
    .map((op) => ({
      id: op.id,
      slug: op.slug,
      name: op.google_name || op.raison_sociale || DEFAULT_OPERATOR_NAME,
      lat: op.lat!,
      lng: op.lng!,
      rating: op.rating,
    }));

  const filterParams = new URLSearchParams();
  if (query) filterParams.set("q", query);
  if (departement) filterParams.set("departement", departement);
  if (codePostal) filterParams.set("cp", codePostal);
  if (minRating) filterParams.set("rating", String(minRating));
  if (services) services.forEach((s) => filterParams.append("service", s));
  const baseUrl = `/recherche?${filterParams.toString()}`;

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

      <div className="mb-6">
        <SearchFilters />
      </div>

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
