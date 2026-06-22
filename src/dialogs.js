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
    adjustHappinessForWeight();
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
    adjustHappinessForWeight();
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

const ACTION_DEFS = [
  
  { label: 'Sports', emoji: '🏃', key: 'sports', 
    submenu: [
      { label: 'Stairs', emoji: '🧗', key: 'sportStairs', image: 'img/actions/sportStairs.svg', happiness: 0.1 },
      { label: 'Walking', emoji: '🚶', key: 'sportWalk', image: 'img/actions/sportWalk.svg', happiness: 0.12 },
      { label: 'Trampoline', emoji: '🤸', key: 'sportTramp', image: 'img/actions/sportTramp.svg', happiness: 0.18 },
      { label: 'Marathon', emoji: '🏅', key: 'sportMarathon', image: 'img/actions/sportMarathon.svg', happiness: 0.25 },
    ]
  },
  { label: 'Food', emoji: '🍽️', key: 'food',
    submenu: [
      { label: 'Candy', emoji: '🍬', key: 'candySome', image: 'img/actions/candySome.svg', happiness: -0.1 },
      { label: 'Lots of candy', emoji: '🍫', key: 'candyLots', image: 'img/actions/candyLots.svg', happiness: -0.2 },
      { label: 'Fast food', emoji: '🍔', key: 'foodFast', image: 'img/actions/foodFast.svg', happiness: -0.15 },
      { label: 'Healthy food', emoji: '🥗', key: 'foodHealthy', image: 'img/actions/foodHealthy.svg', happiness: 0.1 },
    ] },
  { label: 'Alcohol', emoji: '🍺', key: 'alcohol',
    submenu: [
      { label: 'Some', emoji: '🍺', key: 'alcoholSome', image: 'img/actions/alcoholSome.svg', happiness: -0.12 },
      { label: 'Lots', emoji: '🍻', key: 'alcoholLots', image: 'img/actions/alcoholLots.svg', happiness: -0.25 },
    ] },
  { label: 'Smoked', emoji: '🚬', key: 'smoking',
    submenu: [
      { label: 'Some', emoji: '🚬', key: 'smokingSome', image: 'img/actions/smokingSome.svg', happiness: -0.15 },
      { label: 'Lots', emoji: '🚬', key: 'smokingLots', image: 'img/actions/smokingLots.svg', happiness: -0.3 },
    ] },
  { label: 'Sleep', emoji: '😴', key: 'sleep',
    submenu: [
      { label: 'Well', emoji: '💤', key: 'sleepWell', image: 'img/actions/sleepWell.svg', happiness: 0.05 },
      { label: 'Poorly', emoji: '😫', key: 'sleepPoorly', image: 'img/actions/sleepPoorly.svg', happiness: -0.05 },
      { label: 'Short', emoji: '⏰', key: 'sleepShort', image: 'img/actions/sleepShort.svg', happiness: -0.08 },
      { label: 'Long', emoji: '🛌', key: 'sleepLong', image: 'img/actions/sleepLong.svg', happiness: 0.1 },
    ] },
];

function logAction(key) {
  state.stats[key] = (state.stats[key] || 0) + 1;
  state.activities.push({ action: key, date: new Date().toISOString().slice(0, 10) });
  state.lastAction = key;
  const def = ALL_ACTION_DEFS.find(a => a.key === key);
  if (def && def.happiness) {
    state.happiness = Math.max(-1, Math.min(1, state.happiness + def.happiness));
  }
  save();
}

function adjustHappinessForWeight() {
  const p = state.profile;
  if (!p || state.weights.length < 2) return;
  const sorted = [...state.weights].sort((a, b) => a.date.localeCompare(b.date));
  const prev = sorted[sorted.length - 2].weight;
  const current = sorted[sorted.length - 1].weight;
  const target = p.targetWeight;
  if (Math.abs(current - target) < Math.abs(prev - target)) {
    state.happiness = Math.min(1, state.happiness + 0.08);
  }
}

function showRadialMenu(options, backFn) {
  const overlay = el('div', { class: 'overlay', onclick: (e) => { if (e.target === overlay) overlay.remove(); } });
  const menu = el('div', { class: 'action-menu' });

  options.forEach((o, i) => {
    const angle = (Math.PI / 2) + (i / options.length) * Math.PI * 2;
    const r = 120;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    const btn = el('button', {
      class: 'action-btn-circ',
      style: { transform: `translate(${x}px, ${y}px)` },
      onclick: (e) => {
        e.stopPropagation();
        logAction(o.key);
        overlay.remove();
        render();
      },
    }, o.emoji);
    menu.append(btn);
  });

  const centerBtn = el('button', { class: 'action-btn-center', onclick: () => { overlay.remove(); backFn(); } }, '← Back');
  menu.append(centerBtn);
  overlay.append(menu);
  document.body.append(overlay);
}

