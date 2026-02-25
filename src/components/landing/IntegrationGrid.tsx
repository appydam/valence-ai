import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

interface Integration {
  name: string;
  logo: string; // URL to brand SVG/PNG
  color: string;
  lastCalledBy?: string;
  lastEndpoint?: string;
  lastStatus?: string;
  lastMs?: string;
}

// Using cdn.simpleicons.org for real brand SVG logos
const SI = (slug: string) => `https://cdn.simpleicons.org/${slug}`;

const CATEGORIES: { label: string; integrations: Integration[] }[] = [
  {
    label: "CRM & Sales",
    integrations: [
      { name: "Salesforce", logo: SI("salesforce"), color: "#00A1E0", lastCalledBy: "Ghost", lastEndpoint: "POST /sobjects/Lead", lastStatus: "201 Created", lastMs: "312ms" },
      { name: "HubSpot CRM", logo: SI("hubspot"), color: "#FF7A59", lastCalledBy: "Kaze", lastEndpoint: "PATCH /crm/v3/objects/deals", lastStatus: "200 OK", lastMs: "189ms" },
      { name: "Intercom", logo: SI("intercom"), color: "#286EFA", lastCalledBy: "Kaze", lastEndpoint: "POST /contacts", lastStatus: "201 Created", lastMs: "156ms" },
      { name: "Gong", logo: SI("gong"), color: "#7B42F6", lastCalledBy: "Scout", lastEndpoint: "GET /calls?fromDateTime=...", lastStatus: "200 OK", lastMs: "421ms" },
      { name: "MindTickle", logo: SI("mindtickle"), color: "#FF6B35", lastCalledBy: "Ghost", lastEndpoint: "POST /training/assignments", lastStatus: "201 Created", lastMs: "234ms" },
    ],
  },
  {
    label: "Dev Tools",
    integrations: [
      { name: "GitHub", logo: SI("github"), color: "#e2e8f0", lastCalledBy: "Forge", lastEndpoint: "POST /repos/commits", lastStatus: "201 Created", lastMs: "243ms" },
      { name: "Bitbucket", logo: SI("bitbucket"), color: "#2684FF", lastCalledBy: "Forge", lastEndpoint: "POST /repositories/pullrequests", lastStatus: "201 Created", lastMs: "312ms" },
      { name: "Jira", logo: SI("jira"), color: "#0052CC", lastCalledBy: "Kaze", lastEndpoint: "POST /rest/api/issue", lastStatus: "201 Created", lastMs: "134ms" },
      { name: "Linear", logo: SI("linear"), color: "#5E6AD2", lastCalledBy: "Kaze", lastEndpoint: "POST /graphql (createIssue)", lastStatus: "200 OK", lastMs: "134ms" },
      { name: "Confluence", logo: SI("confluence"), color: "#0052CC", lastCalledBy: "Ghost", lastEndpoint: "POST /wiki/rest/api/content", lastStatus: "200 OK", lastMs: "198ms" },
    ],
  },
  {
    label: "Communication",
    integrations: [
      { name: "Slack", logo: SI("slack"), color: "#4A154B", lastCalledBy: "Kaze", lastEndpoint: "POST /chat.postMessage", lastStatus: "200 OK", lastMs: "78ms" },
      { name: "Gmail", logo: SI("gmail"), color: "#EA4335", lastCalledBy: "Ghost", lastEndpoint: "POST /gmail/v1/draft", lastStatus: "201 Created", lastMs: "198ms" },
      { name: "Zoom", logo: SI("zoom"), color: "#2D8CFF", lastCalledBy: "Kaze", lastEndpoint: "POST /meetings", lastStatus: "201 Created", lastMs: "267ms" },
      { name: "Teams", logo: SI("microsoftteams"), color: "#6264A7", lastCalledBy: "Ghost", lastEndpoint: "POST /channel/messages", lastStatus: "201 Created", lastMs: "203ms" },
      { name: "SendGrid", logo: SI("sendgrid"), color: "#1A82E2", lastCalledBy: "Ghost", lastEndpoint: "POST /v3/mail/send", lastStatus: "202 Accepted", lastMs: "198ms" },
    ],
  },
  {
    label: "Finance & Payments",
    integrations: [
      { name: "Stripe", logo: SI("stripe"), color: "#6772E5", lastCalledBy: "Forge", lastEndpoint: "POST /v1/payment_intents", lastStatus: "201 Created", lastMs: "445ms" },
      { name: "Gusto", logo: SI("gusto"), color: "#F45D48", lastCalledBy: "Scout", lastEndpoint: "GET /v1/companies/payrolls", lastStatus: "200 OK", lastMs: "312ms" },
      { name: "Shopify", logo: SI("shopify"), color: "#96BF48", lastCalledBy: "Scout", lastEndpoint: "GET /admin/api/orders.json", lastStatus: "200 OK", lastMs: "267ms" },
      { name: "QuickBooks", logo: SI("quickbooks"), color: "#2CA01C", lastCalledBy: "Scout", lastEndpoint: "POST /invoice", lastStatus: "200 OK", lastMs: "312ms" },
      { name: "Brex", logo: SI("brex"), color: "#B27BFF", lastCalledBy: "Forge", lastEndpoint: "GET /transactions", lastStatus: "200 OK", lastMs: "189ms" },
    ],
  },
  {
    label: "Data & Analytics",
    integrations: [
      { name: "Google Sheets", logo: SI("googlesheets"), color: "#34A853", lastCalledBy: "Scout", lastEndpoint: "POST /values:append", lastStatus: "200 OK", lastMs: "156ms" },
      { name: "Airtable", logo: SI("airtable"), color: "#FCB400", lastCalledBy: "Scout", lastEndpoint: "POST /records", lastStatus: "200 OK", lastMs: "156ms" },
      { name: "Looker", logo: SI("looker"), color: "#4285F4", lastCalledBy: "Scout", lastEndpoint: "POST /queries/run/json", lastStatus: "200 OK", lastMs: "523ms" },
      { name: "Typeform", logo: SI("typeform"), color: "#262627", lastCalledBy: "Scout", lastEndpoint: "GET /forms/{id}/responses", lastStatus: "200 OK", lastMs: "178ms" },
    ],
  },
  {
    label: "Project & Docs",
    integrations: [
      { name: "Notion", logo: SI("notion"), color: "#8B8B8B", lastCalledBy: "Ghost", lastEndpoint: "POST /pages", lastStatus: "200 OK", lastMs: "267ms" },
      { name: "Productboard", logo: SI("productboard"), color: "#F55050", lastCalledBy: "Kaze", lastEndpoint: "POST /features", lastStatus: "201 Created", lastMs: "213ms" },
      { name: "Google Calendar", logo: SI("googlecalendar"), color: "#4285F4", lastCalledBy: "Kaze", lastEndpoint: "POST /calendars/events", lastStatus: "200 OK", lastMs: "145ms" },
      { name: "Figma", logo: SI("figma"), color: "#F24E1E", lastCalledBy: "Ghost", lastEndpoint: "GET /files/{key}/components", lastStatus: "200 OK", lastMs: "312ms" },
    ],
  },
  {
    label: "Enterprise",
    integrations: [
      { name: "SAP S/4HANA", logo: SI("sap"), color: "#009de0", lastCalledBy: "Scout", lastEndpoint: "GET /API_PRODUCT_SRV/A_Product", lastStatus: "200 OK", lastMs: "789ms" },
      { name: "SAP SuccessFactors", logo: SI("sap"), color: "#F0AB00", lastCalledBy: "Scout", lastEndpoint: "GET /odata/v2/User", lastStatus: "200 OK", lastMs: "612ms" },
      { name: "Workday", logo: SI("workday"), color: "#F5820F", lastCalledBy: "Scout", lastEndpoint: "GET /v1/workers", lastStatus: "200 OK", lastMs: "534ms" },
      { name: "ServiceNow", logo: SI("servicenow"), color: "#62D84E", lastCalledBy: "Sentinel", lastEndpoint: "POST /api/now/table/incident", lastStatus: "201 Created", lastMs: "345ms" },
      { name: "Greenhouse", logo: SI("greenhouse"), color: "#24A47F", lastCalledBy: "Scout", lastEndpoint: "GET /v1/candidates", lastStatus: "200 OK", lastMs: "267ms" },
    ],
  },
  {
    label: "Marketing & Ads",
    integrations: [
      { name: "Meta Ads", logo: SI("meta"), color: "#1877F2", lastCalledBy: "Scout", lastEndpoint: "GET /act_{id}/insights", lastStatus: "200 OK", lastMs: "412ms" },
      { name: "Google Ads", logo: SI("googleads"), color: "#4285F4", lastCalledBy: "Scout", lastEndpoint: "GET /customers/{id}/campaigns", lastStatus: "200 OK", lastMs: "378ms" },
      { name: "Zendesk", logo: SI("zendesk"), color: "#03363D", lastCalledBy: "Sentinel", lastEndpoint: "GET /tickets?status=open", lastStatus: "200 OK", lastMs: "98ms" },
    ],
  },
  {
    label: "Socials",
    integrations: [
      { name: "Instagram", logo: SI("instagram"), color: "#E1306C", lastCalledBy: "Ghost", lastEndpoint: "POST /media/{id}/publish", lastStatus: "200 OK", lastMs: "312ms" },
      { name: "X (Twitter)", logo: SI("x"), color: "#e2e8f0", lastCalledBy: "Ghost", lastEndpoint: "POST /2/tweets", lastStatus: "201 Created", lastMs: "198ms" },
      { name: "TikTok", logo: SI("tiktok"), color: "#69C9D0", lastCalledBy: "Ghost", lastEndpoint: "POST /share/video/upload", lastStatus: "200 OK", lastMs: "445ms" },
      { name: "YouTube", logo: SI("youtube"), color: "#FF0000", lastCalledBy: "Scout", lastEndpoint: "POST /videos?part=snippet", lastStatus: "200 OK", lastMs: "534ms" },
    ],
  },
];

const ROW1_CATEGORIES = CATEGORIES.slice(0, 4);
const ROW2_CATEGORIES = CATEGORIES.slice(4);

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
  if (errored) {
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
      style={{ filter: "brightness(0) invert(1)", opacity: 0.75 }}
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
      {/* Row 1 — 4 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ROW1_CATEGORIES.map((cat, ci) => (
          <CategoryCard key={cat.label} cat={cat} ci={ci} isInView={isInView} />
        ))}
      </div>
      {/* Row 2 — 5 cards (compressed) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {ROW2_CATEGORIES.map((cat, ci) => (
          <CategoryCard key={cat.label} cat={cat} ci={ci + 4} isInView={isInView} />
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
  const [integCount] = useState(94);
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
