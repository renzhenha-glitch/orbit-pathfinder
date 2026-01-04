
import React, { useState } from 'react';
import { GameState, GameSettings } from './types';
import GameCanvas from './components/GameCanvas';
import Settings from './components/Settings';
import Guide from './components/Guide';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    initialSpeed: 5.5,
    orbitRotationSpeed: 0.08,
    gravityRange: 160,
    tier1Range: 35,   // Default capture offset
    tier2Range: 0.9,  // Default mid multiplier
    tier3Range: 1.4   // Default outer multiplier
  });

  const handleStart = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
    setShowGuide(false);
    setShowSettings(false);
  };

  const handleGameOver = (finalScore: number) => {
    setGameState(GameState.GAMEOVER);
    setScore(finalScore);
    if (finalScore > highScore) setHighScore(finalScore);
  };

  return (
    <div className="relative w-full h-screen bg-[#02040a] text-white overflow-hidden flex flex-col items-center justify-center">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_100%)] opacity-50 pointer-events-none" />

      {/* Main Game Container */}
      <div className="relative h-full aspect-[9/16] max-w-full bg-black shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
        
        {/* Header UI */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 pointer-events-none">
          <div className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <h1 className="text-xl font-black tracking-tighter text-blue-400 italic">ORBIT<span className="text-white">PATH</span></h1>
            {gameState === GameState.PLAYING && (
              <div className="text-4xl font-black text-white tabular-nums">
                {Math.floor(score)}<span className="text-xs font-normal text-blue-400 ml-1">KM</span>
              </div>
            )}
          </div>
          <div className="text-right drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">Best Dist</div>
            <div className="text-lg font-bold text-blue-300">{Math.floor(highScore)}</div>
          </div>
        </div>

        {/* Main Game Area */}
        <GameCanvas 
          gameState={gameState} 
          settings={settings}
          onGameOver={handleGameOver}
          onScoreUpdate={setScore}
        />

        {/* Overlay Screens */}
        {gameState === GameState.START && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/90 p-8 backdrop-blur-md overflow-y-auto">
            <div className="w-full text-center py-10">
              <div className="mb-12 relative inline-block">
                 <div className="absolute -inset-4 bg-blue-500/20 blur-2xl rounded-full animate-pulse"></div>
                 <h2 className="text-5xl font-black text-white relative">2026<br/><span className="text-blue-500">READY?</span></h2>
              </div>
              
              <p className="text-slate-400 mb-12 text-sm leading-relaxed px-4">
                穿梭虚空，捕获引力。<br/>
                不要回头，星辰在前方。
              </p>
              
              <div className="flex flex-col gap-4 max-w-[280px] mx-auto">
                <button 
                  onClick={handleStart}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-900/40 active:scale-95 text-xl tracking-widest"
                >
                  启动任务 / LAUNCH
                </button>
                
                <button 
                  onClick={() => setShowGuide(true)}
                  className="w-full py-4 bg-slate-800/40 hover:bg-slate-800/60 text-blue-300 font-bold rounded-xl border border-blue-500/20 transition-all text-sm tracking-widest"
                >
                  玩法介绍 & 天体图鉴
                </button>

                <button 
                  onClick={() => setShowSettings(true)}
                  className="w-full py-4 bg-slate-800/20 hover:bg-slate-800/40 text-slate-400 font-bold rounded-xl border border-white/5 transition-all text-sm tracking-widest"
                >
                  飞船参数设置 / SETTINGS
                </button>
              </div>
            </div>
          </div>
        )}

        {showGuide && (
          <Guide onClose={() => setShowGuide(false)} />
        )}

        {showSettings && (
          <Settings settings={settings} onSettingsChange={setSettings} onClose={() => setShowSettings(false)} />
        )}

        {gameState === GameState.GAMEOVER && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-red-950/60 backdrop-blur-xl p-8">
            <div className="w-full text-center">
              <h2 className="text-4xl font-black mb-2 text-white italic">SIGNAL LOST</h2>
              <div className="py-10 bg-black/40 rounded-3xl border border-white/5 mb-8">
                <div className="text-slate-500 uppercase tracking-widest text-xs mb-1 font-bold">Total Traversed</div>
                <div className="text-6xl font-black text-white tabular-nums">{Math.floor(score)}</div>
                <div className="text-blue-500 text-xs mt-2 font-mono tracking-widest">KILOMETERS</div>
              </div>
              
              <button 
                onClick={handleStart}
                className="w-full py-5 bg-white text-slate-950 font-black rounded-2xl transition-all shadow-2xl active:scale-95 text-xl"
              >
                RE-INITIALIZE
              </button>
              <button 
                onClick={() => setGameState(GameState.START)}
                className="mt-6 text-slate-400 hover:text-white transition-colors text-sm uppercase tracking-widest font-bold"
              >
                Return to Base
              </button>
            </div>
          </div>
        )}

        {/* HUD Indicator */}
        {gameState === GameState.PLAYING && (
          <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none px-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-full py-2 border border-white/10">
              <p className="text-blue-400 font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">
                Click Planet to Catch • Release to Sling
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
