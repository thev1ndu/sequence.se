"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils";
import React, { memo, useMemo } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { CodeBlock, CodeBlockCode } from "./code-block";

export type MarkdownProps = {
  children: string;
  className?: string;
  components?: Partial<Components>;
};

function extractLanguage(className?: string): string {
  if (!className) return "plaintext";
  const match = className.match(/language-(\w+)/);
  return match ? match[1] : "plaintext";
}

const INITIAL_COMPONENTS: Partial<Components> = {
  code: function CodeComponent({ className, children, ...props }: any) {
    const isInline =
      !props.node?.position?.start.line ||
      props.node?.position?.start.line === props.node?.position?.end.line;

    if (isInline) {
      return (
        <span
          className={cn(
            "bg-muted rounded-sm px-1.5 py-0.5 font-mono text-sm text-foreground",
            className
          )}
          {...props}
        >
          {children}
        </span>
      );
    }

    const language = extractLanguage(className);
    const codeString = Array.isArray(children) 
      ? children.join('') 
      : String(children || '');

    return (
      <CodeBlock className={className}>
        <CodeBlockCode code={codeString} language={language} />
      </CodeBlock>
    );
  },
  pre: function PreComponent({ children }: any) {
    return <>{children}</>;
  },
  p: function ParagraphComponent({ children, node, ...props }: any) {
    // Check if this paragraph contains only an image by examining the AST node
    // react-markdown wraps images in <p> tags, but we want to unwrap them
    if (node?.children) {
      const hasOnlyImage = node.children.length === 1 && 
        (node.children[0]?.type === 'image' || node.children[0]?.tagName === 'img');
      
      // If paragraph contains only an image, unwrap it to avoid nested <p> tags
      // The ImageComponent will handle the <figure> wrapper
      if (hasOnlyImage) {
        return <>{children}</>;
      }
    }
    
    return <p {...props}>{children}</p>;
  },
  img: function ImageComponent({ src, alt, ...props }: any) {
    if (!src) return null;
    
    return (
      <figure className="my-8">
        <img
          src={src}
          alt={alt || ""}
          className="w-full h-auto rounded-xl border border-border"
          loading="lazy"
          {...props}
        />
        {alt && (
          <figcaption className="text-sm text-muted-foreground mt-2 text-center italic">
            {alt}
          </figcaption>
        )}
      </figure>
    );
  },
  a: function LinkComponent({ href, children, ...props }: any) {
    return (
      <a
        href={href}
        className="text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
        {...props}
      >
        {children}
      </a>
    );
  },
  blockquote: function BlockquoteComponent({ children, ...props }: any) {
    return (
      <blockquote
        className="border-l-4 border-primary pl-6 my-6 italic text-muted-foreground"
        {...props}
      >
        {children}
      </blockquote>
    );
  },
  hr: function HRComponent({ ...props }: any) {
    return (
      <hr
        className="my-12 border-t border-border"
        {...props}
      />
    );
  },
  div: function DivComponent({ className, style, children, ...props }: any) {
    // Handle YouTube embeds and other divs
    if (className?.includes("youtube-embed") || (style && typeof style === 'object' && style.paddingBottom)) {
      return (
        <div className={cn("my-8", className)} style={style} {...props}>
          {children}
        </div>
      );
    }
    return <div className={className} style={style} {...props}>{children}</div>;
  },
  iframe: function IframeComponent({ src, title, ...props }: any) {
    return (
      <div className="my-8 relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={src}
          title={title}
          className="absolute top-0 left-0 w-full h-full rounded-xl border border-border"
          allowFullScreen
          {...props}
        />
      </div>
    );
  },
};

function MarkdownComponent({
  children,
  className,
  components = INITIAL_COMPONENTS,
}: MarkdownProps) {
  const mergedComponents = useMemo(() => ({ ...INITIAL_COMPONENTS, ...components }), [components]);

  if (!children || typeof children !== 'string') {
    return null;
  }

  return (
    <div className={className}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeRaw]}
        components={mergedComponents}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

const Markdown = memo(MarkdownComponent);
Markdown.displayName = "Markdown";

export { Markdown };

