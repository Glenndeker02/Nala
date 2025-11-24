"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-white py-5'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold text-primary-DEFAULT tracking-tight">
                            Nala
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">How it Works</Link>
                        <Link href="/#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Features</Link>
                        <Link href="/#calculator" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Pricing</Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        <Link href="/auth/login">
                            <Button variant="ghost" className="text-gray-900 font-medium hover:bg-gray-50">Log in</Button>
                        </Link>
                        <Link href="/auth/register">
                            <Button className="bg-primary-DEFAULT hover:bg-primary-600 text-white font-semibold rounded-full px-6 shadow-sm hover:shadow-md transition-all">Get Started</Button>
                        </Link>
                    </div>

                    <div className="md:hidden">
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-900">
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg p-4 flex flex-col space-y-4">
                    <Link href="/#how-it-works" className="text-gray-900 font-medium" onClick={() => setMobileMenuOpen(false)}>How it Works</Link>
                    <Link href="/#features" className="text-gray-900 font-medium" onClick={() => setMobileMenuOpen(false)}>Features</Link>
                    <Link href="/#calculator" className="text-gray-900 font-medium" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                    <div className="flex flex-col space-y-2 pt-4 border-t">
                        <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start text-gray-900">Log in</Button>
                        </Link>
                        <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                            <Button className="w-full bg-primary-DEFAULT text-white font-semibold">Get Started</Button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
