"use client";

import type { TOCItemType } from "fumadocs-core/toc";
import { ChevronDown, TextIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function InlineTOC({
  items,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  items: TOCItemType[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!items.length) {
    return null;
  }

  return (
    <div
      className={cn("not-prose rounded-lg bg-code font-sans", className)}
      {...props}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group/toc inline-flex w-full items-center gap-2 py-2.5 pr-2 pl-4 text-sm font-medium"
      >
        <TextIcon className="-translate-x-0.5 size-4" />
        {children ?? "On this page"}
        <div className="ml-auto shrink-0 text-muted-foreground" aria-hidden>
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className="overflow-hidden">
          <ul className="flex flex-col px-4 pb-2 text-sm text-muted-foreground">
            {items.map((item) => (
              <li
                key={item.url}
                className="flex py-1"
                style={{
                  paddingInlineStart: 16 * Math.max(item.depth - 2, 0),
                }}
              >
                <a
                  className="underline-offset-4 transition-colors hover:text-accent-foreground hover:underline"
                  href={item.url}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

