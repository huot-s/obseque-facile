"use client";

import { useState } from "react";

interface DevisFormProps {
  operatorId: number;
  operatorName: string;
}

export default function DevisForm({ operatorId, operatorName }: DevisFormProps) {
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
      operator_id: operatorId,
      nom: formData.get("nom"),
      email: formData.get("email"),
      telephone: formData.get("telephone"),
      ville: formData.get("ville"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/devis", {
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
          Votre demande de devis a bien été enregistrée. Vous serez recontacté prochainement.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-stone-600">
        Demander un devis gratuit auprès de <strong>{operatorName}</strong>
      </p>

      {/* Honeypot */}
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-stone-700">
            Nom complet *
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            required
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
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
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
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
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
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
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
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
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          placeholder="Décrivez votre besoin (type de cérémonie, date souhaitée, etc.)"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-md bg-blue-900 px-6 py-3 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50 transition-colors"
      >
        {status === "loading" ? "Envoi en cours..." : "Envoyer ma demande de devis"}
      </button>
    </form>
  );
}
