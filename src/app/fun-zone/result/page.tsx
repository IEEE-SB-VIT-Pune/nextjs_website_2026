"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useFunZone } from "../FunZoneContext";

export default function ResultPage() {
  const router = useRouter();
  const { scoreData } = useFunZone();

  // Redirect if no score data
  if (!scoreData) {
    if (typeof window !== "undefined") {
      router.replace("/fun-zone");
    }
    return null;
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const percentage = Math.round((scoreData.score / scoreData.total) * 100);
  const getMessage = () => {
    if (percentage === 100) return "Perfect Score! 🏆";
    if (percentage >= 80) return "Excellent Work! 🌟";
    if (percentage >= 60) return "Good Job! 👍";
    if (percentage >= 40) return "Nice Try! 💪";
    return "Keep Learning! 📚";
  };

  return (
    <div className="fun-zone-wrapper">
      <div className="fz-view-container fz-animate-fade-in">
        {/* Header */}
        <div className="fz-header-section" style={{ textAlign: "center" }}>
          <span className="fz-label-mono" style={{ color: "var(--fz-neon-cyan)" }}>
            [ Quiz Complete ]
          </span>
          <h2 className="fz-page-title">{getMessage()}</h2>
          <p className="fz-page-subtitle">
            Well played, {scoreData.playerName}!
          </p>
        </div>

        {/* Scorecard Display */}
        <div
          className="fz-score-readout"
          style={{
            border: "1px solid var(--fz-border-white)",
            padding: "30px",
            background: "rgba(255,255,255,0.02)",
            borderRadius: "var(--fz-radius-std)",
          }}
        >
          <div style={{ borderRight: "1px dashed var(--fz-border-white)" }}>
            <span className="fz-label-mono">Your Score</span>
            <div
              className="fz-score-number"
              style={{
                color: "var(--fz-neon-cyan)",
                textShadow: "0 0 15px rgba(0, 255, 255, 0.4)",
              }}
            >
              {scoreData.score}/{scoreData.total}
            </div>
            <span className="fz-label-mono" style={{ fontSize: "0.6rem" }}>
              {percentage}% Accuracy
            </span>
          </div>

          <div>
            <span className="fz-label-mono">Time Taken</span>
            <div
              className="fz-time-number"
              style={{
                color: "var(--fz-neon-purple)",
                textShadow: "0 0 15px rgba(168, 85, 247, 0.4)",
              }}
            >
              {formatTime(scoreData.timeTaken)}
            </div>
            <span className="fz-label-mono" style={{ fontSize: "0.6rem" }}>
              Total Duration
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="fz-action-row" style={{ marginTop: "30px" }}>
          <button
            className="fz-btn-industrial-secondary"
            onClick={() => router.push("/fun-zone")}
            style={{ borderRadius: "var(--fz-radius-std)" }}
          >
            Play Again
          </button>
          <button
            className="fz-btn-industrial"
            onClick={() => router.push("/")}
            style={{ borderRadius: "var(--fz-radius-std)" }}
          >
            Back to Home
          </button>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <span className="fz-label-mono" style={{ fontSize: "0.7rem", opacity: 0.6 }}>
            IEEE STUDENT BRANCH, VIT PUNE
          </span>
        </div>
      </div>
    </div>
  );
}
