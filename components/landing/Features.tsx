import Image from 'next/image';
import { Sparkles, Layers, MessageCircle, CheckCircle, Calendar, DollarSign, Zap } from 'lucide-react';

export default function Features() {
    const features = [
        {
            title: "Library of High-Performing Formats",
            description: "Stop guessing what content works. Access a daily-updated library of winning UGC formats, hooks, and styles proven to convert in your niche.",
            icon: Sparkles,
            image: "/landing/ai-brief.png",
            benefits: ["Always know what type of video to make", "Learn what hooks actually drive results", "Updated daily with top-performing trends"],
            align: "right"
        },
        {
            title: "Fully Managed Workflow",
            description: "Run campaigns from idea → brief → drafts → approval → posting without chaos. A simple guided system takes you through every step.",
            icon: Layers,
            image: "/landing/dashboard.png",
            benefits: ["6-step guided campaign builder", "Built-in review portal with markup", "Automated reminders, scheduling & posting"],
            align: "left"
        },
        {
            title: "Centralized Messaging",
            description: "Stop chasing creators across Instagram DMs, WhatsApp, and emails. Everything happens inside one clean, organized inbox.",
            icon: MessageCircle,
            image: "/landing/lifestyle.png",
            benefits: ["All chats in one place", "Automated notifications", "Clear communication for faster delivery"],
            align: "right"
        },
        {
            title: "Review & Feedback Portal",
            description: "Give feedback as easily as pointing at the screen. Comment on drafts, request changes, and approve final videos instantly.",
            icon: CheckCircle,
            image: "/landing/ai-brief.png",
            benefits: ["Frame-accurate annotations", "Faster approval cycles", "One-click approvals"],
            align: "left"
        },
        {
            title: "Automated Scheduling & Posting",
            description: "No more forgotten deadlines or missing content. The platform handles schedules, reminders, deadline checks, and final posting URLs automatically.",
            icon: Calendar,
            image: "/landing/dashboard.png",
            benefits: ["Deadline tracking", "Automatic posting reminders", "Submission of final posting links"],
            align: "right"
        },
        {
            title: "Creator Earnings Dashboard",
            description: "Creators see exactly how much they earn per video and per campaign, with automatic payouts and transparent performance bonuses.",
            icon: DollarSign,
            image: "/landing/payments.png",
            benefits: ["Track earnings in real time", "Automatic payouts", "Transparent performance-based bonuses"],
            align: "left"
        }
    ];

    return (
        <section id="features" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-primary-600 font-semibold tracking-wide uppercase text-sm mb-3">Features</h2>
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Everything you need to scale UGC</h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Built for performance. Designed for scale.
                    </p>
                </div>

                <div className="space-y-24">
                    {features.map((feature, idx) => (
                        <div key={idx} className={`flex flex-col lg:flex-row gap-12 items-center ${feature.align === 'left' ? 'lg:flex-row-reverse' : ''}`}>
                            <div className="flex-1 space-y-6">
                                <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900">{feature.title}</h3>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                                <ul className="space-y-3">
                                    {feature.benefits.map((benefit, bIdx) => (
                                        <li key={bIdx} className="flex items-center gap-3 text-gray-700">
                                            <div className="h-6 w-6 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                                                <Zap className="h-3 w-3 text-primary-600" />
                                            </div>
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex-1 w-full">
                                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-gray-50 group">
                                    <Image
                                        src={feature.image}
                                        alt={feature.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
