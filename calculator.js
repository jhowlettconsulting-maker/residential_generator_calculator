/* ============================================================
   Ontivity Power — Residential Generator Calculator
   calculator.js — data, state, rendering, calculations
   ============================================================ */

'use strict';

const APPLIANCES = [
  // ── Essential
  { id: 'lights',         name: 'Lights (10 LED bulbs)',        icon: '💡', running: 100,  surge: 100,  tab: 'essential' },
  { id: 'fridge',         name: 'Refrigerator / Freezer',       icon: '🧊', running: 700,  surge: 2200, tab: 'essential' },
  { id: 'sump',           name: 'Sump Pump (1/3 HP)',           icon: '🪣', running: 800,  surge: 2900, tab: 'essential' },
  { id: 'well_third',     name: 'Well Pump (1/3 HP)',           icon: '💧', running: 1000, surge: 3100, tab: 'essential' },
  { id: 'well_half',      name: 'Well Pump (1/2 HP)',           icon: '💧', running: 1050, surge: 3200, tab: 'essential' },
  { id: 'garage_door',    name: 'Garage Door Opener',           icon: '🚗', running: 550,  surge: 1000, tab: 'essential' },
  { id: 'phone_charging', name: 'Phone / Device Charging',      icon: '🔋', running: 150,  surge: 150,  tab: 'essential' },
  // ── Kitchen
  { id: 'microwave',    name: 'Microwave Oven',           icon: '📡', running: 1000, surge: 1000, tab: 'kitchen' },
  { id: 'elec_range',   name: 'Electric Range / Oven',    icon: '🍳', running: 4000, surge: 4000, tab: 'kitchen' },
  { id: 'dishwasher',   name: 'Dishwasher',               icon: '🍽️', running: 1800, surge: 1800, tab: 'kitchen' },
  { id: 'coffee',       name: 'Coffee Maker',             icon: '☕', running: 1000, surge: 1000, tab: 'kitchen' },
  { id: 'toaster',      name: 'Toaster',                  icon: '🍞', running: 850,  surge: 850,  tab: 'kitchen' },
  { id: 'blender',      name: 'Blender',                  icon: '🥤', running: 400,  surge: 400,  tab: 'kitchen' },
  { id: 'kettle',       name: 'Electric Kettle',          icon: '🫖', running: 1500, surge: 1500, tab: 'kitchen' },
  // ── HVAC & Heating
  { id: 'ac_1ton',      name: 'Central AC — 1 ton (12k BTU)', icon: '❄️', running: 1500, surge: 4500,  tab: 'hvac' },
  { id: 'ac_2ton',      name: 'Central AC — 2 ton (24k BTU)', icon: '❄️', running: 2800, surge: 8400,  tab: 'hvac' },
  { id: 'ac_3ton',      name: 'Central AC — 3 ton (36k BTU)', icon: '❄️', running: 3800, surge: 11400, tab: 'hvac' },
  { id: 'window_ac',    name: 'Window AC (10,000 BTU)',        icon: '🌬️', running: 1200, surge: 3600,  tab: 'hvac' },
  { id: 'gas_furnace',  name: 'Gas Furnace (1/2 HP blower)',   icon: '🔥', running: 800,  surge: 2350,  tab: 'hvac', fuelTag: ['gas', 'propane', 'oil'] },
  { id: 'elec_furnace', name: 'Electric Furnace (5kW)',        icon: '⚡', running: 5000, surge: 5000,  tab: 'hvac', fuelTag: ['electric'] },
  { id: 'heatpump_sm',  name: 'Heat Pump — Small System',      icon: '🌡️', running: 2000, surge: 6000,  tab: 'hvac', fuelTag: ['heatpump'] },
  { id: 'heatpump_lg',  name: 'Heat Pump — Large System',      icon: '🌡️', running: 5000, surge: 15000, tab: 'hvac' },
  { id: 'space_heater', name: 'Space Heater (Portable)',        icon: '🔆', running: 1500, surge: 1500,  tab: 'hvac', fuelTag: ['none'] },
  { id: 'ceiling_fan',  name: 'Ceiling Fan',                   icon: '🌀', running: 75,   surge: 75,    tab: 'hvac' },
  { id: 'attic_fan',    name: 'Attic / Bath Fan',              icon: '💨', running: 150,  surge: 150,   tab: 'hvac' },
  // ── Laundry
  { id: 'washer',       name: 'Washing Machine',         icon: '🫧', running: 1150, surge: 2250, tab: 'laundry' },
  { id: 'elec_dryer',   name: 'Electric Clothes Dryer',  icon: '♨️', running: 5400, surge: 6750, tab: 'laundry' },
  { id: 'gas_dryer',    name: 'Gas Clothes Dryer',       icon: '🌬️', running: 700,  surge: 1800, tab: 'laundry' },
  // ── Entertainment
  { id: 'tv',           name: 'TV — 55 inch',            icon: '📺', running: 130,  surge: 130,  tab: 'entertainment' },
  { id: 'desktop',      name: 'Desktop Computer',        icon: '🖥️', running: 500,  surge: 500,  tab: 'entertainment' },
  { id: 'laptop',       name: 'Laptop',                  icon: '💻', running: 100,  surge: 100,  tab: 'entertainment' },
  { id: 'console',      name: 'Gaming Console',          icon: '🎮', running: 200,  surge: 200,  tab: 'entertainment' },
  { id: 'home_theater', name: 'Home Theater / Soundbar', icon: '🔊', running: 300,  surge: 300,  tab: 'entertainment' },
  // ── Medical
  { id: 'cpap',         name: 'CPAP (no humidifier)',    icon: '😴', running: 50,  surge: 50,  tab: 'medical' },
  { id: 'cpap_humid',   name: 'CPAP (with humidifier)',  icon: '💨', running: 100, surge: 100, tab: 'medical' },
  { id: 'oxygen',       name: 'Oxygen Concentrator',     icon: '🫁', running: 300, surge: 300, tab: 'medical' },
  { id: 'nebulizer',    name: 'Nebulizer',               icon: '💊', running: 100, surge: 100, tab: 'medical' },
  // ── Outdoor & Workshop
  { id: 'pool_pump',    name: 'Pool Pump (1.5 HP)',         icon: '🏊', running: 2200, surge: 6600, tab: 'outdoor' },
  { id: 'ev_charger',   name: 'EV Charger — Level 2 (30A)', icon: '🚗', running: 7200, surge: 7200, tab: 'outdoor' },
  { id: 'air_comp',     name: 'Air Compressor (1 HP)',       icon: '🔧', running: 1000, surge: 3000, tab: 'outdoor' },
  { id: 'table_saw',    name: 'Table Saw (10 in)',           icon: '🪚', running: 1800, surge: 4500, tab: 'outdoor' },
  { id: 'pressure_wash',name: 'Pressure Washer',             icon: '🚿', running: 1200, surge: 1200, tab: 'outdoor' },
];

