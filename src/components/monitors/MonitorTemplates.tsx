import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

export interface MonitorTemplate {
  name: string;
  description: string;
  blueprintSlug: string;
  toolName: string;
  intervalMinutes: number;
  conditions: Array<{ field: string; operator: string; value?: any }>;
  actionType: "create_task" | "send_notification" | "trigger_agent" | "log_alert";
  actionConfig: Record<string, any>;
  category: string;
}

const TEMPLATES: MonitorTemplate[] = [
  {
    name: "Google Ads: Daily Spend Alert",
    description: "Alert when daily ad spend exceeds a threshold",
    blueprintSlug: "google-ads",
    toolName: "get_campaign_stats",
    intervalMinutes: 30,
    conditions: [{ field: "cost_micros", operator: "gt", value: 500000000 }],
    actionType: "create_task",
    actionConfig: {
      title: "Google Ads spend alert: {{condition_summary}}",
      description: "Daily ad spend exceeded threshold. Review campaign budgets.",
      priority: "high",
      tags: ["google-ads", "spend-alert"],
    },
    category: "Advertising",
  },
  {
    name: "Shopify: New Order Notification",
    description: "Get notified when new orders come in",
    blueprintSlug: "shopify",
    toolName: "list_orders",
    intervalMinutes: 5,
    conditions: [{ field: "orders.length", operator: "gt", value: 0 }],
    actionType: "log_alert",
    actionConfig: {
      message: "New Shopify orders detected: {{condition_summary}}",
    },
    category: "E-commerce",
  },
  {
    name: "Stripe: Failed Payment Alert",
    description: "Alert on failed payment charges",
    blueprintSlug: "stripe",
    toolName: "list_charges",
    intervalMinutes: 15,
    conditions: [{ field: "data.0.status", operator: "eq", value: "failed" }],
    actionType: "create_task",
    actionConfig: {
      title: "Failed payment detected",
      description: "A payment charge failed on Stripe. Investigate and follow up with customer.",
      priority: "high",
      assignee: "Ghost",
      tags: ["payments", "failed-charge"],
    },
    category: "Payments",
  },
  {
    name: "Shopify: Low Inventory Alert",
    description: "Alert when product inventory drops below threshold",
    blueprintSlug: "shopify",
    toolName: "list_products",
    intervalMinutes: 60,
    conditions: [
      { field: "products.0.variants.0.inventory_quantity", operator: "lt", value: 10 },
    ],
    actionType: "create_task",
    actionConfig: {
      title: "Low inventory alert",
      description: "Product inventory is running low. Review and reorder.",
      priority: "medium",
      tags: ["inventory", "low-stock"],
    },
    category: "E-commerce",
  },
  {
    name: "Razorpay: Dispute Alert",
    description: "Monitor for new payment disputes",
    blueprintSlug: "razorpay",
    toolName: "list_disputes",
    intervalMinutes: 30,
    conditions: [{ field: "count", operator: "gt", value: 0 }],
    actionType: "create_task",
    actionConfig: {
      title: "New payment dispute detected",
      description: "A new dispute has been filed. Respond within deadline.",
      priority: "urgent",
      tags: ["payments", "dispute"],
    },
    category: "Payments",
  },
  {
    name: "HubSpot: New Deal Alert",
    description: "Alert when new deals are created in CRM",
    blueprintSlug: "hubspot",
    toolName: "search_deals",
    intervalMinutes: 15,
    conditions: [{ field: "total", operator: "changed" }],
    actionType: "log_alert",
    actionConfig: {
      message: "New HubSpot deals detected: {{condition_summary}}",
    },
    category: "Sales & CRM",
  },
];

interface MonitorTemplatesProps {
  onSelect: (template: MonitorTemplate) => void;
}

export function MonitorTemplates({ onSelect }: MonitorTemplatesProps) {
  const categories = [...new Set(TEMPLATES.map((t) => t.category))];

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TEMPLATES.filter((t) => t.category === category).map((template) => (
              <Card
                key={template.name}
                className="border-border hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => onSelect(template)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{template.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {template.blueprintSlug}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Every {template.intervalMinutes}m
                    </span>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
