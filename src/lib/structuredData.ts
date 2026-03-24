// JSON-LD schema factory functions for SEO

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Valence AI",
    description:
      "Open-source AI agent orchestration platform. Deploy and manage autonomous AI agents with 100+ integrations from one command center.",
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
      "Open-source AI agent orchestration platform. Deploy specialized AI agents and automate complex, multi-step workflows with 100+ integrations.",
    offers: [
      {
        "@type": "Offer",
        name: "Self-Hosted (Open Source)",
        price: "0",
        priceCurrency: "USD",
      },
    ],
    featureList: [
      "Multi-agent orchestration",
      "100+ app integrations",
      "Persistent agent memory",
      "Quality review gates",
      "Real-time analytics dashboard",
      "Webhook triggers",
      "Continuous monitors",
      "Self-hosted / on-premise",
    ],
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
    url: opts.url,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    author: {
      "@type": "Person",
      name: opts.author || "Arpit Dhamija",
    },
    publisher: {
      "@type": "Organization",
      name: "Valence AI",
    },
    image: opts.image,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": opts.url,
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
      item: item.url,
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
    url: opts.url,
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
    url: opts.url,
    ...(opts.datePublished && { datePublished: opts.datePublished }),
    ...(opts.dateModified && { dateModified: opts.dateModified }),
    isPartOf: {
      "@type": "WebSite",
      name: "Valence AI",
    },
  };
}
