import Script from "next/script";

export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";
  if (process.env.NODE_ENV !== "production" || !/^G-[A-Z0-9]+$/.test(measurementId)) {
    return null;
  }

  return (
    <>
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag() { window.dataLayer.push(arguments); }
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            allow_google_signals: false,
            allow_ad_personalization_signals: false
          });
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
    </>
  );
}
