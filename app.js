/* ============================================================
   Momo's Kite — fly with your mouth · prototype logic
   ------------------------------------------------------------
   Screens: start → game
   Mouth input: camera (MediaPipe FaceLandmarker) with
   keyboard/pointer fallback when the camera is unavailable.
   ============================================================ */

/* ---------------- tiny helpers ---------------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
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
const sfxPop  = () => { tone(520, .1, .05, 'triangle'); tone(760, .12, .04, 'sine', .04); };
const sfxUp   = () => tone(560, .09, .045, 'triangle');
const sfxDown = () => tone(360, .09, .035, 'sine');
const sfxPass = () => { tone(660, .1, .045); tone(880, .12, .04, 'sine', .06); };
const sfxHit  = () => { tone(200, .22, .07, 'sawtooth'); tone(150, .26, .05, 'square', .05); };
const sfxOver = () => [392, 330, 262, 196].forEach((f, i) => tone(f, .26, .05, 'sine', i * .14));
const sfxWin  = () => [523, 659, 784, 1046].forEach((f, i) => tone(f, .2, .05, 'sine', i * .09));

/* ============================================================
   ART
   ============================================================ */
let uid = 0;

/* kite */
function kiteSVG(w = 150, withTail = true) {
  const u = 'k' + (++uid);
  return `
<svg viewBox="0 0 160 ${withTail ? 210 : 124}" width="${w}" aria-hidden="true">
  <defs>
    <linearGradient id="${u}kg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FF9BBB"/><stop offset=".55" stop-color="#FF6B9F"/><stop offset="1" stop-color="#E23C74"/>
    </linearGradient>
  </defs>
  <g>
    ${withTail ? `<!-- tail -->
    <path d="M80 118 Q60 150 82 172 Q104 194 84 208" fill="none" stroke="#E8A62B" stroke-width="3" stroke-linecap="round"/>
    <g fill="#FFD04D">
      <path d="M64 146 l14 -5 -3 14 z"/>
      <path d="M92 186 l14 -5 -3 14 z" fill="#4FC26B"/>
    </g>` : ''}
    <!-- diamond -->
    <path d="M80 8 L138 62 L80 118 L22 62 Z" fill="url(#${u}kg)"/>
    <path d="M80 8 L138 62 L80 62 Z" fill="#FFFFFF" opacity=".18"/>
    <path d="M80 8 L80 118" stroke="#FFF" stroke-width="3" opacity=".65"/>
    <path d="M22 62 L138 62" stroke="#FFF" stroke-width="3" opacity=".65"/>
    <circle cx="80" cy="62" r="9" fill="#FFF3D9" stroke="#E8A62B" stroke-width="2.5"/>
  </g>
</svg>`;
}

/* cloud obstacle */
function cloudSVG(w = 150) {
  return `
<svg viewBox="0 0 160 92" width="${w}" aria-hidden="true">
  <g fill="#FFFFFF">
    <ellipse cx="52" cy="58" rx="34" ry="24"/>
    <ellipse cx="88" cy="44" rx="38" ry="30"/>
    <ellipse cx="120" cy="60" rx="28" ry="20"/>
    <ellipse cx="80" cy="64" rx="52" ry="22"/>
  </g>
  <g fill="#DCEBF5" opacity=".8">
    <ellipse cx="80" cy="76" rx="46" ry="12"/>
  </g>
  <g fill="#FFFFFF">
    <circle cx="66" cy="34" r="4"/><circle cx="98" cy="26" r="3.4"/>
  </g>
</svg>`;
}

/* balloon obstacle — body centred high, string hangs below */
const BALLOON_COLORS = [
  ['#FF8A94', '#FF5B70', '#D93A50'],   // red
  ['#FFD97A', '#FFC23D', '#E8A62B'],   // yellow
  ['#8FD6FF', '#5CB8F0', '#3E9FD4'],   // blue
  ['#D9A8FF', '#C58BFF', '#9A5CE0']    // purple
];
function balloonSVG(w = 120) {
  const u = 'b' + (++uid);
  const [c1, c2, c3] = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
  return `
<svg viewBox="0 0 120 150" width="${w}" aria-hidden="true">
  <defs>
    <radialGradient id="${u}bg" cx="36%" cy="26%" r="78%">
      <stop offset="0" stop-color="${c1}"/><stop offset=".55" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/>
    </radialGradient>
  </defs>
  <path d="M60 108 Q50 122 60 134 Q68 144 58 158" fill="none" stroke="#B9A2AC" stroke-width="2.4" stroke-linecap="round"/>
  <ellipse cx="60" cy="50" rx="43" ry="50" fill="url(#${u}bg)"/>
  <ellipse cx="45" cy="30" rx="12" ry="17" fill="#FFFFFF" opacity=".38"/>
  <path d="M52 99 L68 99 L60 111 Z" fill="${c3}"/>
</svg>`;
}

