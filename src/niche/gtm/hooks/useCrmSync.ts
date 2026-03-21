import { useState, useCallback, useEffect, useRef } from "react";
import { useIntegrationCall } from "../../framework/useIntegrationCall";

export interface Deal {
  id: string;
  name: string;
  company: string;
  dealSize: number;
  stage: string;
  lastActivity: string;
  score: number;
  owner?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  phone?: string;
  lastContacted?: string;
}

export function useCrmSync() {
  const { execute, isConnected, loading: integrationLoading } = useIntegrationCall();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  const isLive = isConnected("hubspot") || isConnected("salesforce");

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const syncNow = useCallback(async () => {
    if (!isLive) return;

    setLoading(true);

    try {
      if (isConnected("hubspot")) {
        const contactsResult = await execute("hubspot", "search_contacts", {
          query: "",
          limit: 50,
        });

        if (contactsResult.success && contactsResult.result?.contacts) {
          const mapped: Contact[] = contactsResult.result.contacts.map((c: any) => ({
            id: c.id ?? c.hs_object_id ?? String(Math.random()),
            name: `${c.firstname ?? ""} ${c.lastname ?? ""}`.trim() || c.email,
            email: c.email ?? "",
            company: c.company ?? "",
            role: c.jobtitle ?? "",
            phone: c.phone,
            lastContacted: c.notes_last_contacted ?? undefined,
          }));
          if (mountedRef.current) setContacts(mapped);
        }

        const dealsResult = await execute("hubspot", "list_deals", {
          limit: 50,
        });

        if (dealsResult.success && dealsResult.result?.deals) {
          const mapped: Deal[] = dealsResult.result.deals.map((d: any) => ({
            id: d.id ?? d.hs_object_id ?? String(Math.random()),
            name: d.dealname ?? "Untitled Deal",
            company: d.company ?? "",
            dealSize: Number(d.amount) || 0,
            stage: d.dealstage ?? "lead",
            lastActivity: d.notes_last_updated ?? "Unknown",
            score: Number(d.hs_lead_score) || 50,
            owner: d.hubspot_owner_id,
          }));
          if (mountedRef.current) setDeals(mapped);
        }
      } else if (isConnected("salesforce")) {
        const contactsResult = await execute("salesforce", "query_records", {
          q: "SELECT Id, Name, Email, Title, Account.Name, Phone FROM Contact ORDER BY CreatedDate DESC LIMIT 50",
        });

        if (contactsResult.success && contactsResult.result?.records) {
          const mapped: Contact[] = contactsResult.result.records.map((c: any) => ({
            id: c.Id,
            name: c.Name ?? "",
            email: c.Email ?? "",
            company: c.Account?.Name ?? "",
            role: c.Title ?? "",
            phone: c.Phone,
          }));
          if (mountedRef.current) setContacts(mapped);
        }

        const dealsResult = await execute("salesforce", "query_records", {
          q: "SELECT Id, Name, Amount, StageName, CloseDate, Account.Name FROM Opportunity WHERE IsClosed = false ORDER BY Amount DESC LIMIT 50",
        });

        if (dealsResult.success && dealsResult.result?.records) {
          const mapped: Deal[] = dealsResult.result.records.map((d: any) => ({
            id: d.Id,
            name: d.Name ?? "Untitled",
            company: d.Account?.Name ?? "",
            dealSize: Number(d.Amount) || 0,
            stage: mapSalesforceStage(d.StageName),
            lastActivity: d.CloseDate ?? "Unknown",
            score: 50,
          }));
          if (mountedRef.current) setDeals(mapped);
        }
      }

      if (mountedRef.current) {
        setLastSynced(new Date().toLocaleTimeString());
      }
    } catch {
      // Silently fail — empty arrays stay as-is
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [execute, isConnected, isLive]);

  return {
    deals,
    contacts,
    syncNow,
    lastSynced,
    loading: loading || integrationLoading,
    isLive,
  };
}

/** Map common Salesforce stage names to our pipeline columns */
function mapSalesforceStage(stageName?: string): string {
  if (!stageName) return "lead";
  const lower = stageName.toLowerCase();
  if (lower.includes("closed") || lower.includes("won")) return "closed";
  if (lower.includes("meeting") || lower.includes("negotiation") || lower.includes("proposal")) return "meeting";
  if (lower.includes("replied") || lower.includes("qualified") || lower.includes("qualification")) return "replied";
  if (lower.includes("contacted") || lower.includes("nurturing") || lower.includes("discovery")) return "contacted";
  return "lead";
}
