import { Routes, Route } from "react-router-dom";
import { AdsWorkspace } from "./pages/AdsWorkspace";
import { AdsInsights } from "./pages/AdsInsights";
import { AdsHistory } from "./pages/AdsHistory";
import { CampaignBuilder } from "./pages/CampaignBuilder";
import { CreativeStudio } from "./pages/CreativeStudio";
import { AudienceBuilder } from "./pages/AudienceBuilder";
import { ABTesting } from "./pages/ABTesting";
import { CampaignAutomation } from "./pages/CampaignAutomation";
import { LandingPageBuilder } from "./pages/LandingPageBuilder";
import { AttributionDashboard } from "./pages/AttributionDashboard";
import { AdFatigueDetector } from "./pages/AdFatigueDetector";
import { KeywordManager } from "./pages/KeywordManager";
import { AdGroupManager } from "./pages/AdGroupManager";
import { AdCreator } from "./pages/AdCreator";
import { BudgetCenter } from "./pages/BudgetCenter";
import { DemographicsInsights } from "./pages/DemographicsInsights";
import { ConversionTracking } from "./pages/ConversionTracking";
import { AdsRecommendations } from "./pages/AdsRecommendations";

export default function AdsApp() {
  return (
    <Routes>
      <Route index element={<AdsWorkspace />} />
      <Route path="insights" element={<AdsInsights />} />
      <Route path="history" element={<AdsHistory />} />
      <Route path="campaigns" element={<CampaignBuilder />} />
      <Route path="creatives" element={<CreativeStudio />} />
      <Route path="audiences" element={<AudienceBuilder />} />
      <Route path="ab-tests" element={<ABTesting />} />
      <Route path="automation" element={<CampaignAutomation />} />
      <Route path="landing-builder" element={<LandingPageBuilder />} />
      <Route path="attribution" element={<AttributionDashboard />} />
      <Route path="fatigue" element={<AdFatigueDetector />} />
      <Route path="keywords" element={<KeywordManager />} />
      <Route path="ad-groups" element={<AdGroupManager />} />
      <Route path="ad-creator" element={<AdCreator />} />
      <Route path="budgets" element={<BudgetCenter />} />
      <Route path="demographics" element={<DemographicsInsights />} />
      <Route path="conversions" element={<ConversionTracking />} />
      <Route path="recommendations" element={<AdsRecommendations />} />
    </Routes>
  );
}
