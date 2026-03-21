import { Routes, Route } from "react-router-dom";
import { ContentWorkspace } from "./pages/ContentWorkspace";
import { ContentInsights } from "./pages/ContentInsights";
import { ContentHistory } from "./pages/ContentHistory";
import { CalendarView } from "./pages/CalendarView";
import { PostComposer } from "./pages/PostComposer";
import { BlogWriter } from "./pages/BlogWriter";
import { SeoAnalyzer } from "./pages/SeoAnalyzer";
import { RepurposeEngine } from "./pages/RepurposeEngine";
import { HashtagResearch } from "./pages/HashtagResearch";
import { BrandVoice } from "./pages/BrandVoice";
import { ContentFlywheel } from "./pages/ContentFlywheel";

export default function ContentApp() {
  return (
    <Routes>
      <Route index element={<ContentWorkspace />} />
      <Route path="insights" element={<ContentInsights />} />
      <Route path="history" element={<ContentHistory />} />
      <Route path="calendar" element={<CalendarView />} />
      <Route path="compose" element={<PostComposer />} />
      <Route path="blog" element={<BlogWriter />} />
      <Route path="seo" element={<SeoAnalyzer />} />
      <Route path="repurpose" element={<RepurposeEngine />} />
      <Route path="hashtags" element={<HashtagResearch />} />
      <Route path="brand-voice" element={<BrandVoice />} />
      <Route path="flywheel" element={<ContentFlywheel />} />
    </Routes>
  );
}
