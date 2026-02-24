Complex Mission Board Tasks for Kaze (v2)
THE BIG ONE: "Build AlgoHouse's Revenue Engine From Zero — Benchmark, Pipeline, and Compliance Tier Across 6 Weeks"
One parent task for Kaze. Three interlocked phases. Every agent. Every integration. Real public data. Real deliverables AlgoHouse can use immediately.

Background and why this matters
AlgoHouse provides tick-level order book data from 50+ exchanges with proprietary quality scoring that exposes wash trading and fake volume. Their data is genuinely superior to most competitors. The problem: zero brand presence, zero community, zero inbound. Kaiko (main competitor) has 200+ enterprise clients, exchange rankings cited by regulators, and partnerships with CME, CBOE, and LSEG. AlgoHouse is invisible.

This task builds their entire revenue engine from scratch across three sequenced phases. Phase 1 earns credibility with the quant community through a rigorous public benchmark. Phase 2 turns that credibility into a qualified 50+ prospect pipeline with ready-to-send personalized outreach. Phase 3 unlocks a second revenue stream by repositioning the same data for compliance buyers at 5-10x the price.

Public data sources agents will use (no internal data required):

AlgoHouse /exchanges API — publicly accessible at docs.algohouse.ai/Public/APIDOC, returns quality scores per exchange
CCXT Python library — unified API for 100+ exchanges including Binance, Kraken, Coinbase; pull order book + trade data for free
Coin Metrics Community API — free, academic license, market + on-chain data
Dune Analytics — free SQL queries over DEX on-chain data
Academic papers: Cong et al. (Yale) on wash trading, ArXiv wash trading detection papers
Kaiko public exchange rankings — competitive baseline at kaiko.com/indices/exchange-ranking
r/algotrading (1.8M members), QuantConnect forum (464k members), Discord quant communities
LinkedIn, Crunchbase, company job postings — for prospect research
Why this is the hardest task in the board
AlgoHouse has genuinely superior product — tick-level order book data from 50+ exchanges, quality scoring that exposes wash trading, normalized feeds competitors can't match. Zero brand presence. Zero content. Zero community. Zero inbound. Meanwhile Kaiko (their main competitor) has 200+ enterprise clients, exchange rankings that get cited by regulators, and partnerships with CME, CBOE, and LSEG. AlgoHouse is invisible.

The task: build everything from scratch — proof, pipeline, and premium positioning — in three sequenced phases. Each phase unlocks the next. Every deliverable is real and immediately usable by the AlgoHouse team.

Public data sources agents will use (no internal data needed):

AlgoHouse /exchanges API — publicly accessible, returns quality scores per exchange
Binance, Coinbase, Kraken public APIs — free, real-time order book + trade data
Coin Metrics Community API — free, academic license, on-chain + market data
Dune Analytics — free SQL queries over DEX on-chain data, real manipulation patterns
Academic research — ArXiv, SSRN, CEPR wash trading papers with real datasets
r/algotrading, QuantConnect forums, Discord communities — for distribution intelligence
Kaiko public exchange rankings — competitive baseline
LinkedIn, Crunchbase, company websites — prospect research
PHASE 1 — "The Proof" (Week 1-2)
Goal: Build the artifact that earns the right to be heard — a public, honest, rigorous data quality benchmark that makes the quant community discover AlgoHouse through the work, not through marketing.

Scout (Phase 1 — 4 subtasks):
S1.1 — Exchange quality deep dive and competitive baseline
Call AlgoHouse's public /exchanges API endpoint (docs.algohouse.ai/Public/APIDOC) and extract all 50+ exchanges with their exchange_data_credibility, exchange_official_volume_score, and exchange_transport_quality_score fields. Simultaneously pull Kaiko's public exchange ranking (kaiko.com/indices/exchange-ranking) — Kaiko scores on 6 dimensions: Governance (30%), Security (20%), Liquidity (15%), Business (15%), Technology (10%), Data Quality (10%). Build a master comparison table in Google Sheets with one row per exchange and columns for: AlgoHouse credibility score, AlgoHouse volume score, Kaiko overall rank, Kaiko data quality sub-score, reported 24h volume (from CoinGecko), and a calculated "Volume vs Credibility Gap" metric (high volume + low credibility = likely wash trading). Sort descending by gap. The top 10 exchanges on this sorted list are the benchmark's primary targets. Also flag exchanges that appear in Kaiko's ranking with high scores but have low AlgoHouse credibility — these are the most interesting data points for the research narrative. Save the full sheet with named tabs: "Raw Data", "Gap Analysis", "Top 10 Targets", "Methodology Notes". Share link to sheet in Slack #algohouse-growth immediately upon completion so Forge can start the benchmark while Scout continues.

S1.2 — Quantify the cost of bad data with real numbers
Research and synthesize every published academic paper on how wash trading and fake volume corrupt quant backtests. Key sources: Cong et al. (Yale/NBER, 2022) "Crypto Wash Trading" showing 70% of unregulated exchange volume is fake; ArXiv paper 2102.07001 "Detecting and Quantifying Wash Trading on DEXs"; CEPR VoxEU column on centralised exchange wash trading; Chainalysis 2025 Market Manipulation Report showing $3.66M average wash trade per controller address. From the academic literature, extract the specific mechanism by which wash trading harms backtests: inflated volume causes overestimated liquidity → strategy assumes tighter spreads and lower slippage → live trading hits actual spreads that are 2-5x wider → strategy P&L is 30-60% lower than backtest predicted. Calculate concrete examples: (a) A strategy showing 18% annualized returns backtested on Exchange X (AlgoHouse credibility score: 2/10, likely 70% wash volume) would show only ~9% returns on clean data — the 9% difference is $900k/year on a $10M book, $9M/year on a $100M book. (b) A strategy executing 50 trades/day on an exchange with fake L2 depth assumes 0.1% slippage but experiences 0.4% actual slippage — that's $150k/year in unexpected costs on $10M AUM. Write all of this into a Notion doc titled "The Hidden Tax of Bad Crypto Data" — this is the narrative backbone Ghost uses for everything in Phase 1 and Phase 2. Include a "Methodology" section with citations so it can withstand scrutiny from a quant who fact-checks it.

S1.3 — Competitor content gap analysis
Systematically audit what every competitor publishes and find the gaps AlgoHouse can own. For each competitor — Kaiko, Coin Metrics, Tardis.dev, CoinAPI, Amberdata — document in Google Sheets: every blog post/research report published in the last 12 months (title, topic, estimated monthly search traffic if rankable), their r/algotrading post history (search "kaiko", "coin metrics", "tardis" on r/algotrading, note upvotes and comment counts), their GitHub repository star counts and recent activity, their QuantConnect integration presence. Identify the 5 content gaps: topics that quant traders demonstrably care about (evidenced by r/algotrading thread engagement) where no competitor has published the definitive piece. The benchmark notebook itself likely fills gap #1 ("comparative data quality across exchanges — with real numbers"). The second likely gap is "how to detect wash trading in Python using public data" — nobody has published a practical, reproducible tutorial. Document all 5 gaps with supporting evidence (threads showing demand, keyword volume where applicable) in Notion as "AlgoHouse Content Opportunity Map." This directly informs Ghost's content calendar for Phases 1 and 2.

S1.4 — Quant community distribution playbook
Map every channel where quant traders discover new data tools, with specific tactical guidance for each. Research and document in Notion as "Distribution Playbook":

r/algotrading (1.8M members): Subreddit rules require no direct promotion without disclosure; content that performs is practitioner posts sharing code/results. Best time to post: 7-9 AM ET weekdays. Posts about "I built X and here's what I found" consistently outperform "check out this product." The benchmark notebook post must be written in first person, lead with the finding (not the tool), include actual code snippets, and disclose any AlgoHouse affiliation only in comments if asked.
QuantConnect forum (464k members, requires 30% Bootcamp completion to post): Active discussion of data provider comparisons. Post should take the form of "AlgoHouse integration guide + data quality comparison" framed as community contribution, not promotion.
LuxAlgo Discord (180k members): Quant community with active #data-providers channel. Requires being a genuine community participant first — Ghost should draft 5 non-promotional technical responses to existing threads before posting anything about AlgoHouse.
QuantMinds International (November 2026, InterContinental O2 London): 150+ speakers, 400+ senior quants. Speaker submissions typically open 6 months before (May 2026). A talk titled "The Data Quality Problem in Crypto Backtesting: Evidence from 50+ Exchanges" using the benchmark findings would be highly relevant. Contact Informa Connect (organizer) at informaconnect.com for submission details.
Academic channels: ArXiv preprint of the research report (free, immediately citable), SSRN submission. These legitimize the methodology and drive inbound from researchers who then reference AlgoHouse. For each channel, document: rules, tone, format that works, what gets banned, optimal timing, expected reach. This is a tactical field guide, not generic advice.
Forge (Phase 1 — 5 subtasks):
F1.1 — The Benchmark Notebook
Create GitHub repository algohouse-data-quality-benchmark with MIT license. Build a Python Jupyter notebook benchmark.ipynb that any quant can clone and run in under 10 minutes. The notebook must:

Setup section: Install dependencies via pip install ccxt pandas scipy statsmodels plotly reportlab requests jupyter. Import all. Define constants: EXCHANGES_TO_TEST = ['binance', 'kraken', 'coinbase', 'bybit', 'kucoin', 'gate', 'okx', 'huobi', 'mexc', 'bitget'] — a representative mix of top-tier and suspected-wash-trading exchanges based on Scout's gap analysis.

Data collection section: Use the ccxt library to pull identical data from each exchange: 1,000 most recent trades for BTC/USDT, current L2 order book (20 levels), and 24h OHLCV. Simultaneously call AlgoHouse's public /exchanges API to pull their quality scores for the same exchanges. Simultaneously call Coin Metrics Community API (api.coinmetrics.io/v4/timeseries/market-trades) for the same exchange/pair. Handle API errors gracefully with try/except — if an exchange is unavailable, log it and continue.

Measurement section — 5 dimensions:

