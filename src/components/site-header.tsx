import dynamic from "next/dynamic";
import Link from "next/link";

import { DesktopNav } from "@/components/desktop-nav";
import { MAIN_NAV } from "@/config/site";
import { cn } from "@/lib/utils";

import { SiteHeaderMark } from "./site-header-mark";
import { SiteHeaderWrapper } from "./site-header-wrapper";
import { ToggleTheme } from "./toggle-theme";

const MobileNav = dynamic(() =>
  import("@/components/mobile-nav").then((mod) => mod.MobileNav)
);

export function SiteHeader() {
  return (
    <SiteHeaderWrapper
      className={cn(
        "sticky top-0 z-50 max-w-screen overflow-x-hidden bg-background px-2 pt-2",
        "data-[affix=true]:shadow-[0_0_16px_0_black]/8 dark:data-[affix=true]:shadow-[0_0_16px_0_black]",
        "not-dark:data-[affix=true]:**:data-header-container:after:bg-border",
        "transition-shadow duration-300"
      )}
    >
      <div
        className="screen-line-before screen-line-after mx-auto flex h-12 items-center justify-between gap-2 border-x border-edge px-2 after:z-1 after:transition-[background-color] sm:gap-4 md:max-w-3xl"
        data-header-container
        suppressHydrationWarning={true}
      >
        <Link href="/" aria-label="Home" className="[&_svg]:h-8">
          <SiteHeaderMark />
        </Link>

        <div className="flex-1" />

        <DesktopNav items={MAIN_NAV} />

        <div className="flex items-center *:first:mr-2">
          <ToggleTheme />
          <MobileNav className="sm:hidden" items={MAIN_NAV} />
        </div>
      </div>
    </SiteHeaderWrapper>
  );
}
