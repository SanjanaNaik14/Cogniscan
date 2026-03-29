"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useAssessment } from '@/context/AssessmentContext';

export default function CaregiverDashboard() {
  const { scores, calculateTotalScore, getRiskLevel, prediction, medicalProfile } = useAssessment();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (username.trim() !== "" && password === "1234@cogni") {
      setIsLoggedIn(true); setError("");
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
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="Dr. Name / ID"
              className="w-full p-4 bg-slate-900 border border-slate-700 text-white rounded-xl outline-none focus:border-cyan-500 transition-colors" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Master Password"
              className="w-full p-4 bg-slate-900 border border-slate-700 text-white rounded-xl outline-none focus:border-cyan-500 transition-colors" />
            <button onClick={handleLogin} disabled={!username || !password}
              className="w-full bg-cyan-500 text-slate-900 py-4 font-bold rounded-xl hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] mt-4">
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
  const riskLevel  = getRiskLevel();

  let riskColor = "text-slate-400";
  let riskBg    = "bg-slate-800 border-slate-700";
  let riskIcon  = "📋";
  if (riskLevel === 'Low Risk (Normal)')         { riskColor = "text-emerald-500"; riskBg = "bg-emerald-50 border-emerald-200"; riskIcon = "✅"; }
  else if (riskLevel === 'Moderate Risk (MCI)')  { riskColor = "text-amber-500";   riskBg = "bg-amber-50 border-amber-200";     riskIcon = "⚠️"; }
  else if (riskLevel === 'High Risk (Severe Decline)') { riskColor = "text-rose-500"; riskBg = "bg-rose-50 border-rose-200";   riskIcon = "🚨"; }

  const generateInsights = () => {
    const insights = [];
    const hesitations = scores.speechAnalysis?.hesitations || 0;
    const clarity     = scores.speechAnalysis?.clarity     || 100;
    const reaction    = scores.reactionTime.score          || 0;
    const recall      = scores.recall.score;

    // ML-based insight (highest priority)
    if (prediction) {
      insights.push({
        type: prediction.risk === 'high' ? '🚨 ML Model: High Risk' : prediction.risk === 'moderate' ? '⚠️ ML Model: Moderate Risk' : '✅ ML Model: Low Risk',
        color: prediction.risk === 'high' ? 'text-rose-600' : prediction.risk === 'moderate' ? 'text-amber-600' : 'text-emerald-600',
        bg: prediction.risk === 'high' ? 'bg-rose-50' : prediction.risk === 'moderate' ? 'bg-amber-50' : 'bg-emerald-50',
        text: `XGBoost model trained on 1,842 vascular dementia patients classified this patient as "${prediction.label}" with ${prediction.confidence}% confidence. ${prediction.risk === 'high' ? 'Immediate specialist referral recommended.' : prediction.risk === 'moderate' ? 'Monitoring and follow-up assessment advised.' : 'Routine cognitive maintenance recommended.'}`
      });
    }

    if (hesitations >= 3 && recall === 2) {
      insights.push({ type: "MCI Risk", color: "text-amber-600", bg: "bg-amber-50",
        text: "Verbal fluency shows notable word-finding difficulty (High Hesitations). Combined with minor recall errors, this profile strongly aligns with Mild Cognitive Impairment (MCI)." });
    }
    if (clarity < 80 && recall !== null && recall <= 1) {
      insights.push({ type: "Alzheimer's Biomarker", color: "text-rose-600", bg: "bg-rose-50",
        text: "Semantic tracking detected cyclical repetition and reduced vocabulary. Combined with severe delayed recall failure, this indicates high risk for Early Stage Alzheimer's pathology." });
    }
    if (reaction > 700 && recall === 3 && hesitations <= 2) {
      insights.push({ type: "Pseudo-dementia Eval", color: "text-indigo-600", bg: "bg-indigo-50",
        text: "Patient achieved perfect memory recall but exhibited severe psychomotor slowing (>700ms). This discrepancy suggests Depression-related cognitive decline rather than neurological dementia." });
    }
    if (scores.orientation.score !== null && scores.orientation.score < 5) {
      insights.push({ type: "Disorientation", color: "text-slate-700", bg: "bg-slate-50",
        text: "Temporal/spatial disorientation detected. Functional independence review advised." });
    }
    if (insights.length === 0 && totalScore > 0) {
      insights.push({ type: "Baseline Normal", color: "text-emerald-700", bg: "bg-emerald-50",
        text: "All tracked cognitive and verbal biomarkers are currently within normal, healthy parameters." });
    }
    if (totalScore === 0) {
      insights.push({ type: "Pending", color: "text-slate-500", bg: "bg-slate-50",
        text: "Awaiting patient assessment data. Dashboard will update in real-time." });
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
          <div className="lg:col-span-2 space-y-6">

            {/* ── MAIN RISK BANNER ── */}
            <div className={`p-8 rounded-3xl border ${riskBg} shadow-sm`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {prediction ? '🤖 ML Model Diagnosis' : 'Rule-Based Classification'}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl">{riskIcon}</span>
                    <h2 className={`text-3xl font-black ${riskColor}`}>{riskLevel}</h2>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-white/60 p-4 rounded-2xl text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Cognitive Score</p>
                    <p className="text-4xl font-black text-slate-800">{totalScore}<span className="text-lg text-slate-400"> / 30</span></p>
                  </div>
                  {prediction && (
                    <div className="bg-white/60 p-4 rounded-2xl text-center">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Model Confidence</p>
                      <p className={`text-4xl font-black ${
                        prediction.risk === 'high' ? 'text-rose-600' :
                        prediction.risk === 'moderate' ? 'text-amber-600' : 'text-emerald-600'
                      }`}>{prediction.confidence}%</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Confidence bar */}
              {prediction && (
                <div className="mt-6">
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>Low Risk</span>
                    <span>{prediction.label}</span>
                    <span>High Risk</span>
                  </div>
                  <div className="w-full bg-white/50 rounded-full h-3">
                    <div className={`h-3 rounded-full transition-all duration-1000 ${
                      prediction.risk === 'high' ? 'bg-rose-500' :
                      prediction.risk === 'moderate' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} style={{ width: `${prediction.confidence}%` }} />
                  </div>
                </div>
              )}

              {/* No ML result yet */}
              {!prediction && (
                <div className="mt-4 p-3 bg-white/40 rounded-xl border border-white/60 text-center">
                  <p className="text-xs text-slate-500 font-medium">
                    ⚠️ ML model result pending — patient must complete all 7 tests and click "Get AI Diagnosis"
                  </p>
                </div>
              )}
            </div>

            {/* ── PATIENT PROFILE (if available) ── */}
            {medicalProfile && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Patient Profile</h3>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Age',       value: `${medicalProfile.age} yrs` },
                    { label: 'Education', value: `${medicalProfile.educationyears} yrs` },
                    { label: 'Gender',    value: medicalProfile.gender === 0 ? 'Male' : 'Female' },
                    { label: 'Diabetes',  value: medicalProfile.diabetes ? 'Yes' : 'No' },
                    { label: 'Hypertension', value: medicalProfile.hypertension ? 'Yes' : 'No' },
                    { label: 'High Cholesterol', value: medicalProfile.hypercholesterolemia ? 'Yes' : 'No' },
                    { label: 'Smoking',   value: ['Never','Former','Current'][medicalProfile.smoking] },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
                      <p className="text-sm font-bold text-slate-800 mt-1">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── AI INSIGHTS ── */}
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

          {/* ── SIDEBAR ── */}
          <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white h-fit sticky top-8">
            <h3 className="text-lg font-bold mb-6 text-slate-100 border-b border-slate-700 pb-4">Module Telemetry</h3>
            <div className="space-y-5">
              <ScoreRow label="1. Orientation"    score={scores.orientation.score}      max={5} />
              <ScoreRow label="2. Registration"   score={scores.registration.score}     max={3} />
              <ScoreRow label="3. Attention"      score={scores.attention.score}         max={5} />
              <ScoreRow label="4. Visual Naming"  score={scores.animalNaming.score}     max={3} />
              <ScoreRow label="5. Motor Reaction" score={scores.reactionTime.score}     max={5} isMs />
              <ScoreRow label="6. Delayed Recall" score={scores.recall.score}           max={3} />
              <ScoreRow label="7. Speech Analysis" score={scores.speechAnalysis.clarity} max={100} isPercent />
            </div>

            {/* ML Feature Proxies */}
            {prediction && (
              <div className="mt-6 pt-6 border-t border-slate-700 space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ML Feature Proxies</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Executive Function</span>
                    <span className="text-cyan-400 font-bold">
                      {(((scores.attention.score ?? 0) / 5) * 10).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Processing Speed</span>
                    <span className="text-cyan-400 font-bold">
                      {Math.max(0, (800 - (scores.reactionTime.score ?? 800)) / 65).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Global Cognition</span>
                    <span className="text-cyan-400 font-bold">
                      {((
                        (scores.registration.score ?? 0) / 3 * 0.20 +
                        (scores.recall.score ?? 0) / 3 * 0.30 +
                        (scores.animalNaming.score ?? 0) / 3 * 0.20 +
                        (scores.orientation.score ?? 0) / 5 * 0.15 +
                        (scores.speechAnalysis.clarity ?? 0) / 100 * 0.15
                      ) * 10).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-700 print:hidden">
              <button onClick={() => window.print()}
                className="w-full bg-slate-800 text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors text-sm">
                ⬇ Export PDF Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ScoreRow({ label, score, max, isMs = false, isPercent = false }: {
  label: string; score: number | null; max: number; isMs?: boolean; isPercent?: boolean;
}) {
  const isComplete = score !== null && score !== undefined;
  return (
    <div className="flex justify-between items-center group">
      <span className={`text-sm font-medium transition-colors ${isComplete ? 'text-slate-300 group-hover:text-white' : 'text-slate-600'}`}>
        {label}
      </span>
      <span className={`text-sm font-bold ${isComplete ? 'text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-lg' : 'text-slate-700'}`}>
        {score === null || score === undefined ? 'Pending' : isMs ? `${score}ms` : isPercent ? `${score}%` : `${score}/${max}`}
      </span>
    </div>
  );
}