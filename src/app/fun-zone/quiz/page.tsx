"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFunZone } from "../FunZoneContext";
import { getShuffledQuestions, type Question } from "../questions";

export default function QuizPage() {
  const router = useRouter();
  const { playerName, setScoreData } = useFunZone();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(300);
  const [submitted, setSubmitted] = useState(false);

  // Redirect if no player name
  useEffect(() => {
    if (!playerName) {
      router.replace("/fun-zone");
    }
  }, [playerName, router]);

  // Load shuffled questions once
  useEffect(() => {
    setQuestions(getShuffledQuestions(10));
  }, []);

  const submitTest = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);

    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) score++;
    });

    const timeTaken = 300 - timeLeft;
    setScoreData({
      score,
      total: questions.length,
      timeTaken,
      playerName,
    });
    router.push("/fun-zone/result");
  }, [submitted, questions, answers, timeLeft, playerName, setScoreData, router]);

  // Timer
  useEffect(() => {
    if (questions.length === 0) return;

    if (timeLeft <= 0) {
      submitTest();
      return;
    }

    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, questions.length, submitTest]);

  const handleAnswer = (val: string) => {
    setAnswers({ ...answers, [questions[currentIndex].id]: val });
  };

  if (!playerName) return null;

  if (questions.length === 0)
    return (
      <div className="fun-zone-wrapper">
        <div className="fz-view-container">
          <h2 className="fz-page-title">Loading...</h2>
          <p className="fz-page-subtitle">Preparing your quiz.</p>
        </div>
      </div>
    );

  const q = questions[currentIndex];
  if (!q) return null;

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${("0" + (seconds % 60)).slice(-2)}`;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="fun-zone-wrapper">
      <div className="fz-view-container fz-animate-fade-in">
        {/* Status Bar */}
        <div className="fz-status-bar">
          <div>
            <span className="fz-label-mono">Time Remaining</span>
            <div className={`fz-status-value ${timeLeft < 60 ? "fz-time-critical" : ""}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className="fz-label-mono">Question</span>
            <div className="fz-status-value">
              {currentIndex + 1} / {questions.length}
            </div>
          </div>
        </div>

        {/* Progress Track */}
        <div className="fz-progress-track">
          <div className="fz-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Question Area */}
        <div className="fz-question-display">
          <div className="fz-question-text" style={{ fontSize: "1.1rem", marginBottom: "20px" }}>
            {q.text}
          </div>

          <div className="fz-options-grid" style={{ display: "grid", gap: "12px" }}>
            {q.options.map((opt, i) => {
              const isSelected = answers[q.id] === opt;
              return (
                <button
                  key={i}
                  type="button"
                  className="fz-btn-industrial-secondary"
                  onClick={() => handleAnswer(opt)}
                  style={{
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "var(--fz-radius-std)",
                    padding: "12px 20px",
                    textTransform: "none",
                    background: isSelected ? "var(--fz-btn-blue)" : "transparent",
                    color: "white",
                    border: isSelected ? "none" : "1px solid var(--fz-border-white)",
                    boxShadow: isSelected ? "0 0 15px rgba(29, 78, 216, 0.5)" : "none",
                  }}
                >
                  <span
                    className="fz-label-mono"
                    style={{
                      color: isSelected ? "white" : "var(--fz-neon-cyan)",
                      marginRight: "12px",
                      fontSize: "0.8rem",
                    }}
                  >
                    {String.fromCharCode(65 + i)}.
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="fz-action-row" style={{ marginTop: "20px" }}>
          <button
            className="fz-btn-industrial-secondary"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((c) => c - 1)}
            style={{ borderRadius: "var(--fz-radius-std)" }}
          >
            Previous
          </button>
          <button
            className="fz-btn-industrial"
            onClick={
              currentIndex < questions.length - 1
                ? () => setCurrentIndex((c) => c + 1)
                : submitTest
            }
            style={{ borderRadius: "var(--fz-radius-std)" }}
          >
            {currentIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
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
