import React from 'react';
import { Star, StarHalf } from 'lucide-react';

export const Rating: React.FC<{ rating: number; size?: number; className?: string }> = ({ rating, size = 16, className }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className={`flex items-center gap-0.5 text-amber-500 ${className}`}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={i} size={size} fill="currentColor" />
      ))}
      {hasHalfStar && <StarHalf size={size} fill="currentColor" />}
      {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
        <Star key={i + 5} size={size} className="text-secondary opacity-30" />
      ))}
    </div>
  );
};
