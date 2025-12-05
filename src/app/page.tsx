import { HeroSection } from "@/components/sections/hero-section";
import { CompanyShowcase } from "@/components/sections/company-showcase";
import { StructuredData } from "@/components/seo/structured-data";
import { siteConfig } from "@/lib/site";
import dynamic from "next/dynamic";
import type { Metadata } from "next";

export const metadata: Metadata = {
  description: siteConfig.description,
  openGraph: {
    description: siteConfig.description,
  },
  twitter: {
    description: siteConfig.description,
  },
};

// Lazy load below-fold sections for better initial load performance
const BentoSection = dynamic(() => import("@/components/sections/bento-section").then(mod => ({ default: mod.BentoSection })), {
  loading: () => <div className="w-full h-screen" />
});

const GrowthSection = dynamic(() => import("@/components/sections/growth-section").then(mod => ({ default: mod.GrowthSection })), {
  loading: () => <div className="w-full h-screen" />
});

const PricingSection = dynamic(() => import("@/components/sections/pricing-section").then(mod => ({ default: mod.PricingSection })), {
  loading: () => <div className="w-full h-96" />
});

const FAQSection = dynamic(() => import("@/components/sections/faq-section").then(mod => ({ default: mod.FAQSection })), {
  loading: () => <div className="w-full h-96" />
});

const CTASection = dynamic(() => import("@/components/sections/cta-section").then(mod => ({ default: mod.CTASection })), {
  loading: () => <div className="w-full h-64" />
});

const FooterSection = dynamic(() => import("@/components/sections/footer-section").then(mod => ({ default: mod.FooterSection })), {
  loading: () => <div className="w-full h-64" />
});

export default function LandingPage() {
  return (
    <>
      <StructuredData type="homepage" />
      <main className="flex flex-col items-center justify-center divide-y divide-border min-h-screen w-full">
        <HeroSection />
        <CompanyShowcase />
        <BentoSection />
        <GrowthSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
        <FooterSection />
      </main>
    </>
  );
}
