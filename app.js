const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const el = (tag, attrs = {}, ...children) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'class') e.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else e.setAttribute(k, v);
  }
  children.flat().filter(c => c != null).forEach((c) => e.append(typeof c === 'string' ? document.createTextNode(c) : c));
  return e;
};

// ---------- BMI ----------
const BMI_CATEGORIES = [
  { min: 0, max: 18.5, label: 'Underweight', color: '#60a5fa' },
  { min: 18.5, max: 25, label: 'Normal', color: '#22c55e' },
  { min: 25, max: 30, label: 'Overweight', color: '#f59e0b' },
  { min: 30, max: Infinity, label: 'Obese', color: '#ef4444' },
];

function calcBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  return weightKg / ((heightCm / 100) ** 2);
}

function bmiCategory(bmi) {
  if (bmi == null) return null;
  return BMI_CATEGORIES.find(c => bmi >= c.min && bmi < c.max) || BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
}

// ---------- messages ----------
const MESSAGES = {
  welcome: [
    'Oh great, another human who thinks this time it\'ll stick. Fine, tap me.',
    'You again? Alright, fine. Let\'s see if you last longer than a week this time.',
    'Look who finally showed up. The scale\'s been waiting. So have I.',
    'Don\'t make me look stupid for believing in you again. Tap me.',
    'Oh, you exist. Cool. Ready to log some sad numbers? Let\'s go.',
    'Welcome to the circus. Step on the scale whenever you\'re ready to cry.',
  ],
  firstLog: [
    'A wild number appeared! It\'s… a start. I guess.',
    'First weight logged. The bar was on the floor and you still barely cleared it. Proud?',
    'One down, infinity to go. You love suffering, don\'t you?',
    'You actually did it. I\'m genuinely shocked. Don\'t prove me right again.',
    'The first step of many. Or the only step. History says… only step.',
  ],
  progress: [
    'Still here? Huh. Starting to think you might actually be serious.',
    'Consistency? From YOU? Who possessed you and what did they pay?',
    'Congratulations, you\'re doing the bare minimum. Don\'t let it go to your head.',
    'You keep showing up. I hate that I\'m starting to respect you.',
    'Riveting stuff. Another number. Another day. Another step closer. Fine, I\'m impressed.',
    'You\'re building a habit. Or a very boring routine. Tomato, tomato.',
  ],
  halfway: [
    'HALFWAY. I take back 30% of the mean things I said about you.',
    'Middle child energy. You\'re not at the start, not at the finish. Just existing. Proud anyway.',
    '50%! If this were a test you\'d still fail, but for you? This is Olympic gold.',
    'You actually made it halfway. I owe someone an apology. Probably you.',
  ],
  almostThere: [
    'The finish line is so close even YOU can\'t trip over it. Probably.',
    'Almost there! Don\'t screw it up now. That\'s my job — to nag.',
    'So close I can taste it. Tastes like vindication. Don\'t prove me wrong NOW.',
    'One more push. If you quit now I will personally haunt your bathroom scale.',
  ],
  goalReached: [
    'YOU DID IT?! I\'M LITERALLY SHAKING. I NEVER DOUBTED YOU. (I doubted you.)',
    'GOAL WEIGHT. I need to sit down. You actually did the thing. The whole thing.',
    'Unbelievable. You reached your goal. I take back EVERYTHING. You\'re a legend.',
    '🎉🎉🎉 GOAL WEIGHT 🎉🎉🎉 Time to maintain. Which means you still can\'t eat garbage. Sorry.',
    'You won. The scale lost. I\'m crying pixels. This is beautiful.',
  ],
  setback: [
    'Up a bit? That\'s fine. Water weight, salt, gravity. We move.',
    'Weight fluctuates. Unlike your willpower, which is rock solid. Usually.',
    'It\'s one number. Not a life sentence. Stop spiraling and log the next one.',
    'You gained. So what? The scale isn\'t your eulogy. Try again tomorrow.',
    'Ah yes, the classic "two steps forward, one step back" dance. You\'re still ahead, idiot.',
    'Gained weight? Boring. Next entry, please. We don\'t do drama here.',
  ],
  onTrack: [
    'Downward trend. Nice. You\'re less of a disaster than yesterday.',
    'Dropping weight like it\'s hot. Which it is. Because you\'re on fire.',
    'Another good entry. I\'m running out of insults. This is concerning.',
    'You\'re doing well. And I hate that I had to admit that out loud.',
    'The numbers are going the right way. Don\'t let it get to your head. Or do. I don\'t care.',
  ],
  overdue: [
    'The deadline passed but YOU\'RE STILL HERE. That\'s more than most people. Keep going.',
    'Target date? Overrated. You\'re playing the long game. Or you forgot. Either way, log it.',
    'So you\'re late. Fashionably late. The scale doesn\'t care about dates. It cares about you.',
    'Missed your target date. Big deal. The universe didn\'t explode. Keep logging.',
    'Deadlines are made up. Results are real. You\'re still in the fight. That\'s what counts.',
  ],
};

