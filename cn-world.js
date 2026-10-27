/* 低频虚构社会背景，每年最多一项；不预测真实未来事件。 */
(function(G){
  function year(l,log){
    if(l.age<6||!l.r.chance(.02))return null;
    const kind=l.r.int(0,4);let text;
    if(kind===0){text='本地推出了产业扶持和就业培训计划。招聘栏里多了几种岗位，你也留意起新的机会。';if(l.job&&!G.CNCareer.civil(l))l.flags.workShock={age:l.age,factor:1.04};}
    if(kind===1){text='一轮传染病流行打乱了日常。你减少外出，留意身体变化，也把工作和休息重新排了排。';l.stats.health-=l.r.int(1,3);l.stats.happy-=2;if(l.job&&!G.CNCareer.civil(l))l.flags.workShock={age:l.age,factor:.94};}
    if(kind===2){text='国际冲突让航运和供应链吃紧。新闻里的远方，也通过订单和物价影响了身边的生活。';if(l.job&&!G.CNCareer.civil(l))l.flags.workShock={age:l.age,factor:.95};l.stats.happy-=1;}
    if(kind===3){text='股市经历了一轮明显回调。有人谈起账户的涨跌，也有人照常去上班、买菜，把日子过下去。';l.flags.marketShockAge=l.age;l.stats.happy-=1;}
    if(kind===4){text='行业监管与用工规则发生调整，单位安排了新的培训。你花了些时间熟悉流程，也重新想了想自己的职业打算。';if(l.job){l.stats.know+=1;l.stats.happy-=1;}}
    log(l,'society',text,kind===0?'good':kind===4?'neutral':'bad');return kind;
  }
  G.CNWorld={year};
})(typeof window!=='undefined'?window:globalThis);
