import Head from "next/head";
import MetaEvent from "../components/MetaEvent";
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
      <Head>
        <title>The 14 Day Belly Reset</title>
      </Head>
      <MetaEvent eventName="PageView" />
      <main dangerouslySetInnerHTML={{ __html: html }} />
      <SalesEnhancements />
    </>
  );
}
