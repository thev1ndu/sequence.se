"use client";

import * as React from "react";
import dayjs from "dayjs";
import { ArrowLeftIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";


import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Post } from "@/features/blog/types/post";

interface BlogPostClientProps {
  post: Post;
  children: React.ReactNode;
}

export function BlogPostClient({ post, children }: BlogPostClientProps) {
  const [showButton, setShowButton] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <article className="min-h-screen relative px-5 md:px-10">
      {/* Container with margins */}
      <div className="mx-5 md:mx-10 relative">
        {/* Header section */}
        <header className="px-6 md:px-10 py-10 md:py-14">
          <div className="max-w-3xl mx-auto text-center">
            {/* Meta info */}
            <div className="mb-4 text-sm text-muted-foreground font-medium">
              <time dateTime={dayjs(post.metadata.createdAt).toISOString()}>
                {dayjs(post.metadata.createdAt).format("MMMM D, YYYY")}
              </time>
            </div>
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-medium tracking-tighter text-balance text-primary">
              {post.metadata.title}
            </h1>
            
            {/* Description */}
            <p className="mt-4 text-lg text-muted-foreground font-medium text-balance">
              {post.metadata.description}
            </p>
          </div>
        </header>

        {/* Extended Divider Line - Top */}
        <div className="h-px bg-border -mx-10 md:-mx-20" />

        {/* Patterns and Content Wrapper - starts below header with side borders */}
        <div className="relative border-x">
          {/* Diagonal line patterns on the sides */}
          <div className="absolute top-0 -left-4 md:-left-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>
          <div className="absolute top-0 -right-4 md:-right-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>

          {/* Hero image */}
          {post.metadata.image && (
            <div className="border-b">
              <div className="px-6 md:px-10 py-8 md:py-10">
                <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-xl overflow-hidden">
                  <Image
                    src={post.metadata.image}
                    alt={post.metadata.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/10 ring-inset dark:ring-white/10" />
                </div>
              </div>
            </div>
          )}

          {/* Article content */}
          <div className="px-6 md:px-10 py-10 md:py-14 max-w-3xl mx-auto">
            <div>
              {children}
            </div>
          </div>

          {/* Extended Divider Line - Bottom */}
          <div className="h-px bg-border -mx-10 md:-mx-20" />
        </div>
      </div>

      {/* Floating Back to Blog button */}
      <div 
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300",
          showButton 
            ? "translate-y-0 opacity-100" 
            : "translate-y-10 opacity-0 pointer-events-none"
        )}
      >
        <Button 
          variant="outline" 
          size="sm" 
          asChild 
          className="gap-2 shadow-lg border-border bg-background/95 backdrop-blur-sm hover:bg-accent rounded-full"
        >
          <Link href="/blog">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </div>
    </article>
  );
}

