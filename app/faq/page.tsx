import Navbar from '@/components/landing/Navbar';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';

export default function FAQPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-20"> {/* Add padding for fixed navbar */}
                <FAQ />
            </div>
            <Footer />
        </main>
    );
}
