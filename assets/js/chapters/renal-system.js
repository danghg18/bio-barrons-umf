// ════ PAGE NAVIGATION ════
const SUB_NAVS = {
  rinichii: [{h:'intro',l:'Introducere'},{h:'caract',l:'Rinichii'},{h:'nefron-intro',l:'Nefronul'}],
  nefron: [{h:'struct-nefron',l:'Structura nefronului'},{h:'filtrare',l:'Filtrarea'},{h:'reabsorbtie',l:'Reabsorbția'},{h:'secretie',l:'Secreția tubulară'}],
  hormoni: [{h:'activitate-hormonala',l:'Activitatea hormonală'},{h:'urina',l:'Urina'}],
  anexe: [{h:'uretere',l:'Uretere'},{h:'vezica',l:'Vezica urinară'},{h:'uretra',l:'Uretra'},{h:'alte-organe',l:'Alte organe excretorii'}],
  mindmap: [{h:'flowchart-section',l:'Filtrare Glomerulară'}]
};

function goto(sec, anchor) {
  if (!document.getElementById('page-' + sec)) sec = 'home';
  document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#sidenav a').forEach(a => a.classList.remove('active'));
  document.querySelectorAll('.lab-nav a').forEach(a => a.classList.remove('active'));
  const page = document.getElementById('page-' + sec);
  if (page) page.classList.add('active');
  const topNav = document.querySelectorAll('.lab-nav a');
  if (sec === 'home' && topNav[0]) topNav[0].classList.add('active');
  // Update nav active
  const navLinks = document.querySelectorAll('#sidenav a[onclick]');
  navLinks.forEach(a=>{ if(a.getAttribute('onclick')===`goto('${sec}')`) a.classList.add('active'); });
  // Sub-nav
  const subNav = document.getElementById('sub-nav');
  const subLabel = document.getElementById('sub-nav-label');
  if (SUB_NAVS[sec]) {
    subLabel.style.display = 'block';
    subNav.innerHTML = SUB_NAVS[sec].map(n => `<a class="sub" href="#${n.h}" onclick="scrollToAnchor('${n.h}')">${n.l}</a>`).join('');
  } else {
    subLabel.style.display = 'none';
    subNav.innerHTML = '';
  }
  if (typeof closeNav === 'function') closeNav();
  const nextUrl = sec === 'home' ? location.pathname + location.search : '#' + sec;
  if ((sec === 'home' && location.hash) || (sec !== 'home' && location.hash.slice(1) !== sec)) {
    history.replaceState(null, '', nextUrl);
  }
  window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}

function scrollToAnchor(id) {
  const el = document.getElementById(id);
  if (el) setTimeout(() => el.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}), 50);
}

// Back-to-top
window.addEventListener('scroll',()=>{ document.getElementById('top').style.display=window.scrollY>300?'flex':'none'; });

// ════ ACCORDION ════
function tog(h){ h.classList.toggle('open'); h.nextElementSibling.classList.toggle('show'); }
document.querySelectorAll('.acc-head.open').forEach(h=>h.nextElementSibling.classList.add('show'));

