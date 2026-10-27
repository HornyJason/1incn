/* 存款安排的虚构收益参数；与现实产品无关。 */
(function(G){
  const products=[{id:'deposit',name:'定期储蓄',detail:'每年利息 1.5%，可提前取回'},{id:'balanced',name:'稳健组合',detail:'小幅波动，也可能亏损'},{id:'equity',name:'股票基金',detail:'波动较大，可能亏损'}];
  function normalize(l){l.investments=l.investments||[];l.investmentHistory=l.investmentHistory||[];l.investments.forEach(p=>{if(p.lastYear==null)p.lastYear=l.born.y+p.age;});return l.investments;}
  const value=l=>normalize(l).reduce((n,p)=>n+p.value,0);
  function cashflow(l,amount,field){l.savings+=amount;if(l.finances?.year===l.year){const f=l.finances;f[field]=(f[field]||0)+Math.abs(amount);if(amount<0)f.expense-=amount;f.balance+=amount;}}
  function transact(l,action,args,log){
    const positions=normalize(l),fail=message=>({ok:false,message});if(!l.alive||l.age<18)return fail('成年后可以安排自己的存款。');
    if(action==='invest'){
      if(positions.length>=30)return fail('先取回一笔已有资金，再安排新的账户。');
      const product=products.find(p=>p.id===args.product);if(!product||![.25,.5].includes(args.fraction))return fail('请选择有效的存款安排。');
      const amount=Math.floor(Math.max(0,l.savings)*args.fraction/100)*100;if(amount<1000)return fail('至少留出 1,000 元可安排资金。');
      const id=product.id+'-'+l.age+'-'+l.investmentHistory.length;positions.push({id,product:product.id,principal:amount,value:amount,age:l.age,lastYear:l.year});cashflow(l,-amount,'investmentOut');
      const text=`你拿出 ${G.CNEngine.money(amount)} 安排为${product.name}，其余资金留作日常开支。`;l.investmentHistory.push({age:l.age,kind:'invest',amount,text});log(l,'money',text);return {ok:true,message:'资金安排已记下。'};
    }
    if(action==='redeem'){
      const p=positions.find(p=>p.id===args.id);if(!p)return fail('这笔资金已取回。');l.investments=positions.filter(x=>x!==p);cashflow(l,p.value,'investmentIn');const product=products.find(x=>x.id===p.product),text=`你取回了${product.name}的 ${G.CNEngine.money(p.value)}，${p.value>=p.principal?'累计收益':'累计亏损'} ${G.CNEngine.money(Math.abs(p.value-p.principal))}。`;l.investmentHistory.push({age:l.age,kind:'redeem',amount:p.value,text});log(l,'money',text,p.value>=p.principal?'good':'bad');return {ok:true,message:'资金已回到可用结余。'};
    }return fail('未知的资金安排。');
  }
  function year(l,log){
    let change=0;
    for(const p of normalize(l)){
      if(p.lastYear>=l.year)continue;p.lastYear=l.year;
      const rate=p.product==='deposit'?.015:p.product==='balanced'?Math.max(-.08,Math.min(.1,l.r.norm(.025,.035))):Math.max(-.4,Math.min(.4,l.r.norm(.055,.17)+(l.flags.marketShockAge===l.age?-.18:0)));
      const n=Math.round(p.value*rate);p.value=Math.max(0,p.value+n);change+=n;
    }
    if(change){l.investmentHistory.push({age:l.age,kind:'valuation',amount:change,text:'年度资金估值变动'});if(l.age%5===0||l.flags.marketShockAge===l.age)log(l,'money',`你翻了翻资金账户，这一年${change>=0?'增加':'减少'}了 ${G.CNEngine.money(Math.abs(change))}。未取回的金额仍留在账户里。`,change>=0?'good':'bad');}
    return change;
  }
  G.CNFinance={products,normalize,value,transact,year};
})(typeof window!=='undefined'?window:globalThis);
