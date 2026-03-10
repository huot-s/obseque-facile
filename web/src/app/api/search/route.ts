import { NextRequest, NextResponse } from "next/server";
import { searchOperators } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q") || undefined;
  const departement = searchParams.get("departement") || undefined;
  const services = searchParams.get("services")?.split(",").filter(Boolean) || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);

  const results = await searchOperators({ query, departement, services, page });

  return NextResponse.json(results);
}
