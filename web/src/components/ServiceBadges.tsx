import { getServiceLabel } from "@/lib/services";

interface ServiceBadgesProps {
  services: string[];
  max?: number;
}

export default function ServiceBadges({ services, max = 3 }: ServiceBadgesProps) {
  const shown = services.slice(0, max);
  const remaining = services.length - max;

  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((slug) => (
        <span
          key={slug}
          className="inline-block rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-700"
        >
          {getServiceLabel(slug)}
        </span>
      ))}
      {remaining > 0 && (
        <span className="inline-block rounded-full bg-stone-50 px-2.5 py-0.5 text-xs text-stone-500">
          +{remaining} autres
        </span>
      )}
    </div>
  );
}
