import Link from "next/link";
import { type Operator, DEFAULT_OPERATOR_NAME } from "@/lib/queries";
import RatingStars from "./RatingStars";
import ServiceBadges from "./ServiceBadges";

interface OperatorCardProps {
  operator: Operator;
}

export default function OperatorCard({ operator }: OperatorCardProps) {
  const displayName = operator.google_name || operator.raison_sociale || DEFAULT_OPERATOR_NAME;
  const displayAddress = operator.google_address ?? `${operator.adresse}, ${operator.code_postal} ${operator.ville}`;

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link
            href={`/pompes/${operator.slug}`}
            className="text-lg font-semibold text-stone-900 hover:text-stone-600 transition-colors"
          >
            {displayName}
          </Link>
          <p className="mt-1 text-sm text-stone-500">{displayAddress}</p>
          <div className="mt-2">
            <RatingStars
              rating={operator.rating}
              count={operator.user_ratings_total}
            />
          </div>
          {operator.services.length > 0 && (
            <div className="mt-3">
              <ServiceBadges services={operator.services} />
            </div>
          )}
        </div>
        <div className="shrink-0">
          <Link
            href={`/pompes/${operator.slug}`}
            className="rounded-md bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 transition-colors"
          >
            Voir la fiche
          </Link>
        </div>
      </div>
    </div>
  );
}
