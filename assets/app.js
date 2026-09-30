/* SmartClean — app.js
   Brez odvisnosti. Vse vedenje strani na enem mestu. */
(function () {
'use strict';

var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var $  = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

/* ══ TEMA ══
   Menjava ne sme utripniti. Postopek (prevzet s eflitte.si):
   1) tančica v barvi TRENUTNEGA ozadja se pogrne čez stran,
   2) pod njo zamenjamo temo BREZ kakršnegakoli prehoda,
   3) tančica odplava in razkrije novo temo.
   Pri „zmanjšaj gibanje" prehoda ne odstranimo — tančica se ne premika,
   le bledi. Le skrajšamo ga. */
(function () {
  var KEY = 'smartclean-theme', root = document.documentElement;
  var veil = document.querySelector('.theme-veil');

  function apply(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem(KEY, t); } catch (e) {}
    $$('.theme-btn').forEach(function (b) {
      b.setAttribute('aria-label', t === 'dark' ? 'Preklopi na svetlo temo' : 'Preklopi na temno temo');
    });
  }

  function toggle() {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    if (!veil) { apply(next); return; }
    if (veil.dataset.busy === '1') return;
    veil.dataset.busy = '1';
    var tIn = reduce ? 80 : 110, tOut = reduce ? 110 : 170;
    veil.style.transition = 'opacity ' + tIn + 'ms linear';
    veil.style.background = getComputedStyle(document.body).backgroundColor;
    veil.style.opacity = '1';
    setTimeout(function () {
      root.classList.add('theme-instant');
      apply(next);
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        root.classList.remove('theme-instant');
        veil.style.transition = 'opacity ' + tOut + 'ms linear';
        veil.style.opacity = '0';
        setTimeout(function () { veil.dataset.busy = ''; }, tOut + 40);
      }); });
    }, tIn + 5);
  }

  $$('.theme-btn').forEach(function (b) { b.addEventListener('click', toggle); });
  apply(root.getAttribute('data-theme') || 'light');
})();

/* ══ ANIMACIJE SAMO NA ZASLONU ══
   Odseki zunaj vidnega polja ne smejo vrteti animacij. rootMargin 300 px,
   da se odsek prebudi PREDEN pride v polje — zamrznjenih sličic se ne vidi. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  var secs = $$('section,footer'); if (!secs.length) return;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target.classList.toggle('off-screen', !e.isIntersecting); });
  }, { rootMargin: '300px 0px' });
  secs.forEach(function (s) { io.observe(s); });
})();


/* ══ NASLOV PO BESEDAH ══
   Vsaka beseda pride zase. Ločilo ne šteje kot svoja enota — potuje z
   besedo pred sabo, sicer „blestite" in pika prideta narazen. */
(function () {
  var heads = $$('[data-pop]'); if (!heads.length) return;
  var BASE = 150, STEP = 52;

  function split(root) {
    var units = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          if (!child.textContent.trim()) return;
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (!part.trim()) { frag.appendChild(document.createTextNode(' ')); return; }
            var sp = document.createElement('span');
            sp.className = 'hero-w';
            sp.textContent = part;
            frag.appendChild(sp);
            units.push(sp);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    })(root);
    return units;
  }

  var i = 0;
  heads.forEach(function (h) {
    split(h).forEach(function (u) {
      // enota, ki nima nobene črke ali števke, je samo ločilo → ne dobi svojega takta
      var solo = /[\p{L}\p{N}]/u.test(u.textContent);
      if (solo || i === 0) i++;
      u.style.setProperty('--wd', (BASE + Math.max(0, i - 1) * STEP) + 'ms');
    });
  });

  function enter() {
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      document.body.classList.add('entered');
    }); });
  }
  if (document.readyState === 'complete') enter();
  else window.addEventListener('load', enter, { once: true });
})();

/* ══ DRSEČI POUDAREK V NAVIGACIJI ══ */
(function () {
  var list = $('.nav-links'); if (!list) return;
  var slider = document.createElement('span');
  slider.className = 'nav-slider'; slider.setAttribute('aria-hidden', 'true');
  list.insertBefore(slider, list.firstChild);
  var items = $$('.nav-link', list); if (!items.length) return;
  var home = items.filter(function (a) { return a.getAttribute('aria-current') === 'page'; })[0];

  function move(el, instant) {
    var r = el.getBoundingClientRect(), lr = list.getBoundingClientRect();
    if (instant) slider.style.transition = 'none';
    slider.style.transform = 'translateX(' + (r.left - lr.left) + 'px)';
    slider.style.width = r.width + 'px';
    list.classList.add('slide-on');
    if (instant) requestAnimationFrame(function () { slider.style.transition = ''; });
  }
  items.forEach(function (el) {
    el.addEventListener('mouseenter', function () { move(el); });
    el.addEventListener('focus', function () { move(el); });
  });
  list.addEventListener('mouseleave', function () {
    if (home) move(home); else list.classList.remove('slide-on');
  });
  if (home) requestAnimationFrame(function () { move(home, true); });
  window.addEventListener('resize', function () {
    var on = list.classList.contains('slide-on') && home;
    if (on) move(home, true);
  });
})();

