import dayjs from "dayjs";
import { remark } from "remark";
import remarkGfm from "remark-gfm";

import type { Post } from "@/components/blog/types/post";

const processor = remark().use(remarkGfm);

export async function getLLMText(post: Post) {
  const processed = await processor.process({
    value: post.content,
  });

  const updatedAt = post.metadata.updatedAt || post.metadata.createdAt;
  const updatedText = updatedAt && updatedAt !== post.metadata.createdAt
    ? `\n\nLast updated on ${dayjs(updatedAt).format("MMMM D, YYYY")}`
    : "";

  return `# ${post.metadata.title}

${post.metadata.description}

${processed.value}${updatedText}`;
}
