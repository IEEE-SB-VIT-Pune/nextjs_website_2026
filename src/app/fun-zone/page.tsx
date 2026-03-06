"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFunZone } from "./FunZoneContext";

export default function FunZonePage() {
  const router = useRouter();
  const { playerName, setPlayerName } = useFunZone();
  const [nameInput, setNameInput] = useState(playerName);

  const startQuiz = () => {
    if (!nameInput.trim()) {
      alert("Please enter your name to continue.");
      return;
    }
    setPlayerName(nameInput.trim());
    router.push("/fun-zone/quiz");
  };

  return (
    <div className="fun-zone-wrapper">
      <div className="fz-view-container fz-animate-fade-in">
        {/* Header Section */}
        <div className="fz-header-section">
          <span className="fz-label-mono">IEEE VIT Pune Presents</span>
          <h2 className="fz-page-title">Tech Quiz</h2>
          <p className="fz-page-subtitle">
            Test your tech knowledge — 10 questions, 5 minutes!
          </p>
        </div>

        {/* Rules */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span className="fz-label-mono" style={{ color: "var(--fz-neon-cyan)" }}>
            [ How It Works ]
          </span>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
            <li className="fz-label-mono" style={{ fontSize: "0.7rem" }}>→ 10 randomized tech questions</li>
            <li className="fz-label-mono" style={{ fontSize: "0.7rem" }}>→ 5 minute time limit</li>
            <li className="fz-label-mono" style={{ fontSize: "0.7rem" }}>→ Each correct answer = 1 point</li>
            <li className="fz-label-mono" style={{ fontSize: "0.7rem" }}>→ No negative marking</li>
          </ul>
        </div>

        {/* Name Field */}
        <div className="fz-form-group">
          <label className="fz-label-mono">Your Name</label>
          <input
            type="text"
            className="fz-input-sharp"
            placeholder="e.g. John Doe"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startQuiz()}
            autoComplete="off"
          />
        </div>

        {/* Action Button */}
        <div style={{ marginTop: "10px" }}>
          <button
            className="fz-btn-industrial"
            onClick={startQuiz}
            style={{ borderRadius: "var(--fz-radius-std)", width: "100%" }}
          >
            Start Quiz
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
