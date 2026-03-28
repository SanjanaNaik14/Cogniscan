"use client";
import React, { useState } from 'react';

// Clinical-style logic questions
const questions = [
  { 
    audio: "What is twenty minus seven?", 
    text: "20 - 7 = ?", 
    options: [12, 13, 14], 
    correct: 13 
  },
  { 
    audio: "Which number is the largest?", 
    text: "Select the largest number", 
    options: [64, 81, 79], 
    correct: 81 
  },
  { 
    audio: "If you have five coins and give two away, how many are left?", 
    text: "5 coins minus 2 coins", 
    options: [2, 3, 4], 
    correct: 3 
  }
];

const AttentionTest = () => {
  const [gameState, setGameState] = useState<'idle' | 'instructing' | 'testing' | 'result'>('idle');
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  // --- ASYNC TEXT TO SPEECH ---
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
        utterance.onerror = () => resolve(); 
        
        window.speechSynthesis.speak(utterance);
      } else {
        resolve(); 
      }
    });
  };

  const startTest = async () => {
    setGameState('instructing');
    setCurrentQ(0);
    setScore(0);
    setTotalTime(0);
    
    await speakAsync("Let's test your attention. Please tap the correct answer on the screen.");
    
    setGameState('testing');
    askQuestion(0);
  };

  const askQuestion = async (index: number) => {
    setQuestionStartTime(Date.now());
    await speakAsync(questions[index].audio);
  };

  const handleAnswer = (selectedOption: number) => {
    const timeTaken = (Date.now() - questionStartTime) / 1000;
    setTotalTime(prev => prev + timeTaken);

    if (selectedOption === questions[currentQ].correct) {
      setScore(prev => prev + 1);
    }

    if (currentQ < questions.length - 1) {
      const nextQ = currentQ + 1;
      setCurrentQ(nextQ);
      askQuestion(nextQ);
    } else {
      setGameState('result');
      speakAsync(`Test complete. You got ${score + (selectedOption === questions[currentQ].correct ? 1 : 0)} out of 3 correct.`);
    }
  };

  return (
    <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 min-h-[450px] flex flex-col items-center justify-center text-center transition-all duration-300">
      
      {gameState === 'idle' && (
        <>
          <div className="bg-amber-50 p-4 rounded-2xl mb-6 text-4xl">🧩</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Attention & Logic</h2>
          <p className="text-slate-500 mb-8 max-w-xs">Tests executive functioning, focus, and basic computation.</p>
          <button onClick={startTest} className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-4 rounded-2xl font-bold transition-transform active:scale-95 shadow-lg shadow-amber-200">
            Start Logic Test
          </button>
        </>
      )}

      {gameState === 'instructing' && (
        <div className="animate-pulse">
          <div className="text-6xl mb-6">🔊</div>
          <h2 className="text-2xl font-semibold text-slate-600">Listen to instructions...</h2>
        </div>
      )}

      {gameState === 'testing' && (
        <div className="w-full animate-in zoom-in duration-300">
          <p className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-4">Question {currentQ + 1} of 3</p>
          <h2 className="text-3xl font-black text-slate-800 mb-10">{questions[currentQ].text}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg mx-auto">
            {questions[currentQ].options.map((option, idx) => (
              <button 
                key={idx}
                onClick={() => handleAnswer(option)}
                className="bg-slate-50 hover:bg-amber-50 border-2 border-slate-100 hover:border-amber-400 text-slate-700 hover:text-amber-700 text-4xl font-black py-8 rounded-2xl transition-all active:scale-95 shadow-sm"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'result' && (
        <div className="animate-in slide-in-from-bottom-4 w-full">
          <div className="grid grid-cols-2 gap-8 mb-8 max-w-md mx-auto">
            <div>
              <h3 className="text-slate-400 font-bold uppercase tracking-tighter text-xs mb-2">Accuracy</h3>
              <div className="text-6xl font-black text-slate-900">{score}/3</div>
            </div>
            <div>
              <h3 className="text-slate-400 font-bold uppercase tracking-tighter text-xs mb-2">Avg Decision Time</h3>
              <div className="text-5xl font-black text-slate-900 mt-2">{(totalTime / 3).toFixed(1)}s</div>
            </div>
          </div>
          
          <button onClick={() => setGameState('idle')} className="text-amber-600 font-semibold hover:underline px-6 py-2 rounded-full hover:bg-amber-50 transition-colors">
            Run Test Again
          </button>
        </div>
      )}
    </div>
  );
};

export default AttentionTest;