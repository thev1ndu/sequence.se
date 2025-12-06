import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Blog',
    short_name: 'Blog',
    description: 'A collection of articles on development, design, and ideas.',
    start_url: '/blog',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/purple.png',
        sizes: '1149x1149',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/purple.png',
        sizes: '1149x1149',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/Q.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/purple.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    categories: ['business', 'productivity', 'communication'],
    lang: 'en',
    dir: 'ltr',
    scope: '/blog',
    id: 'blog',
  }
}

