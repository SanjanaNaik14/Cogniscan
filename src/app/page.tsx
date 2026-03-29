"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAssessment } from '@/context/AssessmentContext';

export default function PatientPortal() {
  const { scores, medicalProfile } = useAssessment();

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black text-slate-900">CogniScan<span className="text-cyan-500">.</span></h1>
            <p className="text-slate-500 font-medium">Patient Assessment Portal</p>
          </div>
          <Link href="/caregiver" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-full font-bold text-sm transition-colors shadow-lg">
            Caregiver Login →
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <section className="lg:col-span-2 space-y-8">
            <MedicalIntakeForm />
            {medicalProfile && (
              <>
                <OrientationCard />
                <RegistrationCard />
                <AttentionCard />
                <VisualNamingCard />
                <ReactionCard />
                <RecallCard />
                <SpeechFluencyCard />
              </>
            )}
          </section>

          <aside className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl sticky top-12">
              <h3 className="text-lg font-bold mb-6">Clinical Status</h3>
              <div className="space-y-5">
                <StatusRow label="1. Orientation"         score={scores.orientation.score}      max={5} />
                <StatusRow label="2. Memory Registration" score={scores.registration.score}     max={3} />
                <StatusRow label="3. Attention & Logic"   score={scores.attention.score}        max={5} />
                <StatusRow label="4. Visual Naming"       score={scores.animalNaming.score}     max={3} />
                <StatusRow label="5. Reaction Motor"      score={scores.reactionTime.score}     max={5} isMs />
                <StatusRow label="6. Delayed Recall"      score={scores.recall.score}           max={3} />
                <StatusRow label="7. Speech Analysis"     score={scores.speechAnalysis.clarity} max={100} isPercent />
              </div>
              <ProgressPanel />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

// ── PROGRESS PANEL (auto-triggers ML + redirects) ──────────────
function ProgressPanel() {
  const { scores, medicalProfile, prediction, isLoadingPrediction } = useAssessment();
  const router = useRouter();

  const completedCount = [
    scores.orientation.score,
    scores.registration.score,
    scores.attention.score,
    scores.animalNaming.score,
    scores.reactionTime.score,
    scores.recall.score,
    scores.speechAnalysis.clarity,
  ].filter(v => v !== null).length;

  const allDone = completedCount === 7;

  // Auto-redirect once prediction is ready
  useEffect(() => {
    if (prediction && allDone) {
      router.push('/caregiver');
    }
  }, [prediction, allDone]);

  return (
    <div className="mt-8 pt-6 border-t border-slate-700 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400 font-medium">Progress</span>
        <span className="text-xs text-slate-400 font-bold">{completedCount} / 7</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full bg-cyan-400 transition-all duration-500"
          style={{ width: `${(completedCount / 7) * 100}%` }}
        />
      </div>
      <div className={`w-full py-3 px-4 rounded-2xl text-sm font-bold text-center ${
        isLoadingPrediction          ? 'bg-cyan-500/20 text-cyan-300 animate-pulse' :
        allDone && prediction        ? 'bg-emerald-500/20 text-emerald-300' :
        allDone                      ? 'bg-cyan-500/10 text-cyan-400 animate-pulse' :
        !medicalProfile              ? 'bg-slate-700 text-slate-500' :
                                       'bg-slate-700 text-slate-400'
      }`}>
        {isLoadingPrediction
          ? '⏳ Running AI Model...'
          : allDone && prediction
            ? '✅ Redirecting to dashboard...'
            : allDone
              ? '⏳ Analyzing results...'
              : !medicalProfile
                ? 'Complete profile first'
                : `${completedCount}/7 modules complete`}
      </div>
    </div>
  );
}

// ── MEDICAL INTAKE FORM ────────────────────────────────────────
function MedicalIntakeForm() {
  const { medicalProfile, setMedicalProfile } = useAssessment();
  const [form, setForm] = useState({
    age: '', gender: '0', educationyears: '',
    diabetes: '0', smoking: '0',
    hypertension: '0', hypercholesterolemia: '0'
  });

  if (medicalProfile) return (
    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center space-x-4">
      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 text-xl">✓</div>
      <div>
        <h3 className="text-lg font-bold text-emerald-900">Patient Profile Recorded</h3>
        <p className="text-emerald-600 text-sm">Age {medicalProfile.age} · {medicalProfile.educationyears} yrs education · Complete all 7 modules below</p>
      </div>
    </div>
  );

  const toggle = (key: string) =>
    setForm(f => ({ ...f, [key]: f[key as keyof typeof f] === '0' ? '1' : '0' }));

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
      <div className="bg-violet-50 w-12 h-12 rounded-xl flex items-center justify-center text-violet-500 text-2xl mb-4">📋</div>
      <h3 className="text-xl font-bold text-slate-800 mb-1">Step 1: Patient Profile</h3>
      <p className="text-slate-500 mb-6 text-sm">Required before the assessment begins.</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Age</label>
          <input type="number" value={form.age}
            onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
            className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-400"
            placeholder="e.g. 72" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</label>
          <select value={form.gender}
            onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
            className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
            <option value="0">Male</option>
            <option value="1">Female</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Years of Education</label>
          <input type="number" value={form.educationyears}
            onChange={e => setForm(f => ({ ...f, educationyears: e.target.value }))}
            className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-400"
            placeholder="e.g. 12" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Smoking Status</label>
          <select value={form.smoking}
            onChange={e => setForm(f => ({ ...f, smoking: e.target.value }))}
            className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
            <option value="0">Never</option>
            <option value="1">Former</option>
            <option value="2">Current</option>
          </select>
        </div>
      </div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Medical History (tap to toggle)</p>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { key: 'diabetes',             label: 'Diabetes' },
          { key: 'hypertension',         label: 'Hypertension' },
          { key: 'hypercholesterolemia', label: 'High Cholesterol' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => toggle(key)}
            className={`p-3 rounded-xl border font-bold text-sm transition-all ${
              form[key as keyof typeof form] === '1'
                ? 'bg-rose-100 border-rose-300 text-rose-700'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
            {label} {form[key as keyof typeof form] === '1' ? '✓' : '○'}
          </button>
        ))}
      </div>
      <button
        onClick={() => setMedicalProfile({
          age:                  Number(form.age),
          gender:               Number(form.gender),
          educationyears:       Number(form.educationyears),
          diabetes:             Number(form.diabetes),
          smoking:              Number(form.smoking),
          hypertension:         Number(form.hypertension),
          hypercholesterolemia: Number(form.hypercholesterolemia),
        })}
        disabled={!form.age || !form.educationyears}
        className="w-full bg-slate-900 text-white py-4 font-bold rounded-xl disabled:opacity-30 hover:bg-slate-800 transition-all">
        Save Profile & Begin Assessment →
      </button>
    </div>
  );
}

// ── HELPER COMPONENTS ──────────────────────────────────────────
function StatusRow({ label, score, max, isPercent = false, isMs = false }: {
  label: string; score: number | null; max: number; isPercent?: boolean; isMs?: boolean;
}) {
  const isComplete = score !== null;
  const scoreDisplay = isPercent ? `${score}%` : isMs ? `${score}ms` : `${score}/${max}`;
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${isComplete ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-600'}`} />
        <p className="text-sm font-medium text-slate-300">{label}</p>
      </div>
      <span className={`text-xs font-bold ${isComplete ? 'text-emerald-400' : 'text-slate-500'}`}>
        {isComplete ? `Complete (${scoreDisplay})` : 'Ready'}
      </span>
    </div>
  );
}

function CompletedCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center space-x-4 opacity-90 animate-in fade-in">
      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500">✓</div>
      <div>
        <h3 className="text-lg font-bold text-emerald-900">{title}</h3>
        <p className="text-emerald-600 text-sm font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

// ── TEST 1: ORIENTATION ────────────────────────────────────────
function OrientationCard() {
  const { scores, setScore } = useAssessment();
  const [ans, setAns] = useState("");
  if (scores.orientation.score !== null) return <CompletedCard title="Orientation" subtitle="Time and place awareness recorded." />;
  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
      <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-500 text-2xl mb-4">🌍</div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">Module 1: Orientation</h3>
      <p className="text-slate-500 mb-6">What is the current year, and what city are you in?</p>
      <div className="flex space-x-4">
        <input type="text" value={ans} onChange={e => setAns(e.target.value)}
          className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none"
          placeholder="Type your answer..." />
        <button onClick={() => setScore('orientation', { score: ans.includes("2026") ? 5 : 2, time: null })}
          className="bg-slate-900 text-white px-8 font-bold rounded-xl">Submit</button>
      </div>
    </div>
  );
}

// ── TEST 2: MEMORY REGISTRATION ───────────────────────────────
function RegistrationCard() {
  const { scores, setScore } = useAssessment();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [testPhase, setTestPhase] = useState<'idle'|'intro'|'word1'|'word2'|'word3'|'ready'|'results'>('idle');
  const [countdown, setCountdown] = useState(8);
  const [localScore, setLocalScore] = useState(0);
  const [matchedWords, setMatchedWords] = useState<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const speakAndWait = (text: string, rate = 0.85) => new Promise<void>(resolve => {
    const u = new SpeechSynthesisUtterance(text);
    const v = window.speechSynthesis.getVoices().find(v => v.name.includes('Female') || v.name.includes('Samantha')) || window.speechSynthesis.getVoices()[0];
    if (v) u.voice = v; u.rate = rate; u.pitch = 1.1;
    u.onend = () => resolve(); u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });

  const startMemorySequence = async () => {
    if (!('speechSynthesis' in window)) { setTestPhase('ready'); return; }
    setTestPhase('intro'); await speakAndWait("Please memorize these three words.", 0.9);
    await new Promise(r => setTimeout(r, 500));
    setTestPhase('word1'); await speakAndWait("Apple"); await new Promise(r => setTimeout(r, 2500));
    setTestPhase('word2'); await speakAndWait("Penny"); await new Promise(r => setTimeout(r, 2500));
    setTestPhase('word3'); await speakAndWait("Table"); await new Promise(r => setTimeout(r, 2500));
    setTestPhase('ready'); await speakAndWait("Now, click the record button and repeat them back to me.", 0.9);
  };

  const toggleRecording = async () => {
    if (isRecording && mediaRecorderRef.current) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      mediaRecorderRef.current.stop(); return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        setIsRecording(false); setIsProcessing(true); stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (blob.size < 1000) { setIsProcessing(false); return; }
        const fd = new FormData(); fd.append('file', blob);
        try {
          const res = await fetch('/api/transcribe', { method: 'POST', body: fd });
          const data = await res.json();
          if (data.transcript) {
            setTranscript(data.transcript);
            const l = data.transcript.toLowerCase();
            const matches: string[] = [];
            if (l.includes("apple")) matches.push("Apple");
            if (l.includes("penny")) matches.push("Penny");
            if (l.includes("table")) matches.push("Table");
            setLocalScore(matches.length); setMatchedWords(matches);
            setScore('registration', { score: matches.length, time: null });
            setTestPhase('results');
          }
        } catch {} finally { setIsProcessing(false); }
      };
      recorder.start(); mediaRecorderRef.current = recorder; setIsRecording(true); setCountdown(8);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch { alert("Microphone blocked."); }
  };

  if (scores.registration.score !== null) return <CompletedCard title="Memory Registration" subtitle={`Score: ${scores.registration.score}/3 words recalled`} />;

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 min-h-[300px] flex flex-col justify-center">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center text-purple-500 text-2xl">🧠</div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Module 2: Memory Registration</h3>
          <p className="text-slate-500 text-sm">Visual & Auditory Encoding</p>
        </div>
      </div>
      {testPhase === 'idle' && (
        <button onClick={startMemorySequence} className="w-full bg-indigo-100 text-indigo-700 py-6 font-bold rounded-xl hover:bg-indigo-200 transition-all flex items-center justify-center space-x-3 border border-indigo-200">
          <span className="text-2xl">🔊</span><span className="text-lg">Start Memory Sequence</span>
        </button>
      )}
      {['intro','word1','word2','word3'].includes(testPhase) && (
        <div className="flex-1 flex flex-col items-center justify-center py-8 animate-in fade-in duration-500">
          {testPhase === 'intro' && <p className="text-xl font-medium text-slate-500 animate-pulse">Listen carefully...</p>}
          {testPhase === 'word1' && <h1 className="text-6xl font-black text-slate-800 tracking-widest uppercase">Apple</h1>}
          {testPhase === 'word2' && <h1 className="text-6xl font-black text-slate-800 tracking-widest uppercase">Penny</h1>}
          {testPhase === 'word3' && <h1 className="text-6xl font-black text-slate-800 tracking-widest uppercase">Table</h1>}
        </div>
      )}
      {testPhase === 'ready' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in">
          <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-lg font-bold text-slate-600">Repeat the 3 words you just saw and heard.</span>
          </div>
          <button onClick={toggleRecording} disabled={isProcessing}
            className={`w-full text-white py-4 font-bold rounded-xl transition-all shadow-lg ${isRecording ? 'bg-rose-500 animate-pulse scale-95' : isProcessing ? 'bg-slate-400' : 'bg-slate-900 hover:bg-slate-800'}`}>
            {isRecording ? `🔴 Recording... Auto-stops in ${countdown}s` : isProcessing ? '⏳ AI is grading...' : '🎤 Tap to Record Answer'}
          </button>
        </div>
      )}
      {testPhase === 'results' && (
        <div className={`p-6 rounded-2xl border ${localScore === 3 ? 'bg-emerald-50 border-emerald-200' : localScore > 0 ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'} text-center animate-in zoom-in-95`}>
          <h4 className={`text-4xl font-black mb-2 ${localScore === 3 ? 'text-emerald-600' : localScore > 0 ? 'text-amber-600' : 'text-rose-600'}`}>{localScore} / 3</h4>
          <p className="text-slate-600 font-medium mb-4">Immediate Recall Score</p>
          <div className="flex justify-center space-x-2">
            {matchedWords.length > 0 ? matchedWords.map(w => (
              <span key={w} className="bg-slate-800 text-white px-3 py-1 rounded-md font-medium">{w}</span>
            )) : <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-md font-medium">None detected</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── TEST 3: ATTENTION ──────────────────────────────────────────
function AttentionCard() {
  const { scores, setScore } = useAssessment();
  const [ans, setAns] = useState("");
  if (scores.attention.score !== null) return <CompletedCard title="Attention" subtitle="Working memory logic recorded." />;
  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
      <div className="bg-amber-50 w-12 h-12 rounded-xl flex items-center justify-center text-amber-500 text-2xl mb-4">🧩</div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">Module 3: Attention</h3>
      <p className="text-slate-500 mb-6">Spell the word <strong>"WORLD"</strong> backwards.</p>
      <div className="flex space-x-4">
        <input type="text" value={ans} onChange={e => setAns(e.target.value)}
          className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl uppercase tracking-widest"
          placeholder="W - O - R - L - D" />
        <button onClick={() => setScore('attention', { score: ans.toLowerCase().replace(/\s/g, '') === "dlrow" ? 5 : 0, time: null })}
          className="bg-slate-900 text-white px-8 font-bold rounded-xl">Submit</button>
      </div>
    </div>
  );
}

// ── TEST 4: VISUAL NAMING ──────────────────────────────────────
function VisualNamingCard() {
  const { scores, setScore } = useAssessment();
  const [testPhase, setTestPhase] = useState<'idle'|'testing'|'results'>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localScore, setLocalScore] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const clinicalImages = [
    { id: "camel",    accepted: ["camel","dromedary"],        imageSrc: "/camel.jpg" },
    { id: "elephant", accepted: ["elephant","trunk","rhino"], imageSrc: "/elephant.avif" },
    { id: "lion",     accepted: ["lion"],                     imageSrc: "/lion.webp" },
  ];

  if (scores.animalNaming.score !== null) return <CompletedCard title="Visual Naming" subtitle={`Score: ${scores.animalNaming.score}/3 animals identified`} />;

  const checkAnswer = (text: string, accepted: string[]) =>
    accepted.some(a => text.toLowerCase().trim().includes(a));

  const toggleRecording = async () => {
    if (isRecording && mediaRecorderRef.current) { mediaRecorderRef.current.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        setIsRecording(false); setIsProcessing(true); stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (blob.size < 1000) { setIsProcessing(false); return; }
        const fd = new FormData(); fd.append('file', blob);
        try {
          const res = await fetch('/api/transcribe', { method: 'POST', body: fd });
          const data = await res.json();
          if (data.transcript) {
            setFeedback(`Heard: "${data.transcript}"`);
            const correct = checkAnswer(data.transcript, clinicalImages[currentIndex].accepted);
            const newScore = localScore + (correct ? 1 : 0);
            setLocalScore(newScore);
            if (currentIndex < clinicalImages.length - 1) {
              setTimeout(() => { setCurrentIndex(currentIndex + 1); setFeedback(""); }, 1800);
            } else {
              setScore('animalNaming', { score: newScore, time: null });
              setTestPhase('results');
            }
          }
        } catch { setFeedback("Processing error."); }
        finally { setIsProcessing(false); }
      };
      recorder.start(); mediaRecorderRef.current = recorder; setIsRecording(true); setFeedback("");
      setTimeout(() => { if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop(); }, 4500);
    } catch { alert("Microphone error."); }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col justify-center min-h-[400px]">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-cyan-50 w-12 h-12 rounded-xl flex items-center justify-center text-cyan-500 text-2xl">📸</div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Module 4: Visual Naming</h3>
          <p className="text-slate-500 text-sm">Semantic identification</p>
        </div>
      </div>
      {testPhase === 'idle' && (
        <button onClick={() => setTestPhase('testing')} className="w-full bg-cyan-600 text-white py-6 font-bold rounded-2xl hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200">
          Begin Identification
        </button>
      )}
      {testPhase === 'testing' && (
        <div className="space-y-6 animate-in fade-in text-center">
          <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 flex justify-center items-center h-56 relative overflow-hidden">
            <img src={clinicalImages[currentIndex].imageSrc} alt="Clinical Animal"
              className="max-h-full max-w-full object-contain mix-blend-multiply transition-all duration-500" />
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
              Image {currentIndex + 1} / 3
            </div>
          </div>
          <button onClick={toggleRecording} disabled={isProcessing}
            className={`w-full text-white py-5 font-bold rounded-2xl transition-all shadow-xl ${isRecording ? 'bg-rose-500 animate-pulse scale-95' : isProcessing ? 'bg-slate-400' : 'bg-slate-900 hover:bg-slate-800'}`}>
            {isRecording ? '🔴 LISTENING...' : isProcessing ? '⏳ ANALYZING...' : '🎤 TAP TO NAME ANIMAL'}
          </button>
          {feedback && <p className="text-sm font-bold text-cyan-600 bg-cyan-50 py-2 rounded-lg">{feedback}</p>}
        </div>
      )}
      {testPhase === 'results' && (
        <div className="animate-in zoom-in-95 fade-in duration-300 text-center p-10 border-2 rounded-3xl bg-emerald-50 border-emerald-100">
          <div className="text-5xl mb-2">🧬</div>
          <h4 className="text-4xl font-black text-emerald-600">{localScore} / 3</h4>
          <p className="text-emerald-800 font-bold mt-2 uppercase tracking-tighter">Semantic Memory Logged</p>
        </div>
      )}
    </div>
  );
}

