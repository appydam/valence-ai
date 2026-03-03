import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { BLUEPRINT_LOGOS } from "@/lib/integrationLogos";

interface Integration {
  name: string;
  logo: string; // URL to brand SVG/PNG
  color: string;
  lastCalledBy?: string;
  lastEndpoint?: string;
  lastStatus?: string;
  lastMs?: string;
}

const L = BLUEPRINT_LOGOS;

const CATEGORIES: { label: string; integrations: Integration[] }[] = [
  {
    label: "CRM",
    integrations: [
      { name: "Salesforce", logo: L["salesforce"], color: "#00A1E0", lastCalledBy: "Ghost", lastEndpoint: "POST /sobjects/Lead", lastStatus: "201 Created", lastMs: "312ms" },
      { name: "HubSpot CRM", logo: L["hubspot"], color: "#FF7A59", lastCalledBy: "Kaze", lastEndpoint: "PATCH /crm/v3/objects/deals", lastStatus: "200 OK", lastMs: "189ms" },
      { name: "Pipedrive", logo: L["pipedrive"], color: "#5BA4CF", lastCalledBy: "Scout", lastEndpoint: "POST /deals", lastStatus: "201 Created", lastMs: "198ms" },
      { name: "Zoho CRM", logo: `https://cdn.simpleicons.org/zoho/E42527`, color: "#E42527", lastCalledBy: "Scout", lastEndpoint: "POST /crm/v3/Leads", lastStatus: "201 Created", lastMs: "267ms" },
    ],
  },
  {
    label: "Sales Engagement",
    integrations: [
      { name: "Apollo.io", logo: `https://cdn.brandfetch.io/idJL6PnVhC/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX`, color: "#3B82F6", lastCalledBy: "Ghost", lastEndpoint: "POST /people/search", lastStatus: "200 OK", lastMs: "342ms" },
      { name: "Hunter.io", logo: L["hunter"], color: "#F36A24", lastCalledBy: "Scout", lastEndpoint: "GET /email-finder?domain=...", lastStatus: "200 OK", lastMs: "287ms" },
      { name: "Outreach", logo: L["outreach"], color: "#5951FF", lastCalledBy: "Ghost", lastEndpoint: "POST /sequences/sequenceStates", lastStatus: "201 Created", lastMs: "224ms" },
      { name: "Salesloft", logo: L["salesloft"], color: "#00B388", lastCalledBy: "Ghost", lastEndpoint: "POST /v2/cadence_memberships", lastStatus: "201 Created", lastMs: "256ms" },
      { name: "Instantly", logo: L["instantly"], color: "#6C47FF", lastCalledBy: "Ghost", lastEndpoint: "POST /api/v1/lead/add", lastStatus: "200 OK", lastMs: "168ms" },
      { name: "Smartlead", logo: L["smartlead"], color: "#0EA5E9", lastCalledBy: "Ghost", lastEndpoint: "POST /api/v1/campaigns/add-leads", lastStatus: "200 OK", lastMs: "187ms" },
      { name: "Gong", logo: L["gong"], color: "#7C3AED", lastCalledBy: "Scout", lastEndpoint: "GET /calls?fromDateTime=...", lastStatus: "200 OK", lastMs: "421ms" },
      { name: "Clay", logo: L["clay"], color: "#2563EB", lastCalledBy: "Scout", lastEndpoint: "POST /v3/people/enrich", lastStatus: "200 OK", lastMs: "312ms" },
      { name: "La Growth Machine", logo: L["lagrowthmachine"], color: "#3DC778", lastCalledBy: "Ghost", lastEndpoint: "POST /leads", lastStatus: "201 Created", lastMs: "198ms" },
    ],
  },
  {
    label: "HRIS & Payroll",
    integrations: [
      { name: "Rippling", logo: L["rippling"], color: "#FEC229", lastCalledBy: "Scout", lastEndpoint: "GET /employees", lastStatus: "200 OK", lastMs: "267ms" },
      { name: "Workday", logo: L["workday"], color: "#F5821F", lastCalledBy: "Scout", lastEndpoint: "GET /v1/workers", lastStatus: "200 OK", lastMs: "534ms" },
      { name: "Keka", logo: L["keka"], color: "#4F46E5", lastCalledBy: "Scout", lastEndpoint: "GET /hris/employees", lastStatus: "200 OK", lastMs: "312ms" },
      { name: "Gusto", logo: L["gusto"], color: "#F45D48", lastCalledBy: "Scout", lastEndpoint: "GET /v1/companies/payrolls", lastStatus: "200 OK", lastMs: "312ms" },
      { name: "SAP SuccessFactors", logo: L["sap-successfactors"], color: "#0FAAFF", lastCalledBy: "Scout", lastEndpoint: "GET /odata/v2/User", lastStatus: "200 OK", lastMs: "612ms" },
      { name: "Greenhouse", logo: L["greenhouse"], color: "#24A47F", lastCalledBy: "Scout", lastEndpoint: "GET /v1/candidates", lastStatus: "200 OK", lastMs: "267ms" },
    ],
  },
  {
    label: "Social Media",
    integrations: [
      { name: "Instagram", logo: L["instagram"], color: "#E4405F", lastCalledBy: "Ghost", lastEndpoint: "POST /media/{id}/publish", lastStatus: "200 OK", lastMs: "312ms" },
      { name: "X (Twitter)", logo: L["twitter-x"], color: "#e2e8f0", lastCalledBy: "Ghost", lastEndpoint: "POST /2/tweets", lastStatus: "201 Created", lastMs: "198ms" },
      { name: "TikTok", logo: L["tiktok"], color: "#69C9D0", lastCalledBy: "Ghost", lastEndpoint: "POST /share/video/upload", lastStatus: "200 OK", lastMs: "445ms" },
      { name: "YouTube", logo: L["youtube"], color: "#FF0000", lastCalledBy: "Scout", lastEndpoint: "POST /videos?part=snippet", lastStatus: "200 OK", lastMs: "534ms" },
      { name: "Reddit", logo: L["reddit"], color: "#FF4500", lastCalledBy: "Ghost", lastEndpoint: "POST /api/submit", lastStatus: "200 OK", lastMs: "312ms" },
    ],
  },
  {
    label: "Dev Tools",
    integrations: [
      { name: "GitHub", logo: L["github"], color: "#e2e8f0", lastCalledBy: "Forge", lastEndpoint: "POST /repos/commits", lastStatus: "201 Created", lastMs: "243ms" },
      { name: "Bitbucket", logo: `https://cdn.simpleicons.org/bitbucket/2684FF`, color: "#2684FF", lastCalledBy: "Forge", lastEndpoint: "POST /repositories/pullrequests", lastStatus: "201 Created", lastMs: "312ms" },
      { name: "Jira", logo: L["jira"], color: "#2684FF", lastCalledBy: "Kaze", lastEndpoint: "POST /rest/api/issue", lastStatus: "201 Created", lastMs: "134ms" },
      { name: "Linear", logo: L["linear"], color: "#5E6AD2", lastCalledBy: "Kaze", lastEndpoint: "POST /graphql (createIssue)", lastStatus: "200 OK", lastMs: "134ms" },
      { name: "Confluence", logo: `https://cdn.simpleicons.org/confluence/172B4D`, color: "#172B4D", lastCalledBy: "Ghost", lastEndpoint: "POST /wiki/rest/api/content", lastStatus: "200 OK", lastMs: "198ms" },
      { name: "Vercel", logo: L["vercel"], color: "#e2e8f0", lastCalledBy: "Forge", lastEndpoint: "POST /v13/deployments", lastStatus: "200 OK", lastMs: "412ms" },
    ],
  },
  {
    label: "Analytics & BI",
    integrations: [
      { name: "Google Analytics", logo: L["google-analytics"], color: "#E37400", lastCalledBy: "Scout", lastEndpoint: "POST /v1beta/reports:runReport", lastStatus: "200 OK", lastMs: "312ms" },
      { name: "PostHog", logo: L["posthog"], color: "#1D4AFF", lastCalledBy: "Scout", lastEndpoint: "GET /projects/1/events", lastStatus: "200 OK", lastMs: "198ms" },
      { name: "Looker", logo: L["looker"], color: "#4285F4", lastCalledBy: "Scout", lastEndpoint: "POST /queries/run/json", lastStatus: "200 OK", lastMs: "523ms" },
      { name: "Airtable", logo: L["airtable"], color: "#FCB400", lastCalledBy: "Scout", lastEndpoint: "POST /records", lastStatus: "200 OK", lastMs: "156ms" },
      { name: "Google Sheets", logo: L["google-sheets"], color: "#34A853", lastCalledBy: "Scout", lastEndpoint: "POST /values:append", lastStatus: "200 OK", lastMs: "156ms" },
      { name: "Typeform", logo: L["typeform"], color: "#262627", lastCalledBy: "Scout", lastEndpoint: "GET /forms/{id}/responses", lastStatus: "200 OK", lastMs: "178ms" },
    ],
  },
  {
    label: "Finance & Accounting",
    integrations: [
      { name: "Stripe", logo: L["stripe-api"], color: "#6772E5", lastCalledBy: "Forge", lastEndpoint: "POST /v1/payment_intents", lastStatus: "201 Created", lastMs: "445ms" },
      { name: "Razorpay", logo: L["razorpay"], color: "#0C2451", lastCalledBy: "Forge", lastEndpoint: "POST /v1/orders", lastStatus: "201 Created", lastMs: "298ms" },
      { name: "QuickBooks", logo: `https://cdn.simpleicons.org/quickbooks/2CA01C`, color: "#2CA01C", lastCalledBy: "Scout", lastEndpoint: "POST /invoice", lastStatus: "200 OK", lastMs: "312ms" },
    ],
  },
  {
    label: "E-commerce & Ops",
    integrations: [
      { name: "Shopify", logo: L["shopify"], color: "#96BF48", lastCalledBy: "Scout", lastEndpoint: "GET /admin/api/orders.json", lastStatus: "200 OK", lastMs: "267ms" },
      { name: "AfterShip", logo: L["aftership"], color: "#9B6BFF", lastCalledBy: "Scout", lastEndpoint: "GET /trackings", lastStatus: "200 OK", lastMs: "189ms" },
    ],
  },
  {
    label: "Communication",
    integrations: [
      { name: "Slack", logo: L["slack"], color: "#4A154B", lastCalledBy: "Kaze", lastEndpoint: "POST /chat.postMessage", lastStatus: "200 OK", lastMs: "78ms" },
      { name: "Gmail", logo: L["gmail"], color: "#EA4335", lastCalledBy: "Ghost", lastEndpoint: "POST /gmail/v1/draft", lastStatus: "201 Created", lastMs: "198ms" },
      { name: "Zoom", logo: `https://cdn.simpleicons.org/zoom/2D8CFF`, color: "#2D8CFF", lastCalledBy: "Kaze", lastEndpoint: "POST /meetings", lastStatus: "201 Created", lastMs: "267ms" },
      { name: "Teams", logo: `https://cdn.simpleicons.org/microsoftteams/6264A7`, color: "#6264A7", lastCalledBy: "Ghost", lastEndpoint: "POST /channel/messages", lastStatus: "201 Created", lastMs: "203ms" },
    ],
  },
  {
    label: "Marketing & Ads",
    integrations: [
      { name: "Mailchimp", logo: L["mailchimp"], color: "#FFE01B", lastCalledBy: "Ghost", lastEndpoint: "POST /3.0/campaigns", lastStatus: "201 Created", lastMs: "234ms" },
      { name: "Meta Ads", logo: L["facebook-ads"], color: "#0082FB", lastCalledBy: "Scout", lastEndpoint: "GET /act_{id}/insights", lastStatus: "200 OK", lastMs: "412ms" },
      { name: "Google Ads", logo: L["google-ads"], color: "#4285F4", lastCalledBy: "Scout", lastEndpoint: "GET /customers/{id}/campaigns", lastStatus: "200 OK", lastMs: "378ms" },
    ],
  },
  {
    label: "ERP & Enterprise",
    integrations: [
      { name: "SAP S/4HANA", logo: L["sap-s4hana"], color: "#0FAAFF", lastCalledBy: "Scout", lastEndpoint: "GET /API_PRODUCT_SRV/A_Product", lastStatus: "200 OK", lastMs: "789ms" },
      { name: "ServiceNow", logo: L["servicenow"], color: "#62D84E", lastCalledBy: "Sentinel", lastEndpoint: "POST /api/now/table/incident", lastStatus: "201 Created", lastMs: "345ms" },
      { name: "Zoho Workspace", logo: `https://cdn.simpleicons.org/zoho/CC3333`, color: "#CC3333", lastCalledBy: "Scout", lastEndpoint: "GET /workspace/v1/teams", lastStatus: "200 OK", lastMs: "412ms" },
      { name: "MindTickle", logo: L["mindtickle"], color: "#FF6B35", lastCalledBy: "Ghost", lastEndpoint: "POST /training/assignments", lastStatus: "201 Created", lastMs: "234ms" },
    ],
  },
  {
    label: "Design & Product",
    integrations: [
      { name: "Figma", logo: L["figma"], color: "#F24E1E", lastCalledBy: "Ghost", lastEndpoint: "GET /files/{key}/components", lastStatus: "200 OK", lastMs: "312ms" },
      { name: "Notion", logo: L["notion"], color: "#ffffff", lastCalledBy: "Ghost", lastEndpoint: "POST /pages", lastStatus: "200 OK", lastMs: "267ms" },
      { name: "Productboard", logo: L["productboard"], color: "#F55050", lastCalledBy: "Kaze", lastEndpoint: "POST /features", lastStatus: "201 Created", lastMs: "213ms" },
      { name: "Google Calendar", logo: L["google-calendar"], color: "#4285F4", lastCalledBy: "Kaze", lastEndpoint: "POST /calendars/events", lastStatus: "200 OK", lastMs: "145ms" },
    ],
  },
  {
    label: "Customer Support",
    integrations: [
      { name: "Intercom", logo: L["intercom"], color: "#6AFDEF", lastCalledBy: "Kaze", lastEndpoint: "POST /contacts", lastStatus: "201 Created", lastMs: "156ms" },
      { name: "Zendesk", logo: L["zendesk"], color: "#1F73B7", lastCalledBy: "Sentinel", lastEndpoint: "GET /tickets?status=open", lastStatus: "200 OK", lastMs: "98ms" },
    ],
  },
];