const DEFAULTS = {
  essential: ['lights', 'fridge', 'sump', 'phone_charging'],
  whole:     ['lights', 'fridge', 'sump', 'phone_charging', 'washer', 'ac_2ton', 'tv'],
};

const FUEL_APPLIANCE = {
  gas:      'gas_furnace',
  propane:  'gas_furnace',
  oil:      'gas_furnace',
  electric: 'elec_furnace',
  heatpump: 'heatpump_sm',
  none:     'space_heater',
};

const state = {
  step:      0,
  coverage:  null,
  fuel:      null,
  selected:  {},
  custom:    [],
  activeTab: 'essential',
};

let customCounter = 0;

/* ── Toast (replaces alert) ───────────────────────────────── */
function showToast(msg) {
  let toast = document.getElementById('calc-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'calc-toast';
    toast.style.cssText = [
      'position:fixed',
      'bottom:28px',
      'left:50%',
      'transform:translateX(-50%) translateY(16px)',
      'background:#1A2332',
      'color:#fff',
      'padding:12px 24px',
      'border-radius:8px',
      'font-size:0.875rem',
      'font-weight:500',
      'z-index:99999',
      'box-shadow:0 4px 20px rgba(0,0,0,0.28)',
      'opacity:0',
      'transition:opacity 0.22s ease,transform 0.22s ease',
      'pointer-events:none',
      'white-space:nowrap',
      'border-left:4px solid #F5820A',
    ].join(';');
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(16px)';
  }, 2800);
}

