// JSON-LD schema factory functions for SEO

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Valence AI",
    url: "https://usevalence.ai",
    logo: "https://usevalence.ai/logo.svg",
    description:
      "Autonomous AI workforce platform. Deploy AI agents that research, build, write, and integrate with 100+ tools — all from one command center.",
    sameAs: ["https://twitter.com/arpit_dhamija"],
    founder: {
      "@type": "Person",
      name: "Arpit Dhamija",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: "arpitdhamija.ai@gmail.com",
      contactType: "customer support",
    },
  };
}

export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Valence AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Autonomous AI workforce platform with 5 specialized agents and 100+ integrations. Deploy AI employees that research, build, write, and monitor — all orchestrated from one command center.",
    url: "https://usevalence.ai",
    offers: [
      {
        "@type": "Offer",
        name: "Business",
        price: "2499",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "2499",
          priceCurrency: "USD",
          unitText: "MONTH",
        },
      },
      {
        "@type": "Offer",
        name: "Enterprise",
        price: "5999",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "5999",
          priceCurrency: "USD",
          unitText: "MONTH",
        },
      },
    ],
    featureList: [
      "Multi-agent orchestration",
      "100+ app integrations",
      "Voice commands",
      "Persistent agent memory",
      "Quality review gates",
      "Real-time analytics dashboard",
      "Webhook triggers",
      "On-premise deployment",
    ],
    screenshot: "https://usevalence.ai/og-image.png",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "48",
    },
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

export function faqSchema(items: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function articleSchema(opts: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  author?: string;
  image?: string;
  keywords?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    url: `https://usevalence.ai${opts.url}`,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    author: {
      "@type": "Person",
      name: opts.author || "Arpit Dhamija",
      url: "https://twitter.com/arpit_dhamija",
    },
    publisher: {
      "@type": "Organization",
      name: "Valence AI",
      logo: {
        "@type": "ImageObject",
        url: "https://usevalence.ai/logo.svg",
      },
    },
    image: opts.image || "https://usevalence.ai/og-image.png",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://usevalence.ai${opts.url}`,
    },
    ...(opts.keywords && { keywords: opts.keywords.join(", ") }),
  };
}

export function howToSchema(opts: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
  totalTime?: string;
  estimatedCost?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
    ...(opts.totalTime && { totalTime: opts.totalTime }),
    ...(opts.estimatedCost && {
      estimatedCost: {
        "@type": "MonetaryAmount",
        currency: "USD",
        value: opts.estimatedCost,
      },
    }),
    tool: [
      {
        "@type": "HowToTool",
        name: "Valence AI",
      },
    ],
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `https://usevalence.ai${item.url}`,
    })),
  };
}

export function definedTermSchema(opts: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: opts.name,
    description: opts.description,
    url: `https://usevalence.ai${opts.url}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Valence AI Glossary",
      url: "https://usevalence.ai/glossary",
    },
  };
}

export function webPageSchema(opts: {
  title: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: opts.title,
    description: opts.description,
    url: `https://usevalence.ai${opts.url}`,
    ...(opts.datePublished && { datePublished: opts.datePublished }),
    ...(opts.dateModified && { dateModified: opts.dateModified }),
    isPartOf: {
      "@type": "WebSite",
      name: "Valence AI",
      url: "https://usevalence.ai",
    },
  };
}
