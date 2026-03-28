"use client";
import React, { useState, useRef, useEffect } from 'react';

const ReactionTest = () => {
  const [gameState, setGameState] = useState<'idle' | 'instructing' | 'countdown' | 'waiting' | 'click' | 'result'>('idle');
  const [startTime, setStartTime] = useState(0);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [count, setCount] = useState(3);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load voices early so they are ready when the user clicks
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // --- UPGRADED TEXT-TO-SPEECH ---
  const speak = (text: string, onEndCallback?: () => void) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text);

      // Search the browser for a female voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('samantha') || 
        v.name.toLowerCase().includes('victoria') ||
        v.name.toLowerCase().includes('zira')
      );

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.rate = 0.85; // Slower for elderly comprehension
      utterance.pitch = 1.1; // Slightly higher pitch

      // If a callback is provided, run it ONLY when she stops speaking
      if (onEndCallback) {
        utterance.onend = onEndCallback;
      }

      window.speechSynthesis.speak(utterance);
    } else if (onEndCallback) {
      onEndCallback(); // Fallback if browser doesn't support speech
    }
  };

  // Helper function to create pauses
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  // --- THE NEW TIMING LOGIC ---
  const runCountdownSequence = async () => {
    setGameState('countdown');
    
    setCount(3);
    speak("3");
    await delay(1000);
    
    setCount(2);
    speak("2");
    await delay(1000);
    
    setCount(1);
    speak("1");
    await delay(1000);

    setGameState('waiting');
    
    // Random wait between 1.5 and 3.5 seconds so they can't guess it
    const randomWait = Math.floor(Math.random() * 2000) + 1500; 
    timeoutRef.current = setTimeout(() => {
      setGameState('click');
      setStartTime(Date.now());
    }, randomWait);
  };

  const startTest = () => {
    setGameState('instructing');
    
    // 1. Speak instructions. 2. When finished, run the countdown.
    speak("Concentrate. Please tap the screen as soon as it turns green.", () => {
      runCountdownSequence();
    });
  };

  const handleLevelClick = () => {
    if (gameState === 'click') {
      const reactionTime = (Date.now() - startTime) / 1000;
      setLastScore(reactionTime);
      setGameState('result');
      
      speak(`Test complete. Your reaction time was ${reactionTime} seconds.`);
    }
  };

  return (
    <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 min-h-[450px] flex flex-col items-center justify-center text-center transition-all duration-300">
      
      {gameState === 'idle' && (
        <>
          <div className="bg-blue-50 p-4 rounded-2xl mb-6 text-4xl">🧠</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Cognitive Response Test</h2>
          <p className="text-slate-500 mb-8 max-w-xs">Tests processing speed and motor coordination.</p>
          <button onClick={startTest} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold transition-transform active:scale-95 shadow-lg shadow-blue-200">
            Begin Assessment
          </button>
        </>
      )}

      {gameState === 'instructing' && (
        <div className="animate-pulse">
          <div className="text-6xl mb-4">🔊</div>
          <h2 className="text-2xl font-semibold text-slate-600">Listen to instructions...</h2>
        </div>
      )}

      {gameState === 'countdown' && (
        <div className="animate-in zoom-in duration-200">
          <h2 className="text-slate-400 font-bold uppercase tracking-widest mb-4">Starting In</h2>
          <div className="text-9xl font-black text-blue-600">{count}</div>
        </div>
      )}

      {gameState === 'waiting' && (
        <div>
          <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-6 animate-pulse"></div>
          <h2 className="text-2xl font-semibold text-slate-400">Wait for green...</h2>
        </div>
      )}

      {gameState === 'click' && (
        <button onClick={handleLevelClick} className="w-full h-80 bg-emerald-500 hover:bg-emerald-600 rounded-3xl text-white text-5xl font-black animate-in fade-in zoom-in duration-100 shadow-2xl shadow-emerald-200">
          TAP NOW!
        </button>
      )}

      {gameState === 'result' && (
        <div className="animate-in slide-in-from-bottom-4">
          <h3 className="text-slate-400 font-bold uppercase tracking-tighter text-sm mb-2">Measured Latency</h3>
          <div className="text-6xl font-black text-slate-900 mb-8">{lastScore}s</div>
          <button onClick={() => setGameState('idle')} className="text-blue-600 font-semibold hover:underline px-6 py-2 rounded-full hover:bg-blue-50 transition-colors">
            Try again
          </button>
        </div>
      )}
    </div>
  );
};

export default ReactionTest;