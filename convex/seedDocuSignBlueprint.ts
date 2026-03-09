/**
 * Seed DocuSign integration blueprint
 * Run this once to create the DocuSign blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedDocuSignBlueprint -> Run
 *
 * Prerequisites:
 * - Create an OAuth app at https://developers.docusign.com/
 * - Set OAUTH_SECRET_DOCUSIGN env var in Convex dashboard
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "docusign"))
      .first();

    if (existing) {
      return {
        message: "DocuSign blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "docusign",
      name: "DocuSign",
      description:
        "E-signature platform. Create, send, and manage signature envelopes. Track document status, collect signatures, and retrieve completed documents.",
      category: "productivity",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: "",
        clientSecret: "OAUTH_SECRET_DOCUSIGN",
        authorizeUrl: "https://account.docusign.com/oauth/auth",
        tokenUrl: "https://account.docusign.com/oauth/token",
        scopes: ["signature", "impersonation"],
        scopeSeparator: "space",
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://na4.docusign.net/restapi/v2.1",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developers.docusign.com/docs/esign-rest-api/reference/",
      iconUrl: "https://cdn.simpleicons.org/docusign/FFB800",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_envelopes",
        displayName: "List Envelopes",
        description: "List envelopes in the DocuSign account. Filter by status, date range, and more.",
        method: "GET" as const,
        path: "/accounts/{accountId}/envelopes",
        pathParams: JSON.stringify([
          { name: "accountId", type: "string", required: true, description: "DocuSign account ID (from user info endpoint)" },
        ]),
        queryParams: JSON.stringify([
          { name: "status", type: "string", description: "Filter by status: sent, delivered, completed, declined, voided" },
          { name: "from_date", type: "string", description: "Start date in ISO 8601 format" },
          { name: "to_date", type: "string", description: "End date in ISO 8601 format" },
          { name: "count", type: "number", description: "Number to return", default: 20 },
          { name: "start_position", type: "number", description: "Offset for pagination", default: 0 },
        ]),
        aiUsageHint: "List DocuSign envelopes. Filter by status='completed' for signed documents or status='sent' for pending ones.",
        exampleArgs: JSON.stringify({ accountId: "ACCOUNT_ID", status: "sent" }),
      },
      {
        name: "get_envelope",
        displayName: "Get Envelope",
        description: "Get detailed information about a specific DocuSign envelope including status and recipients.",
        method: "GET" as const,
        path: "/accounts/{accountId}/envelopes/{envelopeId}",
        pathParams: JSON.stringify([
          { name: "accountId", type: "string", required: true, description: "DocuSign account ID" },
          { name: "envelopeId", type: "string", required: true, description: "Envelope ID" },
        ]),
        aiUsageHint: "Get details of a specific DocuSign envelope including status, recipients, and dates.",
        exampleArgs: JSON.stringify({ accountId: "ACCOUNT_ID", envelopeId: "ENVELOPE_ID" }),
      },
      {
        name: "create_envelope",
        displayName: "Create Envelope",
        description: "Create a new DocuSign envelope with documents and recipients. Set status to 'sent' to immediately send for signature.",
        method: "POST" as const,
        path: "/accounts/{accountId}/envelopes",
        pathParams: JSON.stringify([
          { name: "accountId", type: "string", required: true, description: "DocuSign account ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["status", "emailSubject", "documents", "recipients"],
          properties: {
            status: { type: "string", enum: ["created", "sent"], description: "Use 'sent' to send immediately, 'created' to save as draft" },
            emailSubject: { type: "string", description: "Email subject line for the signing request" },
            emailBlurb: { type: "string", description: "Email body message" },
            documents: {
              type: "array",
              description: "Documents to sign",
              items: {
                type: "object",
                properties: {
                  documentBase64: { type: "string", description: "Base64-encoded document content" },
                  name: { type: "string", description: "Document display name" },
                  fileExtension: { type: "string", description: "File extension: pdf, docx, etc." },
                  documentId: { type: "string", description: "Unique document ID within this envelope" },
                },
              },
            },
            recipients: {
              type: "object",
              properties: {
                signers: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      email: { type: "string" },
                      name: { type: "string" },
                      recipientId: { type: "string" },
                      routingOrder: { type: "string" },
                      tabs: { type: "object", description: "Signature tabs and field positions" },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint: "Create a DocuSign envelope to request signatures. Set status='sent' to send immediately. Documents must be base64-encoded.",
        exampleArgs: JSON.stringify({
          accountId: "ACCOUNT_ID",
          status: "sent",
          emailSubject: "Please sign this document",
          documents: [{ documentBase64: "BASE64_PDF", name: "Contract", fileExtension: "pdf", documentId: "1" }],
          recipients: { signers: [{ email: "signer@example.com", name: "John Doe", recipientId: "1", routingOrder: "1" }] },
        }),
      },
      {
        name: "get_envelope_status",
        displayName: "Get Envelope Status",
        description: "Get the current status and recipient completion status of an envelope.",
        method: "GET" as const,
        path: "/accounts/{accountId}/envelopes/{envelopeId}/recipients",
        pathParams: JSON.stringify([
          { name: "accountId", type: "string", required: true },
          { name: "envelopeId", type: "string", required: true },
        ]),
        aiUsageHint: "Check who has signed and who hasn't in a DocuSign envelope. Returns recipient status.",
        exampleArgs: JSON.stringify({ accountId: "ACCOUNT_ID", envelopeId: "ENVELOPE_ID" }),
      },
      {
        name: "get_document",
        displayName: "Get Signed Document",
        description: "Download a completed document from a DocuSign envelope as PDF.",
        method: "GET" as const,
        path: "/accounts/{accountId}/envelopes/{envelopeId}/documents/{documentId}",
        pathParams: JSON.stringify([
          { name: "accountId", type: "string", required: true },
          { name: "envelopeId", type: "string", required: true },
          { name: "documentId", type: "string", required: true, description: "Use 'combined' to get all docs merged" },
        ]),
        aiUsageHint: "Download a signed PDF from a completed DocuSign envelope. Use documentId='combined' to get all documents merged into one PDF.",
        exampleArgs: JSON.stringify({ accountId: "ACCOUNT_ID", envelopeId: "ENVELOPE_ID", documentId: "combined" }),
      },
      {
        name: "void_envelope",
        displayName: "Void Envelope",
        description: "Void (cancel) an in-progress DocuSign envelope.",
        method: "PUT" as const,
        path: "/accounts/{accountId}/envelopes/{envelopeId}",
        pathParams: JSON.stringify([
          { name: "accountId", type: "string", required: true },
          { name: "envelopeId", type: "string", required: true },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["status", "voidedReason"],
          properties: {
            status: { type: "string", enum: ["voided"] },
            voidedReason: { type: "string", description: "Reason for voiding the envelope" },
          },
        }),
        aiUsageHint: "Cancel/void a DocuSign envelope that hasn't been completed yet. Provide a reason for voiding.",
        exampleArgs: JSON.stringify({ accountId: "ACCOUNT_ID", envelopeId: "ENVELOPE_ID", status: "voided", voidedReason: "Document sent in error" }),
      },
      {
        name: "resend_envelope",
        displayName: "Resend Envelope",
        description: "Resend the signing request email to recipients who haven't signed yet.",
        method: "PUT" as const,
        path: "/accounts/{accountId}/envelopes/{envelopeId}/recipients",
        pathParams: JSON.stringify([
          { name: "accountId", type: "string", required: true },
          { name: "envelopeId", type: "string", required: true },
        ]),
        queryParams: JSON.stringify([
          { name: "resend_envelope", type: "boolean", description: "Set to true to resend", default: true },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            signers: { type: "array", items: { type: "object", properties: { recipientId: { type: "string" } } } },
          },
        }),
        aiUsageHint: "Resend DocuSign signing email to pending recipients. Use when a recipient says they didn't get the email.",
        exampleArgs: JSON.stringify({ accountId: "ACCOUNT_ID", envelopeId: "ENVELOPE_ID", resend_envelope: true }),
      },
    ];

    const toolIds = [];
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
      message: "✅ DocuSign blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      nextSteps: [
        "1. Create OAuth app at https://admindemo.docusign.com/apps-and-keys",
        "2. Set OAUTH_SECRET_DOCUSIGN in Convex environment variables",
        "3. Note: accountId is returned during OAuth token exchange as 'sub' or via /oauth/userinfo",
      ],
    };
  },
});
