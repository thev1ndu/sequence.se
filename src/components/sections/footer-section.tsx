"use client";

import { Icons } from "@/components/icons";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { useMediaQuery } from "@/hooks/use-media-query";
import { siteConfig } from "@/lib/config";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function FooterSection() {
  const tablet = useMediaQuery("(max-width: 1024px)");
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchWaitlistCount = async () => {
      try {
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbyzG-gebmuiUeknVhtT10Ytnnc4cBdIXxsFVYiWjvIlSqeBKgZxLeTQFnaTjJImebNe_w/exec"
        );
        const data = await response.json();
        if (data.status === "ok" && typeof data.count === "number") {
          setWaitlistCount(data.count);
        }
      } catch (error) {
        console.error("Failed to fetch waitlist count", error);
      }
    };

    fetchWaitlistCount();
  }, []);

  const getHexColor = (count: number) => {
    const scaled = count * 67109;
    const hex = Math.min(scaled, 0xffffff).toString(16).padStart(6, "0");
    return `#${hex}`;
  };

  const isLightColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  const currentCount = waitlistCount ?? 0;
  const bgColor = getHexColor(currentCount);
  const textColor = isLightColor(bgColor) ? "#000000" : "#FFFFFF";

  return (
    <footer id="footer" className="w-full pb-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-10">
        <div className="flex flex-col items-start justify-start gap-y-5 max-w-xs mx-0">
          <Link href="/" className="flex items-center gap-2">
            {/* <Icons.logo className="size-8" /> */}
            <Image
              src="/purple.svg"
              alt="Sequence3 mark"
              width={28}
              height={28}
              className="size-6 md:size-7"
              priority
            />
            <p className="text-xl font-semibold text-primary">Sequence3</p>
          </Link>
          <p className="tracking-tight text-muted-foreground font-medium">
            {siteConfig.hero.description}
          </p>
          <div className="flex items-center gap-2 dark:hidden">
            <Icons.soc2 className="size-12" />
            <Icons.hipaa className="size-12" />
            <Icons.gdpr className="size-12" />
          </div>
          <div className="dark:flex items-center gap-2 hidden">
            <Icons.soc2Dark className="size-12" />
            <Icons.hipaaDark className="size-12" />
            <Icons.gdprDark className="size-12" />
          </div>
        </div>
        <div className="pt-5 md:w-1/2">
          <div className="flex flex-col items-start justify-start md:flex-row md:items-center md:justify-between gap-y-5 lg:pl-10">
            {siteConfig.footerLinks.map((column, columnIndex) => (
              <ul key={columnIndex} className="flex flex-col gap-y-2">
                <li className="mb-2 text-sm font-semibold text-primary">
                  {column.title}
                </li>
                {column.links.map((link) => (
                  <li
                    key={link.id}
                    className="group inline-flex cursor-pointer items-center justify-start gap-1 text-[15px]/snug text-muted-foreground"
                  >
                    <Link href={link.url}>{link.title}</Link>
                    <div className="flex size-4 items-center justify-center border border-border rounded translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100">
                      <ChevronRightIcon className="h-4 w-4 " />
                    </div>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-6 right-6 z-1 text-center">
          <div className="text-xs text-muted-foreground mb-[2vh] bg-background p-1 flex items-center justify-center gap-2">
            <span>© {new Date().getFullYear()} Sequence3 // CS-22</span>
            <div className="flex items-center justify-center bg-background">
            <div
              className="w-fit px-3 py-[1/2rem] border border-white/[0.07] transition-colors duration-700"
              style={{ backgroundColor: bgColor }}
            >
              <span
                className="font-mono text-sm transition-colors duration-700"
                style={{ color: textColor }}
              >
                {bgColor.toUpperCase()}
              </span>
            </div>
          </div>
          </div>
      </div>
      <div className="w-full h-48 md:h-64 relative mt-24 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-background z-10 from-40%" />
        <div className="absolute inset-0 mx-6">
          <FlickeringGrid
            text={tablet ? "Sequence3" : "Sequence3 for SMEs"}
            fontSize={tablet ? 70 : 90}
            className="h-full w-full"
            squareSize={2}
            gridGap={tablet ? 2 : 3}
            color="#6B7280"
            maxOpacity={0.3}
            flickerChance={0.1}
          />
        </div>
      </div>
    </footer>
  );
}
