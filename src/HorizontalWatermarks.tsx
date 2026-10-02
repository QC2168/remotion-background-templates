import React, {useEffect, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, staticFile, delayRender, continueRender, cancelRender} from 'remotion';
import type {BackgroundProps} from './Backgrounds';

export const WATERMARK_PERIOD = {x:486, y:280};
export const watermarkOffset = (frame: number, duration: number, speed = 1) => {
 const progress = ((frame / duration * speed) % 1 + 1) % 1;
 return {x:-WATERMARK_PERIOD.x * progress, y:WATERMARK_PERIOD.y * progress};
};

/** Local label rotation; screen-space motion runs from upper right to lower left. */
export const HorizontalWatermarks: React.FC<BackgroundProps> = p => {
 const [fontHandle] = useState(() => delayRender('Load watermark CJK font'));
 useEffect(() => {
  const font = new FontFace('Watermark Sans', `url(${staticFile('fonts/AlibabaPuHuiTi-3-85-Bold.woff2')})`, {weight:'800'});
  font.load().then(loaded => {
   (document.fonts as FontFaceSet & {add: (font: FontFace) => void}).add(loaded);
   continueRender(fontHandle);
  }).catch(cancelRender);
 }, [fontHandle]);
 const frame = useCurrentFrame();
 const {durationInFrames} = useVideoConfig();
 const offset = watermarkOffset(frame, durationInFrames, p.speed ?? 1);
 const opacity = Math.max(0, Math.min(1, p.intensity ?? 1));
 return <AbsoluteFill style={{backgroundColor:p.background ?? '#161616',overflow:'hidden'}}>
  <svg width="1920" height="1080" viewBox="0 0 1920 1080">
   <g transform={`translate(${offset.x} ${offset.y})`} fill={p.color ?? '#3a3a3a'} opacity={opacity}
    fontFamily="'Watermark Sans', sans-serif" fontWeight="800" fontSize="30">
    {Array.from({length:29},(_,r)=>r-4).map(row =>
     Array.from({length:11},(_,c)=>c-3).map(col => {
      // Along-baseline repeats and perpendicular row spacing form a loop lattice.
      const x = col * WATERMARK_PERIOD.x + row * 50.4;
      const y = -col * WATERMARK_PERIOD.y + row * 87.2;
      const reverse = Math.abs(row % 2) === 1;
      return <React.Fragment key={`${row}-${col}`}>
       <text transform={`translate(${x} ${y}) rotate(-30)`}>{reverse?'AI工程师-DIV':'DIV'}</text>
       <text transform={`translate(${x + 243} ${y - 140}) rotate(-30)`}>{reverse?'DIV':'AI工程师-DIV'}</text>
      </React.Fragment>;
     })
    )}
   </g>
  </svg>
 </AbsoluteFill>;
};
