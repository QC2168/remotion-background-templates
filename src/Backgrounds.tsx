import React from 'react';
import {HorizontalWatermarks} from './HorizontalWatermarks';
export {HorizontalWatermarks} from './HorizontalWatermarks';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, random} from 'remotion';

/** All motion is derived from frame. speed is cycles/clip; use integers for perfect loops. */
export type BackgroundProps = {background?: string; color?: string; intensity?: number; speed?: number; seed?: number; text?: string; fontSize?: number; tilt?: number; rowGap?: number};
const TAU = Math.PI * 2;
const base = '#05070b';
const ink = '#aeb6c2';
const useScene = (p: BackgroundProps) => {
 const frame = useCurrentFrame(); const {durationInFrames} = useVideoConfig();
 return {phase: TAU * frame / durationInFrames * (p.speed ?? 1), color: p.color ?? ink, bg: p.background ?? base, strength: Math.max(0, Math.min(1, p.intensity ?? 1)), seed:p.seed ?? 42};
};
const Canvas: React.FC<{bg:string;children:React.ReactNode}> = ({bg,children}) => <AbsoluteFill style={{backgroundColor:bg}}><svg viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="none">{children}</svg></AbsoluteFill>;

export const UniformDots: React.FC<BackgroundProps> = p => {
 const s=useScene(p); const dy=s.phase/TAU*36;
 return <Canvas bg={p.background ?? '#030405'}><defs><pattern id="dots" width="36" height="36" patternUnits="userSpaceOnUse" patternTransform={`translate(0 ${dy})`}><circle cx="18" cy="18" r="1.5" fill={s.color}/></pattern></defs><rect width="1920" height="1080" fill="url(#dots)" opacity={.3*s.strength}/></Canvas>;
};
export const FadingDots: React.FC<BackgroundProps> = p => {
 const s=useScene(p);
 return <Canvas bg={s.bg}><defs><pattern id="fade-dots" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform={`translate(${Math.sin(s.phase)*8} 0)`}><circle cx="15" cy="15" r="1.5" fill={s.color}/></pattern><radialGradient id="fade" cx={`${25+Math.sin(s.phase)*8}%`} cy="38%" r="78%"><stop offset="0" stopColor="white"/><stop offset=".45" stopColor="#888"/><stop offset="1" stopColor="black"/></radialGradient><mask id="fade-mask"><rect width="1920" height="1080" fill="url(#fade)"/></mask></defs><rect width="1920" height="1080" fill="url(#fade-dots)" mask="url(#fade-mask)" opacity={.58*s.strength}/></Canvas>;
};
export const ThinGrid: React.FC<BackgroundProps> = p => {
 const s=useScene(p);
 return <Canvas bg={s.bg}><defs><pattern id="grid" width="72" height="72" patternUnits="userSpaceOnUse" patternTransform={`translate(${s.phase/TAU*72} 0)`}><path d="M 72 0 H 0 V 72" fill="none" stroke={s.color} strokeWidth=".7"/></pattern></defs><rect width="1920" height="1080" fill="url(#grid)" opacity={s.strength*.13}/></Canvas>;
};
export const PerspectiveDots: React.FC<BackgroundProps> = p => {
 const s=useScene(p);
 return <Canvas bg={s.bg}><g fill={s.color}>{Array.from({length:25},(_,r)=>{const z=((r+s.phase/TAU)/25)%1; const depth=z*z; const y=330+depth*810;return Array.from({length:47},(_,c)=><circle key={`${r}-${c}`} cx={960+(c-23)*(8+depth*66)} cy={y} r={.4+depth*2.2} opacity={Math.sin(z*Math.PI)*.44*s.strength}/>);})}</g></Canvas>;
};
export const HorizonGrid: React.FC<BackgroundProps> = p => {
 const s=useScene(p);
 return <Canvas bg={s.bg}><defs><linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="black"/><stop offset=".3" stopColor="white"/><stop offset="1" stopColor="#888"/></linearGradient><mask id="floor-mask"><rect y="410" width="1920" height="670" fill="url(#floor)"/></mask><radialGradient id="horizon-glow"><stop stopColor={s.color} stopOpacity={.07*s.strength}/><stop offset="1" stopColor={s.color} stopOpacity="0"/></radialGradient></defs><ellipse cx="960" cy="438" rx="980" ry="145" fill="url(#horizon-glow)"/><g stroke={s.color} strokeWidth="1" opacity={.29*s.strength} mask="url(#floor-mask)">{Array.from({length:35},(_,i)=><line key={i} x1="960" y1="405" x2={960+(i-17)*220} y2="1080"/>)}{Array.from({length:24},(_,i)=>{const z=((i+s.phase/TAU)/24)%1;return <line key={`h${i}`} x1="0" x2="1920" y1={410+z*z*760} y2={410+z*z*760}/>;})}</g></Canvas>;
};
export const RadialNoise: React.FC<BackgroundProps> = p => {
 const s=useScene(p);
 return <Canvas bg={s.bg}><defs><radialGradient id="soft-glow"><stop stopColor={s.color} stopOpacity={.21*s.strength}/><stop offset=".55" stopColor={s.color} stopOpacity={.065*s.strength}/><stop offset="1" stopColor={s.color} stopOpacity="0"/></radialGradient><filter id="fine-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch" seed={s.seed}/><feColorMatrix type="saturate" values="0"/></filter></defs><ellipse cx={850+Math.sin(s.phase)*200} cy={450+Math.cos(s.phase)*90} rx="1150" ry="760" fill="url(#soft-glow)"/><rect width="1920" height="1080" filter="url(#fine-grain)" opacity={.032*s.strength}/></Canvas>;
};
export const ContourWaves: React.FC<BackgroundProps> = p => {
 const s=useScene(p);
 return <Canvas bg={s.bg}><g fill="none" stroke={s.color} strokeWidth="1" opacity={.27*s.strength}>{Array.from({length:28},(_,i)=>{const d=Array.from({length:65},(_,j)=>{const x=j*32; const y=80+i*39+Math.sin(x/360+s.phase+i*.13)*68+Math.cos(x/640-s.phase+i*.22)*46;return `${j?'L':'M'}${x.toFixed(2)} ${y.toFixed(2)}`;}).join(' ');return <path key={i} d={d}/>;})}</g></Canvas>;
};
export const QuietHud: React.FC<BackgroundProps> = p => {
 const s=useScene(p); const angle=s.phase*180/Math.PI;
 return <Canvas bg={s.bg}><defs>
  <radialGradient id="hud-aura"><stop stopColor={s.color} stopOpacity=".07"/><stop offset="1" stopColor={s.color} stopOpacity="0"/></radialGradient>
  <linearGradient id="hud-sweep" x1="0" y1="0" x2="1" y2="0"><stop stopColor={s.color} stopOpacity="0"/><stop offset=".7" stopColor={s.color} stopOpacity=".035"/><stop offset="1" stopColor={s.color} stopOpacity="0"/></linearGradient>
 </defs><g opacity={s.strength}>
 <ellipse cx="1530" cy="500" rx="530" ry="530" fill="url(#hud-aura)"/>
 <g stroke={s.color} fill="none">
  <path d="M72 190V72H240 M1680 72H1848V190 M72 890V1008H240 M1680 1008H1848V890" strokeWidth="2" opacity=".6"/>
  <path d="M96 132V96H160 M1760 96H1824V132 M96 948V984H160 M1760 984H1824V948" opacity=".18"/>
  {Array.from({length:65},(_,i)=><path key={i} d={`M${160+i*25} 85v${i%8===0?18:7} M${160+i*25} 995v${i%8===0?-18:-7}`} opacity={i%8===0?.48:.22}/>) }
  {Array.from({length:33},(_,i)=><path key={`v${i}`} d={`M85 ${220+i*20}h${i%4===0?15:6} M1835 ${220+i*20}h${i%4===0?-15:-6}`} opacity=".32"/>)}
  <g transform="translate(1510 500)">
   <circle r="240" opacity=".13"/><circle r="205" opacity=".18" strokeDasharray="1 12"/>
   {Array.from({length:60},(_,i)=><line key={i} x1="0" y1="-244" x2="0" y2={i%5===0?-260:-251} transform={`rotate(${i*6})`} opacity={i%5===0?.6:.28}/>)}
   <g transform={`rotate(${angle})`} strokeWidth="2.2" opacity=".6"><circle r="225" strokeDasharray="220 125 100 245 170 554"/><circle cx="225" r="3" fill={s.color} stroke="none"/></g>
   <g transform={`rotate(${-angle})`} opacity=".35"><circle r="181" strokeDasharray="76 92"/><path d="M-16 -165H16 M-16 165H16"/></g>
   <path d="M-30 0H30 M0 -30V30" opacity=".16"/>
  </g>
  <path d="M120 785H280L310 815H560 M120 800H260 M120 845H205 M120 865H245" opacity=".4"/>
  {Array.from({length:18},(_,i)=><rect key={`bar${i}`} x={120+i*15} y={922-(8+18*(.5+.5*Math.sin(s.phase+i*.45)))} width="5" height={8+18*(.5+.5*Math.sin(s.phase+i*.45))} fill={s.color} stroke="none" opacity=".3"/>)}
 </g><rect x={760+Math.sin(s.phase)*640} y="110" width="150" height="860" fill="url(#hud-sweep)"/>
 </g></Canvas>;
};
export const DriftingParticles: React.FC<BackgroundProps> = p => {
 const s=useScene(p);
 return <Canvas bg={s.bg}><defs><radialGradient id="particle-glow"><stop stopColor={s.color} stopOpacity=".65"/><stop offset=".22" stopColor={s.color} stopOpacity=".26"/><stop offset="1" stopColor={s.color} stopOpacity="0"/></radialGradient><radialGradient id="dust-atmosphere"><stop stopColor={s.color} stopOpacity=".045"/><stop offset="1" stopColor={s.color} stopOpacity="0"/></radialGradient></defs>
 <ellipse cx="1300" cy="420" rx="1000" ry="750" fill="url(#dust-atmosphere)" opacity={s.strength}/>
 {Array.from({length:3},(_,layer)=><g key={layer} opacity={s.strength}>{Array.from({length:[85,42,18][layer]},(_,i)=>{const rnd=(n:string)=>random(`${s.seed}-${layer}-${i}-${n}`);const a=s.phase+rnd('phase')*TAU;const travel=[22,55,110][layer];const x=80+rnd('x')*1760+Math.cos(a)*travel;const y=60+rnd('y')*960+Math.sin(a)*(travel*.64);const r=[.65,1.65,3.4][layer]+rnd('size')*[.7,1.4,2.6][layer];const opacity=[.24,.46,.7][layer]*(.85+.15*Math.sin(a+rnd('offset')*TAU));return <g key={i} opacity={opacity}>{layer>0&&<circle cx={x} cy={y} r={r*[3,4,6][layer]} fill="url(#particle-glow)"/>}<circle cx={x} cy={y} r={r} fill={s.color}/>{layer===2&&<circle cx={x-r*.2} cy={y-r*.2} r={r*.32} fill="#edf2f7" opacity=".65"/>}</g>;})}</g>)}
 </Canvas>;
};
export const Honeycomb: React.FC<BackgroundProps> = p => {
 const s=useScene(p); const size=54, h=Math.sqrt(3)*size;
 return <Canvas bg={s.bg}><defs><radialGradient id="hex-fade" cx="72%" cy="45%" r="78%"><stop stopColor="white"/><stop offset="1" stopColor="#111"/></radialGradient><mask id="hex-mask"><rect width="1920" height="1080" fill="url(#hex-fade)"/></mask></defs><g fill="none" stroke={s.color} strokeWidth=".8" mask="url(#hex-mask)" opacity={(.18+.025*Math.sin(s.phase))*s.strength}>{Array.from({length:26},(_,c)=>Array.from({length:13},(_,r)=>{const cx=c*size*1.5,cy=r*h+(c%2)*h/2;const points=Array.from({length:6},(_,k)=>`${cx+size*Math.cos(k*TAU/6)},${cy+size*Math.sin(k*TAU/6)}`).join(' ');return <polygon key={`${c}-${r}`} points={points}/>;}))}</g></Canvas>;
};
/** Aligned columns: each label is directly under the previous, never staggered. */
const HandlePlane: React.FC<BackgroundProps & {perspective?: boolean}> = p => {
 const s=useScene(p);const label=(p.text??'@DIV').slice(0,64);const size=Math.max(20,Math.min(140,p.fontSize??64));const gap=Math.max(size*1.12,p.rowGap??86);const tileWidth=Math.max(180,label.length*size*.64+65);const cycles=s.phase/TAU;const id=p.perspective?'handles-perspective':'handles-flat';
 // Integer tile travel preserves the loop. 3D: eight rows/clip (4x previous).
 // Flat: -45 degree baseline rises right; columns scroll along local negative Y.
 const shift=p.perspective?`translate(0 ${-cycles*gap*8})`:`translate(0 ${-cycles*gap*4})`;
 return <AbsoluteFill style={{backgroundColor:p.background??'#000',overflow:'hidden'}}><div style={{position:'absolute',width:3840,height:3840,left:'50%',top:'50%',marginLeft:-1920,marginTop:-1920,transformOrigin:'50% 50%',transform:p.perspective?`perspective(2200px) rotateX(32deg) rotateY(0deg) rotateZ(${p.tilt??-10}deg)`:`rotate(${p.tilt??-45}deg)`,backfaceVisibility:'hidden'}}><svg width="3840" height="3840" viewBox="0 0 3840 3840"><defs><pattern id={id} width={tileWidth} height={gap} patternUnits="userSpaceOnUse" patternTransform={shift}><text x="0" y={size} fill={p.color??'#bebebe'} fontSize={size} fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" letterSpacing="2" opacity={.45*s.strength}>{label}</text></pattern></defs><rect width="3840" height="3840" fill={`url(#${id})`}/></svg></div></AbsoluteFill>;
};
export const ScrollingHandles: React.FC<BackgroundProps> = p => <HandlePlane {...p}/>;
export const ScrollingHandles3D: React.FC<BackgroundProps> = p => <HandlePlane {...p} perspective/>;
export const BACKGROUNDS = [UniformDots,FadingDots,ThinGrid,PerspectiveDots,HorizonGrid,RadialNoise,ContourWaves,QuietHud,DriftingParticles,Honeycomb,ScrollingHandles,ScrollingHandles3D,HorizontalWatermarks] as const;
export const IDS = ['UniformDots','FadingDots','ThinGrid','PerspectiveDots','HorizonGrid','RadialNoise','ContourWaves','QuietHud','DriftingParticles','Honeycomb','ScrollingHandles','ScrollingHandles3D','HorizontalWatermarks'] as const;
