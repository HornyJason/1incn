/* 基于 1injp 的种子随机数及人生状态结构扩展的中国现代模式。MIT，见 LICENSE。 */
(function (G) {
  const base = G.LifeEngine, D = G.CN_DATA;
  const clamp = (n,a=0,b=100) => Math.max(a,Math.min(b,n));
  const nameOf = l => l.name.sei+l.name.mei;
  const place = (pref,city) => pref===city+'市'?pref:pref+city+(city.endsWith('市')?'':'市');
  function attachR(l) {
    const raw = base.R(l.seed); for(let i=0;i<(l.rngCount||0);i++) raw();
    const r=()=>{l.rngCount=(l.rngCount||0)+1;return raw();};
    r.pick=a=>a[Math.floor(r()*a.length)]; r.int=(a,b)=>a+Math.floor(r()*(b-a+1)); r.chance=p=>r()<p;
    r.norm=(m=0,s=1)=>m+s*Math.sqrt(-2*Math.log(Math.max(r(),1e-12)))*Math.cos(2*Math.PI*r());
    r.wpick=(a,fn)=>{let x=r()*a.reduce((s,v)=>s+fn(v),0);return a.find(v=>(x-=fn(v))<=0)||a[a.length-1];};
    l.r=r; return l;
  }
  function log(l,c,t,tone='neutral',note='') {
    l.log.push({age:l.age,year:l.year,c,t,tone,note});
  }
  const province=n=>D.provinces.find(p=>p.name===n);
  function createLife(o={}) {
    const l=attachR({version:D.version,seed:o.seed>>>0,rngCount:0});const r=l.r;
    const p=province(o.pref)||r.wpick(D.provinces,p=>p.population),sex=o.sex||(r()<.515?'M':'F');
    const city=r.pick(p.cities),rural=r.chance(.34),wealth=r.norm(0,.65);
    const date=new Date(o.date||Date.now()),parentIncome=Math.round(D.national.disposableIncome*2.4*p.incomeFactor*Math.exp(wealth));
    Object.assign(l,{
      name:{sei:r.pick(D.surnames),mei:r.pick(D.given[sex])},sex,pref:p.name,city,birthPref:p.name,birthCity:city,
      born:{y:date.getFullYear(),m:date.getMonth()+1,d:date.getDate(),weight:clamp(r.norm(3.2,.4),1.8,4.5),place:rural?'县人民医院':'市妇幼保健院'},
      year:date.getFullYear(),age:0,alive:true,era:'modern',rural,wealth,
      stats:{health:clamp(r.norm(85,6)),happy:clamp(r.norm(74,8)),know:3,social:clamp(r.norm(50,9))},
      fam:{father:{name:r.pick(D.parentNames.M),age0:r.int(26,36),alive:true,job:{title:r.pick(['技术工人','企业职员','个体经营者','物流从业者'])}},mother:{name:r.pick(D.parentNames.F),age0:r.int(24,34),alive:true,job:{title:r.pick(['企业职员','社区工作人员','商店经营者','医护人员'])}},parentHH:parentIncome,home:rural?'乡镇自建房':r.pick(['城市租住房','普通商品房','老小区住房']),siblings:[]},
      edu:{stage:'baby',school:'',label:'婴儿',level:''},eduDone:'',job:null,jobHist:[],income:0,savings:0,debt:0,
      focus:'平衡',flags:{},done:{},log:[],snaps:[],notes:[],kids:[],spouse:null,partner:null,retired:false,
      house:null,healthCondition:null,hobbies:[],peak:{income:0,savings:0},nisa:0,choices:[],trail:[{age:0,pref:p.name,city}]
    });
    log(l,'birth',`${l.born.y} 年 ${l.born.m} 月 ${l.born.d} 日，你出生在${place(p.name,city)}${rural?'附近的一个乡镇':''}。${sex==='M'?'男孩':'女孩'}，${l.born.weight.toFixed(2)} 公斤。`,'good','地区抽样按第七次人口普查的各省常住人口加权；城市、城乡和家庭情况为游戏抽样。');
    log(l,'family',`你和父母住在${l.fam.home}里。这个家庭的年收入约为${money(parentIncome)}。`,'neutral','家庭收入由全国人均可支配收入和游戏设定的家庭人数、地区系数及随机差异生成，不是该省的官方收入。');
    if(r.chance(.33)) l.fam.siblings.push({name:r.pick(D.given[r.chance(.5)?'M':'F']),age:r.int(2,7)});
    G.CNLocal.init(l);
    snapshot(l);return l;
  }
  const money=n=>Math.abs(n)>=10000?(n/10000).toLocaleString('zh-CN',{maximumFractionDigits:1})+'万元':Math.round(n).toLocaleString('zh-CN')+'元';
  const opt=(label,hint,apply,w=1)=>({label,hint:hint.replace(/知识 \+(\d+)/g,(_,n)=>'知识 +'+Math.max(1,Math.round(Number(n)*.4))),apply,w});
  function getJob(l,type,preferred) {
    const major=D.majors.find(m=>m.id===l.flags.major);
    const [title,k]=preferred||(type==='college'&&major?major.job:l.r.pick(D.jobs[type]));
    l.flags.livesWithParents=false;l.flags.flexible=false;
    l.job={title,kind:type,sector:'private',sinceAge:l.age,salaryHistory:[]};l.edu.stage='work';
    l.income=Math.round(D.national.disposableIncome*k*province(l.pref).incomeFactor*Math.exp(l.r.norm(0,.18)));
    l.job.salaryHistory=[l.income];
    l.jobHist.push({age:l.age,title,income:l.income});
    log(l,'work',`你成为一名${title}，第一年的收入约为${money(l.income)}。`,'good');
  }
  function dec(l,id,title,text,options) {
    return {id,title,text,options:options.map((o,i)=>({...o,i}))};
  }
  function pendingDecisions(l) {
    if(!l.alive)return [];
    const a=l.age,s=l.stats;
    const career=G.CNCareer?.decisions(l,{dec,opt,log,getJob});if(career)return career;
    const queer=G.CNQueer.decisions(l,{dec,opt,log,getJob});if(queer)return queer;
    const extra=G.CNLocal.addDecisions(l,{dec,opt,log,getJob});if(extra)return extra;
    if(a===10&&!l.done.interest)return [dec(l,'interest','课本之外，你想试试什么？','放学后的时间很有限。你开始发现，自己也可以拥有一种喜欢的生活。',[
      opt('参加运动社团','健康 +6，认识新朋友',l=>{l.hobbies.push('运动');s.health+=6;s.social+=4;return '你加入了学校的运动社团。操场上多了几位会叫你名字的朋友。';}),
      opt('去图书馆','知识 +8',l=>{l.hobbies.push('阅读');s.know+=8;return '你办了一张借书证。那个暑假，你读了很多课本以外的书。';}),
      opt('学画画或音乐','心情 +7，知识 +3',l=>{l.hobbies.push('艺术');s.happy+=7;s.know+=3;return '你开始学一门艺术。第一次完成作品时，家人认真地看了很久。';})])];
    if(a===15&&!l.done.zhongkao)return [dec(l,'zhongkao','中考后，去哪里？','九年义务教育结束。你的兴趣、成绩和家庭条件，都会影响接下来的路。这里的录取结果由游戏模型生成。',[
      opt('争取普通高中','继续准备高考；结果受知识与随机因素影响',l=>{const pass=l.r.chance(clamp(.46+s.know/180,.25,.95));l.edu.stage=pass?'hs':'voc';l.edu.label=pass?'普通高中':'中等职业学校';l.edu.school=l.city+(pass?'某高中':'某职业学校');s.know+=3;return pass?'你收到了高中录取通知书。新课本比初中的厚了许多。':'没有被理想的高中录取。你进入了一所职业学校，决定先学好一门技术。';},2),
      opt('选择职业学校','学习技能，毕业后可就业或继续升学',l=>{l.edu.stage='voc';l.edu.label='中等职业学校';l.edu.school=l.city+'某职业学校';s.know+=5;return '你进入职业学校，第一次在实训课上亲手操作设备。';}),
      opt('暂缓升学，先学技能','在家庭支持下学习；成年后再正式就业',l=>{l.edu.stage='training';l.edu.label='技能学习';l.edu.school='技能培训';l.flags.earlySkill=true;s.happy+=3;return '你开始学习一门手艺。未来还很长，你准备先找到自己的立足点。';})])];
    if(a===18&&!l.done.further)return [dec(l,'further',l.edu.stage==='hs'?'高考后的选择':'下一步的选择','成年以后，人生里可以自己决定的事情，似乎一下子多了起来。',[
      opt('争取读大学','模拟录取；可能进入本科或高职',l=>{let uni=l.r.chance(clamp(.38+s.know/160,.25,.92));l.edu.stage=uni?'univ':'college';l.edu.label=uni?'本科在读':'高职在读';l.edu.school='某'+(uni?'大学':'职业技术学院');l.flags.gradAge=uni?22:21;l.flags.degree=uni?'本科':'大专';l.income=0;s.know+=8;return uni?'你拿到了一封大学录取通知书。整理行李时，家人往箱子里塞了很多吃的。':'你被一所高职院校录取。你选了一个有实训课程的专业，准备从技能开始。';},l.edu.stage==='hs'?3:1),
      opt('把技能学扎实，准备就业','成年后进入技能岗位',l=>{l.eduDone='中职';l.flags.gradAge=18;l.flags.jobType='skilled';s.know+=3;return '你完成了技能学习，开始投简历、参加面试。';}),
      opt('直接找一份工作','更早积累收入和社会经验',l=>{l.eduDone='高中及以下';l.flags.gradAge=18;l.flags.jobType='basic';s.social+=4;return '你决定先就业。第一次自己写简历时，你在“工作经验”那一栏停了很久。';})])];
    if(a>=18&&a>=(l.flags.gradAge||99)&&!l.job&&!l.done.jobEntry)return [dec(l,'jobEntry','第一份正式工作','学习生活告一段落，你开始认真选择自己的第一份工作。薪资是游戏估算。',[
      opt('找一份专业相关的工作','收入与学历、地区和岗位有关',l=>{l.eduDone=l.flags.degree||l.eduDone||'中职';getJob(l,l.flags.jobType||(/本科|硕士/.test(l.eduDone)?'college':'skilled'));return '第一次上班，你比约定时间早到了半小时。';},3),
      opt('找一份离家近的工作','收入略低，家人关系 +8',l=>{l.eduDone=l.flags.degree||l.eduDone||'中职';getJob(l,'skilled');l.flags.livesWithParents=true;l.income*=.88;s.social+=8;return '你留在了熟悉的城市。晚饭时，家里又多了一双筷子。';}),
      opt('去大城市闯一闯','迁居，收入机会和生活成本一起增加',l=>{l.eduDone=l.flags.degree||l.eduDone||'中职';const p=l.r.pick(D.provinces.filter(p=>p.incomeFactor>1.2));l.pref=p.name;l.city=p.cities[0];l.trail.push({age:a,pref:l.pref,city:l.city});l.migrated=true;getJob(l,l.flags.jobType||(/本科|硕士/.test(l.eduDone)?'college':'skilled'));s.happy-=3;return `你拖着行李来到${l.city}。第一晚的出租屋有点小，但窗外很亮。`;})])];
    if(a>=25&&a<=29&&!l.done.social)return [dec(l,'social','工作之外，也留一点时间','你在周末收到朋友的邀约。生活似乎不应该只有上班和下班。',[
      opt('多认识一些朋友','关系 +8，有机会遇见伴侣',l=>{s.social+=8;if(l.r.chance(.8)){l.partner={name:l.r.pick(D.surnames)+l.r.pick(D.given[G.CNQueer.partnerSex(l)]),sex:G.CNQueer.partnerSex(l),ageDiff:0};return `你认识了${l.partner.name}。从一起吃饭，到互相分享平凡的一天，你们慢慢熟悉起来。`;}return '你认识了几位新朋友。暂时没有爱情，但周末不再总是一个人。';},2),
      opt('把时间留给自己','心情 +7，发展兴趣',l=>{s.happy+=7;l.hobbies.push('旅行');return '你开始安排自己的周末，去徒步、看展，也学着好好做一顿饭。';}),
      opt('专注事业一阵子','知识 +5，收入 +8%',l=>{s.know+=5;l.income*=1.08;return '你把精力放在了工作上，也学会提醒自己按时吃饭。';})])];
    if(a>=28&&l.partner&&l.partner.sex!==l.sex&&!l.done.marriage)return [dec(l,'marriage','要一起走下去吗？',`你和${l.partner.name}开始谈论共同的未来。`,[
      opt('决定结婚','建立家庭，积蓄用于共同生活',l=>{l.spouse={...l.partner};l.partner=null;l.savings-=Math.min(Math.max(0,l.savings),20000);s.happy+=10;s.social+=6;return `你和${l.spouse.name}领了结婚证。你们商量，先把自己的小日子过好。`;},2),
      opt('先保持现在的关系','继续相处，尊重彼此节奏',l=>{s.happy+=3;return '你们决定暂时不结婚。彼此都觉得，认真相处比赶时间更重要。';}),
      opt('选择不同的生活','结束关系，重新出发',l=>{l.partner=null;s.happy-=5;return '你们平静地道了别。你还是会想起对方，但也开始重新安排自己的生活。';})])];
    if(a>=28&&l.partner&&l.partner.sex===l.sex&&!l.done.commitment)return [dec(l,'commitment','怎样继续两个人的生活？',`你和${l.partner.name}开始谈论共同的未来。你们可以选择承诺、继续相处或告别。`,[
      opt('成为长期伴侣，一起生活','共同生活与开支；记录为伴侣承诺',l=>{l.spouse={...l.partner,union:'partnership'};l.partner=null;s.happy+=10;s.social+=6;return `你和${l.spouse.name}决定长期相伴，认真商量住处、共同开支和彼此的照料。`;},2),
      opt('保持交往，慢慢来','尊重彼此节奏',l=>'你们决定继续相处，让承诺在日常里慢慢生长。'),
      opt('结束这段关系','诚实告别，各自出发',l=>{l.partner=null;s.happy-=3;return '你们诚实地谈过，然后选择了不同的生活。';})])];
    if(a>=31&&l.spouse&&l.spouse.sex!==l.sex&&!l.done.children)return [dec(l,'children','关于孩子，你们的决定','你们认真讨论了时间、照料分工和家庭开支。每一种选择，都有自己的生活。',[
      opt('尝试迎接一个孩子','增加家庭开支，建立新的关系',l=>{if(l.r.chance(.85)){const sex=l.r.chance(.5)?'M':'F';const child={name:l.name.sei+l.r.pick(D.given[sex]),sex,birthAge:l.age};l.kids.push(child);s.happy+=9;return `孩子${child.name}来到你们身边。家里多了奶瓶、玩具，也多了一种牵挂。`;}return '你们暂时没有迎来孩子，决定先照顾好彼此，按照自己的节奏生活。';},2),
      opt('暂时不要孩子','更多时间与财务空间',l=>{s.happy+=4;return '你们决定先过好两个人的生活，把时间留给工作、旅行和彼此。';})])];
    if(a>=38&&l.job&&!l.done.career)return [dec(l,'career','到了职业的岔路口','几年工作之后，你更了解自己的能力，也开始重新衡量想过的生活。',[
      opt('争取晋升','有机会涨薪，也增加工作压力',l=>{if(G.CNQueer.blocked(l))return '在本局的这个单位里，公开身份后的歧视让这次晋升没有进入评审。你开始考虑争取支持或更换工作环境。';if(l.r.chance(.62)){l.income*=1.32;s.happy+=4;return '你争取到了一个更有责任的岗位。收入涨了，需要处理的事情也更多了。';}s.health-=3;return '这次没有成功晋升。你给自己放了几天假，重新整理下一步的打算。';}),
      opt('学习一项新技能','积蓄 -8,000 元，知识 +12',l=>{l.savings-=8000;s.know+=12;l.income*=1.12;return '你下班后去上课。重新做学生很累，但你找回了一点久违的好奇心。';},2),
      opt('保持现在的节奏','健康 +5，关系 +5',l=>{s.health+=5;s.social+=5;return '你没有换工作，而是开始认真保护下班后的时间。';})])];
    if(a>=42&&!l.done.housing)return [G.CNLocal.housing(l,{dec,opt})];
    if(a>=60&&!l.done.retirement)return [dec(l,'retirement','慢一点，也可以','你开始考虑未来几年的工作安排。这里是游戏中的个人选择，不代表法定退休规则。',[
      opt('逐步退休，留出生活','收入改为简化养老收入，健康 +7',l=>{l.retired=true;l.job=null;l.income=Math.round(22000*province(l.pref).incomeFactor);s.health+=7;s.happy+=6;return '你慢慢放下了工作，把早晨留给散步，把下午留给喜欢的事。';},2),
      opt('再工作几年','65 岁结束全职工作',l=>{l.flags.retireAt=65;s.know+=3;return '你决定再工作几年，也开始培养能够接手的年轻同事。';})])];
    if(a>=72&&!l.done.later)return [dec(l,'later','晚年的日常，想怎样安排？','比起“还有多少时间”，你现在更在意“想和谁一起、怎样度过”。',[
      opt('和家人多相处','关系 +10，心情 +6',l=>{s.social+=10;s.happy+=6;return '你和家人约好，每隔一阵就坐下来吃一顿饭。饭菜不复杂，话却总是说不完。';},2),
      opt('把兴趣继续下去','知识 +6，心情 +8',l=>{s.know+=6;s.happy+=8;return '你参加了社区的兴趣活动。认识新朋友、学新东西，原来从来不嫌晚。';}),
      opt('整理一份人生记录','留下自己的故事',l=>{s.happy+=8;l.flags.memoir=true;return '你整理老照片，把一路上的人和事写了下来。有些名字，写着写着就笑了。';})])];
    return [];
  }
  function resolve(l,d,i) {
    if(l.done[d.id])return;const o=d.options.find(o=>o.i===i);if(!o)throw new Error('无效选择');
    l.done[d.id]=true;l.choices.push({age:l.age,id:d.id,option:i,label:o.label});
    const before=l.savings,booked=l.finances?.balance||0,oldKnow=l.stats.know;const t=o.apply(l);if(l.stats.know>oldKnow)l.stats.know=oldKnow+Math.max(1,Math.round((l.stats.know-oldKnow)*.4));G.CNLocal.normalize(l);
    if(l.finances&&l.finances.year===l.year){const extra=before-l.savings+(l.finances.balance-booked);l.finances.other=(l.finances.other||0)+extra;l.finances.expense+=extra;l.finances.balance-=extra;}
    if(t)log(l,'choice',t,'choice');clampStats(l);snapshot(l);
  }
  const autoChoice=(l,d)=>l.r.wpick(d.options,o=>Math.max(0,o.w)).i;
  function clampStats(l){for(const k in l.stats)l.stats[k]=clamp(l.stats[k]);l.income=Math.round(Math.max(0,l.income));l.savings=Math.round(l.savings);l.debt=Math.round(Math.max(0,l.debt));}
  const stories={
    baby:['家人给你拍了一张照片，还认真地写下了日期。','你和家人在小区里转了一圈，在一棵大树旁停了下来。','春节时，家人抱着你在窗边看街上的灯光。','你有了一件走到哪里都要带着的小玩具。','家人把你照顾得妥妥当当，也慢慢学会了读懂你的表情。'],
    child:['你在课间和同学玩游戏，直到上课铃响才跑回教室。','你背着书包回家，路过的小店飘出烤红薯的香味。','你在班级活动里完成了自己的任务，有人认真地夸了你。','家人带你坐了一次高铁，你看了一路的田野和房子。','中秋节，大家把月饼切成小块，坐在一起聊家常。','一个下雨的放学日，你看见家人撑着伞站在校门口。','你和朋友约好，长大以后也要经常见面。'],
    teen:['晚自习结束，你和同学一边走一边聊未来。','你第一次觉得，有些烦恼不一定能马上告诉家人。','运动会那天，你为朋友喊到嗓子都哑了。','你在旧书里发现一张很久以前写下的纸条。','一次考试没有发挥好，老师和你一起分析了错题。','毕业合照里，大家笑得有点拘谨，又有点舍不得。','你在夜里听完一张专辑，好像有人说出了你的心事。'],
    young:['你第一次自己交水电费，忽然有了一点长大的实感。','你和朋友在路边吃了一顿夜宵，聊到店家准备收摊。','你在手机上抢到了回家的车票。','你学会了一道家常菜，拍照发进家庭群。','有一天你准时下班，发现傍晚的天空很好看。','你给家人打电话，问起一件小时候总觉得普通的小事。','你坐上去往另一座城市的高铁，开始一次短暂旅行。','你学会把一部分收入存下来，给自己多一点选择。'],
    adult:['春节的团圆饭上，你发现自己已经坐到了照顾别人的位置。','你在忙碌中抽出半天，去见一位很久没见的朋友。','你清理手机相册，看到几年前的自己。','晚饭后，你和家人在楼下慢慢散步。','你开始认真看体检报告，也开始少熬一点夜。','你在超市挑了半天菜，回家做了一顿还不错的晚饭。','老同学聚会时，有人笑着讲起以前的糗事。','你修好了一件用了很多年的东西，不舍得就这样丢掉。'],
    old:['早晨，你和邻居在公园里打了个招呼。','你翻开旧相册，有些细节比想象中还清楚。','天气好时，你坐在窗边晒太阳，读完几页书。','家里人发来一张近照，你放大了看了很久。','你把拿手菜的做法告诉了晚辈，叮嘱他们火别开太大。','你和老朋友喝茶，聊起年轻时去过的地方。','你记住了今天路边开着的花，想着明天再去看看。']
  };
  function qx(sex,a){if(a===0)return .0028;if(a<15)return .00012;return Math.min(.96,1-Math.exp(-(sex==='M'?.000024:.000016)*Math.exp(a/10)));}
  function step(l){
    if(!l.alive||pendingDecisions(l).length)return false;
    const r=l.r,s=l.stats;l.age++;l.year=l.born.y+l.age;const a=l.age,openingSavings=l.savings;
    if(a===3){l.edu.label='幼儿园';log(l,'school','你进入幼儿园。第一次和家人分别时有点不舍，后来慢慢交到了朋友。','good');}
    if(a===6){l.edu={stage:'elem',label:'小学',school:l.city+'某小学'};log(l,'school','你背着新书包走进小学，开始了自己的学生时代。','good');}
    if(a===12){l.edu={stage:'jhs',label:'初中',school:l.city+'某中学'};log(l,'school','你进入初中，科目变多了，也开始有自己的小秘密。','good');}
    if(a>=6&&a<18)s.know+=Math.max(0,r.norm(l.focus==='学习'?1.15:.75,.5))*clamp(1-s.know/130,.25,1);
    if(['univ','college','grad'].includes(l.edu.stage)&&a<=(l.flags.gradAge||22))s.know+=Math.max(0,r.norm(.9,.35));
    if(a>=25&&l.focus!=='学习'&&!l.flags.furtherStudy)s.know-=.2+(s.know>60?.15:0);
    if(a===(l.flags.gradAge||-1))log(l,'school',`你完成了${l.flags.degree||'技能'}学习，站在新的起点。`,'good');
    if(l.job&&!l.retired){G.CNCareer?.year(l,log);if(r.chance(.045)){const cost=r.int(1000,7000);l.savings-=cost;log(l,'money',`计划外的支出让你花了${money(cost)}，你重新调整了这一年的预算。`,'neutral');}}
    if(l.flags.retireAt&&a>=l.flags.retireAt&&!l.retired){l.retired=true;l.job=null;l.income=Math.round(24000*province(l.pref).incomeFactor);log(l,'work','你结束了全职工作。第一次不用定闹钟的周一，还是醒得很早。','good');}
    G.CNLocal.year(l,{log});
    for(const p of [l.fam.father,l.fam.mother])if(p.alive&&r.chance(qx(p===l.fam.father?'M':'F',p.age0+a))){p.alive=false;p.deathAge=p.age0+a;s.happy-=12;log(l,'family',`${p===l.fam.father?'父亲':'母亲'}${p.name}去世了。你慢慢理解，有些陪伴会用另一种方式留在生活里。`,'bad');}
    for(const child of l.kids){const ca=a-child.birthAge;if([3,6,12,18,22].includes(ca))log(l,'family',`${child.name}${ca===3?'上幼儿园':ca===6?'上小学':ca===12?'上初中':ca===18?'成年':'开始自己的工作和生活'}了。你发现，时间真的过得很快。`,'good');}
    const group=a<6?'baby':a<13?'child':a<19?'teen':a<35?'young':a<62?'adult':'old';
    const pool=stories[group].filter(t=>!l.log.some(e=>e.t===t&&a-e.age<7));
    if(pool.length&&r.chance(.84)){log(l,group==='baby'?'family':'story',G.CNLocal.contextualStory(l,group,pool));s.happy+=r.norm(.8,1.2);}
    if(a>=30&&r.chance(.035)){s.health-=r.int(3,10);l.savings-=r.int(500,5000);log(l,'health','身体发出了一点提醒。你去医院做了检查，接下来准备认真休息、调整作息。','bad');}
    if(a>=45)s.health-=.65+(a-45)*.012;
    for(const [k,v] of Object.entries(l.age>=6?D.focus[l.focus]||{}:{}))s[k]+=v;
    s.happy+=(65-s.happy)*.075+r.norm(0,1);s.social+=(55-s.social)*.04;
    if(l.finances){const other=Math.round(openingSavings+l.finances.balance-l.savings);l.finances.other=(l.finances.other||0)+other;l.finances.expense+=other;l.finances.balance-=other;}
    clampStats(l);l.peak.income=Math.max(l.peak.income,l.income);l.peak.savings=Math.max(l.peak.savings,l.savings);
    if(a>=115||r.chance(qx(l.sex,a)*clamp(1+(60-s.health)/110,.65,1.9))){l.alive=false;l.deathAge=a;l.deathCause=a>=75?'生命自然走到了终点':'因疾病或意外离世';log(l,'death',`${l.year} 年，你的人生在 ${a} 岁这一年结束。${a>=75?'那些普通的日子，也是一生。':'有些路还没来得及走，但你留下的陪伴与记忆仍在。'}`,'neutral','寿命使用简化的年龄风险模型，尚未按中国生命表校准；不代表个人寿命预测。');}
    snapshot(l);return true;
  }
  function snapshot(l){l.snaps[l.age]={age:l.age,health:Math.round(l.stats.health),happy:Math.round(l.stats.happy),know:Math.round(l.stats.know),social:Math.round(l.stats.social),savings:l.savings,pref:l.pref};}
  function statusLabel(l){if(!l.alive)return l.playback?'回望这一年':`${l.deathAge} 岁 · ${l.deathCause}`;if(l.retired)return '退休生活';if(l.job)return l.job.title;if(l.employment?.search)return '寻找新的工作';if(l.age<3)return '在家人的照顾下长大';if(l.edu.stage==='elem')return `小学 ${Math.min(6,l.age-5)} 年级`;if(l.edu.stage==='jhs')return l.age<15?`初中 ${l.age-11} 年级`:'中考后的路口';return l.edu.label||'寻找下一步';}
  function runAuto(l,maxAge=120){for(let n=0;l.alive&&l.age<maxAge&&n<1000;n++){let ds=pendingDecisions(l);if(ds.length){for(const d of ds)resolve(l,d,autoChoice(l,d));}else step(l);}return l;}
  function serialize(l){return JSON.parse(JSON.stringify(l,(k,v)=>k==='r'?undefined:v));}
  function hydrate(x){
    const fail=()=>{throw new Error('存档格式或版本不受支持，请选择本游戏导出的 JSON 记录。');};
    if(!x||!['cn-0.1.0','cn-0.2.0',D.version].includes(x.version)||!Number.isInteger(x.seed)||x.seed<0||x.seed>4294967295||!Number.isInteger(x.rngCount)||x.rngCount<0||x.rngCount>100000||!province(x.pref)||!province(x.birthPref))fail();
    if(!x.name||typeof x.name.sei!=='string'||typeof x.name.mei!=='string'||!x.name.sei.trim()||!x.name.mei.trim()||x.name.sei.length>4||x.name.mei.length>8||!['M','F'].includes(x.sex))fail();
    if(!Number.isInteger(x.age)||x.age<0||x.age>115||typeof x.alive!=='boolean'||!x.born||!Number.isInteger(x.born.y)||x.born.y<1900||x.born.y>2100||x.year!==x.born.y+x.age||(!x.alive&&x.deathAge!==x.age))fail();
    if(!x.stats||['health','happy','know','social'].some(k=>!Number.isFinite(x.stats[k])||x.stats[k]<0||x.stats[k]>100)||!Number.isFinite(x.savings)||Math.abs(x.savings)>1e12||!Number.isFinite(x.income)||x.income<0||x.income>1e10||!Number.isFinite(x.debt)||x.debt<0||x.debt>1e12)fail();
    if(!Array.isArray(x.log)||x.log.length>5000||x.log.some(e=>!e||typeof e.t!=='string'||e.t.length>3000||!Number.isInteger(e.age)||e.age<0||e.age>x.age)||!Array.isArray(x.snaps)||!Array.isArray(x.kids)||x.kids.length>20||!Array.isArray(x.notes)||x.notes.length>500||!Array.isArray(x.choices)||x.choices.length>500||!Array.isArray(x.trail)||x.trail.length>200)fail();
    const text=v=>typeof v==='string'&&v.length<=3000,list=(v,max,check)=>Array.isArray(v)&&v.length<=max&&v.every(check);
    for(const c of x.choices){
      if(!c||typeof c.id!=='string'||typeof c.label!=='string')fail();
      const p=c.presentation;if(p==null)continue;
      if(!['letter','line','call','mail','exam','sign','notice','payslip','sheet'].includes(p.kind)||!text(p.title)||!text(p.text)||!text(p.name)||!text(p.surname)||!Number.isInteger(p.age)||p.age<0||p.age>x.age||p.year!==x.born.y+p.age||!list(p.options,20,o=>o&&Number.isInteger(o.i)&&text(o.label)&&text(o.hint)))fail();
      if(['from','doc','head','sub'].some(k=>p[k]!=null&&!text(p[k]))||['msgs','terms'].some(k=>p[k]!=null&&!list(p[k],20,text))||p.result!=null&&!list(p.result,100,e=>e&&text(e.t))||p.replies!=null&&!list(p.replies,20,r=>r&&text(r.say)&&text(r.reply)))fail();
    }
    if(!x.fam||!x.fam.father||!x.fam.mother||!Array.isArray(x.fam.siblings)||!x.edu||!x.done||typeof x.done!=='object'||!x.flags||typeof x.flags!=='object'||!x.peak||!Array.isArray(x.hobbies)||typeof x.city!=='string'||typeof x.birthCity!=='string')fail();
    const finite=(n,a,b)=>Number.isFinite(n)&&n>=a&&n<=b;
    if([x.fam.father,x.fam.mother].some(p=>!finite(p.age0,14,65)||typeof p.name!=='string'||typeof p.alive!=='boolean'||!p.job||typeof p.job.title!=='string'))fail();
    if(x.kids.some(k=>typeof k.name!=='string'||!Number.isInteger(k.birthAge)||k.birthAge<18||k.birthAge>x.age)||x.trail.some(t=>!province(t.pref)||typeof t.city!=='string'||!Number.isInteger(t.age)||t.age<0||t.age>x.age)||x.notes.some(n=>typeof n.t!=='string'||n.t.length>300)||x.snaps.some(s=>s&&(!finite(s.age,0,x.age)||!finite(s.health,0,100)||!finite(s.happy,0,100))))fail();
    if(!Number.isInteger(x.born.m)||x.born.m<1||x.born.m>12||!Number.isInteger(x.born.d)||x.born.d<1||x.born.d>31||!finite(x.fam.parentHH,0,1e11)||!finite(x.peak.income,0,1e11)||!finite(x.peak.savings,0,1e12)||!Array.isArray(x.jobHist)||x.jobHist.length>300)fail();
    if(x.jobHist.some(j=>!j||typeof j.title!=='string'||!finite(j.income,0,1e11)||!Number.isInteger(j.age)||j.age<0||j.age>x.age)||x.hobbies.some(h=>typeof h!=='string'||h.length>100)||x.fam.siblings.some(p=>!p||typeof p.name!=='string'||!finite(p.age,0,30)))fail();
    if(x.job&&(typeof x.job.title!=='string'||typeof x.job.kind!=='string'))fail();
    if(x.job?.salaryHistory&&(!Array.isArray(x.job.salaryHistory)||x.job.salaryHistory.length>12||x.job.salaryHistory.some(n=>!finite(n,0,1e10))))fail();
    if(x.employment){const e=x.employment;if(!Array.isArray(e.history)||e.history.length>500)fail();if(e.search&&(!finite(e.search.since,0,x.age)||!finite(e.search.previousIncome,0,1e10)||typeof e.search.kind!=='string'))fail();if(e.pending&&(!finite(e.pending.age,0,x.age)||!finite(e.pending.monthly,0,1e10)||!finite(e.pending.due,0,1e12)||!finite(e.pending.years,1,115)||typeof e.pending.withheld!=='boolean'))fail();}
    if(x.playback&&(!Number.isInteger(x.playback.start)||!Number.isInteger(x.playback.end)||x.playback.start<0||x.playback.end<x.playback.start||x.playback.end>x.log.length||x.playback.age!==x.age||!finite(x.playback.progress,0,1)))fail();
    if(x.flags.furtherStudy&&(!finite(x.flags.furtherStudy.startAge,18,115)||!finite(x.flags.furtherStudy.finishAge,x.flags.furtherStudy.startAge+1,118)||!['大专','本科','硕士'].includes(x.flags.furtherStudy.target)))fail();
    if([x.partner,x.spouse].some(p=>p&&(typeof p.name!=='string'||p.name.length>40)))fail();
    if(x.actions&&(!Array.isArray(x.actions)||x.actions.length>116||x.actions.some(a=>!a||typeof a.id!=='string'||!Number.isInteger(a.age)||a.age<0||a.age>x.age)))fail();
    if(x.origin&&(typeof x.origin.settlement!=='string'||typeof x.origin.family!=='string'))fail();
    if(x.studentDebt!=null&&!finite(x.studentDebt,0,1e12))fail();
    if(x.mortgage&&(!finite(x.mortgage.balance,0,1e12)||!finite(x.mortgage.rate,0,.2)||!finite(x.mortgage.annualPayment,0,1e10)||!finite(x.mortgage.yearsLeft,0,50)))fail();
    if(x.properties&&(!Array.isArray(x.properties)||x.properties.length>5||x.properties.some(p=>!p||typeof p.id!=='string'||typeof p.name!=='string'||!province(p.pref)||typeof p.city!=='string'||!['self','rent','vacant'].includes(p.use)||!finite(p.value,0,1e11)||!finite(p.purchasePrice,1,1e11)||p.loan&&(!finite(p.loan.balance,0,1e12)||!finite(p.loan.rate,0,.2)||!finite(p.loan.annualPayment,0,1e10)||!finite(p.loan.yearsLeft,0,50)))||new Set(x.properties.map(p=>p.id)).size!==x.properties.length))fail();
    if(x.car&&(typeof x.car.name!=='string'||!finite(x.car.value,0,1e9)||!finite(x.car.purchasePrice,1,1e9)))fail();
    if(x.assetHistory&&(!Array.isArray(x.assetHistory)||x.assetHistory.length>2000||x.assetHistory.some(a=>typeof a.text!=='string'||!finite(a.delta,-1e12,1e12))))fail();
    if(x.queer&&(typeof x.queer.enabled!=='boolean'||!['self','admirer'].includes(x.queer.type)||!['gay','straight'].includes(x.queer.orientation)||!x.queer.out||Object.entries(x.queer.out).some(([k,v])=>!['friends','family','work'].includes(k)||!['support','strained'].includes(v))||x.queer.pending!=null&&!['friends','family','work'].includes(x.queer.pending)))fail();
    x.version=D.version;G.CNLocal.normalize(x);return attachR(x);
  }
  function act(l,id){const ok=G.CNLocal.act(l,id,log);if(ok){clampStats(l);snapshot(l);}return ok;}
  function transact(l,action,args){const result=['study','moveCity'].includes(action)?G.CNLocal.spend(l,action,args,log):G.CNAssets.transact(l,action,args,log);if(result.ok){clampStats(l);snapshot(l);}return result;}
  function peers(l,maxAge=120){return Array.from({length:5},(_,i)=>{const date=`${l.born.y}-${String(l.born.m).padStart(2,'0')}-${String(l.born.d).padStart(2,'0')}T12:00:00+08:00`;return runAuto(createLife({seed:(l.seed+Math.imul(i+1,2654435761))>>>0,date}),maxAge);});}
  G.CNEngine={transact,assetOptions:G.CNAssets.options,assetTotals:G.CNAssets.totals,privateOptions:G.CNQueer.options,requestPrivate:G.CNQueer.request,createLife,step,pendingDecisions,resolve,autoChoice,runAuto,serialize,hydrate,statusLabel,money,nameOf,province,place,qx,act,peers,actionOptions:G.CNLocal.actionOptions,achievements:G.CNLocal.achievements,cityProfile:G.CNLocal.cityProfile,supportedVersions:['cn-0.1.0','cn-0.2.0',D.version],version:D.version};
})(typeof window !== 'undefined' ? window : globalThis);