/* ── Safe scroll ──────────────────────────────────────────── */
function safeScrollTop() {
  try {
    const wrapper = document.getElementById('generator-calculator');
    if (wrapper) wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch(e) {
    try { document.documentElement.scrollTop = 0; } catch(e2) {}
  }
}

/* ── Helpers ──────────────────────────────────────────────── */
function fmt(watts) {
  if (watts >= 1000) return (watts / 1000).toFixed(watts % 1000 === 0 ? 0 : 1) + ' kW';
  return watts.toLocaleString() + ' W';
}

function roundUp500(n) {
  return Math.ceil(n / 500) * 500;
}

function getAllAppliances() {
  return [...APPLIANCES, ...state.custom];
}

function calcTotals() {
  const all = getAllAppliances();
  let running = 0;
  let highestSurge = 0;

  Object.entries(state.selected).forEach(([id, { qty }]) => {
    const a = all.find(x => x.id === id);
    if (!a) return;
    running += a.running * qty;
    const s = (a.surge || a.running) * qty;
    if (s > highestSurge) highestSurge = s;
  });

  const peak        = running + highestSurge;
  const recommended = roundUp500(peak * 1.25);
  const rangeMin    = roundUp500(recommended * 0.88);
  const rangeMax    = recommended;

  return { running, peak, recommended, rangeMin, rangeMax };
}

/* ── Progress bar ─────────────────────────────────────────── */
function updateProgressBar() {
  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = ((state.step / 4) * 100) + '%';

  document.querySelectorAll('.step-label').forEach(el => {
    const s = parseInt(el.dataset.step);
    el.classList.toggle('active', s === state.step);
    el.classList.toggle('done', s < state.step);
  });
}

function showStep(n) {
  document.querySelectorAll('.step').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.step) === n);
  });

  const back = document.getElementById('btn-back');
  const next = document.getElementById('btn-next');

  if (back) back.style.visibility = n === 0 ? 'hidden' : 'visible';

  if (next) {
    if (n === 4) {
      next.style.display = 'none';
    } else {
      next.style.display = '';
      next.textContent = n === 3 ? 'Calculate →' : 'Next →';
    }
  }
}

/* ── Step 0 ───────────────────────────────────────────────── */
function initStep0() {
  document.querySelectorAll('.coverage-card').forEach(btn => {
    btn.addEventListener('click', () => {
      state.coverage = btn.dataset.coverage;
      document.querySelectorAll('.coverage-card').forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
    });
  });
}

/* ── Step 1 ───────────────────────────────────────────────── */
function initStep1() {
  document.querySelectorAll('.fuel-card').forEach(btn => {
    btn.addEventListener('click', () => {
      state.fuel = btn.dataset.fuel;
      document.querySelectorAll('.fuel-card').forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
    });
  });
}

/* ── Step 2 ───────────────────────────────────────────────── */
function applyDefaults() {
  const defaults = DEFAULTS[state.coverage] || DEFAULTS.essential;
  defaults.forEach(id => {
    if (!state.selected[id]) state.selected[id] = { qty: 1 };
  });
  if (state.fuel) {
    const fuelId = FUEL_APPLIANCE[state.fuel];
    if (fuelId && !state.selected[fuelId]) {
      state.selected[fuelId] = { qty: 1 };
    }
  }
}

function renderAppliancePanel() {
  const panel = document.getElementById('appliance-panel');
  const customForm = document.getElementById('custom-form');
  const tab = state.activeTab;

  if (tab === 'custom') {
    panel.innerHTML = '';
    customForm.style.display = '';
    if (state.custom.length > 0) {
      panel.style.display = 'grid';
      state.custom.forEach(a => panel.appendChild(buildAppCard(a)));
    } else {
      panel.style.display = 'none';
    }
    return;
  }

  customForm.style.display = 'none';
  panel.style.display = 'grid';

  const apps = getAllAppliances().filter(a => a.tab === tab);
  panel.innerHTML = '';
  apps.forEach(a => panel.appendChild(buildAppCard(a)));
}

