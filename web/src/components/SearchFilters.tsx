"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { SERVICE_CATEGORIES } from "@/lib/services";

const RATING_OPTIONS = [
  { value: "", label: "Toutes" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
  { value: "4.5", label: "4.5+" },
];

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentRating = searchParams.get("rating") || "";
  const currentCodePostal = searchParams.get("cp") || "";
  const [cpInput, setCpInput] = useState(currentCodePostal);
  const currentServices = searchParams.getAll("service");
  const hasActiveFilters = !!(currentRating || currentCodePostal || currentServices.length > 0);
  const [open, setOpen] = useState(hasActiveFilters);

  useEffect(() => {
    setCpInput(currentCodePostal);
  }, [currentCodePostal]);

  const updateFilters = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      // Reset to page 1 when filters change
      params.delete("page");

      for (const [key, value] of Object.entries(updates)) {
        params.delete(key);
        if (value === null || value === "") continue;
        if (Array.isArray(value)) {
          for (const v of value) params.append(key, v);
        } else {
          params.set(key, value);
        }
      }

      router.push(`/recherche?${params.toString()}`);
    },
    [router, searchParams]
  );

  const toggleService = (slug: string) => {
    const next = currentServices.includes(slug)
      ? currentServices.filter((s) => s !== slug)
      : [...currentServices, slug];
    updateFilters({ service: next });
  };

  return (
    <div className="rounded-lg border border-stone-200 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4"
      >
        <h3 className="text-sm font-semibold text-stone-700">
          Filtres{hasActiveFilters ? " (actifs)" : ""}
        </h3>
        <span className="text-stone-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && <div className="space-y-4 px-4 pb-4">

      {/* Rating */}
      <div>
        <label className="text-xs font-medium text-stone-500">Note minimum</label>
        <div className="mt-1 flex gap-1">
          {RATING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilters({ rating: opt.value })}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                currentRating === opt.value
                  ? "bg-stone-800 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Postal code */}
      <div>
        <label className="block text-xs font-medium text-stone-500">Code postal</label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          value={cpInput}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            setCpInput(v);
            if (v.length === 5 || v.length === 0) {
              updateFilters({ cp: v });
            }
          }}
          onBlur={() => updateFilters({ cp: cpInput })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateFilters({ cp: cpInput });
            }
          }}
          placeholder="ex: 75015"
          className="mt-1 w-32 rounded border border-stone-300 px-3 py-1.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
        />
      </div>

      {/* Services */}
      <div>
        <label className="text-xs font-medium text-stone-500">Services</label>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => toggleService(cat.slug)}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                currentServices.includes(cat.slug)
                  ? "bg-stone-800 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={() => updateFilters({ rating: null, cp: null, service: [] })}
          className="text-xs text-stone-400 hover:text-stone-600 underline"
        >
          Réinitialiser les filtres
        </button>
      )}

      </div>}
    </div>
  );
}
