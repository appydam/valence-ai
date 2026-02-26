# AlgoHouse Proposal Deck Specification (Figma)

## Design Direction
**Aesthetic:** Bloomberg Terminal meets modern SaaS  
**Brand colors:** #000000 (black), #00FF41 (terminal green), #FFFFFF (white)  
**Typography:** 
- Headlines: **Inter Bold** or **SF Mono** (monospace for technical credibility)
- Body: **Inter Regular**
- Data/numbers: **SF Mono Medium** (terminal aesthetic)

**Page size:** 1920×1080 (16:9, optimized for screen sharing)

---

## Slide 1: Cover

### Layout
```
┌─────────────────────────────────────────────┐
│                                             │
│         [AlgoHouse Logo]                    │
│                                             │
│    Professional-Grade Crypto Market Data    │
│         for Regulated Institutions          │
│                                             │
│                                             │
│    Proposal for {{Company Name}}            │
│    {{Date}}                                 │
│                                             │
│    Arpit Dhamija, Founder                   │
│    arpit@algohouse.com                      │
│                                             │
└─────────────────────────────────────────────┘
```

### Visual Elements
- Large AlgoHouse wordmark (center-top)
- Subtitle in lighter gray
- Company name in **terminal green** highlight
- Minimal, clean — Bloomberg aesthetic

---

## Slide 2: The Problem

### Headline
**"Crypto Market Data Isn't Ready for Institutional Standards"**

### Content (3-column layout)

#### Column 1: Traditional Finance (Bloomberg/Refinitiv)
✅ **Strengths:**
- Regulatory-grade audit trails
- Immutable timestamps
- Compliance reporting

❌ **Gaps:**
- Limited crypto coverage
- 10x pricing premium
- Slow to add new exchanges

#### Column 2: Crypto-Native Providers (Kaiko, CoinAPI)
✅ **Strengths:**
- Broad exchange coverage
- Affordable pricing
- Developer-friendly APIs

❌ **Gaps:**
- No compliance infrastructure
- Post-delivery timestamping
- No wash trading detection

#### Column 3: AlgoHouse
✅ **The Bridge:**
- **Regulatory-grade infrastructure**
- **Crypto-native coverage** (50+ exchanges)
- **Institutional pricing** (not Bloomberg, not CoinAPI)

### Visual
Graph showing "Coverage vs. Compliance" scatter plot:
- X-axis: Number of exchanges covered
- Y-axis: Compliance infrastructure maturity
- Bloomberg (high compliance, low coverage)
- Kaiko/CoinAPI (low compliance, high coverage)
- AlgoHouse (high compliance, high coverage) ← **sweet spot**

---

## Slide 3: Why AlgoHouse

### Headline
**"Built for Regulated Crypto Institutions"**

### Content (4-box grid)

#### Box 1: 🕒 Exchange-Native Timestamps
**The Problem:**  
Most providers timestamp trades when they receive the API response, not when the trade executed. This creates 100-500ms drift that breaks quant strategies.

**AlgoHouse:**  
Timestamps at exchange matching engine level. Cryptographically signed. Immutable audit trail.

**Impact:**  
Backtests match production. Regulatory audits pass.

---

#### Box 2: 🚨 Automated Wash Trading Detection
**The Problem:**  
MiCA and AML regulations require flagging market manipulation. Most data providers don't offer this.

