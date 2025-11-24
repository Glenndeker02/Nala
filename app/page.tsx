import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import PainPoints from '@/components/landing/PainPoints';
import RoiCalculator from '@/components/landing/RoiCalculator';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import FounderStory from '@/components/landing/FounderStory';
import SocialProof from '@/components/landing/SocialProof';

import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <RoiCalculator />
      <PainPoints />
      <Features />
      <HowItWorks />
      <FounderStory />
      <SocialProof />

      <Footer />
    </main>
  );
}
