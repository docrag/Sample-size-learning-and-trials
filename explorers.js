/* ============================================================
   PITFALL EXPLORERS
   Each one takes a single pitfall and lets you drag it until you
   can see what it does to the answer.
   ============================================================ */
var pct=function(x){return (x*100).toFixed(0)+'%';};
var pct1=function(x){return (x*100).toFixed(1)+'%';};
var f2=function(x){return x.toFixed(2);};
var f1=function(x){return x.toFixed(1);};
var f0=function(x){return String(Math.round(x));};
var EXPLORERS=[];

/* ---------- 1. Precision buys badly (foundations) ---------- */
EXPLORERS.push({id:'precision',tab:'found',
 title:'Why precision is so expensive',
 blurb:'A confidence interval narrows with the <b>square root</b> of the sample. Drag the precision you want and watch the cost. This single curve explains more disappointing budget meetings than any other fact in study design.',
 sliders:[
  {k:'p',lab:'Anticipated prevalence',min:0.02,max:0.5,step:0.01,def:0.15,fmt:pct},
  {k:'d',lab:'Precision you want (± points)',min:0.005,max:0.10,step:0.005,def:0.03,fmt:function(x){return (x*100).toFixed(1);}}
 ],
 compute:function(v){
  var z=qnorm(0.975), pts=[];
  for(var d=0.005;d<=0.105;d+=0.0025) pts.push([d*100, sq(z)*v.p*(1-v.p)/sq(d)]);
  var n=sq(z)*v.p*(1-v.p)/sq(v.d);
  var half=sq(z)*v.p*(1-v.p)/sq(v.d/2);
  return {series:[{name:'Sample required',pts:pts,color:'--ox'}],
   xLab:'PRECISION ± PERCENTAGE POINTS', yLab:'SAMPLE SIZE', xMin:0, xMax:10, yMin:0,
   marks:[{x:v.d*100,y:n,lab:Math.ceil(n).toLocaleString()}],
   readHead:'Sample required', readValue:Math.ceil(n).toLocaleString(),
   verdict:n>3000?'bad':(n>800?'warn':'good'),
   readNote:'Halving your interval to ±'+((v.d/2)*100).toFixed(2)+' points would need <b>'+Math.ceil(half).toLocaleString()+
     '</b> — four times as many people for twice the precision. That factor of four is not negotiable; it is what the square root in the standard error does.'};
 },
 foot:'Simple random sampling, 95% confidence. Multiply by a design effect for clustered sampling and divide by expected response.'});

/* ---------- 2. Odds ratio vs risk ratio ---------- */
EXPLORERS.push({id:'orrr',tab:'cc',
 title:'When the odds ratio stops approximating the risk ratio',
 blurb:'Cornfield\'s approximation holds when the outcome is rare. Drag the baseline risk to the right and watch the two measures separate. Every point where the coloured curve sits above the dashed line is an overstatement waiting to be quoted as a risk ratio.',
 sliders:[{k:'or',lab:'Odds ratio you would report',min:1.1,max:6,step:0.1,def:3,fmt:f1}],
 compute:function(v){
  var rr=[],flat=[],p;
  for(p=0.002;p<=0.6;p+=0.004){ rr.push([p*100, v.or/((1-p)+p*v.or)]); flat.push([p*100, v.or]); }
  var mkp=0.30, mk=v.or/((1-mkp)+mkp*v.or);
  return {series:[
    {name:'Odds ratio (what you report)',pts:flat,color:'--ink3',dash:true,w:1.6},
    {name:'True risk ratio',pts:rr,color:'--ox'}],
   xLab:'BASELINE RISK IN THE UNEXPOSED (%)', yLab:'RATIO', xMin:0,xMax:60,yMin:1,
   rules:[{y:1,lab:'no effect',color:'--ink3'}],
   marks:[{x:mkp*100,y:mk,lab:'RR '+mk.toFixed(2)}],
   readHead:'At 30% baseline risk',
   readValue:'RR '+mk.toFixed(2),
   verdict:(v.or-mk)/mk>0.35?'bad':((v.or-mk)/mk>0.15?'warn':'good'),
   readNote:'An odds ratio of '+v.or.toFixed(1)+' corresponds to a risk ratio of '+mk.toFixed(2)+
     ' — an overstatement of <b>'+Math.round((v.or-mk)/mk*100)+'%</b> if read as a risk ratio. At a 1% baseline the same odds ratio means RR '+
     (v.or/(0.99+0.01*v.or)).toFixed(2)+', which is why the approximation was safe for the rare cancers case–control studies were invented for.'};
 },
 foot:'Conversion: RR = OR / [(1 − p₀) + p₀·OR]. Density and case-base control sampling avoid this problem entirely by estimating the rate ratio or risk ratio directly.'});

