"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, FileText, ImageIcon, Send, Loader2, Trash2, Pin, Upload } from "lucide-react";
import { toast } from "sonner";
import { MarkdownRenderer } from "@/features/blog/components/markdown-renderer";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CoverUpload } from "@/components/cover-upload";
import { supabase } from "@/lib/supabase";

const AUTO_SAVE_DELAY = 3000;

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const slugParam = params?.slug as string;

  const [postId, setPostId] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [content, setContent] = React.useState("");
  const [excerpt, setExcerpt] = React.useState("");
  const [coverImage, setCoverImage] = React.useState("");
  const [isPublished, setIsPublished] = React.useState(false);
  const [isPinned, setIsPinned] = React.useState(false);
  
  const [loading, setLoading] = React.useState(true); // Start loading
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showPreview, setShowPreview] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  
  const contentTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const previousContentRef = React.useRef<string>("");
  
  // Helper to extract R2 image URLs from content
  const extractR2ImageUrls = (text: string): string[] => {
    const r2Domain = process.env.NEXT_PUBLIC_R2_DOMAIN || 'r3.sequence3.se';
    const regex = /!\[[^\]]*\]\((https?:\/\/[^)]+)\)/g;
    const urls: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match[1].includes(r2Domain) || match[1].includes('/uploads/')) {
        urls.push(match[1]);
      }
    }
    return urls;
  };

  // Handle content change with image cleanup
  const handleContentChange = async (newContent: string) => {
    const oldContent = previousContentRef.current;
    setContent(newContent);
    previousContentRef.current = newContent;
    
    // Find removed R2 images
    const oldImages = extractR2ImageUrls(oldContent);
    const newImages = extractR2ImageUrls(newContent);
    const removedImages = oldImages.filter(url => !newImages.includes(url));
    
    // Delete removed images from R2
    for (const url of removedImages) {
      try {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        
        toast.info("Image removed", {
          description: "Image deleted from storage.",
        });
      } catch (error) {
        console.error('Failed to delete image:', url, error);
      }
    }
  };

  // Fetch Post Data on Mount
  React.useEffect(() => {
    async function fetchPost() {
      if (!slugParam) return;

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slugParam)
        .single();

      if (error) {
        console.error("Error fetching post:", error);
        setError("Post not found");
        setLoading(false);
      } else if (data) {
        setPostId(data.id);
        setTitle(data.title);
        setSlug(data.slug);
        setContent(data.content || "");
        previousContentRef.current = data.content || "";
        setExcerpt(data.excerpt || "");
        setCoverImage(data.cover_image || "");
        setIsPublished(data.is_published);
        setIsPinned(data.is_pinned || false);
        setLoading(false);
      }
    }

    fetchPost();
  }, [slugParam]);

  // Database Save Logic (Update Only)
  const saveToDb = React.useCallback(async (silent = true) => {
    if (!postId || !title) return;

    try {
      if (!silent) setIsSaving(true);
      
      const postData = {
        title,
        slug,
        content,
        excerpt,
        cover_image: coverImage,
        is_published: isPublished,
        is_pinned: isPinned,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("posts")
        .update(postData)
        .eq("id", postId);
        
      if (error) throw error;

      setLastSaved(new Date());
      
      // Show toast only for non-silent saves
      if (!silent) {
        if (isPublished) {
          toast.success("Post published!", {
            description: "Your post is now live on your blog.",
          });
        } else {
          toast.success("Post saved!", {
            description: "Your changes have been saved as a draft.",
          });
        }
      }
    } catch (err: any) {
      console.error("Auto-save failed:", err);
      if (!silent) {
        toast.error("Failed to save post", {
          description: "Please try again.",
        });
      }
    } finally {
      if (!silent) setIsSaving(false);
    }
  }, [postId, title, slug, content, excerpt, coverImage, isPublished, isPinned]);

  // Auto-Save Effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      // Only auto-save if we have leaded the post and have a valid ID
      if (postId && !loading) { 
        saveToDb(true);
      }
    }, AUTO_SAVE_DELAY);

    return () => clearTimeout(timer);
  }, [title, slug, content, excerpt, coverImage, isPublished, isPinned, saveToDb, postId, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveToDb(false);
    router.refresh();
    router.push("/dashboard");
  };

  const handleSaveAndExit = async () => {
    await saveToDb(false);
    router.refresh();
    router.push("/dashboard");
  };

  const handleDelete = async () => {
    if (!postId) return;
    
    setShowDeleteDialog(false);

    try {
      setIsDeleting(true);

      // Delete cover image from R2 if it exists
      if (coverImage) {
        try {
          await fetch("/api/delete-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: coverImage }),
          });
        } catch (imgError) {
          console.error("Failed to delete image from R2:", imgError);
          // Continue with post deletion even if image deletion fails
        }
      }

      // Delete post from Supabase
      const { error: deleteError } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (deleteError) throw deleteError;

      toast.success("Post deleted successfully!", {
        description: "The post and its cover image have been permanently removed.",
      });
      router.refresh();
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete post", {
        description: "Please try again later.",
      });
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex pl-6 pt-6 flex-col gap-4">
        <h1 className="text-2xl font-bold text-destructive">Error</h1>
        <p>{error}</p>
        <Button variant="outline" asChild className="w-fit">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
    <div className="w-full">
      <div className="flex items-start gap-4 mb-8">
        <Link
          href="/dashboard"
          className="mt-1 p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Edit Post</h1>
              <p className="text-muted-foreground">Make changes to your blog post</p>
            </div>
            <div className="flex items-center gap-4">
              {isSaving && <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>}
              {lastSaved && !isSaving && (
                <p className="text-xs text-muted-foreground">
                  Saved {lastSaved.toLocaleTimeString()}
                </p>
              )}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
                className="gap-1.5"
              >
                {isDeleting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-6">
        {/* Post Details Section */}
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
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Input
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="bg-background/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cover Image Section */}
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

        {/* Content Section */}
        <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              <span className="font-medium">Content</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    setIsUploadingImage(true);
                    try {
                      const formData = new FormData();
                      formData.append("file", file);
                      
                      const response = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                      });
                      
                      if (!response.ok) throw new Error("Upload failed");
                      
                      const { publicUrl } = await response.json();
                      
                      // Insert at cursor position or end
                      const textarea = contentTextareaRef.current;
                      const imageMarkdown = `\n![${file.name}](${publicUrl})\n`;
                      
                      if (textarea) {
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const newContent = content.substring(0, start) + imageMarkdown + content.substring(end);
                        setContent(newContent);
                        
                        // Set cursor after inserted image
                        setTimeout(() => {
                          textarea.focus();
                          textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
                        }, 0);
                      } else {
                        setContent(content + imageMarkdown);
                      }
                      
                      toast.success("Image inserted!", {
                        description: "Image uploaded and added to your content.",
                      });
                    } catch (error) {
                      console.error("Upload error:", error);
                      toast.error("Failed to upload image", {
                        description: "Please try again.",
                      });
                    } finally {
                      setIsUploadingImage(false);
                      e.target.value = ""; // Reset input
                    }
                  }}
                  disabled={isUploadingImage || showPreview}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploadingImage || showPreview}
                  className="gap-1.5 pointer-events-none"
                >
                  {isUploadingImage ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Upload className="size-3.5" />
                  )}
                  Insert Image
                </Button>
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? "Edit" : "Preview"}
              </Button>
            </div>
          </div>
          <div className="p-6">
            {showPreview ? (
              <div className="min-h-[400px] p-6 rounded-lg border border-border bg-background/50">
                <MarkdownRenderer content={content} />
              </div>
            ) : (
              <textarea
                ref={contentTextareaRef}
                id="content"
                className="w-full min-h-[400px] p-4 rounded-lg border border-border bg-background/50 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  const files = Array.from(e.dataTransfer.files);
                  const imageFile = files.find(f => f.type.startsWith('image/'));
                  
                  if (!imageFile) return;
                  
                  setIsUploadingImage(true);
                  try {
                    const formData = new FormData();
                    formData.append("file", imageFile);
                    
                    const response = await fetch("/api/upload", {
                      method: "POST",
                      body: formData,
                    });
                    
                    if (!response.ok) throw new Error("Upload failed");
                    
                    const { publicUrl } = await response.json();
                    
                    const textarea = contentTextareaRef.current;
                    const imageMarkdown = `\n![${imageFile.name}](${publicUrl})\n`;
                    
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const newContent = content.substring(0, start) + imageMarkdown + content.substring(end);
                      setContent(newContent);
                    } else {
                      setContent(content + imageMarkdown);
                    }
                    
                    toast.success("Image uploaded!", {
                      description: "Dropped image added to your content.",
                    });
                  } catch (error) {
                    console.error("Upload error:", error);
                    toast.error("Failed to upload image", {
                      description: "Please try again.",
                    });
                  } finally {
                    setIsUploadingImage(false);
                  }
                }}
                onPaste={async (e) => {
                  const items = Array.from(e.clipboardData.items);
                  const imageItem = items.find(item => item.type.startsWith('image/'));
                  
                  // Handle image paste
                  if (imageItem) {
                    e.preventDefault();
                    const imageFile = imageItem.getAsFile();
                    if (!imageFile) return;
                    
                    setIsUploadingImage(true);
                    try {
                      const formData = new FormData();
                      formData.append("file", imageFile);
                      
                      const response = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                      });
                      
                      if (!response.ok) throw new Error("Upload failed");
                      
                      const { publicUrl } = await response.json();
                      
                      const textarea = contentTextareaRef.current;
                      const imageMarkdown = `\n![pasted-image](${publicUrl})\n`;
                      
                      if (textarea) {
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const newContent = content.substring(0, start) + imageMarkdown + content.substring(end);
                        setContent(newContent);
                      } else {
                        setContent(content + imageMarkdown);
                      }
                      
                      toast.success("Image uploaded!", {
                        description: "Pasted image added to your content.",
                      });
                    } catch (error) {
                      console.error("Upload error:", error);
                      toast.error("Failed to upload image", {
                        description: "Please try again.",
                      });
                    } finally {
                      setIsUploadingImage(false);
                    }
                    return;
                  }
                  
                  // Handle text paste - detect code snippets
                  const text = e.clipboardData.getData('text/plain');
                  if (!text || text.length < 10) return; // Too short to be code
                  
                  // Code detection heuristics
                  const codePatterns = [
                    /^(import|export|from|const|let|var|function|class|interface|type|async|await|return|if|else|for|while|switch|case|try|catch|throw|new)\s/m,
                    /^(def |class |import |from |print\(|if __name__|async def)/m,
                    /^(<\?php|namespace |use |function |class |public |private |protected )/m,
                    /^(package |import |public class |private |void |int |String )/m,
                    /^(#include|using namespace|int main|void |std::)/m,
                    /^(fn |let |pub |use |impl |struct |mod |match )/m,
                    /^(func |package |import |type |var |const )/m,
                    /=>/,
                    /\{[\s\S]*\}/,
                    /\([\s\S]*\)\s*{/,
                    /;\s*$/m,
                    /^\s{2,}(return|if|for|while|const|let|var)/m,
                  ];
                  
                  const looksLikeCode = codePatterns.some(pattern => pattern.test(text));
                  const hasMultipleLines = text.split('\n').length > 2;
                  const hasIndentation = /^\s{2,}/m.test(text);
                  
                  if (looksLikeCode && (hasMultipleLines || hasIndentation)) {
                    e.preventDefault();
                    
                    // Try to detect language
                    let language = '';
                    if (/^(import|export|const|let|var|function|async|await|=\>|interface|type\s)/.test(text)) {
                      language = text.includes('interface ') || text.includes('type ') ? 'typescript' : 'javascript';
                    } else if (/^(def |class [A-Z]|import |from |print\(|if __name__)/.test(text)) {
                      language = 'python';
                    } else if (/<\?php|namespace /.test(text)) {
                      language = 'php';
                    } else if (/^(package |public class |void |int |String )/.test(text)) {
                      language = 'java';
                    } else if (/#include|std::/.test(text)) {
                      language = 'cpp';
                    } else if (/^(fn |pub |impl |struct )/.test(text)) {
                      language = 'rust';
                    } else if (/^(func |package main)/.test(text)) {
                      language = 'go';
                    } else if (/<[a-zA-Z][^>]*>/.test(text) && /<\/[a-zA-Z]+>/.test(text)) {
                      language = text.includes('className') ? 'jsx' : 'html';
                    } else if (/^\s*\{[\s\S]*"[\w]+":\s/.test(text)) {
                      language = 'json';
                    } else if (/^[\w-]+:\s/.test(text)) {
                      language = 'yaml';
                    } else if (/^\$|^@|\{.*\}/.test(text) && /;$/.test(text)) {
                      language = 'css';
                    } else if (/^SELECT|^INSERT|^UPDATE|^DELETE|^CREATE|^ALTER/i.test(text)) {
                      language = 'sql';
                    } else if (/^\s*#|^\s*\[\[/.test(text)) {
                      language = 'bash';
                    }
                    
                    const textarea = contentTextareaRef.current;
                    const codeMarkdown = `\n\`\`\`${language}\n${text}\n\`\`\`\n`;
                    
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const newContent = content.substring(0, start) + codeMarkdown + content.substring(end);
                      setContent(newContent);
                      
                      setTimeout(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start + codeMarkdown.length, start + codeMarkdown.length);
                      }, 0);
                    } else {
                      setContent(content + codeMarkdown);
                    }
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-0">
            <div className="flex items-center gap-6">
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
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </Button>
               <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveAndExit}
              >
                Save & Exit
              </Button>
              <Button type="submit" size="sm">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone and will permanently remove the post and its cover image.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-1.5"
            >
              {isDeleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
