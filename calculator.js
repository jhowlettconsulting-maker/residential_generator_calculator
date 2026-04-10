'use strict';

const APPLIANCES = [
  {id:'lights',name:'Lights (10 LED bulbs)',icon:'💡',running:100,surge:100,tab:'essential'},
  {id:'fridge',name:'Refrigerator / Freezer',icon:'🧊',running:700,surge:2200,tab:'essential'},
  {id:'sump',name:'Sump Pump (1/3 HP)',icon:'🪣',running:800,surge:2900,tab:'essential'},
  {id:'well_third',name:'Well Pump (1/3 HP)',icon:'💧',running:1000,surge:3100,tab:'essential'},
  {id:'well_half',name:'Well Pump (1/2 HP)',icon:'💧',running:1050,surge:3200,tab:'essential'},
  {id:'garage_door',name:'Garage Door Opener',icon:'🚗',running:550,surge:1000,tab:'essential'},
  {id:'phone_charging',name:'Phone / Device Charging',icon:'🔋',running:150,surge:150,tab:'essential'},
  {id:'microwave',name:'Microwave Oven',icon:'📡',running:1000,surge:1000,tab:'kitchen'},
  {id:'elec_range',name:'Electric Range / Oven',icon:'🍳',running:4000,surge:4000,tab:'kitchen'},
  {id:'dishwasher',name:'Dishwasher',icon:'🍽️',running:1800,surge:1800,tab:'kitchen'},
  {id:'coffee',name:'Coffee Maker',icon:'☕',running:1000,surge:1000,tab:'kitchen'},
  {id:'toaster',name:'Toaster',icon:'🍞',running:850,surge:850,tab:'kitchen'},
  {id:'blender',name:'Blender',icon:'🥤',running:400,surge:400,tab:'kitchen'},
  {id:'kettle',name:'Electric Kettle',icon:'🫖',running:1500,surge:1500,tab:'kitchen'},
  {id:'ac_1ton',name:'Central AC — 1 ton',icon:'❄️',running:1500,surge:4500,tab:'hvac'},
  {id:'ac_2ton',name:'Central AC — 2 ton',icon:'❄️',running:2800,surge:8400,tab:'hvac'},
  {id:'ac_3ton',name:'Central AC — 3 ton',icon:'❄️',running:3800,surge:11400,tab:'hvac'},
  {id:'window_ac',name:'Window AC (10,000 BTU)',icon:'🌬️',running:1200,surge:3600,tab:'hvac'},
  {id:'gas_furnace',name:'Gas Furnace (1/2 HP blower)',icon:'🔥',running:800,surge:2350,tab:'hvac'},
  {id:'elec_furnace',name:'Electric Furnace (5kW)',icon:'⚡',running:5000,surge:5000,tab:'hvac'},
  {id:'heatpump_sm',name:'Heat Pump — Small System',icon:'🌡️',running:2000,surge:6000,tab:'hvac'},
  {id:'heatpump_lg',name:'Heat Pump — Large System',icon:'🌡️',running:5000,surge:15000,tab:'hvac'},
  {id:'space_heater',name:'Space Heater (Portable)',icon:'🔆',running:1500,surge:1500,tab:'hvac'},
  {id:'ceiling_fan',name:'Ceiling Fan',icon:'🌀',running:75,surge:75,tab:'hvac'},
  {id:'attic_fan',name:'Attic / Bath Fan',icon:'💨',running:150,surge:150,tab:'hvac'},
  {id:'washer',name:'Washing Machine',icon:'🫧',running:1150,surge:2250,tab:'laundry'},
  {id:'elec_dryer',name:'Electric Clothes Dryer',icon:'♨️',running:5400,surge:6750,tab:'laundry'},
  {id:'gas_dryer',name:'Gas Clothes Dryer',icon:'🌬️',running:700,surge:1800,tab:'laundry'},
  {id:'tv',name:'TV — 55 inch',icon:'📺',running:130,surge:130,tab:'entertainment'},
  {id:'desktop',name:'Desktop Computer',icon:'🖥️',running:500,surge:500,tab:'entertainment'},
  {id:'laptop',name:'Laptop',icon:'💻',running:100,surge:100,tab:'entertainment'},
  {id:'console',name:'Gaming Console',icon:'🎮',running:200,surge:200,tab:'entertainment'},
  {id:'home_theater',name:'Home Theater / Soundbar',icon:'🔊',running:300,surge:300,tab:'entertainment'},
  {id:'cpap',name:'CPAP (no humidifier)',icon:'😴',running:50,surge:50,tab:'medical'},
  {id:'cpap_humid',name:'CPAP (with humidifier)',icon:'💨',running:100,surge:100,tab:'medical'},
  {id:'oxygen',name:'Oxygen Concentrator',icon:'🫁',running:300,surge:300,tab:'medical'},
  {id:'nebulizer',name:'Nebulizer',icon:'💊',running:100,surge:100,tab:'medical'},
  {id:'pool_pump',name:'Pool Pump (1.5 HP)',icon:'🏊',running:2200,surge:6600,tab:'outdoor'},
  {id:'ev_charger',name:'EV Charger — Level 2',icon:'🚗',running:7200,surge:7200,tab:'outdoor'},
  {id:'air_comp',name:'Air Compressor (1 HP)',icon:'🔧',running:1000,surge:3000,tab:'outdoor'},
  {id:'table_saw',name:'Table Saw (10 in)',icon:'🪚',running:1800,surge:4500,tab:'outdoor'},
  {id:'pressure_wash',name:'Pressure Washer',icon:'🚿',running:1200,surge:1200,tab:'outdoor'},
];

