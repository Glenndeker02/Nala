import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';
import Link from 'next/link';

export default function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">Simple, Transparent Pricing</h2>
                    <p className="text-lg text-gray-600">
                        Start for free and scale as you grow. No hidden fees.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Tier */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-semibold text-gray-900">Starter</h3>
                        <div className="mt-4 flex items-baseline text-gray-900">
                            <span className="text-5xl font-bold tracking-tight">$0</span>
                            <span className="ml-1 text-xl font-semibold text-gray-500">/mo</span>
                        </div>
                        <p className="mt-6 text-gray-500">Perfect for trying out the platform.</p>

                        <ul className="mt-6 space-y-4">
                            {['Access to Creator Marketplace', 'Basic AI Brief Generation', 'Standard Support', '5% Platform Fee'].map((feature) => (
                                <li key={feature} className="flex">
                                    <Check className="h-6 w-6 flex-none text-primary-600" />
                                    <span className="ml-3 text-gray-600">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link href="/auth/signup">
                            <Button variant="outline" className="mt-8 w-full h-12 text-lg border-primary-200 text-primary-700 hover:bg-primary-50">Get Started Free</Button>
                        </Link>
                    </div>

                    {/* Pro Tier */}
                    <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
                        <h3 className="text-xl font-semibold text-white">Pro Scale</h3>
                        <div className="mt-4 flex items-baseline text-white">
                            <span className="text-5xl font-bold tracking-tight">$49</span>
                            <span className="ml-1 text-xl font-semibold text-gray-400">/mo</span>
                        </div>
                        <p className="mt-6 text-gray-400">For brands serious about growth.</p>

                        <ul className="mt-6 space-y-4">
                            {['Everything in Starter', 'Advanced AI Insights', 'Priority Support', 'Reduced 2.5% Platform Fee', 'Dedicated Account Manager'].map((feature) => (
                                <li key={feature} className="flex">
                                    <Check className="h-6 w-6 flex-none text-primary-400" />
                                    <span className="ml-3 text-gray-300">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link href="/auth/signup">
                            <Button className="mt-8 w-full h-12 text-lg bg-primary-600 hover:bg-primary-500 text-white border-none shadow-lg shadow-primary-900/20">Start Pro Trial</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
