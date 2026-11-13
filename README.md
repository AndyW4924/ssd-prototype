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

**1 · Start** — Momo holds the kite on the left, string in hand. On the right: what the game is, the two rules (open = up, close = down), three lives, and one big START button. The camera warms up in the background so the countdown feels instant.

**2 · Game** — a sky with **two tracks**. The kite takes off to the right and settles into its lane. Clouds scroll in as obstacles; a cloud in your lane costs a heart, three hearts ends the run. Momo stands at the bottom-left holding the string the whole time, and mirrors the player: his mouth opens when yours does, he shakes when the kite is hit, he bounces when a cloud is cleared.

End of run → clouds dodged, best score (`localStorage`), fly again or go home.

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
| Open mouth | kite flies up to the top track |
| Close mouth | kite drifts down to the bottom track |
| `Space` (hold) | same as opening the mouth, if there's no camera |
| Press & hold the field | touch equivalent |
| ← / START / Fly again | navigate |

Debug/demo URLs: `?nointro` skips the countdown, `#game` deep-links straight into a run.

---

## Why the design looks like this

- **The mouth is the controller.** For a 3-year-old, tapping a screen is a fine-motor task; opening the mouth is the thing being trained. The game mechanic *is* the exercise.
- **Two lanes, not free flight.** A binary choice (open / shut) maps 1:1 onto the two tracks, so the child always knows what their mouth did — no ambiguous middle state to fail at.
- **Momo mirrors the player.** Imitation is the strongest prompt at this age: the child sees a mouth doing what theirs should do, at the exact moment they do it. That is the "immediate response" the research deck found missing in every competitor.
- **The HUD shows the camera.** Children (and parents) need proof the machine is watching, otherwise the cause–effect link breaks.

---

## What is simulated

This is a UI prototype, not a shipping product:

- Confidence in a cloud pass is not measured — the score is simply clouds cleared.
- Difficulty ramps with score (speed 250 → 460 px/s); it is tuned by hand, not by the child's data.
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

面向 3 岁左右儿童的**言语构音障碍（SSD）家庭训练**交互原型，两个页面：起始页（Momo 牵着风筝 + START）与游戏页。

玩法：风筝沿两条轨道向右飞，云朵作为障碍物迎面而来。**张嘴 → 风筝上升，闭嘴 → 风筝下降**，靠摄像头识别嘴部开合（MediaPipe FaceLandmarker，用内唇间距除以脸高做归一化，避免受距离影响）。三条命，撞云扣心。Momo 在左下角牵着线，并同步模仿玩家的嘴型、被撞时晃动、过关时弹跳。

无摄像头或模型加载失败时自动退化为按住空格/按住画面。纯前端单页，无构建步骤，1280×800 自适应缩放。
