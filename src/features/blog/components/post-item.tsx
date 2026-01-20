import dayjs from "dayjs";
import { PinIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import type { Post } from "@/features/blog/types/post";
import { cn } from "@/lib/utils";

export function PostItem({
  post,
  shouldPreloadImage,
}: {
  post: Post;
  shouldPreloadImage?: boolean;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group/post flex flex-col h-full gap-4 p-3 rounded-xl",
        "transition-all duration-300 ease-out",
        "hover:bg-white/5 hover:ring-1 hover:ring-white/10",
        "focus-visible:bg-white/5 focus-visible:ring-1 focus-visible:ring-white/10 focus-visible:outline-none"
      )}
    >
      {post.metadata.image && (
        <div className="relative select-none overflow-hidden rounded-xl">
          <Image
            src={post.metadata.image}
            alt={post.metadata.title}
            width={1200}
            height={630}
            quality={85}
            priority={shouldPreloadImage}
            className="aspect-[1200/630] object-cover rounded-xl transition-transform duration-300 group-hover/post:scale-[1.02]"
          />

          <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/10 ring-inset dark:ring-white/10" />

          {post.metadata.pinned && (
            <span className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-md bg-secondary shadow-md">
              <PinIcon className="size-4 rotate-45 text-white" />
              <span className="sr-only">Pinned</span>
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 px-1">
        <h3 className="text-base md:text-lg leading-snug font-medium text-balance group-hover/post:text-primary transition-colors">
          {post.metadata.title}
          {post.metadata.new && (
            <span className="ml-2 inline-block size-2 -translate-y-px rounded-full bg-secondary animate-pulse">
              <span className="sr-only">New</span>
            </span>
          )}
        </h3>

        <dl>
          <dt className="sr-only">Published on</dt>
          <dd className="text-sm text-muted-foreground font-medium">
            <time dateTime={dayjs(post.metadata.createdAt).toISOString()}>
              {dayjs(post.metadata.createdAt).format("DD.MM.YYYY")}
            </time>
          </dd>
        </dl>
      </div>
    </Link>
  );
}
