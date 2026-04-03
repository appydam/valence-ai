import { useIntegrationCall } from "../../framework/useIntegrationCall";

export function useLgmSequences() {
  const { execute, isConnected, loading } = useIntegrationCall();
  const connected = isConnected("lagrowthmachine");

  const createLead = async (data: { email?: string; linkedinUrl?: string; firstName?: string; lastName?: string; companyName?: string }) => {
    return execute("lagrowthmachine", "create_lead", data);
  };

  const createAudience = async (name: string, linkedinUrl: string) => {
    return execute("lagrowthmachine", "create_audience", { name, linkedinUrl });
  };

  const listCampaigns = async () => {
    return execute("lagrowthmachine", "list_campaigns", {});
  };

  const listAudiences = async () => {
    return execute("lagrowthmachine", "list_audiences", {});
  };

  return { connected, loading, createLead, createAudience, listCampaigns, listAudiences };
}
