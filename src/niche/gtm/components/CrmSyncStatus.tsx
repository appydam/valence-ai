import { RefreshCw, CheckCircle2, AlertCircle, CloudOff } from "lucide-react";
import { useNiche } from "../../framework/NicheContext";

interface CrmSyncStatusProps {
  crm: "HubSpot" | "Salesforce" | "Pipedrive";
  connected: boolean;
  lastSynced?: string;
}

export function CrmSyncStatus({ crm, connected, lastSynced }: CrmSyncStatusProps) {
  const { config } = useNiche();

  if (!connected) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card">
        <CloudOff className="w-3.5 h-3.5 text-red-400" />
        <span className="text-xs text-red-400">{crm}: Not Connected</span>
        <button
          className="ml-auto text-[10px] font-medium hover:underline"
          style={{ color: config.accentColor }}
        >
          Connect
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card">
      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
      <span className="text-xs text-foreground font-medium">{crm} Connected</span>
      {lastSynced && (
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
          <RefreshCw className="w-2.5 h-2.5" />
          Last synced {lastSynced}
        </span>
      )}
    </div>
  );
}