function getMessage() {
  if (!state.profile) return MESSAGES.welcome[0];
  if (state.weights.length === 0) {
    return MESSAGES.welcome[Math.floor(Math.random() * MESSAGES.welcome.length)];
  }

  const sorted = [...state.weights].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0].weight;
  const last = sorted[sorted.length - 1].weight;
  const target = state.profile.targetWeight;
  const prog = calcProgress();
  const due = new Date(state.profile.targetDate);
  const overdue = due < new Date();

  // check goal reached
  if (prog && prog.completed >= 10) {
    return MESSAGES.goalReached[Math.floor(Math.random() * MESSAGES.goalReached.length)];
  }

  // check overdue
  if (overdue) {
    return MESSAGES.overdue[Math.floor(Math.random() * MESSAGES.overdue.length)];
  }

  // check first log
  if (sorted.length === 1) {
    return MESSAGES.firstLog[Math.floor(Math.random() * MESSAGES.firstLog.length)];
  }

  // check progress milestones
  const pct = prog ? prog.completed / prog.total : 0;
  if (pct >= 0.75) {
    return MESSAGES.almostThere[Math.floor(Math.random() * MESSAGES.almostThere.length)];
  }
  if (pct >= 0.5) {
    return MESSAGES.halfway[Math.floor(Math.random() * MESSAGES.halfway.length)];
  }
  if (pct > 0) {
    return MESSAGES.progress[Math.floor(Math.random() * MESSAGES.progress.length)];
  }

  // trend: compare last two entries
  if (sorted.length >= 2) {
    const prev = sorted[sorted.length - 2].weight;
    const diff = last - prev;
    const goingDown = target < first; // losing weight goal
    const goingUp = target > first;   // gaining weight goal
    if ((goingDown && diff < 0) || (goingUp && diff > 0)) {
      return MESSAGES.onTrack[Math.floor(Math.random() * MESSAGES.onTrack.length)];
    }
    if (diff !== 0) {
      return MESSAGES.setback[Math.floor(Math.random() * MESSAGES.setback.length)];
    }
  }

  return MESSAGES.progress[Math.floor(Math.random() * MESSAGES.progress.length)];
}

// ---------- state ----------
const raw = localStorage.getItem('weightogotchi');
const saved = raw ? JSON.parse(raw) : {};
const state = {
  profile: saved.profile || null,
  weights: saved.weights || [],
  view: 'pet',
};

function save() {
  localStorage.setItem('weightogotchi', JSON.stringify({
    profile: state.profile,
    weights: state.weights,
  }));
}

function calcIdealWeight() {
  const p = state.profile;
  if (!p) return null;
  const base = p.gender === 'male' ? 50 : 45.5;
  return base + 0.9 * (p.heightCm - 152);
}

