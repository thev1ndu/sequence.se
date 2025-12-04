import { HeroVideoSection } from "@/components/sections/hero-video-section";
import { WaitlistExpandable } from "@/components/sections/waitlist-expandable";
import { siteConfig } from "@/lib/config";
import Link from "next/link";

export function HeroSection() {
  const { hero } = siteConfig;
  
  const verifiedDomains = ["sq3.io", "sq3.us", "sq3.one", "sequence3.se"];

  return (
    <section id="hero" className="w-full relative">
      <div className="relative flex flex-col items-center w-full px-6">
        <div className="absolute inset-0">
          <div className="absolute inset-0 -z-10 h-[600px] md:h-[800px] w-full [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,var(--secondary)_100%)] rounded-b-xl"></div>
          
          {/* Verified Domains Background */}
          <div className="absolute inset-0 -z-10 h-[600px] md:h-[800px] w-full overflow-hidden pointer-events-none">
            <div 
              className="absolute top-20 left-[10%] text-xs md:text-sm font-mono text-muted-foreground/20 animate-pulse"
              style={{ animationDelay: '0s' }}
            >
              {verifiedDomains[0]}
            </div>
            <div 
              className="absolute top-32 right-[15%] text-xs md:text-sm font-mono text-muted-foreground/15 animate-pulse"
              style={{ animationDelay: '0.5s' }}
            >
              {verifiedDomains[1]}
            </div>
            <div 
              className="absolute top-48 left-[20%] text-xs md:text-sm font-mono text-muted-foreground/20 animate-pulse"
              style={{ animationDelay: '1s' }}
            >
              {verifiedDomains[2]}
            </div>
            <div 
              className="absolute top-40 right-[8%] text-xs md:text-sm font-mono text-muted-foreground/15 animate-pulse"
              style={{ animationDelay: '1.5s' }}
            >
              {verifiedDomains[3]}
            </div>
            <div 
              className="absolute top-56 left-[12%] text-xs md:text-sm font-mono text-muted-foreground/10 animate-pulse"
              style={{ animationDelay: '0.75s' }}
            >
              {verifiedDomains[0]}
            </div>
            <div 
              className="absolute top-64 right-[25%] text-xs md:text-sm font-mono text-muted-foreground/15 animate-pulse"
              style={{ animationDelay: '1.25s' }}
            >
              {verifiedDomains[1]}
            </div>
            <div 
              className="absolute top-72 left-[18%] text-xs md:text-sm font-mono text-muted-foreground/12 animate-pulse"
              style={{ animationDelay: '2s' }}
            >
              {verifiedDomains[2]}
            </div>
            <div 
              className="absolute top-28 right-[22%] text-xs md:text-sm font-mono text-muted-foreground/18 animate-pulse"
              style={{ animationDelay: '0.3s' }}
            >
              {verifiedDomains[3]}
            </div>
            <div 
              className="absolute top-44 left-[8%] text-xs md:text-sm font-mono text-muted-foreground/14 animate-pulse"
              style={{ animationDelay: '1.8s' }}
            >
              {verifiedDomains[0]}
            </div>
            <div 
              className="absolute top-60 right-[18%] text-xs md:text-sm font-mono text-muted-foreground/16 animate-pulse"
              style={{ animationDelay: '0.9s' }}
            >
              {verifiedDomains[1]}
            </div>
            <div 
              className="absolute top-36 left-[25%] text-xs md:text-sm font-mono text-muted-foreground/13 animate-pulse"
              style={{ animationDelay: '1.6s' }}
            >
              {verifiedDomains[2]}
            </div>
          </div>
        </div>
        <div className="relative z-10 pt-32 max-w-3xl mx-auto h-full w-full flex flex-col gap-10 items-center justify-center">
          <p className="border border-border bg-accent rounded-full text-sm h-8 px-3 flex items-center gap-2">
            {hero.badgeIcon}
            {hero.badge}
          </p>
          <div className="flex flex-col items-center justify-center gap-5">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium tracking-tighter text-balance text-center text-primary">
              {hero.title}
            </h1>
            <p className="text-base md:text-lg text-center text-muted-foreground font-medium text-balance leading-relaxed tracking-tight">
              {hero.description}
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            <WaitlistExpandable
              label={hero.cta.primary.text}
              triggerClassName="bg-secondary h-9 flex items-center justify-center text-sm font-normal tracking-wide rounded-full text-primary-foreground dark:text-secondary-foreground w-32 px-4 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_3px_3px_-1.5px_rgba(16,24,40,0.06),0_1px_1px_rgba(16,24,40,0.08)] border border-white/[0.12] hover:bg-secondary/80 transition-all ease-out active:scale-95"
            />
            <Link
              href={hero.cta.secondary.href}
              className="h-10 flex items-center justify-center w-32 px-5 text-sm font-normal tracking-wide text-primary rounded-full transition-all ease-out active:scale-95 bg-white dark:bg-background border border-[#E5E7EB] dark:border-[#27272A] hover:bg-white/80 dark:hover:bg-background/80"
            >
              {hero.cta.secondary.text}
            </Link>
          </div>
        </div>
      </div>
      <HeroVideoSection />
    </section>
  );
}
