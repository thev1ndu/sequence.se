"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, FileText, ImageIcon, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CoverUpload } from "@/components/cover-upload";
import { supabase } from "@/lib/supabase";

const AUTO_SAVE_DELAY = 3000; // 3 seconds debounced

export default function NewPostPage() {
  const router = useRouter();
  const [postId, setPostId] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [content, setContent] = React.useState("");
  const [excerpt, setExcerpt] = React.useState("");
  const [coverImage, setCoverImage] = React.useState("");
  const [isPublished, setIsPublished] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPreview, setShowPreview] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);


  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = React.useState(false);

  React.useEffect(() => {
    if (!isSlugManuallyEdited && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generatedSlug);
    }
  }, [title, isSlugManuallyEdited]);


  const saveToDb = React.useCallback(async (silent = true) => {
    if (!title) return;

    try {
      if (!silent) setIsSaving(true);
      
      const postData = {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        content,
        excerpt,
        cover_image: coverImage,

        is_published: isPublished, 
        updated_at: new Date().toISOString(),
      };

      if (postId) {
        const { error } = await supabase
          .from("posts")
          .update(postData)
          .eq("id", postId);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("posts")
          .insert([postData])
          .select("id")
          .single();
        
        if (error) throw error;
        if (data) setPostId(data.id);
      }

      setLastSaved(new Date());
    } catch (err: any) {
      console.error("Auto-save failed:", err);
    } finally {
      if (!silent) setIsSaving(false);
    }
  }, [title, slug, content, excerpt, coverImage, isPublished, postId]);


  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (title) {
        saveToDb(true);
      }
    }, AUTO_SAVE_DELAY);

    return () => clearTimeout(timer);
  }, [title, slug, content, excerpt, coverImage, isPublished, saveToDb]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    await saveToDb(false);
    

    
    setLoading(false);
    router.refresh();
    router.push("/dashboard");
  };

  const handleSaveAndExit = async () => {
    setLoading(true);
    await saveToDb(false);
    setLoading(false);
    router.refresh();
    router.push("/dashboard");
  };

  return (
    <div className="w-full">
      <div className="flex items-start gap-4 mb-8">
        <Link
          href="/dashboard"
          className="mt-1 p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Create New Post</h1>
              <p className="text-muted-foreground">Add a new post to your blog</p>
              <div className="mt-1 h-8 px-3 rounded-md border border-border bg-muted/20 flex items-center w-fit sm:hidden">
                {isSaving && <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>}
                {lastSaved && !isSaving && (
                  <p className="text-xs text-muted-foreground">
                    Saved {lastSaved.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center mr-4">
                {isSaving && <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>}
                {lastSaved && !isSaving && (
                  <p className="text-xs text-muted-foreground">
                    Saved {lastSaved.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-6">
        <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
            <FileText className="size-4 text-muted-foreground" />
            <span className="font-medium">Post Details</span>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., My Awesome Blog Post"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="slug"
                  placeholder="my-awesome-post"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setIsSlugManuallyEdited(true);
                  }}
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Input
                  id="excerpt"
                  placeholder="A brief description of your post..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="bg-background/50"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
            <ImageIcon className="size-4 text-muted-foreground" />
            <span className="font-medium">Cover Image</span>
          </div>
          <div className="p-6">
            <CoverUpload
              value={coverImage}
              onChange={(url) => setCoverImage(url || "")}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              <span className="font-medium">Content</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? "Edit" : "Preview"}
            </Button>
          </div>
          <div className="p-6">
            {showPreview ? (
              <div className="min-h-[400px] p-6 rounded-lg border border-border bg-background/50 prose prose-neutral dark:prose-invert max-w-none prose-headings:mt-6 prose-headings:mb-4 prose-p:my-4 prose-img:rounded-lg prose-img:my-6 prose-blockquote:my-4 prose-ul:my-4 prose-ol:my-4 prose-hr:my-8 prose-a:text-primary prose-strong:text-foreground">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children, node }) => {
                      if (node?.children?.length === 1) {
                        const child = node.children[0] as any;
                        if (child?.tagName === 'a' && child?.properties?.href) {
                          const href = child.properties.href;
                          const isYoutube = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/.test(href);
                          if (isYoutube) {
                            return <div className="my-6">{children}</div>;
                          }
                        }
                      }
                      return <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>;
                    },
                    a: ({ href, children }) => {
                      const youtubeMatch = href?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
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
                            {String(children) !== href && (
                              <span className="mt-2 block text-sm text-center text-muted-foreground font-medium">
                                {children}
                              </span>
                            )}
                          </div>
                        );
                      }
                      return <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">{children}</a>;
                    },
                    img: ({ src, alt }) => (
                      <img src={src} alt={alt || ''} className="rounded-xl border border-border shadow-sm w-full my-8" loading="lazy" />
                    ),
                    h1: ({ children }) => <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8 mt-10 first:mt-0">{children}</h1>,
                    h2: ({ children }) => <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mb-6 mt-12">{children}</h2>,
                    h3: ({ children }) => <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4 mt-10">{children}</h3>,
                    h4: ({ children }) => <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-4 mt-8">{children}</h4>,
                    ul: ({ children }) => <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>,
                    ol: ({ children }) => <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">{children}</ol>,
                    blockquote: ({ children }) => <blockquote className="mt-6 border-l-4 border-primary pl-6 italic text-muted-foreground py-1">{children}</blockquote>,
                    hr: () => <hr className="my-10 border-border" />,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <textarea
                id="content"
                className="w-full min-h-[400px] p-4 rounded-lg border border-border bg-background/50 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Write your post content in Markdown..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-0">
            <div className="flex items-center gap-3">
              <Switch
                id="published"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
              <div>
                <Label htmlFor="published" className="font-medium cursor-pointer">
                  Publish Post
                </Label>
                <p className="text-xs text-muted-foreground">
                  Make visible on your site
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3 sm:justify-end w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveAndExit}
                className="w-full sm:w-auto"
              >
                Save & Exit
              </Button>
              <Button type="submit" disabled={loading} size="sm" className="w-full sm:w-auto col-span-2 sm:col-span-1">
                {loading ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