const ROW1_CATEGORIES = CATEGORIES.slice(0, 6);
const ROW2_CATEGORIES = CATEGORIES.slice(6);

const ALL_INTEGRATIONS = CATEGORIES.flatMap((c) => c.integrations);
// Marquee rows
const ROW1 = ALL_INTEGRATIONS.slice(0, 20);
const ROW2 = ALL_INTEGRATIONS.slice(20);

interface TooltipData {
  name: string;
  lastCalledBy?: string;
  lastEndpoint?: string;
  lastStatus?: string;
  lastMs?: string;
  color: string;
}

function BrandLogo({ logo, name, color, size = 16 }: { logo: string; name: string; color: string; size?: number }) {
  const [errored, setErrored] = useState(false);
  const isSimpleIcon = logo.includes("simpleicons.org");
  if (errored || !logo) {
    // Fallback: colored initial letter
    return (
      <span
        className="flex-shrink-0 flex items-center justify-center rounded font-bold text-[10px]"
        style={{ width: size, height: size, background: color + "22", color }}
      >
        {name[0]}
      </span>
    );
  }
  return (
    <img
      src={logo}
      alt={name}
      width={size}
      height={size}
      className="flex-shrink-0 object-contain"
      style={isSimpleIcon ? { filter: "brightness(0) invert(1)", opacity: 0.85 } : { opacity: 1 }}
      onError={() => setErrored(true)}
    />
  );
}

