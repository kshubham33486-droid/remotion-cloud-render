import React, { useMemo, useRef, useEffect } from 'react';
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';

function createRoyalMarchSfxWav(durationSec: number, sampleRate = 22050): string {
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

    // Deep Imperial Brass / Sub-Bass Drone (D1 + A1 + D2)
    const drone =
      Math.sin(2 * Math.PI * 36.71 * t) * 0.22 +
      Math.sin(2 * Math.PI * 55.0 * t) * 0.12 +
      Math.sin(2 * Math.PI * 73.42 * t) * 0.06;

    // Rhythmic War Drum / Heavy Hoofbeat Pulse every 0.85s
    const beatCycle = t % 0.85;
    let drum = 0;
    if (beatCycle < 0.25) {
      drum += Math.sin(2 * Math.PI * (68 * Math.exp(-beatCycle * 12) + 32) * beatCycle) * Math.exp(-beatCycle * 11) * 0.34;
    }
    if (beatCycle >= 0.22 && beatCycle < 0.42) {
      const b2 = beatCycle - 0.22;
      drum += Math.sin(2 * Math.PI * (58 * Math.exp(-b2 * 14) + 30) * b2) * Math.exp(-b2 * 13) * 0.22;
    }

    const masterEnv = Math.min(1, t / 0.4) * Math.min(1, (durationSec - t) / 0.6);
    const sample = Math.max(-1, Math.min(1, (drone + drum) * masterEnv));
    view.setInt16(44 + i * 2, sample * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return 'data:audio/wav;base64,' + btoa(bin);
}

// Removes dark studio background cleanly while keeping horse & golden armor 100% solid & vibrant
const SolidSubjectVideo: React.FC<{ src: string; style?: React.CSSProperties }> = ({ src, style }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onVideoFrame = useMemo(() => {
    return (frameSource: CanvasImageSource) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(frameSource, 0, 0, canvas.width, canvas.height);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        // Studio background is dark (#121216); subject pixels are brighter
        const maxCh = Math.max(r, g, b);
        if (maxCh < 28) {
          d[i + 3] = 0;
        } else if (maxCh < 44) {
          d[i + 3] = Math.round(((maxCh - 28) / 16) * 255);
        }
      }
      ctx.putImageData(imgData, 0, 0);
    };
  }, []);

  return (
    <div style={{ position: 'relative', ...style }}>
      <OffthreadVideo
        src={src}
        muted
        onVideoFrame={onVideoFrame}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={640}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: 'contrast(1.12) saturate(1.18) drop-shadow(0 18px 28px rgba(0, 0, 0, 0.85))',
        }}
      />
    </div>
  );
};
const DUST = Array.from({ length: 35 }, (_, i) => ({
  x: 100 + ((i * 211) % 1720),
  y: 220 + ((i * 157) % 620),
  size: 2.5 + (i % 4),
  speed: 0.4 + (i % 5) * 0.14,
}));

