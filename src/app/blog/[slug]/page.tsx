import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/features/blog/components/markdown-renderer";

import { BlogPostClient } from "@/features/blog/components/blog-post-client";
import {
  getAllPostsFromDB,
  getPostBySlugFromDB,
} from "@/features/blog/data/supabase-posts";

// Try DB only (we removed file posts)
async function getPost(slug: string) {
  const dbPost = await getPostBySlugFromDB(slug);
  return dbPost || null;
}

export async function generateStaticParams() {
  const posts = await getAllPostsFromDB();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = (await params).slug;
  const post = await getPost(slug);

  if (!post) {
    return {};
  }

  const { title, description, image } = post.metadata;

  return {
    title: `${title} | Sequence3 Blog`,
    description,
    openGraph: {
      type: "article",
      title,
      description,
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
    },
  };
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage(props: Props) {
  const params = await props.params;
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <BlogPostClient post={post}>
      <MarkdownRenderer content={post.content} />
    </BlogPostClient>
  );
}
