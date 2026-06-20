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
  { label: 'Sports', emoji: '🏃', key: 'sports' },
  { label: 'Candy', emoji: '🍬', key: 'candy',
    submenu: [
      { label: 'Some', emoji: '🍬', key: 'candySome' },
      { label: 'Lots', emoji: '🍫', key: 'candyLots' },
    ] },
  { label: 'Alcohol', emoji: '🍺', key: 'alcohol',
    submenu: [
      { label: 'Some', emoji: '🍺', key: 'alcoholSome' },
      { label: 'Lots', emoji: '🍻', key: 'alcoholLots' },
    ] },
  { label: 'Smoked', emoji: '🚬', key: 'smoking',
    submenu: [
      { label: 'Some', emoji: '🚬', key: 'smokingSome' },
      { label: 'Lots', emoji: '🚬', key: 'smokingLots' },
    ] },
  { label: 'Sleep', emoji: '😴', key: 'sleep',
    submenu: [
      { label: 'Well', emoji: '💤', key: 'sleepWell' },
      { label: 'Poorly', emoji: '😫', key: 'sleepPoorly' },
      { label: 'Short', emoji: '⏰', key: 'sleepShort' },
      { label: 'Long', emoji: '🛌', key: 'sleepLong' },
    ] },
];

function logAction(key) {
  state.stats[key] = (state.stats[key] || 0) + 1;
  state.activities.push({ action: key, date: new Date().toISOString().slice(0, 10) });
  save();
}

function showRadialMenu(options, backFn) {
  const overlay = el('div', { class: 'overlay', onclick: (e) => { if (e.target === overlay) overlay.remove(); } });
  const menu = el('div', { class: 'action-menu' });

  options.forEach((o, i) => {
    const angle = (Math.PI / 2) + (i / options.length) * Math.PI * 2;
    const r = 100;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    const btn = el('button', {
      class: 'action-btn-circ',
      style: { transform: `translate(${x}px, ${y}px)` },
      onclick: (e) => {
        e.stopPropagation();
        logAction(o.key);
        overlay.remove();
      },
    }, o.emoji, ' ', o.label);
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
    const r = 100;
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
        }
      },
    }, a.emoji, ' ', a.label);
    menu.append(btn);
  });

  const centerBtn = el('button', { class: 'action-btn-center', onclick: () => { overlay.remove(); showWeightDialog(); } }, '⚖️ Enter weight');
  menu.append(centerBtn);
  overlay.append(menu);
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
