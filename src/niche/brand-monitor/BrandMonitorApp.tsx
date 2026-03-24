import { Routes, Route } from "react-router-dom";
import { BrandWorkspace } from "./pages/BrandWorkspace";
import { Mentions } from "./pages/Mentions";
import { Sentiment } from "./pages/Sentiment";
import { Alerts } from "./pages/Alerts";
import { Sources } from "./pages/Sources";
import { BrandReports } from "./pages/BrandReports";
import { BrandHistory } from "./pages/BrandHistory";

export default function BrandMonitorApp() {
  return (
    <Routes>
      <Route index element={<BrandWorkspace />} />
      <Route path="mentions" element={<Mentions />} />
      <Route path="sentiment" element={<Sentiment />} />
      <Route path="alerts" element={<Alerts />} />
      <Route path="sources" element={<Sources />} />
      <Route path="reports" element={<BrandReports />} />
      <Route path="history" element={<BrandHistory />} />
    </Routes>
  );
}
