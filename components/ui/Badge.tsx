import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
    const variants = {
        default: 'bg-primary-100 text-primary-800 border-transparent',
        secondary: 'bg-gray-100 text-gray-800 border-transparent',
        destructive: 'bg-red-100 text-red-800 border-transparent',
        outline: 'text-gray-800 border-gray-300',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}
