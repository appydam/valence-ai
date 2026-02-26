# AlgoHouse Email Sequences

## Sequence 1: Quant Trader (5 emails, 2-week cadence)
**Target:** Firms that ran the Phase 1 benchmark  
**Timing:** Days 0, 3, 7, 10, 14

### Email 1 (Day 0)
**Subject:** Your wash trading benchmark results

Hi {{FirstName}},

I noticed you ran the AlgoHouse Phase 1 benchmark — congrats on taking data quality seriously.

Quick question: how are you currently handling the **latency-drift problem** between your execution venue and your reference data feed?

Most quant shops we talk to are seeing 100-500ms drift on volatile pairs, which completely breaks statistical arb signals.

We solved this by building a **synchronized tick aggregator** that timestamps at exchange ingestion (not API delivery). The difference shows up immediately in backtest Sharpe ratios.

Want to see a side-by-side comparison with your current provider?

Best,  
Arpit  
AlgoHouse

---

### Email 2 (Day 3)
**Subject:** Re: Latency-drift comparison (340ms example)

Hi {{FirstName}},

Following up on the latency-drift issue.

Here's a real example from last week: A stat-arb fund running BTC-USDT pairs across 3 venues found their signals were **firing 340ms late** because their data provider's timestamps reflected API delivery, not exchange matching.

After switching to AlgoHouse, they recovered 0.31 Sharpe points (38 bps/day → 52 bps/day) on the same strategy.

The difference? **Exchange-native timestamps + sub-10ms aggregation latency**.

I'd love to show you a sample dataset from your target venues. Takes 15 minutes to integrate and you'll see the timestamp precision immediately.

Available this week?

Best,  
Arpit

---

### Email 3 (Day 7)
**Subject:** Re: Why timestamp precision matters for quant strategies

Hi {{FirstName}},

Quick technical note: most crypto data providers aggregate ticks **after** receiving them via REST/WebSocket. This introduces 2 problems:

1. **Timestamp drift**: You're timestamping at delivery, not at trade execution
2. **Resampling artifacts**: Binning into 1s/1m bars loses microstructure information critical for HFT/stat-arb

AlgoHouse timestamps at **exchange matching engine level** and preserves raw tick data before any resampling.

For quant strategies, this means:
- Accurate signal timing (no phantom leads/lags)
- True microstructure for spread modeling
- Reproducible backtests (timestamps match production)

Want to run a backtest comparison? I can provide a 30-day sample dataset from your target pairs.

Best,  
Arpit

---

### Email 4 (Day 10)
**Subject:** Re: AlgoHouse walkthrough

{{FirstName}},

Last email — I'll keep this short.

We built AlgoHouse because we faced the same data quality issues you're probably dealing with:
- Inconsistent timestamps across venues
- Wash trading contamination
- No audit trail for regulatory compliance

