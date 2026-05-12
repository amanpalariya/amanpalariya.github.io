import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import type { UiNotification } from "../types";

type NotificationType = UiNotification["type"];

export function useEpubNotifications() {
  const [notifications, setNotifications] = useState<UiNotification[]>([]);
  const dismissalTimerRefs = useRef<number[]>([]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  const notify = useCallback(
    (
      type: NotificationType,
      title: string,
      description?: ReactNode,
      durationMs = 4500,
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setNotifications((prev) => [...prev, { id, type, title, description }]);
      if (durationMs > 0) {
        const timer = window.setTimeout(() => {
          dismissNotification(id);
          dismissalTimerRefs.current = dismissalTimerRefs.current.filter(
            (entry) => entry !== timer,
          );
        }, durationMs);
        dismissalTimerRefs.current.push(timer);
      }
    },
    [dismissNotification],
  );

  useEffect(() => {
    return () => {
      for (const timer of dismissalTimerRefs.current) {
        window.clearTimeout(timer);
      }
      dismissalTimerRefs.current = [];
    };
  }, []);

  return {
    notifications,
    dismissNotification,
    notify,
  };
}
