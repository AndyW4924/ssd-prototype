/* ============================================================
   Momo · Speech Sound Practice — prototype logic
   ------------------------------------------------------------
   Screens: home → gym → say → reward → report
   ============================================================ */

/* ---------------- tiny helpers ---------------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const rnd = (a, b) => a + Math.random() * (b - a);

const app = $('#app');

/* ---------------- responsive fit ---------------- */
let scale = 1;
function fit() {
  scale = Math.min(window.innerWidth / 1330, window.innerHeight / 850);
  scale = Math.min(scale, 1.35);
  app.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', fit);
fit();

/* ---------------- audio ---------------- */
let ac = null, muted = false;
function tone(freq, dur = .12, gain = .05, type = 'sine', delay = 0) {
  if (muted) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = ac.currentTime + delay;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + .012);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    o.connect(g); g.connect(ac.destination);
    o.start(t0); o.stop(t0 + dur + .02);
  } catch (e) { /* silence */ }
}
const sfxPop   = () => { tone(520, .1, .05, 'triangle'); tone(760, .12, .04, 'sine', .04); };
const sfxGood  = () => { tone(660, .14, .055); tone(880, .16, .05, 'sine', .1); tone(1170, .2, .04, 'sine', .2); };
const sfxWin   = () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, .22, .05, 'sine', i * .1)); };
const sfxSoft  = () => tone(320, .1, .035, 'sine');

/* ---------------- art: monster ---------------- */
let uid = 0;
function monsterSVG(extraClass = '') {
  const u = 'm' + (++uid);
  return `
<svg class="monster ${extraClass}" viewBox="0 0 400 480" aria-hidden="true">
  <defs>
    <filter id="${u}f" x="-32%" y="-26%" width="164%" height="152%">
      <feTurbulence type="fractalNoise" baseFrequency="0.019" numOctaves="2" seed="14" result="t"/>
      <feDisplacementMap in="SourceGraphic" in2="t" scale="30" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <radialGradient id="${u}g" gradientUnits="userSpaceOnUse" cx="150" cy="110" r="330">
      <stop offset="0" stop-color="#FFB0CC"/><stop offset=".42" stop-color="#FB74A3"/><stop offset="1" stop-color="#DD3B74"/>
    </radialGradient>
    <radialGradient id="${u}e" cx="34%" cy="28%" r="72%">
      <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F2E7EA"/>
    </radialGradient>
  </defs>

  <ellipse cx="200" cy="450" rx="118" ry="14" fill="#C9A79C" opacity=".22"/>
  <!-- feet -->
  <g fill="#3B3339">
    <rect x="124" y="390" width="62" height="54" rx="13" transform="rotate(-4 155 417)"/>
    <rect x="214" y="390" width="62" height="54" rx="13" transform="rotate(4 245 417)"/>
  </g>

  <!-- body + fur tufts -->
  <g filter="url(#${u}f)" fill="url(#${u}g)">
    ${(function(){
      let t = '';
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
        const x = 200 + Math.cos(a) * 130;
        const y = 230 + Math.sin(a) * 160;
        const rot = a * 180 / Math.PI + 90;
        t += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="35" ry="45" transform="rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
      }
      return t;
    })()}
    <ellipse cx="200" cy="230" rx="145" ry="176"/>
  </g>

  <!-- spots -->
  <g fill="#FFFFFF" opacity=".92">
    <circle cx="84" cy="252" r="7"/><circle cx="124" cy="332" r="5"/>
    <circle cx="314" cy="266" r="6"/><circle cx="290" cy="352" r="4.5"/>
    <circle cx="92" cy="196" r="4.5"/><circle cx="330" cy="196" r="4"/>
  </g>

  <!-- eyes -->
  <g class="eye-group" data-eye>
    <circle cx="156" cy="150" r="47" fill="url(#${u}e)"/>
    <circle class="pupil" cx="156" cy="151" r="23" fill="#2B2226"/>
    <circle cx="149" cy="143" r="7" fill="#fff" opacity=".92"/>
  </g>
  <g class="eye-group" data-eye>
    <circle cx="253" cy="139" r="50" fill="url(#${u}e)"/>
    <circle class="pupil" cx="253" cy="140" r="24" fill="#2B2226"/>
    <circle cx="246" cy="132" r="7.5" fill="#fff" opacity=".92"/>
  </g>

  <!-- mouth + teeth -->
  <path d="M126 218 Q200 198 278 218 Q268 264 200 270 Q132 264 126 218 Z" fill="#3A1C26"/>
  <g fill="#FFCB3D">
    <path d="M144 214 l17 0 -8.5 21 z"/>
    <path d="M172 209 l17 0 -8.5 22 z"/>
    <path d="M200 207 l17 0 -8.5 23 z"/>
    <path d="M228 209 l17 0 -8.5 22 z"/>
    <path d="M256 214 l16 0 -8 21 z"/>
  </g>

  <!-- arms -->
  <ellipse cx="62" cy="330" rx="21" ry="34" transform="rotate(-24 62 330)" fill="url(#${u}g)"/>
  <ellipse cx="338" cy="330" rx="21" ry="34" transform="rotate(24 338 330)" fill="url(#${u}g)"/>
</svg>`;
}

