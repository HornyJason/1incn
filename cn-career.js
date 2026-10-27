/* 招聘、年度薪酬、离职补偿与备考。统计锚点与法律口径集中在 ECONOMY.md。 */
(function(G){
  const cap=(v,a,b)=>Math.max(a,Math.min(b,v)),money=n=>G.CNEngine.money(n);
  function normalize(l){
    if(l.job){const last=l.jobHist?.at(-1);if(!Number.isInteger(l.job.sinceAge))l.job.sinceAge=last?.age??l.age;if(!Array.isArray(l.job.salaryHistory))l.job.salaryHistory=[Math.max(0,l.income)];}
    l.employment=l.employment||{pending:null,search:null,history:[]};return l.employment;
  }
  const civil=l=>!!l.job&&(l.job.sector==='civil'||/基层公共服务|公务员/.test(l.job.title));
  const educated=l=>/大专|本科|硕士|博士/.test(l.eduDone||l.flags.degree||'');
  const floor=l=>G.CNEconomy.profile(l).minMonthly*12;
  function startSearch(l,delay=0){const e=normalize(l);e.searchCount=(e.searchCount||0)+1;e.search={uid:e.searchCount,since:l.age,availableAge:l.age+delay,kind:l.job?.kind||(/本科|硕士/.test(l.eduDone||l.flags.degree||'')?'college':'skilled'),previousIncome:l.income,round:0};return e.search;}
  function leave(l,delay=0){startSearch(l,delay);l.job=null;l.income=0;l.edu.stage='work';l.edu.label='寻找新的工作';l.flags.flexible=false;}
  function hire(l,offer){l.job={title:offer.title,kind:offer.kind,sector:offer.sector||'private',sinceAge:l.age,salaryHistory:[offer.income]};l.income=Math.max(floor(l),offer.income);l.edu.stage='work';l.edu.label='工作';l.flags.flexible=false;l.flags.livesWithParents=false;l.employment.search=null;l.jobHist.push({age:l.age,title:offer.title,income:l.income});}
  function relocate(l,pref,city){if(l.pref===pref&&l.city===city)return false;if(!l.retired)leave(l);l.pref=pref;l.city=city;l.rural=false;l.flags.livesWithParents=pref===l.birthPref&&city===l.birthCity&&G.CNSociety.parentsAlive(l);l.properties.filter(p=>p.use==='self').forEach(p=>p.use='vacant');l.trail.push({age:l.age,pref,city});G.CNAssets.sync(l);return true;}
  function severance(l){
    const p=G.CNEconomy.profile(l),monthly=Math.max(p.minMonthly,(l.job?.salaryHistory.at(-1)||l.income)/12),lastMonthly=l.income/12;
    const years=Math.max(1,l.age-l.job.sinceAge),high=monthly>3*p.averageMonthly,basis=high?3*p.averageMonthly:monthly,paidYears=high?Math.min(12,years):years;
    // 本事件为协商解除：N + 一个月额外补助；高薪双封顶不套到所有员工或 +1 部分。
    return {years,paidYears,monthly:Math.round(monthly),basis:Math.round(basis),high,cappedN:Math.round(basis*paidYears),extra:Math.round(lastMonthly),due:Math.round(basis*paidYears+lastMonthly)};
  }
  function layoff(l,log){
    const e=normalize(l),job=l.job;if(!job||civil(l)||l.retired||l.flags.flexible)return false;
    const amounts=severance(l),withheld=l.r.chance(educated(l)?.09:.3);
    e.pending={age:l.age,title:job.title,kind:job.kind,previousIncome:l.income,...amounts,withheld};e.history.push({age:l.age,event:'layoff',title:job.title,due:amounts.due,received:0});leave(l,1);l.stats.happy-=6;
    log(l,'work','公司业务收缩，决定裁撤你所在的岗位。你收到了裁员通知，工作收入暂时中断。','bad');return true;
  }
  function year(l,log){
    normalize(l);if(!l.job||l.retired)return;const r=l.r,old=l.income,knowledge=l.stats.know,stable=civil(l),ageRisk=l.age>=35?Math.min(.035,(l.age-34)*.002):0;
    if(!stable&&!l.flags.flexible&&r.chance(.012+ageRisk+(100-knowledge)*.00015)){layoff(l,log);return;}
    const x=r(),down=stable?.07:.17+(100-knowledge)*.0005;let factor=x<down?r.norm(stable?.99:.94,stable?.005:.025):x<down+.24?r.norm(1,.006):r.norm(1.025+knowledge*.00012,.016);
    factor=cap(factor,stable?.97:.85,stable?1.065:1.12);const typical=G.CNEconomy.profile(l).wage,catchup=old<typical*.65&&factor>1?1.008:1;
    l.income=Math.round(Math.max(floor(l),old*factor*catchup));l.job.salaryHistory.push(l.income);if(l.job.salaryHistory.length>12)l.job.salaryHistory.shift();
    if(l.income<old*.98)log(l,'work',`这一年${l.flags.flexible?'订单减少':'公司调整业务和奖金'}，年收入从 ${money(old)} 降至 ${money(l.income)}。`,'bad');
    else if(l.income>old*1.025)log(l,'work',`这一年的工作考核和业务进展带来了薪酬调整，年收入从 ${money(old)} 增至 ${money(l.income)}。`,'good');
  }
  function offers(l){
    const e=normalize(l),s=e.search;if(s.offersAge===l.age&&s.offers)return s.offers;
    const D=G.CN_DATA,r=G.LifeEngine.R((l.seed+Math.imul(l.age+1,9013)+Math.imul(s.round||0,7981))>>>0);r.norm=(m=0,sd=1)=>m+sd*Math.sqrt(-2*Math.log(Math.max(1e-12,r())))*Math.cos(2*Math.PI*r());
    const major=D.majors.find(m=>m.id===l.flags.major),matched=!!major&&educated(l)&&r()<.4,degree=/本科|硕士|博士/.test(l.eduDone||l.flags.degree||''),kind=degree?'college':educated(l)?'skilled':'basic';
    const excluded=new Set(['中小学教师','医务人员',...(major?[major.job[0]]:[])]),pool=[...new Map([...D.jobs[kind],...D.jobs.basic].filter(j=>!excluded.has(j[0])).map(j=>[j[0],j])).values()];const rows=matched?[{job:major.job,kind,matched:true}]:[];
    while(rows.length<3){const job=pool.splice(Math.floor(r()*pool.length),1)[0];rows.push({job,kind:D.jobs.basic.some(j=>j[0]===job[0])?'basic':kind,matched:false});}
    s.offers=rows.map(({job,kind,matched},i)=>({id:i,title:job[0],kind,matched,income:G.CNEconomy.startingPay(l,kind,job[1],r),company:['本地企业','区域公司','社区门店'][i]}));s.offersAge=l.age;s.applied=[];return s.offers;
  }
  function prepareExam(l){const hadJob=!!l.job,e=normalize(l);l.savings-=3000;l.job=null;l.income=0;l.edu.stage='work';l.edu.label='全职备考';l.flags.flexible=false;e.search=null;e.gov={startAge:l.age,resultAge:l.age+1};return `${hadJob?'你办好离职手续，':''}你花了 3,000 元准备资料与课程，开始全职备考。这一年没有工作收入，考试结果明年公布。`;}
  function decisions(l,{dec,opt}){
    const e=normalize(l),p=e.pending;
    const settle=amount=>{l.savings+=amount;if(l.finances?.year===l.year){l.finances.severance=(l.finances.severance||0)+amount;l.finances.balance+=amount;}if(e.history.at(-1))e.history.at(-1).received=amount;e.pending=null;};
    if(p)return [dec(l,'severance_'+p.age,'裁员通知',`公司决定裁撤你所在的岗位，劳动关系将解除。${p.high?`经济补偿按当地职工月均工资三倍封顶，计付年限最多十二年：${money(p.basis)} × ${p.paidYears}；`:`经济补偿：${money(p.monthly)} × 工龄 ${p.years} 年；`}另有一个月协商补助 ${money(p.extra??p.monthly)}，合计 ${money(p.due)}。${p.withheld?'公司却试图拖欠这笔款项。':'请核对通知与结算金额。'}`,p.withheld?[
      opt('整理证据，争取应得补偿','',l=>{const ok=l.r.chance(cap(.5+l.stats.know*.004,.5,.9)),n=ok?p.due:Math.round(p.due*.3);settle(n);return ok?`你保留材料并认真争取，最终拿到了 ${money(n)}。`:`这次争取并不顺利，只拿回 ${money(n)}。你保存好材料，准备重新找工作。`;},3),
      opt('协商一部分补偿，尽快离开','可拿到 50%',l=>{const n=Math.round(p.due*.5);settle(n);return `协商后，${money(n)} 到账。你收拾好工位，和熟悉的同事道了别。`;}),
      opt('先离开','暂时没有补偿到账',l=>{settle(0);return '你先离开了这个环境。这笔款没有到账，之后的生活需要重新安排。';})
    ]:[opt('确认通知，领取补偿','',l=>{settle(p.due);return `补偿 ${money(p.due)} 已到账。你留下一笔缓冲资金，准备明年重新找工作。`;})])];
    if(e.gov){if(l.age<e.gov.resultAge)return null;return [dec(l,'civilResult_'+e.gov.startAge,'考试结果公布了','笔试与面试都已结束，你打开了最终结果。',[
      opt('查看结果','',l=>{const pass=l.r.chance(cap(.06+l.stats.know*.004,.06,.32));e.gov=null;if(pass){hire(l,{title:'基层公共服务岗位',kind:'college',sector:'civil',income:G.CNEconomy.startingPay(l,'college',1.22)});return `你通过了笔试、面试和后续考察，收到录用通知，年收入约 ${money(l.income)}。`;}startSearch(l);return '这次没有进入录用名单。你收好复习资料，重新开始留意招聘信息。';})])];}
    const studying=['univ','college','grad'].includes(l.edu.stage)&&l.age<(l.flags.gradAge||99),admission=l.edu.admission&&l.edu.admission.phase!=='done';
    if(!l.job&&!l.retired&&l.age>=18&&!studying&&!admission&&!e.search&&l.age>=(l.flags.gradAge||99)){
      if(l.age>=(l.flags.gradAge||22)&&l.edu.stage==='univ'&&!l.done.postgrad)return null;l.eduDone=l.flags.degree||l.eduDone||'高中';l.done.jobEntry=true;startSearch(l);
    }
    const s=e.search;if(!s||l.job&&!s.onJob||l.retired||l.age<(s.availableAge??s.since)||e.gov)return null;
    const jobs=offers(l).filter(o=>!s.applied.includes(o.id)),id=`jobSearch_${l.age}_${s.uid||0}_${s.round||0}_${s.applied.length}`;if(l.done[id])return null;
    const options=jobs.map(o=>opt(`应聘 ${o.title}`,`${o.company} · ${l.city} · 月薪 ${money(o.income/12)}${o.matched?' · 专业相关':''}`,l=>{s.applied.push(o.id);if(l.r.chance(cap(.48+l.stats.know*.003-(l.age>=35?.1:0),.3,.83))){hire(l,o);return `面试后，你收到了${o.title}的录用通知。约定月薪 ${money(o.income/12)}，年收入 ${money(l.income)}。`;}return `应聘${o.title}的面试没有通过。你继续看看其它岗位。`;},3));
    if((s.round||0)<2)options.push(opt('再看看其它招聘信息','刷新一组岗位，每年最多三组',l=>{s.round=(s.round||0)+1;delete s.offers;return '你修改了简历，又找到几条新的招聘信息。';}));
    if(l.age<=35&&educated(l))options.push(opt('全职准备考公','花费 3,000 元；停止工作，明年公布结果',l=>prepareExam(l)));
    if(!l.done['jobMove_'+l.age])options.push(opt('换去大城市，重新找工作','搬迁安置费 3,000 元；到当地后继续应聘',l=>{l.done['jobMove_'+l.age]=true;const choices=[['北京市','北京'],['上海市','上海'],['广东省','深圳']].filter(p=>p[1]!==l.city),p=l.r.pick(choices);l.savings-=3000;relocate(l,...p);return `你拖着行李来到${p[1]}，先找到住处。工作还没有着落，需要在这里重新应聘。`;}));
    options.push(opt('先休整，明年再找',l.job?'保留目前的工作':'保留简历，暂不入职',l=>{s.availableAge=l.age+1;return '你先停下这一轮投递，给自己一点休整时间。明年再继续找合适的岗位。';},2));
    return [dec(l,id,'看看正在招聘的岗位','你逐一比较工作内容、城市和工资。投递之后，还需要通过面试。',options)];
  }
  function requestSearch(l){
    const e=normalize(l);if(!l.alive||l.age<18||l.retired||e.gov||l.edu.admission&&l.edu.admission.phase!=='done'||['univ','college','grad'].includes(l.edu.stage)&&l.age<(l.flags.gradAge||99))return {ok:false,message:'现在暂不适合开始求职。'};
    if(e.pending||e.search&&l.age<(e.search.availableAge??l.age))return {ok:false,message:'这一轮工作安排已结束，明年继续。'};
    if(l.flags.jobRequestAge===l.age)return {ok:false,message:'今年已经整理过求职安排，明年再试。'};l.flags.jobRequestAge=l.age;if(l.job){startSearch(l);e.search.onJob=true;}else startSearch(l);return {ok:true,message:'已开始整理招聘信息，继续人生时可以应聘。'};
  }
  G.CNCareer={normalize,civil,educated,year,layoff,decisions,severance,offers,startSearch,leave,hire,relocate,prepareExam,requestSearch,floor};
})(typeof window!=='undefined'?window:globalThis);
