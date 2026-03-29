"use client";
import React, { 
  createContext, 
  useContext, 
  useState, 
  ReactNode, 
  useEffect, 
  useCallback, 
  useMemo 
} from 'react';

// ── Types ──────────────────────────────────────────────────────
interface ClinicalScores {
  orientation: { score: number | null; time: number | null };
  registration: { score: number | null; time: number | null };
  attention: { score: number | null; time: number | null };
  animalNaming: { score: number | null; time: number | null };
  reactionTime: { score: number | null; time: number | null };
  recall: { score: number | null; time: number | null };
  speechAnalysis: { hesitations: number; clarity: number | null };
  facialScore: number | null;
}

export interface MedicalProfile {
  age: number;
  gender: number;
  educationyears: number;
  diabetes: number;
  smoking: number;
  hypertension: number;
  hypercholesterolemia: number;
}

export interface PredictionResult {
  prediction: number;
  label: string;
  confidence: number;
  risk: 'low' | 'moderate' | 'high';
}

type RiskLevel = 'Pending' | 'Low Risk (Normal)' | 'Moderate Risk (MCI)' | 'High Risk (Severe Decline)';

interface AssessmentContextType {
  scores: ClinicalScores;
  medicalProfile: MedicalProfile | null;
  prediction: PredictionResult | null;
  setScore: (domain: keyof ClinicalScores, value: any) => void;
  setMedicalProfile: (profile: MedicalProfile | null) => void;
  setPrediction: (result: PredictionResult | null) => void;
  runMLPrediction: () => Promise<void>;
  calculateTotalScore: () => number;
  getRiskLevel: () => RiskLevel;
  getClinicalInsights: () => string[];
  resetScores: () => void;
  isLoadingPrediction: boolean;
}

// ── Score → ML Feature Mapper ──────────────────────────────────
function mapToMLFeatures(scores: ClinicalScores, medical: MedicalProfile) {
  const attentionNorm = (scores.attention.score ?? 0) / 5;
  const hesitationPenalty = Math.min((scores.speechAnalysis.hesitations ?? 0) / 10, 1);
  const EF = parseFloat(((attentionNorm - hesitationPenalty * 0.3) * 10).toFixed(2));

  const rt = scores.reactionTime.score ?? 800;
  const PS = parseFloat((Math.max(0, (800 - rt) / 65)).toFixed(2));

  const registrationNorm = (scores.registration.score ?? 0) / 3;
  const recallNorm = (scores.recall.score ?? 0) / 3;
  const namingNorm = (scores.animalNaming.score ?? 0) / 3;
  const orientationNorm = (scores.orientation.score ?? 0) / 5;
  const speechNorm = (scores.speechAnalysis.clarity ?? 0) / 100;

  const Global = parseFloat((
    (registrationNorm * 0.20 +
      recallNorm * 0.30 +
      namingNorm * 0.20 +
      orientationNorm * 0.15 +
      speechNorm * 0.15) * 10
  ).toFixed(2));

  return {
    age: medical.age,
    gender: medical.gender,
    educationyears: medical.educationyears,
    EF, PS, Global,
    diabetes: medical.diabetes,
    smoking: medical.smoking,
    hypertension: medical.hypertension,
    hypercholesterolemia: medical.hypercholesterolemia,
    lacunes_num: 0, fazekas_cat: 0, study: 0, study1: 0,
    SVD_Simple: 0, SVD_Amended: 0, Fazekas: 0,
    lac_count: 0, CMB_count: 0,
  };
}

// ── Context ────────────────────────────────────────────────────
const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

const INITIAL_SCORES: ClinicalScores = {
  orientation: { score: null, time: null },
  registration: { score: null, time: null },
  attention: { score: null, time: null },
  animalNaming: { score: null, time: null },
  reactionTime: { score: null, time: null },
  recall: { score: null, time: null },
  speechAnalysis: { hesitations: 0, clarity: null },
  facialScore: null,
};

