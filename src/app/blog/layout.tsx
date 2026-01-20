import type { ReactNode } from "react";

import { FooterSection } from "@/components/sections/footer-section";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      {/* Divider line */}
      <div className="w-full h-px bg-border" />
      <FooterSection />
    </>
  );
}
