"use client";
import React, { useState, useRef } from 'react';

// Upgraded clinical naming targets with high-quality images
const animals = [
    { 
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/07._Camel_Profile%2C_near_Silverton%2C_NSW%2C_07.07.2007.jpg/600px-07._Camel_Profile%2C_near_Silverton%2C_NSW%2C_07.07.2007.jpg", 
      name: "camel", 
      accepted: ["camel", "alpaca", "llama"] 
    },
    { 
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/African_Bush_Elephant.jpg/600px-African_Bush_Elephant.jpg", 
    name: "elephant", 
    accepted: ["elephant", "mammoth"]
    },
    { 
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Lion_waiting_in_Namibia.jpg/600px-Lion_waiting_in_Namibia.jpg", 
      name: "lion", 
      accepted: ["lion", "tiger", "cat"] 
    }
  ];

const NamingTest = () => {
  const [gameState, setGameState] = useState<'idle' | 'instructing' | 'testing' | 'processing' | 'result'>('idle');
  const [currentAnimal, setCurrentAnimal] = useState(0);
  const [score, setScore] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
        utterance.rate = 0.85; // Slow and clear for elderly patients
        
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
    setScore(0);
    setCurrentAnimal(0);
    await speakAsync("I am going to show you some animals. Please tap the microphone and tell me the name of the animal.");
    setGameState('testing');
  };

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

          // Reusing your Groq API!
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) throw new Error("API Failed");

          const data = await response.json();
          const actualTranscript = (data.text || "").toLowerCase();
          setTranscript(actualTranscript);
          
          // Check if they said any of the accepted words for this animal
          const animalData = animals[currentAnimal];
          const isCorrect = animalData.accepted.some(word => actualTranscript.includes(word));
          
          if (isCorrect) {
            setScore(prev => prev + 1);
          }

          // Move to next animal or finish
          if (currentAnimal < animals.length - 1) {
            setCurrentAnimal(prev => prev + 1);
            setGameState('testing');
          } else {
            setGameState('result');
            speakAsync(`Test complete. You correctly named ${score + (isCorrect ? 1 : 0)} out of 3 animals.`);
          }

        } catch (error) {
          console.error("AI Transcription failed:", error);
          alert("Network error. Please try again.");
          setGameState('idle');
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Give elderly patients plenty of time (8 seconds) to speak
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

  return (
    <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 min-h-[450px] flex flex-col items-center justify-center text-center transition-all duration-300 relative">
      
      {gameState === 'idle' && (
        <>
          <div className="bg-rose-50 p-4 rounded-2xl mb-6 text-4xl">👁️</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Visual Recognition</h2>
          <p className="text-slate-500 mb-8 max-w-xs">Tests semantic memory and language retrieval.</p>
          <button onClick={startTest} className="bg-rose-500 hover:bg-rose-600 text-white px-10 py-4 rounded-2xl font-bold transition-transform active:scale-95 shadow-lg shadow-rose-200">
            Start Visual Test
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
        <div className="w-full flex flex-col items-center animate-in zoom-in duration-300">
          <p className="text-sm font-bold text-rose-500 uppercase tracking-widest mb-4">Image {currentAnimal + 1} of 3</p>
          
          {/* THE NEW IMAGE DISPLAY */}
          <div className="mb-8 select-none">
            <img 
              src={animals[currentAnimal].imageUrl} 
              alt="Animal to name" 
              className="w-56 h-56 object-cover rounded-3xl shadow-md border-4 border-slate-50 mx-auto"
              draggable="false"
            />
          </div>
          
          <button 
            onClick={isRecording ? manuallyStopRecording : startRecording}
            className={`w-28 h-28 rounded-full flex items-center justify-center text-3xl text-white shadow-2xl transition-all ${
              isRecording ? 'bg-red-500 animate-pulse shadow-red-200 scale-110' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'
            }`}
          >
            {isRecording ? "🛑" : "🎙️"}
          </button>
          <p className="mt-6 text-slate-600 font-medium">
            {isRecording ? "Listening..." : "Tap the mic and name the animal"}
          </p>
        </div>
      )}

      {gameState === 'processing' && (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mb-6"></div>
          <h2 className="text-xl font-bold text-slate-700">AI Analyzing Audio...</h2>
        </div>
      )}

      {gameState === 'result' && (
        <div className="animate-in slide-in-from-bottom-4 w-full">
          <h3 className="text-slate-400 font-bold uppercase tracking-tighter text-sm mb-2">Recognition Score</h3>
          <div className="text-7xl font-black text-slate-900 mb-2">{score}/3</div>
          <p className="text-slate-500 mb-8 font-medium italic">Last answer recorded: "{transcript}"</p>
          
          <button onClick={() => setGameState('idle')} className="text-rose-600 font-semibold hover:underline px-6 py-2 rounded-full hover:bg-rose-50 transition-colors">
            Run Test Again
          </button>
        </div>
      )}
    </div>
  );
};

export default NamingTest;