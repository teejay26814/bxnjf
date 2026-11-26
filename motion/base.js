// Shared animation helpers for the motion videos. Each page defines SC (scene starts),
// END, and a renderScenes(t) function; render(t) draws the hook and end card around it.
const W = 1080, H = 1920;
const $ = id => document.getElementById(id);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = p => 1 - Math.pow(1 - p, 3);
const easeInOut = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
const prog = (t, s, d) => clamp((t - s) / d);
const lerp = (a, b, p) => a + (b - a) * p;

// Word reveal: blur + rise + fade (smooth, no bounce, per the brand's motion guidance).
function blurIn(el, t, s, d = .55, dist = 46) {
  const e = easeOut(prog(t, s, d));
  el.style.opacity = e;
  el.style.filter = `blur(${(1 - e) * 22}px)`;
  el.style.transform = `translateY(${(1 - e) * dist}px)`;
}
// Scene wipe: the next scene slides up from the bottom.
function wipe(el, t, s, d = .6) {
  el.style.display = t < s ? 'none' : 'block';
  el.style.transform = `translateY(${(1 - easeInOut(prog(t, s, d))) * H}px)`;
}
function rule(el, t, s) { el.style.transform = `scaleX(${easeOut(prog(t, s, .7))})`; }
function chevs(ids, t, s) {
  ids.forEach((id, i) => {
    const p = easeOut(prog(t, s + i * .15, .45)), el = $(id);
    el.style.opacity = p;
    el.style.transform = `translateX(${(1 - p) * -60}px) rotate(45deg)`;
  });
}
function corner(id, t, s) { $(id).style.transform = `scale(${easeOut(prog(t, s, .9))})`; }
// Standard scene life: wipe in at its start, hide once the next one has covered it.
function scene(id, t, start, next) {
  wipe($(id), t, start);
  if (next !== undefined && t >= next + .7) $(id).style.display = 'none';
}

// Hook: "Did you know?" box, a mint dot drops onto it, then the box fills the frame.
function renderHook(t, next) {
  $('A').style.display = t < next + .1 ? 'block' : 'none';
  const boxW = 820, boxH = 430, bx = (W - boxW) / 2, by = 730;
  const pin = easeOut(prog(t, 0, .55)), grow = easeInOut(prog(t, 2.05, .55));
  const box = $('A_box');
  box.style.left = lerp(bx, 0, grow) + 'px'; box.style.top = lerp(by, 0, grow) + 'px';
  box.style.width = lerp(boxW, W, grow) + 'px'; box.style.height = lerp(boxH, H, grow) + 'px';
  box.style.borderRadius = lerp(6, 0, grow) + 'px';
  box.style.opacity = pin;
  box.style.transform = `scale(${grow > 0 ? 1 : lerp(.86, 1, pin)})`;
  const tx = $('A_text'), tIn = easeOut(prog(t, .25, .5));
  tx.style.opacity = tIn * (1 - easeOut(prog(t, 2.05, .35)));
  tx.style.filter = `blur(${(1 - tIn) * 18}px)`;
  tx.style.transform = `scale(${lerp(.9, 1, tIn) * lerp(1, 2.6, grow)})`;
  const dot = $('A_dot'), drop = easeOut(prog(t, .55, .6));
  dot.style.left = (bx + boxW - 60) + 'px';
  dot.style.top = lerp(-120, by - 46, drop) + 'px';
  dot.style.opacity = (t < .55 ? 0 : 1) * (1 - prog(t, 2.0, .2));
  $('A_logo').style.opacity = 1 - prog(t, 2.05, .3);
}

// End card: logo, "Follow for more.", tagline, chevrons.
function renderEnd(t, start) {
  wipe($('Z'), t, start);
  const f0 = start + .45;
  blurIn($('Z_logo'), t, f0, .6, 24);
  blurIn($('Z1'), t, f0 + .55); blurIn($('Z2'), t, f0 + .8);
  blurIn($('Z3'), t, f0 + 1.25);
  chevs(['Z_c1', 'Z_c2', 'Z_c3'], t, f0 + 1.4);
}

const HOOK_HTML = `
<div class="scene light" id="A">
  <img class="logo" src="img/logo-forest.png" id="A_logo">
  <div class="abs" id="A_box" style="background:var(--forest-700)"></div>
  <div class="abs" id="A_text" style="left:0;right:0;top:770px;text-align:center;color:var(--offwhite-100)">
    <span class="w bd" style="font-size:156px;line-height:1.02">Did you</span>
    <span class="w bd" style="font-size:156px;line-height:1.02">know?</span>
  </div>
  <div class="abs" id="A_dot" style="width:76px;height:76px;border-radius:50%;background:var(--mint-400)"></div>
</div>`;
const END_HTML = tagline => `
<div class="scene light" id="Z">
  <div class="abs" id="Z_logo" style="left:190px;right:190px;top:560px"><img src="img/logo-forest.png" style="width:100%"></div>
  <div class="abs" style="left:0;right:0;top:860px;text-align:center">
    <span class="w bd" id="Z1" style="font-size:150px;line-height:1.02;color:var(--forest-700)">Follow</span>
    <span class="w bd" id="Z2" style="font-size:150px;line-height:1.02;color:var(--forest-700)">for more.</span>
    <span class="w it" id="Z3" style="font-size:54px;margin-top:40px;color:var(--charcoal-500)">${tagline}</span>
  </div>
  <div class="abs" style="left:0;right:0;top:1500px;display:flex;justify-content:center;gap:30px">
    <div class="chev" id="Z_c1"></div><div class="chev" id="Z_c2"></div><div class="chev" id="Z_c3"></div>
  </div>
</div>`;
