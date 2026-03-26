import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Annuaire des pompes funèbres en France`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Trouvez et comparez les pompes funèbres près de chez vous. Avis clients, services proposés et demande de devis gratuit.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} flex min-h-screen flex-col bg-stone-50 text-stone-900 antialiased`}>
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-bold text-stone-800">
              {SITE_NAME}
            </Link>
            <nav className="flex items-center gap-6 text-sm text-stone-600">
              <Link href="/recherche" className="hover:text-stone-900">
                Rechercher
              </Link>
              <Link href="/prix-obseques" className="hover:text-stone-900">
                Prix des obsèques
              </Link>
              <Link href="/blog" className="hover:text-stone-900">
                Guides
              </Link>
              <Link href="/partenaires" className="hover:text-stone-900">
                Partenariat
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl flex-1 px-4 py-8">{children}</main>

        <footer className="border-t border-stone-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-stone-500">
                &copy; {new Date().getFullYear()} {SITE_NAME}
              </p>
              <div className="flex gap-4 text-sm text-stone-500">
                <Link href="/partenaires" className="hover:text-stone-700">
                  Devenir partenaire
                </Link>
                <Link href="/mentions-legales" className="hover:text-stone-700">
                  Mentions légales
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
