/* 半工半读升学：工资口径与考试、在读、毕业分开。 */
(function(G){
  const ranks=['高中','大专','本科','硕士','博士'];
  function rank(l){return Math.max(0,ranks.indexOf(l.eduDone||l.flags.degree));}
  function target(l){return ranks[Math.min(4,rank(l)+1)];}
  function normalize(l){const s=l.flags.furtherStudy;if(s&&!s.phase)s.phase='enrolled';return s;}
  function active(l){return !!normalize(l)||l.flags.studyReducedAge===l.age;}
  function begin(l){const targetDegree=target(l);l.flags.furtherStudy={phase:'prep',startAge:l.age,examAge:l.age+1,finishAge:l.age+4,target:targetDegree};return targetDegree;}
  function year(l,log){
    const s=normalize(l);if(!s)return;
    l.flags.studyReducedAge=l.age;
    if(l.age>s.startAge)l.stats.know+=1;
    if(s.phase==='enrolled'&&l.age>=s.finishAge){
      l.eduDone=s.target;l.flags.degree=s.target;l.flags.lastStudyDegree=s.target;delete l.flags.furtherStudy;
      log(l,'school',`你完成了半工半读的课程和毕业要求，取得了${s.target}学历。那些下班后赶去上课的晚上，终于有了回响。`,'good');
    }
  }
  function decisions(l,{dec,opt}){
    const s=normalize(l);if(!s||s.phase!=='prep'||l.age<s.examAge)return null;
    return [dec(l,'studyExam_'+s.startAge,'升学考试的结果出来了','你打开成绩和录取查询页面，手指在姓名旁停了一会儿。',[
      opt('查看结果','',l=>{const pass=l.r.chance(Math.min(.85,.25+l.stats.know*.006+rank(l)*.035));l.flags.studyReducedAge=l.age;if(!pass){delete l.flags.furtherStudy;return '这次没能进入录取名单。你收好复习资料，先把工作和生活安顿下来；以后还可以再试。';}s.phase='enrolled';s.finishAge=l.age+3;return `你被${s.target}阶段的非全日制学习项目录取了。接下来三年继续半工半读，完成课程和毕业要求后才能取得新的学历。期间工作收入按原岗位的七成领取。`;})
    ])];
  }
  G.CNStudy={rank,target,normalize,active,begin,year,decisions};
})(typeof window!=='undefined'?window:globalThis);