const DEFAULTS = {
  essential: ['lights','fridge','sump','phone_charging'],
  whole:     ['lights','fridge','sump','phone_charging','washer','ac_2ton','tv'],
};
const FUEL_MAP = {gas:'gas_furnace',propane:'gas_furnace',oil:'gas_furnace',electric:'elec_furnace',heatpump:'heatpump_sm',none:'space_heater'};

const TRACK_LABELS = {
  residential: ['Coverage','Heating','Appliances','Review','Results'],
  commercial:  ['Property','Systems','Coverage','Assessment'],
  industrial:  ['Operation','Critical Loads','Downtime','Assessment'],
};

const state = {
  segment: null,
  step: 0,
  r: { coverage:null, fuel:null, selected:{}, custom:[], activeTab:'essential' },
  c: { buildingType:'', sqft:'', tenants:'', existing:'', criticalSystems:[], coverageScope:null, tolerance:'', runtime:'' },
  i: { industry:'', facilitySize:'', demand:'', shifts:'', criticalLoads:[], downtimeCost:null, transfer:'', redundancy:'' },
};
let customCounter = 0;

function fmt(w){ return w>=1000?(w/1000).toFixed(w%1000===0?0:1)+' kW':w.toLocaleString()+' W'; }
function roundUp500(n){ return Math.ceil(n/500)*500; }
function getAllAppliances(){ return [...APPLIANCES,...state.r.custom]; }

function showToast(msg){
  let t=document.getElementById('calc-toast');
  if(!t){t=document.createElement('div');t.id='calc-toast';t.style.cssText='position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(16px);background:#111;color:#fff;padding:12px 24px;border-radius:8px;font-size:0.875rem;font-weight:500;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,0.28);opacity:0;transition:opacity 0.22s ease,transform 0.22s ease;pointer-events:none;white-space:nowrap;border-left:4px solid #CBE83B;';document.body.appendChild(t);}
  t.textContent=msg;t.style.opacity='1';t.style.transform='translateX(-50%) translateY(0)';
  clearTimeout(t._timer);t._timer=setTimeout(()=>{t.style.opacity='0';t.style.transform='translateX(-50%) translateY(16px)';},2800);
}

function safeScroll(){
  try{document.getElementById('generator-calculator').scrollIntoView({behavior:'smooth',block:'start'});}catch(e){}
}

function showBranchScreen(){
  document.getElementById('branch-screen').style.display='';
  document.getElementById('progress-wrap').style.display='none';
  document.getElementById('calc-nav').style.display='none';
  document.getElementById('track-badge').classList.remove('visible');
  document.querySelectorAll('.step').forEach(s=>s.classList.remove('active'));
  document.getElementById('calc-title').textContent='Generator Power Calculator';
  document.getElementById('calc-subtitle').textContent="Tell us about your situation and we'll help you find the right solution.";
  setTimeout(reportHeight, 100);
}