export const AssessmentProvider = ({ children }: { children: ReactNode }) => {
  const [scores, setScores] = useState<ClinicalScores>(INITIAL_SCORES);
  const [medicalProfile, setMedicalProfileState] = useState<MedicalProfile | null>(null);
  const [prediction, setPredictionState] = useState<PredictionResult | null>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);

  // ── 1. Hydration Logic (Load from LocalStorage) ────────────────
  useEffect(() => {
    const savedScores = localStorage.getItem("cogniscan_scores");
    const savedProfile = localStorage.getItem("cogniscan_profile");
    const savedPrediction = localStorage.getItem("cogniscan_prediction");

    if (savedScores) setScores(JSON.parse(savedScores));
    if (savedProfile) setMedicalProfileState(JSON.parse(savedProfile));
    if (savedPrediction) setPredictionState(JSON.parse(savedPrediction));
  }, []);

  // ── 2. Persistence Helpers ─────────────────────────────────────
  const setPrediction = useCallback((result: PredictionResult | null) => {
    if (result) localStorage.setItem("cogniscan_prediction", JSON.stringify(result));
    else localStorage.removeItem("cogniscan_prediction");
    setPredictionState(result);
  }, []);

  const setMedicalProfile = useCallback((profile: MedicalProfile | null) => {
    if (profile) localStorage.setItem("cogniscan_profile", JSON.stringify(profile));
    else localStorage.removeItem("cogniscan_profile");
    setMedicalProfileState(profile);
  }, []);

  const setScore = useCallback((domain: keyof ClinicalScores, value: any) => {
    setScores(prev => {
      const newScores = { ...prev, [domain]: value };
      localStorage.setItem("cogniscan_scores", JSON.stringify(newScores));
      return newScores;
    });
  }, []);

  // ── 3. Logic & Calculations ──────────────────────────────────
  const calculateTotalScore = useCallback(() => {
    let total = 0;
    if (scores.orientation.score) total += scores.orientation.score;
    if (scores.registration.score) total += scores.registration.score;
    if (scores.attention.score) total += scores.attention.score;
    if (scores.animalNaming.score) total += scores.animalNaming.score;
    if (scores.recall.score) total += scores.recall.score;
    if (scores.reactionTime.score) {
      if (scores.reactionTime.score < 350) total += 5;
      else if (scores.reactionTime.score < 600) total += 3;
      else total += 1;
    }
    if (scores.speechAnalysis.hesitations > 3) total -= 2;
    return Math.max(0, total);
  }, [scores]);

  const runMLPrediction = useCallback(async () => {
    if (!medicalProfile || isLoadingPrediction) return;
    setIsLoadingPrediction(true);

    try {
      const features = mapToMLFeatures(scores, medicalProfile);
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features),
      });

      if (!res.ok) throw new Error('Prediction failed');
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      console.error('ML prediction error:', err);
      const fallbackTotal = calculateTotalScore();
      const pct = (fallbackTotal / 24) * 100;
      setPrediction({
        prediction: pct < 60 ? 1 : 0,
        label: pct < 60 ? 'Dementia Risk' : 'No Dementia Risk',
        confidence: Math.round(pct),
        risk: pct < 60 ? 'high' : pct < 80 ? 'moderate' : 'low',
      });
    } finally {
      setIsLoadingPrediction(false);
    }
  }, [scores, medicalProfile, isLoadingPrediction, calculateTotalScore, setPrediction]);

  // Auto-trigger Effect
  useEffect(() => {
    const allDone =
      scores.orientation.score !== null &&
      scores.registration.score !== null &&
      scores.attention.score !== null &&
      scores.animalNaming.score !== null &&
      scores.reactionTime.score !== null &&
      scores.recall.score !== null &&
      scores.speechAnalysis.clarity !== null;

    if (allDone && medicalProfile && !prediction && !isLoadingPrediction) {
      runMLPrediction();
    }
  }, [scores, medicalProfile, prediction, isLoadingPrediction, runMLPrediction]);

  const getRiskLevel = useCallback((): RiskLevel => {
    if (prediction) {
      if (prediction.risk === 'low') return 'Low Risk (Normal)';
      if (prediction.risk === 'moderate') return 'Moderate Risk (MCI)';
      if (prediction.risk === 'high') return 'High Risk (Severe Decline)';
    }
    if (scores.registration.score === null || scores.recall.score === null) return 'Pending';
    const pct = (calculateTotalScore() / 24) * 100;
    if (pct >= 80) return 'Low Risk (Normal)';
    if (pct >= 60) return 'Moderate Risk (MCI)';
    return 'High Risk (Severe Decline)';
  }, [prediction, scores, calculateTotalScore]);

  const getClinicalInsights = useCallback((): string[] => {
    const insights: string[] = [];
    if (scores.registration.score === null) return insights;
    if (scores.recall.score !== null && scores.recall.score < 2)
      insights.push("Significant delayed recall deficit detected. Strongly recommend clinical memory evaluation.");
    if (scores.speechAnalysis.hesitations >= 4)
      insights.push("High frequency of speech hesitations detected, indicating elevated cognitive load.");
    if (scores.reactionTime.score !== null && scores.reactionTime.score > 700)
      insights.push("Motor-reaction latency above average thresholds. May indicate cognitive slowing.");
    if (scores.facialScore !== null && scores.facialScore < 40)
      insights.push("Low facial expressivity detected. Correlates with potential depressive symptoms.");
    if (insights.length === 0)
      insights.push("Patient cognitive baseline appears stable. Maintain routine mental exercises.");
    return insights;
  }, [scores]);

  const resetScores = useCallback(() => {
    setScores(INITIAL_SCORES);
    setPrediction(null);
    setMedicalProfile(null);
    localStorage.clear(); // Wipes everything for the next session
  }, [setPrediction, setMedicalProfile]);

  const contextValue = useMemo(() => ({
    scores, medicalProfile, prediction,
    setScore, setMedicalProfile, setPrediction,
    runMLPrediction, calculateTotalScore,
    getRiskLevel, getClinicalInsights, resetScores,
    isLoadingPrediction,
  }), [
    scores, medicalProfile, prediction, isLoadingPrediction, 
    setScore, setMedicalProfile, setPrediction, runMLPrediction, 
    calculateTotalScore, getRiskLevel, getClinicalInsights, resetScores
  ]);

  return (
    <AssessmentContext.Provider value={contextValue}>
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) throw new Error("useAssessment must be used within AssessmentProvider");
  return context;
};