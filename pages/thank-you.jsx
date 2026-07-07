import Script from "next/script";
import { getThankYouPageHtml } from "../lib/dcPage.js";

const pixelId = "1343158414610855";

export async function getStaticProps() {
  return {
    props: {
      html: getThankYouPageHtml()
    }
  };
}

export default function ThankYouPage({ html }) {
  return (
    <>
      <MetaPixelPurchase />
      <main dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

function MetaPixelPurchase() {
  return (
    <>
      <Script id="meta-pixel-purchase" strategy="afterInteractive">
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
          fbq('track', 'Purchase', {currency: 'USD', value: 27.00});
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=Purchase&cd[currency]=USD&cd[value]=27.00&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