/* ---------------- art: mouth ---------------- */
function mouthSVG(shape = 'a') {
  const tops = [58, 47, 41, 38, 38, 41, 47, 58];
  const teeth = tops.map((ty, i) => {
    const cx = 46 + i * 24;
    return `<rect x="${cx - 10}" y="${ty}" width="20" height="${84 - ty}" rx="6" fill="#FFFCF4"/>`;
  }).join('');

  return `
<svg class="mouth" data-shape="${shape}" viewBox="0 0 260 212" aria-hidden="true">
  <defs>
    <radialGradient id="lipG" cx="38%" cy="20%" r="82%">
      <stop offset="0" stop-color="#FFA3B8"/><stop offset=".58" stop-color="#F4728F"/><stop offset="1" stop-color="#D94A6C"/>
    </radialGradient>
    <radialGradient id="cavG" cx="50%" cy="26%" r="76%">
      <stop offset="0" stop-color="#8C2937"/><stop offset="1" stop-color="#4E0F1B"/>
    </radialGradient>
    <radialGradient id="tonG" cx="42%" cy="18%" r="78%">
      <stop offset="0" stop-color="#FF909F"/><stop offset=".52" stop-color="#F0566C"/><stop offset="1" stop-color="#CB3A53"/>
    </radialGradient>
    <clipPath id="cavClip"><ellipse cx="130" cy="100" rx="98" ry="66"/></clipPath>
  </defs>

  <!-- lips -->
  <path d="M130 18 C206 18 256 54 256 104 C256 162 202 198 130 198 C58 198 4 162 4 104 C4 54 54 18 130 18 Z"
        fill="#C9405F" opacity=".2" transform="translate(0 5)"/>
  <path d="M130 18 C206 18 256 54 256 104 C256 162 202 198 130 198 C58 198 4 162 4 104 C4 54 54 18 130 18 Z"
        fill="url(#lipG)"/>
  <path d="M130 24 C196 24 240 56 246 98 C214 68 176 56 130 56 C84 56 46 68 14 98 C20 56 64 24 130 24 Z"
        fill="#FFBBCB" opacity=".5"/>

  <g class="jaw">
    <ellipse cx="130" cy="100" rx="98" ry="66" fill="url(#cavG)"/>
    <g clip-path="url(#cavClip)">
      <g class="teeth">${teeth}</g>
    <g class="tongue">
      <path d="M38 168 Q38 116 100 110 Q130 107 160 110 Q222 116 222 168 Z" fill="url(#tonG)"/>
      <ellipse cx="100" cy="124" rx="38" ry="8" fill="#FFC3CC" opacity=".5"/>
      <path d="M130 116 L130 148" stroke="#C0394F" stroke-width="2" opacity=".22" stroke-linecap="round"/>
    </g>
    </g>
  </g>
</svg>`;
}

