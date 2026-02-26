# Figma CCO Compliance Dashboard Specification

## Design Brief
**Purpose:** Compliance dashboard for Chief Compliance Officers (CCOs) to monitor market data integrity and regulatory reporting status.  
**Target Audience:** Regulators (BaFin, ESMA), CCOs at EU crypto asset service providers  
**Aesthetic:** Bloomberg/Refinitiv — **trustworthy, professional, institutional**. NOT startup-y or colorful.

**Page Size:** 1920×1440 (16:10, optimized for large monitors)

---

## Design Principles

1. **Institutional Credibility:** Must look like a tool a BaFin regulator would trust
2. **Information Density:** Pack data without clutter (Bloomberg-style grids)
3. **Status-First:** Health indicators immediately visible
4. **Monospaced Data:** All numbers, timestamps, IDs in Geist Mono
5. **Minimal Color:** Black, white, gray, green (operational), red (alert)

---

## Color Palette

| Color | Hex Code | Usage |
|-------|----------|-------|
| **Background** | `#000000` | Page background |
| **Panel Background** | `#0F0F0F` | Card/panel backgrounds |
| **Border/Divider** | `#1F1F1F` | Subtle separators |
| **Text Primary** | `#FFFFFF` | Headlines, labels |
| **Text Secondary** | `#999999` | Timestamps, metadata |
| **Status Green** | `#00FF41` | Operational, healthy |
| **Status Yellow** | `#FFB020` | Degraded, warning |
| **Status Red** | `#FF4444` | Critical, down |
| **Accent Blue** | `#3B82F6` | Interactive elements (buttons, links) |

---

## Typography

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Page Title | Inter | 32pt | Bold | #FFFFFF |
| Section Headline | Inter | 20pt | Semibold | #FFFFFF |
| Data Label | Inter | 12pt | Medium | #999999 |
| Data Value | Geist Mono | 14pt | Medium | #FFFFFF |
| Timestamp | Geist Mono | 11pt | Regular | #999999 |
| Status Badge | Inter | 11pt | Bold | #FFFFFF (on status color bg) |

---

