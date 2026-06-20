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