export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const sfxSrc = useMemo(() => createRoyalMarchSfxWav(durationInFrames / fps), [durationInFrames, fps]);

  // Smooth Camera & Horse Advancement toward the Grand Palace (Left -> Center-Right)
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    easing: Easing.inOut(Easing.quad),
  });

  const horseX = interpolate(progress, [0, 1], [360, 790]);
  const horseScale = interpolate(progress, [0, 1], [0.88, 1.06]);
  // Natural galloping / prancing vertical cadence
  const gallopBob = Math.abs(Math.sin(frame * 0.24)) * -14;
  const gallopTilt = Math.sin(frame * 0.24) * -2.2;

  // Parallax Palace & Horizon Motion
  const palaceScale = interpolate(progress, [0, 1], [0.95, 1.16]);
  const palaceX = interpolate(progress, [0, 1], [40, -35]);

  const titleOpacity = interpolate(frame, [18, 42, 255, 285], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Trims & loops the crisp right-facing side profile (frames 22 to 48) smoothly
  const trimCycle = 26;
  const localStep = frame % (trimCycle * 2);
  const pingPongFrame = localStep < trimCycle ? 22 + localStep : 22 + (trimCycle * 2 - localStep);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0c0805', overflow: 'hidden' }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Inter:wght@500;700&display=swap');`}
      </style>

      <Audio src={sfxSrc} volume={0.95} />

      {/* Golden Sunset Sky & Royal Haze */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, #160d08 0%, #3d2110 38%, #854d1e 68%, #261409 100%)',
        }}
      />

      {/* Glowing Sun / Horizon Aura behind the Grand Palace */}
      <div
        style={{
          position: 'absolute',
          right: 260,
          top: 230,
          width: 620,
          height: 620,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(253, 224, 71, 0.42) 0%, rgba(245, 158, 11, 0.14) 50%, transparent 72%)',
          transform: `scale(${palaceScale})`,
        }}
      />

      {/* GRAND IMPERIAL PALACE & FORTRESS SILHOUETTE (Right Side) */}
      <svg
        viewBox="0 0 1200 700"
        style={{
          position: 'absolute',
          right: -40,
          bottom: 155,
          width: 1180,
          height: 690,
          transform: `translateX(${palaceX}px) scale(${palaceScale})`,
          transformOrigin: 'bottom right',
        }}
      >
        <defs>
          <linearGradient id="palaceStone" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#452714" />
            <stop offset="55%" stopColor="#29160b" />
            <stop offset="100%" stopColor="#140a05" />
          </linearGradient>
          <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>

        {/* Distant Fortress Ramparts */}
        <path
          d="M 180 620 L 180 450 L 210 450 L 210 470 L 240 470 L 240 450 L 270 450 L 270 470 L 300 470 L 300 450 L 1180 450 L 1180 620 Z"
          fill="#1f1108"
        />

        {/* Main Grand Imperial Palace Structure */}
        <rect x="430" y="330" width="640" height="290" fill="url(#palaceStone)" stroke="url(#goldRim)" strokeWidth="1.5" />

        {/* Central Grand Onion Dome */}
        <path
          d="M 650 330 Q 640 230 750 175 Q 860 230 850 330 Z"
          fill="url(#palaceStone)"
          stroke="#fbbf24"
          strokeWidth="2"
        />
        {/* Golden Spire (Kalash) */}
        <line x1="750" y1="175" x2="750" y2="125" stroke="#fde047" strokeWidth="4" />
        <circle cx="750" cy="148" r="7" fill="#fde047" />

        {/* Left & Right Flanking Domes */}
        <path d="M 480 330 Q 475 265 545 230 Q 615 265 610 330 Z" fill="url(#palaceStone)" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="545" y1="230" x2="545" y2="195" stroke="#fde047" strokeWidth="3" />

        <path d="M 890 330 Q 885 265 955 230 Q 1025 265 1020 330 Z" fill="url(#palaceStone)" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="955" y1="230" x2="955" y2="195" stroke="#fde047" strokeWidth="3" />

        {/* Towering Minarets */}
        <rect x="385" y="235" width="32" height="385" fill="#26140a" stroke="#d97706" strokeWidth="1.2" />
        <path d="M 380 235 Q 401 195 422 235 Z" fill="#fbbf24" />

        <rect x="1085" y="235" width="32" height="385" fill="#26140a" stroke="#d97706" strokeWidth="1.2" />
        <path d="M 1080 235 Q 1101 195 1122 235 Z" fill="#fbbf24" />

        {/* Glowing Palace Arches & Torchlit Windows */}
        {[510, 610, 725, 840, 940].map((ax, idx) => (
          <path
            key={idx}
            d={`M ${ax} 560 L ${ax} 475 Q ${ax + 25} 445 ${ax + 50} 475 L ${ax + 50} 560 Z`}
            fill="rgba(251, 191, 36, 0.35)"
            stroke="#fbbf24"
            strokeWidth="1.5"
          />
        ))}

        {/* Grand Entrance Archway */}
        <path
          d="M 695 620 L 695 465 Q 750 415 805 465 L 805 620 Z"
          fill="rgba(253, 224, 71, 0.45)"
          stroke="#fde047"
          strokeWidth="2.5"
        />
      </svg>

      {/* Royal Sandstone Courtyard / Causeway Ground */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 118,
          height: 155,
          background: 'linear-gradient(180deg, #3b2010 0%, #1c0f07 100%)',
          borderTop: '2px solid rgba(251, 191, 36, 0.45)',
        }}
      />

      {/* Ground Shadow under Horse */}
      <div
        style={{
          position: 'absolute',
          left: horseX,
          bottom: 175,
          width: 420,
          height: 48,
          transform: 'translateX(-50%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,0,0,0.85) 0%, transparent 72%)',
        }}
      />

      {/* CRYSTAL-CLEAR SOLID 3D HORSE & RIDER ADVANCING TOWARD PALACE */}
      <div
        style={{
          position: 'absolute',
          left: horseX,
          top: '54%',
          width: 650,
          height: 650,
          transform: `translate(-50%, calc(-50% + ${gallopBob}px)) scale(${horseScale}) rotate(${gallopTilt}deg)`,
          zIndex: 5,
        }}
      >
        <SolidSubjectVideo
          src={`${staticFile('VID-20261110-WA0001.mp4')}#t=${(pingPongFrame / 30).toFixed(2)}`}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Floating Golden Dust Motes in Sunlight */}
      {DUST.map((d, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            left: d.x - frame * 0.4,
            top: d.y - frame * d.speed,
            width: d.size,
            height: d.size,
            borderRadius: '50%',
            backgroundColor: '#fde047',
            opacity: 0.48,
            boxShadow: '0 0 8px #f59e0b',
            pointerEvents: 'none',
            zIndex: 6,
          }}
        />
      ))}

      {/* Cinematic Top-Left Title */}
      <div
        style={{
          position: 'absolute',
          top: 155,
          left: 100,
          opacity: titleOpacity,
          zIndex: 7,
          textShadow: '0 6px 24px rgba(0,0,0,0.95)',
        }}
      >
        <div style={{ fontFamily: 'Inter, sans-serif', color: '#fbbf24', fontSize: 16, letterSpacing: 6, fontWeight: 700 }}>
          IMPERIAL MARCH • ROYAL CITADEL
        </div>
        <div style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: 50, letterSpacing: 3.5, fontWeight: 800, marginTop: 6 }}>
          THE SOVEREIGN&apos;S RETURN
        </div>
      </div>

      {/* 21:9 Cinema Letterbox Bars */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 118, backgroundColor: '#000000', zIndex: 10 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 118, backgroundColor: '#000000', zIndex: 10 }} />
    </AbsoluteFill>
  );
};
        
