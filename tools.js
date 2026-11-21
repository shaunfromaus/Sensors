// Sensor Toolkit (iPhone / web edition) — tool screens and navigation.
'use strict';

// ---------- gravity-based tools ----------
function inclineTool() {
  const T = {}; let p0 = store.get('inc_p0', 0), r0 = store.get('inc_r0', 0), e0 = store.get('inc_e0', 0), edge = false, cp = 0, cr = 0, ce = 0, lastUi = 0;
  let main, hint, dial, st, modeB, ang = 0;
  T.build = () => {
    const c = card(); main = big(c, 'Slope', 'degrees'); hint = sub(c);
    dial = canvasBox(c, 220);
    dial.draw = (x, W, H) => {
      x.clearRect(0, 0, W, H); const cx = W / 2, cy = H / 2, r = Math.min(W, H) / 2 - 6;
      x.lineWidth = 2; x.strokeStyle = '#3A414D'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.stroke();
      for (let i = 0; i < 360; i += 5) { const a = i * RAD, l = i % 30 === 0 ? 14 : i % 10 === 0 ? 9 : 5;
        x.strokeStyle = i % 90 === 0 ? '#E8EAED' : '#5A6270'; x.beginPath(); x.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); x.lineTo(cx + Math.cos(a) * (r - l), cy + Math.sin(a) * (r - l)); x.stroke(); }
      x.lineWidth = 1; x.strokeStyle = '#5A6270'; x.beginPath(); x.moveTo(cx - r, cy); x.lineTo(cx + r, cy); x.stroke();
      x.save(); x.translate(cx, cy); x.rotate(-ang * RAD); x.lineWidth = 4; x.strokeStyle = Math.abs(ang) < .3 ? '#66BB6A' : '#4DB6AC';
      x.beginPath(); x.moveTo(-r + 16, 0); x.lineTo(r - 16, 0); x.stroke(); x.restore();
      x.fillStyle = '#E8EAED'; x.beginPath(); x.arc(cx, cy, 5, 0, 7); x.fill();
    };
    st = stats([['Long axis', '°'], ['Short axis', '°'], ['Grade', '%']]);
    [, , , modeB] = buttons([holdBtn(T), ['Zero', zero], ['Clear zero', () => { p0 = r0 = e0 = 0; save(); }], ['Edge mode', () => { edge = !edge; mode(); }]]);
    mode();
    note('Lock screen rotation (Control Centre) so the page doesn’t turn while you measure.');
  };
  const save = () => { store.set('inc_p0', p0); store.set('inc_r0', r0); store.set('inc_e0', e0); };
  const zero = () => { if (edge) e0 = ce; else { p0 = cp; r0 = cr; } save(); };
  const mode = () => { modeB.textContent = edge ? 'Flat mode' : 'Edge mode'; hint.textContent = edge ? 'EDGE: stand the phone on any edge against the surface' : 'FLAT: lay the phone screen-up on the surface'; main.l.textContent = edge ? 'Edge angle' : 'Slope'; st[0].l.textContent = edge ? 'Rotation' : 'Long axis'; };
  T.motion = () => {
    const g = S.grav, m = gmag(g); if (m < 1) return;
    cp = Math.asin(clamp1(g[1] / m)) * DEG; cr = Math.asin(clamp1(g[0] / m)) * DEG;
    const rot = Math.atan2(-g[0], g[1]) * DEG; let a = ((rot % 90) + 90) % 90; if (a > 45) a -= 90; ce = a;
    const now = performance.now(); if (now - lastUi < 50) return; lastUi = now;
    const p = cp - p0, r = cr - r0; let slope;
    if (edge) { slope = ce - e0; ang = slope; } else { slope = Math.min(90, Math.hypot(p, r)); ang = Math.abs(p) >= Math.abs(r) ? p : r; }
    main.set(f(Math.abs(slope), 1)); main.color(Math.abs(slope) < .3 ? '#66BB6A' : '');
    st[0].set(edge ? f(rot, 1) : f(p, 1)); st[1].set(edge ? '--' : f(r, 1));
    st[2].set(Math.abs(slope) >= 89.9 ? '--' : f(Math.tan(Math.abs(slope) * RAD) * 100, 1)); dial.req();
  };
  T.help = 'FLAT mode: lay the phone screen-up on the surface. Shows total slope, the tilt along the long and short axes, and grade (% = rise/run × 100).\n\nEDGE mode: stand the phone on any edge against the surface (door frame, bench edge). Shows the angle of that edge from level or plumb.\n\nZero: place the phone on a known-level surface and tap Zero to remove the sensor offset and camera-bump tilt.';
  return T;
}

function levelTool() {
  const T = {}; let x0 = store.get('lvl_x0', 0), y0 = store.get('lvl_y0', 0), ax = 0, ay = 0, bx = 0, by = 0, hx = 0, up = false, lastUi = 0, box, st;
  T.build = () => {
    box = canvasBox(null, 400);
    box.draw = (c, w, h) => {
      c.clearRect(0, 0, w, h); const vh = 46, cx = w / 2, cy = (h - vh - 20) / 2 + 6, R = Math.min(w / 2 - 20, cy - 10), range = 10;
      const flatL = !up && Math.hypot(bx, by) < .3;
      c.fillStyle = flatL ? '#1B3A20' : '#20262F'; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
      c.strokeStyle = '#4A5260'; c.lineWidth = 1.5; for (let d = 2; d <= 10; d += 2) { c.beginPath(); c.arc(cx, cy, R * d / range, 0, 7); c.stroke(); }
      c.beginPath(); c.moveTo(cx - R, cy); c.lineTo(cx + R, cy); c.moveTo(cx, cy - R); c.lineTo(cx, cy + R); c.stroke();
      c.strokeStyle = '#E8EAED'; c.beginPath(); c.arc(cx, cy, R * .05 + 14, 0, 7); c.stroke();
      if (!up) { let dx = bx / range, dy = -by / range; const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; }
        c.fillStyle = flatL ? '#66BB6A' : '#D4E157'; c.beginPath(); c.arc(cx + dx * (R - 14), cy + dy * (R - 14), 14, 0, 7); c.fill(); }
      const top = h - vh - 12, l = 16, r = w - 16, mid = (l + r) / 2, val = up ? hx : bx, hl = Math.abs(val) < .3;
      c.fillStyle = hl ? '#1B3A20' : '#20262F'; c.beginPath(); c.roundRect(l, top, r - l, vh, vh / 2); c.fill();
      c.strokeStyle = '#E8EAED'; c.beginPath(); c.moveTo(mid - 22, top); c.lineTo(mid - 22, top + vh); c.moveTo(mid + 22, top); c.lineTo(mid + 22, top + vh); c.stroke();
      const p = mid + Math.max(-1, Math.min(1, val / 5)) * ((r - l) / 2 - vh / 2);
      c.fillStyle = hl ? '#66BB6A' : '#D4E157'; c.beginPath(); c.roundRect(p - 20, top + 8, 40, vh - 16, 15); c.fill();
    };
    st = stats([['Left ↔ Right', '°'], ['Top ↕ Bottom', '°']]);
    buttons([holdBtn(T), ['Zero', () => { x0 = ax; y0 = ay; store.set('lvl_x0', x0); store.set('lvl_y0', y0); }], ['Clear zero', () => { x0 = y0 = 0; store.set('lvl_x0', 0); store.set('lvl_y0', 0); }]]);
    note('Lay flat for the round (surface) bubble. Stand the phone on its bottom edge to use the horizontal vial like a normal spirit level. Turns green within 0.3°.');
  };
  T.motion = () => {
    const g = S.grav, m = gmag(g); if (m < 1) return;
    ax = Math.asin(clamp1(g[0] / m)) * DEG; ay = Math.asin(clamp1(g[1] / m)) * DEG;
    const now = performance.now(); if (now - lastUi < 40) return; lastUi = now;
    bx = ax - x0; by = ay - y0; up = Math.abs(g[2] / m) < .5; hx = up ? Math.atan2(g[0], g[1]) * DEG - x0 : bx;
    st[0].set(f(up ? hx : bx, 1)); st[1].set(up ? '--' : f(by, 1)); box.req();
  };
  T.help = 'Bubble level. With the phone flat (screen up) the bubble moves toward the high side, like a real level.\n\nFor shelves and frames, stand the phone on its bottom edge — the horizontal vial then reads like a carpenter’s level.\n\nPhone backs aren’t perfectly flat: place it on a known-level surface and tap Zero.';
  return T;
}