Tick completeness: Count trades per hour over the last 24h from each provider. Missing hours or suspiciously round numbers (exactly 1000 trades/hour) = data quality issue. Calculate: (actual ticks) / (expected ticks based on top-tier benchmark) = completeness score.
Order book depth accuracy: Sum the total USD liquidity within ±2% of mid-price from each provider's L2 snapshot. Compare: does reported volume correlate with actual depth? High volume + shallow book = wash trading signal.
Wash trading detection — Benford's Law test: Extract the leading digit distribution of all trade sizes. Apply chi-squared test against expected Benford's distribution (digit 1: 30.1%, digit 2: 17.6%, digit 3: 12.5%, etc.). Low chi-squared p-value (p < 0.05) means trade sizes follow natural distribution = legitimate. High chi-squared value means distribution is artificial = wash trading signal. This is the academically validated approach from Cong et al. (Yale).
Buy/sell symmetry test: Calculate the ratio of buy-initiated vs sell-initiated trades. Legitimate markets: natural asymmetry driven by sentiment, typically 45-55% either way. Wash trading: artificial 50/50 split (automated bots trade with themselves). Flag exchanges where buy/sell ratio is between 49-51%.
Normalization consistency: Check whether AlgoHouse timestamps match the raw exchange API timestamps within ±100ms. Measure the normalization delta per exchange. This directly demonstrates AlgoHouse's data cleaning process.
Scoring section: Combine the 5 dimensions into a composite "Data Trust Score" per exchange (0-100). Show AlgoHouse quality score alongside the calculated score. If they correlate strongly (r > 0.7), AlgoHouse's quality scoring system is validated. If not, that's an interesting finding too.

Visualization section: Use Plotly to generate: (a) a heatmap of all exchanges × all dimensions, color-coded red-to-green, (b) a scatter plot of AlgoHouse quality score vs. calculated manipulation probability, (c) a bar chart of tick completeness by exchange. All charts should be dark-mode by default (Bloomberg aesthetic). Export as HTML for embedding in the GitHub README.

Create Linear issues for each section of the notebook (L1.1 through L1.5) so build progress is tracked. Create Jira tickets for QA: F1.5 below.

