/* 薪酬波动、裁员与再就业：虚构经济模型，N+1 按玩家指定的游戏规则计算。 */
(function(G){
  const cap=(v,a,b)=>Math.max(a,Math.min(b,v));
  function normalize(l){
    if(l.job){const last=l.jobHist?.at(-1);if(!Number.isInteger(l.job.sinceAge))l.job.sinceAge=last?.age??l.age;if(!Array.isArray(l.job.salaryHistory))l.job.salaryHistory=[Math.max(0,l.income)];}
    l.employment=l.employment||{pending:null,search:null,history:[]};return l.employment;
  }
  const civil=l=>l.job&&(l.job.sector==='civil'||/基层公共服务|公务员/.test(l.job.title));
  const educated=l=>/大专|本科|硕士|博士/.test(l.eduDone||l.flags.degree||'');
  function layoff(l,log){
    const e=normalize(l),job=l.job;if(!job||civil(l)||l.retired||l.flags.flexible)return false;
    const history=job.salaryHistory.slice(-1),monthly=Math.round(history.reduce((a,b)=>a+b,0)/Math.max(1,history.length)/12);
    const years=Math.max(1,l.age-job.sinceAge),due=Math.round(monthly*(years+1));
    const withheld=l.r.chance(educated(l)?.1:.42);
    e.pending={age:l.age,title:job.title,kind:job.kind,previousIncome:l.income,years,monthly,due,withheld};
    e.search={since:l.age,kind:job.kind,previousIncome:l.income};
    e.history.push({age:l.age,event:'layoff',title:job.title,due,received:0});
    l.job=null;l.income=0;l.edu.label='寻找新的工作';l.flags.livesWithParents=false;l.stats.happy-=7;
    log(l,'work',`企业缩减岗位，你收到了裁员通知。你在这家公司工作了约 ${years} 年，按本局 N+1 规则，待结算赔偿约 ${G.CNEngine.money(due)}。`,'bad','N+1、赔偿拖欠和再就业均为游戏情节，不用于判断真实劳动关系。');return true;
  }
  function year(l,log){
    normalize(l);if(!l.job||l.retired)return;
    const r=l.r,old=l.income,knowledge=l.stats.know,stable=civil(l);
    // 企业可能重组；知识低时抗风险与议价能力更弱，但并非必然被裁。
    if(!stable&&!l.flags.flexible&&r.chance(.025+(100-knowledge)*.00055)){layoff(l,log);return;}
    const shock=r(),down=stable?.1:.2+(100-knowledge)*.0023;
    let factor;
    if(shock<down)factor=stable?r.norm(.98,.015):r.norm(.88,.07+(100-knowledge)*.0005);
    else if(shock<down+.18)factor=r.norm(1,.018);
    else factor=r.norm(1.025+knowledge*.00045,.045);
    factor=cap(factor,stable?.94:.58,stable?1.09:1.27);
    if(l.focus==='事业'&&factor>1)factor+=.012;
    l.income=Math.round(Math.max(6000,old*factor));
    l.job.salaryHistory.push(l.income);if(l.job.salaryHistory.length>12)l.job.salaryHistory.shift();
    if(factor<.94)log(l,'work',`这一年${l.flags.flexible?'订单减少':'公司调整了业务和奖金'}，你的年收入从 ${G.CNEngine.money(old)} 降至约 ${G.CNEngine.money(l.income)}。`,'bad');
    else if(factor>1.09)log(l,'work',`工作经验和新的机会带来了回报，你的年收入增加到约 ${G.CNEngine.money(l.income)}。`,'good');
  }
  function decisions(l,{dec,opt,getJob}){
    const e=normalize(l),p=e.pending;
    const settle=(amount)=>{
      l.savings+=amount;if(l.finances?.year===l.year){l.finances.severance=(l.finances.severance||0)+amount;l.finances.balance+=amount;}
      if(e.history.at(-1))e.history.at(-1).received=amount;e.pending=null;return amount;
    };
    if(p)return [dec(l,'severance_'+p.age,'离职结算单',p.withheld?`公司试图拖欠赔偿。按本局 N+1 规则应结算 ${G.CNEngine.money(p.due)}，你可以争取、协商或暂时把精力放在求职上。`:`公司给出了 N+1 结算：月收入约 ${G.CNEngine.money(p.monthly)} ×（工龄 ${p.years} + 1）。`,p.withheld?[
      opt('整理证据，争取应得赔偿','成功概率受知识与随机因素影响',l=>{const ok=l.r.chance(cap(.42+l.stats.know*.005,.42,.9));const received=settle(ok?p.due:Math.round(p.due*.3));l.stats.know+=3;return ok?`你保留了材料并认真争取，最终拿到了 ${G.CNEngine.money(received)} 赔偿。`:`这次争取并不顺利，最终只拿回 ${G.CNEngine.money(received)}。你留下记录，继续寻找新的工作。`;},3),
      opt('协商一部分赔偿，尽快离开','收到应结算金额的 50%',l=>{const n=settle(Math.round(p.due*.5));return `你协商后拿到了 ${G.CNEngine.money(n)}，开始把时间留给求职。`;}),
      opt('先离开，把精力放在求职上','本次赔偿未到账',l=>{settle(0);return '你决定先离开这个环境。这笔被拖欠的赔偿没有到账，接下来的生活需要重新安排。';})
    ]:[opt('确认结算，领取赔偿','赔偿单独计入本年账本',l=>{settle(p.due);return `离职赔偿 ${G.CNEngine.money(p.due)} 到账。你留下一笔缓冲资金，准备寻找下一份工作。`;})])];
    if(e.search&&!l.job&&!l.retired&&l.age>=18&&!l.done['jobSearch_'+l.age])return [dec(l,'jobSearch_'+l.age,'重新找一份工作','裁员或迁居让工作告一段落。你可以尝试相近岗位，也可以给自己一点调整的时间。',[
      opt('投递相近岗位，争取重新开始','录用与薪酬存在不确定性',l=>{if(l.r.chance(cap(.42+l.stats.know*.004,.42,.86))){const old=e.search;getJob(l,old.kind||'skilled');l.income=Math.round(Math.max(12000,old.previousIncome*l.r.norm(.92,.15)));l.job.salaryHistory=[l.income];e.search=null;return `你找到了一份${l.job.title}的工作，年收入约 ${G.CNEngine.money(l.income)}。重新开始也可能需要接受收入变化。`;}return '这一轮面试没有得到合适的结果。你继续整理简历、联系机会，积蓄暂时支撑着生活。';},3),
      opt('暂时休整，下一年继续找','本年没有工作收入',l=>{l.stats.health+=3;l.stats.happy+=2;return '你先调整了一阵子，也重新想清楚希望去怎样的工作环境。';})
    ])];
    return null;
  }
  G.CNCareer={normalize,civil,educated,year,layoff,decisions};
})(typeof window!=='undefined'?window:globalThis);
