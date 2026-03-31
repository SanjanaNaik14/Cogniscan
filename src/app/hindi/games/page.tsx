'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// ==========================================
// 🧠 COGNITIVE INTERVENTION: CHITRA-MILAP
// Location: src/app/hi/games/page.tsx
// ==========================================

// 1. Culturally familiar paired items for Hindi users
const HINDI_PAIRS = [
  { id: 1, name: '🪔 दीया', pairId: 'diya' },
  { id: 2, name: '🥭 आम', pairId: 'mango' },
  { id: 3, name: '🐄 गाय', pairId: 'cow' },
  { id: 4, name: '🪁 पतंग', pairId: 'kite' },
  { id: 5, name: '🚂 रेलगाड़ी', pairId: 'train' },
  { id: 6, name: '🕉️ ओम्', pairId: 'om' },
];

// 2. Helper to shuffle an array securely
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 3. TypeScript Interfaces
interface Card {
  uniqueId: number;
  name: string;
  pairId: string;
  state: 'hidden' | 'flipped' | 'matched';
}

// ==========================================
// GAME COMPONENT
// ==========================================
function ChitraMilapGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  
  // Localized Streak State
  const [localStreak, setLocalStreak] = useState(0);
  const [isClient, setIsClient] = useState(false); // Prevents Next.js hydration errors

  // Initialize Game & Load Local Streak
  const initializeGame = () => {
    const gameItems = [...HINDI_PAIRS, ...HINDI_PAIRS];
    const shuffledItems = shuffleArray(gameItems).map((item, index) => ({
      ...item,
      uniqueId: index,
      state: 'hidden' as const,
    }));
    
    setCards(shuffledItems);
    setFlippedIndices([]);
    setMoves(0);
    setMatchedPairs(0);
    setGameState('playing');
  };

  // Run on first load
  useEffect(() => {
    setIsClient(true);
    // Load streak safely only on the client browser
    const savedStreak = localStorage.getItem('cogniscan_streak_count');
    if (savedStreak) {
      setLocalStreak(parseInt(savedStreak, 10));
    }
    initializeGame();
  }, []);

  // Logic for Daily Streak (No Database needed!)
  const handleWinAndStreak = () => {
    const now = new Date();
    const todayKey = 'cogniscan_last_played';
    const streakKey = 'cogniscan_streak_count';

    const lastPlayedDateStr = localStorage.getItem(todayKey);
    let currentStreakStr = localStorage.getItem(streakKey);
    let currentStreak = currentStreakStr ? parseInt(currentStreakStr, 10) : 0;

    if (lastPlayedDateStr) {
      const lastPlayed = new Date(lastPlayedDateStr);
      
      const isYesterday = (
        now.getDate() === lastPlayed.getDate() + 1 &&
        now.getMonth() === lastPlayed.getMonth() &&
        now.getFullYear() === lastPlayed.getFullYear()
      );

      const isToday = (
        now.getDate() === lastPlayed.getDate() &&
        now.getMonth() === lastPlayed.getMonth() &&
        now.getFullYear() === lastPlayed.getFullYear()
      );

      if (isToday) {
        // Already played today. Don't increase, keep current.
      } else if (isYesterday) {
        // Consecutive day! Increment.
        currentStreak++;
      } else {
        // Streak broken. Reset to 1.
        currentStreak = 1;
      }
    } else {
      // First time playing!
      currentStreak = 1;
    }

    // Save strictly to local browser storage
    localStorage.setItem(todayKey, now.toISOString());
    localStorage.setItem(streakKey, currentStreak.toString());
    
    setLocalStreak(currentStreak);
    setGameState('finished');
  };

  // Logic for Card Clicking
  const handleCardClick = (index: number) => {
    if (gameState !== 'playing' || cards[index].state !== 'hidden' || flippedIndices.length >= 2) {
      return;
    }

    const newCards = [...cards];
    newCards[index].state = 'flipped';
    setCards(newCards);

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstIndex, secondIndex] = newFlippedIndices;

      if (cards[firstIndex].pairId === cards[secondIndex].pairId) {
        // MATCH!
        newCards[firstIndex].state = 'matched';
        newCards[secondIndex].state = 'matched';
        setCards(newCards);
        setFlippedIndices([]);
        setMatchedPairs((prev) => prev + 1);

        // Win Condition
        if (matchedPairs + 1 === HINDI_PAIRS.length) {
          handleWinAndStreak();
        }
      } else {
        // NO MATCH! Flip back after 1s
        setTimeout(() => {
          newCards[firstIndex].state = 'hidden';
          newCards[secondIndex].state = 'hidden';
          setCards(newCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  if (!isClient) return null; // Wait for client render to avoid UI flashing

  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-xl">
      {/* HEADER & STATS */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            मस्तिष्क कसरत (Brain Workout)
          </h2>
          <p className="text-xl text-slate-600 mt-2 font-medium">
            अभ्यास 1: 'चित्र-मिलाप' (Visual Paired Memory)
          </p>
          <p className="text-base text-slate-500 mt-1">
            निर्देश: दो समान चित्रों वाले कार्ड खोजें और मिलाएँ। (Match identical pictures.)
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-inner overflow-x-auto w-full lg:w-auto">
          <div className="text-center px-2">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">चालें (Moves)</p>
            <p className="text-3xl font-extrabold text-blue-600">{moves}</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center px-2">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">जोड़े (Pairs)</p>
            <p className="text-3xl font-extrabold text-green-600">{matchedPairs} / {HINDI_PAIRS.length}</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center px-2">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">दैनिक अभ्यास (Streak)</p>
            <p className="text-3xl font-extrabold text-orange-600">
              🔥 {localStreak} दिन
            </p>
          </div>
        </div>
      </div>

      {/* WIN STATE */}
      {gameState === 'finished' && (
        <div className="bg-green-50 border-2 border-green-200 p-8 rounded-2xl text-center mb-10 shadow-lg animate-fade-in-up">
          <p className="text-6xl mb-4">🎉</p>
          <h3 className="text-4xl font-black text-green-900 tracking-tight">बहुत बढ़िया! (Well Done!)</h3>
          <p className="text-xl text-green-800 mt-3 font-medium">
            आपने {moves} चालों में सभी जोड़ों को मिला लिया है। उत्कृष्ट प्रयास!
          </p>
          <button 
            onClick={initializeGame}
            className="mt-8 bg-green-600 text-white font-bold px-10 py-4 rounded-xl text-lg hover:bg-green-700 transition duration-150 shadow-md"
          >
            फिर से खेलें (Play Again)
          </button>
        </div>
      )}

      {/* GAME GRID */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-slate-100 rounded-xl shadow-inner border border-slate-200">
        {cards.map((card, index) => (
          <button
            key={card.uniqueId}
            onClick={() => handleCardClick(index)}
            disabled={gameState !== 'playing' || card.state === 'matched'}
            className={`aspect-[3/4] rounded-lg transition-all duration-300 ease-in-out transform flex flex-col items-center justify-center p-2 
              ${card.state === 'hidden' ? 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 shadow-md cursor-pointer' : ''}
              ${card.state === 'flipped' ? 'bg-white border-4 border-blue-400 scale-105 shadow-2xl' : ''}
              ${card.state === 'matched' ? 'bg-green-100 border-2 border-green-300 opacity-60 cursor-not-allowed' : ''}
            `}
          >
            {card.state !== 'hidden' && (
              <>
                <span className="text-6xl mb-2">{card.name.split(' ')[0]}</span>
                <span className="text-xl font-extrabold text-slate-800 tracking-tight bg-slate-50 px-3 py-1 rounded shadow-sm">
                  {card.name.split(' ')[1]}
                </span>
                {card.state === 'matched' && <span className="absolute top-2 right-2 text-2xl text-green-600 font-bold">✓</span>}
              </>
            )}
            {card.state === 'hidden' && <span className="text-6xl font-extrabold text-blue-200 opacity-50">?</span>}
          </button>
        ))}
      </div>
    </div>
  );
}


// ==========================================
// 🧠 COGNITIVE INTERVENTION 2: BHED-PAHCHAN
// ==========================================

const VISUAL_PAIRS = [
    { normal: 'ब', odd: 'व', hint: 'अलग अक्षर खोजें (Find the different letter)' },
    { normal: 'प', odd: 'ष', hint: 'अलग अक्षर खोजें (Find the different letter)' },
    { normal: 'म', odd: 'भ', hint: 'अलग अक्षर खोजें (Find the different letter)' },
    { normal: '🙂', odd: '🙃', hint: 'उल्टा चेहरा खोजें (Find the upside-down face)' },
    { normal: '🌳', odd: '🌲', hint: 'अलग पेड़ खोजें (Find the different tree)' },
  ];
  
  function BhedPahchanGame() {
    const [round, setRound] = useState(0);
    const [gridSize, setGridSize] = useState(4); // Starts as 2x2
    const [gridItems, setGridItems] = useState<{char: string, isOdd: boolean}[]>([]);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [errorShake, setErrorShake] = useState(false);
  
    const startRound = (currentRound: number) => {
      if (currentRound >= VISUAL_PAIRS.length) {
        setGameState('finished');
        return;
      }
  
      // Increase difficulty (grid size) as rounds progress
      const totalItems = currentRound < 2 ? 9 : 16; // 3x3 then 4x4
      setGridSize(currentRound < 2 ? 3 : 4);
  
      const pair = VISUAL_PAIRS[currentRound];
      const oddIndex = Math.floor(Math.random() * totalItems);
      
      const newGrid = Array(totalItems).fill(null).map((_, idx) => ({
        char: idx === oddIndex ? pair.odd : pair.normal,
        isOdd: idx === oddIndex
      }));
  
      setGridItems(newGrid);
      setGameState('playing');
    };
  
    const startGame = () => {
      setRound(0);
      startRound(0);
    };
  
    const handleItemClick = (isOdd: boolean) => {
      if (isOdd) {
        // Correct! Move to next round
        const nextRound = round + 1;
        setRound(nextRound);
        startRound(nextRound);
      } else {
        // Wrong! Visual shake feedback
        setErrorShake(true);
        setTimeout(() => setErrorShake(false), 500);
      }
    };
  
    return (
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-xl mt-10">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              मस्तिष्क कसरत (Brain Workout)
            </h2>
            <p className="text-xl text-slate-600 mt-2 font-medium">
              अभ्यास 2: 'भेद-पहचान' (Spot the Difference)
            </p>
            <p className="text-base text-slate-500 mt-1">
              {gameState === 'playing' ? VISUAL_PAIRS[round].hint : 'निर्देश: जो चित्र या अक्षर अलग है, उसे पहचानें। (Hint: Identify the one that is different.)'}
            </p>
          </div>
          
          {/* PROGRESS AREA */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-inner">
            <div className="text-center px-4">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">स्तर (Level)</p>
              <p className="text-3xl font-extrabold text-blue-600">
  {Math.min(round + 1, VISUAL_PAIRS.length)} / {VISUAL_PAIRS.length}
</p>
            </div>
          </div>
        </div>
  
        {/* IDLE STATE */}
        {gameState === 'idle' && (
          <div className="text-center py-10">
            <button 
              onClick={startGame}
              className="bg-blue-600 text-white font-bold px-10 py-4 rounded-xl text-xl hover:bg-blue-700 transition shadow-lg"
            >
              शुरू करें (Start Game)
            </button>
          </div>
        )}
  
        {/* FINISHED STATE */}
        {gameState === 'finished' && (
          <div className="bg-green-50 border-2 border-green-200 p-8 rounded-2xl text-center shadow-lg animate-fade-in-up">
            <p className="text-6xl mb-4">🌟</p>
            <h3 className="text-4xl font-black text-green-900 tracking-tight">शानदार! (Brilliant!)</h3>
            <p className="text-xl text-green-800 mt-3 font-medium">
              आपकी नज़र बहुत तेज़ है। आपने सभी स्तर पार कर लिए हैं। (Your eyesight is very sharp. You have cleared all levels.)
            </p>
            <button 
              onClick={startGame}
              className="mt-8 bg-green-600 text-white font-bold px-10 py-4 rounded-xl text-lg hover:bg-green-700 transition shadow-md"
            >
              फिर से खेलें (Play Again)
            </button>
          </div>
        )}
  
        {/* PLAYING STATE - THE GRID */}
        {gameState === 'playing' && (
          <div className={`max-w-md mx-auto ${errorShake ? 'animate-bounce' : ''}`}>
            <div 
              className="grid gap-3 p-4 bg-slate-100 rounded-xl shadow-inner border border-slate-200"
              style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
            >
              {gridItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleItemClick(item.isOdd)}
                  className="aspect-square flex items-center justify-center text-5xl md:text-6xl bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  {item.char}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }



  // ==========================================
// 🧠 COGNITIVE INTERVENTION 3: ANK-KHOJ (Number Trail / Executive Function)
// ==========================================

const TRAIL_LEVELS = [
    { count: 6, cols: 'grid-cols-3' },
    { count: 9, cols: 'grid-cols-3' },
    { count: 12, cols: 'grid-cols-4' },
    { count: 16, cols: 'grid-cols-4' }
  ];
  
  function AnkKhojGame() {
    const [level, setLevel] = useState(0);
    const [numbers, setNumbers] = useState<{value: number, id: number}[]>([]);
    const [nextExpected, setNextExpected] = useState(1);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [errorId, setErrorId] = useState<number | null>(null);
  
    const startLevel = (currentLevel: number) => {
      if (currentLevel >= TRAIL_LEVELS.length) {
        setGameState('finished');
        return;
      }
  
      const { count } = TRAIL_LEVELS[currentLevel];
      
      // Generate an array from 1 to 'count'
      const numList = Array.from({ length: count }, (_, i) => i + 1);
      
      // Shuffle the numbers to create the "jumbled" trail
      const shuffled = numList.sort(() => Math.random() - 0.5).map((val, idx) => ({
        value: val,
        id: idx
      }));
  
      setNumbers(shuffled);
      setNextExpected(1);
      setGameState('playing');
    };
  
    const startGame = () => {
      setLevel(0);
      startLevel(0);
    };
  
    const handleNumberClick = (val: number, id: number) => {
      if (val === nextExpected) {
        // Correct!
        setNextExpected(prev => prev + 1);
        
        // Check if level is complete
        if (val === TRAIL_LEVELS[level].count) {
          setTimeout(() => {
            const nextLevel = level + 1;
            setLevel(nextLevel);
            startLevel(nextLevel);
          }, 500); // Short pause before next level
        }
      } else if (val > nextExpected) {
        // Wrong! Clicked out of order
        setErrorId(id);
        setTimeout(() => setErrorId(null), 400); // Visual shake duration
      }
    };
  
    return (
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-xl mt-10">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              मस्तिष्क कसरत (Brain Workout)
            </h2>
            <p className="text-xl text-slate-600 mt-2 font-medium">
              अभ्यास 3: 'अंक-खोज' (Number Trail)
            </p>
            <p className="text-base text-slate-500 mt-1">
              निर्देश: संख्याओं को 1 से शुरू करके सही क्रम में दबाएं। (Hint: Click the numbers in ascending order, starting from 1.)
            </p>
          </div>
          
          {/* PROGRESS AREA */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-inner">
            <div className="text-center px-4">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">अगला अंक (Next)</p>
              <p className="text-3xl font-extrabold text-blue-600">
                {gameState === 'playing' ? nextExpected : '-'}
              </p>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="text-center px-4">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">स्तर (Level)</p>
              <p className="text-3xl font-extrabold text-slate-800">{level + 1} / {TRAIL_LEVELS.length}</p>
            </div>
          </div>
        </div>
  
        {/* IDLE STATE */}
        {gameState === 'idle' && (
          <div className="text-center py-10">
            <button 
              onClick={startGame}
              className="bg-blue-600 text-white font-bold px-10 py-4 rounded-xl text-xl hover:bg-blue-700 transition shadow-lg"
            >
              शुरू करें (Start Game)
            </button>
          </div>
        )}
  
        {/* FINISHED STATE */}
        {gameState === 'finished' && (
          <div className="bg-green-50 border-2 border-green-200 p-8 rounded-2xl text-center shadow-lg animate-fade-in-up">
            <p className="text-6xl mb-4">🎯</p>
            <h3 className="text-4xl font-black text-green-900 tracking-tight">उत्कृष्ट! (Excellent!)</h3>
            <p className="text-xl text-green-800 mt-3 font-medium">
              आपका ध्यान और गति बहुत अच्छी है। (Your focus and speed are very good.)
            </p>
            <button 
              onClick={startGame}
              className="mt-8 bg-green-600 text-white font-bold px-10 py-4 rounded-xl text-lg hover:bg-green-700 transition shadow-md"
            >
              फिर से खेलें (Play Again)
            </button>
          </div>
        )}
  
        {/* PLAYING STATE - THE GRID */}
        {gameState === 'playing' && (
          <div className="max-w-md mx-auto">
            <div className={`grid ${TRAIL_LEVELS[level].cols} gap-4 p-5 bg-slate-200 rounded-xl shadow-inner border border-slate-300`}>
              {numbers.map((item) => {
                const isClicked = item.value < nextExpected;
                const isError = errorId === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNumberClick(item.value, item.id)}
                    disabled={isClicked}
                    className={`
                      aspect-square flex items-center justify-center text-4xl md:text-5xl font-black rounded-full shadow-md transition-all duration-200
                      ${isClicked ? 'bg-green-500 text-white scale-95 opacity-50 cursor-not-allowed shadow-inner' : 'bg-white text-slate-800 hover:bg-blue-100 hover:scale-105 border-b-4 border-slate-300 active:border-b-0 active:translate-y-1'}
                      ${isError ? 'bg-red-500 text-white animate-bounce border-red-700' : ''}
                    `}
                  >
                    {item.value}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
// 🧠 COGNITIVE INTERVENTION 4: RANG-PAHCHAN (Stroop Test / Cognitive Inhibition)
// ==========================================

const COLORS_DATA = [
    { id: 'red', text: 'लाल', hex: '#DC2626' }, // text-red-600
    { id: 'blue', text: 'नीला', hex: '#2563EB' }, // text-blue-600
    { id: 'green', text: 'हरा', hex: '#16A34A' }, // text-green-600
    { id: 'yellow', text: 'पीला', hex: '#D97706' } // text-amber-600 (darker yellow for contrast)
  ];
  
  const TOTAL_ROUNDS = 10;
  
  function RangPahchanGame() {
    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [currentWord, setCurrentWord] = useState(COLORS_DATA[0]);
    const [currentColor, setCurrentColor] = useState(COLORS_DATA[0]);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [errorShake, setErrorShake] = useState(false);
  
    const generateRound = () => {
      // Pick a random word (e.g., "लाल")
      const randomTextTarget = COLORS_DATA[Math.floor(Math.random() * COLORS_DATA.length)];
      
      // Pick a random color for the ink (e.g., Blue ink)
      // 50% chance they are different (to create the Stroop interference effect)
      let randomColorTarget = randomTextTarget;
      if (Math.random() > 0.5) {
        let differentColors = COLORS_DATA.filter(c => c.id !== randomTextTarget.id);
        randomColorTarget = differentColors[Math.floor(Math.random() * differentColors.length)];
      }
  
      setCurrentWord(randomTextTarget);
      setCurrentColor(randomColorTarget);
    };
  
    const startGame = () => {
      setRound(0);
      setScore(0);
      generateRound();
      setGameState('playing');
    };
  
    const handleColorSelection = (selectedColorId: string) => {
      // The correct answer is the INK COLOR, not the word text!
      if (selectedColorId === currentColor.id) {
        setScore(prev => prev + 1);
      } else {
        setErrorShake(true);
        setTimeout(() => setErrorShake(false), 400);
      }
  
      const nextRound = round + 1;
      if (nextRound >= TOTAL_ROUNDS) {
        setGameState('finished');
      } else {
        setRound(nextRound);
        generateRound();
      }
    };
  
    return (
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-xl mt-10">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              मस्तिष्क कसरत (Brain Workout)
            </h2>
            <p className="text-xl text-slate-600 mt-2 font-medium">
              अभ्यास 4: 'रंग-पहचान' (Stroop Attention Test)
            </p>
            <p className="text-base text-slate-500 mt-1">
              <span className="font-bold text-red-600">ध्यान दें:</span> स्याही का रंग चुनें, लिखा हुआ शब्द नहीं! (Hint: Choose the color of the ink, NOT the written word!)
            </p>
          </div>
          
          {/* PROGRESS AREA */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-inner">
            <div className="text-center px-4">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">स्कोर (Score)</p>
              <p className="text-3xl font-extrabold text-green-600">{score} / {TOTAL_ROUNDS}</p>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="text-center px-4">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">स्तर (Round)</p>
              <p className="text-3xl font-extrabold text-slate-800">{round + 1}</p>
            </div>
          </div>
        </div>
  
        {/* IDLE STATE */}
        {gameState === 'idle' && (
          <div className="text-center py-10">
            <button 
              onClick={startGame}
              className="bg-blue-600 text-white font-bold px-10 py-4 rounded-xl text-xl hover:bg-blue-700 transition shadow-lg"
            >
              शुरू करें (Start Game)
            </button>
          </div>
        )}
  
        {/* FINISHED STATE */}
        {gameState === 'finished' && (
          <div className="bg-green-50 border-2 border-green-200 p-8 rounded-2xl text-center shadow-lg animate-fade-in-up">
            <p className="text-6xl mb-4">🧠</p>
            <h3 className="text-4xl font-black text-green-900 tracking-tight">अभ्यास पूरा हुआ! (Workout Complete!)</h3>
            <p className="text-xl text-green-800 mt-3 font-medium">
              आपका स्कोर {score} / {TOTAL_ROUNDS} रहा। आपका ध्यान बहुत केंद्रित है! (Your focus is very sharp!)
            </p>
            <button 
              onClick={startGame}
              className="mt-8 bg-green-600 text-white font-bold px-10 py-4 rounded-xl text-lg hover:bg-green-700 transition shadow-md"
            >
              फिर से खेलें (Play Again)
            </button>
          </div>
        )}
  
        {/* PLAYING STATE */}
        {gameState === 'playing' && (
          <div className={`max-w-2xl mx-auto flex flex-col items-center ${errorShake ? 'animate-bounce' : ''}`}>
            
            {/* THE STROOP WORD */}
            <div className="bg-white px-16 py-12 rounded-2xl shadow-sm border-2 border-slate-200 mb-10 text-center w-full">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">स्याही का रंग क्या है? (What color is the ink?)</p>
              <h1 
                className="text-7xl md:text-8xl font-black tracking-tight"
                style={{ color: currentColor.hex }}
              >
                {currentWord.text}
              </h1>
            </div>
  
            {/* THE BUTTONS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {COLORS_DATA.map((colorItem) => (
                <button
                  key={colorItem.id}
                  onClick={() => handleColorSelection(colorItem.id)}
                  className="py-6 px-4 rounded-xl shadow-md font-bold text-2xl text-white transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: colorItem.hex }}
                >
                  {colorItem.text}
                </button>
              ))}
            </div>
            
          </div>
        )}
      </div>
    );
  }

// ==========================================
// 🧠 COGNITIVE INTERVENTION 5: STHAN-SMARAN (Spatial Working Memory / Corsi Block Test)
// ==========================================

const MEMORY_LEVELS = [
    { blocksToRemember: 3 }, // Level 1
    { blocksToRemember: 4 }, // Level 2
    { blocksToRemember: 5 }, // Level 3
  ];
  
  function SthanSmaranGame() {
    const [level, setLevel] = useState(0);
    const [pattern, setPattern] = useState<number[]>([]);
    const [userClicks, setUserClicks] = useState<number[]>([]);
    const [gameState, setGameState] = useState<'idle' | 'showing' | 'playing' | 'finished'>('idle');
    const [errorShake, setErrorShake] = useState(false);
  
    const startLevel = (currentLevel: number) => {
      if (currentLevel >= MEMORY_LEVELS.length) {
        setGameState('finished');
        return;
      }
  
      const { blocksToRemember } = MEMORY_LEVELS[currentLevel];
      
      // Generate an array of random unique indices from 0 to 8 (for a 3x3 grid)
      const newPattern: number[] = [];
      while (newPattern.length < blocksToRemember) {
        const randomIdx = Math.floor(Math.random() * 9);
        if (!newPattern.includes(randomIdx)) {
          newPattern.push(randomIdx);
        }
      }
  
      setPattern(newPattern);
      setUserClicks([]);
      setGameState('showing');
  
      // Show the pattern for 2.5 seconds, then let the user play
      setTimeout(() => {
        setGameState('playing');
      }, 2500);
    };
  
    const startGame = () => {
      setLevel(0);
      startLevel(0);
    };
  
    const handleBlockClick = (index: number) => {
      if (gameState !== 'playing' || userClicks.includes(index)) return;
  
      const newClicks = [...userClicks, index];
      setUserClicks(newClicks);
  
      // Check if the clicked block is part of the pattern
      if (!pattern.includes(index)) {
        // Wrong click! Flash error, reset current level
        setErrorShake(true);
        setGameState('showing'); // Lock board temporarily
        setTimeout(() => {
          setErrorShake(false);
          setUserClicks([]);
          setGameState('playing'); // Let them try the same level again
        }, 800);
        return;
      }
  
      // Check if they found all the blocks for this level
      if (newClicks.length === pattern.length) {
        setGameState('showing'); // Temporarily lock board
        setTimeout(() => {
          const nextLevel = level + 1;
          setLevel(nextLevel);
          startLevel(nextLevel);
        }, 1000);
      }
    };
  
    return (
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-xl mt-10">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              मस्तिष्क कसरत (Brain Workout)
            </h2>
            <p className="text-xl text-slate-600 mt-2 font-medium">
              अभ्यास 5: 'स्थान-स्मरण' (Spatial Memory Grid)
            </p>
            <p className="text-base text-slate-500 mt-1">
              {gameState === 'showing' ? (
                <span className="font-bold text-blue-600">नीले बॉक्स को ध्यान से देखें! (Watch the blue boxes carefully!)</span>
              ) : (
                'निर्देश: जो बॉक्स नीले हुए थे, उन्हें याद करके दबाएं। (Recall and click the boxes that turned blue.)'
              )}
            </p>
          </div>
          
          {/* PROGRESS AREA */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-inner">
            <div className="text-center px-4">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">स्तर (Level)</p>
              <p className="text-3xl font-extrabold text-blue-600">
                {Math.min(level + 1, MEMORY_LEVELS.length)} / {MEMORY_LEVELS.length}
              </p>
            </div>
          </div>
        </div>
  
        {/* IDLE STATE */}
        {gameState === 'idle' && (
          <div className="text-center py-10">
            <button 
              onClick={startGame}
              className="bg-blue-600 text-white font-bold px-10 py-4 rounded-xl text-xl hover:bg-blue-700 transition shadow-lg"
            >
              शुरू करें (Start Game)
            </button>
          </div>
        )}
  
        {/* FINISHED STATE */}
        {gameState === 'finished' && (
          <div className="bg-green-50 border-2 border-green-200 p-8 rounded-2xl text-center shadow-lg animate-fade-in-up">
            <p className="text-6xl mb-4">🧩</p>
            <h3 className="text-4xl font-black text-green-900 tracking-tight">कमाल की याददाश्त! (Amazing Memory!)</h3>
            <p className="text-xl text-green-800 mt-3 font-medium">
              आपकी स्थानिक स्मृति (spatial memory) बहुत तेज़ है।
            </p>
            <button 
              onClick={startGame}
              className="mt-8 bg-green-600 text-white font-bold px-10 py-4 rounded-xl text-lg hover:bg-green-700 transition shadow-md"
            >
              फिर से खेलें (Play Again)
            </button>
          </div>
        )}
  
        {/* PLAYING/SHOWING STATE - THE 3x3 GRID */}
        {(gameState === 'playing' || gameState === 'showing') && (
          <div className={`max-w-sm mx-auto ${errorShake ? 'animate-shake' : ''}`}>
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-200 rounded-xl shadow-inner border border-slate-300">
              {Array.from({ length: 9 }).map((_, index) => {
                const isTarget = pattern.includes(index);
                const isClicked = userClicks.includes(index);
                
                // Logic for colors based on game state
                let btnClass = "bg-white border-b-4 border-slate-300 hover:bg-slate-50"; // Default
                
                if (gameState === 'showing' && isTarget) {
                  btnClass = "bg-blue-500 border-b-4 border-blue-700 scale-105 shadow-md"; // Highlight pattern
                } else if (gameState === 'playing' && isClicked) {
                  btnClass = "bg-green-500 border-b-0 translate-y-1 shadow-inner opacity-90"; // User selected correctly
                } else if (errorShake && isClicked) {
                  btnClass = "bg-red-500 border-b-0 translate-y-1"; // User selected wrong (flashes red briefly)
                }
  
                return (
                  <button
                    key={index}
                    onClick={() => handleBlockClick(index)}
                    disabled={gameState === 'showing' || isClicked}
                    className={`aspect-square rounded-lg transition-all duration-300 ${btnClass}`}
                    aria-label={`Grid block ${index}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

// ==========================================
// 🧠 COGNITIVE INTERVENTION 6: SAHI-TOKARI (Semantic Categorization)
// ==========================================

const SORTING_ITEMS = [
    { id: 1, emoji: '🍎', name: 'सेब (Apple)', category: 'fruit' },
    { id: 2, emoji: '🐕', name: 'कुत्ता (Dog)', category: 'animal' },
    { id: 3, emoji: '🍌', name: 'केला (Banana)', category: 'fruit' },
    { id: 4, emoji: '🐈', name: 'बिल्ली (Cat)', category: 'animal' },
    { id: 5, emoji: '🍇', name: 'अंगूर (Grapes)', category: 'fruit' },
    { id: 6, emoji: '🐄', name: 'गाय (Cow)', category: 'animal' },
    { id: 7, emoji: '🥭', name: 'आम (Mango)', category: 'fruit' },
    { id: 8, emoji: '🐘', name: 'हाथी (Elephant)', category: 'animal' },
  ];
  
  function SahiTokariGame() {
    const [items, setItems] = useState<typeof SORTING_ITEMS>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [errorShake, setErrorShake] = useState(false);
  
    const startGame = () => {
      // Shuffle the items for a new game every time
      const shuffled = [...SORTING_ITEMS].sort(() => Math.random() - 0.5);
      setItems(shuffled);
      setCurrentIndex(0);
      setScore(0);
      setGameState('playing');
    };
  
    const handleSort = (selectedCategory: 'fruit' | 'animal') => {
      const currentItem = items[currentIndex];
  
      if (currentItem.category === selectedCategory) {
        // Correct!
        setScore(prev => prev + 1);
      } else {
        // Wrong! Flash error
        setErrorShake(true);
        setTimeout(() => setErrorShake(false), 400);
      }
  
      // Move to next item or finish game
      const nextIndex = currentIndex + 1;
      if (nextIndex >= items.length) {
        setTimeout(() => setGameState('finished'), 300); // Tiny delay for visual smoothness
      } else {
        setCurrentIndex(nextIndex);
      }
    };
  
    return (
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-xl mt-10">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              मस्तिष्क कसरत (Brain Workout)
            </h2>
            <p className="text-xl text-slate-600 mt-2 font-medium">
              अभ्यास 6: 'सही-टोकरी' (Semantic Sorting)
            </p>
            <p className="text-base text-slate-500 mt-1">
              निर्देश: चित्र को पहचानें और सही वर्ग (category) में डालें। (Hint: Sort the item into the correct category.)
            </p>
          </div>
          
          {/* PROGRESS AREA */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-inner">
            <div className="text-center px-4">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">स्कोर (Score)</p>
              <p className="text-3xl font-extrabold text-green-600">{score} / {SORTING_ITEMS.length}</p>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="text-center px-4">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">बाकी (Left)</p>
              <p className="text-3xl font-extrabold text-blue-600">
                {gameState === 'playing' ? SORTING_ITEMS.length - currentIndex : 0}
              </p>
            </div>
          </div>
        </div>
  
        {/* IDLE STATE */}
        {gameState === 'idle' && (
          <div className="text-center py-10">
            <button 
              onClick={startGame}
              className="bg-blue-600 text-white font-bold px-10 py-4 rounded-xl text-xl hover:bg-blue-700 transition shadow-lg"
            >
              शुरू करें (Start Game)
            </button>
          </div>
        )}
  
        {/* FINISHED STATE */}
        {gameState === 'finished' && (
          <div className="bg-green-50 border-2 border-green-200 p-8 rounded-2xl text-center shadow-lg animate-fade-in-up">
            <p className="text-6xl mb-4">🧺</p>
            <h3 className="text-4xl font-black text-green-900 tracking-tight">छंटाई पूरी हुई! (Sorting Complete!)</h3>
            <p className="text-xl text-green-800 mt-3 font-medium">
              आपने {score} चीज़ों को सही जगह रखा। बहुत बढ़िया! (You sorted {score} items correctly. Great job!)
            </p>
            <button 
              onClick={startGame}
              className="mt-8 bg-green-600 text-white font-bold px-10 py-4 rounded-xl text-lg hover:bg-green-700 transition shadow-md"
            >
              फिर से खेलें (Play Again)
            </button>
          </div>
        )}
  
        {/* PLAYING STATE */}
        {gameState === 'playing' && items.length > 0 && (
          <div className={`max-w-2xl mx-auto flex flex-col items-center ${errorShake ? 'animate-shake' : ''}`}>
            
            {/* THE ITEM TO SORT */}
            <div className="bg-white px-16 py-12 rounded-2xl shadow-sm border-2 border-slate-200 mb-10 text-center w-full">
              <h1 className="text-8xl md:text-9xl mb-4 drop-shadow-md transition-transform transform scale-100 hover:scale-110">
                {items[currentIndex].emoji}
              </h1>
              <p className="text-3xl font-bold text-slate-800 tracking-tight">
                {items[currentIndex].name}
              </p>
            </div>
  
            {/* THE CATEGORY BUTTONS (BASKETS) */}
            <div className="grid grid-cols-2 gap-6 w-full">
              <button
                onClick={() => handleSort('fruit')}
                className="flex flex-col items-center justify-center py-8 px-4 rounded-2xl shadow-md border-4 border-orange-200 bg-orange-50 hover:bg-orange-100 hover:border-orange-400 transition-all active:scale-95"
              >
                <span className="text-5xl mb-2">🍎</span>
                <span className="font-extrabold text-2xl text-orange-900">फल (Fruit)</span>
              </button>
  
              <button
                onClick={() => handleSort('animal')}
                className="flex flex-col items-center justify-center py-8 px-4 rounded-2xl shadow-md border-4 border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-400 transition-all active:scale-95"
              >
                <span className="text-5xl mb-2">🐾</span>
                <span className="font-extrabold text-2xl text-purple-900">जानवर (Animal)</span>
              </button>
            </div>
            
          </div>
        )}
      </div>
    );
  }


// ==========================================
// PAGE LAYOUT
// ==========================================
// ==========================================
// PAGE LAYOUT
// ==========================================
export default function GamesPage() {
    return (
      <div className="min-h-screen bg-white p-6 md:p-10 text-slate-900">
        
        {/* UPDATED HEADER WITH CAREGIVER DASHBOARD BUTTON */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b-2 border-slate-100 mb-10 max-w-5xl mx-auto">
          
          {/* Left Side: Back Button & Title */}
          <div className="flex items-center gap-4">
            <Link 
              href="/hindi" 
              className="text-lg font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition shadow-sm"
            >
              ← वापस जाएं (Back to Assessment)
            </Link>
            <div className="hidden md:block w-1.5 h-10 bg-slate-200 rounded" />
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">
              दैनिक सहायता (Daily Support)
            </h1>
          </div>
  
          {/* Right Side: Caregiver Dashboard Link */}
          <Link 
            href="/caregiver" 
            className="flex items-center gap-2 bg-slate-800 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-700 transition shadow-lg transform hover:-translate-y-0.5"
          >
            <span className="text-xl">🩺</span>
            देखभालकर्ता डैशबोर्ड (Caregiver Dashboard) →
          </Link>
  
        </header>
  
        <main className="max-w-5xl mx-auto space-y-12 pb-20">
          <ChitraMilapGame />     {/* 1. Visuospatial Pairing */}
          <BhedPahchanGame />     {/* 2. Processing Speed */}
          <AnkKhojGame />         {/* 3. Executive Function / Trail Making */}
          <RangPahchanGame />     {/* 4. Cognitive Inhibition / Stroop */}
          <SthanSmaranGame />     {/* 5. Spatial Working Memory */}
          <SahiTokariGame />      {/* 6. Semantic Categorization */}
        </main>
      </div>
    );
  }