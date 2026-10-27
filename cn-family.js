/* 领养、红包与隔代照护。只管理本局家庭，不联系任何真实机构。 */
(function(G){
  const money=n=>G.CNEngine.money(n),draw=(l,n)=>G.CNQueer.draw(l.seed,n);
  function normalize(l){
    l.kinship=l.kinship||{gifts:[],pendingGifts:[],adoption:null,care:null};
    l.kids.forEach((k,i)=>{k.id=k.id||`child-${k.birthAge}-${i}`;});return l.kinship;
  }
  function amounts(l){const p=G.CNEconomy.profile(l);return p.tier==='大城市'?[600,3000,10000]:p.tier==='区域中心城市'?[400,2000,8000]:p.tier==='县镇'?[200,600,4000]:[200,1000,6000];}
  function recipients(l){normalize(l);return [...l.kids.filter(k=>k.alive!==false).map(k=>({id:k.id,name:k.name})),...l.fam.siblings.filter(s=>s.alive!==false).map((s,i)=>({id:'sibling-'+i,name:(s.sei||l.name.sei)+s.name})),...l.friends.filter(f=>f.alive).map(f=>({id:'friend-'+f.id,name:f.name})),...['father','mother'].filter(k=>l.fam[k].alive).map(k=>({id:k,name:(l.fam[k].sei||'')+l.fam[k].name}))];}
  function gift(l,to,amount,occasion='日常心意'){
    const s=normalize(l);if(!Number.isInteger(amount)||!amounts(l).includes(amount)||l.savings<amount)return false;
    l.savings-=amount;l.stats.social+=.5;s.gifts.push({age:l.age,to:to.id,name:to.name,amount,occasion});
    if(l.finances?.year===l.year){l.finances.gifts=(l.finances.gifts||0)+amount;l.finances.other=(l.finances.other||0)+amount;l.finances.expense+=amount;l.finances.balance-=amount;}return true;
  }
  function request(l,action,args,log){
    const s=normalize(l),fail=message=>({ok:false,message});if(!l.alive||l.age<18)return fail('成年后再安排这些家庭心意。');
    if(action==='gift'){
      const to=recipients(l).find(p=>p.id===args.id);if(!to)return fail('暂时没有这个收红包的人。');
      if(s.gifts.some(g=>g.age===l.age&&g.to===to.id&&g.occasion==='日常心意'))return fail('今年已经给对方包过这份红包了。');
      if(!gift(l,to,args.amount))return fail('请按当前预算选择红包金额。');
      log(l,'family',`你给${to.name}包了 ${money(args.amount)} 红包，送上一份日常的心意。`,'good');return {ok:true,message:'红包已经送出。'};
    }
    if(action==='adopt'){
      if(l.age<30||l.age>55)return fail('领养安排在 30 至 55 岁开放。');
      if(s.adoption||l.flags.adoptionYear===l.age||l.kids.filter(k=>k.alive!==false).length>=3)return fail('目前已有申请或照料安排，先把眼前的生活安顿好。');
      if(l.savings<2000)return fail('先留出 2,000 元材料与出行预算。');
      const sex=l.r.chance(.5)?'M':'F';s.adoption={age:l.age,resultAge:l.age+1,childAge:l.r.int(1,5),sex,name:l.name.sei+l.r.pick(G.CN_DATA.given[sex])};l.flags.adoptionYear=l.age;l.savings-=2000;
      if(l.finances?.year===l.year){l.finances.other=(l.finances.other||0)+2000;l.finances.expense+=2000;l.finances.balance-=2000;}
      log(l,'family','你开始办理领养申请，安排材料、出行和家庭探访，预留了 2,000 元。审核的消息要等到明年。');return {ok:true,message:'领养申请已记下，明年等候消息。'};
    }
    return fail('未知的家庭安排。');
  }
  function enqueue(l,id,name,kind,text){const s=normalize(l);if(l.done['gift_'+id]||s.pendingGifts.some(p=>p.id===id))return;s.pendingGifts.push({id,name,kind,text});}
  function year(l,log){
    const s=normalize(l),r=l.r;
    for(const [i,k] of l.kids.entries()){
      if(k.alive===false)continue;const age=l.age-k.birthAge;
      if(age===18&&!k.collegeChecked){k.collegeChecked=true;if(r.chance(.65)){k.education='大学在读';enqueue(l,'college_'+k.id,k.name,'孩子升学',`${k.name}收到了大学录取通知书，准备收拾行李去报到。`);log(l,'family',`${k.name}考上了大学。你们开始商量开学前的准备。`,'good');}}
      if(age>=22&&!k.city){const p=r.chance(.6)?G.CN_DATA.provinces.find(p=>p.name===l.birthPref):r.pick(G.CN_DATA.provinces);k.pref=p.name;k.city=r.pick(p.cities);}
      if(age>=24&&age<=45&&!k.grandchild&&r.chance(.06)){const sex=r.chance(.5)?'M':'F';k.grandchild={name:l.name.sei+r.pick(G.CN_DATA.given[sex]),sex,birthAge:l.age};log(l,'family',`${k.name}家迎来了孩子${k.grandchild.name}，你成了祖辈。`,'good');}
      if(l.retired&&k.grandchild&&l.age-k.grandchild.birthAge<=6&&!k.careChecked){k.careChecked=true;if(draw(l,0x51a6bf+k.birthAge*97+i*31)<.5&&!s.care&&!l.flags.livingWithChild)s.care={childId:k.id,name:k.name,pref:k.pref||l.pref,city:k.city||l.city,grandchild:k.grandchild.name};}
    }
    for(const [i,b] of l.fam.siblings.entries()){const age=l.age+b.age;if(b.alive!==false&&!b.married&&age>=22&&age<=45&&r.chance(.08)){b.married=true;const name=(b.sei||l.name.sei)+b.name;enqueue(l,'sibling_'+i,name,'兄弟姐妹婚礼',`${name}要结婚了，邀请你去喝喜酒。`);}}
    if(l.age>=23&&l.age<=45&&!l.flags.friendWeddingGift&&r.chance(.08)){const f=l.friends.find(f=>f.alive);if(f){l.flags.friendWeddingGift=true;f.married=true;enqueue(l,'friend_once',f.name,'朋友婚礼',`朋友${f.name}发来喜讯，邀请你参加婚礼。`);}}
  }
  function decisions(l,{dec,opt,log}){
    const s=normalize(l),a=s.adoption;
    if(a&&l.age>=a.resultAge)return [dec(l,'adoption_'+a.age,'领养申请有了消息','审核与家庭探访已经结束，你打开了收到的通知。',[
      opt('查看结果','',l=>{s.adoption=null;if(!l.r.chance(l.stats.health>=50?.8:.45))return '这次申请暂时没有通过。你收好材料，准备把照料安排和生活条件再梳理一遍。';const age=a.childAge+1;l.kids.push({id:'adopted-'+a.age,name:a.name,sex:a.sex,birthAge:l.age-age,alive:true,adopted:true,joinedAge:l.age});l.stats.happy+=5;return `你迎来了 ${age} 岁的${a.name}。这是你们第一次一起回家，今后的日子要慢慢相互熟悉。`;})])];
    const c=s.care;
    if(c)return [dec(l,'grandcare_'+c.childId+'_'+l.age,`${c.name}想请你帮忙带孩子`,`${c.name}来问，能不能搬到${c.city}家里，帮忙照顾${c.grandchild}。这需要认真商量你的身体、时间和两个人的生活。`,[
      opt(l.spouse?'和伴侣商量好，一起搬过去':'答应，搬过去帮忙照顾','搬到儿女家同住',l=>{const together=!!l.spouse;G.CNCareer.relocate(l,c.pref,c.city);l.properties.filter(p=>p.use==='self').forEach(p=>p.use='vacant');G.CNAssets.sync(l);l.flags.livesWithParents=false;l.flags.livingWithChild={id:c.childId,name:c.name,pref:c.pref,city:c.city};if(l.spouse){l.spouse.pref=c.pref;l.spouse.city=c.city;}s.care=null;return `你${together?'和伴侣一起':''}搬到了${c.city}的${c.name}家，开始帮忙照顾${c.grandchild}。原来的住处先保留下来，新的日常慢慢展开。`;}),
      opt('暂时不搬，按自己的节奏探望','保留目前的住处',l=>{s.care=null;return '你说明了自己的身体和生活安排，决定暂时不搬家。你们约好，有空时再去探望。';},2)])];
    const p=s.pendingGifts[0];
    if(p){const options=amounts(l).filter(n=>n<=l.savings).map((n,i)=>opt(`包 ${money(n)} 红包`,'量力而行，送上祝福',l=>{s.pendingGifts.shift();const ok=gift(l,{id:p.id,name:p.name},n,p.kind);return ok?`你给${p.name}包了 ${money(n)} 红包，认真送上这份祝福。`:'你重新看了看预算，决定先送上祝福。';},i===0?3:1));options.push(opt('先送上祝福，暂时不包红包','保留日常生活的预算',l=>{s.pendingGifts.shift();return `你向${p.name}送上祝福，说明这次先不包红包。心意也留在了认真说出口的话里。`;}));return [dec(l,'gift_'+p.id,p.kind+' · 包一份心意',p.text,options)];}
    return null;
  }
  G.CNFamily={normalize,amounts,recipients,request,year,decisions};
})(typeof window!=='undefined'?window:globalThis);
