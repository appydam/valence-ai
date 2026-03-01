/**
 * Seed Zoho Workspace integration blueprint
 *
 * Single blueprint covering 8 Zoho apps via unified OAuth:
 *   CRM, Books, Desk, Projects, Mail, Cliq, WorkDrive, People
 *
 * Usage:
 * 1. Go to Convex dashboard → Functions → seedZohoWorkspaceBlueprint → Run
 *    OR run: npx convex run seedZohoWorkspaceBlueprint --url https://beloved-squirrel-599.convex.cloud
 *
 * Pre-requisites:
 * - Create a Zoho OAuth app at https://api-console.zoho.com/
 *   → Type: Server-based Application
 *   → Redirect URI: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback
 * - Set Convex env vars:
 *   → ZOHO_CLIENT_ID   — OAuth app Client ID
 *   → OAUTH_SECRET_ZOHO — OAuth app Client Secret
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    // Check if Zoho Workspace blueprint already exists
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "zoho-workspace"))
      .first();

    if (existing) {
      return {
        message: "Zoho Workspace blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    // Zoho OAuth 2.0 config
    // Note: clientSecret is stored as the env var name; connectionActions.ts resolves
    // it at runtime via process.env["OAUTH_SECRET_ZOHO"]
    const authConfig = {
      clientId: process.env.ZOHO_CLIENT_ID || "YOUR_ZOHO_CLIENT_ID",
      clientSecret: "OAUTH_SECRET_ZOHO",
      authorizeUrl: "https://accounts.zoho.com/oauth/v2/auth",
      tokenUrl: "https://accounts.zoho.com/oauth/v2/token",
      scopes: [
        // CRM
        "ZohoCRM.modules.ALL",
        "ZohoCRM.settings.READ",
        "ZohoCRM.coql.READ",
        // Books
        "ZohoBooks.invoices.ALL",
        "ZohoBooks.contacts.ALL",
        "ZohoBooks.customerpayments.ALL",
        // Desk
        "Desk.tickets.ALL",
        "Desk.contacts.ALL",
        "Desk.organizations.READ",
        // Projects
        "ZohoProjects.portals.READ",
        "ZohoProjects.projects.ALL",
        "ZohoProjects.tasks.ALL",
        // Mail
        "ZohoMail.accounts.READ",
        "ZohoMail.messages.CREATE",
        "ZohoMail.messages.READ",
        "ZohoMail.folders.READ",
        // Cliq
        "ZohoCliq.Channels.ALL",
        "ZohoCliq.Chats.CREATE",
        "ZohoCliq.Users.READ",
        // WorkDrive
        "WorkDrive.files.ALL",
        "WorkDrive.teamfolders.READ",
        "WorkDrive.folders.ALL",
        // People
        "ZohoPeople.employee.READ",
        "ZohoPeople.leave.READ",
        "ZohoPeople.attendance.READ",
      ],
      scopeSeparator: "space",
      extraAuthParams: {
        access_type: "offline",
        prompt: "consent",
      },
      tokenEndpointAuth: "body",
    };

    const now = Date.now();

    // baseUrl is intentionally empty — each tool stores a full URL in its path field
    // because Zoho's 8 apps span multiple domains (zohoapis.com, desk.zoho.com, etc.)
    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "zoho-workspace",
      name: "Zoho Workspace",
      description:
        "Unified Zoho integration covering CRM, Books, Desk, Projects, Mail, Cliq, WorkDrive, and People via a single OAuth connection.",
      category: "Office Suite",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify(authConfig),
      baseUrl: "",
      defaultHeaders: JSON.stringify({}),
      sourceType: "manual",
      sourceUrl: "https://www.zoho.com/developer/",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/zoho.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    // ─────────────────────────────────────────────────────────────────────────
    // TOOLS
    // Each tool uses a full URL in `path` (baseUrl is empty string on blueprint).
    // pathParams / queryParams / bodySchema are JSON strings per the schema.
    // ─────────────────────────────────────────────────────────────────────────
    const tools = [
      // ── ZOHO CRM ─────────────────────────────────────────────────────────
      {
        name: "crm_list_leads",
        displayName: "CRM: List Leads",
        description: "List leads from Zoho CRM with optional filtering and pagination.",
        method: "GET" as const,
        path: "https://www.zohoapis.com/crm/v8/Leads",
        queryParams: JSON.stringify([
          { name: "fields", type: "string", description: "Comma-separated field names to return. e.g. First_Name,Last_Name,Email" },
          { name: "page", type: "number", description: "Page number (1-based)", default: 1 },
          { name: "per_page", type: "number", description: "Records per page (max 200)", default: 20 },
          { name: "sort_by", type: "string", description: "Field name to sort by" },
          { name: "sort_order", type: "string", description: "asc or desc" },
        ]),
        aiUsageHint: "Fetch leads from Zoho CRM. Use fields param to limit response size. Results are paginated.",
        exampleArgs: JSON.stringify({ fields: "First_Name,Last_Name,Email,Company,Lead_Status", per_page: 20 }),
      },
      {
        name: "crm_create_lead",
        displayName: "CRM: Create Lead",
        description: "Create a new lead in Zoho CRM.",
        method: "POST" as const,
        path: "https://www.zohoapis.com/crm/v8/Leads",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["data"],
          properties: {
            data: {
              type: "array",
              description: "Array of lead records to create (up to 100)",
              items: {
                type: "object",
                required: ["Last_Name"],
                properties: {
                  Last_Name: { type: "string", description: "Lead's last name (required)" },
                  First_Name: { type: "string", description: "Lead's first name" },
                  Email: { type: "string", description: "Lead email address" },
                  Company: { type: "string", description: "Company name" },
                  Phone: { type: "string", description: "Phone number" },
                  Lead_Source: { type: "string", description: "Source of the lead e.g. Web Form, Cold Call" },
                },
              },
            },
          },
        }),
        aiUsageHint: "Create one or more leads in Zoho CRM. Last_Name is required. Wrap records in a 'data' array.",
        exampleArgs: JSON.stringify({
          data: [{ First_Name: "Jane", Last_Name: "Smith", Email: "jane@acme.com", Company: "Acme Inc", Lead_Source: "Web Form" }],
        }),
      },
      {
        name: "crm_list_contacts",
        displayName: "CRM: List Contacts",
        description: "List contacts from Zoho CRM.",
        method: "GET" as const,
        path: "https://www.zohoapis.com/crm/v8/Contacts",
        queryParams: JSON.stringify([
          { name: "fields", type: "string", description: "Comma-separated field names to return" },
          { name: "page", type: "number", default: 1 },
          { name: "per_page", type: "number", default: 20 },
          { name: "sort_by", type: "string" },
          { name: "sort_order", type: "string", description: "asc or desc" },
        ]),
        aiUsageHint: "Fetch contacts from Zoho CRM. Contacts are associated with Accounts.",
        exampleArgs: JSON.stringify({ fields: "First_Name,Last_Name,Email,Account_Name,Phone", per_page: 20 }),
      },
      {
        name: "crm_create_contact",
        displayName: "CRM: Create Contact",
        description: "Create a new contact in Zoho CRM.",
        method: "POST" as const,
        path: "https://www.zohoapis.com/crm/v8/Contacts",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["data"],
          properties: {
            data: {
              type: "array",
              items: {
                type: "object",
                required: ["Last_Name"],
                properties: {
                  Last_Name: { type: "string" },
                  First_Name: { type: "string" },
                  Email: { type: "string" },
                  Phone: { type: "string" },
                  Account_Name: { type: "string", description: "Name of the associated account" },
                  Title: { type: "string" },
                },
              },
            },
          },
        }),
        aiUsageHint: "Create a contact in Zoho CRM. Last_Name is required. Optionally link to an Account.",
        exampleArgs: JSON.stringify({
          data: [{ First_Name: "John", Last_Name: "Doe", Email: "john@acme.com", Account_Name: "Acme Inc" }],
        }),
      },
      {
        name: "crm_list_deals",
        displayName: "CRM: List Deals",
        description: "List deals (opportunities) from Zoho CRM.",
        method: "GET" as const,
        path: "https://www.zohoapis.com/crm/v8/Deals",
        queryParams: JSON.stringify([
          { name: "fields", type: "string", description: "Comma-separated fields e.g. Deal_Name,Stage,Amount,Closing_Date" },
          { name: "page", type: "number", default: 1 },
          { name: "per_page", type: "number", default: 20 },
          { name: "sort_by", type: "string", description: "Field to sort by e.g. Closing_Date" },
          { name: "sort_order", type: "string", description: "asc or desc" },
        ]),
        aiUsageHint: "Fetch deals/opportunities from Zoho CRM. Filter by stage or sort by Closing_Date.",
        exampleArgs: JSON.stringify({ fields: "Deal_Name,Stage,Amount,Closing_Date,Account_Name", sort_by: "Closing_Date", per_page: 20 }),
      },
      {
        name: "crm_create_deal",
        displayName: "CRM: Create Deal",
        description: "Create a new deal (opportunity) in Zoho CRM.",
        method: "POST" as const,
        path: "https://www.zohoapis.com/crm/v8/Deals",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["data"],
          properties: {
            data: {
              type: "array",
              items: {
                type: "object",
                required: ["Deal_Name", "Stage"],
                properties: {
                  Deal_Name: { type: "string", description: "Name of the deal (required)" },
                  Stage: { type: "string", description: "Deal stage e.g. Qualification, Proposal, Closed Won" },
                  Amount: { type: "number", description: "Deal value" },
                  Closing_Date: { type: "string", description: "Expected close date in YYYY-MM-DD format" },
                  Account_Name: { type: "string", description: "Associated account name" },
                  Contact_Name: { type: "string", description: "Associated contact name" },
                },
              },
            },
          },
        }),
        aiUsageHint: "Create a deal in Zoho CRM. Deal_Name and Stage are required.",
        exampleArgs: JSON.stringify({
          data: [{ Deal_Name: "Acme Enterprise License", Stage: "Qualification", Amount: 50000, Closing_Date: "2026-04-30" }],
        }),
      },

      // ── ZOHO BOOKS ───────────────────────────────────────────────────────
      {
        name: "books_list_invoices",
        displayName: "Books: List Invoices",
        description: "List invoices from Zoho Books for an organization.",
        method: "GET" as const,
        path: "https://www.zohoapis.com/books/v3/invoices",
        queryParams: JSON.stringify([
          { name: "organization_id", type: "string", required: true, description: "Zoho Books organization ID (find in Books → Settings → Organization Profile)" },
          { name: "status", type: "string", description: "Filter by status: draft, sent, overdue, paid, void, unpaid, partially_paid, viewed" },
          { name: "customer_name", type: "string", description: "Filter by customer name" },
          { name: "page", type: "number", default: 1 },
          { name: "per_page", type: "number", default: 25 },
        ]),
        aiUsageHint: "List invoices from Zoho Books. organization_id is required. Filter by status like 'overdue' or 'unpaid'.",
        exampleArgs: JSON.stringify({ organization_id: "YOUR_ORG_ID", status: "unpaid", per_page: 25 }),
      },
      {
        name: "books_create_invoice",
        displayName: "Books: Create Invoice",
        description: "Create a new invoice in Zoho Books.",
        method: "POST" as const,
        path: "https://www.zohoapis.com/books/v3/invoices",
        queryParams: JSON.stringify([
          { name: "organization_id", type: "string", required: true, description: "Zoho Books organization ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["customer_id", "line_items"],
          properties: {
            customer_id: { type: "string", description: "Zoho Books customer ID" },
            invoice_number: { type: "string", description: "Custom invoice number (auto-generated if omitted)" },
            date: { type: "string", description: "Invoice date in YYYY-MM-DD format" },
            due_date: { type: "string", description: "Due date in YYYY-MM-DD format" },
            line_items: {
              type: "array",
              description: "Invoice line items",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Item name" },
                  description: { type: "string" },
                  rate: { type: "number", description: "Unit price" },
                  quantity: { type: "number", description: "Quantity", default: 1 },
                  tax_id: { type: "string", description: "Tax ID to apply" },
                },
              },
            },
            notes: { type: "string", description: "Internal notes" },
            terms: { type: "string", description: "Payment terms" },
          },
        }),
        aiUsageHint: "Create an invoice in Zoho Books. Requires customer_id and at least one line_item. Pass organization_id as a query param.",
        exampleArgs: JSON.stringify({
          organization_id: "YOUR_ORG_ID",
          customer_id: "460000000026049",
          date: "2026-03-01",
          due_date: "2026-03-31",
          line_items: [{ name: "Consulting Services", description: "March 2026", rate: 5000, quantity: 1 }],
        }),
      },
      {
        name: "books_list_contacts",
        displayName: "Books: List Contacts",
        description: "List customers/contacts from Zoho Books.",
        method: "GET" as const,
        path: "https://www.zohoapis.com/books/v3/contacts",
        queryParams: JSON.stringify([
          { name: "organization_id", type: "string", required: true, description: "Zoho Books organization ID" },
          { name: "contact_type", type: "string", description: "customer or vendor" },
          { name: "search_text", type: "string", description: "Search by name, email, or phone" },
          { name: "page", type: "number", default: 1 },
          { name: "per_page", type: "number", default: 25 },
        ]),
        aiUsageHint: "List contacts (customers/vendors) from Zoho Books. Use contact_type=customer for customers only.",
        exampleArgs: JSON.stringify({ organization_id: "YOUR_ORG_ID", contact_type: "customer", per_page: 25 }),
      },
      {
        name: "books_list_payments",
        displayName: "Books: List Customer Payments",
        description: "List customer payments received in Zoho Books.",
        method: "GET" as const,
        path: "https://www.zohoapis.com/books/v3/customerpayments",
        queryParams: JSON.stringify([
          { name: "organization_id", type: "string", required: true, description: "Zoho Books organization ID" },
          { name: "customer_id", type: "string", description: "Filter by customer ID" },
          { name: "date_start", type: "string", description: "Filter from date YYYY-MM-DD" },
          { name: "date_end", type: "string", description: "Filter to date YYYY-MM-DD" },
          { name: "page", type: "number", default: 1 },
        ]),
        aiUsageHint: "List payments received in Zoho Books. Filter by customer_id or date range.",
        exampleArgs: JSON.stringify({ organization_id: "YOUR_ORG_ID", date_start: "2026-01-01", date_end: "2026-03-31" }),
      },

      // ── ZOHO DESK ────────────────────────────────────────────────────────
      {
        name: "desk_list_tickets",
        displayName: "Desk: List Tickets",
        description: "List support tickets from Zoho Desk.",
        method: "GET" as const,
        path: "https://desk.zoho.com/api/v1/tickets",
        queryParams: JSON.stringify([
          { name: "from", type: "number", description: "Starting index for pagination (0-based)", default: 0 },
          { name: "limit", type: "number", description: "Max records to return (max 99)", default: 20 },
          { name: "status", type: "string", description: "Comma-separated statuses: Open, On Hold, Escalated, Closed" },
          { name: "priority", type: "string", description: "low, medium, high, urgent" },
          { name: "sortBy", type: "string", description: "Field to sort by e.g. createdTime, modifiedTime" },
        ]),
        aiUsageHint: "List Zoho Desk tickets. Filter by status (Open, Closed) or priority. Pagination uses from+limit.",
        exampleArgs: JSON.stringify({ status: "Open", limit: 20, sortBy: "createdTime" }),
      },
      {
        name: "desk_create_ticket",
        displayName: "Desk: Create Ticket",
        description: "Create a new support ticket in Zoho Desk.",
        method: "POST" as const,
        path: "https://desk.zoho.com/api/v1/tickets",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["subject", "departmentId"],
          properties: {
            subject: { type: "string", description: "Ticket subject (required)" },
            description: { type: "string", description: "Ticket description / body" },
            departmentId: { type: "string", description: "Zoho Desk department ID (required)" },
            contactId: { type: "string", description: "Zoho Desk contact ID to associate ticket" },
            priority: { type: "string", description: "low, medium, high, or urgent" },
            status: { type: "string", description: "Open, On Hold, Closed, etc.", default: "Open" },
            email: { type: "string", description: "Contact email if contactId not available" },
          },
        }),
        aiUsageHint: "Create a Zoho Desk support ticket. subject and departmentId are required.",
        exampleArgs: JSON.stringify({
          subject: "Cannot log in to account",
          description: "User reports login page returns error 500.",
          departmentId: "YOUR_DEPT_ID",
          priority: "high",
          email: "customer@example.com",
        }),
      },
      {
        name: "desk_get_ticket",
        displayName: "Desk: Get Ticket",
        description: "Get details of a specific support ticket by ID.",
        method: "GET" as const,
        path: "https://desk.zoho.com/api/v1/tickets/{ticketId}",
        pathParams: JSON.stringify([
          { name: "ticketId", type: "string", required: true, description: "Zoho Desk ticket ID" },
        ]),
        aiUsageHint: "Fetch a Zoho Desk ticket by its ID. Returns full ticket details including status, priority, and history.",
        exampleArgs: JSON.stringify({ ticketId: "170000000006003" }),
      },
      {
        name: "desk_list_contacts",
        displayName: "Desk: List Contacts",
        description: "List contacts in Zoho Desk.",
        method: "GET" as const,
        path: "https://desk.zoho.com/api/v1/contacts",
        queryParams: JSON.stringify([
          { name: "from", type: "number", default: 0 },
          { name: "limit", type: "number", default: 20 },
          { name: "searchStr", type: "string", description: "Search by name or email" },
        ]),
        aiUsageHint: "List contacts in Zoho Desk. Use searchStr to find a specific contact by name or email.",
        exampleArgs: JSON.stringify({ searchStr: "jane@acme.com", limit: 10 }),
      },

      // ── ZOHO PROJECTS ────────────────────────────────────────────────────
      {
        name: "projects_list_projects",
        displayName: "Projects: List Projects",
        description: "List all projects in a Zoho Projects portal.",
        method: "GET" as const,
        path: "https://projectsapi.zoho.com/api/v3/portal/{portalId}/projects",
        pathParams: JSON.stringify([
          { name: "portalId", type: "string", required: true, description: "Portal ID from Zoho Projects (find in URL when in Projects app)" },
        ]),
        queryParams: JSON.stringify([
          { name: "status", type: "string", description: "active, archived, template" },
          { name: "index", type: "number", description: "Pagination start index", default: 1 },
          { name: "range", type: "number", description: "Number of projects to return", default: 20 },
        ]),
        aiUsageHint: "List Zoho Projects. portalId is required — get it from the Projects URL. Filter by status=active.",
        exampleArgs: JSON.stringify({ portalId: "YOUR_PORTAL_ID", status: "active" }),
      },
      {
        name: "projects_list_tasks",
        displayName: "Projects: List Tasks",
        description: "List tasks within a specific project in Zoho Projects.",
        method: "GET" as const,
        path: "https://projectsapi.zoho.com/api/v3/portal/{portalId}/projects/{projectId}/tasks",
        pathParams: JSON.stringify([
          { name: "portalId", type: "string", required: true, description: "Portal ID" },
          { name: "projectId", type: "string", required: true, description: "Project ID" },
        ]),
        queryParams: JSON.stringify([
          { name: "status", type: "string", description: "open, inprogress, closed" },
          { name: "index", type: "number", default: 1 },
          { name: "range", type: "number", default: 20 },
        ]),
        aiUsageHint: "List tasks in a Zoho Projects project. Both portalId and projectId are required.",
        exampleArgs: JSON.stringify({ portalId: "YOUR_PORTAL_ID", projectId: "YOUR_PROJECT_ID", status: "open" }),
      },
      {
        name: "projects_create_task",
        displayName: "Projects: Create Task",
        description: "Create a new task in a Zoho Projects project.",
        method: "POST" as const,
        path: "https://projectsapi.zoho.com/api/v3/portal/{portalId}/projects/{projectId}/tasks",
        pathParams: JSON.stringify([
          { name: "portalId", type: "string", required: true, description: "Portal ID" },
          { name: "projectId", type: "string", required: true, description: "Project ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", description: "Task name (required)" },
            description: { type: "string", description: "Task description" },
            start_date: { type: "string", description: "Start date MM-DD-YYYY" },
            end_date: { type: "string", description: "Due date MM-DD-YYYY" },
            priority: { type: "string", description: "none, low, medium, high" },
            person_responsible: { type: "string", description: "Email of person to assign the task" },
          },
        }),
        aiUsageHint: "Create a task in Zoho Projects. name is required. Provide end_date for deadline tracking.",
        exampleArgs: JSON.stringify({
          portalId: "YOUR_PORTAL_ID",
          projectId: "YOUR_PROJECT_ID",
          name: "Design landing page mockup",
          description: "Create wireframes for the new marketing landing page",
          priority: "high",
          end_date: "03-15-2026",
        }),
      },
      {
        name: "projects_my_tasks",
        displayName: "Projects: My Tasks",
        description: "Get all tasks assigned to the authenticated user across all projects in a portal.",
        method: "GET" as const,
        path: "https://projectsapi.zoho.com/api/v3/portal/{portalId}/mytasks",
        pathParams: JSON.stringify([
          { name: "portalId", type: "string", required: true, description: "Portal ID" },
        ]),
        queryParams: JSON.stringify([
          { name: "status", type: "string", description: "open, inprogress, closed" },
          { name: "index", type: "number", default: 1 },
          { name: "range", type: "number", default: 20 },
        ]),
        aiUsageHint: "Get all tasks assigned to the current user across all projects. Great for daily standups or overdue checks.",
        exampleArgs: JSON.stringify({ portalId: "YOUR_PORTAL_ID", status: "open" }),
      },

      // ── ZOHO MAIL ────────────────────────────────────────────────────────
      {
        name: "mail_list_folders",
        displayName: "Mail: List Folders",
        description: "List all folders in a Zoho Mail account.",
        method: "GET" as const,
        path: "https://mail.zoho.com/api/accounts/{accountId}/folders",
        pathParams: JSON.stringify([
          { name: "accountId", type: "string", required: true, description: "Zoho Mail account ID (use mail_get_accounts first if unknown)" },
        ]),
        aiUsageHint: "List folders in a Zoho Mail account. Folder IDs are needed to fetch messages from specific folders.",
        exampleArgs: JSON.stringify({ accountId: "YOUR_ACCOUNT_ID" }),
      },
      {
        name: "mail_list_messages",
        displayName: "Mail: List Messages",
        description: "List email messages in a Zoho Mail folder.",
        method: "GET" as const,
        path: "https://mail.zoho.com/api/accounts/{accountId}/messages",
        pathParams: JSON.stringify([
          { name: "accountId", type: "string", required: true, description: "Zoho Mail account ID" },
        ]),
        queryParams: JSON.stringify([
          { name: "folderId", type: "string", description: "Folder ID to list messages from (defaults to Inbox)" },
          { name: "start", type: "number", description: "Pagination start index", default: 0 },
          { name: "limit", type: "number", description: "Number of messages to return (max 200)", default: 20 },
          { name: "searchKey", type: "string", description: "Search keyword in subject or body" },
        ]),
        aiUsageHint: "List emails in a Zoho Mail account. Use folderId to target a specific folder. Paginate with start+limit.",
        exampleArgs: JSON.stringify({ accountId: "YOUR_ACCOUNT_ID", limit: 10 }),
      },
      {
        name: "mail_send_email",
        displayName: "Mail: Send Email",
        description: "Send an email from a Zoho Mail account.",
        method: "POST" as const,
        path: "https://mail.zoho.com/api/accounts/{accountId}/messages",
        pathParams: JSON.stringify([
          { name: "accountId", type: "string", required: true, description: "Zoho Mail account ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["toAddress", "subject", "content"],
          properties: {
            fromAddress: { type: "string", description: "Sender email address (must be authorized)" },
            toAddress: { type: "string", description: "Recipient email address(es), comma-separated" },
            ccAddress: { type: "string", description: "CC recipients, comma-separated" },
            bccAddress: { type: "string", description: "BCC recipients, comma-separated" },
            subject: { type: "string", description: "Email subject" },
            content: { type: "string", description: "Email body (plain text or HTML)" },
            mailFormat: { type: "string", description: "html or plaintext", default: "html" },
          },
        }),
        aiUsageHint: "Send an email via Zoho Mail. toAddress, subject, and content are required. Use mailFormat=html for rich text.",
        exampleArgs: JSON.stringify({
          accountId: "YOUR_ACCOUNT_ID",
          toAddress: "recipient@example.com",
          subject: "Follow-up from our meeting",
          content: "<p>Hi,</p><p>Great meeting you today!</p>",
          mailFormat: "html",
        }),
      },
      {
        name: "mail_get_message",
        displayName: "Mail: Get Message",
        description: "Get the full content of a specific email message in Zoho Mail.",
        method: "GET" as const,
        path: "https://mail.zoho.com/api/accounts/{accountId}/messages/{messageId}",
        pathParams: JSON.stringify([
          { name: "accountId", type: "string", required: true, description: "Zoho Mail account ID" },
          { name: "messageId", type: "string", required: true, description: "Email message ID" },
        ]),
        aiUsageHint: "Fetch full email content by message ID. Get message IDs from mail_list_messages.",
        exampleArgs: JSON.stringify({ accountId: "YOUR_ACCOUNT_ID", messageId: "17382939382991" }),
      },

      // ── ZOHO CLIQ ────────────────────────────────────────────────────────
      {
        name: "cliq_post_to_channel",
        displayName: "Cliq: Post to Channel",
        description: "Post a message to a Zoho Cliq channel by channel name.",
        method: "POST" as const,
        path: "https://cliq.zoho.com/api/v2/channelsbyname/{channelName}/message",
        pathParams: JSON.stringify([
          { name: "channelName", type: "string", required: true, description: "Exact channel name (not display name — use unique_name from list_channels)" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["text"],
          properties: {
            text: { type: "string", description: "Message text to send" },
            bot: {
              type: "object",
              description: "Optional bot info for the message",
              properties: {
                name: { type: "string", description: "Bot display name" },
                image: { type: "string", description: "Bot icon URL" },
              },
            },
            slides: {
              type: "array",
              description: "Optional rich content slides for the message",
            },
          },
        }),
        aiUsageHint: "Post a message to a Zoho Cliq channel. channelName is the unique channel name. Use for team notifications.",
        exampleArgs: JSON.stringify({
          channelName: "general",
          text: "🚀 Deployment complete! Version 2.1.0 is now live.",
        }),
      },
      {
        name: "cliq_list_channels",
        displayName: "Cliq: List Channels",
        description: "List all channels accessible to the authenticated user in Zoho Cliq.",
        method: "GET" as const,
        path: "https://cliq.zoho.com/api/v2/channels",
        queryParams: JSON.stringify([
          { name: "limit", type: "number", description: "Max channels to return", default: 20 },
        ]),
        aiUsageHint: "List Zoho Cliq channels. Use this to find the channel unique_name before posting messages.",
        exampleArgs: JSON.stringify({ limit: 50 }),
      },
      {
        name: "cliq_list_users",
        displayName: "Cliq: List Users",
        description: "List users in the Zoho Cliq organization.",
        method: "GET" as const,
        path: "https://cliq.zoho.com/api/v2/users",
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 20 },
          { name: "page_token", type: "string", description: "Pagination token from previous response" },
        ]),
        aiUsageHint: "List users in Zoho Cliq. Useful to find user IDs for direct message targeting.",
        exampleArgs: JSON.stringify({ limit: 50 }),
      },
      {
        name: "cliq_send_direct_message",
        displayName: "Cliq: Send Direct Message",
        description: "Send a direct chat message to a user in Zoho Cliq.",
        method: "POST" as const,
        path: "https://cliq.zoho.com/api/v2/chats",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["text", "user_ids"],
          properties: {
            text: { type: "string", description: "Message text" },
            user_ids: { type: "array", items: { type: "string" }, description: "Array of Zoho Cliq user IDs to message" },
          },
        }),
        aiUsageHint: "Send a direct message to one or more users in Zoho Cliq. Use cliq_list_users to find user IDs.",
        exampleArgs: JSON.stringify({
          text: "Hey! Your task has been completed.",
          user_ids: ["USER_ID_1"],
        }),
      },

      // ── ZOHO WORKDRIVE ───────────────────────────────────────────────────
      {
        name: "workdrive_list_team_folders",
        displayName: "WorkDrive: List Team Folders",
        description: "List all Team Folders in Zoho WorkDrive.",
        method: "GET" as const,
        path: "https://workdrive.zoho.com/api/v1/teamfolders",
        queryParams: JSON.stringify([
          { name: "page_token", type: "string", description: "Pagination token for next page" },
        ]),
        aiUsageHint: "List Team Folders in Zoho WorkDrive. Use to discover folder IDs for uploading or browsing files.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "workdrive_list_files",
        displayName: "WorkDrive: List Files in Folder",
        description: "List files and sub-folders within a specific folder in Zoho WorkDrive.",
        method: "GET" as const,
        path: "https://workdrive.zoho.com/api/v1/files/{folderId}/files",
        pathParams: JSON.stringify([
          { name: "folderId", type: "string", required: true, description: "Folder ID (get from list_team_folders)" },
        ]),
        queryParams: JSON.stringify([
          { name: "page_token", type: "string", description: "Pagination token" },
        ]),
        aiUsageHint: "List files in a Zoho WorkDrive folder. Get folderId from workdrive_list_team_folders.",
        exampleArgs: JSON.stringify({ folderId: "YOUR_FOLDER_ID" }),
      },
      {
        name: "workdrive_get_file",
        displayName: "WorkDrive: Get File Details",
        description: "Get metadata and details for a specific file in Zoho WorkDrive.",
        method: "GET" as const,
        path: "https://workdrive.zoho.com/api/v1/files/{fileId}",
        pathParams: JSON.stringify([
          { name: "fileId", type: "string", required: true, description: "File ID from WorkDrive" },
        ]),
        aiUsageHint: "Fetch metadata for a specific file in Zoho WorkDrive — name, size, modified time, download URL.",
        exampleArgs: JSON.stringify({ fileId: "YOUR_FILE_ID" }),
      },
      {
        name: "workdrive_create_folder",
        displayName: "WorkDrive: Create Folder",
        description: "Create a new folder inside a parent folder in Zoho WorkDrive.",
        method: "POST" as const,
        path: "https://workdrive.zoho.com/api/v1/files",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["data"],
          properties: {
            data: {
              type: "object",
              properties: {
                attributes: {
                  type: "object",
                  required: ["name", "parent_id"],
                  properties: {
                    name: { type: "string", description: "Folder name" },
                    parent_id: { type: "string", description: "Parent folder ID where the new folder will be created" },
                  },
                },
                type: { type: "string", const: "files", description: "Resource type — always 'files'" },
              },
            },
          },
        }),
        aiUsageHint: "Create a new folder in Zoho WorkDrive under a specified parent folder. Uses JSON:API request format.",
        exampleArgs: JSON.stringify({
          data: {
            attributes: { name: "Q1 2026 Reports", parent_id: "YOUR_PARENT_FOLDER_ID" },
            type: "files",
          },
        }),
      },

      // ── ZOHO PEOPLE ──────────────────────────────────────────────────────
      {
        name: "people_list_employees",
        displayName: "People: List Employees",
        description: "List employee records from Zoho People.",
        method: "GET" as const,
        path: "https://people.zoho.com/people/api/forms/employee/getRecords",
        queryParams: JSON.stringify([
          { name: "sIndex", type: "number", description: "Start index for pagination (1-based)", default: 1 },
          { name: "limit", type: "number", description: "Number of records to return (max 200)", default: 20 },
          { name: "searchColumn", type: "string", description: "Column to filter by e.g. Department, Designation" },
          { name: "searchValue", type: "string", description: "Value to filter by" },
        ]),
        aiUsageHint: "List employees from Zoho People. Filter by department using searchColumn=Department&searchValue=Engineering.",
        exampleArgs: JSON.stringify({ sIndex: 1, limit: 50 }),
      },
      {
        name: "people_get_employee",
        displayName: "People: Get Employee",
        description: "Get details of a specific employee from Zoho People by employee ID or email.",
        method: "GET" as const,
        path: "https://people.zoho.com/people/api/forms/employee/getDataByID",
        queryParams: JSON.stringify([
          { name: "recordId", type: "string", required: true, description: "Employee record ID or email address" },
        ]),
        aiUsageHint: "Fetch a specific employee's profile from Zoho People using their record ID or email.",
        exampleArgs: JSON.stringify({ recordId: "employee@company.com" }),
      },
      {
        name: "people_list_leave_types",
        displayName: "People: List Leave Types",
        description: "Get all leave types configured in Zoho People.",
        method: "GET" as const,
        path: "https://people.zoho.com/people/api/leave/getLeaveTypeDetails",
        aiUsageHint: "Fetch all configured leave types in Zoho People (e.g. Sick Leave, Vacation, Maternity). Used to get leave type IDs.",
        exampleArgs: JSON.stringify({}),
      },
    ];

    const toolIds: string[] = [];
    for (const tool of tools) {
      const toolId = await ctx.db.insert("blueprintTools", {
        ...tool,
        blueprintId,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
      toolIds.push(toolId);
    }

    return {
      message: "✅ Zoho Workspace blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      appsIncluded: ["Zoho CRM", "Zoho Books", "Zoho Desk", "Zoho Projects", "Zoho Mail", "Zoho Cliq", "Zoho WorkDrive", "Zoho People"],
      nextSteps: [
        "1. Create OAuth app at: https://api-console.zoho.com/",
        "   → Type: Server-based Application",
        "   → Redirect URI: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback",
        "2. Set ZOHO_CLIENT_ID in Convex environment variables",
        "3. Set OAUTH_SECRET_ZOHO in Convex environment variables (Client Secret value)",
        "4. Deploy Convex: npx convex dev --once --typecheck=disable",
        "5. Navigate to /integrations in the app → connect Zoho Workspace via OAuth",
      ],
    };
  },
});