function protractorTool() {
  const T = {}; let ref = null, curA = NaN, n = 0, main, status, st, hist; const lines = [];
  T.build = () => {
    const c = card(); main = big(c, 'Angle from A', 'degrees'); status = sub(c, 'Place the phone on the first surface and tap Set A');
    st = stats([['Supplement', '°'], ['Complement', '°'], ['Tilt now', '°']]);
    buttons([['Set A', () => { const g = S.grav, m = gmag(g); if (m < 1) return; ref = g.map(v => v / m); status.textContent = 'A set. Now move the phone to the second surface.'; }],
      ['Record B', () => { if (!ref || !isFinite(curA)) return; n++; lines.unshift('#' + n + ':  ' + f(curA, 1) + '°   (supplement ' + f(180 - curA, 1) + '°)'); hist.textContent = lines.join('\n'); }], holdBtn(T)]);
    section('Recorded angles'); hist = note('None yet');
  };
  T.motion = () => {
    const g = S.grav, m = gmag(g); if (m < 1) return;
    st[2].set(f(Math.acos(clamp1(g[2] / m)) * DEG, 1)); if (!ref) return;
    curA = Math.acos(clamp1((g[0] * ref[0] + g[1] * ref[1] + g[2] * ref[2]) / m)) * DEG;
    main.set(f(curA, 1)); st[0].set(f(180 - curA, 1)); st[1].set(f(90 - curA, 1));
  };
  T.help = 'Measures the angle between two surfaces or positions using gravity.\n\n1. Rest the phone on the first surface (or against the first limb/arm) and tap Set A.\n2. Move it to the second surface — the live reading is the angle between them.\n3. Tap Record B to keep a list.\n\nKeep the same face and edge of the phone against the object both times. It can’t measure rotation around a vertical axis.';
  return T;
}

// ---------- compass / attitude ----------
function compassTool() {
  const T = {}; let decl = store.get('decl', 0), sx = 0, sy = 1, hd = NaN, head, cardT, acc, st, dial, dl, lastUi = 0;
  T.build = () => {
    const c = card(); head = big(c, 'Heading', ''); cardT = sub(c); cardT.style.color = '#EF5350'; cardT.style.fontSize = '22px';
    dial = canvasBox(c, 300); dial.draw = drawDial; acc = sub(c); acc.style.color = '#9AA0A6'; acc.style.fontWeight = '400'; acc.style.fontSize = '13px';
    st = stats([['Reference', ''], ['Declination', '°'], ['Accuracy', '±°']]);
    buttons([holdBtn(T)]);
    section('Magnetic declination (east +)');
    dl = stepper('', () => setD(decl - .5), () => setD(decl + .5)); setD(decl);
    note('Leave at 0 for magnetic north. For true north enter your local declination: Perth ≈ 0°, Adelaide ≈ +8°, Melbourne ≈ +11.5°, Sydney ≈ +12.5°, Brisbane ≈ +11° (check NOAA or Geoscience Australia for exact values).\n\nHold the phone flat and away from magnets, speakers, steel benches and cars.');
  };
  const setD = v => { decl = Math.round(v * 2) / 2; store.set('decl', decl); dl.textContent = (decl > 0 ? '+' : '') + decl.toFixed(1) + '°'; st && (st[0].set(decl ? 'True' : 'Magnetic'), st[1].set(f(decl, 1))); };
  T.orient = e => {
    let h = e.webkitCompassHeading;
    if (h == null) { const a = (S.abs && S.abs.alpha != null) ? S.abs : (e.absolute ? e : null); if (a) h = (360 - a.alpha) % 360; }
    if (h == null || h < 0) { acc.textContent = 'No compass heading available from this browser/device.'; return; }
    h = h + decl; const a = h * RAD; sx += .2 * (Math.sin(a) - sx); sy += .2 * (Math.cos(a) - sy);
    const now = performance.now(); if (now - lastUi < 40) return; lastUi = now;
    hd = (Math.atan2(sx, sy) * DEG + 360) % 360; head.set(Math.round(hd) + '°'); cardT.textContent = c16(hd);
    const ac = e.webkitCompassAccuracy; st[2].set(ac == null || ac < 0 ? '--' : f(ac, 0));
    acc.textContent = ac != null && (ac < 0 || ac > 25) ? 'Low accuracy – move the phone in a figure-8' : '';
    acc.style.color = '#FFB74D'; dial.req();
  };
  function drawDial(c, w, h) {
    c.clearRect(0, 0, w, h); const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 10, H = isFinite(hd) ? hd : 0;
    c.fillStyle = '#20262F'; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill();
    c.save(); c.translate(cx, cy); c.rotate(-H * RAD);
    for (let i = 0; i < 360; i += 5) { const len = i % 30 === 0 ? 14 : 7, a = (i - 90) * RAD; c.lineWidth = i % 30 === 0 ? 2 : 1; c.strokeStyle = i % 90 === 0 ? '#E8EAED' : '#6B7280';
      c.beginPath(); c.moveTo(Math.cos(a) * r, Math.sin(a) * r); c.lineTo(Math.cos(a) * (r - len), Math.sin(a) * (r - len)); c.stroke(); }
    c.textAlign = 'center'; c.font = 'bold 22px -apple-system,system-ui';
    ['N', 'E', 'S', 'W'].forEach((l, i) => { c.save(); c.rotate(i * Math.PI / 2); c.fillStyle = i ? '#E8EAED' : '#EF5350'; c.fillText(l, 0, -r + 40); c.restore(); });
    c.font = '11px -apple-system,system-ui'; c.fillStyle = '#9AA0A6';
    for (let i = 30; i < 360; i += 30) if (i % 90) { c.save(); c.rotate(i * RAD); c.fillText(i, 0, -r + 30); c.restore(); }
    c.fillStyle = '#EF5350'; c.beginPath(); c.moveTo(0, -r * .55); c.lineTo(10, 0); c.lineTo(-10, 0); c.fill();
    c.fillStyle = '#B0BEC5'; c.beginPath(); c.moveTo(0, r * .55); c.lineTo(10, 0); c.lineTo(-10, 0); c.fill();
    c.restore();
    c.fillStyle = '#4FC3F7'; c.beginPath(); c.moveTo(cx, cy - r + 12); c.lineTo(cx - 9, cy - r); c.lineTo(cx + 9, cy - r); c.fill();
    c.fillStyle = '#E8EAED'; c.beginPath(); c.arc(cx, cy, 5, 0, 7); c.fill();
  }
  T.help = 'Digital compass from the phone’s magnetometer and motion sensors (via Safari’s compass heading). The heading is the direction the top of the phone points when held flat.\n\nSet the declination to convert magnetic north to true north. If accuracy is poor, move the phone in a figure-8 for a few seconds.';
  return T;
}