function buildAppCard(a) {
  const isSelected = !!state.selected[a.id];
  const div = document.createElement('div');
  div.className = 'app-card' + (isSelected ? ' selected' : '');
  div.dataset.id = a.id;
  div.setAttribute('role', 'checkbox');
  div.setAttribute('aria-checked', String(isSelected));
  div.setAttribute('tabindex', '0');

  const surgeText = a.surge && a.surge !== a.running
    ? `<span>${a.surge.toLocaleString()} W surge</span>`
    : '';

  div.innerHTML = `
    <span class="app-check" aria-hidden="true"></span>
    <span class="app-icon" aria-hidden="true">${a.icon}</span>
    <span class="app-info">
      <span class="app-name">${a.name}</span>
      <span class="app-watts">
        <span>${a.running.toLocaleString()} W running</span>
        ${surgeText}
      </span>
    </span>
  `;

  function toggle() {
    if (state.selected[a.id]) {
      delete state.selected[a.id];
    } else {
      state.selected[a.id] = { qty: 1 };
    }
    renderAppliancePanel();
    updateRunningTotal();
  }

  div.addEventListener('click', toggle);
  div.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
  });

  return div;
}

function updateRunningTotal() {
  const { running, peak } = calcTotals();
  const rtRunning = document.getElementById('rt-running');
  const rtSurge   = document.getElementById('rt-surge');
  if (rtRunning) rtRunning.textContent = fmt(running);
  if (rtSurge)   rtSurge.textContent   = fmt(peak);
}

function initStep2() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeTab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', String(b === btn));
      });
      renderAppliancePanel();
    });
  });

  document.getElementById('add-custom-btn').addEventListener('click', () => {
    const name    = document.getElementById('custom-name').value.trim();
    const running = parseInt(document.getElementById('custom-running').value);
    const surge   = parseInt(document.getElementById('custom-surge').value) || running;

    if (!name || !running || running < 1) {
      showToast('Please enter an appliance name and running watts.');
      return;
    }

    const id = 'custom_' + (++customCounter);
    state.custom.push({ id, name, icon: '🔌', running, surge, tab: 'custom' });
    state.selected[id] = { qty: 1 };

    document.getElementById('custom-name').value    = '';
    document.getElementById('custom-running').value = '';
    document.getElementById('custom-surge').value   = '';

    renderAppliancePanel();
    updateRunningTotal();
  });
}

