import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOperatorBySlug } from "@/lib/queries";
import { getPricingForPostalCode } from "@/lib/pricing";
import { getServiceLabel } from "@/lib/services";
import RatingStars from "@/components/RatingStars";
import PricingCard from "@/components/PricingCard";
import DevisForm from "@/components/DevisForm";

import Map from "@/components/MapWrapper";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const operator = await getOperatorBySlug(slug);
  if (!operator) return { title: "Opérateur non trouvé" };

  const name = operator.google_name ?? operator.raison_sociale;
  return {
    title: `${name} — Pompes funèbres ${operator.ville}`,
    description: `${name} à ${operator.ville} (${operator.code_postal}). Avis clients, services funéraires et demande de devis gratuit.`,
  };
}

export const revalidate = 3600; // ISR: revalidate every hour

export default async function OperatorDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const operator = await getOperatorBySlug(slug);
  if (!operator) notFound();

  const displayName = operator.google_name ?? operator.raison_sociale;
  const displayAddress =
    operator.google_address ??
    `${operator.adresse}, ${operator.code_postal} ${operator.ville}`;
  const phone = operator.google_phone ?? operator.telephone;
  const pricing = getPricingForPostalCode(operator.code_postal);

  const mapOperators =
    operator.lat && operator.lng
      ? [
          {
            id: operator.id,
            slug: operator.slug,
            name: displayName,
            lat: operator.lat,
            lng: operator.lng,
            rating: operator.rating,
          },
        ]
      : [];

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: displayName,
    address: {
      "@type": "PostalAddress",
      streetAddress: operator.adresse,
      addressLocality: operator.ville,
      postalCode: operator.code_postal,
      addressCountry: "FR",
    },
    ...(phone && { telephone: phone }),
    ...(operator.website && { url: operator.website }),
    ...(operator.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: operator.rating,
        reviewCount: operator.user_ratings_total,
      },
    }),
    ...(operator.lat &&
      operator.lng && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: operator.lat,
          longitude: operator.lng,
        },
      }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">{displayName}</h1>
          <p className="mt-2 text-stone-600">{displayAddress}</p>

          <div className="mt-3">
            <RatingStars
              rating={operator.rating}
              count={operator.user_ratings_total}
            />
          </div>

          {/* Contact */}
          <div className="mt-6 flex flex-wrap gap-3">
            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="inline-flex items-center rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                Appeler : {phone}
              </a>
            )}
            {operator.website && (
              <a
                href={operator.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                Site web
              </a>
            )}
            {operator.google_maps_url && (
              <a
                href={operator.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                Voir sur Google Maps
              </a>
            )}
          </div>

          {/* Services */}
          {operator.services.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-stone-900">
                Services proposés
              </h2>
              <ul className="mt-3 space-y-2">
                {operator.services.map((slug) => (
                  <li
                    key={slug}
                    className="flex items-center gap-2 text-sm text-stone-700"
                  >
                    <span className="text-green-600">&#10003;</span>
                    {getServiceLabel(slug)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Map */}
          {mapOperators.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-stone-900">
                Localisation
              </h2>
              <div className="mt-3">
                <Map operators={mapOperators} className="h-[300px]" />
              </div>
            </div>
          )}

          {/* Devis form */}
          <div className="mt-8 rounded-lg border border-stone-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-stone-900">
              Demander un devis gratuit
            </h2>
            <DevisForm operatorId={operator.id} operatorName={displayName} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <PricingCard
            region={pricing.region}
            average={pricing.average}
            inhumation={pricing.inhumation}
            cremation={pricing.cremation}
          />

          {operator.courriel && (
            <div className="rounded-lg border border-stone-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-stone-700">Contact</h3>
              <p className="mt-2 text-sm text-stone-600">{operator.courriel}</p>
              {operator.mobile && (
                <p className="mt-1 text-sm text-stone-600">
                  Mobile : {operator.mobile}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
