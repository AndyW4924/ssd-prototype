# Momo — Speech Sound Practice

An interactive UI prototype for a **gamified speech sound disorder (SSD) home-practice product**, designed for a child around 3 years old. The goal: let a toddler *see* their own tongue position and self-correct, without a therapist in the room.

Built as a single-page, zero-build prototype. No framework, no dependencies, no bundler.

> Screen size: **1280 × 800** (16:10 — one notch under a MacBook Air 13"). The stage auto-scales to any window while keeping that aspect ratio.

---

## Run it

```bash
# just open the file
open index.html        # macOS
start index.html       # Windows
```

Or serve it locally:

```bash
python -m http.server 8000
# → http://localhost:8000
```

Deep links for presenting: `#gym`, `#say`, `#reward`, `#report`.

---

## The flow

| # | Screen | What happens |
|---|--------|--------------|
| 1 | **Home** | Momo greets the child, shows today's three missions and a streak badge. One big START button — no reading required beyond three words. |
| 2 | **Tongue Gym** | The core self-correction loop (see below). |
| 3 | **Say /a/** | Large mouth model to imitate, live waveform, hold-to-speak. Three attempts, star rating, feedback on tongue placement. |
| 4 | **Reward** | Balls drop into the basket, confetti, a new sticker is unlocked. |
| 5 | **Report** | Parent / SLP dashboard: practice minutes, placement accuracy, a 5-session accuracy trend, a tongue-contact map thumbnail, and an auto-generated clinical note. |

---

## Tongue Gym — the interesting part

Two panels, deliberately:

- **Left — the mouth to copy.** A big, friendly open mouth with the tongue tip touching the alveolar ridge. This is *visual perceptual cueing*: the thing a 3-year-old **can** imitate.
- **Right — the palate map.** The same movement seen from the sensor's point of view: the roof of the mouth, teeth at the top, and the child's tongue rendered as a blob that must travel into a target ring. This is the thing a child **cannot** see or feel — which is exactly what a chin-mounted ultrasound patch buys you.

Press and hold the HOLD button:

- the tongue blob travels from its resting position up to the dashed target
- the progress ring fills **only while the blob is actually inside the target**, so releasing early lets it drift back
- the coaching line updates live — "Almost — a little higher ↑" → "There! Hold it…" → "Yes! Perfect."

Three exercises in sequence: **tip up**, **back up**, and a **front-to-back sweep** (follow the moving dot).

---

## Why the design looks like this

Three findings from the research deck drove the whole thing:

1. **Immediate response is the gap.** Every competitor in the benchmark gives feedback after the session, not during it. So the coaching line, the ring, and the blob all react within a frame.
2. **Customization is the second gap.** Hence three distinct exercises with per-exercise targets and a report that attributes errors to specific placements rather than a single score.
3. **Biofeedback beats audio-only cueing.** Hence the split between "the mouth you can copy" and "the palate map you can't see" — the visual argument for why the hardware matters.

---

## Controls

- Click / tap through the flow, or
- `←` / `→` to move between screens, `1`–`5` to jump
- **Press and hold** the HOLD button in Tongue Gym, or hold `Space`
- Move the cursor around the home screen — Momo's pupils follow it

---

## What is simulated

This is a UI prototype, not a working product:

- **The sensor is faked.** Tongue position comes from the hold gesture, not from a real ultrasound patch.
- **The report data is seeded demo data**, not measured.
- **Microphone is real** on the Say screen *if* the browser grants permission; otherwise the waveform falls back to a synthetic animation.

---

## Files

```
index.html    markup for all five screens + SVG assets
style.css     design system: tokens, layout, animations
app.js        state machine, tongue-gym loop, canvas waveform, charts
```

---

## 中文说明

面向 3 岁左右儿童的**言语构音障碍（SSD）家庭训练**交互原型。核心是 "Tongue Gym"：左边是孩子**能模仿**的口腔动作，右边是孩子**看不到**的舌位传感图 —— 按住按钮，舌位光点移向目标圈，只有真正对上时进度环才增长，并实时给出"再高一点 ↑"这类提示。这正是调研里竞品的两个空白：**即时反馈**和**个性化**。

纯前端单页，无构建步骤，1280×800 自适应缩放。传感器为模拟，报告数据为演示数据。
