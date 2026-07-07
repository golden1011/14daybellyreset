import { getThankYouPageHtml } from "../../lib/dcPage.js";

export const metadata = {
  title: "Payment Confirmed | The 14-Day Belly Reset"
};

export default function ThankYouPage() {
  return <main dangerouslySetInnerHTML={{ __html: getThankYouPageHtml() }} />;
}

