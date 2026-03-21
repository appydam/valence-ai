import { useState, useCallback, useRef, useEffect } from "react";
import { useIntegrationCall } from "../../framework/useIntegrationCall";
import { useAgentTrigger } from "../../framework/useAgentTrigger";

export type ReplyClassification =
  | "positive"
  | "negative"
  | "ooo"
  | "bounce"
  | "no_reply"
  | "ambiguous";

export interface DetectedReply {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  snippet: string;
  classification: ReplyClassification;
  receivedAt: string;
  contactName?: string;
}

export function useReplyDetection() {
  const { execute, isConnected } = useIntegrationCall();
  const { triggerAgent } = useAgentTrigger();
  const [replies, setReplies] = useState<DetectedReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const isGmailConnected = isConnected("gmail");

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const classifySnippet = (snippet: string, subject: string): ReplyClassification => {
    const lower = (snippet + " " + subject).toLowerCase();

    if (lower.includes("out of office") || lower.includes("ooo") || lower.includes("auto-reply") || lower.includes("will return")) {
      return "ooo";
    }
    if (lower.includes("delivery status") || lower.includes("mailer-daemon") || lower.includes("does not exist") || lower.includes("undeliverable")) {
      return "bounce";
    }
    if (lower.includes("not interested") || lower.includes("no thanks") || lower.includes("unsubscribe") || lower.includes("please remove") || lower.includes("not looking")) {
      return "negative";
    }
    if (lower.includes("demo") || lower.includes("meeting") || lower.includes("schedule") || lower.includes("love to") || lower.includes("interested") || lower.includes("tell me more") || lower.includes("sounds great")) {
      return "positive";
    }

    return "ambiguous";
  };

  const checkForReplies = useCallback(async () => {
    if (!isGmailConnected) return;

    setLoading(true);

    try {
      const result = await execute("gmail", "list_messages", {
        query: "is:inbox newer_than:1d",
        maxResults: 20,
      });

      if (result.success && result.result?.messages) {
        const detected: DetectedReply[] = result.result.messages.map((msg: any) => {
          const classification = classifySnippet(
            msg.snippet ?? "",
            msg.subject ?? ""
          );

          return {
            id: msg.id ?? String(Math.random()),
            threadId: msg.threadId ?? "",
            from: msg.from ?? "",
            subject: msg.subject ?? "",
            snippet: msg.snippet ?? "",
            classification,
            receivedAt: msg.internalDate
              ? new Date(Number(msg.internalDate)).toLocaleString()
              : "Recent",
          };
        });

        if (mountedRef.current) {
          setReplies(detected);
        }
      }

      if (mountedRef.current) {
        setLastChecked(new Date().toLocaleTimeString());
      }
    } catch {
      // Silently fail — empty replies stay as-is
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [execute, isGmailConnected]);

  const classifyWithAI = useCallback(
    async (reply: DetectedReply) => {
      const result = await triggerAgent(
        "Scout",
        `Classify email reply from ${reply.from}`,
        `Classify this email reply. Determine if it is: positive (interested/wants meeting), negative (not interested/unsubscribe), ooo (out of office), or bounce (delivery failure).\n\nSubject: ${reply.subject}\nSnippet: ${reply.snippet}\n\nReturn the classification and reasoning.`,
        ["niche:gtm", "reply-classification"]
      );

      return result;
    },
    [triggerAgent]
  );

  const replyCounts = {
    positive: replies.filter((r) => r.classification === "positive").length,
    negative: replies.filter((r) => r.classification === "negative").length,
    ooo: replies.filter((r) => r.classification === "ooo").length,
    bounce: replies.filter((r) => r.classification === "bounce").length,
    no_reply: replies.filter((r) => r.classification === "no_reply").length,
    ambiguous: replies.filter((r) => r.classification === "ambiguous").length,
  };

  return {
    replies,
    replyCounts,
    checkForReplies,
    classifyWithAI,
    loading,
    lastChecked,
    isGmailConnected,
  };
}