// ════ MINDMAP DATA (removed — replaced by flowchart IIFE below) ════
const _REMOVED_INFO = {
  roluri:{title:'4 Roluri ale rinichilor',color:'var(--blue)',tags:['Plasmă','Presiune','pH','Electroliți'],text:`<ol style="padding-left:1.2rem;line-height:1.9"><li><strong>Reglarea volumului plasmei</strong> → controlul presiunii arteriale.</li><li><strong>Controlul produșilor de degradare</strong>: uree, creatinină, acid uric.</li><li><strong>Reglarea electroliților</strong>: Na⁺, K⁺, CO₃²⁻, HCO₃⁻. Vital pentru funcția nervoasă și musculară.</li><li><strong>Echilibrul acido-bazic (pH)</strong>: secretând H⁺ sau HCO₃⁻, rinichii mențin pH-ul plasmei între 7,35–7,45.</li></ol>`},
  nefron:{title:'Nefronul – unitatea funcțională',color:'var(--green)',tags:['>1 milion/rinichi','3 procese','Filtrat','Urină'],text:`<p>Nefronul = unitatea structurală și funcțională a rinichiului. Fiecare rinichi conține <strong>peste 1 milion de nefroni</strong>.</p><p style="margin-top:.5rem">Componente: <strong>Capsula Bowman + Glomerul</strong> → <strong>TCP</strong> → <strong>Ansa Henle</strong> → <strong>TCD</strong> → <strong>Tub colector</strong>.</p><p style="margin-top:.5rem"><strong>Filtratul</strong> = plasma minus celulele și proteinele mari. Prin tubi se transformă în <strong>urină</strong>.</p>`},
  filtrare:{title:'Filtrarea glomerulară',color:'var(--teal)',tags:['RFG 125 mL/min','7,5 L/oră','Presiune mare','Fante submicroscopice'],text:`<p>Filtrarea = trecerea plasmei (fără celule și proteine) prin pereții capilarelor glomerulare în capsula Bowman, prin <strong>fante submicroscopice</strong>.</p><p style="margin-top:.5rem"><strong>De ce funcționează?</strong> Arteriola eferentă are diametru MIC → presiune mare în glomerul → forțează filtrarea.</p><p style="margin-top:.5rem"><strong>RFG:</strong> Bărbați 125 mL/min, Femei 105 mL/min. Din 180 L filtrați/zi → 99% reabsorbit → 1,5 L urină.</p><p style="margin-top:.5rem"><strong>Hematurie:</strong> Dacă eritrocitele trec (glomerul deteriorat) → urină roșie.</p>`},
  reabsorbtie:{title:'Reabsorbția tubulară',color:'var(--green)',tags:['TCP','Ansa Henle','TCD','Capilare peritubulare'],text:`<p>Reabsorbția = trecerea substanțelor din lumenul tubilor înapoi în sânge.</p><ul style="padding-left:1.2rem;margin-top:.5rem;line-height:1.8"><li><strong>TCP:</strong> Na⁺ (activ), glucoză (activ), aminoacizi (activ), Cl⁻ (facilitat), H₂O (osmoză)</li><li><strong>Ansa Henle descendentă:</strong> H₂O iese prin osmoză</li><li><strong>Ansa Henle ascendentă:</strong> NaCl reabsorbit activ; impermeabilă la H₂O</li><li><strong>TCD:</strong> Na⁺ (aldosteron), H₂O (ADH)</li><li><strong>Tub colector:</strong> H₂O finală (dacă ADH prezent), uree</li></ul>`},
  secretie:{title:'Secreția tubulară',color:'var(--red)',tags:['TCD','H⁺','NH₃','K⁺','Penicilină'],text:`<p>Secreția = transportul activ al substanțelor din capilare <strong>în lumenul tubilor</strong> (sens invers reabsorbției).</p><p style="margin-top:.5rem"><strong>Substanțe secretate:</strong> Acid uric, creatinina, H⁺ (reglare pH), NH₃, K⁺ (aldosteron), medicamente.</p><p style="margin-top:.5rem"><strong>Importanță:</strong> Reglează pH-ul, protejează inima (elimină K⁺ în exces), elimină medicamente.</p>`},
  tcp:{title:'Tubul Contort Proximal (TCP)',color:'var(--blue)',tags:['Cortex','Microvilozități','65-70% filtrat','Transport activ'],text:`<p>Primul segment al nefronului, în <strong>cortex</strong>. Pereți cu <strong>milioane de microvilozități</strong> → suprafață mare.</p><p style="margin-top:.5rem"><strong>Mecanism Na⁺ → Cl⁻ → H₂O:</strong><br>1. Na⁺ pompat activ (ATP) din tub → capilare → gradient electric (+)<br>2. Cl⁻ urmează pasiv → NaCl în capilare<br>3. NaCl → gradient osmotic → H₂O urmează (osmoză)</p><p style="margin-top:.5rem"><strong>De reținut:</strong> Glucoza și aminoacizii se reabsorb 100% prin transport activ în TCP. Glicozurie = semn de diabet zaharat.</p>`},
  henle:{title:'Ansa Henle & Mecanism contracurent',color:'var(--orange)',tags:['Cortex→Medulară','Gradient osmotic','NaCl','H₂O'],text:`<p><strong>Ramura descendentă:</strong> Permeabilă la H₂O, impermeabilă la ioni → H₂O iese → filtrat se concentrează.</p><p style="margin-top:.5rem"><strong>Ramura ascendentă:</strong> IMPERMEABILĂ la H₂O, reabsoarbe NaCl activ → NaCl se acumulează în interstițiu → gradient osmotic.</p><p style="margin-top:.5rem"><strong>Mecanism contracurent:</strong> NaCl din ramura asc. → interstițiu hiperton → atrage H₂O din ramura desc. și tubul colector → urină concentrată.</p>`},
  tcd:{title:'Tubul Contort Distal (TCD)',color:'var(--purple)',tags:['Cortex','ADH','Aldosteron','Ajustare finală'],text:`<p>Al doilea segment contort, în <strong>cortex</strong>. Controlat hormonal mai intens decât TCP.</p><p style="margin-top:.5rem"><strong>Reabsorbție:</strong> Na⁺ (activ, aldosteron), Cl⁻ (facilitat), H₂O (osmoză, ADH).</p><p style="margin-top:.5rem"><strong>Secreție:</strong> H⁺ (pH), NH₃, K⁺ (aldosteron), medicamente.</p><p style="margin-top:.5rem"><strong>ADH</strong> → aquaporine în membrană → ↑ permeabilitate la H₂O → urină mai concentrată.</p>`},
  adh:{title:'ADH – Hormonul Antidiuretic',color:'var(--blue)',tags:['Hipotalamus','Hipofiză posterioară','Tub colector','Aquaporine'],text:`<p>ADH = Vasopresina. <strong>Produs de hipotalamus, eliberat de hipofiza posterioară.</strong></p><p style="margin-top:.5rem"><strong>Stimul:</strong> ↑ osmolaritate sânge (deshidratare) → chemoreceptori hipotalamici → ADH ↑.</p><p style="margin-top:.5rem"><strong>Efect:</strong> ADH se leagă de receptori V2 → aquaporine inserate în membrana tubului colector → ↑ permeabilitate la H₂O → urină puțină și concentrată.</p><p style="margin-top:.5rem"><strong>Absența ADH:</strong> Diabet insipid → poliurie masivă (10-20 L/zi).</p>`},
  aldosteron:{title:'Aldosteron',color:'var(--orange)',tags:['Cortex suprarenal','TCD','Na⁺','K⁺','Boala Addison'],text:`<p>Aldosteron = hormon steroidic, secretat de <strong>zona glomerulară a cortexului suprarenal.</strong></p><p style="margin-top:.5rem"><strong>Stimuli:</strong> ↓ Na⁺, ↑ K⁺, ↓ volum sanguin (via Angiotensina II), ACTH.</p><p style="margin-top:.5rem"><strong>Efect:</strong> ↑ reabsorbție Na⁺ în TCD → H₂O urmează → ↑ volum sanguin → ↑ presiune arterială.</p><p style="margin-top:.5rem"><strong>K⁺:</strong> Aldosteron ↑ secreția K⁺ în urină. Fără aldosteron → K⁺ crescut → insuficiență cardiacă!</p><p style="margin-top:.5rem"><strong>Boala Addison:</strong> Aldosteron insuficient → hiponatremie, hiperkaliemie, hipotensiune.</p>`},
  sraa:{title:'Sistemul Renină-Angiotensină-Aldosteron (SRAA)',color:'var(--teal)',tags:['Renină','Angiotensina II','ACE','Presiune arterială'],text:`<p>SRAA = cascadă hormonală care reglează presiunea arterială și volumul sanguin.</p><p style="margin-top:.5rem"><strong>Cascadă:</strong><br>↓ Presiune/↓ Na⁺ → Rinichi secretă <strong>Renina</strong> → Renina clivează Angiotensinogenul (ficat) → <strong>Angiotensina I</strong> → ACE (plămâni) → <strong>Angiotensina II</strong> → Suprarenale → <strong>Aldosteron</strong> + Vasoconstricție.</p><p style="margin-top:.5rem"><strong>Clinic:</strong> Inhibitorii ACE (enalapril, ramipril) → ↓ Angiotensina II → ↓ aldosteron → ↓ presiune arterială.</p>`},
  urina:{title:'Urina',color:'var(--green)',tags:['95% apă','pH 4,6-8','Densitate 1015-1020','1,5 L/zi'],text:`<p><strong>Compoziție:</strong> 95% apă + 5%: uree, creatinina, acid uric, NH₃, ioni, corpi cetonici (↑ în diabet).</p><p style="margin-top:.5rem"><strong>pH:</strong> 4,6-8,0 (medie 6,0). Dietă vegetală → alcalin. Dietă proteică → acid. Urină stătută → alcalină.</p><p style="margin-top:.5rem"><strong>Culoare:</strong> Galben-chihlimbariu din urobilinogen (bilirubina → bacterii intestinale → urobilinogen → rinichi → urină).</p>`},
  cai:{title:'Căile urinare interne',color:'var(--blue)',tags:['Calice mici','Calice mari','Pelvis renal','Ureter'],text:`<p>Urina formată în nefron → <strong>Tub colector</strong> → <strong>Papile renale</strong> → <strong>Calice mici</strong> → <strong>Calice mari</strong> → <strong>Pelvis renal</strong> (pâlnie, la hil) → <strong>Ureter</strong>.</p><p style="margin-top:.5rem">Ureterele au pereți musculari netezi care generează <strong>unde peristaltice</strong> → împing urina în vezică independent de gravitație.</p>`},
  vezica:{title:'Vezica urinară & Uretra',color:'var(--orange)',tags:['600 mL','3 orificii','Micțiune','5 cm vs 15 cm'],text:`<p><strong>Vezica:</strong> Sac distensibil (mușchi detrusor + mucoasă urotelială). Capacitate max ~600 mL. 3 orificii: 2 uretere + 1 uretră.</p><p style="margin-top:.5rem"><strong>Micțiunea:</strong> voluntară (adult). Relaxare sfincter uretral extern + contracție detrusor.</p><p style="margin-top:.5rem"><strong>Uretra femei:</strong> ~5 cm, exclusiv urinară. <strong>Uretra bărbați:</strong> ~15 cm, dublă funcție. Prostata înconjoară uretra la bărbați.</p>`},
  exterior:{title:'Eliminarea urinei (Micțiunea)',color:'var(--green)',tags:['Voluntar','Sfincter extern','Detrusor'],text:`<p>Eliminarea urinei = <strong>micțiunea</strong>. Proces voluntar la adulți, involuntar la sugari.</p><p style="margin-top:.5rem">Când vezica se umple (~200-300 mL), receptorii de distensie trimit semnale la encefal → senzație de urinare → voluntar: relaxare sfincter extern + contracție detrusor → golire.</p>`}
};

