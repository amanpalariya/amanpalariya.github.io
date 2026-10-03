"use client";

import type { ExternalLink } from "data/external-links";
import { DetailExternalLinks } from "@components/page/common/DetailPage";
import { RightSidebarSlot } from "@components/page/wrapper/RightSidebarSlot";
import "./detail-sidebar.css";

export default function DetailSidebar({ links = [] }: { links?: ExternalLink[] }) {
  if (!links.length) return null;
  return (
    <>
      <RightSidebarSlot>
        <section className="detail-desktop-extras" aria-label="Related links">
          <h2>Related links</h2>
          <DetailExternalLinks links={links} />
        </section>
      </RightSidebarSlot>
      <div className="detail-mobile-links">
        <DetailExternalLinks links={links} />
      </div>
    </>
  );
}
