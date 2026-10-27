/* 中国模式界面：沿用上游的 HTML/CSS 结构、插图及像素资源。 */
(function () {
  'use strict';
  const E=window.CNEngine,D=window.CN_DATA,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const S={life:null,view:'home',paused:true,auto:false,speed:1,progress:0,tab:'fam',feedFilter:'all',feedStarred:false,feedExpanded:false,historySort:'recent',choice:null,map:null,storageWarned:false};
  const KEY='1incn-v1:';
  // 自定义选择器：同一套纸色菜单，支持键盘与触控。
  const selectWidgets=new Map();
  function closeMenus(){for(const w of selectWidgets.values()){w.menu.hidden=true;w.button.setAttribute('aria-expanded','false');}}
  function selectWidget(id,items,change){
    const button=$('#'+id),menu=document.createElement('div');menu.className='cn-select-menu';menu.id=id+'List';menu.role='listbox';menu.setAttribute('aria-label',button.getAttribute('aria-label'));menu.hidden=true;button.setAttribute('aria-controls',menu.id);button.parentElement.append(menu);
    menu.innerHTML=items.map(([value,label])=>`<button type="button" role="option" data-value="${esc(value)}" aria-selected="false">${esc(label)}<span aria-hidden="true">✓</span></button>`).join('');
    const choices=[...menu.querySelectorAll('button')];
    const update=value=>{button.value=value;button.innerHTML=esc(items.find(i=>i[0]===value)?.[1]||items[0][1])+'<span aria-hidden="true">⌄</span>';choices.forEach(b=>b.setAttribute('aria-selected',String(b.dataset.value===value)));};
    const open=()=>{closeMenus();menu.hidden=false;button.setAttribute('aria-expanded','true');};
    button.onclick=()=>{if(menu.hidden)open();else closeMenus();};
    button.onkeydown=e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();open();(choices.find(b=>b.dataset.value===button.value)||choices[0]).focus();}};
    choices.forEach((b,i)=>{b.onclick=()=>{update(b.dataset.value);closeMenus();button.focus();change(b.dataset.value);};b.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();closeMenus();button.focus();}else if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();choices[e.key==='Home'?0:e.key==='End'?choices.length-1:(i+(e.key==='ArrowDown'?1:-1)+choices.length)%choices.length].focus();}};});
    selectWidgets.set(id,{button,menu,update});update(items[0][0]);
  }
  document.addEventListener('click',e=>{if(!e.target.closest('.cn-select'))closeMenus();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenus();});
  document.addEventListener('focusin',e=>{if(!e.target.closest('.cn-select'))closeMenus();});
  document.addEventListener('click',e=>{$$('.cn-more[open]').forEach(m=>{if(!m.contains(e.target))m.open=false;});});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')$$('.cn-more[open]').forEach(m=>m.open=false);});
  if(window.ResizeObserver)new ResizeObserver(entries=>document.documentElement.style.setProperty('--hdr-h',entries[0].target.getBoundingClientRect().height+'px')).observe($('header.top'));

  function toast(t){$('#toast').textContent=t;$('#toast').hidden=false;clearTimeout(S.toastTimer);S.toastTimer=setTimeout(()=>$('#toast').hidden=true,3200);}
  const store={get(k,d){try{return JSON.parse(localStorage.getItem(KEY+k))??d;}catch{return d;}},set(k,v){try{localStorage.setItem(KEY+k,JSON.stringify(v));return true;}catch{if(!S.storageWarned){S.storageWarned=true;toast('浏览器无法保存记录，请导出这一生，或检查存储空间。');}return false;}}};
  function save(){if(S.life&&(S.life.alive||S.life.playback))store.set('current',E.serialize(S.life));}
  function saveAnnotations(){if(S.life?.alive||S.life?.playback)return save();if(!S.life)return;const past=store.get('past',[]);if(Array.isArray(past)){const i=past.findIndex(l=>l.seed===S.life.seed&&l.born.y===S.life.born.y);if(i>=0){past[i]=E.serialize(S.life);store.set('past',past);}}}
  function backupCurrent(){const current=store.get('current',null);if(!current?.alive&&!current?.playback)return;const previous=store.get('backups',[]);const backups=(Array.isArray(previous)?previous:[]).filter(l=>l.seed!==current.seed);backups.unshift(current);store.set('backups',backups.slice(0,3));}
  function openLife(raw){S.life=E.hydrate(JSON.parse(JSON.stringify(raw)));if(S.life.alive&&E.settleDebts(S.life))save();S.progress=S.life.playback?.progress||0;S.paused=true;S.feedExpanded=false;if(!S.life.started&&S.life.alive){renderBirth();go('birth');}else if(S.life.alive||S.life.playback){go('life');toast('已恢复记录，点击“继续”开始。');}else{renderEnd(S.life);go('end');}}

  function showResume(){const l=store.get('current',null);const valid=E.supportedVersions.includes(l?.version)&&(l.alive||l.playback);$('#btnResume').hidden=!valid;$('#resumeInfo').hidden=!valid;$('#resumeInfo').textContent=valid?`${l.name.sei}${l.name.mei} · ${l.age} 岁 · 出生于${l.birthPref}`:'';$('#btnBorn').classList.toggle('secondary',!!valid);}
  function go(id){if(!['home','birth','life','end','data','past'].includes(id))return;if(id!=='life'){S.paused=true;CNInteractions.close();save();}closeMenus();$('#globalMenu').open=false;$('#lifeMenu').open=false;S.view=id;document.body.dataset.view=id;$('#topPlayback').hidden=id!=='life';$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));if(id==='past')renderPast();if(id==='data')renderData();if(id==='home')showResume();if(S.life&&id==='life')renderLife();window.scrollTo({top:0,behavior:'instant'});}
  document.addEventListener('click',e=>{const a=e.target.closest('[data-go]');if(!a)return;e.preventDefault();go(a.dataset.go);});
  const theme=store.get('theme','light');document.documentElement.dataset.theme=theme==='dark'?'dark':'light';
  $('#themeBtn').onclick=()=>{const t=document.documentElement.dataset.theme==='light'?'dark':'light';document.documentElement.dataset.theme=t;store.set('theme',t);};
  const sound=window.Sound;
  $('#soundBtn').onclick=()=>{if(!sound)return;const enabled=!sound.enabled;sound.setEnabled(enabled);if(enabled){sound.init();sound.bgm(S.view==='home'?'home':'child');}$('#soundBtn').textContent=enabled?'♪':'♪̸';$('#soundBtn').setAttribute('aria-label',enabled?'关闭声音':'打开声音');$('#soundBtn').setAttribute('aria-pressed',String(enabled));};
  function sfx(){if(sound?.enabled)sound.sfx('click');}
  document.addEventListener('click',e=>{if(e.target.closest('button'))sfx();});
  const opened=Date.now();
  setInterval(()=>{const seconds=(Date.now()-opened)/1000;$('#cBirth').textContent=Math.floor(seconds*D.national.births/31557600).toLocaleString('zh-CN');$('#cDeath').textContent=Math.floor(seconds*D.national.deaths/31557600).toLocaleString('zh-CN');},1000);
  const project=xy=>[(xy[0]-73)*8.8,(54-xy[1])*8.8];
  function mapSVG(selected){
    if(!S.map)return `<p class="cn-empty">${S.mapFailed?'地图暂时不可用，仍可开始人生。':'正在展开地图…'}</p>`;
    let label='';
    const paths=S.map.features.map(f=>{
      const p=E.province(f.properties.name),active=f.properties.name===selected;
      const polys=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];
      const d=polys.map(poly=>poly.map(ring=>ring.map((xy,i)=>`${i?'L':'M'}${project(xy).map(n=>n.toFixed(1)).join(',')}`).join('')+'Z').join('')).join('');
      if(active){const xy=project(f.properties.centroid||f.properties.center);label=`<g><circle cx="${xy[0]}" cy="${xy[1]}" r="6" fill="var(--accent)" stroke="var(--paper)" stroke-width="2"/><text class="cn-map-label" x="${xy[0]+10}" y="${xy[1]-8}">${esc(selected)}</text></g>`;}
      const alpha=p?(.12+.65*Math.sqrt(p.population/126012510)):.08;
      return `<path class="cn-province${active?' selected':''}" fill-rule="evenodd" style="fill:color-mix(in srgb,var(--accent) ${Math.round(alpha*100)}%,var(--tile))" d="${d}"><title>${esc(f.properties.name)}${p?' · 七普人口 '+(p.population/10000).toFixed(1)+' 万人':''}</title></path>`;
    }).join('');
    return `<svg viewBox="0 0 560 460" role="img" aria-label="中国省级地图${selected?'，出生于'+esc(selected):''}">${paths}${label}</svg>`;
  }
  fetch('china-map.json').then(r=>{if(!r.ok)throw Error('地图读取失败');return r.json();}).then(j=>{S.map=j;$('#homeMap').innerHTML=mapSVG();if(S.life)$('#jmap').innerHTML=mapSVG(S.life.birthPref);}).catch(()=>{S.mapFailed=true;$('#homeMap').innerHTML=mapSVG();});
  $('#homeMap').innerHTML=mapSVG();
  function seed(){return crypto.getRandomValues(new Uint32Array(1))[0];}
  function newLife(){save();backupCurrent();S.life=E.createLife({seed:seed()});S.progress=0;S.speed=1;$$('[data-speed]').forEach(b=>{const on=b.dataset.speed==='1';b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));});S.feedExpanded=false;S.life.started=false;save();renderBirth();go('birth');}
  function renderBirth(){const l=S.life;$('#jmap').innerHTML=mapSVG(l.birthPref);$('#bPlace').textContent=E.place(l.birthPref,l.birthCity);$('#bTime').textContent=`${l.born.y} 年 ${l.born.m} 月 ${l.born.d} 日 · ${l.sex==='M'?'男孩':'女孩'} · ${l.born.weight.toFixed(2)} 公斤`;$('#birthTags').innerHTML=[l.origin.settlement,l.origin.family].map(t=>`<span>${esc(t)}</span>`).join('');$('#inSei').value=l.name.sei;$('#inMei').value=l.name.mei;$('#bFamily').innerHTML=familyRows(l,true);$('#familyMood').textContent=['家人亲近 · 一起吃饭，慢慢长大','热热闹闹 · 屋子里有说有笑','安安静静 · 普通日子里的陪伴'][l.seed%3];CNAnimation.birth(l);}

  $('#btnBorn').onclick=newLife;
  $('#btnResume').onclick=()=>{try{openLife(store.get('current',null));}catch(e){toast(e.message||'存档无法读取，可以重新出生。');}};
  $('#btnStart').onclick=()=>{const sei=$('#inSei').value.trim(),mei=$('#inMei').value.trim();if(!sei||!mei){toast('请填写姓氏和名字。');return;}S.life.name.sei=sei;S.life.name.mei=mei;S.life.fam.father.sei=sei;S.life.started=true;S.paused=false;S.progress=0;save();go('life');};
  selectWidget('selFocus',Object.keys(D.focus).map(n=>[n,n]),value=>{if(!S.life?.alive||S.life.age<6)return;S.life.focus=value;save();});
  $('#chkAuto').onchange=e=>{S.auto=e.target.checked;store.set('auto',S.auto);if(S.auto&&!$('#modal').open&&S.life?.alive){processChoices();save();renderLife();}};
  S.auto=!!store.get('auto',false);$('#chkAuto').checked=S.auto;
  $$('[data-speed]').forEach(b=>b.onclick=()=>{S.speed=Number(b.dataset.speed);$$('[data-speed]').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',String(x===b));});});
  $('#btnPlay').onclick=()=>{if(!S.life||!S.life.alive&&!S.life.playback)return;S.paused=!S.paused;if(!S.paused&&!S.life.playback)processChoices();renderLife();};
  $('#mobileDetails').onclick=()=>{S.paused=true;$('#lifeMenu').open=false;renderControls();document.querySelector('.cn-side').scrollIntoView({behavior:'auto',block:'start'});};
  $('#mobileDetailsCompact').onclick=$('#mobileDetails').onclick;
  $('#backToLife').onclick=()=>document.querySelector('.lifehead').scrollIntoView({behavior:'auto',block:'start'});
  function renderControls(){const l=S.life;$('#btnPlay').disabled=!l||!l.alive&&!l.playback;$('#btnPlay').textContent=S.paused?'继续':'暂停';$('#btnNote').disabled=!l?.alive;$('#btnAssets').hidden=!l||l.age<6;$('#btnAssets').disabled=!l?.alive;$('#selFocus').disabled=!l?.alive;$('#selFocusList [data-value="事业"]').hidden=!!l?.retired;if(l?.retired&&l.focus==='事业'){l.focus='平衡';selectWidgets.get('selFocus').update(l.focus);}$('#focusControl').hidden=!l||l.age<6;$('#chkAuto').disabled=!l?.alive;$('#yearFill').style.width=Math.min(100,S.progress*100)+'%';$('#yearMonth').textContent=Math.min(12,Math.floor(S.progress*12)+1)+' 月';}
  function resolveDecision(d,i,p=CNInteractions.describe(S.life,d)){
    const l=S.life,start=l.log.length;E.resolve(l,d,i);
    const result=l.log.slice(start),record=l.choices[l.choices.length-1];
    if(record?.id===d.id)record.presentation={...p,result:result.map(e=>({t:e.t}))};
    S.choice=null;save();renderLife();return result;
  }
  function processChoices(){const l=S.life;if(!l?.alive||l.playback)return false;for(let n=0;n<32;n++){const d=E.pendingDecisions(l)[0];if(!d)return true;if(S.auto&&!/^(out_|relationship_|proposal_)/.test(d.id)){resolveDecision(d,E.autoChoice(l,d));continue;}showChoice(d);return false;}throw Error('选择循环超出范围');}
  function advance(manual=false){
    const l=S.life;if(!l||S.view!=='life'||document.querySelector('dialog[open]'))return;
    if(l.playback){CNPlayback.update(l,1);CNPlayback.finish(l);renderLife();if(!l.alive){complete(l);return;}}
    if(!l.alive)return;
    if(!processChoices()){save();renderLife();return;}
    const start=l.log.length;if(!E.step(l))return;CNPlayback.start(l,start);S.progress=0;save();renderLife();
  }
  function showChoice(d){S.choice=d;CNInteractions.open(CNInteractions.describe(S.life,d),{resolve:(i,p)=>resolveDecision(d,i,p),next:()=>{processChoices();save();},hold:holdChoice});}
  function holdChoice(){S.paused=true;S.choice=null;renderControls();save();toast('选择已保留，点击顶部“继续”再决定。');}
  const stats=[['health','健康','#5c8a5a'],['happy','心情','#c77b54'],['know','知识','#497aaa'],['social','关系','#8d70a2']];
  function renderLife(){const l=S.life;if(!l)return;
    $('#lName').textContent=E.nameOf(l);$('#lWhere').textContent=`${l.sex==='M'?'男':'女'} · ${E.place(l.birthPref,l.birthCity)}出生${l.pref!==l.birthPref||l.city!==l.birthCity?' · 现居'+E.place(l.pref,l.city):' · '+l.origin.settlement+'长大'}`;$('#lStatus').textContent=E.statusLabel(l);
    $('#lAge').textContent=l.age;$('#lYear').textContent=l.year+'年';$('#sbAge').textContent=l.age;$('#sbYear').textContent=l.year+'年';$('#sbChar').innerHTML=CN_PIXEL.pixelChar(l);
    selectWidgets.get('selFocus').update(l.focus);CNAnimation.update({...l,log:l.log.filter((e,i)=>CNPlayback.visible(l,i))});
    $('#stats').innerHTML=stats.map(([k,n,c])=>`<div class="stat"><span class="lbl">${n}</span><b>${Math.round(l.stats[k])}</b><div class="bar"><i style="width:${l.stats[k]}%;background:${c}"></i></div></div>`).join('');
    $('#money').innerHTML=CNLocal.isDependent(l)?'<div>日常开支由家庭承担</div>':`<div>${l.retired?'年养老金':'年收入'}<b>${esc(E.money(CNEconomy.earned(l)))}</b></div><div>${l.retired?'每月养老金':'折合每月'}<b>${esc(E.money(CNEconomy.earned(l)/12))}</b></div><div>${l.savings>=0?'结余':'债务'}<b>${esc(E.money(Math.abs(l.savings)))}</b></div>${l.debt?`<div>借款<b>${esc(E.money(l.debt))}</b></div>`:''}`;
    renderFeed();renderSide();renderPrivate();renderControls();
  }
  const iconFor={birth:'baby',family:'family',school:'school',work:'work',choice:'turn',money:'coin',health:'hospital',death:'candle',story:'leaf',note:'book',action:'leaf'};
  function icon(c){const il=window.ILLUST||{};return il[iconFor[c]]||il.book||il.family||'';}
  function renderFeed(){const l=S.life;if(!l)return;
    const list=l.log.map((e,i)=>({...e,index:i})).filter(e=>CNPlayback.visible(l,e.index));
    const ages=[...new Set(list.map(e=>e.age))].sort((a,b)=>b-a),shown=S.feedExpanded?ages:ages.slice(0,8);
    const root=$('#feed'),key=[l.seed,l.born.y,l.name.sei,l.name.mei].join(':');
    if(root.dataset.lifeKey!==key){root.replaceChildren();root.dataset.lifeKey=key;}
    const years=new Map([...root.children].map(n=>[Number(n.dataset.age),n]));let cursor=root.firstElementChild;
    for(const a of shown){
      let year=years.get(a);if(!year){year=document.createElement('li');year.className='yearmark';year.dataset.age=a;year.append(document.createTextNode(`${l.born.y+a} 年 · ${a} 岁`));const sub=document.createElement('ol');sub.className='feed sub';year.append(sub);}
      if(year!==cursor)root.insertBefore(year,cursor);cursor=year.nextElementSibling;years.delete(a);
      const sub=year.querySelector('ol'),rows=new Map([...sub.children].map(n=>[Number(n.dataset.index),n]));let rowCursor=sub.firstElementChild;
      for(const e of list.filter(e=>e.age===a).reverse()){
        let row=rows.get(e.index);if(!row){row=document.createElement('li');row.dataset.index=e.index;row.innerHTML=`<button class="star" data-star="${e.index}"></button><span class="a">${a} 岁</span><span class="ic" aria-hidden="true">${icon(e.c)}</span><span class="tw"></span>`;}
        row.className=`${e.tone} ${e.c}${e.star?' starred':''}`;const star=row.querySelector('.star');star.textContent=e.star?'★':'☆';star.setAttribute('aria-label',(e.star?'取消收藏':'收藏')+'这一刻');star.setAttribute('aria-pressed',String(!!e.star));
        const words=row.querySelector('.tw');if(words.textContent!==e.t)words.textContent=e.t;
        if(row!==rowCursor)sub.insertBefore(row,rowCursor);rowCursor=row.nextElementSibling;rows.delete(e.index);
      }
      rows.forEach(n=>n.remove());
    }
    years.forEach(n=>n.remove());
    if(!shown.length&&!root.children.length){const empty=document.createElement('li');empty.textContent='这里还没有记录。想记住的瞬间，可以点旁边的星星收藏。';root.append(empty);}
    $('#feedMore').hidden=S.feedExpanded||ages.length<=8;
    $('#feedMore button').textContent=`翻看更早的 ${Math.max(0,ages.length-8)} 个年份`;
  }
  $('#feedMore').onclick=()=>{S.feedExpanded=true;renderFeed();};
  $('#feed').onclick=e=>{const star=e.target.closest('[data-star]');if(star){const row=S.life?.log[Number(star.dataset.star)];if(row){row.star=!row.star;saveAnnotations();renderFeed();renderExtraSide();}}if(e.target.closest('[data-more]')){S.feedExpanded=true;renderFeed();}};

  function familyRows(l,birth=false){const f=l.fam;
    const parent=p=>p?`${esc((p.sei||'')+p.name)} · ${p.alive?(p.age0+l.age)+' 岁 · '+esc(p.job.title)+' · 健康 '+Math.round(p.health??75):'享年 '+(p.deathAge??p.age0+l.age)+' 岁'}`:'暂无记录';
    return `<dt>家庭住处</dt><dd>${esc(!birth&&l.flags.livingWithChild?l.flags.livingWithChild.city+' · 和'+l.flags.livingWithChild.name+'一家同住':l.house?.name||f.home)}</dd><dt>父亲</dt><dd>${parent(f.father)}</dd><dt>母亲</dt><dd>${parent(f.mother)}</dd>${birth?`<dt>家庭年收入</dt><dd>约 ${esc(E.money(f.parentHH))}</dd><dt>兄弟姐妹</dt><dd>${f.siblings.length?f.siblings.map(s=>esc((s.sei||l.name.sei)+s.name)+'（'+s.age+'岁）').join('、'):'暂时是家里唯一的孩子'}</dd>`:`<dt>学历 / 学习</dt><dd>${esc(l.eduDone||l.edu.label)}${l.edu.major?' · '+esc(l.edu.major):''}</dd><dt>伴侣</dt><dd>${esc(l.spouse?.name||l.partner?.name||'暂无')}${l.spouse?(l.spouse.union==='partnership'?' · 长期伴侣':' · 已婚'):l.partner?' · 交往中':''}</dd><dt>孩子</dt><dd>${l.kids.length?l.kids.map(k=>esc(k.name)+(k.adopted?' · 领养':'')+(k.alive===false?'（已故）':'（'+(l.age-k.birthAge)+'岁）')).join('、'):'暂无'}</dd>${l.kids.some(k=>k.grandchild)?`<dt>孙辈</dt><dd>${l.kids.filter(k=>k.grandchild).map(k=>esc(k.grandchild.name)+'（'+(l.age-k.grandchild.birthAge)+'岁）').join('、')}</dd>`:''}<dt>兄弟姐妹</dt><dd>${f.siblings.length?f.siblings.map(s=>esc((s.sei||l.name.sei)+s.name)+(s.alive===false?'（已故）':'（'+(s.age+l.age)+'岁）')).join('、'):'暂无'}</dd><dt>朋友</dt><dd>${l.friends.map(p=>esc(p.role+' '+p.name)+(p.alive?'':'（已故）')).join('、')}</dd><dt>兴趣</dt><dd>${esc(l.hobbies.join('、')||'慢慢探索中')}</dd>${l.age>=6?`<dt>生活重心</dt><dd>${esc(l.focus)}</dd>`:''}`}`;
  }

  function renderSide(){const l=S.life;$('#tab-fam').innerHTML=`<h3>身边的人，日常的事</h3><dl class="famlist">${familyRows(l)}</dl>`;
    $('#tab-map').innerHTML=`<h3>这一生，走过哪里</h3><div class="cn-trail">${l.trail.map(t=>`<p><small class="muted">${t.age} 岁 · ${l.born.y+t.age} 年</small><br>${esc(t.pref)} · ${esc(t.city)}${t.age===0?' · 出生':''}</p>`).join('')}</div>`;
    renderExtraSide();
    const snaps=l.snaps.filter(Boolean),W=320,H=180,X=a=>28+a/Math.max(1,l.age)*275,Y=v=>150-v*1.25;
    $('#tab-curve').innerHTML=`<h3>普通日子的起起落落</h3><svg class="cn-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="健康与心情随年龄变化的曲线">${[0,50,100].map(v=>`<line x1="28" y1="${Y(v)}" x2="303" y2="${Y(v)}" stroke="var(--line)"/><text x="2" y="${Y(v)+4}">${v}</text>`).join('')}<polyline points="${snaps.map(s=>`${X(s.age)},${Y(s.health)}`).join(' ')}" fill="none" stroke="#5c8a5a" stroke-width="2"/><polyline points="${snaps.map(s=>`${X(s.age)},${Y(s.happy)}`).join(' ')}" fill="none" stroke="#c77b54" stroke-width="2"/><text x="28" y="174">0 岁</text><text x="270" y="174">${l.age} 岁</text></svg><p class="small"><span style="color:#5c8a5a">● 健康</span>　<span style="color:#c77b54">● 心情</span></p>`;
  }
  function renderExtraSide(){if(!S.life)return;$('#tab-budget').innerHTML=CNViews.budget(S.life);$('#tab-badges').innerHTML=CNViews.badges(S.life);if(S.tab==='peers')$('#tab-peers').innerHTML=CNViews.peers(S.life);}
  $$('[data-tab]').forEach((b,i,all)=>{b.onclick=()=>{S.tab=b.dataset.tab;renderExtraSide();all.forEach(x=>{const active=x===b;x.classList.toggle('active',active);x.setAttribute('aria-selected',String(active));x.tabIndex=active?0:-1;});$$('.tabpane').forEach(x=>x.classList.toggle('active',x.id==='tab-'+S.tab));};b.tabIndex=i===0?0:-1;b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?all.length-1:(i+(e.key==='ArrowRight'?1:-1)+all.length)%all.length;all[next].click();all[next].focus();};});

  function renderPrivate(){const l=S.life,o=E.privateOptions(l);$('#privateMatters').hidden=!o.length;if(!o.length)return;const q=l.queer;$('#privateMatters').innerHTML=`<p class="eyebrow">心里的事，按自己的节奏</p><h3>真实的自己</h3><p class="small muted">喜欢谁、向谁说，都是你自己的事。保留隐私也是一种选择。</p><div class="cn-private-actions">${o.map(x=>`<button class="ghost small" data-private="${x.id}" ${x.disabled?'disabled':''}>${esc(x.disabled?x.id==='friends'?'朋友已知情':x.id==='family'?'家人已知情':'已公开身份':x.label)}</button>`).join('')}</div>${q.out.family==='strained'?'<p class="small muted">和家人的关系还在磨合中，给彼此一点空间。</p>':''}`;}
  $('#privateMatters').onclick=e=>{const b=e.target.closest('[data-private]');if(!b)return;S.paused=true;if(E.requestPrivate(S.life,b.dataset.private)){save();const d=E.pendingDecisions(S.life)[0];if(d)showChoice(d);renderControls();}};
  let assetIntent=null;
  function clearAssetIntent(){if(assetIntent?.button){assetIntent.button.innerHTML=assetIntent.html;assetIntent.button.removeAttribute('data-confirming');assetIntent.button.removeAttribute('aria-describedby');}$('#assetInlineHint')?.remove();assetIntent=null;}
  function renderAssets(){clearAssetIntent();$('#assetBody').innerHTML=CNViews.assets(S.life);}
  $('#btnAssets').onclick=()=>{if(!S.life||S.life.age<6)return;S.paused=true;closeMenus();$('#lifeMenu').open=false;renderControls();renderAssets();$('#assetDialog').showModal();};
  $('#assetClose').onclick=()=>$('#assetDialog').close();$('#assetDialog').onclose=clearAssetIntent;
  $('#assetBody').onclick=e=>{const b=e.target.closest('[data-asset]');if(!b||b.disabled)return;
    if(assetIntent?.button===b){const {action,args}=assetIntent;clearAssetIntent();b.disabled=true;const result=E.transact(S.life,action,args);if(result.ok){save();renderLife();}renderAssets();toast(result.message);return;}
    clearAssetIntent();assetIntent={button:b,html:b.innerHTML,action:b.dataset.asset,args:JSON.parse(b.dataset.args||'{}')};const label=b.textContent;b.textContent='确认：'+label;b.dataset.confirming='true';
    const hint=document.createElement('p');hint.id='assetInlineHint';hint.className='cn-inline-confirm';hint.setAttribute('role','status');hint.textContent=(b.dataset.confirm||'确认这项安排。')+' 再次点击当前按钮确认。';b.setAttribute('aria-describedby',hint.id);b.parentElement.insertBefore(hint,b.nextSibling);
  };
  function openDocuments(){
    if(!S.life)return;S.paused=true;$('#lifeMenu').open=false;renderControls();const l=S.life;
    const records=l.choices.filter(c=>c.presentation&&c.presentation.kind!=='sheet').slice().reverse();
    $('#correspondenceBody').innerHTML=(l.finances?'<button type="button" id="readPayslip">年度收入与到账单<small>查看当前账本生成的文书</small></button>':'')+(records.map((c,i)=>`<button type="button" data-record="${i}">${esc(c.presentation.title)}<small>${c.age} 岁 · ${esc(c.presentation.from || c.presentation.doc || '人生中的决定')}</small></button>`).join('')||'<p class="small muted">收到的第一封信还在路上。小学毕业时，会有人在纪念册里给你留下一封信。</p>');
    $('#correspondenceDialog').showModal();
    $$('[data-record]').forEach(b=>b.onclick=()=>{
      const c=records[Number(b.dataset.record)],p=c.presentation;$('#correspondenceDialog').close();
      CNInteractions.open({...p,readonly:true,options:[{i:0,label:'收好这页记录',hint:`当时的选择：${c.label}`}],msgs:p.msgs?.concat(p.result?.map(e=>e.t)||[])},{next:openDocuments,hold:openDocuments});
    });
    if($('#readPayslip'))$('#readPayslip').onclick=()=>{
      const f=l.finances,p={kind:'payslip',title:'年度收入与到账单',age:l.age,year:l.year,name:E.nameOf(l),job:l.job?.title || (l.retired?'退休收入':'本年收入'),rows:[['账本个人税前收入',E.money(f.gross || 0)],['伴侣共同投入',E.money(f.spousePay || 0)]],deductions:[['薪酬扣除',E.money(Math.max(0,(f.gross || 0)-(f.pay || 0)))]],net:E.money(f.pay || 0),readonly:true,options:[{i:0,label:'收好这页账单'}]};
      $('#correspondenceDialog').close();CNInteractions.open(p,{next:openDocuments,hold:openDocuments});
    };
  }
  $('#btnLetters').onclick=openDocuments;$('#correspondenceClose').onclick=()=>$('#correspondenceDialog').close();
  let noteWasPaused=true;
  $('#btnNote').onclick=()=>{if(!S.life?.alive)return;noteWasPaused=S.paused;S.paused=true;$('#noteTitle').textContent=`${S.life.age} 岁，记下这一刻`;$('#noteText').value='';$('#noteDialog').showModal();renderControls();};
  $('#noteCancel').onclick=()=>$('#noteDialog').close();
  $('#noteDialog').onclose=()=>{S.paused=noteWasPaused;renderControls();};
  $('#noteSave').onclick=()=>{const t=$('#noteText').value.trim();if(!t){toast('先写下一点想法吧。');return;}const l=S.life;l.notes.push({age:l.age,t});l.log.push({age:l.age,year:l.year,c:'note',t:'「'+t+'」',tone:'note',note:''});save();renderFeed();$('#noteDialog').close();toast('已记在这一生里。');};
  function complete(l){S.paused=true;if(!l.archived){const raw=store.get('past',[]);const past=(Array.isArray(raw)?raw:[]).filter(x=>x.seed!==l.seed);const copy=E.serialize(l);copy.archived=true;past.unshift(copy);if(store.set('past',past.slice(0,30))){l.archived=true;store.set('current',null);}else store.set('current',E.serialize(l));}renderEnd(l);go('end');}

  function renderEnd(l){const surname=E.nameOf(l),choiceCount=l.choices.length,stars=l.log.filter(e=>e.star).length;
    $('#endBody').innerHTML=`<p class="eyebrow">一生已过，故事仍在</p>${CN_PIXEL.pixelChar(l)}<h2>${esc(surname)}</h2><div class="end-age">${l.deathAge}<span style="font-size:20px"> 岁</span></div><p class="muted">${l.born.y}—${l.year} · 出生于${esc(E.place(l.birthPref,l.birthCity))}</p><blockquote>“${l.flags.memoir?'你认真留下了故事，也留下了来过的痕迹。':l.kids.length?'那些有人陪伴的日子，后来都成了记忆里的光。':'这一生不必成为传奇。认真活过的日子，都有自己的分量。'}”</blockquote><p class="cn-biography">${esc(CNViews.biography(l))}</p><div class="cn-end-stats"><div><b>${choiceCount}</b><small>做过的决定</small></div><div><b>${l.trail.length}</b><small>人生停靠的地方</small></div><div><b>${stars}</b><small>收藏的瞬间</small></div></div><p class="small muted">${esc(l.eduDone||l.edu.label)} · ${esc(l.jobHist.at(-1)?.title||'有自己的生活')}<br>最高年收入 ${esc(E.money(l.peak.income))}</p><div class="starts"><button class="cta" id="endNew">再活一生</button><button class="ghost" id="endReview">回看记录</button><button class="ghost" id="endCard">保存人生卡片</button><button class="ghost" id="endAlbum">下载人生册</button><button class="ghost" id="endExport">导出存档 JSON</button></div><p class="small muted">人生册可以离线阅读和打印；JSON 可以导入继续或回看。</p>`;
    $('#endNew').onclick=newLife;$('#endReview').onclick=()=>{go('life');S.paused=true;renderControls();};$('#endCard').onclick=()=>exportCard(l);$('#endAlbum').onclick=()=>download(CNViews.album(l),'text/html;charset=utf-8',surname+'的人生册.html');$('#endExport').onclick=()=>download(JSON.stringify(E.serialize(l),null,2),'application/json',surname+'的人生.json');
  }

  function download(text,type,name){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function exportCard(l){const c=document.createElement('canvas');c.width=900;c.height=1200;const g=c.getContext('2d');g.fillStyle='#f6f2ea';g.fillRect(0,0,900,1200);g.strokeStyle='#d9d0bf';g.lineWidth=2;g.strokeRect(44,44,812,1112);g.textAlign='center';g.fillStyle='#c0392b';g.font='24px sans-serif';g.fillText('十四亿分之一 · 人生记录',450,128);g.fillStyle='#1f1b16';g.font='bold 60px serif';g.fillText(E.nameOf(l),450,260,700);g.fillStyle='#c0392b';g.font='bold 160px serif';g.fillText(String(l.deathAge),450,485);g.font='30px serif';g.fillText('岁',450,545);g.fillStyle='#6d655a';g.font='26px sans-serif';g.fillText(`${l.born.y}—${l.year}`,450,625);g.fillText(`出生于 ${l.birthPref}${l.birthCity}`,450,690,720);g.font='28px serif';g.fillText('每个普通的日子，也都算数。',450,810);g.font='22px sans-serif';g.fillText(`${l.choices.length} 个决定 · ${l.trail.length} 处人生足迹`,450,910);g.font='18px sans-serif';g.fillText('基于 1injp 的中国模式 · 虚构人生模拟',450,1090);c.toBlob(b=>{if(!b){toast('卡片生成失败，请导出文字记录。');return;}const a=document.createElement('a'),u=URL.createObjectURL(b);a.href=u;a.download=E.nameOf(l)+'的人生.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);});}
  function renderPast(){const raw=store.get('past',[]),oldBackups=store.get('backups',[]),past=[];for(const x of Array.isArray(raw)?raw:[]){try{past.push(E.hydrate(JSON.parse(JSON.stringify(x))));}catch{}}const backups=[];for(const x of Array.isArray(oldBackups)?oldBackups:[]){try{const l=E.hydrate(JSON.parse(JSON.stringify(x)));if(l.alive||l.playback)backups.push(l);}catch{}}
    if(S.historySort==='age')past.sort((a,b)=>b.age-a.age);if(S.historySort==='stars')past.sort((a,b)=>b.log.filter(e=>e.star).length-a.log.filter(e=>e.star).length);
    $('#pastBody').innerHTML=`<p class="eyebrow">每一次出生，都有自己的故事</p><h1>我的人生簿</h1><p class="small muted">最近 30 段完整人生与最多 3 份未完记录留在此浏览器。把喜欢的一生导出，也可以带到别处。</p><div class="cn-history-tools"><div class="cn-segments" aria-label="人生排序">${[['recent','最近记录'],['age','按年岁'],['stars','收藏最多']].map(([id,n])=>`<button class="ghost small ${S.historySort===id?'on':''}" data-sort="${id}" aria-pressed="${S.historySort===id}">${n}</button>`).join('')}</div><button class="ghost small" id="pastImport">导入记录</button></div>${backups.length?`<h2>留在半途的故事</h2>${backups.map((l,i)=>`<article class="cn-past-card">${CN_PIXEL.pixelChar(l)}<div><h3>${esc(E.nameOf(l))}</h3><p class="small muted">${l.age} 岁 · ${esc(l.birthPref)} · 未完记录</p></div><button class="ghost small" data-backup="${i}">继续这一生</button></article>`).join('')}<h2>已经走过的一生</h2>`:''}${past.length?past.map((l,i)=>`<article class="cn-past-card">${CN_PIXEL.pixelChar(l)}<div><h3>${esc(E.nameOf(l))}</h3><p class="small muted" style="margin:4px 0">${l.deathAge} 岁 · ${esc(l.birthPref)} · ${l.born.y}—${l.year}<br>${l.choices.length} 个选择 · ${l.log.filter(e=>e.star).length} 个收藏</p></div><button class="ghost small" data-past="${i}">回看这一生</button></article>`).join(''):'<div class="cn-empty">你的第一段完整人生，还在前面。<p><button class="cta" id="pastNew">出生</button></p></div>'}`;
    $$('[data-past]').forEach(b=>b.onclick=()=>openLife(past[Number(b.dataset.past)]));$$('[data-backup]').forEach(b=>b.onclick=()=>{save();backupCurrent();const raw=backups[Number(b.dataset.backup)];store.set('current',E.serialize(raw));openLife(raw);});$$('[data-sort]').forEach(b=>b.onclick=()=>{S.historySort=b.dataset.sort;renderPast();});$('#pastImport').onclick=()=>$('#importFile').click();if($('#pastNew'))$('#pastNew').onclick=newLife;
  }
  $('#btnImport').onclick=()=>$('#importFile').click();
  $('#importFile').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>2*1024*1024)throw Error('记录文件超过 2 MB，请选择本游戏导出的 JSON。');const raw=JSON.parse(await file.text());const imported=E.hydrate(raw);if(imported.alive||imported.playback){save();backupCurrent();if(!store.set('current',E.serialize(imported)))return;openLife(imported);}else{const rows=store.get('past',[]);const past=(Array.isArray(rows)?rows:[]).filter(l=>l.seed!==imported.seed||l.born.y!==imported.born.y);past.unshift(E.serialize(imported));if(!store.set('past',past.slice(0,30)))return;openLife(imported);}toast('人生记录已导入。');}catch(error){toast(error instanceof SyntaxError?'文件不是有效的 JSON 人生记录。':error.message||'记录无法读取，原存档已保留。');}finally{e.target.value='';}};

  function renderData(){$('#dataBody').innerHTML=`<p class="eyebrow">先把模型说清楚</p><h1>数据与游戏设定</h1><p>这是基于开源项目 <a href="https://github.com/satorunet/1injp" target="_blank" rel="noopener">1injp</a> 改编的现代中国模式。人物、校园、工作、家庭与地方故事都是虚构的。</p><h2>来自公开统计的部分</h2><ul>${D.sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a><p>${esc(s.use)}</p></li>`).join('')}</ul><h2>中国生活的模型</h2><p>省级人口用于近似抽样，代表城市随机选取。城乡、家庭组成、姓名、地区收入系数、专业与职业的对应关系、录取结果、婚育、照护和退休安排均为游戏参数。食物与地方场景是叙事素材，不代表每位当地居民的生活。</p><p>住房、租金按超大城市、区域中心、普通城市和县镇分档，是游戏价格。年还款使用固定参数计算；教育借款、伴侣共同投入、薪酬扣除和养老收入都经过简化，不对应真实金融产品、税制、社保待遇或招录政策。寿命仍用简化年龄风险模型，尚未按中国生命表校准。</p><h2>0.3 版补充了什么</h2><ul><li>专业选择、考研、职业节奏、公考尝试、灵活就业、春节团聚、父母照护与地方记忆。</li><li>家庭年度账本、按城市分档的住房、教育借款、住房本金与利息，以及伴侣共同投入。</li><li>年内逐条展示、花钱安排与收藏、同日出生的 5 段对照人生、点滴收集、离线人生册、JSON 导入和未完记录备份。</li></ul><h2>0.6 的生活与关系</h2><p>高考后分开查询成绩、填院校与专业志愿、查看录取结果；招聘给出多个岗位并需面试，考公全职备考后次年公布结果。老朋友有固定姓名、偶尔联系及离世通知。单身成年人每年有 2% 邀请机会，主动社交的旧相识有 5% 条件概率出柜告白；交往由玩家决定。父母均离世后分配遗产，老宅有人住时保留。</p><p>薪资以地区平均工资统计作锚点，最低工资采用省内第一档与深圳单列。补偿按高薪封顶结构计算，地区均薪仍有代理值；详细来源与限制见源码 <a href="https://github.com/HornyJason/1incn/blob/main/ECONOMY.md" target="_blank" rel="noopener">ECONOMY.md</a>。</p><h2>资产与低频支线</h2><p>房产可以买卖、转作自住或出租；每年更新价格、租金、维护费、借款与车辆折旧。价格波动不代表真实市场。酷儿相关支线按整局 3% 概率开启，部分是主角的同性心动，部分是直人收到同性告白；不是现实人口比例。向朋友、家人或工作场合公开分别选择，不会自动替玩家出柜。职场晋升受阻是本局虚构单位的歧视情节，不是现实政策或对身份的评价。</p><h2>记录与版本</h2><p>出生范围为内地 31 个省、自治区和直辖市，只含当代模式。未迁移日本时代模式、真实机构名单和联网排行榜。“同日人生”是游戏内新生成的小样本，不是现实统计。人生簿只整理本浏览器的记录。</p><p>可读取 0.1 / 0.2 版存档，保留姓名、年龄、便签与已做的选择；升级后的下一年采用新规则。新旧版本后续随机结果不保证相同。导入只在本地解析，不上传；开始新人生前，最多保留 3 份未完备份。完整人生最多保存 30 份。</p><h2>开源与署名</h2><p>原作者为 satoru.net，代码采用 <a href="LICENSE" target="_blank" rel="noopener">MIT 许可证</a>。中国模式沿用 MIT 并保留版权声明；第三方数据和地图遵守各自来源条件。</p><p><button class="ghost" data-go="home">返回首页</button></p>`;}

  function drawScene(now){if(S.life&&S.view==='life')CNAnimation.draw(S.life,now);}
  let last=performance.now(),drawAt=0;
  function tick(now){const dt=Math.min(500,now-last);last=now;if(S.view==='life'&&S.life&&(S.life.alive||S.life.playback)&&!S.paused&&!document.hidden&&!document.querySelector('dialog[open]')){S.progress=Math.min(1,S.progress+dt/(10000/S.speed));const changed=CNPlayback.update(S.life,S.progress);renderControls();if(changed){renderFeed();CNAnimation.update({...S.life,log:S.life.log.filter((e,i)=>CNPlayback.visible(S.life,i))});save();}if(S.progress>=1)advance();}if(now-drawAt>100&&document.visibilityState==='visible'){drawAt=now;drawScene(now);}requestAnimationFrame(tick);}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
  window.addEventListener('pagehide',save);
  window.addEventListener('keydown',e=>{if(e.code==='Space'&&S.view==='life'&&!/INPUT|SELECT|TEXTAREA|BUTTON|A/.test(e.target.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();$('#btnPlay').click();}});
  // 便于本地验证，与上游保留的调试入口一致；不参与随机抽样或存档。
  window.__life=()=>S.life;window.__advance=()=>advance(true);
  showResume();requestAnimationFrame(tick);
})();
