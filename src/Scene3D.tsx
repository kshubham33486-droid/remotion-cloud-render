import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';

function createSamugarhWarAudioWav(durationSec: number, sampleRate = 22050): string {
  const numSamples = Math.floor(durationSec * sampleRate);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Continuous Dark Orchestral Drone (Drops suddenly at 9.0s for the Empty Howdah turning point)
    const isTurningPoint = t >= 9.0 && t < 11.8;
    const droneAmp = isTurningPoint ? 0.08 : 0.22;
    const drone =
      (Math.sin(2 * Math.PI * 36.71 * t) * 0.6 +
        Math.sin(2 * Math.PI * 55.0 * t) * 0.3 +
        Math.sin(2 * Math.PI * 73.42 * t) * 0.18) *
      droneAmp;

    // Marching War Drums (0s - 9s) & Final Defeat Boom (12s - 15s)
    let drums = 0;
    const beat = t % 0.75;
    if (!isTurningPoint && beat < 0.22) {
      drums = Math.sin(2 * Math.PI * (68 * Math.exp(-beat * 12) + 30) * beat) * Math.exp(-beat * 10) * 0.28;
    }

    // Heartbeat Pulse during Dara Shikoh's Empty Howdah Moment (9.0s - 11.8s)
    let heartbeat = 0;
    if (isTurningPoint) {
      const hb = (t - 9.0) % 0.9;
      if (hb < 0.18) {
        heartbeat += Math.sin(2 * Math.PI * 42 * hb) * Math.exp(-hb * 14) * 0.42;
      } else if (hb >= 0.22 && hb < 0.38) {
        const hb2 = hb - 0.22;
        heartbeat += Math.sin(2 * Math.PI * 38 * hb2) * Math.exp(-hb2 * 16) * 0.32;
      }
    }

    // Cannon Blasts & Gunpowder Explosions (4.2s, 5.1s, 6.0s, 7.0s)
    let cannons = 0;
    [4.2, 5.1, 6.0, 7.0, 12.0].forEach((ct) => {
      if (t >= ct && t <= ct + 1.4) {
        const pt = t - ct;
        const noise = ((Math.sin(i * 12.9898) * 43758.5453) % 1) * 2 - 1;
        const boom = Math.sin(2 * Math.PI * (82 * Math.exp(-pt * 8) + 26) * pt) * Math.exp(-pt * 4.5);
        cannons += (boom * 0.35 + noise * Math.exp(-pt * 7) * 0.16);
      }
    });

    const masterEnv = Math.min(1, t / 0.4) * Math.min(1, (durationSec - t) / 0.8);
    const val = Math.max(-1, Math.min(1, (drone + drums + heartbeat + cannons) * masterEnv));
    view.setInt16(44 + i * 2, val * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return 'data:audio/wav;base64,' + btoa(bin);
}

// Dara Shikoh's Royal Army Formations (Left Side - Imperial Gold/Amber)
const DARA_UNITS = [
  { id: 'D1', label: 'VANGUARD CAVALRY', x: 560, y: 340, isCommand: false },
  { id: 'D2', label: 'WAR ELEPHANTS', x: 590, y: 460, isCommand: false },
  { id: 'D3', label: 'DARA SHIKOH (ROYAL HOWDAH)', x: 520, y: 560, isCommand: true },
  { id: 'D4', label: 'IMPERIAL INFANTRY', x: 585, y: 670, isCommand: false },
  { id: 'D5', label: 'RIGHT FLANK CAVALRY', x: 545, y: 780, isCommand: false },
];

// Aurangzeb's Disciplined Army Formations (Right Side - Tactical Crimson/Teal)
const AURANGZEB_UNITS = [
  { id: 'A1', label: 'SWIVEL ARTILLERY', x: 1290, y: 350, isArtillery: true },
  { id: 'A2', label: 'HEAVY CANNON BATTERY', x: 1260, y: 475, isArtillery: true },
  { id: 'A3', label: 'AURANGZEB COMMAND', x: 1350, y: 565, isArtillery: false },
  { id: 'A4', label: 'MATCHLOCK MUSKETEERS', x: 1265, y: 665, isArtillery: true },
  { id: 'A5', label: 'RESERVE CAVALRY', x: 1310, y: 775, isArtillery: false },
];

const CANNON_SHOTS = [
  { startF: 125, fromX: 1260, fromY: 475, toX: 690, toY: 450 },
  { startF: 152, fromX: 1290, fromY: 350, toX: 675, toY: 345 },
  { startF: 180, fromX: 1265, fromY: 665, toX: 685, toY: 650 },
  { startF: 208, fromX: 1260, fromY: 475, toX: 640, toY: 555 },
]; 
export const Scene3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const sfxSrc = useMemo(() => createSamugarhWarAudioWav(durationInFrames / fps), [durationInFrames, fps]);

  // 3D Camera Choreography across 15s (450 frames)
  // 0-120: Aerial Tactical Overview -> 120-270: Push into Artillery & Clash -> 270-360: Zoom on Dara's Empty Howdah -> 360-450: High Aerial Pull-up on Retreat
  const camTiltX = interpolate(frame, [0, 120, 270, 350, 450], [34, 48, 52, 46, 28], {
    easing: Easing.inOut(Easing.cubic),
  });
  const camScale = interpolate(frame, [0, 120, 270, 345, 450], [0.96, 1.15, 1.24, 1.32, 0.94], {
    easing: Easing.inOut(Easing.cubic),
  });
  const camPanX = interpolate(frame, [0, 120, 275, 345, 450], [0, -25, 130, 150, 0], {
    easing: Easing.inOut(Easing.cubic),
  });

  // Phase 2 Clash Advance (Frames 120 - 270) & Phase 3 Retreat Collapse (Frames 345 - 450)
  const daraAdvance = interpolate(frame, [115, 255], [0, 115], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const daraRetreat = interpolate(frame, [345, 445], [0, -240], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });

  const aurangzebAdvance = interpolate(frame, [130, 265, 350, 445], [0, -95, -95, -260], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Turning Point Alert Opacity (Frames 270 - 365: 9.0s to 12.1s)
  const howdahAlert = interpolate(frame, [270, 286, 355, 372], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Current Act Label
  const actPhase =
    frame < 120
      ? 'ACT I • BATTLEFIELD DEPLOYMENT NEAR AGRA (MAY 29, 1658)'
      : frame < 270
      ? 'ACT II • AURANGZEB’S ARTILLERY BARRAGE & CAVALRY CLASH'
      : frame < 360
      ? 'ACT III • THE FATAL MISTAKE: DARA SHIKOH’S EMPTY HOWDAH'
      : 'ACT IV • COLLAPSE & ROUT OF THE IMPERIAL ARMY';

  return (
    <AbsoluteFill style={{ backgroundColor: '#090705', overflow: 'hidden' }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Inter:wght@500;700;800&family=JetBrains+Mono:wght@600;800&family=Noto+Sans+Devanagari:wght@600;700;800&display=swap');`}
      </style>

      <Audio src={sfxSrc} volume={0.95} />

      {/* Sun-Scorched Samugarh Terrain & Tactical Grid */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(180, 83, 9, 0.25) 0%, rgba(18, 13, 9, 0.96) 70%, #050403 100%), linear-gradient(rgba(251, 191, 36, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(251, 191, 36, 0.05) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 55px 55px, 55px 55px',
        }}
      />

      {/* ================= 3D TACTICAL BATTLEFIELD TABLE ================= */}
      <AbsoluteFill style={{ perspective: '1300px', justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            width: 1920,
            height: 1080,
            transform: `translateX(${camPanX}px) rotateX(${camTiltX}deg) scale(${camScale})`,
            transformStyle: 'preserve-3d',
          }}
        >
          <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <filter id="warGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Yamuna River Bend & Agra Fort Reference (Top-Left, Historically Accurate near Agra) */}
            <path
              d="M 80 180 Q 420 210 680 150 Q 1050 90 1480 165 L 1480 215 Q 1050 145 680 205 Q 420 265 80 235 Z"
              fill="rgba(14, 116, 144, 0.28)"
              stroke="rgba(56, 189, 248, 0.45)"
              strokeWidth="2"
            />
            <text x="290" y="198" fill="#7dd3fc" fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="800" letterSpacing="3">
              YAMUNA RIVER (NEAR AGRA)
            </text>

            {/* Agra Citadel Marker */}
            <circle cx="210" cy="285" r="9" fill="#fbbf24" />
            <text x="230" y="290" fill="#fde68a" fontFamily="Cinzel, serif" fontSize="16" fontWeight="800" letterSpacing="2">
              AGRA FORT (16 KM WEST)
            </text>

            {/* Samugarh Open Scorched Plain Boundary */}
            <ellipse
              cx="960"
              cy="565"
              rx="640"
              ry="310"
              fill="rgba(217, 119, 6, 0.06)"
              stroke="rgba(251, 191, 36, 0.22)"
              strokeWidth="1.5"
              strokeDasharray="10 8"
            />
            <text x="960" y="295" fill="rgba(253, 230, 138, 0.5)" fontFamily="Cinzel, serif" fontSize="20" fontWeight="800" textAnchor="middle" letterSpacing="6">
              PLAINS OF SAMUGARH • 1658
            </text>

            {/* DARA SHIKOH'S ROYAL ARMY BLOCKS (GOLD) */}
            {DARA_UNITS.map((u, idx) => {
              const scatterY = frame > 345 ? (idx - 2) * ((frame - 345) * 0.65) : 0;
              const curX = u.x + daraAdvance + daraRetreat;
              const curY = u.y + scatterY;
              const isAlerting = u.isCommand && frame >= 270;

              return (
                <g key={u.id} transform={`translate(${curX}, ${curY})`}>
                  {isAlerting && (
                    <circle
                      cx="0"
                      cy="0"
                      r={28 + ((frame - 270) % 35) * 2.2}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3.5"
                      opacity={1 - ((frame - 270) % 35) / 35}
                    />
                  )}
                  <rect
                    x="-62"
                    y="-24"
                    width="124"
                    height="48"
                    rx="4"
                    fill={isAlerting ? '#7f1d1d' : '#78350f'}
                    stroke={isAlerting ? '#ef4444' : '#fbbf24'}
                    strokeWidth={u.isCommand ? '3' : '2'}
                    filter="url(#warGlow)"
                  />
                  <text x="0" y="5" fill="#ffffff" fontFamily="JetBrains Mono, monospace" fontSize="13" fontWeight="800" textAnchor="middle">
                    {u.id}
                  </text>
                  <text
                    x="0"
                    y="-34"
                    fill={isAlerting ? '#fca5a5' : '#fde047'}
                    fontFamily="Inter, sans-serif"
                    fontSize="12"
                    fontWeight="800"
                    textAnchor="middle"
                    letterSpacing="1"
                  >
                    {isAlerting ? '▲ EMPTY HOWDAH!' : u.label}
                  </text>
                </g>
              );
            })}

            {/* AURANGZEB'S DISCIPLINED ARMY BLOCKS (CRIMSON / STEEL) */}
            {AURANGZEB_UNITS.map((u) => {
              const curX = u.x + aurangzebAdvance;
              return (
                <g key={u.id} transform={`translate(${curX}, ${u.y})`}>
                  <rect
                    x="-62"
                    y="-24"
                    width="124"
                    height="48"
                    rx="4"
                    fill="#0f172a"
                    stroke="#38bdf8"
                    strokeWidth="2.2"
                    filter="url(#warGlow)"
                  />
                  <text x="0" y="5" fill="#38bdf8" fontFamily="JetBrains Mono, monospace" fontSize="13" fontWeight="800" textAnchor="middle">
                    {u.id}
                  </text>
                  <text x="0" y="-34" fill="#bae6fd" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="800" textAnchor="middle" letterSpacing="1">
                    {u.label}
                  </text>
                </g>
              );
            })}

            {/* ARTILLERY CANNONBALL TRAJECTORIES & EXPLOSIONS (Frames 125 - 265) */}
            {CANNON_SHOTS.map((shot, idx) => {
              const localF = frame - shot.startF;
              if (localF < 0 || localF > 55) return null;
              const flyP = Math.min(1, localF / 22);
              const bx = interpolate(flyP, [0, 1], [shot.fromX + aurangzebAdvance, shot.toX]);
              const by = interpolate(flyP, [0, 1], [shot.fromY, shot.toY]) - Math.sin(flyP * Math.PI) * 90;
              const blastP = Math.max(0, (localF - 22) / 33);

              return (
                <g key={idx}>
                  {flyP < 1 && (
                    <circle cx={bx} cy={by} r="8" fill="#f97316" filter="url(#warGlow)" />
                  )}
                  {localF >= 22 && (
                    <g transform={`translate(${shot.toX}, ${shot.toY})`}>
                      <circle
                        cx="0"
                        cy="0"
                        r={15 + blastP * 95}
                        fill="rgba(249, 115, 22, 0.25)"
                        stroke="#f97316"
                        strokeWidth="3"
                        opacity={1 - blastP}
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </AbsoluteFill>

      {/* ================= TOP COMMAND TELEMETRY HEADER ================= */}
      <div
        style={{
          position: 'absolute',
          top: 138,
          left: 85,
          right: 85,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          zIndex: 8,
        }}
      >
        {/* Left Card: Dara Shikoh */}
        <div
          style={{
            background: 'rgba(18, 12, 6, 0.9)',
            borderLeft: '5px solid #fbbf24',
            padding: '14px 24px',
            borderTop: '1px solid rgba(251,191,36,0.3)',
          }}
        >
          <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#fbbf24', fontSize: 13, fontWeight: 800, letterSpacing: 2 }}>
            IMPERIAL HEIR APPARENT
          </div>
          <div style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: 28, fontWeight: 800 }}>
            DARA SHIKOH
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', color: '#fde68a', fontSize: 14, fontWeight: 700, marginTop: 2 }}>
            {frame > 345 ? 'STATUS: FORMATIONS BROKEN / RETREATING' : '60,000 TROOPS • ROYAL WAR ELEPHANTS'}
          </div>
        </div>

        {/* Center Phase Banner */}
        <div style={{ textAlign: 'center', textShadow: '0 6px 24px #000' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#f59e0b', fontSize: 14, fontWeight: 800, letterSpacing: 4 }}>
            {actPhase}
          </div>
          <div style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: 42, fontWeight: 800, letterSpacing: 3, marginTop: 4 }}>
            THE BATTLE OF SAMUGARH, 1658
          </div>
        </div>

        {/* Right Card: Aurangzeb */}
        <div
          style={{
            background: 'rgba(10, 16, 26, 0.9)',
            borderRight: '5px solid #38bdf8',
            padding: '14px 24px',
            textAlign: 'right',
            borderTop: '1px solid rgba(56,189,248,0.3)',
          }}
        >
          <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#38bdf8', fontSize: 13, fontWeight: 800, letterSpacing: 2 }}>
            COALITION COMMANDER
          </div>
          <div style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: 28, fontWeight: 800 }}>
            AURANGZEB
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', color: '#bae6fd', fontSize: 14, fontWeight: 700, marginTop: 2 }}>
            40,000 VETERANS • DISCIPLINED ARTILLERY
          </div>
        </div>
      </div>

      {/* ================= TURNING POINT DIALOGUE CALLOUT (9.0s - 12.1s) ================= */}
      {howdahAlert > 0.01 && (
        <div
          style={{
            position: 'absolute',
            bottom: 148,
            left: '50%',
            transform: `translateX(-50%) scale(${0.95 + howdahAlert * 0.05})`,
            opacity: howdahAlert,
            width: 1180,
            background: 'linear-gradient(90deg, rgba(69, 10, 10, 0.95) 0%, rgba(28, 6, 6, 0.98) 100%)',
            border: '2px solid #ef4444',
            boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 35px rgba(239, 68, 68, 0.45)',
            padding: '20px 36px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 9,
          }}
        >
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#fca5a5', fontSize: 14, fontWeight: 800, letterSpacing: 3 }}>
              ▲ CRITICAL TURNING POINT • DARA DISMOUNTS HIS WAR ELEPHANT
            </div>
            <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#ffffff', fontSize: 32, fontWeight: 800, marginTop: 6 }}>
              “शहज़ादे कहाँ हैं? — दारा शिकोह मारे गए!”
            </div>
          </div>
          <div style={{ textAlign: 'right', borderLeft: '2px solid rgba(239,68,68,0.5)', paddingLeft: 28 }}>
            <div style={{ fontFamily: 'Cinzel, serif', color: '#ef4444', fontSize: 24, fontWeight: 800 }}>
              EMPTY ROYAL HOWDAH
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', color: '#fecaca', fontSize: 15, fontWeight: 600, marginTop: 4 }}>
              Seeing the empty elephant seat, panic sweeps Dara’s ranks
            </div>
          </div>
        </div>
      )}

      {/* 21:9 Cinema Letterbox Bars */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 118, backgroundColor: '#000', zIndex: 10 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 118, backgroundColor: '#000', zIndex: 10 }} />
    </AbsoluteFill>
  );
};
