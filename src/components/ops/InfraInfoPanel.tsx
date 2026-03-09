import { useState } from "react";
import { Copy, Check, Server, Globe, Database, Cloud } from "lucide-react";
import { Doc } from "../../../convex/_generated/dataModel";

function CopyValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex items-center gap-1 ml-1 text-muted-foreground hover:text-foreground"
      title="Copy"
    >
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-2 py-1.5">
      <span className="text-[11px] text-muted-foreground shrink-0">{label}</span>
      <span className="text-[11px] font-mono text-foreground text-right break-all">
        {value}
        <CopyValue value={value} />
      </span>
    </div>
  );
}

export function InfraInfoPanel({ customer }: { customer: Doc<"customerProvisionings"> }) {
  const hasInfra = customer.convexUrl || customer.lightsailIp || customer.vercelProject;

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Server className="w-3.5 h-3.5 text-primary" />
        Infrastructure
      </h3>

      {!hasInfra && (
        <p className="text-xs text-muted-foreground italic">
          IDs will appear here as steps are completed.
        </p>
      )}

      <div className="divide-y divide-border/50">
        {customer.convexProject && (
          <div className="py-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Database className="w-3 h-3 text-orange-500" />
              <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Convex</span>
            </div>
            <InfoRow label="Project" value={customer.convexProject} />
            <InfoRow label="URL" value={customer.convexUrl} />
            <InfoRow label="Site URL" value={customer.convexSiteUrl} />
          </div>
        )}

        {customer.vercelProject && (
          <div className="py-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Globe className="w-3 h-3 text-foreground" />
              <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Vercel</span>
            </div>
            <InfoRow label="Project" value={customer.vercelProject} />
            <InfoRow label="Domain" value={customer.domain} />
          </div>
        )}

        {customer.lightsailIp && (
          <div className="py-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Cloud className="w-3 h-3 text-yellow-500" />
              <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Lightsail</span>
            </div>
            <InfoRow label="IP" value={customer.lightsailIp} />
            <InfoRow label="Instance" value={customer.lightsailInstance} />
            <InfoRow label="SSH Key" value={customer.sshKeyPath} />
            <InfoRow label="Size" value={customer.serverSize} />
            <InfoRow label="Region" value={customer.serverRegion} />
          </div>
        )}
      </div>

      {/* Quick info */}
      <div className="pt-2 border-t border-border/50 space-y-1">
        <InfoRow label="Slug" value={customer.slug} />
        <InfoRow label="Plan" value={customer.plan.replace("_", " ")} />
        <InfoRow label="Model" value={customer.deploymentModel} />
      </div>
    </div>
  );
}
