const assert = require('node:assert/strict');
require('../data.js');
require('../engine.js');
require('../cn-data.js');
require('../cn-assets.js');
require('../cn-queer.js');
require('../cn-career.js');
for(const f of ['cn-economy','cn-education','cn-society','cn-city-stories'])require('../'+f+'.js');
require('../cn-local.js');
require('../cn-engine.js');
const E = global.CNEngine;
const date = '2026-10-23T08:00:00+08:00';
const make = seed => E.createLife({ seed, date });
const sample = make(123);
E.runAuto(sample);
assert.equal(sample.alive, false, '人生必须能够自然结束');
assert.ok(sample.log.length > 5);
assert.deepEqual(E.serialize(E.runAuto(make(123))), E.serialize(sample), '相同种子可复现');
const original = E.runAuto(make(892), 24);
const restored = E.hydrate(E.serialize(original));
E.runAuto(original); E.runAuto(restored);
assert.deepEqual(E.serialize(original), E.serialize(restored), '恢复存档不得改变后续随机结果');
const legacy = E.hydrate(JSON.parse(require('node:fs').readFileSync(__dirname + '/fixtures/v01-save.json')));
assert.equal(legacy.age, 24);
assert.equal(E.nameOf(legacy), '罗梓萱');
assert.equal(legacy.notes.at(-1).t, '旧版本存档兼容验证');
assert.equal(legacy.version, CN_DATA.version);
assert.ok(legacy.fam.mother.sei);
const beforePeers = E.serialize(legacy);
const peers = E.peers(legacy, legacy.age);
assert.equal(peers.length, 5);
assert.ok(peers.every(p => p.age <= legacy.age));
assert.deepEqual(E.serialize(legacy), beforePeers, '对照人生不能消耗主角随机数');
const actionLife = E.hydrate(E.serialize(legacy));
assert.equal(E.act(actionLife, 'read'), true);
const afterAction = E.serialize(actionLife);
assert.equal(E.act(actionLife, 'exercise'), false, '每年只能主动安排一次');
assert.deepEqual(E.serialize(actionLife), afterAction);
// 负结余不能因为结婚支出被错误地抹成零。
const marriageLife = make(991);
marriageLife.age = 28; marriageLife.year = marriageLife.born.y + 28;
marriageLife.done.social = true;
marriageLife.partner = { name: '模拟伴侣' };
marriageLife.savings = -5000;
const marriage = E.pendingDecisions(marriageLife)[0];
assert.equal(marriage.id, 'marriage');
E.resolve(marriageLife, marriage, 0);
assert.equal(marriageLife.savings, -5000);
// 按城市分档计价，并把每年的本金、利息与现金变动核对起来。
const houseLife = E.createLife({seed:999,pref:'北京市',date});
houseLife.age = 42; houseLife.year = houseLife.born.y + 42;
houseLife.savings = 5000000; houseLife.income = 160000;
houseLife.done.career = true; houseLife.done.social = true;
const housing = E.pendingDecisions(houseLife)[0];
assert.equal(housing.id, 'housing');
E.resolve(houseLife, housing, 0);
assert.equal(houseLife.house.value, 3200000);
assert.ok(E.cityProfile(houseLife).homePrice > E.cityProfile({...houseLife,city:'长治',pref:'山西省',rural:false}).homePrice);
for(let i=0;i<25;i++) {
  houseLife.age++; houseLife.year++;
  const before = houseLife.savings;
  CNLocal.year(houseLife,{log(){}});
  assert.equal(houseLife.savings-before, houseLife.finances.balance, '账本与现金增减必须一致');
  assert.ok(houseLife.mortgage.balance >= 0);
}
assert.equal(houseLife.mortgage.balance, 0, '到期后归还最后的剩余本金');
const broken = E.serialize(legacy); broken.stats.health = null;
assert.throws(()=>E.hydrate(broken));
const malformed = E.serialize(legacy); malformed.fam.mother = null;
assert.throws(()=>E.hydrate(malformed));
require('../cn-views.js');
const albumLife = E.hydrate(E.serialize(legacy));
albumLife.log.push({age:24,t:'<script>alert(1)</script>',c:'note'});
const album = CNViews.album(albumLife);
assert.ok(!album.includes('<script>'));
assert.ok(album.includes('&lt;script&gt;'));
let branches = 0, sum = 0;
for (let seed = 1; seed <= 1000; seed++) {
  const l = make(seed);
  for (let steps = 0; l.alive && steps < 300; steps++) {
    const d = E.pendingDecisions(l)[0];
    if (d) {
      // 在同一状态下验证所有选择，包括自动模式较少选择的分支。
      for (const o of d.options) {
        const clone = E.hydrate(E.serialize(l));
        const same = E.pendingDecisions(clone)[0];
        E.resolve(clone, same, o.i);
        assert.equal(clone.done[d.id], true);
        for (const value of Object.values(clone.stats)) assert.ok(Number.isFinite(value));
        branches++;
      }
      E.resolve(l, d, E.autoChoice(l, d));
    } else E.step(l);
  }
  assert.equal(l.alive, false, '不能卡在选择或年份循环中');
  assert.ok(l.age > 0 && l.age <= 115);
  assert.ok(CN_DATA.provinces.some(p => p.name === l.birthPref));
  assert.ok(Number.isFinite(l.savings));
  for (const value of Object.values(l.stats)) assert.ok(value >= 0 && value <= 100);
  sum += l.age;
}
console.log(`通过：1000 局完整人生、${branches} 次选择分支、种子复现、存档恢复。`);
console.log('通过：0.1 存档迁移、对照人生隔离、每年主动安排、负资产婚礼、城市房价分档、25 年还贷和账本核对、无效导入拒绝、人生册文本转义。');
console.log(`样本平均结束年龄：${(sum / 1000).toFixed(2)}（仅为模型诊断，不代表中国生命表）。`);
