"use client";

import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
    {
        question: "How does the refund guarantee work?",
        answer: "We believe you should only pay for results. If your campaign doesn't hit the target views you paid for, we refund the difference based on the organic views achieved. It's completely risk-free."
    },
    {
        question: "Do I have to manage the creators?",
        answer: "Not at all. Tupstory handles the entire process—from finding vetted creators to briefing, negotiations, and payments. You simply review the final content and approve it for posting."
    },
    {
        question: "What kind of content will I get?",
        answer: "You'll receive high-performing UGC formats tailored to your niche. This includes testimonials, unboxings, lifestyle shots, and skits designed to drive engagement and conversions."
    },
    {
        question: "Is there a long-term contract?",
        answer: "No. You can start with a single campaign to test the waters. We're confident you'll see the ROI and want to scale, but you're never locked in."
    },
    {
        question: "How fast can I get my content?",
        answer: "Once your campaign is live, creators typically submit drafts within 3-5 days. After your approval, they post immediately. The entire process is streamlined for speed."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 bg-gray-50">
            <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">Frequently Asked Questions</h2>
                    <p className="text-lg text-gray-600">
                        Everything you need to know about scaling with Tupstory.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full flex items-center justify-between p-6 text-left"
                            >
                                <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                                <span className={`ml-6 flex-shrink-0 text-primary-600 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}>
                                    {openIndex === idx ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                </span>
                            </button>
                            <AnimatePresence>
                                {openIndex === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
