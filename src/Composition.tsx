import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';

export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cinematic Zoom & Motion Choreography across 450 frames (15 seconds)
  const globalZoom = interpolate(frame, [0, 450], [1.0, 1.12], {
    easing: Easing.out(Easing.cubic),
  });

  // Act Transitions (3 Acts across 15 seconds)
  const act1Op = interpolate(frame, [0, 15, 135, 150], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const act2Op = interpolate(frame, [145, 165, 290, 310], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const act3Op = interpolate(frame, [305, 325, 435, 450], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Spring animation for cards / boxes
  const cardSpring = spring({
    frame: frame % 150,
    fps,
    config: { damping: 15, stiffness: 90 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#040302', overflow: 'hidden' }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@600;800&family=Noto+Sans+Devanagari:wght@600;700;800&display=swap');`}
      </style>

      {/* Cinematic Vignette Background */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 45%, rgba(180, 83, 9, 0.22) 0%, rgba(6, 4, 2, 0.96) 72%, #010100 100%)',
          transform: `scale(${globalZoom})`,
        }}
      />

      <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 100px' }}>
        
        {/* ================= ACT 1: 1707 - औरंगज़ेब की मृत्यु (0s - 5s) ================= */}
        {act1Op > 0.01 && (
          <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', opacity: act1Op }}>
            {/* Left High-End Visual Card */}
            <div
              style={{
                width: 650,
                height: 680,
                background: 'linear-gradient(145deg, #181008 0%, #0d0804 100%)',
                border: '3px solid #fbbf24',
                boxShadow: '0 30px 70px rgba(0,0,0,0.95), 0 0 35px rgba(251,191,36,0.25)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 40,
                textAlign: 'center',
                transform: `scale(${0.9 + cardSpring * 0.1})`,
              }}
            >
              <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#fbbf24', fontSize: 15, letterSpacing: 4, fontWeight: 800 }}>
                HISTORICAL TURNING POINT
              </div>
              <div style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: 44, fontWeight: 800, marginTop: 14 }}>
                1707 CE
              </div>
              <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#fde68a', fontSize: 24, fontWeight: 700, marginTop: 16, lineHeight: 1.4 }}>
                औरंगज़ेब का निधन और मुग़ल साम्राज्य के पतन की शुरुआत
              </div>
            </div>

            {/* Right Narrative Text */}
            <div style={{ width: 920, paddingLeft: 70 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#fbbf24', fontSize: 18, fontWeight: 800, letterSpacing: 5 }}>
                ● THE MUGHAL COLLAPSE
              </div>
              <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#ffffff', fontSize: 50, fontWeight: 800, marginTop: 18, lineHeight: 1.35 }}>
                “फिर आया 1707. औरंगज़ेब की मौत के बाद मुग़ल साम्राज्य कमजोर होने लगा।”
              </div>
              <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#fde68a', fontSize: 28, fontWeight: 700, marginTop: 22, opacity: 0.95 }}>
                सूबेदार और राजा अपनी-अपनी सत्ता के लिए आपस में लड़ने लगे। इसी आपसी फूट ने विदेशी ताकतों को मौका दे दिया।
              </div>
            </div>
          </div>
        )}

        {/* ================= ACT 2: 1757 - प्लासी का युद्ध (5s - 10s) ================= */}
        {act2Op > 0.01 && (
          <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', opacity: act2Op }}>
            <div style={{ width: 920, paddingRight: 70 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#f59e0b', fontSize: 18, fontWeight: 800, letterSpacing: 5 }}>
                ▲ THE BATTLE OF PLASSEY • 1757
              </div>
              <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#ffffff', fontSize: 48, fontWeight: 800, marginTop: 18, lineHeight: 1.35 }}>
                मीर जाफर की गद्दारी और साज़िश से हारे सिराजुद्दौला!
              </div>
              <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#fde68a', fontSize: 28, fontWeight: 700, marginTop: 22, opacity: 0.95 }}>
                इसी युद्ध के बाद अंग्रेज़ों ने तराजू छोड़कर सीधे बंदूक उठाने का दुस्साहस किया।
              </div>
            </div>

            {/* Right Visual Card */}
            <div
              style={{
                width: 650,
                height: 680,
                background: 'linear-gradient(145deg, #1c1006 0%, #0d0602 100%)',
                border: '3px solid #f59e0b',
                boxShadow: '0 30px 70px rgba(0,0,0,0.95), 0 0 35px rgba(245,158,11,0.25)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 40,
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#f59e0b', fontSize: 15, letterSpacing: 4, fontWeight: 800 }}>
                BETRAYAL & CONQUEST
              </div>
              <div style={{ fontFamily: 'Cinzel, serif', color: '#ffffff', fontSize: 44, fontWeight: 800, marginTop: 14 }}>
                PLASSEY
              </div>
              <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#fde68a', fontSize: 24, fontWeight: 700, marginTop: 16, lineHeight: 1.4 }}>
                व्यापारिक कंपनी से राजनीतिक ताकत बनने का पहला कदम
              </div>
            </div>
          </div>
        )}

        {/* ================= ACT 3: 1764 - बक्सर का युद्ध (10s - 15s) ================= */}
        {act3Op > 0.01 && (
          <div style={{ textAlign: 'center', width: 1500, opacity: act3Op, margin: '0 auto' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#ef4444', fontSize: 18, fontWeight: 800, letterSpacing: 5 }}>
              ■ THE BATTLE OF BUXAR • 1764
            </div>
            <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#ffffff', fontSize: 48, fontWeight: 800, marginTop: 18, lineHeight: 1.35 }}>
              बक्सर में शाह आलम द्वितीय और अवध के नवाब की संयुक्त सेना पराजित!
            </div>
            <div
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(127, 29, 29, 0.5) 20%, rgba(127, 29, 29, 0.5) 80%, transparent 100%)',
                borderTop: '2px solid #ef4444',
                borderBottom: '2px solid #ef4444',
                padding: '26px 40px',
                marginTop: 35,
              }}
            >
              <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#fde68a', fontSize: 28, fontWeight: 700 }}>
                “भारत की संपूर्ण सत्ता अब ईस्ट इंडिया कंपनी के मजबूत शिकंजे में जकड़ी जा चुकी थी।”
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
