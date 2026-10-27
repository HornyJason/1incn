/* 身边的人与家庭后事。名字、关系与生死随存档保留。 */
(function(G){
  const draw=(l,salt)=>G.CNQueer.draw(l.seed,salt),full=(l,sex,salt)=>{const D=G.CN_DATA;return D.surnames[Math.floor(draw(l,salt)*D.surnames.length)]+D.given[sex][Math.floor(draw(l,salt+1)*D.given[sex].length)];};
  function normalize(l){
    if(!l.friends?.length)l.friends=[['desk','小学同桌',0],['school','老同学',1],['friend','朋友',2]].map(([id,role,i])=>{const sex=draw(l,731+i)<.5?'M':'F';return {id,role,sex,name:full(l,sex,741+i*3),ageDiff:i===2?1:0,alive:true,lastContactAge:-1};});
    for(const p of [l.fam.father,l.fam.mother])if(p.health==null)p.health=75;
    for(const p of l.fam.siblings){if(p.alive==null)p.alive=true;if(p.atHome==null)p.atHome=l.age+p.age<30;}
    if(!l.fam.estate)l.fam.estate={cash:Math.round(l.fam.parentHH*(.6+draw(l,821))),homeValue:l.fam.home.includes('租')?0:Math.round(G.CNEconomy.profile({...l,pref:l.birthPref,city:l.birthCity,rural:l.origin.settlement!=='城区'}).homePrice*.8),cashSettled:false,homeSettled:false};
    if(l.partner&&!Number.isInteger(l.partner.sinceAge))l.partner.sinceAge=Math.max(0,l.age-1);
    if(l.spouse&&!Number.isInteger(l.spouse.marriedAge))l.spouse.marriedAge=Math.max(0,l.age-2);
    l.fam.funeral=l.fam.funeral||[];return l;
  }
  function friend(l,id='desk'){normalize(l);return l.friends.find(p=>p.id===id)||l.friends[0];}
  const parentsAlive=l=>l.fam.father.alive||l.fam.mother.alive;
  const hasFamily=l=>parentsAlive(l)||l.spouse&&l.spouse.alive!==false||l.partner&&l.partner.alive!==false||l.kids.some(k=>k.alive!==false||k.grandchild)||l.fam.siblings.some(k=>k.alive!==false);
  function companion(l){if(hasFamily(l))return '家人';return l.friends.some(p=>p.alive)?'朋友':'邻居';}
  function book(l,amount){l.savings+=amount;if(l.finances?.year===l.year){l.finances.inheritance=(l.finances.inheritance||0)+amount;l.finances.balance+=amount;}}
  function estate(l,log){
    if(parentsAlive(l))return;const e=l.fam.estate,heirs=1+l.fam.siblings.filter(p=>p.alive).length;
    if(!e.cashSettled){const share=Math.round(e.cash/heirs);e.cashSettled=true;book(l,share);log(l,'family',`父母留下的存款按家人商定的份额分配，你继承了 ${G.CNEngine.money(share)}。`);}
    const occupied=l.flags.livesWithParents||l.fam.siblings.some(p=>p.alive&&p.atHome);
    if(!e.homeSettled&&e.homeValue>0&&!occupied){const share=Math.round(e.homeValue*.98/heirs);e.homeSettled=true;book(l,share);log(l,'family',`老家的房子已经无人居住。家人商量后卖掉房子，扣除费用，你分得 ${G.CNEngine.money(share)}。`);}
    else if(!e.homeSettled&&e.homeValue>0&&!e.occupiedNotified){e.occupiedNotified=true;log(l,'family',`老家的房子还有${l.flags.livesWithParents?'你':'家人'}居住，暂时保留，没有出售。`);}
  }
  function onParentDeath(l,key,log){l.flags.familyCrisisAge=l.age;const p=l.fam[key];l.fam.funeral.push({key,age:l.age,name:p.name});log(l,'family',`${key==='father'?'父亲':'母亲'}${p.name}去世了，享年 ${p.deathAge} 岁。亲人联系你商量后事。`,'bad');}
  function meet(l,source='朋友聚会'){
    normalize(l);if(l.flags.familyCrisisAge===l.age||l.flags.familyMilestoneAge===l.age||l.partner||l.spouse||l.romance?.candidate)return false;
    const old=l.friends.find(p=>p.alive&&p.sex===l.sex);
    const confession=old&&l.r.chance(.05),sex=confession?l.sex:G.CNQueer.partnerSex(l);
    l.romance=l.romance||{};l.romance.proposal=false;l.romance.candidate={name:confession?old.name:full(l,sex,1001+l.age*7+(l.romance.count||0)),sex,ageDiff:0,alive:true,source,confession:!!confession};l.romance.count=(l.romance.count||0)+1;return true;
  }
  function year(l,log){
    normalize(l);const r=l.r;
    if(parentsAlive(l))l.fam.estate.cash+=Math.round(l.fam.parentHH*.07);
    for(const s of l.fam.siblings){if(s.alive&&r.chance(G.CNEngine.qx(s.sex,l.age+s.age))){s.alive=false;s.deathAge=l.age+s.age;log(l,'family',`${s.sei||l.name.sei}${s.name}去世的消息传来，你想起了小时候一起生活的日子。`,'bad');}if(s.alive&&s.atHome&&l.age+s.age>=22&&r.chance(.08)){s.atHome=false;log(l,'family',`${s.sei||l.name.sei}${s.name}搬出了老家的房子，开始独立生活。`);}}
    for(const f of l.friends){if(l.age<6)continue;const age=l.age+f.ageDiff;if(f.alive&&r.chance(G.CNEngine.qx(f.sex,age))){f.alive=false;f.deathAge=age;log(l,'story',`你收到消息，${f.role}${f.name}去世了，享年 ${age} 岁。你翻出旧照片，想起你们相识的日子。`,'bad');}else if(f.alive&&l.age>=20&&r.chance(.025)){f.lastContactAge=l.age;log(l,'story',`${f.role}${f.name}发来消息，问你最近过得怎样。你们聊起近况，也聊起从前。`);}}
    for(const p of [l.partner,l.spouse])if(p&&p.alive!==false&&r.chance(G.CNEngine.qx(p.sex,l.age+(p.ageDiff||0)))){l.flags.familyCrisisAge=l.age;p.alive=false;p.deathAge=l.age+(p.ageDiff||0);log(l,'family',`${p.name}离开了人世。那些一起过的日子，成了你舍不得翻完的回忆。`,'bad');if(p===l.partner)l.partner=null;else l.spouse=null;}
    for(const k of l.kids)if(k.alive!==false&&r.chance(G.CNEngine.qx(k.sex,l.age-k.birthAge))){l.flags.familyCrisisAge=l.age;k.alive=false;log(l,'family',`孩子${k.name}去世的消息传来，你久久没有说话。`,'bad');}
    if(l.spouse&&l.age-l.spouse.marriedAge>=2&&l.flags.familyCrisisAge!==l.age&&l.flags.familyMilestoneAge!==l.age&&r.chance(.008)){const name=l.spouse.name;l.spouse=null;l.flags.familyCrisisAge=l.age;delete l.done.marriage;delete l.done.commitment;l.stats.happy-=7;log(l,'family',`你和${name}经历了很长一段争执与沉默，最终决定分开生活。手续办完后，你开始重新整理日常。`,'bad');}
    if(l.partner&&l.flags.familyCrisisAge!==l.age&&l.age-(l.partner.sinceAge??l.age)>=1&&r.chance(.035)){const name=l.partner.name;l.partner=null;l.flags.familyCrisisAge=l.age;l.stats.happy-=5;log(l,'family',`${name}约你认真谈了一次，提出结束交往。你们向彼此道别，生活还要慢慢继续。`,'bad');}
    else if(l.partner&&l.flags.familyCrisisAge!==l.age&&l.age-(l.partner.sinceAge??l.age)>=2&&r.chance(.12)){l.romance=l.romance||{};l.romance.proposal=true;}
    if(l.age>=18&&l.flags.familyCrisisAge!==l.age&&!l.partner&&!l.spouse&&!l.romance?.candidate&&r.chance(.02)){if(meet(l,'日常相识'))log(l,'story',`${l.romance.candidate.name}说，想找个时间和你单独见面。`);}
    estate(l,log);
  }
  function decisions(l,{dec,opt}){
    normalize(l);const f=l.fam.funeral[0];
    if(f&&l.age<18)return [dec(l,'funeral_'+f.key+'_'+f.age,'家人陪你告别',`亲人陪在你身边，告诉你${f.key==='father'?'爸爸':'妈妈'}不会再回来了。家里的大人已经在安排后事。`,[opt('和亲人一起送别','费用由家庭承担',l=>{l.fam.funeral.shift();l.fam.estate.cash=Math.max(0,l.fam.estate.cash-10000);return '亲人牵着你的手，陪你走完了这段难懂的告别。你把熟悉的声音和样子，慢慢留在了记忆里。';})])];
    if(f)return [dec(l,'funeral_'+f.key+'_'+f.age,'家里的告别',`电话那头停了很久，才低声说：“${f.key==='father'?'你爸':'你妈'}今天走了。家里人都在……你要回来吗？路上别着急。”`,[
      opt('赶回家，陪家人一起处理后事','往返与后事支出 12,000 元',l=>{l.savings-=12000;l.fam.funeral.shift();l.stats.social+=2;return '你赶回家，和亲人一起送完了这最后一程。那些没来得及说的话，你在心里又说了一遍。';},3),
      opt('委托亲人协助，远程安排后事','后事支出 10,000 元',l=>{l.savings-=10000;l.fam.funeral.shift();return '你和亲人一遍遍通电话，安排好后事。夜深时，你独自翻了很久的旧相册。';})])];
    const c=l.romance?.candidate;
    if(c){const can=c.sex===G.CNQueer.partnerSex(l);return [dec(l,'relationship_'+l.age+'_'+l.romance.count,c.confession?'旧相识说出了心事':'愿意和这个人更进一步吗？',c.confession?`${c.name}告诉你自己喜欢同性，也坦诚了对你的感情。`:`你和${c.name}慢慢熟悉起来，对方向你表达了好感。`,[
      ...(can?[opt('试着认真交往','彼此了解，慢慢相处',l=>{l.partner={...c,sinceAge:l.age};l.flags.familyMilestoneAge=l.age;l.romance.candidate=null;l.stats.happy+=4;return `你答应和${c.name}交往。你们约好，有不舒服的事要坦诚地说。`;},2)]:[]),
      opt(can?'先做朋友，不开始交往':'谢谢信任，坦诚说明没有同样的感情','尊重彼此的感受',l=>{l.romance.candidate=null;return `你认真回应了${c.name}，说明自己的感受，没有勉强开始一段关系。`;},2)])];}
    if(l.partner&&l.age-l.partner.sinceAge>=2&&l.flags.familyCrisisAge!==l.age&&l.flags.familyMilestoneAge!==l.age&&l.romance?.proposal)return [dec(l,'proposal_'+l.age,`${l.partner.name}想和你谈谈未来`,'对方认真地问，愿不愿意把今后的生活放在一起。',[
      opt(l.partner.sex===l.sex?'作出长期相伴的承诺':'答应，一起准备结婚','商量住处与共同生活',l=>{l.spouse={...l.partner,marriedAge:l.age,...(l.partner.sex===l.sex?{union:'partnership'}:{})};l.flags.familyMilestoneAge=l.age;l.partner=null;l.romance.proposal=false;l.done.marriage=true;l.done.commitment=true;return `你和${l.spouse.name}决定一起走下去，开始商量两个人的日常。`;}),
      opt('还需要一点时间','继续交往',l=>{l.romance.proposal=false;return '你说出了自己的顾虑。对方听完以后，你们决定再相处一段时间。';},2)])];
    return null;
  }
  G.CNSociety={normalize,friend,companion,hasFamily,parentsAlive,onParentDeath,meet,year,estate,decisions};
})(typeof window!=='undefined'?window:globalThis);