function attitudeTool() {
  const T = {}; let pitch = 0, roll = 0, st, box, lastUi = 0;
  T.build = () => {
    box = canvasBox(null, 330); box.draw = draw;
    st = stats([['Heading', ''], ['Pitch', '°'], ['Roll', '°']]);
    buttons([holdBtn(T)]);
    note('Aircraft-style artificial horizon. Referenced to the phone lying flat, screen up: raise or lower the top for pitch, tip it left or right for roll.');
  };
  T.orient = e => {
    if (e.beta == null) return; const now = performance.now(); if (now - lastUi < 30) return; lastUi = now;
    pitch = e.beta; roll = e.gamma;
    const h = e.webkitCompassHeading != null ? e.webkitCompassHeading : (e.absolute ? (360 - e.alpha) % 360 : null);
    st[0].set(h == null ? '--' : Math.round(h) + ' ' + c16(h)); st[1].set(f(pitch, 1)); st[2].set(f(roll, 1)); box.req();
  };
  function draw(c, w, h) {
    c.clearRect(0, 0, w, h); const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 6, ppd = r / 45;
    c.save(); c.beginPath(); c.arc(cx, cy, r, 0, 7); c.clip();
    c.translate(cx, cy); c.rotate(-roll * RAD); const hy = pitch * ppd;
    c.fillStyle = '#1E88E5'; c.fillRect(-2 * r, hy - 4 * r, 4 * r, 4 * r); c.fillStyle = '#795548'; c.fillRect(-2 * r, hy, 4 * r, 4 * r);
    c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(-2 * r, hy); c.lineTo(2 * r, hy); c.stroke();
    c.lineWidth = 1.2; c.fillStyle = '#fff'; c.font = '11px -apple-system,system-ui'; c.textAlign = 'center';
    for (let d = -80; d <= 80; d += 10) { if (!d) continue; const y = hy - d * ppd, len = d % 20 ? r * .18 : r * .35;
      c.beginPath(); c.moveTo(-len, y); c.lineTo(len, y); c.stroke(); if (d % 20 === 0) { c.fillText(Math.abs(d), -len - 14, y + 4); c.fillText(Math.abs(d), len + 14, y + 4); } }
    c.restore();
    c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.stroke();
    [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60].forEach(m => { const a = (m - 90) * RAD, l = m % 30 === 0 ? 14 : 8; c.beginPath(); c.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); c.lineTo(cx + Math.cos(a) * (r - l), cy + Math.sin(a) * (r - l)); c.stroke(); });
    c.save(); c.translate(cx, cy); c.rotate(-roll * RAD); c.fillStyle = '#FFEB3B'; c.beginPath(); c.moveTo(0, -r + 16); c.lineTo(-8, -r + 30); c.lineTo(8, -r + 30); c.fill(); c.restore();
    c.strokeStyle = '#FFEB3B'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx - r * .5, cy); c.lineTo(cx - r * .15, cy); c.moveTo(cx + r * .15, cy); c.lineTo(cx + r * .5, cy); c.stroke();
    c.fillStyle = '#FFEB3B'; c.beginPath(); c.arc(cx, cy, 5, 0, 7); c.fill();
  }
  T.help = 'Artificial horizon (attitude indicator) built from the fused device-orientation sensor. Pitch = top of the phone up/down, roll = banking left/right, heading = compass direction of the top of the phone.';
  return T;
}

// ---------- motion tools ----------
function accelTool() {
  const T = {}; let linear = false, gU = false, peak = 0, lastUi = 0, total, st, g, modeB, unitB; const lp = [0, 0, 0];
  T.build = () => {
    const c = card(); total = big(c, 'Total acceleration', 'm/s²');
    st = stats([['X', ''], ['Y', ''], ['Z', ''], ['Peak', ''], ['In g', 'g'], ['Rate', 'Hz']]);
    g = graph(3, 300, ['#EF5350', '#66BB6A', '#42A5F5'], { names: ['X', 'Y', 'Z'], minSpan: 2 });
    [, , modeB, unitB] = buttons([holdBtn(T), ['Reset peak', () => peak = 0], ['Incl. gravity', () => { linear = !linear; peak = 0; lbl(); }], ['m/s²', () => { gU = !gU; lbl(); }]]);
    lbl(); note('Axes: X = left/right across the screen, Y = bottom-to-top, Z = out of the screen. At rest with gravity included the total is ~9.81 m/s² (1 g).');
  };
  const lbl = () => { modeB.textContent = linear ? 'Motion only' : 'Incl. gravity'; unitB.textContent = gU ? 'g' : 'm/s²'; total.u.textContent = gU ? 'g' : 'm/s²';
    total.l.textContent = linear ? 'Motion (gravity removed)' : 'Total acceleration'; g.clear(); };
  T.motion = e => {
    let v; const k = S.flip;
    if (linear) { const a = e.acceleration; if (a && a.x != null) v = [a.x * k, a.y * k, a.z * k];
      else { const r = S.raw || [0, 0, 0]; for (let i = 0; i < 3; i++) lp[i] += .08 * (r[i] - lp[i]); v = r.map((x, i) => x - lp[i]); } }
    else v = S.raw; if (!v) return;
    const m = Math.hypot(...v); if (m > peak) peak = m;
    const now = performance.now(); if (now - lastUi < 60) return; lastUi = now;
    const K = gU ? 1 / 9.80665 : 1, d = gU ? 3 : 2;
    total.set(f(m * K, d)); st[0].set(f(v[0] * K, d)); st[1].set(f(v[1] * K, d)); st[2].set(f(v[2] * K, d)); st[3].set(f(peak * K, d)); st[4].set(f(m / 9.80665, 3)); st[5].set(f(1000 / interval(e), 0));
    g.add(v[0] * K, v[1] * K, v[2] * K);
  };
  T.help = 'Raw accelerometer readings on each axis. “Incl. gravity” shows the full reading; “Motion only” removes gravity to show just how the phone is moving (g-forces, shakes, braking/cornering).\n\nPeak holds the largest value since reset.';
  return T;
}

function gyroTool() {
  const T = {}; let peak = 0, angZ = 0, lastUi = 0, total, st, g;
  T.build = () => {
    const c = card(); total = big(c, 'Rotation rate', '°/s');
    st = stats([['X (pitch)', '°/s'], ['Y (roll)', '°/s'], ['Z (yaw)', '°/s'], ['Peak', '°/s'], ['RPM', 'rev/min'], ['Turned (Z)', '°']]);
    g = graph(3, 300, ['#EF5350', '#66BB6A', '#42A5F5'], { names: ['X', 'Y', 'Z'], minSpan: 20, dec: 0 });
    buttons([holdBtn(T), ['Reset', () => { peak = 0; angZ = 0; g.clear(); }]]);
    note('“Turned (Z)” adds up rotation around the screen axis since reset — lay the phone flat on a turntable, door or wheel to measure how far it has rotated. It drifts slowly.');
  };
  T.motion = e => {
    const r = e.rotationRate; if (!r || r.alpha == null) return;
    const x = r.beta, y = r.gamma, z = r.alpha, dt = interval(e) / 1000;
    if (Math.abs(z) > .15) angZ += z * dt;
    const m = Math.hypot(x, y, z); if (m > peak) peak = m;
    const now = performance.now(); if (now - lastUi < 60) return; lastUi = now;
    total.set(f(m, 1)); st[0].set(f(x, 1)); st[1].set(f(y, 1)); st[2].set(f(z, 1)); st[3].set(f(peak, 0)); st[4].set(f(m / 6, 1)); st[5].set(f(angZ, 0));
    g.add(x, y, z);
  };
  T.help = 'How fast the phone is rotating around each axis, in degrees per second, from the gyroscope. X = tipping forward/back, Y = tilting left/right, Z = spinning flat on a table. RPM is total rotation rate in revolutions per minute.';
  return T;
}

