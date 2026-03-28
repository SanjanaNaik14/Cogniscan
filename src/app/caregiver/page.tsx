"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useAssessment } from '@/context/AssessmentContext';

export default function CaregiverDashboard() {
  const { scores, calculateTotalScore, getRiskLevel } = useAssessment();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (username.trim() !== "" && password === "1234@cogni") {
      setIsLoggedIn(true);
      setError("");
    } else {
      setError("Invalid credentials. Master password required.");
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-slate-800 p-10 rounded-3xl shadow-2xl max-w-md w-full border border-slate-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-cyan-500/10 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto text-3xl mb-4">🩺</div>
            <h1 className="text-2xl font-black text-white mb-2">Physician Portal</h1>
            <p className="text-slate-400 text-sm">Authorized medical personnel only.</p>
          </div>
          
          <div className="space-y-4">
            {error && <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-lg text-sm text-center font-medium">{error}</div>}
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Dr. Name / ID" className="w-full p-4 bg-slate-900 border border-slate-700 text-white rounded-xl outline-none focus:border-cyan-500 transition-colors" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Master Password" className="w-full p-4 bg-slate-900 border border-slate-700 text-white rounded-xl outline-none focus:border-cyan-500 transition-colors" />
            <button onClick={handleLogin} disabled={!username || !password} className="w-full bg-cyan-500 text-slate-900 py-4 font-bold rounded-xl hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] mt-4">
              Access Patient Records
            </button>
          </div>
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-300">← Back to Patient Portal</Link>
          </div>
        </div>
      </main>
    );
  }

  const totalScore = calculateTotalScore();
  const riskLevel = getRiskLevel();

  // Dynamic styling based on Risk Level
 // Dynamic styling based on Risk Level
 let riskColor = "text-slate-400";
 let riskBg = "bg-slate-800 border-slate-700";
 let riskIcon = "📋";
 
 // Dynamic styling based on clinical risk
 const getRiskColor = () => {
  if (riskLevel === 'Low Risk (Normal)') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (riskLevel === 'Moderate Risk (MCI)') return 'text-amber-600 bg-amber-50 border-amber-200';
  if (riskLevel === 'High Risk (Severe Decline)') return 'text-rose-600 bg-rose-50 border-rose-200';
  return 'text-slate-600 bg-slate-50 border-slate-200';
};

// Dynamic recommendations based on risk
const getRecommendation = () => {
  if (riskLevel === 'Low Risk (Normal)') {
    return "Patient cognitive baseline is stable. Recommend routine preventive cognitive exercises (e.g., puzzles, reading) and annual reassessment.";
  }
  if (riskLevel === 'Moderate Risk (MCI)') {
    return "⚠️ Early signs of cognitive decline detected. Recommend regular monitoring every 3 months, targeted brain training modules, and consultation with a neurologist.";
  }
  if (riskLevel === 'High Risk (Severe Decline)') {
    return "🚨 Critical Alert: Significant cognitive impairment detected. Immediate caregiver attention required. Schedule clinical consultation and MRI/CT screening.";
  }
  return "Assessment pending completion. Please instruct the patient to finish all diagnostic modules.";
};

  // Helper to generate AI Insights based on missing points
 // Advanced AI Diagnostic Logic (MCI, AD, Pseudo-dementia)
// Advanced AI Diagnostic Logic (MCI, AD, Pseudo-dementia)
const generateInsights = () => {
  let insights = [];
  
  const hesitations = scores.speechAnalysis?.hesitations || 0;
  const clarity = scores.speechAnalysis?.clarity || 100;
  const reaction = scores.reactionTime.score || 0;
  const recall = scores.recall.score;

  // 1. Mild Cognitive Impairment (MCI) Profile
  // High hesitations ("uh/um"), slight recall issues, but mostly intact orientation
  if (hesitations >= 3 && recall === 2) {
    insights.push({
      type: "MCI Risk", color: "text-amber-600", bg: "bg-amber-50",
      text: "Verbal fluency shows notable word-finding difficulty (High Hesitations). Combined with minor recall errors, this profile strongly aligns with Mild Cognitive Impairment (MCI)."
    });
  }

  // 2. Early Alzheimer’s Disease Profile
  // Repetitions (clarity drop), major recall failure, loss of context
  if (clarity < 80 && recall !== null && recall <= 1) {
    insights.push({
      type: "Alzheimer's Biomarker", color: "text-rose-600", bg: "bg-rose-50",
      text: "Semantic tracking detected cyclical repetition and reduced vocabulary. Combined with severe delayed recall failure, this indicates high risk for Early Stage Alzheimer's pathology."
    });
  }

  // 3. Pseudo-Dementia / Depression Profile
  // Memory is actually okay, but they are incredibly slow/unengaged
  if (reaction > 700 && recall === 3 && hesitations <= 2) {
    insights.push({
      type: "Pseudo-dementia Eval", color: "text-indigo-600", bg: "bg-indigo-50",
      text: "Patient achieved perfect memory recall but exhibited severe psychomotor slowing (>700ms). This discrepancy suggests Depression-related cognitive decline (Pseudo-dementia) rather than neurological dementia."
    });
  }

  // Standard baseline checks
  if (scores.orientation.score !== null && scores.orientation.score < 5) {
    insights.push({ type: "Disorientation", color: "text-slate-700", bg: "bg-slate-50", text: "Temporal/spatial disorientation detected. Functional independence review advised." });
  }
  
  if (insights.length === 0 && totalScore > 0) {
    insights.push({ type: "Baseline Normal", color: "text-emerald-700", bg: "bg-emerald-50", text: "All tracked cognitive and verbal biomarkers are currently within normal, healthy parameters." });
  }
  
  return insights;
};

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12">
      <div className="max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8 pb-6 border-b border-slate-200 print:hidden">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Clinical Dashboard</h1>
            <p className="text-slate-500 font-medium">Attending: <span className="font-bold text-slate-800">{username}</span></p>
          </div>
          <Link href="/" className="bg-white border border-slate-200 text-slate-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm">
            Close Session
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analytics Panel */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* ALERT BANNER */}
            <div className={`p-8 rounded-3xl border ${riskBg} flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm`}>
              <div className="mb-4 md:mb-0">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Diagnostic Classification</h3>
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{riskIcon}</span>
                  <h2 className={`text-3xl font-black ${riskColor}`}>{riskLevel}</h2>
                </div>
              </div>
              <div className="text-left md:text-right bg-white/60 p-4 rounded-2xl">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Cognitive Score</h3>
                <h2 className="text-4xl font-black text-slate-800">{totalScore} <span className="text-xl text-slate-400 font-medium">/ 24</span></h2>
              </div>
            </div>

            {/* AI Insights Engine */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <span className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center mr-3 text-lg">🧠</span>
                AI Generated Clinical Notes
              </h3>
              <div className="space-y-4">
                {generateInsights().map((insight, idx) => (
                  <div key={idx} className={`flex flex-col space-y-2 ${insight.bg} p-5 rounded-2xl border border-slate-100`}>
                    <span className={`text-xs font-black uppercase tracking-widest ${insight.color}`}>{insight.type}</span>
                    <p className="text-slate-700 font-medium leading-relaxed">{insight.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Raw Score Data Sidebar */}
          <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white h-fit sticky top-8">
            <h3 className="text-lg font-bold mb-6 text-slate-100 border-b border-slate-700 pb-4">Module Telemetry</h3>
            <div className="space-y-5">
              <ScoreRow label="1. Orientation" score={scores.orientation.score} max={5} />
              <ScoreRow label="2. Registration" score={scores.registration.score} max={3} />
              <ScoreRow label="3. Attention" score={scores.attention.score} max={5} />
              <ScoreRow label="4. Visual Naming" score={scores.animalNaming.score} max={3} />
              <ScoreRow label="5. Motor Reaction" score={scores.reactionTime.score} max={5} isMs />
              <ScoreRow label="6. Delayed Recall" score={scores.recall.score} max={3} />
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-700">
            <button 
  onClick={() => window.print()} 
  className="w-full bg-slate-800 text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors text-sm print:hidden"
>
  ⬇ Export PDF Report
</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Helper for the sidebar
function ScoreRow({ label, score, max, isMs = false }: { label: string, score: number | null, max: number, isMs?: boolean }) {
  const isComplete = score !== null;
  
  return (
    <div className="flex justify-between items-center group">
      <span className={`text-sm font-medium transition-colors ${isComplete ? 'text-slate-300 group-hover:text-white' : 'text-slate-600'}`}>
        {label}
      </span>
      <span className={`text-sm font-bold ${isComplete ? 'text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-lg' : 'text-slate-700'}`}>
        {score === null ? 'Pending' : isMs ? `${score}ms` : `${score}/${max}`}
      </span>
    </div>
  );
}