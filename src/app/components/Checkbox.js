import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
export const Checkbox = ({ checked, defaultChecked, onChange, className }) => {
    const [isChecked, setIsChecked] = React.useState(defaultChecked || false);
    const handleToggle = () => {
        const newValue = !isChecked;
        setIsChecked(newValue);
        onChange?.(newValue);
    };
    const finalChecked = checked !== undefined ? checked : isChecked;
    return (_jsx("button", { type: "button", onClick: handleToggle, style: {
            backgroundColor: finalChecked ? 'var(--accent-color)' : 'var(--bg-primary)',
            borderColor: finalChecked ? 'var(--accent-color)' : 'var(--border-color)',
        }, className: clsx("w-5 h-5 rounded flex items-center justify-center transition-all border-2", !finalChecked && "hover:border-opacity-50", className), onMouseEnter: (e) => {
            if (!finalChecked) {
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'; // accent with 50% opacity
            }
        }, onMouseLeave: (e) => {
            if (!finalChecked) {
                e.currentTarget.style.borderColor = 'var(--border-color)';
            }
        }, children: finalChecked && (_jsx(Check, { className: "w-3.5 h-3.5 text-white", strokeWidth: 3 })) }));
};
