import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 text-center lg:text-left">
                        <h1 className="text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.05]">
                            Marketing that <br />
                            <span className="text-primary-DEFAULT">pays you back.</span>
                        </h1>

                        <p className="text-xl text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                            The fair marketplace for UGC. Founders get authentic content that converts, creators get paid instantly.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link href="/auth/signup">
                                <Button className="h-14 px-10 text-lg font-semibold bg-primary-DEFAULT hover:bg-primary-600 text-white rounded-full w-full sm:w-auto transition-all shadow-sm hover:shadow-md">
                                    Get Started
                                </Button>
                            </Link>
                        </div>

                        <p className="text-sm text-gray-500 font-medium">
                            No credit card required • Cancel anytime
                        </p>
                    </div>

                    <div className="relative lg:h-[600px] w-full flex items-center justify-center">
                        <div className="relative w-full aspect-square max-w-[600px]">
                            {/* Soft background blob */}
                            <div className="absolute inset-0 bg-primary-100 rounded-full blur-3xl opacity-40"></div>
                            <Image
                                src="/landing/hero.png"
                                alt="Nala App Interface"
                                fill
                                className="object-contain drop-shadow-xl hover:scale-105 transition-transform duration-700"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