const CONN = {
  conn1:`<strong>Deshidratare → ADH → Urină concentrată:</strong><br>Deshidratare → ↑ Na⁺ în sânge → ↑ osmolaritate → Chemoreceptori hipotalamici → Hipotalamus sintetizează ADH → Hipofiza posterioară eliberează ADH → ADH se leagă de TCD și tub colector → Aquaporine inserate → ↑ Permeabilitate la H₂O → H₂O reabsorbită → Urină puțină, concentrată, galben închis.`,
  conn2:`<strong>↓ Presiune → SRAA → Aldosteron → ↑ Na⁺:</strong><br>↓ Presiune arterială sau ↓ Na⁺ → Celule juxtaglomerulare secretă Renina → Renina + Angiotensinogen (ficat) → Angiotensina I → ACE (plămâni) → Angiotensina II → Suprarenale → Aldosteron → ↑ reabsorbție Na⁺ în TCD → H₂O urmează → ↑ Volum sanguin → ↑ Presiune (echilibru).`,
  conn3:`<strong>↑ K⁺ în sânge → Aldosteron → ↑ K⁺ în urină:</strong><br>Hiperkaliemia stimulează direct cortexul suprarenal → ↑ Aldosteron → TCD secretă mai mult K⁺ în lumen → K⁺ eliminat în urină. Fără această cale: K⁺ se acumulează → depolarizare membranei cardiace → fibrilație ventriculară → stop cardiac!`,
  conn4:`<strong>NaCl ansa ascendentă → interstițiu hiperton → contracurent:</strong><br>Ramura ascendentă pompează NaCl activ → interstițiu medular (fără apă). Interstițiu devine hiperosmolar (300 → 1200 mOsm/L). Apa iese din ramura descendentă (permeabilă) → filtrat se concentrează. Tubul colector traversează același interstițiu hiperton → ADH → aquaporine → apă iese → urină concentrată.`,
  conn5:`<strong>Glucoza filtrată → reabsorbită 100% în TCP:</strong><br>Glucoza din plasmă este complet filtrată în glomerul. În TCP, cotransportorii Na⁺-glucoză (SGLT) reabsorb 100% din glucoză activ. Urină normală NU conține glucoză. Glicozuria (glucoză în urină) = semn de diabet zaharat (glucoza sanguine depășește pragul renal ~180 mg/dL).`,
  conn6:`<strong>Fără aldosteron → hiperkaliemie → insuficiență cardiacă:</strong><br>Aldosteronul stimulează secreția K⁺ în TCD → K⁺ eliminat în urină = principala cale de eliminare. Fără aldosteron (Boala Addison): tot K⁺ filtrat se reabsoarbe → ↑ K⁺ plasmatic → depolarizare parțiala a celulelor cardiace → tulburări de ritm → risc de stop cardiac!`
};

function showInfo(key, ev) {
  const d = INFO[key];
  const box = document.getElementById('mm-info-box');
  box.innerHTML = `<h3 style="color:${d.color};margin-bottom:.3rem;">${d.title}</h3><div class="tags">${d.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div><div style="font-size:.92rem;">${d.text}</div>`;
  box.className = 'mm-info show';
  box.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
  document.querySelectorAll('.mm-node').forEach(n=>n.classList.remove('active'));
  if(ev && ev.currentTarget) ev.currentTarget.classList.add('active');
}

