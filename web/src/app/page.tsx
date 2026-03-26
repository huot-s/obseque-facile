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
            <p className="text-3xl font-bold text-stone-800">8</p>
            <p className="mt-1 text-sm text-stone-600">Catégories de services</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-6 text-center">
            <p className="text-3xl font-bold text-stone-800">100%</p>
            <p className="mt-1 text-sm text-stone-600">Gratuit et indépendant</p>
          </div>
        </div>
      </section>

      <section className="w-full py-8">
        <h2 className="text-2xl font-bold text-stone-900">
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
      </section>

      {popularCities.length > 0 && (
        <section className="w-full py-8">
          <h2 className="text-2xl font-bold text-stone-900">
            Pompes funèbres par ville
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {popularCities.map((city) => (
              <Link
                key={city.ville_slug}
                href={`/pompes-funebres/${city.ville_slug}`}
                className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 transition-colors"
              >
                {city.ville} ({city.count})
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
