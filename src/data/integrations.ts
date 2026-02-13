export type IntegrationCategory =
  | "CRM"
  | "File Storage"
  | "Document & Knowledge"
  | "Communication"
  | "Sales"
  | "Project Management"
  | "Support"
  | "Marketing"
  | "Office Suite"
  | "Analytics"
  | "Accounting"
  | "E-commerce"
  | "Advertising"
  | "E-Signature"
  | "Business Intelligence"
  | "Social Media"
  | "Payments"
  | "HR";

export type IntegrationStatus = "available" | "coming_soon";

export interface Integration {
  slug: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  iconUrl: string;
  status: IntegrationStatus;
}

export const INTEGRATION_CATEGORIES: IntegrationCategory[] = [
  "CRM",
  "File Storage",
  "Document & Knowledge",
  "Communication",
  "Sales",
  "Project Management",
  "Support",
  "Marketing",
  "Office Suite",
  "Analytics",
  "Accounting",
  "E-commerce",
  "Advertising",
  "E-Signature",
  "Business Intelligence",
  "Social Media",
  "Payments",
  "HR",
];

export const CATEGORY_CONFIG: Record<IntegrationCategory, { emoji: string; color: string }> = {
  "CRM": { emoji: "🤝", color: "blue" },
  "File Storage": { emoji: "📁", color: "indigo" },
  "Document & Knowledge": { emoji: "📚", color: "purple" },
  "Communication": { emoji: "💬", color: "green" },
  "Sales": { emoji: "📈", color: "emerald" },
  "Project Management": { emoji: "📋", color: "orange" },
  "Support": { emoji: "🎧", color: "rose" },
  "Marketing": { emoji: "📣", color: "pink" },
  "Office Suite": { emoji: "🏢", color: "slate" },
  "Analytics": { emoji: "📊", color: "cyan" },
  "Accounting": { emoji: "🧾", color: "amber" },
  "E-commerce": { emoji: "🛒", color: "violet" },
  "Advertising": { emoji: "📺", color: "red" },
  "E-Signature": { emoji: "✍️", color: "teal" },
  "Business Intelligence": { emoji: "🔍", color: "sky" },
  "Social Media": { emoji: "📱", color: "fuchsia" },
  "Payments": { emoji: "💳", color: "lime" },
  "HR": { emoji: "👥", color: "yellow" },
};

