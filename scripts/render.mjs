import {bundle} from '@remotion/bundler';
import {getCompositions,renderMedia,renderStill} from '@remotion/renderer';
import {mkdir} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
const out=path.resolve(root,'output');
await mkdir(out,{recursive:true});
const browserExecutable=process.env.REMOTION_BROWSER_EXECUTABLE || undefined;
const serveUrl=await bundle({entryPoint:path.resolve(root,'src/index.ts')});
const compositions=await getCompositions(serveUrl,{browserExecutable});
for (let i=0;i<compositions.length;i++) {
 const composition=compositions[i]; const prefix=`${String(i+1).padStart(2,'0')}-${composition.id}`;
 if(process.env.ONLY && !process.env.ONLY.split(',').includes(composition.id)) continue;
 console.log(`Rendering ${prefix}`);
 await renderMedia({composition,serveUrl,codec:'h264',outputLocation:path.join(out,`${prefix}.mp4`),crf:18,pixelFormat:'yuv420p',browserExecutable,concurrency:2,chromiumOptions:{gl:'swangle'}});
 for(const frame of [0,60,179]) await renderStill({composition,serveUrl,output:path.join(out,`${prefix}-f${frame}.png`),frame,imageFormat:'png',browserExecutable,chromiumOptions:{gl:'swangle'}});
 console.log(`Finished ${prefix}`);
}
