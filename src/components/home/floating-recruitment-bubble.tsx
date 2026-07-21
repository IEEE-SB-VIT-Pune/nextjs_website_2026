"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, X } from "lucide-react";

export default function FloatingRecruitmentBubble() {
  const [isLive, setIsLive] = useState<boolean>(true); // Default to visible for interactive UX
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    async function checkRecruitmentStatus() {
      try {
        const res = await fetch("/api/recruitment/config");
        const data = await res.json();
        if (data.success && data.config) {
          const formLive = data.config.interviewForm?.isCurrentlyLive;
          const bookingLive = data.config.slotBooking?.isCurrentlyLive;
          setIsLive(Boolean(formLive || bookingLive));
        }
      } catch (err) {
        // Keep default true if network check is pending
      }
    }
    checkRecruitmentStatus();
  }, []);

  if (!isLive || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -20 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed top-20 right-4 sm:right-6 md:right-8 z-40"
      >
        <div className="relative group">
          {/* Outer glow ring */}
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-primary to-cyan-400 opacity-75 blur-md group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-pulse" />

          {/* Inner glass card */}
          <div className="relative flex items-center gap-3 p-3 sm:px-4 sm:py-3 rounded-2xl bg-background/90 backdrop-blur-xl border border-emerald-500/40 shadow-2xl">
            {/* Live Indicator Dot */}
            <div className="relative flex h-3 w-3 shrink-0 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </div>

            {/* Main Content Link */}
            <Link
              href="/recruitment"
              className="flex items-center gap-2.5 text-left text-foreground hover:text-primary transition-colors"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-emerald-400 tracking-wide uppercase flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
                    Recruitment Live!
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs text-muted-foreground font-medium line-clamp-1">
                  Execom 2026-2027 Applications Open
                </span>
              </div>

              <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-black transition-all ml-1 shrink-0">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Dismiss Button */}
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors ml-1"
              title="Dismiss"
              aria-label="Close notification bubble"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