export const INTEGRATIONS: Integration[] = [
  // CRM Integrations
  { slug: "salesforce", name: "Salesforce", category: "CRM", description: "Sync contacts, deals, and accounts with Salesforce CRM", iconUrl: "https://img.logo.dev/salesforce.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "hubspot", name: "HubSpot", category: "CRM", description: "Manage contacts, companies, and deals in HubSpot", iconUrl: "https://img.logo.dev/hubspot.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "dynamics365-sales", name: "Microsoft Dynamics 365 Sales", category: "CRM", description: "Connect with Microsoft Dynamics 365 for sales operations", iconUrl: "https://img.logo.dev/microsoft.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "pipedrive", name: "Pipedrive", category: "CRM", description: "Manage your sales pipeline in Pipedrive", iconUrl: "https://img.logo.dev/pipedrive.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "zoho-crm", name: "Zoho CRM", category: "CRM", description: "Access Zoho CRM contacts and opportunities", iconUrl: "https://img.logo.dev/zoho.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "close", name: "Close", category: "CRM", description: "Integrate with Close CRM for sales tracking", iconUrl: "https://img.logo.dev/close.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "zendesk-sell", name: "Zendesk Sell", category: "CRM", description: "Connect with Zendesk Sell (formerly Base)", iconUrl: "https://img.logo.dev/zendesk.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "insightly", name: "Insightly", category: "CRM", description: "Sync with Insightly CRM and project management", iconUrl: "https://img.logo.dev/insightly.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "copper", name: "Copper", category: "CRM", description: "Integrate with Copper CRM (formerly ProsperWorks)", iconUrl: "https://img.logo.dev/copper.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "keap", name: "Keap", category: "CRM", description: "Connect with Keap (formerly Infusionsoft)", iconUrl: "https://img.logo.dev/keap.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "freshsales", name: "Freshsales", category: "CRM", description: "Integrate with Freshsales CRM platform", iconUrl: "https://img.logo.dev/freshworks.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },

  // File Storage
  { slug: "google-drive", name: "Google Drive", category: "File Storage", description: "Access and manage files in Google Drive", iconUrl: "https://img.logo.dev/drive.google.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "dropbox", name: "Dropbox", category: "File Storage", description: "Read and write files to Dropbox", iconUrl: "https://img.logo.dev/dropbox.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "sharepoint", name: "Microsoft SharePoint", category: "File Storage", description: "Access SharePoint document libraries", iconUrl: "https://img.logo.dev/microsoft.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "box", name: "Box", category: "File Storage", description: "Manage files and folders in Box", iconUrl: "https://img.logo.dev/box.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "onedrive", name: "OneDrive", category: "File Storage", description: "Access Microsoft OneDrive files", iconUrl: "https://img.logo.dev/onedrive.live.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },

  // Document & Knowledge
  { slug: "notion", name: "Notion", category: "Document & Knowledge", description: "Read and create pages in Notion workspaces", iconUrl: "https://img.logo.dev/notion.so?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "onenote", name: "OneNote", category: "Document & Knowledge", description: "Access Microsoft OneNote notebooks", iconUrl: "https://img.logo.dev/microsoft.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "confluence", name: "Confluence", category: "Document & Knowledge", description: "Search and create Confluence pages", iconUrl: "https://img.logo.dev/atlassian.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "google-docs", name: "Google Docs", category: "Document & Knowledge", description: "Create and edit Google Docs", iconUrl: "https://img.logo.dev/docs.google.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "coda", name: "Coda", category: "Document & Knowledge", description: "Integrate with Coda docs and tables", iconUrl: "https://img.logo.dev/coda.io?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "quip", name: "Quip", category: "Document & Knowledge", description: "Access Quip documents and spreadsheets", iconUrl: "https://img.logo.dev/quip.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },

  // Communication & Messaging
  { slug: "slack", name: "Slack", category: "Communication", description: "Send messages and read channels in Slack", iconUrl: "https://img.logo.dev/slack.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "microsoft-teams", name: "Microsoft Teams", category: "Communication", description: "Post messages to Teams channels", iconUrl: "https://img.logo.dev/microsoft.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "zoom", name: "Zoom", category: "Communication", description: "Schedule and manage Zoom meetings", iconUrl: "https://img.logo.dev/zoom.us?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "whatsapp", name: "WhatsApp", category: "Communication", description: "Send WhatsApp messages via Business API", iconUrl: "https://img.logo.dev/whatsapp.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "emarsys", name: "Emarsys", category: "Communication", description: "Connect with Emarsys marketing automation", iconUrl: "https://img.logo.dev/emarsys.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },

  // Sales & Revenue Tools
  { slug: "outreach", name: "Outreach", category: "Sales", description: "Integrate with Outreach sales engagement platform", iconUrl: "https://img.logo.dev/outreach.io?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "gong", name: "Gong", category: "Sales", description: "Access Gong call recordings and insights", iconUrl: "https://img.logo.dev/gong.io?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "salesloft", name: "Salesloft", category: "Sales", description: "Connect with Salesloft cadences and activities", iconUrl: "https://img.logo.dev/salesloft.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "apollo", name: "Apollo.io", category: "Sales", description: "Search contacts and enrich leads with Apollo", iconUrl: "https://img.logo.dev/apollo.io?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },

  // Project & Task Management
  { slug: "jira", name: "JIRA", category: "Project Management", description: "Create and update Jira issues and projects", iconUrl: "https://img.logo.dev/atlassian.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "asana", name: "Asana", category: "Project Management", description: "Manage tasks and projects in Asana", iconUrl: "https://img.logo.dev/asana.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "trello", name: "Trello", category: "Project Management", description: "Create cards and manage Trello boards", iconUrl: "https://img.logo.dev/trello.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "monday", name: "Monday.com", category: "Project Management", description: "Connect with Monday.com work operating system", iconUrl: "https://img.logo.dev/monday.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "azure-devops", name: "Azure DevOps", category: "Project Management", description: "Manage Azure DevOps work items and repos", iconUrl: "https://img.logo.dev/microsoft.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "clickup", name: "ClickUp", category: "Project Management", description: "Create and update ClickUp tasks", iconUrl: "https://img.logo.dev/clickup.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "linear", name: "Linear", category: "Project Management", description: "Manage Linear issues and projects", iconUrl: "https://img.logo.dev/linear.app?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "github", name: "GitHub", category: "Project Management", description: "Access GitHub repos, issues, and pull requests", iconUrl: "https://img.logo.dev/github.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "productboard", name: "Productboard", category: "Project Management", description: "Sync product features and feedback", iconUrl: "https://img.logo.dev/productboard.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "hive", name: "Hive", category: "Project Management", description: "Manage Hive projects and actions", iconUrl: "https://img.logo.dev/hive.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "shortcut", name: "Shortcut", category: "Project Management", description: "Connect with Shortcut (formerly Clubhouse)", iconUrl: "https://img.logo.dev/shortcut.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "todoist", name: "Todoist", category: "Project Management", description: "Manage Todoist tasks and projects", iconUrl: "https://img.logo.dev/todoist.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "airtable", name: "Airtable", category: "Project Management", description: "Read and write Airtable bases and records", iconUrl: "https://img.logo.dev/airtable.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },

  // Support & Ticketing
  { slug: "intercom", name: "Intercom", category: "Support", description: "Manage Intercom conversations and contacts", iconUrl: "https://img.logo.dev/intercom.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "zendesk", name: "Zendesk", category: "Support", description: "Create and update Zendesk support tickets", iconUrl: "https://img.logo.dev/zendesk.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "servicenow", name: "ServiceNow", category: "Support", description: "Access ServiceNow incidents and requests", iconUrl: "https://img.logo.dev/servicenow.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "freshdesk", name: "Freshdesk", category: "Support", description: "Manage Freshdesk tickets and contacts", iconUrl: "https://img.logo.dev/freshworks.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "gainsight", name: "Gainsight", category: "Support", description: "Connect with Gainsight customer success data", iconUrl: "https://img.logo.dev/gainsight.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "front", name: "Front", category: "Support", description: "Manage Front shared inboxes", iconUrl: "https://img.logo.dev/front.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "pagerduty", name: "PagerDuty", category: "Support", description: "Trigger and manage PagerDuty incidents", iconUrl: "https://img.logo.dev/pagerduty.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },

  // Marketing Tools
  { slug: "vimeo", name: "Vimeo", category: "Marketing", description: "Upload and manage Vimeo videos", iconUrl: "https://img.logo.dev/vimeo.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "klaviyo", name: "Klaviyo", category: "Marketing", description: "Sync Klaviyo email campaigns and lists", iconUrl: "https://img.logo.dev/klaviyo.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "mailchimp", name: "MailChimp", category: "Marketing", description: "Manage MailChimp campaigns and audiences", iconUrl: "https://img.logo.dev/mailchimp.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "marketo", name: "Marketo", category: "Marketing", description: "Connect with Marketo marketing automation", iconUrl: "https://img.logo.dev/marketo.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "pardot", name: "Pardot", category: "Marketing", description: "Access Salesforce Pardot data", iconUrl: "https://img.logo.dev/salesforce.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "oracle-eloqua", name: "Oracle Eloqua", category: "Marketing", description: "Integrate with Oracle Eloqua platform", iconUrl: "https://img.logo.dev/oracle.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "activecampaign", name: "ActiveCampaign", category: "Marketing", description: "Sync ActiveCampaign contacts and automations", iconUrl: "https://img.logo.dev/activecampaign.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "sailthru", name: "Sailthru", category: "Marketing", description: "Connect with Sailthru email marketing", iconUrl: "https://img.logo.dev/sailthru.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "coming_soon" },

  // Office Suite & Productivity
  { slug: "google-sheets", name: "Google Sheets", category: "Office Suite", description: "Read and write Google Sheets data", iconUrl: "https://img.logo.dev/sheets.google.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "google-calendar", name: "Google Calendar", category: "Office Suite", description: "Create and manage Google Calendar events", iconUrl: "https://img.logo.dev/calendar.google.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "outlook", name: "Microsoft Outlook", category: "Office Suite", description: "Access Outlook email and calendar", iconUrl: "https://img.logo.dev/outlook.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "calendly", name: "Calendly", category: "Office Suite", description: "Manage Calendly scheduling links", iconUrl: "https://img.logo.dev/calendly.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "gmail", name: "Gmail", category: "Office Suite", description: "Send and read Gmail messages", iconUrl: "https://img.logo.dev/gmail.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "miro", name: "Miro", category: "Office Suite", description: "Access Miro boards and content", iconUrl: "https://img.logo.dev/miro.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "imanage", name: "iManage", category: "Office Suite", description: "Connect with iManage document management", iconUrl: "https://img.logo.dev/imanage.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "excel", name: "Excel", category: "Office Suite", description: "Read and write Microsoft Excel files", iconUrl: "https://img.logo.dev/microsoft.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "stackoverflow-teams", name: "Stack Overflow for Teams", category: "Office Suite", description: "Access Stack Overflow Teams knowledge", iconUrl: "https://img.logo.dev/stackoverflow.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "typeform", name: "Typeform", category: "Office Suite", description: "Collect Typeform survey responses", iconUrl: "https://img.logo.dev/typeform.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "vanta", name: "Vanta", category: "Office Suite", description: "Access Vanta compliance data", iconUrl: "https://img.logo.dev/vanta.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "coming_soon" },

  // Analytics
  { slug: "google-analytics", name: "Google Analytics", category: "Analytics", description: "Access Google Analytics reports and data", iconUrl: "https://img.logo.dev/analytics.google.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "google-search-console", name: "Google Search Console", category: "Analytics", description: "Get Search Console insights and data", iconUrl: "https://img.logo.dev/search.google.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "google-analytics-ga4", name: "Google Analytics GA4", category: "Analytics", description: "Access Google Analytics 4 properties", iconUrl: "https://img.logo.dev/analytics.google.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "mixpanel", name: "Mixpanel", category: "Analytics", description: "Query Mixpanel product analytics", iconUrl: "https://img.logo.dev/mixpanel.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "heap", name: "Heap", category: "Analytics", description: "Access Heap analytics data", iconUrl: "https://img.logo.dev/heap.io?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },

  // Accounting & Finance
  { slug: "quickbooks", name: "QuickBooks", category: "Accounting", description: "Sync QuickBooks invoices and transactions", iconUrl: "https://img.logo.dev/quickbooks.intuit.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "xero", name: "Xero", category: "Accounting", description: "Manage Xero accounting data", iconUrl: "https://img.logo.dev/xero.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "sage-intacct", name: "Sage Intacct", category: "Accounting", description: "Connect with Sage Intacct financials", iconUrl: "https://img.logo.dev/sage.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "netsuite", name: "NetSuite", category: "Accounting", description: "Access Oracle NetSuite ERP data", iconUrl: "https://img.logo.dev/netsuite.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "dynamics365-bc", name: "Dynamics 365 Business Central", category: "Accounting", description: "Connect with Microsoft Business Central", iconUrl: "https://img.logo.dev/microsoft.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "sap-s4hana", name: "SAP S/4HANA", category: "Accounting", description: "Integrate with SAP S/4HANA", iconUrl: "https://img.logo.dev/sap.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "coming_soon" },
  { slug: "oracle-financials", name: "Oracle Financials Cloud", category: "Accounting", description: "Access Oracle Financials data", iconUrl: "https://img.logo.dev/oracle.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "coming_soon" },
  { slug: "dynamics365-finance", name: "Dynamics 365 Finance", category: "Accounting", description: "Connect with Dynamics 365 Finance", iconUrl: "https://img.logo.dev/microsoft.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "coming_soon" },
  { slug: "sage-accounting", name: "Sage Accounting", category: "Accounting", description: "Manage Sage Accounting data", iconUrl: "https://img.logo.dev/sage.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },

  // E-commerce
  { slug: "shopify", name: "Shopify", category: "E-commerce", description: "Sync Shopify products, orders, and customers", iconUrl: "https://img.logo.dev/shopify.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "woocommerce", name: "WooCommerce", category: "E-commerce", description: "Manage WooCommerce store data", iconUrl: "https://img.logo.dev/woocommerce.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "adobe-commerce", name: "Adobe Commerce", category: "E-commerce", description: "Connect with Adobe Commerce (Magento)", iconUrl: "https://img.logo.dev/magento.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "unleashed", name: "Unleashed", category: "E-commerce", description: "Access Unleashed inventory management", iconUrl: "https://img.logo.dev/unleashedsoftware.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },

  // Advertising
  { slug: "facebook-ads", name: "Facebook Ads", category: "Advertising", description: "Manage Facebook advertising campaigns", iconUrl: "https://img.logo.dev/facebook.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "google-campaign-manager", name: "Google Campaign Manager", category: "Advertising", description: "Access Google Campaign Manager data", iconUrl: "https://img.logo.dev/google.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "google-ads", name: "Google Ads", category: "Advertising", description: "Manage Google Ads campaigns", iconUrl: "https://img.logo.dev/ads.google.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "google-ad-manager", name: "Google Ad Manager", category: "Advertising", description: "Access Google Ad Manager reports", iconUrl: "https://img.logo.dev/google.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "tiktok-ads", name: "TikTok Ads", category: "Advertising", description: "Manage TikTok advertising campaigns", iconUrl: "https://img.logo.dev/tiktok.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },

  // E-Signature & Documents
  { slug: "docusign", name: "DocuSign", category: "E-Signature", description: "Send and track DocuSign envelopes", iconUrl: "https://img.logo.dev/docusign.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "pandadoc", name: "PandaDoc", category: "E-Signature", description: "Create and send PandaDoc documents", iconUrl: "https://img.logo.dev/pandadoc.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "dropbox-sign", name: "Dropbox Sign", category: "E-Signature", description: "Send signature requests via Dropbox Sign", iconUrl: "https://img.logo.dev/hellosign.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "adobe-sign", name: "Adobe Acrobat Sign", category: "E-Signature", description: "Manage Adobe Sign agreements", iconUrl: "https://img.logo.dev/adobe.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },

  // Business Intelligence
  { slug: "tableau", name: "Tableau", category: "Business Intelligence", description: "Access Tableau dashboards and data", iconUrl: "https://img.logo.dev/tableau.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "bigquery", name: "BigQuery", category: "Business Intelligence", description: "Query Google BigQuery datasets", iconUrl: "https://img.logo.dev/cloud.google.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "amazon-s3", name: "Amazon S3", category: "Business Intelligence", description: "Read and write files to S3 buckets", iconUrl: "https://img.logo.dev/aws.amazon.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "power-bi", name: "Power BI", category: "Business Intelligence", description: "Access Power BI reports and datasets", iconUrl: "https://img.logo.dev/powerbi.microsoft.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "segment", name: "Segment", category: "Business Intelligence", description: "Stream events to Segment CDP", iconUrl: "https://img.logo.dev/segment.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "snowflake", name: "Snowflake", category: "Business Intelligence", description: "Query Snowflake data warehouse", iconUrl: "https://img.logo.dev/snowflake.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "amplitude", name: "Amplitude", category: "Business Intelligence", description: "Access Amplitude analytics data", iconUrl: "https://img.logo.dev/amplitude.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "coming_soon" },

  // Social Media
  { slug: "linkedin", name: "LinkedIn", category: "Social Media", description: "Post updates and manage LinkedIn presence", iconUrl: "https://img.logo.dev/linkedin.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "facebook-pages", name: "Facebook Pages", category: "Social Media", description: "Manage Facebook business pages", iconUrl: "https://img.logo.dev/facebook.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },

  // Payments
  { slug: "stripe", name: "Stripe", category: "Payments", description: "Access Stripe payments and customer data", iconUrl: "https://img.logo.dev/stripe.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "ramp", name: "Ramp", category: "Payments", description: "Manage Ramp corporate card transactions", iconUrl: "https://img.logo.dev/ramp.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },

  // HR & Other
  { slug: "adp-workforce-now", name: "ADP Workforce Now", category: "HR", description: "Access ADP employee and payroll data", iconUrl: "https://img.logo.dev/adp.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "bamboohr", name: "BambooHR", category: "HR", description: "Manage BambooHR employee records", iconUrl: "https://img.logo.dev/bamboohr.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "greenhouse", name: "Greenhouse", category: "HR", description: "Access Greenhouse recruiting data", iconUrl: "https://img.logo.dev/greenhouse.io?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "gusto", name: "Gusto", category: "HR", description: "Connect with Gusto payroll and benefits", iconUrl: "https://img.logo.dev/gusto.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "workable", name: "Workable", category: "HR", description: "Manage Workable recruiting pipeline", iconUrl: "https://img.logo.dev/workable.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "workday", name: "Workday", category: "HR", description: "Access Workday HCM data", iconUrl: "https://img.logo.dev/workday.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
  { slug: "zoho-people", name: "Zoho People", category: "HR", description: "Manage Zoho People HR records", iconUrl: "https://img.logo.dev/zoho.com?token=pk_X_8rMgRWQqC1DCEEqPn3cA&size=64", status: "available" },
];
