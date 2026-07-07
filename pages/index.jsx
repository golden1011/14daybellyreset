import SalesEnhancements from "./SalesEnhancements";
import { getSalesPageHtml } from "../lib/dcPage.js";

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
      <main dangerouslySetInnerHTML={{ __html: html }} />
      <SalesEnhancements />
    </>
  );
}
