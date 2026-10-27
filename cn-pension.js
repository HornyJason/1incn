/* 养老金按固定购买力累计；结构参考基本养老保险与职业年金，简化口径见 ECONOMY.md。 */
(function(G){
  const cap=(n,a,b)=>Math.max(a,Math.min(b,n));
  const civil=l=>G.CNCareer.civil(l);
  const reference=l=>Math.round(G.CNEconomy.profile(l).wage/12);
  function normalize(l){
    if(l.pension)return l.pension;
    const years=Math.max(0,Math.min(80,l.careerYears||0)),ref=reference(l),avg=years?l.careerIncome/years/12:0,base=cap(avg,ref*.6,ref*3);
    // 老存档只保存累计职业收入，按已有记录补齐近似账户；新人生逐年记录。
    const isCivil=civil(l)||/基层公共服务|公务员/.test(l.jobHist.at(-1)?.title||'');
    l.pension={years,indexTotal:years*base/ref,personal:Math.round(base*12*.08*years),annuity:Math.round(isCivil?base*12*.12*years:0),civilYears:isCivil?years:0,lastYear:years?l.year:null,calculated:false,monthly:0};
    return l.pension;
  }
  function record(l){
    const p=normalize(l);if(!l.job||l.retired||p.lastYear===l.year)return false;
    const ref=reference(l),base=cap(G.CNEconomy.earned(l)/12,ref*.6,ref*3);
    p.years++;p.indexTotal+=base/ref;p.personal+=Math.round(base*12*.08);
    if(civil(l)){p.annuity+=Math.round(base*12*.12);p.civilYears++;}
    p.lastYear=l.year;return true;
  }
  function quote(l){
    const p=normalize(l);if(p.calculated)return {monthly:p.monthly,...p.breakdown};
    const ref=reference(l),divisor=l.age>=65?101:139,index=p.years?p.indexTotal/p.years:0;
    const basic=p.years>=20?Math.round(ref*(1+index)/2*p.years*.01):163;
    const personal=Math.round(p.personal/divisor),annuity=Math.round(p.annuity/divisor);
    return {monthly:basic+personal+annuity,basic,personal,annuity,years:p.years,resident:p.years<20,divisor};
  }
  function retire(l){
    const p=normalize(l),q=quote(l);p.monthly=q.monthly;p.breakdown={...q};delete p.breakdown.monthly;p.calculated=true;
    l.retired=true;l.job=null;l.income=q.monthly*12;l.flags.pensionCalculated=true;
    return q;
  }
  G.CNPension={normalize,record,quote,retire};
})(typeof window!=='undefined'?window:globalThis);
