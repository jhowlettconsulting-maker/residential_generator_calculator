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
  residential: {
    essential: ['lights', 'fridge', 'sump', 'phone_charging'],
    whole:     ['lights', 'fridge', 'sump', 'phone_charging', 'washer', 'ac_2ton', 'tv'],
  },
  commercial: {
    essential: ['lights', 'fridge', 'desktop', 'phone_charging'],
    whole:     ['lights', 'fridge', 'desktop', 'tv', 'ac_2ton', 'coffee'],
  },
  industrial: {
    essential: ['lights', 'air_comp', 'phone_charging'],
    whole:     ['lights', 'air_comp', 'table_saw', 'pressure_wash', 'ac_3ton'],
  },
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
  segment:   null,
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

/* ── Safe scroll ─────────────────────────────────────────── */
function safeScrollTop() {
  try {
    const wrapper = document.getElementById('generator-calculator');
    if (wrapper) wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch(e) {
    try { document.documentElement.scrollTop = 0; } catch(e2) {}
  }
}

function showResidentialFlow(show) {
  const flow = document.getElementById('residential-flow');
  if (flow) flow.style.display = show ? '' : 'none';
  const nav = document.getElementById('calc-nav');
  if (nav) nav.style.display = show ? '' : 'none';
}

function showBranchStep(show) {
  const branch = document.getElementById('branch-step');
  if (branch) branch.style.display = show ? '' : 'none';
}

function updateCalculatorHeading(segment) {
  const title = document.getElementById('calc-title');
  const subtitle = document.getElementById('calc-subtitle');
  const headings = {
    residential: {
      title: 'Residential Generator Calculator',
      subtitle: 'Estimate backup power needs for your home.',
    },
    commercial: {
      title: 'Commercial Generator Calculator',
      subtitle: 'Estimate backup power needs for offices, retail, and business operations.',
    },
    industrial: {
      title: 'Industrial Generator Calculator',
      subtitle: 'Estimate backup power needs for high-demand and heavy-duty operations.',
    },
  };
  const chosen = headings[segment] || {
    title: 'Generator Power Calculator',
    subtitle: 'Answer a few quick questions and we’ll recommend the right generator size for your property.',
  };

  if (title) title.textContent = chosen.title;
  if (subtitle) subtitle.textContent = chosen.subtitle;
}

function initBranching() {
  document.querySelectorAll('.segment-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const segment = btn.dataset.segment;
      state.segment = segment;
      document.querySelectorAll('.segment-card').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));

      showBranchStep(false);
      showResidentialFlow(true);
      updateCalculatorHeading(segment);
      restart();
      showStep(0);
      updateProgressBar();
      safeScrollTop();
    });
  });
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
    if (btn.classList.contains('segment-card')) return;
    btn.addEventListener('click', () => {
      state.coverage = btn.dataset.coverage;
      document.querySelectorAll('.coverage-card').forEach(b => {
        if (!b.classList.contains('segment-card')) b.setAttribute('aria-pressed', 'false');
      });
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
  const segment = state.segment || 'residential';
  const segmentDefaults = DEFAULTS[segment] || DEFAULTS.residential;
  const defaults = segmentDefaults[state.coverage] || segmentDefaults.essential;
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
  panel.innerHTML = '';

  APPLIANCES.filter(a => a.tab === tab).forEach(a => {
    panel.appendChild(buildAppCard(a));
  });
}

function buildAppCard(a) {
  const selected = !!state.selected[a.id];
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'app-card' + (selected ? ' selected' : '');
  card.setAttribute('aria-pressed', String(selected));
  card.innerHTML = `
    <span class="app-check"></span>
    <span class="app-icon">${a.icon || '🔌'}</span>
    <span class="app-info">
      <span class="app-name">${a.name}</span>
      <span class="app-watts">${fmt(a.running)} running${a.surge && a.surge !== a.running ? ` • ${fmt(a.surge)} surge` : ''}</span>
    </span>
  `;
  card.addEventListener('click', () => {
    if (state.selected[a.id]) {
      delete state.selected[a.id];
    } else {
      state.selected[a.id] = { qty: 1 };
    }
    renderAppliancePanel();
    updateRunningTotalBar();
  });
  return card;
}

function initStep2() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      state.activeTab = tab;
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', String(b === btn));
      });
      renderAppliancePanel();
    });
  });

  const addBtn = document.getElementById('add-custom-btn');
  if (addBtn) {
    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const nameEl = document.getElementById('custom-name');
      const runEl = document.getElementById('custom-running');
      const surgeEl = document.getElementById('custom-surge');

      const name = (nameEl.value || '').trim();
      const running = parseInt(runEl.value, 10);
      const surge = surgeEl.value ? parseInt(surgeEl.value, 10) : running;

      if (!name) return showToast('Please enter an appliance name.');
      if (!running || running < 1) return showToast('Please enter valid running watts.');

      const id = `custom_${++customCounter}`;
      const custom = {
        id,
        name,
        icon: '🛠️',
        running,
        surge: surge >= running ? surge : running,
        tab: 'custom',
        custom: true,
      };
      state.custom.push(custom);
      state.selected[id] = { qty: 1 };

      nameEl.value = '';
      runEl.value = '';
      surgeEl.value = '';

      renderAppliancePanel();
      updateRunningTotalBar();
      showToast('Custom appliance added.');
    });
  }
}

