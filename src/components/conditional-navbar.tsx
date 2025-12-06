"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/sections/navbar";

export function ConditionalNavbar() {
  const pathname = usePathname();
  const isBlogPage = pathname?.startsWith("/blog");

  if (isBlogPage) {
    return null;
  }

  return <Navbar />;
}