F1.2 — Wash Trading Detector Script
Build a standalone Python script wash_detector.py in the same GitHub repo. This script ingests 30 days of public trade data from Binance (using CCXT's fetch_trades with pagination) for any exchange/pair the user specifies, and outputs a structured JSON report with:


{
  "exchange": "binance",
  "pair": "BTC/USDT",
  "period_days": 30,
  "total_trades_analyzed": 2847291,
  "benfords_law": {"chi_squared": 12.4, "p_value": 0.134, "result": "PASS"},
  "buy_sell_symmetry": {"buy_pct": 51.2, "sell_pct": 48.8, "result": "PASS"},
  "volume_depth_ratio": {"ratio": 4.2, "benchmark": 5.0, "result": "PASS"},
  "manipulation_probability": 0.12,
  "manipulation_label": "LOW",
  "algohouse_quality_score": 8.4,
  "score_correlation": "STRONG"
}
The script should be runnable as: python wash_detector.py --exchange binance --pair BTC/USDT --days 30 --output report.json. Include a --compare-algohouse flag that calls the AlgoHouse public API and adds the quality score to the output. Document every heuristic with the academic source in code comments. This script becomes the basis for the "Market Integrity Audit" that Solidus Labs could use as their sales motion — note this dual-use in the repo README.

Create Linear issue F1.2. Create Jira tickets for QA: run against 5 exchanges known to have manipulation history (identified by Scout), verify the detector catches them.

F1.3 — Interactive Exchange Quality Explorer (GitHub Pages)
Design in Figma first (dark mode, Bloomberg terminal aesthetic — dense data, high information density, monospaced numbers, a color palette of deep navy background #0a0f1e with amber #f59e0b accents for high-quality exchanges and red #ef4444 for low-quality). The design must include: a world map with exchange headquarters marked and color-coded by quality score, a sortable table of all 50+ exchanges with all quality dimensions, and a drill-down panel that shows the full breakdown for any selected exchange. Sentinel reviews the Figma design before any code is written.

Once approved, build as a single index.html file deployed to GitHub Pages. Fetch data from AlgoHouse's public API on load (or use a cached JSON file updated weekly via GitHub Actions). No build step required — pure HTML/CSS/JS with Chart.js for the visualizations. The interactive explorer is linked prominently in the benchmark notebook README as "See the live data." This is the "wow moment" that makes developers bookmark algohouse.ai.

Create Linear issue F1.3.

F1.4 — Developer Experience Audit
Spend time attempting to integrate AlgoHouse's API from scratch as if you were a new developer. Document every friction point: time to first successful API call (target: under 5 minutes — Tardis.dev achieves this), quality of error messages, whether a Python SDK exists, whether a JavaScript SDK exists, whether there's an interactive API explorer in the docs, whether rate limits are documented, whether there are quickstart examples in multiple languages. Compare against Tardis.dev (tardis.dev/api) — the Reddit community's favorite for developer experience — and CoinAPI (docs.coinapi.io) — known for comprehensive documentation. Score AlgoHouse on 10 DX dimensions (1-10 each). Create Linear issues for every gap scoring below 7: each issue includes the specific improvement, comparable implementation from a competitor, and estimated engineering effort (S/M/L). Save the full DX audit as a Notion doc titled "AlgoHouse Developer Experience Audit — Current State vs Best-in-Class." This becomes AlgoHouse's product roadmap input for their engineering team.

F1.5 — Benchmark QA and publication readiness
Create Jira tickets for systematic testing of the benchmark notebook before any public release:

Run notebook end-to-end against 10 exchange/asset combinations beyond BTC/Binance: ETH/USDT on Kraken, SOL/USDT on OKX, BTC/USD on Coinbase, and 6 more. Verify results are consistent and non-cherry-picked.
Verify all API calls work without authentication where claimed.
Test that a quant with no prior AlgoHouse knowledge can follow the README in under 10 minutes (have someone unfamiliar attempt it and document friction).
Verify the wash trading detector catches exchanges that academic papers have publicly documented as manipulation hotspots.
Verify all Plotly charts render correctly in both GitHub's notebook preview and local Jupyter.
Check that the GitHub Actions workflow (if added for weekly data refresh) runs successfully. Sentinel reviews the complete notebook for intellectual honesty before any public posting. The benchmark must show honest results even if some dimensions don't favor AlgoHouse.
Ghost (Phase 1 — 4 subtasks):
G1.1 — "The Hidden Tax of Bad Crypto Data" — Flagship Research Report
Using Scout's S1.2 research and Forge's benchmark results from F1.1, write AlgoHouse's first published research report. Save as a Notion document with full change history, formatted for PDF export.

Structure:

Executive Summary (200 words): Lead with the most shocking number from the benchmark. "We analyzed 50+ crypto exchanges and found that a momentum strategy backtested on the 10 most credibility-challenged exchanges overestimates returns by an average of X% annually — costing a $50M fund $Yk in false alpha." State clearly what this report contains and who it's for (quant researchers, crypto fund managers, algo traders).
The Problem: Garbage In, Garbage Out (400 words): How backtesting works, why data quality is the invisible variable, what happens when your backtest data includes wash trades. Include the slippage calculation from S1.2 — concrete dollar numbers.
Exchange Quality Analysis (600 words): Present the benchmark findings. Show the heatmap. Rank all 50+ exchanges. Explain what each quality dimension means. Note that AlgoHouse provides these quality scores as part of their data product (this is the only mention of AlgoHouse in the body — the report is the credibility, not the pitch).
Wash Trading Detection: The Methodology (400 words): Explain Benford's Law, buy/sell symmetry, and volume/depth analysis in accessible terms. Reference the academic papers. Show one concrete example of an exchange that fails all three tests.
What This Means for Quant Strategies (300 words): Practical implications — which strategy types are most exposed (high frequency, execution-sensitive), which are less exposed (long-only, low turnover). How to adjust backtest assumptions.
Conclusion and Recommendations (200 words): 5 specific recommendations for quant traders to improve data quality. Include "Use a provider with transparent quality scoring" as one recommendation — the only call to action.
Methodology (200 words): Full technical description, data sources, Python packages used, reproducibility instructions (link to GitHub repo). Invites scrutiny.
References: All academic papers cited in S1.2. APA format.
Sentinel reviews before any distribution. Every number must be sourced. No vague claims.

G1.2 — r/algotrading benchmark launch post
Write the exact post text for r/algotrading. This is the most important distribution piece — if it lands, everything else follows.

Rules based on research: 90/10 community/promotion rule, no direct product promotion, must stand on its own value, must disclose any affiliation, practitioner tone is essential.

Post format:

Title: "I got burned by bad exchange data and built a benchmark to measure it — here's what I found across 50+ exchanges" (specific, problem-first, promises concrete findings)
Body (750-1000 words): Start with a personal story of how bad data corrupted a backtest — specific numbers, relatable frustration. "I ran a mean reversion strategy on [Exchange X], backtest showed 14% annualized. Deployed $200k. After 3 months: 6% annualized. Spent a week debugging. Found that Exchange X has ~65% wash trading volume — my backtest was priced against fake liquidity." Then: "So I built a benchmark." Walk through the methodology briefly (Benford's Law, buy/sell symmetry). Share 2-3 key findings with actual numbers from Forge's output. Include a code snippet (the Benford's Law test is short enough to show inline). Link to the GitHub repo. Disclose at the bottom: "I work with AlgoHouse on this research — their quality scores informed the benchmark design." — disclose, don't hide, the quant community respects transparency.
Call to action: "The notebook is open source — run it against your preferred exchanges and post your findings in the comments."
Draft in Notion. Route through Sentinel for tone review — reject if it sounds like marketing, only pass if it sounds like a practitioner. Post instructions and timing guidance sent to AlgoHouse team via Slack.

G1.3 — QuantConnect forum posts and GitHub README
Write 3 QuantConnect community forum posts (save all in Notion, structured for easy copy-paste):

Post 1: "Data quality benchmark: what I found comparing AlgoHouse, Coin Metrics, and raw CCXT data on 10 exchanges" — summary of benchmark findings framed as a community contribution to the ongoing data provider discussion.
Post 2: "How to integrate AlgoHouse into a QuantConnect strategy — step by step" — practical tutorial, no benchmark framing, purely helpful.
Post 3: "Benford's Law for exchange data quality: a Python implementation" — educational post about the wash trading detection methodology, with code. Links to the GitHub repo.
Write the complete GitHub repo README (saved in Notion, then committed by Forge):

Problem statement: 3 sentences on why data quality matters for crypto backtesting.
What this repo contains: benchmark notebook, wash trading detector script, interactive explorer.
Quick start: 5 steps, under 2 minutes to first run.
Key findings: 3 bullet points with the most interesting numbers from the benchmark.
Methodology: link to the research report.
Contributing: how to add new exchanges, how to flag if results seem wrong.
License: MIT.
Acknowledgements: AlgoHouse (for quality score data), academic papers cited.
G1.4 — Internal handoff briefing to AlgoHouse team
Write a comprehensive Slack message formatted for sharing with AlgoHouse's leadership team. This is the document that turns the agents' work into something AlgoHouse can execute immediately.

Structure:

What we built: linked list of every artifact (GitHub repo, research report, interactive explorer, r/algotrading post draft).
Key benchmark findings: 5 bullet points with the most important numbers — what surprised us, what confirmed existing beliefs, what's most useful for sales.
How to use the r/algotrading post: exact timing recommendation (Tuesday or Wednesday, 7-9 AM ET), who should post it (ideally someone from AlgoHouse's team with a genuine quant background — not a marketing account), what to say in comments when people respond (answer questions honestly, don't pitch, let the work speak).
When people respond to the benchmark: response scripts for the 5 most likely comment types (skeptical quant, interested developer, competitor, potential customer asking about pricing, academic wanting to cite the methodology).
What comes next (Phase 2 preview): once the post lands and inbound starts, Phase 2 converts that attention into a qualified pipeline.
One ask: AlgoHouse team review the benchmark findings for accuracy before publication — we want to make sure the AlgoHouse quality scores are correctly interpreted.
Sentinel (Phase 1 QA):
Review 1 — Benchmark Notebook (F1.1):

Is the comparison fair across all providers, or are exchanges cherry-picked to favor AlgoHouse? If cherry-picking is detected, reject until the methodology is fixed. Credibility requires showing unflattering results too.
Is every measurement dimension clearly defined and reproducible? Another quant should be able to get the same results by running the notebook.
Are Plotly charts readable in dark mode? Do they convey information or just look impressive?
Does the README enable a first-time user to run the notebook in under 10 minutes? Sentinel times this personally. Score each dimension 1-10. Reject if any dimension scores below 7.
Review 2 — Research Report (G1.1):

Every number must be traceable to its source. Any unattributed stat gets flagged.
The methodology section must be specific enough that a PhD in finance could replicate the analysis.
The only mention of AlgoHouse should be as the quality score data source, not as a product being sold.
Does this read like a paper a quant at Citadel would find interesting, or like a marketing piece dressed up as research? Reject if the latter.
Review 3 — r/algotrading post (G1.2):

Read it as if you're a skeptical quant who has never heard of AlgoHouse. Does the post earn its own credibility before mentioning any product? Does the disclosure feel honest or like fine print?
Post it in a test subreddit or share with an external quant for a gut-check reaction. A quant who hasn't seen it should say "this is useful" not "this is a sponsored post."
Reject if any sentence sounds like marketing copy.
Review 4 — Figma Explorer Design (F1.3):

Does this look like a Bloomberg terminal (high information density, trusted) or a startup landing page (lots of whitespace, hero section, marketing tagline)?
Would a quant researcher at a hedge fund bookmark this or close it immediately?
Reject if it looks like "AI-generated design" — must have a strong, opinionated aesthetic.
Kaze (Phase 1 coordination):
K1.1 — Dependency sequencing in Google Calendar
The work has hard dependencies. Map them precisely: Scout S1.1 (exchange data) → Forge F1.1 (benchmark, needs the exchange list). Scout S1.2 (cost quantification) → Ghost G1.1 (research report, needs the numbers). Forge F1.1 results → Ghost G1.1 and G1.2 (need actual benchmark findings). Forge F1.3 Figma design → Sentinel review → Forge F1.3 build. Ghost G1.2 draft → Sentinel review → AlgoHouse team post.

Create calendar events in Google Calendar for each handoff: "Scout S1.1 complete → Forge F1.1 starts" (Day 2), "Forge F1.1 first results → Ghost G1.1 starts" (Day 5), "All Phase 1 Sentinel reviews complete → Benchmark published" (Day 12), "r/algotrading post live" (Day 13 — Tuesday 7 AM ET).

K1.2 — GitHub strategy decision
The benchmark's credibility depends on perceived independence. Options: (a) Publish under AlgoHouse's GitHub org — most transparent, ties the tool directly to AlgoHouse, but some quants will see it as marketing. (b) Publish as an independent repo by an individual contributor — more credible for organic discovery, disclose affiliation in README. Decision: option (b), with clear disclosure in the README acknowledgements and in the r/algotrading post comments. Post the decision and rationale to Slack #algohouse-growth. Create the repo under the agreed account.

K1.3 — Sentinel review gate enforcement
Every deliverable has a Sentinel review gate before leaving the building. Track all review statuses in Linear — create a "Phase 1 QA" milestone with one issue per deliverable. Issue state: Open = not submitted for review, In Review = with Sentinel, Done = passed, Rejected = returned with feedback. No deliverable progresses to distribution without Done status in Linear.

K1.4 — Phase 1 success criteria (tracked in Google Sheets)
Create a Google Sheets tab "Phase 1 Completion Checklist" with binary status (done/not done) for: GitHub repo published, interactive explorer live on GitHub Pages, research report in final draft saved in Notion, r/algotrading post draft Sentinel-approved, AlgoHouse team briefed via Slack, r/algotrading post live (with 50+ upvotes as success signal at 72h). Phase 2 begins only when all 6 are checked.

K1.5 — Daily standup posts in Slack
Post to Slack #algohouse-growth every day at 5 PM: what shipped today, what's in Sentinel review, what's blocked and why, what's next tomorrow. Keep it to 5 bullet points max. This is the internal accountability system.

Phase 1 integrations used: GitHub (F1.1, F1.2, F1.3, F1.5), Linear (F1.1-F1.5, K1.3), Jira (F1.5 QA tickets), Google Sheets (S1.1, K1.4), Notion (S1.2, S1.3, S1.4, G1.1, G1.2, G1.3, G1.4), Figma (F1.3 design), Slack (G1.4, K1.2, K1.5), Google Calendar (K1.1) — 8/12 + Figma

PHASE 2 — "The Pipeline" (Week 3-4)
Goal: Turn Phase 1 credibility into a qualified 50+ prospect pipeline across three distinct buyer segments, with personalized outreach ready to activate.

Scout (Phase 2 — 4 subtasks):
S2.1 — Quant trader prospect list (50 firms)
Build the quant trading buyer pipeline in HubSpot. Create a new pipeline called "AlgoHouse Quant Buyers" with stages: Identified → Researched → Outreach Drafted → Sent → Responded → Demo Scheduled → Proposal → Closed.

For each prospect, research and fill in HubSpot custom fields:

Company name, website, HQ location
Estimated AUM or fund size (from public databases, news, job postings)
Strategy type (HFT, statistical arbitrage, trend following, market making) — inferred from job postings on LinkedIn/Indeed mentioning "microsecond latency", "order book", "tick data"
Current data provider (inferred from: job postings mentioning specific APIs, QuantConnect strategy authors who blog about their stack, GitHub repos with data provider dependencies visible)
Data quality pain signal (has anyone from this firm posted on r/algotrading or QuantConnect about data quality? Search by domain in Reddit/forum history)
Primary contact name and title (Head of Quant Research, CTO, or equivalent) — sourced from LinkedIn
Lead score (calculate using the scoring model from F2.2 once built)
Target 50 firms. Prioritize firms that: (a) currently use free-tier or known-dirty data sources (CoinGecko API, CoinMarketCap free, raw exchange APIs without normalization), (b) run execution-sensitive strategies where data quality matters most, (c) have publicly expressed data quality pain on community forums. Sources: r/algotrading firms that post their results, QuantConnect leaderboard strategy authors, crypto quant fund directories, LinkedIn search "quant researcher crypto" filtered by firm size.

S2.2 — MiCA compliance buyer list (30 EU exchanges)
Build a second separate HubSpot pipeline: "AlgoHouse Compliance Buyers." MiCA Article 76 mandates real-time market surveillance for all EU/EEA crypto exchanges (CASPs) by July 1, 2026 — 4 months from today. Exchanges without a data provider for surveillance are at risk of fines.

Research methodology: Start with ESMA's public MiCA CASP registration list (esma.europa.eu). Add exchanges from the EU Blockchain Observatory database. Cross-reference against known surveillance data providers' client lists (Solidus Labs clients are public: Coinbase, FalconX, HashKey — EU-based firms NOT on their list are AlgoHouse compliance prospects). For each of 30 EU exchanges, document in HubSpot:

Exchange name, country, estimated daily trading volume
Current compliance tech stack (if publicly known — check job postings for "MiCA compliance", "trade surveillance", "market abuse detection")
MiCA registration status (live on ESMA list = regulated and actively needing compliance, pending = urgent)
Decision-maker: CCO title and name (LinkedIn search "[Exchange] Chief Compliance Officer")
MiCA deadline urgency score: exchanges with <6 months to deadline and no visible surveillance solution = highest priority
Estimated annual contract value: base on exchange volume (rough estimate: $1k-$5k/month for small exchanges, $5k-$25k/month for mid-tier, custom for large)
S2.3 — Index provider segment (high-ACV, long cycle)
Research the 10 most likely index provider opportunities and document in Google Sheets (this segment has longer cycles, so track separately from HubSpot pipelines). For each provider — S&P Global, MSCI, CBOE, Nasdaq Ventures, FTSE Russell, Bloomberg Indices, Solactive, MarketVector, CoinDesk Indices, Kaiko Indices (competitor but also potential partnership) — document:

Current crypto data vendor (S&P uses Lukka, CBOE uses Kaiko for reference rates — these are known)
Crypto products in development (press releases, job postings mentioning "crypto index methodology", regulatory filings)
Specific contact: Head of Index Methodology, VP Data Partnerships, or equivalent (LinkedIn)
Why AlgoHouse could win: Kaiko is the entrenched competitor at CBOE and CME — AlgoHouse could compete on price + quality for index providers that haven't yet committed to Kaiko
Estimated contract value: index data contracts typically $100k-$500k/year
This segment requires Kaze's personal outreach, not an automated email sequence. Flag the top 3 with the most open opportunity for Kaze.

S2.4 — Community pain intelligence
Research and document the 20 most compelling, specific expressions of data quality pain from r/algotrading, QuantConnect forums, and quant Discord communities. Save in Notion as "Prospect Pain Voice" — exact quotes (anonymized), the thread URL, upvote count, and the specific pain described. Examples of what to find:

"Binance order book data is clearly incomplete — my L2 reconstruction doesn't match what I see in live trading" (data accuracy pain)
"I've been burned twice by strategies that looked great in backtest but underperformed because CoinGecko data is lagged" (latency pain)
"Is there any provider that gives honest data on Korean exchange volumes? Everything I've seen looks manipulated" (wash trading pain)
These quotes become the raw material Ghost uses for personalized outreach. When Ghost writes to a prospect from Firm X and that prospect has posted exactly this kind of pain publicly, the email mirrors their own words back to them — the strongest possible opener.

Forge (Phase 2 — 4 subtasks):
F2.1 — HubSpot CRM infrastructure
Set up the full sales infrastructure in HubSpot:

Two pipelines (Quant Buyers, Compliance Buyers) with the stages defined in S2.1 and S2.2
Custom contact properties: Data Provider (Currently Using), Strategy Type, Compliance Deadline, Estimated ACV, Lead Score (number field), Community Pain Noted (yes/no), Phase 1 Benchmark Engaged (yes/no — did they star the GitHub repo or engage with the r/algotrading post?)
Custom deal properties: Segment (Quant/Compliance/Index), Discovery Source (r/algotrading/QuantConnect/LinkedIn/Inbound), Days to MiCA Deadline (for compliance pipeline)
Email sequences linked to deal stages: when a deal moves to "Outreach Drafted", the corresponding Gmail sequence is queued. When a deal moves to "Demo Scheduled", a Google Calendar invite template is created.
Automated task creation: when a deal enters "Responded" stage, create a task "Review response and prepare follow-up within 24h" assigned to Kaze.
Create Linear issues for each configuration component. Document the full setup in Notion as "HubSpot CRM Setup Guide" so AlgoHouse's team can administer it post-handoff.

F2.2 — Lead scoring model
Build the scoring model in Google Sheets tab "Lead Scoring" with:

Inputs (fill one row per prospect):

Company AUM estimate: <$10M=1, $10-100M=2, $100M-1B=3, >$1B=4
Strategy type: Long-only=1, Trend=2, Stat Arb=3, HFT/Market Making=4 (higher = more data-sensitive)
Current data provider: Bloomberg/Refinitiv=0, Kaiko/CoinMetrics=1, CoinAPI/Tardis=2, CoinGecko Pro=3, Free tier/raw exchange=4 (higher = bigger upgrade opportunity)
Community pain noted: No=0, Yes=2 (publicly expressed pain = warm lead)
Phase 1 engagement: No=0, Starred repo=1, Commented on post=2, DM'd=3
MiCA deadline (compliance pipeline only): >12 months=0, 6-12 months=1, 3-6 months=2, <3 months=3
Output column: =SUM(inputs) → composite score 0-20, normalized to 0-100.

Routing rules (documented below the model):

Score 80-100: Kaze personally drafts first email, sends within 48h
Score 60-79: Quant Trader Sequence Email 1 sent immediately
Score 40-59: Add to sequence, send in next weekly batch
Score <40: Monitor but don't actively outreach yet
Document the formula logic with comments. AlgoHouse should be able to tune the weights.

F2.3 — Email sequences (4 distinct sequences, Gmail drafts)
Build 4 sequences as Gmail draft threads, one draft per email in the sequence, labeled clearly. Create Jira tickets for QA: send each full sequence to a test email, verify formatting, check all links, verify personalization tokens ({first_name}, {company}, {exchange_they_use}) populate correctly.

Sequence 1 — Quant Trader (5 emails, send over 2 weeks):

Email 1 (Day 0): "Your {exchange_they_use} backtests might be lying to you." Subject line, not a greeting. Body: "We ran a data quality analysis on {exchange_they_use}. Its wash trading probability is X% based on Benford's Law analysis of 30 days of trades. Strategies backtested on this data overestimate liquid depth by ~Yx — meaning your backtest slippage assumption is likely 0.{Z}% too optimistic. [Link to benchmark notebook.] We built this because we ran into the same problem." No pitch. Just the finding.
Email 2 (Day 3): "Here's what {exchange_they_use}'s order book actually looks like." Attach the specific Plotly chart for that exchange from the benchmark. "This is the depth at ±2%. Notice [specific observation from the data]. Happy to walk through what this means for {strategy_type} strategies."
Email 3 (Day 7): "How other funds are solving this." Share one specific example (using public information) of how a firm switched to higher-quality data and what it did to their live performance. Soft CTA: "Worth 20 minutes to see if AlgoHouse's normalized feeds would change your backtest assumptions?"
Email 4 (Day 10): "The research report, if you want the full picture." Share the link to the research report PDF. "No ask — just thought it might be useful context."
Email 5 (Day 14): "Last note." Two sentences. "I know you're busy. If data quality ever becomes a priority, the benchmark is public and AlgoHouse is happy to discuss. Good luck with your strategies."
Sequence 2 — Compliance Buyer (3 emails, send over 10 days):

Email 1 (Day 0): "{Company}'s MiCA Article 76 deadline is {days_to_deadline} days away." Subject: that exact calculation. Body: "Article 76 requires {Company} to have real-time anomaly detection systems operational by July 1, 2026. The data that powers those systems — normalized order book depth, full trade feeds, cross-market correlation — is what AlgoHouse provides. We've mapped our API endpoints to each MiCA Article 76-92 requirement. Can I send you the mapping?"
Email 2 (Day 5): "The mapping, as promised." (Even if they didn't reply.) Attach Ghost's "AlgoHouse for MiCA Compliance" one-pager PDF. "The bottom of page 2 shows specifically which endpoints map to Article 91 (order book for spoofing detection) and Article 92 (trade feeds for wash trading detection). Happy to schedule 30 minutes with your compliance team to walk through the technical setup."
Email 3 (Day 10): "One exchange's MiCA compliance timeline." Share a realistic anonymized timeline of how an exchange could go from zero to MiCA-compliant using AlgoHouse data (even if hypothetical, make it specific: "Week 1: API authentication + data feed setup. Week 2: Integrate with surveillance vendor. Week 3-4: Test against regulator sample questions. Week 5: Live."). "If this timeline is relevant for {Company}, we should talk this week."
Sequence 3 — Index Provider (2 emails + calendar invite template):

Email 1 (Day 0): Long-form, peer-level. From Kaze, not an automated sequence. "I've been following {Provider}'s expansion into {specific crypto index product mentioned in recent press}. The index methodology challenge for crypto is different from equities — the data quality variance between exchanges is massive (our benchmark found a 6x range in order book depth accuracy across top 20 exchanges), which means reference rate construction is genuinely hard to do correctly. We've been thinking about this problem. Would it be useful to compare notes?" No product mention in email 1.
Email 2 (Day 7 if no response): "Attached: the benchmark." Share the full research report. "The exchange quality analysis on pages 3-4 is directly relevant to reference rate construction methodology. Happy to discuss if useful."
Calendar invite template (for when they respond): 45-minute "Index Methodology Discussion" — agenda pre-populated with 3 questions about their methodology challenges and 2 AlgoHouse data points relevant to each.
Sequence 4 — Re-engagement (3 emails, for benchmark visitors who didn't respond to initial outreach):

Email 1: "You starred the AlgoHouse benchmark." (For GitHub stars.) "Curious what you were testing it against — did the results match what you expected for your exchanges?"
Email 2 (Day 5): One specific insight from the benchmark that's relevant to their likely strategy type (inferred from their GitHub profile or other public activity).
Email 3 (Day 12): "Last note — the benchmark is always open source. If you want to add exchanges or want the underlying data, happy to help."
F2.4 — Proposal template and pricing model
Design in Figma: an enterprise-grade AlgoHouse proposal deck, dark mode, Bloomberg aesthetic. Slides:

Cover: "{Company} × AlgoHouse" — placeholder for prospect logo
The Problem: "[Their specific data quality situation]" — data to fill in from Scout's research
The Cost: "Based on your strategy profile, bad data is costing you approximately $X/year in false alpha" — uses the cost model from S1.2
The Solution: AlgoHouse specific to their use case — quant version shows tick completeness and order book depth charts; compliance version shows MiCA mapping table
Technical Architecture: "How AlgoHouse plugs into your stack" — generic diagram customizable per prospect
Proof: Benchmark findings for their specific exchanges — link to interactive explorer
Pricing: [Populated from Google Sheets pricing model]
Next Step: "30-minute technical call with our data team"
Build the underlying Google Sheets pricing model:

Inputs: number of exchanges (1-50+), data types selected (trades/order book/derivatives — each adds 20%), delivery method (REST API=base, WebSocket streaming=+30%, S3 batch=+10%), historical depth in years (1yr=base, 3yr=+25%, 7yr=+50%), SLA tier (99.5%=base, 99.9%=+20%)
Output: monthly price (base: $500/month for 5 exchanges, REST, 1yr history, 99.5% SLA) and annual price with 15% discount
Startup discount: companies <$10M AUM get 40% off
Compliance premium: compliance-packaged tier adds 60% to base price (reflects non-discretionary compliance budget and higher support requirements)
Ghost (Phase 2 — 4 subtasks):
G2.1 — 10 individually personalized first emails
Write 10 individually tailored Email 1s for the top 10 prospects from Scout's S2.1 list (ranked by lead score from F2.2). Each email must reference something specific that could only be known by someone who actually looked at that firm:

If they have a public GitHub repo: "I looked at your {repo_name} repo — you're using {data_provider} for {specific_use}. The benchmark we published last week found that {data_provider} has a {X}% wash trading signal on {their_primary_exchange}. That's {Y}x higher than AlgoHouse's normalized feed for the same pair."
If they posted on r/algotrading: "You wrote last month that {exact quote about data quality pain}. We built a benchmark specifically to measure this — the results for your exchanges are in section 3."
If they gave a conference talk: "I watched your {conference} talk on {topic}. At 14:32 you mention the {data_challenge}. That's exactly what the AlgoHouse quality scoring system addresses — want to see the numbers for the exchanges you mentioned?"
Save all 10 as Gmail drafts with subject line: "#{rank} — {Company} — personalized v1" so they're easy to find. Sentinel reviews all 10 before any send authorization — rejects any that read as template + name swap.

G2.2 — MiCA compliance one-pager
Write "AlgoHouse for MiCA Compliance: Your Data Infrastructure for Article 76-92" as a Notion document formatted for PDF export (2 pages maximum when exported).

Page 1:

Header: "MiCA Market Abuse Requirements — What You Need, What We Provide"
Table: 5 rows (one per key MiCA article requirement), 3 columns: "MiCA Requirement", "What This Means Technically", "AlgoHouse Endpoint That Provides It"
Article 90 (layering): Cross-market order book correlation → /orderbook/depth with cross-exchange parameter
Article 91 (spoofing): Order placement vs execution rate → /orderbook/snapshots with cancellation tracking
Article 92 (wash trading): Trade feed with counterparty signals → /trades/full with volume credibility score
Article 76 (general surveillance): Real-time normalized feeds → WebSocket streaming endpoint
Reporting requirement: Machine-readable JSON for NCAs → /export/regulatory endpoint (note if this needs to be built)
Fine table: "Non-compliance cost" — MiCA fines up to 15% of annual turnover OR €15M, whichever is higher. For a €10M revenue exchange: €1.5M maximum fine. "AlgoHouse Compliance Starter: €X,000/year."
Page 2:

"Timeline to MiCA Compliance Using AlgoHouse Data": Week 1 (API onboarding), Week 2 (surveillance system integration), Week 3-4 (testing), Week 5 (live)
"What We Guarantee": uptime SLA, data freshness SLA, support response time, audit trail coverage
"Next Step": Contact information and "Book 30 minutes with our compliance data team"
G2.3 — LinkedIn content series (5 posts, 5 weeks)
Write 5 LinkedIn posts in Notion, each ready to copy-paste for publishing. Each post: 150-300 words, specific numbers, no vague claims, clear CTA.

Post 1 (Week 3, benchmark launch): "We published an open-source benchmark comparing data quality across 50+ crypto exchanges. Here's the most surprising finding: [most interesting stat from F1.1]. [Link to GitHub repo]"
Post 2 (Week 4, cost of bad data): "A momentum strategy showed 18% annualized returns in backtest. Live: 7%. We calculated why. [Specific slippage math from S1.2]. If you backtest on exchange data with >40% wash trading volume, your alpha estimate is probably overstated by X%. Here's how to check: [link to wash detector script]"
Post 3 (Week 5, exchange ranking): "We scored all 50+ exchanges on data quality. The range is shocking. Best: [exchange name], score 9.2/10. Worst: [exchange name], score 1.8/10. The difference in backtest accuracy between using data from these two exchanges: [concrete number]. Full ranking: [link to interactive explorer]"
Post 4 (Week 6, MiCA): "EU exchanges have 4 months to MiCA Article 76 compliance. Here's exactly what the regulation requires technically — not legally, technically. [Specific endpoint/data format requirements]. Most exchanges we've spoken to don't yet have the normalized trade feed required for Article 92 wash trading detection."
Post 5 (Week 7, practitioner spotlight): "We asked quant traders what bad exchange data actually cost them. Here's what they said: [3-4 specific quotes from community research — anonymized from S2.4]. The pattern: backtest assumes X slippage, live experiences Y. [Link to research report]"
G2.4 — Zendesk knowledge base (8 articles)
Write 8 support articles in Notion, structured for import to Zendesk. These are the first thing people find when they Google "AlgoHouse [problem]" — they reduce support load and increase trust.

"Getting Started: Make Your First AlgoHouse API Call in 5 Minutes" — step-by-step with Python code using requests library, covers authentication, first endpoint call, parsing the response
"Data Format Reference: What Every Field Means" — complete field dictionary for trade and order book responses, with examples
"Exchange Quality Scores Explained: How to Read Them and What They Mean for Your Backtest" — methodology, what each score dimension measures, how to use scores in data selection
"Using AlgoHouse Order Book Data for Backtesting: A Practical Guide" — how to reconstruct order book snapshots, how to calculate realistic slippage, how to validate backtest assumptions against AlgoHouse quality scores
"Understanding Wash Trading Detection: Methodology and How AlgoHouse's Quality Scores Expose It" — the Benford's Law methodology, how AlgoHouse's data differs from raw exchange data, academic references
"MiCA Compliance Data Guide: Which AlgoHouse Endpoints Map to Which Articles" — practical guide for compliance teams, identical to the one-pager but in KB format
"Pricing FAQ: How AlgoHouse Pricing Works" — exchange count tiers, data type options, delivery method pricing, startup discounts, compliance tier premium
"Request Custom Exchange Coverage: How It Works and What It Costs" — process for requesting exchanges not currently covered, typical timeline, pricing model
Sentinel (Phase 2 QA):
Review 1 — 10 personalized emails (G2.1):
For each of the 10 emails: read it as the recipient. Does the opening sentence reference something that could only be known by someone who actually researched this firm? If the answer is "this could be sent to anyone with a different name," reject immediately. True personalization means: specific repo name, specific post quote, specific conference talk timestamp, specific exchange they use. Reject any email that passes the "template + name swap" test — i.e., if swapping the name would make it work for a completely different person, it's not personalized.

Review 2 — MiCA one-pager (G2.2):
Check every MiCA article citation against the actual regulation text (available at eur-lex.europa.eu). Is Article 91 actually about spoofing? Is Article 92 actually about wash trading? A CCO who receives this will have read MiCA. One wrong citation = credibility destroyed. Also: do the AlgoHouse endpoint names cited actually exist in the API? If any endpoint is aspirational (doesn't exist yet), the one-pager must say "coming Q3 2026" not present tense.

Review 3 — Proposal Figma deck (F2.4):
Would a Head of Quant Research at a $500M crypto fund find this credible enough to share internally? Does the "cost of bad data" slide use math that a quant could verify, or is it hand-wavy? Does the pricing slide show a clear value proposition (cost of bad data >> cost of AlgoHouse)? Reject if the deck looks like a SaaS startup pitch rather than an institutional data services proposal.

Review 4 — HubSpot pipeline setup (F2.1) and lead scoring (F2.2):
Are the pipeline stage names meaningful and specific to AlgoHouse's sales motion, or are they generic defaults ("Qualified", "Proposal")? Does the lead scoring model weight the right variables — does a firm using free CoinGecko data score higher than a firm already using Kaiko? The logic must be documented and defensible.

Kaze (Phase 2 coordination):
K2.1 — Segment prioritization decision
After Scout completes S2.1, S2.2, and S2.3, review the three segments and make the activation order decision: which segment gets outreach first? Assessment criteria: quant traders (faster sales cycle, 30-60 days, $6k-$60k ACV), compliance buyers (non-discretionary budget, harder deadline — MiCA July 2026 — $12k-$300k ACV, but 60-90 day cycle), index providers (massive ACV $100k-$500k but 6-12 month cycles). Recommended order: compliance buyers first (deadline urgency is a forcing function), quant traders second (fastest cycle), index providers third (Kaze manages personally, parallel to the others). Document the decision and rationale in Notion, post to Slack #algohouse-growth.

K2.2 — Senior index provider outreach (Gmail + Google Calendar)
For the top 3 index provider opportunities from S2.3, Kaze personally drafts and sends the outreach — not the automated Sequence 3, but a genuinely peer-level approach. Draft each email in Gmail as a personal message. Schedule follow-up reminders in Google Calendar: 7-day follow-up if no response, 14-day final note. These conversations may take months — the goal is to start the relationship, not close a deal.

K2.3 — Weekly sales rhythm in Google Calendar
Establish the recurring calendar structure:

Monday 9 AM: Pipeline review — which deals moved stages in HubSpot, which responses came in, what follow-up actions are needed
Wednesday 10 AM: Outreach batch — send that week's sequences from Gmail, add any new high-score prospects from Scout's ongoing research
Friday 3 PM: Sentinel QA review — any personalized emails written that week, any compliance one-pager updates, any new benchmark content
Block MiCA enforcement deadline (July 1, 2026) as a calendar event with reminders at 90/60/30/14/7 days — the compliance outreach urgency increases as this deadline approaches.

K2.4 — Intercom inbound intake setup
Configure Intercom for the inbound flow that Phase 1's r/algotrading post will generate: when someone signs up for AlgoHouse via the website, trigger an immediate Intercom welcome message: "Welcome to AlgoHouse. Quick question: are you primarily interested in data for (a) backtesting and live trading, (b) MiCA compliance and surveillance, or (c) index construction?" Based on answer: route to the appropriate HubSpot pipeline (Quant Buyers, Compliance Buyers, or Index Providers), tag the contact with the segment, queue the appropriate Gmail sequence. Document the setup in Notion as "AlgoHouse Inbound Routing Guide."

K2.5 — Deal tracking dashboard (Google Sheets)
Build a Google Sheets dashboard tab "Phase 2 Pipeline" updated weekly with: total prospects by segment, outreach sent (total and this week), response rate by segment, demos scheduled, proposals sent, pipeline value ($) by stage. This is what Kaze presents to the AlgoHouse team in a weekly 30-minute status call. Post the dashboard link to Slack #algohouse-growth every Friday with 3 bullet points: best news of the week, biggest blocker, next week's priority.

Phase 2 integrations used: HubSpot (S2.1, S2.2, F2.1, K2.1, K2.4), Gmail (F2.3, G2.1, K2.2), Google Sheets (S2.3, F2.2, K2.5), Linear (F2.1), Jira (F2.3 QA), Notion (S2.4, G2.2, G2.3, G2.4, F2.1, K2.1, K2.4), Figma (F2.4), Slack (K2.1, K2.5), Google Calendar (K2.3), Zendesk (G2.4), Intercom (K2.4) — 11/12 + Figma

PHASE 3 — "The Premium Tier" (Week 5-6)
Goal: Unlock the compliance revenue stream — same data product, repositioned for a non-discretionary compliance budget at 5-10x pricing premium, with product spec, Stripe plans, and first pilot customer motion ready to activate.

Scout (Phase 3 — 3 subtasks):
S3.1 — Compliance-grade data gap analysis (honest scoping)
Research what "compliance-grade" actually requires beyond what AlgoHouse currently provides. This is honest product gap analysis — the goal is not to sell what doesn't exist, but to know what exists today vs. what needs to be roadmapped. Research each requirement:

SOC 2 Type II: Required by most financial institution compliance teams before signing a data contract. AlgoHouse likely doesn't have this yet. Research: (a) which competitors have it (Kaiko: yes, CoinAPI: unclear, Coin Metrics: yes), (b) typical timeline and cost to achieve (6-12 months, $30-80k with a specialized audit firm like A-LIGN or Vanta), (c) whether EU exchanges require it for MiCA compliance or just internal preference. Document what AlgoHouse can say truthfully about security today (likely: ISO 27001-adjacent practices, AWS infrastructure with standard controls) vs. what they'd need to claim SOC 2.
7-year data retention: Required in most EU jurisdictions for financial records. AlgoHouse's current retention policy is unknown — document it accurately. If they currently retain 2 years, the gap is 5 years.
Audit trail API: Every data pull by every user must be logged with timestamp, user ID, endpoint called, and data range requested — for regulatory inspection. Does AlgoHouse's API currently log this? Can users access their own audit log? If not, this is a product feature, not just an SLA claim.
EU data residency: Some EU NCAs (particularly BaFin-regulated firms in Germany) require data to be hosted in EU data centers. AlgoHouse's infrastructure location is likely AWS us-east or similar — EU residency requires a separate EU deployment.
Data lineage documentation: Provenance of every tick — where did it come from, when was it normalized, what transformations were applied. This is a documentation requirement, not necessarily a product feature.
Organize findings in Notion as "AlgoHouse Compliance Readiness: What We Have vs What We Need vs What We Can Roadmap." Three columns. This document has two audiences: (a) AlgoHouse's product team (what to build), (b) Kaze's compliance sales pitch (what we can honestly sell today, what we roadmap for Q3/Q4).

S3.2 — Compliance pricing benchmark
Research and model what AlgoHouse should charge for a compliance tier. Data points to find:

Kaiko enterprise range: €25k-€55k/year average $28.5k (from public reporting)
Bloomberg crypto data: ~$24k/year (professional terminal component)
Coin Metrics institutional: custom pricing, estimated $30-100k/year based on data type
Refinitiv/LSEG crypto data: $20-50k/year comparable
Solidus HALO (surveillance software, not data): $100k-$500k/year — this is the layer above AlgoHouse that uses AlgoHouse-type data; if AlgoHouse bundles data + compliance packaging, they compete at a higher price point
Build a pricing model in Google Sheets tab "Compliance Pricing Model": three scenarios. Conservative (match Kaiko's lowest tier: €15k/year for Compliance Starter, €35k/year for Compliance Professional, custom for Enterprise). Moderate (25% premium over trading tier: $12k-$60k/year). Aggressive (60% premium, based on compliance budgets vs trading budgets): $20k-$80k/year. Recommend the Conservative scenario for first deals — easier to discount up than to lose a deal on price. Note that MiCA fines can be €15M or 15% of annual turnover — a €20k/year compliance data contract is trivial insurance against that exposure.

S3.3 — First pilot customer motion
From the Phase 2 HubSpot compliance pipeline, identify the 5 EU exchanges most likely to move quickly to a pilot. For each, assess: urgency (days to MiCA deadline), current compliance stack (blank slate = faster to close, existing vendor = needs displacement), decision-maker accessibility (solo CCO at small exchange = faster than committee at large exchange), and whether any contact has already responded to Phase 2 outreach. Write in Notion as "Compliance Pilot Playbook":

Standard pilot offer: "30-day access to AlgoHouse compliance data feeds for [their specific exchanges], mapped to your MiCA requirements, with onboarding support — at no cost. We configure the data delivery to your surveillance system. At day 30, if it works, we discuss a 12-month contract. If it doesn't, no obligation."
Pilot success criteria (defined upfront): latency < 500ms for real-time feeds, 99.9% tick completeness, data format accepted by their surveillance system without manual transformation
Pilot pricing: $0 for 30 days, converts to Compliance Starter ($15k/year) or Compliance Professional ($35k/year) depending on exchange count
Which 2 of the 5 to activate first: the two with the shortest days-to-deadline AND a solo/accessible CCO decision-maker. Flag for Kaze.
Forge (Phase 3 — 4 subtasks):
F3.1 — Compliance data package technical spec (GitHub)
Build a comprehensive technical specification document as a GitHub repository algohouse-compliance-edition-spec. This is what AlgoHouse's engineering team implements and what compliance prospects receive during due diligence.

Document structure:

README.md: Overview of AlgoHouse Compliance Edition, who it's for, what MiCA articles it addresses
mia-mapping.md: Full table — every MiCA Article 76-92 market abuse provision, the specific data requirement it creates, and the AlgoHouse API endpoint that provides it. Be precise: "Article 91 prohibits spoofing and requires exchanges to detect orders placed with intent to cancel before execution. Detection requires: (a) order placement events with timestamps, (b) cancellation events with timestamps and order IDs, (c) order book snapshots showing order's market impact. AlgoHouse provides: POST /orderbook/snapshots returns L2 at 100ms intervals; GET /trades/full includes order ID linking. Gap: cancellation event feed not currently available — roadmap Q3 2026." Honest gap notation is critical — a compliance team will ask and discover gaps anyway.
data-formats.md: JSON schema for every compliance endpoint response. Field names, data types, example values.
integration-guide.md: How to connect AlgoHouse to a surveillance system. Step-by-step for Solidus HALO (the most likely downstream system given the mentor relationship): which AlgoHouse endpoints feed which HALO detection typologies, data format translation needed, latency requirements for real-time detection.
sla.md: Uptime guarantees (99.9% for compliance tier vs 99.5% for trading tier), data freshness SLA (max latency from exchange event to AlgoHouse delivery), retention policy (document current honestly), support response time (1 hour for compliance tier vs next business day for trading).
Create Linear issues for each gap identified in the MiCA mapping — "Gap: cancellation event feed" becomes a Linear engineering issue with estimated effort.

F3.2 — Compliance CCO dashboard design (Figma)
Design the CCO-facing compliance dashboard. This is completely different from the quant trader's view — it must look trustworthy to a regulator, not impressive to a developer.

Design brief: Dark mode, Bloomberg/Refinitiv aesthetic. High information density. No decorative elements. Every element is a data point or a status indicator.

Layout (push to Figma as a full wireframe with realistic data):

Header bar: AlgoHouse logo, "[Company Name] Compliance Portal", current date/time in UTC (compliance is UTC-referenced), "All Systems Operational" or current incident status
Left sidebar: Navigation — Data Coverage, Audit Log, Regulatory Reports, Alert Feed, Settings
Data Coverage panel (default view): Grid of all covered exchanges, each showing: exchange name, status indicator (green = live, yellow = degraded, red = offline), last tick timestamp, tick frequency (ticks/minute), data freshness (seconds since last update). Color coding: green < 1s, yellow 1-5s, red > 5s.
Audit Log panel: Paginated table of every API call made by any user at the organization. Columns: timestamp (UTC), user, endpoint called, exchange filter, data range requested, response time (ms), data records returned. Exportable as CSV for regulatory submission.
Regulatory Reports panel: Status of monthly MiCA transaction reports. Table: report month, submission date, submission status (submitted/pending/overdue), NCA jurisdiction, file format (TOTAL/ONCHAIN), download link.
Alert Feed panel: Anomalies detected in incoming data feeds. Each alert: timestamp, exchange, anomaly type (volume spike, tick gap > 5 seconds, Benford's Law failure for last hour), severity (high/medium/low), status (investigating/resolved).
Typography: Geist Mono for all data values, Inter for labels. Colors: #0a0f1e background, #1e293b panel backgrounds, #94a3b8 secondary text, #f8fafc primary text, #22c55e green, #f59e0b amber, #ef4444 red.

Sentinel reviews against the product designer rubric (score 7+/10 on: information hierarchy, data trust aesthetics, would-a-regulator-trust-this, completeness of status indicators).

F3.3 — Stripe compliance tier configuration
Create the three compliance tier products in Stripe. Before creation, confirm with Kaze that AlgoHouse has authorized setting up paid plans — this is a business decision.

Products to create:

AlgoHouse Compliance Starter: $1,250/month ($15,000/year). Description: "5 exchange coverage, REST API, 12-month data retention, 99.9% uptime SLA, business hours support, MiCA Article mapping guide included." Billing: monthly or annual (annual = 2 months free). Set up as a Stripe Subscription with monthly billing cycle.
AlgoHouse Compliance Professional: $2,917/month ($35,000/year). Description: "All 50+ exchanges, WebSocket streaming + REST, 7-year data retention, 99.9% uptime SLA, 1-hour support response, Audit Log API, dedicated onboarding call." Billing: quarterly or annual.
AlgoHouse Compliance Enterprise: Custom. Set up as a custom Stripe invoice flow (not a subscription product) since pricing is bespoke.
Also create: a 30-day free trial configuration (no credit card required) for the Pilot Starter — this is the standard pilot offer from S3.3. Configure Stripe webhooks for: customer.subscription.created (triggers welcome email via Gmail), customer.subscription.trial_will_end (7 days before trial ends, triggers conversion email), invoice.payment_succeeded (triggers receipt and onboarding confirmation).

Create Jira tickets for QA: test checkout flow for each plan, verify trial period activates correctly, verify webhook fires and email is triggered, test upgrade from Starter to Professional.

F3.4 — Pilot customer technical onboarding guide (GitHub)
Build compliance-onboarding-guide.md in the algohouse-compliance-edition-spec repo. This is what AlgoHouse sends to every pilot customer on Day 1 — it must be self-sufficient enough that a compliance engineer can get to production without a support call.

Structure:

Day 1 checklist: Generate API key in AlgoHouse dashboard, verify access with test call, confirm exchange coverage for your required markets
Step 1: Authentication: Code example in Python (requests library) and curl. Shows how to pass API key in header, how to handle 401 errors, how to rotate keys.
Step 2: Surveillance data feeds: Which endpoints to call for each MiCA requirement. Python code example for a polling architecture (suitable for smaller exchanges) and a streaming architecture (WebSocket, for real-time surveillance). Includes error handling, reconnection logic, and rate limit management.
Step 3: Solidus HALO integration (if applicable): How to format AlgoHouse data for HALO's ingest API. Field mapping table: AlgoHouse field name → HALO field name → transformation required. This is the most likely integration path for EU exchanges using Solidus for surveillance.
Step 4: Audit trail setup: How to enable audit logging for your organization, how to export the audit log as CSV for regulatory submission, what format NCAs expect.
Step 5: Validation checklist: Before going live — verify tick completeness is >99.9%, verify data latency is <500ms for your required exchanges, verify audit log captures all API calls, verify format of data matches your surveillance system's schema.
Troubleshooting: 10 most common issues and solutions. "Authentication failing" → check API key header format. "Missing ticks for exchange X" → contact support with the specific exchange and time range.
Create Linear issues for any gaps discovered during guide writing — places where the current API makes the compliance workflow harder than it should be.

Ghost (Phase 3 — 4 subtasks):
G3.1 — Full compliance GTM playbook (Notion)
Write the comprehensive guide for AlgoHouse's sales team selling to compliance buyers. This is the operational manual they use in every compliance deal. Save in Notion as "AlgoHouse Compliance GTM Playbook."

Sections:

The narrative (1 page): "AlgoHouse is not a compliance platform. It's the data infrastructure that makes compliance possible. The same tick-level order book data your quant traders use to find alpha is the same data your compliance team needs to detect manipulation. You're already paying for institutional-grade data — now use it for compliance too." This is the repositioning thesis. Every sales rep needs to be able to say this in 30 seconds.
The buyer (1 page): Who is the CCO? What do they care about? (Regulatory defensibility, not losing their job when the regulator audits, lowest-cost path to compliance, a vendor that understands MiCA specifically.) What don't they care about? (Data latency, order book depth, tick frequency — those are quant trader concerns.) How do they make decisions? (Committee at large exchanges, solo at small exchanges. Budget comes from compliance budget, not technology budget. Procurement may require SOC 2 — see gap analysis.) What objections will they raise? See objection table below.
Objection table (1 page): 8 objections with specific responses:
"We already have a surveillance vendor (Solidus/NICE Actimize/Eventus)" → "Your surveillance vendor detects manipulation using data feeds. AlgoHouse is the data. We're a layer below your surveillance vendor — we make their detection more accurate by providing clean, normalized feeds instead of raw exchange data."
"We don't have budget this year" → "MiCA non-compliance fines are up to €15M or 15% of annual turnover. AlgoHouse Compliance Starter is €15k/year. That's 0.1% of the maximum fine. Which CFO blocks that?"
"We need SOC 2 before we can sign" → "AlgoHouse's infrastructure is built on AWS with [actual controls in place]. We're on a path to formal SOC 2 certification — expected completion Q4 2026. For the pilot period, we can provide our security documentation and AWS infrastructure attestation for your review."
"We can just use the exchange API directly" → "Raw exchange APIs have no normalization, no quality scoring, no audit trail, and no SLA. The ESMA technical standards for MiCA reporting require specific data formats that exchange APIs don't produce. We do."
"Kaiko already covers this" → "Kaiko is excellent and more expensive. AlgoHouse covers the same exchanges with comparable data quality at [X]% lower cost. We'd like to earn your business on a 30-day pilot — if our data quality isn't comparable, you pay nothing."
"We need 7-year data retention" → "Our current retention is [X years]. For compliance customers requiring 7-year retention, we offer an Enterprise tier with extended retention. This is a configuration, not a product rebuild."
"What if your company doesn't exist in 3 years?" → "Fair concern for any startup vendor. We can offer data escrow arrangements and source-level access as part of Enterprise contracts."
"We need EU data residency" → "This is on our roadmap for Q3 2026. For the pilot, our current infrastructure is AWS [region]. If EU residency is a hard requirement before July 2026, we need to discuss timeline — this conversation should happen now."
Competitive displacement guide (0.5 page): If prospect has Kaiko → compete on price (AlgoHouse 30-40% lower). If prospect has raw exchange APIs → compete on normalization and compliance readiness. If prospect has no data vendor → standard pilot motion.
The pilot motion (0.5 page): Exact script for proposing a pilot. "We want to earn your business. Our standard offer: 30-day access to our compliance data feeds for your required exchanges, fully configured for your surveillance system, at no cost. Success criteria we agree on upfront. If it works, we discuss a 12-month contract. If it doesn't, no obligation. When can we schedule the kickoff call?"
G3.2 — Intercom compliance onboarding sequence (7 messages)
Write the in-product onboarding sequence for compliance customers, triggered after they start a Stripe trial or pilot. Each message is specific, useful, and moves the customer toward compliance readiness — not a sales sequence, a success sequence.

Day 1: "Welcome to AlgoHouse Compliance Edition. Your 30-day pilot starts today. Three things to do in the first 24 hours: [1] Generate your API key at dashboard.algohouse.ai/settings/api. [2] Run the authentication test (copy this curl command). [3] Confirm your exchange coverage looks right — log in and verify all [X] exchanges you need are green. Anything not showing? Reply to this message." (Intercom message, sent as conversation opener)
Day 2: "Your MiCA Article mapping." Attach the PDF version of the MiCA mapping table from G2.2. "Section 2 shows exactly which AlgoHouse endpoints map to Articles 90, 91, and 92. The most time-sensitive requirement for most exchanges is Article 92 (wash trading detection) — your surveillance system needs the /trades/full feed. Here's the exact Python code to connect it: [code snippet]."
Day 5: "Set up your audit trail." Brief tutorial on enabling audit log API. "Your regulator will ask for this. The audit log records every data pull, timestamped in UTC, with the user and endpoint. Here's how to enable it and export it as CSV: [3-step guide]."
Day 10: "Your data quality report." Send a custom summary (or link to the interactive explorer filtered to their exchanges) showing: tick completeness, average latency, Benford's Law scores for each of their covered exchanges. "If any exchange is showing yellow or red, here's what to check."
Day 20: "How similar exchanges have structured their MiCA surveillance workflows." Share a hypothetical but realistic architecture diagram: AlgoHouse data → normalization pipeline → Solidus HALO → alert queue → CCO dashboard → NCA report. "This is the most common setup we've seen. Does yours look similar? Happy to review your architecture if you'd like a second pair of eyes."
Day 28: "MiCA readiness checklist — how are you doing?" A 10-item checklist: API integrated ✓, audit trail enabled ✓, Article 92 feed live ✓, etc. "Two days left in your pilot. Are there any items on this list that aren't checked? Reply here — we want to make sure you're set up before we talk about the contract."
Day 30: "Your pilot ends today." Summary of data delivered (tick count, exchange coverage, uptime achieved vs SLA). "Based on your usage, we'd recommend Compliance [Starter/Professional] at [price]/year. Happy to schedule 30 minutes today or tomorrow to review. No pressure — if you need more time, we can extend the pilot."
G3.3 — Case study template (Notion)
Write the template that AlgoHouse fills in for every pilot customer that converts. The template is so detailed that filling it in takes less than 2 hours.

Template sections with guiding questions in brackets:

Headline: "[Company] achieves MiCA Article 76-92 compliance [X] weeks ahead of deadline using AlgoHouse data infrastructure" — [Fill in: company name (if approved for public), timeline compared to deadline]
Executive Summary (3 sentences): [What was the challenge? What did AlgoHouse provide? What was the outcome in measurable terms?]
Background (2 paragraphs): [Who is this exchange? What markets do they operate in? What were their MiCA obligations specifically?]
The Challenge (2 paragraphs): [What was their surveillance data situation before AlgoHouse? What were they using or planning to use? What was the gap?]
The Solution (3 paragraphs): [Which AlgoHouse endpoints did they use? How did they integrate with their surveillance system? How long did the technical onboarding take?]
The Results (bullet points): [Time to compliance, cost vs. alternatives considered, specific data metrics — tick completeness %, latency achieved, exchanges covered, any regulator interactions this enabled]
Quote: [Direct quote from CCO or CTO — must be approved by their legal/comms team]
What's Next: [Ongoing relationship, upcoming expansion, future product needs]
Publication approval checklist: [Customer has approved company name, quote, metrics, timeline before publication]
Include in the Notion template: a section titled "How to get this case study published" — steps for obtaining customer approval, anonymizing if needed, submitting to AlgoHouse's website team.

G3.4 — Stripe-triggered email sequences (Gmail drafts)
Write the 4 email sequences triggered by Stripe events. Save each as a Gmail draft, labeled by trigger event. Sentinel reviews all before activation.

Trigger: customer.subscription.created (first payment received)
"Welcome to AlgoHouse Compliance — your contract is active." Attach: invoice, MiCA compliance onboarding guide PDF, CCO dashboard access instructions. "Your dedicated onboarding call is scheduled for [date from Forge's Calendly setup]. Between now and then: generate your production API key and run the Day 1 checklist from the pilot guide."

Trigger: customer.subscription.trial_will_end (7 days before trial ends)
"Your AlgoHouse trial ends in 7 days." Subject line is the only urgency — body is helpful, not pushy. "Here's your pilot summary: [link to data quality report]. Here's the contract we'd recommend based on your exchange count and usage: [tier name] at [price]. If you'd like to convert, it takes 5 minutes. If you need more time, reply here — we can discuss."

Trigger: month 3 usage check (API call count > 80% of plan limit)
"You're approaching your plan limit." Sent from support@algohouse.ai (personal tone). "We noticed your API usage is at 82% of your Compliance Starter limit. A few options: [1] Add exchanges to your plan, [2] Upgrade to Compliance Professional (which removes the exchange limit), [3] No action needed if usage will naturally slow down. Let us know what you'd prefer."

Trigger: month 11 renewal (30 days before annual renewal)
"Your AlgoHouse annual renewal is in 30 days." Summary: exchanges covered, uptime delivered vs. SLA, ticket count and resolution time, MiCA compliance status as of today. "We'd like to book a 30-minute renewal review call — agenda: (a) anything you want us to do differently, (b) your MiCA situation for the coming year, (c) contract renewal. [Calendly link]."

Sentinel (Phase 3 QA):
Review 1 — Compliance data package spec (F3.1):
Every MiCA article cited must be verifiable against the actual regulation. Check eur-lex.europa.eu for the exact text of Articles 76-92. Does the technical mapping actually hold up? Does Article 91 actually require the data that AlgoHouse's spoofing detection endpoint provides? If any mapping is a stretch, flag it — a compliance team's legal counsel will push on this in due diligence. Also check: are all endpoint names cited actually existing AlgoHouse endpoints? If any are aspirational, the spec must say "roadmap Q3 2026" not present tense.

Review 2 — Figma compliance dashboard (F3.2):
The design rubric for this is specifically: would a BaFin regulator conducting an audit of a German crypto exchange trust this interface to show them the exchange's compliance data? Bloomberg terminal aesthetic is the target. Score 1-10 on: information density (high is better), trust signals (audit log visibility, UTC timestamping, status indicators), data hierarchy (most critical compliance info most prominent), absence of decorative elements (a regulator doesn't want animations). Reject if it looks like a startup product (hero section, marketing copy visible anywhere, animations without purpose).

Review 3 — Stripe pricing (F3.3):
Does the Compliance Starter at $15k/year actually make sense compared to Scout's competitive research? (Kaiko enterprise: $28.5k avg — AlgoHouse at $15k is a 47% discount, which may be the right initial positioning or may be underpriced.) Does the trial setup allow testing without a credit card? Are the Stripe webhook triggers correctly mapped to the right email sequences? Test the checkout flow personally — time from landing on pricing page to subscription active.

Review 4 — GTM playbook objection table (G3.1):
Read every objection response as a CCO at a skeptical exchange. Would the SOC 2 response ("we're on a path to SOC 2") satisfy a CCO whose procurement team requires it, or would it immediately disqualify AlgoHouse? If the response overpromises (implies SOC 2 exists when it doesn't), reject immediately and require an honest response. The EU data residency response must also be honest — if this is a Q3 2026 roadmap item, that's 5 months before the MiCA deadline. Is that timeline realistic? Flag if not.

Review 5 — Intercom onboarding sequence (G3.2):
Send the full 7-message sequence to yourself and read as a CCO receiving them over 30 days. Does Day 1 give exactly the information needed to get started? Does Day 28 feel helpful or pushy? Is every technical instruction accurate (the curl commands in Day 1, the code snippet in Day 2, the audit log steps in Day 5)? Any inaccurate technical instruction destroys trust with a technical buyer. Reject if any instruction is untested.

Kaze (Phase 3 coordination):
K3.1 — Compliance launch readiness decision
After Scout completes S3.1 (gap analysis), make the staged launch decision. This is the most important strategic call of Phase 3: can AlgoHouse sell to compliance teams right now with what exists today, or does the launch need staging? Framework:

If gaps are minor (missing SOC 2 documentation but security is solid, missing 7-year retention but 3-year available): launch now with honest disclosure. "We can sell Compliance Starter today. Enterprise with 7-year retention requires a Q3 conversation."
If gaps are major (core endpoints missing, latency doesn't meet compliance SLAs): delay launch, focus Phase 3 on spec and design only, create Linear issues for engineering to prioritize. Tell AlgoHouse team clearly: "Not ready to sell compliance yet. Here's the roadmap." Document the decision in Notion. Post to Slack #algohouse-growth immediately — this affects everything Ghost and Forge do in Phase 3.
K3.2 — First pilot customer activation
Select 2 exchanges from Scout's S3.3 list for the first pilots. Schedule kickoff calls in Google Calendar with a prepared agenda using Forge's technical onboarding guide and Ghost's GTM playbook. The kickoff call agenda: (a) confirm their exchange coverage, (b) review the MiCA mapping table together, (c) walk through the technical integration steps with their compliance engineer on the call, (d) confirm success criteria for day 30, (e) set the next check-in (Day 10 data quality review). Send the Notion pilot playbook as pre-read before the call.

K3.3 — Stripe activation authorization
Before Forge activates any Stripe plans, get explicit authorization from AlgoHouse. This is their money. Email the AlgoHouse leadership team with: the three plan configurations, the pricing rationale (from Scout's S3.2 benchmark), the pilot trial offer structure, and a clear question: "Do you authorize AlgoHouse to offer these plans? Any adjustments to pricing or terms before we activate?" Set a response deadline in Google Calendar. Only activate after written confirmation.

K3.4 — Cross-phase retrospective
At the end of Phase 3, compile everything built across all three phases into a Notion master document "AlgoHouse Revenue Engine — What We Built":

Phase 1 artifacts: benchmark repo (GitHub link + star count at publish), research report (Notion link + views), r/algotrading post (link + upvotes at 7 days), interactive explorer (GitHub Pages link + unique visitors)
Phase 2 artifacts: HubSpot pipeline (screenshot of pipeline view with prospect count and pipeline value), lead scoring model (Google Sheets link), all email sequences (Gmail drafts), proposal deck (Figma link), LinkedIn posts (Notion links with scheduled dates)
Phase 3 artifacts: compliance spec (GitHub link), CCO dashboard design (Figma link), Stripe product IDs, GTM playbook (Notion link), Intercom sequence (live message count), pilot customer status
Metrics snapshot: GitHub stars, r/algotrading post upvotes, HubSpot pipeline value, demos booked, compliance pilots activated, Stripe MRR
What worked, what we'd do differently, recommended next 6 weeks
Post the retrospective to Slack #algohouse-growth with a structured summary. Share with AlgoHouse's leadership team as the formal project handoff.

K3.5 — Weekly Phase 3 Slack updates
Post to Slack #algohouse-growth every Friday of Phase 3: pilot customer status (which exchanges engaged, where they are in onboarding), Sentinel QA verdicts (what passed, what got rejected and why), Stripe trial activity (any sign-ups from Phase 2 outreach), blockers requiring AlgoHouse team input. 5 bullet points max.

Phase 3 integrations used: Stripe (F3.3, K3.3, G3.4), HubSpot (S3.3, K3.2), Notion (S3.1, S3.3, G3.1, G3.3, K3.1, K3.4), GitHub (F3.1, F3.4), Linear (F3.1, F3.4), Jira (F3.3 QA), Figma (F3.2), Intercom (G3.2), Gmail (G3.4, K3.3), Slack (K3.1, K3.5), Google Calendar (K3.2, K3.3) — 11/12 + Figma (Zendesk not used in Phase 3 — already built in Phase 2)

Complete Integration Coverage
Integration	Phase 1	Phase 2	Phase 3	Key uses
GitHub	✅	✅	✅	Benchmark repo, wash detector, interactive explorer, compliance spec, onboarding guide
Linear	✅	✅	✅	Build tracking for every Forge task, DX audit issues, compliance feature gaps
Jira	✅	✅	✅	QA tickets for benchmark, email sequences, Stripe checkout flows
Google Sheets	✅	✅	✅	Exchange quality data, competitor gap analysis, lead scoring, pricing model, pipeline dashboard
Notion	✅	✅	✅	All research docs, all Ghost content, all distribution playbooks, GTM playbook, retrospective
Figma	✅	✅	✅	Interactive explorer UI, proposal deck, CCO compliance dashboard
Slack	✅	✅	✅	AlgoHouse team briefings, daily standups, weekly updates, strategic decisions
Google Calendar	✅	✅	✅	Dependency milestones, sales rhythm, MiCA deadline tracking, pilot kickoffs
HubSpot	—	✅	✅	Two sales pipelines (quant + compliance), prospect research, lead scoring
Gmail	—	✅	✅	4 email sequences (quant/compliance/index/re-engagement), 10 personalized outreach, Stripe triggers
Zendesk	—	✅	—	8 knowledge base articles, support infrastructure
Intercom	—	✅	✅	Inbound routing, compliance 7-message onboarding sequence
Stripe	—	—	✅	3 compliance pricing plans, trial configuration, webhook triggers
All 12 integrations + Figma used across the three phases. ✅

What you walk into the AlgoHouse meeting with
After 6 weeks of agent execution, the AlgoHouse team receives:

Phase 1 deliverables (proof):

A GitHub repo with a working Python benchmark notebook, a wash trading detector script, and an interactive exchange quality explorer — all live and publicly accessible
A 10-page research report ready for PDF distribution and ArXiv submission
An r/algotrading post draft that's Sentinel-approved and ready to post
A developer experience audit with Linear issues filed for every friction point
Phase 2 deliverables (pipeline):

50 quant trader prospects and 30 compliance buyer prospects in HubSpot, scored and segmented
4 email sequences (totaling 13 emails) built and QA'd in Gmail, ready to activate
10 individually personalized first emails for the top 10 prospects, Sentinel-approved
A Figma proposal deck template that fills in from the prospect research
A LinkedIn content calendar with 5 posts written and scheduled
8 Zendesk knowledge base articles ready for import
Phase 3 deliverables (compliance revenue):

A compliance data package technical spec filed in GitHub, with MiCA Article mapping and honest gap analysis
A CCO-facing compliance dashboard design in Figma, Sentinel-reviewed
3 Stripe compliance pricing plans configured (Starter $15k, Professional $35k, Enterprise custom)
A 7-message Intercom onboarding sequence for compliance pilots
A full compliance GTM playbook with objection handling in Notion
A case study template ready to fill in for first pilot customers
2 EU exchange pilot kickoff calls scheduled in Google Calendar
The pitch to AlgoHouse: "We built your revenue engine. The benchmark earns trust with the quant community — watch what happens after we post it on r/algotrading. The pipeline has 80 qualified prospects scored and segmented. The compliance tier has Stripe plans configured and a pilot playbook ready. We're asking for one thing: which two compliance exchanges do you want to activate first?"

Task title for Kaze: "Build AlgoHouse's revenue engine from zero — public benchmark that earns quant community trust, 80-prospect pipeline with ready-to-send personalized outreach, and compliance tier with Stripe plans + pilot playbook — 3 phases, 6 weeks, all 12 integrations"

System Context
5 Agents: Kaze (Chief of Staff), Scout (Market Intel), Forge (Engineer), Ghost (Content), Sentinel (QA Reviewer)
12 Live Integrations: Stripe, Notion, Slack, GitHub, Linear, Google Sheets, Google Calendar, Gmail, HubSpot, Jira, Intercom, Zendesk
Figma Design Bridge: Agents can push UI specs to Figma via plugin command queue
Quality Loop: Sentinel reviews every deliverable (score 7+/10 to pass), rejects with feedback (max 3 iterations)