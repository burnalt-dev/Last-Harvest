# Joints = sockets (no extra skill)

**solace-mech-parts** owns how pieces meet. Do **not** mint a joint skill.

| Joint | Socket | Parent → child |
|-------|--------|----------------|
| neck | `neck` | body → head |
| shoulders | `shoulderL` / `shoulderR` | body → arms (one mesh, runtime mirror) |
| hip | `hip` | body → **legs pair** (one blit) |
| hip holes | `hipL` / `hipR` | **body authoring only** — piston tops of p017. Not separate leg parts |

**S53:** Body accommodates the gold pair. Never split grey legs. Never move hip to fit a chest.
| wrists | `handL` / `handR` | arms → weapon+grip |
| pack ride | `companion_mount` | body → Gasket |

`foot_line_y` **352** is the sole plant (piston / RJ). Hover uses `hover_plane_y`. **S52:** hip + sole are locked from **p017 plow gold**. New legs clip to `{dir}_legs.png` occupancy and hit `sockets_by_dir[dir].hip`. Do not move hip to make a taller part fit.

Packer **stamps the isolate so its join hits that point**. Runtime `compose.ts` then blits seated 384 cells at 0,0 (already jointed). If a bay looks like floating bricks, the packer missed the socket — fix stamp, don’t add a skill.

Isolates must be drawn on `solace-mech-look/assets/joint-template-s.png` (south). Overlap is required. One teaching sheet for slots, one for joints — not a sheet per part.
