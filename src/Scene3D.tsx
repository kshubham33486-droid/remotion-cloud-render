
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { ThreeCanvas } from '@remotion/three';

const Corridor3D: React.FC<{ frame: number }> = ({ frame }) => {
  const camZ = interpolate(frame, [0, 300], [14, -4]);
  const gearRot = frame * 0.025;
  const pillars = [-10, -5, 0, 5, 10];

  return (
    <>
      <color attach="background" args={['#090604']} />
      <fog attach="fog" args={['#090604', 6, 26]} />
      <ambientLight intensity={0.35} color="#ffd89b" />
      <pointLight position={[0, 3.5, camZ - 3]} intensity={18} color="#fbbf24" distance={22} />
      <pointLight position={[0, 1.5, -8]} intensity={35} color="#f59e0b" distance={25} />
      <perspectiveCamera position={[0, 1.0, camZ]} fov={50} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <planeGeometry args={[24, 50]} />
        <meshStandardMaterial color="#140d08" roughness={0.25} metalness={0.65} />
      </mesh>

      {pillars.map((z, i) => (
        <group key={i} position={[0, 0, z]}>
          <mesh position={[-4.2, 0, 0]}>
            <cylinderGeometry args={[0.55, 0.65, 5.2, 24]} />
            <meshStandardMaterial color="#4a2e1b" roughness={0.6} metalness={0.2} />
          </mesh>
          <mesh position={[4.2, 0, 0]}>
            <cylinderGeometry args={[0.55, 0.65, 5.2, 24]} />
            <meshStandardMaterial color="#4a2e1b" roughness={0.6} metalness={0.2} />
          </mesh>
        </group>
      ))}

      <group position={[0, 0.3, -7]} rotation={[0.2, gearRot, 0]}>
        <mesh>
          <torusGeometry args={[2.1, 0.12, 16, 64]} />
          <meshStandardMaterial color="#fbbf24" emissive="#b45309" emissiveIntensity={0.4} metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh rotation={[Math.PI / 3, 0, gearRot * 1.4]}>
          <torusGeometry args={[1.55, 0.09, 16, 48]} />
          <meshStandardMaterial color="#fde047" emissive="#d97706" emissiveIntensity={0.35} metalness={0.95} roughness={0.2} />
        </mesh>
      </group>
    </>
  );
};

export const Scene3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const opacity = interpolate(frame, [20, 45, 250, 280], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#090604' }}>
      <ThreeCanvas width={width} height={height}>
        <Corridor3D frame={frame} />
      </ThreeCanvas>
      <div style={{ position: 'absolute', bottom: 155, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', opacity }}>
        <div style={{ color: '#fbbf24', fontSize: 18, letterSpacing: 6, fontWeight: 700 }}>3D WEBGL ARCHIVE</div>
        <div style={{ color: '#ffffff', fontSize: 52, letterSpacing: 4, fontWeight: 800, marginTop: 6 }}>THE LOST CHRONICLES</div>
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 118, backgroundColor: '#000' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 118, backgroundColor: '#000' }} />
    </AbsoluteFill>
  );
};
