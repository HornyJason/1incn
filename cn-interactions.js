/* 1injp app.js 的书信、聊天、来电、邮件、答题卡及签字组件的中国模式适配。
 * DOM 类名、版式和动画沿用原作 style.css；只替换文案和人生状态接口。MIT，见 LICENSE。 */
(function (G) {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const name = l => l.name.sei + l.name.mei;
  const opts = d => d.options.map(o => ({i:o.i,label:o.label,hint:o.hint || ''}));
  // 展示文案只读人生状态；不消耗模拟随机数，不改变下一年的结果。
  function describe(l, d) {
    const parent = l.fam.mother.alive ? '妈妈' : l.fam.father.alive ? '爸爸' : '亲友',desk=G.CNSociety.friend(l),pal=G.CNSociety.friend(l,'friend');
    const common = {id:d.id,title:d.title,text:d.text,age:l.age,year:l.year,name:name(l),surname:l.name.sei,options:opts(d)};
    const kinds = {
      schoolLetter:l.seed%2===0?{kind:'notice',doc:'毕业同学录',from:`小学同桌 ${desk.name}`,msgs:[`${name(l)}同学：`,'最难忘的事：课间一起跑去操场，回教室时总是踩着铃声。','想对你说：希望你去新的学校，也能遇到聊得来的朋友。','我们的约定：以后见面，讲讲各自去过的地方。','这一页，留给你写下我们的故事。']}:{kind:'letter',from:`小学同桌 ${desk.name}`,msgs:[`${name(l)}：`,`毕业纪念册传到我这里的时候，我想了半天，不知道写什么。`,`还记得我们趁课间跑去操场吗？你说以后要去看看很远的地方。`,`上了初中，也别忘了给我写信。祝你暑假快乐！`]},
      homeLetter:{kind:'letter',from:parent,msgs:[`${l.name.mei}：`,`放进行李的那封信，你应该看到了吧。到了新的地方，要记得按时吃饭，不要总舍不得花钱。`,`家里一切都好，窗台上的那盆花又开了。遇到不开心的事，也可以和我们说。`,`不必每次都报喜。照顾好自己，想家了就打电话。等放假回家，给你做爱吃的菜。`]},
      interest:{kind:'line',from:'班级活动群',msgs:['这学期的课外活动开始报名啦。','运动、阅读、音乐都可以试试。你想参加哪一项？']},
      schoolLife:{kind:'notice',doc:'班级活动通知',from:'班主任',msgs:['亲爱的同学：','新学期的班级活动开始了。你可以和同学一起参与，也可以认真完成一份自己的作品。','不用做得完美，试一试就很好。']},
      zhongkao:{kind:'exam',doc:'中考志愿确认表',head:`${l.year} 年高中阶段学校招生`,sub:'升学意向'},
      further:{kind:'exam',doc:l.edu.stage==='hs'?'高考志愿确认表':'毕业去向意向表',head:`${l.year} 年毕业生去向登记`,sub:'下一步的选择'},
      major:{kind:'exam',doc:'专业志愿表',head:`${l.year} 年高校招生志愿`,sub:'专业意向'},
      postgrad:{kind:'exam',doc:'毕业去向登记表',head:`${l.year} 届毕业生`,sub:'继续深造 / 就业'},
      jobEntry:{kind:'mail',from:'招聘与就业服务',msgs:['你的求职进度有了新消息。','校园招聘、岗位培训、技术服务，不同的方向已经摆在眼前。第一份工作，你想怎样开始？']},
      social:{kind:'line',from:pal.alive?pal.name:'社区的朋友',msgs:['周末有空吗？好久没见了。','我们约了几个人一起吃饭，也有人想去参加新的活动。','你想怎么安排？']},
      workStyle:{kind:'line',from:parent,msgs:G.CNSociety.parentsAlive(l)?['最近工作还顺利吗？','你有没有考虑过考公？如果想全职准备，要提前安排好这一年的生活费。','不管怎么选，还是要听听你自己的想法。']:['最近又看到招考的消息，你重新考虑起未来的工作。','要不要留出一年时间，认真准备一次考试？']},
      festival:{kind:'call',from:parent,video:true,msgs:['喂，听得见吗？最近忙不忙？','快过年了，家里已经开始准备年夜饭了。','今年怎么安排呀？不管回不回来，都记得好好吃饭。']},
      care:{kind:'call',from:parent,msgs:['检查结果拿到了，医生说接下来要定期复查。','本来不想让你操心，但有些安排，还是得一起商量。','以后陪诊、平时照应，我们想听听你的想法。']},
      marriage:{kind:'sign',doc:'共同生活意愿书',terms:[`当事人：${name(l)}、${l.partner?.name || '伴侣'}`,'认真讨论居住安排、家庭开支与彼此的生活期待。','尊重双方意愿，共同承担生活责任。','认真照顾彼此，也为未来留出余地。']},
      commitment:{kind:'letter',from:l.partner?.name || '伴侣',msgs:[`${l.name.mei}：`,'这封信写了好几次，最后还是觉得，普通的话最好。','我想和你一起买菜、散步，在很累的时候给对方留一盏灯。','往后的日子，我们要怎样一起走？我想听听你的答案。']},
      children:{kind:'line',from:l.spouse?.name || '伴侣',msgs:['关于孩子的事，今晚我们认真聊聊吧。','时间、照料和开支都需要一起商量。','不着急给谁一个答案，先听听我们自己想要的生活。']},
      career:{kind:'sign',doc:'职业发展意向确认书',terms:[`当前岗位：${l.job?.title || '工作岗位'}`,'你可以继续投入职业发展，也可以学习新的技能。','请结合自己的健康、家庭与生活期待作决定。','把想清楚的选择写下来。']},
      housing:{kind:'sign',doc:'居住安排确认单',terms:[`居住城市：${l.city}`,'可选择租住、购买住房或回到家庭住处过渡。','购房支出、借款与后续还款以选项和账本为准。','留出应急资金，再决定接下来的住处。']},
      retirement:{kind:'sign',doc:'退休生活安排意向书',terms:[`姓名：${name(l)}　年龄：${l.age} 岁`,'决定接下来几年的工作与休息安排。','可以选择渐渐放慢，也可以继续当前的工作。','认真安排往后的收入、住处和陪伴。']},
      later:{kind:'letter',from:l.kids.some(k=>k.alive!==false)?'孩子们':pal.alive?pal.name:'社区的朋友',msgs:[`${l.name.mei}：`,'整理旧照片的时候，看见了以前的合影。照片有点褪色，那天的事倒还记得。','最近有空的话，我们一起吃顿饭吧。也想听你讲讲，这些年都怎么走过来的。','往后的日子，你最想留下些什么，又想和谁一起度过？']},
      queerCrush:{kind:'letter',from:'写给自己的信',msgs:['有些心事，先写下来也好。',`我发现，自己会留意那个${l.sex==='M'?'男生':'女生'}的消息。想和对方多说两句话，见到时又会有点紧张。`,'这些感觉并不需要立刻向谁解释。什么时候说、向谁说，都可以慢慢决定。']},
      sameConfession:{kind:'line',from:pal.alive?pal.name:'一位信任你的朋友',msgs:['有件事想认真和你说。','我对你的喜欢，好像已经超出了朋友的感情。','你不用勉强自己，也不用急着回答。我会尊重你的感受。']}
    };
    const dynamic=d.id.startsWith('grandcare_')?{kind:'call',from:l.kinship.care.name,msgs:[`最近照顾${l.kinship.care.grandchild}有点忙不过来，想和你商量件事。`,`你愿不愿意搬到${l.kinship.care.city}，来我们家住一阵，帮忙带带孩子？`,'先看你的身体和安排，不方便也没关系。']}:d.id.startsWith('gift_')?{kind:'notice',doc:d.title,from:l.kinship.pendingGifts[0].name,msgs:[d.text]}:d.id.startsWith('adoption_')?{kind:'notice',doc:'领养申请回信',from:'领养服务窗口',msgs:[d.text]}:d.id==='collegeChoices'||d.id==='examRetry'||d.id.startsWith('examAgain_')?{kind:'exam',doc:d.title,head:`${l.year} 年升学安排`,sub:'确认志愿'}:d.id==='admission'?{kind:'notice',doc:'录取查询',from:'招生信息查询',msgs:[d.text]}:d.id.startsWith('civilResult_')?{kind:'notice',doc:'招录结果通知',from:'招录单位',msgs:[d.text]}:d.id.startsWith('relationship_')?{kind:'line',from:l.romance.candidate.name,msgs:l.romance.candidate.confession?['有件事一直想亲口告诉你。','我喜欢的是同性，也一直对你有超出朋友的感情。','你不用勉强自己，我会尊重你的回答。']:['和你在一起的时候，我总觉得很自在。','我想认真问问你，愿不愿意和我试着交往？','不用急着回答，告诉我你真实的想法就好。']}:d.id.startsWith('proposal_')?{kind:'letter',from:l.partner.name,msgs:['这几年一起经历的事，我一直记在心里。','我想和你商量往后的日子，住在哪里，怎样照顾彼此。','你愿意和我一起，把这个家慢慢安顿好吗？']}:d.id.startsWith('funeral_')&&l.age<18?{kind:'notice',doc:'和家人告别',from:'家人',msgs:[d.text]}:d.id.startsWith('funeral_')?{kind:'call',from:l.fam.father.alive?'爸爸':l.fam.mother.alive?'妈妈':l.fam.siblings.find(p=>p.alive!==false)?(l.fam.siblings.find(p=>p.alive!==false).sei||l.name.sei)+l.fam.siblings.find(p=>p.alive!==false).name:'家里的亲戚',msgs:[d.text,'家里的事，我们先张罗着。你也要照顾好自己。']}:null;
    const special = d.id.startsWith('severance_')?{kind:'notice',doc:'裁员通知',from:'原单位人事部',msgs:[`${name(l)}：`,d.text,'请确认接下来的结算安排。']}:d.id.startsWith('jobSearch_')?{kind:'mail',from:'招聘与就业服务',msgs:[d.text,'选一份适合现在的工作，也可以先休整一阵。']}:d.id.startsWith('out_') ? {kind:'line',from:d.id==='out_family'?parent:d.id==='out_friends'?'信任的朋友':'信任的同事',msgs:['你说有件重要的事想聊，我在听。','如果现在还没准备好，也可以以后再说。']} : null;
    const replies={
      schoolLetter:[{say:'信收到啦！等我到了新学校，就给你写信。',reply:'那就说好了。下次见面，要告诉我新学校是什么样的。'},{say:'谢谢你的信。我会好好收着的！',reply:'暑假快乐，我们开学再见。'}],
      homeLetter:[{say:'最近有好事，也有一点烦恼。写下来给你们看看，别担心我。',reply:'我们都看到了。慢慢来，累了就歇一歇。'},{say:'信我看到了。今天有空，想听听你们的声音。',reply:'在呢，想聊多久都行。'},{say:'这封信我收好了。下次回家，带点这里的特产给你们。',reply:'人回来就好，路上注意安全。'}],
      social:[{say:'好啊，周末一起出去走走！',reply:'那就这么定了，到时候见。'},{say:'这次想留点时间给自己，下次再约吧。',reply:'没事，好好休息，我们下次见。'},{say:'最近想先把工作做好，忙过这一阵再聚。',reply:'好，也记得按时吃饭，别太累了。'}],
      festival:[{say:'我回去，留着肚子吃家里的饭。',reply:'好，路上慢点，我们等你。'},{say:'今年想和朋友一起过，到时候给家里打视频。',reply:'也好，记得把饭吃热乎，别一个人凑合。'},{say:'这阵子先忙工作，过了年再回去多住几天。',reply:'行，什么时候回来都给你留着房间。'}],
      children:[{say:'我们一起做好准备，也一起分担照料。',reply:'嗯，不是一个人的事，我们一起慢慢来。'},{say:'先把现在的日子过好，过阵子再认真聊。',reply:'好，不急，我们都想清楚再说。'},{say:'我想把心力留给彼此和现在的生活。',reply:'谢谢你认真说出来，我们一起把日子过好。'}],
      sameConfession:[{say:'谢谢你愿意告诉我。但我没有同样的感情，不能勉强答应。',reply:'谢谢你认真回答。我明白了，也会照顾好自己的感受。'},{say:'我没有同样的心动。我们先留一点空间，好吗？',reply:'好，我尊重你的边界。'}]
    };
    return {...common,...(dynamic || kinds[d.id] || special || {kind:'sheet'}),replies:replies[d.id] || []};
  }

  const $ = s => G.document.querySelector(s);
  const PH = {timers:[],clock:null,ring:null,done:false,generation:0};
  const reduced = () => G.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const sound = key => G.Sound?.sfx(key);
  const hhmm = () => new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false});
  function clear() { PH.timers.forEach(clearTimeout);PH.timers=[];clearInterval(PH.clock);clearInterval(PH.ring);PH.generation++; }
  function later(ms, fn) { const generation=PH.generation;PH.timers.push(setTimeout(()=>{if(generation===PH.generation)fn();},reduced()?0:ms)); }
  function avatar(from) {
    const colors=['#e8a87c','#85c1a8','#9bb7e0','#d9a3c7','#c9b46b'];
    const color=colors[[...from].reduce((a,c)=>a+c.charCodeAt(0),0)%colors.length];
    return `<span class="phav" style="background:${color}">${esc([...from][0])}</span>`;
  }
  const buttons = (p, cls='') => p.options.map(o=>`<button type="button" data-i="${o.i}" class="${cls}">${esc(o.label)}${o.hint?`<small>${esc(o.hint)}</small>`:''}</button>`).join('');
  function open(p, handlers={}) {
    p={...p,...(p.terms?{terms:p.terms.filter(t=>!/本页记录游戏中的决定|正式婚姻登记另行办理|认真照顾彼此，也为未来留出余地/.test(t))}:{})};
    clear();PH.done=false;
    const modal=$('#modal'),box=$('#mPhone'),sheet=$('#mOpts');
    modal.className='modal';box.innerHTML='';sheet.innerHTML='';
    modal.setAttribute('aria-label',p.title);
    $('#mAge').textContent=`${p.age} 岁 · ${p.year} 年`;
    $('#mTitle').textContent=p.title;$('#mText').textContent=p.text;$('#mNote').textContent='';
    const hold=$('#mHold'),laterButton=$('#choiceLater');hold.hidden=false;hold.onclick=()=>{close();handlers.hold?.();};
    laterButton.hidden=false;laterButton.textContent=p.readonly?'收好 · 关闭':'稍后决定';laterButton.onclick=()=>{close();handlers.hold?.();};
    modal.oncancel=e=>{e.preventDefault();close();handlers.hold?.();};
    const pick=(i,el)=>{
      if(PH.done)return;if(p.readonly){close();handlers.next?.();return;}PH.done=true;clearInterval(PH.ring);clearInterval(PH.clock);
      box.querySelectorAll('button[data-i]').forEach(b=>b.disabled=true);
      sheet.querySelectorAll('button').forEach(b=>b.disabled=true);
      hold.hidden=true;laterButton.hidden=true;modal.oncancel=e=>e.preventDefault();sound('click');
      const finish=()=>{const logs=handlers.resolve?.(i,p) || [];showResult(p,i,logs,handlers.next);};
      const paper=box.querySelector('.paper');
      if(paper){paper.classList.add('picked');el?.classList.add('sel');}
      if(p.kind==='exam'){el?.querySelector('.ov')?.classList.add('on');later(650,finish);}
      else if(p.kind==='sign'){
        // 仅表达确认当前选择，拒绝/维持现状不会盖上“同意”的印章。
        const decline=/暂不|暂时|继续当前|继续工作|先不|不急|保持|租房|家庭住处/.test(p.options.find(o=>o.i===i)?.label || '');
        if(decline){paper.classList.add('declined');later(700,finish);}
        else{paper.querySelector('.sig').classList.add('on');later(900,()=>{paper.querySelector('.hanko').classList.add('on');sound('land');});later(1500,finish);}
      }else finish();
    };
    const bind=wrap=>wrap.querySelectorAll('button[data-i]').forEach(b=>b.onclick=()=>pick(Number(b.dataset.i),b));
    const chips=root=>{const wrap=root.querySelector('.phopts');wrap.innerHTML=buttons(p);wrap.hidden=false;bind(wrap);};
    const talk=(root,line=false)=>{
      const list=root.querySelector('.phlist');list.hidden=false;let time=250;
      (p.msgs || [p.text]).forEach((m,k)=>{
        if(line)later(time,()=>{list.insertAdjacentHTML('beforeend','<div class="bub them typing" aria-label="对方正在输入"><i></i><i></i><i></i></div>');list.scrollTop=list.scrollHeight;});
        time+=p.kind==='letter'?650:Math.min(1300,350+m.length*20);
        later(time,()=>{list.querySelector('.typing')?.remove();list.insertAdjacentHTML('beforeend',`<div class="bub them">${line&&k===0?avatar(p.from):''}<span>${esc(m)}</span>${line?`<time>${hhmm()}</time>`:''}</div>`);list.scrollTop=list.scrollHeight;if(line)sound('msg');});
        time+=180;
      });
      later(time+120,()=>chips(root));
    };
    const top=`<div class="phtop"><span>${hhmm()}</span><span class="phage">${p.age} 岁 · ${p.year} 年</span><span aria-hidden="true">▮▮▮ 🔋</span></div>`;
    if(['letter','line','call','mail'].includes(p.kind)){
      modal.classList.add('phonemode');
      if(p.kind==='letter'){
        box.innerHTML=`<div class="ph line letterwrap"><div class="ltpaper"><div class="lthead">${esc(p.from)} · 来信</div><div class="phlist ltlist" aria-live="polite"></div></div><div class="phopts lnopts" hidden></div></div>`;
        sound('msg');talk(box.firstElementChild);
      }else if(p.kind==='line'){
        box.innerHTML=`<div class="ph line">${top}<button type="button" class="lnbanner" aria-label="打开${esc(p.from)}的消息"><b>微信</b><span><em>${esc(p.from)}</em>${esc(p.msgs[0])}</span></button><div class="lnhead"><span aria-hidden="true">‹</span><b>${esc(p.from)}</b><span aria-hidden="true">☰</span></div><div class="phlist" aria-live="polite"></div><div class="phopts lnopts" hidden></div></div>`;
        const root=box.firstElementChild;let opened=false;
        const start=()=>{if(opened)return;opened=true;root.classList.add('open');talk(root,true);};
        root.querySelector('.lnbanner').onclick=start;later(1000,start);sound('msg');
      }else if(p.kind==='call'){
        box.innerHTML=`<div class="ph call ringing${p.video?' video':''}">${top}<div class="phwho">${avatar(p.from)}<b>${esc(p.from)}</b><small>${p.video?'视频通话':'手机来电'}</small><span class="phst">来电中…</span></div><div class="phlist" hidden aria-live="polite"></div><div class="phopts" hidden></div><div class="phbtns"><button type="button" class="phyes" aria-label="接听">✆<small>接听</small></button></div></div>`;
        const root=box.firstElementChild;sound('ring');let rings=0;
        PH.ring=setInterval(()=>{if(++rings>8)return clearInterval(PH.ring);sound('ring');},1600);
        root.querySelector('.phyes').onclick=()=>{
          clearInterval(PH.ring);root.classList.remove('ringing');root.classList.add('talking');root.querySelector('.phbtns').remove();sound('click');
          let sec=0;const status=root.querySelector('.phst');status.textContent='00:00';
          PH.clock=setInterval(()=>{sec++;status.textContent=`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;},1000);talk(root);
        };
      }else{
        box.innerHTML=`<div class="ph mailapp">${top}<div class="mlhead"><b>收件箱</b><span>1 封新邮件</span></div><div class="mlscroll"><div class="phlist mllist"><div class="mlitem"><span class="mlfrom">${esc(p.from)}</span><b>${esc(p.title)}</b>${p.msgs.map(m=>`<p>${esc(m)}</p>`).join('')}</div></div><div class="phopts lnopts" hidden></div></div></div>`;
        chips(box.firstElementChild);sound('msg');
      }
    }else if(['exam','sign','notice','payslip'].includes(p.kind)){
      modal.classList.add('papermode');
      if(p.kind==='exam'){
        const no=String(p.year)+String(p.age).padStart(2,'0')+'01';
        box.innerHTML=`<div class="paper exam"><div class="exhead"><span>${esc(p.head)}</span><b>${esc(p.doc)}</b></div><div class="exid"><span>登记编号<b>${no}</b></span><span>姓名<b>${esc(p.name)}</b></span></div><p class="exq"><b>${esc(p.sub)}</b>　${esc(p.text)}</p><p class="exq2">请结合自己的意愿选择一项，并确认提交。</p><ol class="exopts">${p.options.map((o,k)=>`<li><button type="button" data-i="${o.i}"><span class="ov">${k+1}</span><span class="tx">${esc(o.label)}<small>${esc(o.hint)}</small></span></button></li>`).join('')}</ol></div>`;
      }else if(p.kind==='sign'){
        box.innerHTML=`<div class="paper sign"><h3>${esc(p.doc)}</h3><p class="pdate">${p.year} 年</p><p class="ptext">${esc(p.text)}</p><ol class="pterms">${p.terms.map(t=>`<li>${esc(t)}</li>`).join('')}</ol><div class="psign"><span>签名</span><span class="sig">${esc(p.name)}</span><span class="hanko">${esc(p.surname)}</span></div><div class="popts">${buttons(p,'dosign')}</div><span class="pstamp">另作安排</span></div>`;
      }else if(p.kind==='notice'){
        box.innerHTML=`<div class="paper tsuchi"><div class="tshead"><b>${esc(p.doc)}</b><span>${p.year} 年</span></div><div class="ptext">${p.msgs.map(m=>`<p>${esc(m)}</p>`).join('')}<p class="pdate">${esc(p.from)}</p></div><div class="popts">${buttons(p)}</div></div>`;
      }else{
        box.innerHTML=`<div class="paper payslip"><div class="pshead"><b>年度收入与到账单</b><span>${p.year} 年　${esc(p.name)}</span><span>${esc(p.job)}</span></div><div class="psgrid"><div><h4>收入</h4>${p.rows.map(([label,value])=>`<p><span>${esc(label)}</span><b>${esc(value)}</b></p>`).join('')}</div><div><h4>扣除</h4>${(p.deductions || []).map(([label,value])=>`<p><span>${esc(label)}</span><b>${esc(value)}</b></p>`).join('')}</div></div><div class="psnet"><span>本年个人到账</span><b>${esc(p.net)}</b></div><div class="popts">${buttons(p)}</div></div>`;
      }
      bind(box);sound('open');
    }else{
      sheet.innerHTML=buttons(p);bind(sheet);sound('open');
    }
    if(!modal.open)modal.showModal();
  }
  function showResult(p,i,logs,next){
    const modal=$('#modal'),box=$('#mPhone'),root=box.firstElementChild;root?.classList.add('letter-complete');
    const option=p.options.find(o=>o.i===i),label=option?.label || '';
    if(root?.classList.contains('ph')){
      root.querySelector('.phopts').hidden=true;
      const list=root.querySelector('.phlist');list.hidden=false;
      const words=p.replies?.[p.options.findIndex(o=>o.i===i)];
      list.insertAdjacentHTML('beforeend',`<div class="bub me"><span>${esc(words?.say || label)}</span>${p.kind==='line'?`<time>已发送 ${hhmm()}</time>`:''}</div>`);
      if(words?.reply)list.insertAdjacentHTML('beforeend',`<div class="bub them"><span>${esc(words.reply)}</span>${p.kind==='line'?`<time>${hhmm()}</time>`:''}</div>`);
      const status=root.querySelector('.phst');if(status)status.textContent='通话结束';
    }else root?.querySelector('.popts, .exopts')?.setAttribute('hidden','');
    const res=`<div class="phres"><span class="lbl">你选择了「${esc(label)}」</span>${logs.map(e=>`<p>${esc(e.t)}</p>`).join('') || '<p>这个决定已经记下。</p>'}</div>`;
    if(root){const list=root.querySelector('.phlist');(list || root).insertAdjacentHTML('beforeend',res);root.insertAdjacentHTML('beforeend','<button type="button" class="phend">继续 ▸</button>');if(list){const scroll=root.querySelector('.mlscroll')||list;scroll.scrollTop=scroll.scrollHeight;}}
    else $('#mOpts').innerHTML=`${res}<button type="button" class="mnext">继续 ▸</button>`;
    const proceed=()=>{close();next?.();};
    modal.querySelector('.phend, .mnext').onclick=proceed;
    // 结果已保存；关闭只结束展示，不会再次执行选择。
    $('#mHold').hidden=false;$('#mHold').onclick=proceed;modal.oncancel=e=>{e.preventDefault();proceed();};
    $('#choiceLater').hidden=false;$('#choiceLater').textContent='收好 · 继续';$('#choiceLater').onclick=proceed;
  }
  function close(){clear();const modal=$('#modal');if(modal.open)modal.close();}
  G.CNInteractions={describe,open,close,esc};
})(typeof window!=='undefined'?window:globalThis);
