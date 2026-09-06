#!/bin/bash
# Stamp files that keep getting overwritten. Run after editing any of them.
# Restore: newest hot/ first for these paths, else full boot stamp.
set -euo pipefail
ROOT=/workspace
DEST_ROOT=$ROOT/backups/last-harvest/hot
stamp=$(date -u +%Y%m%dT%H%M%SZ)
DEST=$DEST_ROOT/$stamp
mkdir -p "$DEST/game/solace" "$DEST/game/solace3d" "$DEST/parts"
copy() {
  local src=$1 dst=$2
  if [[ -f $src ]]; then
    mkdir -p "$(dirname "$dst")"
    cp -a "$src" "$dst"
  fi
}
copy $ROOT/src/game/sim.ts            $DEST/game/sim.ts
copy $ROOT/src/game/LastHarvest.tsx   $DEST/game/LastHarvest.tsx
copy $ROOT/src/game/play.ts           $DEST/game/play.ts
copy $ROOT/src/game/parts.ts          $DEST/game/parts.ts
copy $ROOT/src/game/pilot.ts          $DEST/game/pilot.ts
copy $ROOT/src/game/save.ts           $DEST/game/save.ts
copy $ROOT/src/game/skillgrams.ts     $DEST/game/skillgrams.ts
copy $ROOT/src/game/items.ts          $DEST/game/items.ts
copy $ROOT/src/game/solace/compose.ts $DEST/game/solace/compose.ts
if [[ -d $ROOT/src/game/solace3d ]]; then
  cp -a $ROOT/src/game/solace3d/. $DEST/game/solace3d/
fi
KIT=$ROOT/src/game/solace3d/kit.ts
BAK=$ROOT/.grok/skills/solace-rig/assets/kit.ts.bak
if [[ -f $KIT ]]; then
  lines=$(wc -l < "$KIT")
  if [[ $lines -ge 200 ]]; then
    mkdir -p "$(dirname "$BAK")"
    cp -a "$KIT" "$BAK"
  elif [[ -f $BAK ]]; then
    echo "hot-vault RESTORE kit.ts from solace-rig bak ($lines lines looked wiped)" >&2
    cp -a "$BAK" "$KIT"
    cp -a "$BAK" "$DEST/game/solace3d/kit.ts"
  else
    echo "hot-vault SKIP kit.bak ($lines lines, no bak yet)" >&2
  fi
fi
if [[ -d $ROOT/public/game/parts ]]; then
  cp -a $ROOT/public/game/parts/. $DEST/parts/
fi
ln -sfn "$stamp" "$DEST_ROOT/latest"
echo "hot-vault $stamp"
