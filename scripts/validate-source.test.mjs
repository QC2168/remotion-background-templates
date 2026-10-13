import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const code=readFileSync('src/Backgrounds.tsx','utf8');
const watermarkCode=readFileSync('src/HorizontalWatermarks.tsx','utf8')+readFileSync('src/LayeredWatermarks.tsx','utf8');
test('fourteen exported reusable backgrounds',()=>assert.equal(((code+watermarkCode).match(/export const \w+: React.FC<BackgroundProps>/g)||[]).length,14));
test('no time-dependent or unseeded animation sources',()=>{for(const token of ['Math.random(','Date.now(','requestAnimationFrame(','setInterval('])assert.equal((code+watermarkCode).includes(token),false);});
test('existing compositions stay six seconds; backgrounds 13 and 14 loop for twelve seconds',()=>{const root=readFileSync('src/Root.tsx','utf8');for(const value of ['width={1920}','height={1080}','fps={30}','durationInFrames={i>=12?360:180}'])assert.ok(root.includes(value));});
