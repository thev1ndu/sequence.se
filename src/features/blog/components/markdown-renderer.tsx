"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { codeToHtml } from "shiki";

interface MarkdownRendererProps {
  content: string;
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [html, setHtml] = React.useState<string>("");

  React.useEffect(() => {
    codeToHtml(code, {
      lang: language,
      theme: "github-dark",
    }).then(setHtml);
  }, [code, language]);

  if (!html) {
    return (
      <pre className="rounded-md border border-border bg-zinc-950 p-4 my-6 overflow-x-auto">
        <code className="text-sm font-mono text-zinc-300">{code}</code>
      </pre>
    );
  }

  return (
    <div
      className="rounded-md border border-border !bg-zinc-950 !p-4 !my-6 not-prose overflow-x-auto [&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!m-0 [&_code]:text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// Helper function to extract YouTube video ID from various URL formats
function getYouTubeVideoId(text: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// YouTube embed component
function YouTubeEmbed({ videoId, title }: { videoId: string; title?: string }) {
  return (
    <div className="not-prose w-full my-8">
      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-border bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title || "YouTube video player"}
          className="absolute top-0 left-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:tracking-tighter prose-headings:font-medium prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children, node }) => {
            // Check if paragraph contains only a YouTube URL (standalone link pasted)
            const textContent = node?.children
              ?.map((child: any) => {
                if (child.type === 'text') return child.value;
                if (child.type === 'element' && child.tagName === 'a') {
                  return child.properties?.href || '';
                }
                return '';
              })
              .join('')
              .trim();
            
            if (textContent) {
              const videoId = getYouTubeVideoId(textContent);
              if (videoId && textContent.match(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/)) {
                return <YouTubeEmbed videoId={videoId} />;
              }
            }

            // Check for YouTube link in anchor tag
            if (node?.children?.length === 1) {
              const child = node.children[0] as any;
              if (child?.tagName === "a" && child?.properties?.href) {
                const videoId = getYouTubeVideoId(child.properties.href);
                if (videoId) {
                  return <YouTubeEmbed videoId={videoId} />;
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
            const code = String(children).replace(/\n$/, "");
            
            return !inline && match ? (
              <CodeBlock code={code} language={match[1]} />
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
            if (href) {
              const videoId = getYouTubeVideoId(href);
              if (videoId) {
                return <YouTubeEmbed videoId={videoId} title={String(children)} />;
              }
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