function enterTrack(segment){
  document.getElementById('branch-screen').style.display='none';
  document.getElementById('progress-wrap').style.display='';
  document.getElementById('calc-nav').style.display='';
  const badge=document.getElementById('track-badge');
  badge.classList.add('visible');
  const names={residential:'Residential',commercial:'Commercial',industrial:'Industrial'};
  document.getElementById('track-label').textContent=names[segment];
  const titles={
    residential:{t:'Residential Backup Planning',s:"Get a realistic estimate of what your home actually needs — so you're not guessing when it matters."},
    commercial: {t:'Commercial Power Continuity',s:"Understand what needs to stay running — and what it actually takes to support it."},
    industrial: {t:'Industrial Power Systems',s:"Identify the level of system your operation actually requires — before design decisions are made."},
  };
  document.getElementById('calc-title').textContent=titles[segment].t;
  document.getElementById('calc-subtitle').textContent=titles[segment].s;
  const labels=TRACK_LABELS[segment];
  document.getElementById('step-labels').innerHTML=labels.map((l,i)=>`<button class="step-label" data-step="${i+1}">${l}</button>`).join('');
  document.getElementById('step-labels').onclick=function(e){
    const btn=e.target.closest('.step-label');if(!btn)return;
    goToStep(parseInt(btn.dataset.step));
  };
}

function showTrackStep(segment, step){
  document.querySelectorAll('.step').forEach(s=>s.classList.remove('active'));
  const prefix={residential:'r',commercial:'c',industrial:'i'}[segment];
  const el=document.getElementById(`${prefix}-${step}`);
  if(el) el.classList.add('active');
  const total=TRACK_LABELS[segment].length;
  document.getElementById('progress-fill').style.width=((step/total)*100)+'%';
  document.querySelectorAll('.step-label').forEach(el=>{
    const s=parseInt(el.dataset.step);
    el.classList.toggle('active',s===step);
    el.classList.toggle('done',s<step);
  });
  const back=document.getElementById('btn-back');
  const next=document.getElementById('btn-next');
  back.style.visibility='visible';
  const isLast=step===total;
  if(isLast||(segment==='industrial'&&step===4)){next.style.display='none';}
  else{next.style.display='';next.textContent=(segment==='residential'&&step===4)?'Calculate →':'Next →';}
  setTimeout(reportHeight, 150);
}

function goNext(){
  if(!validate()) return;
  const seg=state.segment;
  if(seg==='residential'){
    if(state.step===2){applyResDefaults();renderAppliancePanel();updateRunningTotal();}
    if(state.step===3) renderReview();
    if(state.step===4) renderResResults();
  }
  if(seg==='commercial'&&state.step===3) renderCommercialResults();
  if(seg==='industrial'&&state.step===3) renderIndustrialResults();
  state.step++;
  showTrackStep(seg,state.step);
  safeScroll();
}

function goBack(){
  if(state.step<=1){
    state.segment=null;state.step=0;
    document.querySelectorAll('.segment-card').forEach(b=>b.setAttribute('aria-pressed','false'));
    showBranchScreen();
  } else {
    state.step--;showTrackStep(state.segment,state.step);
  }
  safeScroll();
}

function restart(){
  state.segment=null;state.step=0;
  state.r={coverage:null,fuel:null,selected:{},custom:[],activeTab:'essential'};
  state.c={buildingType:'',sqft:'',tenants:'',existing:'',criticalSystems:[],coverageScope:null,tolerance:'',runtime:''};
  state.i={industry:'',facilitySize:'',demand:'',shifts:'',criticalLoads:[],downtimeCost:null,transfer:'',redundancy:''};
  customCounter=0;
  document.querySelectorAll('[aria-pressed]').forEach(b=>b.setAttribute('aria-pressed','false'));
  document.querySelectorAll('.form-select').forEach(s=>{s.selectedIndex=0;});
  document.querySelectorAll('.tab-btn').forEach((b,i)=>{b.classList.toggle('active',i===0);b.setAttribute('aria-selected',String(i===0));});
  document.getElementById('i-confirm').style.display='none';
  document.getElementById('i-lead-form').style.display='';
  showBranchScreen();
}

