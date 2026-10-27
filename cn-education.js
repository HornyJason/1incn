/* 高考 → 成绩 → 院校志愿 → 专业志愿 → 录取。各阶段分别保存，不在报到时再选专业。 */
(function(G){
  const tiers=[['985',640],['211',600],['一本',550],['二本',480],['三本',410],['专科',200]];
  function enterHighSchool(l){
    const publicAdmission=l.r.chance(Math.min(.95,.46+l.stats.know/180)),rich=l.wealth>.6;
    const privateAdmission=rich&&l.r.chance(publicAdmission?.18:.8);
    if(!publicAdmission&&!privateAdmission){l.edu.stage='voc';l.edu.label='中等职业学校';l.edu.school=l.city+'某职业学校';return '没有被理想的高中录取。你进入了一所职业学校，决定先学好一门技术。';}
    const type=privateAdmission?'私立高中':l.r.chance(Math.min(.4,.2+l.stats.know/200))?'重点高中':'普通高中';
    l.edu.stage='hs';l.edu.label=type;l.edu.school=l.city+'某'+type;l.edu.highSchool={type,bonus:type==='重点高中'?.05:type==='私立高中'?.03:0};
    return `你收到了${type}的录取通知书。${type==='私立高中'?'家里商量好学费，支持你继续读书。':'新课本比初中的厚了许多。'}`;
  }
  const admissionChance=(l,base)=>Math.min(.99,Math.max(0,base)+Math.max(0,Math.min(.05,l.edu.highSchool?.bonus||0)));
  function ensure(l){if(!l.edu.admission&&l.age===18&&!l.done.further)l.edu.admission={phase:'exam'};return l.edu.admission;}
  function arrival(l){
    if(l.stats.social<35||l.queer?.out.family==='strained')return '开学那天，你独自背着行李走进校门，把报到手续一项项办完。';
    const parents=[l.fam.father,l.fam.mother].filter(p=>p.alive);
    return parents.length===2?'开学那天，父母陪你走到宿舍楼下。临走时，他们红了眼眶，反复叮嘱你照顾好自己。':parents.length===1?`开学那天，${l.fam.father.alive?'父亲':'母亲'}帮你提着行李，走到校门口时又忍不住回头，眼里含着泪。`:'开学那天，你自己提着行李走进校门，先找到宿舍，再去食堂吃了第一顿饭。';
  }
  function decisions(l,{dec,opt}){
    const a=ensure(l);if(!a||a.phase==='done')return null;
    if(a.phase==='exam')return [dec(l,'further','六月，走进高考考场','你把准考证和文具放进透明袋。铃声响起，三年的准备落在面前的试卷上。',[
      opt('参加高考','考完后查询成绩',l=>{a.score=Math.round(Math.max(80,Math.min(740,l.r.norm(350+G.CNQueer.draw(l.seed,17291)*260+l.stats.know*5+(l.edu.stage==='hs'?25:-65),65))));a.phase='score';l.income=0;return `成绩公布了，你考了 ${a.score} 分。${a.score>=200?'接下来要认真看招生计划，选择院校和专业。':'你没有达到专科投档线，可以选择复读或先学一门技能。'}`;},4),
      opt('先学技能，准备就业','结束这一阶段的在校生活',l=>{a.phase='done';l.eduDone=l.edu.stage==='voc'?'中职':'高中';l.edu.stage='work';l.flags.gradAge=18;l.flags.jobType='skilled';return '你决定把一门手艺学扎实，再去寻找工作。';})])];
    if(a.phase==='score'&&a.score<200)return [dec(l,'examRetry','成绩之后，下一步怎么走？','这次的分数没有达到投档线。你可以再准备一年，也可以换一条路。',[
      opt('复读一年','明年重新参加高考',l=>{a.phase='repeat';a.retryAge=l.age+1;l.edu.stage='hs';return '你收起成绩单，重新买了一套复习资料。明年，再试一次。';}),
      opt('学习技能，开始找工作','进入招聘市场',l=>{a.phase='done';l.eduDone='高中';l.edu.stage='work';l.flags.gradAge=l.age;return '你开始学习技能，也留意起招聘信息。';},3)])];
    if(a.phase==='repeat'){if(l.age<a.retryAge)return null;return [dec(l,'examAgain_'+l.age,'又一次走进考场','你做完最后一张模拟卷，明天就要再一次走进考场。',[
      opt('认真答完每一道题','查询这一次的成绩',l=>{a.score=Math.round(Math.max(200,Math.min(740,l.r.norm(400+G.CNQueer.draw(l.seed,17291)*220+l.stats.know*5,60))));a.phase='score';return `这一次，你考了 ${a.score} 分。招生计划已经公布，可以开始填志愿了。`;})])];}
    if(a.phase==='score')return [dec(l,'collegeChoices','填报院校志愿',`高考 ${a.score} 分。你翻看招生计划，把分数、城市和学费放在一起比较。`,tiers.filter(t=>a.score>=t[1]-35).map(([tier,line])=>opt(`${tier}院校`,a.score>=line?'分数较有把握':'冲一冲，有落档的可能',l=>{a.wish=tier;a.line=line;a.phase='major';return `你在志愿表上填下了${tier}层次的院校，接下来选择想学的专业。`;},a.score>=line?3:1)).concat(opt('不填志愿，先去打工','结束在校学习，开始找工作',l=>{a.phase='done';l.eduDone=l.edu.stage==='voc'?'中职':'高中';l.edu.stage='work';l.edu.label='寻找新的工作';l.flags.gradAge=l.age;return '你把志愿表收好，决定先去工作。你整理了自己的经历，开始留意正在招聘的岗位。';})))];
    if(a.phase==='major')return [dec(l,'major','填报专业志愿','专业要和院校志愿一起提交。你查阅了课程内容，也认真想了想自己愿意学什么。',G.CN_DATA.majors.map(m=>opt(m.name,m.skill,l=>{l.flags.major=m.id;l.edu.major=m.name;a.phase='result';return `你填下了${m.name}方向，核对信息后提交了志愿。接下来等候录取消息。`;})))];
    if(a.phase==='result')return [dec(l,'admission','录取结果公布','你打开录取查询页面，输入准考证号。',[
      opt('查看录取结果','',l=>{const admitted=l.r.chance(admissionChance(l,a.score>=a.line?.94:.38));const index=tiers.findIndex(t=>t[0]===a.wish),tier=admitted?a.wish:tiers[Math.min(tiers.length-1,index+1)][0];l.edu.tier=tier;l.edu.school=`${tier==='专科'?'一所职业技术学院':tier+'院校'}`;l.edu.stage=tier==='专科'?'college':'univ';l.edu.label=tier==='专科'?'专科在读':'本科在读';l.flags.degree=tier==='专科'?'大专':'本科';l.flags.gradAge=l.age+(tier==='专科'?3:4);a.phase='done';return `${admitted?'你被填报的院校录取了':'第一志愿没有投上，你通过后续志愿被录取'}：${l.edu.school}，${l.edu.major}。${arrival(l)}`;})])];
    return null;
  }
  G.CNEducation={decisions,arrival,enterHighSchool,admissionChance};
})(typeof window!=='undefined'?window:globalThis);
