/* 直接迁移自 satorunet/1injp app.js（MIT）：PROPS、drawFig、drawScene、drawPx、famPixel。
   修改仅用于中国状态字段、中文场景调度、家属关系与 reduced-motion。上游原文件保留在 app.js。 */
(function(){
  const pixelChar=CN_PIXEL.pixelChar,PX=CN_PIXEL.PX,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const S={life:null},reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pxCol=c=>c==='G'?PX.g:c==='G2'?'#e0b896':c==='Y'?'#f6e3a8':PX[c]||c;
  const pxDpr=()=>Math.min(3,Math.max(2,Math.round(devicePixelRatio||1)));
  function pxSnap(g){g.imageSmoothingEnabled=false;}
  const HOBBY_ACT=[[/运动/,'run'],[/阅读/,'read'],[/艺术/,'guitar'],[/旅行/,'walk']];
  const ACT_LABEL={love:'心动',baby:'照顾孩子',celebrate:'值得庆祝',sick:'休养中',sad:'整理心情',money:'收支变化',travel:'在路上',move:'搬家',talk:'聊聊天',walk:'和家人散步',sleep:'休息中',idle:'普通的一天',game:'玩一会儿',read:'读书',guitar:'练习音乐',sing:'唱首歌',lift:'锻炼',run:'跑步',fish:'钓鱼',golf:'运动',cook:'下厨',photo:'拍照',garden:'照料花草',dance:'跳舞',phone:'看看消息',cheer:'加油',camp:'露营',shogi:'下棋',tea:'喝杯茶',knit:'做点手工',tv:'看看电视',ball:'课间活动',study:'学习中',work:'工作中',crawl:'慢慢长大',play:'玩耍'};
  const PX_SCENE={q:[],act:'walk',t:0,until:0,x:60,dir:1,tx:120,raf:0,last:0,key:'',grid:null};
  const interval=()=>4000;
  const PROPS = {
    book: [['wwwww', 'wiiwi', 'wiwiw', 'zzzzz'], { i: '#9aa3b5' }],
    game: [['fffff', 'ftttf', 'fyfzf'], {}],
    guitar: [['....k', '...k.', 'yyk..', 'yyy..', '.y...'], {}],
    mic: [['f', 'f', 'k'], {}],
    dumbbell: [['f...f', 'fkkkf', 'f...f'], {}],
    rod: [['......k', '.....k.', '....k..', '...k...', '..k....', '.k.....'], {}],
    golf: [['.k', '.k', '.k', '.k', 'ff'], {}],
    pot: [['f...f', 'fffff', 'fzzzf', '.fff.'], {}],
    camera: [['.ff..', 'fffff', 'fwtwf', 'fffff'], {}],
    can: [['..ttt', 'tttt.', 'ttt..'], {}],
    sprout: [['g.g', '.g.', '.g.'], { g: '#5c8a5a' }],
    phone: [['ff', 'tt', 'tt', 'ff'], {}],
    flag: [['zzz', 'zzk', 'zz.', '..k', '..k'], {}],
    cup: [['w.w', 'www', '.w.'], {}],
    ball: [['.ww.', 'wfww', 'wwfw', '.ww.'], {}],
    knit: [['.k.k', 'rrrr', 'rrrr'], {}],
    fire: [['.z.', 'zyz', 'kkk'], {}],
    board: [['yyyyy', 'yfyfy', 'yyyyy'], {}],
    briefcase: [['.ff.', 'kkkk', 'kkkk'], {}],
    bag: [['zz', 'zz'], {}],
    note: [['.f', '.f', 'ff'], {}],
    z: [['fff', '.f.', 'fff'], {}],
    heart: [['z.z', 'zzz', '.z.'], {}],
    tv: [['ffffff', 'fttttf', 'fttttf', 'ffffff', '..ff..'], {}],
    dog: [['k...kk', '.kkkkf', '.kkkk.', '.k..k.'], {}],
    cat: [['f.f...', 'fff..f', '.ffff.', '.f..f.'], {}],
    rattle: [['.y.', 'yzy', '.y.', '.k.', '.k.'], {}],
    bed: [['wwwwwwwwwwww', 'kkkkkkkkkkkk', 'k..........k'], {}],
    coin: [['.yy.', 'yyyy', 'yyyy', '.yy.'], {}],
    suitcase: [['.ff.', 'zzzz', 'zzzz', 'zzzz', 'f..f'], {}],
    mug: [['www.', 'yyyw', 'yyy.', 'yyy.'], {}],
    cloud: [['..www...', '.wwwwww.', 'wwwwwwww', '.wwwwww.'], { w: '#9aa3b5' }],
    cross: [['wwwww', 'wwzww', 'wzzzw', 'wwzww', 'wwwww'], {}],
    sparkle: [['.y.', 'yyy', '.y.'], {}],
    babyb: [['.ss.', 'wssw', 'wwww', '.ww.'], {}],
    box: [['kkkk', 'kyyk', 'kkkk'], {}],
    candle: [['.y.', '.z.', 'www', 'www', 'www'], {}],
    plane: [['....w...', 'wwwwwwww', '...ww...'], { w: '#ffffff' }],
    bubble: [['wwwww', 'wfwfw', 'wwwww', '.w...'], {}],
    smoke: [['.g', 'g.', '.g'], { g: '#b9b4ab' }],
    cig: [['wwwz'], {}]
  };
  function casualWear(sex, k) {
    const M = [['#7a8f6a', '#3b4f7a'], ['#c9c2b4', '#4a4a4a'], ['#5d7d9a', '#8a7a5a'], ['#9a5a4a', '#3b4f7a'], ['#e8e2d4', '#5a6a4a']], F = [['#e0a46a', '#3b4f7a'], ['#f2e6d0', '#8a6a7a'], ['#9fb7d6', '#5a5248'], ['#d98a8a', '#3d4b6a'], ['#b8c9a0', '#6a5a4a']];
    const [top, bot] = (sex === 'F' ? F : M)[Math.abs(k) % 5]; return { top, bot, collar: null, extra: null, skirt: sex === 'F' && k % 2 === 0 };
  }
  function pxFamily(l,all) {
    const out=[],base={stats:{happy:72,health:80,know:40},alive:true,flags:{},hobbies:[],year:l.year};
    const person=(age,sex,name,side)=>({...base,age,sex,name,edu:{stage:age<6?'baby':age<12?'elem':age<15?'jhs':age<18?'hs':'work'},job:null,retired:age>=65,side,outfit:casualWear(sex,l.year+age)});
    const partner=l.spouse||l.partner;if(partner&&partner.alive!==false)out.push(person(Math.max(18,l.age+(partner.ageDiff||0)),partner.sex||(l.sex==='M'?'F':'M'),partner.name,'ahead'));
    l.kids.filter(k=>l.age-k.birthAge<22).slice(0,3).forEach(k=>out.push(person(l.age-k.birthAge,k.sex,k.name,'behind')));
    if(l.age<18||l.flags.livesWithParents){for(const[k,sex]of [['father','M'],['mother','F']]){const p=l.fam[k];if(p.alive)out.push(person(p.age0+l.age,sex,p.sei+p.name,k==='father'?'ahead':'behind'));}l.fam.siblings.filter(k=>k.age+l.age<22).slice(0,2).forEach(k=>out.push(person(k.age+l.age,k.sex||'F',(k.sei||l.name.sei)+k.name,'behind')));}
    return out;
  }
  function pxBack(g, l, W, ground, T) {
    const area = l.rural?'town':['北京','上海','深圳','广州'].includes(l.city)?'metro':'city', dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    const c1 = dark ? 'rgba(255,255,255,.07)' : 'rgba(43,38,32,.07)', c2 = dark ? 'rgba(255,255,255,.12)' : 'rgba(43,38,32,.12)';
    g.fillStyle = c1;
    if (area === 'metro') { const hs = [30, 44, 22, 52, 36, 26, 48, 34, 40, 28]; let x = 0; for (let i = 0; x < W; i++) { const h = hs[i % hs.length], w = 14 + (i * 7) % 10; g.fillRect(x, ground - h, w, h); x += w + 2; } g.fillStyle = c2; for (let x2 = 4; x2 < W; x2 += 6) for (let y2 = ground - 40; y2 < ground - 6; y2 += 6) if ((x2 * 7 + y2 * 3) % 5 === 0) g.fillRect(x2, y2, 2, 2); }
    else if (area === 'city') { const hs = [18, 26, 14, 30, 20]; let x = 0; for (let i = 0; x < W; i++) { const h = hs[i % hs.length], w = 16; g.fillRect(x, ground - h, w, h); x += w + 10; g.fillStyle = c2; g.fillRect(x - 6, ground - 10, 4, 10); g.fillRect(x - 8, ground - 14, 8, 6); g.fillStyle = c1; } }
    else if (area === 'town') { for (let x = 4; x < W; x += 34) { g.fillRect(x, ground - 12, 18, 12); g.beginPath(); g.moveTo(x - 2, ground - 12); g.lineTo(x + 9, ground - 20); g.lineTo(x + 20, ground - 12); g.fill(); } }
    else { g.beginPath(); g.moveTo(0, ground); for (let x = 0; x <= W; x += 4) g.lineTo(x, ground - 22 - Math.sin(x / 26) * 10 - Math.sin(x / 9) * 2); g.lineTo(W, ground); g.fill(); g.fillStyle = c2; for (let x = 2; x < W; x += 5) g.fillRect(x, ground - 3, 1, 3); }
    // 雲がゆっくり流れる
    g.fillStyle = c1; const cx = ((T * 4) % (W + 40)) - 40; g.fillRect(cx, 8, 22, 4); g.fillRect(cx + 4, 5, 12, 3);
  }
  function pxActs(l) {
    const a = l.alive ? l.age : l.deathAge, w = { walk: 3, idle: 2, sleep: a <= 1 ? 6 : a >= 80 ? 3 : 1 };
    if (l.stats.health < 35) w.sleep += 3;
    if (a <= 1) return { sleep: 5, crawl: 4, play: 2 };
    if (a <= 5) Object.assign(w, { play: 3, run: 2 });
    if (a >= 6 && a <= 17) w.study = 1.5;
    if (a >= 6 && a <= 11) w.ball = 2;
    if (l.flags && l.flags.clubType === '運動' && a <= 17) w.ball = 3;
    if (l.flags && /吹奏楽|合唱/.test(l.flags.club || '') && a <= 17) w.guitar = 2;
    if (l.job && !l.retired && a >= 18) w.work = 2;
    for (const h of l.hobbies || []) for (const [re, act] of HOBBY_ACT) if (re.test(h)) w[act] = (w[act] || 0) + 3;
    if (a >= 65) { w.tea = (w.tea || 0) + 1.5; w.garden = (w.garden || 0) + 1; }
    return w;
  }
  function pxPick(w) { let x = Math.random() * Object.values(w).reduce((a, b) => a + b, 0); for (const k in w) { x -= w[k]; if (x <= 0) return k; } return 'idle'; }
  function drawFig(g, gd, x, ground, P, o) {
    const pose = o.pose || 'stand', step = o.step || 0, flip = !!o.flip, legs = gd.R - gd.hand - 1;
    let dy = 0; if (pose === 'jump') dy = -Math.round(Math.abs(Math.sin(o.T * 7)) * 8); else if (pose === 'stand') dy = (Math.floor(o.T * 1.5 + (o.ph || 0)) % 2) * -0.5;
    const bowing = pose === 'bow' && Math.floor((o.e || 0) * 0.7) % 2 === 0;
    const sit = pose === 'sit';
    const top = ground - gd.R * P + dy + (sit ? (legs - 1) * P : 0);
    for (let y = 0; y < gd.R; y++) {
      const row = gd.rows[y]; if (!row) continue;
      const isLeg = y > gd.hand;
      if (sit && isLeg && y < gd.R - 1) continue;
      row.forEach((c, xx0) => {
        if (!c) return;
        let xx = xx0, yy = y;
        if ((pose === 'walk' || pose === 'run') && y >= gd.R - 2 && step) xx += xx0 < gd.G / 2 ? -1 : 1;
        if (bowing && y <= gd.hand) { xx += Math.round((gd.hand - y) / 3); yy += 1; } // 頭と上半身はつぶさず、前に傾けるだけ
        if (sit && y === gd.R - 1) { xx += 2; yy = gd.hand + 1; }
        if (flip) xx = gd.G - 1 - xx;
        g.fillStyle = pxCol(c); g.fillRect(x + xx * P, top + yy * P, P, P);
      });
    }
    return { top, hand: top + gd.hand * P, w: gd.G * P };
  }
  function drawLying(g, gd, bx, ground, P) {
    const by = ground - 3 * P;
    for (let y = 0; y < gd.R; y++) if (gd.rows[y]) gd.rows[y].forEach((c, x) => { if (!c) return; g.fillStyle = pxCol(c); const q = Math.max(2, P - 1); g.fillRect(bx + y * q, by - (x - 2) * q, q, q); });
  }
  function personLike(l, m) {
    const age = m.age < 0 ? l.age : m.age, st = age <= 5 ? 'baby' : age <= 11 ? 'elem' : age <= 14 ? 'jhs' : age <= 17 ? 'hs' : 'work';
    return { age, sex: m.sex, alive: true, stats: { happy: 70, health: 70, know: 40 }, edu: { stage: st }, job: m.job || null, retired: age >= 65, flags: {}, tint: m.tint };
  }
  // 出来事・選択の場面
  function drawScene(g, l, W, H, ground, T, P, prop, sc) {
    const sp = PX_SCENE, e = T - sp.t, X = window.PXS;
    if (sc.shake) g.translate(Math.round(Math.sin(T * 40) * 1.5), 0);
    const h = { Y: l.year || (S.life && S.life.year) || 2026, g, W, gr: ground, T, e, P, r: (x, y, w, hh, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, hh); }, prop: (n, x, y, pal, f) => prop(n, x, y, pal, f) };
    if (X.BG[sc.bg]) X.BG[sc.bg](h);
    g.fillStyle = 'rgba(43,38,32,.18)'; g.fillRect(0, ground, W, 1);
    sp.sg = sp.sg || {};
    const grid = (who, outName, key) => { const k = key + '|' + outName; if (!sp.sg[k]) { const of = outName && X.OUT[outName] ? X.OUT[outName](who) : null; sp.sg[k] = pixelChar(of ? { ...who, outfit: of } : who, true); } return sp.sg[k]; };
    const WORKBG = ['office', 'meeting', 'factory', 'construction', 'konbini', 'classroom', 'schoolgate', 'juku', 'truck', 'election', 'police', 'care'];
    const mainG = grid(l, sc.out || (WORKBG.includes(sc.bg) ? null : 'home'), 'me' + sp.key);
    let mx = Math.round(W * (sc.x || 0.3));
    if (sc.pose === 'walk' || sc.pose === 'run') mx = Math.round(Math.min(W - mainG.G * P - 4, mx + e * (sc.pose === 'run' ? 26 : 10)));
    const step = Math.floor(T * (sc.pose === 'run' ? 8 : 4)) % 2;
    // 家族・まわりの人
    const others = [];
    const famBg = ['homein', 'park', 'station', 'airport', 'sakura', 'sea', 'snow', 'festival', 'fireworks', 'shrine', 'mountain', 'onsen', 'newhouse', 'truck', 'hospital', 'grave', 'bus', 'lottery'];
    if (sc.fam || ((!l.indep && l.age <= 12 || l.age >= 20) && famBg.includes(sc.bg) && sc.pose !== 'lie')) pxFamily(l, true).forEach((m) => others.push({ who: m, out: sc.out === 'black' ? 'black' : null, pose: sc.pose === 'bow' ? 'bow' : 'stand' }));
    (sc.npc || []).forEach((n) => others.push({ who: personLike(l, n), out: n.outfit || n.out || null, pose: n.pose || 'stand', x: n.x }));
    if (sc.partner) { const sx = (l.spouse && l.spouse.sex) || (l.sex === 'M' ? 'F' : 'M'); others.unshift({ who: personLike(l, { age: -1, sex: sx, tint: '#6f9a6a' }), out: sc.partner === 'casual' ? null : sc.partner, pose: 'stand', x: (sc.x || 0.3) + 0.13 }); }
    let fx = mx + mainG.G * P * 0.75;
    others.forEach((o, i) => {
      const gd2 = grid(o.who, o.out, [o.who.age, o.who.sex, o.who.tint || '', o.who.outfit ? o.who.outfit.top : '', o.who.edu.stage].join());
      const x = o.x != null ? Math.round(W * o.x) : (fx += gd2.G * P * 0.62);
      if (x > W) return;
      drawFig(g, gd2, x, ground, P, { pose: o.pose, T, e, ph: i, flip: o.x != null && o.x > (sc.x || 0.3) });
    });
    // 主人公
    let me;
    if (sc.pose === 'lie') { prop('bed', mx - P, ground - 3 * P, { w: '#f4efe4', k: '#b08a5a' }); drawLying(g, mainG, mx, ground, P); me = { top: ground - 12, hand: ground - 10, w: mainG.R * P * 0.9 }; }
    else me = drawFig(g, mainG, mx, ground, P, { pose: sc.pose, T, e, step });
    const rx = mx + me.w - P, hy = me.hand;
    if (sc.anim) { try { sc.anim(h, { x: mx, top: me.top, hand: me.hand, w: me.w }); } catch (er) { } }
    // 前景の小物
    const cols = ['#c0392b', '#e8b94a', '#5c8a5a', '#7fb3e0', '#d9667a'];
    switch (sc.fx) {
      case 'hearts': for (let k = 0; k < 3; k++) prop('heart', mx + me.w + Math.sin(e * 2 + k * 2) * 10, me.top - 4 - ((e * 12 + k * 9) % 24)); break;
      case 'cloud': prop('cloud', mx + me.w / 2 - 4 * P, me.top - 14); g.fillStyle = '#7fb3e0'; for (let k = 0; k < 4; k++) g.fillRect(mx + me.w / 2 - 8 + k * 6, me.top - 1 + ((e * 30 + k * 7) % 14), 1, 3); break;
      case 'confetti': for (let k = 0; k < 22; k++) { g.fillStyle = cols[k % 5]; g.fillRect((k * 29 + Math.sin(e * 3 + k) * 6) % W, (k * 17 + e * 30) % (ground - 4), 3, 3); } break;
      case 'sakura': for (let k = 0; k < 14; k++) { g.fillStyle = '#f4b6c2'; g.fillRect((k * 41 + T * 14) % W, (k * 17 + T * 18) % ground, 2, 2); } break;
      case 'bouquet': prop('sparkle', rx, hy - 4 * P); g.fillStyle = '#d9667a'; g.fillRect(rx, hy - 2 * P, 3 * P, 2 * P); g.fillStyle = '#e8b94a'; g.fillRect(rx + P, hy - 3 * P, P, P); g.fillStyle = '#5c8a5a'; g.fillRect(rx + P, hy, P, 2 * P); break;
      case 'diploma': g.fillStyle = '#ffffff'; g.fillRect(rx - P, hy - 2 * P, 5 * P, 2 * P); g.fillStyle = '#c0392b'; g.fillRect(rx + P, hy - 2 * P, P, 2 * P); for (let k = 0; k < 10; k++) { g.fillStyle = cols[k % 5]; g.fillRect((k * 31 + e * 10) % W, (k * 13 + e * 26) % ground, 2, 2); } break;
      case 'counter': g.fillStyle = '#b08a5a'; g.fillRect(mx - 10, ground - 14, me.w + 20, 14); g.fillStyle = '#8a6a45'; g.fillRect(mx - 10, ground - 14, me.w + 20, 2); g.fillStyle = '#6b6b6b'; g.fillRect(mx - 8, ground - 22, 10, 8); g.fillStyle = '#7ee08a'; g.fillRect(mx - 6, ground - 20, 6, 2); break;
      case 'tray': g.fillStyle = '#9aa3b5'; g.fillRect(rx - P, hy - P, 6 * P, P); prop('mug', rx, hy - 5 * P); break;
      case 'book': prop('book', rx - 2 * P, hy - 3 * P); break;
      case 'medal': g.fillStyle = '#e8b94a'; g.fillRect(mx + me.w / 2 - 3, me.top + 22, 6, 6); g.fillStyle = '#c0392b'; g.fillRect(mx + me.w / 2 - 1, me.top + 16, 2, 6); prop('sparkle', mx + me.w + 4, me.top + (Math.floor(e * 4) % 2) * 4); break;
      case 'pack': g.fillStyle = '#c0392b'; g.fillRect(mx - 3, hy - 6 * P, 3 * P, 5 * P); break;
      case 'suitcase': prop('suitcase', mx + me.w, ground - 5 * P); break;
      case 'box': prop('box', rx - P, hy - 2 * P); break;
      case 'baby': prop('babyb', rx - 2 * P, hy - 3 * P + (Math.floor(e * 2) % 2)); prop('heart', mx + me.w / 2, me.top - 8 - (e * 6) % 10); break;
      case 'wheelchair': g.strokeStyle = '#6b6b6b'; g.lineWidth = 2; g.beginPath(); g.arc(mx + me.w / 2, ground - 7, 7, 0, Math.PI * 2); g.stroke(); break;
      case 'question': g.fillStyle = '#9aa3b5'; g.font = 'bold 12px sans-serif'; g.fillText('?', mx + me.w + 2 + Math.sin(e * 3) * 2, me.top + 4); break;
      case 'coins': for (let k = 0; k < 6; k++) prop('coin', mx - 12 + k * 10, ((e * 40 + k * 13) % (ground - 10)) - 6); break;
      case 'mug': prop('mug', rx - P, hy - (Math.floor(e * 1.2) % 2 ? 6 : 2) * P); break;
      case 'notes': for (let k = 0; k < 2; k++) prop('note', mx + me.w + 4 + k * 12 + (e * 6) % 10, me.top - (e * 9 + k * 7) % 16); break;
      case 'mic': prop('mic', rx - P, hy - 5 * P); break;
      case 'cake': g.fillStyle = '#ffffff'; g.fillRect(W * 0.6 + 12, ground - 22, 18, 6); g.fillStyle = '#f4b6c2'; g.fillRect(W * 0.6 + 12, ground - 18, 18, 2); g.fillStyle = '#e8b94a'; g.fillRect(W * 0.6 + 16 + (Math.floor(e * 6) % 2), ground - 26, 1, 3); g.fillRect(W * 0.6 + 24, ground - 26, 1, 3); break;
      case 'tea': prop('cup', W * 0.6 + 14, ground - 22); break;
      case 'tv': prop('tv', W * 0.62, ground - 24, { t: ['#7fb3e0', '#a9e0b5', '#f2c9a5'][Math.floor(e * 1.5) % 3] }); break;
      case 'talk': prop('bubble', mx + me.w * 0.55, me.top - 15 + (Math.floor(e * 2) % 2) * 2); break;
    }
    if (l.pet && !l.pet.dead && ['park', 'homein', 'newhouse'].includes(sc.bg)) { const dog = /犬/.test(l.pet.kind || ''); prop(dog ? 'dog' : 'cat', mx - 8 * P, ground - 4 * P + (Math.floor(T * 3) % 2 ? -1 : 0), dog ? { k: '#b08a5a' } : { f: '#6b6b6b' }, false); }
    { const k = g.canvas._sc || 2; g.setTransform(k, 0, 0, k, 0, 0); }
  }
  function drawPx(cv, l, T, dt, P) {
    const g = cv.getContext('2d'), sc = cv._sc || 2, W = cv.width / sc, H = cv.height / sc, ground = H - 6, sp = PX_SCENE;
    g.setTransform(sc, 0, 0, sc, 0, 0); g.imageSmoothingEnabled = false; g.clearRect(0, 0, W, H);
    const a = l.alive ? l.age : l.deathAge;
    const key = [a, Math.round(l.stats.happy / 25), l.stats.health < 35, !!l.job, l.edu.stage].join();
    if (key !== sp.key) { if (sp.key.split(',')[0] !== String(a) && !sp.ev) sp.until = Math.min(sp.until, 0); sp.key = key; sp.grid = pixelChar(l, true); }
    const gd = sp.grid, cw = gd.G * P, ch = gd.R * P;
    // 次の行動
    if (T > sp.until && sp.q.length && !(sp.lock && T < sp.lock)) {
      // 1年の長さを、その年の出来事の数で分けて順番に見せる
      const yr = interval() / 1000, per = Math.max(1.4, Math.min(5, yr / Math.max(1, sp.q.length)));
      const ev = sp.q.shift(); pxEvent({ ...ev, dur: per, c: ev.c === 'x' ? 'story' : ev.c });
      // いま絵にしている出来事を、下の一覧でも示す
      const idx = l.log.indexOf(ev); $$('#feed li.pxnow').forEach((x) => x.classList.remove('pxnow')); const li = idx >= 0 && $(`#feed li[data-i="${idx}"]`); if (li) li.classList.add('pxnow');
    }
    if (T > sp.until) {
      sp.withPar = l.age <= 6 ? Math.random() < 0.9 : l.age <= 12 ? Math.random() < 0.6 : Math.random() < 0.35;
      sp.ev = false; sp.scene = null; sp.act = l.alive ? pxPick(pxActs(l)) : 'sleep'; sp.t = T; sp.until = T + 3 + Math.random() * 4;
      if (false) { const ds = window.PXS.daily(l), tw = ds.reduce((t, d) => t + d.w, 0); let x = Math.random() * tw; const pick = ds.find((d) => (x -= d.w) <= 0); if (pick) { sp.scene = pick; sp.act = 'scene'; sp.until = T + 5 + Math.random() * 3; } }
      if (['walk', 'run', 'crawl'].includes(sp.act)) { sp.tx = 4 + Math.random() * Math.max(10, W - cw - 30); sp.dir = sp.tx > sp.x ? 1 : -1; }
      $('#pxLabel').textContent = sp.scene ? sp.scene.label || '' : ACT_LABEL[sp.act] || '';
    }
    const prop0 = (name, x, y, pal, flip) => { const [m, extra] = PROPS[name]; const pl = { ...extra, ...(pal || {}) }; m.forEach((row, j) => [...row].forEach((c, i) => { if (c === '.') return; g.fillStyle = pl[c] || pxCol(c); g.fillRect(x + (flip ? (row.length - 1 - i) : i) * P, y + j * P, P, P); })); };
    if (sp.act === 'scene' && sp.scene && window.PXS) return drawScene(g, l, W, H, ground, T, P, prop0, sp.scene);
    const act = sp.act, e = T - sp.t, step = Math.floor(T * (act === 'run' ? 8 : 4)) % 2;
    if (['walk', 'run', 'crawl'].includes(act)) {
      const v = (act === 'run' ? 40 : act === 'crawl' ? 8 : a >= 75 ? 9 : 16);
      if (Math.abs(sp.tx - sp.x) > 1) sp.x += Math.sign(sp.tx - sp.x) * v * dt; else sp.until = Math.min(sp.until, T + 0.6);
    }
    { const fm = pxFamily(l), u = gd.G * P * 0.62, nA = fm.filter((m) => m.side === 'ahead').length, nB = fm.length - nA, back = nB * u, front = nA * u + (nA ? cw * 0.4 : 0);
      const lo = 2 + (sp.dir < 0 ? front : back), hi = W - cw - 22 - (sp.dir < 0 ? back : front); sp.x = Math.max(lo, Math.min(Math.max(lo, hi), sp.x)); sp.tx = Math.max(lo, Math.min(Math.max(lo, hi), sp.tx)); }
    pxBack(g, l, W, ground, T);
    // 地面
    g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--line') || '#ddd'; g.fillRect(0, ground, W, 1);
    if (act === 'storm') { g.fillStyle = 'rgba(127,179,224,.6)'; for (let k = 0; k < 40; k++) { const rx2 = (k * 37 + T * 90) % W, ry2 = (k * 23 + T * 160) % ground; g.fillRect(rx2, ry2, 1, 4); } }
    const prop = (name, x, y, pal, flip) => { const [m, extra] = PROPS[name]; const pl = { ...extra, ...(pal || {}) }; m.forEach((row, j) => [...row].forEach((c, i) => { if (c === '.') return; g.fillStyle = pl[c] || pxCol(c); g.fillRect(x + (flip ? (row.length - 1 - i) : i) * P, y + j * P, P, P); })); };
    if (act === 'sick') {
      prop('cross', 6, ground - 30, {});
    }
    if (act === 'sleep' || act === 'sick') {
      // 休息时也让同住家人在一旁照应，保持中国模式的家庭舞台可见。
      pxFamily(l,true).slice(0,3).forEach((m,i)=>drawFig(g,pixelChar(m,true),Math.min(W-44,sp.x+55+i*30),ground,P,{pose:'stand',T,e,ph:i}));
      // 横になって眠る（体を90度倒して描く）
      const bx = sp.x, by = ground - 3 * P;
      prop('bed', bx - P, by, { w: '#f4efe4', k: '#b08a5a' });
      for (let y = 0; y < gd.R; y++) if (gd.rows[y]) gd.rows[y].forEach((c, x) => { if (!c) return; g.fillStyle = pxCol(c); const q = Math.max(2, P - 1); g.fillRect(bx + y * q, by - (x - 2) * q, q, q); });
      const zf = e % 2.4; g.globalAlpha = Math.max(0, 1 - zf / 2.4); prop('z', bx + gd.R * P * 0.9 * 0.2 - 4, by - 18 - zf * 6, {}); g.globalAlpha = 1;
      return;
    }
    // 体の上下（呼吸・はずみ）
    const bob = act === 'dance' || act === 'cheer' ? (Math.floor(T * 4) % 2) * -2 * P / 3 : act === 'run' || act === 'play' || act === 'ball' ? step * -1 : (Math.floor(T * 1.5) % 2) * -0.5;
    const flip = sp.dir < 0 && ['walk', 'run', 'crawl'].includes(act) ? true : act === 'dance' ? Math.floor(T * 2) % 2 === 1 : false;
    const ox = Math.round(sp.x), oy = ground - ch + bob + (act === 'celebrate' ? -Math.abs(Math.sin(T * 7)) * 8 : 0), cxp = gd.G / 2;
    // 家族：うしろをついて歩く
    const fam = pxFamily(l); sp.famG = sp.famG || {}; let nA = 0, nB = 0;
    fam.forEach((m, i) => {
      const k = [m.age, m.sex, m.edu.stage, m.tint || '', m.job ? m.job.title : '', m.outfit ? m.outfit.top : ''].join(); const fg = sp.famG[k] || (sp.famG[k] = pixelChar(m, true));
      const ahead = m.side === 'ahead', n = ahead ? ++nA : ++nB, u = fg.G * P * 0.62;
      const off = ahead ? (cw * 0.4 + (n - 1) * u + u * 0.6) * (flip ? -1 : 1) : n * u * (flip ? 1 : -1), fx = Math.round(ox + off + (flip && !ahead ? cw * 0.35 : 0)), fy = ground - fg.R * P + (step && ['walk', 'run'].includes(act) && i % 2 === 0 ? -1 : 0);
      if (fx < -fg.G * P || fx > W) return;
      for (let y = 0; y < fg.R; y++) if (fg.rows[y]) fg.rows[y].forEach((c, x) => { if (!c) return; let xx = x; if (['walk', 'run'].includes(act) && y >= fg.R - 2 && step) xx += x < fg.G / 2 ? -1 : 1; if (flip) xx = fg.G - 1 - xx; g.fillStyle = pxCol(c); g.fillRect(fx + xx * P, fy + y * P, P, P); });
    });
    for (let y = 0; y < gd.R; y++) if (gd.rows[y]) gd.rows[y].forEach((c, x) => {
      if (!c) return;
      let xx = x;
      if (['walk', 'run', 'dance'].includes(act) && y >= gd.R - 2 && step) xx += x < cxp ? -1 : 1; // 足を開いて歩く
      if (flip) xx = gd.G - 1 - xx;
      g.fillStyle = pxCol(c); g.fillRect(ox + xx * P, oy + y * P, P, P);
    });
    const hx = ox + (flip ? 0 : cw - 3 * P), hy = oy + gd.hand * P, rx = ox + cw - P; // 手の位置
    const osc = Math.sin(e * 6);
    switch (act) {
      case 'read': case 'study': prop('book', rx - 2 * P, hy - 3 * P); if (act === 'study') prop('note', rx + 4 * P, hy - 9 * P - (Math.floor(e * 2) % 2) * 2); break;
      case 'game': prop('game', rx - 2 * P, hy - 2 * P, { t: Math.floor(e * 3) % 2 ? '#7fb3e0' : '#a9e0b5' }); break;
      case 'guitar': prop('guitar', rx - 3 * P, hy - 3 * P + (Math.floor(e * 4) % 2)); prop('note', rx + 6 * P, hy - 10 * P - (e * 8) % 14); break;
      case 'sing': prop('mic', rx - P, hy - 5 * P); prop('note', rx + 3 * P + (e * 6) % 12, hy - 10 * P - (e * 9) % 14); break;
      case 'lift': prop('dumbbell', rx - 2 * P, hy - (Math.floor(e * 1.5) % 2 ? 9 : 2) * P); break;
      case 'fish': { prop('rod', rx - P, hy - 7 * P); const tx = rx + 6 * P, ty = hy - 7 * P; g.fillStyle = '#8a6a45'; for (let k = 0; k < 8; k++) g.fillRect(tx + k * 0.6, ty + k * 3, 1, 3); g.fillStyle = '#c0392b'; g.fillRect(tx + 5, ground - 2 + Math.round(osc), 3, 3); g.fillStyle = '#7fb3e0'; g.fillRect(tx - 6, ground + 1, 26, 2); break; }
      case 'golf': { const sw = Math.floor(e * 1.2) % 2; g.save(); g.translate(rx, hy); g.rotate(sw ? -2.2 : 0.5); prop('golf', -P, -P, {}); g.restore(); g.fillStyle = '#fff'; g.fillRect(rx + 4 * P + (sw ? e % 1 * 40 : 0), ground - 3 - (sw ? (e % 1) * 20 : 0), 3, 3); break; }
      case 'cook': prop('pot', rx, hy - P); g.globalAlpha = 0.5; g.fillStyle = '#b9b4ab'; for (let k = 0; k < 3; k++) g.fillRect(rx + P * (1 + k * 1.4) + Math.sin(e * 3 + k) * 2, hy - 4 * P - ((e * 10 + k * 5) % 14), 2, 3); g.globalAlpha = 1; break;
      case 'photo': prop('camera', rx - P, hy - 4 * P); if (Math.floor(e * 1.3) % 3 === 0) { g.fillStyle = 'rgba(255,240,170,.85)'; g.fillRect(rx + 4 * P, hy - 7 * P, 6, 6); } break;
      case 'garden': prop('can', rx, hy - P); prop('sprout', rx + 7 * P, ground - 3 * P - (e > 2 ? P : 0)); g.fillStyle = '#7fb3e0'; for (let k = 0; k < 3; k++) g.fillRect(rx + 5 * P + k * 2, hy + P + ((e * 20 + k * 4) % 10), 1, 2); break;
      case 'phone': if (((S.life && S.life.year) || 2026) < 1997) prop('book', rx - P, hy - 3 * P); else prop('phone', rx - P, hy - 3 * P, { t: '#a9c7e6' }); if (Math.floor(e * 2) % 2) prop('heart', rx + 3 * P, hy - 9 * P - (e * 4) % 8); break;
      case 'cheer': prop('flag', rx - P, hy - 9 * P + (Math.floor(e * 4) % 2) * P); break;
      case 'camp': prop('fire', rx + 4 * P, ground - 3 * P, { z: Math.floor(e * 6) % 2 ? '#e0604c' : '#e8b94a' }); break;
      case 'shogi': prop('board', rx + P, hy - P); break;
      case 'tea': prop('cup', rx - P, hy - 2 * P); g.globalAlpha = 0.5; g.fillStyle = '#b9b4ab'; g.fillRect(rx + Math.sin(e * 3) * 2, hy - 4 * P - (e * 6) % 8, 2, 3); g.globalAlpha = 1; break;
      case 'knit': prop('knit', rx - P, hy - 2 * P + (Math.floor(e * 3) % 2)); break;
      case 'tv': prop('tv', rx + 3 * P, ground - 8 * P, { t: ['#7fb3e0', '#a9e0b5', '#f2c9a5'][Math.floor(e * 1.5) % 3] }); break;
      case 'ball': case 'play': { const bh = Math.abs(Math.sin(e * 4)) * 14; prop(a <= 5 && act === 'play' ? 'rattle' : 'ball', rx + 2 * P, (a <= 5 && act === 'play') ? hy - 4 * P + (Math.floor(e * 5) % 2) * 2 : ground - 4 * P - bh); break; }
      case 'work': prop(a >= 22 && l.job && /会社|事務|銀行|IT|営業|公務員|企画|経理|総務/.test(l.job.title || '') ? 'briefcase' : 'bag', hx, hy); break;
      case 'love': for (let k = 0; k < 3; k++) prop('heart', ox + cw / 2 + Math.sin(e * 2 + k * 2) * 14, oy - 6 - ((e * 12 + k * 9) % 26), {}); break;
      case 'baby': prop('babyb', rx - 2 * P, hy - 3 * P + (Math.floor(e * 2) % 2)); prop('heart', ox + cw / 2, oy - 8 - (e * 6) % 10, {}); break;
      case 'celebrate': { const cols = ['#c0392b', '#e8b94a', '#5c8a5a', '#7fb3e0', '#d9667a']; for (let k = 0; k < 18; k++) { g.fillStyle = cols[k % 5]; g.fillRect((ox - 30 + k * 13 + Math.sin(e * 3 + k) * 6) % W, ((k * 17 + e * 30) % (ground - 4)), 3, 3); } prop('sparkle', ox - 10, oy + (Math.floor(e * 4) % 2) * 4); prop('sparkle', ox + cw + 4, oy + 6 - (Math.floor(e * 4) % 2) * 4); break; }
      case 'sad': { prop('cloud', ox + cw / 2 - 4 * P, oy - 16, {}); g.fillStyle = '#7fb3e0'; for (let k = 0; k < 4; k++) g.fillRect(ox + cw / 2 - 8 + k * 6, oy - 2 + ((e * 30 + k * 7) % 16), 1, 3); break; }
      case 'money': for (let k = 0; k < 6; k++) prop('coin', ox - 12 + k * 10, ((e * 40 + k * 13) % (ground - 10)) - 6, {}); break;
      case 'travel': prop('suitcase', flip ? ox - 4 * P : ox + cw, ground - 5 * P); prop('plane', W - ((e * 50) % (W + 30)), 10, {}); break;
      case 'move': prop('box', hx - P, hy - 2 * P); break;
      case 'drink': prop('mug', rx - P, hy - (Math.floor(e * 1.2) % 2 ? 6 : 2) * P); break;
      case 'smoke': prop('cig', rx, hy - P); g.globalAlpha = 0.6; prop('smoke', rx + 3 * P + Math.sin(e * 2) * 2, hy - 6 * P - (e * 5) % 8); g.globalAlpha = 1; break;
      case 'talk': prop('bubble', ox + cw * 0.55, oy - 15 + (Math.floor(e * 2) % 2) * 2, {}); break;
      case 'walk': if (a >= 6 && a <= 11) break; if (l.job && !l.retired && a >= 22 && a < 65) prop('briefcase', hx, hy); break;
    }
    // ペットがついてくる
    if (l.pet && !l.pet.dead && /犬|猫/.test(l.pet.kind || '')) { const dog = /犬/.test(l.pet.kind), px = ox + (flip ? cw + 2 : -7 * P) ; prop(dog ? 'dog' : 'cat', px, ground - 4 * P + (step && act === 'walk' ? -1 : 0), dog ? { k: '#b08a5a' } : { f: '#6b6b6b' }, !flip); }
  }
  function famPixel(l) {
    const cv = $('#famCv'); if (!cv || !window.PXS) return;cv._life=l;
    const Wc = Math.max(200, Math.floor((cv.parentElement.clientWidth || 322) - 2)), Hc = 110, sc = pxDpr(), P = 3;
    cv.width = Wc * sc; cv.height = Hc * sc; cv.style.width = Wc + 'px'; cv.style.height = Hc + 'px';
    const tok = cv._tok = {}; pxSnap(cv.getContext('2d'));
    if (window.ResizeObserver && !cv._ro) { cv._ro = new ResizeObserver(() => { const w = Math.floor(cv.parentElement.clientWidth); if (w && Math.abs(w - parseFloat(cv.style.width)) > 2) famPixel(cv._life); }); cv._ro.observe(cv.parentElement); }
    const f = {...l.fam,mood:['仲良し家族','にぎやか','穏やか'][l.seed%3],satisfied:true,dinner:'ほぼ毎日'}, mood = f.mood, happy = ['仲良し家族', 'にぎやか', '穏やか', '自由'].includes(mood), tense = mood === 'ピリピリしている';
    const hap = happy ? 85 : tense ? 20 : 45;
    const mk = (age, sex, job, gray) => ({ age, sex, alive: true, stats: { happy: hap, health: 70, know: 40 }, edu: { stage: age <= 5 ? 'baby' : age <= 11 ? 'elem' : age <= 14 ? 'jhs' : age <= 17 ? 'hs' : 'work' }, job: job || null, retired: age >= 65, flags: {} });
    const ppl = [];
    if (f.gen3) ppl.push({ p: mk(Math.max(60, (f.father || f.mother).age0 + 28), 'M') }, { p: mk(Math.max(58, (f.father || f.mother).age0 + 26), 'F') });
    if (f.father) ppl.push({ p: mk(f.father.age0, 'M', f.father.job && f.father.job.kind !== '無職' ? f.father.job : null), dad: true });
    ppl.push({ p: mk(f.mother.age0, 'F', null), mom: true });
    f.siblings.slice(0,3).forEach(x=>ppl.push({p:mk(x.age,x.sex||'F')}));
    const grids = ppl.map((o) => pixelChar(o.p, true));
    const fxFor = { 仲良し家族: 'hearts', にぎやか: 'notes', 穏やか: 'sun', 自由: 'kite', ピリピリしている: 'bolt', 会話が少ない: 'dots', 厳格: 'books' }[mood];
    const g = cv.getContext('2d'), W = Wc, ground = Hc - 8, t0 = performance.now();
    const prop = (name, x, y, pal) => { const [m, extra] = PROPS[name]; const pl = { ...extra, ...(pal || {}) }; m.forEach((row, j) => [...row].forEach((c, i) => { if (c === '.') return; g.fillStyle = pl[c] || pxCol(c); g.fillRect(x + i * P, y + j * P, P, P); })); };
    const frame = (now) => {
      if (cv._tok !== tok || !document.body.contains(cv) || !$('#birth').classList.contains('active')) return;
      const T = reduced?0:now / 1000, e = reduced?0:(now - t0) / 1000;
      g.setTransform(sc, 0, 0, sc, 0, 0); g.imageSmoothingEnabled = false; g.clearRect(0, 0, W, Hc);
      const h = { Y: (S.life && S.life.year) || 2026, g, W, gr: ground, T, e, P, r: (x, y, w, hh, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, hh); }, prop };
      window.PXS.BG.homein(h);
      // 食卓
      if (f.dinner === 'ほぼ毎日') { h.r(W * 0.6 + 8, ground - 20, 10, 3, '#ffffff'); h.r(W * 0.6 + 22, ground - 21, 12, 4, '#ffffff'); h.r(W * 0.6 + 24, ground - 23, 8, 2, '#c0392b'); }
      if (f.dinner === 'ほとんどない') { h.r(W * 0.88, 10, 14, 14, '#ffffff'); h.r(W * 0.88 + 6, 12, 2, 6, '#3a332b'); h.r(W * 0.88 + 6, 17, 5, 2, '#3a332b'); }
      g.fillStyle = 'rgba(43,38,32,.2)'; g.fillRect(0, ground, W, 1);
      const tot = grids.reduce((t, gd, i) => t + gd.G * P * 0.72 + (ppl[i].mom && !f.satisfied && f.father ? 30 : 0), 0);
      let x = Math.max(4, (W * 0.58 - tot) / 2), momX = 0, dadX = 0, top = ground;
      grids.forEach((gd, i) => {
        if (ppl[i].mom && !f.satisfied && f.father) x += 30; // 夫婦仲が悪いと離れて立つ
        const r = drawFig(g, gd, x, ground, P, { pose: happy && Math.floor(e * 1.2 + i) % 5 === 0 ? 'jump' : 'stand', T, e, ph: i, flip: ppl[i].dad && tense });
        if (ppl[i].mom) momX = x; if (ppl[i].dad) dadX = x; top = Math.min(top, r.top);
        x += gd.G * P * 0.72;
      });
      // 母に抱かれた赤ちゃん（あなた）
      const mg = grids[ppl.findIndex((o) => o.mom)];
      prop('babyb', momX + mg.G * P * 0.45, ground - (mg.R - mg.hand) * P - 4 * P + (Math.floor(e * 2) % 2));
      const cx = (dadX || momX) + 20;
      switch (fxFor) {
        case 'hearts': for (let k = 0; k < 3; k++) prop('heart', cx + Math.sin(e * 2 + k * 2) * 20, top - 4 - ((e * 12 + k * 9) % 24)); break;
        case 'notes': for (let k = 0; k < 3; k++) prop('note', cx - 20 + k * 22 + (e * 6) % 8, top - (e * 9 + k * 7) % 20); break;
        case 'sun': h.r(W * 0.12 + 16, 12, 10, 10, '#e8b94a'); break;
        case 'kite': h.r(W * 0.12 + 10 + Math.sin(e) * 3, 12 + Math.cos(e) * 2, 8, 8, '#c0392b'); break;
        case 'bolt': { const bx = (dadX + momX) / 2 + 12; if (Math.floor(e * 3) % 2) { h.r(bx, top - 4, 3, 6, '#c0392b'); h.r(bx - 3, top + 2, 3, 6, '#c0392b'); h.r(bx, top + 8, 3, 6, '#c0392b'); } break; }
        case 'dots': prop('bubble', cx, top - 14); break;
        case 'books': h.r(6, ground - 6, 18, 6, '#2c4a7a'); h.r(8, ground - 12, 14, 6, '#c0392b'); break;
      }
      if (f.eduMama) prop('book', W * 0.6 + 40, ground - 26);
      if(!document.hidden)requestAnimationFrame(frame);else cv._tok=null;
    };
    requestAnimationFrame(frame);
  }

  function pxEvent(ev){
    const l=S.life,T=performance.now()/1000,sp=PX_SCENE;if(!l)return;
    const t=ev.t||'',sc=/买下|住房|买房|搬家|收房/.test(t)?{bg:'newhouse',pose:'stand',fx:'box',fam:true,label:'安一个家'}:/孩子.*来到|奶瓶/.test(t)?{bg:'homein',pose:'stand',fx:'baby',fam:true,label:'新的牵挂'}:/恋|喜欢|伴侣|心动|告白/.test(t)?{bg:'park',pose:'stand',fx:'hearts',fam:true,label:'心里的事'}:/录取|毕业|考试/.test(t)?{bg:'classroom',pose:'stand',fx:ev.tone==='bad'?'cloud':'diploma',label:'又一个路口'}:/团圆|年夜饭|春节/.test(t)?{bg:'festival',pose:'stand',fam:true,fx:'talk',label:'团聚'}:null;
    sp.scene=sc;sp.ev=true;sp.t=T;sp.until=T+4;sp.sg={};
    sp.act=sc?'scene':ev.c==='money'?'money':ev.c==='health'?'sick':ev.tone==='bad'?'sad':ev.c==='family'?'talk':ev.c==='school'?'study':ev.c==='work'?'work':/读|书|技能/.test(t)?'read':ev.c==='action'?'walk':'talk';
    $('#pxLabel').textContent=sc?.label||ACT_LABEL[sp.act]||'';
  }
  let knownSeed=null,knownAge=-1,knownLogs=0,last=0;
  function update(l){
    S.life=l;
    if(knownSeed!==l.seed){knownSeed=l.seed;knownAge=l.age;knownLogs=l.log.length;Object.assign(PX_SCENE,{q:[],act:'walk',until:performance.now()/1000+4,t:performance.now()/1000,key:'',sg:{},famG:{},x:60,tx:150});}
    else if(knownLogs<l.log.length){PX_SCENE.q.push(...l.log.slice(knownLogs).filter(e=>e.c!=='note').slice(-6));knownLogs=l.log.length;PX_SCENE.until=Math.min(PX_SCENE.until,performance.now()/1000);}
    if(knownAge!==l.age){PX_SCENE.sg={};PX_SCENE.famG={};knownAge=l.age;}
    const members=pxFamily(l,true);$('#pxStage').setAttribute('aria-label',`你${members.length?'与'+members.map(m=>m.name).join('、'):'独自'}的像素生活场景`);
  }
  function draw(l,now){
    S.life=l;const cv=$('#pxStage');if(!cv||!cv.parentElement.clientWidth)return;
    const W=Math.floor(cv.parentElement.clientWidth),H=72,k=pxDpr();if(cv.width!==W*k||cv.height!==H*k){cv.width=W*k;cv.height=H*k;cv._sc=k;cv.style.width=W+'px';cv.style.height=H+'px';}
    drawPx(cv,l,reduced?0:now/1000,Math.min(.1,(now-last)/1000)||.016,3);last=now;
  }
  function birth(l){S.life=l;famPixel(l);}
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&$('#birth').classList.contains('active')&&S.life)birth(S.life);});
  window.CNAnimation={update,draw,birth,members:pxFamily};
})();
