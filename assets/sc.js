/* SmartClean — vedenje strani: tema, glava, meni, razkrivanje, obrazci. */
(function(){
'use strict';
var $=function(s,k){return(k||document).querySelector(s)},$$=function(s,k){return[].slice.call((k||document).querySelectorAll(s))};
var html=document.documentElement,telo=document.body,manjGibanja=window.matchMedia('(prefers-reduced-motion: reduce)');

/* ── tema (isti ključ kot prej, izbira se ohrani) ── */
var KLJUC='smartclean-theme';
function tema(t){
  html.setAttribute('data-theme',t);
  try{localStorage.setItem(KLJUC,t)}catch(e){}
  $$('[data-tema-gumb]').forEach(function(b){b.textContent=t==='dark'?'Svetla tema':'Temna tema'});
  var m=$('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='dark'?'#0a0a0a':'#ffffff');
}
tema(html.getAttribute('data-theme')==='dark'?'dark':'light');
$$('[data-tema-gumb]').forEach(function(b){b.addEventListener('click',function(){tema(html.getAttribute('data-theme')==='dark'?'light':'dark')})});

/* ── glava: črta ob drsenju ── */
var glava=$('.glava'),cakam=false;
function glavaStanje(){cakam=false;if(glava)glava.classList.toggle('odmaknjena',window.scrollY>4)}
window.addEventListener('scroll',function(){if(!cakam){cakam=true;requestAnimationFrame(glavaStanje)}},{passive:true});glavaStanje();

/* ── meni (telefon, tablica) ── */
(function(){
  var gumb=$('#meni-gumb'),meni=$('#meni');if(!gumb||!meni)return;
  var prej=null,spodaj=$$('main,footer');meni.inert=true;
  function odpri(){
    prej=document.activeElement;
    telo.classList.add('meni-odprt');gumb.setAttribute('aria-expanded','true');gumb.setAttribute('aria-label','Zapri meni');
    meni.removeAttribute('aria-hidden');meni.inert=false;spodaj.forEach(function(e){e.inert=true});
  }
  function zapri(vrni){
    telo.classList.remove('meni-odprt');gumb.setAttribute('aria-expanded','false');gumb.setAttribute('aria-label','Meni');
    meni.setAttribute('aria-hidden','true');meni.inert=true;spodaj.forEach(function(e){e.inert=false});
    if(vrni!==false&&prej&&prej.focus)prej.focus({preventScroll:true});
  }
  gumb.addEventListener('click',function(){telo.classList.contains('meni-odprt')?zapri():odpri()});
  $$('a',meni).forEach(function(a){a.addEventListener('click',function(){zapri(false)})});
  document.addEventListener('keydown',function(e){
    if(!telo.classList.contains('meni-odprt'))return;
    if(e.key==='Escape'){zapri();return}
    if(e.key!=='Tab')return;
    var f=[gumb].concat($$('a[href],button:not([disabled])',meni)),i=f.indexOf(document.activeElement);
    if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}
    else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}
  });
  window.addEventListener('resize',function(){if(window.innerWidth>1080&&telo.classList.contains('meni-odprt'))zapri(false)});
})();

/* ── razkrivanje ob drsenju ── */
(function(){
  var el=$$('[data-pokazi]');html.classList.add('js-ok');if(!el.length)return;
  if(!('IntersectionObserver' in window)||manjGibanja.matches||(window.performance&&performance.now()>2800)){el.forEach(function(e){e.classList.add('viden')});return}
  var io=new IntersectionObserver(function(v){v.forEach(function(x){if(x.isIntersecting){x.target.classList.add('viden');io.unobserve(x.target)}})},
    {rootMargin:'0px 0px -10% 0px',threshold:.01});
  el.forEach(function(e){io.observe(e)});
})();

/* ── delovno mesto: »Prijava« izbere mesto v obrazcu ── */
$$('[data-mesto]').forEach(function(a){
  a.addEventListener('click',function(){var s=$('#p-mesto');if(s)s.value=a.getAttribute('data-mesto')});
});

/* ── obrazci (Web3Forms) ── */
$$('form[data-w3f]').forEach(function(f){
  var hvala=$(f.getAttribute('data-hvala')),napaka=$('.obrazec-napaka',f),gumb=$('button[type="submit"]',f),napis=gumb?gumb.innerHTML:'';
  var ep=$('footer a[href^="mailto:"]'),tel=$('footer a[href^="tel:"]'),EP=ep?ep.textContent.trim():'';
  var dat=$('input[type="file"]',f),NAJVEC=5*1024*1024,STIK='Pišite nam na '+EP+(tel?' ali pokličite '+tel.textContent.trim():'')+'.';
  if(dat){var oz=$('.datoteka-ime',f),okvir=dat.closest('.datoteka');
    dat.addEventListener('change',function(){var d=dat.files&&dat.files[0];if(oz)oz.textContent=d?d.name:oz.getAttribute('data-privzeto');if(okvir)okvir.classList.toggle('izbrana',!!d)})}
  function sporoci(t){if(!napaka)return;napaka.textContent='';napaka.classList.add('je');setTimeout(function(){napaka.textContent=t},60)}
  function poslji(podatki){
    var ctrl=window.AbortController?new AbortController():null,ura=setTimeout(function(){if(ctrl)ctrl.abort()},30000);
    return fetch('https://api.web3forms.com/submit',{method:'POST',body:podatki,signal:ctrl?ctrl.signal:undefined})
      .then(function(r){clearTimeout(ura);return r.json().catch(function(){return{}})},function(e){clearTimeout(ura);throw e});
  }
  function uspeh(dodatek){
    f.hidden=true;if(!hvala)return;
    if(dodatek){var p=document.createElement('p');p.className='besedilo';p.textContent=dodatek;hvala.appendChild(p)}
    hvala.classList.add('je');hvala.setAttribute('tabindex','-1');hvala.focus();
  }
  f.addEventListener('submit',function(e){
    e.preventDefault();
    if(napaka)napaka.classList.remove('je');
    f.classList.add('poskus');
    if(!f.checkValidity()){f.reportValidity();return}
    var d=dat&&dat.files&&dat.files[0];
    if(d&&d.size>NAJVEC){sporoci('Življenjepis je večji od 5 MB. '+STIK);dat.focus();return}
    if(gumb){gumb.disabled=true;gumb.textContent='Pošiljanje …'}
    var podatki=new FormData(f);
    poslji(podatki).then(function(r){
      if(r&&r.success)return uspeh();
      if(!d)throw new Error('zavrnjeno');
      /* priponke morda niso na voljo: prijava gre brez življenjepisa, kandidat ga pošlje po e-pošti */
      podatki.delete('attachment');
      return poslji(podatki).then(function(r2){if(!r2||!r2.success)throw new Error('zavrnjeno');uspeh('Življenjepis nam pošljite na '+EP+'.')});
    }).catch(function(){
      if(gumb){gumb.disabled=false;gumb.innerHTML=napis}
      sporoci('Sporočila ni bilo mogoče poslati. '+STIK);
    });
  });
});

/* ── leto v nogi ── */
$$('[data-leto]').forEach(function(e){e.textContent=new Date().getFullYear()});
})();