function IntegrationBadge({ item }: { item: Integration }) {
  const [hovered, setHovered] = useState(false);
  const AGENTS = ["Kaze", "Scout", "Forge", "Ghost", "Sentinel"];
  const randomAgent = item.lastCalledBy || AGENTS[Math.floor(Math.random() * AGENTS.length)];
  const minutesAgo = Math.floor(Math.random() * 8) + 1;

  return (
    <div
      className="flex-shrink-0 relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-default transition-colors duration-150"
        style={{
          background: hovered ? `${item.color}12` : "hsl(240 25% 8%)",
          border: `1px solid ${hovered ? item.color + "40" : "hsl(var(--border))"}`,
        }}
      >
        <BrandLogo logo={item.logo} name={item.name} color={item.color} size={16} />
        <span className="text-xs text-muted-foreground whitespace-nowrap">{item.name}</span>
      </div>

      {hovered && item.lastEndpoint && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute bottom-full left-0 mb-2 z-50 rounded-lg p-2.5 font-mono text-[10px] whitespace-nowrap"
          style={{
            background: "hsl(240 33% 6%)",
            border: `1px solid ${item.color}40`,
            minWidth: 240,
          }}
        >
          <div className="text-muted-foreground/50 mb-1">
            Last called by{" "}
            <span style={{ color: item.color }}>{randomAgent}</span>
            {" "}· {minutesAgo} min ago
          </div>
          <div className="text-muted-foreground/80">
            {item.lastEndpoint}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-green-400/80">{item.lastStatus}</span>
            <span className="text-muted-foreground/30">{item.lastMs}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function CategoryCard({ cat, ci, isInView }: { cat: typeof CATEGORIES[0]; ci: number; isInView: boolean }) {
  return (
    <motion.div
      key={cat.label}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: ci * 0.07, duration: 0.4 }}
      className="rounded-xl p-3"
      style={{
        background: "hsl(240 25% 7%)",
        border: "1px solid hsl(var(--border))",
      }}
    >
      <div className="text-[10px] text-muted-foreground/50 font-mono tracking-widest mb-2.5 uppercase">
        {cat.label}
      </div>
      <div className="space-y-1">
        {cat.integrations.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <BrandLogo logo={item.logo} name={item.name} color={item.color} size={14} />
            <span className="text-xs text-muted-foreground/70 truncate">{item.name}</span>
            <div
              className="ml-auto flex-shrink-0 w-1 h-1 rounded-full opacity-60"
              style={{ background: item.color }}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function CategoryGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="space-y-4">
      {/* Row 1 — 6 cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {ROW1_CATEGORIES.map((cat, ci) => (
          <CategoryCard key={cat.label} cat={cat} ci={ci} isInView={isInView} />
        ))}
      </div>
      {/* Row 2 — 7 cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        {ROW2_CATEGORIES.map((cat, ci) => (
          <CategoryCard key={cat.label} cat={cat} ci={ci + 6} isInView={isInView} />
        ))}
      </div>
      <p className="text-center mt-2 text-xs font-mono tracking-widest uppercase text-muted-foreground/30 select-none">
        and many more<span style={{ color: "hsl(var(--primary) / 0.6)" }}>.</span><span style={{ color: "hsl(var(--primary) / 0.35)" }}>.</span><span style={{ color: "hsl(var(--primary) / 0.15)" }}>.</span>
      </p>
    </div>
  );
}

function LiveCounter() {
  const [count, setCount] = useState(847);
  const [integCount] = useState(100);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false });

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setCount((c) => c + Math.floor(Math.random() * 3) + 1);
    }, 2200);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <div
      ref={ref}
      className="flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-sm font-mono"
      style={{
        background: "hsl(240 25% 7%)",
        border: "1px solid hsl(var(--border))",
      }}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
      <span className="text-muted-foreground/60">Executing</span>
      <span className="text-foreground font-semibold tabular-nums">{count.toLocaleString()}</span>
      <span className="text-muted-foreground/60">API calls today across</span>
      <span className="text-foreground font-semibold">{integCount}</span>
      <span className="text-muted-foreground/60">integrations</span>
    </div>
  );
}

const SCRAPER_LINES = [
  { text: "> Paste your API docs URL:", delay: 0, color: "text-muted-foreground" },
  { text: "  https://docs.stripe.com/api", delay: 600, color: "text-primary/70" },
  { text: "> Analyzing documentation...", delay: 1400, color: "text-muted-foreground" },
  { text: "✓ Found 47 REST endpoints", delay: 2200, color: "text-green-400" },
  { text: "✓ Generated 12 tool definitions", delay: 2800, color: "text-green-400" },
  { text: "✓ OAuth 2.0 flow configured", delay: 3300, color: "text-green-400" },
  { text: "✓ Rate limit handling enabled", delay: 3700, color: "text-green-400" },
];

function ScraperTerminal() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [visible, setVisible] = useState<number[]>([]);

  useEffect(() => {
    if (!isInView) return;
    SCRAPER_LINES.forEach((line, i) => {
      setTimeout(() => {
        setVisible((v) => [...v, i]);
      }, line.delay);
    });
  }, [isInView]);

  return (
    <div
      ref={ref}
      className="rounded-xl p-4 font-mono text-xs space-y-1.5 mx-auto relative overflow-hidden"
      style={{
        background: "hsl(240 33% 4%)",
        border: "1px solid hsl(var(--border))",
        maxWidth: 440,
      }}
    >
      <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-border/40">
        <div className="w-2 h-2 rounded-full bg-red-500/60" />
        <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
        <div className="w-2 h-2 rounded-full bg-green-500/60" />
        <span className="ml-2 text-muted-foreground/50 text-[10px] tracking-widest">AI DOC SCRAPER</span>
      </div>

      {SCRAPER_LINES.map((line, i) => (
        <div
          key={i}
          className={`transition-all duration-300 ${line.color} ${visible.includes(i) ? "opacity-100" : "opacity-0"}`}
        >
          {line.text}
          {i === 1 && <span className="animate-data-blink">_</span>}
        </div>
      ))}

      {visible.length >= SCRAPER_LINES.length && (
        <div className="mt-3 pt-2.5 border-t border-border/40">
          <button
            className="w-full py-2 rounded-lg text-xs font-semibold tracking-wide transition-all"
            style={{
              background: "hsl(var(--primary) / 0.15)",
              border: "1px solid hsl(var(--primary) / 0.4)",
              color: "hsl(var(--primary))",
            }}
          >
            Connect Stripe →
          </button>
        </div>
      )}

      <div
        className="absolute inset-0 pointer-events-none rounded-xl animate-hud-shimmer opacity-20"
        style={{
          background: "linear-gradient(90deg, transparent 20%, hsl(var(--primary) / 0.08) 50%, transparent 80%)",
          backgroundSize: "200% 100%",
        }}
      />
    </div>
  );
}

export function IntegrationGrid() {
  return (
    <div className="space-y-6">
      {/* Live counter */}
      <LiveCounter />

      {/* Category grid — shows 40 integrations in 8 labeled groups */}
      <CategoryGrid />

      {/* Marquee rows showing all logos (hover for tooltip) */}
      <div className="space-y-3 mt-4">
        <div className="relative overflow-hidden">
          <div
            className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to right, hsl(240 33% 4%), transparent)" }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, hsl(240 33% 4%), transparent)" }}
          />
          <div className="animate-ticker flex gap-2.5" style={{ width: "max-content" }}>
            {[...ROW1, ...ROW1].map((item, i) => (
              <IntegrationBadge key={`r1-${i}`} item={item} />
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div
            className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to right, hsl(240 33% 4%), transparent)" }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, hsl(240 33% 4%), transparent)" }}
          />
          <div
            className="animate-ticker flex gap-2.5"
            style={{ width: "max-content", animationDirection: "reverse" }}
          >
            {[...ROW2, ...ROW2].map((item, i) => (
              <IntegrationBadge key={`r2-${i}`} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* AI scraper */}
      <div className="mt-6">
        <p className="text-center text-sm text-muted-foreground mb-4">
          Or add <span className="text-foreground">any API</span> with our AI doc scraper — paste a URL, we generate the integration
        </p>
        <ScraperTerminal />
      </div>
    </div>
  );
}