function validate(){
  const seg=state.segment,step=state.step;
  if(seg==='residential'){
    if(step===1&&!state.r.coverage){showToast('Please choose a coverage level.');return false;}
    if(step===2&&!state.r.fuel){showToast('Please choose your heating type.');return false;}
    if(step===3&&Object.keys(state.r.selected).length===0){showToast('Please select at least one appliance.');return false;}
  }
  if(seg==='commercial'){
    if(step===1&&!state.c.buildingType){showToast('Please select a building type.');return false;}
    if(step===2&&state.c.criticalSystems.length===0){showToast('Please select at least one critical system.');return false;}
    if(step===3&&!state.c.coverageScope){showToast('Please select a coverage scope.');return false;}
  }
  if(seg==='industrial'){
    if(step===1&&!state.i.industry){showToast('Please select your industry type.');return false;}
    if(step===2&&state.i.criticalLoads.length===0){showToast('Please select at least one critical load.');return false;}
    if(step===3&&!state.i.downtimeCost){showToast('Please select a downtime cost range.');return false;}
  }
  return true;
}

function applyResDefaults(){
  const defaults=DEFAULTS[state.r.coverage]||DEFAULTS.essential;
  defaults.forEach(id=>{if(!state.r.selected[id])state.r.selected[id]={qty:1};});
  if(state.r.fuel){const fid=FUEL_MAP[state.r.fuel];if(fid&&!state.r.selected[fid])state.r.selected[fid]={qty:1};}
}

function calcTotals(){
  let running=0,highestSurge=0;
  Object.entries(state.r.selected).forEach(([id,{qty}])=>{
    const a=getAllAppliances().find(x=>x.id===id);if(!a)return;
    running+=a.running*qty;
    const s=(a.surge||a.running)*qty;if(s>highestSurge)highestSurge=s;
  });
  const peak=running+highestSurge,recommended=roundUp500(peak*1.25);
  return{running,peak,recommended,rangeMin:roundUp500(recommended*0.88),rangeMax:recommended};
}

function renderAppliancePanel(){
  const panel=document.getElementById('appliance-panel');
  const cf=document.getElementById('custom-form');
  const tab=state.r.activeTab;
  if(tab==='custom'){
    panel.innerHTML='';cf.style.display='';
    if(state.r.custom.length>0){panel.style.display='grid';state.r.custom.forEach(a=>panel.appendChild(buildAppCard(a)));}
    else panel.style.display='none';
    setTimeout(reportHeight,100);return;
  }
  cf.style.display='none';panel.style.display='grid';panel.innerHTML='';
  getAllAppliances().filter(a=>a.tab===tab).forEach(a=>panel.appendChild(buildAppCard(a)));
  setTimeout(reportHeight,100);
}

function buildAppCard(a){
  const sel=!!state.r.selected[a.id];
  const card=document.createElement('button');card.type='button';
  card.className='app-card'+(sel?' selected':'');card.setAttribute('aria-pressed',String(sel));
  card.innerHTML=`<span class="app-check"></span><span class="app-info"><span class="app-name">${a.name}</span><span class="app-watts">${fmt(a.running)} running${a.surge&&a.surge!==a.running?` · ${fmt(a.surge)} surge`:''}</span></span>`;
  card.addEventListener('click',()=>{
    if(state.r.selected[a.id])delete state.r.selected[a.id];else state.r.selected[a.id]={qty:1};
    renderAppliancePanel();updateRunningTotal();
  });
  return card;
}

function updateRunningTotal(){
  const{running,peak}=calcTotals();
  document.getElementById('rt-running').textContent=fmt(running);
  document.getElementById('rt-surge').textContent=fmt(peak);
}

