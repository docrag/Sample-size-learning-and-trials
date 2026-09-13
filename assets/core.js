/* ============================================================
   Shared core — statistics, tabs, explorer framework, chrome
   ============================================================ */
function pnorm(x){
  if(!isFinite(x)) return x>0?1:0;
  var z=Math.abs(x),c;
  if(z>37) c=0; else{
    var e=Math.exp(-z*z/2);
    if(z<7.07106781186547){
      var b=3.52624965998911e-2*z+0.700383064443688;
      b=b*z+6.37396220353165;b=b*z+33.912866078383;b=b*z+112.079291497871;
      b=b*z+221.213596169931;b=b*z+220.206867912376;
      var d=8.83883476483184e-2*z+1.75566716318264;
      d=d*z+16.064177579207;d=d*z+86.7807322029461;d=d*z+296.564248779674;
      d=d*z+637.333633378831;d=d*z+793.826512519948;d=d*z+440.413735824752;
      c=e*b/d;
    } else { var f=z+0.65;f=z+4/f;f=z+3/f;f=z+2/f;f=z+1/f;c=e/(f*2.506628274631); }
  }
  return x>0?1-c:c;
}
function qnorm(p){
  if(p<=0||p>=1) return p<=0?-Infinity:Infinity;
  var a=[-3.969683028665376e+01,2.209460984245205e+02,-2.759285104469687e+02,1.383577518672690e+02,-3.066479806614716e+01,2.506628277459239e+00],
      b=[-5.447609879822406e+01,1.615858368580409e+02,-1.556989798598866e+02,6.680131188771972e+01,-1.328068155288572e+01],
      c=[-7.784894002430293e-03,-3.223964580411365e-01,-2.400758277161838e+00,-2.549732539343734e+00,4.374664141464968e+00,2.938163982698783e+00],
      d=[7.784695709041462e-03,3.224671290700398e-01,2.445134137142996e+00,3.754408661907416e+00],pl=0.02425,q,r,x;
  if(p<pl){q=Math.sqrt(-2*Math.log(p));x=(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}
  else if(p<=1-pl){q=p-0.5;r=q*q;x=(((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);}
  else {q=Math.sqrt(-2*Math.log(1-p));x=-(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}
  var e=pnorm(x)-p,u=e*Math.sqrt(2*Math.PI)*Math.exp(x*x/2);
  return x-u/(1+x*u/2);
}
var sq=function(x){return x*x;};
var $=function(s,r){return (r||document).querySelector(s);};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
var esc=function(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');};
var num=function(x){return Math.ceil(x-1e-9).toLocaleString();};
function val(id){var e=document.getElementById(id);return e?parseFloat(e.value):NaN;}
function wire(ids,fn){ids.forEach(function(i){var e=document.getElementById(i);if(e){e.oninput=fn;e.onchange=fn;}});fn();}
function twoProp(p1,p2,k,alpha,power,cc){
  var dlt=Math.abs(p1-p2); if(dlt<1e-12||!(p1>0&&p1<1&&p2>0&&p2<1)) return null;
  var za=qnorm(1-alpha/2), zb=qnorm(power), pb=(p2+k*p1)/(1+k);
  var n=sq(za*Math.sqrt((1+1/k)*pb*(1-pb))+zb*Math.sqrt(p2*(1-p2)+p1*(1-p1)/k))/sq(dlt);
  if(cc) n=n/4*sq(1+Math.sqrt(1+2*(1+1/k)/(n*dlt)));
  return n;
}

/* ============================================================
   Author identity — edit these four lines to update everywhere
   ============================================================ */
var AUTHOR={
  name:"Raghavan Parthasarathy",
  creds:"MBBS, MD (Community Medicine), DNB (Community Medicine)",
  roles:["Public health specialist"],
  orcid:"0000-0001-6173-2238",
  linkedin:"https://www.linkedin.com/in/raghavan-parthasarathy-2786a9b9/"
};
function authorBlock(){
  var oc='https://orcid.org/'+AUTHOR.orcid;
  var liBad=/REPLACE-WITH/.test(AUTHOR.linkedin);
  return '<div class="author"><div class="author-in">'+
   '<div><h3>'+esc(AUTHOR.name)+(AUTHOR.creds?', '+esc(AUTHOR.creds):'')+'</h3>'+
   AUTHOR.roles.map(function(r){return '<div class="role">'+esc(r)+'</div>';}).join('')+
   '<p style="margin-top:.8rem;font-size:.92rem;color:var(--ink2)">These pages were written and built to be used while designing a study, not read once. '+
   'Every formula is shown with its derivation, every citation was checked at build time, and every figure is original. '+
   'Corrections and additions are welcome.</p>'+
   '<div class="links">'+
   '<a href="'+oc+'" target="_blank" rel="noopener">'+
     '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="2"/><rect x="7" y="9" width="2" height="9"/><circle cx="8" cy="6.6" r="1.3"/><path d="M11.5 9h3.6a4.5 4.5 0 0 1 0 9H11.5V9zm2 2v5h1.5a2.5 2.5 0 0 0 0-5H13.5z"/></svg>'+
     'ORCID '+esc(AUTHOR.orcid)+'</a>'+
   '<a href="'+AUTHOR.linkedin+'" target="_blank" rel="noopener"'+(liBad?' style="border-style:dashed;opacity:.75" title="Replace the placeholder handle in assets/core.js"':'')+'>'+
     '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76V21h-4v-5.6c0-1.33-.03-3.05-1.9-3.05-1.9 0-2.2 1.45-2.2 2.95V21h-4z"/></svg>'+
     'LinkedIn'+(liBad?' (set URL)':'')+'</a>'+
   '<a href="index.html">All modules</a>'+
   '</div></div>'+
   '<div class="colo"><div class="hd" style="font-family:var(--mono);font-size:.62rem;letter-spacing:.13em;text-transform:uppercase;color:var(--ink3);margin-bottom:.5rem">Colophon</div>'+
   '<p>Set in Fraunces, Spectral and IBM Plex Mono. Built as plain HTML, CSS and JavaScript with no framework and no tracking.</p>'+
   '<p>Citations marked <span class="pill ok">verified</span> had their authors, year, journal, volume and page range checked against PubMed, the publisher or an indexing service at build time. Those marked <span class="pill check">check</span> did not.</p>'+
   '<p><b>No page or equation numbers appear anywhere on this site.</b> Pagination shifts between editions and an invented page number is worse than none. Each reference carries a blank locator box to fill from your own copy.</p>'+
   '<p>All figures are original. Nothing is reproduced from any cited work.</p></div>'+
   '</div></div>';
}

/* ============================================================
   Chrome: masthead, theme, depth toggle
   ============================================================ */
function chrome(page){
  var nav=[['index.html','Home','home'],['observational.html','Observational','obs'],
           ['trials.html','Trials','tri'],['toolkit.html','Pitfall lab','lab']];
  return '<div class="mast"><div class="mast-in">'+
   '<a class="logo" href="index.html">'+
   '<svg class="mk" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M2 21 L2 3 M2 21 L22 21"/><path d="M4 17 L9 12 L13 15 L21 5" stroke="currentColor"/><circle cx="21" cy="5" r="1.8" fill="currentColor" stroke="none"/></svg>'+
   'Study design &amp; sample size</a>'+
   '<nav class="sitenav">'+nav.map(function(n){
      return '<a href="'+n[0]+'"'+(n[2]===page?' class="here"':'')+'>'+n[1]+'</a>';}).join('')+'</nav>'+
   '<button class="btn on" id="depthBtn">Derivations on</button>'+
   '<button class="btn" id="themeBtn">Dark</button>'+
   '<button class="btn" onclick="window.print()">Print</button>'+
   '</div></div>';
}
function initChrome(){
  var t=$('#themeBtn'); if(t) t.onclick=function(){
    var m=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
    document.documentElement.setAttribute('data-theme',m);
    try{localStorage.setItem('sds-theme',m);}catch(e){}
    this.textContent=m==='dark'?'Light':'Dark';
    XP.redrawAll();
  };
  var d=$('#depthBtn'); if(d) d.onclick=function(){
    var plain=document.body.classList.toggle('plain');
    this.textContent=plain?'Derivations off':'Derivations on';
    this.classList.toggle('on',!plain);
  };
  try{ var saved=localStorage.getItem('sds-theme');
    if(saved==='dark'){document.documentElement.setAttribute('data-theme','dark'); if(t) t.textContent='Light';}
  }catch(e){}
}

/* ============================================================
   Tabs
   ============================================================ */
function buildTabs(TABS, SECTIONS, EXPLORERS){
  var byId={}; SECTIONS.forEach(function(s){byId[s.id]=s;});
  var bar='', panes='';
  TABS.forEach(function(t,i){
    bar+='<button class="tab'+(i===0?' on':'')+'" data-t="'+t.key+'"><span class="n">'+
         String(i+1).padStart(2,'0')+'</span>'+esc(t.label)+'</button>';
    var inner='';
    t.sections.forEach(function(sid){
      var s=byId[sid]; if(!s) return;
      inner+='<section id="'+s.id+'"><span class="kicker">'+esc(t.label)+' &nbsp;/&nbsp; '+esc(s.nav)+'</span><h1>'+s.title+'</h1>'+s.html+'</section>';
    });
    (EXPLORERS||[]).filter(function(x){return x.tab===t.key;}).forEach(function(x){
      inner+='<div class="xp" id="xp-'+x.id+'"></div>';
    });
    panes+='<div class="tabpanel'+(i===0?' on':'')+'" data-t="'+t.key+'">'+inner+'</div>';
  });
  $('#tabbar').innerHTML=bar;
  $('#panes').innerHTML=panes;
  $$('.tab').forEach(function(b){
    b.onclick=function(){
      $$('.tab').forEach(function(x){x.classList.toggle('on',x===b);});
      $$('.tabpanel').forEach(function(p){p.classList.toggle('on',p.dataset.t===b.dataset.t);});
      history.replaceState(null,'','#'+b.dataset.t);
      window.scrollTo({top:0,behavior:'instant'});
      XP.redrawAll();
    };
  });
  var h=(location.hash||'').replace('#','');
  if(h){
    var hit=$$('.tab').filter(function(b){return b.dataset.t===h;})[0];
    if(hit) hit.click();
    else { var sec=document.getElementById(h);
      if(sec){ var pane=sec.closest('.tabpanel');
        if(pane){ var tb=$$('.tab').filter(function(b){return b.dataset.t===pane.dataset.t;})[0];
          if(tb){tb.click(); setTimeout(function(){sec.scrollIntoView();},60);} } } }
  }
}

/* ============================================================
   Explorer framework — sliders driving a live SVG plot
   ============================================================ */
var XP=(function(){
  var reg=[];
  function css(v){ return getComputedStyle(document.documentElement).getPropertyValue(v).trim()||'#888'; }
  function fmtNum(x){
    if(!isFinite(x)) return '—';
    var a=Math.abs(x);
    if(a>=10000) return Math.round(x).toLocaleString();
    if(a>=100) return x.toFixed(0);
    if(a>=10) return x.toFixed(1);
    if(a>=1) return x.toFixed(2);
    return x.toFixed(3);
  }
  function plot(spec,res){
    var narrow=(window.innerWidth||900)<760;
    var W=narrow?430:680, H=narrow?250:300, L=narrow?46:58, R=narrow?10:16, T=16, B=narrow?40:44;
    var FS=narrow?12.5:10, FL=narrow?13:10.5;
    var xs=[],ys=[];
    res.series.forEach(function(s){ s.pts.forEach(function(p){xs.push(p[0]);ys.push(p[1]);}); });
    if(!xs.length) return '<div class="note bad">No plottable values at these settings.</div>';
    var x0=(res.xMin!==undefined)?res.xMin:Math.min.apply(null,xs);
    var x1=(res.xMax!==undefined)?res.xMax:Math.max.apply(null,xs);
    var y0=(res.yMin!==undefined)?res.yMin:Math.min.apply(null,ys);
    var y1=(res.yMax!==undefined)?res.yMax:Math.max.apply(null,ys);
    if(y1<=y0) y1=y0+1;
    if(x1<=x0) x1=x0+1;
    var SX=function(x){return L+(x-x0)/(x1-x0)*(W-L-R);};
    var SY=function(y){return H-B-(y-y0)/(y1-y0)*(H-B-T);};
    var s='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" role="img">';
    /* gridlines */
    for(var g=0;g<=4;g++){
      var yv=y0+(y1-y0)*g/4, xv=x0+(x1-x0)*g/4;
      s+='<line x1="'+L+'" y1="'+SY(yv).toFixed(1)+'" x2="'+(W-R)+'" y2="'+SY(yv).toFixed(1)+'" stroke="'+css('--rule')+'" stroke-width="1"/>';
      s+='<text x="'+(L-7)+'" y="'+(SY(yv)+4).toFixed(1)+'" text-anchor="end" font-size="'+FS+'" fill="'+css('--ink3')+'" font-family="IBM Plex Mono,monospace">'+(res.yFmt?res.yFmt(yv):fmtNum(yv))+'</text>';
      s+='<text x="'+SX(xv).toFixed(1)+'" y="'+(H-B+16)+'" text-anchor="middle" font-size="'+FS+'" fill="'+css('--ink3')+'" font-family="IBM Plex Mono,monospace">'+(res.xFmt?res.xFmt(xv):fmtNum(xv))+'</text>';
    }
    /* reference bands / lines */
    (res.rules||[]).forEach(function(r){
      if(r.y!==undefined && r.y>=y0 && r.y<=y1)
        s+='<line x1="'+L+'" y1="'+SY(r.y).toFixed(1)+'" x2="'+(W-R)+'" y2="'+SY(r.y).toFixed(1)+'" stroke="'+css(r.color||'--ink3')+'" stroke-width="1.4" stroke-dasharray="5 4"/>'+
           '<text x="'+(W-R-4)+'" y="'+(SY(r.y)-5).toFixed(1)+'" text-anchor="end" font-size="'+FS+'" fill="'+css(r.color||'--ink3')+'" font-family="IBM Plex Mono,monospace">'+esc(r.lab||'')+'</text>';
      if(r.x!==undefined && r.x>=x0 && r.x<=x1)
        s+='<line x1="'+SX(r.x).toFixed(1)+'" y1="'+T+'" x2="'+SX(r.x).toFixed(1)+'" y2="'+(H-B)+'" stroke="'+css(r.color||'--ink3')+'" stroke-width="1.4" stroke-dasharray="5 4"/>';
    });
    /* series */
    res.series.forEach(function(ser){
      var d=ser.pts.filter(function(p){return isFinite(p[1]);})
        .map(function(p,i){return (i?'L':'M')+SX(p[0]).toFixed(1)+','+Math.max(T-30,Math.min(H-B+30,SY(p[1]))).toFixed(1);}).join(' ');
      s+='<path d="'+d+'" fill="none" stroke="'+css(ser.color||'--ox')+'" stroke-width="'+(ser.w||2.2)+'"'+
         (ser.dash?' stroke-dasharray="6 4"':'')+' stroke-linejoin="round"/>';
    });
    /* current-value marker */
    (res.marks||[]).forEach(function(mk){
      if(mk.x<x0||mk.x>x1) return;
      var cy=Math.max(T,Math.min(H-B,SY(mk.y)));
      s+='<line x1="'+SX(mk.x).toFixed(1)+'" y1="'+T+'" x2="'+SX(mk.x).toFixed(1)+'" y2="'+(H-B)+'" stroke="'+css('--ink')+'" stroke-width="1" opacity="0.45"/>'+
         '<circle cx="'+SX(mk.x).toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="5" fill="'+css('--ink')+'"/>'+
         '<circle cx="'+SX(mk.x).toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="2" fill="'+css('--card')+'"/>';
      if(mk.lab) s+='<text x="'+(SX(mk.x)+9).toFixed(1)+'" y="'+(cy-8).toFixed(1)+'" font-size="'+FL+'" fill="'+css('--ink')+'" font-family="IBM Plex Mono,monospace">'+esc(mk.lab)+'</text>';
    });
    s+='<line x1="'+L+'" y1="'+(H-B)+'" x2="'+(W-R)+'" y2="'+(H-B)+'" stroke="'+css('--ink')+'" stroke-width="1.4"/>';
    s+='<line x1="'+L+'" y1="'+T+'" x2="'+L+'" y2="'+(H-B)+'" stroke="'+css('--ink')+'" stroke-width="1.4"/>';
    s+='<text x="'+((L+W-R)/2)+'" y="'+(H-8)+'" text-anchor="middle" font-size="'+FL+'" fill="'+css('--ink2')+'" font-family="IBM Plex Mono,monospace">'+esc(res.xLab||'')+'</text>';
    s+='<text x="3" y="'+(FL+1)+'" font-size="'+FL+'" fill="'+css('--ink2')+'" font-family="IBM Plex Mono,monospace">'+esc(res.yLab||'')+'</text>';
    s+='</svg>';
    var key=res.series.filter(function(x){return x.name;}).map(function(x){
      return '<span><i style="background:'+css(x.color||'--ox')+'"></i>'+esc(x.name)+'</span>';}).join('');
    return s+(key?'<div class="xp-key">'+key+'</div>':'');
  }
  function render(spec){
    var host=document.getElementById('xp-'+spec.id); if(!host) return;
    var v={}; spec.sliders.forEach(function(s){v[s.k]=(spec._v&&spec._v[s.k]!==undefined)?spec._v[s.k]:s.def;});
    spec._v=v;
    var ctrl=spec.sliders.map(function(s){
      return '<div class="sl"><div class="lab"><span>'+esc(s.lab)+'</span><b id="lv-'+spec.id+'-'+s.k+'">'+
        (s.fmt?s.fmt(v[s.k]):v[s.k])+'</b></div>'+
        '<input type="range" id="sl-'+spec.id+'-'+s.k+'" min="'+s.min+'" max="'+s.max+'" step="'+s.step+'" value="'+v[s.k]+'"></div>';
    }).join('');
    host.innerHTML='<div class="xp-head"><span class="tag">Explore</span><span class="ttl">'+esc(spec.title)+'</span></div>'+
      '<div class="xp-body"><div class="xp-blurb">'+spec.blurb+'</div>'+
      '<div class="xp-grid"><div id="pl-'+spec.id+'"></div>'+
      '<div class="xp-ctrl">'+ctrl+'<div class="xp-read" id="rd-'+spec.id+'"></div></div></div></div>'+
      (spec.foot?'<div class="xp-foot">'+spec.foot+'</div>':'');
    spec.sliders.forEach(function(s){
      var el=document.getElementById('sl-'+spec.id+'-'+s.k);
      el.oninput=function(){
        spec._v[s.k]=parseFloat(el.value);
        document.getElementById('lv-'+spec.id+'-'+s.k).textContent=s.fmt?s.fmt(spec._v[s.k]):spec._v[s.k];
        draw(spec);
      };
    });
    draw(spec);
  }
  function draw(spec){
    var res;
    try{ res=spec.compute(spec._v); }catch(e){ res=null; }
    var pl=document.getElementById('pl-'+spec.id), rd=document.getElementById('rd-'+spec.id);
    if(!pl) return;
    if(!res||res.error){
      var msg=(res&&res.error)?res.error:'Those settings are outside the range this model can represent.';
      pl.innerHTML='<div class="note bad" style="margin:0">'+msg+'</div>';
      if(rd) rd.innerHTML='<div class="hd">Not computable</div><div class="xp-v warn">\u2014</div>'+
        '<div style="margin-top:.45rem;color:var(--ink2);font-size:.86rem">Move a slider back into a feasible range.</div>';
      return;
    }
    pl.innerHTML=plot(spec,res);
    if(rd) rd.innerHTML='<div class="hd">'+esc(res.readHead||'At these settings')+'</div>'+
      '<div class="xp-v '+(res.verdict||'')+'">'+res.readValue+'</div>'+
      '<div style="margin-top:.45rem;color:var(--ink2);font-size:.86rem">'+res.readNote+'</div>';
  }
  var rz=null;
  window.addEventListener('resize',function(){
    clearTimeout(rz);
    rz=setTimeout(function(){ reg.forEach(function(sp){ if(document.getElementById('pl-'+sp.id)) draw(sp); }); },220);
  });
  return {
    add:function(spec){reg.push(spec);},
    renderAll:function(){reg.forEach(render);},
    redrawAll:function(){reg.forEach(function(s){ if(document.getElementById('pl-'+s.id)) draw(s); });},
    list:function(){return reg;}
  };
})();

/* ============================================================
   References renderer (shared)
   ============================================================ */
function renderRefs(REFS, order, heads, hostSel, btnSel){
  var LOC={}, host=$(hostSel); if(!host) return;
  var h='';
  order.forEach(function(k){
    var r=REFS[k]; if(!r) return;
    if(heads[k]) h+='<h3>'+heads[k]+'</h3>';
    h+='<div class="ref"><span class="pill '+(r.checked?'ok">verified':'check">check')+'</span>'+
       '<b>'+esc(r.a)+'</b> ('+r.y+'). '+esc(r.t)+'. <em>'+esc(r.s)+'</em>.'+
       '<div style="color:var(--ink2);font-size:.87rem;margin-top:.3rem">'+esc(r.why)+'</div>'+
       '<div class="loc"><label style="margin:0;font-size:.72rem">Locator</label><input data-ref="'+k+'" placeholder="e.g. p. 27, eqn 4.3">'+
       (r.link?'<a class="lk" href="'+r.link+'" target="_blank" rel="noopener">source &#8599;</a>':'')+'</div></div>';
  });
  host.innerHTML=h;
  $$(hostSel+' input[data-ref]').forEach(function(i){i.oninput=function(){LOC[i.dataset.ref]=i.value;};});
  var btn=$(btnSel); if(btn) btn.onclick=function(){
    var out=order.map(function(k,i){var r=REFS[k];return r?((i+1)+'. '+r.a+'. '+r.t+'. '+r.s+'.'+(LOC[k]?' '+LOC[k]+'.':'')):'';}).filter(Boolean).join('\n');
    if(navigator.clipboard) navigator.clipboard.writeText(out);
    else{var ta=document.createElement('textarea');ta.value=out;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();}
    this.textContent='Copied'; var b=this; setTimeout(function(){b.textContent='Copy the reference list';},1600);
  };
}
