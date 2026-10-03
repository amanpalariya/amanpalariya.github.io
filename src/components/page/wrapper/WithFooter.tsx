"use client";

import { useState } from "react";
import Footer from "../common/Footer";
import { RightSidebarTarget } from "./RightSidebarSlot";

export default function WithFooter({
  children,
  hideFooterBottomPart = false,
  rightSidebarContent,
}: {
  children: React.ReactNode;
  hideFooterBottomPart?: boolean;
  rightSidebarContent?: React.ReactNode;
}) {
  const [sidebarTarget, setSidebarTarget] = useState<HTMLDivElement | null>(
    null,
  );

  return (
    <RightSidebarTarget.Provider value={sidebarTarget}>
      <div className="site-content-layout">
        <div className="site-primary-content">{children}</div>
        <aside
          className="site-right-sidebar"
          aria-label="Additional information"
        >
          {rightSidebarContent}
          <div className="site-sidebar-slot" ref={setSidebarTarget} />
          <Footer hideBottomPart={hideFooterBottomPart} />
        </aside>
      </div>
    </RightSidebarTarget.Provider>
  );
}