function renderReview(){
  const tbody=document.getElementById('review-tbody');
  const empty=document.getElementById('review-empty');
  const wrap=document.getElementById('review-table-wrap');
  const ids=Object.keys(state.r.selected);
  if(ids.length===0){empty.style.display='';wrap.style.display='none';return;}
  empty.style.display='none';wrap.style.display='';tbody.innerHTML='';
  ids.forEach(id=>{
    const a=getAllAppliances().find(x=>x.id===id);if(!a)return;
    const qty=state.r.selected[id].qty;
    const tr=document.createElement('tr');tr.dataset.id=id;
    tr.innerHTML=`<td>${a.name}</td><td><div class="qty-ctrl"><button class="qty-btn" data-action="dec">−</button><span class="qty-num">${qty}</span><button class="qty-btn" data-action="inc">+</button></div></td><td>${fmt(a.running*qty)}</td><td>${fmt((a.surge||a.running)*qty)}</td><td class="col-remove"><button class="remove-btn" data-action="remove">✕</button></td>`;
    tbody.appendChild(tr);
  });
  const t=calcTotals();
  document.getElementById('review-total-running').textContent=fmt(t.running);
  document.getElementById('review-total-surge').textContent=fmt(t.peak);
  tbody.addEventListener('click',handleReviewClick);
  setTimeout(reportHeight,100);
}

function handleReviewClick(e){
  const btn=e.target.closest('button[data-action]');if(!btn)return;
  const tr=btn.closest('tr[data-id]');if(!tr)return;
  const id=tr.dataset.id;const action=btn.dataset.action;
  if(!state.r.selected[id])return;
  if(action==='inc')state.r.selected[id].qty+=1;
  else if(action==='dec')state.r.selected[id].qty=Math.max(1,state.r.selected[id].qty-1);
  else if(action==='remove'){delete state.r.selected[id];state.r.custom=state.r.custom.filter(c=>c.id!==id);}
  renderReview();updateRunningTotal();
}

function renderResResults(){
  const{running,peak,rangeMin,rangeMax}=calcTotals();
  document.getElementById('res-running').textContent=fmt(running);
  document.getElementById('res-peak').textContent=fmt(peak);
  let tone,heading,blurb;
  if(rangeMax<10000){tone='green';heading='Compact Standby or Heavy Portable';blurb='Ideal for essential backup loads and selective circuits.';}
  else if(rangeMax<24000){tone='amber';heading='Mid-Range Standby Generator';blurb='Great for larger homes or whole-house backup requirements.';}
  else{tone='red';heading='High-Capacity Standby Generator';blurb='Best for whole-home coverage with high-demand appliances.';}
  const rc=document.getElementById('rec-card');
  rc.className=`rec-card ${tone}`;
  rc.innerHTML=`<div class="rec-body"><h3>${heading}</h3><span class="rec-size">${fmt(rangeMin)} – ${fmt(rangeMax)}</span><p>${blurb} Includes a 25% safety buffer — the industry standard.</p></div>`;
  const typeText=rangeMax<12000?'A portable or entry-level standby may work depending on your transfer switch setup.':rangeMax<24000?'A whole-home standby generator with automatic transfer switch is typically recommended.':'A commercial/industrial-grade standby solution and professional load analysis is strongly recommended.';
  document.getElementById('generator-type-block').innerHTML=`<strong>Generator type guidance</strong>${typeText}`;
  const tips=['Confirm starting loads with manufacturer nameplate ratings.','Plan for future expansion and seasonal load changes.','Consult a licensed electrician for transfer switch and code compliance.','Separate essential vs convenience loads to optimize generator size.','Account for HVAC startup surges in summer/winter peak conditions.'];
  document.getElementById('tips-list').innerHTML=tips.map(t=>`<li>${t}</li>`).join('');
  setTimeout(reportHeight,150);
}

