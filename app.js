function toggleFS() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function render() {
  if (!state.profile) {
    showQuestionnaire();
    return;
  }

  const views = { pet: petView, history: historyView };
  const content = views[state.view]();

  const fsActive = !!document.fullscreenElement;

  const nav = el('nav', { class: 'nav' },
    el('button', {
      class: 'nav-btn' + (state.view === 'pet' ? ' active' : ''),
      onclick: () => { state.view = 'pet'; render(); },
    }, '🐣 Pet'),
    el('button', {
      class: 'nav-btn' + (state.view === 'history' ? ' active' : ''),
      onclick: () => { state.view = 'history'; render(); },
    }, '📈 History'),
    el('button', {
      class: 'nav-btn',
      onclick: showStatsDialog,
    }, '📊 Stats'),
    el('button', {
      class: 'nav-btn fs-btn',
      onclick: toggleFS,
    }, fsActive ? '⛶ Exit' : '⛶ Fullscreen'),
  );

  $('#app').replaceChildren(content, nav);
}

document.addEventListener('fullscreenchange', render);

if (!state.profile || state.weights.length === 0) {
  showQuestionnaire(state.profile || undefined);
} else {
  render();
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(reg => {
    function checkUpdate() { reg.update(); }
    document.addEventListener('visibilitychange', () => { if (!document.hidden) checkUpdate(); });
    setInterval(checkUpdate, 60 * 60 * 1000);
  });

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}
