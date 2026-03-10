interface PricingCardProps {
  region: string | null;
  average: number;
  inhumation: number;
  cremation: number;
}

export default function PricingCard({
  region,
  average,
  inhumation,
  cremation,
}: PricingCardProps) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-5">
      <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">
        Prix moyen des obsèques
      </h3>
      {region && (
        <p className="mt-1 text-xs text-stone-500">en {region}</p>
      )}
      <p className="mt-3 text-3xl font-bold text-stone-900">
        {average.toLocaleString("fr-FR")} &euro;
      </p>
      <div className="mt-3 space-y-1 text-sm text-stone-600">
        <div className="flex justify-between">
          <span>Inhumation</span>
          <span className="font-medium">
            {inhumation.toLocaleString("fr-FR")} &euro;
          </span>
        </div>
        <div className="flex justify-between">
          <span>Crémation</span>
          <span className="font-medium">
            {cremation.toLocaleString("fr-FR")} &euro;
          </span>
        </div>
      </div>
      <p className="mt-3 text-xs text-stone-400">
        Source : Silver Alliance / Simplifia 2024
      </p>
    </div>
  );
}
