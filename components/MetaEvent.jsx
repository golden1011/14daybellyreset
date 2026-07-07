import { useEffect, useMemo } from "react";
import Script from "next/script";

const pixelId = "1343158414610855";

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

export default function MetaEvent({ eventName, customData }) {
  const eventId = useMemo(() => createEventId(eventName), [eventName]);

  useEffect(() => {
    fetch("/api/meta-conversion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        eventName,
        eventId,
        eventSourceUrl: window.location.href,
        fbp: getCookie("_fbp"),
        fbc: getCookie("_fbc"),
        customData
      }),
      keepalive: true
    }).catch(() => {});
  }, [customData, eventId, eventName]);

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
          fbq('init', '${pixelId}');
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
