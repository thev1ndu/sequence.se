import { BentoSection } from "@/components/sections/bento-section";
import { CompanyShowcase } from "@/components/sections/company-showcase";
import { CTASection } from "@/components/sections/cta-section";
import { FAQSection } from "@/components/sections/faq-section";
import { FooterSection } from "@/components/sections/footer-section";
import { GrowthSection } from "@/components/sections/growth-section";
import { HeroSection } from "@/components/sections/hero-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { QuoteSection } from "@/components/sections/quote-section";
import { TestimonialSection } from "@/components/sections/testimonial-section";

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center divide-y divide-border min-h-screen w-full">
      <HeroSection />
      <CompanyShowcase />
      <BentoSection />
      <QuoteSection />
      <GrowthSection />
      <PricingSection />
      <TestimonialSection />
      <FAQSection />
      <CTASection />
      <FooterSection />
    </main>
  );
}
