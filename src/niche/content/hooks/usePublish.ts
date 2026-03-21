import { useState, useCallback } from "react";
import { useIntegrationCall } from "../../framework/useIntegrationCall";
import { useAgentTrigger } from "../../framework/useAgentTrigger";

export type PostStatus = "draft" | "scheduled" | "published" | "failed";

interface PublishResult {
  success: boolean;
  postId?: string;
  error?: string;
}

export function usePublish() {
  const { execute, isConnected, loading: integrationLoading } = useIntegrationCall();
  const { triggerAgent } = useAgentTrigger();
  const [loading, setLoading] = useState(false);

  const publishToTwitter = useCallback(
    async (text: string): Promise<PublishResult> => {
      setLoading(true);
      try {
        const result = await execute("twitter-x", "create_tweet", { text });
        setLoading(false);
        if (result.success) {
          return { success: true, postId: result.result?.id };
        }
        return { success: false, error: result.error ?? "Failed to publish tweet" };
      } catch (err: any) {
        setLoading(false);
        return { success: false, error: err.message ?? "Failed to publish tweet" };
      }
    },
    [execute]
  );

  const publishToLinkedIn = useCallback(
    async (text: string): Promise<PublishResult> => {
      setLoading(true);
      try {
        const result = await execute("linkedin", "create_post", { text });
        setLoading(false);
        if (result.success) {
          return { success: true, postId: result.result?.id };
        }
        return { success: false, error: result.error ?? "Failed to publish to LinkedIn" };
      } catch (err: any) {
        setLoading(false);
        return { success: false, error: err.message ?? "Failed to publish to LinkedIn" };
      }
    },
    [execute]
  );

  const publishToInstagram = useCallback(
    async (text: string, imageUrl?: string): Promise<PublishResult> => {
      if (!imageUrl) {
        return { success: false, error: "Instagram requires an image to publish" };
      }
      setLoading(true);
      try {
        // Step 1: Create media container
        const containerResult = await execute("instagram", "create_media_container", {
          caption: text,
          image_url: imageUrl,
        });
        if (!containerResult.success) {
          setLoading(false);
          return { success: false, error: containerResult.error ?? "Failed to create media container" };
        }
        const containerId = containerResult.result?.id;
        if (!containerId) {
          setLoading(false);
          return { success: false, error: "No container ID returned from Instagram" };
        }

        // Step 2: Publish the container
        const publishResult = await execute("instagram", "publish_media", {
          creation_id: containerId,
        });
        setLoading(false);
        if (publishResult.success) {
          return { success: true, postId: publishResult.result?.id };
        }
        return { success: false, error: publishResult.error ?? "Failed to publish to Instagram" };
      } catch (err: any) {
        setLoading(false);
        return { success: false, error: err.message ?? "Failed to publish to Instagram" };
      }
    },
    [execute]
  );

  const schedulePost = useCallback(
    async (
      platform: "twitter" | "linkedin" | "instagram",
      text: string,
      scheduledAt: string
    ): Promise<PublishResult> => {
      setLoading(true);
      try {
        // Create a task for the agent to publish at the scheduled time.
        // The sweep cron will pick it up, and the agent (Ghost/Kaze) will
        // execute the publish action when the scheduled time arrives.
        const platformLabel =
          platform === "twitter"
            ? "Twitter/X"
            : platform === "linkedin"
            ? "LinkedIn"
            : "Instagram";

        const result = await triggerAgent(
          "Ghost",
          `Scheduled ${platformLabel} post — ${new Date(scheduledAt).toLocaleString()}`,
          [
            `Publish the following content to ${platformLabel} at or after: ${scheduledAt}`,
            "",
            "--- POST CONTENT ---",
            text,
            "--- END CONTENT ---",
            "",
            `Platform: ${platform}`,
            `Scheduled for: ${scheduledAt}`,
            "",
            "Instructions:",
            `- Use the "${platform === "twitter" ? "twitter-x" : platform}" integration to publish.`,
            "- If the scheduled time has not arrived yet, wait and retry.",
            "- Post the exact text above (do not modify).",
            "- Report success or failure in the deliverable.",
          ].join("\n"),
          ["niche:content", "scheduled-post", `platform:${platform}`],
          { priority: "high" }
        );

        setLoading(false);
        if (result.success) {
          return { success: true, postId: result.taskId };
        }
        return { success: false, error: result.error ?? "Failed to schedule post" };
      } catch (err: any) {
        setLoading(false);
        return { success: false, error: err.message ?? "Failed to schedule post" };
      }
    },
    [triggerAgent]
  );

  return {
    publishToTwitter,
    publishToLinkedIn,
    publishToInstagram,
    schedulePost,
    isConnected,
    loading: loading || integrationLoading,
  };
}
