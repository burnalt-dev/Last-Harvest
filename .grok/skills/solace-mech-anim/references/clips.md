# 3D clip cards

Ticks 60 Hz. Change numbers here **and** in `kit.ts` the same turn.

## harvest (live)

```
CLIP: harvest
WEAPON: scythe (kit.weapon === 0)
DUR: 920 ms
KEYS:
  FRONT = −π/2 (blade sweeps +Z, the rank in front)
  0.00–0.16  wind   yaw FRONT+0.62  small lunge
  0.16–0.58  cut    yaw FRONT+0.62 → FRONT−0.62  lunge peak ~0.18 — on the three tiles at his feet, not past them
  0.58–1.00  recover to idle
HANDS: reach() every tick. Do not re-pose off the pole.
TRAIL: unchanged — blade copies on the forward cut only. QA = that trail should travel the three tiles in front. Do not retarget the VFX.
3-WIDE: dungeon Attack (wide 3). Not the VFX.
```

Idle sit after recover = `solace-gold` farmer hold.

## idle (live)

```
CLIP: idle
DUR: 1600 ms loop
KEYS:
  sine settle — hull/head/swingRig drop into pistons (~1 cm local)
  visor slit pulse on the peak
  fists stay on snath (reach every tick)
  piston: feet planted (do not lift legs.position)
  rj: tiny hip rock only
MUST NOT: occupancy change, socket pop, harvest keys
```

## walk / glide / jump

Not authored. Do not fake them with harvest.
