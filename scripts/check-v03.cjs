const assert=require('node:assert/strict'),fs=require('node:fs');
for(const f of ['data','engine','cn-data','cn-assets','cn-queer','cn-local','cn-engine','cn-views'])require('../'+f+'.js');
const E=CNEngine,date='2026-10-23T12:00:00+08:00',make=seed=>E.createLife({seed,date,pref:'北京市',sex:'M'});
function adult(seed=803){const l=make(seed);l.age=30;l.year=l.born.y+30;l.savings=10000000;l.income=200000;l.done={social:true,workStyle:true};l.flags.livesWithParents=false;l.finances={year:l.year,balance:0,expense:0};return l;}
const l=adult(),start=l.savings,net0=E.assetTotals(l).netWorth;
const q=CNAssets.quote(l,'small','loan');
assert.ok(E.transact(l,'buyHome',{size:'small',mode:'loan',use:'self'}).ok);
assert.equal(start-l.savings,q.down+q.fees);assert.equal(l.debt,q.balance);assert.equal(E.assetTotals(l).netWorth,net0-q.fees);
assert.ok(E.transact(l,'buyHome',{size:'small',mode:'cash',use:'rent'}).ok);
assert.ok(E.transact(l,'buyCar',{id:'compact'}).ok);
assert.equal(l.savings-start,l.finances.balance,'手动资产现金流与账本一致');
const initial=E.serialize(l),a=E.hydrate(initial),b=E.hydrate(E.serialize(l));
for(let n=0;n<12;n++){
  for(const x of[a,b]){x.age++;x.year++;const cash=x.savings;CNLocal.year(x,{log(){}});assert.equal(x.savings-cash,x.finances.balance);assert.ok(x.finances.rentalIncome>0);assert.ok(x.finances.propertyCost>0);assert.ok(x.finances.carCost>0);}
}
assert.deepEqual(E.serialize(a),E.serialize(b),'资产价格、租金与还贷恢复可复现');
assert.ok(a.car.value<90000);assert.notEqual(a.properties[0].value,q.price);
const total=a.debt,sold=a.properties[0],cash=a.savings,net=Math.round(sold.value-Math.round(sold.value*.02)-sold.loan.balance);
assert.ok(E.transact(a,'sellHome',{id:sold.id}).ok);assert.equal(a.savings,cash+net);assert.equal(a.debt,total-sold.loan.balance);assert.equal(a.house,null);
const loanCount=a.properties.length,before=E.serialize(a);assert.equal(E.transact(a,'sellHome',{id:sold.id}).ok,false);assert.deepEqual(E.serialize(a),before);
assert.ok(E.transact(a,'useHome',{id:a.properties[0].id,use:'self'}).ok);assert.equal(a.house.use,'self');
assert.ok(E.transact(a,'sellCar').ok);assert.equal(a.car,null);
const poor=adult();poor.savings=1;const poorBefore=E.serialize(poor);assert.equal(E.transact(poor,'buyHome',{size:'small',mode:'loan',use:'self'}).ok,false);assert.deepEqual(E.serialize(poor),poorBefore);
const legacy=JSON.parse(fs.readFileSync(__dirname+'/fixtures/v01-save.json'));legacy.house={name:'旧房子',value:800000};legacy.debt=200000;legacy.mortgage={balance:200000,rate:.035,annualPayment:40000,yearsLeft:6};
const migrated=E.hydrate(legacy);assert.equal(migrated.properties.length,1);assert.equal(migrated.properties[0].loan.balance,200000);assert.equal(E.hydrate(E.serialize(migrated)).debt,200000);
const secondary=adult();E.transact(secondary,'buyHome',{size:'small',mode:'loan',use:'rent'});const debt=secondary.debt;CNLocal.normalize(secondary);assert.equal(secondary.debt,debt,'仅持出租房不生成重复借款');
// 整局一次抽样，不随年龄叠加；统计轻量哈希样本。
let enabled=0,own=0,admirer=0;
for(let seed=0;seed<100000;seed++){const x={seed,sex:'M',partner:null,spouse:null};CNQueer.normalize(x);if(x.queer.enabled){enabled++;if(x.queer.orientation==='gay')own++;else admirer++;}}
assert.ok(enabled>2700&&enabled<3300);assert.ok(own>0&&admirer>0);
function queerLife(type='self') {const x=adult();x.queer={enabled:true,type,orientation:type==='self'?'gay':'straight',out:{},pending:null};return x;}
const gay=queerLife();const crush=E.pendingDecisions(gay)[0];assert.equal(crush.id,'queerCrush');E.resolve(gay,crush,0);
assert.equal(CNQueer.partnerSex(gay),'M');assert.ok(E.requestPrivate(gay,'friends'));let d=E.pendingDecisions(gay)[0];E.resolve(gay,d,0);assert.ok(gay.queer.out.friends);assert.equal(gay.queer.out.work,undefined,'向朋友公开不自动传给工作单位');
assert.ok(E.requestPrivate(gay,'family'));d=E.pendingDecisions(gay)[0];E.resolve(gay,d,1);assert.equal(gay.queer.out.family,undefined);assert.ok(E.requestPrivate(gay,'family'),'暂不公开后以后仍可选择');gay.queer.pending=null;
gay.job={title:'基层公共服务岗位',kind:'college',sector:'civil'};assert.ok(E.requestPrivate(gay,'work'));d=E.pendingDecisions(gay)[0];E.resolve(gay,d,0);assert.equal(CNQueer.blocked(gay),true);d=E.pendingDecisions(gay)[0];assert.equal(d.id,'workBias');E.resolve(gay,d,0);
gay.age=38;gay.year=gay.born.y+38;gay.done.marriage=true;gay.done.children=true;const promotion=E.pendingDecisions(gay)[0];assert.equal(promotion.id,'career');const income=gay.income;E.resolve(gay,promotion,0);assert.equal(gay.income,income);
const straight=queerLife('admirer');d=E.pendingDecisions(straight)[0];assert.equal(d.id,'sameConfession');E.resolve(straight,d,0);assert.equal(straight.queer.orientation,'straight');assert.equal(E.privateOptions(straight).length,0);
const couple=queerLife();couple.done.queerCrush=true;couple.partner={name:'模拟男友',sex:'M'};d=E.pendingDecisions(couple)[0];assert.equal(d.id,'commitment');E.resolve(couple,d,0);assert.equal(couple.spouse.union,'partnership');assert.ok(!E.pendingDecisions(couple).some(x=>x.id==='children'),'不会自动触发异性婚育');
const child1=make(9001),child2=make(9001);child1.focus='事业';child2.focus='平衡';E.runAuto(child1,5);E.runAuto(child2,5);assert.deepEqual(child1.stats,child2.stats,'小学前不应用生活重心');
const invalid=E.serialize(l);invalid.properties[0].value=NaN;assert.throws(()=>E.hydrate(invalid));
const invalidQ=E.serialize(gay);invalidQ.queer.out.work='invalid';assert.throws(()=>E.hydrate(invalidQ));
console.log(`通过 0.3：购房/出租/卖房/买车/卖车、现金与净资产、12 年租金还款及恢复、迁移、防重复借款、幼儿重心、酷儿分支与自主出柜、虚构职场偏见及同性伴侣。`);
console.log(`10 万种子支线抽样：${enabled} 局（${(enabled/1000).toFixed(3)}%），同性心动 ${own}，直人收到告白 ${admirer}。`);
