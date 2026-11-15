
(() => {
  'use strict';
  const cfg = window.BIRTHDAY_CONFIG || {};
  const name = cfg.recipientName || '佳佳';
  const app = document.querySelector('#app');


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
  const labels = ['01 / 为你而来','02 / 全世界偏爱','03 / 一点小调皮','04 / 愿望会发光','05 / 梦想成真','06 / 故事未完待续'];
  let current = 0;
  let toastTimer = null;


  if (name !== '佳佳') {
    document.title = document.title.replaceAll('佳佳', name);
    document.querySelectorAll('.scene, .footer-love, .letter-scroll').forEach(el => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) node.nodeValue = node.nodeValue.replaceAll('佳佳', name);
    });
  }
  document.querySelector('#player-label').textContent = `PLAYER ${cfg.playerNumber || '02'} · ${name} / LOVE ${cfg.lovePoints || '+999'}`;


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
    notify('happy brithday');
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
    speech.textContent = '没错就是我！';
    response.textContent = '算你有自知之明';
    questionNext.hidden = false;
    celebration(34);
  });
  document.querySelector('#no-btn').addEventListener('click',()=>{
    speech.textContent = '哼！';
    response.textContent = '明明佳佳就是最可爱的';
    questionNext.hidden = false;
    celebration(34);
  });
  questionNext.addEventListener('click',()=>setScene(3));


  const wishButton = document.querySelector('#wish-btn');
  const wishFill = document.querySelector('#wish-fill');
  const wishHint = document.querySelector('#wish-hint');
  const cakeWrap = document.querySelector('#cake-wrap');
  let wishStart = null, wishRaf = null, wishDone = false, keyHeld = false;
  const HOLD_MS = 2000;
  function resetWish() {
    stopWish(); wishDone = false; cakeWrap.classList.remove('blown');
    wishHint.textContent = '按住2秒，让愿望飞向星空';
    wishButton.textContent = '将愿望成真';
    wishFill.style.width = '0%';
  }
  function finishWish() {
    if (wishDone) return;
    wishDone = true; stopWish();
    cakeWrap.classList.add('blown');
    wishFill.style.width = '100%';
    wishButton.textContent = '祝你愿望成真';
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


  const confessions = [
    {title:'其实，准备这些的时候，<br>我一直在想。',desc:'除了生日快乐，我最想对你说的是什么。'},
    {title:'希望日后你的每天都可以平平安安，<br>幸幸福福',desc:''},
    {title:'希望你日后的每天，<br>都可以开开心心',desc:'不用一个人把所有委屈，都自己消化掉。也不要总自己一个人撑住。'},
    {title:'你不用变得完美，<br>才值得被好好爱着。',desc:'不论什么模样的你都是格外的可爱值得深爱'},
    {title:'不要自己一个人偷偷的哭而难过',desc:'过去的事情已经翻篇，未来的你都会幸运加身'},
    {title:'往后的普通日子，<br>万事顺遂',desc:'生日只有一天，愿祝福伴随你往后生命的每一天'}
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
    confBtn.textContent = confessionIndex===5 ? '剩下的话，写在这封信里了' : '让我看看';
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
      finaleMessage.innerHTML = '新的一岁，你往前走。<br>幸福常伴';
      document.querySelector('#hug-btn').textContent='再贴贴一会儿';
      finaleNote.textContent='幸福每天。';
    } else {
      finaleNote.textContent=['再抱一会儿','每天爱不限量','希望你永远开心。'][hugs%3];
    }
  });


  // ==================== 音乐播放控制 ====================

  const musicButton = document.querySelector('#music-btn');
  const musicAudio = new Audio('./assets/music/birthday-recording.m4a');
  musicAudio.preload = 'metadata';
  musicAudio.loop = true;
  musicAudio.volume = 0.85;

  function setMusicButtonState(playing) {
    musicButton.querySelector('span').textContent = playing ? '音乐已开启' : '音乐已关闭';
    musicButton.setAttribute('aria-pressed', playing ? 'true' : 'false');
  }

  musicAudio.addEventListener('play', () => setMusicButtonState(true));
  musicAudio.addEventListener('pause', () => setMusicButtonState(false));
  musicAudio.addEventListener('ended', () => setMusicButtonState(false));

  // 自动播放被浏览器拦截时，等待用户第一次操作网页。
  let autoplayFallbackActive = Boolean(cfg.startMusic);

  function removeGestureFallback() {
    window.removeEventListener('pointerdown', resumeOnFirstGesture, true);
    window.removeEventListener('keydown', resumeOnFirstGesture, true);
    autoplayFallbackActive = false;
  }

  function resumeOnFirstGesture(event) {
    if (!autoplayFallbackActive) return;

    // 点击音乐开关时交给下面的 toggleMusic 处理，避免重复调用 play()。
    if (event.target?.closest?.('#music-btn')) return;

    musicAudio.play()
      .then(() => {
        removeGestureFallback();
      })
      .catch(() => {
        setMusicButtonState(false);
        // 播放失败时保留监听，等待下一次用户操作。
      });
  }

  // 页面打开时尝试自动播放；若浏览器拦截，则在首次点击或按键时尝试播放。
  if (cfg.startMusic) {
    window.addEventListener('pointerdown', resumeOnFirstGesture, true);
    window.addEventListener('keydown', resumeOnFirstGesture, true);

    musicAudio.play().then(() => {
      removeGestureFallback();
    }).catch(() => {
      // 浏览器禁止自动播放时，等待用户交互。
    });
  }

  // 音乐开关：播放时点击暂停，暂停时点击继续播放。
  async function toggleMusic() {
    if (!musicAudio.paused && !musicAudio.ended) {
      musicAudio.pause();
      removeGestureFallback();
      return;
    }

    try {
      if (musicAudio.ended) musicAudio.currentTime = 0;
      await musicAudio.play();
      removeGestureFallback();
    } catch {
      setMusicButtonState(false);
      notify('录音播放失败，请检查音频文件或浏览器播放权限');
    }
  }

  musicButton.addEventListener('click', toggleMusic);

  // ==================== 音乐播放控制结束 ====================


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


  setScene(0);
})();
