import type { Metadata } from "next";
import PartenaireForm from "@/components/PartenaireForm";

export const metadata: Metadata = {
  title: "Devenir partenaire",
  description:
    "Vous êtes opérateur funéraire ? Rejoignez notre annuaire et gagnez en visibilité auprès des familles. Remplissez le formulaire pour démarrer une discussion de partenariat.",
  alternates: {
    canonical: "/partenaires",
  },
};

export default function PartenairesPage() {
  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        Devenir partenaire
      </h1>
      <p className="mt-4 text-stone-600">
        Vous êtes opérateur funéraire et souhaitez gagner en visibilité auprès
        des familles ? Rejoignez notre annuaire en tant que partenaire et
        bénéficiez d&#39;une mise en avant de votre établissement.
      </p>

      <div className="mt-6 rounded-lg border border-stone-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-stone-800">
          Les avantages du partenariat
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-stone-600">
          <li>Fiche établissement enrichie et mise en avant dans les résultats</li>
          <li>Réception directe des demandes de devis des familles</li>
          <li>Visibilité accrue sur votre zone géographique</li>
        </ul>
      </div>

      <div className="mt-8 rounded-lg border border-stone-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-stone-800">
          Commencer une discussion
        </h2>
        <p className="mb-6 text-sm text-stone-600">
          Remplissez ce formulaire et nous reviendrons vers vous rapidement pour
          discuter des modalités de partenariat.
        </p>
        <PartenaireForm />
      </div>
    </div>
  );
}