function showConn(key) {
  const box = document.getElementById('conn-box');
  box.innerHTML = CONN[key];
  box.style.display='block';
  box.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
}

// ════ SIMULATOR ════
window._diabetInsipid = false;
function setScenario(s) {
  const scenarios = {normal:[50,50,50,50],deshidratat:[10,70,50,30],hiperhidratat:[90,30,50,60],hipertensiv:[50,80,50,90],addison:[40,30,80,30],diabet:[50,50,50,50]};
  window._diabetInsipid = (s === 'diabet');
  const v = scenarios[s];
  document.getElementById('sl-hidratare').value=v[0];
  document.getElementById('sl-na').value=v[1];
  document.getElementById('sl-k').value=v[2];
  document.getElementById('sl-pa').value=v[3];
  recalc();
}
function recalc() {
  const hid=+document.getElementById('sl-hidratare').value;
  const na=+document.getElementById('sl-na').value;
  const k=+document.getElementById('sl-k').value;
  const pa=+document.getElementById('sl-pa').value;
  document.getElementById('lbl-hidratare').textContent=hid+'%';
  document.getElementById('lbl-na').textContent=na+'%';
  document.getElementById('lbl-k').textContent=k+'%';
  document.getElementById('lbl-pa').textContent=pa+'%';
  let adh=Math.max(0,Math.min(100,(100-hid)*0.7+(na-50)*0.3));
  if(window._diabetInsipid) adh=0;
  let renin=Math.max(0,Math.min(100,(100-pa)*0.5+(100-na)*0.4));
  let aldo=Math.max(0,Math.min(100,renin*0.5+(k-50)*0.8));
  if(window._diabetInsipid) aldo=Math.min(50,aldo);
  let vol=Math.max(0.3,Math.min(20,1.5*(1-adh/100)*3+0.3));
  if(window._diabetInsipid) vol=15;
  let conc=Math.max(50,Math.min(1200,600/(vol/1.5)));
  let naUr=Math.max(10,Math.min(250,150*(1-aldo/120)));
  let kUr=Math.max(15,Math.min(150,30+aldo*1.2));
  let ph=Math.max(4.6,Math.min(8.0,6.5-(na-50)*0.015+(hid-50)*0.005));
  function pct(x,max){return Math.round(x/max*100);}
  function setR(id,barId,val,fmt,maxVal,color){
    document.getElementById(id).textContent=fmt(val);
    document.getElementById(barId).style.width=pct(val,maxVal)+'%';
    document.getElementById(barId).style.background=color;
  }
  const lvl=v=>v>66?'↑ Crescut':v>33?'Normal':'↓ Scăzut';
  setR('res-adh','bar-adh',adh,v=>lvl(v)+` (${Math.round(v)}%)`,100,'var(--blue)');
  setR('res-renin','bar-renin',renin,v=>lvl(v)+` (${Math.round(v)}%)`,100,'var(--orange)');
  setR('res-aldo','bar-aldo',aldo,v=>lvl(v)+` (${Math.round(v)}%)`,100,'var(--orange)');
  setR('res-vol','bar-vol',vol,v=>v.toFixed(1)+' L/zi',20,'var(--teal)');
  setR('res-conc','bar-conc',conc,v=>Math.round(v)+' mOsm/L',1200,'var(--purple)');
  setR('res-naur','bar-naur',naUr,v=>Math.round(v)+' mEq/L',250,'var(--blue)');
  setR('res-kur','bar-kur',kUr,v=>Math.round(v)+' mEq/L',150,'var(--green)');
  setR('res-ph','bar-ph',ph,v=>v.toFixed(1),8,'var(--red)');
  const viz=document.getElementById('urina-viz');
  const drop=document.getElementById('drop-icon');
  const txt=document.getElementById('urina-text');
  const det=document.getElementById('urina-detail');
  if(vol<1){viz.style.background='#FFF8E1';drop.textContent='🟡';txt.textContent='Urină oligurică, foarte concentrată';det.textContent=`${vol.toFixed(1)} L/zi · ${Math.round(conc)} mOsm/L · Deshidratare severă`;}
  else if(vol<1.5){viz.style.background='#FFFDE7';drop.textContent='💛';txt.textContent='Urină normală, ușor concentrată';det.textContent=`${vol.toFixed(1)} L/zi · ${Math.round(conc)} mOsm/L · pH ${ph.toFixed(1)}`;}
  else if(vol<3){viz.style.background='#E8F5E9';drop.textContent='💧';txt.textContent='Urină normală, bine hidratat';det.textContent=`${vol.toFixed(1)} L/zi · ${Math.round(conc)} mOsm/L · pH ${ph.toFixed(1)}`;}
  else{viz.style.background='#E3F2FD';drop.textContent='🩵';txt.textContent='Urină diluată, poliurie';det.textContent=`${vol.toFixed(1)} L/zi · ${Math.round(conc)} mOsm/L · Hiperhidratare sau ADH absent`;}
  let msgs=[];
  if(adh>70) msgs.push('ADH crescut → reabsorbție intensă de apă → urină concentrată și puțină → probabil deshidratare.');
  if(adh<30) msgs.push('ADH scăzut → pierdere mare de apă → urină diluată și multă. Dacă ADH = 0 → <strong>diabet insipid</strong>.');
  if(aldo>70) msgs.push('Aldosteron crescut → reabsorbție Na⁺ și H₂O crescute → risc de hipertensiune. Eliminare K⁺ crescută.');
  if(aldo<20) msgs.push('Aldosteron scăzut → ↓ reabsorbție Na⁺, ↑ K⁺ plasmatic. Risc: <strong>Boala Addison</strong>!');
  if(renin>70) msgs.push('Renina crescută → activare SRAA → ↑ Angiotensina II → ↑ Aldosteron + Vasoconstricție.');
  if(vol>8) msgs.push('Poliurie (&gt;3 L/zi): hiperhidratare, ↓ ADH, diabet insipid sau diabet zaharat.');
  if(vol<0.5) msgs.push('⚠️ Oligurie severă (&lt;0,5 L/zi): semn de insuficiență renală acută sau deshidratare extremă!');
  if(kUr>100) msgs.push('K⁺ urinar crescut → aldosteron crescut elimină K⁺ activ → protecție cardiacă.');
  if(msgs.length===0) msgs.push('✅ Parametri în limite normale. Rinichii funcționează optim.');
  document.getElementById('interpretare').innerHTML=msgs.map(m=>`<p>• ${m}</p>`).join('');
}