function updateRunningTotalBar() {
  const { running, peak } = calcTotals();
  const rtRunning = document.getElementById('rt-running');
  const rtSurge = document.getElementById('rt-surge');
  if (rtRunning) rtRunning.textContent = fmt(running);
  if (rtSurge) rtSurge.textContent = fmt(peak);
}

/* ── Step 3 ───────────────────────────────────────────────── */
function renderReview() {
  const tbody = document.getElementById('review-tbody');
  const empty = document.getElementById('review-empty');
  const wrap = document.getElementById('review-table-wrap');

  const all = getAllAppliances();
  const ids = Object.keys(state.selected);

  if (!tbody || !empty || !wrap) return;

  if (ids.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = '';
    wrap.style.display = 'none';
    document.getElementById('review-total-running').textContent = '0 W';
    document.getElementById('review-total-surge').textContent = '0 W';
    return;
  }

  empty.style.display = 'none';
  wrap.style.display = '';

  tbody.innerHTML = '';
  ids.forEach(id => {
    const a = all.find(x => x.id === id);
    const qty = state.selected[id].qty;
    if (!a) return;

    const tr = document.createElement('tr');
    tr.dataset.id = id;
    tr.innerHTML = `
      <td>${a.name}</td>
      <td>
        <div class="qty-ctrl">
          <button class="qty-btn" data-action="dec" aria-label="Decrease quantity">−</button>
          <span class="qty-num">${qty}</span>
          <button class="qty-btn" data-action="inc" aria-label="Increase quantity">+</button>
        </div>
      </td>
      <td>${fmt(a.running * qty)}</td>
      <td>${fmt((a.surge || a.running) * qty)}</td>
      <td class="col-remove"><button class="remove-btn" data-action="remove" aria-label="Remove">✕</button></td>
    `;
    tbody.appendChild(tr);
  });

  const totals = calcTotals();
  document.getElementById('review-total-running').textContent = fmt(totals.running);
  document.getElementById('review-total-surge').textContent = fmt(totals.peak);
}

function handleReviewTableClick(e) {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const tr = btn.closest('tr[data-id]');
  if (!tr) return;

  const id = tr.dataset.id;
  const action = btn.dataset.action;
  if (!state.selected[id]) return;

  if (action === 'inc') {
    state.selected[id].qty += 1;
  } else if (action === 'dec') {
    state.selected[id].qty = Math.max(1, state.selected[id].qty - 1);
  } else if (action === 'remove') {
    delete state.selected[id];
  }

  renderReview();
  updateRunningTotalBar();
}

/* ── Step 4 ───────────────────────────────────────────────── */
function buildRecommendation({ recommended }) {
  if (recommended < 10000) {
    return {
      tone: 'green',
      emoji: '✅',
      heading: 'Compact standby recommendation',
      blurb: 'Ideal for essential backup loads and selective circuits.',
    };
  }
  if (recommended < 24000) {
    return {
      tone: 'amber',
      emoji: '⚙️',
      heading: 'Mid-range standby recommendation',
      blurb: 'Great for larger homes or mixed-use backup requirements.',
    };
  }
  return {
    tone: 'red',
    emoji: '🏭',
    heading: 'High-capacity recommendation',
    blurb: 'Best for extensive whole-property or high-demand applications.',
  };
}

function getGeneratorTypeText(recommended) {
  if (recommended < 12000) {
    return 'Portable or entry standby generator may be appropriate depending on transfer setup.';
  }
  if (recommended < 24000) {
    return 'A whole-home standby generator with automatic transfer switch is typically recommended.';
  }
  return 'A commercial/industrial-grade standby solution and professional load analysis is strongly recommended.';
}

function getTips(segment) {
  const common = [
    'Confirm starting loads with manufacturer nameplate ratings.',
    'Plan for future expansion and seasonal load changes.',
    'Consult a licensed electrician for transfer switch and code compliance.',
  ];

  if (segment === 'commercial') {
    return [
      'Identify business-critical circuits first (POS, refrigeration, lighting, internet).',
      'Coordinate outage priorities by department.',
      ...common,
    ];
  }

  if (segment === 'industrial') {
    return [
      'Prioritize process-critical motors and controls.',
      'Verify inrush/starting current assumptions with actual equipment data.',
      ...common,
    ];
  }

  return [
    'Separate essential vs convenience loads to optimize generator size.',
    'Account for HVAC startup surges in summer/winter peak conditions.',
    ...common,
  ];
}