## Layout Structure

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  HEADER BAR                                                                  │
├────────┬─────────────────────────────────────────────────────────────────────┤
│        │                                                                      │
│  LEFT  │  MAIN CONTENT AREA                                                  │
│  NAV   │                                                                      │
│  BAR   │  (Selected view: Data Coverage / Audit Log / Regulatory Reports /   │
│        │   Alert Feed)                                                        │
│        │                                                                      │
│        │                                                                      │
└────────┴─────────────────────────────────────────────────────────────────────┘
```

**Dimensions:**
- **Header Bar:** 1920×80px (fixed)
- **Left Nav:** 240×1360px (fixed width, full height)
- **Main Content:** 1680×1360px (scrollable)

---

## Component 1: Header Bar (1920×80px)

### Layout
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo]  AlgoHouse Compliance Dashboard         [Status] [UTC Clock] [User] │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Elements

#### Logo (Left)
- **AlgoHouse wordmark** (white, 24pt, Inter Bold)
- Position: 24px from left, vertically centered

#### Status Indicator (Right Section)
- **Status badge:** "OPERATIONAL" (green) / "DEGRADED" (yellow) / "OUTAGE" (red)
- Position: 360px from right
- Size: 120×32px pill shape
- Text: Inter Bold 11pt, white
- Background: Status color

#### UTC Clock
- **Format:** "2026-02-25 16:45:23 UTC"
- Font: Geist Mono 12pt, #999999
- Updates every second (live clock)
- Position: 220px from right

#### User Menu
- **User icon + name:** "J. Schmidt" (example)
- Position: 24px from right
- Dropdown menu: Profile, Settings, Logout

---

## Component 2: Left Nav Bar (240×1360px)

### Nav Items (Vertical)

```
┌──────────────────────┐
│ 📊 Data Coverage     │ ← Selected (white bg)
├──────────────────────┤
│ 📝 Audit Log         │
├──────────────────────┤
│ 📋 Regulatory Reports│
├──────────────────────┤
│ 🚨 Alert Feed        │
├──────────────────────┤
│                      │
│ [Spacer]             │
│                      │
├──────────────────────┤
│ ⚙️ Settings          │
│ 📖 Documentation     │
└──────────────────────┘
```

### Styling
- **Item height:** 56px
- **Selected state:** White background (#FFFFFF), black text (#000000)
- **Hover state:** #1F1F1F background
- **Default state:** Transparent background, #999999 text
- **Icons:** 20×20px, aligned left (16px padding)
- **Text:** Inter Medium 14pt

---

## Component 3: Data Coverage Panel (Main View)

### Header
- **Title:** "Data Coverage Status" (Inter Bold 24pt)
- **Subtitle:** "Real-time health of all exchange data feeds" (Inter Regular 14pt, #999999)
- **Last Updated:** "Last updated: 2026-02-25 16:45:21 UTC" (Geist Mono 11pt, #999999)

### Exchange Grid (8 columns)

#### Column Headers
| Exchange | Status | Tick Frequency | Last Tick | Data Freshness | Uptime (24h) | Wash Trade Detection | Actions |
|----------|--------|----------------|-----------|----------------|--------------|----------------------|---------|

#### Example Row (Binance)
| **Binance** | 🟢 **OPERATIONAL** | 2,340 ticks/min | 2026-02-25 16:45:20 UTC | 3ms | 99.98% | ✅ Active | [View Details] |

#### Status Colors
- 🟢 **Green:** Operational (all systems healthy)
- 🟡 **Yellow:** Degraded (latency >10ms or tick frequency <80% of baseline)
- 🔴 **Red:** Down (no ticks received in last 60 seconds)

#### Grid Styling
- **Row height:** 64px
- **Background:** Alternating #0F0F0F (even) and #000000 (odd)
- **Border:** 1px #1F1F1F between rows
- **Text:** Labels (Inter 12pt), Values (Geist Mono 14pt)
- **Status badge:** 100×28px pill, bold text

### Summary Cards (Above Grid)

```
┌────────────────┬────────────────┬────────────────┬────────────────┐
│ Total Exchanges│  Operational   │   Degraded     │     Down       │
│                │                │                │                │
│      48        │      45        │       2        │       1        │
│  Geist Mono    │    Green       │    Yellow      │     Red        │
│     48pt       │     32pt       │     32pt       │     32pt       │
└────────────────┴────────────────┴────────────────┴────────────────┘
```

- **Card size:** 400×120px each
- **Background:** #0F0F0F
- **Border:** 1px #1F1F1F
- **Label:** Inter Medium 12pt, #999999 (top)
- **Value:** Geist Mono Bold 48pt (center) in respective status color

---

## Component 4: Audit Log Panel (Main View)

### Table Layout (Paginated)

#### Column Headers
| Timestamp (UTC) | User | Endpoint | Data Range | Response Time | Records Returned | Status | Actions |
|-----------------|------|----------|------------|---------------|------------------|--------|---------|

#### Example Row
| 2026-02-25 16:42:13 | j.schmidt@acme.com | GET /v1/compliance/audit-log | 2026-02-24 - 2026-02-25 | 347ms | 1,523 | ✅ 200 | [View Request] [Export] |

#### Row Styling
- **Row height:** 56px
- **Background:** Alternating rows (#0F0F0F / #000000)
- **Text:** Geist Mono 12pt for data values, Inter 11pt for actions
- **Status:** Green checkmark for 200, red X for 4xx/5xx

### Filters (Top Bar)
```
[Date Range: Last 7 days ▼] [User: All ▼] [Endpoint: All ▼] [Status: All ▼] [Search...] [Export CSV]
```

- **Filter dropdowns:** 200×40px, #1F1F1F background
- **Search box:** 300×40px, #1F1F1F background, magnifying glass icon
- **Export button:** 120×40px, blue (#3B82F6) background, white text

### Pagination (Bottom)
```
← Previous  |  Page 1 of 16  |  Next →
```

---

## Component 5: Regulatory Reports Panel (Main View)

### Report Cards (Grid: 3 columns)

#### Report Card Example: "Monthly Transaction Report"
```
┌────────────────────────────────────────────┐
│ 📋 Monthly Transaction Report              │
│                                            │
│ Period: February 2026                      │
│ Generated: 2026-03-01 08:15 UTC            │
│ Status: ✅ Submitted to ESMA               │
│                                            │
│ Records: 45,892 transactions               │
│ Wash Trades Flagged: 127 (0.28%)          │
│                                            │
│ [Download PDF] [Download CSV] [View Report]│
└────────────────────────────────────────────┘
```

- **Card size:** 520×280px
- **Background:** #0F0F0F
- **Border:** 1px #1F1F1F
- **Icon:** 24×24px document icon
- **Title:** Inter Bold 16pt
- **Metadata:** Geist Mono 12pt, #999999
- **Status badge:** Green/yellow/red pill
- **Action buttons:** 140×36px, blue border, transparent background

### Report Types
1. **Monthly Transaction Report** (MiCA Article 89)
2. **Suspicious Activity Report (SAR)** (MiCA Article 83)
3. **Quarterly Uptime Report** (MiCA Article 76)
4. **Data Lineage Audit** (MiCA Article 81)

---

## Component 6: Alert Feed Panel (Main View)

### Alert List (Chronological, Newest First)

#### Alert Card Example: Wash Trading Detected
```
┌────────────────────────────────────────────────────────────────────┐
│ 🚨 HIGH SEVERITY                    2026-02-25 16:42:13 UTC        │
├────────────────────────────────────────────────────────────────────┤
│ Wash Trading Detected: Binance BTC-USDT                           │
│                                                                    │
│ Confidence: 87%  |  Trade IDs: 12345678, 12345679, 12345680       │
│ Detection Method: Buy/Sell Symmetry + Benford's Law               │
│                                                                    │
│ Recommended Action: FILE SAR                                       │
│                                                                    │
│ [View Details] [Generate SAR] [Mark as Reviewed] [False Positive]  │
└────────────────────────────────────────────────────────────────────┘
```

#### Alert Card Styling
- **Card size:** Full width (1680px), variable height
- **Background:** #0F0F0F
- **Border-left:** 4px colored bar (green/yellow/red for severity)
- **Header:** Severity badge (left) + Timestamp (right)
- **Title:** Inter Bold 16pt
- **Metadata:** Geist Mono 12pt, #999999
- **Action buttons:** 140×36px, blue border

### Alert Severity Color Coding
- **Critical:** Red (#FF4444) left border
- **High:** Orange (#FFB020) left border
- **Medium:** Yellow (#FFD700) left border
- **Low:** Green (#00FF41) left border

### Filter Bar (Top)
```
[Severity: All ▼] [Exchange: All ▼] [Alert Type: All ▼] [Date: Last 24h ▼] [Show Reviewed: ☐]
```

---

## Interactive States

### Button Hover
- **Default:** Transparent background, blue (#3B82F6) border
- **Hover:** Blue background, white text
- **Active:** Darker blue (#2563EB) background

### Table Row Hover
- **Default:** Alternating row backgrounds
- **Hover:** #1F1F1F background (slightly lighter)

### Dropdown Menu
- **Background:** #0F0F0F
- **Border:** 1px #1F1F1F
- **Item hover:** #1F1F1F background
- **Text:** Inter 12pt

---

## Responsive Behavior

### Minimum Width: 1280px
- **Header:** Stacks status indicator below logo (2 rows)
- **Left Nav:** Collapses to icons only (60px width)
- **Main Content:** Adjusts to 1220px width

### Large Screens (2560px+)
- **Main Content:** Max width 2400px, centered
- **Font sizes:** Scale up 10% (maintain readability)

---

## Accessibility

### WCAG 2.1 AA Compliance
- **Color contrast:** All text meets 4.5:1 ratio minimum
- **Keyboard navigation:** Tab through all interactive elements
- **Screen reader:** ARIA labels on all icons and status indicators
- **Focus indicators:** 2px blue outline on focused elements

---

## Animation & Transitions

### Subtle Animations Only
- **Nav item hover:** 150ms ease-in-out background transition
- **Button hover:** 150ms ease-in-out color transition
- **Status badge change:** 300ms fade (e.g., Operational → Degraded)
- **Live clock:** No animation, instant update

**No:**
- Spinners (use skeleton loaders)
- Flashy alerts (use subtle color change)
- Page transitions (instant load)

---

## Data Refresh Rates

| Panel | Refresh Rate | Method |
|-------|--------------|--------|
| Data Coverage | Every 10 seconds | WebSocket |
| Audit Log | On page load + manual refresh | REST API |
| Regulatory Reports | On page load | REST API |
| Alert Feed | Real-time | WebSocket (push) |
| Header Status | Every 5 seconds | WebSocket |

---

## Export & Print

### Export Buttons
- **Audit Log:** Export CSV (all pages, respects filters)
- **Regulatory Reports:** Download PDF or CSV
- **Alert Feed:** Export selected alerts as PDF

### Print View
- **CSS @media print:** Remove left nav, header simplified
- **Page breaks:** Insert between sections
- **Color:** Convert status colors to grayscale (green → dark gray, red → light gray)

---

## Figma File Structure

```
CCO Compliance Dashboard
├── 📄 01 - Header Bar
├── 📄 02 - Left Nav Bar
├── 📄 03 - Data Coverage Panel
├── 📄 04 - Audit Log Panel
├── 📄 05 - Regulatory Reports Panel
├── 📄 06 - Alert Feed Panel
└── 🎨 Components
    ├── Button (Primary)
    ├── Button (Secondary)
    ├── Status Badge (Green/Yellow/Red)
    ├── Data Table Row
    ├── Alert Card
    ├── Report Card
    └── Dropdown Menu
