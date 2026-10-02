import React, {useEffect, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, staticFile, delayRender, continueRender, cancelRender} from 'remotion';
import type {BackgroundProps} from './Backgrounds';

export const WATERMARK_PERIOD = 560;
export const watermarkOffset = (frame: number, duration: number, speed = 1) =>
 -WATERMARK_PERIOD * (((frame / duration * speed) % 1 + 1) % 1);

/** Label rotation is local: the outer translation remains on screen X only. */
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
   <g transform={`translate(${offset} 0)`} fill={p.color ?? '#3a3a3a'} opacity={opacity}
    fontFamily="'Watermark Sans', sans-serif" fontWeight="800">
    {Array.from({length:8},(_,r)=>r-1).map(row =>
     Array.from({length:12},(_,c)=>c-2).map(col => {
      const x = col * 280 + (row % 2 === 0 ? 0 : 126);
      const y = row * 218 + (col % 2 === 0 ? 0 : -17) + 52;
      return <React.Fragment key={`${row}-${col}`}>
       <text transform={`translate(${x} ${y}) rotate(-30)`} fontSize="40">DIV</text>
       <text transform={`translate(${x + 40} ${y + 109}) rotate(-30)`} fontSize="30">AI工程师-DIV</text>
      </React.Fragment>;
     })
    )}
   </g>
  </svg>
 </AbsoluteFill>;
};
