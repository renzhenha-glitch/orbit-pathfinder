
import React from 'react';
import { GameSettings } from '../types';

interface SettingsProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSettingsChange, onClose }) => {
  const handleChange = (key: keyof GameSettings, value: number) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="absolute inset-0 z-30 bg-[#020617]/95 backdrop-blur-2xl p-6 flex flex-col items-center">
      <div className="w-full max-w-md h-full flex flex-col overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black italic tracking-tighter text-blue-400">ENGINEERING <span className="text-white">SETTINGS</span></h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-white font-black"
          >
            ✕
          </button>
        </div>

        <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 space-y-6 mb-4">
          <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold border-l-4 border-blue-500 pl-3">
            动力系统参数
          </p>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <label className="text-xs font-mono text-blue-400 uppercase tracking-widest block mb-1">初始推进速度</label>
                <div className="text-[10px] text-slate-500">Initial Velocity (U/s)</div>
              </div>
              <span className="text-xl font-black text-white tabular-nums">{settings.initialSpeed.toFixed(1)}</span>
            </div>
            <input 
              type="range" min="3" max="10" step="0.1"
              value={settings.initialSpeed} 
              onChange={(e) => handleChange('initialSpeed', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <label className="text-xs font-mono text-blue-400 uppercase tracking-widest block mb-1">公转绕行速率</label>
                <div className="text-[10px] text-slate-500">Orbit Rotation Speed</div>
              </div>
              <span className="text-xl font-black text-white tabular-nums">{settings.orbitRotationSpeed.toFixed(2)}</span>
            </div>
            <input 
              type="range" min="0.04" max="0.15" step="0.01"
              value={settings.orbitRotationSpeed} 
              onChange={(e) => handleChange('orbitRotationSpeed', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 space-y-6">
          <p className="text-blue-500 text-[10px] uppercase tracking-[0.2em] font-bold border-l-4 border-blue-600 pl-3">
            三级引力感应增强
          </p>

          {/* Tier 1 */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <label className="text-xs font-bold text-white uppercase tracking-widest block">LEVEL 1: 捕捉核心</label>
                <div className="text-[9px] text-slate-500">Capture Threshold (Inner Zone)</div>
              </div>
              <span className="text-lg font-black text-blue-400 tabular-nums">{settings.tier1Range.toFixed(0)}</span>
            </div>
            <input 
              type="range" min="15" max="80" step="1"
              value={settings.tier1Range} 
              onChange={(e) => handleChange('tier1Range', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
            />
          </div>

          {/* Tier 2 */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <label className="text-xs font-bold text-white uppercase tracking-widest block">LEVEL 2: 轨道过渡</label>
                <div className="text-[9px] text-slate-500">Transition Stability (Mid Zone)</div>
              </div>
              <span className="text-lg font-black text-blue-500 tabular-nums">{settings.tier2Range.toFixed(2)}x</span>
            </div>
            <input 
              type="range" min="0.5" max="1.5" step="0.05"
              value={settings.tier2Range} 
              onChange={(e) => handleChange('tier2Range', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Tier 3 */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <label className="text-xs font-bold text-white uppercase tracking-widest block">LEVEL 3: 深空牵引</label>
                <div className="text-[9px] text-slate-500">Deep Space Influence (Outer Zone)</div>
              </div>
              <span className="text-lg font-black text-blue-600 tabular-nums">{settings.tier3Range.toFixed(2)}x</span>
            </div>
            <input 
              type="range" min="1.0" max="2.5" step="0.1"
              value={settings.tier3Range} 
              onChange={(e) => handleChange('tier3Range', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="pt-4 border-t border-white/5">
            <p className="text-[10px] text-slate-500 leading-relaxed italic">
              * 每一级引力对应星球周围的三层光环。增强等级会显著改变捕捉难度与星际切入的容错率。
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-blue-600 text-white font-black rounded-xl text-lg mt-6 mb-8 shadow-lg shadow-blue-900/20 active:scale-95 transition-all shrink-0"
        >
          保存配置 / APPLY CORE CONFIG
        </button>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Settings;
