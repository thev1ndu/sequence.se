import { getPostBySlug } from "@/features/blog/data/posts";
import { getLLMText } from "@/features/blog/lib/get-llm-text";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  try {
    const markdownContent = await getLLMText(post);
    return new NextResponse(markdownContent, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error generating markdown:", error);
    return NextResponse.json(
      { error: "Failed to generate markdown" },
      { status: 500 }
    );
  }
}