```

---

## Deliverable Checklist

- [ ] Full Figma file with 6 panels (Data Coverage, Audit Log, Regulatory Reports, Alert Feed, Settings, Documentation)
- [ ] Component library (buttons, badges, cards, table rows)
- [ ] Interactive prototype (clickable nav, expandable alerts)
- [ ] Figma link (view-only) for Sentinel review
- [ ] Design handoff document (specifications for frontend dev)

---

## Review Submission to Sentinel

**Required for approval:**
1. Figma link (view-only access)
2. Screenshots of all 4 main panels (PNG, 2x resolution)
3. Interactive prototype demo (Figma Prototype mode)
4. Design system documentation (typography scale, color palette, spacing grid)

**Submit to:** @Sentinel via Mission Control with tag `figma-review-required`

---

## Questions for Designer

1. **Logo asset:** Do we have AlgoHouse logo in SVG format? If not, use wordmark ("AlgoHouse" in Inter Bold).
2. **Icon library:** Heroicons or Lucide? (Recommend Lucide for consistency with code implementation)
3. **Timeline:** Expected delivery? Recommend 5-7 days for full dashboard + components.
4. **Revisions:** How many revision rounds before final approval?

---

## Notes for Frontend Implementation

- **Tech stack:** React + TailwindCSS (colors map directly to Tailwind config)
- **Data fetching:** REST API + WebSocket for real-time updates
- **Charts:** Use Chart.js or Recharts (if needed for future enhancements)
- **Tables:** TanStack Table (React Table v8) for sorting, filtering, pagination
- **Icons:** Lucide React (lucide.dev)

**Figma → Code handoff:** Use Figma Dev Mode for accurate spacing, typography, and component structure.

---

**Deliverable:** Figma link + PDF export of all panels  
**Target audience:** BaFin regulators, CCOs at EU crypto firms  
**Success metric:** Would a BaFin auditor trust this dashboard?