function renderResults() {
  const totals = calcTotals();

  document.getElementById('res-running').textContent = fmt(totals.running);
  document.getElementById('res-peak').textContent = fmt(totals.peak);

  const rec = buildRecommendation(totals);
  const recCard = document.getElementById('rec-card');
  recCard.className = `rec-card ${rec.tone}`;
  recCard.innerHTML = `
    <div class="rec-emoji">${rec.emoji}</div>
    <div class="rec-body">
      <h3>${rec.heading}</h3>
      <span class="rec-size">${fmt(totals.recommended)}</span>
      <p>Recommended generator size range: <strong>${fmt(totals.rangeMin)} – ${fmt(totals.rangeMax)}</strong>. ${rec.blurb}</p>
    </div>
  `;

  const typeBlock = document.getElementById('generator-type-block');
  typeBlock.innerHTML = `
    <strong>Generator type guidance</strong>
    ${getGeneratorTypeText(totals.recommended)}
  `;

  const tipsList = document.getElementById('tips-list');
  tipsList.innerHTML = '';
  getTips(state.segment || 'residential').forEach(t => {
    const li = document.createElement('li');
    li.textContent = t;
    tipsList.appendChild(li);
  });

  const wrapper = document.getElementById('generator-calculator');
  const cta = document.getElementById('cta-btn');
  const url = wrapper?.dataset?.ctaUrl || '#';
  cta.href = url;
}

function returnToSegmentChooser() {
  state.segment = null;
  updateCalculatorHeading(null);
  showResidentialFlow(false);
  showBranchStep(true);
  document.querySelectorAll('.segment-card').forEach(b => b.setAttribute('aria-pressed', 'false'));
  safeScrollTop();
}

/* ── Nav / flow ───────────────────────────────────────────── */
function validateStep(step) {
  if (step === 0 && !state.coverage) {
    showToast('Please choose your coverage level.');
    return false;
  }
  if (step === 1 && !state.fuel) {
    showToast('Please choose your primary heating system.');
    return false;
  }
  if (step === 2) {
    applyDefaults();
    if (Object.keys(state.selected).length === 0) {
      showToast('Please select at least one appliance.');
      return false;
    }
  }
  if (step === 3 && Object.keys(state.selected).length === 0) {
    showToast('Please add at least one appliance before calculating.');
    return false;
  }
  return true;
}

function restart() {
  state.step = 0;
  state.coverage = null;
  state.fuel = null;
  state.selected = {};
  state.custom = [];
  state.activeTab = 'essential';
  customCounter = 0;

  document.querySelectorAll('.coverage-card').forEach(btn => {
    if (!btn.classList.contains('segment-card')) btn.setAttribute('aria-pressed', 'false');
  });
  document.querySelectorAll('.fuel-card').forEach(btn => btn.setAttribute('aria-pressed', 'false'));
  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    const active = i === 0;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });

  renderAppliancePanel();
  renderReview();
  updateRunningTotalBar();
  showStep(0);
  updateProgressBar();
}

function initNav() {
  const back = document.getElementById('btn-back');
  const next = document.getElementById('btn-next');
  const restartBtn = document.getElementById('btn-restart');

  if (back) {
    back.addEventListener('click', () => {
      if (state.step === 0) {
        returnToSegmentChooser();
        return;
      }
      state.step -= 1;
      showStep(state.step);
      updateProgressBar();

      if (state.step === 2) renderAppliancePanel();
      if (state.step === 3) renderReview();
      if (state.step === 4) renderResults();

      safeScrollTop();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      if (!validateStep(state.step)) return;

      if (state.step < 4) state.step += 1;

      if (state.step === 2) {
        applyDefaults();
        renderAppliancePanel();
      } else if (state.step === 3) {
        renderReview();
      } else if (state.step === 4) {
        renderResults();
      }

      showStep(state.step);
      updateProgressBar();
      safeScrollTop();
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      restart();
      returnToSegmentChooser();
    });
  }
}

/* ── Init ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initBranching();
  initStep0();
  initStep1();
  initStep2();
  initNav();

  const reviewTable = document.getElementById('review-tbody');
  if (reviewTable) {
    reviewTable.addEventListener('click', handleReviewTableClick);
  }

  showBranchStep(true);
  showResidentialFlow(false);
  updateCalculatorHeading(null);
  restart();
});
