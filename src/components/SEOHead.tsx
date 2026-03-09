import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  ogType?: string;
  jsonLd?: object | object[];
  noIndex?: boolean;
  author?: string;
  datePublished?: string;
  dateModified?: string;
}

export function SEOHead({
  title,
  description,
  canonical,
  ogImage,
  ogType = "website",
  jsonLd,
  noIndex = false,
  author = "Arpit Dhamija",
  datePublished,
  dateModified,
}: SEOHeadProps) {
  const fullTitle = title.includes("Valence AI") ? title : `${title} | Valence AI`;
  const image = ogImage || "https://usevalence.ai/og-image.png";
  const canonicalUrl = `https://usevalence.ai${canonical}`;
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="author" content={author} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Valence AI" />
      {datePublished && <meta property="article:published_time" content={datePublished} />}
      {dateModified && <meta property="article:modified_time" content={dateModified} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@arpit_dhamija" />
      <meta name="twitter:creator" content="@arpit_dhamija" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD */}
      {schemas.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(schemas.length === 1 ? schemas[0] : schemas)}
        </script>
      )}
    </Helmet>
  );
}