function showActionMenu() {
  const overlay = el('div', { class: 'overlay', onclick: (e) => { if (e.target === overlay) overlay.remove(); } });
  const menu = el('div', { class: 'action-menu' });

  ACTION_DEFS.forEach((a, i) => {
    const angle = (Math.PI / 2) + (i / ACTION_DEFS.length) * Math.PI * 2;
    const r = 120;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    const btn = el('button', {
      class: 'action-btn-circ',
      style: { transform: `translate(${x}px, ${y}px)` },
      onclick: (e) => {
        e.stopPropagation();
        if (a.submenu) {
          overlay.remove();
          showRadialMenu(a.submenu, showActionMenu);
        } else {
          logAction(a.key);
          overlay.remove();
          render();
        }
      },
    }, a.emoji);
    menu.append(btn);
  });

  const centerBtn = el('button', { class: 'action-btn-center', onclick: () => { overlay.remove(); showWeightDialog(); } }, '⚖️ Enter weight');
  menu.append(centerBtn);
  overlay.append(menu);
  document.body.append(overlay);
}

function showStatsDialog() {
  const overlay = el('div', { class: 'overlay', onclick: (e) => { if (e.target === overlay) overlay.remove(); } });
  const currentHappiness = state.happiness ?? 0;

  const happinessLabel = (key) => {
    const h = actionHappiness(key);
    if (h === 0) return null;
    const color = h > 0 ? '#22c55e' : '#ef4444';
    const sign = h > 0 ? '+' : '';
    return el('span', {
      class: 'stat-happiness',
      style: { color },
    }, `${sign}${h.toFixed(2)}`);
  };

  const allEntries = Object.entries(state.stats)
    .filter(([, count]) => count > 0)
    .sort((a, b) => categoryIndex(a[0]) - categoryIndex(b[0]));

  const goodEntries = allEntries.filter(([k]) => actionHappiness(k) > 0);
  const badEntries = allEntries.filter(([k]) => actionHappiness(k) < 0);

  const section = (title, entries, color) => entries.length === 0 ? null : el('div', { class: 'stat-section' },
    el('div', { class: 'stat-section-title', style: { color } }, title),
    ...entries.map(([key, count]) => {
      const info = actionInfo(key);
      return el('div', { class: 'stat-row' },
        el('div', { class: 'stat-info' },
          el('span', {}, `${info.emoji} ${info.label}`),
          happinessLabel(key),
        ),
        el('span', { class: 'stat-count' }, `${count}`),
      );
    }),
  );

  const goodTotal = goodEntries.reduce((s, [k, c]) => s + actionHappiness(k) * c, 0);
  const badTotal = badEntries.reduce((s, [k, c]) => s + Math.abs(actionHappiness(k)) * c, 0);

  const dialog = el('div', { class: 'dialog', style: { maxWidth: 340 } },
    el('h2', {}, 'Activity Stats'),
    el('div', { class: 'stat-happiness-bar' },
      el('span', {}, '😠'),
      el('div', { class: 'stat-happiness-track' },
        el('div', {
          class: 'stat-happiness-fill',
          style: { width: `${((currentHappiness + 1) / 2) * 100}%` },
        }),
      ),
      el('span', {}, '😊'),
      el('span', { class: 'stat-happiness-value' }, `${(1 + currentHappiness).toFixed(2)}`),
    ),
    goodEntries.length + badEntries.length > 0
      ? [section('Good', goodEntries, '#22c55e'), section('Bad', badEntries, '#ef4444')]
      : el('p', { style: { textAlign: 'center', color: 'var(--muted)' } }, 'No activities logged yet'),
    goodEntries.length + badEntries.length > 0
      ? el('div', { class: 'stat-equation' },
          el('span', {}, '1.00'),
          el('span', {}, ' + '),
          el('span', { style: { color: '#22c55e' } }, goodTotal > 0 ? `+${goodTotal.toFixed(2)}` : '0.00'),
          el('span', {}, ' − '),
          el('span', { style: { color: '#ef4444' } }, badTotal > 0 ? badTotal.toFixed(2) : '0.00'),
          el('span', {}, ' = '),
          el('span', {
            style: { color: currentHappiness >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700 },
          }, (1 + currentHappiness).toFixed(2)),
        )
      : null,
    el('div', { class: 'dialog-actions' },
      el('button', { class: 'btn', onclick: () => overlay.remove() }, 'Close'),
    ),
  );
  overlay.append(dialog);
  document.body.append(overlay);
}

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