/* ---------- 3. Exposure misclassification ---------- */
EXPLORERS.push({id:'misclass',tab:'cc',
 title:'Misclassified exposure drags every effect towards the null',
 blurb:'Self-reported exposure is never perfectly measured. If the errors are the same in cases and controls, the observed odds ratio is <b>always</b> pulled towards 1 — never away. Drag sensitivity and specificity and watch a real effect disappear.',
 sliders:[
  {k:'or',lab:'True odds ratio',min:1.2,max:5,step:0.1,def:2.5,fmt:f1},
  {k:'p0',lab:'True exposure among controls',min:0.02,max:0.6,step:0.01,def:0.20,fmt:pct},
  {k:'sp',lab:'Specificity of measurement',min:0.70,max:1,step:0.01,def:0.95,fmt:pct}
 ],
 compute:function(v){
  function obs(se,sp){
    var p1=v.or*v.p0/(1+v.p0*(v.or-1));
    var a=p1*se+(1-p1)*(1-sp), b=v.p0*se+(1-v.p0)*(1-sp);
    if(a<=0||a>=1||b<=0||b>=1) return NaN;
    return (a/(1-a))/(b/(1-b));
  }
  var s1=[],s2=[],s3=[];
  for(var se=0.55;se<=1.0001;se+=0.01){
    s1.push([se*100, obs(se,v.sp)]);
    s2.push([se*100, obs(se,1)]);
    s3.push([se*100, obs(se,0.85)]);
  }
  var cur=obs(0.80,v.sp);
  if(!isFinite(cur)) return null;
  var lost=(v.or-cur)/(v.or-1);
  var nTrue=twoProp(v.p0, v.or*v.p0/(1+v.p0*(v.or-1)),1,0.05,0.8,true);
  var p1o=0.80*(v.or*v.p0/(1+v.p0*(v.or-1)))+(1-(v.or*v.p0/(1+v.p0*(v.or-1))))*(1-v.sp);
  var p0o=0.80*v.p0+(1-v.p0)*(1-v.sp);
  var nObs=twoProp(p0o,p1o,1,0.05,0.8,true);
  return {series:[
    {name:'Perfect specificity (100%)',pts:s2,color:'--moss',w:1.7},
    {name:'Your specificity',pts:s1,color:'--ox'},
    {name:'Specificity 85%',pts:s3,color:'--sea',w:1.7,dash:true}],
   xLab:'SENSITIVITY OF EXPOSURE MEASUREMENT (%)', yLab:'OBSERVED ODDS RATIO',
   xMin:55,xMax:100,yMin:1,yMax:Math.max(v.or*1.05,1.5),
   rules:[{y:v.or,lab:'true OR '+v.or.toFixed(1),color:'--ink3'},{y:1,lab:'null',color:'--ink3'}],
   marks:[{x:80,y:cur,lab:cur.toFixed(2)}],
   readHead:'At 80% sensitivity',
   readValue:'OR '+cur.toFixed(2),
   verdict:lost>0.4?'bad':(lost>0.2?'warn':'good'),
   readNote:'You would observe <b>'+cur.toFixed(2)+'</b> instead of '+v.or.toFixed(1)+' — losing <b>'+
     Math.round(lost*100)+'%</b> of the effect. Sizing for the true value would need about '+
     (nTrue?Math.ceil(nTrue).toLocaleString():'—')+' cases; detecting what you will actually see needs about <b>'+
     (nObs&&isFinite(nObs)?Math.ceil(nObs).toLocaleString():'—')+'</b>.'};
 },
 foot:'Non-differential misclassification only — errors identical in cases and controls. Notice that the green line (perfect specificity) stays much closer to the truth: when exposure is uncommon, <b>specificity matters more than sensitivity</b>, because false positives are drawn from a much larger pool. Differential misclassification, where cases recall differently, can bias in either direction and is not shown here.'});

/* ---------- 4. Matching costs sample size ---------- */
EXPLORERS.push({id:'matching',tab:'cc',
 title:'Matching does not save sample size — it costs it',
 blurb:'A matched analysis discards every pair where case and control had the same exposure. The better your matching works on something related to the exposure, the fewer informative pairs survive. Drag φ and watch the study grow.',
 sliders:[
  {k:'p0',lab:'Exposure among controls',min:0.05,max:0.50,step:0.01,def:0.20,fmt:pct},
  {k:'or',lab:'Odds ratio to detect',min:1.3,max:3.5,step:0.1,def:2,fmt:f1}
 ],
 compute:function(v){
  function cells(p0,psi,phi){
    function cel(x){var p01=p0-x,p10=psi*p01,p1=x+p10,p00=1-x-p10-p01;return{p11:x,p10:p10,p01:p01,p00:p00,p1:p1};}
    function corr(x){var c=cel(x); if(!(c.p1>0&&c.p1<1))return NaN;
      return (c.p11-c.p1*p0)/Math.sqrt(c.p1*(1-c.p1)*p0*(1-p0));}
    var lo=1e-9,hi=p0-1e-9,st=p0/600;
    for(var i=0;i<600&&hi>lo;i++){var c=cel(hi); if(c.p00>=0&&c.p1>0&&c.p1<1&&!isNaN(corr(hi)))break; hi-=st;}
    for(var i2=0;i2<600&&lo<hi;i2++){var c2=cel(lo); if(c2.p00>=0&&c2.p1>0&&c2.p1<1&&!isNaN(corr(lo)))break; lo+=st;}
    if(hi<=lo) return null;
    var clo=corr(lo), chi=corr(hi);
    if(isNaN(clo)||isNaN(chi)) return null;
    if(phi<clo-1e-6||phi>chi+1e-6) return null;
    for(var j=0;j<120;j++){var m=(lo+hi)/2; if(corr(m)<phi) lo=m; else hi=m;}
    return cel((lo+hi)/2);
  }
  function pairs(phi){
    var c=cells(v.p0,v.or,phi); if(!c) return NaN;
    var pd=c.p10+c.p01, dd=c.p10-c.p01;
    if(Math.abs(dd)<1e-12||pd-sq(dd)<0) return NaN;
    return sq(qnorm(0.975)*Math.sqrt(pd)+qnorm(0.8)*Math.sqrt(pd-sq(dd)))/sq(dd);
  }
  var np=[],inf=[];
  for(var phi=0;phi<=0.75;phi+=0.02){ var n=pairs(phi); if(isFinite(n)){ np.push([phi,n]); var c=cells(v.p0,v.or,phi); inf.push([phi,(c.p10+c.p01)*100]); } }
  if(!np.length) return {error:'With '+pct(v.p0)+' exposure among controls and an odds ratio of '+v.or.toFixed(1)+
    ', the implied exposure prevalence among cases exceeds 100%. That combination cannot occur. Lower one of the two sliders.'};
  var base=pairs(0), cur=pairs(0.2);
  if(!isFinite(base)||!isFinite(cur)) return {error:'No feasible matched design at this combination of exposure prevalence and odds ratio.'};
  var unm=twoProp(v.p0, v.or*v.p0/(1+v.p0*(v.or-1)),1,0.05,0.8,true);
  return {series:[{name:'Matched pairs required',pts:np,color:'--ox'}],
   xLab:'φ — EXPOSURE CORRELATION BETWEEN CASE AND ITS MATCHED CONTROL', yLab:'PAIRS REQUIRED',
   xMin:0,xMax:0.75,yMin:0,
   rules:[{y:unm,lab:'unmatched: '+Math.ceil(unm)+' cases',color:'--sea'}],
   marks:[{x:0.2,y:cur,lab:Math.ceil(cur).toLocaleString()}],
   xFmt:function(x){return x.toFixed(2);},
   readHead:'At φ = 0.2 (Dupont\'s default)',
   readValue:Math.ceil(cur).toLocaleString()+' pairs',
   verdict:cur/base>1.5?'bad':(cur/base>1.15?'warn':'good'),
   readNote:'At φ = 0 matching costs nothing and you would need '+Math.ceil(base)+' pairs. At φ = 0.2 you need <b>'+
     Math.ceil(cur)+'</b> — '+Math.round((cur/base-1)*100)+'% more. Match on something closely tied to the exposure and φ climbs well past 0.4, where the trial has roughly doubled.'};
 },
 foot:'Dupont\'s parameterisation with the conditional odds ratio held fixed; Connor\'s formula for McNemar\'s test. Match because you need confounding controlled and cannot get at it another way — then pay for it knowingly. Never match on anything the exposure could plausibly cause.'});

