import MetaEvent from "../components/MetaEvent";
import { getThankYouPageHtml } from "../lib/dcPage.js";

const purchaseData = { currency: "USD", value: 27.0 };

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
      <MetaEvent eventName="Purchase" customData={purchaseData} />
      <main dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