/* ---------------- art: monster head (coach) ---------------- */
function headSVG() {
  const u = 'h' + (++uid);
  return `
<svg viewBox="0 0 200 160" class="head" aria-hidden="true">
  <defs>
    <radialGradient id="${u}g" cx="36%" cy="24%" r="84%">
      <stop offset="0" stop-color="#FFA2C3"/><stop offset="1" stop-color="#E3407A"/>
    </radialGradient>
  </defs>
  <ellipse cx="100" cy="86" rx="74" ry="66" fill="url(#${u}g)"/>
  <g class="eye-group" data-eye><circle cx="76" cy="66" r="25" fill="#fff"/><circle class="pupil" cx="76" cy="67" r="12" fill="#2B2226"/></g>
  <g class="eye-group" data-eye><circle cx="126" cy="62" r="26" fill="#fff"/><circle class="pupil" cx="126" cy="63" r="12.5" fill="#2B2226"/></g>
  <path d="M70 100 Q100 92 132 100 Q128 122 100 124 Q72 122 70 100 Z" fill="#3A1C26"/>
  <g fill="#FFCB3D"><path d="M78 99 l10 0 -5 13 z"/><path d="M96 96 l10 0 -5 14 z"/><path d="M114 97 l10 0 -5 13 z"/></g>
</svg>`;
}

/* ---------------- eye tracking ---------------- */
window.addEventListener('pointermove', (e) => {
  $$('.eye-group').forEach(g => {
    const r = g.getBoundingClientRect();
    if (!r.width) return;
    const a = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
    const p = g.querySelector('.pupil');
    if (p) p.style.transform = `translate(${Math.cos(a) * 9}px, ${Math.sin(a) * 9}px)`;
  });
});

/* ---------------- state ---------------- */
const ORDER = ['home', 'gym', 'say', 'reward', 'report'];
const LABEL = { home: 'Home', gym: 'Tongue Gym', say: 'Say /a/', reward: 'Reward', report: 'Report' };
const S = {
  screen: 'home',
  ex: 0,
  reps: 0,
  attempts: 0,
  stars: 0,
  sayStars: 0,
  micOK: null
};

/* ---------------- router ---------------- */
function go(id) {
  if (!ORDER.includes(id)) return;
  S.screen = id;
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === 's-' + id));
  $('#dockLbl').textContent = (ORDER.indexOf(id) + 1) + ' / 5 · ' + LABEL[id];
  if (id === 'gym') enterGym();
  if (id === 'say') enterSay();
  if (id === 'reward') enterReward();
  if (id === 'report') enterReport();
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-go]');
  if (b) go(b.dataset.go);
});
$('#btnStart').onclick = () => { sfxPop(); go('gym'); };
$('#btnParent').onclick = () => { sfxPop(); go('report'); };
$('#btnRewardNext').onclick = () => { sfxPop(); go('report'); };

/* dock + keys */
$('#dockNext').onclick = () => step(1);
$('#dockPrev').onclick = () => step(-1);
function step(d) {
  const i = clamp(ORDER.indexOf(S.screen) + d, 0, ORDER.length - 1);
  go(ORDER[i]);
}
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') step(1);
  if (e.key === 'ArrowLeft') step(-1);
  if (/^[1-5]$/.test(e.key)) go(ORDER[+e.key - 1]);
  if (e.code === 'Space' && S.screen === 'gym') { e.preventDefault(); setHold(true); }
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'Space' && S.screen === 'gym') setHold(false);
});

/* ---------------- confetti / toast ---------------- */
function burst(x, y, n = 16) {
  const fx = $('#fx');
  const cols = ['#FF6B9F', '#FFD04D', '#4FC26B', '#6FC6F5', '#FF9B6A', '#C58BFF'];
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.background = cols[i % cols.length];
    p.style.setProperty('--dx', rnd(-120, 120) + 'px');
    p.style.setProperty('--dy', rnd(-140, 40) + 'px');
    p.style.animationDelay = (i * 8) + 'ms';
    fx.appendChild(p);
    setTimeout(() => p.remove(), 1000 + i * 10);
  }
}
function burstEl(el, n = 16) {
  const r = el.getBoundingClientRect(), a = app.getBoundingClientRect();
  burst((r.left + r.width / 2 - a.left) / scale, (r.top + r.height / 2 - a.top) / scale, n);
}
let toastT;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('on'), 2000);
}