function vibrationTool() {
  const T = {}, N = 128, buf = [new Float64Array(N), new Float64Array(N), new Float64Array(N)], sq = []; const lp = [0, 0, 0];
  let bi = 0, filled = 0, peak = 0, lastUi = 0, init = false, rms, desc, st, g, dom = NaN;
  T.build = () => {
    const c = card(); rms = big(c, 'Vibration (RMS, 1 s)', 'm/s²'); desc = sub(c);
    st = stats([['Peak', 'm/s²'], ['Dominant freq', 'Hz'], ['Sample rate', 'Hz']]);
    g = graph(1, 400, ['#26C6DA'], { h: 200, minSpan: .05, dec: 2 });
    buttons([holdBtn(T), ['Reset peak', () => { peak = 0; g.clear(); }]]);
    note('Place the phone firmly on (or tape it to) the machine, surface or vehicle. Gravity is filtered out so only vibration is shown. On iPhone the motion sensor runs at about 60 Hz, so frequencies up to ~30 Hz can be identified.');
  };
  T.motion = e => {
    let d; const a = e.acceleration;
    if (a && a.x != null) d = [a.x, a.y, a.z];
    else { const r = S.raw; if (!r) return; if (!init) { lp.splice(0, 3, ...r); init = true; } d = r.map((v, i) => { lp[i] += .03 * (v - lp[i]); return v - lp[i]; }); }
    let ss = 0; for (let i = 0; i < 3; i++) { buf[i][bi] = d[i]; ss += d[i] * d[i]; } bi = (bi + 1) % N; if (filled < N) filled++;
    const m = Math.sqrt(ss); if (m > peak) peak = m; const rate = 1000 / interval(e);
    sq.push(ss); while (sq.length > Math.max(10, Math.round(rate))) sq.shift();
    g.add(m);
    const now = performance.now(); if (now - lastUi < 150) return; lastUi = now;
    const r = Math.sqrt(sq.reduce((s, v) => s + v, 0) / sq.length);
    if (filled === N) dom = dominant(rate);
    rms.set(f(r, 3)); desc.textContent = r < .01 ? 'Still' : r < .05 ? 'Very slight' : r < .2 ? 'Light' : r < 1 ? 'Moderate' : r < 3 ? 'Strong' : 'Severe';
    st[0].set(f(peak, 2)); st[1].set(f(dom, 1)); st[2].set(f(rate, 0));
  };
  function dominant(rate) {
    const w = hann(N), pw = new Float64Array(N / 2);
    for (let a = 0; a < 3; a++) { const re = new Float64Array(N), im = new Float64Array(N); for (let i = 0; i < N; i++) re[i] = buf[a][(bi + i) % N] * w[i];
      fft(re, im); for (let k = 0; k < N / 2; k++) pw[k] += re[k] * re[k] + im[k] * im[k]; }
    let best = -1, bv = 0, tot = 0; for (let k = 2; k < N / 2; k++) { tot += pw[k]; if (pw[k] > bv) { bv = pw[k]; best = k; } }
    if (best < 0 || tot <= 0 || bv / tot < .05) return NaN;
    let fk = best; if (best < N / 2 - 1) { const A = Math.log(pw[best - 1] + 1e-20), B = Math.log(pw[best]), Cc = Math.log(pw[best + 1] + 1e-20), den = A - 2 * B + Cc; if (den) fk += .5 * (A - Cc) / den; }
    return fk * rate / N;
  }
  T.help = 'Vibration meter / seismograph. Shows RMS vibration over the last second, the peak since reset, and the dominant vibration frequency. Useful for machinery, washing machines, fans, centrifuges, vehicles or floors. The phone must be in firm contact with the vibrating surface.';
  return T;
}

function stepTool() {
  const T = {}; let count = 0, start = Date.now(), lpv = 9.81, above = false, last = 0, stride = store.get('stride', .75), steps, st, sl; const recent = [];
  T.build = () => {
    const c = card(); steps = big(c, 'Steps this session', ''); sub(c, 'Source: accelerometer (screen must stay on)').style.color = '#9AA0A6';
    st = stats([['Distance', 'm'], ['Cadence', 'steps/min'], ['Time', 'min']]);
    buttons([['Reset', () => { count = 0; start = Date.now(); recent.length = 0; show(); }]]);
    section('Stride length'); sl = stepper('', () => setS(stride - .05), () => setS(stride + .05)); setS(stride);
    note('Counts while this screen is open — web apps can’t count in the background or read the iPhone’s own step history (use the Health app for that). Carry the phone in your hand or a front pocket. Stride ≈ height × 0.41 for walking.');
    show(); T.timer = setInterval(show, 1000);
  };
  const setS = v => { stride = Math.max(.3, Math.min(1.5, Math.round(v * 100) / 100)); store.set('stride', stride); sl.textContent = stride.toFixed(2) + ' m'; show(); };
  const show = () => { if (!st) return; const now = Date.now(); while (recent.length && now - recent[0] > 15000) recent.shift();
    steps.set(String(count)); st[0].set(f(count * stride, 0)); st[1].set(f(recent.length * 4, 0)); st[2].set(f((now - start) / 60000, 1)); };
  T.motion = () => {
    const r = S.raw; if (!r) return; lpv += .25 * (Math.hypot(...r) - lpv); const now = Date.now();
    if (!above && lpv > 11 && now - last > 280) { above = true; last = now; count++; recent.push(now); show(); }
    else if (above && lpv < 9.8) above = false;
  };
  T.stop = () => clearInterval(T.timer);
  T.help = 'Pedometer using simple step detection on the accelerometer. Steps are counted from when you open this screen or tap Reset. Distance = steps × stride length.';
  return T;
}

