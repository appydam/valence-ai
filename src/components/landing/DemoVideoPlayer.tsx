import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const YOUTUBE_VIDEO_ID = "DBmcbxIGM5Y";
const YOUTUBE_START = 142;

interface DemoVideoPlayerProps {
  variant?: "compact" | "full";
}

// Hand-drawn sketch outline path — irregular blob shape like a marker sketch
const SKETCH_PATH_1 =
  "M 45 8 C 60 3, 95 2, 115 6 C 130 9, 148 14, 155 28 C 162 42, 160 70, 155 85 C 150 100, 135 112, 115 116 C 95 120, 60 119, 45 116 C 30 113, 12 105, 7 90 C 2 75, 3 45, 7 30 C 11 15, 30 13, 45 8 Z";
const SKETCH_PATH_2 =
  "M 47 6 C 62 1, 93 3, 113 7 C 132 11, 150 16, 157 30 C 164 44, 161 68, 156 84 C 151 100, 137 114, 117 117 C 97 120, 62 118, 46 114 C 30 110, 10 103, 5 88 C 0 73, 2 47, 6 32 C 10 17, 32 11, 47 6 Z";


export function DemoVideoPlayer({ variant = "full" }: DemoVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isModalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setIsPlaying(false);
      }
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const handlePlay = () => {
    setIsModalOpen(true);
    setIsPlaying(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setIsPlaying(false);
  };

  return (
    <>
      {variant === "compact" && (
        <motion.button
          onClick={handlePlay}
          className="group relative cursor-pointer select-none"
          style={{ width: 160, height: 130 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          initial={{ opacity: 0, y: 20, rotate: -5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 1.0, duration: 0.7, type: "spring", stiffness: 150, damping: 15 }}
        >
          {/* Subtle glow underneath */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle, hsl(0 0% 100% / 0.06) 0%, transparent 70%)",
              filter: "blur(20px)",
              transform: "scale(1.5)",
            }}
          />

          {/* Hand-drawn sketch SVG */}
          <svg
            viewBox="0 0 162 124"
            className="absolute inset-0 w-full h-full"
            style={{ filter: "drop-shadow(0 2px 8px hsl(0 0% 100% / 0.08))" }}
          >
            {/* Animated sketch outline — path morphs subtly */}
            <motion.path
              d={SKETCH_PATH_1}
              fill="none"
              stroke="hsl(0, 0%, 92%)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 600,
              }}
              initial={{ strokeDashoffset: 600 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ delay: 1.2, duration: 1.5, ease: "easeInOut" }}
            />
            {/* Second sketch line — slightly offset for hand-drawn feel */}
            <motion.path
              d={SKETCH_PATH_2}
              fill="none"
              stroke="hsl(0, 0%, 80%)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.4"
              style={{
                strokeDasharray: 600,
              }}
              initial={{ strokeDashoffset: 600 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ delay: 1.4, duration: 1.5, ease: "easeInOut" }}
            />
          </svg>

          {/* Text content inside the blob */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0, duration: 0.5 }}
          >
            {/* Play icon */}
            <motion.div
              className="relative mb-0.5"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle
                  cx="14"
                  cy="14"
                  r="12"
                  fill="none"
                  stroke="hsl(0, 0%, 88%)"
                  strokeWidth="1.5"
                />
                <path
                  d="M11 9L20 14L11 19V9Z"
                  fill="hsl(0, 0%, 92%)"
                  stroke="hsl(0, 0%, 92%)"
                  strokeWidth="0.5"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
            <span
              className="text-[13px] font-semibold leading-tight"
              style={{
                color: "hsl(0 0% 92%)",
                fontFamily: "'Caveat', 'Segoe Print', 'Comic Sans MS', cursive",
                letterSpacing: "0.5px",
              }}
            >
              Demo
            </span>
            <span
              className="text-[13px] font-semibold leading-tight -mt-1"
              style={{
                color: "hsl(0 0% 92%)",
                fontFamily: "'Caveat', 'Segoe Print', 'Comic Sans MS', cursive",
                letterSpacing: "0.5px",
              }}
            >
              Video
            </span>
          </motion.div>

          {/* Hover glow effect */}
          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: "radial-gradient(circle, hsl(217 91% 60% / 0.08) 0%, transparent 70%)",
            }}
          />
        </motion.button>
      )}

      {/* ── Fullscreen YouTube modal — portaled to body ── */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Backdrop */}
              <motion.div
                className="absolute inset-0"
                style={{ background: "hsl(0 0% 0% / 0.92)", backdropFilter: "blur(16px)" }}
                onClick={handleClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              {/* Video container — nearly full viewport */}
              <motion.div
                className="relative"
                style={{ width: "44vw", height: "44vh", maxWidth: "1800px" }}
                initial={{ scale: 0.85, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 30 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              >
                {/* Glow behind video */}
                <div
                  className="absolute -inset-8 rounded-3xl pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse at center, hsl(217 91% 60% / 0.1) 0%, transparent 70%)",
                    filter: "blur(40px)",
                  }}
                />

                {/* Video frame */}
                <div
                  className="relative w-full h-full rounded-2xl overflow-hidden"
                  style={{
                    border: "1px solid hsl(var(--border) / 0.3)",
                    boxShadow: "0 0 80px hsl(217 91% 60% / 0.1), 0 25px 60px hsl(0 0% 0% / 0.6)",
                    background: "hsl(240 15% 4%)",
                  }}
                >
                  {isPlaying && (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&start=${YOUTUBE_START}&rel=0&modestbranding=1`}
                      title="Valence AI — Autonomous AI Workforce Platform"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className="absolute inset-0"
                    />
                  )}
                </div>

                {/* Close button */}
                <motion.button
                  className="absolute -top-12 right-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                  style={{
                    background: "hsl(0 0% 100% / 0.08)",
                    border: "1px solid hsl(0 0% 100% / 0.12)",
                    color: "hsl(0 0% 100% / 0.7)",
                    backdropFilter: "blur(8px)",
                  }}
                  whileHover={{ scale: 1.05 }}
                  onClick={handleClose}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  ESC
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
