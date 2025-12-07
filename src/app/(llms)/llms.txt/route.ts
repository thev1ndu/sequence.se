import { SITE_INFO } from "@/config/site";
import { getAllPosts } from "@/features/blog/data/posts";

const allPosts = getAllPosts();

const content = `# ${SITE_INFO.name}

> A minimal, pixel-perfect blog.

## Blog

${allPosts.map((item) => `- [${item.metadata.title}](${SITE_INFO.url}/blog/${item.slug}.mdx): ${item.metadata.description}`).join("\n")}
`;

export const dynamic = "force-static";

export async function GET() {
  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown;charset=utf-8",
    },
  });
}
