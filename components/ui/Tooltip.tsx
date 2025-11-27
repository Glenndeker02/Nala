"use client";

import * as React from "react";

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};

const TooltipContext = React.createContext<{
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

const Tooltip = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = React.useState(false);

    return (
        <TooltipContext.Provider value={{ open, setOpen }}>
            <div className="relative inline-block group">
                {children}
            </div>
        </TooltipContext.Provider>
    );
};

const TooltipTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
    const context = React.useContext(TooltipContext);

    // If asChild is true, we just render the child. 
    // In a full implementation we'd clone element to add props, but for simple use cases:
    return (
        <div
            className="inline-block"
            onMouseEnter={() => context?.setOpen(true)}
            onMouseLeave={() => context?.setOpen(false)}
        >
            {children}
        </div>
    );
};

const TooltipContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    // In this simple implementation, we use group-hover from the parent Tooltip div 
    // or the context state if we wanted more complex logic.
    // Using absolute positioning for simplicity.
    return (
        <div className={`absolute z-50 px-3 py-1.5 text-xs text-white bg-black rounded shadow-md -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap ${className}`}>
            {children}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black" />
        </div>
    );
};

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
