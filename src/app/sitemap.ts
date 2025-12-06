import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/site'
import { getAllPosts } from '@/components/blog/data/posts'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url
  const now = new Date()
  
  // Get all blog posts
  const posts = getAllPosts()
  
  // Create sitemap entries for blog pages
  const blogPages = [
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    ...posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.metadata.updatedAt ? new Date(post.metadata.updatedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]

  return blogPages
}