// ── TEST 5: REACTION TIME ──────────────────────────────────────
function ReactionCard() {
  const { scores, setScore } = useAssessment();
  const [state, setState] = useState<'idle'|'waiting'|'go'|'result'>('idle');
  const startTimeRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTest = () => {
    setState('waiting');
    timeoutRef.current = setTimeout(() => {
      setState('go'); startTimeRef.current = Date.now();
    }, Math.floor(Math.random() * 3000) + 2000);
  };

  const handleClick = () => {
    if (state === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      alert("Clicked too early! Try again."); setState('idle');
    } else if (state === 'go') {
      setScore('reactionTime', { score: Date.now() - startTimeRef.current, time: null });
      setState('result');
    }
  };

  if (scores.reactionTime.score !== null) return <CompletedCard title="Reaction Motor" subtitle={`Time recorded: ${scores.reactionTime.score}ms`} />;

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
      <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center text-orange-500 text-2xl mb-4">⚡</div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">Module 5: Reaction Time</h3>
      <p className="text-slate-500 mb-6">Click the large button the moment it turns <strong>GREEN</strong>.</p>
      {state === 'idle'    && <button onClick={startTest}       className="w-full h-32 bg-slate-100 border-2 border-dashed border-slate-300 text-slate-600 font-bold rounded-2xl text-xl hover:bg-slate-200">Start Reaction Test</button>}
      {state === 'waiting' && <button onMouseDown={handleClick} className="w-full h-32 bg-rose-500 text-white font-bold rounded-2xl text-2xl shadow-inner">Wait for Green...</button>}
      {state === 'go'      && <button onMouseDown={handleClick} className="w-full h-32 bg-emerald-500 text-white font-black rounded-2xl text-4xl shadow-[0_0_30px_rgba(16,185,129,0.5)]">CLICK NOW!</button>}
    </div>
  );
}

