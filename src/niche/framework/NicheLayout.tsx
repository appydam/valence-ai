import { useState, type ReactNode } from "react";
import { useNiche } from "./NicheContext";
import { NicheSidebar } from "./NicheSidebar";
import { CommandBar } from "./CommandBar";

export function NicheLayout({ children }: { children: ReactNode }) {
  const { config } = useNiche();
  const [commandBarOpen, setCommandBarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <NicheSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Main content — no heavy navbar, pages own their header */}
        <main className="flex-1 overflow-auto">{children}</main>

        {/* Full Command Bar modal */}
        <CommandBar externalOpen={commandBarOpen} onExternalClose={() => setCommandBarOpen(false)} />
      </div>
    </div>
  );
}