/* ---------- 5. Sparse cells ---------- */
EXPLORERS.push({id:'sparse',tab:'cc',
 title:'Your confidence interval is hostage to the smallest cell',
 blurb:'Woolf showed the variance of the log odds ratio is the sum of the reciprocals of the four cell counts. One thin cell dominates that sum. Drag exposure prevalence towards either extreme and watch a well-sized study produce an uninformative interval.',
 sliders:[
  {k:'n',lab:'Number of cases',min:50,max:1200,step:10,def:200,fmt:f0},
  {k:'or',lab:'Odds ratio expected',min:1.2,max:4,step:0.1,def:2,fmt:f1},
  {k:'k',lab:'Controls per case',min:1,max:5,step:1,def:1,fmt:f0}
 ],
 compute:function(v){
  function w(p0){
    var p1=v.or*p0/(1+p0*(v.or-1));
    var a=v.n*p1,b=v.n*(1-p1),c=v.k*v.n*p0,d=v.k*v.n*(1-p0);
    if(Math.min(a,b,c,d)<=0) return null;
    var se=Math.sqrt(1/a+1/b+1/c+1/d);
    return {lo:Math.exp(Math.log(v.or)-1.96*se),hi:Math.exp(Math.log(v.or)+1.96*se),
            min:Math.min(a,b,c,d),se:se};
  }
  var lo=[],hi=[];
  for(var p=0.01;p<=0.75;p+=0.01){ var r=w(p); if(r){lo.push([p*100,r.lo]);hi.push([p*100,r.hi]);} }
  var cur=w(0.20); if(!cur) return null;
  return {series:[
    {name:'Upper 95% limit',pts:hi,color:'--ox'},
    {name:'Lower 95% limit',pts:lo,color:'--sea'}],
   xLab:'EXPOSURE PREVALENCE AMONG CONTROLS (%)', yLab:'95% INTERVAL FOR THE ODDS RATIO',
   xMin:0,xMax:75,yMin:0,
   rules:[{y:1,lab:'null',color:'--ink3'},{y:v.or,lab:'true OR',color:'--ink3'}],
   marks:[{x:20,y:cur.hi,lab:cur.lo.toFixed(2)+'–'+cur.hi.toFixed(2)}],
   readHead:'At 20% exposure among controls',
   readValue:cur.lo.toFixed(2)+' to '+cur.hi.toFixed(2),
   verdict:cur.lo<1?'bad':(cur.hi/cur.lo>2.5?'warn':'good'),
   readNote:'Smallest expected cell: <b>'+Math.round(cur.min)+'</b>, contributing '+
     Math.round(100/cur.min/sq(cur.se))+'% of the interval width on its own. '+
     (cur.lo<1?'<b>This interval includes 1</b> — the study would be reported as null despite a true odds ratio of '+v.or.toFixed(1)+'.':'The interval excludes 1.')+
     ' Notice how both limits fly apart at either end of the x-axis: a rare exposure and a near-universal one are equally punishing.'};
 },
 foot:'Woolf 1955. Sizing for a p-value and sizing for a usable interval are different questions, and the second is what your readers will actually judge. Watch the smallest cell, not the headline n.'});

