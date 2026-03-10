export const SERVICE_CATEGORIES = [
  {
    slug: "transport-corps",
    label: "Transport des corps",
    match: "transport des corps",
  },
  {
    slug: "organisation-obseques",
    label: "Organisation des obsèques",
    match: "organisation des obsèques",
  },
  {
    slug: "soins-conservation",
    label: "Soins de conservation",
    match: "soins de conservation",
  },
  {
    slug: "housses-cercueils-urnes",
    label: "Housses, cercueils et urnes",
    match: "fourniture des housses",
  },
  {
    slug: "chambres-funeraires",
    label: "Chambres funéraires",
    match: "chambres funéraires",
  },
  {
    slug: "corbillards",
    label: "Corbillards et voitures de deuil",
    match: "corbillards",
  },
  {
    slug: "fourniture-personnel",
    label: "Fourniture de personnel et objets funéraires",
    match: "fourniture de personnel",
  },
  {
    slug: "crematorium",
    label: "Crématorium",
    match: "crématorium",
  },
] as const;

export type ServiceSlug = (typeof SERVICE_CATEGORIES)[number]["slug"];

export function parseServices(prestations: string): ServiceSlug[] {
  const lower = prestations.toLowerCase();
  return SERVICE_CATEGORIES.filter((cat) => lower.includes(cat.match)).map(
    (cat) => cat.slug
  );
}

export function getServiceLabel(slug: string): string {
  return (
    SERVICE_CATEGORIES.find((cat) => cat.slug === slug)?.label ?? slug
  );
}
