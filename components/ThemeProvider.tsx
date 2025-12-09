"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Default to light to match server-side rendering and avoid mismatches
    const [theme, setTheme] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // 1. Check local storage
        const savedTheme = localStorage.getItem("theme") as Theme;

        // 2. Check system preference if no local storage
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        if (savedTheme) {
            setTheme(savedTheme);
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
            }
        } else if (systemPrefersDark) {
            // Optional: Auto-detect system preference on first visit?
            // Requirement says "The app currently has one default theme", implying light.
            // But user said "Persist user preference".
            // Let's stick to explicit default 'light' unless saved, to be safe.
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;

        if (theme === "dark") {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [theme, mounted]);

    // Cleanup on unmount to ensure landing page (which doesn't use this provider) stays clean
    useEffect(() => {
        return () => {
            document.documentElement.classList.remove("dark");
        };
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
