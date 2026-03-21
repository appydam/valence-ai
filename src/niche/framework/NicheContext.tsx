import { createContext, useContext, type ReactNode } from "react";
import type { NicheConfig } from "./types";

interface NicheContextValue {
  config: NicheConfig;
  isStandalone: boolean; // true when accessed via subdomain (e.g. ads.usevalence.ai)
}

const NicheCtx = createContext<NicheContextValue | null>(null);

export function NicheProvider({
  config,
  isStandalone,
  children,
}: {
  config: NicheConfig;
  isStandalone: boolean;
  children: ReactNode;
}) {
  return (
    <NicheCtx.Provider value={{ config, isStandalone }}>
      {children}
    </NicheCtx.Provider>
  );
}

export function useNiche(): NicheContextValue {
  const ctx = useContext(NicheCtx);
  if (!ctx) {
    throw new Error("useNiche must be used within a NicheProvider");
  }
  return ctx;
}