/* little bird obstacle — faces the kite (left), wing flaps via CSS */
function birdSVG(w = 120) {
  return `
<svg viewBox="0 0 140 100" width="${w}" aria-hidden="true">
  <path d="M100 46 L124 36 L114 58 Z" fill="#4FA8DF"/>
  <ellipse cx="70" cy="54" rx="31" ry="24" fill="#6FC6F5"/>
  <ellipse cx="78" cy="62" rx="15" ry="10" fill="#EAF7FF" opacity=".9"/>
  <path d="M40 52 L24 58 L40 64 Z" fill="#FFB13B"/>
  <g class="wing"><path d="M62 42 Q88 12 106 34 Q86 48 62 48 Z" fill="#4FA8DF"/></g>
  <circle cx="56" cy="47" r="5.5" fill="#2B2226"/>
  <circle cx="58" cy="45" r="2" fill="#fff"/>
</svg>`;
}

/* small puffy background cloud */
function bgCloudSVG(w = 90) {
  return `
<svg viewBox="0 0 120 60" width="${w}" aria-hidden="true">
  <g fill="#FFFFFF">
    <ellipse cx="40" cy="40" rx="26" ry="16"/>
    <ellipse cx="68" cy="30" rx="28" ry="20"/>
    <ellipse cx="92" cy="42" rx="22" ry="13"/>
  </g>
</svg>`;
}

/* kite handwheel (手摇轮) — rim is static, spokes + crank rotate via .mg-reel-rot */
function reelSVG(u) {
  return `
  <!-- kite handwheel: rim, rotating spokes + crank, hand on the hub -->
  <g class="mg-reel">
    <circle cx="395" cy="178" r="54" fill="#F6E3BC" opacity=".3"/>
    <circle cx="395" cy="178" r="54" fill="none" stroke="#C98A4B" stroke-width="13"/>
    <circle cx="395" cy="178" r="54" fill="none" stroke="#A96B33" stroke-width="3" stroke-dasharray="5 12" opacity=".55"/>
    <g class="mg-reel-rot">
      <g stroke="#A96B33" stroke-width="8" stroke-linecap="round">
        <path d="M395 178 L395 126"/><path d="M395 178 L447 178"/>
        <path d="M395 178 L395 230"/><path d="M395 178 L343 178"/>
      </g>
      <path d="M395 120 L395 92" stroke="#8A5A2B" stroke-width="9" stroke-linecap="round"/>
      <circle cx="395" cy="88" r="12" fill="#FFCB3D" stroke="#B4763C" stroke-width="3"/>
    </g>
    <circle cx="395" cy="178" r="14" fill="#B4763C"/>
    <circle cx="395" cy="178" r="22" fill="url(#${u}g)"/>
    <circle cx="386" cy="170" r="6" fill="#fff" opacity=".35"/>
  </g>`;
}

