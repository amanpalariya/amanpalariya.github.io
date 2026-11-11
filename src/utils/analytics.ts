export const measurementId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";

export const analyticsEnabled =
  process.env.NODE_ENV === "production" && /^G-[A-Z0-9]+$/.test(measurementId);

type AnalyticsEvent = "copy_email";

export function trackEvent(event: AnalyticsEvent) {
  if (!analyticsEnabled || typeof window === "undefined") return;

  const analytics = window as Window & {
    gtag?: (
      command: "event",
      name: AnalyticsEvent,
      parameters: { send_to: string },
    ) => void;
  };
  analytics.gtag?.("event", event, { send_to: measurementId });
}
