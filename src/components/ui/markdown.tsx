/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils";
import { marked } from "marked";
import { memo, useId, useMemo } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { CodeBlock, CodeBlockCode } from "./code-block";

export type MarkdownProps = {
  children: string;
  id?: string;
  className?: string;
  components?: Partial<Components>;
};

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token: any) => token.raw);
}

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

    return (
      <CodeBlock className={className}>
        <CodeBlockCode code={children as string} language={language} />
      </CodeBlock>
    );
  },
  pre: function PreComponent({ children }: any) {
    return <>{children}</>;
  },
  img: function ImageComponent({ src, alt, ...props }: any) {
    return (
      <div className="my-8">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto rounded-xl border border-border"
          loading="lazy"
          {...props}
        />
        {alt && (
          <p className="text-sm text-muted-foreground mt-2 text-center italic">
            {alt}
          </p>
        )}
      </div>
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

const MemoizedMarkdownBlock = memo(
  function MarkdownBlock({
    content,
    components = INITIAL_COMPONENTS,
  }: {
    content: string;
    components?: Partial<Components>;
  }) {
  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]} 
      rehypePlugins={[rehypeRaw]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
  },
  function propsAreEqual(prevProps: any, nextProps: any) {
    return prevProps.content === nextProps.content;
  }
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

function MarkdownComponent({
  children,
  id,
  className,
  components = INITIAL_COMPONENTS,
}: MarkdownProps) {
  const generatedId = useId();
  const blockId = id ?? generatedId;
  const blocks = useMemo(() => parseMarkdownIntoBlocks(children), [children]);

  return (
    <div className={className}>
      {blocks.map((block, index) => (
        <MemoizedMarkdownBlock
          key={`${blockId}-block-${index}`}
          content={block}
          components={components}
        />
      ))}
    </div>
  );
}

const Markdown = memo(MarkdownComponent);
Markdown.displayName = "Markdown";

export { Markdown };
