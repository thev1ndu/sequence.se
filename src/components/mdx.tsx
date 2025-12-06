import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeExternalLinks from "rehype-external-links";
import type { LineElement } from "rehype-pretty-code";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";

import Image from "next/image";
import { Code, Heading } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

const components: MDXRemoteProps["components"] = {
  h1: (props: React.ComponentProps<"h1">) => <Heading as="h1" {...props} />,
  h2: (props: React.ComponentProps<"h2">) => <Heading as="h2" {...props} />,
  h3: (props: React.ComponentProps<"h3">) => <Heading as="h3" {...props} />,
  h4: (props: React.ComponentProps<"h4">) => <Heading as="h4" {...props} />,
  h5: (props: React.ComponentProps<"h5">) => <Heading as="h5" {...props} />,
  h6: (props: React.ComponentProps<"h6">) => <Heading as="h6" {...props} />,
  figure({ className, ...props }: React.ComponentProps<"figure">) {
    const hasPrettyCode = "data-rehype-pretty-code-figure" in props;

    return (
      <figure
        className={cn(hasPrettyCode && "not-prose", className)}
        {...props}
      />
    );
  },
  figcaption: ({ children, ...props }: React.ComponentProps<"figcaption">) => {
    return <figcaption {...props}>{children}</figcaption>;
  },
  pre({
    __rawString__,
    ...props
  }: React.ComponentProps<"pre"> & {
    __rawString__?: string;
  }) {
    return (
      <pre {...props} className={cn("overflow-x-auto", props.className)} />
    );
  },
  code: Code,
  img: (props: any) => {
    const { style, ...rest } = props || {};

    const parseStyleString = (s: string) => {
      const out: Record<string, string> = {};
      s.split(";").forEach((part) => {
        const [k, ...v] = part.split(":");
        if (!k) return;
        const key = k
          .trim()
          .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        const value = v.join(":").trim();
        if (key) out[key] = value;
      });
      return out;
    };

    const parsedStyle = typeof style === "string" ? parseStyleString(style) : style;

    return (
      <img
        {...(rest as React.ComponentProps<"img">)}
        style={parsedStyle}
        className="max-w-full h-auto"
      />
    );
  },
  iframe: (props: any) => {
    const {
      frameborder,
      allowfullscreen,
      allowFullScreen,
      style,
      ...rest
    } = props || {};

    const normalized: any = { ...rest };

    if (frameborder !== undefined && normalized.frameBorder === undefined) {
      normalized.frameBorder = frameborder;
    }

    if (allowfullscreen !== undefined && allowFullScreen === undefined) {
      normalized.allowFullScreen =
        allowfullscreen === "" || allowfullscreen === "true" || !!allowfullscreen;
    }

    // If iframe is inside a responsive container div, wrap it properly
    const isResponsive = style && typeof style === 'object' && style.position === 'absolute';
    
    if (isResponsive) {
      return (
        <div className="my-8 relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            {...(normalized as React.ComponentProps<"iframe">)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              ...(typeof style === 'object' ? style : {}),
            }}
            className="rounded-xl border border-border"
          />
        </div>
      );
    }

    return (
      <div className="my-8">
        <iframe
          {...(normalized as React.ComponentProps<"iframe">)}
          style={style}
          className="w-full rounded-xl border border-border"
        />
      </div>
    );
  },
  FramedImage: (props: any) => {
    const { src, alt, className, ...rest } = props || {};
    
    if (!src) return null;
    
    return (
      <div className={cn("my-8", className)} {...rest}>
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border">
          <Image
            src={src}
            alt={alt || ""}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        {alt && (
          <p className="text-sm text-muted-foreground mt-2 text-center italic">
            {alt}
          </p>
        )}
      </div>
    );
  },
};

const options: MDXRemoteProps["options"] = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [
        rehypeExternalLinks,
        { target: "_blank", rel: "nofollow noopener noreferrer" },
      ],
      rehypeSlug,
      () => (tree) => {
        visit(tree, (node: any) => {
          if (node?.type === "element") {
            const props = node.properties || {};
            if (typeof props.style === "string") {
              const str: string = props.style;
              const out: Record<string, string> = {};
              str.split(";").forEach((part) => {
                const [k, ...v] = part.split(":");
                if (!k) return;
                const key = k
                  .trim()
                  .replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase());
                const value = v.join(":").trim();
                if (key) out[key] = value;
              });

              node.properties.style = out;
            }
          }
        });
      },
      () => (tree) => {
        visit(tree, (node: any) => {
          if (node?.type === "element" && node?.tagName === "iframe") {
            const props = node.properties || {};

            if (props.allowfullscreen !== undefined) {
              props.allowFullScreen =
                props.allowfullscreen === "" || props.allowfullscreen === "true" || !!props.allowfullscreen;
              delete props.allowfullscreen;
            }

            if (props.frameborder !== undefined) {
              props.frameBorder = props.frameborder;
              delete props.frameborder;
            }

            node.properties = props;
          }
        });
      },
      () => (tree) => {
        visit(tree, (node) => {
          if (node?.type === "element" && node?.tagName === "pre") {
            const [codeEl] = node.children;
            if (codeEl.tagName !== "code") {
              return;
            }

            node.__rawString__ = codeEl.children?.[0].value;
          }
        });
      },
      [
        rehypePrettyCode,
        {
          theme: {
            dark: "github-dark",
            light: "github-light",
          },
          keepBackground: false,
          onVisitLine(node: LineElement) {
            if (node.children.length === 0) {
              node.children = [{ type: "text", value: " " }];
            }
          },
        },
      ],
      () => (tree) => {
        visit(tree, (node) => {
          if (node?.type === "element" && node?.tagName === "figure") {
            if (!("data-rehype-pretty-code-figure" in node.properties)) {
              return;
            }

            const preElement = node.children.at(-1);
            if (preElement.tagName !== "pre") {
              return;
            }

            preElement.properties["__withMeta__"] =
              node.children.at(0).tagName === "figcaption";
            preElement.properties["__rawString__"] = node.__rawString__;
          }
        });
      },
    ],
  },
};

export function MDX({ code }: { code: string }) {
  return <MDXRemote source={code} components={components} options={options} />;
}

