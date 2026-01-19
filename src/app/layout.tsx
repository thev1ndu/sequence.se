import { ThemeProvider } from "@/components/theme-provider";
import { MainSiteWrapper } from "@/components/main-site-wrapper";
import { siteConfig } from "@/lib/site";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import "./globals.css";
import { metadata as seoMetadata } from "./metadata";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        
        <meta name="keywords" content="sq3, SQ3, sq3 ai, SQ3 AI, sq3 platform, SQ3 platform, sq3 software, SQ3 software, sq3 chatbot, SQ3 chatbot, sq3 assistant, SQ3 assistant, sq3 inbox, SQ3 inbox, sq3 unified inbox, SQ3 unified inbox, sq3 ai assistant, SQ3 AI assistant, sq3 conversation workspace, SQ3 conversation workspace, sq3 customer service, SQ3 customer service, sq3 sequence3, Sequence3 sq3" />
        <meta property="og:keywords" content="sq3, SQ3, sq3 ai, sq3 platform, sq3 unified inbox, Sequence3 sq3" />
        
        <meta property="og:image" content={`${siteConfig.url}/thumbnail.webp`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/webp" />
        <meta property="og:image:alt" content={siteConfig.name} />
        
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
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-sans bg-background`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MainSiteWrapper>{children}</MainSiteWrapper>
          <Toaster 
            theme="dark"
            richColors 
            position="bottom-right"
            closeButton
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
