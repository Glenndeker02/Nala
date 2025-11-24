"use client";

import Image from 'next/image';
import { TrendingUp, Eye, DollarSign, BarChart3 } from 'lucide-react';
import { useState } from 'react';

export default function FounderStory() {
    const testimonials = [
        {
            quote: "We doubled our UGC-generated trial signups in two weeks after onboarding creators through this platform.",
            author: "SaaS Founder",
            company: "Productivity App"
        },
        {
            quote: "Finally, a way to manage every message, brief, and post without juggling WhatsApp and Invoices.",
            author: "Growth Lead",
            company: "B2B Startup"
        }
    ];

    const [activeTestimonial, setActiveTestimonial] = useState(0);

    return (
        <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-3">
                        Built by Founders, Proven by Results
                    </h2>
                    <p className="text-lg text-gray-600">
                        From a SaaS founder's struggle to a high-performance UGC platform — now track results in real time.
                    </p>
                </div>

                {/* Two-Column Layout */}
                <div className="grid lg:grid-cols-2 gap-10 items-start mb-12">
                    {/* Left: Founder Story */}
                    <div>
                        <div className="relative aspect-[3/4] max-w-md mx-auto lg:mx-0 rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                            <Image
                                src="/landing/lifestyle.png"
                                alt="Founder"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                <p className="text-sm font-semibold">The Founder's Journey</p>
                                <p className="text-xs opacity-90">From struggle to solution</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Story + Performance */}
                    <div className="space-y-5">
                        <div className="space-y-3">
                            <p className="text-gray-700 leading-relaxed text-sm">
                                When our founder — a SaaS entrepreneur just like you — tried to grow their product using UGC, they faced two big problems:
                            </p>

                            <div className="bg-red-50 p-3 rounded-lg space-y-2">
                                <div className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                                    <p className="text-gray-800 text-sm">It was hard to find reliable creators who understood SaaS.</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                                    <p className="text-gray-800 text-sm">The content they got lacked engagement, or didn't resonate with paid audiences.</p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-3">
                                <p className="font-semibold text-gray-900 mb-2 flex items-center gap-1.5 text-sm">
                                    <span>💡</span>
                                    <span>The Lightbulb Moment</span>
                                </p>
                                <p className="text-gray-700 text-xs leading-relaxed mb-2">
                                    The UGC content creators made on their own platforms consistently outperformed the ads they were producing for them.
                                </p>
                                <div className="grid grid-cols-3 gap-1.5">
                                    <div className="bg-white/80 rounded p-1.5 text-center">
                                        <p className="text-[10px] font-semibold text-primary-700">Better Reach</p>
                                    </div>
                                    <div className="bg-white/80 rounded p-1.5 text-center">
                                        <p className="text-[10px] font-semibold text-primary-700">More Resonance</p>
                                    </div>
                                    <div className="bg-white/80 rounded p-1.5 text-center">
                                        <p className="text-[10px] font-semibold text-primary-700">True Authenticity</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-50 p-3 rounded-lg">
                                <p className="font-semibold text-gray-900 mb-1 text-sm">The Solution</p>
                                <p className="text-gray-700 text-xs leading-relaxed">
                                    That's when they built this platform: a place where founders can tap directly into creators' audiences, collaborate in one space, and never lose sight of performance.
                                </p>
                            </div>
                        </div>

                        {/* Performance Dashboard Preview */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-primary-600" />
                                Real Results. Real-Time Insights
                            </h3>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 border border-blue-200">
                                    <Eye className="h-4 w-4 text-blue-600 mb-1" />
                                    <div className="text-lg font-bold text-blue-900">2.4M</div>
                                    <div className="text-[10px] text-blue-700">Total Views</div>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 border border-green-200">
                                    <TrendingUp className="h-4 w-4 text-green-600 mb-1" />
                                    <div className="text-lg font-bold text-green-900">8.2%</div>
                                    <div className="text-[10px] text-green-700">Engagement</div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2 border border-purple-200">
                                    <DollarSign className="h-4 w-4 text-purple-600 mb-1" />
                                    <div className="text-lg font-bold text-purple-900">340%</div>
                                    <div className="text-[10px] text-purple-700">ROI</div>
                                </div>
                            </div>
                            <ul className="space-y-1.5 text-xs text-gray-600">
                                <li className="flex items-center gap-1.5">
                                    <div className="h-1 w-1 rounded-full bg-primary-600"></div>
                                    Track views, engagement, and ROI — live, in your dashboard
                                </li>
                                <li className="flex items-center gap-1.5">
                                    <div className="h-1 w-1 rounded-full bg-primary-600"></div>
                                    See which creators and videos are driving the most impact
                                </li>
                                <li className="flex items-center gap-1.5">
                                    <div className="h-1 w-1 rounded-full bg-primary-600"></div>
                                    Know instantly what's working, and what needs tweaking
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Testimonials */}
                <div className="max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">Trusted by Founders Like You</h3>
                    <div className="grid md:grid-cols-2 gap-5">
                        {testimonials.map((testimonial, idx) => (
                            <div
                                key={idx}
                                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
                            >
                                <div className="text-primary-600 text-3xl mb-3">"</div>
                                <p className="text-gray-700 leading-relaxed mb-4 italic text-sm">
                                    {testimonial.quote}
                                </p>
                                <div className="border-t border-gray-200 pt-3">
                                    <p className="font-semibold text-gray-900 text-sm">{testimonial.author}</p>
                                    <p className="text-xs text-gray-500">{testimonial.company}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
