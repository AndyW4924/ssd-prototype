# Momo's Kite — fly with your mouth

An interactive UI prototype for a **gamified speech sound disorder (SSD) home-practice product**, aimed at a child around 3 years old.

Two pages, one game. The child holds a kite with Momo, and **flies it with their mouth**: open your mouth and the kite climbs, close it and the kite drifts down. The camera watches the mouth — no hands, no controller, no reading.

> Screen size: **1280 × 800** (16:10 — one notch under a MacBook Air 13"). The stage auto-scales to any window while keeping that ratio.

---

## Run it

```bash
# just open the file
open index.html        # macOS
start index.html       # Windows
```

Or serve it locally (needed on some browsers for camera access):

```bash
python -m http.server 8000
# → http://localhost:8000
```

Camera permission is requested when you press START. **Nothing is recorded or uploaded** — frames are processed in the page and thrown away.

---

## The two pages

**1 · Start** — Momo stands on the left holding a wooden **handwheel (手摇轮)** with the kite string tied to its rim; the wheel turns slowly while the kite sways. On the right: what the game is, the two rules (open = up, close = down), what you dodge, and one big START button. The camera warms up in the background so the countdown feels instant.

**2 · Game** — a sky with **two tracks**. The kite takes off to the right and settles into its lane. Three kinds of obstacle scroll in — **clouds**, **balloons** (slow, bobbing, four colours) and **little birds** (faster, flapping) — and one in your lane costs a heart; three hearts ends the run. Momo stands at the bottom-left **cranking the handwheel**: mouth open → kite climbs → the wheel spins out line; mouth shut → kite sinks → the wheel winds it back in. He also mirrors the player: his mouth opens when yours does, he shakes when the kite is hit, he bounces when an obstacle is cleared.

---

## One run ≈ 60 seconds

The run is a single **60-second flight** with a visible goal, so the child knows there is an end and does not have to be interrupted:

| Leg | Clock | What happens |
|---|---|---|
| **Meadow** | 60 → 40 s | Slow obstacles, room to get the cause–effect |
| **Cloud canyon** | 40 → 20 s | Denser spawns, balloons mixed in |
| **Rainbow gate** | 20 → 0 s | Fastest stretch; the last 4 s stay clear so the finish is always reachable |

A **flight rail** in the HUD carries a tiny kite marker from the hearts to a finish flag, and the countdown chip turns pink and pulses in the last 10 seconds. Each leg change is announced with a toast + chime, so the run has three small "chapters" instead of one long stretch of dodging.

**Two endings, one card:**

- **Out of hearts** → *Ouch!* — obstacles dodged, plus "you flew 18s of 60s" so the child sees how far they got, best score, fly again.
- **60 s survived** → the kite sails up into a **rainbow**, the sky clears, Momo hops, confetti, then a *You made it!* card with **1–3 stars** (finish = 1, end with ≥2 hearts = 2, end with all 3 hearts **and** ≥20 dodged = 3), the score, and the best score.

---

## How the mouth is detected

- `getUserMedia` → `<video>` (mirrored, shown in the HUD bubble so the player can see they're tracked).
- **MediaPipe FaceLandmarker** (face mesh, 478 landmarks) runs on the video at ~16 fps.
- Openness = distance between the inner lips (landmarks **13** and **14**), normalised by face height (landmarks **10** → **152**). That makes it independent of how far the child sits from the lens.
- Two thresholds with hysteresis — open above `0.055`, closed below `0.038` — so a wobbly toddler mouth doesn't flicker between lanes.
- **Fallbacks:** hold `Space`, or press and hold anywhere in the field. Used automatically when the camera is denied, there's no camera, or the model can't load.

---

## Controls

| Input | Effect |
|---|---|
| Open mouth | kite flies up to the top track; the handwheel unwinds |
| Close mouth | kite drifts down to the bottom track; the wheel winds in |
| `Space` (hold) | same as opening the mouth, if there's no camera |
| Press & hold the field | touch equivalent |
| ← / START / Fly again | navigate |

Debug/demo URLs: `?nointro` skips the countdown, `#game` deep-links straight into a run, `?run=15` shortens the flight (10–180 s) so you can see the ending without waiting a minute.
---

## Why the design looks like this

- **The mouth is the controller.** For a 3-year-old, tapping a screen is a fine-motor task; opening the mouth is the thing being trained. The game mechanic *is* the exercise.
- **Two lanes, not free flight.** A binary choice (open / shut) maps 1:1 onto the two tracks, so the child always knows what their mouth did — no ambiguous middle state to fail at.
- **Momo mirrors the player.** Imitation is the strongest prompt at this age: the child sees a mouth doing what theirs should do, at the exact moment they do it. That is the "immediate response" the research deck found missing in every competitor.
- **The handwheel is a physical metaphor.** A kite is not flown by leaning; it is wound in and out. Tying the up/down input to the wheel's rotation gives the child a second, mechanical read-out of what their mouth just did — and it makes the kite string something you can *see* being paid out.
- **Three obstacle types, one rule.** Clouds are slow, balloons bob, birds flutter — different silhouettes to keep attention, but all obey "wrong track = lose a heart", so the rule never changes on the child.
- **A one-minute run with a visible finish.** Attention at three lasts about a minute, and a session that just gets faster until you crash teaches nothing. Sixty seconds, three named legs and a rainbow to land in give the child a goal they can hold in their head — and give the parent a natural place to stop and praise.
- **Stars, not a leaderboard.** The reward is a small, legible 1–3 star verdict tied to *how cleanly* they flew (hearts left, obstacles dodged), not a number that invites comparison with siblings.
- **The HUD shows the camera.** Children (and parents) need proof the machine is watching, otherwise the cause–effect link breaks.

---

## What is simulated

This is a UI prototype, not a shipping product:

- Confidence in a pass is not measured — the score is simply obstacles cleared.
- Difficulty ramps with flight progress, not with performance: speed 250 → 390 px/s, spawn gap 1.55 s → 1.0 s, and the last 4 s spawn nothing. Tuned by hand, not by the child's data.
- Obstacle mix is a fixed weighting (45% cloud / 29% balloon / 26% bird), not adapted to performance.
- No accounts, no storage beyond the local best score, no therapist view.

---

## Files

```
index.html    both pages + all SVG art + the face-landmarker module loader
style.css     design tokens, layout, animations
app.js        state, game loop, mouth detection glue, string physics
```

---

## 中文说明

面向 3 岁左右儿童的**言语构音障碍（SSD）家庭训练**交互原型，两个页面：起始页（Momo 手摇放风筝 + START）与游戏页。

玩法：风筝沿两条轨道向右飞，**云朵、气球、小鸟**三种障碍物迎面而来。**张嘴 → 风筝上升（摇轮放线），闭嘴 → 风筝下降（摇轮收线）**，靠摄像头识别嘴部开合（MediaPipe FaceLandmarker，用内唇间距除以脸高做归一化，避免受距离影响）。三条命，撞到障碍扣心。Momo 在左下角握着**手摇轮**，轮子随风筝升降转动，并同步模仿玩家的嘴型、被撞时晃动、过关时弹跳。

**一局的时长约 1 分钟**：顶部有一条从爱心通向终点旗的**飞行进度条**，小风筝标记随倒计时前进；全程分三段（草地 60–40s / 云峡谷 40–20s / 彩虹门 20–0s），换段时弹提示并配音效，最后 10 秒计时器变粉并跳动。

**两种结尾**：三条命用完 → “Ouch!” 卡片，显示躲过多少、飞了 18s / 60s，可再来一次；坚持满 60 秒 → 风筝飞向彩虹、云层散去、Momo 欢呼撒彩带，弹出“Perfect flight!”结算卡，给出 **1–3 颗星**（飞完 1 星，剩余 ≥2 心 2 星，满心且躲过 ≥20 个 3 星）、得分与最佳成绩。

无摄像头或模型加载失败时自动退化为按住空格/按住画面。纯前端单页，无构建步骤，1280×800 自适应缩放。
