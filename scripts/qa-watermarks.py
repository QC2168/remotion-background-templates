import json, subprocess, shutil
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
out = root / 'output'
bin_dir = root / 'node_modules/@remotion/compositor-win32-x64-msvc'
ffmpeg = shutil.which('ffmpeg') or str(bin_dir/'ffmpeg.exe')
ffprobe = shutil.which('ffprobe') or str(bin_dir/'ffprobe.exe')
video = out / '13-HorizontalWatermarks.mp4'
probe = json.loads(subprocess.check_output([ffprobe,'-v','error','-show_streams','-show_format','-of','json',str(video)]))
streams = probe['streams']
assert len(streams)==1 and streams[0]['codec_type']=='video', 'Must have video only'
s=streams[0]
assert (s['width'],s['height'],s['r_frame_rate'],s['nb_frames'])==(1920,1080,'30/1','360')
assert abs(float(probe['format']['duration'])-12)<0.001

def still(f):
 return np.array(Image.open(out/f'13-HorizontalWatermarks-f{f:03}.png').convert('RGB')).astype(float)
a=still(0)
motion=[]
template=a[526:600,965:1075]
for frame,dx,dy in [(90,-121.5,70),(180,-243,140),(270,-364.5,210)]:
 b=still(frame)
 candidates=[]
 for tx in range(round(dx)-2,round(dx)+3):
  for ty in range(dy-2,dy+3):
   error=float(np.abs(template-b[526+ty:600+ty,965+tx:1075+tx]).mean())
   candidates.append((error,tx,ty))
 error,tx,ty=min(candidates)
 assert error<1.8 and abs(tx-dx)<=1 and ty==dy, (frame,error,tx,ty)
 assert tx<0 and ty>0
 motion.append({'frame':frame,'expected_screen_translation':[dx,dy],'matched_same_DIV_translation':[tx,ty],'template_pixel_mae':error})
full_shift_error=float(np.abs(a[:-140,243:]-still(180)[140:,:-243]).mean())
assert full_shift_error<0.01, full_shift_error
seams={
 'first_step_mae':float(np.abs(still(1)-a).mean()),
 'last_step_mae':float(np.abs(still(359)-still(358)).mean()),
 'loop_seam_mae':float(np.abs(a-still(359)).mean()),
 'internal_modulo_before_mae':float(np.abs(still(180)-still(179)).mean()),
 'internal_modulo_after_mae':float(np.abs(still(181)-still(180)).mean()),
}
assert max(seams.values()) < min(seams.values())*1.15, seams
frames=[0,90,180,270,358,359]
for index, frame in enumerate(frames):
 subprocess.run([ffmpeg,'-v','error','-y','-i',str(video),'-ss',f'{frame/30:.9f}','-frames:v','1',str(out/f'decoded-{index+1:02}.png')],check=True)
contact=Image.new('RGB',(1440,588),'#101010')
draw=ImageDraw.Draw(contact)
coverage=[]
for index,frame in enumerate(frames):
 im=Image.open(out/f'decoded-{index+1:02}.png').convert('RGB')
 arr=np.asarray(im)
 tile_counts=[]
 for y in range(0,1080,218):
  for x in range(0,1920,243):
   patch=arr[y:min(y+218,1080),x:min(x+243,1920)]
   fraction=float((patch[:,:,0]>30).mean())
   tile_counts.append(fraction)
 assert min(tile_counts)>0.004, (frame,min(tile_counts))
 coverage.append({'frame':frame,'min_grid_cell_ink_fraction':min(tile_counts),'total_ink_fraction':float((arr[:,:,0]>30).mean())})
 col,row=index%3,index//3
 contact.paste(im.resize((480,270)),(col*480,row*294+24))
 draw.text((col*480+10,row*294+6),f'{frame/30:.3f}s / frame {frame}',fill='#eeeeee')
contact.save(out/'13-HorizontalWatermarks-contact.png')
report={'spec':{'width':1920,'height':1080,'fps':30,'frames':360,'duration_seconds':12,'audio_streams':0},'motion':motion,'full_frame_diagonal_shift_pixel_mae':full_shift_error,'adjacent_and_loop_mae':seams,'coverage':coverage,'ffprobe':probe}
(out/'13-HorizontalWatermarks-validation.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps({k:v for k,v in report.items() if k!='ffprobe'},indent=2))
