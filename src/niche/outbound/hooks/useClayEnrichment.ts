import { useIntegrationCall } from "../../framework/useIntegrationCall";

export function useClayEnrichment() {
  const { execute, isConnected, loading } = useIntegrationCall();
  const connected = isConnected("clay");

  const pushToTable = async (webhookId: string, data: Record<string, unknown>[]) => {
    return execute("clay", "push_to_table", { webhook_id: webhookId, data });
  };

  const runTable = async (tableId: string) => {
    return execute("clay", "run_table", { table_id: tableId });
  };

  const enrichPerson = async (email: string) => {
    return execute("clay", "enrich_person", { email });
  };

  const enrichCompany = async (domain: string) => {
    return execute("clay", "enrich_company", { domain });
  };

  return { connected, loading, pushToTable, runTable, enrichPerson, enrichCompany };
}
