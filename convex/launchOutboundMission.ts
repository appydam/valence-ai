/**
 * Launch the Outbound Sales Pipeline mission.
 *
 * Creates a mission + 7 tasks with proper dependencies and agent assignments.
 * Agents are auto-woken by the task creation handler.
 *
 * Usage:
 *   npx convex run launchOutboundMission '{"userId":"user_39f60iciK4nX4Q0efRxrfyuHqj2"}' --url https://beloved-squirrel-599.convex.cloud
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export default mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // ── 1. Create Mission ─────────────────────────────────────────────────
    const missionId = await ctx.db.insert("missions", {
      title: "Outbound Sales Pipeline — Series A–C SaaS Companies",
      description:
        "End-to-end outbound sales campaign. Target: Series A–C B2B SaaS companies, 50–500 employees. " +
        "Flow: Apollo (find contacts) → Clay (enrich) → HubSpot (CRM + email sequences). " +
        "Automate outbound with an autonomous multi-agent platform with 100+ integrations.",
      status: "active",
      createdBy: "Human",
      createdAt: now,
      taskCount: 7,
      completedTaskCount: 0,
    });

    // ── Product context (shared across tasks) ─────────────────────────────
    // NOTE: Customize this product context to describe what your company sells.
    const productContext =
      `PRODUCT CONTEXT — What we are selling:\n` +
      `[YOUR PRODUCT NAME] is an autonomous multi-agent platform. Instead of one chatbot, you get a squad of specialized AI agents:\n` +
      `• Scout — market research, competitive intel, lead enrichment\n` +
      `• Ghost — content creation, email drafts, social distribution\n` +
      `• Forge — engineering, automations, integrations\n` +
      `• Sentinel — QA review on every deliverable\n` +
      `• Kaze — orchestration, delegation, final approval\n\n` +
      `Connected to 100+ integrations (HubSpot, Salesforce, Slack, Google Workspace, Notion, etc.). ` +
      `It automates complex, multi-step workflows that normally require multiple hires.\n\n` +
      `Key value props:\n` +
      `• Autonomous agents research, write, and send — close pipeline faster\n` +
      `• One platform replaces multiple specialist hires\n` +
      `• Connected to tools they already use\n\n` +
      `Target buyer: Head of Ops, VP RevOps, COO, Chief of Staff, VP Marketing at Series A–C SaaS companies (50–500 employees).`;

    // ── Helper to create a task ───────────────────────────────────────────
    async function createTask(params: {
      title: string;
      description: string;
      priority: "low" | "medium" | "high" | "urgent";
      assignee: "Kaze" | "Scout" | "Forge" | "Ghost";
      tags: string[];
      dependsOn?: Id<"tasks">[];
      requiredIntegrations?: string[];
    }): Promise<Id<"tasks">> {
      const taskId = await ctx.db.insert("tasks", {
        title: params.title,
        description: params.description,
        status: params.dependsOn && params.dependsOn.length > 0 ? "assigned" : "assigned",
        priority: params.priority,
        assignee: params.assignee,
        creator: "Human",
        createdAt: now,
        updatedAt: now,
        tags: params.tags,
        deliverables: [],
        missionId,
        ...(params.dependsOn && params.dependsOn.length > 0 ? { dependsOn: params.dependsOn } : {}),
        ...(params.requiredIntegrations ? { requiredIntegrations: params.requiredIntegrations } : {}),
        requiredUserId: args.userId,
      });
      return taskId;
    }

    // ── 2. Create Task 1: Define ICP & Build Company List ─────────────────
    const task1 = await createTask({
      title: "Define ICP & Build Target Company List",
      description:
        `${productContext}\n\n` +
        `YOUR TASK:\n` +
        `Search Apollo for 50 B2B SaaS companies matching this ICP:\n` +
        `• Stage: Series A, B, or C funded\n` +
        `• Size: 50–500 employees\n` +
        `• Location: US, UK, Canada\n` +
        `• Tech stack signal: Uses HubSpot or Salesforce (these companies already use tools we integrate with, making the pitch easy)\n` +
        `• Industries: SaaS, Fintech, E-commerce, Digital Agency\n\n` +
        `Collect for each company: name, domain, employee count, funding stage, industry, HQ location.\n\n` +
        `Use the Apollo integration (blueprint slug: "apollo") with the search_people or search_organizations tool.\n\n` +
        `DELIVER as a structured JSON deliverable with all 50 companies.`,
      priority: "high",
      assignee: "Scout",
      tags: ["sales", "research", "icp", "outbound"],
      requiredIntegrations: ["apollo"],
    });

    // ── 3. Create Task 2: Find Decision-Maker Contacts ────────────────────
    const task2 = await createTask({
      title: "Find Decision-Maker Contacts at Target Companies",
      description:
        `${productContext}\n\n` +
        `YOUR TASK:\n` +
        `For each of the 50 companies from the previous task (Define ICP & Build Target Company List), use Apollo People Search to find 2–3 decision makers per company.\n\n` +
        `Target these titles (in priority order):\n` +
        `1. Head of Operations / VP Operations\n` +
        `2. Head of Revenue Operations / VP RevOps\n` +
        `3. COO / Chief of Staff\n` +
        `4. VP Marketing / Head of Growth\n` +
        `5. Founder / CEO (for companies under 100 employees)\n\n` +
        `These are the people who feel the pain of manual workflows, tool sprawl, and scaling ops without hiring.\n\n` +
        `Collect for each contact: full name, title, verified email, LinkedIn URL, company name, company domain.\n\n` +
        `Use the Apollo integration (blueprint slug: "apollo") with the search_people tool.\n\n` +
        `TARGET: 100–150 contacts total.\n` +
        `DELIVER as structured JSON.`,
      priority: "high",
      assignee: "Scout",
      tags: ["sales", "prospecting", "outbound"],
      dependsOn: [task1],
      requiredIntegrations: ["apollo"],
    });

    // ── 4. Create Task 3: Enrich Contacts via Clay ────────────────────────
    const task3 = await createTask({
      title: "Enrich Contacts via Clay",
      description:
        `${productContext}\n\n` +
        `YOUR TASK:\n` +
        `Push all contacts from the previous task (Find Decision-Maker Contacts) into the Clay table via the push_to_table tool.\n\n` +
        `Use webhook_id: pull-in-data-from-a-webhook-f2081e27-6a6a-462e-8932-89f081bf778b\n\n` +
        `For each contact, push these fields as the data payload:\n` +
        `• name (full name)\n` +
        `• email\n` +
        `• linkedin_url\n` +
        `• title (job title)\n` +
        `• company\n` +
        `• company_domain\n\n` +
        `Use the Clay integration (blueprint slug: "clay") with the push_to_table tool.\n\n` +
        `DELIVER: Confirmation with total rows pushed and any errors encountered.`,
      priority: "high",
      assignee: "Forge",
      tags: ["sales", "enrichment", "outbound"],
      dependsOn: [task2],
      requiredIntegrations: ["clay"],
    });

    // ── 5. Create Task 4: Push to HubSpot CRM ────────────────────────────
    const task4 = await createTask({
      title: "Push Enriched Contacts to HubSpot CRM",
      description:
        `${productContext}\n\n` +
        `YOUR TASK:\n` +
        `These are enriched prospects for Valence AI's outbound campaign. Push them into HubSpot as our single source of truth.\n\n` +
        `1. Create a contact in HubSpot for each lead using the create_contact tool. Set properties:\n` +
        `   • firstname, lastname, email, jobtitle, company\n` +
        `   • lifecyclestage = "lead"\n` +
        `   • lead_source = "outbound-valence-q1-2026"\n` +
        `2. Create a static contact list called "Valence Outbound — Series A-C SaaS — Q1 2026"\n` +
        `3. Add all contacts to that list\n\n` +
        `Use the HubSpot integration (blueprint slug: "hubspot").\n\n` +
        `DELIVER: Number of contacts created + HubSpot list ID.`,
      priority: "high",
      assignee: "Forge",
      tags: ["sales", "crm", "outbound"],
      dependsOn: [task3],
      requiredIntegrations: ["hubspot"],
    });

    // ── 6. Create Task 5: Draft Email Sequences (parallel with 3,4) ──────
    const task5 = await createTask({
      title: "Draft Personalized Cold Email Sequences",
      description:
        `${productContext}\n\n` +
        `YOUR TASK:\n` +
        `Write a 4-step cold email sequence targeting ops/RevOps leaders at Series A–C SaaS companies.\n\n` +
        `SEQUENCE:\n` +
        `1. Email 1 (Day 1) — Intro + Pain: Hook on the pain of manual workflows, tool sprawl, or scaling ops without hiring. Mention their specific role.\n` +
        `2. Email 2 (Day 3) — Use Case: Pick a specific use case relevant to their title (e.g., for RevOps: "AI SDR that researches 50 leads, writes personalized emails, and books demos — all connected to your HubSpot"). Be concrete.\n` +
        `3. Email 3 (Day 7) — Social Proof / Vision: Paint the picture of what their workflow looks like with Valence. Before/after contrast.\n` +
        `4. Email 4 (Day 14) — Breakup: Short, casual. "Not the right time? No worries. Figured I'd check one last time."\n\n` +
        `RULES:\n` +
        `• Each email UNDER 120 words\n` +
        `• Tone: concise, founder-to-operator, zero fluff, no corporate speak\n` +
        `• Sign off as: Arpit Dhamija (NO company name in signature, just his name)\n` +
        `• Include personalization tokens: {{first_name}}, {{company}}, {{title}}\n` +
        `• CTA: book a 15-min demo (link placeholder: {{demo_link}})\n` +
        `` +
        `DELIVER all 4 emails as structured JSON with subject lines.`,
      priority: "high",
      assignee: "Ghost",
      tags: ["sales", "copywriting", "outreach", "outbound"],
      dependsOn: [task2],
    });

    // ── 7. Create Task 6: Review Email Sequences ─────────────────────────
    const task6 = await createTask({
      title: "Review & Approve Email Sequences",
      description:
        `${productContext}\n\n` +
        `YOUR TASK:\n` +
        `Review the 4-step email sequence from the previous task (Draft Personalized Cold Email Sequences).\n\n` +
        `CHECK AGAINST THESE CRITERIA:\n` +
        `1. Spam check — No trigger words (free, guarantee, act now, etc.). Would these pass Gmail/Outlook spam filters?\n` +
        `2. Clarity — Is the value prop clear within the first 2 lines of each email?\n` +
        `3. Conciseness — Each email under 120 words? No filler sentences?\n` +
        `4. CTA — Is there one clear call-to-action per email?\n` +
        `5. Personalization — Are {{first_name}}, {{company}}, {{title}} tokens used naturally?\n` +
        `6. Tone — Founder-to-operator, not salesy? Would a VP of Ops actually read this?\n` +
        `7. Identity — Signed as "Arpit Dhamija" only. No company name in the signature.\n` +
        `8. Accuracy — Do the claims about the product match reality? (100+ integrations, multi-agent orchestration, connected to HubSpot/Salesforce/Slack etc.)\n\n` +
        `APPROVE or REJECT with specific line-by-line feedback.`,
      priority: "high",
      assignee: "Ghost",
      tags: ["sales", "qa", "outbound"],
      dependsOn: [task5],
    });

    // ── 8. Create Task 7: Set Up HubSpot Sequences ───────────────────────
    const task7 = await createTask({
      title: "Set Up Email Sequence in HubSpot & Enroll Contacts",
      description:
        `${productContext}\n\n` +
        `YOUR TASK:\n` +
        `The email content has been approved and the contacts are in HubSpot. Wire it all together.\n\n` +
        `1. Create an email sequence in HubSpot using the approved email templates from the review task\n` +
        `2. Configure the cadence:\n` +
        `   • Step 1 (Day 1): Intro email\n` +
        `   • Step 2 (Day 3): Use case email\n` +
        `   • Step 3 (Day 7): Social proof email\n` +
        `   • Step 4 (Day 14): Breakup email\n` +
        `3. Enroll all contacts from the "Valence Outbound — Series A-C SaaS — Q1 2026" list\n` +
        `4. Set sending window: weekdays only, 9am–11am recipient's local time\n\n` +
        `Use the HubSpot integration (blueprint slug: "hubspot").\n\n` +
        `DELIVER: Sequence ID + enrollment count + expected first send date.`,
      priority: "medium",
      assignee: "Forge",
      tags: ["sales", "automation", "outbound"],
      dependsOn: [task4, task6],
      requiredIntegrations: ["hubspot"],
    });

    // ── 9. Wire up "blocks" relationships ─────────────────────────────────
    // Task 1 blocks Task 2
    await ctx.db.patch(task1, { blocks: [task2] });
    // Task 2 blocks Tasks 3, 5
    await ctx.db.patch(task2, { blocks: [task3, task5] });
    // Task 3 blocks Task 4
    await ctx.db.patch(task3, { blocks: [task4] });
    // Task 4 blocks Task 7
    await ctx.db.patch(task4, { blocks: [task7] });
    // Task 5 blocks Task 6
    await ctx.db.patch(task5, { blocks: [task6] });
    // Task 6 blocks Task 7
    await ctx.db.patch(task6, { blocks: [task7] });

    return {
      success: true,
      missionId,
      tasks: {
        "1_company_list": task1,
        "2_find_contacts": task2,
        "3_enrich_clay": task3,
        "4_push_hubspot": task4,
        "5_draft_emails": task5,
        "6_review_emails": task6,
        "7_setup_sequences": task7,
      },
      message: "Mission launched! 7 tasks created. Scout will start on Task 1 immediately.",
    };
  },
});
