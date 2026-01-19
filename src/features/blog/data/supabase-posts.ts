import { supabase } from "@/lib/supabase";

export interface DBPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  is_published: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  metadata: {
    title: string;
    description: string;
    image?: string;
    createdAt: string;
    updatedAt: string;
    pinned?: boolean;
    category?: string;
  };
  slug: string;
  content: string;
}

// Transform DB post to the format expected by the blog components
function transformPost(dbPost: DBPost): Post {
  return {
    metadata: {
      title: dbPost.title,
      description: dbPost.excerpt || "",
      image: dbPost.cover_image || undefined,
      createdAt: dbPost.created_at,
      updatedAt: dbPost.updated_at || dbPost.created_at,
      pinned: dbPost.is_pinned || false,
    },
    slug: dbPost.slug,
    content: dbPost.content,
  };
}

export async function getAllPostsFromDB(): Promise<Post[]> {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("is_published", true)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  return (posts || []).map(transformPost);
}

export async function getPostBySlugFromDB(slug: string): Promise<Post | null> {
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !post) {
    console.error("Error fetching post:", error);
    return null;
  }

  return transformPost(post);
}
