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
  { slug: "salesforce", name: "Salesforce", category: "CRM", description: "Sync contacts, deals, and accounts with Salesforce CRM", iconUrl: "https://cdn.worldvectorlogo.com/logos/salesforce-2.svg", status: "available" },
  { slug: "hubspot", name: "HubSpot", category: "CRM", description: "Manage contacts, companies, and deals in HubSpot", iconUrl: "https://cdn.worldvectorlogo.com/logos/hubspot-2.svg", status: "available" },
  { slug: "dynamics365-sales", name: "Microsoft Dynamics 365 Sales", category: "CRM", description: "Connect with Microsoft Dynamics 365 for sales operations", iconUrl: "https://cdn.worldvectorlogo.com/logos/microsoft-5.svg", status: "available" },
  { slug: "pipedrive", name: "Pipedrive", category: "CRM", description: "Manage your sales pipeline in Pipedrive", iconUrl: "https://cdn.worldvectorlogo.com/logos/pipedrive.svg", status: "available" },
  { slug: "zoho-crm", name: "Zoho CRM", category: "CRM", description: "Access Zoho CRM contacts and opportunities", iconUrl: "https://cdn.worldvectorlogo.com/logos/zoho.svg", status: "available" },
  { slug: "close", name: "Close", category: "CRM", description: "Integrate with Close CRM for sales tracking", iconUrl: "https://cdn.simpleicons.org/close/000000", status: "available" },
  { slug: "zendesk-sell", name: "Zendesk Sell", category: "CRM", description: "Connect with Zendesk Sell (formerly Base)", iconUrl: "https://cdn.worldvectorlogo.com/logos/zendesk-1.svg", status: "available" },
  { slug: "insightly", name: "Insightly", category: "CRM", description: "Sync with Insightly CRM and project management", iconUrl: "https://logo.clearbit.com/insightly.com", status: "available" },
  { slug: "copper", name: "Copper", category: "CRM", description: "Integrate with Copper CRM (formerly ProsperWorks)", iconUrl: "https://logo.clearbit.com/copper.com", status: "available" },
  { slug: "keap", name: "Keap", category: "CRM", description: "Connect with Keap (formerly Infusionsoft)", iconUrl: "https://cdn.worldvectorlogo.com/logos/keap.svg", status: "available" },
  { slug: "freshsales", name: "Freshsales", category: "CRM", description: "Integrate with Freshsales CRM platform", iconUrl: "https://cdn.worldvectorlogo.com/logos/freshworks-1.svg", status: "available" },

  // File Storage
  { slug: "google-drive", name: "Google Drive", category: "File Storage", description: "Access and manage files in Google Drive", iconUrl: "https://cdn.worldvectorlogo.com/logos/google-drive-2020.svg", status: "available" },
  { slug: "dropbox", name: "Dropbox", category: "File Storage", description: "Read and write files to Dropbox", iconUrl: "https://cdn.worldvectorlogo.com/logos/dropbox-1.svg", status: "available" },
  { slug: "sharepoint", name: "Microsoft SharePoint", category: "File Storage", description: "Access SharePoint document libraries", iconUrl: "https://cdn.worldvectorlogo.com/logos/microsoft-sharepoint-1.svg", status: "available" },
  { slug: "box", name: "Box", category: "File Storage", description: "Manage files and folders in Box", iconUrl: "https://cdn.worldvectorlogo.com/logos/box.svg", status: "available" },
  { slug: "onedrive", name: "OneDrive", category: "File Storage", description: "Access Microsoft OneDrive files", iconUrl: "https://cdn.worldvectorlogo.com/logos/onedrive-1.svg", status: "available" },

  // Document & Knowledge
  { slug: "notion", name: "Notion", category: "Document & Knowledge", description: "Read and create pages in Notion workspaces", iconUrl: "https://cdn.worldvectorlogo.com/logos/notion-2.svg", status: "available" },
  { slug: "onenote", name: "OneNote", category: "Document & Knowledge", description: "Access Microsoft OneNote notebooks", iconUrl: "https://cdn.worldvectorlogo.com/logos/microsoft-onenote-1.svg", status: "available" },
  { slug: "confluence", name: "Confluence", category: "Document & Knowledge", description: "Search and create Confluence pages", iconUrl: "https://cdn.worldvectorlogo.com/logos/confluence-1.svg", status: "available" },
  { slug: "google-docs", name: "Google Docs", category: "Document & Knowledge", description: "Create and edit Google Docs", iconUrl: "https://cdn.worldvectorlogo.com/logos/google-docs.svg", status: "available" },
  { slug: "coda", name: "Coda", category: "Document & Knowledge", description: "Integrate with Coda docs and tables", iconUrl: "https://cdn.worldvectorlogo.com/logos/coda-2.svg", status: "available" },
  { slug: "quip", name: "Quip", category: "Document & Knowledge", description: "Access Quip documents and spreadsheets", iconUrl: "https://cdn.worldvectorlogo.com/logos/quip.svg", status: "available" },

  // Communication & Messaging
  { slug: "slack", name: "Slack", category: "Communication", description: "Send messages and read channels in Slack", iconUrl: "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg", status: "available" },
  { slug: "microsoft-teams", name: "Microsoft Teams", category: "Communication", description: "Post messages to Teams channels", iconUrl: "https://cdn.worldvectorlogo.com/logos/microsoft-teams-1.svg", status: "available" },
  { slug: "zoom", name: "Zoom", category: "Communication", description: "Schedule and manage Zoom meetings", iconUrl: "https://cdn.worldvectorlogo.com/logos/zoom-communications-logo.svg", status: "available" },
  { slug: "whatsapp", name: "WhatsApp", category: "Communication", description: "Send WhatsApp messages via Business API", iconUrl: "https://cdn.worldvectorlogo.com/logos/whatsapp-glyph.svg", status: "available" },
  { slug: "emarsys", name: "Emarsys", category: "Communication", description: "Connect with Emarsys marketing automation", iconUrl: "https://cdn.worldvectorlogo.com/logos/emarsys.svg", status: "available" },

  // Sales & Revenue Tools
  { slug: "outreach", name: "Outreach", category: "Sales", description: "Integrate with Outreach sales engagement platform", iconUrl: "https://cdn.worldvectorlogo.com/logos/outreach-1.svg", status: "available" },
  { slug: "gong", name: "Gong", category: "Sales", description: "Access Gong call recordings and insights", iconUrl: "https://cdn.worldvectorlogo.com/logos/gong-1.svg", status: "available" },
  { slug: "salesloft", name: "Salesloft", category: "Sales", description: "Connect with Salesloft cadences and activities", iconUrl: "https://cdn.worldvectorlogo.com/logos/salesloft.svg", status: "available" },
  { slug: "apollo", name: "Apollo.io", category: "Sales", description: "Search contacts and enrich leads with Apollo", iconUrl: "https://cdn.worldvectorlogo.com/logos/apollo-io.svg", status: "available" },

  // Project & Task Management
  { slug: "jira", name: "JIRA", category: "Project Management", description: "Create and update Jira issues and projects", iconUrl: "https://cdn.worldvectorlogo.com/logos/jira-1.svg", status: "available" },
  { slug: "asana", name: "Asana", category: "Project Management", description: "Manage tasks and projects in Asana", iconUrl: "https://cdn.worldvectorlogo.com/logos/asana-logo.svg", status: "available" },
  { slug: "trello", name: "Trello", category: "Project Management", description: "Create cards and manage Trello boards", iconUrl: "https://cdn.worldvectorlogo.com/logos/trello.svg", status: "available" },
  { slug: "monday", name: "Monday.com", category: "Project Management", description: "Connect with Monday.com work operating system", iconUrl: "https://cdn.worldvectorlogo.com/logos/monday-icon.svg", status: "available" },
  { slug: "azure-devops", name: "Azure DevOps", category: "Project Management", description: "Manage Azure DevOps work items and repos", iconUrl: "https://cdn.worldvectorlogo.com/logos/azure-devops.svg", status: "available" },
  { slug: "clickup", name: "ClickUp", category: "Project Management", description: "Create and update ClickUp tasks", iconUrl: "https://cdn.worldvectorlogo.com/logos/clickup.svg", status: "available" },
  { slug: "linear", name: "Linear", category: "Project Management", description: "Manage Linear issues and projects", iconUrl: "https://cdn.worldvectorlogo.com/logos/linear-icon.svg", status: "available" },
  { slug: "github", name: "GitHub", category: "Project Management", description: "Access GitHub repos, issues, and pull requests", iconUrl: "https://cdn.worldvectorlogo.com/logos/github-icon-1.svg", status: "available" },
  { slug: "productboard", name: "Productboard", category: "Project Management", description: "Sync product features and feedback", iconUrl: "https://cdn.worldvectorlogo.com/logos/productboard.svg", status: "available" },
  { slug: "hive", name: "Hive", category: "Project Management", description: "Manage Hive projects and actions", iconUrl: "https://cdn.worldvectorlogo.com/logos/hive-2.svg", status: "available" },
  { slug: "shortcut", name: "Shortcut", category: "Project Management", description: "Connect with Shortcut (formerly Clubhouse)", iconUrl: "https://cdn.worldvectorlogo.com/logos/shortcut-1.svg", status: "available" },
  { slug: "todoist", name: "Todoist", category: "Project Management", description: "Manage Todoist tasks and projects", iconUrl: "https://cdn.worldvectorlogo.com/logos/todoist-icon.svg", status: "available" },
  { slug: "airtable", name: "Airtable", category: "Project Management", description: "Read and write Airtable bases and records", iconUrl: "https://cdn.worldvectorlogo.com/logos/airtable-2.svg", status: "available" },

  // Support & Ticketing
  { slug: "intercom", name: "Intercom", category: "Support", description: "Manage Intercom conversations and contacts", iconUrl: "https://cdn.worldvectorlogo.com/logos/intercom-1.svg", status: "available" },
  { slug: "zendesk", name: "Zendesk", category: "Support", description: "Create and update Zendesk support tickets", iconUrl: "https://cdn.worldvectorlogo.com/logos/zendesk-1.svg", status: "available" },
  { slug: "servicenow", name: "ServiceNow", category: "Support", description: "Access ServiceNow incidents and requests", iconUrl: "https://cdn.worldvectorlogo.com/logos/servicenow.svg", status: "available" },
  { slug: "freshdesk", name: "Freshdesk", category: "Support", description: "Manage Freshdesk tickets and contacts", iconUrl: "https://cdn.worldvectorlogo.com/logos/freshworks-1.svg", status: "available" },
  { slug: "gainsight", name: "Gainsight", category: "Support", description: "Connect with Gainsight customer success data", iconUrl: "https://cdn.worldvectorlogo.com/logos/gainsight.svg", status: "available" },
  { slug: "front", name: "Front", category: "Support", description: "Manage Front shared inboxes", iconUrl: "https://cdn.worldvectorlogo.com/logos/front-icon.svg", status: "available" },
  { slug: "pagerduty", name: "PagerDuty", category: "Support", description: "Trigger and manage PagerDuty incidents", iconUrl: "https://cdn.worldvectorlogo.com/logos/pagerduty-icon.svg", status: "available" },

  // Marketing Tools
  { slug: "vimeo", name: "Vimeo", category: "Marketing", description: "Upload and manage Vimeo videos", iconUrl: "https://cdn.worldvectorlogo.com/logos/vimeo-icon.svg", status: "available" },
  { slug: "klaviyo", name: "Klaviyo", category: "Marketing", description: "Sync Klaviyo email campaigns and lists", iconUrl: "https://cdn.worldvectorlogo.com/logos/klaviyo-1.svg", status: "available" },
  { slug: "mailchimp", name: "MailChimp", category: "Marketing", description: "Manage MailChimp campaigns and audiences", iconUrl: "https://cdn.worldvectorlogo.com/logos/mailchimp-freddie-icon.svg", status: "available" },
  { slug: "marketo", name: "Marketo", category: "Marketing", description: "Connect with Marketo marketing automation", iconUrl: "https://cdn.worldvectorlogo.com/logos/marketo-icon.svg", status: "available" },
  { slug: "pardot", name: "Pardot", category: "Marketing", description: "Access Salesforce Pardot data", iconUrl: "https://cdn.worldvectorlogo.com/logos/salesforce-2.svg", status: "available" },
  { slug: "oracle-eloqua", name: "Oracle Eloqua", category: "Marketing", description: "Integrate with Oracle Eloqua platform", iconUrl: "https://cdn.worldvectorlogo.com/logos/oracle-6.svg", status: "available" },
  { slug: "activecampaign", name: "ActiveCampaign", category: "Marketing", description: "Sync ActiveCampaign contacts and automations", iconUrl: "https://cdn.worldvectorlogo.com/logos/activecampaign.svg", status: "available" },
  { slug: "sailthru", name: "Sailthru", category: "Marketing", description: "Connect with Sailthru email marketing", iconUrl: "https://cdn.worldvectorlogo.com/logos/sailthru.svg", status: "coming_soon" },

  // Office Suite & Productivity
  { slug: "google-sheets", name: "Google Sheets", category: "Office Suite", description: "Read and write Google Sheets data", iconUrl: "https://cdn.worldvectorlogo.com/logos/google-sheets.svg", status: "available" },
  { slug: "google-calendar", name: "Google Calendar", category: "Office Suite", description: "Create and manage Google Calendar events", iconUrl: "https://cdn.worldvectorlogo.com/logos/google-calendar.svg", status: "available" },
  { slug: "outlook", name: "Microsoft Outlook", category: "Office Suite", description: "Access Outlook email and calendar", iconUrl: "https://cdn.worldvectorlogo.com/logos/microsoft-outlook-2019.svg", status: "available" },
  { slug: "calendly", name: "Calendly", category: "Office Suite", description: "Manage Calendly scheduling links", iconUrl: "https://cdn.worldvectorlogo.com/logos/calendly.svg", status: "available" },
  { slug: "gmail", name: "Gmail", category: "Office Suite", description: "Send and read Gmail messages", iconUrl: "https://cdn.worldvectorlogo.com/logos/gmail-icon-2.svg", status: "available" },
  { slug: "miro", name: "Miro", category: "Office Suite", description: "Access Miro boards and content", iconUrl: "https://cdn.worldvectorlogo.com/logos/miro-2.svg", status: "available" },
  { slug: "imanage", name: "iManage", category: "Office Suite", description: "Connect with iManage document management", iconUrl: "https://cdn.worldvectorlogo.com/logos/imanage.svg", status: "available" },
  { slug: "excel", name: "Excel", category: "Office Suite", description: "Read and write Microsoft Excel files", iconUrl: "https://cdn.worldvectorlogo.com/logos/microsoft-excel-2013.svg", status: "available" },
  { slug: "stackoverflow-teams", name: "Stack Overflow for Teams", category: "Office Suite", description: "Access Stack Overflow Teams knowledge", iconUrl: "https://cdn.worldvectorlogo.com/logos/stack-overflow.svg", status: "available" },
  { slug: "typeform", name: "Typeform", category: "Office Suite", description: "Collect Typeform survey responses", iconUrl: "https://cdn.worldvectorlogo.com/logos/typeform-1.svg", status: "available" },
  { slug: "vanta", name: "Vanta", category: "Office Suite", description: "Access Vanta compliance data", iconUrl: "https://cdn.worldvectorlogo.com/logos/vanta-icon.svg", status: "coming_soon" },

  // Analytics
  { slug: "google-analytics", name: "Google Analytics", category: "Analytics", description: "Access Google Analytics reports and data", iconUrl: "https://cdn.worldvectorlogo.com/logos/google-analytics-3.svg", status: "available" },
  { slug: "google-search-console", name: "Google Search Console", category: "Analytics", description: "Get Search Console insights and data", iconUrl: "https://cdn.worldvectorlogo.com/logos/google-search-console.svg", status: "available" },
  { slug: "google-analytics-ga4", name: "Google Analytics GA4", category: "Analytics", description: "Access Google Analytics 4 properties", iconUrl: "https://cdn.worldvectorlogo.com/logos/google-analytics-3.svg", status: "available" },
  { slug: "mixpanel", name: "Mixpanel", category: "Analytics", description: "Query Mixpanel product analytics", iconUrl: "https://cdn.worldvectorlogo.com/logos/mixpanel.svg", status: "available" },
  { slug: "heap", name: "Heap", category: "Analytics", description: "Access Heap analytics data", iconUrl: "https://cdn.worldvectorlogo.com/logos/heap.svg", status: "available" },

  // Accounting & Finance
  { slug: "quickbooks", name: "QuickBooks", category: "Accounting", description: "Sync QuickBooks invoices and transactions", iconUrl: "https://cdn.worldvectorlogo.com/logos/quickbooks-1.svg", status: "available" },
  { slug: "xero", name: "Xero", category: "Accounting", description: "Manage Xero accounting data", iconUrl: "https://cdn.worldvectorlogo.com/logos/xero-icon.svg", status: "available" },
  { slug: "sage-intacct", name: "Sage Intacct", category: "Accounting", description: "Connect with Sage Intacct financials", iconUrl: "https://cdn.worldvectorlogo.com/logos/sage-2.svg", status: "available" },
  { slug: "netsuite", name: "NetSuite", category: "Accounting", description: "Access Oracle NetSuite ERP data", iconUrl: "https://cdn.worldvectorlogo.com/logos/netsuite-2.svg", status: "available" },
  { slug: "dynamics365-bc", name: "Dynamics 365 Business Central", category: "Accounting", description: "Connect with Microsoft Business Central", iconUrl: "https://cdn.worldvectorlogo.com/logos/microsoft-5.svg", status: "available" },
  { slug: "sap-s4hana", name: "SAP S/4HANA", category: "Accounting", description: "Integrate with SAP S/4HANA", iconUrl: "https://cdn.worldvectorlogo.com/logos/sap-1.svg", status: "coming_soon" },
  { slug: "oracle-financials", name: "Oracle Financials Cloud", category: "Accounting", description: "Access Oracle Financials data", iconUrl: "https://cdn.worldvectorlogo.com/logos/oracle-6.svg", status: "coming_soon" },
  { slug: "dynamics365-finance", name: "Dynamics 365 Finance", category: "Accounting", description: "Connect with Dynamics 365 Finance", iconUrl: "https://cdn.worldvectorlogo.com/logos/microsoft-5.svg", status: "coming_soon" },
  { slug: "sage-accounting", name: "Sage Accounting", category: "Accounting", description: "Manage Sage Accounting data", iconUrl: "https://cdn.worldvectorlogo.com/logos/sage-2.svg", status: "available" },

  // E-commerce
  { slug: "shopify", name: "Shopify", category: "E-commerce", description: "Sync Shopify products, orders, and customers", iconUrl: "https://cdn.worldvectorlogo.com/logos/shopify.svg", status: "available" },
  { slug: "woocommerce", name: "WooCommerce", category: "E-commerce", description: "Manage WooCommerce store data", iconUrl: "https://cdn.worldvectorlogo.com/logos/woocommerce-icon-1.svg", status: "available" },
  { slug: "adobe-commerce", name: "Adobe Commerce", category: "E-commerce", description: "Connect with Adobe Commerce (Magento)", iconUrl: "https://cdn.worldvectorlogo.com/logos/adobe-8.svg", status: "available" },
  { slug: "unleashed", name: "Unleashed", category: "E-commerce", description: "Access Unleashed inventory management", iconUrl: "https://cdn.worldvectorlogo.com/logos/unleashed-1.svg", status: "available" },

  // Advertising
  { slug: "facebook-ads", name: "Facebook Ads", category: "Advertising", description: "Manage Facebook advertising campaigns", iconUrl: "https://cdn.worldvectorlogo.com/logos/facebook-4.svg", status: "available" },
  { slug: "google-campaign-manager", name: "Google Campaign Manager", category: "Advertising", description: "Access Google Campaign Manager data", iconUrl: "https://cdn.worldvectorlogo.com/logos/google-icon.svg", status: "available" },
  { slug: "google-ads", name: "Google Ads", category: "Advertising", description: "Manage Google Ads campaigns", iconUrl: "https://cdn.worldvectorlogo.com/logos/google-ads-1.svg", status: "available" },
  { slug: "google-ad-manager", name: "Google Ad Manager", category: "Advertising", description: "Access Google Ad Manager reports", iconUrl: "https://cdn.worldvectorlogo.com/logos/google-ad-manager.svg", status: "available" },
  { slug: "tiktok-ads", name: "TikTok Ads", category: "Advertising", description: "Manage TikTok advertising campaigns", iconUrl: "https://cdn.worldvectorlogo.com/logos/tiktok-icon-2.svg", status: "available" },

  // E-Signature & Documents
  { slug: "docusign", name: "DocuSign", category: "E-Signature", description: "Send and track DocuSign envelopes", iconUrl: "https://cdn.worldvectorlogo.com/logos/docusign-1.svg", status: "available" },
  { slug: "pandadoc", name: "PandaDoc", category: "E-Signature", description: "Create and send PandaDoc documents", iconUrl: "https://cdn.worldvectorlogo.com/logos/pandadoc.svg", status: "available" },
  { slug: "dropbox-sign", name: "Dropbox Sign", category: "E-Signature", description: "Send signature requests via Dropbox Sign", iconUrl: "https://cdn.worldvectorlogo.com/logos/dropbox-1.svg", status: "available" },
  { slug: "adobe-sign", name: "Adobe Acrobat Sign", category: "E-Signature", description: "Manage Adobe Sign agreements", iconUrl: "https://cdn.worldvectorlogo.com/logos/adobe-acrobat.svg", status: "available" },

  // Business Intelligence
  { slug: "tableau", name: "Tableau", category: "Business Intelligence", description: "Access Tableau dashboards and data", iconUrl: "https://cdn.worldvectorlogo.com/logos/tableau-software.svg", status: "available" },
  { slug: "bigquery", name: "BigQuery", category: "Business Intelligence", description: "Query Google BigQuery datasets", iconUrl: "https://cdn.worldvectorlogo.com/logos/google-bigquery-logo-1.svg", status: "available" },
  { slug: "amazon-s3", name: "Amazon S3", category: "Business Intelligence", description: "Read and write files to S3 buckets", iconUrl: "https://cdn.worldvectorlogo.com/logos/aws-s3.svg", status: "available" },
  { slug: "power-bi", name: "Power BI", category: "Business Intelligence", description: "Access Power BI reports and datasets", iconUrl: "https://cdn.worldvectorlogo.com/logos/power-bi.svg", status: "available" },
  { slug: "segment", name: "Segment", category: "Business Intelligence", description: "Stream events to Segment CDP", iconUrl: "https://cdn.worldvectorlogo.com/logos/segment-1.svg", status: "available" },
  { slug: "snowflake", name: "Snowflake", category: "Business Intelligence", description: "Query Snowflake data warehouse", iconUrl: "https://cdn.worldvectorlogo.com/logos/snowflake-3.svg", status: "available" },
  { slug: "amplitude", name: "Amplitude", category: "Business Intelligence", description: "Access Amplitude analytics data", iconUrl: "https://cdn.worldvectorlogo.com/logos/amplitude-icon.svg", status: "coming_soon" },

  // Social Media
  { slug: "linkedin", name: "LinkedIn", category: "Social Media", description: "Post updates and manage LinkedIn presence", iconUrl: "https://cdn.worldvectorlogo.com/logos/linkedin-icon-2.svg", status: "available" },
  { slug: "facebook-pages", name: "Facebook Pages", category: "Social Media", description: "Manage Facebook business pages", iconUrl: "https://cdn.worldvectorlogo.com/logos/facebook-4.svg", status: "available" },

  // Payments
  { slug: "stripe", name: "Stripe", category: "Payments", description: "Access Stripe payments and customer data", iconUrl: "https://cdn.worldvectorlogo.com/logos/stripe-2.svg", status: "available" },
  { slug: "ramp", name: "Ramp", category: "Payments", description: "Manage Ramp corporate card transactions", iconUrl: "https://cdn.worldvectorlogo.com/logos/ramp-icon.svg", status: "available" },

  // HR & Other
  { slug: "adp-workforce-now", name: "ADP Workforce Now", category: "HR", description: "Access ADP employee and payroll data", iconUrl: "https://cdn.worldvectorlogo.com/logos/adp-2.svg", status: "available" },
  { slug: "bamboohr", name: "BambooHR", category: "HR", description: "Manage BambooHR employee records", iconUrl: "https://cdn.worldvectorlogo.com/logos/bamboohr.svg", status: "available" },
  { slug: "greenhouse", name: "Greenhouse", category: "HR", description: "Access Greenhouse recruiting data", iconUrl: "https://cdn.worldvectorlogo.com/logos/greenhouse-2.svg", status: "available" },
  { slug: "gusto", name: "Gusto", category: "HR", description: "Connect with Gusto payroll and benefits", iconUrl: "https://cdn.worldvectorlogo.com/logos/gusto-2.svg", status: "available" },
  { slug: "workable", name: "Workable", category: "HR", description: "Manage Workable recruiting pipeline", iconUrl: "https://cdn.worldvectorlogo.com/logos/workable-1.svg", status: "available" },
  { slug: "workday", name: "Workday", category: "HR", description: "Access Workday HCM data", iconUrl: "https://cdn.worldvectorlogo.com/logos/workday-1.svg", status: "available" },
  { slug: "zoho-people", name: "Zoho People", category: "HR", description: "Manage Zoho People HR records", iconUrl: "https://cdn.worldvectorlogo.com/logos/zoho.svg", status: "available" },
];
