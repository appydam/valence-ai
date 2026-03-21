import { Routes, Route } from "react-router-dom";
import { GtmWorkspace } from "./pages/GtmWorkspace";
import { GtmInsights } from "./pages/GtmInsights";
import { GtmHistory } from "./pages/GtmHistory";
import { IcpBuilder } from "./pages/IcpBuilder";
import { LeadSourcer } from "./pages/LeadSourcer";
import { SequenceBuilder } from "./pages/SequenceBuilder";
import { PipelineView } from "./pages/PipelineView";
import { LinkedInOutreach } from "./pages/LinkedInOutreach";
import { SignalBoard } from "./pages/SignalBoard";

export default function GtmApp() {
  return (
    <Routes>
      <Route index element={<GtmWorkspace />} />
      <Route path="insights" element={<GtmInsights />} />
      <Route path="history" element={<GtmHistory />} />
      <Route path="icp" element={<IcpBuilder />} />
      <Route path="leads" element={<LeadSourcer />} />
      <Route path="sequences" element={<SequenceBuilder />} />
      <Route path="pipeline" element={<PipelineView />} />
      <Route path="linkedin" element={<LinkedInOutreach />} />
      <Route path="signals" element={<SignalBoard />} />
    </Routes>
  );
}
