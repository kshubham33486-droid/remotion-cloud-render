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

function createMagnatesSfxWav(durationSec: number, sampleRate = 22050): string {
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

    // Deep Cinematic Sub-Bass Tension Drone (C1 + G1 + C2)
    const drone =
      Math.sin(2 * Math.PI * 32.7 * t) * 0.24 +
      Math.sin(2 * Math.PI * 49.0 * t) * 0.13 +
      Math.sin(2 * Math.PI * 65.41 * t) * 0.06;

    // Documentary Data-Ticker Clicks during GDP Counter (4.2s - 6.8s)
    let ticks = 0;
    if (t >= 4.2 && t <= 6.8) {
      const tickPhase = (t * 14) % 1;
      if (tickPhase < 0.08) {
        ticks = Math.sin(2 * Math.PI * 1450 * tickPhase) * Math.exp(-tickPhase * 45) * 0.14;
      }
    }

    // Heavy Trailer Booms at Scene Transitions (0.4s, 4.0s, 8.2s)
    let booms = 0;
    [0.4, 4.0, 8.2].forEach((bt) => {
      if (t >= bt && t <= bt + 1.6) {
        const pt = t - bt;
        booms += Math.sin(2 * Math.PI * (76 * Math.exp(-pt * 7.5) + 28) * pt) * Math.exp(-pt * 4.5) * 0.38;
      }
    });

    const masterEnv = Math.min(1, t / 0.35) * Math.min(1, (durationSec - t) / 0.5);
    const val = Math.max(-1, Math.min(1, (drone + ticks + booms) * masterEnv));
    view.setInt16(44 + i * 2, val * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return 'data:audio/wav;base64,' + btoa(bin);
}

const TRADE_HUBS = [
  { name: 'SURAT & CALICUT', sub: 'SPICE & TEXTILE PORTS', x: 935, y: 545, delay: 12, primary: true },
  { name: 'ALEXANDRIA & ROME', sub: 'MEDITERRANEAN DEMAND', x: 520, y: 365, delay: 42, primary: false },
  { name: 'BAGHDAD & BASRA', sub: 'PERSIAN GULF HUB', x: 705, y: 425, delay: 32, primary: false },
  { name: 'MALACCA & CANTON', sub: 'EASTERN MARITIME LINK', x: 1320, y: 585, delay: 52, primary: false },
];

const GDP_BARS = [
  { year: '1 CE', share: '32.9%', h: 310, color: '#fbbf24' },
  { year: '1000 CE', share: '28.9%', h: 275, color: '#f59e0b' },
  { year: '1500 CE', share: '24.5%', h: 235, color: '#f59e0b' },
  { year: '1700 CE', share: '24.4%', h: 232, color: '#fde047' },
  { year: '1950 CE', share: '4.2%', h: 46, color: '#ef4444' },
];
export const Scene3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const sfxSrc = useMemo(() => createMagnatesSfxWav(durationInFrames / fps), [durationInFrames, fps]);

  // Smooth 3D Camera Choreography across 3 Acts
  const mapTiltX = interpolate(frame, [0, 115, 145], [38, 24, 58], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const mapScale = interpolate(frame, [0, 125], [1.02, 1.24], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const act1Opacity = interpolate(frame, [0, 16, 118, 138], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Trade Route SVG Stroke Animation
  const routeDraw = interpolate(frame, [18, 95], [900, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Act 2 & 3: 3D Economic Dominance Dashboard (Frames 120 - 360)
  const act2Opacity = interpolate(frame, [120, 142, 345, 360], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const gdpCounter = interpolate(frame, [130, 205], [0, 32.9], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const cardSlide = spring({
    frame: Math.max(0, frame - 140),
    fps,
    config: { damping: 15, stiffness: 95 },
  });

  const crisisAlert = interpolate(frame, [245, 268], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#060709', overflow: 'hidden' }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@600;800&family=Noto+Sans+Devanagari:wght@600;700&display=swap');`}
      </style>

      <Audio src={sfxSrc} volume={0.95} />

      {/* Subtle Tactical Grid & Studio Vignette Background */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 45%, rgba(217, 119, 6, 0.22) 0%, rgba(10, 12, 16, 0.96) 65%, #040507 100%), linear-gradient(rgba(251, 191, 36, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(251, 191, 36, 0.05) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 60px 60px, 60px 60px',
        }}
      />

      {/* ================= ACT 1: 3D TACTICAL TRADE EMPIRE MAP (0s - 4.5s) ================= */}
      {act1Opacity > 0.01 && (
        <AbsoluteFill
          style={{
            opacity: act1Opacity,
            perspective: '1200px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: 1920,
              height: 1080,
              transform: `rotateX(${mapTiltX}deg) scale(${mapScale})`,
              transformStyle: 'preserve-3d',
            }}
          >
            <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <filter id="goldNeon" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Latitude / Longitude Tactical Arcs */}
              {[260, 420, 580, 740].map((y, idx) => (
                <line key={idx} x1="180" y1={y} x2="1740" y2={y} stroke="rgba(251, 191, 36, 0.14)" strokeWidth="1.2" strokeDasharray="8 8" />
              ))}
              {[420, 720, 1020, 1320, 1620].map((x, idx) => (
                <line key={idx} x1={x} y1="160" x2={x} y2="900" stroke="rgba(251, 191, 36, 0.14)" strokeWidth="1.2" strokeDasharray="8 8" />
              ))}

              {/* Stylized Eurasian & Indian Ocean Coastline Contours */}
              <path
                d="M 380 280 L 560 270 L 660 350 L 760 390 L 865 445 L 935 615 L 1015 460 L 1160 440 L 1360 390 L 1460 540 L 1280 650 L 1060 540 L 935 680 L 830 510 L 670 460 L 470 410 Z"
                fill="rgba(245, 158, 11, 0.09)"
                stroke="rgba(251, 191, 36, 0.45)"
                strokeWidth="2"
              />

              {/* Glowing Golden Maritime & Silk Trade Arteries radiating from India */}
              <path
                d="M 935 545 Q 740 470 520 365"
                fill="none"
                stroke="#fde047"
                strokeWidth="4"
                strokeDasharray="900"
                strokeDashoffset={routeDraw}
                filter="url(#goldNeon)"
              />
              <path
                d="M 935 545 Q 815 475 705 425"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="3.5"
                strokeDasharray="900"
                strokeDashoffset={routeDraw}
                filter="url(#goldNeon)"
              />
              <path
                d="M 935 545 Q 1120 635 1320 585"
                fill="none"
                stroke="#fde047"
                strokeWidth="4"
                strokeDasharray="900"
                strokeDashoffset={routeDraw}
                filter="url(#goldNeon)"
              />

              {/* Hub Beacons & Telemetry Labels */}
              {TRADE_HUBS.map((hub, idx) => {
                const pop = spring({ frame: Math.max(0, frame - hub.delay), fps, config: { damping: 12 } });
                const pulseR = ((frame + idx * 15) % 45) * 1.1;
                return (
                  <g key={idx} transform={`translate(${hub.x}, ${hub.y}) scale(${pop})`}>
                    <circle
                      cx="0"
                      cy="0"
                      r={pulseR}
                      fill="none"
                      stroke={hub.primary ? '#fde047' : '#38bdf8'}
                      strokeWidth="2"
                      opacity={1 - pulseR / 50}
                    />
                    <circle cx="0" cy="0" r={hub.primary ? 12 : 8} fill={hub.primary ? '#fde047' : '#38bdf8'} filter="url(#goldNeon)" />
                    <rect
                      x="18"
                      y="-26"
                      width="255"
                      height="52"
                      rx="4"
                      fill="rgba(10, 12, 16, 0.9)"
                      stroke={hub.primary ? '#fbbf24' : 'rgba(56, 189, 248, 0.5)'}
                      strokeWidth="1.5"
                    />
                    <text x="30" y="-4" fill="#ffffff" fontFamily="JetBrains Mono, monospace" fontSize="15" fontWeight="800">
                      {hub.name}
                    </text>
                    <text x="30" y="16" fill={hub.primary ? '#fbbf24' : '#7dd3fc'} fontFamily="Inter, sans-serif" fontSize="11" fontWeight="700" letterSpacing="1.5">
                      {hub.sub}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Act 1 Headline Overlay */}
          <div style={{ position: 'absolute', top: 150, left: 100, textShadow: '0 8px 30px rgba(0,0,0,0.95)' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#fbbf24', fontSize: 16, letterSpacing: 5, fontWeight: 800 }}>
              ● GLOBAL TRADE NETWORK • 1 CE – 1700 CE
            </div>
            <div style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: 54, fontWeight: 800, letterSpacing: 2, marginTop: 6 }}>
              THE INDIAN OCEAN MONOPOLY
            </div>
            <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#fde68a', fontSize: 26, fontWeight: 700, marginTop: 4 }}>
              विश्व व्यापार की धुरी — प्राचीन भारत का आर्थिक साम्राज्य
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ================= ACT 2 & 3: 3D ECONOMIC POWERHOUSE DASHBOARD (4s - 12s) ================= */}
      {act2Opacity > 0.01 && (
        <AbsoluteFill style={{ opacity: act2Opacity, perspective: '1300px' }}>
          {/* Left Side: 3D Animated GDP Bar Chart */}
          <div
            style={{
              position: 'absolute',
              left: 110,
              bottom: 185,
              width: 880,
              height: 540,
              background: 'linear-gradient(180deg, rgba(17, 20, 27, 0.88) 0%, rgba(9, 11, 15, 0.95) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.32)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
              padding: '32px 42px',
              transform: 'rotateY(8deg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#94a3b8', fontSize: 14, letterSpacing: 3, fontWeight: 700 }}>
                  ANGUS MADDISON HISTORICAL DATA
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', color: '#ffffff', fontSize: 28, fontWeight: 800, marginTop: 4 }}>
                  SHARE OF TOTAL WORLD GDP
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#fde047', fontSize: 44, fontWeight: 800 }}>
                  {gdpCounter.toFixed(1)}%
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', color: '#fbbf24', fontSize: 12, letterSpacing: 2, fontWeight: 700 }}>
                  PEAK GLOBAL SHARE
                </div>
              </div>
            </div>

            {/* 5 Animated 3D Pillars */}
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: 350, marginTop: 35, borderBottom: '2px solid rgba(255,255,255,0.18)', paddingBottom: 12 }}>
              {GDP_BARS.map((bar, idx) => {
                const isLast = idx === 4;
                const startF = isLast ? 245 : 138 + idx * 14;
                const grow = spring({ frame: Math.max(0, frame - startF), fps, config: { damping: 14, stiffness: 90 } });
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 115 }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', color: isLast ? '#f87171' : '#fde047', fontSize: 20, fontWeight: 800, marginBottom: 10, opacity: grow }}>
                      {bar.share}
                    </div>
                    <div
                      style={{
                        width: 78,
                        height: bar.h * grow,
                        background: isLast
                          ? 'linear-gradient(180deg, #ef4444 0%, #7f1d1d 100%)'
                          : 'linear-gradient(180deg, #fde047 0%, #b45309 100%)',
                        boxShadow: isLast
                          ? '0 0 28px rgba(239, 68, 68, 0.5)'
                          : '0 0 28px rgba(251, 191, 36, 0.35)',
                        borderTop: '3px solid #ffffff',
                      }}
                    />
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#cbd5e1', fontSize: 15, fontWeight: 700, marginTop: 14 }}>
                      {bar.year}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: MagnatesMedia Frosted Intelligence Dossier */}
          <div
            style={{
              position: 'absolute',
              right: 105,
              bottom: 185,
              width: 730,
              height: 540,
              background: 'linear-gradient(145deg, rgba(20, 24, 33, 0.92) 0%, rgba(10, 12, 17, 0.96) 100%)',
              borderLeft: `6px solid ${crisisAlert > 0.5 ? '#ef4444' : '#fbbf24'}`,
              borderTop: '1px solid rgba(255,255,255,0.14)',
              borderRight: '1px solid rgba(255,255,255,0.14)',
              borderBottom: '1px solid rgba(255,255,255,0.14)',
              padding: '38px 42px',
              boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
              transform: `translateX(${(1 - cardSlide) * 90}px) rotateY(-8deg)`,
            }}
          >
            <div style={{ fontFamily: 'JetBrains Mono, monospace', color: crisisAlert > 0.5 ? '#f87171' : '#fbbf24', fontSize: 15, letterSpacing: 4, fontWeight: 800 }}>
              {crisisAlert > 0.5 ? '▲ COLONIAL DEINDUSTRIALIZATION (1757–1947)' : '● MANUFACTURING & BULLION SINK'}
            </div>

            <div style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: 40, fontWeight: 800, marginTop: 12, lineHeight: 1.18 }}>
              {crisisAlert > 0.5 ? 'THE GREAT ECONOMIC COLLAPSE' : 'THE WORLD’S WORKSHOP'}
            </div>

            <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#fde68a', fontSize: 23, fontWeight: 700, marginTop: 10 }}>
              {crisisAlert > 0.5
                ? '1757 के बाद नीतिगत लूट से वैश्विक हिस्सेदारी 24% से गिरकर 4% रह गई'
                : 'सदियों तक दुनिया का सोना और चांदी भारतीय वस्त्र व मसालों के बदले यहाँ आता रहा'}
            </div>

            <div style={{ width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.15)', margin: '26px 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '18px 20px', borderLeft: '3px solid #fbbf24' }}>
                <div style={{ fontFamily: 'Inter, sans-serif', color: '#94a3b8', fontSize: 13, letterSpacing: 2, fontWeight: 700 }}>TEXTILE EXPORTS</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#ffffff', fontSize: 26, fontWeight: 800, marginTop: 6 }}>25% GLOBAL</div>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '18px 20px', borderLeft: '3px solid #38bdf8' }}>
                <div style={{ fontFamily: 'Inter, sans-serif', color: '#94a3b8', fontSize: 13, letterSpacing: 2, fontWeight: 700 }}>BULLION INFLOW</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#ffffff', fontSize: 26, fontWeight: 800, marginTop: 6 }}>+180 TONS/YR</div>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* 21:9 Cinema Letterbox Bars */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 118, backgroundColor: '#000', zIndex: 10 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 118, backgroundColor: '#000', zIndex: 10 }} />
    </AbsoluteFill>
  );
};
            
