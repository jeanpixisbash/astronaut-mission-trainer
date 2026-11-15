"use client";
import { motion } from "framer-motion";

export type Mood = "feliz" | "preocupado" | "triste" | "campeon";

/** Houston con cuerpo: astronauta SVG que cambia la cara según el juego. */
export default function Astronauta({ mood, size = 48 }: { mood: Mood; size?: number }) {
  return (
    <motion.div
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: size, height: size }}
      className="shrink-0"
      aria-label={`Houston ${mood}`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-lg">
        {/* antena */}
        <line x1="72" y1="18" x2="80" y2="6" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        <circle cx="81" cy="5" r="4" fill={mood === "triste" ? "#64748b" : "#f43f5e"} />
        {/* orejas casco */}
        <rect x="4" y="42" width="10" height="18" rx="5" fill="#cbd5e1" />
        <rect x="86" y="42" width="10" height="18" rx="5" fill="#cbd5e1" />
        {/* casco */}
        <circle cx="50" cy="52" r="42" fill="#eef2f7" stroke="#94a3b8" strokeWidth="4" />
        {/* visor */}
        <rect x="20" y="34" width="60" height="42" rx="19" fill="#075985" />
        <rect x="20" y="34" width="60" height="42" rx="19" fill="url(#brillo)" opacity="0.35" />
        <ellipse cx="38" cy="46" rx="10" ry="6" fill="#fff" opacity="0.35" transform="rotate(-20 38 46)" />
        {/* ojos */}
        {mood === "feliz" || mood === "campeon" ? (
          <g stroke="#fff" strokeWidth="3.5" strokeLinecap="round" fill="none">
            <path d="M34 58 q4 -6 8 0" />
            <path d="M58 58 q4 -6 8 0" />
          </g>
        ) : (
          <g fill="#fff">
            <circle cx="38" cy="57" r="3.2" />
            <circle cx="62" cy="57" r="3.2" />
          </g>
        )}
        {mood === "preocupado" && (
          <g stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="31" y1="48" x2="43" y2="51" />
            <line x1="69" y1="48" x2="57" y2="51" />
          </g>
        )}
        {/* boca */}
        {mood === "feliz" && <path d="M42 66 q8 7 16 0" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" fill="none" />}
        {mood === "campeon" && <ellipse cx="50" cy="68" rx="7" ry="5.5" fill="#fff" />}
        {mood === "preocupado" && <path d="M43 68 q7 -3 14 0" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />}
        {mood === "triste" && (
          <g>
            <path d="M43 70 q7 -6 14 0" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M68 60 q2 6 0 9" stroke="#7dd3fc" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        )}
        {/* chapitas */}
        {(mood === "feliz" || mood === "campeon") && (
          <g fill="#f9a8d4" opacity="0.8">
            <circle cx="30" cy="64" r="3" />
            <circle cx="70" cy="64" r="3" />
          </g>
        )}
        <defs>
          <linearGradient id="brillo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#075985" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}
