"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:tracking-tighter prose-headings:font-medium prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children, node }) => {
            if (node?.children?.length === 1) {
              const child = node.children[0] as any;
              if (child?.tagName === "a" && child?.properties?.href) {
                const href = child.properties.href;
                const isYoutube = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/.test(
                  href
                );
                if (isYoutube) {
                  return <div className="my-6">{children}</div>;
                }
              }
            }
            return (
              <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>
            );
          },
          pre: ({ children }) => <>{children}</>,
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                {...props}
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                className="rounded-md border border-border !bg-zinc-950 !p-4 !my-6 not-prose"
                showLineNumbers={true}
                wrapLines={true}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code
                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          a: ({ href, children }) => {
            const youtubeMatch = href?.match(
              /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
            );
            if (youtubeMatch) {
              const videoId = youtubeMatch[1];
              return (
                <div className="not-prose w-full my-8">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-border bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title={String(children) || "YouTube video player"}
                      className="absolute top-0 left-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              );
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
              >
                {children}
              </a>
            );
          },
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt || ""}
              className="rounded-xl border border-border shadow-sm w-full my-8"
              loading="lazy"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
