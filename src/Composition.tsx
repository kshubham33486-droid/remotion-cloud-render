import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: 80,
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
      }}
    >
      <div style={{ opacity }}>Hello from Cloud Render!</div>
    </AbsoluteFill>
  );
};
