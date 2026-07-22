/* SmartClean – app.js */
(function(){
'use strict';

  /* ══ ROUTER ══
     Stran je zdaj večstranska (prave poti). navigate() ostaja zaradi
     združljivosti s starimi onclick klici v vsebini. */
  var URLS = {home:'/', onas:'/o-nas/', panoge:'/panoge/',
              faq:'/faq/', zaposlitev:'/zaposlitev/', kontakt:'/kontakt/'};
  function navigate(page, anchor) {
    location.href = (URLS[page] || '/') + (anchor ? '#' + anchor : '');
  }
  var currentPage = document.body.dataset.page || 'home';
  var activeCat   = 'vse';

  /* FLOATING CTA */
  function updateFloatingCta() {
    const cta = document.getElementById('floatingCta');
    if (!cta) return;
    cta.classList.toggle('visible', currentPage !== 'kontakt' && window.scrollY > 350);
  }
  window.addEventListener('scroll', () => {
    document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 20);
    updateFloatingCta();
  }, { passive:true });

  /* NAV HAMBURGER */
  var hb = document.getElementById('hamburger');
  if (hb) hb.addEventListener('click', () => {
    var open = hb.classList.toggle('open');
    document.getElementById('mobileMenu').classList.toggle('open', open);
    hb.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  function closeMenu() {
    document.getElementById('hamburger').classList.remove('open');
    document.getElementById('mobileMenu').classList.remove('open');
  }

  /* REVEAL */
  function setupReveal() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 55);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  }

  /* HOME */
  function setupHome() {
    setupCounters();
    setupLaundryAnim();
  }

  /* COUNTERS */
  function setupCounters() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.5 });
    document.querySelectorAll('.counter').forEach(el => obs.observe(el));
  }
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const start  = performance.now();
    const dur    = 1600;
    const step   = now => {
      const p    = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(ease * target);
      if (p < 1) requestAnimationFrame(step); else el.textContent = target;
    };
    requestAnimationFrame(step);
  }

  /* LAUNDRY SCROLL ANIMATION */
  function setupLaundryAnim() {
    const wrap = document.getElementById('laundryWrap');
    if (!wrap || window.innerWidth <= 860) return;

    let currentPhase = -1;

    function setPhase(phase) {
      if (phase === currentPhase) return;
      currentPhase = phase;
      document.querySelectorAll('.l-scene').forEach((el, i) => el.classList.toggle('active', i === phase));
      document.querySelectorAll('.l-text').forEach((el,  i) => el.classList.toggle('active', i === phase));
      const hint = document.getElementById('laundryHint');
      if (hint) hint.style.opacity = phase === 2 ? '0' : '1';
    }

    function onScroll() {
      const rect     = wrap.getBoundingClientRect();
      const scrolled = -rect.top;
      const total    = wrap.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, scrolled / total));
      setPhase(progress < 0.33 ? 0 : progress < 0.66 ? 1 : 2);
    }

    window.addEventListener('scroll', onScroll, { passive:true });
    setPhase(0);
    onScroll();
  }

  /* FAQ */
  function setupFaq() { activeCat = 'vse'; }
  function toggleAcc(btn) {
    const item = btn.closest('.acc-item');
    const body = item.querySelector('.acc-body');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.acc-item.open').forEach(i => { i.classList.remove('open'); i.querySelector('.acc-body').style.maxHeight = '0'; });
    if (!isOpen) { item.classList.add('open'); body.style.maxHeight = body.scrollHeight + 'px'; }
  }
  function setCat(btn) {
    document.querySelectorAll('.faq-cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCat = btn.dataset.cat;
    filterFaq();
  }
  function filterFaq() {
    const q = (document.getElementById('faqSearch')?.value || '').toLowerCase();
    let visible = 0;
    document.querySelectorAll('.acc-item').forEach(item => {
      const text = item.querySelector('.acc-trigger').textContent.toLowerCase() + item.querySelector('.acc-body-inner').textContent.toLowerCase();
      const ok   = (activeCat === 'vse' || item.dataset.cat.includes(activeCat)) && (!q || text.includes(q));
      item.style.display = ok ? '' : 'none';
      if (ok) visible++;
    });
    const nr = document.getElementById('noResults');
    if (nr) nr.style.display = visible === 0 ? 'block' : 'none';
  }

  /* ZAPOSLITEV */
  function setupZaposlitev() {
    const form = document.getElementById('applyForm');
    if (!form) return;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Pošiljanje …'; btn.disabled = true;
      try {
        const res  = await fetch('https://api.web3forms.com/submit', { method:'POST', body: new FormData(form) });
        const data = await res.json();
        if (data.success) {
          const msg = document.getElementById('applyMsg');
          msg.style.display = 'block';
          form.reset();
          document.getElementById('fileLabel').innerHTML = '📎 &nbsp;Priložite življenjepis (PDF, Word)<input type="file" accept=".pdf,.doc,.docx" onchange="updateFileLabel(this)"/>';
          setTimeout(() => msg.style.display = 'none', 6000);
        } else {
          alert('Napaka pri pošiljanju. Pišite nam na info@smartcleanofficial.com');
        }
      } catch { alert('Napaka pri pošiljanju. Pišite nam na info@smartcleanofficial.com'); }
      btn.textContent = 'Pošlji prijavo →'; btn.disabled = false;
    });
  }
  function updateFileLabel(input) {
    if (input.files[0]) document.getElementById('fileLabel').innerHTML = `✅ &nbsp;${input.files[0].name}<input type="file" accept=".pdf,.doc,.docx" onchange="updateFileLabel(this)" style="display:none"/>`;
  }

  /* KONTAKT */
  function setupKontakt() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('contactSubmitBtn');
      btn.textContent = 'Pošiljanje …';
      btn.disabled = true;
      try {
        const res  = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: new FormData(form)
        });
        const data = await res.json();
        if (data.success) {
          form.style.display = 'none';
          document.getElementById('form-success').style.display = 'block';
        } else {
          alert('Prišlo je do napake. Prosimo pišite nam neposredno na info@smartcleanofficial.com');
          btn.textContent = 'Pošlji sporočilo →';
          btn.disabled = false;
        }
      } catch {
        alert('Prišlo je do napake. Prosimo pišite nam neposredno na info@smartcleanofficial.com');
        btn.textContent = 'Pošlji sporočilo →';
        btn.disabled = false;
      }
    });
  }

  /* INIT */
  setupReveal();
  if (currentPage === 'faq')        setupFaq();
  if (currentPage === 'zaposlitev') setupZaposlitev();
  if (currentPage === 'kontakt')    setupKontakt();
  if (currentPage === 'home')     { setupHome(); setupProc(); }
  setupTheme();
  updateFloatingCta();


      function setupProc(){
        var STEPS = [
  {arc:"#4a90cc",bg:"rgba(45,111,163,.25)",border:"rgba(74,144,204,.22)",glow:"rgba(74,144,204,.18)"},
  {arc:"#a8e6c3",bg:"rgba(26,102,68,.25)",border:"rgba(168,230,195,.22)",glow:"rgba(45,138,94,.15)"},
  {arc:"#f0c456",bg:"rgba(196,154,42,.22)",border:"rgba(240,196,86,.25)",glow:"rgba(240,196,86,.15)"},
  {arc:"#c49a2a",bg:"rgba(196,154,42,.2)",border:"rgba(196,154,42,.22)",glow:"rgba(196,154,42,.12)"},
  {arc:"#a8e6c3",bg:"rgba(26,102,68,.25)",border:"rgba(168,230,195,.22)",glow:"rgba(45,138,94,.15)"},
];
        var N = STEPS.length;
        var cur = 0, raf = null, startTs = null;
        var DURATION = 3400;
        var circ = 810.5;

        function applyStep(idx, instant){
          var d = STEPS[idx];
          var disc = document.getElementById('procDisc');
          var arc  = document.getElementById('procArc');
          if(disc){disc.style.background=d.bg;disc.style.borderColor=d.border;disc.style.boxShadow='0 0 50px '+d.glow;}
          if(arc){arc.style.stroke=d.arc;if(instant)arc.style.strokeDashoffset=circ;}
          for(var i=0;i<N;i++){
            var on=(i===idx);
            var ic=document.getElementById('picon'+i);
            var st=document.getElementById('pstep'+i);
            var dt=document.getElementById('pdot'+i);
            if(ic){ic.classList.toggle('active',on);}
            if(st){st.classList.toggle('active',on);}
            if(dt){dt.classList.toggle('active',on);}
          }
        }

        function tick(ts){
          if(!startTs) startTs=ts;
          var frac=Math.min((ts-startTs)/DURATION,1);
          var arc=document.getElementById('procArc');
          if(arc) arc.style.strokeDashoffset=(circ*(1-frac)).toFixed(1);
          if(frac>=1){cur=(cur+1)%N;applyStep(cur,true);startTs=ts;}
          raf=requestAnimationFrame(tick);
        }

        window.procGoTo=function(idx){
          if(raf){cancelAnimationFrame(raf);raf=null;startTs=null;}
          cur=idx; applyStep(idx,true);
          var st2=null;
          function t2(ts){if(!st2)st2=ts;var f=Math.min((ts-st2)/DURATION,1);var a=document.getElementById('procArc');if(a)a.style.strokeDashoffset=(circ*(1-f)).toFixed(1);if(f>=1){cur=(cur+1)%N;applyStep(cur,true);st2=ts;}raf=requestAnimationFrame(t2);}
          raf=requestAnimationFrame(t2);
        };

        var obs=new IntersectionObserver(function(entries){
          entries.forEach(function(e){
            if(e.isIntersecting&&!raf){applyStep(cur,true);raf=requestAnimationFrame(tick);}
            else if(!e.isIntersecting&&raf){cancelAnimationFrame(raf);raf=null;startTs=null;}
          });
        },{threshold:0.3});

        var sec=document.getElementById('procSection')||document.querySelector('.proc-section');
        if(sec) obs.observe(sec);
        applyStep(0,true);
      }

  /* ══ PREKLOP TEME ══ */
  function setupTheme(){
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    var root = document.documentElement;
    var veil = document.createElement('div');
    veil.className = 'theme-veil';
    document.body.appendChild(veil);

    btn.addEventListener('click', function(){
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      veil.style.background = next === 'dark' ? '#0c1611' : '#faf7f2';
      veil.style.opacity = '1';
      setTimeout(function(){
        root.classList.add('theme-instant');
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('smartclean-theme', next); } catch(e){}
        requestAnimationFrame(function(){
          requestAnimationFrame(function(){
            root.classList.remove('theme-instant');
            veil.style.opacity = '0';
          });
        });
      }, 130);
    });
  }


  /* funkcije, ki jih kliče inline HTML (onclick/oninput) */
  window.navigate       = navigate;
  window.toggleAcc      = toggleAcc;
  window.setCat         = setCat;
  window.filterFaq      = filterFaq;
  window.updateFileLabel= updateFileLabel;

})();