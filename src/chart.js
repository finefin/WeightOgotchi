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
  if (state.profile?.heightCm) {
    const h = state.profile.heightCm / 100;
    const bmiLow = 18.5 * h * h;
    const bmiHigh = 25 * h * h;
    if (bmiLow < minW) minW = bmiLow;
    if (bmiHigh > maxW) maxW = bmiHigh;
  }
  minW = Math.floor(minW - 1);
  maxW = Math.ceil(maxW + 1);
  const wRange = maxW - minW || 1;

  const dates = data.map(d => new Date(d.date));
  const t0 = dates[0].getTime();
  const t1 = dates[dates.length - 1].getTime();
  const tRange = t1 - t0 || 1;

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

  if (state.profile?.heightCm) {
    const h = state.profile.heightCm / 100;
    const lowW = 18.5 * h * h;
    const highW = 25 * h * h;
    const yLow = yPos(lowW, minW, wRange, pad, plotH);
    const yHigh = yPos(highW, minW, wRange, pad, plotH);
    ctx.fillStyle = 'rgba(34, 197, 94, 0.08)';
    ctx.fillRect(pad.left, yHigh, plotW, yLow - yHigh);
    ctx.fillStyle = 'rgba(34, 197, 94, 0.5)';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Normal BMI', pad.left + 4, yHigh - 4);
  }
  if (target) drawRefLine('Target', target, '#22c55e', false);

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
