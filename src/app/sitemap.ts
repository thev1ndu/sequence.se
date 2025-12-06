import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/site'
import { getAllPosts } from '@/components/blog/data/posts'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url
  const now = new Date()
  
  // Get all blog posts
  const posts = getAllPosts()
  
  // Create sitemap entries for blog pages
  const blogEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.metadata.updatedAt || post.metadata.createdAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]

  return blogEntries
}

