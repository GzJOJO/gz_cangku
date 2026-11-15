(() => {
  'use strict';
  const cfg = window.BIRTHDAY_CONFIG || {};
  const name = cfg.recipientName || '小张';
  const app = document.querySelector('#app');

  // Keep the stage aligned with the visible mobile viewport when browser bars expand/collapse.
  const syncAppHeight = () => {
    const visibleHeight = window.visualViewport?.height || window.innerHeight;
    if (visibleHeight > 0) {
      document.documentElement.style.setProperty('--app-height', `${Math.round(visibleHeight)}px`);
    }
  };
  syncAppHeight();
  window.addEventListener('resize', syncAppHeight, { passive: true });
  window.visualViewport?.addEventListener('resize', syncAppHeight, { passive: true });
  window.addEventListener('orientationchange', syncAppHeight, { passive: true });

  const scenes = [...document.querySelectorAll('.scene')];
  const dots = [...document.querySelectorAll('.step-dot')];
  const labels = ['01 / 为你而来','02 / 全宇宙偏爱','03 / 一点小调皮','04 / 愿望会发光','05 / 认真喜欢你','06 / 故事未完待续'];
  let current = 0;
  let toastTimer = null;

  // 把昵称统一替换成配置中的昵称（避免修改很多 HTML 文本）。
  if (name !== '小张') {
    document.title = document.title.replaceAll('小张', name);
    document.querySelectorAll('.scene, .footer-love, .letter-scroll').forEach(el => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) node.nodeValue = node.nodeValue.replaceAll('小张', name);
    });
  }
  document.querySelector('#player-label').textContent = `PLAYER ${cfg.playerNumber || '02'} · ${name} / LOVE ${cfg.lovePoints || '+999'}`;

  // Generate an intentionally deterministic pixel-star background.
  function seedRandom(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
  const randomStars = seedRandom(199903);
  const starfield = document.querySelector('#starfield');
  for (let i=0; i<92; i++) {
    const star = document.createElement('i');
    star.className = 'star' + (i % 15 === 0 ? ' big' : '');
    star.style.left = (randomStars() * 98 + 1) + '%';
    star.style.top = (randomStars() * 85 + 7) + '%';
    star.style.animationDelay = (-randomStars() * 5) + 's';
    starfield.append(star);
  }

  const particleLayer = document.querySelector('#particle-layer');
  const colors = ['#e886b0','#fbd38f','#fff0c6','#bc8ab7','#d46f9b','#a47b9c'];
  function celebration(n = cfg.confettiCount || 105, hearts = false) {
    const count = Math.min(n, 220);
    for (let i=0; i<count; i++) {
      const p = document.createElement('i');
      const duration = 3.2 + Math.random()*3.3;
      const delay = Math.random()*2.0;
      const heart = hearts && Math.random()<.48;
      p.className = 'particle' + (heart ? ' heart-particle' : '');
      if (heart) p.textContent = Math.random()>.4 ? '♥' : '♡';
      p.style.left = (Math.random()*100)+'%';
      p.style.setProperty('--fall',duration+'s');
      p.style.setProperty('--drift',(Math.random()*250-125)+'px');
      p.style.setProperty('--rot',(Math.random()*1200-600)+'deg');
      p.style.setProperty('--particle',colors[(Math.random()*colors.length)|0]);
      p.style.backgroundColor = heart ? 'transparent' : colors[(Math.random()*colors.length)|0];
      if (heart) p.style.color = colors[(Math.random()*colors.length)|0];
      p.style.animationDelay = delay+'s';
      p.style.width = heart ? '' : (4 + Math.random()*5)+'px';
      particleLayer.append(p);
      setTimeout(()=>p.remove(),(duration+delay)*1000+100);
    }
  }

  function notify(text) {
    const toast = document.querySelector('#toast');
    clearTimeout(toastTimer);
    toast.textContent = text;
    toast.classList.add('visible');
    toastTimer = setTimeout(()=>toast.classList.remove('visible'),2600);
  }

  function setScene(index) {
    if (index < 0 || index >= scenes.length) return;
    current = index;
    app.dataset.stage = String(index);
    app.classList.toggle('day',[1,2,5].includes(index));
    app.classList.toggle('night',![1,2,5].includes(index));
    scenes.forEach((scene,i)=>{
      const isActive = i===index;
      scene.hidden = !isActive;
      scene.classList.toggle('active',isActive);
    });
    dots.forEach((dot,i)=>{
      dot.classList.toggle('current',i===index);
      dot.setAttribute('aria-current',i===index?'step':'false');
    });
    document.querySelector('#stage-label').textContent = labels[index];
    particleLayer.replaceChildren();
    if (index === 1) celebration(125);
    if (index === 5) celebration(40,true);
    if (index === 2) resetQuestion();
    if (index === 3) resetWish();
    if (index === 4) { confessionIndex = 0; updateConfession(); }
  }
  dots.forEach(dot=>dot.addEventListener('click',()=>setScene(Number(dot.dataset.go))));

  // 01 -> 02: gift opening
  document.querySelector('#gift-btn').addEventListener('click',()=>{
    setScene(1);
    notify('惊喜已送达 ♡');
  });
  document.querySelector('#birthday-next').addEventListener('click',()=>setScene(2));

  // 03: branching joke question
  const speech = document.querySelector('#speech');
  const response = document.querySelector('#question-response');
  const questionNext = document.querySelector('#question-next');
  function resetQuestion() {
    speech.textContent = '请寿星认真作答！';
    response.textContent = '';
    questionNext.hidden = true;
  }
  document.querySelector('#yes-btn').addEventListener('click',()=>{
    speech.textContent = '被你夸到冒泡啦 ♡';
    response.textContent = '不对，标准答案是你。我只是全世界最喜欢你的人。';
    questionNext.hidden = false;
    celebration(34);
  });
  document.querySelector('#no-btn').addEventListener('click',()=>{
    speech.textContent = '被你夸到冒泡啦 ♡';
    response.textContent = '不对，标准答案是你。我只是全世界最喜欢你的人。';
    questionNext.hidden = false;
    celebration(34);
  });
  questionNext.addEventListener('click',()=>setScene(3));

  // 04: press and hold on candle for two seconds, Space also works.
  const wishButton = document.querySelector('#wish-btn');
  const wishFill = document.querySelector('#wish-fill');
  const wishHint = document.querySelector('#wish-hint');
  const cakeWrap = document.querySelector('#cake-wrap');
  let wishStart = null, wishRaf = null, wishDone = false, keyHeld = false;
  const HOLD_MS = 2000;
  function resetWish() {
    stopWish(); wishDone = false; cakeWrap.classList.remove('blown');
    wishHint.textContent = '按住鼠标或空格 2 秒，让愿望轻轻飞走。';
    wishButton.textContent = '呼—— 把愿望送给星星';
    wishFill.style.width = '0%';
  }
  function finishWish() {
    if (wishDone) return;
    wishDone = true; stopWish();
    cakeWrap.classList.add('blown');
    wishFill.style.width = '100%';
    wishButton.textContent = '星星收到愿望啦 ✨';
    wishHint.textContent = '愿你想要的，都会慢慢来到身边。';
    celebration(112, true);
    setTimeout(()=>{ if (current===3) setScene(4); },2400);
  }
  function tickWish() {
    if (wishStart===null || wishDone) return;
    const ratio = Math.min(1,(performance.now()-wishStart)/HOLD_MS);
    wishFill.style.width = `${ratio*100}%`;
    if (ratio>=1) finishWish(); else wishRaf=requestAnimationFrame(tickWish);
  }
  function startWish(ev) {
    if (wishDone || wishStart!==null) return;
    if (ev && ev.cancelable) ev.preventDefault();
    wishStart = performance.now();
    wishButton.classList.add('holding');
    wishRaf = requestAnimationFrame(tickWish);
  }
  function stopWish() {
    wishStart = null;
    cancelAnimationFrame(wishRaf);
    wishButton.classList.remove('holding');
    if (!wishDone) wishFill.style.width = '0%';
  }
  wishButton.addEventListener('pointerdown',ev=>{ if (ev.pointerType !== 'mouse' || ev.button===0) startWish(ev); });
  window.addEventListener('pointerup',()=>{ if (!wishDone) stopWish(); });
  window.addEventListener('pointercancel',()=>{ if (!wishDone) stopWish(); });
  window.addEventListener('keydown',ev=>{
    if (current===3 && ev.code==='Space' && !keyHeld && !document.querySelector('#letter-modal').hidden) return;
    if (current===3 && ev.code==='Space' && !keyHeld) { keyHeld=true; startWish(ev); }
    if (ev.key==='Escape') closeLetter();
  });
  window.addEventListener('keyup',ev=>{ if (ev.code==='Space') {keyHeld=false; if (!wishDone) stopWish();} });
  window.addEventListener('blur',()=>{keyHeld=false; if (!wishDone) stopWish();});
  document.querySelector('#wish-skip').addEventListener('click',finishWish);

  // 05: six confessional cards and a written letter.
  const confessions = [
    {title:'其实，准备这些的时候，<br>我一直在想。',desc:'除了生日快乐，我最想对你说的是什么。'},
    {title:'',desc:'也不用把所有委屈，都自己消化掉。'},
    {title:'你难过的时候，<br>可以先靠在我这里。',desc:'不必总要自己一个人撑住。'},
    {title:'你不用变得完美，<br>才值得被好好爱着。',desc:'闪闪发光的你，和有点疲惫的你，我都喜欢。'},
    {title:'在我这里，<br>你可以放心做小张。',desc:'不是谁期待的样子，只是你自己。'},
    {title:'往后的普通日子，<br>我也想认真陪你过。',desc:'生日只有一天，偏爱可以有很多很多天。'}
  ];
  let confessionIndex = 0;
  const confTitle = document.querySelector('#confession-title');
  const confDesc = document.querySelector('#confession-desc');
  const confCount = document.querySelector('#confession-counter');
  const confBtn = document.querySelector('#confession-next');
  const envelope = document.querySelector('#envelope-container');
  function updateConfession() {
    const data = confessions[confessionIndex];
    confCount.textContent = `${String(confessionIndex+1).padStart(2,'0')} / 06 · 只说给你听`;
    confTitle.innerHTML = data.title;
    confDesc.textContent = data.desc;
    confBtn.textContent = confessionIndex===5 ? '剩下的话，写在这封信里了 ♡' : '我在听，你说 ♡';
    envelope.hidden = confessionIndex!==5;
  }
  confBtn.addEventListener('click',()=>{
    if (confessionIndex<5) { confessionIndex++; updateConfession(); }
    else openLetter();
  });
  const letterModal = document.querySelector('#letter-modal');
  let focusedBeforeModal = null;
  function openLetter() {
    focusedBeforeModal = document.activeElement;
    letterModal.hidden = false;
    document.querySelector('.letter-scroll').scrollTop=0;
    document.querySelector('#letter-close').focus();
  }
  function closeLetter() {
    if (letterModal.hidden) return;
    letterModal.hidden = true;
    focusedBeforeModal?.focus?.();
  }
  document.querySelector('#letter-close').addEventListener('click',closeLetter);
  letterModal.addEventListener('click',ev=>{if(ev.target===letterModal) closeLetter();});
  document.querySelector('#letter-finish').addEventListener('click',()=>{closeLetter();setScene(5);});
  document.querySelector('#read-letter-again').addEventListener('click',openLetter);

  // 06: repeated hugs and affection hearts.
  const hugBunnies = document.querySelector('#two-bunnies');
  const finaleMessage = document.querySelector('#finale-message');
  const finaleNote = document.querySelector('#finale-note');
  let hugs = 0;
  document.querySelector('#hug-btn').addEventListener('click',()=>{
    hugs++;
    hugBunnies.classList.remove('hugging');
    void hugBunnies.offsetWidth;
    hugBunnies.classList.add('hugging');
    celebration(85,true);
    if (hugs===1) {
      document.querySelector('#finale-title').textContent = `生日快乐，我的${name}。`;
      finaleMessage.innerHTML = '新的一岁，你往前走。<br>我陪着你。';
      document.querySelector('#hug-btn').textContent='再抱一会儿 ♡';
      finaleNote.textContent='你不松手，我就不先放开。';
    } else {
      finaleNote.textContent=['再抱一会儿，再多喜欢你一点。','今天的爱心不限量 ♡','这个拥抱，永远不设截止日期。'][hugs%3];
    }
  });

  // 本地录音播放：文件随项目一起部署，无需外部音乐平台或后端。
  const musicButton = document.querySelector('#music-btn');
  const musicAudio = new Audio('./assets/music/birthday-recording.m4a');
  musicAudio.preload = 'metadata';
  musicAudio.loop = false; // 录音播放完毕后停止，不自动重复人声。
  musicAudio.volume = 0.85;

  function setMusicButtonState(playing) {
    musicButton.querySelector('span').textContent = playing ? '音乐已开启' : '音乐已关闭';
    musicButton.setAttribute('aria-pressed', playing ? 'true' : 'false');
  }

  musicAudio.addEventListener('play', () => setMusicButtonState(true));
  musicAudio.addEventListener('pause', () => setMusicButtonState(false));
  musicAudio.addEventListener('ended', () => setMusicButtonState(false));

  async function toggleMusic() {
    if (!musicAudio.paused && !musicAudio.ended) {
      musicAudio.pause();
      return;
    }
    try {
      if (musicAudio.ended) musicAudio.currentTime = 0;
      await musicAudio.play();
    } catch {
      setMusicButtonState(false);
      notify('录音播放失败，请检查音频文件或浏览器播放权限');
    }
  }
  musicButton.addEventListener('click', toggleMusic);

  // Fullscreen availability varies by browser (especially mobile Safari).
  const fullscreenBtn = document.querySelector('#fullscreen-btn');
  fullscreenBtn.addEventListener('click',async()=>{
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else notify('当前浏览器不支持全屏');
    } catch { notify('浏览器未允许全屏'); }
  });
  document.addEventListener('fullscreenchange',()=>{
    fullscreenBtn.querySelector('span').textContent=document.fullscreenElement?'退出全屏':'进入全屏';
  });

  // Default scene. No login, backend, local storage, or permissions required.
  setScene(0);
})();
