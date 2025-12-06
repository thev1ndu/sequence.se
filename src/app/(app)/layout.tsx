import dynamic from "next/dynamic";

import { SiteFooter } from "@/components/site-footer";

const ScrollTop = dynamic(() =>
  import("@/components/scroll-top").then((mod) => mod.ScrollTop)
);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="max-w-screen overflow-x-hidden px-2" suppressHydrationWarning>{children}</main>
      <SiteFooter />
      <ScrollTop />
    </>
  );
}
