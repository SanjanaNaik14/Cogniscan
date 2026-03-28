"use client";
import React, { useState, useRef } from 'react';

const wordsToRemember = ["apple", "table", "coin"];

const MemoryTest = () => {
  const [gameState, setGameState] = useState<'idle' | 'instructing' | 'memorize' | 'delay' | 'listening' | 'processing' | 'result'>('idle');
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // --- UPGRADED ASYNC TEXT TO SPEECH ---
  // This now returns a Promise, so we can cleanly "await" it in our test flow!
  const speakAsync = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => 
          v.name.toLowerCase().includes('female') || 
          v.name.toLowerCase().includes('samantha') ||
          v.name.toLowerCase().includes('zira')
        );
        if (femaleVoice) utterance.voice = femaleVoice;
        utterance.rate = 0.85;
        
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve(); // Resolve anyway so the app doesn't freeze
        
        window.speechSynthesis.speak(utterance);
      } else {
        resolve(); // Fallback if browser doesn't support speech
      }
    });
  };

  const delayTimer = (ms: number) => new Promise(res => setTimeout(res, ms));

  // --- REAL-TIME AI AUDIO RECORDER (Using your Groq Route) ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setGameState('processing');
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());

        try {
          const formData = new FormData();
          formData.append('file', audioBlob);

          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) throw new Error("API Failed");

          const data = await response.json();
          const actualTranscript = (data.text || "").toLowerCase();
          setTranscript(actualTranscript);
          
          let matchedWords = 0;
          wordsToRemember.forEach(word => {
            if (actualTranscript.includes(word)) matchedWords++;
          });
          
          setScore(matchedWords);
          setGameState('result');
          speakAsync(`Test complete. You remembered ${matchedWords} out of 3 words.`);

        } catch (error) {
          console.error("AI Transcription failed:", error);
          alert("Network error. Please check your internet connection and try again.");
          setGameState('idle');
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 8 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 8000);

    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Please allow microphone access to complete the test.");
    }
  };

  const manuallyStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // --- THE NEW CLINICAL TEST FLOW ---
  const runClinicalTest = async () => {
    setGameState('instructing');
    await speakAsync("I am going to show and say three words. Please remember them.");
    
    setGameState('memorize');
    
    // Show and speak words one by one
    for (const word of wordsToRemember) {
      setCurrentWord(word.toUpperCase());
      await speakAsync(word);
      await delayTimer(1000); // Leave word on screen for 1 second after speaking
    }
    
    setCurrentWord(null);
    
    // The Retention Delay Phase
    setGameState('delay');
    await speakAsync("Hold those words in your mind.");
    
    // Visual 5-second countdown
    for (let i = 5; i > 0; i--) {
      setCountdown(i);
      await delayTimer(1000);
    }

    setGameState('listening');
    await speakAsync("Now, tap the microphone and tell me the words.");
  };

  return (
    <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 min-h-[450px] flex flex-col items-center justify-center text-center transition-all duration-300 relative">
      
      {gameState === 'idle' && (
        <>
          <div className="bg-purple-50 p-4 rounded-2xl mb-6 text-4xl">🗣️</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Verbal Memory Recall</h2>
          <p className="text-slate-500 mb-8 max-w-xs">Tests short-term retention and working memory capacity.</p>
          <button onClick={runClinicalTest} className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-2xl font-bold transition-transform active:scale-95 shadow-lg shadow-purple-200">
            Start Memory Test
          </button>
        </>
      )}

      {gameState === 'instructing' && (
        <div className="animate-pulse">
          <div className="text-6xl mb-6">🔊</div>
          <h2 className="text-2xl font-semibold text-slate-600">Listen carefully...</h2>
        </div>
      )}

      {gameState === 'memorize' && (
        <div className="animate-in zoom-in duration-200">
          <h2 className="text-slate-400 font-bold uppercase tracking-widest mb-6">Memorize</h2>
          <div className="text-7xl font-black text-purple-600 tracking-tight">
            {currentWord || "..."}
          </div>
        </div>
      )}

      {gameState === 'delay' && (
        <div className="animate-in fade-in duration-500">
          <h2 className="text-2xl font-semibold text-slate-600 mb-6">Hold them in your memory...</h2>
          <div className="w-24 h-24 rounded-full border-8 border-slate-100 border-t-purple-500 animate-spin mx-auto flex items-center justify-center">
            <span className="text-2xl font-bold text-slate-400 animate-none">{countdown}</span>
          </div>
        </div>
      )}

      {gameState === 'listening' && (
        <div className="flex flex-col items-center animate-in zoom-in duration-300">
          <h2 className="text-xl font-bold text-slate-700 mb-6">Repeat the 3 words now.</h2>
          <button 
            onClick={isRecording ? manuallyStopRecording : startRecording}
            className={`w-40 h-40 rounded-full flex items-center justify-center text-5xl text-white shadow-2xl transition-all ${
              isRecording ? 'bg-red-500 animate-pulse shadow-red-200 scale-110' : 'bg-blue-500 hover:bg-blue-600 shadow-blue-200'
            }`}
          >
            {isRecording ? "🛑" : "🎙️"}
          </button>
          <p className="mt-6 text-slate-600 font-medium">
            {isRecording ? "Secure recording active..." : "Tap the mic to start"}
          </p>
        </div>
      )}

      {gameState === 'processing' && (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-6"></div>
          <h2 className="text-xl font-bold text-slate-700">AI Processing...</h2>
          <p className="text-slate-500 mt-2 text-sm">Transcribing secure audio</p>
        </div>
      )}

      {gameState === 'result' && (
        <div className="animate-in slide-in-from-bottom-4 w-full">
          <h3 className="text-slate-400 font-bold uppercase tracking-tighter text-sm mb-2">Recall Score</h3>
          <div className="text-7xl font-black text-slate-900 mb-2">{score}/3</div>
          <p className="text-slate-500 mb-8 font-medium italic">Transcript: "{transcript}"</p>
          
          <button onClick={() => setGameState('idle')} className="text-purple-600 font-semibold hover:underline px-6 py-2 rounded-full hover:bg-purple-50 transition-colors">
            Run Test Again
          </button>
        </div>
      )}
    </div>
  );
};

export default MemoryTest;