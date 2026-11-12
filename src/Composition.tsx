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

function createCharvakaSfxWav(durationSec: number, sampleRate = 22050): string {
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

    const drone =
      Math.sin(2 * Math.PI * 34.65 * t) * 0.2 +
      Math.sin(2 * Math.PI * 51.91 * t) * 0.11 +
      Math.sin(2 * Math.PI * 69.3 * t) * 0.06;

    let pillarThuds = 0;
    const hitTimes = [5.2, 6.2, 7.2];
    const hitNotes = [277.18, 329.63, 415.3];
    hitTimes.forEach((ht, idx) => {
      if (t >= ht && t <= ht + 1.5) {
        const pt = t - ht;
        pillarThuds += Math.sin(2 * Math.PI * (75 * Math.exp(-pt * 7) + 32) * pt) * Math.exp(-pt * 5.5) * 0.32;
        pillarThuds += Math.sin(2 * Math.PI * hitNotes[idx] * pt) * Math.exp(-pt * 4.0) * 0.14;
      }
    });

    let windShimmer = 0;
    if (t >= 10.2) {
      const wt = t - 10.2;
      const wEnv = Math.sin(Math.min(1, wt / 4.5) * Math.PI * 0.85);
      windShimmer =
        (Math.sin(2 * Math.PI * 554.37 * t) * 0.06 +
          Math.sin(2 * Math.PI * 659.25 * t) * 0.05 +
          Math.sin(2 * Math.PI * 830.61 * t) * 0.04) *
        wEnv;
    }

    const masterEnv = Math.min(1, t / 0.5) * Math.min(1, (durationSec - t) / 0.6);
    const sample = Math.max(-1, Math.min(1, (drone + pillarThuds + windShimmer) * masterEnv));
    view.setInt16(44 + i * 2, sample * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return 'data:audio/wav;base64,' + btoa(bin);
}

const PARTICLES = Array.from({ length: 90 }, (_, i) => {
  const angle = (i * 137.5 * Math.PI) / 180;
  const radius = 15 + (i % 12) * 9;
  return {
    startX: Math.cos(angle) * radius,
    startY: Math.sin(angle) * radius,
    driftX: 160 + (i % 9) * 55 + Math.cos(angle) * 140,
    driftY: -90 - (i % 7) * 38 + Math.sin(angle) * 110,
    size: 3 + (i % 5) * 1.4,
    delay: (i % 15) * 1.8,
  };
});

const ANCIENT_INDIA_SVG =
  'M 420 140 L 465 150 L 495 190 L 480 235 L 535 280 L 620 325 L 705 340 L 755 315 L 805 330 L 820 370 L 775 410 L 745 445 L 705 415 L 670 440 L 640 505 L 575 565 L 525 650 L 480 755 L 450 845 L 425 855 L 395 760 L 360 635 L 340 520 L 280 480 L 255 435 L 315 405 L 295 355 L 345 290 L 385 225 L 400 175 Z';

export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const sfxSrc = useMemo(() => createCharvakaSfxWav(durationInFrames / fps), [durationInFrames, fps]);

  const act2Tilt = interpolate(frame, [135, 185], [0, 22], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const slowPush = interpolate(frame, [0, 450], [1.0, 1.18]);

  const act1Opacity = interpolate(frame, [0, 20, 135, 160], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const ripple1 = (frame % 55) / 55;
  const ripple2 = ((frame + 27) % 55) / 55;

  const pillar1 = spring({ frame: Math.max(0, frame - 156), fps, config: { damping: 13, stiffness: 100 } });
  const pillar2 = spring({ frame: Math.max(0, frame - 186), fps, config: { damping: 13, stiffness: 100 } });
  const pillar3 = spring({ frame: Math.max(0, frame - 216), fps, config: { damping: 13, stiffness: 100 } });

  const networkLineDraw = interpolate(frame, [225, 275], [600, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const pillarsOpacity = interpolate(frame, [145, 165, 415, 445], [0, 1, 1, 0.35], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const coreCollapse = interpolate(frame, [308, 345], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });

  const titleAct1 = interpolate(frame, [10, 28, 130, 148], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleAct2 = interpolate(frame, [155, 175, 295, 312], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleAct3 = interpolate(frame, [320, 342, 435, 450], [0, 1, 1, 0.85], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return (
    <AbsoluteFill style={{ backgroundColor: '#070504', overflow: 'hidden' }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Inter:wght@400;600;700&family=Noto+Sans+Devanagari:wght@600;700&display=swap');`}
      </style>

      <Audio src={sfxSrc} volume={0.95} />

      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 48%, rgba(120, 74, 24, 0.34) 0%, rgba(18, 12, 8, 0.94) 62%, #050403 100%)',
        }}
      />

      <svg
        viewBox="0 0 1000 1000"
        style={{
          position: 'absolute',
          width: 1150,
          height: 1150,
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) rotate(${frame * 0.12}deg) scale(${slowPush})`,
          opacity: 0.16,
          pointerEvents: 'none',
        }}
      >
        <circle cx="500" cy="500" r="440" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="10 8" />
        <circle cx="500" cy="500" r="340" fill="none" stroke="#fbbf24" strokeWidth="1" />
        <circle cx="500" cy="500" r="220" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 6" />
        <line x1="50" y1="500" x2="950" y2="500" stroke="#f59e0b" strokeWidth="0.8" />
        <line x1="500" y1="50" x2="500" y2="950" stroke="#f59e0b" strokeWidth="0.8" />
      </svg>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          perspective: '1300px',
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
            transform: `scale(${slowPush}) rotateX(${act2Tilt}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {act1Opacity > 0.01 && (
            <svg
              viewBox="0 0 1000 1000"
              style={{
                position: 'absolute',
                width: 900,
                height: 900,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: act1Opacity,
                overflow: 'visible',
              }}
            >
              <defs>
                <filter id="amberGlow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <path
                d={ANCIENT_INDIA_SVG}
                fill="rgba(245, 158, 11, 0.14)"
                stroke="#f59e0b"
                strokeWidth="2.5"
                filter="url(#amberGlow)"
                strokeLinejoin="round"
              />

              <circle
                cx="485"
                cy="420"
                r={interpolate(ripple1, [0, 1], [15, 290])}
                fill="none"
                stroke="#fde047"
                strokeWidth="2"
                opacity={interpolate(ripple1, [0, 0.7, 1], [0.85, 0.3, 0])}
              />
              <circle
                cx="485"
                cy="420"
                r={interpolate(ripple2, [0, 1], [15, 290])}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                opacity={interpolate(ripple2, [0, 0.7, 1], [0.75, 0.25, 0])}
              />
            </svg>
          )}

          <svg
            viewBox="0 0 1920 1080"
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'visible',
            }}
          >
            <defs>
              <filter id="fortressGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {frame >= 220 && (
              <g opacity={pillarsOpacity}>
                <polygon
                  points="520,330 1400,330 960,790"
                  fill="rgba(56, 189, 248, 0.05)"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="600"
                  strokeDashoffset={networkLineDraw}
                  filter="url(#fortressGlow)"
                />
              </g>
            )}

            {frame >= 156 && (
              <g transform={`translate(520, 330) scale(${pillar1})`} opacity={pillarsOpacity}>
                <polygon
                  points="0,-78 72,-22 45,65 -45,65 -72,-22"
                  fill="rgba(14, 165, 233, 0.22)"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  filter="url(#fortressGlow)"
                />
                <circle cx="0" cy="0" r="18" fill="#38bdf8" />
                <text y="102" fill="#e0f2fe" fontFamily="Cinzel, serif" fontSize="22" fontWeight="800" textAnchor="middle" letterSpacing="3">
                  BUDDHIST SANGHA
                </text>
                <text y="128" fill="#7dd3fc" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="600" textAnchor="middle" letterSpacing="2">
                  MONASTERIES &amp; MONKS
                </text>
              </g>
            )}

            {frame >= 186 && (
              <g transform={`translate(1400, 330) scale(${pillar2})`} opacity={pillarsOpacity}>
                <polygon
                  points="0,-78 72,-22 45,65 -45,65 -72,-22"
                  fill="rgba(14, 165, 233, 0.22)"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  filter="url(#fortressGlow)"
                />
                <circle cx="0" cy="0" r="18" fill="#38bdf8" />
                <text y="102" fill="#e0f2fe" fontFamily="Cinzel, serif" fontSize="22" fontWeight="800" textAnchor="middle" letterSpacing="3">
                  JAIN ORDERS
                </text>
                <text y="128" fill="#7dd3fc" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="600" textAnchor="middle" letterSpacing="2">
                  TEXTS &amp; PATRONAGE
                </text>
              </g>
            )}

            {frame >= 216 && (
              <g transform={`translate(960, 790) scale(${pillar3})`} opacity={pillarsOpacity}>
                <polygon
                  points="0,-78 72,-22 45,65 -45,65 -72,-22"
                  fill="rgba(14, 165, 233, 0.22)"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  filter="url(#fortressGlow)"
                />
                <circle cx="0" cy="0" r="18" fill="#38bdf8" />
                <text y="102" fill="#e0f2fe" fontFamily="Cinzel, serif" fontSize="22" fontWeight="800" textAnchor="middle" letterSpacing="3">
                  BRAHMANICAL TRADITION
                </text>
                <text y="128" fill="#7dd3fc" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="600" textAnchor="middle" letterSpacing="2">
                  TEMPLES &amp; ROYAL COURTS
                </text>
              </g>
            )}

            <g transform="translate(960, 495)">
              {coreCollapse > 0.01 && (
                <g transform={`scale(${coreCollapse})`} opacity={coreCollapse}>
                  <circle
                    cx="0"
                    cy="0"
                    r="62"
                    fill="rgba(251, 191, 36, 0.18)"
                    stroke="#fbbf24"
                    strokeWidth="2.5"
                    strokeDasharray="10 8"
                    filter="url(#fortressGlow)"
                  />
                  <circle cx="0" cy="0" r="26" fill="#fde047" filter="url(#fortressGlow)" />
                  <text y="-82" fill="#fde047" fontFamily="Cinzel, serif" fontSize="26" fontWeight="800" textAnchor="middle" letterSpacing="4">
                    CHARVAKA
                  </text>
                </g>
              )}

              {frame >= 312 &&
                PARTICLES.map((p, idx) => {
                  const localP = Math.max(0, Math.min(1, (frame - 312 - p.delay) / 110));
                  const px = interpolate(localP, [0, 1], [p.startX, p.startX + p.driftX]);
                  const py = interpolate(localP, [0, 1], [p.startY, p.startY + p.driftY]);
                  const pOpacity = interpolate(localP, [0, 0.2, 0.75, 1], [0, 1, 0.7, 0]);
                  return (
                    <circle
                      key={idx}
                      cx={px}
                      cy={py}
                      r={p.size}
                      fill={idx % 2 === 0 ? '#fde047' : '#f59e0b'}
                      opacity={pOpacity}
                      filter="url(#fortressGlow)"
                    />
                  );
                })}
            </g>
          </svg>
        </div>
      </div>

      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 45%, rgba(3, 2, 2, 0.9) 100%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 155,
          left: 110,
          opacity: titleAct1,
          zIndex: 6,
          textShadow: '0 6px 24px rgba(0,0,0,0.95)',
        }}
      >
        <div style={{ fontFamily: 'Inter, sans-serif', color: '#fbbf24', fontSize: 18, letterSpacing: 6, fontWeight: 700 }}>
          600 BCE — 300 BCE • ANCIENT INDIA
        </div>
        <div style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: 54, letterSpacing: 4, fontWeight: 800, marginTop: 6 }}>
          CHARVAKA PHILOSOPHY
        </div>
        <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#fde68a', fontSize: 28, fontWeight: 700, marginTop: 4 }}>
          चार्वाक / लोकायत दर्शन का चरम दौर
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 150,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          opacity: titleAct2,
          zIndex: 6,
          textShadow: '0 6px 24px rgba(0,0,0,0.95)',
        }}
      >
        <div style={{ fontFamily: 'Inter, sans-serif', color: '#38bdf8', fontSize: 17, letterSpacing: 6, fontWeight: 700 }}>
          RISE OF ORGANIZED INSTITUTIONS
        </div>
        <div style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: 44, letterSpacing: 3, fontWeight: 800, marginTop: 4 }}>
          MONASTERIES • ROYAL PATRONAGE • SCRIPTURES
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 165,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          opacity: titleAct3,
          zIndex: 6,
          width: 1200,
          textShadow: '0 6px 28px rgba(0,0,0,0.95)',
        }}
      >
        <div style={{ fontFamily: 'Inter, sans-serif', color: '#fbbf24', fontSize: 17, letterSpacing: 6, fontWeight: 700 }}>
          NO TEMPLES • NO MONASTIC ORDER • NO SYSTEM
        </div>
        <div style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: 46, letterSpacing: 3.5, fontWeight: 800, marginTop: 6 }}>
          DISSOLVED LIKE THE OPEN WIND
        </div>
        <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#fde68a', fontSize: 26, fontWeight: 700, marginTop: 6 }}>
          एक खुली हवा की तरह... धीरे-धीरे बिखरने लगा
        </div>
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 118, backgroundColor: '#000000', zIndex: 10 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 118, backgroundColor: '#000000', zIndex: 10 }} />
    </AbsoluteFill>
  );
};
        
