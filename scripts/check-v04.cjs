const assert=require('node:assert/strict');
for(const f of ['data','engine','cn-data','cn-assets','cn-queer','cn-local','cn-engine','cn-interactions'])require('../'+f+'.js');
const E=CNEngine,make=seed=>E.createLife({seed,date:'2026-10-27T12:00:00+08:00'});
for(const [age,id] of [[12,'schoolLetter'],[19,'homeLetter']]){
  const l=make(13);l.age=age;l.year=l.born.y+age;
  // 排除其它节点，单独检查来信的执行与存档恢复。
  l.done={schoolLife:true,interest:true,further:true,major:true,jobEntry:true};
  l.queer={enabled:false,type:'admirer',orientation:'straight',out:{},pending:null};
  const d=E.pendingDecisions(l)[0];assert.equal(d.id,id);
  const before=E.serialize(l),p=CNInteractions.describe(l,d);
  assert.equal(p.kind,'letter');assert.ok(p.msgs.length>=4);
  assert.deepEqual(E.serialize(l),before,'阅读展示不消耗随机数、不修改人生');
  E.resolve(l,d,0);const after=E.serialize(l);
  E.resolve(l,d,0);assert.deepEqual(E.serialize(l),after,'重复选择不重复增加属性或记录');
  l.choices.at(-1).presentation={...p,result:[{t:l.log.at(-1).t}]};
  const restored=E.hydrate(E.serialize(l));
  assert.deepEqual(restored.choices.at(-1).presentation,l.choices.at(-1).presentation,'原始来信随存档保存');
  assert.ok(!E.pendingDecisions(restored).some(d=>d.id===id),'恢复后不重复收取来信');
  const bad=E.serialize(l);bad.choices.at(-1).presentation.msgs={bad:'invalid'};
  assert.throws(()=>E.hydrate(bad),/存档格式/,'导入时拒绝损坏的来信字段');
}
const l=make(27),d={title:'<重要决定>',text:'<原文>',options:[{i:0,label:'<选项>',hint:'提示'}]};
for(const [id,kind] of Object.entries({interest:'line',schoolLife:'notice',zhongkao:'exam',further:'exam',major:'notice',postgrad:'exam',jobEntry:'mail',social:'line',festival:'call',care:'call',marriage:'sign',housing:'sign',career:'sign',retirement:'sign',commitment:'letter',later:'letter',queerCrush:'letter',sameConfession:'line',out_family:'line'})){
  const p=CNInteractions.describe(l,{...d,id});assert.equal(p.kind,kind);assert.equal(p.options[0].label,'<选项>');
}
assert.equal(CNInteractions.esc('<img src=x onerror="bad">'),'&lt;img src=x onerror=&quot;bad&quot;&gt;');
console.log('通过 0.4：两封来信的自然节点、只执行一次、存档恢复、展示不消耗随机数、19 种决策映射与内容转义。');
