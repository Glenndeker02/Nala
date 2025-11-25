import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

export function Input({ className = '', error, ...props }: InputProps) {
    return (
        <input
            className={`
        flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-DEFAULT focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
        ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}
        ${className}
      `}
            {...props}
        />
    );
}