/* momo body — includes both mouth states + hit sparks, driven by data-mood */
function momoBodySVG(raiseArm = false) {
  const u = 'm' + (++uid);
  return `
<svg viewBox="0 0 400 480" aria-hidden="true">
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
  <g fill="#3B3339">
    <rect x="124" y="390" width="62" height="54" rx="13" transform="rotate(-4 155 417)"/>
    <rect x="214" y="390" width="62" height="54" rx="13" transform="rotate(4 245 417)"/>
  </g>

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

  <g fill="#FFFFFF" opacity=".92">
    <circle cx="84" cy="252" r="7"/><circle cx="124" cy="332" r="5"/>
    <circle cx="314" cy="266" r="6"/><circle cx="290" cy="352" r="4.5"/>
    <circle cx="92" cy="196" r="4.5"/><circle cx="330" cy="196" r="4"/>
  </g>

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

  <!-- mouth shut: a simple closed smile, so "open" is unmistakable -->
  <g class="mg-closed">
    <path d="M140 228 Q200 272 260 228" fill="none" stroke="#3A1C26" stroke-width="11" stroke-linecap="round"/>
    <path d="M158 246 Q200 262 242 246" fill="none" stroke="#FFFFFF" stroke-width="3.5"
          stroke-linecap="round" opacity=".22"/>
  </g>

  <!-- wide open mouth (player's mouth is open) -->
  <g class="mg-open">
    <ellipse cx="200" cy="244" rx="66" ry="56" fill="#2C1420"/>
    <ellipse cx="200" cy="272" rx="38" ry="24" fill="#E8607A"/>
    <ellipse cx="188" cy="264" rx="14" ry="6" fill="#FF9FB0" opacity=".55"/>
    <g fill="#FFCB3D">
      <path d="M146 200 l20 0 -10 20 z"/>
      <path d="M176 196 l20 0 -10 22 z"/>
      <path d="M206 196 l20 0 -10 22 z"/>
      <path d="M236 200 l20 0 -10 20 z"/>
    </g>
  </g>

  <!-- dizzy sparks on hit -->
  <g class="mg-hitzap" fill="#FFD04D" stroke="#E8A62B" stroke-width="2">
    <path d="M96 96 l10 -18 8 16 -18 2 z"/>
    <path d="M312 84 l16 -12 2 18 -18 -6 z"/>
  </g>

  <!-- arms: capsules that reach past the fur so they read as limbs -->
  <g stroke="#D2326A" stroke-opacity=".28" stroke-width="40" stroke-linecap="round" fill="none">
    <path d="M118 300 L52 358"/>
    ${raiseArm ? `<path d="M288 302 L395 178"/>` : `<path d="M282 300 L348 358"/>`}
  </g>
  <g stroke="url(#${u}g)" stroke-width="34" stroke-linecap="round" fill="none">
    <path d="M118 300 L52 358"/>
    ${raiseArm ? `<path d="M288 302 L395 178"/>` : `<path d="M282 300 L348 358"/>`}
  </g>
  <g fill="url(#${u}g)">
    <circle cx="52" cy="358" r="21"/>
    ${raiseArm ? `<circle cx="395" cy="178" r="23"/>` : `<circle cx="348" cy="358" r="21"/>`}
  </g>

  ${raiseArm ? reelSVG(u) : ''}
</svg>`;
}

