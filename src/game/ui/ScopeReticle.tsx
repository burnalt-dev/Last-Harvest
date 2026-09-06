"use client";

/** Edge sniper frame. DOM chrome — not WebGL, not FPS. */
export function ScopeReticle() {
  return (
    <div className="scope-reticle" aria-hidden>
      <div className="scope-vignette" />
      <span className="scope-arm h tl-h" />
      <span className="scope-arm v tl-v" />
      <span className="scope-arm h tr-h" />
      <span className="scope-arm v tr-v" />
      <span className="scope-arm h bl-h" />
      <span className="scope-arm v bl-v" />
      <span className="scope-arm h br-h" />
      <span className="scope-arm v br-v" />
      <span className="scope-arm mid-n" />
      <span className="scope-arm mid-e" />
      <span className="scope-arm mid-s" />
      <span className="scope-arm mid-w" />
      <span className="scope-pip" />
    </div>
  );
}
