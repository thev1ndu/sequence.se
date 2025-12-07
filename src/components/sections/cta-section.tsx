import Image from "next/image"
import { siteConfig } from "@/lib/config"
import { WaitlistExpandable } from "@/components/sections/waitlist-expandable"

export function CTASection() {
  const { ctaSection } = siteConfig

  return (
    <section
      id="cta"
      className="flex flex-col items-center justify-center w-full"
    >
      <div className="w-full px-6">
        <div className="h-[400px] md:h-[400px] overflow-hidden shadow-xl w-full border border-border rounded-xl bg-secondary relative z-20">
          <Image
            src={ctaSection.backgroundImage}
            alt="Sequence3 AI Agent - Join the waitlist to transform your customer conversations with AI-powered automation"
            className="absolute inset-0 w-full h-full object-cover object-right md:object-center"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 100vw"
          />
          <div className="absolute inset-0 -top-32 md:-top-40 flex flex-col items-center justify-center">
            <h2 className="text-white text-4xl md:text-7xl font-medium tracking-tighter max-w-xs md:max-w-xl text-center">
              {ctaSection.title}
            </h2>
            <div className="absolute bottom-10 flex flex-col items-center justify-center gap-2">
              <WaitlistExpandable label={ctaSection.button.text} />
              <span className="text-white text-sm">{ctaSection.subtext}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
