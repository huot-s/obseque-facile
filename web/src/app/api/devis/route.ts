import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface DevisBody {
  operator_id: number;
  nom: string;
  email: string;
  telephone?: string;
  ville?: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  let body: DevisBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate required fields
  if (!body.operator_id || !body.nom || !body.email) {
    return NextResponse.json(
      { error: "Les champs nom et email sont obligatoires." },
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
  const { error } = await supabase.from("devis_requests").insert({
    operator_id: body.operator_id,
    nom: body.nom,
    email: body.email,
    telephone: body.telephone || null,
    ville: body.ville || null,
    message: body.message || null,
  });

  if (error) {
    console.error("Devis insert error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement de la demande." },
      { status: 500 }
    );
  }

  // TODO: send email notification via SMTP

  return NextResponse.json({ success: true }, { status: 201 });
}
