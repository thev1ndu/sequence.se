import { siteConfig, getSocialLinksArray } from "@/lib/site";
import { siteConfig as config } from "@/lib/config";

interface StructuredDataProps {
  type?: "homepage" | "product";
}

export function StructuredData({ type = "homepage" }: StructuredDataProps) {
  const baseUrl = siteConfig.url;
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: baseUrl,
    logo: `${baseUrl}/Q.svg`,
    description: siteConfig.description,
    sameAs: getSocialLinksArray().filter(url => url !== siteConfig.socialLinks.email),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: siteConfig.socialLinks.email,
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: baseUrl,
    description: siteConfig.description,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
    },
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    description: siteConfig.description,
    url: baseUrl,
    featureList: [
      "Real-time AI Collaboration",
      "Unified Inbox",
      "Multi-channel Messaging",
      "Sentiment Analysis",
      "Intent Detection",
      "Human-in-the-Loop",
      "Explainable AI",
      "Knowledge Retrieval",
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faqSection.faQitems.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
    ],
  };

  const schemas: Array<Record<string, unknown>> = [
    organizationSchema,
    websiteSchema,
    breadcrumbSchema,
    faqSchema,
  ];

  if (type === "product") {
    schemas.push(productSchema);
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

