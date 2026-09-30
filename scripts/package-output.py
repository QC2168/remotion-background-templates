"""Requires ffmpeg/ffprobe and Pillow. Builds labels from actual rendered MP4 frames."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import subprocess,json
root=Path(__file__).resolve().parents[1]; out=root/'output'; temp=out/'assembly'; temp.mkdir(exist_ok=True)
names=['黑底规则点阵','渐隐点阵','细线网格','透视点阵','透视地平线网格','柔光渐变与轻噪点','等高线与波纹线','HUD 弱装饰','微粒漂浮','六边形蜂窝','@文本2D上滚','@文本3D透视上滚']
font='/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
font_b='/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
clips=sorted(p for p in out.glob('[0-9][0-9]-*.mp4') if 'showcase' not in p.name and 'preview' not in p.name); assert len(clips)==12
sheet=Image.new('RGB',(1920,3580),'#10141b'); draw=ImageDraw.Draw(sheet)
draw.text((46,30),'QUIET BACKGROUNDS',font=ImageFont.truetype(font_b,35),fill='#f3f5f8')
draw.text((46,82),'12 REMOTION STUDIES  /  1920 x 1080  /  30 FPS  /  6 SEC LOOPS',font=ImageFont.truetype(font,19),fill='#99a6b7')
probes=[]
for i,(clip,name) in enumerate(zip(clips,names)):
 frame=temp/f'{i:02}.png'
 subprocess.run(['ffmpeg','-v','error','-y','-ss','2','-i',str(clip),'-frames:v','1',str(frame)],check=True)
 img=Image.open(frame).convert('RGB').resize((896,504),Image.Resampling.LANCZOS)
 x=48+(i%2)*936; y=146+(i//2)*570
 sheet.paste(img,(x,y)); draw.rectangle((x,y,x+895,y+503),outline='#29323e')
 draw.text((x,y+519),f'{i+1:02}  {name}',font=ImageFont.truetype(font,24),fill='#dde3ed')
 sheet.save(out/'12-backgrounds-contact-sheet.png')
 labeled=temp/f'{i:02}.mp4'
 vf=f"drawbox=x=48:y=42:w=680:h=90:color=black@0.72:t=fill,drawtext=fontfile={font_b}:text='{i+1:02}  {name}':x=72:y=62:fontsize=28:fontcolor=0xe9edf4,drawtext=fontfile={font}:text='Remotion / 1080p / 30 fps / 6 s':x=72:y=102:fontsize=16:fontcolor=0x9aa8bb"
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(clip),'-vf',vf,'-c:v','libx264','-crf','18','-preset','ultrafast','-threads','2','-pix_fmt','yuv420p','-an',str(labeled)],check=True)
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(clip)]));probes.append({'file':clip.name,'probe':probe})
 stream=probe['streams'][0]; assert stream['width']==1920 and stream['height']==1080 and stream['r_frame_rate']=='30/1' and int(stream['nb_frames'])==180 and len(probe['streams'])==1
sheet.save(out/'12-backgrounds-contact-sheet.png')
(temp/'concat.txt').write_text(''.join(f"file '{i:02}.mp4'\n" for i in range(12)))
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(temp/'concat.txt'),'-c','copy','-movflags','+faststart',str(out/'12-backgrounds-showcase.mp4')],check=True)
(out/'ffprobe-validation.json').write_text(json.dumps(probes,indent=2))
print('Created contact sheet, 60-second labeled showcase, and ffprobe report')