function showToast(msg){
  const t=document.getElementById('toast');
  if(!t) return;
  t.textContent=msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2500);
}

// ════ DARK MODE ════
function toggleDarkMode(){
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', isDark ? '1' : '0');
  var navBtn = document.getElementById('nav-dm-btn');
  var navLbl = document.getElementById('nav-dm-label');
  if(navBtn) navBtn.classList.toggle('on', isDark);
  if(navLbl) navLbl.textContent = isDark ? 'Mod zi' : 'Mod noapte';
}
(function(){
  if(localStorage.getItem('darkMode')==='1'){
    document.body.classList.add('dark');
    document.addEventListener('DOMContentLoaded',function(){
      var navBtn = document.getElementById('nav-dm-btn');
      var navLbl = document.getElementById('nav-dm-label');
      if(navBtn) navBtn.classList.add('on');
      if(navLbl) navLbl.textContent = 'Mod zi';
    });
  }
})();

// ════ HIGHLIGHTER ════
let hlMode = false;

function toggleHighlighter() {
  hlMode = !hlMode;
  document.body.classList.toggle('hl-mode', hlMode);
  var navBtn = document.getElementById('nav-hl-btn');
  var navLbl = document.getElementById('nav-hl-label');
  if(navBtn) navBtn.classList.toggle('hl-on', hlMode);
  if(navLbl) navLbl.textContent = hlMode ? 'Evidențiator ON' : 'Evidențiator';
  showToast(hlMode ? '🖊 Evidențiator activat – selectează text!' : 'Evidențiator dezactivat');
}

function applyHighlight(range) {
  const ancestor = range.commonAncestorContainer;
  const root = ancestor.nodeType === 3 ? ancestor.parentNode : ancestor;
  const textNodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    if (range.intersectsNode(walker.currentNode)) textNodes.push(walker.currentNode);
  }
  textNodes.forEach(function(tn) {
    if (tn.parentNode && tn.parentNode.classList && tn.parentNode.classList.contains('hl')) return;
    let start = 0, end = tn.length;
    if (tn === range.startContainer) start = range.startOffset;
    if (tn === range.endContainer) end = range.endOffset;
    if (start >= end) return;
    const nr = document.createRange();
    nr.setStart(tn, start);
    nr.setEnd(tn, end);
    const mark = document.createElement('mark');
    mark.className = 'hl';
    nr.surroundContents(mark);
  });
}

document.addEventListener('mouseup', function(e) {
  if (!hlMode) return;
  if (e.target.closest('button, input, select, textarea, nav, #hl-btn')) return;
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.toString().trim() === '') return;
  const range = sel.getRangeAt(0);
  sel.removeAllRanges();
  applyHighlight(range);
});

