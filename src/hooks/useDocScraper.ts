import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { apiPost } from "@/lib/api";
import { useCurrentUserId } from "./useCurrentUserId";

interface StartScrapeOptions {
  suggestedName?: string;
  suggestedCategory?: string;
}

interface ScraperJob {
  _id: Id<"scraperJobs">;
  url: string;
  status: "pending" | "scraping" | "analyzing" | "completed" | "failed";
  blueprintId?: Id<"blueprints">;
  toolCount?: number;
  error?: string;
  _creationTime: number;
}

export function useDocScraper() {
  const userId = useCurrentUserId();
  const [jobId, setJobId] = useState<Id<"scraperJobs"> | null>(null);
  const [blueprintId, setBlueprintId] = useState<Id<"blueprints"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reactive polling via Convex query - only polls when jobId is set
  const job = useQuery(
    api.docScraper.getJob,
    jobId ? { id: jobId } : "skip"
  ) as ScraperJob | undefined;

  // Auto-complete when job finishes
  if (job && !blueprintId) {
    if (job.status === "completed" && job.blueprintId) {
      setBlueprintId(job.blueprintId);
      setIsProcessing(false);
      setJobId(null); // Stop polling
    } else if (job.status === "failed") {
      setError(job.error || "Scraping failed");
      setIsProcessing(false);
      setJobId(null); // Stop polling
    }
  }

  const startScrape = async (url: string, options: StartScrapeOptions = {}) => {
    setIsProcessing(true);
    setError(null);
    setBlueprintId(null);
    setJobId(null);

    try {
      const result = await apiPost("/api/integrations/scrape", {
        url,
        createdBy: userId,
        suggestedName: options.suggestedName,
        suggestedCategory: options.suggestedCategory,
      });

      // Check for errors first
      if (result.error && !result.jobId) {
        throw new Error(result.error);
      }

      if (result.blueprintId) {
        // OpenAPI spec - completed immediately
        setBlueprintId(result.blueprintId as Id<"blueprints">);
        setIsProcessing(false);
        return { blueprintId: result.blueprintId, toolCount: result.toolCount };
      } else if (result.jobId) {
        // HTML docs - needs AI analysis, start polling
        // The job might already be in "failed" status if fetch failed
        setJobId(result.jobId as Id<"scraperJobs">);

        // If there's already an error, it means the job failed during fetch
        if (result.error) {
          setError(result.error);
          setIsProcessing(false);
        }

        return { jobId: result.jobId };
      } else {
        throw new Error("Unexpected response from scraper");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setIsProcessing(false);
      throw err;
    }
  };

  return {
    startScrape,
    isProcessing,
    job,
    blueprintId,
    error,
  };
}
