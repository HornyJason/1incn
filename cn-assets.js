/* 房产与车辆：游戏经济，不对应真实报价。现金、借款和资产市值分别记账。 */
(function(G){
  const cap=(v,a,b)=>Math.max(a,Math.min(b,v)), money=n=>G.CNEngine.money(n);
  const homes={small:{name:'普通两居',factor:1},family:{name:'改善型三居',factor:1.55},flat:{name:'大平层',factor:2.6},villa:{name:'别墅',factor:4.5}};
  const cars=[{id:'used',name:'二手代步车',price:40000},{id:'compact',name:'经济型新车',price:90000},{id:'family',name:'家庭用车',price:160000}];
  function sync(l){
    const home=l.properties.find(p=>p.use==='self'&&p.pref===l.pref&&p.city===l.city);
    l.house=home||null;l.mortgage=home?.loan||l.legacyMortgage||null;
    l.debt=Math.round((l.studentDebt||0)+l.properties.reduce((s,p)=>s+(p.loan?.balance||0),0)+(l.legacyMortgage?.balance||0));
  }
  function normalize(l){
    if(!Array.isArray(l.properties)){
      l.properties=[];
      if(l.house)l.properties.push({...l.house,id:'home-legacy',pref:l.pref,city:l.city,rural:l.rural,purchasePrice:l.house.value,purchaseYear:l.year,use:'self',loan:l.mortgage||null});
      else if(l.mortgage?.balance>0)l.legacyMortgage=l.mortgage;
    }
    l.assetSerial=l.assetSerial||l.properties.length;l.assetHistory=l.assetHistory||[];l.car=l.car||null;
    sync(l);return l;
  }
  function quote(l,size='small',mode='loan'){
    const price=Math.round(G.CNLocal.cityProfile(l).homePrice*(homes[size]?.factor||1));
    const years=Math.min(25,80-l.age),down=mode==='cash'?price:Math.round(price*.3),balance=price-down,rate=.035;
    const annualPayment=balance&&years>0?Math.round(balance*rate/(1-Math.pow(1+rate,-years))):0;
    return {price,down,fees:Math.round(price*.02),balance,rate,years,annualPayment};
  }
  function options(l){normalize(l);return {houses:Object.keys(homes).map(size=>({size,name:homes[size].name,cash:quote(l,size,'cash'),loan:quote(l,size,'loan')})),cars};}
  function record(l,kind,text,delta,log){
    l.assetHistory.push({age:l.age,year:l.year,kind,text,delta});l.savings=Math.round(l.savings+delta);
    if(l.finances?.year===l.year){const f=l.finances;if(delta<0){f.assetOut=(f.assetOut||0)-delta;f.expense-=delta;}else f.assetIn=(f.assetIn||0)+delta;f.balance+=delta;}
    log(l,'money',text,'neutral','房价涨跌、租金、折旧、手续费和借款均为游戏参数。');sync(l);
  }
  function transact(l,action,args={},log){
    normalize(l);if(!l.alive||l.age<18)return {ok:false,message:'成年后可以管理自己的资产。'};
    const fail=message=>({ok:false,message});
    if(action==='buyHome'){
      if(l.properties.length>=5)return fail('最多同时持有 5 套房产。');
      if(!Object.hasOwn(homes,args.size)||!['cash','loan'].includes(args.mode)||!['self','rent'].includes(args.use))return fail('请选择有效的购房方案。');
      const q=quote(l,args.size,args.mode);if(args.mode==='loan'&&q.years<5)return fail('该年龄仅支持全款购房。');
      if(l.savings<q.down+q.fees)return fail('结余不足以支付房款和手续费。');
      if(args.use==='self')l.properties.filter(p=>p.use==='self').forEach(p=>p.use='vacant');
      const p={id:'home-'+(++l.assetSerial),name:homes[args.size].name,value:q.price,purchasePrice:q.price,purchaseYear:l.year,pref:l.pref,city:l.city,rural:l.rural,use:args.use,loan:q.balance?{balance:q.balance,rate:q.rate,yearsLeft:q.years,annualPayment:q.annualPayment}:null};
      l.properties.push(p);l.done.housing=true;if(args.use==='self'){l.flags.livesWithParents=false;delete l.flags.livingWithChild;}
      record(l,'buyHome',`你在${l.city}买下一套${p.name}，用作${args.use==='self'?'自住':'出租'}。支付${money(q.down)}房款和${money(q.fees)}手续费${q.balance?'，剩余房款分期偿还':''}。`,-q.down-q.fees,log);
    }else if(action==='sellHome'){
      const p=l.properties.find(p=>p.id===args.id);if(!p)return fail('这套房产已经不在名下。');
      const fee=Math.round(p.value*.02),net=Math.round(p.value-fee-(p.loan?.balance||0));
      if(net+l.savings<0)return fail('卖房款不足以结清借款，当前结余也无法补足差额。');
      l.properties=l.properties.filter(x=>x!==p);if(p.use==='self')l.flags.livesWithParents=false;
      record(l,'sellHome',`你卖出了${p.city}的${p.name}，成交${money(p.value)}；扣除手续费与剩余借款后${net>=0?'到账':'补付'}${money(Math.abs(net))}。`,net,log);
    }else if(action==='useHome'){
      const p=l.properties.find(p=>p.id===args.id);if(!p||!['self','rent','vacant'].includes(args.use))return fail('无法更改这套房产的用途。');
      if(p.use===args.use)return fail('这套房产已经是该用途。');
      if(args.use==='self'){
        delete l.flags.livingWithChild;
        l.properties.filter(x=>x.use==='self').forEach(x=>x.use='vacant');
        if(l.pref!==p.pref||l.city!==p.city){l.pref=p.pref;l.city=p.city;l.rural=p.rural;l.trail.push({age:l.age,pref:p.pref,city:p.city});}
        l.flags.livesWithParents=false;
      }else if(p.use==='self')l.flags.livesWithParents=false;
      p.use=args.use;record(l,'useHome',`你将${p.city}的${p.name}改为${{self:'自住',rent:'出租',vacant:'空置'}[args.use]}${args.use==='rent'?'，租金将从下一年开始结算':''}。`,0,log);
    }else if(action==='buyCar'){
      if(l.car)return fail('已有一辆车，请先卖掉再更换。');const c=cars.find(c=>c.id===args.id);if(!c)return fail('请选择一辆车。');
      if(l.savings<c.price)return fail('结余不足以全款购车。');l.car={...c,value:c.price,purchasePrice:c.price,purchaseYear:l.year};
      record(l,'buyCar',`你买了一辆${c.name}，花费${money(c.price)}。之后每年会结算用车费用和折旧。`,-c.price,log);
    }else if(action==='sellCar'){
      if(!l.car)return fail('目前没有可出售的车辆。');const c=l.car;l.car=null;record(l,'sellCar',`你卖掉了${c.name}，按当前残值收回${money(c.value)}。`,c.value,log);
    }else return fail('未知的资产操作。');
    l.peak.savings=Math.max(l.peak.savings,l.savings);return {ok:true,message:'已经记入资产与人生记录。'};
  }
  function repay(m){
    if(!m||m.balance<=0)return {principal:0,interest:0};
    const interest=Math.round(m.balance*m.rate),principal=Math.round(m.yearsLeft<=1?m.balance:Math.min(m.balance,Math.max(0,m.annualPayment-interest)));
    m.balance=Math.max(0,Math.round(m.balance-principal));m.yearsLeft=Math.max(0,m.yearsLeft-1);return {principal,interest};
  }
  function year(l,log){
    normalize(l);let rentalIncome=0,propertyCost=0,principal=0,interest=0,valueChange=0;
    l.properties.forEach(p=>{
      const old=p.value;p.value=Math.round(cap(old*cap(l.r.norm(1.01,.07),.82,1.18),p.purchasePrice*.2,p.purchasePrice*5));valueChange+=p.value-old;
      propertyCost+=Math.round(p.value*.003);
      if(p.use==='rent'){const region={...l,pref:p.pref,city:p.city,rural:p.rural};const rent=G.CNLocal.cityProfile(region).rent*(p.purchasePrice/G.CNLocal.cityProfile(region).homePrice);rentalIncome+=Math.round(rent*12*(l.r.chance(.12)?.5:.92));}
      const before=p.loan?.balance||0,q=repay(p.loan);principal+=q.principal;interest+=q.interest;
      if(before>0&&!p.loan.balance)log(l,'money',`${p.city}的${p.name}还清了最后一笔住房借款。`,'good');
    });
    const q=repay(l.legacyMortgage);principal+=q.principal;interest+=q.interest;
    let carCost=0;if(l.car){carCost=Math.round(3000+l.car.purchasePrice*.025);l.car.value=Math.max(Math.round(l.car.purchasePrice*.05),Math.round(l.car.value*.85));}
    sync(l);return {rentalIncome,propertyCost,carCost,principal,interest,mortgagePay:principal+interest,valueChange};
  }
  function totals(l){normalize(l);const propertyValue=l.properties.reduce((s,p)=>s+p.value,0),carValue=l.car?.value||0;return {propertyValue,carValue,debt:l.debt,investmentValue:G.CNFinance.value(l),netWorth:Math.round(l.savings+propertyValue+carValue+G.CNFinance.value(l)-l.debt)};}
  function clearAffordableDebt(l,log){
    normalize(l);const amount=l.debt;if(!l.alive||l.age<18||amount<=0||l.savings<amount)return false;
    const student=l.studentDebt||0,housing=amount-student;l.savings-=amount;l.studentDebt=0;
    for(const loan of [...l.properties.map(p=>p.loan),l.legacyMortgage].filter(Boolean)){loan.balance=0;loan.annualPayment=0;loan.yearsLeft=0;}
    if(l.finances?.year===l.year){const f=l.finances;f.principal=(f.principal||0)+housing;f.mortgagePay=(f.mortgagePay||0)+housing;f.studentPay=(f.studentPay||0)+student;f.earlyRepayment=(f.earlyRepayment||0)+amount;f.expense+=amount;f.balance-=amount;}
    const text=`积蓄足以覆盖剩余借款，你一次还清了 ${money(amount)}${student&&housing?' 的教育与住房借款':student?' 的教育借款':' 的住房借款'}。`;
    l.assetHistory.push({age:l.age,year:l.year,kind:'repayDebt',text,delta:-amount});log(l,'money',text,'good');sync(l);return true;
  }
  G.CNAssets={normalize,sync,quote,options,transact,year,totals,cars,clearAffordableDebt};
})(typeof window!=='undefined'?window:globalThis);