/* ══ GLAVA ══ */
(function () {
  var nav = $('#nav'); if (!nav) return;
  // ozadje in črta ne prideta naenkrat — pojemata z drsenjem (0 → 1 pri 72px)
  function onScroll() {
    var y = window.scrollY || 0;
    nav.classList.toggle('scrolled', y > 8);
    nav.style.setProperty('--nav-p', Math.min(1, Math.max(0, y / 72)).toFixed(3));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ══ PREDAL (mobilna navigacija) ══ */
(function () {
  var burger = $('#burger'), drawer = $('#drawer'); if (!burger || !drawer) return;
  var lastFocus = null;
  function open() {
    lastFocus = document.activeElement;
    document.body.classList.add('drawer-open');
    burger.setAttribute('aria-expanded', 'true');
    drawer.removeAttribute('aria-hidden');
    var first = $('a,button', drawer); if (first) setTimeout(function () { first.focus(); }, 180);
  }
  function close() {
    document.body.classList.remove('drawer-open');
    burger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    if (lastFocus) lastFocus.focus();
  }
  burger.addEventListener('click', function () {
    document.body.classList.contains('drawer-open') ? close() : open();
  });
  $$('a', drawer).forEach(function (a) { a.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) close();
  });
  // ujemi fokus v predalu
  drawer.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = $$('a[href],button:not([disabled])', drawer).filter(function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1010 && document.body.classList.contains('drawer-open')) close();
  });
})();

/* ══ RAZKRIVANJE OB DRSENJU ══ */
(function () {
  var els = $$('[data-reveal]'); if (!els.length) return;
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('shown'); }); return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('shown'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach(function (el) { io.observe(el); });
  // varovalo — vsebina ne sme nikoli ostati skrita
  setTimeout(function () {
    var shown = els.filter(function (el) { return el.classList.contains('shown'); }).length;
    if (shown === 0) {
      // opazovalec očitno ne dela — pokaži vse, animacija je manj pomembna od vsebine
      els.forEach(function (el) { el.classList.add('shown'); });
      return;
    }
    els.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('shown');
    });
  }, 2500);
})();

/* ══ ŠTEVILKE ══
   Brez animacije štetja. Vrednosti so majhne (50, 24, 5, 1) — animacija ni
   prinesla nič, je pa dvakrat povzročila, da je stran pokazala ničle.
   Prava vrednost stoji v HTML in je vedno pravilna, tudi brez JS. */

/* ══ LEBDEČI TEKSTIL — paralaksa ══ */
(function () {
  var box = $('.floaters'); if (!box || reduce) return;
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
  var raf = null, tx = 0, ty = 0;
  window.addEventListener('mousemove', function (e) {
    var cx = (e.clientX / window.innerWidth  - .5);
    var cy = (e.clientY / window.innerHeight - .5);
    tx = cx * -22; ty = cy * -14;
    if (!raf) raf = requestAnimationFrame(function () {
      box.style.setProperty('--px', tx.toFixed(1) + 'px');
      box.style.setProperty('--py', ty.toFixed(1) + 'px');
      raf = null;
    });
  }, { passive: true });
})();

/* ══ PREDIZBIRA SEKTORJA IZ POVEZAVE ══ */
(function () {
  var sel = document.getElementById('f-sektor'); if (!sel) return;
  var key = ''; try { key = new URLSearchParams(location.search).get('sektor') || ''; } catch (e) {}
  if (!key) return;
  var MAP = { hoteli: 'Hoteli', gostinstvo: 'Restavracije', industrija: 'Industrija',
              zdravstvo: 'Zdravstvo', facility: 'Facility' };
  var needle = (MAP[key] || key).toLowerCase();
  for (var i = 0; i < sel.options.length; i++) {
    if (sel.options[i].text.toLowerCase().indexOf(needle) === 0) { sel.selectedIndex = i; break; }
  }
})();