function calcProgress() {
  if (!state.profile || state.weights.length === 0) return null;
  const sorted = [...state.weights].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0].weight;
  const target = state.profile.targetWeight;
  const current = sorted[sorted.length - 1].weight;
  const step = (target - first) / 10;

  const steps = [];
  for (let i = 1; i <= 10; i++) {
    const val = first + step * i;
    const passed = target > first ? current >= val : current <= val;
    steps.push(val);
  }

  const completed = steps.filter((v) => target > first ? current >= v : current <= v).length;
  const direction = target > first ? 'gain' : 'loss';
  return { first, target, current, steps, completed, total: 10, direction };
}

// ---------- questionnaire ----------
function showQuestionnaire(existing) {
  let gender = existing?.gender || 'male';
  const overlay = el('div', { class: 'overlay' });
  const heightInput = el('input', {
    type: 'number', min: '100', max: '250', placeholder: 'e.g. 175',
    class: 'weight-input', value: existing?.heightCm || '',
  });
  const targetInput = el('input', {
    type: 'number', step: '0.1', min: '20', max: '300', placeholder: 'e.g. 75',
    class: 'weight-input', value: existing?.targetWeight || '',
  });
  const dateInput = el('input', { type: 'date', class: 'weight-input' });
  if (existing?.targetDate) {
    dateInput.value = existing.targetDate;
  } else {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    dateInput.value = d.toISOString().slice(0, 10);
  }

  function genderBtn(val, label) {
    const b = el('button', {
      class: 'gender-btn' + (gender === val ? ' selected' : ''),
      onclick: () => { gender = val; $$('.gender-btn').forEach(b => b.classList.toggle('selected', b.dataset.val === gender)); },
    }, label);
    b.dataset.val = val;
    return b;
  }

  const isEdit = !!existing;
  const dialog = el('div', { class: 'dialog questionnaire' },
    el('h1', {}, isEdit ? 'Your Profile' : 'Welcome!'),
    el('p', { class: 'questionnaire-sub' }, isEdit ? 'Update your details' : 'Tell us a bit about yourself'),
    el('label', { class: 'field-label' }, 'Gender'),
    el('div', { class: 'gender-row' },
      genderBtn('male', 'Male'),
      genderBtn('female', 'Female'),
    ),
    el('label', { class: 'field-label' }, 'Height (cm)'),
    heightInput,
    el('label', { class: 'field-label' }, 'Target weight (kg)'),
    targetInput,
    el('label', { class: 'field-label' }, 'Target date'),
    dateInput,
    el('button', { class: 'btn', onclick: () => {
      const h = parseFloat(heightInput.value);
      const t = parseFloat(targetInput.value);
      const d = dateInput.value;
      if (!h || !t || !d) return;
      state.profile = { gender, heightCm: h, targetWeight: t, targetDate: d };
      save();
      overlay.remove();
      render();
    }}, isEdit ? 'Save' : 'Start!'),
  );
  overlay.append(dialog);
  document.body.append(overlay);
}

// ---------- weight log dialog ----------
function showWeightDialog() {
  const today = new Date().toISOString().slice(0, 10);
  const overlay = el('div', { class: 'overlay' });
  const input = el('input', {
    type: 'number', step: '0.1', placeholder: 'Weight (kg)',
    class: 'weight-input',
    onkeydown: (e) => { if (e.key === 'Enter') saveWeight(); },
  });

  function saveWeight() {
    const w = parseFloat(input.value);
    if (!w) return;
    state.weights.push({ weight: w, date: today });
    save();
    overlay.remove();
    render();
  }

  const dialog = el('div', { class: 'dialog' },
    el('h2', {}, today),
    input,
    el('div', { class: 'dialog-actions' },
      el('button', { class: 'btn secondary', onclick: () => overlay.remove() }, 'Cancel'),
      el('button', { class: 'btn', onclick: saveWeight }, 'Save'),
    ),
  );
  overlay.append(dialog);
  document.body.append(overlay);
  setTimeout(() => input.focus(), 100);
}

