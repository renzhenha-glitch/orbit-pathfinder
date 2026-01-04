
export enum GameState {
  START,
  PLAYING,
  GAMEOVER
}

export enum PlanetType {
  NORMAL = 'NORMAL',
  PULSAR = 'PULSAR',
  SINGULARITY = 'SINGULARITY',
  REPULSOR = 'REPULSOR',
  BINARY = 'BINARY'
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Planet {
  id: string;
  pos: Vector2;
  radius: number;
  gravityRadius: number; // Outer Zone (Zone 3)
  midRadius: number;     // Middle Zone (Zone 2)
  innerRadius: number;   // Capture Zone (Zone 1)
  type: PlanetType;
  pulse: number;
  spinDir: number;       // 1 for CW, -1 for CCW
  orbitSpeed: number;    // Calculated based on size
  oscillation?: number; 
  data?: any; 
}

export interface Ship {
  pos: Vector2;
  vel: Vector2;
  orbitingPlanetId: string | null;
  orbitAngle: number;
  orbitRadius: number;
  trail: Vector2[];
}

export interface GameSettings {
  initialSpeed: number;
  orbitRotationSpeed: number; 
  gravityRange: number;       // Base reference range
  tier1Range: number;         // Capture Range (inner offset)
  tier2Range: number;         // Transition Range multiplier
  tier3Range: number;         // Influence Range multiplier
}
