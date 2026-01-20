"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { Navbar } from "@/components/sections/navbar";
import { SQ3AssistantWidget } from "@/components/sq3-assistant/Widget";

export function MainSiteWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  // Dashboard routes get clean layout
  if (isDashboard) {
    return <>{children}</>;
  }

  // Main site gets full layout with navbar and decorations
  return (
    <>
      <div className="max-w-7xl mx-auto border-x relative">
        <div className="block w-px h-full border-l border-border absolute top-0 left-6 z-10"></div>
        <div className="block w-px h-full border-r border-border absolute top-0 right-6 z-10"></div>
        <Navbar />
        {children}
      </div>
      <SQ3AssistantWidget />
    </>
  );
}
