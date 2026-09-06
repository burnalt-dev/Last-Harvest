# Frozen ids — do not renumber

| Kind | Pattern | Next free |
|------|---------|-----------|
| Parts | `p###` | **p021** |
| Gasket cores | `g###` | **g001** (slice 1 uses unnamed default sprite, not an id yet) |
| Items | `i###` | i001 |
| Resources | `r###` | **r005** (Veldt); see `last-harvest-items` |
| Skillgrams | `sg###` | **sg014** (slice 1: sg001 sg002). Player: Programs |

## Slice 1 parts in vault

| Id | Slot | Files |
|----|------|-------|
| p000 | body | `solace/b1/p000_body_idle_{s,e,n,w}.png` + b3 |
| p001 | head | idle + idle2 |
| p002 | legs piston | idle + idle2 |
| p005 | armR | idle |
| p006 | armL | idle |
| p011 | body B | grey haul wide |
| p012 | head B | taller slit |
| p013 | legs B | thick pistons |
| p014 | arms crane | grey slice 1 |
| p015 | head A | bucket visor |
| p016 | body A | current pack |
| p017 | legs plow | grey stock, live Mech Test |
| p003 | hover | reserved, no B1 yet |
| p004 | reverse-joint | reserved |
| p007–p010 | blade/scythe/cannon | 4-dir isolated B1; pack `pack-hd-seat.py` |

## Slice 1 other

| Id | What |
|----|------|
| sg001 | Nanobot (player Program) |
| sg002 | Charge |
| r001 | Ironwood Splinter |
| r004 | Bloom-ore (why Veldt-9; flavor stub) |