// ── TEST 6: DELAYED RECALL ─────────────────────────────────────
function RecallCard() {
  const { scores, setScore } = useAssessment();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [testPhase, setTestPhase] = useState<'idle'|'intro'|'ready'|'results'>('idle');
  const [countdown, setCountdown] = useState(10);
  const [localScore, setLocalScore] = useState(0);
  const [matchedWords, setMatchedWords] = useState<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const speakAndWait = (text: string, rate = 0.85) => new Promise<void>(resolve => {
    if (!('speechSynthesis' in window)) { resolve(); return; }
    const u = new SpeechSynthesisUtterance(text);
    const v = window.speechSynthesis.getVoices().find(v => v.name.includes('Female') || v.name.includes('Samantha')) || window.speechSynthesis.getVoices()[0];
    if (v) u.voice = v; u.rate = rate; u.pitch = 1.1;
    u.onend = () => resolve(); u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });

  const startRecallSequence = async () => {
    setTestPhase('intro');
    await speakAndWait("Now, please tell me the three words you memorized earlier. Order does not matter.", 0.9);
    setTestPhase('ready');
  };

  const toggleRecording = async () => {
    if (isRecording && mediaRecorderRef.current) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      mediaRecorderRef.current.stop(); return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        setIsRecording(false); setIsProcessing(true); stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (blob.size < 1000) { setIsProcessing(false); return; }
        const fd = new FormData(); fd.append('file', blob);
        try {
          const res = await fetch('/api/transcribe', { method: 'POST', body: fd });
          const data = await res.json();
          if (data.transcript) {
            setTranscript(data.transcript);
            const l = data.transcript.toLowerCase();
            const matches: string[] = [];
            if (l.includes("apple")) matches.push("Apple");
            if (l.includes("penny")) matches.push("Penny");
            if (l.includes("table")) matches.push("Table");
            setLocalScore(matches.length); setMatchedWords(matches);
            setScore('recall', { score: matches.length, time: null });
            setTestPhase('results');
          }
        } catch {} finally { setIsProcessing(false); }
      };
      recorder.start(); mediaRecorderRef.current = recorder; setIsRecording(true); setCountdown(10);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch { alert("Microphone blocked."); }
  };

  if (scores.recall.score !== null) return <CompletedCard title="Delayed Recall" subtitle={`Score: ${scores.recall.score}/3 words retrieved`} />;

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 min-h-[300px] flex flex-col justify-center">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center text-emerald-500 text-2xl">⏱️</div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Module 6: Delayed Recall</h3>
          <p className="text-slate-500 text-sm">Long-term memory retrieval</p>
        </div>
      </div>
      {testPhase === 'idle' && (
        <button onClick={startRecallSequence} className="w-full bg-emerald-100 text-emerald-700 py-6 font-bold rounded-xl hover:bg-emerald-200 transition-all flex items-center justify-center space-x-3 border border-emerald-200">
          <span className="text-2xl">🔊</span><span className="text-lg">Play Audio Instructions</span>
        </button>
      )}
      {testPhase === 'intro' && (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center animate-in fade-in">
          <div className="inline-flex items-center space-x-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <span className="text-3xl animate-pulse">💬</span>
            <p className="text-xl font-bold text-slate-700 max-w-md">
              "Now, please tell me the three words you memorized earlier."
            </p>
          </div>
        </div>
      )}
      {testPhase === 'ready' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in">
          <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-lg font-bold text-slate-800">Say the 3 words you memorized earlier.</span>
            <p className="text-sm text-slate-500 mt-2">Click record when ready.</p>
          </div>
          <button onClick={toggleRecording} disabled={isProcessing}
            className={`w-full text-white py-4 font-bold rounded-xl transition-all shadow-lg ${isRecording ? 'bg-rose-500 animate-pulse scale-95' : isProcessing ? 'bg-slate-400' : 'bg-slate-900 hover:bg-slate-800'}`}>
            {isRecording ? `🔴 Recording... Auto-stops in ${countdown}s` : isProcessing ? '⏳ AI is grading...' : '🎤 Tap to Record Answer'}
          </button>
        </div>
      )}
      {testPhase === 'results' && (
        <div className="animate-in zoom-in-95 fade-in duration-300 mt-4">
          <div className={`p-6 rounded-2xl border ${localScore === 3 ? 'bg-emerald-50 border-emerald-200' : localScore > 0 ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'} text-center`}>
            <h4 className={`text-4xl font-black mb-2 ${localScore === 3 ? 'text-emerald-600' : localScore > 0 ? 'text-amber-600' : 'text-rose-600'}`}>{localScore} / 3</h4>
            <p className="text-slate-600 font-medium mb-4">Delayed Recall Score</p>
            <div className="flex justify-center space-x-2">
              {matchedWords.length > 0 ? matchedWords.map(w => (
                <span key={w} className="bg-slate-800 text-white px-3 py-1 rounded-md font-medium">{w}</span>
              )) : <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-md font-medium">No words detected</span>}
            </div>
          </div>
          {transcript && <div className="mt-4 p-4 bg-slate-50 rounded-xl text-slate-600 italic text-sm text-center">Heard: "{transcript}"</div>}
        </div>
      )}
    </div>
  );
}

