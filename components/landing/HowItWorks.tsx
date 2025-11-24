"use client";

import { useState } from 'react';
import { UserPlus, FileText, Video, DollarSign, Camera, Search, Upload, CreditCard, ShieldCheck, BarChart, Zap, LayoutTemplate } from 'lucide-react';
import RoleSelector from './RoleSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function HowItWorks() {
    const [role, setRole] = useState<'creator' | 'founder'>('founder');

    const founderSteps = [
        {
            title: "1. Strategy & Brief",
            desc: "Use our daily-updated library of high-performing formats to find winning hooks. Build your campaign with our 6-step guided wizard.",
            icon: LayoutTemplate
        },
        {
            title: "2. Hire Vetted Creators",
            desc: "Filter KYC-verified creators by rating and niche. Tap into their existing audiences to expand your product's reach instantly.",
            icon: UserPlus
        },
        {
            title: "3. Manage & Approve",
            desc: "Review drafts in our built-in portal with frame-accurate feedback. Request unlimited revisions until the content is perfect.",
            icon: Video
        },
        {
            title: "4. Track Performance",
            desc: "Get 99.9% accurate view tracking via official APIs. Watch live view counts and automatic ROI calculations in real-time.",
            icon: BarChart
        },
        {
            title: "5. Pay for Results",
            desc: "Base fees are released on approval. Performance bonuses are automated. Any unspent performance budget is automatically refunded.",
            icon: DollarSign
        }
    ];

    const creatorSteps = [
        {
            title: "Build Profile",
            desc: "Showcase your portfolio, set your rates, and highlight your best video formats.",
            icon: Camera
        },
        {
            title: "Browse Jobs",
            desc: "Find campaigns that match your style or get invited directly by brands.",
            icon: Search
        },
        {
            title: "Submit Content",
            desc: "Upload your video drafts for review and collaborate on feedback.",
            icon: Upload
        },
        {
            title: "Get Paid",
            desc: "Receive guaranteed payment immediately upon approval. No chasing invoices.",
            icon: CreditCard
        }
    ];

    const steps = role === 'founder' ? founderSteps : creatorSteps;

    return (
        <section id="how-it-works" className="py-24 bg-surface-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold sm:text-4xl mb-6 text-gray-900">
                        {role === 'founder' ? 'Risk-Free UGC With Performance Guarantees' : 'How Nala Works for Creators'}
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                        {role === 'founder'
                            ? "Founders only pay for results. Base fees and performance budgets are held in secure Stripe escrow, and any unspent budget is automatically refunded."
                            : "Simple, transparent, and built for your success."}
                    </p>

                    <RoleSelector role={role} setRole={setRole} />
                </div>

                <div className="relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>

                    <div className={`grid md:grid-cols-${role === 'founder' ? '5' : '4'} gap-8`}>
                        <AnimatePresence mode='wait'>
                            {steps.map((step, idx) => (
                                <motion.div
                                    key={`${role}-${idx}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                                    className="relative flex flex-col items-center text-center group bg-white md:bg-transparent p-6 md:p-0 rounded-xl shadow-sm md:shadow-none"
                                >
                                    <div className="h-24 w-24 rounded-full bg-white border-4 border-surface-100 flex items-center justify-center mb-6 transition-all duration-300 group-hover:border-primary-500 group-hover:scale-110 shadow-sm z-10">
                                        <step.icon className="h-10 w-10 text-primary-600" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {step.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {role === 'founder' && (
                    <div className="mt-16 text-center">
                        <Link href="/auth/register?type=founder">
                            <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                                Start Your First Campaign Risk-Free
                            </Button>
                        </Link>
                        <p className="mt-4 text-sm text-gray-500">
                            <ShieldCheck className="inline-block w-4 h-4 mr-1 text-green-500" />
                            100% Money-Back Guarantee on Unspent Budget
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
