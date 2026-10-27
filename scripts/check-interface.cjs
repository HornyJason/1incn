// 纯 DOM 集成测试（LinkeDOM），不连接用户浏览器或存档。
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {parseHTML}=require(process.env.CN_DOM_MODULE||'linkedom');
const html=fs.readFileSync(__dirname+'/../index.html','utf8'),{window}=parseHTML(html),memory=new Map();
let frame,time=0;
Object.assign(window,{console,performance:{now:()=>time},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},requestAnimationFrame:fn=>{frame=fn;},setInterval:()=>1,clearInterval(){},setTimeout:()=>1,clearTimeout(){},scrollTo(){},fetch:async()=>({ok:true,json:async()=>({features:[]})})});
window.document.visibilityState='visible';window.document.hidden=false;
for(const d of window.document.querySelectorAll('dialog')){d.showModal=function(){this.open=true;this.setAttribute('open','');};d.close=function(){this.open=false;this.removeAttribute('open');this.onclose?.();};}
window.CN_PIXEL={pixelChar:()=>'<svg></svg>'};window.CNAnimation={update(){},draw(){},birth(){}};
const context=vm.createContext(window);
for(const f of ['data','engine','cn-data','cn-economy','cn-education','cn-society','cn-city-stories','cn-assets','cn-queer','cn-career','cn-playback','cn-local','cn-engine','cn-views','cn-interactions'])vm.runInContext(fs.readFileSync(__dirname+'/../'+f+'.js','utf8'),context,{filename:f+'.js'});
const l=window.CNEngine.createLife({seed:1,date:'2026-10-27T12:00:00+08:00'});l.age=5;l.year=l.born.y+5;l.started=true;memory.set('1incn-v1:current',JSON.stringify(window.CNEngine.serialize(l)));
vm.runInContext(fs.readFileSync(__dirname+'/../cn-app.js','utf8'),context,{filename:'cn-app.js'});
const $=s=>window.document.querySelector(s),click=s=>$(s).click(),tick=n=>{for(let i=0;i<n;i++){time+=500;frame(time);}};
assert.equal($('#btnNext'),null);assert.equal($('#feedKind'),null);assert.equal($('#actionButtons'),null);
assert.ok($('#btnPlay').closest('header'));assert.ok($('#stats').closest('.lifebar'));assert.ok($('#lStatus').closest('h2'));
click('#btnResume');assert.equal(window.document.body.dataset.view,'life');assert.equal($('#btnAssets').hidden,true);assert.equal($('#topPlayback').hidden,false);
click('#btnPlay');tick(20);assert.equal(window.__life().age,6);assert.ok(window.__life().playback);assert.equal($('#btnAssets').hidden,false);assert.ok(!$('#feed').textContent.includes('新书包'));
tick(12);const progress=window.__life().playback.progress,visible=window.CNPlayback.limit(window.__life());assert.ok(progress>0&&progress<1);assert.ok(visible>window.__life().playback.start);
click('#btnPlay');tick(10);assert.equal(window.__life().playback.progress,progress,'暂停后不继续播放');
click('.cn-home-button');assert.equal(window.document.body.dataset.view,'home');assert.equal($('#topPlayback').hidden,true);
click('#btnResume');assert.equal(window.__life().playback.progress,progress,'返回首页后恢复同一月份');assert.equal(window.CNPlayback.limit(window.__life()),visible);
click('#btnAssets');assert.ok($('#assetDialog').open);assert.ok($('#assetBody').textContent.includes('读书与深造'));assert.ok(!$('#assetBody').textContent.includes('全款购买'));
click('[data-asset="study"]');assert.ok($('#assetConfirm').open);const know=window.__life().stats.know;click('#assetSubmit');assert.equal(window.__life().stats.know,know+.2);assert.equal(window.__life().flags.studyYear,6);
const ids=[...window.document.querySelectorAll('[id]')].map(e=>e.id);assert.equal(ids.length,new Set(ids).size,'页面无重复 ID');
$('#assetDialog').close();click('.cn-home-button');
const ended=window.CNEngine.createLife({seed:2,date:'2026-10-27T12:00:00+08:00'});ended.age=70;ended.year=ended.born.y+70;ended.alive=false;ended.deathAge=70;ended.deathCause='生命自然走到了终点';ended.started=true;const last=ended.log.length;ended.log.push({age:70,year:ended.year,c:'death',t:'这一生结束了。',tone:'neutral'});window.CNPlayback.start(ended,last);window.CNPlayback.update(ended,.8);memory.set('1incn-v1:current',JSON.stringify(window.CNEngine.serialize(ended)));
click('#btnResume');assert.equal(window.document.body.dataset.view,'life');assert.equal($('#btnPlay').disabled,false);click('#btnPlay');tick(5);assert.equal(window.document.body.dataset.view,'end');assert.ok(JSON.parse(memory.get('1incn-v1:past')).some(l=>l.seed===2));
console.log('通过界面集成：顶部播放、指标位置、移除旧入口、学龄前隐藏花钱、年内揭示、暂停、首页往返进度恢复及课程确认。');
