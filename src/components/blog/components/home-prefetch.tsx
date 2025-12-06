"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function HomePrefetch() {
  const router = useRouter();

  useEffect(() => {
    // Prefetch home page immediately when on blog pages
    router.prefetch("/");
  }, [router]);

  return null;
}

