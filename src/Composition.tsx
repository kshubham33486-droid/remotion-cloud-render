import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';

// Clean Studio Sub-Bass & Sonar Ping SFX (No harsh static noise)
function createCleanDocumentarySfx(durationSec: number, sampleRate = 22050): string {
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

    // Warm cinematic sub-bass pad (D1 + A1 harmonic)
    const pad =
      Math.sin(2 * Math.PI * 36.71 * t) * 0.22 +
      Math.sin(2 * Math.PI * 73.42 * t) * 0.1 +
      Math.sin(2 * Math.PI * 110.0 * t) * 0.04;

    // Smooth low-frequency air swell during camera dive (1.5s - 3.8s)
    let swell = 0;
    if (t >= 1.5 && t <= 3.8) {
      const st = (t - 1.5) / 2.3;
      const env = Math.sin(Math.PI * st);
      const sweepFreq = 45 + st * 55;
      swell = Math.sin(2 * Math.PI * sweepFreq * t) * env * 0.18;
    }

    // Crisp tactical sonar lock-on ping at 3.9s
    let ping = 0;
    if (t >= 3.9 && t <= 5.2) {
      const pt = t - 3.9;
      ping += Math.sin(2 * Math.PI * 987.77 * pt) * Math.exp(-pt * 5.5) * 0.28;
      ping += Math.sin(2 * Math.PI * 1975.53 * pt) * Math.exp(-pt * 9.0) * 0.09;
      // Deep impact thud on pin drop
      ping += Math.sin(2 * Math.PI * (85 * Math.exp(-pt * 8) + 35) * pt) * Math.exp(-pt * 7) * 0.35;
    }

    const masterEnv = Math.min(1, t / 0.5) * Math.min(1, (durationSec - t) / 0.6);
    const val = Math.max(-1, Math.min(1, (pad + swell + ping) * masterEnv));
    view.setInt16(44 + i * 2, val * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return 'data:audio/wav;base64,' + btoa(bin);
}

// Helper to build a crisp 3x3 Real Satellite Tile Grid centered on Bhimbetka (22.9395° N, 77.6125° E)
// At Zoom 5: Center tile (x=22, y=13) covers Central India
// At Zoom 8: Center tile (x=183, y=111) covers Madhya Pradesh / Raisen
// At Zoom 11: Center tile (x=1465, y=891) covers Vindhya Hills & Bhimbetka forest terrain
const SatelliteTileGrid: React.FC<{
  zoom: number;
  centerX: number;
  centerY: number;
  opacity: number;
  scale: number;
}> = ({ zoom, centerX, centerY, opacity, scale }) => {
  if (opacity <= 0.01) return null;
  const offsets = [-1, 0, 1];
  return (
    <div
      style={{
        position: 'absolute',
        width: 768,
        height: 768,
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 256px)',
        gridTemplateRows: 'repeat(3, 256px)',
        pointerEvents: 'none',
      }}
    >
      {offsets.map((dy) =>
        offsets.map((dx) => (
          <Img
            key={`${zoom}-${dx}-${dy}`}
            src={`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${centerY + dy}/${centerX + dx}`}
            style={{ width: 256, height: 256, display: 'block', objectFit: 'cover' }}
          />
        ))
      )}
    </div>
  );
};

// Accurate Geographic Polygon for Madhya Pradesh aligned to Zoom-8 Tile Grid (768x768)
const MP_GEO_POLYGON =
  'M 218 395 L 252 355 L 295 340 L 332 305 L 368 275 L 392 295 L 382 338 L 415 348 L 468 342 L 518 358 L 542 385 L 515 415 L 485 432 L 452 452 L 395 458 L 345 462 L 298 448 L 245 432 Z';

