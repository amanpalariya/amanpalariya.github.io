"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

const BackNavigation = createContext<((fallback: string) => void) | null>(null);

export function DetailBackNavigation({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const lastPath = useRef(pathname);
  const hasInternalHistory = useRef(false);

  useEffect(() => {
    if (lastPath.current !== pathname) {
      hasInternalHistory.current = true;
      lastPath.current = pathname;
    }
  }, [pathname]);

  function goBack(fallback: string) {
    const referrer = document.referrer;
    const arrivedFromSite =
      referrer && new URL(referrer).origin === window.location.origin;
    if (
      window.history.length > 1 &&
      (hasInternalHistory.current || arrivedFromSite)
    ) {
      router.back();
    } else {
      router.push(fallback);
    }
  }

  return (
    <BackNavigation.Provider value={goBack}>{children}</BackNavigation.Provider>
  );
}

export function useDetailBackNavigation() {
  return useContext(BackNavigation);
}