// ════ FLOWCHART IIFE ════
(function () {
  'use strict';

  var STEPS = [
    {
      type: 'process', color: 'blue', num: '1',
      title: 'Presiunea hidrostatică crescută',
      sub: 'Arteriola aferentă (calibru mare) → arteriola eferentă (calibru mic)',
      detail: {
        full: 'Arteriola aferentă (care aduce sânge la glomerul) are un calibru mai mare decât arteriola eferentă (care drenează glomerulul). Această diferență de diametru creează o presiune hidrostatică ridicată în capilarele glomerulare (~55 mmHg), față de ~18 mmHg în alte capilare.',
        why: 'Presiunea mare este necesară pentru a forța plasma prin membrana de filtrare. Fără această presiune, filtrarea nu ar putea depăși presiunea osmotică a proteinelor plasmatice (~25 mmHg) și rezistența membranei.',
        whyColor: 'blue'
      }
    },
    {
      type: 'decision', color: 'teal',
      title: 'Substanța poate trece\nprin membrana de filtrare?',
      sub: 'Fante submicroscopice · 3 straturi',
      detail: {
        full: 'Membrana de filtrare are 3 componente: (1) Endoteliu fenestrat cu pori largi, (2) Membrana bazală glomerulară — filtru de sarcină electrică negativă, (3) Podocite cu procese pediculate și fante de filtrare.\n\nTrec: apă, electroliți, glucoză, aminoacizi, uree, creatinină.\nNU trec: proteine (>40 kDa), eritrocite, leucocite, trombocite.',
        why: 'Glomerulul filtrează selectiv pe baza DIMENSIUNII și SARCINII ELECTRICE. Membrana bazală are sarcină negativă și respinge proteinele anionice (albumina). Hematurie (eritrocite în urină) = semn de leziune glomerulară severă.',
        whyColor: 'teal'
      }
    },
    {
      type: 'process', color: 'blue', num: '2',
      title: 'Formarea filtratului primar',
      sub: '180 L/zi · RFG 125 mL/min (bărbați) · 105 mL/min (femei)',
      detail: {
        full: 'Plasma filtrată se acumulează în capsula Bowman formând filtratul primar. Acesta este similar cu plasma, dar fără proteine mari și celule sanguine.\n\nRata de Filtrare Glomerulară (RFG): bărbați ~125 mL/min, femei ~105 mL/min → ~180 L/zi filtrate. Din aceștia, 99% se reabsoarbe → ~1,5 L urină finală.',
        why: 'Volumul enorm de filtrat (180 L/zi) permite rinichilor să epureze eficient produșii de degradare. Chiar și substanțele valoroase (glucoză, aminoacizi) sunt filtrate, apoi recuperate selectiv — o strategie de filtrare brută urmată de reabsorbție fină.',
        whyColor: 'blue'
      }
    },
    {
      type: 'process', color: 'emerald', num: '3',
      title: 'Reabsorbție tubulară — 99%',
      sub: 'TCP → Ansa Henle → TCD → Tub colector',
      detail: {
        full: 'Filtratul parcurge tubii nefronului unde are loc reabsorbția selectivă:\n• TCP: Na⁺ (activ), glucoză + aminoacizi (activ), Cl⁻ (pasiv), H₂O (osmoză) — ~65% din filtrat\n• Ansa Henle: H₂O iese (desc.), NaCl reabsorbit activ (asc.) — mecanism contracurent\n• TCD: Na⁺ sub aldosteron, H₂O sub ADH\n• Tub colector: H₂O finală (ADH), uree (recycling)',
        why: 'Reabsorbția protejează substanțele valoroase. Glucoza și aminoacizii sunt recuperați 100%. Dacă glucoza depășește pragul renal (180 mg/dL), apare glicozuria — semn de diabet zaharat. ADH controlează cantitatea de apă reabsorbită: deshidratare → ADH ↑ → urină concentrată.',
        whyColor: 'emerald'
      }
    },
    {
      type: 'result', color: 'emerald',
      title: 'Urină finală — ~1,5 L/zi',
      sub: '95% apă · Uree · Creatinină · Electroliți · pH 4,6–8,0',
      detail: {
        full: 'Urina finală reprezintă ~1% din filtratul primar (1,5 L din 180 L). Compoziție: 95% apă + uree, creatinină, acid uric, NH₃, electroliți, urobilinogen (pigment galben).\n\npH: 4,6–8,0 (medie 6,0). Densitate: 1015–1020 g/mL. Culoare galben-chihlimbariu din urobilinogen (bilirubină → bacterii intestinale → reabsorbție → eliminare renală).',
        why: 'Rinichii ajustează continuu compoziția urinei: ADH ↑ → urină puțină și concentrată (deshidratare); Aldosteron ↑ → Na⁺ reabsorbit → ↑ volum sanguin. Urina este un "raport metabolic" — compoziția ei reflectă fidel starea fiziologică a corpului.',
        whyColor: 'emerald'
      }
    }
  ];

  var playing = false;
  var currentStep = -1;
  var fcNodes = [];
  var fcDetails = [];
  var fcConnectors = [];

  function render() {
    var wrap = document.getElementById('fc-wrap');
    if (!wrap) return;
    wrap.innerHTML = '';
    fcNodes = []; fcDetails = []; fcConnectors = [];

    STEPS.forEach(function (step, i) {
      if (i > 0) {
        var conn = createConnector();
        wrap.appendChild(conn);
        fcConnectors.push(conn.querySelector('.fc-conn-line'));
      }

      var item = document.createElement('div');
      item.className = 'fc-item';

      var node = (step.type === 'decision') ? createDiamondNode(step, i) : createRectNode(step, i);
      item.appendChild(node);
      fcNodes.push(node);

      var det = createDetail(step, i);
      item.appendChild(det);
      fcDetails.push(det);

      wrap.appendChild(item);
    });
  }

  function createConnector() {
    var w = document.createElement('div');
    w.className = 'fc-connector';
    var line = document.createElement('div');
    line.className = 'fc-conn-line';
    w.appendChild(line);
    return w;
  }

  function createRectNode(step, i) {
    var node = document.createElement('div');
    node.className = 'fc-node color-' + step.color + (step.type === 'result' ? ' type-result' : '');
    node.setAttribute('role', 'button');
    node.setAttribute('aria-expanded', 'false');
    node.setAttribute('aria-controls', 'fc-detail-' + i);
    node.setAttribute('tabindex', '0');
    node.setAttribute('aria-label', step.title);

    var titleEl = document.createElement('div');
    titleEl.className = 'fc-title';
    if (step.num) {
      var stepNum = document.createElement('span');
      stepNum.className = 'fc-step';
      stepNum.textContent = step.num;
      titleEl.appendChild(stepNum);
    }
    titleEl.appendChild(document.createTextNode(step.title));
    node.appendChild(titleEl);

    var subEl = document.createElement('div');
    subEl.className = 'fc-sub';
    subEl.textContent = step.sub;
    node.appendChild(subEl);

    var hint = document.createElement('div');
    hint.className = 'fc-hint';
    hint.textContent = 'Apasă pentru detalii';
    node.appendChild(hint);

    node.addEventListener('click', function () { toggleDetail(i); });
    node.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDetail(i); } });
    return node;
  }

  function createDiamondNode(step, i) {
    var wrap = document.createElement('div');
    wrap.className = 'fc-diamond-wrap';
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('aria-expanded', 'false');
    wrap.setAttribute('aria-controls', 'fc-detail-' + i);
    wrap.setAttribute('tabindex', '0');
    wrap.setAttribute('aria-label', step.title);

    var shape = document.createElement('div');
    shape.className = 'fc-diamond-shape';
    wrap.appendChild(shape);

    var text = document.createElement('div');
    text.className = 'fc-diamond-text';
    text.innerHTML = step.title.replace('\n', '<br>') +
      (step.sub ? '<span class="fc-diamond-sub">' + step.sub + '</span>' : '');
    wrap.appendChild(text);

    wrap.addEventListener('click', function () { toggleDetail(i); });
    wrap.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDetail(i); } });
    return wrap;
  }

  function createDetail(step, i) {
    var det = document.createElement('div');
    det.className = 'fc-detail';
    det.id = 'fc-detail-' + i;
    det.setAttribute('role', 'region');
    det.setAttribute('aria-label', 'Detalii: ' + step.title);

    var inner = document.createElement('div');
    inner.className = 'fc-detail-inner';

    var fullEl = document.createElement('div');
    fullEl.className = 'fc-detail-full';
    fullEl.innerHTML = step.detail.full.replace(/\n/g, '<br>');
    inner.appendChild(fullEl);

    var whyLabel = document.createElement('div');
    whyLabel.className = 'fc-why-label';
    whyLabel.textContent = 'De ce?';
    inner.appendChild(whyLabel);

    var whyBox = document.createElement('div');
    whyBox.className = 'fc-why-box' + (step.detail.whyColor ? ' ' + step.detail.whyColor : '');
    whyBox.innerHTML = step.detail.why;
    inner.appendChild(whyBox);

    det.appendChild(inner);
    return det;
  }

  function toggleDetail(i) {
    var node = fcNodes[i];
    var det = fcDetails[i];
    var isOpen = det.classList.contains('fc-open');

    fcDetails.forEach(function (d, j) {
      if (j !== i) {
        d.classList.remove('fc-open');
        fcNodes[j].classList.remove('fc-active');
        fcNodes[j].setAttribute('aria-expanded', 'false');
      }
    });

    if (isOpen) {
      det.classList.remove('fc-open');
      node.classList.remove('fc-active');
      node.setAttribute('aria-expanded', 'false');
    } else {
      det.classList.add('fc-open');
      node.classList.add('fc-active');
      node.setAttribute('aria-expanded', 'true');
    }
  }

  function playAnimation() {
    if (playing) return;
    playing = true;
    currentStep = -1;
    resetAll(false);

    var playBtn = document.getElementById('fc-play-btn');
    if (playBtn) playBtn.disabled = true;

    function animateNext() {
      currentStep++;
      if (currentStep >= STEPS.length) {
        playing = false;
        if (playBtn) playBtn.disabled = false;
        return;
      }
      if (currentStep > 0 && fcConnectors[currentStep - 1]) {
        fcConnectors[currentStep - 1].classList.add('fc-drawn');
      }
      var node = fcNodes[currentStep];
      if (node) {
        node.classList.add('fc-active', 'fc-pulse');
        setTimeout(function () { node.classList.remove('fc-pulse'); }, 500);
      }
      setTimeout(animateNext, 900);
    }

    setTimeout(animateNext, 300);
  }

  function resetAll(enableBtn) {
    fcNodes.forEach(function (n) { n.classList.remove('fc-active', 'fc-pulse'); });
    fcDetails.forEach(function (d) { d.classList.remove('fc-open'); });
    fcConnectors.forEach(function (c) { c.classList.remove('fc-drawn'); });
    fcNodes.forEach(function (n) { n.setAttribute('aria-expanded', 'false'); });
    playing = false;
    currentStep = -1;
    var playBtn = document.getElementById('fc-play-btn');
    if (playBtn && enableBtn !== false) playBtn.disabled = false;
  }

  document.addEventListener('DOMContentLoaded', function () {
    render();
    var playBtn = document.getElementById('fc-play-btn');
    var resetBtn = document.getElementById('fc-reset-btn');
    if (playBtn) playBtn.addEventListener('click', playAnimation);
    if (resetBtn) resetBtn.addEventListener('click', function () { resetAll(true); });
  });
}());