/* ---------- 6. Differential loss to follow-up ---------- */
EXPLORERS.push({id:'attrition',tab:'coh',
 title:'Differential loss to follow-up manufactures effects',
 blurb:'Inflating the sample for attrition protects your power and does nothing about bias. If the people you lose differ by both exposure and outcome, the effect you estimate is simply wrong. Drag the retention of exposed people who develop the outcome.',
 sliders:[
  {k:'p0',lab:'True risk in the unexposed',min:0.02,max:0.4,step:0.01,def:0.10,fmt:pct},
  {k:'rr',lab:'True risk ratio',min:0.5,max:2.5,step:0.1,def:1.0,fmt:f1}
 ],
 compute:function(v){
  var p1=v.rr*v.p0;
  if(p1>=1) return {error:'A risk of '+pct(v.p0)+' in the unexposed multiplied by a risk ratio of '+v.rr.toFixed(1)+
    ' implies a risk above 100% in the exposed. Lower the baseline risk or the risk ratio.'};
  function obsRR(r){
    var o1=p1*r/(p1*r+(1-p1));
    return o1/v.p0;
  }
  var pts=[],flat=[];
  for(var r=0.4;r<=1.0001;r+=0.01){ pts.push([r*100,obsRR(r)]); flat.push([r*100,v.rr]); }
  var cur=obsRR(0.7);
  return {series:[
    {name:'True risk ratio',pts:flat,color:'--ink3',dash:true,w:1.6},
    {name:'Observed risk ratio',pts:pts,color:'--ox'}],
   xLab:'RETENTION OF EXPOSED PEOPLE WHO DEVELOP THE OUTCOME (%)', yLab:'ESTIMATED RISK RATIO',
   xMin:40,xMax:100,yMin:0,
   rules:[{y:1,lab:'no effect',color:'--ink3'}],
   marks:[{x:70,y:cur,lab:cur.toFixed(2)}],
   readHead:'If you retain only 70% of them',
   readValue:'RR '+cur.toFixed(2),
   verdict:Math.abs(cur-v.rr)/Math.max(v.rr,0.01)>0.2?'bad':'warn',
   readNote:'The true risk ratio is '+v.rr.toFixed(1)+'; you would report <b>'+cur.toFixed(2)+'</b>. '+
     (Math.abs(v.rr-1)<0.05?'Note what happens when the true effect is exactly 1: differential attrition alone produces an apparent <b>protective</b> effect out of nothing.':
      'The direction of the distortion follows whichever group you lose disproportionately.')+
     ' No sample size fixes this. Tracing does.'};
 },
 foot:'A deliberately simple model: only exposed participants who develop the outcome are lost differentially. Real attrition is messier and can go either way. Report completeness in person-time, not as a headcount percentage, and pre-specify a sensitivity analysis for informative censoring.'});

/* ---------- 7. Immortal time bias ---------- */
EXPLORERS.push({id:'immortal',tab:'coh',
 title:'Immortal time bias: protection conjured from bookkeeping',
 blurb:'If a person must survive long enough to receive the treatment, and you count that waiting period as treated time, the treated group accrues person-time during which it could not possibly have an event. Drag the length of that window.',
 sliders:[{k:'rr',lab:'True rate ratio (treated vs not)',min:0.7,max:2,step:0.05,def:1.0,fmt:f2}],
 compute:function(v){
  function obs(w){ return v.rr*(1-w); }
  var pts=[],flat=[];
  for(var w=0;w<=0.5;w+=0.01){ pts.push([w*100,obs(w)]); flat.push([w*100,v.rr]); }
  var cur=obs(0.25);
  return {series:[
    {name:'True rate ratio',pts:flat,color:'--ink3',dash:true,w:1.6},
    {name:'What you would observe',pts:pts,color:'--ox'}],
   xLab:'IMMORTAL WINDOW AS A SHARE OF TOTAL FOLLOW-UP (%)', yLab:'ESTIMATED RATE RATIO',
   xMin:0,xMax:50,yMin:0,yMax:Math.max(v.rr*1.15,1.15),
   rules:[{y:1,lab:'no effect',color:'--moss'}],
   marks:[{x:25,y:cur,lab:cur.toFixed(2)}],
   readHead:'With a window of a quarter of follow-up',
   readValue:'RR '+cur.toFixed(2),
   verdict:cur<0.9?'bad':'warn',
   readNote:'A drug with a true rate ratio of '+v.rr.toFixed(2)+' appears to have a rate ratio of <b>'+cur.toFixed(2)+
     '</b>. '+(v.rr>=1?'A treatment that is useless or harmful now looks protective.':'')+
     ' The fix is not statistical: <b>define exposure and the start of follow-up at the same instant</b>, or treat exposure as time-varying and split the person-time at the moment it changes.'};
 },
 foot:'Model: the treated group contributes its full follow-up T to the denominator but can only accrue events during T − w. Observed ratio = true ratio × (1 − w/T). This is the mechanism behind a long line of retracted claims that adherence to a drug prolongs survival.'});