/* ══ BOBEN — pralni cikel ══ */
(function () {
  var machine = $('#machine'); if (!machine) return;
  var cycle   = machine.closest('.cycle') || machine.parentNode;
  var btns    = $$('.step-btn', cycle);
  var hudV    = $('#hudV'), hudP = $('#hudP'), hudU = $('#hudU');
  var play    = $('#cyclePlay');
  var items   = $$('.drum-item', machine);
  var n = btns.length || 5;
  var i = 0, timer = null, manual = false;

  var HUD = [
    { p: 'PREVZEM',  v: 'Pri vas',  u: 'po dogovoru' },
    { p: 'PRANJE',   v: 'Program',  u: 'po vrsti tekstila' },
    { p: 'LIKANJE',  v: 'Para',     u: 'in apretiranje' },
    { p: 'ZLAGANJE', v: 'Zloženo',  u: 'in zapakirano' },
    { p: 'DOSTAVA',  v: '24–48 h',  u: 'standardni rok' }
  ];

  // razporedi kose po bobnu
  items.forEach(function (el, k) {
    el.style.setProperty('--a', (k * (360 / items.length)) + 'deg');
    el.style.setProperty('--wd', (k * .42).toFixed(2) + 's');
    el.style.setProperty('--stack', ((k - (items.length - 1) / 2) * 17).toFixed(0) + 'px');
  });

  function paint(k) {
    i = ((k % n) + n) % n;
    machine.setAttribute('data-step', String(i + 1));
    btns.forEach(function (b, j) {
      b.setAttribute('aria-current', j === i ? 'true' : 'false');
    });
    if (hudP) hudP.textContent = HUD[i].p;
    if (hudV) hudV.textContent = HUD[i].v;
    if (hudU) hudU.textContent = HUD[i].u;
  }
  function next() { paint(i + 1); }
  function start() {
    if (reduce || manual) return;
    stop(); timer = setInterval(next, 4600);
    cycle.classList.remove('is-paused');
    if (play) play.removeAttribute('aria-pressed');
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function halt() {
    manual = true; stop();
    cycle.classList.add('is-paused');
    if (play) play.removeAttribute('aria-pressed');
  }

  btns.forEach(function (b, k) {
    b.addEventListener('click', function () { paint(k); halt(); });
  });
  if (play) {
    if (reduce) {
      // brez animacije cikel ne teče — gumb naj koraka naprej, ne ustavlja
      play.addEventListener('click', function () { next(); });
      var lbl = play.querySelector('.play');
      if (lbl) lbl.textContent = 'Naslednji korak';
    } else {
      play.addEventListener('click', function () {
        if (manual) { manual = false; start(); } else { halt(); }
      });
    }
  }
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });

  paint(0);
  if (!('IntersectionObserver' in window)) { start(); return; }
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) { e.isIntersecting ? start() : stop(); });
  }, { threshold: .25 });
  io.observe(machine);
})();

/* ══ IZBIRNIK PANOG ══ */
(function () {
  var tabs = $$('.sect-tabs .sect-tab[data-p]'); if (!tabs.length) return;
  var panels = $$('.sect-panel');
  function show(id, focus) {
    if (!id) return;
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-p') === id;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    panels.forEach(function (p) { p.classList.toggle('is-on', p.id === id); });
  }
  tabs.forEach(function (t, k) {
    t.addEventListener('click', function () { show(t.getAttribute('data-p')); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var nx = tabs[(k + d + tabs.length) % tabs.length];
      show(nx.getAttribute('data-p'), true);
    });
  });
  var on = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0];
  show((on || tabs[0]).getAttribute('data-p'));
})();

