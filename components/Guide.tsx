
import React from 'react';

interface GuideProps {
  onClose: () => void;
}

const Guide: React.FC<GuideProps> = ({ onClose }) => {
  const atlasItems = [
    {
      name: '标准星 (Normal)',
      color: 'bg-blue-600',
      glow: 'shadow-[0_0_15px_#3b82f6]',
      desc: '最常见的天体，提供稳定的引力场，是航行的基础基点。'
    },
    {
      name: '脉冲星 (Pulsar)',
      color: 'bg-cyan-400',
      glow: 'shadow-[0_0_15px_#22d3ee]',
      desc: '引力范围会周期性律动。捕捉时需观察波峰，范围越大引力越强。'
    },
    {
      name: '奇点 (Singularity)',
      color: 'bg-purple-700',
      glow: 'shadow-[0_0_15px_#7e22ce]',
      desc: '拥有极强的向心力。进入轨道后，飞船会不断向圆心陷落，需尽快弹射。'
    },
    {
      name: '斥力星 (Repulsor)',
      color: 'bg-yellow-600',
      glow: 'shadow-[0_0_15px_#ca8a04]',
      desc: '极其危险。由于磁场排斥，进入轨道后轨道半径会迅速扩大，极易脱轨。'
    },
    {
      name: '双子星 (Binary)',
      color: 'bg-blue-400',
      glow: 'shadow-[0_0_15px_#60a5fa]',
      desc: '在星区内进行横向简谐运动。捕捉它需要预判位置，极度考验反应。'
    }
  ];

  return (
    <div className="absolute inset-0 z-30 bg-[#020617]/95 backdrop-blur-2xl p-6 overflow-y-auto flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black italic tracking-tighter text-blue-400">MISSION LOG <span className="text-white">GUIDE</span></h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-white font-black"
          >
            ✕
          </button>
        </div>

        {/* Gameplay Section */}
        <section className="mb-10 text-left">
          <h3 className="text-blue-500 font-black uppercase tracking-widest text-xs mb-4 border-l-4 border-blue-500 pl-3">核心操作指南</h3>
          <div className="space-y-4 text-sm text-slate-300">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
              <span className="text-white font-bold block mb-1">1. 捕获与绕行</span>
              飞船自动直线飞行。长按屏幕时，若飞船位于星球引力圈内，将自动向其靠拢并进入环绕轨道。
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
              <span className="text-white font-bold block mb-1">2. 切线弹射</span>
              松开手指的瞬间，飞船将沿当前的切线方向飞出。飞行的距离和方向完全取决于松手的时机。
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
              <span className="text-white font-bold block mb-1">3. 失败判定</span>
              撞击星球表面、飞出星域左右边界、或向后滑落（低于历史最高点过远）都会导致任务终止。
            </div>
          </div>
        </section>

        {/* Atlas Section */}
        <section className="mb-10 text-left">
          <h3 className="text-blue-500 font-black uppercase tracking-widest text-xs mb-4 border-l-4 border-blue-500 pl-3">深空天体图鉴</h3>
          <div className="space-y-4">
            {atlasItems.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start bg-slate-900/50 p-4 rounded-xl border border-white/5">
                <div className={`w-12 h-12 shrink-0 rounded-full ${item.color} ${item.glow} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/20 -translate-x-1/2 -translate-y-1/2 rounded-full w-full h-full"></div>
                </div>
                <div>
                  <h4 className="text-white font-black text-base">{item.name}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-white text-slate-950 font-black rounded-xl text-lg mb-8 shadow-lg shadow-white/10 active:scale-95 transition-all"
        >
          我已就绪 / UNDERSTOOD
        </button>
      </div>
    </div>
  );
};

export default Guide;