// ---------- edit entry dialog ----------
function showEditDialog(entry, idx) {
  const today = entry.date;
  const overlay = el('div', { class: 'overlay' });
  const input = el('input', {
    type: 'number', step: '0.1', class: 'weight-input', value: entry.weight,
    onkeydown: (e) => { if (e.key === 'Enter') saveEdit(); },
  });

  function saveEdit() {
    const w = parseFloat(input.value);
    if (!w) return;
    state.weights[idx].weight = w;
    save();
    overlay.remove();
    render();
  }

  const dialog = el('div', { class: 'dialog' },
    el('h2', {}, today),
    input,
    el('div', { class: 'dialog-actions' },
      el('button', { class: 'btn secondary', onclick: () => overlay.remove() }, 'Cancel'),
      el('button', { class: 'btn', style: { background: '#ef4444' }, onclick: () => {
        state.weights.splice(idx, 1);
        save();
        overlay.remove();
        render();
      }}, 'Delete'),
      el('button', { class: 'btn', onclick: saveEdit }, 'Save'),
    ),
  );
  overlay.append(dialog);
  document.body.append(overlay);
  setTimeout(() => input.focus(), 100);
}

// ---------- BMI info dialog ----------
function showBMIDialog() {
  const p = state.profile;
  const lastW = state.weights[state.weights.length - 1]?.weight;
  const bmi = calcBMI(lastW, p?.heightCm);
  const cat = bmiCategory(bmi);

  const overlay = el('div', { class: 'overlay' });

  const rows = BMI_CATEGORIES.map(c => {
    const active = cat && c.label === cat.label;
    return el('tr', { style: active ? { background: c.color + '22', fontWeight: '700' } : {} },
      el('td', { style: { padding: '0.3rem 0.5rem', color: active ? c.color : 'var(--text)' } },
        el('span', { style: { display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: c.color, marginRight: 6, verticalAlign: 'middle' } }),
        c.label,
      ),
      el('td', { style: { padding: '0.3rem 0.5rem', color: 'var(--muted)' } },
        c.max === Infinity ? `${c.min}+` : `${c.min} – ${c.max}`,
      ),
    );
  });

  const dialog = el('div', { class: 'dialog', style: { maxWidth: 320 } },
    el('h2', {}, 'BMI Info'),
    bmi != null && cat
      ? el('p', { style: { textAlign: 'center', fontSize: '2rem', fontWeight: '700', color: cat.color, margin: '0.25rem 0' } },
          `${bmi.toFixed(1)}`,
          el('span', { style: { fontSize: '0.9rem', fontWeight: '400', display: 'block', color: 'var(--muted)' } }, cat.label),
        )
      : el('p', { style: { textAlign: 'center', color: 'var(--muted)' } }, 'Log a weight to see your BMI.'),
    el('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' } },
      el('thead', {},
        el('tr', {},
          el('th', { style: { textAlign: 'left', padding: '0.3rem 0.5rem', color: 'var(--muted)', borderBottom: '1px solid var(--border)' } }, 'Category'),
          el('th', { style: { textAlign: 'left', padding: '0.3rem 0.5rem', color: 'var(--muted)', borderBottom: '1px solid var(--border)' } }, 'Range (kg/m²)'),
        ),
      ),
      el('tbody', {}, ...rows),
    ),
    el('div', { class: 'dialog-actions', style: { marginTop: '0.5rem' } },
      el('button', { class: 'btn', onclick: () => overlay.remove() }, 'Got it'),
    ),
  );
  overlay.append(dialog);
  document.body.append(overlay);
}