// ── TEST 7: SPONTANEOUS SPEECH ─────────────────────────────────
function SpeechFluencyCard() {
  const { scores, setScore } = useAssessment();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [metrics, setMetrics] = useState({
    hesitations: 0, repetitions: 0, wordCount: 0,
    keywordsFound: 0, transcript: "", matchedWordsList: [] as string[]
  });
  const [testPhase, setTestPhase] = useState<'idle'|'ready'|'results'>('idle');
  const [countdown, setCountdown] = useState(20);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  if (scores.speechAnalysis.clarity !== null) return <CompletedCard title="Speech Analysis" subtitle={`Clarity score: ${scores.speechAnalysis.clarity}%`} />;

  const toggleRecording = async () => {
    if (isRecording && mediaRecorderRef.current) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      mediaRecorderRef.current.stop(); return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        setIsRecording(false); setIsProcessing(true); stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (blob.size < 1000) { setIsProcessing(false); return; }
        const fd = new FormData(); fd.append('file', blob);
        try {
          const res = await fetch('/api/transcribe', { method: 'POST', body: fd });
          const data = await res.json();
          if (data.transcript) {
            const rawText = data.transcript.toLowerCase();
            const words = rawText.match(/\b\w+\b/g) || [];
            const hesitations = words.filter((w: string) => ['uh','um','hmm','ah'].includes(w)).length;
            const TARGET_KEYWORDS = ['boy','cookie','cookies','mother','woman','water','sink','falling','chair','stool'];
            const matchedWordsList = TARGET_KEYWORDS.filter(kw => rawText.includes(kw));
            let repetitions = 0;
            for (let i = 0; i < words.length - 1; i++) { if (words[i] === words[i+1]) repetitions++; }
            let penalty = 0;
            if (hesitations > 3) penalty += 15;
            if (words.length < 8) penalty += 20;
            if (matchedWordsList.length < 3) penalty += 25;
            if (repetitions > 1) penalty += 15;
            const finalScore = Math.max(0, Math.min(100, 100 - penalty));
            setMetrics({ hesitations, repetitions, wordCount: words.length, keywordsFound: matchedWordsList.length, transcript: data.transcript, matchedWordsList });
            setScore('speechAnalysis', { clarity: finalScore, hesitations });
            setTestPhase('results');
          }
        } catch {} finally { setIsProcessing(false); }
      };
      recorder.start(); mediaRecorderRef.current = recorder; setIsRecording(true); setCountdown(20);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch { alert("Microphone blocked."); }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col justify-center">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-500 text-2xl">🎙️</div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Module 7: Spontaneous Speech</h3>
          <p className="text-slate-500 text-sm">Semantic fluency & aphasia detection</p>
        </div>
      </div>
      {testPhase === 'idle' && (
        <button onClick={() => setTestPhase('ready')} className="w-full bg-indigo-100 text-indigo-700 py-6 font-bold rounded-xl hover:bg-indigo-200 transition-all flex items-center justify-center space-x-3 border border-indigo-200">
          <span className="text-2xl">🖼️</span><span className="text-lg">Start Image Description Task</span>
        </button>
      )}
      {testPhase === 'ready' && (
        <div className="space-y-6 animate-in fade-in">
          <p className="text-slate-600 font-medium">Describe everything you see in this picture in detail.</p>
          <img src="/cookietheft.jpg" alt="Cookie Theft Clinical Image"
            className="w-full h-48 object-cover rounded-xl border-4 border-slate-50 grayscale contrast-125" />
          <button onClick={toggleRecording} disabled={isProcessing}
            className={`w-full text-white py-4 font-bold rounded-xl transition-all shadow-lg ${isRecording ? 'bg-rose-500 animate-pulse' : isProcessing ? 'bg-slate-400' : 'bg-slate-900 hover:bg-slate-800'}`}>
            {isRecording ? `🔴 Recording... Auto-stops in ${countdown}s` : isProcessing ? '⏳ AI extracting biomarkers...' : '🎤 Tap to Start Describing'}
          </button>
        </div>
      )}
      {testPhase === 'results' && (
        <div className="animate-in fade-in space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-2xl text-center border ${metrics.keywordsFound < 3 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <div className={`text-2xl font-black ${metrics.keywordsFound < 3 ? 'text-rose-600' : 'text-emerald-600'}`}>{metrics.keywordsFound}</div>
              <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">Keywords Hit</div>
            </div>
            <div className={`p-4 rounded-2xl text-center border ${metrics.hesitations > 3 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
              <div className={`text-2xl font-black ${metrics.hesitations > 3 ? 'text-amber-600' : 'text-slate-800'}`}>{metrics.hesitations}</div>
              <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">Hesitations</div>
            </div>
            <div className={`p-4 rounded-2xl text-center border ${metrics.repetitions > 1 ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
              <div className={`text-2xl font-black ${metrics.repetitions > 1 ? 'text-rose-600' : 'text-slate-800'}`}>{metrics.repetitions}</div>
              <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">Repetitions</div>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-500 w-full mb-1">Detected Target Elements:</span>
            {metrics.matchedWordsList.length > 0 ? metrics.matchedWordsList.map(kw => (
              <span key={kw} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold uppercase">{kw}</span>
            )) : <span className="text-xs text-rose-500 font-bold">No key elements detected.</span>}
          </div>
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
            <p className="text-xs text-indigo-900 italic line-clamp-3">"{metrics.transcript}"</p>
          </div>
        </div>
      )}
    </div>
  );
}