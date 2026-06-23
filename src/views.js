let devMode = false;
let devTapCount = 0;
let devTapTimer = null;
let locked = true;

function handlePetTap() {
  devTapCount++;
  clearTimeout(devTapTimer);
  devTapTimer = setTimeout(() => { devTapCount = 0; }, 10000);
  if (devTapCount >= 10) {
    devTapCount = 0;
    if (!devMode) {
      devMode = true;
      render();
    }
  }
  showActionMenu();
}

function mostSignificantRecentAction() {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const cutoff = twoDaysAgo.toISOString().slice(0, 10);

  let best = null;
  let bestAbs = 0;
  const seen = new Set();
  for (let i = state.activities.length - 1; i >= 0; i--) {
    const a = state.activities[i];
    if (a.date < cutoff) break;
    if (seen.has(a.action)) continue;
    seen.add(a.action);
    const h = actionHappiness(a.action);
    const absH = Math.abs(h);
    if (absH > bestAbs) {
      bestAbs = absH;
      best = a.action;
    }
  }
  return best;
}

function petImageSrc() {
  if (state.lastAction && window._lastActionTime && Date.now() - window._lastActionTime < 10000) {
    const info = actionInfo(state.lastAction);
    if (info.image) return info.image;
  }
  const significant = mostSignificantRecentAction();
  if (significant) {
    const info = actionInfo(significant);
    if (info.image) return info.image;
  }
  return 'img/pet.svg';
}

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
  const isLocked = state.profile?.password && locked;

  const statItems = ALL_ACTION_DEFS
    .filter(a => (state.stats[a.key] || 0) > 0)
    .map(a => el('span', { class: 'stat-chip' },
      `${a.emoji} ${state.stats[a.key]}`,
    ));
  const statBar = statItems.length > 0
    ? el('div', { class: 'stat-bar' }, ...statItems)
    : null;

  const imgSrc = petImageSrc();
  const lastKey = state.lastAction || 'default';

  return el('div', { class: 'view pet-view' },
    el('div', { class: 'pet-area' },
      el('div', { class: 'pet-anim-wrap', 'data-key': lastKey },
        el('img', {
          class: 'pet-img',
          src: imgSrc,
          alt: 'pet',
          onclick: handlePetTap,
          ontouchstart: (e) => { e.currentTarget.style.transform = 'scale(0.92)'; },
          ontouchend: (e) => { e.currentTarget.style.transform = ''; },
        }),
      ),
      bubble,
    ),
    statBar,
    el('div', { class: 'happiness-bar' },
      el('div', { class: 'happiness-label' }, '😠'),
      el('div', { class: 'happiness-track' },
        el('div', {
          class: 'happiness-fill',
          style: { width: `${((state.happiness + 1) / 2) * 100}%` },
        }),
      ),
      el('div', { class: 'happiness-label' }, '😊'),
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
      el('div', { class: 'panel-row', style: { cursor: 'pointer' }, onclick: isLocked ? showPasswordPrompt : showChartDialog },
        el('span', { class: 'panel-label' }, 'Last'),
        el('span', { class: 'panel-value' },
          isLocked
            ? '🔒'
            : state.weights.length > 0
              ? `${state.weights[state.weights.length - 1].weight} kg`
              : '—'),
      ),
      p && state.weights.length > 0
        ? el('div', { class: 'panel-row', style: { cursor: 'pointer' }, onclick: isLocked ? showPasswordPrompt : showBMIDialog },
            el('span', { class: 'panel-label' }, 'BMI'),
            el('span', { class: 'panel-value' },
              isLocked ? '🔒'
                : (() => {
                    const bmi = calcBMI(state.weights[state.weights.length - 1].weight, p.heightCm);
                    const cat = bmiCategory(bmi);
                    if (bmi != null && cat) {
                      return el('span', { style: { color: cat.color } },
                        `${bmi.toFixed(1)}`,
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
    devMode ? devPanel() : null,
  );
}

const ALL_ACTION_DEFS = ACTION_DEFS.flatMap(a =>
  a.submenu
    ? a.submenu.map(s => ({ ...s, label: `${a.label} – ${s.label}` }))
    : [a]
);

function actionInfo(key) {
  const def = ALL_ACTION_DEFS.find(a => a.key === key);
  return def
    ? { emoji: def.emoji, label: def.label, image: def.image }
    : { emoji: '❓', label: key, image: null };
}

function actionHappiness(key) {
  const def = ALL_ACTION_DEFS.find(a => a.key === key);
  return def?.happiness || 0;
}

function categoryIndex(key) {
  for (let i = 0; i < ACTION_DEFS.length; i++) {
    const def = ACTION_DEFS[i];
    if (def.key === key) return i;
    if (def.submenu && def.submenu.some(s => s.key === key)) return i;
  }
  return ACTION_DEFS.length;
}

function devPanel() {
  const btn = (label, fn, cls) => el('button', {
    class: 'dev-btn' + (cls ? ' ' + cls : ''),
    onclick: fn,
  }, label);

  return el('div', { class: 'dev-panel' },
    el('div', { class: 'dev-title' }, '⚙ Dev Mode'),
    el('div', { class: 'dev-row' },
      btn('25%', () => devSetProgress(0.25)),
      btn('50%', () => devSetProgress(0.5)),
      btn('75%', () => devSetProgress(0.75)),
      btn('Goal!', devSetGoal),
    ),
    el('div', { class: 'dev-row' },
      btn('Overdue', devSetOverdue),
      btn('➕ Weight', devAddWeight),
      btn('➕ Activity', devAddActivity),
    ),
    el('div', { class: 'dev-row' },
      btn('🧹 Clear', devClear, 'danger'),
      btn('🚪 Exit', () => { devMode = false; render(); }),
    ),
  );
}

function devSetProgress(pct) {
  const p = state.profile;
  if (!p || state.weights.length === 0) return;
  const sorted = [...state.weights].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0].weight;
  const step = (p.targetWeight - first) / 10;
  const val = first + step * pct * 10;
  const today = new Date().toISOString().slice(0, 10);
  state.weights.push({ weight: Math.round(val * 10) / 10, date: today });
  save();
  render();
}

function devSetGoal() {
  const p = state.profile;
  if (!p) return;
  const today = new Date().toISOString().slice(0, 10);
  state.weights.push({ weight: p.targetWeight, date: today });
  save();
  render();
}

function devSetOverdue() {
  const p = state.profile;
  if (!p) return;
  const d = new Date();
  d.setDate(d.getDate() - 1);
  p.targetDate = d.toISOString().slice(0, 10);
  save();
  render();
}

function devAddWeight() {
  const current = state.weights[state.weights.length - 1]?.weight || 70;
  const delta = (Math.random() - 0.45) * 1.2;
  const lastDate = state.weights[state.weights.length - 1]?.date;
  const d = lastDate ? new Date(lastDate) : new Date();
  d.setDate(d.getDate() + 1);
  const date = d.toISOString().slice(0, 10);
  state.weights.push({ weight: Math.round((current + delta) * 10) / 10, date });
  adjustHappinessForWeight();
  save();
  render();
}

function devAddActivity() {
  const keys = ALL_ACTION_DEFS.map(a => a.key);
  const key = keys[Math.floor(Math.random() * keys.length)];
  logAction(key);
  render();
}

function devClear() {
  state.weights = [];
  state.activities = [];
  state.stats = {};
  state.lastAction = null;
  state.happiness = 0;
  save();
  render();
}

function historyView() {
  const isLocked = state.profile?.password && locked;

  if (isLocked) {
    return el('div', { class: 'view history-view', style: { alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '2rem' } },
      el('p', { style: { fontSize: '2rem' }, onclick: showPasswordPrompt }, '🔒'),
      el('p', { style: { color: 'var(--muted)', fontSize: '0.85rem', cursor: 'pointer' }, onclick: showPasswordPrompt }, 'Tap to unlock'),
    );
  }

  const canvas = el('canvas', { class: 'chart' });

  const byDate = {};
  state.weights.forEach(w => {
    if (!byDate[w.date]) byDate[w.date] = { weight: null, activities: [] };
    byDate[w.date].weight = w;
  });
  state.activities.forEach(a => {
    if (!byDate[a.date]) byDate[a.date] = { weight: null, activities: [] };
    byDate[a.date].activities.push(a);
  });

  const sortedDates = Object.keys(byDate).sort().reverse();

  const list = el('ul', { class: 'weight-list' },
    ...sortedDates.map(date => {
      const day = byDate[date];
      const emojiEls = [...day.activities]
        .sort((a, b) => categoryIndex(a.action) - categoryIndex(b.action))
        .map(a => {
          const info = actionInfo(a.action);
          return el('span', { class: 'day-emoji', title: info.label }, info.emoji);
        });

      return el('li', {
        class: 'entry-row' + (day.weight ? '' : ' no-weight'),
        onclick: day.weight ? () => {
          const idx = state.weights.indexOf(day.weight);
          showEditDialog(day.weight, idx);
        } : null,
      },
        el('span', { class: 'entry-date' }, date.slice(5)),
        day.weight
          ? el('span', { class: 'weight-val' }, `${day.weight.weight} kg`)
          : null,
        emojiEls.length
          ? el('span', { class: 'day-emojis' }, ...emojiEls)
          : null,
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
        state.weights.length || state.activities.length
          ? el('button', { class: 'action-btn danger', onclick: () => {
              state.weights = [];
              state.activities = [];
              state.stats = { sports: 0, candy: 0, alcohol: 0, smoking: 0 };
              state.lastAction = null;
              save();
              showQuestionnaire(state.profile);
            }}, 'Reset')
          : null,
      ),
    ),
    sortedDates.length === 0
      ? el('p', { class: 'empty' }, 'No entries yet')
      : list,
  );

  requestAnimationFrame(() => drawChart(canvas));
  canvas._resizeObserver?.disconnect();
  canvas._resizeObserver = new ResizeObserver(() => drawChart(canvas));
  canvas._resizeObserver.observe(canvas);

  return v;
}
