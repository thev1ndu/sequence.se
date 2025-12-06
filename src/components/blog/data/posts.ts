import fs from "fs";
import matter from "gray-matter";
import path from "path";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import type { Post, PostMetadata } from "@/components/blog/types/post";

// Extend dayjs with custom parse format to handle various date formats
dayjs.extend(customParseFormat);

function normalizeDate(dateValue: string | Date | undefined): string {
  if (!dateValue) return new Date().toISOString();
  
  // If it's already a Date object, convert to ISO string
  if (dateValue instanceof Date) {
    return dateValue.toISOString();
  }
  
  // Try to parse with dayjs using multiple formats
  const dateStr = String(dateValue).trim();
  
  // Try common formats
  const formats = [
    "YYYY-MM-DD",
    "MMM D, YYYY",
    "MMMM D, YYYY",
    "D MMM YYYY",
    "YYYY/MM/DD",
  ];
  
  for (const format of formats) {
    const parsed = dayjs(dateStr, format, true);
    if (parsed.isValid()) {
      return parsed.toISOString();
    }
  }
  
  // Fallback to native Date parsing
  const fallback = new Date(dateStr);
  return !isNaN(fallback.getTime()) ? fallback.toISOString() : new Date().toISOString();
}

function parseFrontmatter(fileContent: string) {
  const file = matter(fileContent);
  const metadata = file.data as PostMetadata;

  // Normalize dates to ISO strings for consistency
  if (metadata.createdAt) {
    metadata.createdAt = normalizeDate(metadata.createdAt);
  }
  if (metadata.updatedAt) {
    metadata.updatedAt = normalizeDate(metadata.updatedAt);
  }

  return {
    metadata,
    content: file.content,
  };
}

function getMDXFiles(dir: string) {
  return fs.readdirSync(dir).filter(
    (file) => path.extname(file) === ".mdx" && !file.toUpperCase().includes("TEMPLATE")
  );
}

function readMDXFile(filePath: string) {
  const rawContent = fs.readFileSync(filePath, "utf-8");
  return parseFrontmatter(rawContent);
}

function getMDXData(dir: string) {
  const mdxFiles = getMDXFiles(dir);

  return mdxFiles.map<Post>((file) => {
    const { metadata, content } = readMDXFile(path.join(dir, file));

    const slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
    };
  });
}

export function getAllPosts() {
  return getMDXData(path.join(process.cwd(), "src/components/blog/content")).sort(
    (a, b) => {
      if (a.metadata.pinned && !b.metadata.pinned) return -1;
      if (!a.metadata.pinned && b.metadata.pinned) return 1;

      // Dates are now normalized to ISO strings, so we can compare them directly
      return (
        new Date(b.metadata.createdAt).getTime() -
        new Date(a.metadata.createdAt).getTime()
      );
    }
  );
}

export function getPostBySlug(slug: string) {
  return getAllPosts().find((post) => post.slug === slug);
}

export function getPostsByCategory(category: string) {
  return getAllPosts().filter((post) => post.metadata?.category === category);
}

export function findNeighbour(posts: Post[], slug: string) {
  const len = posts.length;

  for (let i = 0; i < len; ++i) {
    if (posts[i].slug === slug) {
      return {
        previous: i > 0 ? posts[i - 1] : null,
        next: i < len - 1 ? posts[i + 1] : null,
      };
    }
  }

  return { previous: null, next: null };
}
