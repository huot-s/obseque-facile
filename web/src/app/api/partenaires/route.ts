import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface PartenaireBody {
  raison_sociale: string;
  nom_contact: string;
  email: string;
  telephone?: string;
  ville?: string;
  code_postal?: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  let body: PartenaireBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate required fields
  if (!body.raison_sociale || !body.nom_contact || !body.email) {
    return NextResponse.json(
      { error: "Les champs raison sociale, nom du contact et email sont obligatoires." },
      { status: 400 }
    );
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json(
      { error: "Adresse email invalide." },
      { status: 400 }
    );
  }

  // Insert into Supabase
  const { error } = await supabase.from("partner_requests").insert({
    raison_sociale: body.raison_sociale,
    nom_contact: body.nom_contact,
    email: body.email,
    telephone: body.telephone || null,
    ville: body.ville || null,
    code_postal: body.code_postal || null,
    message: body.message || null,
  });

  if (error) {
    console.error("Partner request insert error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement de la demande." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
