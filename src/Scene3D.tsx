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
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';

function createCharvakaManuscriptSfx(durationSec: number, sampleRate = 22050): string {
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

    // Deep Ancient Tanpura / Sub-Bass Drone
    const drone =
      Math.sin(2 * Math.PI * 36.71 * t) * 0.2 +
      Math.sin(2 * Math.PI * 55.0 * t) * 0.11 +
      Math.sin(2 * Math.PI * 110.0 * t) * 0.05;

    // Book Opening Parchment Rustle + Low Thud at 0.8s
    let bookOpen = 0;
    if (t >= 0.6 && t <= 2.2) {
      const bt = t - 0.6;
      const noise = ((Math.sin(i * 12.9898) * 43758.5453) % 1) * 2 - 1;
      bookOpen += noise * Math.exp(-bt * 4.5) * 0.14;
      bookOpen += Math.sin(2 * Math.PI * (65 * Math.exp(-bt * 8) + 30) * bt) * Math.exp(-bt * 6) * 0.28;
    }

    // Golden Shloka Highlight Chime at 2.8s & 4.2s
    let chime = 0;
    [2.8, 4.2].forEach((ct, idx) => {
      if (t >= ct && t <= ct + 1.8) {
        const pt = t - ct;
        const freq = idx === 0 ? 440 : 554.37;
        chime += Math.sin(2 * Math.PI * freq * pt) * Math.exp(-pt * 3.2) * 0.12;
      }
    });

    // Parallax Transition Whoosh at 6.0s
    let whoosh = 0;
    if (t >= 5.7 && t <= 7.0) {
      const wt = t - 5.7;
      const env = Math.sin((wt / 1.3) * Math.PI);
      whoosh += Math.sin(2 * Math.PI * (90 + wt * 60) * wt) * env * 0.16;
    }

    const masterEnv = Math.min(1, t / 0.4) * Math.min(1, (durationSec - t) / 0.6);
    const val = Math.max(-1, Math.min(1, (drone + bookOpen + chime + whoosh) * masterEnv));
    view.setInt16(44 + i * 2, val * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return 'data:audio/wav;base64,' + btoa(bin);
}

// Generates high-detail ancient palm-leaf manuscript textures with Sanskrit Shloka & Art
function buildManuscriptTextures() {
  // Left Page Texture: Ancient Illustration of Charvaka Sage Preaching
  const leftCanvas = document.createElement('canvas');
  leftCanvas.width = 1024;
  leftCanvas.height = 1280;
  const lctx = leftCanvas.getContext('2d')!;

  const lGrad = lctx.createLinearGradient(0, 0, 1024, 1280);
  lGrad.addColorStop(0, '#d8b47c');
  lGrad.addColorStop(0.5, '#c19352');
  lGrad.addColorStop(1, '#8c622b');
  lctx.fillStyle = lGrad;
  lctx.fillRect(0, 0, 1024, 1280);

  // Ornamental Double Border
  lctx.strokeStyle = '#4a1d05';
  lctx.lineWidth = 14;
  lctx.strokeRect(48, 48, 928, 1184);
  lctx.strokeStyle = '#991b1b';
  lctx.lineWidth = 5;
  lctx.strokeRect(72, 72, 880, 1136);

  // Inner Miniature Painting Frame
  const artGrad = lctx.createRadialGradient(512, 520, 40, 512, 520, 420);
  artGrad.addColorStop(0, '#fde68a');
  artGrad.addColorStop(0.55, '#b45309');
  artGrad.addColorStop(1, '#291507');
  lctx.fillStyle = artGrad;
  lctx.fillRect(120, 150, 784, 760);

  // Stylized Ancient Sage & Gathering Silhouettes + Fire Altar Critique
  lctx.fillStyle = '#1c0d04';
  // Banyan Tree Canopy
  lctx.beginPath();
  lctx.arc(512, 310, 230, Math.PI, 0);
  lctx.fill();
  lctx.fillRect(485, 300, 54, 480);

  // Charvaka Philosopher Preaching on Raised Stone Platform
  lctx.fillStyle = '#2b1306';
  lctx.fillRect(230, 740, 564, 170);
  lctx.beginPath();
  lctx.arc(370, 560, 42, 0, Math.PI * 2); // Sage Head
  lctx.fill();
  lctx.beginPath();
  lctx.moveTo(310, 740);
  lctx.quadraticCurveTo(370, 595, 435, 740); // Sage Robe
  lctx.fill();
  // Raised Teaching Hand
  lctx.strokeStyle = '#2b1306';
  lctx.lineWidth = 18;
  lctx.beginPath();
  lctx.moveTo(405, 645);
  lctx.lineTo(485, 585);
  lctx.stroke();

  // Listeners Seated in Debate
  [560, 665, 750].forEach((lx, idx) => {
    lctx.beginPath();
    lctx.arc(lx, 615 + (idx % 2) * 15, 32, 0, Math.PI * 2);
    lctx.fill();
    lctx.beginPath();
    lctx.moveTo(lx - 42, 740);
    lctx.quadraticCurveTo(lx, 640, lx + 42, 740);
    lctx.fill();
  });

  // Caption on Left Page
  lctx.fillStyle = '#3b1504';
  lctx.font = 'bold 42px serif';
  lctx.textAlign = 'center';
  lctx.fillText('बार्हस्पत्य सूत्रम् • लोकायत दर्शन', 512, 1005);
  lctx.font = '600 28px sans-serif';
  lctx.fillStyle = '#5c2408';
  lctx.fillText('प्रत्यक्षमेव प्रमाणम् — THE DIRECT REALITY', 512, 1065);

  // Right Page Texture: Highlighted Famous Charvaka Shloka
  const rightCanvas = document.createElement('canvas');
  rightCanvas.width = 1024;
  rightCanvas.height = 1280;
  const rctx = rightCanvas.getContext('2d')!;

  const rGrad = rctx.createLinearGradient(0, 0, 1024, 1280);
  rGrad.addColorStop(0, '#dfc08d');
  rGrad.addColorStop(0.5, '#c59958');
  rGrad.addColorStop(1, '#91662e');
  rctx.fillStyle = rGrad;
  rctx.fillRect(0, 0, 1024, 1280);

  rctx.strokeStyle = '#4a1d05';
  rctx.lineWidth = 14;
  rctx.strokeRect(48, 48, 928, 1184);
  rctx.strokeStyle = '#991b1b';
  rctx.lineWidth = 5;
  rctx.strokeRect(72, 72, 880, 1136);

  // Illuminated Golden Highlight Box behind Shloka
  rctx.fillStyle = 'rgba(120, 28, 6, 0.16)';
  rctx.fillRect(115, 290, 794, 490);
  rctx.strokeStyle = '#b45309';
  rctx.lineWidth = 4;
  rctx.strokeRect(115, 290, 794, 490);

  rctx.fillStyle = '#7c1d05';
  rctx.font = 'bold 38px serif';
  rctx.textAlign = 'center';
  rctx.fillText('॥ चार्वाक महावाक्यम् ॥', 512, 220);

  // Famous Shloka Lines
  rctx.fillStyle = '#290d02';
  rctx.font = 'bold 46px serif';
  rctx.fillText('यावज्जीवेत् सुखं जीवेत्,', 512, 395);
  rctx.fillStyle = '#881307';
  rctx.fillText('ऋणं कृत्वा घृतं पिबेत् ।', 512, 485);

  rctx.fillStyle = '#290d02';
  rctx.fillText('भस्मीभूतस्य देहस्य,', 512, 605);
  rctx.fillStyle = '#881307';
  rctx.fillText('पुनरागमनं कुतः ॥', 512, 695);

  rctx.fillStyle = '#451a03';
  rctx.font = '600 26px sans-serif';
  rctx.fillText('“जब तक जियो सुख से जियो, क्योंकि देह के भस्म', 512, 885);
  rctx.fillText('हो जाने पर पुनरागमन कहाँ?”', 512, 930);

  const leftTex = new THREE.CanvasTexture(leftCanvas);
  const rightTex = new THREE.CanvasTexture(rightCanvas);
  return { leftTex, rightTex };
}
const DUST_PARTICLES = Array.from({ length: 55 }, (_, i) => ({
  x: (i * 197) % 1920,
  y: (i * 131) % 1080,
  size: 2.5 + (i % 4) * 1.1,
  speedX: ((i % 5) - 2) * 0.35,
  speedY: -0.45 - (i % 4) * 0.2,
}));

const Book3DScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const { leftTex, rightTex } = useMemo(() => buildManuscriptTextures(), []);

  // Book opens smoothly between frame 15 and 75
  const openSpring = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 16, stiffness: 65 },
  });

  // Closed angle (-1.45 rad) -> Open reading angle (-0.18 rad)
  const leftAngle = interpolate(openSpring, [0, 1], [1.42, 0.16]);
  const rightAngle = interpolate(openSpring, [0, 1], [-1.42, -0.16]);

  // Camera pushes closer toward the open manuscript & shloka
  const camZ = interpolate(frame, [0, 175], [8.8, 5.1], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const camY = interpolate(frame, [0, 175], [2.4, 0.9], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const bookRotX = interpolate(frame, [0, 175], [-0.45, -0.22], {
    extrapolateRight: 'clamp',
  });

  return (
    <>
      <color attach="background" args={['#070402']} />
      <fog attach="fog" args={['#070402', 6, 18]} />

      <ambientLight intensity={0.45} color="#ffedd5" />
      <spotLight position={[0, 6, 4]} angle={0.65} penumbra={0.8} intensity={45} color="#fbbf24" />
      <pointLight position={[0, 2.2, 2.5]} intensity={14} color="#fde047" />

      <perspectiveCamera position={[0, camY, camZ]} fov={44} />

      {/* Dark Carved Wooden Pedestal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]}>
        <planeGeometry args={[26, 26]} />
        <meshStandardMaterial color="#120904" roughness={0.35} metalness={0.5} />
      </mesh>

      {/* 3D Ancient Manuscript Book Group */}
      <group position={[0, 0.15, 0]} rotation={[bookRotX, 0, 0]}>
        {/* Leather Spine */}
        <mesh position={[0, 0, -0.06]}>
          <boxGeometry args={[0.35, 3.6, 0.18]} />
          <meshStandardMaterial color="#3b1606" roughness={0.7} />
        </mesh>

        {/* Left Hinged Leaf */}
        <group position={[-0.12, 0, 0]} rotation={[0, leftAngle, 0]}>
          <mesh position={[-1.45, 0, 0]}>
            <boxGeometry args={[2.9, 3.5, 0.08]} />
            <meshStandardMaterial map={leftTex} roughness={0.55} metalness={0.08} />
          </mesh>
        </group>

        {/* Right Hinged Leaf (Highlighted Shloka) */}
        <group position={[0.12, 0, 0]} rotation={[0, rightAngle, 0]}>
          <mesh position={[1.45, 0, 0]}>
            <boxGeometry args={[2.9, 3.5, 0.08]} />
            <meshStandardMaterial map={rightTex} roughness={0.55} metalness={0.08} />
          </mesh>
        </group>
      </group>
    </>
  );
};

// Custom Illustrated 3D Parallax Cards for Act 2 (Frames 175 to 360)
const ParallaxCardsAct: React.FC<{ frame: number }> = ({ frame }) => {
  const localF = Math.max(0, frame - 172);
  const actOpacity = interpolate(frame, [170, 192, 345, 360], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (actOpacity <= 0.01) return null;

  const camZoom = interpolate(localF, [0, 188], [0.92, 1.16], { easing: Easing.out(Easing.cubic) });
  const panX = interpolate(localF, [0, 188], [55, -65]);

  const cards = [
    {
      title: 'प्रत्यक्ष सुख का उपदेश',
      subtitle: '“जो प्रत्यक्ष है वही सत्य है — वर्तमान जीवन ही परम आनंद है”',
      badge: 'LOKAYATA PHILOSOPHY',
      x: 240,
      y: 230,
      depth: 1.25,
      accent: '#fbbf24',
      sceneType: 'preach',
    },
    {
      title: 'यज्ञ और कर्मकांड पर तार्किक व्यंग्य',
      subtitle: '“यदि यज्ञ से पशु स्वर्ग जाता है, तो यजमान अपने पिता की बलि क्यों नहीं देता?”',
      badge: 'RATIONAL CRITIQUE',
      x: 730,
      y: 185,
      depth: 1.55,
      accent: '#f97316',
      sceneType: 'yajna',
    },
    {
      title: 'स्वर्ग-नर्क और पुरोहितवाद का खंडन',
      subtitle: '“न कोई स्वर्ग है, न मोक्ष — केवल पंचभूतों का यह जीवंत संसार है”',
      badge: 'MATERIALIST REALISM',
      x: 1220,
      y: 245,
      depth: 1.15,
      accent: '#fde047',
      sceneType: 'debate',
    },
  ];

  return (
    <AbsoluteFill style={{ opacity: actOpacity, perspective: '1200px' }}>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle at 50% 45%, rgba(146, 64, 14, 0.38) 0%, rgba(10, 6, 3, 0.96) 75%)',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: 1920,
          height: 1080,
          transform: `scale(${camZoom})`,
          transformStyle: 'preserve-3d',
        }}
      >
        {cards.map((c, idx) => {
          const cardDelay = idx * 14;
          const cardIn = interpolate(localF, [cardDelay, cardDelay + 24], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const floatY = Math.sin((localF + idx * 20) * 0.06) * 8;
          const layerX = panX * c.depth;

          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: c.x + layerX,
                top: c.y + floatY,
                width: 455,
                background: 'linear-gradient(160deg, rgba(32, 18, 8, 0.94) 0%, rgba(15, 9, 4, 0.96) 100%)',
                border: `2px solid ${c.accent}`,
                boxShadow: '0 28px 65px rgba(0, 0, 0, 0.9), 0 0 28px rgba(245, 158, 11, 0.22)',
                padding: 20,
                opacity: cardIn,
                transform: `translateY(${(1 - cardIn) * 35}px) rotateY(${(idx - 1) * -7}deg)`,
              }}
            >
              {/* Illustrated Ancient Scene Artwork */}
              <svg viewBox="0 0 400 230" style={{ width: '100%', height: 220, backgroundColor: '#1f1006', borderBottom: `1px solid ${c.accent}` }}>
                <defs>
                  <radialGradient id={`glow-${idx}`} cx="50%" cy="45%" r="55%">
                    <stop offset="0%" stopColor="#fde68a" stopOpacity="0.85" />
                    <stop offset="60%" stopColor="#b45309" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#140903" stopOpacity="1" />
                  </radialGradient>
                </defs>
                <rect width="400" height="230" fill={`url(#glow-${idx})`} />

                {c.sceneType === 'preach' && (
                  <g fill="#1c0b03">
                    <circle cx="115" cy="95" r="22" />
                    <path d="M 80 195 Q 115 118 150 195 Z" />
                    <line x1="135" y1="140" x2="180" y2="110" stroke="#1c0b03" strokeWidth="9" strokeLinecap="round" />
                    <circle cx="245" cy="122" r="17" />
                    <path d="M 220 195 Q 245 140 270 195 Z" />
                    <circle cx="315" cy="126" r="17" />
                    <path d="M 290 195 Q 315 145 340 195 Z" />
                  </g>
                )}

                {c.sceneType === 'yajna' && (
                  <g>
                    {/* Fire Altar Flames */}
                    <path d="M 185 185 Q 200 105 215 185 Z" fill="#f97316" />
                    <path d="M 192 185 Q 200 130 208 185 Z" fill="#fde047" />
                    <rect x="165" y="182" width="70" height="22" fill="#291205" />
                    {/* Rationalist Laughing / Pointing */}
                    <circle cx="95" cy="105" r="21" fill="#1c0b03" />
                    <path d="M 65 200 Q 95 128 125 200 Z" fill="#1c0b03" />
                    <line x1="115" y1="145" x2="162" y2="132" stroke="#1c0b03" strokeWidth="8" />
                    <circle cx="305" cy="108" r="21" fill="#1c0b03" />
                    <path d="M 275 200 Q 305 130 335 200 Z" fill="#1c0b03" />
                  </g>
                )}

                {c.sceneType === 'debate' && (
                  <g fill="#1c0b03">
                    <path d="M 40 60 L 360 60 L 340 82 L 60 82 Z" />
                    <rect x="75" y="80" width="14" height="125" />
                    <rect x="310" y="80" width="14" height="125" />
                    <circle cx="155" cy="112" r="20" />
                    <path d="M 125 200 Q 155 135 185 200 Z" />
                    <circle cx="245" cy="112" r="20" />
                    <path d="M 215 200 Q 245 135 275 200 Z" />
                  </g>
                )}
              </svg>

              <div style={{ color: c.accent, fontSize: 13, letterSpacing: 4, fontWeight: 700, marginTop: 14 }}>
                ● {c.badge}
              </div>
              <div style={{ color: '#ffffff', fontSize: 25, fontWeight: 800, marginTop: 6, lineHeight: 1.3 }}>
                {c.title}
              </div>
              <div style={{ color: '#fde68a', fontSize: 17, marginTop: 8, lineHeight: 1.45 }}>
                {c.subtitle}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Scene3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();

  const sfxSrc = useMemo(() => createCharvakaManuscriptSfx(durationInFrames / fps), [durationInFrames, fps]);

  const act1Opacity = interpolate(frame, [0, 15, 165, 185], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const shlokaBannerOpacity = interpolate(frame, [68, 90, 158, 175], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#070402', overflow: 'hidden' }}>
      <Audio src={sfxSrc} volume={0.95} />

      {/* ACT 1: 3D Opening Ancient Manuscript & Highlighted Shloka (0s - 6s) */}
      {act1Opacity > 0.01 && (
        <AbsoluteFill style={{ opacity: act1Opacity }}>
          <ThreeCanvas width={width} height={height} dpr={1}>
            <Book3DScene frame={frame} fps={fps} />
          </ThreeCanvas>

          {/* Crisp Foreground Highlight Subtitle for the Famous Shloka */}
          <div
            style={{
              position: 'absolute',
              bottom: 142,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 1320,
              textAlign: 'center',
              opacity: shlokaBannerOpacity,
              background: 'linear-gradient(90deg, transparent 0%, rgba(18, 9, 3, 0.92) 20%, rgba(18, 9, 3, 0.92) 80%, transparent 100%)',
              borderTop: '1px solid rgba(251, 191, 36, 0.5)',
              borderBottom: '1px solid rgba(251, 191, 36, 0.5)',
              padding: '14px 30px',
            }}
          >
            <div style={{ color: '#fde047', fontSize: 30, fontWeight: 800, letterSpacing: 1 }}>
              “यावज्जीवेत् सुखं जीवेत्, ऋणं कृत्वा घृतं पिबेत्। भस्मीभूतस्य देहस्य, पुनरागमनं कुतः॥”
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ACT 2: 3D Parallax Cards + Golden Dust (6s - 12s) */}
      <ParallaxCardsAct frame={frame} />

      {/* Floating Golden Dust Motes across the entire 12s Scene */}
      {DUST_PARTICLES.map((p, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            left: (p.x + frame * p.speedX + 1920) % 1920,
            top: (p.y + frame * p.speedY + 1080) % 1080,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: '#fde047',
            opacity: 0.45,
            boxShadow: '0 0 8px #f59e0b',
            pointerEvents: 'none',
            zIndex: 8,
          }}
        />
      ))}

      {/* 21:9 Cinema Letterbox Bars */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 118, backgroundColor: '#000', zIndex: 10 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 118, backgroundColor: '#000', zIndex: 10 }} />
    </AbsoluteFill>
  );
};
                           