// ---------- audio tools ----------
function soundTool() {
  const T = {}; let off = store.get('soff', 110), aW = true, slow = false, an, td, fd, aw, raf, sm = -1, leqS = 0, leqN = 0, mn = NaN, mx = NaN, pk = NaN, lastT = 0, secs = 0, lastUi = 0;
  let lvl, desc, bar, st, g, calT;
  T.build = () => {
    const c = card(); lvl = big(c, 'Sound level (approx.)', 'dB(A)'); desc = sub(c); bar = meter(c, 20, 120);
    st = stats([['Min', 'dB'], ['Leq (avg)', 'dB'], ['Max', 'dB'], ['Peak', 'dB'], ['Time', 's'], ['Weighting', '']]);
    g = graph(1, 300, ['#AB47BC'], { minSpan: 20 });
    buttons([holdBtn(T), ['Reset', reset], ['A-weight', e => { aW = !aW; e.currentTarget.textContent = aW ? 'A-weight' : 'Z (flat)'; reset(); }], ['Fast', e => { slow = !slow; e.currentTarget.textContent = slow ? 'Slow' : 'Fast'; }]]);
    section('Calibration offset'); calT = stepper(String(off), () => cal(-1), () => cal(1));
    note('Reference: 30 dB quiet bedroom · 40 library · 60 conversation · 70 busy clinic/vacuum · 85 hearing-protection threshold (8 h) · 100 power tools · 110+ barking dog at close range / concert.');
    st[5].set('A');
  };
  const cal = d => { off += d; store.set('soff', off); calT.textContent = String(off); };
  function reset() { leqS = 0; leqN = 0; secs = 0; mn = mx = pk = NaN; sm = -1; g.clear(); st[5].set(aW ? 'A' : 'Z'); lvl.u.textContent = aW ? 'dB(A)' : 'dB(Z)'; }
  T.start = async () => {
    const src = await getMic(); an = AC.createAnalyser(); an.fftSize = 4096; an.smoothingTimeConstant = 0; src.connect(an);
    td = new Float32Array(an.fftSize); fd = new Float32Array(an.frequencyBinCount);
    aw = Float32Array.from({ length: an.frequencyBinCount }, (_, k) => aWeightPow(k * AC.sampleRate / an.fftSize));
    lastT = performance.now(); loop();
  };
  function loop() {
    raf = requestAnimationFrame(loop);
    const now = performance.now(), dt = Math.min(.25, (now - lastT) / 1000); lastT = now;
    an.getFloatTimeDomainData(td);
    let mean = 0, p = 0; for (let i = 0; i < td.length; i++) { mean += td[i]; const a = Math.abs(td[i]); if (a > p) p = a; } mean /= td.length;
    let ms = 0; for (let i = 0; i < td.length; i++) { const x = td[i] - mean; ms += x * x; } ms /= td.length;
    if (aW) { an.getFloatFrequencyData(fd); let sa = 0, sz = 0; for (let k = 1; k < fd.length; k++) { const pw = Math.pow(10, fd[k] / 10); sz += pw; sa += pw * aw[k]; } ms *= sz > 0 ? sa / sz : 1; }
    ms *= 2;
    const alpha = 1 - Math.exp(-dt / (slow ? 1 : .125)); sm = sm < 0 ? ms : sm + alpha * (ms - sm);
    const db = 10 * Math.log10(Math.max(sm, 1e-12)) + off, pdb = 20 * Math.log10(Math.max(p, 3e-5)) + off + 3.01;
    leqS += ms * dt; secs += dt; const leq = 10 * Math.log10(Math.max(leqS / Math.max(secs, 1e-6), 1e-12)) + off;
    if (T.held) return;
    if (secs > 1 && db > 0) { if (!(db >= mn)) mn = db; if (!(db <= mx)) mx = db; }
    if (!(pdb <= pk)) pk = pdb;
    if (now - lastUi < 50) return; lastUi = now;
    lvl.set(f(db, 1)); desc.textContent = db < 30 ? 'Very quiet' : db < 45 ? 'Quiet' : db < 60 ? 'Moderate' : db < 75 ? 'Loud conversation / busy room' : db < 85 ? 'Loud' : db < 100 ? 'Very loud — limit exposure' : 'Dangerously loud';
    bar.set(db, db < 70 ? '#66BB6A' : db < 85 ? '#FFB74D' : '#EF5350');
    st[0].set(f(mn, 1)); st[1].set(f(leq, 1)); st[2].set(f(mx, 1)); st[3].set(f(pk, 1)); st[4].set(f(secs, 0)); g.add(db);
  }
  T.stop = () => { cancelAnimationFrame(raf); if (an) an.disconnect(); };
  T.help = 'Estimates sound pressure level from the microphone, with Safari’s echo cancellation, noise suppression and auto-gain turned off.\n\nA-weight approximates human hearing (standard for noise exposure); Z is unweighted. Fast = 125 ms, Slow = 1 s. Leq is the energy-average level since reset.\n\nThe absolute number depends on the iPhone model’s microphone: compare with a reference sound meter and adjust the calibration offset until they match. Very loud sounds (>100 dB) may clip.';
  return T;
}

function spectrumTool() {
  const T = {}; let an, fd, hold, raf, freq, nt, box, sr = 48000, lastUi = 0;
  T.build = () => {
    const c = card(); const row = $('div', 'stats two'); c.appendChild(row);
    const mk = (l, u) => { const w = $('div', 'st'), L = $('div', 'lbl', l), V = $('div', 'val', '--'), U = $('div', 'unit', u); w.append(L, V, U); row.appendChild(w); return V; };
    freq = mk('Dominant frequency', 'Hz'); nt = mk('Nearest note', ''); freq.style.fontSize = nt.style.fontSize = '30px';
    box = canvasBox(null, 300); box.draw = draw;
    buttons([holdBtn(T), ['Clear peaks', () => hold && hold.fill(-200)]]);
    note('Blue = live spectrum, white = peak hold. Use it to find a whine or hum frequency, check a tone, or tune an instrument.');
  };
  T.start = async () => {
    const src = await getMic(); an = AC.createAnalyser(); an.fftSize = 16384; an.smoothingTimeConstant = .2; an.minDecibels = -130; an.maxDecibels = 0; src.connect(an);
    sr = AC.sampleRate; fd = new Float32Array(an.frequencyBinCount); hold = new Float32Array(an.frequencyBinCount).fill(-200); loop();
  };
  function loop() {
    raf = requestAnimationFrame(loop); if (T.held) return;
    an.getFloatFrequencyData(fd); const n = fd.length, N = an.fftSize;
    for (let k = 0; k < n; k++) hold[k] = Math.max(hold[k] - .4, fd[k]);
    const lo = Math.floor(30 * N / sr), hi = Math.floor(15000 * N / sr); let best = -1, bv = -1e9, sum = 0, cnt = 0;
    for (let k = lo; k <= hi; k++) { if (fd[k] > bv) { bv = fd[k]; best = k; } if (isFinite(fd[k])) { sum += fd[k]; cnt++; } }
    const now = performance.now();
    if (now - lastUi > 80) { lastUi = now;
      if (best > 0 && bv > -95 && bv - sum / cnt > 25) { const a = fd[best - 1], b = fd[best], g = fd[best + 1], p = .5 * (a - g) / (a - 2 * b + g || 1), fq = (best + p) * sr / N;
        freq.textContent = f(fq, fq < 1000 ? 1 : 0); nt.textContent = noteName(fq); } else { freq.textContent = '--'; nt.textContent = '--'; } }
    box.req();
  }
  function draw(c, W, H) {
    c.clearRect(0, 0, W, H); const l = 34, r = 8, t = 8, b = 22, w = W - l - r, h = H - t - b, top = -10, bot = -130;
    const xOf = fq => l + w * Math.log10(fq / 20) / 3, yOf = v => t + h * (top - Math.max(bot, Math.min(top, v))) / (top - bot);
    c.strokeStyle = '#2E3440'; c.lineWidth = 1; c.fillStyle = '#9AA0A6'; c.font = '10px -apple-system,system-ui';
    for (let d = -20; d >= -120; d -= 20) { const y = yOf(d); c.beginPath(); c.moveTo(l, y); c.lineTo(l + w, y); c.stroke(); c.fillText(d, 4, y + 4); }
    [[50, '50'], [100, '100'], [200, '200'], [500, '500'], [1000, '1k'], [2000, '2k'], [5000, '5k'], [10000, '10k']].forEach(([fq, s]) => { const x = xOf(fq); c.beginPath(); c.moveTo(x, t); c.lineTo(x, t + h); c.stroke(); c.fillText(s, x - c.measureText(s).width / 2, H - 6); });
    if (!fd) return;
    const N = an.fftSize, curve = (arr, fill) => { c.beginPath(); let lx = -9, ay = 0, started = false;
      for (let k = 1; k < arr.length; k++) { const fq = k * sr / N; if (fq < 20 || fq > 20000) continue; const x = xOf(fq), y = yOf(arr[k]);
        if (started && x - lx < 1.5) { if (y < ay) ay = y; continue; }
        if (!started) { fill ? (c.moveTo(x, t + h), c.lineTo(x, y)) : c.moveTo(x, y); started = true; } else c.lineTo(lx, ay); lx = x; ay = y; }
      c.lineTo(lx, ay); if (fill) { c.lineTo(lx, t + h); c.closePath(); c.fillStyle = 'rgba(66,165,245,.45)'; c.fill(); } else { c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.2; c.stroke(); } };
    curve(fd, true); curve(hold, false);
  }
  T.stop = () => { cancelAnimationFrame(raf); if (an) an.disconnect(); };
  T.help = 'Live frequency spectrum of the microphone (20 Hz – 20 kHz, log scale, dB relative to full scale). The dominant frequency is the loudest clear peak between 30 Hz and 15 kHz, refined by interpolation. The nearest musical note and cents sharp/flat are shown for tuning.';
  return T;
}

