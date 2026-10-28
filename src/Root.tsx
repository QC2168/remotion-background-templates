import React from 'react';
import {Composition} from 'remotion';
import {BACKGROUNDS, IDS, DotMatrix} from './Backgrounds';

export const Root: React.FC = () => (
  <>
    {BACKGROUNDS.map((component, i) => (
      <Composition
        key={IDS[i]}
        id={IDS[i]}
        component={component}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={i>=12?360:180}
        defaultProps={{
          color:
            i === 14
              ? '#ffffff'
              : i === 13
              ? '#555555'
              : i === 12
              ? '#3a3a3a'
              : i >= 10
              ? '#bebebe'
              : '#aeb6c2',
          intensity: 1,
          speed: i === 3 || i === 4 ? 2 : 1,
          seed: 42,
        }}
      />
    ))}
    <Composition
      id="Background-DotMatrix"
      component={DotMatrix}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={180}
      defaultProps={{
        color: '#ffffff',
        intensity: 1,
        speed: 1,
        seed: 42,
        gap: 36,
        dotRadius: 1.2,
        breathing: true,
        watermarkText: 'DIV',
      }}
    />
    <Composition
      id="Background-DotMatrix-Vertical"
      component={DotMatrix}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={180}
      defaultProps={{
        color: '#ffffff',
        intensity: 1,
        speed: 1,
        seed: 42,
        gap: 36,
        dotRadius: 1.2,
        breathing: true,
        watermarkText: 'DIV',
      }}
    />
  </>
);