/* ── Step 3 ───────────────────────────────────────────────── */
function renderReview() {
  const tbody = document.getElementById('review-tbody');
  const empty = document.getElementById('review-empty');
  const wrap  = document.getElementById('review-table-wrap');
  const all   = getAllAppliances();
  const ids   = Object.keys(state.selected);

  if (ids.length === 0) {
    empty.style.display = '';
    wrap.style.display  = 'none';
    return;
  }

  empty.style.display = 'none';
  wrap.style.display  = '';
  tbody.innerHTML = '';

  ids.forEach(id => {
    const a = all.find(x => x.id === id);
    if (!a) return;
    const qty = state.selected[id].qty;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span aria-hidden="true">${a.icon}</span> ${a.name}</td>
      <td>
        <div class="qty-ctrl">
          <button class="qty-btn" data-action="dec" data-id="${id}" aria-label="Decrease quantity">−</button>
          <span class="qty-num" id="qty-${id}">${qty}</span>
          <button class="qty-btn" data-action="inc" data-id="${id}" aria-label="Increase quantity">+</button>
        </div>
      </td>
      <td>${(a.running * qty).toLocaleString()} W</td>
      <td>${((a.surge || a.running) * qty).toLocaleString()} W</td>
      <td><button class="remove-btn" data-id="${id}" aria-label="Remove ${a.name}">✕</button></td>
    `;
    tbody.appendChild(tr);
  });

  updateReviewTotals();
  tbody.addEventListener('click', handleReviewClick);
}

function handleReviewClick(e) {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  if (!id) return;

  if (btn.classList.contains('remove-btn')) {
    delete state.selected[id];
    state.custom = state.custom.filter(c => c.id !== id);
    renderReview();
    return;
  }

  if (btn.dataset.action === 'inc') {
    state.selected[id].qty = Math.min(9, state.selected[id].qty + 1);
  } else if (btn.dataset.action === 'dec') {
    if (state.selected[id].qty > 1) {
      state.selected[id].qty -= 1;
    } else {
      delete state.selected[id];
      renderReview();
      return;
    }
  }

  const a = getAllAppliances().find(x => x.id === id);
  if (!a) return;
  const qty = state.selected[id].qty;
  const row = btn.closest('tr');
  row.querySelector('.qty-num').textContent = qty;
  const cells = row.querySelectorAll('td');
  cells[2].textContent = (a.running * qty).toLocaleString() + ' W';
  cells[3].textContent = ((a.surge || a.running) * qty).toLocaleString() + ' W';
  updateReviewTotals();
}

function updateReviewTotals() {
  const { running, peak } = calcTotals();
  const rtr = document.getElementById('review-total-running');
  const rts = document.getElementById('review-total-surge');
  if (rtr) rtr.textContent = fmt(running);
  if (rts) rts.textContent = fmt(peak);
}

/* ── Step 4 ───────────────────────────────────────────────── */
function renderResults() {
  const { running, peak, rangeMin, rangeMax } = calcTotals();

  document.getElementById('res-running').textContent = fmt(running);
  document.getElementById('res-peak').textContent    = fmt(peak);

  const recCard = document.getElementById('rec-card');
  let color, emoji, headline, desc;

  if (rangeMax <= 7500) {
    color = 'green'; emoji = '✅';
    headline = 'Portable Generator';
    desc = `A quality portable generator in the <strong>${fmt(rangeMin)} – ${fmt(rangeMax)}</strong> range will handle your load. Look for one rated at <strong>${fmt(rangeMax)}</strong> or higher.`;
  } else if (rangeMax <= 12000) {
    color = 'amber'; emoji = '⚡';
    headline = 'Heavy-Duty Portable or Entry-Level Standby';
    desc = `Your load calls for a generator in the <strong>${fmt(rangeMin)} – ${fmt(rangeMax)}</strong> range. A heavy-duty portable works; a standby unit offers convenience and automatic transfer.`;
  } else {
    color = 'red'; emoji = '🏠';
    headline = 'Standby Generator Recommended';
    desc = `At <strong>${fmt(rangeMin)} – ${fmt(rangeMax)}</strong>, a whole-home standby generator is the right choice. A licensed electrician will install it with an automatic transfer switch.`;
  }

  recCard.className = `rec-card ${color}`;
  recCard.innerHTML = `
    <span class="rec-emoji">${emoji}</span>
    <div class="rec-body">
      <h3>${headline}</h3>
      <span class="rec-size">${fmt(rangeMin)} – ${fmt(rangeMax)}</span>
      <p>${desc}</p>
    </div>
  `;

  document.getElementById('generator-type-block').innerHTML = `
    <strong>Portable vs. Standby — at a glance</strong>
    <table style="width:100%;border-collapse:collapse;font-size:.83rem;margin-top:6px">
      <thead><tr>
        <th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--border);color:var(--text-3)">Type</th>
        <th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--border);color:var(--text-3)">Best for</th>
        <th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--border);color:var(--text-3)">Typical size</th>
      </tr></thead>
      <tbody>
        <tr><td style="padding:7px 8px;border-bottom:1px solid var(--border)">Portable</td>
            <td style="padding:7px 8px;border-bottom:1px solid var(--border)">Occasional outages, camping, job sites</td>
            <td style="padding:7px 8px;border-bottom:1px solid var(--border)">2,000 – 12,000W</td></tr>
        <tr><td style="padding:7px 8px;border-bottom:1px solid var(--border)">Standby</td>
            <td style="padding:7px 8px;border-bottom:1px solid var(--border)">Whole-house, automatic power, frequent outages</td>
            <td style="padding:7px 8px;border-bottom:1px solid var(--border)">10,000 – 36,000W+</td></tr>
      </tbody>
    </table>
  `;

  const tips = [
    `Your calculation includes a <strong>25% safety buffer</strong> — the industry-standard margin recommended by Generac, Kohler, and the NEC.`,
    `Always start motor-driven appliances (AC, pumps) one at a time to avoid overloading the generator during surge.`,
  ];

  const all = getAllAppliances();
  const ids = Object.keys(state.selected);
  if (ids.includes('elec_dryer'))   tips.push('Switching to a <strong>gas clothes dryer</strong> (~700W) instead of electric (~5,400W) can reduce your required generator size significantly.');
  if (ids.includes('elec_range'))   tips.push('An <strong>electric range uses 4,000W</strong>. A gas range or camping stove during outages can reduce your generator size by one full tier.');
  if (ids.includes('ev_charger'))   tips.push('Your EV Level 2 charger draws <strong>7,200W</strong> — consider skipping EV charging during an outage or switching to a slower Level 1 charge.');
  if (ids.includes('elec_furnace')) tips.push('Electric resistance heating is the highest-draw home system (~5,000W). A gas or propane furnace with a blower (~800W) would drastically reduce requirements.');
  if (ids.some(id => id.startsWith('heatpump'))) tips.push('Heat pumps have high startup surge watts. Make sure your generator\'s <em>peak/surge</em> rating — not just running watts — meets your peak load.');
  if (rangeMax > 20000)             tips.push('For loads above 20kW, consult a licensed electrician. Generator installation requires a proper transfer switch to meet NEC Article 702 and local codes.');

  document.getElementById('tips-block').innerHTML = `
    <h3>Sizing tips</h3>
    <ul class="tips-list">
      ${tips.slice(0, 5).map(t => `<li>${t}</li>`).join('')}
    </ul>
  `;

  const wrapper = document.getElementById('generator-calculator');
  const ctaUrl  = wrapper ? (wrapper.dataset.ctaUrl || '#') : '#';
  const ctaBtn  = document.getElementById('cta-btn');
  if (ctaBtn) ctaBtn.href = ctaUrl;
}

/* ── Navigation ───────────────────────────────────────────── */
function canAdvance() {
  if (state.step === 0 && !state.coverage) {
    showToast('Please select a coverage level to continue.');
    return false;
  }
  if (state.step === 1 && !state.fuel) {
    showToast('Please select your primary heating fuel type to continue.');
    return false;
  }
  return true;
}

function goNext() {
  if (!canAdvance()) return;

  if (state.step === 1) {
    applyDefaults();
    renderAppliancePanel();
    updateRunningTotal();
  }
  if (state.step === 2) renderReview();
  if (state.step === 3) renderResults();

  state.step++;
  showStep(state.step);
  updateProgressBar();
  safeScrollTop();
}

function goBack() {
  if (state.step === 0) return;
  state.step--;
  showStep(state.step);
  updateProgressBar();
  safeScrollTop();
}

function restart() {
  state.step      = 0;
  state.coverage  = null;
  state.fuel      = null;
  state.selected  = {};
  state.custom    = [];
  state.activeTab = 'essential';

  document.querySelectorAll('.coverage-card').forEach(b => b.setAttribute('aria-pressed', 'false'));
  document.querySelectorAll('.fuel-card').forEach(b => b.setAttribute('aria-pressed', 'false'));
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', i === 0);
    b.setAttribute('aria-selected', String(i === 0));
  });

  showStep(0);
  updateProgressBar();
  safeScrollTop();
}

/* ── Init ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initStep0();
  initStep1();
  initStep2();

  document.getElementById('btn-next').addEventListener('click', goNext);
  document.getElementById('btn-back').addEventListener('click', goBack);
  document.getElementById('btn-restart').addEventListener('click', restart);

  showStep(0);
  updateProgressBar();
});