function toneTool() {
  const T = {}; let fq = 440, vol = .5, wave = 'sine', osc = null, noise = null, gain = null, fr, fb, playB, waveBs = [];
  T.build = () => {
    const c = card(); fr = big(c, 'Frequency', 'Hz');
    fb = $('input'); fb.type = 'range'; fb.min = 0; fb.max = 1000; c.appendChild(fb);
    fb.oninput = () => { fq = Math.round(20 * Math.pow(1000, fb.value / 1000)); show(false); };
    buttons([['÷2 oct', () => setF(fq / 2)], ['−1', () => setF(fq - 1)], ['+1', () => setF(fq + 1)], ['×2 oct', () => setF(fq * 2)]]);
    waveBs = buttons([['Sine', () => setW('sine')], ['Square', () => setW('square')], ['Triangle', () => setW('triangle')], ['Saw', () => setW('sawtooth')], ['Noise', () => setW('noise')]]);
    waveBs.forEach(b => b.style.fontSize = '13px');
    section('Volume'); const v = $('input'); v.type = 'range'; v.min = 0; v.max = 100; v.value = 50; C.appendChild(v);
    v.oninput = () => { vol = v.value / 100; if (gain) gain.gain.setTargetAtTime(vol * vol, AC.currentTime, .02); };
    [playB] = buttons([['▶  Play', toggle]]); playB.style.minHeight = '64px'; playB.style.background = '#2E7D32'; playB.parentNode.style.marginTop = '16px';
    note('Presets: 50 Hz mains hum (Australia) · 440 Hz concert A · 1 kHz test tone. Start with low volume. iPhone speakers can’t reproduce much below ~200 Hz — use headphones for low tones.');
    show(true); setW('sine');
  };
  const setF = v => { fq = Math.max(20, Math.min(20000, Math.round(v))); show(true); };
  const show = moveBar => { fr.set(String(fq)); if (moveBar) fb.value = Math.round(1000 * Math.log(fq / 20) / Math.log(1000)); if (osc) osc.frequency.setTargetAtTime(fq, AC.currentTime, .01); };
  const setW = w => { const was = !!(osc || noise); if (was) halt(); wave = w; waveBs.forEach((b, i) => b.classList.toggle('sel', ['sine', 'square', 'triangle', 'sawtooth', 'noise'][i] === w)); if (was) go(); };
  function go() {
    ensureAudio(); audioSession('playback');
    gain = AC.createGain(); gain.gain.value = 0; gain.connect(AC.destination); gain.gain.setTargetAtTime(vol * vol, AC.currentTime, .02);
    if (wave === 'noise') { const b = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * .5;
      noise = AC.createBufferSource(); noise.buffer = b; noise.loop = true; noise.connect(gain); noise.start(); }
    else { osc = AC.createOscillator(); osc.type = wave; osc.frequency.value = fq; osc.connect(gain); osc.start(); }
    playB.textContent = '■  Stop'; playB.style.background = '#C62828';
  }
  function halt() {
    if (gain) { const g = gain, o = osc, n = noise; g.gain.setTargetAtTime(0, AC.currentTime, .015); setTimeout(() => { try { o && o.stop(); n && n.stop(); g.disconnect(); } catch (e) {} }, 120); }
    osc = noise = gain = null; if (playB) { playB.textContent = '▶  Play'; playB.style.background = '#2E7D32'; }
  }
  function toggle() { (osc || noise) ? halt() : go(); }
  T.stop = halt;
  T.help = 'Test tones from 20 Hz to 20 kHz through the speaker or headphones — test speakers, check hearing range, find rattles, or give a reference pitch. On recent iOS versions it plays even with the silent switch on; if you hear nothing, check the switch and volume.';
  return T;
}

// ---------- GPS ----------
function gpsTool() {
  const T = {}; const UN = ['km/h', 'mph', 'knots', 'm/s'], FA = [3.6, 2.236936, 1.943844, 1];
  let unit = store.get('gps_unit', 0), watch = null, last = null, cur = null, dist = 0, maxV = 0, moveT = 0, speed, status, st, pos, g, unitB;
  T.build = () => {
    const c = card(); speed = big(c, 'Speed', UN[unit]); status = sub(c, 'Waiting for GPS fix…'); status.style.color = '#FFB74D';
    st = stats([['Max', ''], ['Avg (moving)', ''], ['Trip', 'km'], ['Altitude', 'm'], ['Heading', ''], ['Accuracy', 'm']]);
    pos = stats([['Latitude', ''], ['Longitude', '']]);
    g = graph(1, 300, ['#42A5F5'], { minSpan: 5, dec: 0 });
    [, unitB] = buttons([['Reset trip', () => { dist = maxV = moveT = 0; g.clear(); }], ['Units', () => { unit = (unit + 1) % 4; store.set('gps_unit', unit); show(); }],
      ['Copy position', () => { if (!cur) return; const s = cur.latitude.toFixed(6) + ', ' + cur.longitude.toFixed(6); navigator.clipboard.writeText(s).then(() => toast('Copied ' + s), () => toast(s)); }]]);
    note('Works best outdoors with a clear view of the sky. Allow “Precise” location when asked. Speed is usually accurate to about ±1 km/h once moving. Satellite counts aren’t available to web apps on iPhone.');
    show();
  };
  T.start = () => {
    if (!navigator.geolocation) { status.textContent = 'Location not available'; return; }
    watch = navigator.geolocation.watchPosition(onPos, err => { status.textContent = err.code === 1 ? 'Location permission denied — enable it in Settings › Privacy › Location Services › Safari Websites' : 'Waiting for GPS… (' + err.message + ')'; },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 });
  };
  T.stop = () => { if (watch != null) navigator.geolocation.clearWatch(watch); watch = null; };
  const hav = (a, b) => { const R = 6371000, dLa = (b.latitude - a.latitude) * RAD, dLo = (b.longitude - a.longitude) * RAD,
    s = Math.sin(dLa / 2) ** 2 + Math.cos(a.latitude * RAD) * Math.cos(b.latitude * RAD) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(s)); };
  function onPos(p) {
    const c = p.coords; let v = c.speed != null && c.speed >= 0 ? c.speed : null;
    if (last) { const dt = Math.max(.5, (p.timestamp - last.t) / 1000), d = hav(last.c, c); if (v == null) v = d / dt;
      if (c.accuracy < 25 && v > .5) { dist += d; moveT += dt; } }
    v = v || 0; if (c.accuracy < 30 && v > maxV) maxV = v;
    last = { c, t: p.timestamp }; cur = c; cur.v = v;
    status.textContent = c.accuracy < 15 ? 'GPS fix: good' : 'GPS fix: weak'; status.style.color = c.accuracy < 15 ? '#66BB6A' : '#FFB74D';
    g.add(v * FA[unit]); show();
  }
  function show() {
    const u = UN[unit]; speed.u.textContent = u; st[0].u.textContent = u; st[1].u.textContent = u; unitB && (unitB.textContent = u);
    st[2].u.textContent = unit === 1 ? 'mi' : unit === 2 ? 'nm' : 'km'; if (!cur) return;
    speed.set(f(cur.v * FA[unit], 1)); st[0].set(f(maxV * FA[unit], 1)); st[1].set(moveT > 0 ? f(dist / moveT * FA[unit], 1) : '--');
    st[2].set(f(dist / (unit === 1 ? 1609.344 : unit === 2 ? 1852 : 1000), 2)); st[3].set(cur.altitude != null ? f(cur.altitude, 0) : '--');
    st[4].set(cur.heading != null && isFinite(cur.heading) && cur.v > .5 ? Math.round(cur.heading) + '° ' + c16(cur.heading) : '--'); st[5].set(f(cur.accuracy, 0));
    pos[0].set(cur.latitude.toFixed(6)); pos[1].set(cur.longitude.toFixed(6));
  }
  T.help = 'GPS speedometer and position: current, maximum and average moving speed, trip distance, altitude (GPS altitude is about ±10–20 m), heading of travel and horizontal accuracy. Location stays on your phone.';
  return T;
}