/* ---------- 8. Design effect ceiling ---------- */
EXPLORERS.push({id:'deff',tab:'clu',
 title:'Bigger clusters stop helping; more clusters never do',
 blurb:'Adding people inside a cluster hits a hard ceiling set by the intracluster correlation. Drag ρ and watch the effective information per cluster flatten out at 1/ρ, however many people you enrol.',
 sliders:[{k:'rho',lab:'Intracluster correlation ρ',min:0.002,max:0.10,step:0.002,def:0.02,fmt:function(x){return x.toFixed(3);}}],
 compute:function(v){
  function eff(m,r){return m/(1+(m-1)*r);}
  var a=[],b=[],c=[],ideal=[];
  for(var m=1;m<=400;m+=2){
    a.push([m,eff(m,v.rho)]); b.push([m,eff(m,0.005)]); c.push([m,eff(m,0.05)]);
    ideal.push([m,m]);
  }
  var ceil=1/v.rho, at50=eff(50,v.rho), at200=eff(200,v.rho);
  return {series:[
    {name:'No clustering (ρ = 0)',pts:ideal,color:'--ink3',dash:true,w:1.4},
    {name:'ρ = 0.005',pts:b,color:'--moss',w:1.6},
    {name:'Your ρ',pts:a,color:'--ox'},
    {name:'ρ = 0.05',pts:c,color:'--sea',w:1.6}],
   xLab:'PEOPLE ENROLLED PER CLUSTER', yLab:'EFFECTIVE SAMPLE PER CLUSTER',
   xMin:0,xMax:400,yMin:0,yMax:Math.min(220,Math.max(60,ceil*1.35)),
   rules:[{y:ceil,lab:'ceiling 1/ρ = '+Math.round(ceil),color:'--ox'}],
   marks:[{x:50,y:at50,lab:at50.toFixed(1)}],
   readHead:'A cluster of 50 is worth',
   readValue:at50.toFixed(1)+' people',
   verdict:at50/50<0.5?'bad':(at50/50<0.75?'warn':'good'),
   readNote:'Enrolling 50 per cluster gives you the information of '+at50.toFixed(1)+' independent people. Quadrupling to 200 gives you <b>'+
     at200.toFixed(1)+'</b> — barely '+((at200/at50-1)*100).toFixed(0)+'% more for four times the fieldwork. The ceiling is <b>'+
     Math.round(ceil)+'</b> and nothing gets you past it. <b>Spend a fixed budget on more clusters, not bigger ones.</b>'};
 },
 foot:'Effective sample per cluster = m / [1 + (m − 1)ρ], the reciprocal of Kish\'s design effect. The limit as m → ∞ is 1/ρ. This single curve should govern how you split a fixed budget between number of clusters and cluster size, and it almost always argues for more clusters.'});

/* ---------- 9. Stepped wedge: omitted secular trend ---------- */
EXPLORERS.push({id:'swtrend',tab:'sw',
 title:'Stepped wedge: what happens if you omit period effects',
 blurb:'In a stepped wedge, later periods contain more intervention clusters, so time and treatment are structurally confounded. Leave period effects out of the model and any background change gets credited to your intervention. The trend below is measured <b>in the direction your intervention is meant to push the outcome</b>, so a positive value means the world was already moving your way.',
 sliders:[
  {k:'K',lab:'Number of steps',min:2,max:10,step:1,def:5,fmt:f0},
  {k:'eff',lab:'True intervention effect (points)',min:0,max:10,step:0.5,def:5,fmt:f1}
 ],
 compute:function(v){
  var K=Math.round(v.K), T=K+1, I=K*2, per=I/K;
  /* build design matrix: for each cluster i (step s), period j=0..K */
  var X=[],J=[];
  for(var s=1;s<=K;s++) for(var c=0;c<per;c++) for(var j=0;j<T;j++){ X.push(j>=s?1:0); J.push(j); }
  var n=X.length, mx=0,mj=0;
  for(var i=0;i<n;i++){mx+=X[i];mj+=J[i];} mx/=n; mj/=n;
  var cov=0,vx=0;
  for(var i2=0;i2<n;i2++){cov+=(J[i2]-mj)*(X[i2]-mx); vx+=sq(X[i2]-mx);}
  var slope=cov/vx;   /* bias per unit of trend when time is omitted */
  var naive=[],correct=[];
  for(var tr=-2;tr<=2.001;tr+=0.05){
    naive.push([tr, v.eff + tr*slope]);
    correct.push([tr, v.eff]);
  }
  var curTrend=1, cur=v.eff+curTrend*slope;
  return {series:[
    {name:'Model WITH period effects',pts:correct,color:'--moss'},
    {name:'Model WITHOUT period effects',pts:naive,color:'--ox'}],
   xLab:'BACKGROUND TREND PER PERIOD, IN THE DIRECTION THE INTERVENTION WORKS', yLab:'ESTIMATED EFFECT',
   xMin:-2,xMax:2,
   rules:[{y:v.eff,lab:'truth',color:'--ink3'},{y:0,lab:'no effect',color:'--ink3'}],
   marks:[{x:curTrend,y:cur,lab:cur.toFixed(1)}],
   xFmt:function(x){return x.toFixed(1);},
   readHead:'If the world moves 1 point per period your way',
   readValue:cur.toFixed(1)+' vs '+v.eff.toFixed(1),
   verdict:Math.abs(cur-v.eff)/Math.max(v.eff,1)>0.4?'bad':'warn',
   readNote:'Omitting period effects inflates the estimate to <b>'+cur.toFixed(1)+'</b> against a truth of '+v.eff.toFixed(1)+
     '. The bias is exactly the trend multiplied by <b>'+slope.toFixed(2)+'</b>, a fixed property of this design\u2019s geometry \u2014 it does not shrink as you recruit more. '+
     'Set the true effect slider to zero and the naive model still reports '+(1*slope).toFixed(1)+' points of \u201Cbenefit\u201D that is <b>entirely</b> secular change. '+
     'Drag the trend negative and the same mechanism buries a real effect instead. This is why period effects are not optional in a stepped wedge.'};
 },
 foot:'Bias computed exactly as trend × Cov(period, treatment) / Var(treatment) over the complete design matrix. Note the green line is flat: with period effects in the model the estimate is unbiased whatever the trend. What period effects cannot absorb is a <b>shock</b> that hits clusters differently — a pandemic, a stockout, a guideline change mid-rollout.'});