/* ══ FAQ ══ */
(function () {
  var items = $$('.faq-item'); if (!items.length) return;

  // Zaprt odgovor mora izginiti tudi za bralnik zaslona in tabulator.
  // Uporabimo inert (in aria-hidden), NE hidden/display:none — display:none
  // ubije prehod višine, ker prehod nima izhodiščne vrednosti.
  var DUR = 380;
  function shut(q, a, animate) {
    q.setAttribute('aria-expanded', 'false');
    // izhodiščno vrednost nastavi eksplicitno, sicer prehod nima od kod steči
    a.style.transition = 'none';
    a.style.height = a.firstElementChild.offsetHeight + 'px';
    void a.offsetHeight;
    a.style.transition = animate === false ? 'none' : 'height ' + DUR + 'ms cubic-bezier(.22,.8,.3,1)';
    a.style.height = '0px';
    var tidy = function () {
      if (q.getAttribute('aria-expanded') !== 'false') return;
      a.inert = true; a.setAttribute('aria-hidden', 'true');
      a.removeEventListener('transitionend', tidy);
      clearTimeout(a._t);
    };
    a.removeEventListener('transitionend', tidy);
    a.addEventListener('transitionend', tidy);
    clearTimeout(a._t);
    a._t = setTimeout(tidy, animate === false ? 0 : DUR + 80);
  }

  function open(q, a) {
    clearTimeout(a._t);
    a.inert = false; a.removeAttribute('aria-hidden');
    q.setAttribute('aria-expanded', 'true');
    a.style.transition = 'none';
    a.style.height = '0px';
    void a.offsetHeight;                       // zapri prehodu izhodišče
    a.style.transition = 'height ' + DUR + 'ms cubic-bezier(.22,.8,.3,1)';
    a.style.height = a.firstElementChild.offsetHeight + 'px';
    // po koncu pusti auto, da se vsebina lahko prelomi ob spremembi širine
    clearTimeout(a._o);
    a._o = setTimeout(function () {
      if (q.getAttribute('aria-expanded') === 'true') a.style.height = 'auto';
    }, DUR + 40);
  }

  items.forEach(function (it) {
    var q = $('.faq-q', it), a = $('.faq-a', it);
    if (!q || !a) return;
    a.inert = true; a.setAttribute('aria-hidden', 'true');   // izhodiščno stanje
    q.addEventListener('click', function () {
      var isOpen = q.getAttribute('aria-expanded') === 'true';
      items.forEach(function (o) {
        if (o === it) return;
        var oq = $('.faq-q', o), oa = $('.faq-a', o);
        if (oq && oa && oq.getAttribute('aria-expanded') === 'true') shut(oq, oa);
      });
      isOpen ? shut(q, a) : open(q, a);
    });
  });

  window.addEventListener('resize', function () {
    items.forEach(function (it) {
      var q = $('.faq-q', it), a = $('.faq-a', it);
      if (q && a && q.getAttribute('aria-expanded') === 'true')
        a.style.height = 'auto';
    });
  });

  // filtri
  var fbtns = $$('.faq-filters .sect-tab'); if (!fbtns.length) return;
  var empty = $('#faqEmpty'), live = $('#faqLive');
  fbtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var cat = b.getAttribute('data-cat');
      fbtns.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      var shown = 0;
      items.forEach(function (it) {
        var ok = cat === 'vse' || it.getAttribute('data-cat') === cat;
        it.hidden = !ok; if (ok) shown++;
        var q = $('.faq-q', it), a = $('.faq-a', it);
        if (q && a && q.getAttribute('aria-expanded') === 'true') shut(q, a, false);
      });
      if (empty) empty.hidden = shown > 0;
      if (live) live.textContent = shown
        ? shown + (shown === 1 ? ' vprašanje' : shown === 2 ? ' vprašanji' : shown < 5 ? ' vprašanja' : ' vprašanj')
        : 'Ni zadetkov.';
    });
  });
})();

/* ══ OBRAZCI (Web3Forms) ══ */
(function () {
  var forms = $$('form[data-w3f]'); if (!forms.length) return;
  forms.forEach(function (form) {
    var ok  = $(form.getAttribute('data-success'));
    var err = $('.form-err', form);
    var btn = $('button[type="submit"]', form);
    var label = btn ? btn.innerHTML : '';

    // ime izbrane datoteke
    var file = $('input[type="file"]', form);
    if (file) {
      var out = $('.file-name', form);
      file.addEventListener('change', function () {
        if (out) out.textContent = file.files && file.files[0] ? file.files[0].name : 'Izberite datoteko …';
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (err) { err.classList.remove('is-on'); }
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (btn) { btn.disabled = true; btn.innerHTML = 'Pošiljanje …'; }

      fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(form) })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.success) {
            form.style.display = 'none';
            if (ok) { ok.classList.add('is-on'); ok.setAttribute('tabindex', '-1'); ok.focus(); }
          } else { throw new Error(d && d.message ? d.message : 'napaka'); }
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.innerHTML = label; }
          if (err) { err.classList.add('is-on'); err.textContent =
            'Sporočila ni bilo mogoče poslati. Pišite nam neposredno na info@smartcleanofficial.com ali pokličite +386 41 209 676.'; }
        });
    });
  });
})();

/* ══ LETO V NOGI ══ */
$$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

})();
