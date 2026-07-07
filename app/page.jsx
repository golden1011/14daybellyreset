import SalesEnhancements from "./SalesEnhancements";
import { getSalesPageHtml } from "../lib/dcPage.js";

export default function SalesPage() {
  return (
    <>
      <main dangerouslySetInnerHTML={{ __html: getSalesPageHtml() }} />
      <SalesEnhancements />
    </>
  );
}

