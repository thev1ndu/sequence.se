import type { Metadata } from "next";

export const revalidate = 0;


import { SectionHeader } from "@/components/section-header";
import { PostItem } from "@/features/blog/components/post-item";
import { getAllPostsFromDB } from "@/features/blog/data/supabase-posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "A collection of articles on AI, customer engagement, and business insights.",
};

export default async function BlogPage() {
  const allPosts = await getAllPostsFromDB();

  return (
    <section className="flex flex-col items-center w-full z-0 relative">
      {/* Header Container */}
      <div className="mx-5 md:mx-10 px-5 md:px-10 relative w-full">
        <SectionHeader className="border-b-0 relative z-10">
          <h1 className="text-3xl md:text-4xl font-medium tracking-tighter text-center text-balance">
            Blog
          </h1>
          <p className="text-muted-foreground text-center text-balance font-medium">
            {metadata.description as string}
          </p>
        </SectionHeader>
      </div>

      {/* Full-width divider line like footer */}
      <div className="w-full h-px bg-border" />

      {/* Blog Grid Container */}
      <div className="mx-5 md:mx-10 px-5 md:px-10 relative w-full">
        {allPosts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No posts yet. Create your first post from the dashboard!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {allPosts.map((post, index) => (
              <div
                key={post.slug}
                className="relative p-3"
              >
                <PostItem
                  post={post}
                  shouldPreloadImage={index <= 4}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
