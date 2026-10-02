import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia, renderStill} from '@remotion/renderer';
import {mkdir, writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
const output = path.resolve('output');
await mkdir(output, {recursive:true});
const windowsChrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ||
 (process.platform === 'win32' && existsSync(windowsChrome) ? windowsChrome : undefined);
const serveUrl = await bundle({entryPoint:path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl,id:'HorizontalWatermarks',browserExecutable});
const options = {composition,serveUrl,browserExecutable,chromiumOptions:{gl:'swangle'}};
for (const frame of [0,1,90,179,180,181,270,358,359]) {
 await renderStill({...options,frame,output:path.join(output,`13-HorizontalWatermarks-f${String(frame).padStart(3,'0')}.png`)});
 console.log(`Still ${frame}`);
}
await renderMedia({...options,codec:'h264',pixelFormat:'yuv420p',crf:18,concurrency:2,
 outputLocation:path.join(output,'13-HorizontalWatermarks.mp4'),
 onProgress:({progress})=>{if(Math.round(progress*100)%10===0) process.stdout.write(`Render ${Math.round(progress*100)}%\r`);}});
await writeFile(path.join(output,'composition.json'),JSON.stringify(composition,null,2));
console.log('\nRendered 13-HorizontalWatermarks.mp4');