/* start-page illustration: momo holding the kite, string included */
function momoKiteSVG() {
  return `
<svg viewBox="0 0 505 620" aria-hidden="true">
  <g class="k-sway">
    <g transform="translate(300 0)">${kiteSVG(172, false).replace(/<svg[^>]*>|<\/svg>/g, '')}</g>
    <!-- string: handwheel rim → kite tail -->
    <path d="M401 267 Q412 195 380 118" fill="none" stroke="#9A8791" stroke-width="2.8" stroke-linecap="round" opacity=".8"/>
    <g fill="#FFD04D" stroke="#E8A62B" stroke-width="1.2">
      <path d="M403 216 l15 -5 -3 15 z"/>
      <path d="M395 164 l15 -5 -3 15 z" fill="#4FC26B" stroke="#36A052"/>
    </g>
  </g>
  <g transform="translate(6 150)">${momoBodySVG(true).replace(/<svg[^>]*>|<\/svg>/g, '')}</g>
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
  toastT = setTimeout(() => t.classList.remove('on'), 2200);
}

/* ============================================================
   STATE + ROUTER
   ============================================================ */
const NOINTRO = /nointro/.test(location.search);   // skip the countdown (demos / screenshots)

const S = {
  screen: 'start',
  playing: false,
  hearts: 3,
  score: 0,
  best: +(localStorage.getItem('momo-kite-best') || 0)
};

function go(id) {
  S.screen = id;
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === 's-' + id));
  if (id === 'game') enterGame();
  if (id === 'start') leaveGame();
}

/* ============================================================
   CAMERA — mouth open / shut detection
   ============================================================ */
const cam = {
  ok: null,            // null = unknown, true/false once decided
  stream: null,
  landmarker: null,
  ratio: 0,
  open: false,
  noFaceMs: 0,
  lastVideoTs: -1000
};
let manualOpen = false;  // space / pointer fallback

const camVideo = $('#camVideo');
const camBubble = $('#camBubble');
const camStateEl = $('#camState');
const camOffEl = $('#camOff');

async function initCamera(silent = false) {
  if (cam.ok !== null) return cam.ok;
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('no api');
    cam.stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 480, height: 360, facingMode: 'user' }, audio: false
    });
    camVideo.srcObject = cam.stream;
    cam.ok = true;
    camOffEl.style.display = 'none';
  } catch (e) {
    cam.ok = false;
    camStateEl.textContent = 'camera off';
    if (!silent) toast('Camera unavailable — hold SPACE (or press & hold) to open your mouth');
  }
  return cam.ok;
}

function detectMouth(ts) {
  if (cam.ok !== true) return;
  if (!window.__faceLandmarker) return;
  if (camVideo.readyState < 2 || camVideo.videoWidth === 0) return;
  if (ts - cam.lastVideoTs < 62) return;
  cam.lastVideoTs = ts;

  let res;
  try { res = window.__faceLandmarker.detectForVideo(camVideo, ts); }
  catch (e) { return; }

  const lm = res && res.faceLandmarks && res.faceLandmarks[0];
  if (!lm) {
    cam.noFaceMs += 40;
    camStateEl.textContent = cam.noFaceMs > 1200 ? 'no face' : '…';
    camBubble.classList.remove('open');
    return;
  }
  cam.noFaceMs = 0;

  const P = i => lm[i];
  const dx = (a, b) => Math.hypot((a.x - b.x) * camVideo.videoWidth, (a.y - b.y) * camVideo.videoHeight);
  const mouth = dx(P(13), P(14));        // inner lips gap
  const faceH = Math.max(1, dx(P(10), P(152)));
  const raw = mouth / faceH;

  cam.ratio = lerp(cam.ratio, raw, .4);
  if (cam.ratio > .055) cam.open = true;
  else if (cam.ratio < .038) cam.open = false;

  const open = cam.open;
  camBubble.classList.toggle('open', open);
  camStateEl.textContent = open ? 'OPEN ✓' : 'closed';
}

function camLive() {
  return cam.ok === true && !!window.__faceLandmarker;
}
function mouthOpen() {
  if (!camLive()) return manualOpen;
  return cam.open || manualOpen;
}

/* fallback input: hold space / press & hold anywhere on the field */
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { e.preventDefault(); manualOpen = true; }
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'Space') manualOpen = false;
});
const fieldEl = $('#field');
fieldEl.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.cam-bubble, .go-card, .getready, button')) return;
  manualOpen = true;
});
['pointerup', 'pointercancel', 'pointerleave'].forEach(ev =>
  window.addEventListener(ev, () => { manualOpen = false; }));

/* ============================================================
   GAME
   ============================================================ */
const kiteWrap  = $('#kiteWrap');
const kiteTilt  = $('#kiteTilt');
const cloudsEl  = $('#clouds');
const heartsEl  = $('#hearts');
const scoreEl   = $('#scoreVal');
const bestChip  = $('#bestChip');
const stringPath = $('#stringPath');
const handAnchor = $('#handAnchor');
const momoEl    = $('#gameMomo');
const getReady  = $('#getReady');
const grTitle   = $('#grTitle');
const grSub     = $('#grSub');
const grCount   = $('#grCount');
const gameOver  = $('#gameOver');
const goScoreEl = $('#goScore');
const goBestEl  = $('#goBest');
const goMonster = $('#goMonster');

const kite = { y: 0, lane: 1, tilt: 0, x: 0 };   // lane 0 = top, 1 = bottom
let takeoff = 0;                                 // 1 → 0 while the kite flies in from the left
const LANE = [.27, .73];                    // fraction of field height
let obstacles = [];
let reelAngle = 0;                          // handwheel rotation follows kite movement
let spawnT = 1.2;
let invT = 0, cheerT = 0, overT = 0;
let fieldW = 0, fieldH = 0, KX = 0;

function measureField() {
  const w = fieldEl.clientWidth, h = fieldEl.clientHeight;
  if (!w || !h) return;
  fieldW = w; fieldH = h;
  KX = fieldW * .32;
  kiteWrap.style.left = (KX / fieldW * 100) + '%';
}

function laneY(l) { return fieldH * LANE[l]; }

function startPlay() {
  S.playing = true;
  takeoff = 1;
}

function resetGame() {
  obstacles.forEach(o => o.el.remove());
  obstacles = [];
  reelAngle = 0;
  S.hearts = 3; S.score = 0; spawnT = 1.4; invT = 0; cheerT = 0; overT = 0;
  kite.lane = 1; kite.y = fieldH * LANE[1]; kite.tilt = 0; kite.x = KX;
  takeoff = 1;
  scoreEl.textContent = '0';
  bestChip.textContent = 'best ' + S.best;
  renderHearts();
  gameOver.classList.remove('on');
  $('#field').classList.remove('shake');
}

function renderHearts() {
  $$('i', heartsEl).forEach((h, i) => h.classList.toggle('on', i < S.hearts));
}

function buildBgClouds() {
  const bg = $('#bgClouds');
  bg.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const d = document.createElement('i');
    d.innerHTML = bgCloudSVG(rnd(70, 130));
    d.style.top = rnd(4, 88) + '%';
    d.style.animationDuration = rnd(26, 46) + 's';
    d.style.animationDelay = -rnd(0, 30) + 's';
    bg.appendChild(d);
  }
}

function spawnObstacle() {
  const lane = Math.random() < .5 ? 0 : 1;
  const r = Math.random();
  const type = r < .45 ? 'cloud' : r < .74 ? 'balloon' : 'bird';
  const el = document.createElement('div');
  el.className = 'ob ' + type;
  el.dataset.type = type;

  let w, html, oy = 0, cw, ch, spd = 1;
  if (type === 'cloud') {
    w = rnd(130, 175);
    html = cloudSVG(w);
    cw = w * .40; ch = w * .58 * .30;
  } else if (type === 'balloon') {
    w = rnd(112, 148);
    html = balloonSVG(w);
    oy = w * .105;                // balloon body sits above the box centre (string below)
    cw = w * .32; ch = w * .40;
    spd = .85;
  } else {
    w = rnd(108, 140);
    html = birdSVG(w);
    cw = w * .26; ch = w * .22;
    spd = 1.14;
  }
  el.innerHTML = html;
  cloudsEl.appendChild(el);
  const c = { type, x: fieldW + w, lane, w, oy, cw, ch, spd,
              phase: rnd(0, Math.PI * 2), el, scored: false, hit: false };
  obstacles.push(c);
  placeOb(c);
}

function bobOf(c, ts) {
  if (ts == null) return 0;
  if (c.type === 'balloon') return Math.sin(ts / 1000 * 1.7 + c.phase) * 15;
  if (c.type === 'bird')    return Math.sin(ts / 1000 * 3.1 + c.phase) * 9;
  return 0;
}

function placeOb(c, ts = null) {
  c.el.style.left = c.x + 'px';
  c.el.style.top = (laneY(c.lane) + c.oy + bobOf(c, ts)) + 'px';
}

/* ---------- flow ---------- */
async function enterGame() {
  // measure the field (clientWidth/Height ignore the page scale transform)
  measureField();
  kiteWrap.style.left = (KX / fieldW * 100) + '%';

  resetGame();
  buildBgClouds();

  kiteTilt.innerHTML = kiteSVG(142, false);
  momoEl.innerHTML = momoBodySVG(true);
  momoEl.appendChild(handAnchor);          // keep the same anchor node
  momoEl.dataset.mood = 'idle';
  goMonster.innerHTML = momoBodySVG(false);

  S.playing = false;
  getReady.classList.add('on');
  grTitle.textContent = 'Get ready!';
  grCount.textContent = '';

  await initCamera();
  if (S.screen !== 'game') return;

  grSub.textContent = cam.ok === true
    ? 'Camera on! Big smile — open your mouth to fly up.'
    : (cam.ok === false
        ? 'No camera — hold SPACE (or press & hold) to open your mouth.'
        : 'Looking for your face…');

  // wait briefly for the model, but never more than 2.5s
  const t0 = performance.now();
  await new Promise(res => {
    (function chk() {
      if (cam.ok !== null && (window.__faceReady !== undefined || cam.ok === false)) return res();
      if (performance.now() - t0 > 2500) return res();
      if (S.screen !== 'game') return res();
      setTimeout(chk, 120);
    })();
  });
  if (S.screen !== 'game') { getReady.classList.remove('on'); return; }

  if (cam.ok === true && window.__faceLandmarker) {
    grSub.textContent = 'Camera on! Open your mouth = fly up · close = drift down.';
  }

  if (NOINTRO) { getReady.classList.remove('on'); startPlay(); return; }

  // countdown 3 · 2 · 1
  for (const n of ['3', '2', '1']) {
    if (S.screen !== 'game') return;
    grCount.textContent = n;
    grCount.classList.remove('bump');
    void grCount.offsetWidth;
    grCount.classList.add('bump');
    sfxPop();
    await new Promise(r => setTimeout(r, 620));
  }
  if (S.screen !== 'game') return;

  getReady.classList.remove('on');
  startPlay();
  sfxWin();
  toast(cam.ok === true ? 'Open your mouth to fly up!' : 'Hold SPACE to fly up!');
}

function leaveGame() {
  S.playing = false;
  getReady.classList.remove('on');
  gameOver.classList.remove('on');
}

function loseHeart() {
  S.hearts--;
  renderHearts();
  sfxHit();
  invT = 1.3;
  kiteWrap.classList.add('blink');
  momoEl.dataset.mood = 'hit';
  const f = $('#field');
  f.style.animation = 'none'; void f.offsetWidth;
  f.style.animation = 'fieldShake .5s';
  setTimeout(() => kiteWrap.classList.remove('blink'), 1300);
  if (S.hearts <= 0) doGameOver();
}
/* shake keyframes injected (used above) */
const st = document.createElement('style');
st.textContent = '@keyframes fieldShake{20%{transform:translate(-8px,3px)}45%{transform:translate(7px,-3px)}70%{transform:translate(-4px,2px)}}';
document.head.appendChild(st);

function doGameOver() {
  S.playing = false;
  sfxOver();
  if (S.score > S.best) {
    S.best = S.score;
    localStorage.setItem('momo-kite-best', S.best);
  }
  goScoreEl.textContent = S.score;
  goBestEl.textContent = 'best ' + S.best;
  gameOver.classList.add('on');
  burstEl($('.go-card'), 18);
}

/* ---------- per-frame ---------- */
let floaters = [];
function addFloater(txt, x, y) {
  const d = document.createElement('div');
  d.textContent = txt;
  d.style.cssText = `position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%);
    font-family:var(--display);font-weight:800;font-size:22px;color:var(--green-d);
    text-shadow:0 2px 0 #fff;pointer-events:none;transition:all .7s ease-out;z-index:5;`;
  fieldEl.appendChild(d);
  requestAnimationFrame(() => { d.style.transform = 'translate(-50%,-140%)'; d.style.opacity = '0'; });
  setTimeout(() => d.remove(), 750);
}