function renderCommercialResults(){
  const c=state.c;
  const n=c.criticalSystems.length;
  const bigBuilding=c.sqft==='50k-100k'||c.sqft==='over100k';
  const fullCoverage=c.coverageScope==='full'||c.coverageScope==='multi';
  const hasMedical=c.criticalSystems.includes('medical_eq');
  const hasElevators=c.criticalSystems.includes('elevators');
  const zeroTolerance=c.tolerance==='zero';
  let sizeRange,heading;
  if(bigBuilding||c.coverageScope==='multi'){sizeRange='200 – 500+ kW';heading='Enterprise Standby System';}
  else if(fullCoverage||n>=6){sizeRange='75 – 250 kW';heading='Full-Coverage Standby System';}
  else if(n>=3||hasMedical){sizeRange='30 – 100 kW';heading='Critical Systems Standby';}
  else{sizeRange='20 – 60 kW';heading='Essential Systems Standby';}
  document.getElementById('c-rec-card').innerHTML=`<div class="rec-body"><h3>${heading}</h3><span class="rec-size">${sizeRange}</span><p>Preliminary range based on your building profile. A load study will confirm exact sizing.</p></div>`;
  const notes=[];
  if(zeroTolerance)notes.push('Zero-tolerance uptime requires an Automatic Transfer Switch (ATS) with sub-10-second switchover, plus UPS for any IT or life-safety loads.');
  if(hasMedical)notes.push('Medical equipment requires clean, stable power — specify low total harmonic distortion (&lt;5%) and consider a UPS in series with the generator.');
  if(hasElevators)notes.push('Elevators have high surge demands at startup. Your generator must be sized for motor starting kVA, not just running load.');
  if(c.runtime==='extended')notes.push('Extended runtime means planning for fuel logistics — a large on-site tank or a standing fuel delivery contract.');
  if(c.coverageScope==='multi')notes.push('Multi-property coverage benefits from remote monitoring and centralized maintenance contracts rather than individual unit management.');
  notes.push('All commercial installations require a licensed electrician and local permit. Transfer switch requirements vary by jurisdiction.');
  document.getElementById('c-considerations-block').innerHTML=`<div class="tips-block"><h3>Key considerations</h3><ul class="tips-list">${notes.map(n=>`<li>${n}</li>`).join('')}</ul></div>`;
  document.getElementById('c-sizing-note').innerHTML=`<div class="assessment-block"><h4>Why this is a range, not a number</h4>Commercial sizing depends on actual measured demand — not square footage alone. Tenant load profiles, motor starting calculations, and code requirements all affect the final spec. A load study typically takes 1–2 days and is the only reliable path to right-sizing.</div>`;
  setTimeout(reportHeight,150);
}

function renderIndustrialResults(){
  const i=state.i;
  const highCost=i.downtimeCost==='50k-250k'||i.downtimeCost==='over250k';
  const largeFacility=i.facilitySize==='200k-500k'||i.facilitySize==='over500k';
  const continuous=i.shifts==='247';
  const needsRedundancy=i.redundancy==='n+1'||i.redundancy==='2n'||highCost||continuous;
  const hasMotors=i.criticalLoads.includes('motors');
  let sizeRange,heading,tone;
  if(largeFacility||i.demand==='over1000'){sizeRange='1 MW – 2+ MW';heading='Large Industrial System';tone='red';}
  else if(i.demand==='500-1000'||needsRedundancy){sizeRange='500 kW – 1.5 MW';heading='Heavy Industrial System';tone='amber';}
  else if(i.demand==='100-500'||highCost){sizeRange='100 – 600 kW';heading='Mid-Scale Industrial System';tone='amber';}
  else{sizeRange='50 – 200 kW';heading='Essential Industrial Backup';tone='green';}
  const rc=document.getElementById('i-rec-card');
  rc.className=`rec-card ${tone}`;
  rc.innerHTML=`<div class="rec-body"><h3>${heading}</h3><span class="rec-size">${sizeRange}</span><p>Preliminary range based on your inputs. Industrial sizing requires a certified load study — this is the starting point for the conversation with our team.</p></div>`;
  const flags=[];
  if(hasMotors)flags.push('Large motors require careful surge/starting kVA calculations. Motor starting loads can be 3–7× running load and must be accounted for in generator sizing.');
  if(continuous)flags.push('24/7 operations mean downtime is never convenient — a redundant (N+1 or 2N) configuration is strongly recommended to allow maintenance without production impact.');
  if(i.transfer==='seamless')flags.push('Seamless transfer requires a UPS or flywheel energy storage bridging the gap between utility loss and generator startup. A generator alone cannot achieve zero-interruption transfer.');
  if(i.redundancy==='2n')flags.push('2N redundancy means two complete generator systems, either of which can carry full load. This is typical for mission-critical or Tier 3+ infrastructure.');
  if(highCost)flags.push('At your downtime cost level, the ROI on proper generator infrastructure is typically realized within one to three prevented outage events.');
  flags.push('Industrial installations require coordination with your utility, local AHJ, and may require environmental permitting depending on fuel type and emissions rating.');
  document.getElementById('i-flags-block').innerHTML=`<div class="tips-block" style="margin-top:4px"><h3>Engineering considerations</h3><ul class="tips-list">${flags.map(f=>`<li>${f}</li>`).join('')}</ul></div>`;
  const industryNames={manufacturing:'Manufacturing / Assembly',food:'Food Processing / Cold Storage',chemical:'Chemical / Pharmaceutical',mining:'Mining / Extraction',agriculture:'Agriculture / Greenhouse',construction:'Construction / Job Site',telecom:'Telecom / Broadcast',water:'Water / Wastewater',other:'Other'};
  const demandNames={'under100':'Under 100 kW','100-500':'100 – 500 kW','500-1000':'500 kW – 1 MW','over1000':'Over 1 MW','unknown':'Unknown'};
  const shiftNames={single:'Single shift',double:'Double shift','247':'24/7 operations',seasonal:'Seasonal / variable'};
  document.getElementById('i-lead-summary').innerHTML=`<div class="lead-summary"><h4>Your assessment summary</h4><div class="lead-summary-grid"><div class="lead-summary-item"><span>Industry</span><strong>${industryNames[i.industry]||'—'}</strong></div><div class="lead-summary-item"><span>Estimated demand</span><strong>${demandNames[i.demand]||'—'}</strong></div><div class="lead-summary-item"><span>Operations</span><strong>${shiftNames[i.shifts]||'—'}</strong></div><div class="lead-summary-item"><span>Preliminary range</span><strong>${sizeRange}</strong></div></div></div>`;
  setTimeout(reportHeight,150);
}

