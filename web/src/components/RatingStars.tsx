interface RatingStarsProps {
  rating: number | null;
  count: number | null;
}

export default function RatingStars({ rating, count }: RatingStarsProps) {
  if (!rating) {
    return (
      <span className="text-sm text-gray-400 italic">Pas encore d&apos;avis</span>
    );
  }

  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex text-amber-400">
        {"★".repeat(fullStars)}
        {hasHalf && "½"}
        {"☆".repeat(emptyStars)}
      </div>
      <span className="text-sm text-gray-600">
        {rating.toFixed(1)}
        {count ? ` (${count} avis)` : ""}
      </span>
    </div>
  );
}