/* ============================================================
   GYM
   ============================================================ */
const EX = [
  {
    title: 'Tip up', shape: 'l',
    cue: 'Lift your tongue tip up to the bumpy ridge.',
    mode: 'hold', dur: 2.0, target: [.5, .33],
    sub: 'Press and hold while Momo counts'
  },
  {
    title: 'Back up', shape: 'a',
    cue: 'Make the back of your tongue a big hill.',
    mode: 'hold', dur: 2.0, target: [.5, .74],
    sub: 'Back of the tongue, not the tip'
  },
  {
    title: 'Slide', shape: 'l',
    cue: 'Slide your tongue from the ridge to the back.',
    mode: 'sweep', dur: 3.0,
    path: [[.5, .32], [.5, .52], [.5, .72]],
    sub: 'Follow the dot — slow and smooth'
  }
];
const REST = [.5, .62];

const gym = {
  holding: false, prog: 0, blob: [...REST], t: 0, done: false, aligned: false
};

const zone = $('#zone'), blob = $('#blob'), ringFill = $('#ringFill');
let lastSub = '';
function setSub(txt) {
  if (txt === lastSub) return;
  lastSub = txt;
  $('#holdSub').textContent = txt;
}

function enterGym() {
  S.ex = 0;
  loadEx(0);
}
function loadEx(i) {
  S.ex = i;
  const ex = EX[i];
  gym.holding = false; gym.prog = 0; gym.done = false; gym.t = 0;
  gym.blob = [...REST];

  $('#gymCue').textContent = ex.cue;
  $('#exCount').textContent = (i + 1) + ' / ' + EX.length;
  $('#holdTitle').textContent = ex.mode === 'sweep' ? 'Follow the dot' : 'Hold the pose';
  lastSub = '';
  setSub(ex.sub);
  $('#holdTxt').textContent = ex.mode === 'sweep' ? 'SLIDE' : 'HOLD';
  $('#holdBtn').classList.remove('done');

  $('#mirrorStage').innerHTML = mouthSVG(ex.shape);
  $$('#mirrorStage .mouth').forEach(m => { m.dataset.shape = ex.shape; });

  $('#gymDots').innerHTML = EX.map((_, k) =>
    `<i class="${k < i ? 'on' : (k === i ? 'on' : '')}"></i>`).join('');

  // zone position
  const t0 = ex.mode === 'sweep' ? ex.path[0] : ex.target;
  zone.style.left = (t0[0] * 100) + '%';
  zone.style.top = (t0[1] * 100) + '%';
  zone.classList.remove('aligned');
  updateBlob();
  updateRing();

  // replay mouth animation
  const m = $('#mirrorStage .mouth');
  if (m) { m.style.opacity = 0; requestAnimationFrame(() => { m.style.opacity = 1; }); }
}
function updateBlob() {
  blob.style.left = (gym.blob[0] * 100) + '%';
  blob.style.top = (gym.blob[1] * 100) + '%';
  blob.classList.toggle('good', gym.aligned);
  zone.classList.toggle('aligned', gym.aligned);
  $('#alignFlash').classList.toggle('on', gym.aligned);
}
function updateRing() {
  const len = 327;
  ringFill.style.strokeDashoffset = len * (1 - clamp(gym.prog, 0, 1));
  ringFill.style.stroke = gym.prog > .99 ? '#fff' : (gym.aligned ? '#EAFFEF' : '#fff');
}

function setHold(v) {
  if (gym.done) return;
  gym.holding = v;
  $('#holdBtn').classList.toggle('down', v);
  if (v) sfxSoft();
}

$('#holdBtn').addEventListener('pointerdown', (e) => { e.preventDefault(); setHold(true); });
['pointerup', 'pointercancel', 'pointerleave'].forEach(ev =>
  $('#holdBtn').addEventListener(ev, () => setHold(false)));

