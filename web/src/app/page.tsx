import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { getPopularCities } from "@/lib/queries";

export const revalidate = 86400; // revalidate daily

export default async function HomePage() {
  const popularCities = await getPopularCities(30);
  return (
    <div className="flex flex-col items-center">
      <section className="w-full max-w-2xl py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          Trouvez des pompes funèbres près de chez vous
        </h1>
        <p className="mt-4 text-lg text-stone-600">
          Comparez plus de 9 000 opérateurs funéraires en France. Avis clients,
          services proposés et demande de devis gratuit.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-sm text-stone-500">
          <span className="flex text-yellow-500">
            {"★★★★"}
            <span className="text-stone-300">★</span>
          </span>
          <span>4.2/5 — 200+ familles accompagnées</span>
        </div>
        <div className="mt-8">
          <SearchBar large />
        </div>
        <p className="mt-3 text-sm text-stone-400">
          Ex : Paris, 75015, Pompes Funèbres Collin...
        </p>
      </section>

      <section className="w-full py-12">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-stone-200 bg-white p-6 text-center">
            <p className="text-3xl font-bold text-stone-800">9 000+</p>
            <p className="mt-1 text-sm text-stone-600">Opérateurs référencés</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-6 text-center">
            <p className="text-3xl font-bold text-stone-800">&lt; 5 min</p>
            <p className="mt-1 text-sm text-stone-600">Pour comparer les offres</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-6 text-center">
            <p className="text-3xl font-bold text-stone-800">100%</p>
            <p className="mt-1 text-sm text-stone-600">Gratuit et indépendant</p>
          </div>
        </div>
      </section>

      <section className="w-full py-18">
        <h2 className="text-center text-3xl font-bold text-stone-900">
          Comment ça marche ?
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <div>
            <p className="text-lg font-semibold text-stone-800">1. Recherchez</p>
            <p className="mt-1 text-sm text-stone-600">
              Entrez votre ville ou code postal pour trouver les opérateurs funéraires à proximité.
            </p>
          </div>
          <div>
            <p className="text-lg font-semibold text-stone-800">2. Comparez</p>
            <p className="mt-1 text-sm text-stone-600">
              Consultez les avis, les services proposés et les prix moyens dans votre région.
            </p>
          </div>
          <div>
            <p className="text-lg font-semibold text-stone-800">3. Contactez</p>
            <p className="mt-1 text-sm text-stone-600">
              Demandez un devis gratuit directement auprès des pompes funèbres de votre choix.
            </p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/recherche"
            className="inline-block rounded-lg bg-blue-900 px-8 py-3 font-medium text-white hover:bg-blue-800 transition-colors"
          >
            Trouver des pompes funèbres →
          </Link>
        </div>
      </section>

      {popularCities.length > 0 && (
        <section className="w-full py-18">
          <h2 className="text-center text-3xl font-bold text-stone-900">
            Pompes funèbres dans votre ville
          </h2>
          <div className="mt-6 grid gap-x-8 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
            {popularCities.map((city) => (
              <Link
                key={city.ville_slug}
                href={`/pompes-funebres/${city.ville_slug}`}
                className="flex items-center justify-between border-b border-stone-100 py-2.5 text-sm text-stone-700 hover:text-blue-800 transition-colors group"
              >
                <span className="group-hover:translate-x-0.5 transition-transform">{city.ville}</span>
                <span className="text-xs text-stone-400 group-hover:text-blue-600">{city.count} opérateurs</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
