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
        onclick: showActionMenu,
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

const ALL_ACTION_DEFS = ACTION_DEFS.flatMap(a =>
  a.submenu
    ? a.submenu.map(s => ({ ...s, label: `${a.label} – ${s.label}` }))
    : [a]
);

function actionInfo(key) {
  const def = ALL_ACTION_DEFS.find(a => a.key === key);
  return def ? { emoji: def.emoji, label: def.label } : { emoji: '❓', label: key };
}

function historyView() {
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
      const emojiEls = day.activities.map(a => {
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