/* ---------- 10. Stepped wedge: lagged effect ---------- */
EXPLORERS.push({id:'swlag',tab:'sw',
 title:'Stepped wedge: the effect that takes months to arrive',
 blurb:'Implementation is not a switch. Fidelity in month one is not fidelity in month twelve. The standard model assumes the full effect appears immediately; if it ramps up instead, the constant-effect estimate is an average that understates the effect you eventually achieve.',
 sliders:[
  {k:'K',lab:'Number of steps',min:2,max:10,step:1,def:5,fmt:f0},
  {k:'lag',lab:'Periods to reach full effect',min:0,max:6,step:0.5,def:2,fmt:f1}
 ],
 compute:function(v){
  var K=Math.round(v.K), T=K+1, per=2;
  function estimate(L){
    /* weights = share of intervention cluster-periods at each exposure time */
    var w={},tot=0;
    for(var s=1;s<=K;s++) for(var c=0;c<per;c++) for(var j=s;j<T;j++){
      var e=j-s+1; w[e]=(w[e]||0)+1; tot++;
    }
    var acc=0;
    for(var e2 in w){ var frac=(L<=0)?1:Math.min(e2/L,1); acc+=w[e2]*frac; }
    return acc/tot;
  }
  var pts=[],flat=[];
  for(var L=0;L<=6.001;L+=0.1){ pts.push([L,estimate(L)*100]); flat.push([L,100]); }
  var cur=estimate(v.lag)*100;
  return {series:[
    {name:'Full effect eventually achieved',pts:flat,color:'--ink3',dash:true,w:1.6},
    {name:'What the constant-effect model reports',pts:pts,color:'--ox'}],
   xLab:'PERIODS NEEDED TO REACH FULL IMPLEMENTATION', yLab:'ESTIMATE AS % OF THE TRUE FULL EFFECT',
   xMin:0,xMax:6,yMin:0,yMax:110,
   rules:[{y:100,lab:'truth',color:'--ink3'}],
   marks:[{x:v.lag,y:cur,lab:cur.toFixed(0)+'%'}],
   xFmt:function(x){return x.toFixed(1);},
   readHead:'With a '+v.lag.toFixed(1)+'-period ramp-up',
   readValue:cur.toFixed(0)+'% recovered',
   verdict:cur<70?'bad':(cur<88?'warn':'good'),
   readNote:'You would report about <b>'+cur.toFixed(0)+'%</b> of the effect the intervention actually delivers once established — and a trial powered for the full effect is now underpowered by that margin. '+
     'Fewer steps makes this worse, because clusters that cross late contribute only their weakest exposure periods.'};
 },
 foot:'Illustrative weighting: the constant-effect estimate is shown as the design-weighted average of exposure-time effects. <b>The exact weights under the Hussey–Hughes estimator differ and can even be negative in some configurations</b>, which can bias the estimate in directions that are not intuitive — see Kenny and colleagues (2022) in the sources. The practical response is the same either way: pre-specify a secondary model that lets the effect vary with time since crossover, and report both.'});

