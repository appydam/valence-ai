import { useState, useEffect, useCallback } from "react";

export interface ProductContext {
  websiteUrl: string;
  productName: string;
  description: string;
  icp: string;
  competitors: string[];
  differentiators: string[];
  extraContext: string;
  pricing: string;
  techStack: string;
  companySize: string;
  fundingStage: string;
  keyCustomers: string[];
  brandVoice: string;
  painPointsSolved: string[];
}

const STORAGE_KEY = "outbound_product_context";

const EMPTY_CONTEXT: ProductContext = {
  websiteUrl: "",
  productName: "",
  description: "",
  icp: "",
  competitors: [],
  differentiators: [],
  extraContext: "",
  pricing: "",
  techStack: "",
  companySize: "",
  fundingStage: "",
  keyCustomers: [],
  brandVoice: "",
  painPointsSolved: [],
};

export function useProductContext() {
  const [context, setContext] = useState<ProductContext>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : EMPTY_CONTEXT;
    } catch {
      return EMPTY_CONTEXT;
    }
  });

  const [isSetUp, setIsSetUp] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored).websiteUrl !== "" : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
    setIsSetUp(context.websiteUrl !== "");
  }, [context]);

  const updateContext = useCallback((updates: Partial<ProductContext>) => {
    setContext((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearContext = useCallback(() => {
    setContext(EMPTY_CONTEXT);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Build a prompt-ready summary for agents
  const getPromptContext = useCallback(() => {
    if (!isSetUp) return "";
    const parts = [`Product: ${context.productName || context.websiteUrl}`];
    if (context.description) parts.push(`What it does: ${context.description}`);
    if (context.icp) parts.push(`Target customer: ${context.icp}`);
    if (context.competitors.length > 0) parts.push(`Competitors: ${context.competitors.join(", ")}`);
    if (context.differentiators.length > 0) parts.push(`Differentiators: ${context.differentiators.join("; ")}`);
    if (context.painPointsSolved.length > 0) parts.push(`Pain points solved: ${context.painPointsSolved.join("; ")}`);
    if (context.pricing) parts.push(`Pricing: ${context.pricing}`);
    if (context.brandVoice) parts.push(`Brand voice: ${context.brandVoice}`);
    if (context.keyCustomers.length > 0) parts.push(`Key customers: ${context.keyCustomers.join(", ")}`);
    if (context.extraContext) parts.push(`Additional context: ${context.extraContext}`);
    return parts.join("\n");
  }, [context, isSetUp]);

  return { context, isSetUp, updateContext, clearContext, getPromptContext };
}