function gameStep(dt, ts) {
  if (S.screen !== 'game') return;
  if (!fieldW) measureField();

  /* mouth state → lane */
  const open = mouthOpen();
  const wantLane = open ? 0 : 1;

  if (S.playing) kite.lane = wantLane;

  const dest = laneY(kite.lane);
  const prevY = kite.y;
  kite.y = lerp(kite.y, dest, 1 - Math.exp(-9 * dt));
  const vy = (dest - kite.y);
  kite.tilt = clamp(vy * .10, -17, 17);

  /* handwheel rolls as the kite climbs / sinks */
  reelAngle += (kite.y - prevY) * .6;
  const reelRot = momoEl.querySelector('.mg-reel-rot');
  if (reelRot) reelRot.setAttribute('transform',
    `rotate(${(reelAngle % 360).toFixed(1)} 395 178)`);

  /* kite element — x eases in from the left when a run starts */
  if (takeoff > 0) takeoff = Math.max(0, takeoff - dt * 1.6);
  kite.x = KX - fieldW * .26 * takeoff * takeoff;
  kiteWrap.style.left = (kite.x / fieldW * 100) + '%';
  const dy = kite.y - fieldH * .5 + Math.sin(ts / 1000 * 2.6) * 5;
  kiteWrap.style.transform = `translateY(${dy}px)`;
  kiteTilt.style.transform = `translate(-50%,-50%) rotate(${kite.tilt.toFixed(1)}deg)`;

  /* momo mirrors the player */
  if (invT > 0) momoEl.dataset.mood = 'hit';
  else if (cheerT > 0) momoEl.dataset.mood = 'cheer';
  else momoEl.dataset.mood = open ? 'open' : 'idle';

  /* string: momo hand → kite tail */
  const fr = fieldEl.getBoundingClientRect();
  const hr = handAnchor.getBoundingClientRect();
  const hx = hr.left - fr.left, hy = hr.top - fr.top;
  const kxp = kite.x, kyp = kite.y + 49;
  const mx = (hx + kxp) / 2 + 10, my = (hy + kyp) / 2 + 8;
  stringPath.setAttribute('d', `M ${hx.toFixed(1)} ${hy.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${kxp.toFixed(1)} ${kyp.toFixed(1)}`);

  if (!S.playing) return;

  /* timers */
  invT = Math.max(0, invT - dt);
  cheerT = Math.max(0, cheerT - dt);

  /* spawn */
  spawnT -= dt;
  if (spawnT <= 0) {
    spawnObstacle();
    const base = Math.max(.85, 1.55 - S.score * .02);
    spawnT = rnd(base, base + .5);
  }

  /* move obstacles */
  const speed = Math.min(460, 250 + S.score * 6);
  const khw = 40, khh = 36;
  for (const c of obstacles) {
    if (c.hit) continue;
    c.x -= speed * dt * c.spd;
    placeOb(c, ts);

    const cy = laneY(c.lane) + c.oy + bobOf(c, ts);
    const overlapX = Math.abs(c.x - kite.x) < c.cw + khw;
    const overlapY = Math.abs(cy - kite.y) < c.ch + khh;

    if (overlapX && overlapY && invT <= 0 && !c.hit) {
      c.hit = true;
      c.el.classList.add('hit');
      loseHeart();
      setTimeout(() => { c.el.remove(); c.dead = true; }, 620);
      continue;
    }
    if (!c.scored && c.x + c.w / 2 < kite.x - khw) {
      c.scored = true;
      S.score++;
      scoreEl.textContent = S.score;
      sfxPass();
      cheerT = .55;
      addFloater('+1', kite.x + 60, kite.y - 50);
    }
  }
  obstacles = obstacles.filter(c => {
    if (c.hit) return c.dead !== true;          // removed by its own timer
    if (c.x < -c.w) { c.el.remove(); return false; }
    return true;
  });

  /* up / down blips (subtle, not spammy) */
  if (Math.abs(kite.y - prevY) > 1.1 && Math.random() < .06) {
    (kite.y < prevY ? sfxUp : sfxDown)();
  }
}

