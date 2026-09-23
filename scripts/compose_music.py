# Legacy source generator for the original rest-class tracks.
# WARNING: do not overwrite the six downloaded city tracks.
"""Original procedural scores for UPSHIFT v3. No third-party samples.
Regenerate with Python + numpy + ffmpeg. Eight bars, smoothly wrapped reverb.
"""
from pathlib import Path
import numpy as np
import wave, subprocess, json, shutil
try:
 import imageio_ffmpeg
 FFMPEG=shutil.which("ffmpeg") or imageio_ffmpeg.get_ffmpeg_exe()
except ImportError:
 FFMPEG="ffmpeg"
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'assets'/'music';DEST.mkdir(exist_ok=True,parents=True)
SR=22050
SCORES=[
 ('taipei','巷口晚风',82,60,[0,5,9,7],0),
 ('tokyo','雨后的电子街',108,62,[0,7,9,5],1),
 ('vegas','霓虹翻面',118,57,[0,3,5,7],2),
 ('singapore','海峡晨光',94,65,[0,9,5,7],3),
 ('newyork','玻璃与晨报',88,58,[0,5,2,7],4),
 ('monaco','蔚蓝色周末',76,67,[0,7,5,9],5),
 ('class0','小小的房间',66,60,[0,5,0,7],6),
 ('class1','星期日的阳光',78,62,[0,9,5,7],0),
 ('class2','留给海风的时间',84,65,[0,5,9,7],5),
 ('class3','云端客房',72,64,[0,7,9,5],3),
 ('class4','私人海湾',68,67,[0,9,5,7],4),
 ('class5','时间的收藏家',62,60,[0,5,9,7],7),
]
def compose(key,title,bpm,tonic,prog,style):
 rng=np.random.default_rng(sum(map(ord,key)))
 beat=60/bpm;length=32*beat;N=int(SR*length);mix=np.zeros((N,2),dtype=np.float64)
 def add(sig,start,vol=.1,pan=0):
  idx=int(start*SR);n=len(sig);indices=(np.arange(n)+idx)%N
  mix[indices,0]+=sig*vol*np.sqrt((1-pan)/2);mix[indices,1]+=sig*vol*np.sqrt((1+pan)/2)
 def note(midi,dur,kind='keys'):
  t=np.arange(int(SR*dur))/SR;f=440*2**((midi-69)/12);phase=2*np.pi*f*t
  if kind=='pad':
   env=(1-np.exp(-t*3))*np.minimum(1,np.maximum(0,(dur-t)*3));sig=(np.sin(phase)+.22*np.sin(phase*2.001)+.08*np.sin(phase*3.002))*env
  elif kind=='bass':sig=(np.sin(phase)+.15*np.sin(phase*2))*np.exp(-t*3)*(1-np.exp(-t*90))
  elif kind=='bell':sig=(np.sin(phase+1.1*np.exp(-t*3)*np.sin(phase*2))+.12*np.sin(phase*3))*np.exp(-t*2.8)*(1-np.exp(-t*100))
  else:sig=(np.sin(phase)+.28*np.sin(phase*2)+.12*np.sin(phase*3))*np.exp(-t*3.8)*(1-np.exp(-t*150))
  sig*=np.minimum(1,np.maximum(0,(dur-t)*35));return sig
 for bar in range(8):
  base=tonic+prog[bar%4];minor=prog[bar%4] in (9,2,3) or style==2
  chord=[base,base+(3 if minor else 4),base+7,base+11 if not minor else base+10]
  start=bar*4*beat
  for j,n in enumerate(chord):
   add(note(n,beat*4.5,'pad'),start, .017 if style==6 else .034,(j-1.5)*.35)
   if style!=6:add(note(n+12,beat*2,'keys'),start+beat*(.0 if j%2==0 else .08),.045,(j-1.5)*.4)
  for n,k in enumerate([0,7,0,12]):
   add(note(base-24+k,beat*.85,'bass'),start+n*beat,.13 if style!=6 else .07,0)
  pattern=[0,2,1,3,2,1,3,2] if style in (1,2,3) else [0,2,3,2]
  for k,idx in enumerate(pattern):
   pos=start+k*(4/len(pattern))*beat+(beat*.07 if k%2 else 0)
   melody=chord[(idx+bar//4)%4]+(12 if style in (1,5,7) else 0)
   add(note(melody,beat*2.2,'bell' if style in (1,5,7) else 'keys'),pos,.075 if style!=6 else .055,float(np.sin(k)*.4))
  if style!=6:
   for b in range(4):
    pos=start+b*beat;t=np.arange(int(SR*.25))/SR
    kick=np.sin(2*np.pi*(48*t+5*(1-np.exp(-t*28))))*np.exp(-t*22)
    if b%2==0 or style==2:add(kick,pos,.15 if style in (1,2) else .075,0)
    if b%2==1:
     noise=rng.normal(0,1,len(t));snare=(noise*.15+np.sin(2*np.pi*180*t)*.08)*np.exp(-t*30);add(snare,pos,.09,0)
    for off in [0,.5]:
     t=np.arange(int(SR*.065))/SR;noise=rng.normal(0,1,len(t));h=(noise-np.roll(noise,1))*np.exp(-t*85);add(h,pos+off*beat,.016 if style in (1,2) else .008,.45)
 dry=mix.copy()
 for delay,wet in [(.16,.14),(.29,.1),(.43,.065)]:mix+=np.roll(dry,int(delay*SR),axis=0)[:,::-1]*wet
 # Gentle dynamics with preserved stereo room.
 mix=np.tanh(mix*1.45);peak=np.max(np.abs(mix));mix*=.77/max(.8,peak)
 tmp=DEST/(key+'.wav')
 with wave.open(str(tmp),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((mix*32767).astype('<i2').tobytes())
 subprocess.run([FFMPEG,'-y','-loglevel','error','-i',str(tmp),'-codec:a','libmp3lame','-b:a','80k',str(DEST/(key+'.mp3'))],check=True)
 tmp.unlink()
 return {'id':key,'title':title,'artist':'UPSHIFT procedural score','license':'Original synthesis; no sampled audio','source':'scripts/compose_music.py','bpm':bpm}
if __name__=='__main__':
 credits=[compose(*score) for score in SCORES if score[0].startswith('class')]
 (DEST/'ORIGINAL-SCORES.json').write_text(json.dumps(credits,ensure_ascii=False,indent=2))
 print('Created 6 original rest-class musical loops.')
