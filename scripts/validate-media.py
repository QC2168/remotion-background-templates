from pathlib import Path
import subprocess, json, shutil
import numpy as np
root=Path(__file__).resolve().parents[1]; out=root/'output'; reports=[]
bin_dir=root/'node_modules/@remotion/compositor-win32-x64-msvc'
ffmpeg=shutil.which('ffmpeg') or str(bin_dir/'ffmpeg.exe')
ffprobe=shutil.which('ffprobe') or str(bin_dir/'ffprobe.exe')
for path in sorted(out.glob('[0-9][0-9]-*.mp4')):
 if 'showcase' in path.name or 'preview' in path.name: continue
 probe=json.loads(subprocess.check_output([ffprobe,'-v','error','-show_streams','-show_format','-of','json',str(path)]))
 streams=probe['streams']; video=streams[0]
 expected_frames=360 if path.name=='13-HorizontalWatermarks.mp4' else 180
 assert len(streams)==1 and video['codec_type']=='video'
 assert video['codec_name']=='h264' and video['pix_fmt'] in ('yuv420p','yuvj420p')
 assert (video['width'],video['height'],video['r_frame_rate'],int(video['nb_frames']))==(1920,1080,'30/1',expected_frames)
 assert abs(float(probe['format']['duration'])-expected_frames/30)<.001
 frames=np.frombuffer(subprocess.check_output([ffmpeg,'-v','error','-i',str(path),'-s','480x270','-pix_fmt','gray','-vsync','0','-f','rawvideo','-']),np.uint8).reshape(expected_frames,270,480).astype(float)
 diffs=np.abs(np.diff(frames,axis=0)).mean(axis=(1,2))
 seam=float(np.abs(frames[-1]-frames[0]).mean())
 reports.append({'file':path.name,'frames':expected_frames,'mean_luma':float(frames.mean()),'sample_stddev':float(frames[60].std()),'mean_adjacent_diff':float(diffs.mean()),'max_adjacent_diff':float(diffs.max()),'loop_seam_diff':seam,'motion_detected':bool(diffs.max()>0)})
 assert frames[60].std()>0, 'Blank output'
 assert diffs.max()>0, 'No motion'
 # Seam is one normal frame step, with tolerance for dark low-bitrate quantization.
 assert seam<=max(float(diffs.max())*3,0.2),f'Inspect loop seam: {path.name}'
print(json.dumps(reports,indent=2)); (out/'motion-validation.json').write_text(json.dumps(reports,indent=2))
