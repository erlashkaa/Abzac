import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Star, StarHalf } from 'lucide-react';
export const Rating = ({ rating, size = 16, className }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (_jsxs("div", { className: `flex items-center gap-0.5 text-amber-500 ${className}`, children: [[...Array(fullStars)].map((_, i) => (_jsx(Star, { size: size, fill: "currentColor" }, i))), hasHalfStar && _jsx(StarHalf, { size: size, fill: "currentColor" }), [...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (_jsx(Star, { size: size, className: "text-secondary opacity-30" }, i + 5)))] }));
};
