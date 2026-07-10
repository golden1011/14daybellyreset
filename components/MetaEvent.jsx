import { useEffect, useMemo } from "react";
import Script from "next/script";

const pixelId = "1351506237081523";

function createEventId(eventName) {
  const random = Math.random().toString(36).slice(2);
  return `${eventName.toLowerCase()}-${Date.now()}-${random}`;
}

function getCookie(name) {
  if (typeof document === "undefined") return undefined;
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return value ? decodeURIComponent(value.split("=").slice(1).join("=")) : undefined;
}

// The Meta pixel script sets the _fbp cookie itself, asynchronously, once
// fbevents.js finishes loading and fbq('init', ...) runs. If we read the
// cookie immediately on mount we can lose the race and send nothing, which
// is why fbp coverage was showing low in Events Manager. This polls briefly
// for the cookie to show up before giving up.
function waitForCookie(name, { timeoutMs = 1500, intervalMs = 100 } = {}) {
  return new Promise((resolve) => {
    const existing = getCookie(name);
    if (existing) {
      resolve(existing);
      return;
    }
    const start = Date.now();
    const timer = setInterval(() => {
      const value = getCookie(name);
      if (value || Date.now() - start > timeoutMs) {
        clearInterval(timer);
        resolve(value);
      }
    }, intervalMs);
  });
}

// If the _fbc cookie has not been set yet, but the URL has a Meta click ID
// (fbclid), build the fbc value manually in the format Meta expects:
// fb.<subdomainIndex>.<creationTime>.<fbclid>
function fbcFromUrl() {
  if (typeof window === "undefined") return undefined;
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get("fbclid");
  if (!fbclid) return undefined;
  return `fb.1.${Date.now()}.${fbclid}`;
}

export default function MetaEvent({ eventName, customData, matchData }) {
  const eventId = useMemo(() => createEventId(eventName), [eventName]);

  useEffect(() => {
    let cancelled = false;

    async function send() {
      // Give the Meta pixel script a brief window to set its cookies before
      // we read them, this fixes the low fbp/fbc capture rate.
      const [fbp, fbcFromCookie] = await Promise.all([
        waitForCookie("_fbp"),
        waitForCookie("_fbc")
      ]);
      const fbc = fbcFromCookie || fbcFromUrl();

      if (cancelled) return;

      fetch("/api/meta-conversion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          eventName,
          eventId,
          eventSourceUrl: window.location.href,
          fbp,
          fbc,
          customData,
          ...(matchData || {})
        }),
        keepalive: true
      }).catch(() => {});
    }

    send();

    return () => {
      cancelled = true;
    };
  }, [customData, eventId, eventName, matchData]);

  // Advanced Matching for the browser Pixel. Facebook's pixel script hashes
  // these client-side automatically, we pass plain values here, never
  // pre-hashed, that is what the fbevents.js library expects.
  const advancedMatching = {
    ...(matchData?.email ? { em: matchData.email } : {}),
    ...(matchData?.phone ? { ph: matchData.phone } : {}),
    ...(matchData?.firstName ? { fn: matchData.firstName } : {}),
    ...(matchData?.lastName ? { ln: matchData.lastName } : {}),
    ...(matchData?.city ? { ct: matchData.city } : {}),
    ...(matchData?.state ? { st: matchData.state } : {}),
    ...(matchData?.zip ? { zp: matchData.zip } : {}),
    ...(matchData?.country ? { country: matchData.country } : {})
  };
  const hasAdvancedMatching = Object.keys(advancedMatching).length > 0;

  return (
    <>
      <Script id={`meta-pixel-${eventName}`} strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}'${hasAdvancedMatching ? `, ${JSON.stringify(advancedMatching)}` : ""});
          fbq('track', '${eventName}', ${JSON.stringify(customData || {})}, {eventID: '${eventId}'});
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=${eventName}&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
