import pricingData from "@/data/prix_obseques_region.json";

interface PricingInfo {
  region: string | null;
  average: number;
  inhumation: number;
  cremation: number;
}

const deptToRegion = pricingData.departement_to_region as Record<string, string>;
const regionPrices = pricingData.regions as Record<string, { average: number }>;

export function getPricingForPostalCode(codePostal: string): PricingInfo {
  const dept = codePostal.slice(0, 2);
  const region = deptToRegion[dept] ?? null;
  const regionPrice = region ? regionPrices[region] : null;

  return {
    region,
    average: regionPrice?.average ?? pricingData.national.average,
    inhumation: pricingData.national.inhumation,
    cremation: pricingData.national.cremation,
  };
}

export function getNationalPricing() {
  return {
    national: pricingData.national,
    regions: Object.entries(regionPrices).map(([name, data]) => ({
      name,
      average: data.average,
    })).sort((a, b) => b.average - a.average),
    source: pricingData.source,
    year: pricingData.year,
  };
}