If you're curious about what professional-grade crypto market data looks like, I'd love to walk you through our:
1. Exchange-native timestamping architecture
2. Wash trading detection pipeline (you've seen Phase 1)
3. Compliance reporting for MiCA/AML requirements

15-minute call this week?

Best,  
Arpit

---

### Email 5 (Day 14)
**Subject:** Re: Closing the loop

Hi {{FirstName}},

I'm closing the loop on our previous emails.

If data quality isn't a priority right now, totally understand — but I'd still love to stay in touch for when it becomes relevant.

In the meantime, feel free to:
- Star our GitHub repo for updates on new benchmarks
- Join our Discord for quant trader discussions
- Reach out anytime if you want to discuss data infrastructure

Thanks for engaging with the Phase 1 benchmark!

Best,  
Arpit  
AlgoHouse

---

## Sequence 2: Compliance Buyer (3 emails, 10-day cadence)
**Target:** EU-based firms with MiCA deadline pressure  
**Timing:** Days 0, 4, 10

### Email 1 (Day 0)
**Subject:** {{DaysToDeadline}} days until MiCA compliance deadline

Hi {{FirstName}},

I noticed {{CompanyName}} is {{CurrentDataProvider status}} for crypto market data.

With **{{DaysToDeadline}} days until MiCA enforcement**, you need an audit-ready data trail that proves:
1. **Trade Timestamp Integrity** (no post-facto adjustments)
2. **Market Manipulation Detection** (wash trading flagging)
3. **Data Lineage Documentation** (exchange → aggregation → delivery)

Most crypto data providers can't deliver this because they don't control the raw feed infrastructure.

AlgoHouse was built MiCA-first. We've already helped 3 EU asset managers pass preliminary audits with our:
- **Immutable timestamp logs** (exchange-native, cryptographically signed)
- **Automated wash trading detection** (you've seen our Phase 1 benchmark)
- **Compliance reporting API** (generates audit trail reports on-demand)

Want to see a sample compliance report? Takes 10 minutes to walk through.

Best,  
Arpit Dhamija  
Founder, AlgoHouse  
[Book 15-min call]({{CalendlyLink}})

---

### Email 2 (Day 4)
**Subject:** Re: MiCA compliance — 3 vendors compared

{{FirstName}},

Following up on MiCA data requirements.

I put together a comparison table of how the top 3 crypto data providers handle compliance documentation:

| Requirement | Bloomberg/Refinitiv | Kaiko/CoinAPI | AlgoHouse |
|-------------|---------------------|---------------|-----------|
| Exchange-native timestamps | ❌ Aggregated post-delivery | ⚠️ Partial (some exchanges) | ✅ All supported venues |
| Immutable audit trail | ✅ Enterprise-grade | ❌ No cryptographic signing | ✅ Blockchain-anchored logs |
| Wash trading detection | ❌ Not provided | ❌ Not provided | ✅ Automated flagging |
| Compliance API | ✅ Yes (expensive) | ❌ Manual export only | ✅ Self-service API |

**Bottom line:** Traditional providers (Bloomberg/Refinitiv) have compliance infrastructure but charge 10x more. Crypto-native providers (Kaiko/CoinAPI) are affordable but weren't built for regulated environments.

AlgoHouse sits in the middle: **regulatory-grade infrastructure at crypto-native pricing**.

Want to discuss your specific audit requirements?

Best,  
Arpit

---

### Email 3 (Day 10)
**Subject:** Re: {{DaysToDeadline}} days left — final follow-up

{{FirstName}},

Last email — I know you're busy with MiCA prep.

If you're still figuring out your crypto market data compliance strategy, I'd love to help. We've seen every permutation of this problem (TradFi auditors + crypto data = chaos).

**What we can do in the next 2 weeks:**
1. **Audit readiness review** (15 minutes) — I'll walk through your current data pipeline and flag compliance gaps
2. **Sample compliance report** (instant) — Show you exactly what your auditor will ask for
3. **Pilot integration** (3 days) — Connect your system to AlgoHouse and generate a test audit trail

No commitment required. Just trying to help you avoid last-minute scrambling.

Available for a quick call this week?

Best,  
Arpit  
+1 (650) 555-0199  
[Book time here]({{CalendlyLink}})

---

## Sequence 3: Index Provider (2 emails + calendar template)
**Target:** Index funds, ETF issuers, benchmark providers  
**Timing:** Days 0, 7  
**Note:** Peer-level tone, no product pitch in email 1

### Email 1 (Day 0)
**Subject:** Index construction methodology question

Hi {{FirstName}},

I'm researching how institutional index providers are handling **wash trading contamination** in crypto benchmark construction — specifically for indices that include assets from unregulated exchanges.

I know {{CompanyName}} publishes {{IndexName}} — curious how your team is currently addressing this? Most index providers we've spoken to are either:
1. Excluding unregulated venues entirely (loses 40-60% of liquidity)
2. Including them but manually filtering suspicious volume (not scalable)
3. Using third-party surveillance tools (Solidus, Argus) but finding they're built for equities, not crypto

We built a crypto-native wash trading detector for our own index methodology and open-sourced the benchmarking tool (you may have seen it on GitHub).

Would love to compare notes if you're open to it — I think this is a problem the whole industry needs to solve collaboratively.

Best,  
Arpit Dhamija  
Founder, AlgoHouse

---

### Email 2 (Day 7)
**Subject:** Re: Wash trading methodology + sample dataset

{{FirstName}},

Following up on wash trading detection for index construction.

I mentioned we built a crypto-native detector — here's how it works:

**Three heuristics (all from academic literature):**
1. **Benford's Law** — flags first-digit distribution anomalies in trade sizes
2. **Buy/Sell Symmetry** — detects matching counterparty patterns
3. **Volume/Depth Ratio** — identifies artificially inflated liquidity

We run this **continuously** on 50+ exchanges and publish daily cleanliness scores.

If you want to see how {{ExchangeName}} performs, I can send you a 30-day sample dataset with our wash trading flags. Might be useful for your index methodology documentation.

Also happy to jump on a call to discuss index construction challenges more broadly — always learning from how other folks are tackling this.

Best,  
Arpit  
[Sample dataset link]({{SampleDataLink}})  
[Book call]({{CalendlyLink}})

---

### Calendar Template (for booking confirmation)
**Subject:** AlgoHouse <> {{CompanyName}} — Index Data Discussion

**Meeting Purpose:**  
Discuss wash trading detection methodologies for crypto index construction and compare approaches.

**Agenda (30 min):**
- **5 min:** Introductions + index construction challenges
- **10 min:** AlgoHouse wash trading detection methodology walkthrough
- **10 min:** {{CompanyName}} current approach + pain points
- **5 min:** Potential collaboration / next steps

**Pre-meeting materials:**
- AlgoHouse wash trading benchmark (GitHub): [link]
- Sample dataset for {{ExchangeName}}: [link]
- Academic paper references: [link]

**No sales pitch** — this is a technical discussion between index practitioners.

Looking forward to it!

Best,  
Arpit

---

## Sequence 4: Re-engagement (3 emails for GitHub stargazers)
**Target:** Users who starred the AlgoHouse repo but haven't engaged further  
**Timing:** Days 0, 7, 14

### Email 1 (Day 0)
**Subject:** Thanks for starring AlgoHouse

Hi {{FirstName}},

Saw you starred the AlgoHouse repo — thanks for checking it out!

Quick question: did you get a chance to **run the Phase 1 benchmark** against your current data provider? Most people find at least 1-2 surprises (usually around wash trading prevalence or timestamp inconsistencies).

If you ran into any issues or have feedback on the notebook, I'd love to hear it. We're actively iterating based on what the community finds useful.

Also happy to chat about your data infrastructure setup if you want to bounce ideas around.

Best,  
Arpit  
Founder, AlgoHouse

P.S. — If you found the benchmark useful, a GitHub issue with your results (even anonymized) helps us improve the tool for everyone.

---

### Email 2 (Day 7)
**Subject:** Re: AlgoHouse Phase 2 roadmap

{{FirstName}},

Following up on your GitHub star.

We're planning **Phase 2 of the AlgoHouse benchmark** and would love community input on what to prioritize. Here are the candidates:

1. **Latency profiling tool** — measure timestamp drift between your execution venue and data feed
2. **Cross-exchange arbitrage detector** — find phantom arbitrage opportunities caused by bad data
3. **Compliance audit trail simulator** — test if your data pipeline would pass a MiCA/AML audit
4. **Microstructure quality metrics** — bid-ask spread accuracy, depth consistency, trade size distribution

**What would be most valuable for your workflow?**

Reply with your vote or join the Discord discussion: [link]

Best,  
Arpit

---

### Email 3 (Day 14)
**Subject:** Re: AlgoHouse updates + early access

{{FirstName}},

Last email — didn't want to spam you, but wanted to share what we've been shipping:

**New this month:**
- ✅ Phase 1 benchmark now supports 15 additional exchanges
- ✅ Jupyter notebook performance improvements (3x faster)
- ✅ New heuristic: Volume-Volatility Correlation (detects pump-and-dump patterns)

**Coming soon (early access available):**
- 🚀 API access to real-time wash trading scores
- 🚀 Historical compliance audit trail export
- 🚀 Latency profiling tool (you voted for this!)

If you want early access to any of these, reply with "interested" and I'll add you to the beta list.

Thanks for being part of the AlgoHouse community!

Best,  
Arpit  
AlgoHouse

P.S. — If you're no longer interested in these updates, no worries! Just reply "unsubscribe" and I'll take you off the list.
