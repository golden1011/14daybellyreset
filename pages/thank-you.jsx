import { getThankYouPageHtml } from "../lib/dcPage.js";

export async function getStaticProps() {
  return {
    props: {
      html: getThankYouPageHtml()
    }
  };
}

export default function ThankYouPage({ html }) {
  return <main dangerouslySetInnerHTML={{ __html: html }} />;
}
