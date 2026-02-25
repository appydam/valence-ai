// Brand logos — simpleicons.org CDN for supported brands, official sources for others
// simpleicons serve transparent SVGs; colors are chosen to be visible on dark card backgrounds

function si(slug: string, color: string) {
  return `https://cdn.simpleicons.org/${slug}/${color}`;
}

// Compact branded SVG for brands not in simpleicons
function svg(content: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(content)}`;
}

// ── Brands not in simpleicons — tight official-color SVGs ───────────────────

// Salesforce: cloud shape in brand blue
const LOGO_SALESFORCE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 44">` +
  `<path fill="#00A1E0" d="M26.7 4.5a10 10 0 0 1 7.1 3 13.5 13.5 0 0 1 6.8-1.8 13.6 13.6 0 0 1 13.6 13.6 13.6 13.6 0 0 1-1.7 6.6A9.7 9.7 0 0 1 54 29a9.7 9.7 0 0 1-9.7 9.7 9.5 9.5 0 0 1-1.7-.2 8.6 8.6 0 0 1-7.1 3.8 8.6 8.6 0 0 1-6.3-2.8 11.4 11.4 0 0 1-6.8 2.2 11.5 11.5 0 0 1-10.9-7.7A9.2 9.2 0 0 1 10 19.6a9.2 9.2 0 0 1 4.4-7.9 12 12 0 0 1-.2-2.1A12.1 12.1 0 0 1 26.3 7.7a11.9 11.9 0 0 1 .4-3.2z"/>` +
  `</svg>`
);

// Slack: official four-color hash
const LOGO_SLACK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 54">` +
  `<path fill="#E01E5A" d="M19.7 32.5a4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4h4v4zm2 0a4 4 0 0 1 4-4 4 4 0 0 1 4 4v10a4 4 0 0 1-4 4 4 4 0 0 1-4-4V32.5z"/>` +
  `<path fill="#36C5F0" d="M21.7 19.7a4 4 0 0 1-4-4 4 4 0 0 1 4-4 4 4 0 0 1 4 4v4h-4zm0 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4H11.7a4 4 0 0 1-4-4 4 4 0 0 1 4-4h10z"/>` +
  `<path fill="#2EB67D" d="M34.5 21.7a4 4 0 0 1 4-4 4 4 0 0 1 4 4 4 4 0 0 1-4 4h-4v-4zm-2 0a4 4 0 0 1-4 4 4 4 0 0 1-4-4V11.7a4 4 0 0 1 4-4 4 4 0 0 1 4 4v10z"/>` +
  `<path fill="#ECB22E" d="M32.5 34.5a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4v-4h4zm0-2a4 4 0 0 1-4-4 4 4 0 0 1 4-4h10a4 4 0 0 1 4 4 4 4 0 0 1-4 4H32.5z"/>` +
  `</svg>`
);

// ServiceNow: brand green (#62D84E) with the official "Now" helix / circular arc mark
// ServiceNow's actual icon is a stylised "N" made from two overlapping arcs — approximated here
const LOGO_SERVICENOW = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
  `<rect width="64" height="64" rx="12" fill="#62D84E"/>` +
  // Two bold diagonal strokes forming the "N" shape ServiceNow uses
  `<path stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none" d="M16 48 L16 16 L48 48 L48 16"/>` +
  `</svg>`
);

// Workday: orange "W" on rounded square — brand orange #F5821F
const LOGO_WORKDAY = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
  `<rect width="64" height="64" rx="14" fill="#F5821F"/>` +
  `<text x="32" y="46" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-size="36" fill="#fff">W</text>` +
  `</svg>`
);

// Gong: purple "G" with audio wave ring — brand purple
const LOGO_GONG = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
  `<circle cx="32" cy="32" r="30" fill="#7C3AED"/>` +
  `<text x="32" y="44" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-size="32" fill="#fff">G</text>` +
  `</svg>`
);

// MindTickle: purple MT initials
const LOGO_MINDTICKLE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
  `<rect width="64" height="64" rx="14" fill="#5F2EEA"/>` +
  `<text x="32" y="44" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-size="24" fill="#fff">MT</text>` +
  `</svg>`
);

// Productboard: official 3-triangle mark — Red #FF2638, Yellow #FFC600, Blue #0079F2
// Source: logos:productboard-icon on Iconify (CC0)
const LOGO_PRODUCTBOARD = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 168">` +
  `<path fill="#FF2638" d="m85.327 83.997l85.327 83.996H0z"/>` +
  `<path fill="#FFC600" d="m0 0l85.327 83.997L170.654 0z"/>` +
  `<path fill="#0079F2" d="m85.341 83.997l85.327 83.996l85.327-83.996L170.668 0z"/>` +
  `</svg>`
);

