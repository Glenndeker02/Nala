import Image from 'next/image';
import { Star } from 'lucide-react';

export default function SocialProof() {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-primary-50 rounded-3xl p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12">

                    <div className="flex-1 w-full max-w-md lg:max-w-none relative">
                        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                            <Image
                                src="/landing/lifestyle.png"
                                alt="Happy Customer"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg flex items-center gap-4 animate-bounce">
                            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                                +300%
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">ROI Increase</div>
                                <div className="font-bold text-gray-900">Last Quarter</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