// ---------- ruler ----------
function rulerTool() {
  const T = {}; let cal = store.get('ruler_cal', 1), marker = -1, box;
  T.fill = true;
  T.build = () => {
    box = canvasBox(null, 0); box.wrap.classList.add('ruler'); box.wrap.style.flex = '1'; box.wrap.style.borderRadius = '0';
    box.cv.addEventListener('pointerdown', mv); box.cv.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') mv(e); });
    box.draw = draw;
    const b = buttons([['Reading −', () => setC(cal * 1.004)], ['Reset cal', () => setC(1)], ['Reading +', () => setC(cal / 1.004)]]);
  };
  const mv = e => { const r = box.cv.getBoundingClientRect(); marker = Math.max(0, e.clientY - r.top); box.req(); };
  const setC = v => { cal = v; store.set('ruler_cal', v); box.req(); };
  function draw(c, w, h) {
    c.fillStyle = '#F5E6B8'; c.fillRect(0, 0, w, h); const mm = 153 / 25.4 * cal, inch = mm * 25.4;
    c.strokeStyle = c.fillStyle = '#000'; c.font = '12px -apple-system,system-ui';
    for (let i = 0; i * mm <= h; i++) { const y = i * mm, len = i % 10 === 0 ? 34 : i % 5 === 0 ? 22 : 12; c.lineWidth = i % 10 === 0 ? 1.5 : .8;
      c.beginPath(); c.moveTo(0, y); c.lineTo(len, y); c.stroke(); if (i % 10 === 0 && i) c.fillText(i / 10, 38, y + 5); }
    for (let i = 0; i * inch / 16 <= h; i++) { const y = i * inch / 16, len = i % 16 === 0 ? 34 : i % 8 === 0 ? 26 : i % 4 === 0 ? 18 : i % 2 === 0 ? 12 : 7; c.lineWidth = i % 16 === 0 ? 1.5 : .8;
      c.beginPath(); c.moveTo(w - len, y); c.lineTo(w, y); c.stroke(); if (i % 16 === 0 && i) { const s = String(i / 16); c.fillText(s, w - 40 - c.measureText(s).width, y + 5); } }
    c.font = '11px -apple-system,system-ui'; c.fillText('cm', 40, 16); c.fillText('in', w - 52, 16);
    c.textAlign = 'center';
    if (marker >= 0) { c.strokeStyle = c.fillStyle = '#D32F2F'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, marker); c.lineTo(w, marker); c.stroke();
      const v = marker / mm, ty = marker > 70 ? marker - 36 : marker + 30; c.font = 'bold 22px -apple-system,system-ui';
      c.fillText(v.toFixed(1) + ' mm', w / 2, ty); c.fillText((v / 25.4).toFixed(3) + ' in', w / 2, ty + 26); }
    else { c.fillStyle = '#5D4037'; c.font = '13px -apple-system,system-ui';
      ['Align the object with the top edge (0)', 'then touch where it ends', '', 'Calibrate: a bank card is 85.6 mm long'].forEach((s, i) => c.fillText(s, w / 2, h / 2 + i * 19)); }
    c.textAlign = 'start';
  }
  T.help = 'On-screen ruler. Put the object on the screen with one end at the top edge of the ruler (0), then touch where the other end is.\n\nIt assumes about 153 points per inch (iPhone X and later standard/Pro models). Older/SE and mini models differ slightly: place a bank card (85.60 mm) at the top edge, touch at its end and tap Reading − / Reading + until it reads 85.6 mm. The setting is remembered.';
  return T;
}

// ---------- sensor list ----------
function sensorsTool() {
  const T = {}; let mot, ori, lastUi = 0;
  T.build = () => {
    C.classList.add('slist');
    const feats = [
      ['Accelerometer & gyroscope (DeviceMotion)', 'DeviceMotionEvent' in window],
      ['Orientation (DeviceOrientation)', 'DeviceOrientationEvent' in window],
      ['Compass heading', isIOS || 'ondeviceorientationabsolute' in window],
      ['Microphone (Web Audio)', !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)],
      ['Location (GPS)', 'geolocation' in navigator],
      ['Keep screen awake', 'wakeLock' in navigator],
      ['Ambient light / proximity / barometer / magnetometer field / battery / torch', false]];
    const c = card(); c.appendChild($('div', 'nm', 'What this browser lets the app use'));
    feats.forEach(([n, ok]) => { const d = $('div', 'meta'); d.innerHTML = '<span class="' + (ok ? 'ok' : 'no') + '">' + (ok ? '✔' : '✖') + '</span> '; d.appendChild(document.createTextNode(n)); c.appendChild(d); });
    const m = card(); m.appendChild($('div', 'nm', 'Motion (live)')); m.appendChild($('div', 'meta', 'accelerationIncludingGravity, acceleration (m/s²), rotationRate (°/s), interval')); mot = $('pre', '', 'Waiting for data…'); m.appendChild(mot);
    const o = card(); o.appendChild($('div', 'nm', 'Orientation (live)')); o.appendChild($('div', 'meta', 'alpha / beta / gamma (°), compass heading & accuracy')); ori = $('pre', '', 'Waiting for data…'); o.appendChild(ori);
    note('Apple doesn’t expose the ambient light sensor, proximity sensor, barometer, raw magnetometer, battery details or torch to web apps, so those tools are Android-only. A native iPhone app (built in Xcode) could add barometer, torch, proximity, battery and step history.');
  };
  const v3 = (a, k = 1) => a && a.x != null ? [a.x, a.y, a.z].map(v => (v * k).toFixed(3).padStart(8)).join(' ') : 'n/a';
  T.motion = e => { const now = performance.now(); if (now - lastUi < 120) return; lastUi = now; const r = e.rotationRate;
    mot.textContent = 'incl. g   ' + v3(e.accelerationIncludingGravity) + '\nlinear    ' + v3(e.acceleration) + '\nrotation  ' + (r && r.alpha != null ? [r.alpha, r.beta, r.gamma].map(v => v.toFixed(2).padStart(8)).join(' ') : 'n/a') + '\ninterval  ' + f(interval(e), 1) + ' ms   sign ' + (S.flip > 0 ? '+' : '−') + (S.flipKnown ? '' : '?'); };
  T.orient = e => { ori.textContent = 'alpha ' + f(e.alpha, 1) + '   beta ' + f(e.beta, 1) + '   gamma ' + f(e.gamma, 1) + '\nheading ' + f(e.webkitCompassHeading, 1) + '   accuracy ' + f(e.webkitCompassAccuracy, 0) + '   absolute ' + !!e.absolute; };
  T.help = 'Shows which sensor APIs this browser makes available and streams the raw motion and orientation values. Useful for checking what works on a particular iPhone.';
  return T;
}