/* ---------- 11. Interim looks inflate alpha ---------- */
var ALPHA_SIM=(function(){
  var NS=8000, maxK=60, seed=20240917>>>0, spare=null;
  function rnd(){ seed|=0; seed=seed+0x6D2B79F5|0;
    var t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t;
    return ((t^t>>>14)>>>0)/4294967296; }
  function nr(){ if(spare!==null){var v=spare;spare=null;return v;}
    var u,w,s2; do{u=2*rnd()-1;w=2*rnd()-1;s2=u*u+w*w;}while(s2>=1||s2===0);
    var m=Math.sqrt(-2*Math.log(s2)/s2); spare=w*m; return u*m; }
  var P=null;
  function paths(){ if(P) return P;
    P=new Float64Array(NS*maxK);
    for(var s=0;s<NS;s++){ var acc=0; for(var j=0;j<maxK;j++){acc+=nr(); P[s*maxK+j]=acc;} }
    return P; }
  function alpha(k,c){
    var A=paths(), hit=0;
    for(var s=0;s<NS;s++){
      var base=s*maxK, rej=false;
      for(var j=1;j<=k;j++){
        var idx=Math.round(j*maxK/k)-1, t=(idx+1)/maxK;
        var Z=A[base+idx]/Math.sqrt(idx+1);
        var crit=(c===null)?1.96:c/Math.sqrt(t);
        if(Math.abs(Z)>crit){rej=true;break;}
      }
      if(rej) hit++;
    }
    return hit/NS;
  }
  function calib(k){ var lo=1.9,hi=4.0;
    for(var i=0;i<16;i++){var m=(lo+hi)/2; if(alpha(k,m)>0.05) lo=m; else hi=m;}
    return (lo+hi)/2; }
  var cache={naive:{},spend:{},c:{}};
  return {
    naive:function(k){ if(cache.naive[k]===undefined) cache.naive[k]=alpha(k,null); return cache.naive[k]; },
    spend:function(k){ if(cache.spend[k]===undefined){ var c=calib(k); cache.c[k]=c; cache.spend[k]=alpha(k,c);} return cache.spend[k]; },
    cOf:function(k){ if(cache.c[k]===undefined) this.spend(k); return cache.c[k]; }
  };
})();
EXPLORERS.push({id:'interim',tab:'adapt',
 title:'Peeking at the data inflates your false-positive rate',
 blurb:'Testing at &alpha; = 0.05 every time you look is not testing at 5%. Both curves below are simulated directly from Brownian information paths: one tests at the nominal level at every look, the other uses a boundary that is stringent early and relaxed at the end.',
 sliders:[{k:'looks',lab:'Number of analyses',min:1,max:20,step:1,def:5,fmt:f0}],
 compute:function(v){
  var naive=[],spend=[];
  for(var k=1;k<=20;k++){ naive.push([k,ALPHA_SIM.naive(k)*100]); spend.push([k,ALPHA_SIM.spend(k)*100]); }
  var K=Math.round(v.looks), cur=ALPHA_SIM.naive(K)*100, c=ALPHA_SIM.cOf(K);
  var finalP=2*(1-pnorm(c));
  return {series:[
    {name:'Nominal 0.05 at every look',pts:naive,color:'--ox'},
    {name:'Alpha-spending boundary',pts:spend,color:'--moss'}],
   xLab:'NUMBER OF ANALYSES PERFORMED', yLab:'ACTUAL FALSE-POSITIVE RATE (%)',
   xMin:1,xMax:20,yMin:0,yMax:30,
   rules:[{y:5,lab:'intended 5%',color:'--ink3'}],
   marks:[{x:K,y:cur,lab:cur.toFixed(1)+'%'}],
   xFmt:f0,
   readHead:'With '+K+' analysis'+(K>1?'es':''),
   readValue:cur.toFixed(1)+'%',
   verdict:cur>12?'bad':(cur>7?'warn':'good'),
   readNote:'Your actual type I error is <b>'+cur.toFixed(1)+'%</b>, not 5% \u2014 '+(cur/5).toFixed(1)+
     '\u00d7 what you intended. A boundary of the O\u2019Brien\u2013Fleming shape holds it at 5% throughout: at '+K+
     ' look'+(K>1?'s':'')+' the final analysis would use a nominal p-value of about <b>'+finalP.toFixed(3)+
     '</b> rather than 0.05, which is why the maximum sample size barely has to grow.'};
 },
 foot:'Simulated with a fixed seed over 8,000 Brownian paths, so the curve is reproducible. The red line reproduces the published repeated-significance values closely (0.083 at two looks, 0.142 at five, 0.193 at ten, 0.246 at twenty). The green boundary has the O\u2019Brien\u2013Fleming shape c/&radic;t with c calibrated <em>within this same simulation</em> so the overall rate is exactly 5% \u2014 it is not taken from a published table, so treat the constant as illustrative rather than as a design value. Separately: <b>trials stopped early for benefit systematically overestimate the effect</b>, because you stopped at a random high.'});

/* ---------- 12. Dilution from non-adherence ---------- */
EXPLORERS.push({id:'dilute',tab:'par',
 title:'Non-adherence and contamination: paying twice',
 blurb:'People in the intervention arm who do not take it, and people in the control arm who get it anyway, both pull the observed effect towards nothing. Intention-to-treat estimates the diluted effect — so you must power for the diluted effect, not the true one.',
 sliders:[
  {k:'p1',lab:'Control event rate',min:0.05,max:0.6,step:0.01,def:0.30,fmt:pct},
  {k:'p2',lab:'True intervention rate',min:0.02,max:0.55,step:0.01,def:0.20,fmt:pct}
 ],
 compute:function(v){
  if(v.p2>=v.p1) return null;
  var base=twoProp(v.p1,v.p2,1,0.05,0.8,true);
  function need(f){
    var obs2=v.p2+(v.p1-v.p2)*f;   /* f = fraction of the contrast lost */
    if(obs2>=v.p1-1e-6) return NaN;
    return twoProp(v.p1,obs2,1,0.05,0.8,true);
  }
  var pts=[];
  for(var f=0;f<=0.55;f+=0.01){ var n=need(f); if(isFinite(n)&&n<base*14) pts.push([f*100,n]); }
  var cur=need(0.2);
  return {series:[{name:'Required n per arm',pts:pts,color:'--ox'}],
   xLab:'SHARE OF THE TRUE CONTRAST LOST TO NON-ADHERENCE AND DROP-IN (%)', yLab:'PARTICIPANTS PER ARM',
   xMin:0,xMax:55,yMin:0,
   rules:[{y:base,lab:'perfect adherence: '+Math.ceil(base),color:'--moss'}],
   marks:[{x:20,y:cur,lab:Math.ceil(cur).toLocaleString()}],
   readHead:'Losing 20% of the contrast',
   readValue:Math.ceil(cur).toLocaleString()+' per arm',
   verdict:cur/base>1.8?'bad':(cur/base>1.3?'warn':'good'),
   readNote:'Requires <b>'+Math.ceil(cur).toLocaleString()+'</b> per arm against '+Math.ceil(base)+
     ' with perfect adherence — a factor of '+(cur/base).toFixed(2)+'×. The curve is steep because the effect sits in the denominator <em>squared</em>. '+
     'Note this is separate from loss to follow-up, which you also have to inflate for on top.'};
 },
 foot:'A 10% non-adherence rate plus 10% drop-in loses roughly 20% of the contrast. Protecting adherence during the trial is usually far cheaper than recruiting the extra participants. In a <b>non-inferiority</b> trial this dilution runs the other way — it pushes you towards the conclusion you wanted, which is why both ITT and per-protocol analyses must agree.'});