var lessonSearchState = {
  term: '',
  matches: [],
  currentIndex: -1,
  isOpen: false
};

function unwrapSearchHighlights() {
  document.querySelectorAll('.search-found, .search-found-current').forEach(function(mark) {
    if (!mark.parentNode) return;
    var parent = mark.parentNode;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
  });
}

function clearLessonSearch(resetInput) {
  unwrapSearchHighlights();
  lessonSearchState.term = '';
  lessonSearchState.matches = [];
  lessonSearchState.currentIndex = -1;
  updateLessonSearchUi();
  if (resetInput) document.getElementById('lesson-search-input').value = '';
}

function setLessonSearchOpen(isOpen, shouldFocus) {
  var root = document.getElementById('lesson-search');
  var input = document.getElementById('lesson-search-input');
  if (!root || !input) return;
  lessonSearchState.isOpen = !!isOpen;
  root.classList.toggle('open', !!isOpen);
  if (isOpen) closeNav();
  if (isOpen && shouldFocus !== false) {
    setTimeout(function() {
      input.focus();
      input.select();
    }, 40);
  }
}

function openLessonSearch() {
  setLessonSearchOpen(true, true);
}

function collectSearchMatches(term) {
  var needle = String(term || '').trim().toLowerCase();
  if (!needle) return [];
  var matches = [];
  document.querySelectorAll('.page-section').forEach(function(section) {
    var walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      var tn = walker.currentNode;
      var parent = tn.parentNode;
      if (!parent || !parent.closest) continue;
      if (parent.closest('script,style,nav,button')) continue;
      var text = String(tn.textContent || '');
      var lower = text.toLowerCase();
      var from = 0;
      while (from < lower.length) {
        var idx = lower.indexOf(needle, from);
        if (idx === -1) break;
        matches.push({
          sectionId: section.id,
          node: tn,
          start: idx,
          end: idx + needle.length
        });
        from = idx + Math.max(1, needle.length);
      }
    }
  });
  return matches;
}

function highlightLessonMatches(matches) {
  var grouped = new Map();
  matches.forEach(function(match, index) {
    match.index = index;
    if (!grouped.has(match.node)) grouped.set(match.node, []);
    grouped.get(match.node).push(match);
  });
  grouped.forEach(function(nodeMatches, node) {
    nodeMatches.sort(function(a, b) { return b.start - a.start; });
    nodeMatches.forEach(function(match) {
      var range = document.createRange();
      range.setStart(node, match.start);
      range.setEnd(node, match.end);
      var span = document.createElement('span');
      span.className = 'search-found';
      span.setAttribute('data-search-index', String(match.index));
      range.surroundContents(span);
      match.element = span;
    });
  });
}

function updateLessonSearchUi() {
  var count = document.getElementById('lesson-search-count');
  var prevBtn = document.getElementById('lesson-search-prev');
  var nextBtn = document.getElementById('lesson-search-next');
  var total = lessonSearchState.matches.length;
  var current = total ? lessonSearchState.currentIndex + 1 : 0;
  count.textContent = current + ' / ' + total;
  prevBtn.disabled = total < 2;
  nextBtn.disabled = total < 2;
}

