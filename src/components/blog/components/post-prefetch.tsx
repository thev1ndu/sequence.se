"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import type { Post } from "@/components/blog/types/post";

export function PostPrefetch({
  basePath,
  previous,
  next,
}: {
  basePath: string;
  previous: Post | null;
  next: Post | null;
}) {
  const router = useRouter();

  useEffect(() => {
    // Prefetch adjacent posts immediately on mount
    if (previous) {
      router.prefetch(`${basePath}/${previous.slug}`);
    }
    if (next) {
      router.prefetch(`${basePath}/${next.slug}`);
    }
  }, [basePath, previous, next, router]);

  return null;
}

