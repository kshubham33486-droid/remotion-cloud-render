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

// Clean Multi-Stage Documentary Sound Design (Space Drone + Dive Swell + Highlight Pings + Cave Echo)
function createCinematicSfxWav(durationSec: number, sampleRate = 22050): string {
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

    // 1. Deep warm cinematic sub-bass drone (D1 + A1 + D2)
    const drone =
      Math.sin(2 * Math.PI * 36.71 * t) * 0.2 +
      Math.sin(2 * Math.PI * 55.0 * t) * 0.11 +
      Math.sin(2 * Math.PI * 73.42 * t) * 0.06;

    // 2. Smooth low-frequency orbital dive swell (3.2s - 6.0s)
    let diveSwell = 0;
    if (t >= 3.2 && t <= 6.0) {
      const st = (t - 3.2) / 2.8;
      const env = Math.sin(Math.PI * st);
      diveSwell = Math.sin(2 * Math.PI * (42 + st * 58) * t) * env * 0.2;
    }

    // 3. Highlight Chime #1: Madhya Pradesh Geography Lock (6.2s)
    let highlight1 = 0;
    if (t >= 6.2 && t <= 7.8) {
      const pt = t - 6.2;
      highlight1 += Math.sin(2 * Math.PI * 587.33 * pt) * Math.exp(-pt * 4.5) * 0.22; // D5
      highlight1 += Math.sin(2 * Math.PI * 880.0 * pt) * Math.exp(-pt * 6.0) * 0.12; // A5
    }

    // 4. Highlight Ping #2: Bhimbetka GPS Beacon Impact (8.8s)
    let highlight2 = 0;
    if (t >= 8.8 && t <= 10.6) {
      const pt = t - 8.8;
      highlight2 += Math.sin(2 * Math.PI * 987.77 * pt) * Math.exp(-pt * 5.0) * 0.26; // B5 sonar
      highlight2 += Math.sin(2 * Math.PI * 1479.98 * pt) * Math.exp(-pt * 8.0) * 0.1; // F#6 shimmer
      highlight2 += Math.sin(2 * Math.PI * (80 * Math.exp(-pt * 7) + 34) * pt) * Math.exp(-pt * 6) * 0.34; // Sub thud
    }

    // 5. Cave Entry Resonant Atmospheric Chord (11.2s - 15.0s)
    let caveChord = 0;
    if (t >= 11.2) {
      const ct = t - 11.2;
      const cEnv = Math.min(1, ct / 0.8);
      caveChord += Math.sin(2 * Math.PI * 146.83 * t) * cEnv * 0.11; // D3
      caveChord += Math.sin(2 * Math.PI * 220.0 * t) * cEnv * 0.09; // A3
      caveChord += Math.sin(2 * Math.PI * 293.66 * t) * cEnv * 0.06; // D4
    }

    const masterEnv = Math.min(1, t / 0.5) * Math.min(1, (durationSec - t) / 0.6);
    const sample = Math.max(-1, Math.min(1, (drone + diveSwell + highlight1 + highlight2 + caveChord) * masterEnv));
    view.setInt16(44 + i * 2, sample * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return 'data:audio/wav;base64,' + btoa(bin);
}

// High-Res Satellite + Shaded Physical Relief Tile Grid
const TerrainTileGrid: React.FC<{
  zoom: number;
  centerX: number;
  centerY: number;
  opacity: number;
  scale: number;
  showRelief?: boolean;
}> = ({ zoom, centerX, centerY, opacity, scale, showRelief = false }) => {
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
          <div key={`${zoom}-${dx}-${dy}`} style={{ position: 'relative', width: 256, height: 256 }}>
            <Img
              src={`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${centerY + dy}/${centerX + dx}`}
              style={{ width: 256, height: 256, display: 'block', objectFit: 'cover' }}
            />
            {showRelief && (
              <Img
                src={`https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/${zoom}/${centerY + dy}/${centerX + dx}`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: 256,
                  height: 256,
                  opacity: 0.34,
                  mixBlendMode: 'multiply',
                }}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
};

// Geographic Boundary of Madhya Pradesh aligned to Zoom-8 Tile Grid
const MP_GEO_POLYGON =
  'M 218 395 L 252 355 L 295 340 L 332 305 L 368 275 L 392 295 L 382 338 L 415 348 L 468 342 L 518 358 L 542 385 L 515 415 L 485 432 L 452 452 L 395 458 L 345 462 L 298 448 L 245 432 Z';

// Pre-generated Starfield coordinates for Space Globe Scene
const STARS = Array.from({ length: 75 }, (_, i) => ({
  x: ((i * 197) % 1920),
  y: ((i * 313) % 1080),
  size: (i % 3) + 1.2,
  opacity: 0.35 + (i % 5) * 0.13,
}));

// Floating Dust Motes inside Cave Scene
const DUST_MOTES = Array.from({ length: 28 }, (_, i) => ({
  x: 320 + ((i * 173) % 1280),
  y: 220 + ((i * 139) % 640),
  size: 2 + (i % 4),
  speed: 0.4 + (i % 5) * 0.15,
}));

export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const sfxSrc = useMemo(() => createCinematicSfxWav(durationInFrames / fps), [durationInFrames, fps]);

  // =========================================================================
  // PHASE 1 (0 - 115f / 0s - 3.8s): 3D EARTH GLOBE IN SPACE -> INDIA FOCUS
  // =========================================================================
  const globeProgress = interpolate(frame, [0, 115], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const globeScale = interpolate(globeProgress, [0, 0.65, 1], [0.78, 1.15, 2.75]);
  const globeRotOffset = interpolate(globeProgress, [0, 1], [-55, 0]);
  const globeOpacity = interpolate(frame, [88, 118], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // =========================================================================
  // PHASE 2 & 3 (90 - 345f / 3.0s - 11.5s): TERRAIN DIVE -> MP -> BHIMBETKA
  // =========================================================================
  const terrainDive = interpolate(frame, [95, 265], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const tilt3D = interpolate(terrainDive, [0, 1], [0, 28]);
  const panLeftForCard = interpolate(frame, [250, 285], [0, -280], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Multi-Zoom Satellite + Physical Relief Crossfades
  const z5Scale = interpolate(terrainDive, [0, 0.45], [1.4, 4.6], { extrapolateRight: 'clamp' });
  const z5Opacity = interpolate(frame, [88, 108, 155, 180], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const z8Scale = interpolate(terrainDive, [0.3, 0.85], [0.75, 3.3], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const z8Opacity = interpolate(terrainDive, [0.28, 0.44, 0.72, 0.88], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const z11Scale = interpolate(terrainDive, [0.7, 1], [0.58, 1.55], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const z11Opacity = interpolate(terrainDive, [0.7, 0.86], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Madhya Pradesh Physical Geography Highlight (Frames 175 - 265)
  const mpHighlightOpacity = interpolate(frame, [175, 195, 248, 270], [0, 1, 1, 0.25], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Bhimbetka GPS Pin Drop & Sonar Pulse (Frames 260 - 345)
  const pinSpring = spring({
    frame: Math.max(0, frame - 260),
    fps,
    config: { damping: 12, stiffness: 140 },
  });
  const pinDropY = interpolate(pinSpring, [0, 1], [-85, 0]);
  const pulseLoop = ((frame - 262) % 38) / 38;
  const pulseRadius = frame >= 262 ? interpolate(pulseLoop, [0, 1], [10, 115]) : 0;
  const pulseOpacity = frame >= 262 ? interpolate(pulseLoop, [0, 0.65, 1], [0.9, 0.35, 0]) : 0;

  // =========================================================================
  // PHASE 4 (335 - 450f / 11.2s - 15.0s): 3D CAMERA DIVE INSIDE THE CAVE
  // =========================================================================
  const caveEntry = interpolate(frame, [335, 450], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  // Terrain plunges forward into the cave mouth
  const terrainDiveIntoCaveScale = interpolate(frame, [330, 365], [1, 3.8], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
  const terrainFadeOut = interpolate(frame, [335, 360], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 3D Parallax Cave Layers (Outer Arch -> Mid Rock Cavern -> Inner Painted Wall)
  const caveOpacity = interpolate(frame, [338, 360], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const outerArchScale = interpolate(caveEntry, [0, 1], [1.0, 2.35]);
  const midCavernScale = interpolate(caveEntry, [0, 1], [0.92, 1.55]);
  const innerWallScale = interpolate(caveEntry, [0, 1], [0.88, 1.18]);

  // Ochre Cave Paintings Illumination (Frames 372+)
  const rockArtGlow = interpolate(frame, [368, 405], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // =========================================================================
  // DYNAMIC ENGLISH HUD & TELEMETRY CALLOUTS
  // =========================================================================
  // HUD 1: Space Globe -> India (Frames 12 - 98)
  const hud1Opacity = interpolate(frame, [12, 26, 84, 98], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // HUD 2: Madhya Pradesh Physical Geography (Frames 180 - 252)
  const hud2Opacity = interpolate(frame, [180, 195, 238, 252], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // HUD 3: Bhimbetka Target Card (Frames 266 - 340)
  const hud3Spring = spring({
    frame: Math.max(0, frame - 266),
    fps,
    config: { damping: 15, stiffness: 100 },
  });
  const hud3X = interpolate(hud3Spring, [0, 1], [90, 0]);
  const hud3Opacity = interpolate(frame, [266, 280, 328, 342], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // HUD 4: Inside Cave Final Title (Frames 382 - 445)
  const hud4Opacity = interpolate(frame, [382, 402], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const hud4Y = interpolate(frame, [382, 405], [24, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#02040a', overflow: 'hidden' }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Inter:wght@400;600;700&display=swap');`}
      </style>

      <Audio src={sfxSrc} volume={0.95} />

      {/* =====================================================================
          LAYER A: 3D SPACE GLOBE SCENE (0s - 3.9s)
         ===================================================================== */}
      {globeOpacity > 0.01 && (
        <AbsoluteFill style={{ opacity: globeOpacity, backgroundColor: '#020409' }}>
          {/* Deep Space Starfield */}
          {STARS.map((s, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: s.x,
                top: s.y,
                width: s.size,
                height: s.size,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                opacity: s.opacity,
              }}
            />
          ))}

          {/* Orbital Blue Atmospheric Backglow */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 780,
              height: 780,
              transform: `translate(-50%, -50%) scale(${globeScale})`,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(56, 189, 248, 0.32) 52%, rgba(14, 165, 233, 0.12) 66%, transparent 74%)',
            }}
          />

          {/* 3D Earth Sphere */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 640,
              height: 640,
              transform: `translate(-50%, -50%) scale(${globeScale})`,
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow:
                'inset -55px -35px 95px rgba(0, 0, 0, 0.92), inset 18px 18px 45px rgba(125, 211, 252, 0.45), 0 0 55px rgba(56, 189, 248, 0.35)',
              border: '1.5px solid rgba(125, 211, 252, 0.4)',
            }}
          >
            {/* Satellite Hemisphere Centered on India (Zoom 3, Center x=5, y=3) */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 768,
                height: 768,
                transform: `translate(calc(-50% + ${globeRotOffset}px), -50%) scale(1.18)`,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 256px)',
                gridTemplateRows: 'repeat(3, 256px)',
                filter: 'contrast(1.15) saturate(1.25)',
              }}
            >
              {[-1, 0, 1].map((dy) =>
                [-1, 0, 1].map((dx) => (
                  <Img
                    key={`globe-${dx}-${dy}`}
                    src={`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/3/${3 + dy}/${5 + dx}`}
                    style={{ width: 256, height: 256, display: 'block', objectFit: 'cover' }}
                  />
                ))
              )}
            </div>

            {/* Spherical Latitude/Longitude Holographic Wireframe */}
            <svg viewBox="0 0 640 640" style={{ position: 'absolute', inset: 0, opacity: 0.25 }}>
              <ellipse cx="320" cy="320" rx="318" ry="110" fill="none" stroke="#7dd3fc" strokeWidth="1" />
              <ellipse cx="320" cy="320" rx="318" ry="220" fill="none" stroke="#7dd3fc" strokeWidth="1" />
              <ellipse cx="320" cy="320" rx="130" ry="318" fill="none" stroke="#7dd3fc" strokeWidth="1" />
              <ellipse cx="320" cy="320" rx="245" ry="318" fill="none" stroke="#7dd3fc" strokeWidth="1" />
            </svg>

            {/* 3D Day/Night Terminator Shadow */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(circle at 34% 36%, transparent 38%, rgba(2, 6, 23, 0.85) 86%)',
              }}
            />
          </div>
        </AbsoluteFill>
      )}

      {/* =====================================================================
          LAYER B: 3D PHYSICAL GEOGRAPHY & TERRAIN DIVE (3.0s - 11.8s)
         ===================================================================== */}
      {terrainFadeOut > 0.01 && frame >= 85 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            perspective: '1200px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: terrainFadeOut,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 1920,
              height: 1080,
              transform: `translateX(${panLeftForCard}px) scale(${terrainDiveIntoCaveScale}) rotateX(${tilt3D}deg)`,
              transformStyle: 'preserve-3d',
              filter: 'contrast(1.16) saturate(1.18) brightness(0.9)',
            }}
          >
            {/* Zoom 5: Indian Subcontinent */}
            <TerrainTileGrid zoom={5} centerX={22} centerY={13} opacity={z5Opacity} scale={z5Scale} showRelief />

            {/* Zoom 8: Madhya Pradesh Physical Topography (Vindhya & Satpura Ranges) */}
            <TerrainTileGrid zoom={8} centerX={183} centerY={111} opacity={z8Opacity} scale={z8Scale} showRelief />

            {/* Madhya Pradesh Highlighted Physical Region */}
            {mpHighlightOpacity > 0.01 && (
              <svg
                viewBox="0 0 768 768"
                style={{
                  position: 'absolute',
                  width: 768,
                  height: 768,
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) scale(${z8Scale})`,
                  opacity: mpHighlightOpacity,
                  overflow: 'visible',
                }}
              >
                <defs>
                  <filter id="mpGoldGlow" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path
                  d={MP_GEO_POLYGON}
                  fill="rgba(245, 158, 11, 0.20)"
                  stroke="#fbbf24"
                  strokeWidth="2.4"
                  filter="url(#mpGoldGlow)"
                  strokeLinejoin="round"
                />
                {/* Topographic Elevation Contour Rings */}
                <circle cx="384" cy="384" r="55" fill="none" stroke="#fde68a" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="384" cy="384" r="95" fill="none" stroke="rgba(251,191,36,0.55)" strokeWidth="0.9" />
              </svg>
            )}

            {/* Zoom 11: Raisen Vindhya Sandstone Hills */}
            <TerrainTileGrid zoom={11} centerX={1465} centerY={891} opacity={z11Opacity} scale={z11Scale} showRelief />

            {/* Bhimbetka GPS Beacon & Sonar Pulse */}
            {frame >= 260 && (
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
                <circle cx="0" cy="0" r={pulseRadius} fill="none" stroke="#fbbf24" strokeWidth="2.5" opacity={pulseOpacity} />
                <circle cx="0" cy="0" r={pulseRadius * 0.6} fill="none" stroke="#ef4444" strokeWidth="1.5" opacity={pulseOpacity * 0.8} />
                <circle cx="0" cy="0" r="24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeDasharray="8 6" />
                <circle cx="0" cy="0" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                <g transform={`translate(0, ${pinDropY}) scale(${pinSpring})`}>
                  <path d="M 0 -8 L -18 -42 A 20 20 0 1 1 18 -42 Z" 
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
    )}

    {caveOpacity > 0.01 && (
      <AbsoluteFill style={{ opacity: caveOpacity, backgroundColor: '#0c0806', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            inset: -80,
            transform: `scale(${innerWallScale})`,
            background:
              'radial-gradient(circle at 50% 48%, #452715 0%, #26140a 52%, #0d0704 100%)',
          }}
        >
          <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%' }}>
            <defs>
              <filter id="stoneRoughness">
                <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed="7" result="noise" />
                <feColorMatrix
                  type="matrix"
                  values="0.35 0 0 0 0.14  0 0.22 0 0 0.08  0 0 0.12 0 0.04  0 0 0 0.45 0"
                />
              </filter>
              <filter id="ochreGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="sunBeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(253, 224, 71, 0.28)" />
                <stop offset="65%" stopColor="rgba(245, 158, 11, 0.07)" />
                <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
              </linearGradient>
            </defs>

            <rect width="1920" height="1080" filter="url(#stoneRoughness)" />

            <polygon points="480,100 920,100 1420,960 680,960" fill="url(#sunBeamGrad)" />
            <polygon points="780,100 1120,100 1650,960 1080,960" fill="url(#sunBeamGrad)" opacity="0.7" />

            <g
              opacity={rockArtGlow}
              filter="url(#ochreGlow)"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              <g transform="translate(640, 440) scale(1.45)">
                <path
                  d="M 10 55 L 45 30 L 115 28 L 145 48 L 125 75 L 45 75 Z"
                  stroke="#f8fafc"
                  strokeWidth="4.5"
                />
                <line x1="55" y1="30" x2="75" y2="75" stroke="#ef4444" strokeWidth="3.5" />
                <line x1="85" y1="29" x2="105" y2="75" stroke="#ef4444" strokeWidth="3.5" />
                <path d="M 145 48 Q 165 20 155 5 M 140 44 Q 152 18 140 8" stroke="#f8fafc" strokeWidth="3.5" />
                <path d="M 45 75 L 35 115 M 65 75 L 62 115 M 112 75 L 115 115 M 128 75 L 138 115" stroke="#f8fafc" strokeWidth="4" />
              </g>

              <g transform="translate(1030, 430) scale(1.4)">
                <circle cx="40" cy="22" r="11" stroke="#fbbf24" strokeWidth="4" />
                <polygon points="40,35 20,72 60,72" stroke="#f8fafc" strokeWidth="4" />
                <polygon points="40,72 22,108 58,108" stroke="#ef4444" strokeWidth="4" />
                <path d="M 28 48 L 5 35 M 52 48 L 80 35" stroke="#f8fafc" strokeWidth="4" />
                <line x1="82" y1="8" x2="76" y2="122" stroke="#fbbf24" strokeWidth="3.5" />
              </g>

              <g transform="translate(1240, 460) scale(1.2)">
                <circle cx="45" cy="45" r="34" stroke="#ef4444" strokeWidth="4" />
                <circle cx="45" cy="45" r="14" stroke="#f8fafc" strokeWidth="3" />
                <line x1="45" y1="5" x2="45" y2="85" stroke="#f8fafc" strokeWidth="2.5" />
                <line x1="5" y1="45" x2="85" y2="45" stroke="#f8fafc" strokeWidth="2.5" />
              </g>
            </g>
          </svg>
        </div>

        {DUST_MOTES.map((m, idx) => {
          const driftY = (frame - 335) * m.speed;
          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: m.x,
                top: m.y - driftY,
                width: m.size,
                height: m.size,
                borderRadius: '50%',
                backgroundColor: '#fde047',
                opacity: 0.45 * rockArtGlow,
                boxShadow: '0 0 8px #fbbf24',
              }}
            />
          );
        })}

        <svg
          viewBox="0 0 1920 1080"
          style={{
            position: 'absolute',
            inset: 0,
            transform: `scale(${midCavernScale})`,
            pointerEvents: 'none',
          }}
        >
          <path
            d="M 0 0 L 1920 0 L 1920 1080 L 0 1080 Z M 260 960 Q 240 520 490 250 Q 960 95 1440 260 Q 1690 540 1660 960 Z"
            fill="#170d07"
            fillRule="evenodd"
            opacity="0.92"
          />
        </svg>

        <svg
          viewBox="0 0 1920 1080"
          style={{
            position: 'absolute',
            inset: 0,
            transform: `scale(${outerArchScale})`,
            pointerEvents: 'none',
          }}
        >
          <path
            d="M 0 0 L 1920 0 L 1920 1080 L 0 1080 Z M 430 960 Q 410 560 620 330 Q 960 180 1310 340 Q 1510 570 1490 960 Z"
            fill="#070402"
            fillRule="evenodd"
          />
        </svg>
      </AbsoluteFill>
    )}

    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at 50% 50%, transparent 46%, rgba(2, 4, 10, 0.88) 100%)',
        pointerEvents: 'none',
      }}
    />

    <div
      style={{
        position: 'absolute',
        top: 155,
        left: 105,
        opacity: hud1Opacity,
        zIndex: 6,
        textShadow: '0 6px 24px rgba(0,0,0,0.95)',
      }}
    >
      <div style={{ fontFamily: 'Inter, sans-serif', color: '#38bdf8', fontSize: 17, letterSpacing: 6, fontWeight: 700 }}>
        ORBITAL RECON • 22.9395° N, 77.6125° E
      </div>
      <div style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: 56, letterSpacing: 5, fontWeight: 800, marginTop: 6 }}>
        INDIAN SUBCONTINENT
      </div>
    </div>

    <div
      style={{
        position: 'absolute',
        top: 155,
        left: 105,
        opacity: hud2Opacity,
        zIndex: 6,
        textShadow: '0 6px 24px rgba(0,0,0,0.95)',
      }}
    >
      <div style={{ fontFamily: 'Inter, sans-serif', color: '#fbbf24', fontSize: 17, letterSpacing: 6, fontWeight: 700 }}>
        PHYSICAL GEOGRAPHY • VINDHYA RANGE
      </div>
      <div style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: 52, letterSpacing: 4, fontWeight: 800, marginTop: 6 }}>
        MADHYA PRADESH
      </div>
      <div style={{ fontFamily: 'Inter, sans-serif', color: '#cbd5e1', fontSize: 20, letterSpacing: 2, marginTop: 6 }}>
        Central Indian Highlands • Sandstone Escarpment
      </div>
    </div>

    <div
      style={{
        position: 'absolute',
        right: 95,
        top: '50%',
        transform: `translate(${hud3X}px, -50%)`,
        opacity: hud3Opacity,
        width: 650,
        background: 'linear-gradient(135deg, rgba(10, 15, 26, 0.92) 0%, rgba(17, 24, 39, 0.88) 100%)',
        borderLeft: '5px solid #fbbf24',
        borderTop: '1px solid rgba(251, 191, 36, 0.35)',
        borderRight: '1px solid rgba(255, 255, 255, 0.12)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        padding: '32px 38px',
        boxShadow: '0 30px 70px rgba(0, 0, 0, 0.85)',
        zIndex: 6,
      }}
    >
      <div style={{ fontFamily: 'Inter, sans-serif', color: '#ef4444', fontSize: 15, letterSpacing: 4.5, fontWeight: 700, marginBottom: 10 }}>
        ● UNESCO WORLD HERITAGE • RAISEN, MP
      </div>
      <div style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: 42, fontWeight: 800, letterSpacing: 1.5, lineHeight: 1.15 }}>
        BHIMBETKA ROCK SHELTERS
      </div>
      <div style={{ width: '100%', height: 1, backgroundColor: 'rgba(251, 191, 36, 0.3)', margin: '20px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter, sans-serif' }}>
        <div>
          <div style={{ color: '#94a3b8', fontSize: 13, letterSpacing: 3, fontWeight: 600 }}>ARCHAEOLOGICAL ERA</div>
          <div style={{ color: '#f8fafc', fontSize: 19, fontWeight: 700, marginTop: 5 }}>30,000+ Years (Paleolithic)</div>
        </div>
        <div>
          <div style={{ color: '#94a3b8', fontSize: 13, letterSpacing: 3, fontWeight: 600 }}>COORDINATES</div>
          <div style={{ color: '#f8fafc', fontSize: 19, fontWeight: 700, marginTop: 5 }}>22.9395° N, 77.6125° E</div>
        </div>
      </div>
    </div>

    <div
      style={{
        position: 'absolute',
        bottom: 165,
        left: 110,
        opacity: hud4Opacity,
        transform: `translateY(${hud4Y}px)`,
        zIndex: 6,
        textShadow: '0 6px 28px rgba(0,0,0,0.95)',
      }}
    >
      <div style={{ fontFamily: 'Inter, sans-serif', color: '#fbbf24', fontSize: 16, letterSpacing: 6, fontWeight: 700 }}>
        PREHISTORIC CAVE GALLERY • PALEOLITHIC ART
      </div>
      <div style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: 48, letterSpacing: 4, fontWeight: 800, marginTop: 6 }}>
        BHIMBETKA CAVES
      </div>
    </div>

    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 118, backgroundColor: '#000000', zIndex: 10 }} />
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 118, backgroundColor: '#000000', zIndex: 10 }} />
  </AbsoluteFill>
  );
};
