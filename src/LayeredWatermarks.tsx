import React, {useEffect, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, staticFile, delayRender, continueRender, cancelRender} from 'remotion';
import type {BackgroundProps} from './Backgrounds';
export const LAYERED_WATERMARK_PERIOD = {x:607.5, y:350};
export const LAYERED_ROW_STEP = {x:72, y:72 * Math.sqrt(3)};
export const layeredWatermarkOffset = (frame: number, duration: number, speed = 1) => {
 const progress = ((frame / duration * speed) % 1 + 1) % 1;
 return {x:-LAYERED_WATERMARK_PERIOD.x * progress, y:LAYERED_WATERMARK_PERIOD.y * progress};
};

/** Alternating solid and upright outline rows, on a more spacious loop lattice. */
export const LayeredWatermarks: React.FC<BackgroundProps> = p => {
 const [labelOffsets, setLabelOffsets] = useState<Record<string, number>>({});
 const [fontHandle] = useState(() => delayRender('Load layered watermark CJK font'));
 useEffect(() => {
  const font = new FontFace('Layered Watermark Sans', `url(${staticFile('fonts/AlibabaPuHuiTi-3-85-Bold.woff2')})`, {weight:'800'});
  font.load().then(loaded => {
   (document.fonts as FontFaceSet & {add: (font: FontFace) => void}).add(loaded);
   const context = document.createElement('canvas').getContext('2d');
   if (!context) throw new Error('Cannot measure layered watermark labels');
   const offsets: Record<string, number> = {};
   for (const fontSize of [60, 72]) {
    context.font = `normal 800 ${fontSize}px "Layered Watermark Sans"`;
    context.letterSpacing = '1px';
    for (const label of ['DIV', 'AI工程师-DIV']) {
     const metrics = context.measureText(label);
     offsets[`${fontSize}:${label}`] = (metrics.actualBoundingBoxLeft - metrics.actualBoundingBoxRight) / 2;
    }
   }
   setLabelOffsets(offsets);
   continueRender(fontHandle);
  }).catch(cancelRender);
 }, [fontHandle]);
 const frame = useCurrentFrame();
 const {durationInFrames} = useVideoConfig();
 const offset = layeredWatermarkOffset(frame, durationInFrames, p.speed ?? 1);
 const opacity = Math.max(0, Math.min(1, p.intensity ?? 1));
 return <AbsoluteFill style={{backgroundColor:p.background ?? '#161616',overflow:'hidden'}}>
  <svg width="1920" height="1080" viewBox="0 0 1920 1080">
   <g transform={`translate(${offset.x} ${offset.y})`} opacity={opacity}
    fontFamily="'Layered Watermark Sans', sans-serif" fontWeight="800" fontSize="60" letterSpacing={1}>
    {Array.from({length:29},(_,r)=>r-4).map(row => {
     const outline = Math.abs(row % 2) === 1;
     const fontSize = outline ? 72 : 60;
     return <g key={row} fontStyle="normal" fontSize={fontSize} fill={outline ? 'none' : p.color ?? '#555555'}
      stroke={outline ? '#686868' : 'none'} strokeWidth={outline ? 1.25 : 0}
      strokeLinejoin="round" paintOrder="stroke">
      {Array.from({length:11},(_,c)=>c-3).map(col => {
       const x = col * LAYERED_WATERMARK_PERIOD.x + row * LAYERED_ROW_STEP.x;
       const y = -col * LAYERED_WATERMARK_PERIOD.y + row * LAYERED_ROW_STEP.y;
       const first = outline ? 'AI工程师-DIV' : 'DIV';
       const second = outline ? 'DIV' : 'AI工程师-DIV';
       return <React.Fragment key={col}>
        <text x={labelOffsets[`${fontSize}:${first}`]} transform={`translate(${x} ${y}) rotate(-30)`}>{first}</text>
        <text x={labelOffsets[`${fontSize}:${second}`]} transform={`translate(${x + LAYERED_WATERMARK_PERIOD.x / 2} ${y - LAYERED_WATERMARK_PERIOD.y / 2}) rotate(-30)`}>{second}</text>
       </React.Fragment>;
      })}
     </g>;
    })}
   </g>
  </svg>
 </AbsoluteFill>;
};
