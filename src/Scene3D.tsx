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

function createRebellionAudioWav(durationSec: number, sampleRate = 22050): string {
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

    // Deep Cinematic Dark Historical Drone & Tension Sub-Bass
    const drone =
      Math.sin(2 * Math.PI * 32.7 * t) * 0.28 +
      Math.sin(2 * Math.PI * 49.0 * t) * 0.15 +
      Math.sin(2 * Math.PI * 65.41 * t) * 0.08;

    // Dramatic Cinematic Impacts / Explosions at Key Moments (0.5s, 5.2s, 12.0s)
    let impacts = 0;
    [0.5, 5.2, 12.0, 18.5].forEach((it) => {
      if (t >= it && t <= it + 1.8) {
        const pt = t - it;
        const noise = ((Math.sin(i * 12.9898) * 43758.5453) % 1) * 2 - 1;
        const boom = Math.sin(2 * Math.PI * (75 * Math.exp(-pt * 7) + 24) * pt) * Math.exp(-pt * 4);
        impacts += boom * 0.4 + noise * Math.exp(-pt * 6) * 0.15;
      }
    });

    const masterEnv = Math.min(1, t / 0.4) * Math.min(1, (durationSec - t) / 0.8);
    const val = Math.max(-1, Math.min(1, (drone + impacts) * masterEnv));
    view.setInt16(44 + i * 2, val * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return 'data:audio/wav;base64,' + btoa(bin);
}

const POLICY_CARDS = [
  { year: '1793 CE', title: 'स्थायी बंदोबस्त (Permanent Settlement)', desc: 'लॉर्ड कॉर्नवॉलिस द्वारा बंगाल में जमींदारी व्यवस्था और लगान का फिक्स जाल' },
  { year: '19वीं शताब्दी', title: 'रैयतवाड़ी और महालवाड़ी व्यवस्था', desc: 'प्रत्येक किसान से सीधे ज़बरन वसूली और खून चूसने वाले मालगुजारी कानून' },
  { year: 'लगान का खौफनाक सच', title: '50% से 66% तक लूट', desc: 'कुल उपज का दो-तिहाई हिस्सा अंग्रेज़ ले जाते, बचा हुआ बिचौलिए खा जाते' },
];export const Scene3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const sfxSrc = useMemo(() => createRebellionAudioWav(durationInFrames / fps), [durationInFrames, fps]);

  // Smooth Camera and Motion Graphics Choreography across 20 seconds (600 frames)
  const camTilt = interpolate(frame, [0, 150, 350, 600], [35, 25, 45, 30], {
    easing: Easing.inOut(Easing.cubic),
  });
  const camScale = interpolate(frame, [0, 300, 600], [0.98, 1.12, 1.05], {
    easing: Easing.inOut(Easing.cubic),
  });

  // Act Opacity Triggers
  const act1Op = interpolate(frame, [0, 15, 140, 165], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const act2Op = interpolate(frame, [155, 180, 370, 395], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const act3Op = interpolate(frame, [385, 410, 575, 600], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#050403', overflow: 'hidden' }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@600;800&family=Noto+Sans+Devanagari:wght@600;700;800&display=swap');`}
      </style>

      <Audio src={sfxSrc} volume={0.95} />

      {/* Atmospheric Glowing Grid & Vignette Background */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 45%, rgba(180, 83, 9, 0.28) 0%, rgba(12, 8, 5, 0.96) 70%, #030201 100%), linear-gradient(rgba(251, 191, 36, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(251, 191, 36, 0.04) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 60px 60px, 60px 60px',
        }}
      />

      <AbsoluteFill style={{ perspective: '1300px', justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            width: 1920,
            height: 1080,
            transform: `rotateX(${camTilt}deg) scale(${camScale})`,
            transformStyle: 'preserve-3d',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* ================= ACT 1: चिंगारी और बगावत की प्रस्तावना (0s - 5s) ================= */}
          {act1Op > 0.01 && (
            <div style={{ position: 'absolute', textAlign: 'center', width: 1450, opacity: act1Op }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#fbbf24', fontSize: 18, fontWeight: 800, letterSpacing: 6 }}>
                ● HISTORICAL DOCUMENTARY • 1857 REBELLION
              </div>
              <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#ffffff', fontSize: 52, fontWeight: 800, marginTop: 18, lineHeight: 1.4 }}>
                “इतिहास गवाह है कि कोई भी बगावत रातों-रात नहीं होती।”
              </div>
              <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#fde68a', fontSize: 30, fontWeight: 700, marginTop: 16, opacity: 0.9 }}>
                कारतूस महज़ एक चिंगारी थी — बारूद अंग्रेज़ों ने पिछले सौ सालों में खुद बिछाया था।
              </div>
            </div>
          )}

          {/* ================= ACT 2: स्थायी बंदोबस्त और लगान नीतियां (5s - 13s) ================= */}
          {act2Op > 0.01 && (
            <div style={{ position: 'absolute', width: 1680, opacity: act2Op, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#f59e0b', fontSize: 16, fontWeight: 800, letterSpacing: 5, textAlign: 'center' }}>
                BRITISH LAND REVENUE POLICIES • 1793 ONWARD
              </div>
              <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#ffffff', fontSize: 44, fontWeight: 800, textAlign: 'center', marginTop: 10 }}>
                किसानों की कमर तोड़ने वाले खौफनाक कानून
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, width: '100%', marginTop: 45 }}>
                {POLICY_CARDS.map((card, idx) => {
                  const cardIn = spring({ frame: Math.max(0, frame - (165 + idx * 18)), fps, config: { damping: 15, stiffness: 90 } });
                  return (
                    <div
                      key={idx}
                      style={{
                        background: 'linear-gradient(160deg, rgba(28, 16, 8, 0.92) 0%, rgba(12, 7, 3, 0.96) 100%)',
                        border: '2px solid rgba(251, 191, 36, 0.4)',
                        borderTop: '6px solid #fbbf24',
                        padding: '32px 30px',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
                        opacity: cardIn,
                        transform: `translateY(${(1 - cardIn) * 40}px)`,
                      }}
                    >
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#fde047', fontSize: 16, fontWeight: 800 }}>
                        {card.year}
                      </div>
                      <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#ffffff', fontSize: 26, fontWeight: 800, marginTop: 12, lineHeight: 1.25 }}>
                        {card.title}
                      </div>
                      <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#d1d5db', fontSize: 18, fontWeight: 600, marginTop: 14, lineHeight: 1.45 }}>
                        {card.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= ACT 3: 50% - 66% लगान लूट और शोषण (13s - 20s) ================= */}
          {act3Op > 0.01 && (
            <div style={{ position: 'absolute', width: 1550, textAlign: 'center', opacity: act3Op }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#ef4444', fontSize: 18, fontWeight: 800, letterSpacing: 5 }}>
                ▲ HISTORICAL DATA & OFFICIAL ARCHIVES
              </div>
              <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#ffffff', fontSize: 46, fontWeight: 800, marginTop: 12 }}>
                कुल उपज का <span style={{ color: '#ef4444' }}>50% से 66%</span> सीधा लगान!
              </div>
              <div
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(127, 29, 29, 0.45) 20%, rgba(127, 29, 29, 0.45) 80%, transparent 100%)',
                  borderTop: '1px solid #ef4444',
                  borderBottom: '1px solid #ef4444',
                  padding: '24px 40px',
                  marginTop: 25,
                }}
              >
                <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#fde68a', fontSize: 28, fontWeight: 700, lineHeight: 1.4 }}>
                  “जो थोड़ा बहुत बचता, उसे बिचौलिए और ज़मींदार नोंच खाते — और यहीं से तैयार हुई 1857 की महान बगावत की पृष्ठभूमि।”
                </div>
              </div>
            </div>
          )}
        </div>
      </AbsoluteFill>

      {/* 21:9 Cinema Letterbox Bars */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 118, backgroundColor: '#000', zIndex: 10 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 118, backgroundColor: '#000', zIndex: 10 }} />
    </AbsoluteFill>
  );
};
