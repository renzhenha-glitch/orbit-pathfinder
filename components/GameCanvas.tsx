
import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, GameSettings, Planet, PlanetType, Ship, Vector2 } from '../types';

interface GameCanvasProps {
  gameState: GameState;
  settings: GameSettings;
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, settings, onGameOver, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const isHoldingRef = useRef<boolean>(false);
  const activePlanetIdRef = useRef<string | null>(null); // Track which planet body was specifically clicked
  
  const peakYRef = useRef<number>(1200);
  
  const shipRef = useRef<Ship & { isInfluenced: boolean }>({
    pos: { x: 375, y: 1200 },
    vel: { x: 0, y: -settings.initialSpeed },
    orbitingPlanetId: null,
    orbitAngle: 0,
    orbitRadius: 0,
    trail: [],
    isInfluenced: false
  });

  const planetsRef = useRef<Planet[]>([]);
  const cameraYRef = useRef<number>(0);
  const starsRef = useRef<{x: number, y: number, s: number, a: number, l: number}[]>([]);
  const frameCountRef = useRef<number>(0);

  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * 750,
        y: Math.random() * 3000,
        s: Math.random() * 1.5 + 0.5,
        a: Math.random() * 0.6 + 0.2,
        l: Math.random() * 0.4 + 0.1 
      });
    }
    starsRef.current = stars;
  }, []);

  const spawnPlanet = useCallback((yPos: number, isStart: boolean = false) => {
    const typeRoll = Math.random();
    let type = PlanetType.NORMAL;
    
    if (!isStart) {
      if (typeRoll > 0.92) type = PlanetType.SINGULARITY;
      else if (typeRoll > 0.84) type = PlanetType.PULSAR;
      else if (typeRoll > 0.76) type = PlanetType.REPULSOR;
      else if (typeRoll > 0.68) type = PlanetType.BINARY;
    }

    const radius = isStart ? 45 : 25 + Math.random() * 45;
    const sizeFactor = radius / 40;
    const orbitSpeed = (settings.orbitRotationSpeed * 1.5) / Math.sqrt(sizeFactor);

    // Dynamic ranges based on settings
    const gravityRadius = settings.gravityRange * settings.tier3Range * sizeFactor;
    const midRadius = settings.gravityRange * settings.tier2Range * sizeFactor;
    const innerRadius = radius + (settings.tier1Range * sizeFactor);

    return {
      id: Math.random().toString(36).substr(2, 9),
      pos: { x: 150 + Math.random() * 450, y: yPos },
      radius: radius,
      gravityRadius, 
      midRadius,     
      innerRadius,         
      type,
      spinDir: Math.random() > 0.5 ? 1 : -1,
      orbitSpeed: orbitSpeed,
      pulse: Math.random() * Math.PI * 2,
      oscillation: Math.random() * Math.PI * 2
    };
  }, [settings]);

  const resetGame = useCallback(() => {
    const startY = 1200;
    cameraYRef.current = startY - 1000; 
    peakYRef.current = startY;
    shipRef.current = {
      pos: { x: 375, y: startY },
      vel: { x: 0, y: -settings.initialSpeed },
      orbitingPlanetId: null,
      orbitAngle: 0,
      orbitRadius: 0,
      trail: [],
      isInfluenced: false
    };
    const initialPlanets: Planet[] = [];
    for (let i = 0; i < 8; i++) {
      initialPlanets.push(spawnPlanet(startY - 500 - i * 420));
    }
    planetsRef.current = initialPlanets;
    onScoreUpdate(0);
    isHoldingRef.current = false;
    activePlanetIdRef.current = null;
  }, [settings.initialSpeed, spawnPlanet, onScoreUpdate]);

  useEffect(() => {
    if (gameState === GameState.PLAYING) resetGame();
  }, [gameState, resetGame]);

  const update = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;
    frameCountRef.current++;

    const ship = shipRef.current;
    const planets = planetsRef.current;
    ship.isInfluenced = false; 
    
    if (ship.pos.y < peakYRef.current) {
      peakYRef.current = ship.pos.y;
    }

    planets.forEach(p => {
      p.pulse += 0.03;
      if (p.type === PlanetType.BINARY) {
        p.oscillation! += 0.02;
        p.pos.x += Math.sin(p.oscillation!) * 3;
      }
    });

    if (ship.orbitingPlanetId) {
      const planet = planets.find(p => p.id === ship.orbitingPlanetId);
      if (planet) {
        ship.orbitAngle += (planet.orbitSpeed * planet.spinDir);
        
        if (planet.type === PlanetType.SINGULARITY) {
          ship.orbitRadius = Math.max(planet.radius + 15, ship.orbitRadius - 0.45);
        } else if (planet.type === PlanetType.REPULSOR) {
          ship.orbitRadius += 0.8;
          if (ship.orbitRadius > planet.midRadius) {
             ship.orbitingPlanetId = null;
             activePlanetIdRef.current = null;
          }
        }

        ship.pos.x = planet.pos.x + Math.cos(ship.orbitAngle) * ship.orbitRadius;
        ship.pos.y = planet.pos.y + Math.sin(ship.orbitAngle) * ship.orbitRadius;
        
        const tangentAngle = ship.orbitAngle + (planet.spinDir * Math.PI / 2);
        ship.vel.x = Math.cos(tangentAngle) * settings.initialSpeed;
        ship.vel.y = Math.sin(tangentAngle) * settings.initialSpeed;
      } else {
        ship.orbitingPlanetId = null;
      }
    } else {
      ship.pos.x += ship.vel.x;
      ship.pos.y += ship.vel.y;

      // Gravity only applies if holding AND a specific planet body was clicked
      if (isHoldingRef.current && activePlanetIdRef.current) {
        const p = planets.find(planet => planet.id === activePlanetIdRef.current);
        if (p) {
          const dx = p.pos.x - ship.pos.x;
          const dy = p.pos.y - ship.pos.y;
          const d = Math.sqrt(dx*dx + dy*dy);
          
          if (d < p.gravityRadius) {
            ship.isInfluenced = true;
            const massFactor = p.radius / 40;
            const influence = Math.pow(1.0 - (d / p.gravityRadius), 1.5) * massFactor;
            const tAngle = Math.atan2(dy, dx) + (p.spinDir * Math.PI / 2);
            const pullForce = 0.35 * influence;
            const tangentialForce = 0.15 * influence;

            ship.vel.x += (dx / d) * pullForce + Math.cos(tAngle) * tangentialForce;
            ship.vel.y += (dy / d) * pullForce + Math.sin(tAngle) * tangentialForce;

            const currentSpeed = Math.sqrt(ship.vel.x**2 + ship.vel.y**2);
            ship.vel.x = (ship.vel.x / currentSpeed) * settings.initialSpeed;
            ship.vel.y = (ship.vel.y / currentSpeed) * settings.initialSpeed;

            if (d < p.innerRadius) {
              ship.orbitingPlanetId = p.id;
              ship.orbitRadius = d;
              ship.orbitAngle = Math.atan2(ship.pos.y - p.pos.y, ship.pos.x - p.pos.x);
              if ('vibrate' in navigator) navigator.vibrate(30);
            }
          }
        }
      }
    }

    const targetCamY = ship.pos.y - 850;
    cameraYRef.current += (targetCamY - cameraYRef.current) * 0.12;
    const finalScore = Math.max(0, Math.floor(Math.abs(peakYRef.current - 1200) / 10));
    
    for (const p of planets) {
      const dist = Math.sqrt((ship.pos.x - p.pos.x)**2 + (ship.pos.y - p.pos.y)**2);
      if (dist < p.radius + 12) {
        onGameOver(finalScore);
        return;
      }
    }

    if (ship.pos.x < -150 || ship.pos.x > 900) {
       onGameOver(finalScore);
       return;
    }

    if (ship.pos.y > peakYRef.current + 800 || ship.pos.y > cameraYRef.current + 1450) {
      onGameOver(finalScore);
      return;
    }

    const highestPlanetY = Math.min(...planets.map(p => p.pos.y));
    if (highestPlanetY > cameraYRef.current - 400) {
      planets.push(spawnPlanet(highestPlanetY - 450));
    }
    if (planets.length > 20) {
      planetsRef.current = planets.filter(p => p.pos.y < cameraYRef.current + 2000);
    }

    ship.trail.push({ ...ship.pos });
    if (ship.trail.length > 35) ship.trail.shift();

    onScoreUpdate(finalScore);
    draw();
    requestRef.current = requestAnimationFrame(update);
  }, [gameState, settings, onGameOver, onScoreUpdate, spawnPlanet]);

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const camY = cameraYRef.current;

    starsRef.current.forEach(s => {
      let y = (s.y - camY * s.l) % 1500;
      if (y < 0) y += 1500;
      ctx.fillStyle = `rgba(255, 255, 255, ${s.a})`;
      ctx.beginPath(); ctx.arc(s.x, y, s.s, 0, Math.PI * 2); ctx.fill();
    });

    const ship = shipRef.current;

    planetsRef.current.forEach(p => {
      const drawY = p.pos.y - camY;
      const isOrbited = ship.orbitingPlanetId === p.id;
      const isClicked = activePlanetIdRef.current === p.id;
      const dist = Math.sqrt((ship.pos.x - p.pos.x)**2 + (ship.pos.y - p.pos.y)**2);
      const isInfluencing = isClicked && !isOrbited && dist < p.gravityRadius;

      const drawRing = (radius: number, alpha: number, dash: number[], weight: number = 1) => {
        let col = `rgba(59, 130, 246, ${alpha})`; 
        if (isOrbited) col = `rgba(251, 191, 36, ${alpha * 1.5})`; 
        else if (isInfluencing && dist < radius) col = `rgba(255, 255, 255, ${Math.min(1, alpha * 2.5)})`; 
        
        ctx.strokeStyle = col;
        ctx.lineWidth = (isInfluencing && dist < radius ? weight * 2.5 : weight);
        ctx.setLineDash(dash);
        ctx.beginPath(); ctx.arc(p.pos.x, drawY, radius, 0, Math.PI * 2); ctx.stroke();
      };

      // TIER 3 (Outer)
      drawRing(p.gravityRadius, 0.18, [12, 12], 1.2); 
      // TIER 2 (Mid)
      drawRing(p.midRadius, 0.28, [6, 4], 1.5);     
      // TIER 1 (Capture)
      drawRing(p.innerRadius, 0.45, [], 2);        

      ctx.save();
      ctx.translate(p.pos.x, drawY);
      ctx.rotate(frameCountRef.current * (p.orbitSpeed * 0.5) * p.spinDir);
      for(let i=0; i<6; i++) {
        ctx.rotate(Math.PI/3);
        ctx.fillStyle = isOrbited ? '#fbbf24' : (isInfluencing ? '#ffffff' : (isClicked ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)'));
        ctx.beginPath();
        const baseR = p.innerRadius + 5;
        ctx.moveTo(baseR, -5); ctx.lineTo(baseR + 15, 0); ctx.lineTo(baseR, 5);
        ctx.fill();
      }
      ctx.restore();

      let coreColor = '#1e3a8a';
      let glowColor = '#3b82f6';
      let shadowSize = 25 + (p.radius / 1.5);

      if (isOrbited) {
        coreColor = '#b45309';
        glowColor = '#fbbf24';
        shadowSize = 50 + (p.radius / 1.2);
      } else if (isInfluencing) {
        coreColor = '#2563eb';
        glowColor = '#ffffff';
        shadowSize = 40 + (p.radius / 1.2);
      } else if (isClicked) {
        coreColor = '#1d4ed8';
        glowColor = '#93c5fd';
        shadowSize = 35 + p.radius;
      } else {
        if (p.type === PlanetType.SINGULARITY) {
          coreColor = '#2e1065';
          glowColor = '#a855f7';
        } else if (p.type === PlanetType.REPULSOR) {
          coreColor = '#451a03';
          glowColor = '#eab308';
        }
      }

      ctx.shadowBlur = shadowSize;
      ctx.shadowColor = glowColor;
      ctx.fillStyle = coreColor;
      ctx.beginPath(); ctx.arc(p.pos.x, drawY, p.radius + Math.sin(p.pulse)*2, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = isInfluencing || isOrbited || isClicked ? '#ffffffaa' : '#ffffff66';
      ctx.lineWidth = isInfluencing || isOrbited || isClicked ? 4 : 2;
      ctx.beginPath(); ctx.arc(p.pos.x, drawY, p.radius*0.8, 0.5, 2.5); ctx.stroke();
    });

    if (ship.trail.length > 2) {
      ctx.beginPath();
      ctx.strokeStyle = ship.orbitingPlanetId ? 'rgba(251, 191, 36, 0.7)' : (ship.isInfluenced ? 'rgba(255, 255, 255, 0.7)' : 'rgba(96, 165, 250, 0.6)');
      ctx.lineWidth = ship.isInfluenced ? 14 : 10; 
      ctx.lineCap = 'round';
      ctx.moveTo(ship.trail[0].x, ship.trail[0].y - camY);
      for (let i = 1; i < ship.trail.length; i++) ctx.lineTo(ship.trail[i].x, ship.trail[i].y - camY);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(ship.pos.x, ship.pos.y - camY);
    ctx.rotate(Math.atan2(ship.vel.y, ship.vel.x));
    const flare = (ship.isInfluenced ? 30 : 18) + Math.random() * 10;
    const fGrad = ctx.createRadialGradient(-15, 0, 0, -15, 0, flare);
    fGrad.addColorStop(0, ship.isInfluenced ? '#fff' : '#f59e0b'); 
    fGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = fGrad; ctx.beginPath(); ctx.arc(-15, 0, flare, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = ship.isInfluenced ? 35 : 20; 
    ctx.shadowColor = ship.orbitingPlanetId ? '#fbbf24' : '#fff'; 
    ctx.fillStyle = '#fff';
    ctx.beginPath(); 
    ctx.moveTo(28, 0); ctx.lineTo(-12, -14); ctx.lineTo(-6, 0); ctx.lineTo(-12, 14); 
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = ship.orbitingPlanetId ? '#fbbf24' : '#3b82f6';
    ctx.beginPath(); ctx.ellipse(4, 0, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };

  const handleInputStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== GameState.PLAYING) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    isHoldingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const x = (clientX - rect.left) * (750 / rect.width);
    const y = (clientY - rect.top) * (1334 / rect.height) + cameraYRef.current;

    // FIND IF CLICK IS ON PLANET BODY
    const clickedPlanet = planetsRef.current.find(p => {
      const dx = x - p.pos.x;
      const dy = y - p.pos.y;
      return Math.sqrt(dx*dx + dy*dy) < p.radius + 15; // Small buffer for easier clicking on mobile
    });

    if (clickedPlanet) {
      activePlanetIdRef.current = clickedPlanet.id;
      if ('vibrate' in navigator) navigator.vibrate(20);
    } else {
      activePlanetIdRef.current = null;
    }
  };

  const handleInputEnd = () => {
    isHoldingRef.current = false;
    activePlanetIdRef.current = null;
    if (shipRef.current.orbitingPlanetId) {
      shipRef.current.orbitingPlanetId = null;
      if ('vibrate' in navigator) navigator.vibrate(15);
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  return (
    <canvas
      ref={canvasRef}
      width={750} height={1334}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      onMouseDown={handleInputStart} onMouseUp={handleInputEnd}
      onTouchStart={handleInputStart} onTouchEnd={handleInputEnd}
    />
  );
};

export default GameCanvas;