// Shopify: official bag icon — brand green #96BF48
// Source: simple-icons/shopify (official SVG path, viewBox 0 0 24 24)
const LOGO_SHOPIFY = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">` +
  `<path fill="#96BF48" d="M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-1.275-1.274-1.439-1.411c-.045-.037-.075-.057-.121-.074l-.914 21.104h.023zM11.71 11.305s-.81-.424-1.774-.424c-1.447 0-1.504.906-1.504 1.141 0 1.232 3.24 1.715 3.24 4.629 0 2.295-1.44 3.76-3.406 3.76-2.354 0-3.54-1.465-3.54-1.465l.646-2.086s1.245 1.066 2.28 1.066c.675 0 .975-.545.975-.932 0-1.619-2.654-1.694-2.654-4.359-.034-2.237 1.571-4.416 4.827-4.416 1.257 0 1.875.361 1.875.361l-.945 2.715-.02.01zM11.17.83c.136 0 .271.038.405.135-.984.465-2.064 1.639-2.508 3.992-.656.213-1.293.405-1.889.578C7.697 3.75 8.951.84 11.17.84V.83zm1.235 2.949v.135c-.754.232-1.583.484-2.394.736.466-1.777 1.333-2.645 2.085-2.971.193.501.309 1.176.309 2.1zm.539-2.234c.694.074 1.141.867 1.429 1.755-.349.114-.735.231-1.158.366v-.252c0-.752-.096-1.371-.271-1.871v.002zm2.992 1.289c-.02 0-.06.021-.078.021s-.289.075-.714.21c-.423-1.233-1.176-2.37-2.508-2.37h-.115C12.135.209 11.669 0 11.265 0 8.159 0 6.675 3.877 6.21 5.846c-1.194.365-2.063.636-2.16.674-.675.213-.694.232-.772.87-.075.462-1.83 14.063-1.83 14.063L15.009 24l.927-21.166z"/>` +
  `</svg>`
);

// Greenhouse: official plant/pin mark — brand green #24A47F
// Source: simple-icons/greenhouse (official SVG path, viewBox 0 0 24 24)
const LOGO_GREENHOUSE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">` +
  `<path fill="#24A47F" d="M16.279 7.13c0 1.16-.49 2.185-1.293 2.987-.891.891-2.184 1.114-2.184 1.872 0 1.025 1.65.713 3.231 2.295 1.048 1.047 1.694 2.43 1.694 4.034C17.727 21.482 15.187 24 12 24c-3.187 0-5.727-2.518-5.727-5.68 0-1.607.646-2.989 1.694-4.036 1.582-1.582 3.23-1.27 3.23-2.295 0-.758-1.292-.98-2.183-1.872-.802-.802-1.293-1.827-1.293-3.03 0-2.318 1.895-4.19 4.212-4.19.446 0 .847.067 1.181.067.602 0 .914-.268.914-.691 0-.245-.112-.557-.112-.891 0-.758.647-1.382 1.427-1.382s1.404.646 1.404 1.426c0 .825-.647 1.204-1.137 1.382-.401.134-.713.312-.713.713 0 .758 1.382 1.493 1.382 3.61zm-.446 11.19c0-2.206-1.627-3.99-3.833-3.99-2.206 0-3.833 1.784-3.833 3.99 0 2.184 1.627 3.989 3.833 3.989 2.206 0 3.833-1.808 3.833-3.99zM14.518 7.086c0-1.404-1.136-2.562-2.518-2.562S9.482 5.682 9.482 7.086 10.618 9.65 12 9.65s2.518-1.159 2.518-2.563z"/>` +
  `</svg>`
);

// Zendesk: official Z-shape mark — brand teal #03363D
// Source: simple-icons/zendesk (official SVG path, viewBox 0 0 24 24)
const LOGO_ZENDESK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">` +
  `<path fill="#1F73B7" d="M12.914 2.904V16.29L24 2.905H12.914zM0 2.906C0 5.966 2.483 8.45 5.543 8.45s5.542-2.484 5.543-5.544H0zm11.086 4.807L0 21.096h11.086V7.713zm7.37 7.84c-3.063 0-5.542 2.48-5.542 5.543H24c0-3.06-2.48-5.543-5.543-5.543z"/>` +
  `</svg>`
);

// Meta: official M-shape — brand blue #0082FB
// Source: simple-icons/meta (official SVG path, viewBox 0 0 24 24)
const LOGO_META = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">` +
  `<path fill="#0082FB" d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"/>` +
  `</svg>`
);

// ── Logo map ────────────────────────────────────────────────────────────────

export const BLUEPRINT_LOGOS: Record<string, string> = {
  // Dev tools
  "github":             si("github", "ffffff"),
  "linear":             si("linear", "5E6AD2"),
  "jira":               si("jira", "2684FF"),

  // Communication & Productivity
  "slack":              LOGO_SLACK,
  "notion":             si("notion", "ffffff"),
  "gmail":              si("gmail", "EA4335"),
  "google-calendar":    si("googlecalendar", "4285F4"),
  "google-sheets":      si("googlesheets", "34A853"),

  // CRM & Sales
  "salesforce":         LOGO_SALESFORCE,
  "hubspot":            si("hubspot", "FF7A59"),
  "gong":               LOGO_GONG,

  // Payments
  "stripe-api":         si("stripe", "635BFF"),

  // Support
  "intercom":           si("intercom", "6AFDEF"),
  "zendesk":            LOGO_ZENDESK,
  "servicenow":         LOGO_SERVICENOW,

  // Design
  "figma":              si("figma", "F24E1E"),

  // Product & Project
  "productboard":       LOGO_PRODUCTBOARD,

  // E-commerce
  "shopify":            LOGO_SHOPIFY,

  // Advertising
  "google-ads":         si("googleads", "4285F4"),
  "facebook-ads":       LOGO_META,

  // HR & Payroll
  "gusto":              si("gusto", "F45D48"),
  "workday":            LOGO_WORKDAY,
  "greenhouse":         LOGO_GREENHOUSE,
  "sap-successfactors": si("sap", "0FAAFF"),
  "sap-s4hana":         si("sap", "0FAAFF"),

  // BI
  "looker":             si("looker", "4285F4"),

  // Sales Enablement
  "mindtickle":         LOGO_MINDTICKLE,

  // Social Media
  "instagram":          si("instagram", "E4405F"),
  "twitter-x":          si("x", "ffffff"),
  "tiktok":             si("tiktok", "ffffff"),
  "youtube":            si("youtube", "FF0000"),
};
