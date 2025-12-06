# Blog Platform

A modern, professional blog platform built with Next.js, featuring MDX support, beautiful typography, and optimized performance.

## Features

- 📝 **MDX Support** - Write blog posts using Markdown with JSX components
- 🎨 **Beautiful Typography** - Professional, readable typography with syntax highlighting
- 🚀 **Performance Optimized** - Static site generation with Next.js
- 📱 **Responsive Design** - Works seamlessly across all devices
- 🔍 **SEO Optimized** - Built-in SEO features and metadata management
- ⌨️ **Keyboard Navigation** - Navigate between posts with arrow keys
- 🔗 **Share Functionality** - Easy sharing to social media platforms

## Tech Stack

- **Next.js 16** - React framework with App Router
- **MDX** - Markdown with JSX support
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Fumadocs** - Table of contents generation
- **Rehype/Remark** - Markdown processing plugins

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm 10+

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── app/
│   ├── blog/              # Blog pages
│   │   ├── page.tsx       # Blog listing page
│   │   └── [slug]/        # Individual blog post pages
│   ├── api/
│   │   └── blog/          # Blog API routes
│   └── layout.tsx         # Root layout
└── components/
    └── blog/              # Blog-specific components
        ├── components/    # UI components
        ├── content/       # MDX blog posts
        ├── data/          # Data fetching utilities
        ├── lib/           # Helper functions
        └── types/         # TypeScript types
```

## Creating Blog Posts

1. Create a new `.mdx` file in `src/components/blog/content/`
2. Add frontmatter with metadata:

```mdx
---
title: "Your Blog Post Title"
description: "A brief description of your post"
image: "https://example.com/image.jpg"
pinned: false
new: false
category: blog
icon: rocket
createdAt: 2025-01-15
updatedAt: 2025-01-15
---

# Your Content Here
```

3. Write your content using Markdown and JSX components
4. The post will automatically appear on the blog listing page

## Available Components

- `<FramedImage>` - Responsive image component with aspect ratio
- Standard Markdown elements (headings, lists, code blocks, etc.)
- Custom iframe support for embedded content

## Deployment

The blog is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import the repository to Vercel
3. Vercel will automatically detect Next.js and deploy

## License

© 2025. All rights reserved.
