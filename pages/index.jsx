import Script from "next/script";
import SalesEnhancements from "./SalesEnhancements";
import { getSalesPageHtml } from "../lib/dcPage.js";

const pixelId = "1343158414610855";

export async function getStaticProps() {
  return {
    props: {
      html: getSalesPageHtml()
    }
  };
}

export default function SalesPage({ html }) {
  return (
    <>
      <MetaPixel event="PageView" />
      <main dangerouslySetInnerHTML={{ __html: html }} />
      <SalesEnhancements />
    </>
  );
}

function MetaPixel({ event }) {
  return (
    <>
      <Script id="meta-pixel-base" strategy="afterInteractive">
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
          fbq('track', '${event}');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=${event}&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
