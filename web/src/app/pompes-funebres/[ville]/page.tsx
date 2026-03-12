import { Metadata } from "next";
import { getOperatorsByVille, DEFAULT_OPERATOR_NAME } from "@/lib/queries";
import { getPricingForPostalCode } from "@/lib/pricing";
import OperatorCard from "@/components/OperatorCard";
import PricingCard from "@/components/PricingCard";

import Map from "@/components/MapWrapper";

interface PageProps {
  params: Promise<{ ville: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ville } = await params;
  const operators = await getOperatorsByVille(ville);
  const villeName = operators[0]?.ville ?? ville;

  return {
    title: `Pompes funèbres ${villeName} — Comparer les opérateurs funéraires`,
    description: `${operators.length} pompes funèbres à ${villeName}. Comparez les avis clients, services et demandez un devis gratuit.`,
    alternates: { canonical: `/pompes-funebres/${ville}` },
  };
}

export const revalidate = 3600;

export default async function VillePage({ params }: PageProps) {
  const { ville } = await params;
  const operators = await getOperatorsByVille(ville);

  if (operators.length === 0) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-2xl font-bold text-stone-900">
          Aucun opérateur trouvé
        </h1>
        <p className="mt-2 text-stone-600">
          Aucune pompe funèbre référencée pour cette ville.
        </p>
      </div>
    );
  }

  const villeName = operators[0].ville;
  const codePostal = operators[0].code_postal;
  const pricing = getPricingForPostalCode(codePostal);

  const mapOperators = operators
    .filter((op) => op.lat && op.lng)
    .map((op) => ({
      id: op.id,
      slug: op.slug,
      name: op.google_name || op.raison_sociale || DEFAULT_OPERATOR_NAME,
      lat: op.lat!,
      lng: op.lng!,
      rating: op.rating,
    }));

  return (
    <div>
      <h1 className="text-3xl font-bold text-stone-900">
        Pompes funèbres à {villeName}
      </h1>
      <p className="mt-2 text-stone-600">
        {operators.length} opérateur{operators.length !== 1 ? "s" : ""} funéraire
        {operators.length !== 1 ? "s" : ""} à {villeName} ({codePostal})
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_350px]">
        <div className="space-y-4">
          {operators.map((op) => (
            <OperatorCard key={op.id} operator={op} />
          ))}
        </div>

        <div className="space-y-6">
          {mapOperators.length > 0 && (
            <Map operators={mapOperators} className="h-[400px]" />
          )}
          <PricingCard
            region={pricing.region}
            average={pricing.average}
            inhumation={pricing.inhumation}
            cremation={pricing.cremation}
          />
        </div>
      </div>
    </div>
  );
}
