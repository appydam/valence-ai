import { Routes, Route } from "react-router-dom";
import { OutboundWorkspace } from "./pages/OutboundWorkspace";
import { OutboundInsights } from "./pages/OutboundInsights";
import { OutboundJourney } from "./pages/OutboundJourney";
import { PipelineFlow } from "./pages/PipelineFlow";
import { CompetitorDisplacement } from "./pages/CompetitorDisplacement";
import { Campaigns } from "./pages/Campaigns";
import { Sequences } from "./pages/Sequences";
import { Signals } from "./pages/Signals";
import { ProgressBar } from "./components/ProgressBar";

export default function OutboundApp() {
  return (
    <>
      <ProgressBar />
      <Routes>
        <Route index element={<OutboundWorkspace />} />
        <Route path="journey" element={<OutboundJourney />} />
        <Route path="displace" element={<CompetitorDisplacement />} />
        <Route path="pipeline" element={<PipelineFlow />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="sequences" element={<Sequences />} />
        <Route path="signals" element={<Signals />} />
        <Route path="insights" element={<OutboundInsights />} />
      </Routes>
    </>
  );
}
