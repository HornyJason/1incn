/* 像素人物沿用 satorunet/1injp app.js（MIT），增加中国校服配色。 */
(function(){
  const PX = { h: '#2b2017', H: '#6b4a2e', g: '#b9b4ab', s: '#f2c9a5', e: '#2b2017', m: '#b5443a', r: '#f19a8e', t: '#7fb3e0', w: '#ffffff', y: '#e8b94a', k: '#8a6a45', f: '#3a332b', z: '#c0392b' };
  function pixelChar(l, asGrid) {
    let hand = 5;
    const a = l.alive ? l.age : l.deathAge, F = l.sex === 'F', hap = l.stats.happy, ill = l.stats.health < 35;
    const G = 14, rows = []; let R = 0;
    const put = (y, x, c) => { if (x < 0 || x >= G) return; (rows[y] = rows[y] || Array(G).fill(null))[x] = c; };
    const hline = (y, x0, x1, c) => { for (let x = x0; x <= x1; x++) put(y, x, c); };
    // 体の寸法：[頭の高さ, 胴, 脚]
    const dims = a <= 1 ? null : a <= 5 ? [5, 3, 2] : a <= 11 ? [5, 4, 3] : a <= 17 ? [6, 5, 4] : a <= 74 ? [6, 6, 5] : a <= 84 ? [6, 5, 4] : [6, 5, 3];
    const st = l.edu.stage, working = !!l.job && !l.retired, suit = working && a >= 22 && a < 65 && !/农业|配送|工厂|护理|社区|餐饮|店员|技师/.test(l.job.title || '');
    const Y0 = l.year || 2026 || 2026;
    const hair = a >= 70 ? 'g' : a >= 55 ? 'G' : (!F && a >= 4 && a <= 15 && Y0 < 1960) ? '#5a5650' : (F && a >= 18 && a < 40) ? 'H' : 'h';
    const cx = 6; // 頭の左端（幅6）は x=4..9
    const bend = a >= 80 ? 1 : 0;
    if (!dims) {
      // 赤ちゃん：おくるみ
      hline(0, 5, 8, 'h'); hline(1, 4, 9, 's'); put(1, 5, 'h');
      hline(2, 4, 9, 's'); put(2, 5, 'e'); put(2, 8, 'e'); hline(3, 4, 9, 's'); hline(3, 6, 7, hap >= 50 ? 'm' : 's'); if (hap >= 50) { put(3, 4, 'r'); put(3, 9, 'r'); }
      hline(4, 3, 10, 'w'); hline(5, 3, 10, 'Y'); hline(6, 3, 10, 'Y'); hline(7, 4, 9, 'w'); R = 8;
    } else {
      const [hh, th, lh] = dims, x0 = 4 + bend, x1 = 9 + bend;
      // 髪
      const hc = (y, x) => hair === 'G' ? ((x + y) % 2 ? 'h' : 'g') : hair;
      for (let x = x0 + 1; x <= x1 - 1; x++) put(0, x, hc(0, x));
      for (let x = x0; x <= x1; x++) put(1, x, hc(1, x));
      // 顔
      for (let y = 2; y < 1 + hh; y++) for (let x = x0; x <= x1; x++) put(y, x, 's');
      if (F && a >= 3) for (let y = 1; y < hh + (a >= 12 ? 2 : 1); y++) { put(y, x0 - 1, hc(y, x0 - 1)); put(y, x1 + 1, hc(y, x1 + 1)); }
      else { put(2, x0, hc(2, x0)); put(2, x1, hc(2, x1)); }
      const ey = 3 + (hh >= 6 ? 0 : 0);
      put(ey, x0 + 1, 'e'); put(ey, x1 - 1, 'e');
      if (a >= 45 && l.stats.know >= 60) { put(ey, x0, 'f'); put(ey, x1, 'f'); hline(ey, x0 + 2, x1 - 2, 'f'); }
      const my = ey + 2;
      if (hap >= 60) { hline(my, x0 + 2, x1 - 2, 'm'); put(my - 1, x0 + 1, 'm'); put(my - 1, x1 - 1, 'm'); put(ey + 1, x0, 'r'); put(ey + 1, x1, 'r'); }
      else if (hap >= 35) hline(my, x0 + 2, x1 - 2, 'm');
      else { put(my, x0 + 2, 'm'); put(my, x1 - 2, 'm'); put(my - 1, x0 + 3, 'm'); put(my - 1, x1 - 3, 'm'); put(ey + 1, x0 + 1, 't'); }
      if (a >= 60) { put(ey + 1, x0 + 2, 'G2'); }
      let y = 1 + hh;
      // 服の色：段階ごと
      let top = F ? '#d9667a' : '#4f86c6', bot = '#3d4b6a', collar = null, extra = null;
      if (a <= 5) { top = F ? '#f3a6b8' : '#8ec3e6'; bot = top; if (st === 'hoiku' || st === 'yochien' || a >= 3) extra = 'smock'; }
      else if (a <= 11) { top = F ? '#e7889b' : '#e2b552'; bot = '#3d4b6a'; extra = 'randoseru'; }
      else if (a <= 17 && st !== 'work') { top = '#f0f4fa'; bot = '#3c67a2'; collar = null; }
      else if (a <= 27 && !['work', 'baby', 'elem', 'jhs', 'hs'].includes(st)) { top = F ? '#c9a27a' : '#7a9a6a'; bot = '#3b4f7a'; }
      else if (suit) { top = F ? '#3d4250' : '#2f3542'; bot = top; collar = 'tie'; }
      else if (working) { top = F ? '#c5705b' : '#5d7d9a'; bot = '#4a4a4a'; }
      else if (a >= 65) { top = F ? '#b98fb0' : '#8b7a5a'; bot = '#5a5248'; extra = 'cardigan'; }
      // 時代の服装：戦時は国民服・もんぺ、戦前と昭和前半のお年寄りは着物、昭和の主婦は割烹着
      const Y = l.year || 2026 || 2026;
      if (Y < 1975 && !l.outfit) {
        if (Y < 1946 && a >= 18 && l.flags && l.flags.heieki && l.flags.heieki.alive) { top = '#6b6a3e'; bot = '#6b6a3e'; collar = 'gaku'; extra = 'gunbo'; }
        else if (Y >= 1938 && Y < 1946 && a >= 18 && !F) { top = '#7a6e48'; bot = '#7a6e48'; collar = 'gaku'; extra = null; }
        else if (Y >= 1942 && Y < 1946 && F && a >= 12) { top = a >= 50 ? '#5a5060' : '#8a6a5a'; bot = '#3d4058'; collar = 'kimono'; extra = 'monpe'; }
        else if (a >= 6 && a <= 11 && Y < 1958) { top = F ? '#c9a0a0' : '#e8e2d2'; bot = F ? '#5a4a6a' : '#3d4b6a'; extra = null; }
        else if (F && a >= 18 && (Y < 1940 || (a >= 50 && Y < 1965))) { top = a >= 50 ? '#6a5a6a' : '#8a5a6a'; bot = top; collar = 'kimono'; extra = 'obi'; }
        else if (!F && a >= 60 && Y < 1955) { top = '#5a5248'; bot = '#5a5248'; collar = 'kimono'; extra = null; }
        else if (F && a >= 25 && !working && Y >= 1950) { collar = 'apron'; }
        if (a <= 5 && Y < 1960) extra = null;
      }
      if (l.tint && !collar) top = l.tint;
      const O = l.outfit; // 場面ごとの服装（喪服・エプロン・振袖など）
      if (O) { if (O.top) top = O.top; if (O.bot) bot = O.bot; if ('collar' in O) collar = O.collar; if ('extra' in O) extra = O.extra; if (O.bare) top = PX.s; }
      if (ill) top = '#cfd8dc';
      const tx0 = x0 - (a >= 18 ? 1 : 0), tx1 = x1 + (a >= 18 ? 1 : 0);
      for (let i = 0; i < th; i++, y++) {
        hline(y, tx0, tx1, top);
        put(y, tx0 - 1, i < th - 1 ? top : 's'); put(y, tx1 + 1, i < th - 1 ? top : 's'); // 腕と手
      }
      const ty = 1 + hh;
      if (collar === 'sailor') { hline(ty, tx0, tx1, 'w'); put(ty + 1, cx, 'z'); put(ty + 1, cx + 1, 'z'); }
      if (collar === 'gaku') { put(ty, cx, 'f'); put(ty, cx + 1, 'f'); for (let i = 1; i < th; i++) put(ty + i, cx + (bend ? 1 : 0), 'y'); }
      if (collar === 'blacktie') { put(ty, cx, 'w'); put(ty, cx + 1 + bend, 'w'); for (let i = 1; i < th - 1; i++) put(ty + i, cx + (i % 2) + bend, 'f'); }
      if (collar === 'apron') { const ac = (O && O.apron) || (O ? '#4f9a6a' : '#f4f1ea'); for (let i = 1; i < th; i++) hline(ty + i, tx0 + 1, tx1 - 1, ac); put(ty, tx0 + 1, ac); put(ty, tx1 - 1, ac); }
      if (collar === 'kimono') { put(ty, cx, 'w'); put(ty, cx + 1, 'w'); put(ty + 1, cx + 1, 'w'); hline(ty + th - 2, tx0, tx1, F ? 'y' : 'f'); }
      if (collar === 'coat') { for (let i = 0; i < th; i++) put(ty + i, cx + (i ? 0 : 1), i ? '#c8ccd2' : 't'); }
      if (collar === 'tie') { put(ty, cx, 'w'); put(ty, cx + 1 + bend, 'w'); for (let i = 1; i < th - 1; i++) put(ty + i, cx + (i % 2) + bend, 'z'); }
      if (extra === 'randoseru') { put(ty, tx0 - 1, 'z'); put(ty + 1, tx0 - 1, 'z'); put(ty, tx1 + 1, 'z'); put(ty + 1, tx1 + 1, 'z'); }
      if (extra === 'smock') { hline(ty, tx0, tx1, 'y'); }
      if (extra === 'obi') hline(ty + th - 2, tx0, tx1, '#d8b65a');
      if (extra === 'gunbo') { hline(0, x0, x1, '#6b6a3e'); hline(1, x0 - 1, x1 + 1, '#6b6a3e'); put(0, cx, '#d8b65a'); }
      if (extra === 'cardigan') for (let i = 0; i < th; i++) put(ty + i, cx + bend, 'w');
      // 下半身：女子はスカート（学生・子ども）
      let skirt = F && a >= 3 && (a <= 17 || (suit && a < 40));
      if (O && 'skirt' in O) skirt = !!O.skirt && F;
      const dress = (O && O.dress) || (!O && extra === 'obi');
      if (!O && extra === 'monpe') skirt = false;
      for (let i = 0; i < lh; i++, y++) {
        if (dress) { hline(y, tx0 - (i >= 1 ? 1 : 0), tx1 + (i >= 1 ? 1 : 0), bot); continue; }
        if (skirt && i < 2) { hline(y, tx0 - (i ? 1 : 0), tx1 + (i ? 1 : 0), bot); continue; }
        const lc = skirt ? 's' : bot;
        hline(y, cx - 1 + bend, cx + bend, lc); hline(y, cx + 2 + bend, cx + 3 + bend, lc);
      }
      hline(y, cx - 1 + bend, cx + bend, 'f'); hline(y, cx + 2 + bend, cx + 3 + bend, 'f'); y++;
      // 杖
      if (a >= 75) for (let i = ty + th - 1; i < y; i++) put(i, Math.min(G - 1, tx1 + 2), 'k');
      R = y; hand = ty + th - 1;
    }
    if (asGrid) return { rows, R, G, hand };
    const P = 2.5, col = (c) => c === 'G' ? PX.g : c === 'G2' ? '#e0b896' : c === 'Y' ? '#f6e3a8' : PX[c] || c;
    let out = '';
    for (let y = 0; y < R; y++) if (rows[y]) rows[y].forEach((c, x) => { if (c) out += `<rect x="${x * P}" y="${y * P}" width="${P + 0.05}" height="${P + 0.05}" fill="${col(c)}"/>`; });
    return `<svg class="pxchar" viewBox="0 0 ${G * P} ${R * P}" width="${G * P}" height="${R * P}" shape-rendering="crispEdges" aria-hidden="true">${out}</svg>`;
  }


window.CN_PIXEL={pixelChar,PX};
})();
