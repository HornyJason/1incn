/* 中国生活扩展：地域、成长、教育与家庭账本。全部概率、费用与城市分档均为游戏设定。 */
(function(G){
  'use strict';
  const D=G.CN_DATA,cap=(x,a,b)=>Math.max(a,Math.min(b,x));
  const culture={
    '北京市':['胡同口的早餐摊','一串糖葫芦','胡同里的树荫'], '天津市':['街边的煎饼摊','一套煎饼果子','海河边的晚风'],
    '河北省':['熟悉的面馆','一份驴肉火烧','老街上的烟火气'], '山西省':['巷口的面馆','一碗刀削面','晒着太阳的老院子'],
    '内蒙古自治区':['早起开门的早餐店','一碗热奶茶','夏日公园里的晚风'], '辽宁省':['热气腾腾的饺子馆','一盘家常饺子','暖和的屋子与窗外的雪'],
    '吉林省':['楼下的家常小馆','一碗热汤面','冬天踩雪的脚步声'], '黑龙江省':['熟悉的街角小店','一份红肠与热饭','冬夜窗上的冰花'],
    '上海市':['弄堂口的早餐店','一碗葱油拌面','梧桐树下的街道'], '江苏省':['巷口的小吃店','一碗热汤面','河边缓缓亮起的灯'],
    '浙江省':['早起开门的面馆','一碗热汤面','雨后街巷里的树影'], '安徽省':['街角的早餐铺','一碗牛肉汤','老街里慢慢醒来的清晨'],
    '福建省':['街边的家常小馆','一碗沙茶面','雨后散步时闻到的茶香'], '江西省':['热闹的早餐摊','一碗拌粉','晚饭后邻居的招呼声'],
    '山东省':['老街的早点铺','一份煎饼','集市里熟悉的乡音'], '河南省':['热气腾腾的面馆','一碗烩面','傍晚热闹起来的夜市'],
    '湖北省':['清晨的过早摊位','一碗热干面','早高峰里的早点香'], '湖南省':['巷口的粉店','一碗米粉','下过雨的街巷'],
    '广东省':['街口的粥粉面店','一顿慢慢吃的早茶','骑楼下躲过的一阵雨'], '广西壮族自治区':['街边的米粉店','一碗米粉','下过雨之后的清晨'],
    '海南省':['傍晚的小吃摊','一碗清补凉','旅行时吹过的海风'], '重庆市':['爬坡路上的小面馆','一碗重庆小面','两江边渐渐亮起的灯'],
    '四川省':['公园边的小吃店','一碗担担面','茶馆里坐着聊天的下午'], '贵州省':['雨后开门的小面馆','一碗肠旺面','山城街巷里拐过的弯'],
    '云南省':['清早开门的米线店','一碗米线','冬日里暖和的太阳'], '西藏自治区':['家人常去的小店','一杯热茶','晒着太阳的午后'],
    '陕西省':['熟悉的面馆','一碗臊子面','老街里来来往往的乡音'], '甘肃省':['早起营业的牛肉面馆','一碗牛肉面','清晨街头的热气'],
    '青海省':['家附近的早点铺','一碗酸奶','天气晴好时的散步'], '宁夏回族自治区':['家人熟悉的小吃店','一顿热腾腾的家常饭','老院子里说话的声音'],
    '新疆维吾尔自治区':['家门口的馕店','一块新出炉的馕','夜市里亮起来的灯']
  };
  const metros=new Set(['北京','上海','深圳','广州']);
  const hubs=new Set(['杭州','南京','苏州','厦门','宁波','成都','武汉','西安','天津','重庆','长沙','青岛','福州','合肥','济南','郑州']);
  function cityProfile(l){
    const big=metros.has(l.city),hub=hubs.has(l.city),small=l.rural&&!big&&!hub;
    return {tier:big?'超大城市':hub?'区域中心城市':small?'县镇生活':'普通城市',rent:big?2800:hub?1800:small?650:1100,food:big?1450:hub?1200:small?800:1000,homePrice:big?3200000:hub?1400000:small?420000:780000};
  }
  function familyLabel(l){return l.wealth>.65?'条件宽裕的家庭':l.wealth<-.6?'需要精打细算的家庭':'普通的工薪家庭';}
  function parentName(r,sex,born){
    const old=D.parentNames[sex],recent=sex==='M'?['宇','浩','俊杰','晨','子航','佳明','嘉诚','文博','志远','泽','阳','凯']:['欣怡','佳宁','晓雨','悦','婷','文静','思敏','嘉怡','晓彤','颖','璐','慧'];
    return r.pick(born>=1985?recent:old);
  }
  function normalize(l){
    l.flags=l.flags||{};l.fam=l.fam||{};l.actions=l.actions||[];l.fam.siblings?.forEach(s=>{s.sex=s.sex||(D.given.M.includes(s.name)?'M':'F');});l.finances=l.finances||null;
    l.origin=l.origin||{settlement:l.rural?'乡镇':'城区',family:familyLabel(l)};
    l.studentDebt=Math.max(0,l.studentDebt||0);l.careerYears=l.careerYears||0;l.careerIncome=l.careerIncome||0;
    for(const [k,sex] of [['father','M'],['mother','F']]){
      const p=l.fam[k];if(!p)continue;
      p.sei=p.sei||(sex==='M'?l.name.sei:D.surnames[(l.seed+7)%D.surnames.length]);
      if(!p.alive&&p.deathAge==null){const e=l.log.find(e=>e.c==='family'&&e.t.includes(k==='father'?'父亲':'母亲')&&e.t.includes('去世'));p.deathAge=p.age0+(e?.age??l.age);}
    }
    if(l.spouse&&!Number.isFinite(l.spouse.income))l.spouse.income=Math.round(40000*(D.provinces.find(p=>p.name===l.pref)?.incomeFactor||1));
    if(l.debt>0&&!l.mortgage&&!l.properties){l.mortgage={balance:Math.max(0,l.debt-l.studentDebt),rate:0,yearsLeft:Math.max(1,Math.ceil(l.debt/18000)),annualPayment:18000,legacy:true};}
    G.CNAssets.normalize(l);G.CNQueer.normalize(l);
    return l;
  }
  function init(l){
    normalize(l);const r=l.r;
    l.fam.father.name=parentName(r,'M',l.born.y-l.fam.father.age0);l.fam.mother.name=parentName(r,'F',l.born.y-l.fam.mother.age0);
    l.fam.mother.sei=r.pick(D.surnames);l.origin.settlement=l.rural?(r.chance(.5)?'乡村':'乡镇'):'城区';
    l.flags.livesWithParents=true;l.fam.siblings.forEach(s=>{s.sei=l.name.sei;});
    return l;
  }
  function addDecisions(l,{dec,opt,log,getJob}){
    const a=l.age,s=l.stats,r=l.r,done=l.done;
    if(a===8&&!done.schoolLife)return [dec(l,'schoolLife','红领巾、课间操和放学路','班里开始安排新的活动。你想把课余时间分给什么？',[
      opt('和同学一起参加集体活动','关系 +5，留下一段校园记忆',l=>{s.social+=5;return '你第一次和同学一起完成了班级活动。回家时，你把红领巾叠好放进书包。';},2),
      opt('认真完成自己的小作品','知识 +4，心情 +3',l=>{s.know+=4;s.happy+=3;return '你交出了一份有点笨拙、却完全属于自己的小作品。老师把它贴在了教室后墙。';})])];
    if(a===12&&!done.schoolLetter)return [dec(l,'schoolLetter','毕业纪念册里的一封信','小学毕业前，同桌把一封信夹进了你的纪念册。',[
      opt('认真回一封信，约好以后联系','关系 +4，心情 +3',l=>{s.social+=4;s.happy+=3;return '你写满了两页信纸，把地址也工工整整地写在最后。那封回信，和毕业照一起留在了对方的抽屉里。';},2),
      opt('把信收好，当面说一声谢谢','心情 +4',l=>{s.happy+=4;return '放学时，你追上同桌说了一声谢谢。回家以后，把那封信放进了最喜欢的一本书。';})])];
    if(a===19&&!done.homeLetter&&(l.fam.father.alive||l.fam.mother.alive))return [dec(l,'homeLetter','行李里藏着家里的一封信','整理抽屉时，你发现了家人放在行李夹层里的信。',[
      opt('写封回信，也说说自己的烦恼','关系 +6，心情 +3',l=>{s.social+=6;s.happy+=3;return '你写下最近吃到的饭菜、遇见的人，也说了一件不太顺心的事。信寄出去以后，心里反而踏实了。';},2),
      opt('给家里打个电话，慢慢聊一会儿','关系 +5',l=>{s.social+=5;return '电话接通时，家里传来锅铲碰到锅沿的声音。你们没聊什么大事，却都舍不得先挂断。';}),
      opt('先收好，等见面再说','心情 +2',l=>{s.happy+=2;return '你把信叠回原来的折痕里。下次回家时，想给家人带一点这里的特产。';})])];
    if(a>=18&&a<=21&&['univ','college'].includes(l.edu.stage)&&!done.major)return [dec(l,'major','录取通知书之后：学什么？','专业会影响最初接触的岗位，但不会替你决定一辈子。课程和职业对应关系经过简化。',D.majors.filter(m=>l.edu.stage==='univ'||m.id!=='education').map(m=>opt(m.name,`${m.skill} · 影响第一份工作`,l=>{l.flags.major=m.id;l.edu.major=m.name;s.know+=4;return `你选择了${m.name}方向。开学那天，你在食堂里第一次用饭卡买了一顿饭。`;},1)))];
    if(a===22&&l.edu.stage==='univ'&&!done.postgrad)return [dec(l,'postgrad','毕业以后，继续读还是先工作？','图书馆里的座位、招聘会上的队伍、朋友的消息，都在提醒你：又到了一个路口。',[
      opt('尝试考研','模拟录取；录取后 25 岁毕业',l=>{if(r.chance(cap(.2+s.know/150,.2,.8))){l.eduDone='本科';l.flags.degree='硕士';l.flags.gradAge=25;l.edu.stage='grad';l.edu.label='硕士在读';s.know+=7;return '你收到了研究生录取通知。再见到熟悉的校园时，你换了一个新的身份。';}return '这次没有考上。你收好复习资料，决定先去工作，未来的路还很长。';}),
      opt('先去工作，攒下自己的第一笔钱','进入求职选择',l=>'你把毕业照发给家人，然后认真改好了第一版简历。',3)])];
    if(a>=24&&a<=28&&l.job&&!done.workStyle)return [dec(l,'workStyle','想把日子过成什么节奏？','同学群里，有人在企业，有人在基层，也有人开始自由接单。你也在衡量自己的选择。',[
      opt('准备一次公考或事业单位考试','录取为游戏抽样；准备期支出 3,000 元',l=>{l.savings-=3000;if(r.chance(cap(.1+s.know/300,.1,.4))){getJob(l,'college',['基层公共服务岗位',1.22]);l.job.sector='civil';l.flags.workStyle='稳定';return '你通过了这次模拟招录，开始在一个基层岗位工作。稳定的日常，也有自己的忙碌。';}s.know+=4;return '你认真准备了一次考试，结果没有如愿。工作继续，学到的东西也没有白费。';}),
      opt('继续在企业积累经验','知识 +5，收入 +8%',l=>{l.flags.workStyle='企业';s.know+=5;l.income*=1.08;return '你决定继续在企业积累经验，开始独立负责一个小项目。';},3),
      opt('尝试接单或做小生意','收入波动更大，时间安排更自由',l=>{l.flags.workStyle='灵活就业';l.flags.flexible=true;l.job.title=l.flags.major==='design'?'自由设计师':l.job.kind==='skilled'?'技术服务接单者':r.pick(['个体经营者','电商小店经营者']);l.income*=r.chance(.6)?1.12:.78;l.job.sector='private';l.jobHist.push({age:l.age,title:l.job.title,income:Math.round(l.income)});return '你开始自己接单或经营一门小生意。有人催进度，也有人记得给你介绍新的机会。';})])];
    if(a===35&&!done.festival)return [dec(l,'festival','春节快到了，今年怎么过？',l.pref===l.birthPref?'家人开始张罗年夜饭。':'家里问你，回程车票买好了没有。',[
      opt('回家吃一顿团圆饭','花费 1,200 元，关系 +8',l=>{l.savings-=1200;s.social+=8;s.happy+=4;return '你把行李放在门口，熟悉的饭菜已经摆上桌。饭后，家人又往你的包里塞了很多东西。';},3),
      opt('留在现在的城市，和朋友一起过','花费 600 元，心情 +6',l=>{l.savings-=600;s.happy+=6;return '你和朋友一起包饺子、做年夜饭，也给家人打了一个长长的视频电话。';}),
      opt('安排工作，把团聚放在错峰假期','收入 +2%，关系 +2',l=>{l.income*=1.02;s.social+=2;return '你选择错峰回家。人少一点，陪家人说话的时间反而多了一点。';})])];
    if(a>=46&&a<=55&&(l.fam.father.alive||l.fam.mother.alive)&&!done.care)return [dec(l,'care','父母老了，怎么安排照应？','一次普通的检查之后，你们开始认真谈论以后谁来陪诊、日常怎么联系。',[
      opt('多留一些时间陪伴','收入 -5%，关系 +10，减少照护支出',l=>{l.flags.care='time';l.income*=.95;s.social+=10;return '你把家人的号码设在快捷拨号里，也尽量给陪诊和探望留出时间。';},2),
      opt('和家人一起分担照护费用','每年预留 4,800 元，关系 +5',l=>{l.flags.care='service';s.social+=5;return '你们商量好分工，安排定期探望，也预留了一笔照护费用。';}),
      opt('保持联系，先建立应急安排','关系 +3，保留工作节奏',l=>{l.flags.care='contact';s.social+=3;return '你和家人写下了应急联系人，也约好每周好好通一次电话。';})])];
    return null;
  }
  function housing(l,{dec,opt}){
    const p=cityProfile(l),s=l.stats,price=p.homePrice,down=Math.round(price*.3),loan=price-down,rate=.035,years=25;
    const annual=Math.round(loan*rate/(1-Math.pow(1+rate,-years)));
    const money=G.CNEngine.money;
    return dec(l,'housing','想在哪里安一个家？',`你在${l.city}看了看住处。这里用${p.tier}的游戏价格档位估算，并非当地实际房价或贷款报价。`,[
      opt('按预算购买一套普通住房',`总价约 ${money(price)}，首付 ${money(down)}，手续费 ${money(Math.round(price*.02))}；年还款约 ${money(annual)}`,l=>{
        if(l.savings<down+Math.round(price*.02))return '算过首付和应急金，你决定暂时不买房。把日子过稳，比赶一个时间表更重要。';
        const result=G.CNAssets.transact(l,'buyHome',{size:'small',mode:'loan',use:'self'},()=>{});if(!result.ok)return result.message;s.happy+=5;return `你在${l.city}安下一个家。收房那天，屋子还空着，你先认真量了窗帘的尺寸。`;
      },l.savings>=down+Math.round(price*.02)?2:0),
      opt('继续租住，把余地留给未来',`租金模型约 ${money(p.rent)} / 月`,l=>{l.flags.livesWithParents=false;s.happy+=3;return '你继续租住，给自己留下一笔储备。添上一盏喜欢的灯，屋子就又像家了一点。';},2),
      opt('回到家乡，重新安排生活','调整城市档位；回乡后在家庭住处过渡',l=>{const moved=l.pref!==l.birthPref||l.city!==l.birthCity;l.pref=l.birthPref;l.city=l.birthCity;l.rural=l.origin.settlement!=='城区';l.flags.livesWithParents=true;if(moved)l.trail.push({age:l.age,pref:l.pref,city:l.city});G.CNAssets.sync(l);l.income*=.85;s.social+=8;return `你回到${l.city}。熟悉的小店还在，你决定给自己一点时间，把新的生活慢慢安顿下来。`;})
    ]);
  }
  function year(l,{log}){
    normalize(l);const p=cityProfile(l),a=l.age,r=l.r;
    if(l.job&&!l.retired){l.careerYears++;l.careerIncome+=l.income;if(l.flags.flexible)l.income*=cap(r.norm(1,.12),.7,1.35);}
    if(l.retired&&!l.flags.pensionCalculated){const avg=l.careerYears?l.careerIncome/l.careerYears:48000;l.income=Math.round(cap(avg*.4,14000,65000));l.flags.pensionCalculated=true;}
    if(l.spouse)l.spouse.income=Math.round((l.spouse.income||40000)*1.015);
    let support=0,tuition=0,pay=Math.round(l.income*(l.job&&!l.retired?.84:1));
    const spousePay=l.spouse?Math.round(l.spouse.income*(a<62?.84:.5)*.65):0;
    const studying=a>=18&&['univ','college','grad'].includes(l.edu.stage)&&a<(l.flags.gradAge||22)&&!l.job;
    const independent=a>=18&&!l.flags.livesWithParents;
    const rent=studying?6000:l.house||!independent?0:p.rent*12;
    const daily=a<18?0:Math.round(p.food*12*(l.spouse?1.6:1)*(l.flags.livesWithParents?.65:1));
    const children=l.kids.filter(k=>a-k.birthAge<22).reduce((sum,k)=>sum+(a-k.birthAge<6?12000:a-k.birthAge<18?9000:16000),0);
    const care=(l.fam.father.alive||l.fam.mother.alive)?(l.flags.care==='service'?4800:l.flags.care==='time'?1800:0):0;
    if(studying){tuition=l.edu.stage==='grad'?10000:8000;support=Math.min(tuition+daily+rent,Math.round(l.fam.parentHH*.2));const shortage=Math.max(0,tuition+daily+rent-support);l.studentDebt+=shortage;}
    const assets=G.CNAssets.year(l,log),{principal,interest,mortgagePay,rentalIncome,propertyCost,carCost,valueChange}=assets;
    let studentPay=0;if(!studying&&l.income>0&&l.studentDebt>0){studentPay=Math.min(l.studentDebt,Math.round(l.income*.08));l.studentDebt-=studentPay;}
    const expense=daily+rent+children+care+tuition+mortgagePay+studentPay+propertyCost+carCost;
    const loanFunding=studying?Math.max(0,tuition+daily+rent-support):0;
    const balance=a>=18?pay+spousePay+support+loanFunding+rentalIncome-expense:0;
    l.savings+=balance;G.CNAssets.sync(l);
    l.finances={year:l.year,gross:Math.round(l.income),pay,spousePay,support,daily,rent,children,care,tuition,mortgagePay,principal,interest,studentPay,loanFunding,rentalIncome,propertyCost,carCost,valueChange,expense,balance,model:true};
    if(a>=18&&(a===18||a%5===0))log(l,'money',`${l.year} 年的家庭账本：到账约${G.CNEngine.money(pay+spousePay+support+rentalIncome)}，生活和还款约${G.CNEngine.money(expense)}。${balance>=0?'本年结余':'本年收支缺口'}约${G.CNEngine.money(Math.abs(balance))}。`,'neutral','薪酬扣除、伴侣共同生活投入、租金、学费、照护和借款均为游戏估算，不对应真实政策或金融合同。');
    if(studying&&loanFunding>0&&a===(l.flags.gradAge||22)-1)log(l,'school','家里尽力支持你，剩下的求学费用先记为教育借款。你打算工作后慢慢还。','neutral');
    if(a===1)log(l,'family','周岁那天，家人给你拍了一张全家福。你还不明白什么是生日，只觉得今天很热闹。','good');
    if(a===16&&l.edu.stage==='voc')log(l,'school','实训课上，你第一次独立完成了一道工序。老师说，认真做事也是一种本事。','good');
    if(a===19&&['univ','college','grad'].includes(l.edu.stage))log(l,'school','你住进宿舍，在食堂排队，在社团招新时犹豫，也开始和来自不同地方的人做朋友。','good');
    if(a>=18&&a%12===0){const c=culture[l.birthPref];log(l,'story',`一个想家的晚上，你忽然想吃${c[1]}。记忆里还有${c[2]}。`);}
    if(a>=20&&a%11===0&&l.pref!==l.birthPref)log(l,'family','你订好了回家的车票。车窗外的景色越来越熟悉，家人的消息也越来越密。','good');
    l.fam.siblings.forEach(s=>{const sa=s.age+a;if(sa===18)log(l,'family',`家里的${s.sei||l.name.sei}${s.name}也成年了。饭桌上，你们开始聊起各自的打算。`);});
  }
  function contextualStory(l,group,pool){
    const c=culture[l.pref]||culture[l.birthPref],a=l.age;
    if(a>=6&&a%7===0)return `放假的早晨，你和家人去了${c[0]}。${c[1]}端上来时，你觉得这就是熟悉的生活。`;
    if(a>=22&&l.job&&a%6===0)return l.flags.flexible?'你接到一位老客户的新订单。忙完以后，你给自己留了半天休息。':'下班后的路上，你顺手买了点菜。到家开灯的那一刻，忙碌的一天慢慢落下来了。';
    if(a>=18&&!l.job&&!l.retired&&['univ','college','grad'].includes(l.edu.stage)&&a%2===0)return '期末周，图书馆很早就坐满了人。你和室友约好，交完最后一份作业后一起吃顿好的。';
    if(a<18&&!['hs','univ','college'].includes(l.edu.stage)&&group==='teen')pool=pool.filter(t=>!t.includes('晚自习')&&!t.includes('毕业'));
    return l.r.pick(pool);
  }
  function actionOptions(l){
    if(!l.alive)return [];
    return [
      {id:'exercise',label:l.age<18?'去操场动一动':'散步或锻炼',hint:'健康 +3，心情 +1',ok:l.age>=6,cost:0},
      {id:'read',label:'读书学点新东西',hint:'知识 +3，心情 +1',ok:l.age>=6,cost:0},
      {id:'family',label:'和家人好好聊聊',hint:'关系 +4，心情 +2',ok:l.age>=6,cost:0},
      {id:'travel',label:l.age<18?'和同学出去走走':'给自己一个短假',hint:'心情 +6，花费 '+(l.age<18?'100':'1,200')+' 元',ok:l.age>=12,cost:l.age<18?100:1200},
      {id:'skill',label:'上一门技能课',hint:'知识 +6，花费 2,000 元',ok:l.age>=18&&!l.retired,cost:2000},
      {id:'rest',label:'认真休息一天',hint:'健康 +2，心情 +4',ok:l.age>=6,cost:0}
    ].filter(x=>x.ok).map(x=>({...x,disabled:l.actions.some(a=>a.age===l.age)||x.cost>Math.max(0,l.savings)+(l.age<18?200:0)}));
  }
  function act(l,id,log){const o=actionOptions(l).find(o=>o.id===id);if(!o||o.disabled)return false;const s=l.stats;
    if(o.cost&&l.age>=18){l.savings-=o.cost;if(l.finances){l.finances.other=(l.finances.other||0)+o.cost;l.finances.expense+=o.cost;l.finances.balance-=o.cost;}}
    const effects={exercise:{health:3,happy:1},read:{know:3,happy:1},family:{social:4,happy:2},travel:{happy:6},skill:{know:6},rest:{health:2,happy:4}};
    for(const[k,v]of Object.entries(effects[id]))s[k]=Math.min(100,s[k]+v);
    const text={exercise:'你给自己留出时间活动身体，回来以后精神好了一点。',read:'你关掉手机，认真读了几页书，又学会了一点新东西。',family:'你和家人好好聊了一会儿。没有什么大事，但彼此都安心了一点。',travel:'你暂时离开熟悉的日常，出去走了走，带着一点新鲜感回来。',skill:'你报名上一门技能课，把学到的东西一点点用在生活和工作里。',rest:'你把能推迟的事暂时放下，认真休息了一天。'};
    l.actions.push({age:l.age,id,label:o.label});log(l,'action',text[id],'good');return true;}
  function achievements(l){const all=[
    ['first','一生的起点','完成出生，开始这一生',!!l.started],['graduate','书页翻到下一章','完成高等教育',/本科|大专|硕士/.test(l.eduDone||'')],
    ['away','去远方看看','曾经离开出生城市生活',l.trail.some(t=>t.pref!==l.birthPref||t.city!==l.birthCity)],['family','新的牵挂','迎来自己的孩子',l.kids.length>0],
    ['buffer','手里有一点余地','曾积攒 10 万元',l.peak.savings>=100000],['home','把灯留给自己','拥有一套住房',!!l.house],
    ['hobby','日子有自己的味道','发展了至少两种兴趣',l.hobbies.length>=2],['memoir','留一页给后来的人','整理了自己的回忆',!!l.flags.memoir],
    ['note','记住这一刻','为人生写下便签',l.notes.length>0],['long','和日子慢慢相处','活到 80 岁',l.age>=80]
    ];return all.map(([id,title,text,unlocked])=>({id,title,text,unlocked}));}
  G.CNLocal={init,normalize,addDecisions,housing,year,contextualStory,cityProfile,familyLabel,culture,actionOptions,act,achievements};
})(typeof window!=='undefined'?window:globalThis);
