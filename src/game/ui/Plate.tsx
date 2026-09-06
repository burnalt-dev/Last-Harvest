"use client";

import { useRef, type ReactNode } from "react";

/** last-harvest-shell — only chrome button. Never SSR a copy of this. */
export function Plate({
  children,
  onClick,
  className = "",
  qa,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  qa?: string;
  disabled?: boolean;
}) {
  const lock = useRef(false);
  const go = (e?: { preventDefault?: () => void; stopPropagation?: () => void }) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (disabled || lock.current) return;
    lock.current = true;
    window.setTimeout(() => {
      lock.current = false;
    }, 240);
    try {
      onClick?.();
    } catch (err) {
      console.error("plate", err);
    }
  };
  return (
    <button
      type="button"
      data-qa={qa}
      disabled={disabled}
      onPointerUp={(e) => go(e)}
      onClick={(e) => go(e)}
      className={`plate plate-press relative z-[80] px-4 py-3 text-left text-fg ${className}`}
    >
      {children}
    </button>
  );
}
