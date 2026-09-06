---
name: last-harvest-audio
description: >
  Last Harvest audio. Use for UI beeps, parry/dodge, laser, theme, chiptune,
  Mega Man X tone, sound test. Open last-harvest first. Slice 1 is tiny
  WebAudio beeps only. Do not block boot on samples.
---

# Last Harvest — Audio

**Open `last-harvest` then `last-harvest-makers` first.** Unlock on first **live** gesture, after `setMode`. `AudioContext` in try/catch. **S5:** never in render, never at module load, never before navigation. Slice 1 `MUTE = true`.

**Gasket is silent over ship VO** (Rend / Halle / crew). No cute chirps on top of talking heads.

**Hybrid:** beeps only. No 3D positional audio. Bay harvest swing is silent until sound test. Drop actors are 3D; audio is still 2D beeps.

## Fail

Google Fonts-style boot wait on audio. Theme at module load. Audio throw killing title buttons. `unlockAudio()` on SSR / first paint.

## Slice 1

**Mute.** Ivan 10B: no beeps until sound test. Keep `audio.ts` stubs + try/catch. One flag `MUTE = true`. Game still plays. Do not load samples.

**Exception (Ivan 2026-09-05):** `sfxScope()` — brass tick-clack on scope lock — **plays while MUTE is on**. Other beeps stay silent. Gasket still mute over ship VO.

| Event | Feel |
|-------|------|
| UI plate | short high square |
| Step | low short square |
| Hit | low saw |
| Parry (you) | bright satisfying ping |
| Dodge (you) | different ping |
| Enemy parry/dodge on you | sour / down, not the good ping |
| Charge | same as hit on crash |

Do not decode long samples at boot. Mute is allowed if context fails — game still plays.

## Later

Chiptune + EDM, Mega Man X tone. Tight club on planets, waltz on the ship. Sound test on **title** only. Laser: SNES-edged, not a Star Wars clone.

## Fail

Google Fonts-style boot wait on audio. Theme at module load. Audio throw killing title buttons.
