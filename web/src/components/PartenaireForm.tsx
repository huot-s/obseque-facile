"use client";

import { useState } from "react";

export default function PartenaireForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Honeypot check
    if (formData.get("website")) return;

    const body = {
      raison_sociale: formData.get("raison_sociale"),
      nom_contact: formData.get("nom_contact"),
      email: formData.get("email"),
      telephone: formData.get("telephone"),
      ville: formData.get("ville"),
      code_postal: formData.get("code_postal"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/partenaires", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Une erreur est survenue");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-lg font-semibold text-green-800">Demande envoyée</p>
        <p className="mt-2 text-sm text-green-700">
          Votre demande de partenariat a bien été enregistrée. Nous reviendrons vers vous très prochainement.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot */}
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="raison_sociale" className="block text-sm font-medium text-stone-700">
            Raison sociale *
          </label>
          <input
            type="text"
            id="raison_sociale"
            name="raison_sociale"
            required
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
        </div>
        <div>
          <label htmlFor="nom_contact" className="block text-sm font-medium text-stone-700">
            Nom du contact *
          </label>
          <input
            type="text"
            id="nom_contact"
            name="nom_contact"
            required
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
        </div>
        <div>
          <label htmlFor="telephone" className="block text-sm font-medium text-stone-700">
            Téléphone
          </label>
          <input
            type="tel"
            id="telephone"
            name="telephone"
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
        </div>
        <div>
          <label htmlFor="ville" className="block text-sm font-medium text-stone-700">
            Ville
          </label>
          <input
            type="text"
            id="ville"
            name="ville"
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
        </div>
        <div>
          <label htmlFor="code_postal" className="block text-sm font-medium text-stone-700">
            Code postal
          </label>
          <input
            type="text"
            id="code_postal"
            name="code_postal"
            inputMode="numeric"
            pattern="[0-9]{5}"
            maxLength={5}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
        </div>
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-stone-700">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          placeholder="Décrivez votre activité et ce que vous recherchez dans un partenariat..."
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-md bg-stone-800 px-6 py-3 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50 transition-colors"
      >
        {status === "loading" ? "Envoi en cours..." : "Envoyer ma demande de partenariat"}
      </button>
    </form>
  );
}