// ---------- chart dialog ----------
function showChartDialog() {
  if (state.weights.length === 0) return;
  const overlay = el('div', { class: 'overlay', style: { alignItems: 'flex-end', padding: 0 }, onclick: (e) => { if (e.target === overlay) overlay.remove(); } });
  const canvas = el('canvas', {
    class: 'chart',
    style: { width: '100%', height: '300px', display: 'block', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' },
  });
  const sheet = el('div', { style: { background: 'var(--surface)', width: '100%', maxWidth: 480, borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem', overflow: 'hidden' } },
    canvas,
    el('div', { style: { textAlign: 'center', padding: '0.75rem 1rem' } },
      el('button', { class: 'btn', style: { width: '100%' }, onclick: () => overlay.remove() }, 'Close'),
    ),
  );
  overlay.append(sheet);
  document.body.append(overlay);
  requestAnimationFrame(() => drawChart(canvas));
}

// ---------- chart ----------
function yPos(val, minW, wRange, pad, plotH) {
  return pad.top + plotH - ((val - minW) / wRange) * plotH;
}

function drawChart(canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = rect.height;
  const pad = { top: 16, right: 56, bottom: 36, left: 44 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const data = [...state.weights].sort((a, b) => a.date.localeCompare(b.date));
  ctx.clearRect(0, 0, W, H);

  if (data.length === 0) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('No entries yet', W / 2, H / 2);
    return;
  }

  // determine y range (include target, ideal, first weight, steps)
  const weights = data.map(d => d.weight);
  let minW = Math.min(...weights);
  let maxW = Math.max(...weights);
  const ideal = calcIdealWeight();
  const target = state.profile?.targetWeight;
  const prog = calcProgress();
  [ideal, target, prog?.first, ...(prog?.steps || [])].filter(v => v != null).forEach(v => {
    if (v < minW) minW = v;
    if (v > maxW) maxW = v;
  });
  minW = Math.floor(minW - 1);
  maxW = Math.ceil(maxW + 1);
  const wRange = maxW - minW || 1;

  const dates = data.map(d => new Date(d.date));
  const t0 = dates[0].getTime();
  const t1 = dates[dates.length - 1].getTime();
  const tRange = t1 - t0 || 1;

  // ----- grid -----
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.font = '11px system-ui';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';

  const ySteps = 5;
  for (let i = 0; i <= ySteps; i++) {
    const val = minW + (wRange * (ySteps - i)) / ySteps;
    const y = yPos(val, minW, wRange, pad, plotH);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();
    ctx.fillText(val.toFixed(1), pad.left - 6, y + 4);
  }

  ctx.textAlign = 'center';
  const xSteps = Math.min(data.length - 1, 6);
  for (let i = 0; i <= xSteps; i++) {
    const idx = Math.round((i * (data.length - 1)) / xSteps);
    const x = pad.left + (plotW * idx) / (data.length - 1);
    ctx.beginPath();
    ctx.moveTo(x, pad.top);
    ctx.lineTo(x, H - pad.bottom);
    ctx.stroke();
    ctx.fillStyle = '#64748b';
    ctx.fillText(data[idx].date.slice(5), x, H - pad.bottom + 16);
  }

  // ----- reference lines -----
  function drawRefLine(label, val, color, dashed) {
    const y = yPos(val, minW, wRange, pad, plotH);
    if (y < pad.top || y > pad.top + plotH) return;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    if (dashed) ctx.setLineDash([6, 4]);
    else ctx.setLineDash([]);
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = color;
    ctx.font = '11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(label, W - pad.right + 4, y + 4);
  }

  if (target) drawRefLine('Target', target, '#22c55e', false);
  if (ideal) drawRefLine('Ideal', ideal, '#22c55e', true);

  // ----- data line -----
  if (data.length < 2) {
    const d = data[0];
    const x = pad.left + plotW / 2;
    const y = yPos(d.weight, minW, wRange, pad, plotH);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#4f46e5';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    return;
  }

  const pts = data.map((d, i) => ({
    x: pad.left + (plotW * i) / (data.length - 1),
    y: yPos(d.weight, minW, wRange, pad, plotH),
    weight: d.weight,
  }));

  const hasTarget = target != null;
  const first = data[0].weight;
  const losing = hasTarget && target < first;

  ctx.lineWidth = 3.5;
  ctx.lineJoin = 'round';
  for (let i = 1; i < pts.length; i++) {
    const diff = pts[i].weight - pts[i - 1].weight;
    const towardTarget = hasTarget ? (losing ? diff < 0 : diff > 0) : null;
    ctx.beginPath();
    ctx.strokeStyle = towardTarget === null ? '#4f46e5' : towardTarget ? '#22c55e' : '#ef4444';
    ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
    ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
  }

  pts.forEach((p, i) => {
    const color = !hasTarget || i === 0 ? '#4f46e5' : (() => {
      const diff = p.weight - pts[i - 1].weight;
      return (losing ? diff < 0 : diff > 0) ? '#22c55e' : '#ef4444';
    })();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  });
}

// ---------- export / import ----------
function exportData() {
  const data = { profile: state.profile, weights: state.weights };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'weightogotchi.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.profile) state.profile = data.profile;
      if (Array.isArray(data.weights)) state.weights = data.weights;
      save();
      render();
    } catch { alert('Invalid file'); }
  };
  reader.readAsText(file);
}

const importInput = el('input', { type: 'file', accept: '.json', style: { display: 'none' } });
importInput.onchange = () => { if (importInput.files[0]) importData(importInput.files[0]); importInput.value = ''; };

// ---------- views ----------
function petView() {
  const p = state.profile;
  const ideal = calcIdealWeight();
  const prog = calcProgress();
  const msg = getMessage();

  const bubble = el('div', { class: 'bubble' }, msg);

  let paceInfo = null;
  if (p && state.weights.length > 0) {
    const current = state.weights[state.weights.length - 1].weight;
    const remainingKg = p.targetWeight - current;
    const now = new Date();
    const due = new Date(p.targetDate);
    const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    if (remainingKg === 0) {
      paceInfo = el('p', { class: 'pace-info goal-achieved' }, 'Goal reached! 🎉');
    } else if (daysLeft > 0) {
      const daily = remainingKg / daysLeft;
      const weekly = daily * 7;
      const verb = remainingKg < 0 ? 'Lose' : 'Gain';
      const absDaily = Math.abs(daily);
      const paceClass = absDaily <= 0.1 ? 'good' : absDaily <= 0.2 ? 'doable' : 'tough';
      paceInfo = el('p', { class: 'pace-info ' + paceClass },
        el('span', {}, `${verb} ${absDaily.toFixed(2)} kg/day`),
        el('span', {}, `${verb} ${Math.abs(weekly).toFixed(2)} kg/week`),
      );
    } else {
      paceInfo = el('p', { class: 'pace-info overdue' }, 'Target date passed');
    }
  }

  const goalReached = prog && prog.completed >= 10;

  return el('div', { class: 'view pet-view' },
    el('div', { class: 'pet-area' },
      el('div', {
        class: 'pet',
        onclick: showWeightDialog,
        ontouchstart: (e) => { e.currentTarget.style.transform = 'scale(0.92)'; },
        ontouchend: (e) => { e.currentTarget.style.transform = ''; },
      }, '🐣'),
      bubble,
    ),
    el('div', { class: 'info-panel' + (goalReached ? ' goal-reached' : '') },
      prog
        ? el('div', { class: 'panel-row' },
            el('span', { class: 'panel-label' }, 'Progress'),
            el('span', { class: 'panel-value' }, `${prog.completed}/${prog.total}`),
            el('div', { class: 'progress-track' },
              el('div', { class: 'progress-fill', style: { width: `${(prog.completed / prog.total) * 100}%` } }),
            ),
          )
        : null,
      paceInfo
        ? el('div', { class: 'panel-row' },
            el('span', { class: 'panel-label' }, 'Pace'),
            paceInfo,
          )
        : null,
      el('div', { class: 'panel-row', style: { cursor: 'pointer' }, onclick: showChartDialog },
        el('span', { class: 'panel-label' }, 'Last'),
        el('span', { class: 'panel-value' },
          state.weights.length > 0
            ? `${state.weights[state.weights.length - 1].weight} kg`
            : '—'),
      ),
      p && state.weights.length > 0
        ? el('div', { class: 'panel-row', style: { cursor: 'pointer' }, onclick: showBMIDialog },
            el('span', { class: 'panel-label' }, 'BMI'),
            el('span', { class: 'panel-value' },
              (() => {
                const bmi = calcBMI(state.weights[state.weights.length - 1].weight, p.heightCm);
                const cat = bmiCategory(bmi);
                if (bmi != null && cat) {
                  return el('span', { style: { color: cat.color } },
                    `${bmi.toFixed(1)} `,
                    el('span', { style: { fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 400 } }, cat.label),
                  );
                }
                return '—';
              })(),
            ),
          )
        : null,
      p
        ? el('div', { class: 'panel-row panel-sub' },
            el('span', {}, `${p.gender === 'male' ? '♂' : '♀'} ${p.heightCm}cm · Target ${p.targetWeight}kg · Ideal ${ideal != null ? ideal.toFixed(1) : '—'}kg`),
            el('button', { class: 'edit-profile-btn', onclick: () => showQuestionnaire(state.profile) }, '✎'),
          )
        : null,
    ),
  );
}

function historyView() {
  const canvas = el('canvas', { class: 'chart' });
  const list = el('ul', { class: 'weight-list' },
    ...state.weights.toReversed().map((e, i) => {
      const idx = state.weights.length - 1 - i;
      return el('li', {
        class: 'entry-row',
        onclick: () => showEditDialog(e, idx),
      },
        el('span', { class: 'entry-date' }, e.date.slice(5)),
        el('span', { class: 'weight-val' }, `${e.weight} kg`),
        el('button', {
          class: 'delete-entry',
          onclick: (ev) => {
            ev.stopPropagation();
            state.weights.splice(idx, 1);
            save();
            render();
          },
        }, '✕'),
      );
    }),
  );

  const v = el('div', { class: 'view history-view' },
    el('div', { class: 'chart-wrap' }, canvas),
    el('div', { class: 'history-header' },
      el('h2', { class: 'history-heading' }, 'History'),
      el('div', { class: 'history-actions' },
        el('button', { class: 'action-btn', onclick: exportData }, 'Export'),
        el('button', { class: 'action-btn', onclick: () => importInput.click() }, 'Import'),
        state.weights.length > 0
          ? el('button', { class: 'action-btn danger', onclick: () => {
              state.weights = [];
              save();
              showQuestionnaire(state.profile);
            }}, 'Reset')
          : null,
      ),
    ),
    state.weights.length === 0
      ? el('p', { class: 'empty' }, 'No entries yet')
      : list,
  );

  requestAnimationFrame(() => drawChart(canvas));
  canvas._resizeObserver?.disconnect();
  canvas._resizeObserver = new ResizeObserver(() => drawChart(canvas));
  canvas._resizeObserver.observe(canvas);

  return v;
}

// ---------- render ----------
function render() {
  if (!state.profile) {
    showQuestionnaire();
    return;
  }

  const views = { pet: petView, history: historyView };
  const content = views[state.view]();

  const nav = el('nav', { class: 'nav' },
    el('button', {
      class: 'nav-btn' + (state.view === 'pet' ? ' active' : ''),
      onclick: () => { state.view = 'pet'; render(); },
    }, '🐣 Pet'),
    el('button', {
      class: 'nav-btn' + (state.view === 'history' ? ' active' : ''),
      onclick: () => { state.view = 'history'; render(); },
    }, '📈 History'),
  );

  $('#app').replaceChildren(content, nav);
}

// ---------- init ----------
if (!state.profile || state.weights.length === 0) {
  showQuestionnaire(state.profile || undefined);
} else {
  render();
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
