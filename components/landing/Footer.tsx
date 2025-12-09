import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <img src="/logo.svg" alt="Tupstory Logo" className="h-10 w-auto" />
                        </Link>
                        <p className="mt-4 text-sm text-gray-500">
                            Organic Growth for Startups. Connect, collaborate, and grow with the best creators in the world.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
                        <ul className="mt-4 space-y-4">
                            <li><Link href="#features" className="text-base text-gray-500 hover:text-gray-900">Features</Link></li>
                            <li><Link href="#pricing" className="text-base text-gray-500 hover:text-gray-900">Pricing</Link></li>
                            <li><Link href="#" className="text-base text-gray-500 hover:text-gray-900">Case Studies</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
                        <ul className="mt-4 space-y-4">
                            <li><Link href="#" className="text-base text-gray-500 hover:text-gray-900">About</Link></li>
                            <li><Link href="#" className="text-base text-gray-500 hover:text-gray-900">Blog</Link></li>
                            <li><Link href="#" className="text-base text-gray-500 hover:text-gray-900">Careers</Link></li>
                            <li><Link href="/faq" className="text-base text-gray-500 hover:text-gray-900">FAQ</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                        <ul className="mt-4 space-y-4">
                            <li><Link href="#" className="text-base text-gray-500 hover:text-gray-900">Privacy</Link></li>
                            <li><Link href="#" className="text-base text-gray-500 hover:text-gray-900">Terms</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
                    <p className="text-base text-gray-400">&copy; 2024 Tupstory. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
