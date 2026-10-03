"use client";

import { createContext, useContext, type ReactNode } from "react";
import { createPortal } from "react-dom";

export const RightSidebarTarget = createContext<HTMLElement | null>(null);

/** Page-specific content is inserted above the shared sidebar footer. */
export function RightSidebarSlot({ children }: { children: ReactNode }) {
  const target = useContext(RightSidebarTarget);
  return target ? createPortal(children, target) : null;
}
