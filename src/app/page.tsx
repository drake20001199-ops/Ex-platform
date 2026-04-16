import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { SocialProof } from "@/components/landing/SocialProof";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { getPrices } from "@/lib/crypto-price";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const [prices, user] = await Promise.all([
    getPrices(),
    getCurrentUser(),
  ]);

  // Extract only what client components need (role for routing decisions)
  const userForClient = user ? { role: user.role } : null;

  return (
    <main className="relative">
      <Navbar
        user={user ? { firstName: user.firstName, role: user.role } : null}
      />
      <HeroSection
        btcPrice={prices.btc.aud}
        ethPrice={prices.eth.aud}
        btcChange={prices.btc.change24h}
        ethChange={prices.eth.change24h}
        user={userForClient}
      />
      <SocialProof />
      <HowItWorks />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
