/* 低频酷儿叙事。3% 是每局支线开关，不是现实人口比例。 */
(function(G){
  function draw(seed,salt){let x=(seed^salt)>>>0;x=Math.imul(x^(x>>>16),0x7feb352d);x=Math.imul(x^(x>>>15),0x846ca68b);return ((x^(x>>>16))>>>0)/4294967296;}
  function normalize(l){
    if(!l.queer){const enabled=draw(l.seed,0x9148f37)<.03,type=draw(l.seed,0x614af02)<2/3?'self':'admirer';
      l.queer={enabled,type,orientation:enabled&&type==='self'&&!l.partner&&!l.spouse?'gay':'straight',out:{},pending:null};
      if(enabled&&l.queer.orientation==='straight')l.queer.type='admirer';
    }
    for(const p of [l.partner,l.spouse])if(p&&!p.sex)p.sex=l.sex==='M'?'F':'M';
    return l.queer;
  }
  const partnerSex=l=>normalize(l).orientation==='gay'?l.sex:l.sex==='M'?'F':'M';
  const civil=l=>!!l.job&&(l.job.sector==='civil'||/公务员|基层公共服务岗位/.test(l.job.title));
  const blocked=l=>civil(l)&&!!normalize(l).out.work;
  function options(l){const q=normalize(l);if(!l.alive||!q.enabled||q.orientation!=='gay'||l.age<18)return [];
    return [{id:'friends',label:'向信任的朋友出柜',hint:'由你选择是否说出心事',disabled:!!q.out.friends},{id:'family',label:'和家人谈谈真实的自己',hint:'可能被支持，也可能需要磨合',disabled:!!q.out.family}, {id:'work',label:'在生活与工作中公开身份',hint:civil(l)?'这个职场存在偏见，公开后晋升会受阻':'可能收获支持，也可能遭遇偏见',disabled:!!q.out.work}];}
  function request(l,id){if(!options(l).some(o=>o.id===id&&!o.disabled))return false;l.queer.pending=id;return true;}
  function decisions(l,{dec,opt,getJob}){
    const q=normalize(l),a=l.age,s=l.stats;if(!q.enabled)return null;
    if(q.pending){const target=q.pending,id='out_'+target;return [dec(l,id,'这件事，由你决定什么时候说',target==='work'?'公开会让工作场合也知道你的身份。家人和朋友不会替你自动公开。':'你可以只告诉一个愿意信任的人，也可以继续保留隐私。出柜不是必须完成的任务。',[
      opt('我准备好了，认真谈一谈',target==='work'&&civil(l)?'公开后，这个基层岗位的晋升将受阻':'结果由这次谈话决定',l=>{q.pending=null;const supportive=l.r.chance(target==='friends'?.82:target==='family'?.55:.65);q.out[target]=supportive?'support':'strained';
        if(target==='work'){s.happy+=supportive?5:-4;return civil(l)?'公开之后，有同事愿意支持你，但这个单位的偏见挡住了你的晋升机会。问题在于歧视，而不在于你的身份。':'你选择让身边人知道真实的自己。'+(supportive?'几位同事认真地说，工作能力和喜欢谁是两件事。':'有人说了冒犯的话；你开始划清边界，把信任留给尊重你的人。');}
        s.social+=supportive?6:-4;s.happy+=supportive?8:-5;return target==='friends'?(supportive?'朋友听完以后说：“谢谢你愿意告诉我。”你们约好，这件事由你决定告诉谁。':'朋友一时没有理解。你保留了距离，也找到了愿意倾听的人。'):(supportive?'家人还有些不熟悉，却先问你：“最近过得好吗？”你终于松了一口气。':'家人一时难以接受，谈话留下了隔阂。你说明了自己的边界，决定给彼此时间，也照顾好自己。');}),
      opt('暂时不说，保留自己的节奏','不会公开，也不影响关系',l=>{q.pending=null;delete l.done[id];return '你决定先保留这件心事。什么时候说、向谁说，都可以由你自己决定。';},3)
    ])];}
    if(q.orientation==='gay'&&a>=16&&!l.done.queerCrush)return [dec(l,'queerCrush','有个人，让你忍不住多看一眼',`你发现自己会留意一位${l.sex==='M'?'男生':'女生'}的消息。那种想靠近的心情，和以前想象的有点不一样。`,[
      opt('先把喜欢写进自己的日记','心情 +4；不公开身份',l=>{s.happy+=4;return '你在日记里写下了这个秘密。喜欢一个人，本来就可以是一件很轻很普通的事。';},3),
      opt('在相处中慢慢了解对方','关系 +4，尊重彼此的边界',l=>{s.social+=4;return '你和对方聊起共同喜欢的东西。还没有急着表白，先学会了认真倾听。';})])];
    if(q.type==='admirer'&&a>=20&&!l.done.sameConfession)return [dec(l,'sameConfession','一位同性朋友向你告白','对方认真地说，想和你有超出朋友的关系。你知道自己没有同样的心动，也想诚实回应。',[
      opt('温柔而明确地拒绝','保留彼此的尊重',l=>{s.social+=3;return '你感谢了这份信任，也坦诚地说自己没有同样的感情。喜欢无法勉强，你们都值得被认真对待。';},3),
      opt('先留一点距离，再谈友谊','把边界说清楚',l=>'你说明了自己的感受，提议先留出一点空间。对方的告白没有改变你的取向。')])];
    if(blocked(l)&&!l.done.workBias)return [dec(l,'workBias','当晋升遇到了偏见','公开身份后，单位有人抱有偏见，将你排除在晋升名单之外。你想想接下来怎么做。',[
      opt('留下记录，寻求支持','保留岗位与收入，争取被尊重',l=>{s.social+=4;return '你记下经过，向信任的人寻求支持。现阶段的晋升仍受阻，但你不把别人的偏见当成自己的问题。';},3),
      opt('先保住生活，继续履职','保留岗位；主动安排下班后的生活',l=>{s.happy+=2;return '你继续认真工作，也把生活的意义放回朋友、爱人和自己的日常里。';}),
      opt('离开这个环境，重新找工作','换一份工作，解除本单位的晋升限制',l=>{G.CNCareer.leave(l);l.flags.workStyle='企业';return '你选择换一个环境。新的起点并不轻松，但你想找一个能看见工作本身的地方。';})])];
    return null;
  }
  G.CNQueer={normalize,partnerSex,civil,blocked,options,request,decisions,draw};
})(typeof window!=='undefined'?window:globalThis);