// ---------- registry & navigation ----------
const TOOLS = [
  ['sound', 'Sound', 'Sound Level Meter', '#8E24AA', 'mic', soundTool],
  ['spectrum', 'Spectrum', 'Spectrum & Tuner', '#6A1B9A', 'mic', spectrumTool],
  ['tone', 'Tone Gen', 'Tone Generator', '#AD1457', 'audio', toneTool],
  ['incline', 'Incline', 'Inclinometer', '#00897B', 'motion', inclineTool],
  ['level', 'Level', 'Spirit Level', '#2E7D32', 'motion', levelTool],
  ['protractor', 'Protractor', 'Protractor', '#558B2F', 'motion', protractorTool],
  ['compass', 'Compass', 'Compass', '#C62828', 'motion', compassTool],
  ['attitude', 'Attitude', 'Attitude Indicator', '#283593', 'motion', attitudeTool],
  ['accel', 'Accel', 'Accelerometer', '#1565C0', 'motion', accelTool],
  ['gyro', 'Gyro', 'Gyroscope', '#0277BD', 'motion', gyroTool],
  ['vibration', 'Vibration', 'Vibration Meter', '#00838F', 'motion', vibrationTool],
  ['steps', 'Steps', 'Pedometer', '#EF6C00', 'motion', stepTool],
  ['gps', 'GPS Speed', 'GPS Speedometer', '#1E88E5', null, gpsTool],
  ['ruler', 'Ruler', 'Ruler', '#6D4C41', null, rulerTool],
  ['sensors', 'Sensors', 'All Sensors', '#546E7A', 'motion', sensorsTool]];
const BLOCKED = [['light', 'Light', 'the ambient light sensor'], ['magnet', 'Magnet', 'the raw magnetometer'], ['baro', 'Barometer', 'the barometer'],
  ['temp', 'Temp', 'temperature sensors'], ['prox', 'Proximity', 'the proximity sensor'], ['battery', 'Battery', 'battery details'], ['torch', 'Torch', 'the torch/flash']];

function tile(id, label, color, off, onTap) {
  const b = $('button', 'tile' + (off ? ' off' : '')); b.setAttribute('aria-label', label);
  const ic = $('div', 'ic'); ic.style.background = color; const cv = $('canvas'); ic.appendChild(cv); b.append(ic, $('span', '', label));
  new ResizeObserver(() => { const r = ic.getBoundingClientRect(), d = devicePixelRatio || 1; if (!r.width) return; cv.width = r.width * d; cv.height = r.height * d;
    const x = cv.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, r.width, r.height); x.globalAlpha = off ? .45 : 1; drawIcon(x, id, r.width / 2, r.height / 2, r.height * .5); }).observe(ic);
  b.onclick = onTap; return b;
}
const grid = document.getElementById('grid'), grid2 = document.getElementById('grid2');
TOOLS.forEach(t => grid.appendChild(tile(t[0], t[1], t[3], false, () => open(t))));
BLOCKED.forEach(([id, l, what]) => grid2.appendChild(tile(id, l, '#3A3F47', true, () => toast('iPhone doesn’t let web apps read ' + what + '. This tool is in the Android version.'))));
document.getElementById('homeSub').textContent = TOOLS.length + ' tools · works offline once installed';
const standalone = navigator.standalone || matchMedia('(display-mode: standalone)').matches;
if (isIOS && !standalone) document.getElementById('install').hidden = false;

const home = document.getElementById('home'), toolPage = document.getElementById('tool'), content = document.getElementById('content');
let curDef = null;
function open(def) {
  const [id, , title, color, needs, make] = def;
  // permission prompts must start synchronously inside the tap
  const perm = needs === 'motion' ? askMotion() : null;
  if (needs === 'mic' || needs === 'audio') ensureAudio();
  closeTool(true);
  content.innerHTML = ''; content.className = ''; C = content; curDef = def;
  document.getElementById('ttl').textContent = title;
  const hb = document.getElementById('helpBtn'); hb.style.background = color;
  const T = make(); T.held = false;
  T.build();
  toolPage.style.display = T.fill ? 'flex' : ''; toolPage.style.flexDirection = 'column'; toolPage.style.height = T.fill ? '100dvh' : '';
  content.style.display = T.fill ? 'flex' : ''; content.style.flexDirection = 'column'; content.style.flex = T.fill ? '1' : '';
  home.hidden = true; toolPage.hidden = false; scrollTo(0, 0);
  if (history.state !== 'tool') history.pushState('tool', '');
  hb.onclick = () => sheet(title, T.help || '');
  cur = T; keepAwake(true);
  const warn = msg => { const w = $('div', 'warn', msg); content.insertBefore(w, content.firstChild); };
  (async () => {
    if (perm) { const ok = await perm; if (!ok) { warn('Motion & orientation access was denied. To fix: close the app completely, reopen it and tap Allow — or for Safari, Settings › Apps › Safari › Motion & Orientation Access.'); return; } }
    try { if (T.start) await T.start(); }
    catch (err) { warn(err && err.name === 'NotAllowedError' ? 'Microphone access was denied. Allow it in Settings › Apps › Safari › Microphone (or remove and re-add the home-screen app).' : 'Could not start: ' + (err && err.message || err)); }
    if (needs === 'motion') setTimeout(() => { if (cur === T && !S.motionSeen && !S.oriSeen) warn('No motion data yet. Motion sensors need the app to be opened over https and (on iPhone) permission to be allowed.'); }, 2500);
  })();
}
function closeTool(silent) {
  if (cur) { try { cur.stop && cur.stop(); } catch (e) {} cur = null; }
  resizers.splice(0).forEach(r => r.disconnect());
  releaseMic(); keepAwake(false);
  if (!silent) { toolPage.hidden = true; home.hidden = false; content.innerHTML = ''; }
}
document.getElementById('back').onclick = () => { if (history.state === 'tool') history.back(); else closeTool(); };
addEventListener('popstate', () => { if (!toolPage.hidden) closeTool(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && cur) keepAwake(true); });

if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
