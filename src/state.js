const raw = localStorage.getItem('weightogotchi');
const saved = raw ? JSON.parse(raw) : {};
const state = {
  profile: saved.profile || null,
  weights: saved.weights || [],
  activities: saved.activities || [],
  stats: saved.stats || { sports: 0, candy: 0, alcohol: 0, smoking: 0 },
  view: 'pet',
};

function save() {
  localStorage.setItem('weightogotchi', JSON.stringify({
    profile: state.profile,
    weights: state.weights,
    activities: state.activities,
    stats: state.stats,
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
    steps.push(val);
  }

  const completed = steps.filter((v) => target > first ? current >= v : current <= v).length;
  const direction = target > first ? 'gain' : 'loss';
  return { first, target, current, steps, completed, total: 10, direction };
}
