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

function createSfxWavDataUri(durationSec: number, sampleRate = 22050): string {
  const numSamples = Math.floor(durationSec * sampleRate);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const drone = Math.sin(2 * Math.PI * 55 * t) * 0.16 + Math.sin(2 * Math.PI * 110 * t) * 0.06;

    let whoosh = 0;
    if (t >= 1.2 && t <= 3.6) {
      const wt = (t - 1.2) / 2.4;
      const env = Math.sin(Math.PI * wt);
      const noise = Math.sin(i * 12.9898) * 43758.5453;
      const white = (noise - Math.floor(noise)) * 2 - 1;
      whoosh = white * env * 0.22 * Math.sin(2 * Math.PI * (140 + wt * 220) * t);
    }

    let ping = 0;
    if (t >= 3.8 && t <= 4.8) {
      const pt = t - 3.8;
      ping += Math.sin(2 * Math.PI * 880 * pt) * Math.exp(-pt * 6) * 0.35;
      ping += Math.sin(2 * Math.PI * 140 * pt) * Math.exp(-pt * 10) * 0.4;
    }
    if (t >= 5.2 && t <= 6.2) {
      const pt = t - 5.2;
      ping += Math.sin(2 * Math.PI * 1046 * pt) * Math.exp(-pt * 7) * 0.25;
    }

    const fade = Math.min(1, t / 0.4) * Math.min(1, (durationSec - t) / 0.5);
    const sample = Math.max(-1, Math.min(1, (drone + whoosh + ping) * fade));
    view.setInt16(44 + i * 2, sample * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

const INDIA_PATH =
  'M 415 115 L 455 125 L 485 165 L 470 215 L 520 265 L 610 315 L 705 335 L 755 305 L 815 320 L 835 365 L 785 405 L 755 445 L 710 410 L 675 435 L 645 505 L 575 565 L 525 655 L 475 765 L 445 865 L 420 875 L 390 775 L 355 645 L 335 525 L 270 485 L 245 435 L 305 405 L 285 355 L 335 285 L 375 215 L 390 155 Z';

const MP_PATH =
  'M 375 425 L 415 385 L 455 365 L 485 395 L 545 395 L 575 425 L 555 465 L 495 475 L 435 480 L 385 460 Z';

const BHIMBETKA_X = 458;
const BHIMBETKA_Y = 438;

export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const sfxSrc = useMemo(() => createSfxWavDataUri(durationInFrames / fps), [durationInFrames, fps]);

  const indiaDraw = interpolate(frame, [0, 45], [2600, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const zoomProgress = interpolate(frame, [45, 115], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const scale = interpolate(zoomProgress, [0, 1], [1.05, 3.6]);
  const panX = interpolate(zoomProgress, [0, 1], [0, 115]);
  const panY = interpolate(zoomProgress, [0, 1], [15, 65]);

  const mpOpacity = interpolate(frame, [65, 95], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const pinSpring = spring({
    frame: Math.max(0, frame - 110),
    fps,
    config: { damping: 11, stiffness: 120 },
  });
  const pinYOffset = interpolate(pinSpring, [0, 1], [-45, 0]);

  const radarLoop = ((frame - 114) % 45) / 45;
  const radarRadius = frame >= 114 ? interpolate(radarLoop, [0, 1], [4, 34]) : 0;
  const radarOpacity = frame >= 114 ? interpolate(radarLoop, [0, 0.7, 1], [0.85, 0.3, 0]) : 0;

  const cardSpring = spring({
    frame: Math.max(0, frame - 120),
    fps,
    config: { damping: 15, stiffness: 90 },
  });
  const cardX = interpolate(cardSpring, [0, 1], [80, 0]);
  const cardOpacity = interpolate(frame, [120, 138], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const headerOpacity = interpolate(frame, [5, 22, 55, 72], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#060911', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      <Audio src={sfxSrc} volume={0.95} />

      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 42% 50%, rgba(28, 39, 61, 0.75) 0%, rgba(6, 9, 17, 1) 75%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(212, 175, 55, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.06) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          transform: `scale(${1 + zoomProgress * 0.45})`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 165,
          left: 110,
          opacity: headerOpacity,
          zIndex: 4,
        }}
      >
        <div style={{ color: '#d4af37', fontSize: 20, letterSpacing: 7, fontWeight: 700 }}>
          ARCHAEOLOGICAL ATLAS
        </div>
        <div style={{ color: '#f8fafc', fontSize: 54, letterSpacing: 4, fontWeight: 800, marginTop: 6 }}>
          INDIA
        </div>
      </div>

      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
          transformOrigin: `${(BHIMBETKA_X / 1000) * 100}% ${(BHIMBETKA_Y / 1000) * 100}%`,
        }}
      >
        <svg viewBox="0 0 1000 1000" style={{ width: 960, height: 960, overflow: 'visible' }}>
          <defs>
            <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle cx={BHIMBETKA_X} cy={BHIMBETKA_Y} r="280" fill="none" stroke="rgba(212,175,55,0.12)" strokeWidth="1" strokeDasharray="6 6" />
          <circle cx={BHIMBETKA_X} cy={BHIMBETKA_Y} r="140" fill="none" stroke="rgba(212,175,55,0.18)" strokeWidth="1" />

          <path
            d={INDIA_PATH}
            fill="rgba(18, 27, 46, 0.85)"
            stroke="#64748b"
            strokeWidth={interpolate(zoomProgress, [0, 1], [3, 1.2])}
            strokeDasharray="2600"
            strokeDashoffset={indiaDraw}
            strokeLinejoin="round"
          />

          <g style={{ opacity: mpOpacity }}>
            <path
              d={MP_PATH}
              fill="rgba(212, 175, 55, 0.24)"
              stroke="#d4af37"
              strokeWidth={interpolate(zoomProgress, [0, 1], [2.5, 1.1])}
              filter="url(#goldGlow)"
              strokeLinejoin="round"
            />
            <text
              x="468"
              y="412"
              fill="#fDE68A"
              fontSize="11"
              fontWeight="700"
              letterSpacing="2.5"
              textAnchor="middle"
              opacity={interpolate(frame, [85, 110], [0, 0.9], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
            >
              MADHYA PRADESH
            </text>
          </g>

          {frame >= 110 && (
            <g transform={`translate(${BHIMBETKA_X}, ${BHIMBETKA_Y})`}>
              <circle
                cx="0"
                cy="0"
                r={radarRadius}
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.2"
                opacity={radarOpacity}
              />
              <circle cx="0" cy="0" r="3.2" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />

              <g transform={`translate(0, ${pinYOffset}) scale(${pinSpring})`}>
                <path
                  d="M 0 -2 L -7 -14 A 8 8 0 1 1 7 -14 Z"
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth="1"
                  filter="url(#goldGlow)"
                />
                <circle cx="0" cy="-14" r="2.6" fill="#ffffff" />
              </g>
            </g>
          )}
        </svg>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 110,
          top: '50%',
          transform: `translate(${cardX}px, -50%)`,
          opacity: cardOpacity,
          width: 650,
          backgroundColor: 'rgba(10, 15, 28, 0.90)',
          borderLeft: '5px solid #d4af37',
          borderTop: '1px solid rgba(212, 175, 55, 0.35)',
          borderRight: '1px solid rgba(212, 175, 55, 0.2)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
          padding: '34px 40px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
          zIndex: 4,
        }}
      >
        <div style={{ color: '#ef4444', fontSize: 18, letterSpacing: 5, fontWeight: 700, marginBottom: 10 }}>
          ● PREHISTORIC SITE • RAISEN, MP
        </div>
        <div style={{ color: '#ffffff', fontSize: 48, fontWeight: 800, letterSpacing: 1.5, lineHeight: 1.15 }}>
          BHIMBETKA CAVES
        </div>
        <div style={{ color: '#d4af37', fontSize: 24, fontWeight: 600, marginTop: 6, letterSpacing: 1 }}>
          भीमबेटका शैलाश्रय (Rock Shelters)
        </div>

        <div style={{ width: '100%', height: 1, backgroundColor: 'rgba(212, 175, 55, 0.3)', margin: '22px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: 20 }}>
          <div>
            <div style={{ color: '#94a3b8', fontSize: 14, letterSpacing: 3 }}>ERA / TIMELINE</div>
            <div style={{ fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>30,000+ Years Old (Paleolithic)</div>
          </div>
          <div>
            <div style={{ color: '#94a3b8', fontSize: 14, letterSpacing: 3 }}>COORDINATES</div>
            <div style={{ fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>22.9395° N, 77.6125° E</div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, backgroundColor: '#000000', zIndex: 10 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, backgroundColor: '#000000', zIndex: 10 }} />
    </AbsoluteFill>
  );
};
          
