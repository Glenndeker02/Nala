"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Hero() {
    // Animation variants for the staggered word reveal
    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const child = {
        hidden: {
            opacity: 0,
            y: 20,
            filter: "blur(10px)",
            rotateX: 45
        },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            rotateX: 0,
            transition: {
                type: "spring" as const,
                damping: 12,
                stiffness: 100
            }
        }
    };

    const phrase1 = "Stop Wasting Money on Ads.".split(" ");

    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

                    {/* Text Content - Expanded Width (7 cols) */}
                    <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
                        <div className="space-y-4">
                            {/* Phrase 1: Animated */}
                            <motion.div
                                className="text-3xl lg:text-5xl font-bold tracking-tight text-green-600 leading-[1.1]"
                                variants={container}
                                initial="hidden"
                                animate="visible"
                            >
                                {phrase1.map((word, index) => (
                                    <motion.span
                                        key={index}
                                        variants={child}
                                        className="inline-block mr-[0.25em]"
                                    >
                                        {word}
                                    </motion.span>
                                ))}
                            </motion.div>

                            {/* Phrase 2: Static but styled */}
                            <motion.h1
                                className="text-4xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.8 }}
                            >
                                Scale Your Brand with <span className="text-gray-900">Authentic UGC.</span>
                            </motion.h1>
                        </div>

                        <motion.p
                            className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                        >
                            The fair marketplace for UGC. Founders get authentic content that converts, creators get paid instantly.
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.4, duration: 0.8 }}
                        >
                            <Link href="/auth/signup">
                                <Button className="h-14 px-10 text-lg font-semibold bg-primary-DEFAULT hover:bg-primary-600 text-white rounded-full w-full sm:w-auto transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95">
                                    Get Started
                                </Button>
                            </Link>
                        </motion.div>

                        <motion.p
                            className="text-sm text-gray-500 font-medium"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.6 }}
                        >
                            No credit card required • Cancel anytime
                        </motion.p>
                    </div>

                    {/* Image Content - Reduced Width (5 cols) */}
                    <motion.div
                        className="lg:col-span-5 relative w-full flex items-center justify-center lg:justify-end"
                        initial={{ opacity: 0, scale: 0.9, x: 50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    >
                        <div className="relative w-full aspect-[4/5] max-w-[500px]">
                            {/* Soft background blob */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary-100 to-purple-100 rounded-[2rem] blur-3xl opacity-60 transform rotate-6"></div>

                            <Image
                                src="/landing/hero-ugc.png"
                                alt="UGC Creators and Analytics"
                                fill
                                className="object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-700"
                                priority
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
