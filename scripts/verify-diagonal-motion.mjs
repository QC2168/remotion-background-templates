import {readFileSync} from 'node:fs';
import path from 'node:path';
import {createRequire, Module} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const filename=path.resolve('src/HorizontalWatermarks.tsx');
const compiled=ts.transpileModule(readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
const loaded=new Module(filename);
loaded.filename=filename;
loaded.paths=Module._nodeModulePaths(path.dirname(filename));
loaded._compile(compiled,filename);
const {watermarkOffset,WATERMARK_PERIOD}=loaded.exports;
const positions=[0,90,180,270,359,360].map(frame=>({frame,...watermarkOffset(frame,360)}));
for(const frame of [90,180,270,359]){
 const p=watermarkOffset(frame,360);
 assert.ok(p.x<0 && p.y>0);
 assert.ok(Math.abs(p.y/-p.x-280/486)<1e-12);
}
assert.deepEqual(watermarkOffset(360,360),watermarkOffset(0,360));
const length=Math.hypot(WATERMARK_PERIOD.x,WATERMARK_PERIOD.y);
assert.ok(Math.abs(length/12-560/12)<0.1,'Preserve previous overall speed');
console.log(JSON.stringify({positions,loop_vector:[-WATERMARK_PERIOD.x,WATERMARK_PERIOD.y],speed_pixels_per_second:length/12,angle_degrees:Math.atan2(WATERMARK_PERIOD.y,WATERMARK_PERIOD.x)*180/Math.PI},null,2));