function targetNow() {
  const ex = EX[S.ex];
  if (ex.mode === 'hold') return ex.target;
  const p = ex.path, n = p.length - 1;
  const f = clamp(gym.t, 0, 1) * n;
  const i = Math.min(Math.floor(f), n - 1);
  const k = f - i;
  return [lerp(p[i][0], p[i + 1][0], k), lerp(p[i][1], p[i + 1][1], k)];
}

function gymStep(dt) {
  if (S.screen !== 'gym' || gym.done) return;
  const ex = EX[S.ex];
  const tgt = targetNow();

  if (ex.mode === 'sweep') {
    if (gym.holding) gym.t = clamp(gym.t + dt / ex.dur, 0, 1);
    else gym.t = clamp(gym.t - dt / (ex.dur * 2), 0, 1);
    gym.prog = gym.t;
  }

  // blob follows the child's real tongue: drifts to target only while practising
  const dest = gym.holding ? tgt : REST;
  const k = gym.holding ? .14 : .05;
  gym.blob[0] = lerp(gym.blob[0], dest[0], k);
  gym.blob[1] = lerp(gym.blob[1], dest[1], k);

  gym.aligned = dist(gym.blob, tgt) < (ex.mode === 'sweep' ? .17 : .13);

  if (ex.mode === 'hold') {
    if (gym.holding && gym.aligned) gym.prog = clamp(gym.prog + dt / ex.dur, 0, 1);
    else gym.prog = clamp(gym.prog - dt / (ex.dur * 1.6), 0, 1);
  }

  zone.style.left = (tgt[0] * 100) + '%';
  zone.style.top = (tgt[1] * 100) + '%';

  updateBlob();
  updateRing();

  // live coaching line — the "immediate response" the market lacks
  if (gym.done) setSub('Yes! Perfect.');
  else if (!gym.holding) setSub(ex.sub);
  else if (gym.aligned) setSub(ex.mode === 'sweep' ? 'Nice and smooth…' : 'There! Hold it…');
  else setSub('Almost — a little ' + (gym.blob[1] > tgt[1] ? 'higher ↑' : 'lower ↓'));

  if (gym.prog >= .999) completeEx();
}

function completeEx() {
  gym.done = true;
  gym.holding = false;
  $('#holdBtn').classList.add('done');
  $('#holdBtn').classList.remove('down');
  setSub('Yes! Perfect.');
  sfxGood();
  burstEl($('#holdBtn'), 20);
  const m = $('#mirrorStage .mouth');
  gym.aligned = true;
  updateBlob();

  setTimeout(() => {
    if (S.ex + 1 < EX.length) loadEx(S.ex + 1);
    else { S.reps += EX.length; go('say'); }
  }, 1050);
}

/* ============================================================
   SAY
   ============================================================ */
const say = { holding: false, t0: 0, raf: 0, completed: false };
let micStream = null, analyser = null, micBuf = null;

async function initMic() {
  if (S.micOK !== null) return S.micOK;
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const src = ac.createMediaStreamSource(micStream);
    analyser = ac.createAnalyser();
    analyser.fftSize = 512;
    src.connect(analyser);
    micBuf = new Uint8Array(analyser.frequencyBinCount);
    S.micOK = true;
  } catch (e) {
    S.micOK = false;
  }
  return S.micOK;
}

function micLevel() {
  if (!analyser) return null;
  analyser.getByteTimeDomainData(micBuf);
  let sum = 0;
  for (let i = 0; i < micBuf.length; i++) { const v = (micBuf[i] - 128) / 128; sum += v * v; }
  return Math.min(1, Math.sqrt(sum / micBuf.length) * 4.2);
}

function enterSay() {
  S.attempts = 0;
  say.completed = false;
  $('#sayMouth').innerHTML = mouthSVG('a');
  $('#sayResult').classList.remove('on');
  $('#recBtn').classList.remove('hot', 'down');
  $('#recTxt').textContent = 'Hold & say';
  renderAttempts();
  buildMeter();
  $('#sayHint').textContent = 'Momo is listening…';
  $('#sayDots').innerHTML = '<i class="on"></i><i class="on"></i><i></i>';
}

function renderAttempts() {
  $('#attempts').innerHTML = [0, 1, 2].map(i =>
    `<i class="${i < S.attempts ? 'fill' : ''}"></i>`).join('');
}