function initBranchScreen(){
  document.querySelectorAll('.segment-card').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const seg=btn.dataset.segment;
      state.segment=seg;state.step=1;
      document.querySelectorAll('.segment-card').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
      enterTrack(seg);showTrackStep(seg,1);safeScroll();
    });
  });
}

function initResidential(){
  document.querySelectorAll('#r-1 .coverage-card').forEach(btn=>btn.addEventListener('click',()=>{
    state.r.coverage=btn.dataset.value;
    document.querySelectorAll('#r-1 .coverage-card').forEach(b=>b.setAttribute('aria-pressed','false'));
    btn.setAttribute('aria-pressed','true');
  }));
  document.querySelectorAll('#r-2 .fuel-card').forEach(btn=>btn.addEventListener('click',()=>{
    state.r.fuel=btn.dataset.value;
    document.querySelectorAll('#r-2 .fuel-card').forEach(b=>b.setAttribute('aria-pressed','false'));
    btn.setAttribute('aria-pressed','true');
  }));
  document.querySelectorAll('.tab-btn').forEach(btn=>btn.addEventListener('click',()=>{
    state.r.activeTab=btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-selected',String(b===btn));});
    renderAppliancePanel();
  }));
  document.getElementById('add-custom-btn').addEventListener('click',()=>{
    const name=document.getElementById('custom-name').value.trim();
    const running=parseInt(document.getElementById('custom-running').value);
    const surge=parseInt(document.getElementById('custom-surge').value)||running;
    if(!name)return showToast('Please enter an appliance name.');
    if(!running||running<1)return showToast('Please enter valid running watts.');
    const id='custom_'+(++customCounter);
    state.r.custom.push({id,name,icon:'🛠️',running,surge:surge>=running?surge:running,tab:'custom'});
    state.r.selected[id]={qty:1};
    document.getElementById('custom-name').value='';
    document.getElementById('custom-running').value='';
    document.getElementById('custom-surge').value='';
    renderAppliancePanel();updateRunningTotal();showToast('Custom appliance added.');
  });
  document.getElementById('review-tbody').addEventListener('click',handleReviewClick);
  document.getElementById('r-restart').addEventListener('click',restart);
}

