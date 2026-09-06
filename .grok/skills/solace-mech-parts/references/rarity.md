# Rarity tiers

Five tiers. Same sockets, same part-id rules. Silhouette and tech language change with tier.

| Tier | Color | How you get it | Look |
|------|-------|----------------|------|
| grey | starter junk | first crate / scrap | **Default.** Boxiest Labor crate. Bent plates, rust pits. Piston legs only. No hover. Current `p000–p010`. |
| white | common | store / paid upgrade | Cleaner factory crate. Same boxy sockets, less tape/rust. Not a grey recolor — slightly tighter panels. |
| blue | uncommon craft | resources, often biome-tagged | Less crate, more machine. Beveled plates, exposed actuators, slimmer waist. May borrow a biome material (ice, slag, canopy, salt). Still a labor walker, not fashion mecha. |
| purple | rare craft | harder resources, unique kit | Armored Core lean. Asymmetric hardpoints, distinctive generator/head, reverse-joint or booster legs, one signature weapon. Mixable but each part is recognizable alone. |
| gold | legendary | rarest, best-in-slot, few in the game | Stands out at thumbnail size. One bold silhouette idea per part. High-tech industrial, not jewelry. Cyan can go brighter; gold paint is accent, not chrome candy. Least used. |

Grey and white stay boxy on purpose. Blue starts the taper. Purple and gold may drop the cube torso as long as neck / shoulder / hip / wrist sockets still hit.

Hover skirt legs start at **blue**. No grey hover. No white store hover. First hover is `p003` (blue craft). Purple/gold may have later hover variants.

Do not jump a grey part to gold by recoloring. Recolor is paint. Tier is mesh.

## Example parts (proposals, assign ids when authored)

Grey — junk yard

- head rust-bucket slit
- body dented crate
- legs seized pistons
- armL scrap door
- chainsaw scrap bar

White — store / paid (not authored yet)

- Cleaner crate; new meshes, same sockets. Not a grey recolor.

Blue — craft / biome (refs later)

- head sensor-ridge (wider visor, side cameras)
- body beveled hauler
- legs hover-skirt (no feet) or clean pistons
- cannon with heat sleeve
- shield with viewport glass
- chainsaw with hot / biome teeth (not a grey recolor)

Purple — unique

- head mono-optic stalk
- body sloped AC core with visible reactor vents
- reverse-joint leap legs
- pile-bunker integrated armR
- scythe with folded emitter, not a farm tool

Gold — legendary BIS

- head crown-visor (still one cyan bar, heavier brow)
- body rare core, tall and tapered
- legendary hover-skirt or reverse-joint leap (2-tile jump)
- signature weapon only that gold part uses (do not clone onto white)
- laser or glass-ceramic chainsaw, photon tooth line, still one-hand on handR

When generating a tier preview, say the tier in the spec card and keep sockets mixable with `p000` body unless the user asked for a full matching kit.