/* ---------- 13. ITS: how long a pre-period ---------- */
EXPLORERS.push({id:'itspre',tab:'impl',
 title:'Interrupted time series: how long a run-in do you need?',
 blurb:'The pre-intervention trend is your counterfactual. If it is estimated imprecisely, everything after the interruption is being compared against a guess. Drag the number of pre-period points and watch the uncertainty in that slope.',
 sliders:[
  {k:'sd',lab:'Noise in the outcome (SD per point)',min:1,max:15,step:0.5,def:5,fmt:f1},
  {k:'rho',lab:'Autocorrelation between adjacent points',min:0,max:0.8,step:0.05,def:0.3,fmt:f2}
 ],
 compute:function(v){
  function se(n){
    if(n<3) return NaN;
    var base=v.sd/Math.sqrt(n*(sq(n)-1)/12);
    return base*Math.sqrt((1+v.rho)/(1-v.rho));   /* inflation for AR(1) */
  }
  var pts=[],ind=[];
  for(var n=4;n<=60;n++){ pts.push([n,se(n)]); ind.push([n,v.sd/Math.sqrt(n*(sq(n)-1)/12)]); }
  var cur=se(12), at24=se(24), at48=se(48);
  return {series:[
    {name:'If points were independent',pts:ind,color:'--moss',w:1.6,dash:true},
    {name:'With your autocorrelation',pts:pts,color:'--ox'}],
   xLab:'NUMBER OF PRE-INTERVENTION TIME POINTS', yLab:'STANDARD ERROR OF THE PRE-TREND SLOPE',
   xMin:4,xMax:60,yMin:0,
   rules:[{x:12,color:'--ink3'}],
   marks:[{x:12,y:cur,lab:cur.toFixed(3)}],
   xFmt:f0,
   readHead:'With 12 pre-period points',
   readValue:'SE '+cur.toFixed(3),
   verdict:cur/at48>2.2?'bad':(cur/at48>1.5?'warn':'good'),
   readNote:'Doubling to 24 points cuts the standard error to '+at24.toFixed(3)+', and 48 points gives '+at48.toFixed(3)+
     '. The gain is steep early and then flattens, which is where the common guidance of around a dozen points either side comes from. '+
     'Your autocorrelation of '+v.rho.toFixed(2)+' inflates every one of these by <b>'+Math.sqrt((1+v.rho)/(1-v.rho)).toFixed(2)+
     '×</b> — ignore it in the model and your intervals will be that much too narrow.'};
 },
 foot:'Slope standard error for evenly spaced points is σ/√(n(n²−1)/12); the autocorrelation factor √((1+ρ)/(1−ρ)) is the standard AR(1) variance inflation for a mean-like statistic and is used here as an illustration of direction and magnitude, not as an exact result. There is no closed-form power calculation for an ITS worth trusting — simulate from your own pre-period data. This tells you whether that is worth attempting.'});

/* ---------- 14. Non-inferiority margin ---------- */
EXPLORERS.push({id:'nimargin',tab:'ni',
 title:'The non-inferiority margin is a scientific claim with a price tag',
 blurb:'A wider margin buys a smaller trial by accepting a weaker conclusion. Drag it and watch the cost. Then ask whether you could defend the margin to someone who would have to take the new treatment.',
 sliders:[
  {k:'pc',lab:'Control success rate',min:0.5,max:0.98,step:0.01,def:0.90,fmt:pct},
  {k:'pw',lab:'Power',min:0.8,max:0.95,step:0.05,def:0.90,fmt:pct}
 ],
 compute:function(v){
  function n(d){ return sq(qnorm(0.975)+qnorm(v.pw))*(2*v.pc*(1-v.pc))/sq(d); }
  var pts=[];
  for(var d=0.015;d<=0.12;d+=0.0025) pts.push([d*100,n(d)]);
  var cur=n(0.05), tight=n(0.03);
  return {series:[{name:'Participants per arm',pts:pts,color:'--ox'}],
   xLab:'NON-INFERIORITY MARGIN (PERCENTAGE POINTS)', yLab:'PARTICIPANTS PER ARM',
   xMin:1,xMax:12,yMin:0,
   marks:[{x:5,y:cur,lab:Math.ceil(cur).toLocaleString()}],
   xFmt:f1,
   readHead:'At a 5-point margin',
   readValue:Math.ceil(cur).toLocaleString()+' per arm',
   verdict:cur>1500?'bad':(cur>700?'warn':'good'),
   readNote:'Tightening the margin to 3 points raises this to <b>'+Math.ceil(tight).toLocaleString()+
     '</b> per arm — a '+(tight/cur).toFixed(1)+'× increase for two percentage points of rigour. '+
     'The margin must preserve a worthwhile fraction of the control treatment\'s own benefit over doing nothing; it is not a budget parameter.'};
 },
 foot:'One-sided α = 0.025, assuming the new treatment performs identically to the control. Assuming it performs <em>better</em> shrinks the trial substantially and is very hard to defend — if you could defend it, you would be running a superiority trial.'});

/* ---------- clone: design effect also appears under cross-sectional ---------- */
(function(){
  var base=EXPLORERS.filter(function(x){return x.id==='deff';})[0];
  if(!base) return;
  var clone={};
  Object.keys(base).forEach(function(k){clone[k]=base[k];});
  clone.id='deffxs'; clone.tab='xs';
  clone.title='Clustered sampling: bigger clusters stop helping';
  clone.blurb='Prevalence surveys almost never sample individuals at random \u2014 they sample villages, then households, then people. Drag the intracluster correlation and watch how little a large cluster is actually worth.';
  clone.sliders=base.sliders.map(function(s){var c={};Object.keys(s).forEach(function(k){c[k]=s[k];});return c;});
  EXPLORERS.push(clone);
})();
