import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export type LandingTab = "ai-department" | "ai-workers" | "ai-transformation";

const VALID_HASHES: Record<string, LandingTab> = {
  "#ai-department": "ai-department",
  "#ai-workers": "ai-workers",
  "#ai-transformation": "ai-transformation",
};

export function useLandingTab(): [LandingTab, (tab: LandingTab) => void] {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromHash = (): LandingTab => {
    return VALID_HASHES[location.hash] ?? "ai-department";
  };

  const [activeTab, setActiveTab] = useState<LandingTab>(getTabFromHash);

  // Sync when hash changes externally (back/forward navigation)
  useEffect(() => {
    const tab = VALID_HASHES[location.hash] ?? "ai-department";
    setActiveTab(tab);
  }, [location.hash]);

  const changeTab = useCallback(
    (tab: LandingTab) => {
      setActiveTab(tab);
      navigate(`/landing#${tab}`, { replace: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate]
  );

  return [activeTab, changeTab];
}
