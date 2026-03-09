"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { callBedrock, BedrockModel } from "./lib/bedrock";

/**
 * Generic internal action to call Bedrock from files that can't use "use node".
 * Files with queries/mutations call this action via ctx.runAction().
 */
export const invoke = internalAction({
  args: {
    prompt: v.string(),
    model: v.string(),
    maxTokens: v.number(),
  },
  handler: async (_ctx, args) => {
    return await callBedrock(
      args.prompt,
      args.model as BedrockModel,
      args.maxTokens
    );
  },
});
