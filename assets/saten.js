/* Saten: gube izračuna senčilnik (WebGL), brez slik. Živi samo v uvodu domače strani.
   Riše neposredno v svoje platno, s 60 sličicami na sekundo, kadar je vidno; med drsenjem, ob odprtem meniju,
   v skritem zavihku in zunaj pogleda miruje. Na šibki napravi sam zniža ločljivost in nato hitrost.
   Brez WebGL ali brez pravega grafičnega pospeška ostane CSS preliv v ozadju ploskve. */
(function(){
  var el=document.querySelector('.saten');if(!el)return;

  var VS='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  var FS=[
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    'precision highp float;',
    '#else',
    'precision mediump float;',
    '#endif',
    'uniform vec2 uR,uZ,uK,uL;uniform vec4 uF;uniform float uS;',
    'uniform vec3 uSenca,uOsnova,uLesk;',
    'float greben(float c,float a,float c0,float k1,float k2,float am,float fr,float ph,float w){',
    '  c0+=.022*sin(ph+c0*7.);',
    '  float y=c0+k1*a+k2*a*a+am*sin(fr*a+ph),dy=k1+2.*k2*a+am*fr*cos(fr*a+ph);',
    '  float d=(c-y)*inversesqrt(1.+dy*dy);',
    '  d/=w*(d<0.?.72:1.3);',
    '  return exp(-d*d);',
    '}',
    'float visina(vec2 p){',
    '  vec2 q=p+uZ+vec2(.02*sin(3.1*p.y+uF.x),.015*sin(2.7*p.x-uF.y));',
    '  float a=dot(q,vec2(.91,-.41)),c=dot(q,vec2(.41,.91));',
    '  float h=.22*sin(c*4.2+.6*a+uF.z);',
    '  h+= 1.0*greben(c,a,-.50,.10,.55,.045,3.1, uF.x,     .090);',
    '  h+= .75*greben(c,a,-.29,.05,.45,.040,4.0, uF.y+1.3, .032);',
    '  h-= .85*greben(c,a,-.12,.15,.40,.055,2.6, uF.z+2.1, .120);',
    '  h+= .90*greben(c,a, .05,.10,.50,.045,3.6, uF.w+.7,  .026);',
    '  h+= 1.1*greben(c,a, .21,.00,.35,.065,2.2,-uF.x+2.9, .100);',
    '  h+= .70*greben(c,a, .39,.12,.45,.045,3.3,-uF.y+.4,  .038);',
    '  h-= .80*greben(c,a, .57,.08,.30,.055,2.8,-uF.z+1.8, .140);',
    '  return h;',
    '}',
    'float sum(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}',
    'void main(){',
    '  vec2 p=(gl_FragCoord.xy-.5*uR)/uS;mat2 R=mat2(uK.x,uK.y,-uK.y,uK.x);',   /* smer gub (zasuk), odvodi v smeri zaslona */
    '  float e=1./uS,h=visina(R*p),hx=visina(R*(p+vec2(e,0.))),hy=visina(R*(p+vec2(0.,e)));',
    '  vec3 n=normalize(vec3(-(hx-h)/e*.052,-(hy-h)/e*.052,1.));',
    '  vec3 L=normalize(vec3(-.5+uL.x,.55+uL.y,.68)),H=normalize(L+vec3(0.,0.,1.));',   /* luč sledi kazalcu */
    '  float d=clamp(dot(n,L)*.5+.5,0.,1.);d=d*d*(3.-2.*d);',
    '  float nh=max(dot(n,H),0.);',
    '  float s=.55*pow(nh,160.)+.3*pow(nh,28.);',
    '  float o=mix(.95,1.,smoothstep(-.9,.6,h));',
    '  float sv=1.-.035*smoothstep(.2,-.9,p.x-p.y);',
    '  vec3 col=mix(uSenca,uOsnova,d)*o*sv+uLesk*s;',
    '  col+=(sum(gl_FragCoord.xy)-.5)/255.;',
    '  gl_FragColor=vec4(col,1.);',
    '}'].join('\n');

  var BARVE={svetla:{senca:'#d3d7dc',osnova:'#f7f8f9',lesk:'#ffffff'},temna:{senca:'#060606',osnova:'#151617',lesk:'#3a3c40'}};
  function hex(h){return[parseInt(h.substr(1,2),16)/255,parseInt(h.substr(3,2),16)/255,parseInt(h.substr(5,2),16)/255]}

  var cv=document.createElement('canvas'),gl,u={};cv.setAttribute('aria-hidden','true');
  try{gl=cv.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power',
    preserveDrawingBuffer:false,failIfMajorPerformanceCaveat:!window.SATEN_VSILNO})}catch(e){}
  if(!gl)return;
  function senc(tip,src){var s=gl.createShader(tip);gl.shaderSource(s,src);gl.compileShader(s);return s}
  function pripravi(){
    var pr=gl.createProgram();
    gl.attachShader(pr,senc(gl.VERTEX_SHADER,VS));gl.attachShader(pr,senc(gl.FRAGMENT_SHADER,FS));
    gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return false;
    gl.useProgram(pr);
    var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    var a=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
    ['uR','uZ','uK','uL','uF','uS','uSenca','uOsnova','uLesk'].forEach(function(k){u[k]=gl.getUniformLocation(pr,k)});
    return true;
  }
  if(!pripravi())return;
  el.appendChild(cv);

  var manj=window.matchMedia('(prefers-reduced-motion: reduce)'),giblje=el.hasAttribute('data-giblje'),
      seme=parseFloat(el.getAttribute('data-seme'))||0,t=seme*7.3,TAU=Math.PI*2,
      LOCLJIVOST=[1.25,1,.8,.8],nivo=0,k=1,vidna=true,drsi=false,meni=false,nared=false,
      luc={x:0,y:0},cilj={x:0,y:0};

  /* velikost platna: mirna slika v polni ostrini, gibljiva v zmerni (gube so mehke, razlike ni videti) */
  function velikost(){
    var r=el.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
    k=(giblje&&!manj.matches)?Math.min(dpr,LOCLJIVOST[nivo]):Math.min(dpr,2);
    var w=Math.max(1,Math.round(r.width*k)),h=Math.max(1,Math.round(r.height*k));
    if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;return true}
    return false;
  }
  function izrisi(){
    var w=cv.width,h=cv.height,b=document.documentElement.getAttribute('data-theme')==='dark'?BARVE.temna:BARVE.svetla;
    gl.viewport(0,0,w,h);
    gl.uniform3fv(u.uSenca,hex(b.senca));gl.uniform3fv(u.uOsnova,hex(b.osnova));gl.uniform3fv(u.uLesk,hex(b.lesk));
    gl.uniform2f(u.uR,w,h);gl.uniform1f(u.uS,Math.max(Math.sqrt(w*w+h*h),1100*k)*.62);
    gl.uniform2f(u.uZ,Math.sin(seme*1.7)*.18,Math.cos(seme*1.3)*.12);
    gl.uniform2f(u.uK,1,0);
    gl.uniform2f(u.uL,giblje?luc.x:0,giblje?luc.y:0);
    gl.uniform4f(u.uF,(.15*t)%TAU,(-.11*t)%TAU,(.26*t)%TAU,(-.19*t)%TAU);
    gl.drawArrays(gl.TRIANGLES,0,3);
    if(!nared){nared=true;cv.classList.add('nared')}
  }

  /* zanka: največ 60 sličic (tudi na 120 Hz), samo kadar je saten viden in miren zaslon */
  var tece=false,okvir=0,zadnji=0,trajanja=[];
  function aktivna(){return giblje&&vidna&&!drsi&&!meni&&!document.hidden&&!manj.matches&&!gl.isContextLost()}
  function zanka(cas){
    if(!tece||!aktivna()){tece=false;return}
    okvir=requestAnimationFrame(zanka);
    var d=cas-zadnji;
    if(d<(nivo>2?31:14))return;
    zadnji=cas;
    /* prilagajanje: če naprava ne zmore 60 sličic, najprej zniža ločljivost, nato hitrost */
    trajanja.push(d);
    if(trajanja.length>=90){
      var s=trajanja.slice().sort(function(a,b){return a-b}),med=s[45];trajanja=[];
      if(med>(nivo>2?40:22)&&nivo<3){nivo++;velikost()}
    }
    var dt=Math.min(d/1000,.05),a=1-Math.pow(.93,dt*30);   /* mehčanje luči ni odvisno od hitrosti sličic */
    luc.x+=(cilj.x-luc.x)*a;luc.y+=(cilj.y-luc.y)*a;
    t+=dt;izrisi();
  }
  function zazeni(){
    if(tece||!aktivna())return;
    tece=true;zadnji=performance.now();trajanja=[];cancelAnimationFrame(okvir);okvir=requestAnimationFrame(zanka);
  }

  velikost();izrisi();zazeni();

  if('IntersectionObserver' in window)new IntersectionObserver(function(e){vidna=e[e.length-1].isIntersecting;zazeni()}).observe(el);
  /* med drsenjem miruje (že ob prvem dotiku kolesca ali zaslona), da ima drsenje vso moč naprave */
  var mir=0;
  function drsenje(){drsi=true;if(tece){tece=false;cancelAnimationFrame(okvir)}clearTimeout(mir);mir=setTimeout(function(){drsi=false;zazeni()},180)}
  ['scroll','wheel','touchstart'].forEach(function(d){window.addEventListener(d,drsenje,{passive:true})});
  window.addEventListener('pointermove',function(e){if(e.pointerType==='touch')return;cilj.x=(e.clientX/window.innerWidth-.5)*.7;cilj.y=-(e.clientY/window.innerHeight-.5)*.5},{passive:true});
  document.addEventListener('visibilitychange',zazeni);
  if(manj.addEventListener)manj.addEventListener('change',function(){velikost();izrisi();zazeni()});
  var cakam=0;
  function prilagodi(){clearTimeout(cakam);cakam=setTimeout(function(){if(velikost()&&!gl.isContextLost())izrisi()},100)}
  if(window.ResizeObserver)new ResizeObserver(prilagodi).observe(el);else window.addEventListener('resize',prilagodi);
  new MutationObserver(function(){meni=document.body.classList.contains('meni-odprt');zazeni()}).observe(document.body,{attributes:true,attributeFilter:['class']});
  new MutationObserver(function(){if(!gl.isContextLost())izrisi()}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  cv.addEventListener('webglcontextlost',function(e){e.preventDefault();tece=false;cancelAnimationFrame(okvir)});
  cv.addEventListener('webglcontextrestored',function(){if(pripravi()){izrisi();zazeni()}});
})();
