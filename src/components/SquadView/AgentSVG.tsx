import { motion } from "framer-motion";
import { AgentName } from "@/types/mission";

interface AgentSVGProps {
  name: AgentName;
  color: string;
  status: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// KAZE — The Strategist
// Sharp-dressed exec in a tailored navy suit with blue tech accents.
// Working animation: alternating arm typing + slow head nod (reviewing docs).
// ─────────────────────────────────────────────────────────────────────────────
function KazeSVG({ status }: { status: string }) {
  const isWorking = status === "working";
  const isActive  = status === "working" || status === "online";

  const leftArm = {
    animate: isActive ? { rotate: [-8, 4, -8] } : { rotate: 0 },
    transition: isActive
      ? { duration: isWorking ? 0.45 : 0.9, repeat: Infinity, ease: "easeInOut" as const, repeatType: "mirror" as const }
      : { duration: 1.0, ease: "easeOut" as const },
  };

  const rightArm = {
    animate: isActive ? { rotate: [6, -5, 6] } : { rotate: 0 },
    transition: isActive
      ? { duration: isWorking ? 0.45 : 0.9, repeat: Infinity, ease: "easeInOut" as const, repeatType: "mirror" as const, delay: isWorking ? 0.22 : 0.45 }
      : { duration: 1.0, ease: "easeOut" as const },
  };

  const head = {
    animate: isActive ? { rotate: [-4, 2, -4, 0, -4] } : { rotate: 0 },
    transition: isActive
      ? { duration: isWorking ? 3.2 : 5.5, repeat: Infinity, ease: "easeInOut" as const }
      : { duration: 1.2, ease: "easeOut" as const },
  };

  return (
    <svg viewBox="0 0 160 380" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="k-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C8956C" />
          <stop offset="100%" stopColor="#A0714A" />
        </linearGradient>
        <linearGradient id="k-suit-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1A2540" />
          <stop offset="100%" stopColor="#0D1525" />
        </linearGradient>
        <linearGradient id="k-suit-light" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#243060" />
          <stop offset="100%" stopColor="#1A2540" />
        </linearGradient>
        <linearGradient id="k-shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8EEF8" />
          <stop offset="100%" stopColor="#C8D4EC" />
        </linearGradient>
        <linearGradient id="k-tie" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="k-pants" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#12192E" />
          <stop offset="100%" stopColor="#0A1020" />
        </linearGradient>
        <linearGradient id="k-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A1008" />
          <stop offset="100%" stopColor="#0A0804" />
        </linearGradient>
        <radialGradient id="k-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </radialGradient>
        <filter id="k-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.4" />
        </filter>
        <filter id="k-glow-f">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Body glow aura */}
      <ellipse cx="80" cy="190" rx="65" ry="130" fill="url(#k-glow)" />

      {/* Ground shadow */}
      <ellipse cx="80" cy="372" rx="42" ry="7" fill="#3B82F6" opacity="0.25" />
      <ellipse cx="80" cy="372" rx="28" ry="4" fill="#000" opacity="0.4" />

      {/* ── SHOES ── */}
      <rect x="46" y="355" width="28" height="12" rx="5" fill="#0A0A0A" />
      <rect x="88" y="355" width="28" height="12" rx="5" fill="#0A0A0A" />
      <rect x="46" y="355" width="28" height="5" rx="3" fill="#1A1A1A" />
      <rect x="88" y="355" width="28" height="5" rx="3" fill="#1A1A1A" />

      {/* ── TROUSERS ── */}
      <path d="M52 240 L48 355 L74 355 L72 240Z" fill="url(#k-pants)" />
      <path d="M52 240 L50 310 L53 310 L55 240Z" fill="#060C18" opacity="0.5" />
      <path d="M88 240 L90 355 L116 355 L108 240Z" fill="url(#k-pants)" />
      <path d="M108 240 L107 310 L110 310 L112 240Z" fill="#060C18" opacity="0.5" />

      {/* ── LEFT ARM (animated — typing motion) ── */}
      <motion.g
        animate={leftArm.animate}
        transition={leftArm.transition}
        style={{ transformOrigin: "42px 132px" }}
      >
        <path d="M42 130 L28 195 L44 200 L56 132Z" fill="#1A2540" />
        <path d="M42 130 L29 175 L32 177 L44 132Z" fill="#243060" opacity="0.6" />
        <path d="M28 195 L20 255 L36 258 L44 200Z" fill="url(#k-skin)" />
        <ellipse cx="26" cy="262" rx="9" ry="7" fill="url(#k-skin)" />
        <rect x="18" y="258" width="7" height="4" rx="2" fill="#B07850" />
        <rect x="18" y="262" width="7" height="4" rx="2" fill="#B07850" />
        <rect x="18" y="266" width="7" height="4" rx="2" fill="#B07850" />
        <rect x="22" y="251" width="16" height="6" rx="2" fill="#E8EEF8" />
        <rect x="22" y="245" width="8" height="8" rx="2" fill="#3B82F6" />
        <rect x="23" y="246" width="6" height="6" rx="1" fill="#1D3A6E" />
        <line x1="26" y1="249" x2="28" y2="249" stroke="#3B82F6" strokeWidth="1" />
        <line x1="26" y1="249" x2="26" y2="247" stroke="#3B82F6" strokeWidth="1" />
      </motion.g>

      {/* ── RIGHT ARM (animated — typing, phase offset) ── */}
      <motion.g
        animate={rightArm.animate}
        transition={rightArm.transition}
        style={{ transformOrigin: "118px 132px" }}
      >
        <path d="M118 130 L132 195 L116 200 L104 132Z" fill="#1A2540" />
        <path d="M118 130 L131 175 L128 177 L116 132Z" fill="#243060" opacity="0.6" />
        <path d="M132 195 L140 255 L124 258 L116 200Z" fill="url(#k-skin)" />
        <ellipse cx="136" cy="262" rx="9" ry="7" fill="url(#k-skin)" />
        <rect x="135" y="258" width="7" height="4" rx="2" fill="#B07850" />
        <rect x="135" y="262" width="7" height="4" rx="2" fill="#B07850" />
        <rect x="135" y="266" width="7" height="4" rx="2" fill="#B07850" />
        <rect x="122" y="251" width="16" height="6" rx="2" fill="#E8EEF8" />
      </motion.g>

      {/* ── TORSO / JACKET ── */}
      <path d="M42 128 Q80 112 118 128 L114 245 L46 245Z" fill="url(#k-suit-body)" filter="url(#k-shadow)" />
      <path d="M42 128 Q61 120 80 118 L78 245 L46 245Z" fill="url(#k-suit-light)" opacity="0.5" />
      <line x1="60" y1="135" x2="56" y2="240" stroke="#0A1020" strokeWidth="1.5" />
      <line x1="100" y1="135" x2="104" y2="240" stroke="#0A1020" strokeWidth="1.5" />
      <rect x="92" y="148" width="14" height="10" rx="2" fill="#E8EEF8" opacity="0.9" />
      <path d="M92 148 L99 143 L106 148" fill="#3B82F6" opacity="0.8" />
      <circle cx="80" cy="175" r="2" fill="#243060" />
      <circle cx="80" cy="190" r="2" fill="#243060" />
      <circle cx="80" cy="205" r="2" fill="#243060" />
      <circle cx="80" cy="220" r="2" fill="#243060" />

      {/* ── SHIRT & TIE ── */}
      <path d="M65 128 L80 122 L95 128 L92 165 L68 165Z" fill="url(#k-shirt)" />
      <path d="M76 128 L84 128 L82 168 L80 170 L78 168Z" fill="url(#k-tie)" />
      <path d="M76 128 L80 132 L84 128 L80 125Z" fill="#1D4ED8" />
      <path d="M65 128 L72 135 L80 128" fill="#E8EEF8" />
      <path d="M95 128 L88 135 L80 128" fill="#C8D4EC" />

      {/* ── BELT ── */}
      <rect x="50" y="238" width="60" height="9" rx="2" fill="#0A0A14" />
      <rect x="74" y="237" width="12" height="11" rx="2" fill="#1A1A28" />
      <rect x="76" y="239" width="8" height="7" rx="1" fill="#3B82F6" opacity="0.7" />

      {/* ── NECK ── */}
      <rect x="70" y="108" width="20" height="18" rx="4" fill="url(#k-skin)" />

      {/* ── HEAD (animated — slow nod while reviewing) ── */}
      <motion.g
        animate={head.animate}
        transition={head.transition}
        style={{ transformOrigin: "80px 108px" }}
      >
        <rect x="48" y="55" width="64" height="58" rx="22" fill="url(#k-skin)" filter="url(#k-shadow)" />
        <path d="M55 95 Q80 116 105 95" fill="url(#k-skin)" />
        <ellipse cx="58" cy="86" rx="10" ry="7" fill="#8A5C38" opacity="0.2" />
        <ellipse cx="102" cy="86" rx="10" ry="7" fill="#8A5C38" opacity="0.2" />
        <path d="M48 72 Q50 50 80 48 Q110 50 112 72 Q110 58 80 56 Q50 58 48 72Z" fill="url(#k-hair)" />
        <path d="M48 72 Q46 62 50 58" fill="url(#k-hair)" />
        <path d="M54 60 Q65 56 80 56" stroke="#2A1A0A" strokeWidth="1.5" fill="none" opacity="0.6" />
        <path d="M58 57 Q70 54 82 54" stroke="#2A1A0A" strokeWidth="1" fill="none" opacity="0.4" />
        <path d="M60 76 Q68 73 74 76" stroke="#1A0800" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M86 76 Q92 73 100 76" stroke="#1A0800" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="67" cy="82" rx="7" ry="6" fill="white" />
        <ellipse cx="93" cy="82" rx="7" ry="6" fill="white" />
        <circle cx="67" cy="83" r="4.5" fill="#1E3A6E" />
        <circle cx="93" cy="83" r="4.5" fill="#1E3A6E" />
        <circle cx="67" cy="83" r="2.5" fill="#050810" />
        <circle cx="93" cy="83" r="2.5" fill="#050810" />
        <circle cx="69" cy="81" r="1.2" fill="white" opacity="0.9" />
        <circle cx="95" cy="81" r="1.2" fill="white" opacity="0.9" />
        <path d="M60 79 Q67 76 74 79" stroke="#6B3A1A" strokeWidth="1" fill="none" />
        <path d="M86 79 Q93 76 100 79" stroke="#6B3A1A" strokeWidth="1" fill="none" />
        <path d="M78 86 Q75 92 77 95 Q80 97 83 95 Q85 92 82 86" fill="#A07050" opacity="0.5" />
        <circle cx="76" cy="94" r="2.5" fill="#8A5C38" opacity="0.4" />
        <circle cx="84" cy="94" r="2.5" fill="#8A5C38" opacity="0.4" />
        <path d="M70 101 Q80 107 90 101" stroke="#6B3010" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M70 101 Q75 103 80 102" stroke="#8B4020" strokeWidth="1" fill="none" opacity="0.5" />
        <ellipse cx="47" cy="84" rx="5" ry="7" fill="url(#k-skin)" />
        <ellipse cx="47" cy="84" rx="2.5" ry="4" fill="#9A6040" opacity="0.4" />
        <ellipse cx="113" cy="84" rx="5" ry="7" fill="url(#k-skin)" />
        <ellipse cx="113" cy="84" rx="2.5" ry="4" fill="#9A6040" opacity="0.4" />
        <rect x="63" y="145" width="16" height="10" rx="3" fill="#0A1830" />
        <rect x="64" y="146" width="14" height="8" rx="2" fill="#3B82F6" opacity="0.3" />
        <line x1="65" y1="150" x2="77" y2="150" stroke="#3B82F6" strokeWidth="1" opacity="0.9" />
        <line x1="65" y1="152" x2="73" y2="152" stroke="#3B82F6" strokeWidth="1" opacity="0.6" />
        <circle cx="76" cy="151" r="1.5" fill="#3B82F6" className="animate-pulse-glow" />
      </motion.g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCOUT — The Field Operative
// Long dark trench coat over dark clothes. Cap/beanie. Athletic build.
// Working animation: examine tablet with left arm lift + right arm swipe + head nod.
// ─────────────────────────────────────────────────────────────────────────────
function ScoutSVG({ status }: { status: string }) {
  const isWorking = status === "working";
  const isActive  = status === "working" || status === "online";

  const leftArmWithTablet = {
    animate: isActive ? { rotate: [-5, 3, -5], y: [0, -4, 0] } : { rotate: 0, y: 0 },
    transition: isActive
      ? { duration: isWorking ? 2.0 : 3.5, repeat: Infinity, ease: "easeInOut" as const }
      : { duration: 1.0, ease: "easeOut" as const },
  };

  const rightArm = {
    animate: isActive
      ? { rotate: [0, -18, -10, -18, 0], x: [0, -8, -4, -8, 0] }
      : { rotate: 0, x: 0 },
    transition: isActive
      ? {
          duration: isWorking ? 2.4 : 4.5,
          repeat: Infinity,
          ease: "easeInOut" as const,
          times: [0, 0.3, 0.5, 0.7, 1],
        }
      : { duration: 1.0, ease: "easeOut" as const },
  };

  const head = {
    animate: isActive
      ? { rotate: [0, 8, 3, 8, 0], y: [0, 3, 1, 3, 0] }
      : { rotate: 0, y: 0 },
    transition: isActive
      ? {
          duration: isWorking ? 2.8 : 5.0,
          repeat: Infinity,
          ease: "easeInOut" as const,
          times: [0, 0.35, 0.5, 0.65, 1],
        }
      : { duration: 1.2, ease: "easeOut" as const },
  };

  const scanLines = {
    animate: isActive ? { y: [0, -4, 0] } : { y: 0 },
    transition: isActive
      ? { duration: isWorking ? 1.2 : 2.5, repeat: Infinity, ease: "linear" as const }
      : { duration: 0.8, ease: "easeOut" as const },
  };

  return (
    <svg viewBox="0 0 160 380" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="s-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5E3C" />
          <stop offset="100%" stopColor="#6A4028" />
        </linearGradient>
        <linearGradient id="s-coat" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1C2A1C" />
          <stop offset="100%" stopColor="#0E180E" />
        </linearGradient>
        <linearGradient id="s-coat-light" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2A3E2A" />
          <stop offset="100%" stopColor="#1C2A1C" />
        </linearGradient>
        <linearGradient id="s-pants" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A1A1A" />
          <stop offset="100%" stopColor="#0A0A0A" />
        </linearGradient>
        <linearGradient id="s-cap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A2A1A" />
          <stop offset="100%" stopColor="#0E1A0E" />
        </linearGradient>
        <linearGradient id="s-tablet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A1A0A" />
          <stop offset="100%" stopColor="#040E04" />
        </linearGradient>
        <radialGradient id="s-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22C55E" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Body glow */}
      <ellipse cx="80" cy="200" rx="60" ry="120" fill="url(#s-glow)" />

      {/* Ground shadow */}
      <ellipse cx="80" cy="372" rx="40" ry="6" fill="#22C55E" opacity="0.2" />
      <ellipse cx="80" cy="372" rx="26" ry="3.5" fill="#000" opacity="0.4" />

      {/* ── BOOTS ── */}
      <rect x="44" y="348" width="30" height="18" rx="6" fill="#1A1008" />
      <rect x="86" y="348" width="30" height="18" rx="6" fill="#1A1008" />
      <rect x="44" y="348" width="30" height="7" rx="4" fill="#2A1A10" />
      <rect x="86" y="348" width="30" height="7" rx="4" fill="#2A1A10" />
      <line x1="52" y1="352" x2="66" y2="352" stroke="#3A2A1A" strokeWidth="1" />
      <line x1="52" y1="356" x2="66" y2="356" stroke="#3A2A1A" strokeWidth="1" />
      <line x1="94" y1="352" x2="108" y2="352" stroke="#3A2A1A" strokeWidth="1" />
      <line x1="94" y1="356" x2="108" y2="356" stroke="#3A2A1A" strokeWidth="1" />

      {/* ── PANTS ── */}
      <path d="M54 248 L50 350 L76 350 L74 248Z" fill="url(#s-pants)" />
      <path d="M86 248 L88 350 L114 350 L106 248Z" fill="url(#s-pants)" />

      {/* ── COAT LOWER ── */}
      <path d="M34 210 Q36 300 40 360 L56 360 L56 248 L54 210Z" fill="url(#s-coat)" opacity="0.9" />
      <path d="M126 210 Q124 300 120 360 L104 360 L104 248 L106 210Z" fill="url(#s-coat)" opacity="0.9" />

      {/* ── LEFT ARM + TABLET (animated — lift/examine) ── */}
      <motion.g
        animate={leftArmWithTablet.animate}
        transition={leftArmWithTablet.transition}
        style={{ transformOrigin: "38px 134px" }}
      >
        <path d="M38 132 L20 200 L36 206 L52 138Z" fill="url(#s-coat)" />
        <path d="M38 132 L21 175 L24 177 L40 134Z" fill="url(#s-coat-light)" opacity="0.5" />
        <path d="M20 200 L14 255 L30 260 L36 206Z" fill="url(#s-skin)" />
        <rect x="2" y="252" width="28" height="36" rx="4" fill="url(#s-tablet)" />
        <rect x="4" y="254" width="24" height="32" rx="3" fill="#0A2A14" />
        <rect x="5" y="255" width="22" height="30" rx="2" fill="#061408" />
        {/* Animated scan lines inside tablet */}
        <motion.g
          animate={scanLines.animate}
          transition={scanLines.transition}
        >
          <line x1="6" y1="260" x2="26" y2="260" stroke="#22C55E" strokeWidth="1" opacity="0.8" />
          <line x1="6" y1="264" x2="22" y2="264" stroke="#22C55E" strokeWidth="0.8" opacity="0.6" />
          <line x1="6" y1="268" x2="24" y2="268" stroke="#22C55E" strokeWidth="0.8" opacity="0.5" />
        </motion.g>
        <circle cx="22" cy="270" r="3" fill="#22C55E" opacity="0.8" className="animate-pulse-glow" />
        <rect x="6" y="274" width="8" height="8" rx="1" fill="#22C55E" opacity="0.3" />
        <rect x="0" y="258" width="6" height="20" rx="3" fill="url(#s-skin)" />
        <rect x="14" y="248" width="18" height="6" rx="2" fill="#2A2A2A" />
      </motion.g>

      {/* ── RIGHT ARM (animated — swiping toward tablet) ── */}
      <motion.g
        animate={rightArm.animate}
        transition={rightArm.transition}
        style={{ transformOrigin: "122px 134px" }}
      >
        <path d="M122 132 L140 200 L124 206 L108 138Z" fill="url(#s-coat)" />
        <path d="M122 132 L139 175 L136 177 L120 134Z" fill="url(#s-coat-light)" opacity="0.5" />
        <path d="M140 200 L146 255 L130 260 L124 206Z" fill="url(#s-skin)" />
        <ellipse cx="140" cy="263" rx="10" ry="8" fill="url(#s-skin)" />
        <rect x="128" y="248" width="18" height="6" rx="2" fill="#2A2A2A" />
      </motion.g>

      {/* ── COAT UPPER / TORSO ── */}
      <path d="M38 130 Q80 112 122 130 L118 252 L42 252Z" fill="url(#s-coat)" filter="url(#k-shadow)" />
      <path d="M38 130 Q59 120 80 118 L78 252 L42 252Z" fill="url(#s-coat-light)" opacity="0.45" />
      <path d="M62 130 L56 155 L80 145 L104 155 L98 130 L80 138Z" fill="url(#s-coat-light)" opacity="0.6" />
      <path d="M60 120 L80 114 L100 120 L98 130 L80 125 L62 130Z" fill="#2A3E2A" />
      <path d="M72 130 L80 126 L88 130 L86 148 L74 148Z" fill="#1E2A1E" />
      <line x1="62" y1="138" x2="58" y2="248" stroke="#0A180A" strokeWidth="1.5" />
      <line x1="98" y1="138" x2="102" y2="248" stroke="#0A180A" strokeWidth="1.5" />
      <rect x="44" y="210" width="72" height="8" rx="2" fill="#0A1408" />
      <rect x="73" y="209" width="14" height="10" rx="2" fill="#162016" />
      <rect x="75" y="211" width="10" height="6" rx="1" fill="#22C55E" opacity="0.5" />
      <rect x="56" y="155" width="18" height="14" rx="2" fill="#162416" />
      <line x1="56" y1="162" x2="74" y2="162" stroke="#0A1A0A" strokeWidth="1" />
      <rect x="86" y="155" width="18" height="14" rx="2" fill="#162416" />
      <line x1="86" y1="162" x2="104" y2="162" stroke="#0A1A0A" strokeWidth="1" />

      {/* ── NECK ── */}
      <rect x="70" y="108" width="20" height="18" rx="4" fill="url(#s-skin)" />

      {/* ── HEAD + BEANIE (animated — look-down nod synced with tablet swipe) ── */}
      <motion.g
        animate={head.animate}
        transition={head.transition}
        style={{ transformOrigin: "80px 108px" }}
      >
        <rect x="50" y="55" width="60" height="60" rx="20" fill="url(#s-skin)" />
        <path d="M56 100 Q80 118 104 100" fill="url(#s-skin)" />
        <ellipse cx="60" cy="88" rx="9" ry="6" fill="#5A3018" opacity="0.25" />
        <ellipse cx="100" cy="88" rx="9" ry="6" fill="#5A3018" opacity="0.25" />
        <rect x="46" y="42" width="68" height="30" rx="14" fill="url(#s-cap)" />
        <rect x="44" y="62" width="72" height="12" rx="4" fill="#0E1A0E" />
        <circle cx="80" cy="50" r="5" fill="#162A16" />
        <path d="M77 50 L80 46 L83 50 L80 54Z" fill="#22C55E" opacity="0.8" />
        <path d="M44 74 Q80 80 116 74 L116 78 Q80 84 44 78Z" fill="#0A1408" />
        <path d="M60 77 Q68 74 75 77" stroke="#0A0400" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M85 77 Q92 74 100 77" stroke="#0A0400" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="68" cy="84" rx="8" ry="6.5" fill="white" />
        <ellipse cx="92" cy="84" rx="8" ry="6.5" fill="white" />
        <circle cx="68" cy="84" r="5" fill="#1A4A1A" />
        <circle cx="92" cy="84" r="5" fill="#1A4A1A" />
        <circle cx="68" cy="84" r="2.8" fill="#050805" />
        <circle cx="92" cy="84" r="2.8" fill="#050805" />
        <circle cx="70" cy="82" r="1.5" fill="white" opacity="0.9" />
        <circle cx="94" cy="82" r="1.5" fill="white" opacity="0.9" />
        <path d="M78 89 Q76 95 78 98 Q80 100 82 98 Q84 95 82 89" fill="#7A4820" opacity="0.45" />
        <circle cx="77" cy="97" r="2" fill="#6A3818" opacity="0.35" />
        <circle cx="83" cy="97" r="2" fill="#6A3818" opacity="0.35" />
        <ellipse cx="80" cy="104" rx="18" ry="8" fill="#3A1A08" opacity="0.25" />
        <path d="M70 103 Q80 108 90 103" stroke="#4A1808" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="49" cy="86" rx="5" ry="7" fill="url(#s-skin)" />
        <ellipse cx="111" cy="86" rx="5" ry="7" fill="url(#s-skin)" />
      </motion.g>

      {/* Tablet border glow */}
      <rect x="2" y="252" width="28" height="36" rx="4" fill="none"
        stroke="#22C55E" strokeWidth="0.5" opacity="0.5" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FORGE — The Mechanic
// Worn cargo pants, technical jacket/work vest. Stocky build. Short beard.
// Working animation: wrench ratchet rotation + right arm bracing + head looking down.
// ─────────────────────────────────────────────────────────────────────────────
function ForgeSVG({ status }: { status: string }) {
  const isWorking = status === "working";
  const isActive  = status === "working" || status === "online";

  const leftArmWrench = {
    animate: isActive
      ? { rotate: [-20, 15, -20, 15, -20] }
      : { rotate: 0 },
    transition: isActive
      ? {
          duration: isWorking ? 1.2 : 2.5,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
          times: [0, 0.35, 0.5, 0.85, 1],
        }
      : { duration: 1.0, ease: "easeOut" as const },
  };

  const rightArm = {
    animate: isActive ? { rotate: [8, -5, 8] } : { rotate: 0 },
    transition: isActive
      ? { duration: isWorking ? 1.2 : 2.5, repeat: Infinity, ease: "easeInOut" as const }
      : { duration: 1.0, ease: "easeOut" as const },
  };

  const head = {
    animate: isActive
      ? { rotate: [0, 12, 8, 12, 0] }
      : { rotate: 0 },
    transition: isActive
      ? {
          duration: isWorking ? 2.5 : 4.5,
          repeat: Infinity,
          ease: "easeInOut" as const,
          times: [0, 0.4, 0.5, 0.7, 1],
        }
      : { duration: 1.2, ease: "easeOut" as const },
  };

  return (
    <svg viewBox="0 0 160 380" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="f-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4956A" />
          <stop offset="100%" stopColor="#B07040" />
        </linearGradient>
        <linearGradient id="f-vest" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A1800" />
          <stop offset="100%" stopColor="#180E00" />
        </linearGradient>
        <linearGradient id="f-hivis" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
        <linearGradient id="f-cargo" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2A2010" />
          <stop offset="100%" stopColor="#1A140A" />
        </linearGradient>
        <linearGradient id="f-tshirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A1008" />
          <stop offset="100%" stopColor="#100A04" />
        </linearGradient>
        <radialGradient id="f-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Body glow */}
      <ellipse cx="80" cy="200" rx="68" ry="125" fill="url(#f-glow)" />

      {/* Ground shadow */}
      <ellipse cx="80" cy="372" rx="46" ry="8" fill="#F97316" opacity="0.2" />
      <ellipse cx="80" cy="372" rx="30" ry="4.5" fill="#000" opacity="0.45" />

      {/* ── WORK BOOTS ── */}
      <rect x="36" y="350" width="36" height="18" rx="5" fill="#1A0E04" />
      <rect x="90" y="350" width="36" height="18" rx="5" fill="#1A0E04" />
      <rect x="36" y="350" width="36" height="8" rx="4" fill="#2A1A08" />
      <rect x="90" y="350" width="36" height="8" rx="4" fill="#2A1A08" />
      <ellipse cx="52" cy="355" rx="14" ry="6" fill="#3A2A14" opacity="0.5" />
      <ellipse cx="108" cy="355" rx="14" ry="6" fill="#3A2A14" opacity="0.5" />

      {/* ── CARGO PANTS ── */}
      <path d="M46 248 L40 352 L74 352 L72 248Z" fill="url(#f-cargo)" />
      <rect x="42" y="275" width="22" height="28" rx="3" fill="#221808" />
      <line x1="42" y1="289" x2="64" y2="289" stroke="#1A1006" strokeWidth="1.5" />
      <path d="M88 248 L92 352 L126 352 L114 248Z" fill="url(#f-cargo)" />
      <rect x="96" y="275" width="22" height="28" rx="3" fill="#221808" />
      <line x1="96" y1="289" x2="118" y2="289" stroke="#1A1006" strokeWidth="1.5" />

      {/* ── LEFT ARM + WRENCH (animated — ratchet wrench turning) ── */}
      <motion.g
        animate={leftArmWrench.animate}
        transition={leftArmWrench.transition}
        style={{ transformOrigin: "34px 130px" }}
      >
        <path d="M34 128 L14 200 L30 208 L48 134Z" fill="#1A1008" />
        <path d="M14 200 L8 262 L26 268 L30 208Z" fill="url(#f-skin)" />
        <ellipse cx="14" cy="274" rx="11" ry="9" fill="url(#f-skin)" />
        <rect x="2" y="258" width="10" height="38" rx="4" fill="#4A4A4A" />
        <rect x="-2" y="258" width="18" height="8" rx="3" fill="#5A5A5A" />
        <rect x="-2" y="288" width="18" height="8" rx="3" fill="#5A5A5A" />
        <rect x="4" y="262" width="3" height="28" rx="2" fill="#8A8A8A" opacity="0.5" />
      </motion.g>

      {/* ── RIGHT ARM (animated — bracing/holding work piece) ── */}
      <motion.g
        animate={rightArm.animate}
        transition={rightArm.transition}
        style={{ transformOrigin: "126px 130px" }}
      >
        <path d="M126 128 L146 200 L130 208 L112 134Z" fill="#1A1008" />
        <path d="M146 200 L152 262 L134 268 L130 208Z" fill="url(#f-skin)" />
        <ellipse cx="148" cy="274" rx="11" ry="9" fill="url(#f-skin)" />
        <rect x="150" y="265" width="7" height="5" rx="2" fill="#C07040" />
        <rect x="150" y="270" width="7" height="5" rx="2" fill="#C07040" />
        <rect x="150" y="275" width="7" height="5" rx="2" fill="#C07040" />
      </motion.g>

      {/* ── VEST / JACKET ── */}
      <path d="M34 126 Q80 108 126 126 L120 252 L40 252Z" fill="url(#f-tshirt)" />
      <path d="M34 126 Q50 118 62 122 L58 252 L40 252Z" fill="url(#f-vest)" />
      <path d="M126 126 Q110 118 98 122 L102 252 L120 252Z" fill="url(#f-vest)" />
      <rect x="34" y="175" width="28" height="6" rx="2" fill="url(#f-hivis)" opacity="0.9" />
      <rect x="98" y="175" width="28" height="6" rx="2" fill="url(#f-hivis)" opacity="0.9" />
      <rect x="34" y="210" width="28" height="6" rx="2" fill="url(#f-hivis)" opacity="0.7" />
      <rect x="98" y="210" width="28" height="6" rx="2" fill="url(#f-hivis)" opacity="0.7" />
      <rect x="38" y="140" width="20" height="20" rx="2" fill="#1E0E00" />
      <rect x="102" y="140" width="20" height="20" rx="2" fill="#1E0E00" />
      <rect x="38" y="140" width="20" height="7" rx="2" fill="#2A1400" />
      <rect x="102" y="140" width="20" height="7" rx="2" fill="#2A1400" />
      <rect x="42" y="143" width="12" height="4" rx="1" fill="#F97316" opacity="0.8" />
      <path d="M62 122 L80 118 L98 122 L96 252 L64 252Z" fill="url(#f-tshirt)" />
      <line x1="80" y1="125" x2="80" y2="250" stroke="#3A3030" strokeWidth="2" />
      <rect x="77" y="148" width="6" height="4" rx="1" fill="#4A4040" />
      <rect x="42" y="244" width="76" height="10" rx="2" fill="#1A0E00" />
      <rect x="73" y="243" width="14" height="12" rx="2" fill="#2A1A08" />
      <rect x="75" y="245" width="10" height="8" rx="1" fill="#F97316" opacity="0.6" />

      {/* ── NECK ── */}
      <rect x="68" y="106" width="24" height="20" rx="5" fill="url(#f-skin)" />

      {/* ── HEAD + HARD HAT (animated — looking down at work) ── */}
      <motion.g
        animate={head.animate}
        transition={head.transition}
        style={{ transformOrigin: "80px 106px" }}
      >
        <rect x="44" y="52" width="72" height="62" rx="22" fill="url(#f-skin)" />
        <path d="M52 98 Q80 118 108 98" fill="url(#f-skin)" />
        <ellipse cx="80" cy="57" rx="42" ry="18" fill="url(#f-hivis)" />
        <rect x="38" y="52" width="84" height="14" rx="5" fill="#C2410C" />
        <ellipse cx="80" cy="52" rx="42" ry="10" fill="url(#f-hivis)" />
        <path d="M32 64 Q80 70 128 64 L126 68 Q80 74 34 68Z" fill="#C2410C" />
        <rect x="38" y="55" width="84" height="4" rx="2" fill="#F97316" opacity="0.5" />
        <path d="M57 76 Q66 73 74 76" stroke="#1A0800" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M86 76 Q94 73 103 76" stroke="#1A0800" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <ellipse cx="66" cy="83" rx="8" ry="6.5" fill="white" />
        <ellipse cx="94" cy="83" rx="8" ry="6.5" fill="white" />
        <circle cx="66" cy="83" r="5" fill="#4A2A00" />
        <circle cx="94" cy="83" r="5" fill="#4A2A00" />
        <circle cx="66" cy="83" r="2.8" fill="#080400" />
        <circle cx="94" cy="83" r="2.8" fill="#080400" />
        <circle cx="68" cy="81" r="1.5" fill="white" opacity="0.9" />
        <circle cx="96" cy="81" r="1.5" fill="white" opacity="0.9" />
        <path d="M77 88 Q74 95 77 99 Q80 102 83 99 Q86 95 83 88" fill="#9A6030" opacity="0.5" />
        <ellipse cx="76" cy="98" rx="3.5" ry="2.5" fill="#8A5028" opacity="0.4" />
        <ellipse cx="84" cy="98" rx="3.5" ry="2.5" fill="#8A5028" opacity="0.4" />
        <path d="M56 95 Q80 118 104 95 Q104 110 80 116 Q56 110 56 95Z" fill="#2A1408" opacity="0.6" />
        <path d="M60 96 Q80 112 100 96" stroke="#1A0C04" strokeWidth="1" fill="none" opacity="0.3" />
        <path d="M68 105 Q80 110 92 105" stroke="#3A1808" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="43" cy="84" rx="6" ry="8" fill="url(#f-skin)" />
        <ellipse cx="117" cy="84" rx="6" ry="8" fill="url(#f-skin)" />
        <circle cx="117" cy="88" r="3" fill="#F97316" filter="url(#k-glow-f)" />
      </motion.g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GHOST — The Shadow
// Dark hooded jacket, black cargo pants, face partially covered by hood/mask.
// Working animation: rapid typing arms + subtle eye gaze shift.
// ─────────────────────────────────────────────────────────────────────────────
function GhostSVG({ status }: { status: string }) {
  const isWorking = status === "working";
  const isActive  = status === "working" || status === "online";

  const leftArm = {
    animate: isActive
      ? { rotate: [-12, 6, -10, 8, -12], y: [0, -3, -1, -4, 0] }
      : { rotate: 0, y: 0 },
    transition: isActive
      ? {
          duration: isWorking ? 0.35 : 0.75,
          repeat: Infinity,
          ease: "easeInOut" as const,
          times: [0, 0.25, 0.5, 0.75, 1],
        }
      : { duration: 1.0, ease: "easeOut" as const },
  };

  const rightArm = {
    animate: isActive
      ? { rotate: [8, -10, 6, -12, 8], y: [0, -4, -1, -3, 0] }
      : { rotate: 0, y: 0 },
    transition: isActive
      ? {
          duration: isWorking ? 0.35 : 0.75,
          repeat: Infinity,
          ease: "easeInOut" as const,
          times: [0, 0.25, 0.5, 0.75, 1],
          delay: isWorking ? 0.175 : 0.375,
        }
      : { duration: 1.0, ease: "easeOut" as const },
  };

  const head = {
    animate: isActive ? { rotate: [-2, 2, -2] } : { rotate: 0 },
    transition: isActive
      ? { duration: isWorking ? 4.0 : 6.0, repeat: Infinity, ease: "easeInOut" as const }
      : { duration: 1.2, ease: "easeOut" as const },
  };

  const eyes = {
    animate: isActive
      ? { x: [-2, 2, -1, 3, -2], y: [0, -1, 1, 0, 0] }
      : { x: 0, y: 0 },
    transition: isActive
      ? {
          duration: isWorking ? 2.0 : 4.0,
          repeat: Infinity,
          ease: "easeInOut" as const,
          times: [0, 0.3, 0.5, 0.75, 1],
        }
      : { duration: 1.0, ease: "easeOut" as const },
  };

  return (
    <svg viewBox="0 0 160 380" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="g-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8C4A0" />
          <stop offset="100%" stopColor="#C8A070" />
        </linearGradient>
        <linearGradient id="g-hoodie" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#14101E" />
          <stop offset="100%" stopColor="#0A0810" />
        </linearGradient>
        <linearGradient id="g-hoodie-light" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1E1A2E" />
          <stop offset="100%" stopColor="#14101E" />
        </linearGradient>
        <linearGradient id="g-pants" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0E0A18" />
          <stop offset="100%" stopColor="#06040C" />
        </linearGradient>
        <linearGradient id="g-mask" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A1428" />
          <stop offset="100%" stopColor="#0E0A1C" />
        </linearGradient>
        <radialGradient id="g-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A855F7" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="g-eye-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A855F7" stopOpacity="1" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.6" />
        </radialGradient>
        <filter id="g-eye-blur">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Body glow */}
      <ellipse cx="80" cy="190" rx="58" ry="125" fill="url(#g-glow)" />
      <ellipse cx="80" cy="280" rx="50" ry="40" fill="#A855F7" opacity="0.06" />

      {/* Ground shadow */}
      <ellipse cx="80" cy="373" rx="38" ry="6" fill="#A855F7" opacity="0.3" />
      <ellipse cx="80" cy="373" rx="24" ry="3.5" fill="#000" opacity="0.5" />

      {/* ── SNEAKERS ── */}
      <rect x="44" y="352" width="32" height="16" rx="7" fill="#08060E" />
      <rect x="86" y="352" width="32" height="16" rx="7" fill="#08060E" />
      <rect x="42" y="360" width="36" height="8" rx="5" fill="#14101E" />
      <rect x="84" y="360" width="36" height="8" rx="5" fill="#14101E" />
      <rect x="44" y="354" width="32" height="4" rx="2" fill="#A855F7" opacity="0.6" />
      <rect x="86" y="354" width="32" height="4" rx="2" fill="#A855F7" opacity="0.6" />

      {/* ── PANTS ── */}
      <path d="M55 245 L50 354 L78 354 L76 245Z" fill="url(#g-pants)" />
      <path d="M85 245 L88 354 L116 354 L106 245Z" fill="url(#g-pants)" />
      <line x1="62" y1="248" x2="60" y2="352" stroke="#1A1428" strokeWidth="1" opacity="0.6" />
      <line x1="98" y1="248" x2="100" y2="352" stroke="#1A1428" strokeWidth="1" opacity="0.6" />

      {/* ── HOODIE LOWER + KANGAROO POCKET ── */}
      <rect x="54" y="220" width="52" height="28" rx="5" fill="#0E0A18" />
      <line x1="54" y1="220" x2="80" y2="220" stroke="#1A1428" strokeWidth="1.5" />
      <line x1="106" y1="220" x2="80" y2="220" stroke="#1A1428" strokeWidth="1.5" />
      <rect x="56" y="222" width="48" height="24" rx="4" fill="#A855F7" opacity="0.08" />

      {/* ── LEFT ARM (animated — fast typing, Ghost style) ── */}
      <motion.g
        animate={leftArm.animate}
        transition={leftArm.transition}
        style={{ transformOrigin: "42px 132px" }}
      >
        <path d="M42 130 L24 205 L40 212 L56 136Z" fill="url(#g-hoodie)" />
        <path d="M42 130 L25 180 L28 182 L44 132Z" fill="url(#g-hoodie-light)" opacity="0.5" />
        <path d="M24 205 L18 268 L34 274 L40 212Z" fill="url(#g-skin)" />
        <ellipse cx="22" cy="278" rx="10" ry="8" fill="url(#g-skin)" />
        <rect x="14" y="272" width="7" height="5" rx="2" fill="#D4A880" />
        <rect x="14" y="277" width="7" height="5" rx="2" fill="#D4A880" />
        <rect x="14" y="282" width="7" height="5" rx="2" fill="#D4A880" />
        <rect x="18" y="262" width="20" height="6" rx="3" fill="#1A1428" />
        <rect x="18" y="262" width="20" height="2" rx="1" fill="#A855F7" opacity="0.6" />
      </motion.g>

      {/* ── RIGHT ARM (animated — phase-offset typing) ── */}
      <motion.g
        animate={rightArm.animate}
        transition={rightArm.transition}
        style={{ transformOrigin: "118px 132px" }}
      >
        <path d="M118 130 L136 205 L120 212 L104 136Z" fill="url(#g-hoodie)" />
        <path d="M118 130 L135 180 L132 182 L116 132Z" fill="url(#g-hoodie-light)" opacity="0.5" />
        <path d="M136 205 L142 268 L126 274 L120 212Z" fill="url(#g-skin)" />
        <ellipse cx="138" cy="278" rx="10" ry="8" fill="url(#g-skin)" />
        <rect x="122" y="262" width="20" height="6" rx="3" fill="#1A1428" />
        <rect x="122" y="262" width="20" height="2" rx="1" fill="#A855F7" opacity="0.6" />
      </motion.g>

      {/* ── HOODIE TORSO ── */}
      <path d="M42 128 Q80 110 118 128 L112 252 L48 252Z" fill="url(#g-hoodie)" />
      <path d="M42 128 Q61 118 80 115 L78 252 L48 252Z" fill="url(#g-hoodie-light)" opacity="0.4" />
      <line x1="80" y1="128" x2="80" y2="252" stroke="#1E1A2E" strokeWidth="2.5" />
      <rect x="77" y="155" width="6" height="5" rx="1" fill="#2A2038" />
      <line x1="42" y1="128" x2="44" y2="252" stroke="#A855F7" strokeWidth="1.5" opacity="0.4" />
      <line x1="118" y1="128" x2="116" y2="252" stroke="#A855F7" strokeWidth="1.5" opacity="0.4" />

      {/* ── HOOD ── */}
      <path d="M36 110 Q80 85 124 110 L120 135 L118 128 Q80 112 42 128 L40 135Z" fill="#1A1628" />
      <path d="M50 115 Q80 95 110 115 L108 128 Q80 115 52 128Z" fill="#0E0A1C" opacity="0.8" />
      <path d="M36 110 Q80 85 124 110" fill="none" stroke="#A855F7" strokeWidth="1" opacity="0.5" />

      {/* ── NECK ── */}
      <rect x="72" y="108" width="16" height="16" rx="4" fill="url(#g-skin)" opacity="0.7" />

      {/* ── HEAD + FACE (animated — subtle tilt, with eye sub-group) ── */}
      <motion.g
        animate={head.animate}
        transition={head.transition}
        style={{ transformOrigin: "80px 108px" }}
      >
        <rect x="50" y="55" width="60" height="60" rx="20" fill="url(#g-skin)" />
        <path d="M57 98 Q80 115 103 98" fill="url(#g-skin)" />

        {/* Hood shadow over upper face */}
        <path d="M36 110 Q80 85 124 110 L118 128 Q80 112 42 128Z" fill="#0A0814" opacity="0.65" />

        {/* Face mask */}
        <rect x="52" y="88" width="56" height="32" rx="8" fill="url(#g-mask)" opacity="0.92" />
        <line x1="54" y1="95" x2="106" y2="95" stroke="#A855F7" strokeWidth="0.5" opacity="0.3" />
        <line x1="54" y1="100" x2="106" y2="100" stroke="#A855F7" strokeWidth="0.5" opacity="0.2" />
        <line x1="54" y1="105" x2="106" y2="105" stroke="#A855F7" strokeWidth="0.5" opacity="0.2" />
        <rect x="66" y="108" width="6" height="8" rx="2" fill="#1A1428" />
        <rect x="74" y="108" width="6" height="8" rx="2" fill="#1A1428" />
        <rect x="82" y="108" width="6" height="8" rx="2" fill="#1A1428" />

        {/* Eye glow halos — stay fixed relative to head */}
        <ellipse cx="65" cy="77" rx="14" ry="8" fill="#A855F7" opacity="0.2" filter="url(#g-eye-blur)" />
        <ellipse cx="95" cy="77" rx="14" ry="8" fill="#A855F7" opacity="0.2" filter="url(#g-eye-blur)" />
        {/* Eye whites — stay fixed */}
        <ellipse cx="65" cy="77" rx="10" ry="7" fill="#1A0A28" />
        <ellipse cx="95" cy="77" rx="10" ry="7" fill="#1A0A28" />

        {/* ── EYE IRIS SUB-GROUP (animated — gaze shift) ── */}
        <motion.g
          animate={eyes.animate}
          transition={eyes.transition}
        >
          <circle cx="65" cy="77" r="6" fill="url(#g-eye-glow)" />
          <circle cx="95" cy="77" r="6" fill="url(#g-eye-glow)" />
          <circle cx="65" cy="77" r="3" fill="#0A0010" />
          <circle cx="95" cy="77" r="3" fill="#0A0010" />
          <circle cx="67" cy="75" r="2" fill="white" opacity="0.7" />
          <circle cx="97" cy="75" r="2" fill="white" opacity="0.7" />
        </motion.g>

        {/* Eye glow stroke rings — pulse animation, stay fixed */}
        <ellipse cx="65" cy="77" rx="11" ry="8" fill="none" stroke="#A855F7" strokeWidth="1" opacity="0.6"
          className="animate-pulse-glow" />
        <ellipse cx="95" cy="77" rx="11" ry="8" fill="none" stroke="#A855F7" strokeWidth="1" opacity="0.6"
          className="animate-pulse-glow" />

        {/* Hair */}
        <path d="M50 66 Q80 55 110 66 Q108 58 80 56 Q52 58 50 66Z" fill="#F0D8B8" opacity="0.5" />
        {/* Ear */}
        <ellipse cx="111" cy="82" rx="5" ry="7" fill="url(#g-skin)" />
      </motion.g>

      {/* ── PURPLE NEON ACCENT — on chest ── */}
      <path d="M65 145 L80 138 L95 145 L95 165 L80 170 L65 165Z"
        fill="none" stroke="#A855F7" strokeWidth="1.5" opacity="0.5" />
      <circle cx="80" cy="154" r="4" fill="#A855F7" opacity="0.4"
        className="animate-pulse-glow" />
      <circle cx="80" cy="154" r="2" fill="#A855F7" opacity="0.9" />
    </svg>
  );
}

export function AgentSVG({ name, color, status }: AgentSVGProps) {
  switch (name) {
    case "Kaze":  return <KazeSVG status={status} />;
    case "Scout": return <ScoutSVG status={status} />;
    case "Forge": return <ForgeSVG status={status} />;
    case "Ghost": return <GhostSVG status={status} />;
    default:      return <KazeSVG status={status} />;
  }
}
