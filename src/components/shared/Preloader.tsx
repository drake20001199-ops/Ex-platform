"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Preloader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onLoad = () => setTimeout(() => setVisible(false), 400);
    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad);
    }
    // Fallback — always remove after 3.2s
    const fallback = setTimeout(() => setVisible(false), 3200);
    return () => {
      window.removeEventListener("load", onLoad);
      clearTimeout(fallback);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "#09090b",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
            overflow: "hidden",
          }}
        >
          {/* Background radial — very subtle neon blue haze */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(59,130,246,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* Outer slow-pulse neon ring */}
          <motion.div
            animate={{ opacity: [0.15, 0.45, 0.15], scale: [1, 1.12, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              width: 160,
              height: 160,
              borderRadius: "50%",
              border: "1px solid rgba(59,130,246,0.25)",
              boxShadow: "0 0 18px 2px rgba(59,130,246,0.12)",
            }}
          />

          {/* Inner tighter ring */}
          <motion.div
            animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.06, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            style={{
              position: "absolute",
              width: 110,
              height: 110,
              borderRadius: "50%",
              border: "1px solid rgba(96,165,250,0.2)",
              boxShadow: "0 0 12px 1px rgba(96,165,250,0.1)",
            }}
          />

          {/* Shield — neon glow on stroke */}
          <motion.div
            initial={{ scale: 0.65, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
            style={{ position: "relative", zIndex: 1 }}
          >
            {/* Glow layer behind shield */}
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                inset: -8,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 70%)",
                filter: "blur(6px)",
              }}
            />
            <svg
              width="62"
              height="62"
              viewBox="0 0 24 24"
              fill="none"
              stroke="url(#neonGrad)"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 6px rgba(59,130,246,0.6))" }}
            >
              <defs>
                <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </motion.div>

          {/* Wordmark with subtle neon tint */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            style={{ position: "relative", zIndex: 1, textAlign: "center" }}
          >
            <p style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              fontFamily: "inherit",
              color: "#f4f4f5",
              textShadow: "0 0 20px rgba(59,130,246,0.35)",
              margin: 0,
            }}>
              CoinVault
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              style={{
                fontSize: 12,
                color: "rgba(148,163,184,0.7)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginTop: 4,
                fontFamily: "inherit",
              }}
            >
              Secure Exchange
            </motion.p>
          </motion.div>

          {/* Progress bar — neon blue with glow */}
          <motion.div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: 2,
              background: "linear-gradient(90deg, #1d4ed8, #3b82f6, #93c5fd)",
              boxShadow: "0 0 8px 1px rgba(59,130,246,0.5)",
            }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.8, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
