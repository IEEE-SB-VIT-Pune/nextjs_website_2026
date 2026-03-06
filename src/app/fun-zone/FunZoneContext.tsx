"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ScoreData {
  score: number;
  total: number;
  timeTaken: number;
  playerName: string;
}

interface FunZoneContextType {
  playerName: string;
  setPlayerName: React.Dispatch<React.SetStateAction<string>>;
  scoreData: ScoreData | null;
  setScoreData: React.Dispatch<React.SetStateAction<ScoreData | null>>;
}

const FunZoneContext = createContext<FunZoneContextType | undefined>(undefined);

export function FunZoneProvider({ children }: { children: ReactNode }) {
  const [playerName, setPlayerName] = useState("");
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);

  return (
    <FunZoneContext.Provider value={{ playerName, setPlayerName, scoreData, setScoreData }}>
      {children}
    </FunZoneContext.Provider>
  );
}

export function useFunZone() {
  const context = useContext(FunZoneContext);
  if (!context) {
    throw new Error("useFunZone must be used within a FunZoneProvider");
  }
  return context;
}
