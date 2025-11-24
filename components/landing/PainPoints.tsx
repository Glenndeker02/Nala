import Image from 'next/image';

export default function PainPoints() {
    return (
        <section className="bg-gray-50 py-16">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Side: Image */}
                    <div className="relative h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white order-last lg:order-first">
                        <Image
                            src="/landing/chaos.png"
                            alt="Stop Juggling UGC"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>

                    {/* Right Side: Content */}
                    <div className="space-y-8">
                        <div className="text-left">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                Stop Juggling UGC – <br />
                                <span className="text-primary-600">Simplify, Streamline, Succeed</span>
                            </h1>
                            <p className="text-lg text-gray-600">
                                Manage campaigns, creators, and content all in one platform – from idea to posting, without the chaos.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* Card 1: Library */}
                            <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 group">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6 4H6a2 2 0 01-2-2V6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg mb-2">Library of High-Performing Formats</h3>
                                        <ul className="space-y-1.5">
                                            <li className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0"></span>
                                                Daily-updated library of top-performing formats.
                                            </li>
                                            <li className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0"></span>
                                                Proven hooks and styles that drive conversions.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Workflow */}
                            <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 group">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-green-50 rounded-lg text-green-600 group-hover:bg-green-100 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m2 6H7a2 2 0 01-2-2V8a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg mb-2">Fully Managed Workflow</h3>
                                        <ul className="space-y-1.5">
                                            <li className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"></span>
                                                AI briefs, review portal, and automated scheduling.
                                            </li>
                                            <li className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"></span>
                                                Creators handle drafts and tasks directly on platform.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: Messaging */}
                            <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 group">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600 group-hover:bg-yellow-100 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V10a2 2 0 012-2h2M12 12v6m0 0l-3-3m3 3l3-3" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg mb-2">Centralized Messaging</h3>
                                        <ul className="space-y-1.5">
                                            <li className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0"></span>
                                                Stop chasing creators across DM, Email, and WhatsApp.
                                            </li>
                                            <li className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0"></span>
                                                Unified communication for faster results.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