**AlgoHouse:**  
Three-heuristic detector (Benford's Law, Buy/Sell Symmetry, Volume/Depth Ratio) runs continuously on all feeds.

**Impact:**  
Compliance reporting ready out-of-the-box.

---

#### Box 3: 📊 Data Lineage Documentation
**The Problem:**  
Auditors need to trace every data point from exchange → aggregation → delivery. Traditional data vendors can't prove this.

**AlgoHouse:**  
Full data lineage logs. Every tick includes: exchange ID, original timestamp, aggregation timestamp, delivery timestamp, checksum.

**Impact:**  
Pass MiCA/AML audits without custom engineering.

---

#### Box 4: ⚡ Sub-10ms Aggregation Latency
**The Problem:**  
High-frequency and stat-arb strategies need real-time data. Most aggregators introduce 50-200ms latency.

**AlgoHouse:**  
Co-located aggregation infrastructure. WebSocket feeds. Sub-10ms aggregation latency.

**Impact:**  
Deploy production strategies without latency penalties.

---

## Slide 4: Technical Architecture

### Headline
**"How AlgoHouse Ensures Data Integrity"**

### Diagram (left-to-right flow)

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Exchange    │───▶│  AlgoHouse   │───▶│  Validation  │───▶│   Delivery   │
│  Matching    │    │  Aggregator  │    │  Pipeline    │    │    (API)     │
│  Engine      │    │ (Co-located) │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
  ↓ Timestamp         ↓ <10ms latency    ↓ Wash trading      ↓ Immutable
  Signed log          WebSocket feed     detection           audit trail
```

### Key Features (bullet points below diagram)
- **Exchange-native timestamps:** Captured at trade execution, not API delivery
- **Cryptographic signing:** Every tick includes SHA-256 checksum for audit trail
- **Wash trading filter:** Flags suspicious trades in real-time (Benford + Symmetry heuristics)
- **Data lineage:** Full provenance log from exchange → customer
- **Compliance API:** Generate MiCA/AML reports on-demand

---

## Slide 5: Pricing Model

### Headline
**"Transparent, Usage-Based Pricing"**

### Base Pricing Table

| Tier | Monthly Volume | Price per 1M Ticks | Includes |
|------|----------------|-------------------|----------|
| **Starter** | Up to 100M ticks | $200 | 10 exchange pairs, REST API |
| **Professional** | 100M - 1B ticks | $150 | 50 exchange pairs, WebSocket, email support |
| **Enterprise** | 1B+ ticks | $100 | Unlimited pairs, compliance API, dedicated support |

**Typical customer costs:**
- Quant fund (stat-arb, 20 pairs): **~$3,000/month** (Professional tier)
- Index provider (50 pairs, historical data): **~$8,000/month** (Enterprise tier)
- Compliance buyer (10 pairs, audit trail): **~$2,500/month** (Professional tier)

---

### Pricing Modifiers

**Data Type Premium:**
- **Spot trades only:** Base price
- **+ Derivatives (futures/options):** +40%
- **+ Order book depth (L2):** +60%
- **+ Full order book (L3):** +120%

**Delivery Method:**
- **REST API (delayed, batch):** Base price
- **WebSocket (real-time streaming):** +30%
- **Direct S3/Snowflake integration:** +20%

**Historical Data Depth:**
- **30 days rolling:** Included
- **1 year historical:** +$5,000 one-time
- **3 years historical:** +$12,000 one-time
- **Full history (since 2017):** +$25,000 one-time

**Compliance Premium:**
- **MiCA compliance reporting API:** +60% (or $1,500/month flat fee)
- **Includes:** Automated audit trail generation, wash trading reports, data lineage documentation

**Startup Discount:**
- **AUM <$50M:** -40% off first 6 months
- **Proof required:** Recent bank statement or audited AUM report

---

### Example Calculation (for {{Company Name}})

**Customer Profile:**
- Quant fund, $200M AUM
- Strategy: Statistical arbitrage across 30 BTC/ETH/SOL pairs
- Data needs: Spot + derivatives, WebSocket delivery, 1-year historical backfill
- Compliance: MiCA reporting required

**Pricing Breakdown:**
```
Base tier (Professional, 500M ticks/month):   $75,000/year
+ Derivatives premium (+40%):                  $30,000/year
+ WebSocket delivery (+30%):                   $22,500/year
+ 1-year historical backfill:                   $5,000 one-time
+ MiCA compliance API (+60%):                  $45,000/year
─────────────────────────────────────────────────────────────
Subtotal:                                     $172,500/year
Startup discount (-40%, first 6 months):       -$34,500
─────────────────────────────────────────────────────────────
**First Year Total:                            $138,000**
**Ongoing (Year 2+):                           $172,500/year**
```

**Typical contract:** 1-year minimum, paid monthly ($11,500/month first 6 months, $14,375/month thereafter)

---

## Slide 6: Case Study (Anonymized)

### Headline
**"How a $500M Quant Fund Recovered 0.31 Sharpe Points"**

### Customer Profile
- **Segment:** Statistical arbitrage fund
- **AUM:** $500M
- **Strategy:** Cross-exchange BTC-USDT pairs (Binance, Coinbase, Kraken)
- **Problem:** Signals firing 340ms late due to timestamp drift from previous data provider

### Before AlgoHouse
❌ **Sharpe Ratio:** 1.22 (38 bps/day average return)  
❌ **Timestamp accuracy:** ±340ms drift  
❌ **Wash trading:** 12% of volume flagged as suspicious (manual review required)  
❌ **Backtest vs. production:** 15% performance gap (unexplained slippage)

### After AlgoHouse (30-day pilot)
✅ **Sharpe Ratio:** 1.53 (52 bps/day average return) — **+0.31 Sharpe**  
✅ **Timestamp accuracy:** <5ms drift  
✅ **Wash trading:** Automatically flagged in data feed (no manual review)  
✅ **Backtest vs. production:** <2% gap (timestamp precision resolved phantom slippage)

### Quote
> _"The difference wasn't just the timestamp accuracy — it was knowing that our backtests would actually match production. AlgoHouse gave us confidence that our signals were real, not artifacts of bad data."_  
> — Head of Quantitative Research (anonymized)

---

## Slide 7: Implementation Timeline

### Headline
**"Go Live in 2 Weeks"**

### Timeline (horizontal)

#### Week 1: Onboarding
- **Day 1-2:** Contract signed, API keys provisioned
- **Day 3-4:** Integration support (Python SDK, REST/WebSocket examples)
- **Day 5:** First data pull (test with 1 exchange pair)

#### Week 2: Pilot
- **Day 8-10:** Scale to full exchange/pair coverage
- **Day 11-12:** Backtest comparison (AlgoHouse vs. current provider)
- **Day 13-14:** Wash trading detection review, compliance API testing

#### Week 3+: Production
- **Day 15:** Go-live decision
- **Ongoing:** Dedicated support, monthly compliance reports, quarterly data quality reviews

### Support Included
- **Slack channel** (response time <4 hours)
- **Monthly compliance report** (auto-generated via API)
- **Quarterly business review** (data quality metrics, new exchange coverage)

---

## Slide 8: Next Steps

### Headline
**"Let's Get Started"**

### Content (3-step process)

#### Step 1: Technical Deep Dive (15 minutes)
Walk through your current data pipeline and identify integration points.

**Agenda:**
- Review your target exchanges and pairs
- Discuss data delivery format (REST, WebSocket, S3, Snowflake)
- Clarify compliance requirements (MiCA, AML, audit trail)

---

#### Step 2: Pilot Agreement (1 week)
Test AlgoHouse with a subset of your production data.

**What's included:**
- 30-day free pilot (10 exchange pairs)
- Full access to compliance API
- Integration support (Slack + email)

---

#### Step 3: Go-Live (2 weeks)
Scale to full production and sign annual contract.

**Contract terms:**
- 1-year minimum (paid monthly)
- Startup discount (if applicable)
- Quarterly business reviews included

---

### Call to Action

📅 **Schedule a technical deep dive:**  
[Book 15 minutes]({{CalendlyLink}})

📧 **Questions? Email me:**  
arpit@algohouse.com

🔗 **Explore our open-source benchmark:**  
[github.com/algohouse/benchmark](https://github.com/algohouse/benchmark)

---

## Design Implementation Notes (for Figma Designer)

### Color Palette
- **Primary:** #000000 (black backgrounds)
- **Accent:** #00FF41 (terminal green for highlights, CTAs)
- **Text:** #FFFFFF (white body text), #CCCCCC (gray secondary text)
- **Data visualization:** Use green gradients (#00FF41 → #008F11)

### Typography
- **Headlines:** Inter Bold, 48pt
- **Subheadlines:** Inter Semibold, 32pt
- **Body:** Inter Regular, 18pt
- **Data/Code:** SF Mono Medium, 16pt

### Layout Grid
- 12-column grid
- 80px margins (left/right)
- 60px margins (top/bottom)

### Icons
- Use **Feather Icons** or **Heroicons** (line style, not filled)
- Keep icon style minimal and technical

### Data Visualizations
- Use **Chart.js** aesthetic (clean, modern)
- Avoid 3D charts (keep flat, Bloomberg-style)
- Annotate key data points directly on charts

### Export Settings
- **Format:** PDF (for proposals) + Figma link (for live collaboration)
- **Resolution:** 2x (@2x for Retina displays)

---

## Figma File Structure

```
AlgoHouse Proposal Deck
├── 📄 Cover
├── 📄 The Problem
├── 📄 Why AlgoHouse
├── 📄 Technical Architecture
├── 📄 Pricing Model
├── 📄 Case Study
├── 📄 Implementation Timeline
├── 📄 Next Steps
└── 🎨 Components
    ├── Button (CTA)
    ├── Data Table
    ├── Icon Set
    └── Color Palette
```

---

## Customization Checklist (per prospect)

Before sending proposal, customize:
- [ ] Slide 1: Company name + date
- [ ] Slide 5: Pricing calculation (adjust for customer's data needs)
- [ ] Slide 6: Case study (choose most relevant segment)
- [ ] Slide 8: Calendly link + contact info

---

## Questions for Designer

1. **Do we have a finalized AlgoHouse logo?** If not, placeholder with wordmark in SF Mono.
2. **Preferred chart library for data visualizations?** Recommend Chart.js or D3.js style.
3. **Timeline for first draft?** Suggest 3-5 days for full deck.

---

**Designer deliverable:** Figma link + PDF export  
**Target audience:** CFOs, Heads of Quant Research, Compliance Officers  
**Presentation context:** Screen-shared Zoom calls (optimize for 1920×1080 @ 16:9)
