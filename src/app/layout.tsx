import { Navbar } from "@/components/sections/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { SQ3AssistantWidget } from "@/components/sq3-assistant/Widget";
import { siteConfig } from "@/lib/site";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { metadata as seoMetadata } from "./metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Only preload primary font
  fallback: ['ui-monospace', 'monospace'],
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "dark light",
};

export const metadata: Metadata = seoMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Critical resource hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        
        {/* Hidden SEO meta tags for SQ3 keyword */}
        <meta name="keywords" content="sq3, SQ3, sq3 ai, SQ3 AI, sq3 platform, SQ3 platform, sq3 software, SQ3 software, sq3 chatbot, SQ3 chatbot, sq3 assistant, SQ3 assistant, sq3 inbox, SQ3 inbox, sq3 unified inbox, SQ3 unified inbox, sq3 ai assistant, SQ3 AI assistant, sq3 conversation workspace, SQ3 conversation workspace, sq3 customer service, SQ3 customer service, sq3 sequence3, Sequence3 sq3" />
        <meta property="og:keywords" content="sq3, SQ3, sq3 ai, sq3 platform, sq3 unified inbox, Sequence3 sq3" />
        
        {/* OpenGraph image - ensure thumbnail.webp is used */}
        <meta property="og:image" content={`${siteConfig.url}/thumbnail.webp`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/webp" />
        <meta property="og:image:alt" content={siteConfig.name} />
        
        {/* Twitter Card image */}
        <meta name="twitter:image" content={`${siteConfig.url}/thumbnail.webp`} />
        <meta name="twitter:image:alt" content={siteConfig.name} />
      </head>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-CSR99VFXE5"
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-CSR99VFXE5');
        `}
      </Script>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-background`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="max-w-7xl mx-auto border-x relative">
            <div className="block w-px h-full border-l border-border absolute top-0 left-6 z-10"></div>
            <div className="block w-px h-full border-r border-border absolute top-0 right-6 z-10"></div>
            <Navbar />
            {children}
          </div>
          <SQ3AssistantWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
