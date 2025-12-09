"use client";

import React from 'react';
import { X } from 'lucide-react';

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
                {children}
            </div>
        </div>
    );
}

export function DialogContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`p-0 ${className}`}>{children}</div>;
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
    return <div className="p-6 pb-4 border-b">{children}</div>;
}

export function DialogTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>;
}

export function DialogDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <p className={`text-sm text-gray-500 mt-1 ${className}`}>{children}</p>;
}

export function DialogFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`p-6 pt-4 border-t flex justify-end gap-2 ${className}`}>{children}</div>;
}

// DialogTrigger is a no-op in this custom implementation since Dialog is controlled
// The actual dialog open/close is handled by parent state
export function DialogTrigger({ children, asChild, onClick }: { children: React.ReactNode; asChild?: boolean; onClick?: () => void }) {
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: (e: React.MouseEvent) => {
                onClick?.();
                (children as React.ReactElement<any>).props.onClick?.(e);
            }
        });
    }
    return <span onClick={onClick}>{children}</span>;
}

