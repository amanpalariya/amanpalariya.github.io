"use client";
import {
  FiHome,
  FiUser,
  FiCode,
  FiFileText,
  FiEdit3,
  FiTool,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { usePathname } from "next/navigation";
import { homepageTabs } from "app/route-info";
import NextLink from "next/link";
import PageNavigation from "./PageNavigation";
import { useFeatureFlag } from "utils/features";
import FeatureFlagsData from "data/features";
import { useEffect, useRef, useState } from "react";

export const HEADER_OFFSET_HEIGHT = { base: 20, sm: 24 };
const navIcons = {
  Home: FiHome,
  About: FiUser,
  Projects: FiCode,
  CV: FiFileText,
  Blogs: FiEdit3,
  Tools: FiTool,
};
export default function Header() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const [blogsEnabled] = useFeatureFlag(FeatureFlagsData.featuresIds.BLOGS);
  const items = Object.values(homepageTabs).filter(
    (tab) => tab !== homepageTabs.blogs || blogsEnabled,
  );
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !headerRef.current?.contains(event.target)
      )
        setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return (
    <header className="site-header" ref={headerRef}>
      <div className="site-identity">
        <NextLink href="/" aria-label="ap. — Aman Palariya home">
          <span className="site-monogram">
            ap<span>.</span>
          </span>
        </NextLink>
      </div>
      <PageNavigation mobile />
      <nav
        id="site-navigation"
        className={`site-navigation${open ? " is-open" : ""}`}
        aria-label={open ? "Mobile navigation menu" : "Primary navigation"}
      >
        {items.map((tab) => {
          const active =
            tab.pathname === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.pathname.replace(/\/$/, ""));
          const NavIcon = navIcons[tab.name as keyof typeof navIcons];
          return (
            <NextLink
              key={tab.pathname}
              href={tab.pathname}
              aria-current={active ? "page" : undefined}
              aria-label={tab.name}
              title={tab.name}
              onClick={() => setOpen(false)}
            >
              <NavIcon aria-hidden="true" />
              <span className="site-nav-label">{tab.name}</span>
            </NextLink>
          );
        })}
      </nav>
      <div className="site-header-actions">
        <button
          ref={menuRef}
          className="site-menu-trigger"
          aria-label={
            open
              ? "Close mobile navigation menu"
              : "Open mobile navigation menu"
          }
          aria-expanded={open}
          aria-controls="site-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </header>
  );
}