function goToLessonSearchResult(index) {
  if (!lessonSearchState.matches.length) {
    updateLessonSearchUi();
    return;
  }
  var total = lessonSearchState.matches.length;
  var normalized = ((index % total) + total) % total;
  if (lessonSearchState.currentIndex >= 0) {
    var currentMatch = lessonSearchState.matches[lessonSearchState.currentIndex];
    if (currentMatch.element) currentMatch.element.classList.remove('search-found-current');
  }
  lessonSearchState.currentIndex = normalized;
  var target = lessonSearchState.matches[normalized];
  if (target.element) {
    target.element.classList.add('search-found-current');
    var targetSection = target.sectionId.replace(/^page-/, '');
    var activeSection = document.querySelector('.page-section.active');
    var activeSectionId = activeSection ? activeSection.id.replace(/^page-/, '') : '';
    if (activeSectionId !== targetSection) {
      goto(targetSection);
    }
    requestAnimationFrame(function() {
      target.element.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth', block:'center'});
    });
  }
  updateLessonSearchUi();
}

function performLessonSearch(term, preferredSectionId, preferredHit) {
  var cleanTerm = String(term || '').trim();
  if (!cleanTerm) {
    clearLessonSearch(false);
    return;
  }
  unwrapSearchHighlights();
  var matches = collectSearchMatches(cleanTerm);
  lessonSearchState.term = cleanTerm;
  lessonSearchState.matches = matches;
  lessonSearchState.currentIndex = -1;
  if (!matches.length) {
    updateLessonSearchUi();
    return;
  }
  highlightLessonMatches(matches);
  var targetIndex = 0;
  if (preferredSectionId) {
    var normalizedSectionId = preferredSectionId.indexOf('page-') === 0 ? preferredSectionId : 'page-' + preferredSectionId;
    var wantedHit = Number(preferredHit);
    var sectionMatches = matches.filter(function(match) { return match.sectionId === normalizedSectionId; });
    if (sectionMatches.length) {
      if (Number.isFinite(wantedHit) && sectionMatches[wantedHit]) {
        targetIndex = sectionMatches[wantedHit].index;
      } else {
        targetIndex = sectionMatches[0].index;
      }
    }
  }
  goToLessonSearchResult(targetIndex);
}

function searchAndScrollTo(term, preferredSectionId, preferredHit) {
  var input = document.getElementById('lesson-search-input');
  setLessonSearchOpen(true, false);
  if (input) input.value = term;
  performLessonSearch(term, preferredSectionId, preferredHit);
}

function openLessonSearchPanel() {
  setLessonSearchOpen(true, true);
}

function setupLessonSearch() {
  var root = document.getElementById('lesson-search');
  var input = document.getElementById('lesson-search-input');
  var prevBtn = document.getElementById('lesson-search-prev');
  var nextBtn = document.getElementById('lesson-search-next');
  var closeBtn = document.getElementById('lesson-search-close');
  if (!root || !input || !prevBtn || !nextBtn || !closeBtn) return;

  input.addEventListener('input', function() {
    performLessonSearch(input.value);
  });
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      goToLessonSearchResult(lessonSearchState.currentIndex + (e.shiftKey ? -1 : 1));
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      clearLessonSearch(true);
      setLessonSearchOpen(false, false);
    }
  });
  prevBtn.addEventListener('click', function() {
    goToLessonSearchResult(lessonSearchState.currentIndex - 1);
  });
  nextBtn.addEventListener('click', function() {
    goToLessonSearchResult(lessonSearchState.currentIndex + 1);
  });
  closeBtn.addEventListener('click', function() {
    clearLessonSearch(true);
    setLessonSearchOpen(false, false);
  });
  document.addEventListener('click', function(e) {
    if (!lessonSearchState.isOpen) return;
    if (!root.contains(e.target)) {
      clearLessonSearch(true);
      setLessonSearchOpen(false, false);
    }
  });
  document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      setLessonSearchOpen(true, true);
      return;
    }
    if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      var tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement.isContentEditable) return;
      e.preventDefault();
      setLessonSearchOpen(true, true);
    }
  });
  updateLessonSearchUi();
}

// ════ INIT ════
(function(){
  var p = new URLSearchParams(window.location.search);
  var initialSection = p.get('goto') || window.location.hash.slice(1) || 'home';
  goto(document.getElementById('page-' + initialSection) ? initialSection : 'home');
  setupLessonSearch();
  var q = p.get('q');
  var section = p.get('section');
  var hit = p.get('hit');
  if (q) searchAndScrollTo(decodeURIComponent(q), section, hit);
})();

// ── NAV MOBILE TOGGLE ──
function closeNav(){
  var nav = document.getElementById('sidenav');
  var overlay = document.getElementById('nav-overlay');
  nav.classList.remove('open');
  overlay.classList.remove('open');
}
// Close nav when a menu item is clicked on mobile
document.getElementById('sidenav').querySelectorAll('a').forEach(function(a){
  a.addEventListener('click', function(){
    if(window.innerWidth <= 1024) closeNav();
  });
});

// ── SERVICE WORKER ──
if('serviceWorker' in navigator){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js').catch(function(){});
  });
}

// ════ SETTINGS FAB ════
function toggleSettingsFab(){
  var panel = document.getElementById('settings-panel');
  if(panel) panel.classList.toggle('open');
}
function updateFabStates(){
  var dm = document.getElementById('sfab-dm');
  var hl = document.getElementById('sfab-hl');
  if(dm) dm.classList.toggle('on', document.body.classList.contains('dark'));
  if(hl) hl.classList.toggle('on', typeof hlMode !== 'undefined' && hlMode);
}
document.addEventListener('click', function(e){
  var panel = document.getElementById('settings-panel');
  var fab   = document.getElementById('settings-fab');
  if(panel && panel.classList.contains('open') && fab && !panel.contains(e.target) && !fab.contains(e.target)){
    panel.classList.remove('open');
  }
});
(function(){
  var origDark = window.toggleDarkMode;
  if(typeof origDark === 'function'){
    window.toggleDarkMode = function(){ origDark(); updateFabStates(); };
  }
  var origHl = window.toggleHighlighter;
  if(typeof origHl === 'function'){
    window.toggleHighlighter = function(){ origHl(); updateFabStates(); };
  }
  document.addEventListener('DOMContentLoaded', function(){ updateFabStates(); });
})();
