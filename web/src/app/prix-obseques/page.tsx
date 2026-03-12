import { Metadata } from "next";
import { getNationalPricing } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Prix des obsèques en France — Coûts moyens par région",
  description:
    "Combien coûtent les obsèques en France ? Prix moyens par région pour l'inhumation et la crémation. Données 2024.",
  alternates: { canonical: "/prix-obseques" },
};

export default function PrixObsequesPage() {
  const pricing = getNationalPricing();

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-stone-900">
        Prix des obsèques en France
      </h1>
      <p className="mt-2 text-stone-600">
        Données issues de l&apos;étude {pricing.source} ({pricing.year})
      </p>

      {/* National averages */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-stone-200 bg-white p-6 text-center">
          <p className="text-sm text-stone-500">Prix moyen</p>
          <p className="mt-1 text-3xl font-bold text-stone-900">
            {pricing.national.average.toLocaleString("fr-FR")} &euro;
          </p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-6 text-center">
          <p className="text-sm text-stone-500">Inhumation</p>
          <p className="mt-1 text-3xl font-bold text-stone-900">
            {pricing.national.inhumation.toLocaleString("fr-FR")} &euro;
          </p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-6 text-center">
          <p className="text-sm text-stone-500">Crémation</p>
          <p className="mt-1 text-3xl font-bold text-stone-900">
            {pricing.national.cremation.toLocaleString("fr-FR")} &euro;
          </p>
        </div>
      </div>

      {/* Regional prices */}
      <h2 className="mt-12 text-xl font-bold text-stone-900">
        Prix moyen par région
      </h2>
      <p className="mt-1 text-sm text-stone-500">
        Les régions non listées n&apos;ont pas de données disponibles — le prix moyen
        national s&apos;applique.
      </p>

      <div className="mt-4 overflow-hidden rounded-lg border border-stone-200">
        <table className="w-full">
          <thead className="bg-stone-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">
                Région
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-stone-700">
                Prix moyen
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-stone-700">
                vs. nationale
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {pricing.regions.map((region) => {
              const diff = region.average - pricing.national.average;
              const diffPercent = ((diff / pricing.national.average) * 100).toFixed(1);
              return (
                <tr key={region.name} className="bg-white">
                  <td className="px-4 py-3 text-sm text-stone-800">
                    {region.name}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-stone-900">
                    {region.average.toLocaleString("fr-FR")} &euro;
                  </td>
                  <td
                    className={`px-4 py-3 text-right text-sm font-medium ${
                      diff > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {diff > 0 ? "+" : ""}
                    {diffPercent}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Explainer */}
      <div className="mt-8 rounded-lg border border-stone-200 bg-stone-50 p-6">
        <h3 className="font-semibold text-stone-800">
          Que comprennent ces prix ?
        </h3>
        <ul className="mt-3 space-y-1 text-sm text-stone-600">
          <li>
            <strong>Prestations obligatoires (~60%)</strong> : cercueil, transport,
            mise en bière, cérémonie
          </li>
          <li>
            <strong>Prestations optionnelles (~22%)</strong> : soins de conservation,
            capiton, plaques, fleurs
          </li>
          <li>
            <strong>Frais avancés (~18%)</strong> : taxe de crémation, concession,
            vacation de police
          </li>
        </ul>
        <p className="mt-3 text-xs text-stone-400">
          Les familles peuvent refuser toute prestation non réglementairement
          obligatoire. Demandez toujours un devis détaillé avant de vous engager.
        </p>
      </div>
    </div>
  );
}
