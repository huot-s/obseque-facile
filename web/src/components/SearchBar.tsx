"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface SearchBarProps {
  defaultValue?: string;
  large?: boolean;
}

export default function SearchBar({ defaultValue = "", large = false }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 ${large ? "h-5 w-5" : "h-4 w-4"}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ville, code postal ou nom..."
            className={`w-full rounded-lg border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 ${
              large ? "py-4 pl-11 pr-4 text-lg" : "py-2.5 pl-9 pr-4 text-sm"
            }`}
          />
        </div>
        <button
          type="submit"
          className={`rounded-lg bg-blue-900 font-medium text-white hover:bg-blue-800 transition-colors shrink-0 ${
            large ? "px-8 py-4 text-lg" : "px-5 py-2.5 text-sm"
          }`}
        >
          Rechercher
        </button>
      </div>
    </form>
  );
}
