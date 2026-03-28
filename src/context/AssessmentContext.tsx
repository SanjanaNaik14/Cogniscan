"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1. Upgraded Clinical Domains with Time & Speech Tracking
interface ClinicalScores {
  orientation: { score: number | null; time: number | null };
  registration: { score: number | null; time: number | null };
  attention: { score: number | null; time: number | null };
  animalNaming: { score: number | null; time: number | null };
  reactionTime: { score: number | null; time: number | null }; // Reaction game
  recall: { score: number | null; time: number | null };
  speechAnalysis: { hesitations: number; clarity: number | null }; // AI Speech Layer
  facialScore: number | null; // Emotion detection
}

type RiskLevel = 'Pending' | 'Low Risk (Normal)' | 'Moderate Risk (MCI)' | 'High Risk (Severe Decline)';

interface AssessmentContextType {
  scores: ClinicalScores;
  setScore: (domain: keyof ClinicalScores, value: any) => void;
  calculateTotalScore: () => number;
  getRiskLevel: () => RiskLevel;
  getClinicalInsights: () => string[];
  resetScores: () => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider = ({ children }: { children: ReactNode }) => {
  const [scores, setScores] = useState<ClinicalScores>({
    orientation: { score: null, time: null },
    registration: { score: null, time: null },
    attention: { score: null, time: null },
    animalNaming: { score: null, time: null },
    reactionTime: { score: null, time: null },
    recall: { score: null, time: null },
    speechAnalysis: { hesitations: 0, clarity: null },
    facialScore: null,
  });

  const setScore = (domain: keyof ClinicalScores, value: any) => {
    setScores((prev) => ({ ...prev, [domain]: value }));
  };

  // Weighted scoring system including time penalties
  const calculateTotalScore = () => {
    let total = 0;
    
    // Base Accuracy Scores (Max ~30 points)
    if (scores.orientation.score) total += scores.orientation.score;
    if (scores.registration.score) total += scores.registration.score;
    if (scores.attention.score) total += scores.attention.score;
    if (scores.animalNaming.score) total += scores.animalNaming.score;
    if (scores.recall.score) total += scores.recall.score;

    // Reaction Time Points (Faster = Better)
    if (scores.reactionTime.score) {
      if (scores.reactionTime.score < 350) total += 5;
      else if (scores.reactionTime.score < 600) total += 3;
      else total += 1;
    }

    // Speech Penalty (Deduct points for excessive 'uh/um' hesitations)
    if (scores.speechAnalysis.hesitations > 3) total -= 2;

    return Math.max(0, total); // Prevent negative scores
  };

  const getRiskLevel = (): RiskLevel => {
    // Require core memory modules to be complete before diagnosing
    if (scores.registration.score === null || scores.recall.score === null) return 'Pending';
    
    const total = calculateTotalScore();
    const maxScore = 24; 
    const percentage = (total / maxScore) * 100;

    if (percentage >= 80) return 'Low Risk (Normal)';
    if (percentage >= 60) return 'Moderate Risk (MCI)';
    return 'High Risk (Severe Decline)';
  };

  // Clinical Recommendation Engine based on modeled conditions
  const getClinicalInsights = (): string[] => {
    const insights: string[] = [];
    if (scores.registration.score === null) return insights;

    // Model: Early Alzheimer's / Poor Recall
    if (scores.recall.score !== null && scores.recall.score < 2) {
      insights.push("Significant delayed recall deficit detected. Strongly recommend clinical memory evaluation.");
    }
    
    // Model: Speech Hesitation (Cognitive Load)
    if (scores.speechAnalysis.hesitations >= 4) {
      insights.push("High frequency of speech hesitations detected, indicating elevated cognitive load or word-finding difficulty.");
    }

    // Model: Slowed Processing Speed
    if (scores.reactionTime.score !== null && scores.reactionTime.score > 700) {
      insights.push("Motor-reaction latency is above average thresholds. May indicate general cognitive slowing.");
    }

    // Model: Depression-related decline / Apathy
    if (scores.facialScore !== null && scores.facialScore < 40) {
      insights.push("Low facial expressivity detected. Correlates with potential depressive symptoms impacting cognition.");
    }

    if (insights.length === 0) insights.push("Patient cognitive baseline appears stable. Maintain routine mental exercises.");
    return insights;
  };

  const resetScores = () => {
    setScores({
      orientation: { score: null, time: null }, registration: { score: null, time: null }, attention: { score: null, time: null }, animalNaming: { score: null, time: null }, reactionTime: { score: null, time: null }, recall: { score: null, time: null }, speechAnalysis: { hesitations: 0, clarity: null }, facialScore: null,
    });
  };

  return (
    <AssessmentContext.Provider value={{ scores, setScore, calculateTotalScore, getRiskLevel, getClinicalInsights, resetScores }}>
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) throw new Error("useAssessment must be used within an AssessmentProvider");
  return context;
};