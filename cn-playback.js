/* 年内展示进度独立于随机数；保存后恢复同一条事件的位置。 */
(function(G){
  function start(l,index){const end=l.log.length;l.playback={age:l.age,start:index,end,progress:0};for(let i=index;i<end;i++)l.log[i].month=Math.max(1,Math.round((i-index+1)*12/(end-index+1)));}
  function limit(l){const p=l.playback;return p?Math.min(p.end,p.start+Math.floor(p.progress*(p.end-p.start+1))):l.log.length;}
  function visible(l,i){return !l.playback||i<limit(l)||i>=l.playback.end;}
  function update(l,progress){const before=limit(l);if(l.playback)l.playback.progress=Math.max(0,Math.min(1,progress));return before!==limit(l);}
  function finish(l){delete l.playback;}
  G.CNPlayback={start,limit,visible,update,finish};
})(typeof window!=='undefined'?window:globalThis);