/* meter */
let meterBars = [];
function buildMeter() {
  const m = $('#meter');
  if (m.children.length) { meterBars = $$('#meter i'); return; }
  m.innerHTML = Array.from({ length: 26 }, () => '<i></i>').join('');
  meterBars = $$('#meter i');
}
let meterT = 0;
function meterStep(dt) {
  if (!meterBars.length) return;
  meterT += dt;
  const live = say.holding;
  const lvl = live ? (micLevel() ?? (0.34 + 0.22 * Math.sin(meterT * 7.5) + rnd(-.05, .1))) : .05;
  meterBars.forEach((b, i) => {
    const mid = 1 - Math.abs(i - (meterBars.length - 1) / 2) / (meterBars.length / 2);
    const wob = .55 + .45 * Math.sin(meterT * 9 + i * .8);
    const idle = 8 + (Math.sin(meterT * 2.2 + i * .55) * .5 + .5) * 12 * mid;
    const h = live ? 8 + clamp(lvl, 0, 1) * 52 * mid * wob + rnd(0, 5) : idle;
    b.style.height = Math.round(h) + 'px';
    b.style.background = live ? (h > 34 ? '#FF6B9F' : '#FFA9C4') : (h > 15 ? '#F7CFD9' : '#F0DFD8');
  });
}

$('#recBtn').addEventListener('pointerdown', async (e) => {
  e.preventDefault();
  if (say.completed) return;
  say.holding = true;
  say.t0 = performance.now();
  $('#recBtn').classList.add('down', 'hot');
  $('#recTxt').textContent = 'SAYING…';
  const ok = await initMic();
  if (ok) $('#sayHint').textContent = 'Mic on — nice and loud!';
  else $('#sayHint').textContent = 'No mic — press and hold to play.';
});
['pointerup', 'pointercancel', 'pointerleave'].forEach(ev =>
  $('#recBtn').addEventListener(ev, () => {
    if (!say.holding) return;
    say.holding = false;
    $('#recBtn').classList.remove('down', 'hot');
    $('#recTxt').textContent = 'Hold & say';
    const held = (performance.now() - say.t0) / 1000;
    if (held < 0.9) { $('#sayHint').textContent = 'Hold a little longer…'; sfxSoft(); return; }
    finishAttempt(held);
  }));

function finishAttempt(held) {
  S.attempts++;
  renderAttempts();

  const loud = micLevel() ?? .5;
  let stars = 1;
  if (held > 1.9 && loud > .18) stars = 3;
  else if (held > 1.2) stars = 2;
  stars = clamp(stars + (Math.random() > .78 ? 1 : 0), 1, 3);

  S.sayStars += stars;
  S.reps++;

  const titles = { 1: 'Almost!', 2: 'Nice one!', 3: 'Beautiful!' };
  const subs = {
    1: 'Your tongue was hiding. Try again with a big open mouth.',
    2: 'Good open jaw. Push the sound out a little longer.',
    3: 'Tongue low and flat — exactly right for /a/.'
  };

  $('#rpStars').innerHTML = [0, 1, 2].map(i => `<i class="${i < stars ? 'on' : ''}">★</i>`).join('');
  $('#rpTitle').textContent = titles[stars];
  $('#rpSub').textContent = subs[stars];
  $('#rpNext').innerHTML = S.attempts >= 3 ? 'Finish <span>→</span>' : 'Again <span>→</span>';
  $('#sayResult').classList.add('on');

  if (stars === 3) { sfxGood(); burstEl($('#recBtn'), 14); } else sfxPop();

  const m = $('#sayMouth .mouth');
  if (m) m.dataset.shape = stars === 3 ? 'a' : 'l';
  setTimeout(() => { if (m) m.dataset.shape = 'a'; }, 900);
}

$('#rpNext').onclick = () => {
  $('#sayResult').classList.remove('on');
  sfxPop();
  if (S.attempts >= 3) {
    S.stars = S.sayStars;
    go('reward');
  }
};

/* ============================================================
   REWARD
   ============================================================ */
