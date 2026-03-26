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
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ville, code postal ou nom..."
          className={`flex-1 rounded-lg border border-stone-300 bg-white px-4 text-stone-900 placeholder:text-stone-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 ${
            large ? "py-4 text-lg" : "py-2.5 text-sm"
          }`}
        />
        <button
          type="submit"
          className={`rounded-lg bg-blue-800 font-medium text-white hover:bg-blue-700 transition-colors shrink-0 ${
            large ? "px-8 py-4 text-lg" : "px-5 py-2.5 text-sm"
          }`}
        >
          Rechercher
        </button>
      </div>
    </form>
  );
}