function initCommercial(){
  [['c-building-type','buildingType'],['c-sqft','sqft'],['c-tenants','tenants'],['c-existing','existing'],['c-tolerance','tolerance'],['c-runtime','runtime']].forEach(([id,key])=>{
    const el=document.getElementById(id);if(el)el.addEventListener('change',()=>{state.c[key]=el.value;});
  });
  document.querySelectorAll('#c-critical-systems .option-card').forEach(btn=>btn.addEventListener('click',()=>{
    const v=btn.dataset.value;const on=btn.getAttribute('aria-pressed')!=='true';
    btn.setAttribute('aria-pressed',String(on));
    if(on)state.c.criticalSystems.push(v);else state.c.criticalSystems=state.c.criticalSystems.filter(x=>x!==v);
  }));
  document.querySelectorAll('#c-coverage-scope .option-card').forEach(btn=>btn.addEventListener('click',()=>{
    state.c.coverageScope=btn.dataset.value;
    document.querySelectorAll('#c-coverage-scope .option-card').forEach(b=>b.setAttribute('aria-pressed','false'));
    btn.setAttribute('aria-pressed','true');
  }));
  document.getElementById('c-restart').addEventListener('click',restart);
}

function initIndustrial(){
  [['i-industry','industry'],['i-facility-size','facilitySize'],['i-demand','demand'],['i-shifts','shifts'],['i-transfer','transfer'],['i-redundancy','redundancy']].forEach(([id,key])=>{
    const el=document.getElementById(id);if(el)el.addEventListener('change',()=>{state.i[key]=el.value;});
  });
  document.querySelectorAll('#i-critical-loads .option-card').forEach(btn=>btn.addEventListener('click',()=>{
    const v=btn.dataset.value;const on=btn.getAttribute('aria-pressed')!=='true';
    btn.setAttribute('aria-pressed',String(on));
    if(on)state.i.criticalLoads.push(v);else state.i.criticalLoads=state.i.criticalLoads.filter(x=>x!==v);
  }));
  document.querySelectorAll('#i-downtime-cost .option-card').forEach(btn=>btn.addEventListener('click',()=>{
    state.i.downtimeCost=btn.dataset.value;
    document.querySelectorAll('#i-downtime-cost .option-card').forEach(b=>b.setAttribute('aria-pressed','false'));
    btn.setAttribute('aria-pressed','true');
  }));
  document.getElementById('i-submit-btn').addEventListener('click',()=>{
    const name=document.getElementById('i-name').value.trim();
    const email=document.getElementById('i-email').value.trim();
    if(!name||!email){showToast('Please enter your name and email address.');return;}
    document.getElementById('i-lead-form').style.display='none';
    document.getElementById('i-confirm').style.display='flex';
    setTimeout(reportHeight,150);
  });
  document.getElementById('i-restart').addEventListener('click',restart);
}

function goToStep(targetStep){
  if(!state.segment)return;
  if(targetStep>=state.step)return;
  state.step=targetStep;showTrackStep(state.segment,state.step);safeScroll();
}

/* ── Wix iframe auto-resize ─────────────────────────────── */
function reportHeight() {
  try {
    var el = document.getElementById('generator-calculator');
    var h = el ? el.scrollHeight : document.body.scrollHeight;
    window.parent.postMessage({ type: 'calcHeight', height: h + 40 }, '*');
  } catch(e) {}
}

document.addEventListener('DOMContentLoaded', function() {
  initBranchScreen();
  initResidential();
  initCommercial();
  initIndustrial();
  document.getElementById('btn-next').addEventListener('click', goNext);
  document.getElementById('btn-back').addEventListener('click', goBack);
  showBranchScreen();

  /* Auto-resize via ResizeObserver — fires on any content change */
  if (typeof ResizeObserver !== 'undefined') {
    var ro = new ResizeObserver(function() { reportHeight(); });
    var target = document.getElementById('generator-calculator');
    if (target) ro.observe(target);
  }

  /* Belt-and-suspenders fallbacks */
  reportHeight();
  setTimeout(reportHeight, 400);
  setTimeout(reportHeight, 1000);
  window.addEventListener('resize', reportHeight);
});