function enterReward() {
  $('#rewardMonster').innerHTML = monsterSVG('cheer');
  const c = $('#confetti');
  c.innerHTML = '';
  const cols = ['#FF6B9F', '#FFD04D', '#4FC26B', '#6FC6F5', '#C58BFF', '#FF9B6A'];
  for (let i = 0; i < 42; i++) {
    const p = document.createElement('i');
    p.style.left = rnd(0, 100) + '%';
    p.style.top = rnd(-30, 0) + '%';
    p.style.background = cols[i % cols.length];
    p.style.animationDelay = rnd(0, 1.4) + 's';
    p.style.animationDuration = rnd(1.9, 3) + 's';
    c.appendChild(p);
  }
  const strip = $('#stickerStrip');
  strip.innerHTML = '';
  const stickers = ['🐶', '🦖', '🚀', '🐙', '🍓'];
  stickers.forEach((s, i) => {
    const d = document.createElement('div');
    d.className = 'sticker ' + (i < 3 ? '' : 'locked') + (i === 3 ? ' new' : '');
    d.textContent = s;
    strip.appendChild(d);
  });
  setTimeout(sfxWin, 300);
  setTimeout(() => burstEl($('.basket'), 24), 500);
}

/* ============================================================
   REPORT
   ============================================================ */
function enterReport() {
  // week dots
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  $('#weekDots').innerHTML = days.map((d, i) => {
    const ok = i < 4;
    const today = i === 2;
    return `<div class="day ${ok ? 'ok' : ''} ${today ? 'today' : ''}"><b>${ok ? '✓' : ''}</b>${d}</div>`;
  }).join('');

  // kpi spark
  $('#kpiSpark').innerHTML = [14, 20, 12, 26, 22, 30, 24].map(h =>
    `<i class="${h > 24 ? 'hi' : ''}" style="height:${h}px"></i>`).join('');
  $('#kpiSpark2').innerHTML = [10, 16, 14, 22, 26, 28, 30].map(h =>
    `<i class="${h > 24 ? 'hi' : ''}" style="height:${h}px"></i>`).join('');

  // bars
  const data = [
    { l: 'S1', v: 42 }, { l: 'S2', v: 55 }, { l: 'S3', v: 63 },
    { l: 'S4', v: 71 }, { l: 'Today', v: 86, now: true }
  ];
  $('#barsChart').innerHTML =
    `<div class="grid-line" style="bottom:36px"></div>
     <div class="grid-line" style="bottom:66px"></div>
     <div class="grid-line" style="bottom:96px"></div>` +
    data.map(d => `
      <div class="bar-group">
        <div class="bar ${d.now ? 'now' : ''}" style="height:0" data-h="${d.v}">
          <span class="bar-val">${d.v}%</span>
        </div>
        <span class="bg-lbl">${d.l}</span>
      </div>`).join('');
  requestAnimationFrame(() => {
    $$('#barsChart .bar').forEach(b => { b.style.height = b.dataset.h + '%'; });
  });

  // notes tailored to session
  const notes = [
    '<b>/a/</b> is steady — jaw opens wide, tongue stays low.',
    '<b>Tongue tip</b> drifts back on long holds. Try 3 × 5s before the word game.',
    `Attention held <b>${S.reps >= 6 ? '4m 10s' : '3m 05s'}</b> before the first break.`
  ];
  $('#notesList').innerHTML = notes.map(n => `<li>${n}</li>`).join('');
}

$('#btnShare').onclick = () => { sfxPop(); toast('Sent to Dr. Lin · tongue map + 3 clips attached'); };

/* ---------------- sound toggle ---------------- */
$$('.sound-toggle').forEach(b => {
  b.onclick = () => {
    muted = !muted;
    b.textContent = muted ? '🔇' : '🔊';
    if (!muted) sfxPop();
  };
});

/* ---------------- boot ---------------- */
$('#homeMonster').innerHTML = monsterSVG();
go('home');
const hash0 = location.hash.replace('#', '');
if (ORDER.includes(hash0)) go(hash0);

let last = performance.now();
function loop(ts) {
  const dt = Math.min(.05, (ts - last) / 1000) || 0;
  last = ts;
  gymStep(dt);
  meterStep(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
