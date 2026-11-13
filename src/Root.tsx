import React from 'react';
import { Composition } from 'remotion';
import { MyComposition } from './Composition';
import { Scene3D } from './Scene3D';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Main" component={MyComposition} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="Studio3D" component={Scene3D} durationInFrames={450} fps={30} width={1920} height={1080} />
    </>
  );
};
