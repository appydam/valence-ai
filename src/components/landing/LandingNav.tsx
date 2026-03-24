import { useRef, useState, useCallback } from "react";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  USE_CASES as ALL_USE_CASES,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_ORDER,
  getUseCasesByCategory,
  type UseCaseCategory,
} from "@/data/useCases";
import type { LandingTab } from "@/hooks/useLandingTab";

// ─── Mobile Menu ─────────────────────────────────────────────────────────────

function MobileMenu({
  open,
  onClose,
  onPilotClick,
  activeTab,
}: {
  open: boolean;
  onClose: () => void;
  onPilotClick: () => void;
  activeTab?: LandingTab;
}) {
  const navigate = useNavigate();
  const grouped = getUseCasesByCategory();
  const [expandedCat, setExpandedCat] = useState<UseCaseCategory | null>(null);

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleScrollTo = (id: string) => {
    onClose();
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Tab-specific quick links for mobile
  const tabQuickLinks: Record<LandingTab, { icon: string; label: string; action: () => void }[]> = {
    "ai-department": [], // use cases mega-menu shown instead
    "ai-workers": [
      { icon: "👥", label: "Browse Roles", action: () => handleScrollTo("roles") },
      { icon: "💰", label: "Cost Comparison", action: () => handleScrollTo("cost-comparison") },
    ],
    "ai-transformation": [
      { icon: "🔍", label: "The SaaS Problem", action: () => handleScrollTo("pain-points") },
      { icon: "🗺️", label: "Our Process", action: () => handleScrollTo("transformation-process") },
      { icon: "✨", label: "Before & After", action: () => handleScrollTo("before-after") },
    ],
  };

  const quickLinks = activeTab ? tabQuickLinks[activeTab] : [];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed top-0 right-0 bottom-0 z-50 w-72 overflow-y-auto"
            style={{
              background: "hsl(240 33% 6% / 0.98)",
              borderLeft: "1px solid hsl(var(--border) / 0.4)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 h-14"
              style={{ borderBottom: "1px solid hsl(var(--border) / 0.3)" }}
            >
              <span className="text-sm font-semibold text-foreground">Menu</span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav items */}
            <div className="px-3 py-4 flex flex-col gap-1">
              {/* Pricing + Open Source — only on AI Department + non-landing pages */}
              {(!activeTab || activeTab === "ai-department") && (
                <>
                  <button
                    onClick={() => handleNavigate("/pricing")}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-left"
                  >
                    Pricing
                  </button>
                  <button
                    onClick={() => handleNavigate("/open-source")}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-left"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400/80" />
                    Open Source
                  </button>
                </>
              )}

              {/* Tab-specific quick links (AI Workers / Transformation) */}
              {quickLinks.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-[10px] font-mono tracking-widest text-muted-foreground/50 mt-2">
                    {activeTab === "ai-workers" ? "AI WORKERS" : "TRANSFORMATION"}
                  </div>
                  {quickLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={link.action}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                    >
                      <span className="text-base">{link.icon}</span>
                      <span>{link.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Use Cases — only on AI Department or when no tab is set */}
              {(!activeTab || activeTab === "ai-department") && (
                <div>
                  <div className="px-3 py-2 text-[10px] font-mono tracking-widest text-muted-foreground/50 mt-2">
                    USE CASES
                  </div>
                  {CATEGORY_ORDER.map((cat) => {
                    const cases = grouped[cat];
                    if (cases.length === 0) return null;
                    const isOpen = expandedCat === cat;
                    return (
                      <div key={cat}>
                        <button
                          onClick={() => setExpandedCat(isOpen ? null : cat)}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                        >
                          <span className="text-base">{CATEGORY_ICONS[cat]}</span>
                          <span>{CATEGORY_LABELS[cat]}</span>
                          <span className="ml-auto text-xs opacity-40">{cases.length}</span>
                          <svg
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 pb-1 flex flex-col gap-0.5">
                                {cases.map((uc) => (
                                  <button
                                    key={uc.slug}
                                    onClick={() => handleNavigate(`/use-cases/${uc.slug}`)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-white/5 transition-colors"
                                  >
                                    <span className="text-sm">{uc.icon}</span>
                                    <span className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                      {uc.title}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CTA at bottom */}
            <div className="px-4 pb-6 mt-2">
              {activeTab === "ai-transformation" ? (
                <button
                  onClick={() => { onClose(); onPilotClick(); }}
                  className="block w-full py-2.5 rounded-lg text-sm font-semibold transition-all text-center"
                  style={{
                    background: "linear-gradient(135deg, hsl(258 90% 56%), hsl(217 91% 60%))",
                    color: "hsl(var(--primary-foreground))",
                  }}
                >
                  Get Started →
                </button>
              ) : (
                <button
                  onClick={() => { onClose(); onPilotClick(); }}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                  }}
                >
                  {activeTab === "ai-workers"
                    ? "Hire AI Worker →"
                    : "Get Started →"}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Use Cases mega-menu ─────────────────────────────────────────────────────

function UseCasesMegaMenu({ onNavigate }: { onNavigate: (slug: string) => void }) {
  const [activeCategory, setActiveCategory] = useState<UseCaseCategory>("sales");
  const grouped = getUseCasesByCategory();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[720px] max-w-[calc(100vw-2rem)] rounded-xl overflow-hidden"
      style={{
        background: "hsl(240 33% 6% / 0.98)",
        border: "1px solid hsl(var(--border) / 0.5)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 20px 60px -10px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex min-h-[340px]">
        {/* Left: Categories */}
        <div
          className="w-[220px] py-3 px-2 flex flex-col gap-0.5 border-r"
          style={{ borderColor: "hsl(var(--border) / 0.3)" }}
        >
          {CATEGORY_ORDER.map((cat) => {
            const isActive = activeCategory === cat;
            const cases = grouped[cat];
            if (cases.length === 0) return null;
            return (
              <button
                key={cat}
                onMouseEnter={() => setActiveCategory(cat)}
                onClick={() => setActiveCategory(cat)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all text-sm"
                style={{
                  background: isActive ? "hsl(var(--primary) / 0.1)" : "transparent",
                  color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                }}
              >
                <span className="text-base">{CATEGORY_ICONS[cat]}</span>
                <span className="font-medium">{CATEGORY_LABELS[cat]}</span>
                <span className="ml-auto text-xs opacity-50">{cases.length}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Use cases for active category */}
        <div className="flex-1 py-3 px-4">
          <div className="text-[10px] font-mono tracking-widest text-muted-foreground/60 mb-3 px-1">
            {CATEGORY_LABELS[activeCategory].toUpperCase()}
          </div>
          <div className="flex flex-col gap-1">
            {grouped[activeCategory].map((uc) => (
              <button
                key={uc.slug}
                onClick={() => onNavigate(uc.slug)}
                className="group flex flex-col gap-1 p-3 rounded-lg text-left transition-all hover:bg-white/5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{uc.icon}</span>
                  <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {uc.title}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </span>
                </div>
                <div className="text-xs text-muted-foreground/70 pl-7 line-clamp-1">
                  {uc.trigger}
                </div>
                <div className="flex items-center gap-1.5 pl-7 mt-0.5">
                  {uc.steps
                    .flatMap((s) => s.tools)
                    .filter((t, i, arr) => arr.findIndex((x) => x.label === t.label) === i)
                    .slice(0, 5)
                    .map((tool) => (
                      <span
                        key={tool.label}
                        className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                        style={{
                          background: `${tool.color}18`,
                          color: tool.color,
                          border: `1px solid ${tool.color}30`,
                        }}
                      >
                        {tool.label}
                      </span>
                    ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="px-4 py-2.5 flex items-center justify-between text-xs"
        style={{
          borderTop: "1px solid hsl(var(--border) / 0.3)",
          background: "hsl(var(--primary) / 0.03)",
        }}
      >
        <span className="text-muted-foreground/60">
          {ALL_USE_CASES.length} workflows across {CATEGORY_ORDER.length} domains
        </span>
        <button
          onClick={() => onNavigate("close-pipeline-faster")}
          className="text-primary/80 hover:text-primary transition-colors font-medium"
        >
          See all use cases →
        </button>
      </div>
    </motion.div>
  );
}

// ─── LandingNav ──────────────────────────────────────────────────────────────

/**
 * Shared top navbar for Landing, Pricing, and UseCase pages.
 *
 * Props:
 *  - onPilotClick: opens the pilot/request-access modal
 *  - breadcrumb: optional { icon, label } shown after the logo (for use-case pages)
 *  - activeTab: optional landing tab — when set, nav links become context-aware
 */
export function LandingNav({
  onPilotClick,
  breadcrumb,
  activeTab,
}: {
  onPilotClick: () => void;
  breadcrumb?: { icon: string; label: string };
  activeTab?: LandingTab;
}) {
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  const scrolled = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useRef(() => {
    const unsub = scrollY.on("change", (y) => {
      if (!navRef.current) return;
      if (y > 60 && !scrolled.current) {
        navRef.current.classList.add("nav-scrolled");
        scrolled.current = true;
      } else if (y <= 60 && scrolled.current) {
        navRef.current.classList.remove("nav-scrolled");
        scrolled.current = false;
      }
    });
    return unsub;
  });

  const handleMenuEnter = useCallback(() => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setMenuOpen(true);
  }, []);

  const handleMenuLeave = useCallback(() => {
    menuTimeoutRef.current = setTimeout(() => setMenuOpen(false), 200);
  }, []);

  const handleNavigate = useCallback((slug: string) => {
    setMenuOpen(false);
    navigate(`/use-cases/${slug}`);
  }, [navigate]);

  return (
    <>
      <motion.nav
        ref={navRef}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          background: "hsl(240 33% 4% / 0.85)",
          borderBottom: "1px solid hsl(var(--border) / 0.4)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo + branding */}
            <Link to="/landing" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
              <img src="/logo.svg" alt="Valence AI" className="w-12 h-12" />
              <span className="font-bold text-sm tracking-tight">Valence AI</span>
              <div
                className="hidden sm:flex items-center gap-1 text-[9px] font-mono tracking-widest px-1.5 py-0.5 rounded"
                style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary) / 0.8)" }}
              >
                <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse-glow" />
                LIVE
              </div>
            </Link>

            {/* Optional breadcrumb (use-case pages) */}
            {breadcrumb && (
              <>
                <span className="text-muted-foreground/30">/</span>
                <span className="text-xs text-muted-foreground font-medium">
                  {breadcrumb.icon} {breadcrumb.label}
                </span>
              </>
            )}

            {/* Pricing + Open Source — shown on AI Department tab + non-landing pages */}
            {!breadcrumb && (!activeTab || activeTab === "ai-department") && (
              <>
                <Link
                  to="/pricing"
                  className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md"
                >
                  Pricing
                </Link>
                <Link
                  to="/open-source"
                  className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400/80" />
                  Open Source
                </Link>
              </>
            )}

            {/* Context-aware nav links based on active landing tab */}
            {(!activeTab || activeTab === "ai-department") && (
              /* Use Cases dropdown — AI Department + non-landing pages */
              <div
                className="relative hidden sm:block"
                onMouseEnter={handleMenuEnter}
                onMouseLeave={handleMenuLeave}
              >
                <button
                  className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  Use Cases
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <UseCasesMegaMenu onNavigate={handleNavigate} />
                  )}
                </AnimatePresence>
              </div>
            )}

            {activeTab === "ai-workers" && (
              /* AI Workers quick links */
              <div className="hidden sm:flex items-center gap-1">
                <button
                  onClick={() => document.getElementById("roles")?.scrollIntoView({ behavior: "smooth" })}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md"
                >
                  Roles
                </button>
                <button
                  onClick={() => document.getElementById("how-it-works-workers")?.scrollIntoView({ behavior: "smooth" })}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md"
                >
                  How It Works
                </button>
              </div>
            )}

            {activeTab === "ai-transformation" && (
              /* AI Transformation quick links */
              <div className="hidden sm:flex items-center gap-1">
                <button
                  onClick={() => document.getElementById("pain-points")?.scrollIntoView({ behavior: "smooth" })}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md"
                >
                  The Problem
                </button>
                <button
                  onClick={() => document.getElementById("transformation-process")?.scrollIntoView({ behavior: "smooth" })}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md"
                >
                  Our Process
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "ai-transformation" ? (
              <motion.button
                onClick={onPilotClick}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="hidden sm:block text-sm font-semibold px-4 py-1.5 rounded-lg transition-all relative overflow-hidden text-center"
                style={{
                  background: "linear-gradient(135deg, hsl(258 90% 56%), hsl(217 91% 60%))",
                  color: "hsl(var(--primary-foreground))",
                }}
              >
                Get Started →
              </motion.button>
            ) : (
              <motion.button
                onClick={onPilotClick}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="hidden sm:block text-sm font-semibold px-4 py-1.5 rounded-lg transition-all relative overflow-hidden"
                style={{
                  background: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                }}
              >
                {activeTab === "ai-workers"
                  ? "Hire AI Worker →"
                  : "Request Access →"}
              </motion.button>
            )}

            {/* Hamburger — mobile only */}
            <button
              className="sm:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* MobileMenu rendered outside nav so fixed positioning isn't clipped by nav's transform/filter stacking context */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onPilotClick={onPilotClick}
        activeTab={activeTab}
      />
    </>
  );
}
