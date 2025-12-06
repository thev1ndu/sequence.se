import { Metadata } from "next";
import { siteConfig } from "@/lib/site";

const siteUrl = siteConfig.url;
const ogImageUrl = `${siteUrl}/thumbnail.webp`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Blog",
    template: `%s | Blog`,
  },
  description: "A collection of articles on development, design, and ideas.",
  keywords: [
    "blog",
    "articles",
    "development",
    "design",
    "ideas",
    "tutorials",
    "tech blog",
  ],
  authors: [
    {
      name: siteConfig.name,
    },
  ],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Blog",
    description: "A collection of articles on development, design, and ideas.",
    siteName: "Blog",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog",
    description: "A collection of articles on development, design, and ideas.",
    images: [ogImageUrl],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {},
};
