import { useState, useCallback } from "react";
import { useIntegrationCall } from "../../framework/useIntegrationCall";

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}

interface SendResult {
  success: boolean;
  draftId?: string;
  messageId?: string;
  error?: string;
}

export function useEmailSend() {
  const { execute, isConnected, loading: integrationLoading } = useIntegrationCall();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isGmailConnected = isConnected("gmail");

  const createDraft = useCallback(
    async (params: SendEmailParams): Promise<SendResult> => {
      if (!isGmailConnected) {
        return {
          success: false,
          error: "Gmail is not connected. Please connect it in Integrations.",
        };
      }

      setLoading(true);
      setError(null);

      try {
        const result = await execute("gmail", "create_draft", {
          to: params.to,
          subject: params.subject,
          body: params.body,
          ...(params.cc ? { cc: params.cc } : {}),
          ...(params.bcc ? { bcc: params.bcc } : {}),
        });

        setLoading(false);

        if (result.success) {
          return {
            success: true,
            draftId: result.result?.draftId ?? result.result?.id,
          };
        }

        const errMsg = result.error ?? "Failed to create draft";
        setError(errMsg);
        return { success: false, error: errMsg };
      } catch (err: any) {
        const errMsg = err.message || "Failed to create draft";
        setError(errMsg);
        setLoading(false);
        return { success: false, error: errMsg };
      }
    },
    [execute, isGmailConnected]
  );

  const sendEmail = useCallback(
    async (params: SendEmailParams): Promise<SendResult> => {
      if (!isGmailConnected) {
        return {
          success: false,
          error: "Gmail is not connected. Please connect it in Integrations.",
        };
      }

      setLoading(true);
      setError(null);

      try {
        // Create draft first, then send it
        const draftResult = await execute("gmail", "create_draft", {
          to: params.to,
          subject: params.subject,
          body: params.body,
          ...(params.cc ? { cc: params.cc } : {}),
          ...(params.bcc ? { bcc: params.bcc } : {}),
        });

        if (!draftResult.success) {
          const errMsg = draftResult.error ?? "Failed to create draft";
          setError(errMsg);
          setLoading(false);
          return { success: false, error: errMsg };
        }

        const draftId = draftResult.result?.draftId ?? draftResult.result?.id;

        if (!draftId) {
          setError("Draft created but no ID returned");
          setLoading(false);
          return { success: false, error: "Draft created but no ID returned" };
        }

        const sendResult = await execute("gmail", "send_draft", {
          draftId,
        });

        setLoading(false);

        if (sendResult.success) {
          return {
            success: true,
            messageId: sendResult.result?.messageId ?? sendResult.result?.id,
          };
        }

        const errMsg = sendResult.error ?? "Failed to send email";
        setError(errMsg);
        return { success: false, error: errMsg };
      } catch (err: any) {
        const errMsg = err.message || "Failed to send email";
        setError(errMsg);
        setLoading(false);
        return { success: false, error: errMsg };
      }
    },
    [execute, isGmailConnected]
  );

  return {
    sendEmail,
    createDraft,
    loading: loading || integrationLoading,
    error,
    isGmailConnected,
  };
}