export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const sfxSrc = useMemo(() => createCleanDocumentarySfx(durationInFrames / fps), [durationInFrames, fps]);

  // Smooth Cinematic Camera Dive Curve (0 -> 1 across frames 25 to 125)
  const dive = interpolate(frame, [25, 125], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  // Subtle continuous forward drift after landing (frames 125 to 240)
  const hoverDrift = interpolate(frame, [125, 240], [1, 1.12], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 3D Unreal-Style Camera Tilt (flattens from top-down satellite to 28-deg tactical 3D perspective)
  const tiltAngle = interpolate(dive, [0, 1], [0, 26]);
  const panLeftForCard = interpolate(frame, [110, 145], [0, -290], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Multi-Resolution Satellite Layer Crossfades (Zero pixelation during deep zoom!)
  const z5Scale = interpolate(dive, [0, 0.55], [1.65, 5.2], { extrapolateRight: 'clamp' });
  const z5Opacity = interpolate(dive, [0.35, 0.55], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const z8Scale = interpolate(dive, [0.35, 0.85], [0.72, 3.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const z8Opacity = interpolate(dive, [0.35, 0.52, 0.72, 0.88], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const z11Scale = interpolate(dive, [0.7, 1], [0.55, 1.55], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * hoverDrift;
  const z11Opacity = interpolate(dive, [0.7, 0.86], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Madhya Pradesh Golden Vector Overlay Opacity (visible during mid-zoom)
  const mpBorderOpacity = interpolate(dive, [0.28, 0.45, 0.75, 0.9], [0, 0.95, 0.95, 0.25], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Phase 1 Title ("INDIA • CENTRAL SUBCONTINENT")
  const title1Opacity = interpolate(frame, [8, 24, 58, 74], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Target Lock-On Pin & Sonar Rings (Frame 116+)
  const pinSpring = spring({
    frame: Math.max(0, frame - 116),
    fps,
    config: { damping: 12, stiffness: 140 },
  });
  const pinDropY = interpolate(pinSpring, [0, 1], [-90, 0]);

  const pulseProgress = ((frame - 118) % 42) / 42;
  const pulseRadius = frame >= 118 ? interpolate(pulseProgress, [0, 1], [10, 115]) : 0;
  const pulseOpacity = frame >= 118 ? interpolate(pulseProgress, [0, 0.65, 1], [0.9, 0.35, 0]) : 0;

  // Documentary Glassmorphism Info Card (Frame 124+)
  const cardSpring = spring({
    frame: Math.max(0, frame - 124),
    fps,
    config: { damping: 16, stiffness: 95 },
  });
  const cardTranslateX = interpolate(cardSpring, [0, 1], [110, 0]);
  const cardOpacity = interpolate(frame, [124, 140], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#030508', overflow: 'hidden' }}>
      {/* Load Crisp Google Fonts for English Cinematic + Hindi Devanagari */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Inter:wght@400;600;700&family=Noto+Sans+Devanagari:wght@600;700&display=swap');`}
      </style>

      {/* Studio Sub-Bass & Sonar Lock-On Audio */}
      <Audio src={sfxSrc} volume={0.95} />

      {/* 3D Perspective Viewport */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          perspective: '1200px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 1920,
            height: 1080,
            transform: `translateX(${panLeftForCard}px) rotateX(${tiltAngle}deg)`,
            transformStyle: 'preserve-3d',
            filter: 'contrast(1.14) saturate(1.12) brightness(0.88)',
          }}
        >
          {/* Layer 1: All-India Satellite Terrain (Zoom 5) */}
          <SatelliteTileGrid zoom={5} centerX={22} centerY={13} opacity={z5Opacity} scale={z5Scale} />

          {/* Layer 2: Madhya Pradesh & Vindhya Hills Terrain (Zoom 8) */}
          <SatelliteTileGrid zoom={8} centerX={183} centerY={111} opacity={z8Opacity} scale={z8Scale} />

          {/* Madhya Pradesh Glowing Geographic Boundary */}
          {mpBorderOpacity > 0.01 && (
            <svg
              viewBox="0 0 768 768"
              style={{
                position: 'absolute',
                width: 768,
                height: 768,
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) scale(${z8Scale})`,
                opacity: mpBorderOpacity,
                overflow: 'visible',
              }}
            >
              <defs>
                <filter id="unrealGlow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d={MP_GEO_POLYGON}
                fill="rgba(245, 158, 11, 0.16)"
                stroke="#fbbf24"
                strokeWidth="2.2"
                filter="url(#unrealGlow)"
                strokeLinejoin="round"
              />
            </svg>
          )}

          {/* Layer 3: High-Res Raisen / Bhimbetka Forest & Rock Ridges (Zoom 11) */}
          <SatelliteTileGrid zoom={11} centerX={1465} centerY={891} opacity={z11Opacity} scale={z11Scale} />

          {/* Tactical Telemetry Grid Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: -300,
              backgroundImage:
                'linear-gradient(rgba(251, 191, 36, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(251, 191, 36, 0.07) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
              pointerEvents: 'none',
            }}
          />

          {/* Bhimbetka GPS Lock-On Marker (Centered on Terrain Target) */}
          {frame >= 116 && (
            <svg
              viewBox="-150 -150 300 300"
              style={{
                position: 'absolute',
                width: 300,
                height: 300,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                overflow: 'visible',
              }}
            >
              {/* Expanding Sonar Shockwave */}
              <circle
                cx="0"
                cy="0"
                r={pulseRadius}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2.5"
                opacity={pulseOpacity}
              />
              <circle
                cx="0"
                cy="0"
                r={pulseRadius * 0.6}
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.5"
                opacity={pulseOpacity * 0.8}
              />

              {/* Tactical Crosshair Reticle */}
              <circle cx="0" cy="0" r="24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeDasharray="8 6" />
              <line x1="-36" y1="0" x2="-14" y2="0" stroke="#fbbf24" strokeWidth="2" />
              <line x1="14" y1="0" x2="36" y2="0" stroke="#fbbf24" strokeWidth="2" />
              <line x1="0" y1="-36" x2="0" y2="-14" stroke="#fbbf24" strokeWidth="2" />
              <line x1="0" y1="14" x2="0" y2="36" stroke="#fbbf24" strokeWidth="2" />

              {/* Center Beacon Dot */}
              <circle cx="0" cy="0" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />

              {/* 3D Drop Pin */}
              <g transform={`translate(0, ${pinDropY}) scale(${pinSpring})`}>
                <path
                  d="M 0 -8 L -18 -42 A 20 20 0 1 1 18 -42 Z"
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
                <circle cx="0" cy="-42" r="7" fill="#ffffff" />
              </g>
            </svg>
          )}
        </div>
      </div>

      {/* Atmospheric Edge Vignette & Sunlight Haze (Unreal Engine Post-Process Feel) */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 45% 50%, transparent 45%, rgba(2, 4, 10, 0.88) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Opening Cinematic Title: INDIA -> MADHYA PRADESH */}
      <div
        style={{
          position: 'absolute',
          top: 165,
          left: 110,
          opacity: title1Opacity,
          zIndex: 6,
          textShadow: '0 6px 24px rgba(0,0,0,0.9)',
        }}
      >
        <div style={{ fontFamily: 'Inter, sans-serif', color: '#fbbf24', fontSize: 18, letterSpacing: 7, fontWeight: 700 }}>
          SATELLITE RECON • 22.9395° N
        </div>
        <div style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: 58, letterSpacing: 5, fontWeight: 800, marginTop: 6 }}>
          INDIA
        </div>
      </div>

      {/* Right-Side Clean Glassmorphism Documentary Card (Zero Overlap with Map) */}
      <div
        style={{
          position: 'absolute',
          right: 95,
          top: '50%',
          transform: `translate(${cardTranslateX}px, -50%)`,
          opacity: cardOpacity,
          width: 670,
          background: 'linear-gradient(135deg, rgba(10, 15, 26, 0.92) 0%, rgba(17, 24, 39, 0.86) 100%)',
          backdropFilter: 'blur(14px)',
          borderLeft: '5px solid #fbbf24',
          borderTop: '1px solid rgba(251, 191, 36, 0.35)',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '34px 40px',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.85)',
          zIndex: 6,
        }}
      >
        <div style={{ fontFamily: 'Inter, sans-serif', color: '#ef4444', fontSize: 16, letterSpacing: 4.5, fontWeight: 700, marginBottom: 10 }}>
          ● UNESCO WORLD HERITAGE • RAISEN, MP
        </div>

        <div style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: 44, fontWeight: 800, letterSpacing: 1.5, lineHeight: 1.15 }}>
          BHIMBETKA CAVES
        </div>

        <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#fbbf24', fontSize: 28, fontWeight: 700, marginTop: 8 }}>
          भीमबेटका शैलाश्रय (मध्य प्रदेश)
        </div>

        <div style={{ width: '100%', height: 1, backgroundColor: 'rgba(251, 191, 36, 0.3)', margin: '22px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter, sans-serif' }}>
          <div>
            <div style={{ color: '#94a3b8', fontSize: 13, letterSpacing: 3, fontWeight: 600 }}>ARCHAEOLOGICAL ERA</div>
            <div style={{ color: '#f8fafc', fontSize: 20, fontWeight: 700, marginTop: 5 }}>30,000+ Years (Paleolithic)</div>
          </div>
          <div>
            <div style={{ color: '#94a3b8', fontSize: 13, letterSpacing: 3, fontWeight: 600 }}>GPS TELEMETRY</div>
            <div style={{ color: '#f8fafc', fontSize: 20, fontWeight: 700, marginTop: 5 }}>22.9395° N, 77.6125° E</div>
          </div>
        </div>
      </div>

      {/* 21:9 Cinema Letterbox Bars */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 118, backgroundColor: '#000000', zIndex: 10 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 118, backgroundColor: '#000000', zIndex: 10 }} />
    </AbsoluteFill>
  );
};
                