/* ============================================================
   WIRING
   ============================================================ */
$('#btnStart').onclick = () => { sfxPop(); go('game'); };
$('#btnBack').onclick  = () => { sfxPop(); go('start'); };
$('#btnAgain').onclick = () => { sfxPop(); gameOver.classList.remove('on'); enterGame(); };
$('#btnHome').onclick  = () => { sfxPop(); go('start'); };

$$('.sound-toggle').forEach(b => {
  b.onclick = () => {
    muted = !muted;
    b.textContent = muted ? '🔇' : '🔊';
    if (!muted) sfxPop();
  };
});

/* ---------------- boot ---------------- */
$('#momoKite').innerHTML = momoKiteSVG();
bestChip.textContent = 'best ' + S.best;

const hash0 = location.hash.replace('#', '');
go(hash0 === 'game' ? 'game' : 'start');

/* start camera prewarm on the start page too (nice-to-have, silent) */
if (hash0 !== 'game') initCamera(true).then(() => {
  if (cam.ok) $('#camNote .cam-dot').style.background = 'var(--green)';
});

let last = performance.now();
function loop(ts) {
  const dt = Math.min(.05, (ts - last) / 1000) || 0;
  last = ts;
  if (S.screen === 'game') {
    detectMouth(ts);
    if (cam.ok === true && !window.__faceLandmarker) {
      camStateEl.textContent = window.__faceReady === false ? 'model off' : 'loading…';
    }
  }
  gameStep(dt, ts);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
