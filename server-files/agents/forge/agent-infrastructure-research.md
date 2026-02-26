# Agent Infrastructure Landscape — Quick Research

**Author:** Forge 🔨  
**Date:** 2026-02-09  
**Time:** ~30 min research pass

---

## Key Players

### 1. LangChain / LangGraph (Leader)
- **What:** Agent orchestration framework with LangGraph Platform for deployment
- **Strengths:** Most mature ecosystem, human-in-the-loop, memory, streaming, LangSmith observability
- **Weaknesses:** Complex, steep learning curve, feels "enterprise-y"
- **Funding:** $25M+ Series A (Sequoia)
- **Position:** The "React" of AI agents — widely adopted, foundational

### 2. CrewAI (Fast Growing)
- **What:** Multi-agent platform with visual editor + API
- **Strengths:** 450M+ workflows/month, 60% of Fortune 500, easy for non-engineers
- **Weaknesses:** Less flexible than LangGraph, more opinionated
- **Position:** The "Retool" of AI agents — enterprise workflow automation

### 3. Microsoft AutoGen
- **What:** Multi-agent conversational framework
- **Strengths:** Microsoft backing, research-grade, open source
- **Weaknesses:** Academic feel, less production-ready
- **Position:** Research-first, enterprise partnerships

### 4. AgentOps (Observability)
- **What:** Monitoring/debugging platform for agents
- **Strengths:** Integrates with 400+ LLMs, time-travel debugging
- **Weaknesses:** Not orchestration — just observability
- **Position:** The "Datadog" for agents

### 5. E2B (Sandboxes)
- **What:** Sandboxed environments for agent code execution
- **Strengths:** Secure execution, infrastructure-focused
- **Position:** The "Docker" for agents

### Honorable Mentions
- **Phidata** — Agent framework with built-in tools
- **Dify** — Open-source LLMOps platform
- **SuperAGI** — Autonomous agent framework
- **Haystack** — NLP pipelines (pivoting to agents)

---

## What Does "Vercel for Agents" Look Like?

**Current State:** Nobody owns this position cleanly.

| Requirement | Current Solutions | Gap |
|-------------|------------------|-----|
| **One-click deploy** | LangGraph Platform (complex), CrewAI (enterprise) | No "git push → live agent" |
| **Auto-scaling** | Most are self-hosted or enterprise | No serverless agent hosting |
| **Simple pricing** | CrewAI $40+/mo, LangSmith $99+/mo | No free tier with usage-based |
| **Framework agnostic** | All tied to their framework | No "bring your own agent" |
| **Sub-minute cold starts** | Edge functions exist for LLMs | No agent-specific edge infra |

### The Ideal "Vercel for Agents":
```
1. npx create-agent my-agent
2. Write agent logic (any framework or none)
3. vercel deploy --agent
4. Get URL: https://my-agent.agents.dev
5. Auto-scales, observability built-in, pay-per-invocation
```

---

## Is There a Clear Leader?

**For Frameworks:** LangChain/LangGraph — clear leader, but not loved  
**For Enterprise:** CrewAI — fastest growing, enterprise-first  
**For Deployment:** **Wide open** — no "Vercel" yet

The market is:
- **Fragmented** — Different tools for orchestration, deployment, observability
- **Complex** — Most solutions require significant setup
- **Enterprise-biased** — No simple indie/startup-friendly option

---

## The Gap We Could Fill

### Option A: "Vercel for Agents" (High Effort, High Reward)
- Simple agent deployment platform
- Framework-agnostic (LangChain, CrewAI, raw Python)
- Usage-based pricing, free tier
- Built-in observability
- **Moat:** Developer experience + network effects

### Option B: Agent DevTools (What We're Building)
- Token-efficient CLIs for agents
- Already started: agent-github, agent-linear, agent-notion
- **Gap filled:** Standardized tool interfaces for agents
- **Moat:** Ecosystem + standard (like OpenAPI for REST)

### Option C: Agent Templates/Marketplace
- Pre-built agents for common tasks
- "Zapier templates but for AI agents"
- One-click deploy to any platform
- **Moat:** Content + community

### Option D: Agent Monitoring (AgentOps Competitor)
- Lighter weight than AgentOps
- Built for indie developers, not enterprise
- Free tier with generous limits
- **Challenge:** AgentOps already established

---

## Recommendation

**Short-term (Now):** Continue Agent DevTools — it's differentiated and building toward a standard.

**Medium-term (3-6 months):** Consider "Vercel for Agents":
- The deployment gap is real
- Nobody owns it yet
- Fits Arpit's infra background (Amazon 3M QPS)
- Could bundle with DevTools for ecosystem play

**Key Insight:** The market is framework-heavy but deployment-light. Everyone's building the "how to build agents" layer. Nobody's nailed the "how to run agents in production" layer simply.

---

## Sources
- langchain.com/langgraph
- crewai.com
- agentops.ai
- microsoft.github.io/autogen
- General knowledge of AI agent ecosystem
