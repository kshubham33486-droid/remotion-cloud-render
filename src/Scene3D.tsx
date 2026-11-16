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

function createAurangzebEpicAudioWav(durationSec: number, sampleRate = 22050): string {
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

    // Deep Cinematic Dark Historical Sub-Bass & War Drone
    const drone =
      Math.sin(2 * Math.PI * 31.0 * t) * 0.3 +
      Math.sin(2 * Math.PI * 46.5 * t) * 0.16 +
      Math.sin(2 * Math.PI * 62.0 * t) * 0.08;

    // Epic Impacts at Act Transitions (0.2s, 5.0s, 10.0s)
    let hits = 0;
    [0.2, 5.0, 10.0, 14.0].forEach((ht) => {
      if (t >= ht && t <= ht + 1.6) {
        const pt = t - ht;
        const noise = ((Math.sin(i * 12.9898) * 43758.5453) % 1) * 2 - 1;
        const boom = Math.sin(2 * Math.PI * (76 * Math.exp(-pt * 8) + 22) * pt) * Math.exp(-pt * 4.2);
        hits += boom * 0.42 + noise * Math.exp(-pt * 6.5) * 0.14;
      }
    });

    const masterEnv = Math.min(1, t / 0.35) * Math.min(1, (durationSec - t) / 0.7);
    const val = Math.max(-1, Math.min(1, (drone + hits) * masterEnv));
    view.setInt16(44 + i * 2, val * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return 'data:audio/wav;base64,' + btoa(bin);
}export const Scene3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const sfxSrc = useMemo(() => createAurangzebEpicAudioWav(durationInFrames / fps), [durationInFrames, fps]);

  // Cinematic Camera Zoom Choreography across 450 frames
  const zoom = interpolate(frame, [0, 450], [1.0, 1.15], { easing: Easing.out(Easing.cubic) });

  // Frame-based Act Triggers
  const act1Op = interpolate(frame, [0, 15, 135, 155], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const act2Op = interpolate(frame, [145, 168, 285, 310], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const act3Op = interpolate(frame, [300, 325, 430, 450], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Spring slide for visual frame cards
  const cardSlide = spring({ frame: Math.max(0, frame % 150), fps, config: { damping: 14, stiffness: 85 } });

  return (
    <AbsoluteFill style={{ backgroundColor: '#050403', overflow: 'hidden' }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@600;800&family=Noto+Sans+Devanagari:wght@600;700;800&display=swap');`}
      </style>

      <Audio src={sfxSrc} volume={0.95} />

      {/* Cinematic Background Gradient & Vignette */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 45%, rgba(180, 83, 9, 0.24) 0%, rgba(8, 5, 3, 0.96) 72%, #020100 100%)',
          transform: `scale(${zoom})`,
        }}
      />

      <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 90px' }}>
        
        {/* ================= ACT 1: FRAMES 0 - 150 (0s - 5s) ================= */}
        {act1Op > 0.01 && (
          <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', opacity: act1Op }}>
            {/* Left Image Placeholder Frame */}
            <div
              style={{
                width: 650,
                height: 700,
                border: '3px solid #fbbf24',
                boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(251,191,36,0.3)',
                position: 'relative',
                overflow: 'hidden',
                transform: `translateX(${(1 - cardSlide) * -50}px)`,
                backgroundColor: '#160d05',
              }}
            >
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 40, textAlign: 'center' }}>
                <div style={{ fontFamily: 'Cinzel, serif', color: '#fbbf24', fontSize: 32, fontWeight: 800 }}>MUGHAL APEX</div>
                <div style={{ fontFamily: 'JetBrains Mono', color: '#fde68a', fontSize: 16, marginTop: 10 }}>[ ARCHIVAL PORTRAIT FRAME ]</div>
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.95))' }}>
                <div style={{ color: '#fbbf24', fontSize: 13, fontFamily: 'JetBrains Mono', letterSpacing: 3 }}>ACT I • FRAMES 0 - 150</div>
                <div style={{ color: '#ffffff', fontSize: 20, fontFamily: 'Cinzel, serif', fontWeight: 800 }}>THE PEAK OF THE EMPIRE</div>
              </div>
            </div>

            {/* Right Narrative Text */}
            <div style={{ width: 950, paddingLeft: 60 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#fbbf24', fontSize: 18, fontWeight: 800, letterSpacing: 5 }}>
                ● 17TH CENTURY • IMPERIAL EXPANSION
              </div>
              <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#ffffff', fontSize: 48, fontWeight: 800, marginTop: 18, lineHeight: 1.35 }}>
                “मुग़ल साम्राज्य अपने भौगोलिक चरम विस्तार पर था।”
              </div>
              <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#fde68a', fontSize: 26, fontWeight: 700, marginTop: 20, opacity: 0.95 }}>
                उत्तर से लेकर सुदूर दक्षिण तक सत्ता का परचम लहरा रहा था, लेकिन भीतर ही भीतर संघर्ष के बीज बोए जा रहे थे।
              </div>
            </div>
          </div>
        )}

        {/* ================= ACT 2: FRAMES 150 - 300 (5s - 10s) ================= */}
        {act2Op > 0.01 && (
          <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', opacity: act2Op }}>
            <div style={{ width: 950, paddingRight: 60 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#f59e0b', fontSize: 18, fontWeight: 800, letterSpacing: 5 }}>
                ▲ FRAMES 150 - 300 • THE DECCAN QUAGMIRE
              </div>
              <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#ffffff', fontSize: 46, fontWeight: 800, marginTop: 18, lineHeight: 1.35 }}>
                दक्कन के अंतहीन युद्धों में उलझती चली गई शाही सेना!
              </div>
              <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#fde68a', fontSize: 26, fontWeight: 700, marginTop: 20, opacity: 0.95 }}>
                मराठों के असहयोग और निरंतर guerilla युद्ध ने मुगल अर्थव्यवस्था और सैन्य बल को झकझोर कर रख दिया।
              </div>
            </div>

            {/* Right Image Placeholder Frame */}
            <div
              style={{
                width: 650,
                height: 700,
                border: '3px solid #f59e0b',
                boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(245,158,11,0.3)',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#160d05',
              }}
            >
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 40, textAlign: 'center' }}>
                <div style={{ fontFamily: 'Cinzel, serif', color: '#f59e0b', fontSize: 32, fontWeight: 800 }}>DECCAN CAMPAIGNS</div>
                <div style={{ fontFamily: 'JetBrains Mono', color: '#fde68a', fontSize: 16, marginTop: 10 }}>[ BATTLEFIELD STRATEGY FRAME ]</div>
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.95))' }}>
                <div style={{ color: '#f59e0b', fontSize: 13, fontFamily: 'JetBrains Mono', letterSpacing: 3 }}>ACT II • FRAMES 150 - 300</div>
                <div style={{ color: '#ffffff', fontSize: 20, fontFamily: 'Cinzel, serif', fontWeight: 800 }}>EXHAUSTION OF THE TREASURY</div>
              </div>
            </div>
          </div>
        )}

        {/* ================= ACT 3: FRAMES 300 - 450 (10s - 15s) ================= */}
        {act3Op > 0.01 && (
          <div style={{ textAlign: 'center', width: 1500, opacity: act3Op, margin: '0 auto' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#ef4444', fontSize: 18, fontWeight: 800, letterSpacing: 5 }}>
              ■ FRAMES 300 - 450 • 1707 COLLAPSE
            </div>
            <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#ffffff', fontSize: 46, fontWeight: 800, marginTop: 18, lineHeight: 1.35 }}>
              1707 में सम्राट के निधन के साथ ही बिखर गया सपनों का साम्राज्य।
            </div>
            <div
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(127, 29, 29, 0.45) 20%, rgba(127, 29, 29, 0.45) 80%, transparent 100%)',
                borderTop: '1px solid #ef4444',
                borderBottom: '1px solid #ef4444',
                padding: '24px 40px',
                marginTop: 30,
              }}
            >
              <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#fde68a', fontSize: 28, fontWeight: 700 }}>
                “औरंगज़ेब की मृत्यु ने भारत के इतिहास में एक ऐसा खालीपन छोड़ा, जिसने अंग्रेजों के लिए सत्ता की सीढ़ियाँ तैयार कर दीं।”
              </div>
            </div>
          </div>
        )}

      </AbsoluteFill>

      {/* 21:9 Cinema Letterbox Bars */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 118, backgroundColor: '#000', zIndex: 10 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 118, backgroundColor: '#000', zIndex: 10 }} />
    </AbsoluteFill>
  );
};
