import React from "react";

interface BrowserFrameProps {
  children: React.ReactNode;
  url?: string;
  width?: number;
  height?: number;
}

export const BrowserFrame = ({
  children,
  url = "app.missioncontrol.ai",
  width = 1200,
  height = 680,
}: BrowserFrameProps) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          height: 44,
          backgroundColor: "#0F1622",
          borderBottom: "1px solid #232D3F",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 12,
          flexShrink: 0,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#FF5F57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#FEBC2E" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#28C840" }} />
        </div>

        {/* Address bar */}
        <div
          style={{
            flex: 1,
            height: 26,
            backgroundColor: "#070C18",
            border: "1px solid #232D3F",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            paddingLeft: 12,
            fontSize: 12,
            color: "#6B7C96",
            fontFamily: "JetBrains Mono, monospace",
            maxWidth: 400,
            margin: "0 auto",
          }}
        >
          🔒 {url}
        </div>
      </div>

      {/* Content area */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#070C18",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {children}
      </div>
    </div>
  );
};
