import MetaEvent from "../components/MetaEvent";
import { getThankYouPageHtml } from "../lib/dcPage.js";

const purchaseData = { currency: "USD", value: 7.0 };

// This page needs to run per-request now (not statically generated) so it
// can read the Stripe session_id from the URL and look up the customer's
// email/billing details server-side to improve Meta's match quality.
export async function getServerSideProps({ query }) {
  const html = getThankYouPageHtml();
  const sessionId = typeof query.session_id === "string" ? query.session_id : null;

  let matchData = {};

  if (sessionId && process.env.STRIPE_SECRET) {
    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET);
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["customer_details"]
      });

      const details = session.customer_details;
      const address = details?.address;

      matchData = {
        email: details?.email || undefined,
        phone: details?.phone || undefined,
        firstName: details?.name ? details.name.split(" ")[0] : undefined,
        lastName: details?.name ? details.name.split(" ").slice(1).join(" ") : undefined,
        city: address?.city || undefined,
        state: address?.state || undefined,
        zip: address?.postal_code || undefined,
        country: address?.country || undefined,
        externalId: typeof session.customer === "string" ? session.customer : details?.email || undefined
      };
      // Strip out any undefined keys so we do not send empty fields.
      matchData = Object.fromEntries(Object.entries(matchData).filter(([, v]) => v));
    } catch (error) {
      // If Stripe lookup fails for any reason, fall back to sending the
      // Purchase event without the extra match fields rather than breaking
      // the page for the customer.
      console.error("Stripe session lookup failed:", error?.message || error);
    }
  }

  return {
    props: {
      html,
      matchData
    }
  };
}

export default function ThankYouPage({ html, matchData }) {
  return (
    <>
      <MetaEvent eventName="Purchase" customData={purchaseData} matchData={matchData} />
      <main dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
