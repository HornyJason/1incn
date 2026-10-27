/* 价格均按固定购买力运行，不将现实年份后的通胀外推到整个人生。口径与来源见 ECONOMY.md。 */
(function(G){
  const floorRows=[2540,2510,2380,2350,2380,2230,2230,2270,2740,2660,2660,2320,2265,2240,2400,2350,2400,2200,2680,2200,2250,2330,2330,2130,2270,2360,2376,2200,2080,2235,2270];
  const east=new Set(['北京市','天津市','河北省','上海市','江苏省','浙江省','福建省','山东省','广东省','海南省']);
  const central=new Set(['山西省','安徽省','江西省','河南省','湖北省','湖南省']);
  const northeast=new Set(['辽宁省','吉林省','黑龙江省']);
  const metro=new Set(['北京','上海','广州','深圳']),hub=new Set(['南京','苏州','无锡','杭州','宁波','福州','厦门','济南','青岛','郑州','武汉','长沙','成都','西安','天津','重庆','合肥','佛山','东莞']);
  function profile(l){
    const provinces=G.CN_DATA.provinces,index=provinces.findIndex(p=>p.name===l.pref),p=provinces[index],big=metro.has(l.city),center=hub.has(l.city),rural=l.rural&&!big&&!center;
    // 各省一档作保守工资下限；已核实的独立城市覆盖。不会因县镇抽样压低全职工资。
    const minMonthly=l.city==='深圳'?2700:floorRows[index]||2400;
    const regional=east.has(l.pref)?80149:central.has(l.pref)?58627:northeast.has(l.pref)?54430:60923;
    const wage=({上海:113914,深圳:99220}[l.city])||regional*(big?1.18:center?1.03:rural?.83:.92);
    return {minMonthly,wage:Math.round(wage),averageMonthly:Math.round(wage*1.8/12),rent:big?1500:center?1000:rural?450:650,food:big?1150:center?950:rural?700:800,tier:big?'大城市':center?'区域中心城市':rural?'县镇':'普通城市',homePrice:big?3200000:center?1400000:rural?420000:780000};
  }
  function startingPay(l,kind,k=1.2,random=l.r){
    const p=profile(l),school={985:1.23,211:1.14,'一本':1.06,'二本':1,'三本':.94,'专科':.88}[l.edu.tier]||1;
    const experience=Math.min(.25,(l.careerYears||0)*.008),base=kind==='basic'?.61:kind==='skilled'?.76:.82;
    return Math.round(Math.max(p.minMonthly*12,p.wage*base*(k/1.35)*school*(1+experience)*Math.exp(random.norm(0,.13))));
  }
  const takeHome=l=>Math.round(l.income*(l.job&&!l.retired?.9:1));
  G.CNEconomy={profile,startingPay,takeHome};
})(typeof window!=='undefined'?window:globalThis);
