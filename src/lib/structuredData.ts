// JSON-LD schema factory functions for SEO

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Valence AI",
    url: "https://usevalence.ai",
    description:
      "Valence AI is the best AI agent platform and AI orchestrator for deploying autonomous AI workforce. Manage AI employees that research, build, write, and integrate with 100+ tools from one command center.",
    sameAs: [
      "https://twitter.com/arpit_dhamija",
      "https://github.com/arpitdhamija-ai",
    ],
    founder: {
      "@type": "Person",
      name: "Arpit Dhamija",
    },
    knowsAbout: [
      "AI Agent",
      "AI Orchestrator",
      "Autonomous AI",
      "AI Workforce",
      "AI Employee",
      "Multi-Agent Orchestration",
      "Agentic AI",
    ],
  };
}

export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Valence AI",
    url: "https://usevalence.ai",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "AI Agent Platform",
    operatingSystem: "Web",
    description:
      "The best AI agent platform and AI orchestrator. Deploy autonomous AI agents as AI employees — five specialized agents handle sales, marketing, operations, finance, and DevOps with 100+ integrations.",
    offers: [
      {
        "@type": "Offer",
        name: "Self-Hosted (Open Source)",
        price: "0",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        name: "Managed AI Workforce",
        price: "2499",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          billingDuration: "P1M",
        },
      },
    ],
    featureList: [
      "Multi-agent AI orchestration",
      "Autonomous AI workforce management",
      "AI employee deployment",
      "100+ app integrations",
      "Persistent agent memory",
      "Quality review gates",
      "Real-time analytics dashboard",
      "Webhook triggers",
      "Continuous monitors",
      "Self-hosted / on-premise",
      "Cross-agent coordination",
      "Natural language task assignment",
    ],
    keywords:
      "ai agent, ai orchestrator, autonomous ai, ai workforce, ai employee, best ai company, ai agent platform, ai automation, multi-agent orchestration",
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
