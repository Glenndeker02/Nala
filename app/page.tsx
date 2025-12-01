import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import PainPoints from '@/components/landing/PainPoints';
import ROICalculator from '@/components/calculator/ROICalculator';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import FounderStory from '@/components/landing/FounderStory';
import SocialProof from '@/components/landing/SocialProof';
import Testimonials from '@/components/landing/Testimonials';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ROICalculator mode="demo" />
        </div>
      </section>
      <PainPoints />
      <Features />
      <HowItWorks />
      <FounderStory />
      <SocialProof />
      <Testimonials />
      <Footer />
    </main>
  );
}
