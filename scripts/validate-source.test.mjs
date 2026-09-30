import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const code=readFileSync('src/Backgrounds.tsx','utf8');
test('twelve exported reusable backgrounds',()=>assert.equal((code.match(/export const \w+: React.FC<BackgroundProps>/g)||[]).length,12));
test('no time-dependent or unseeded animation sources',()=>{for(const token of ['Math.random(','Date.now(','requestAnimationFrame(','setInterval('])assert.equal(code.includes(token),false);});
test('compositions render Full HD at 30fps for six seconds',()=>{const root=readFileSync('src/Root.tsx','utf8');for(const value of ['width={1920}','height={1080}','fps={30}','durationInFrames={180}'])assert.ok(root.includes(value));});
