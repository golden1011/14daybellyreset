# The 14-Day Belly Reset

Next.js conversion of the original Design Canvas sales page and thank-you page.

## Routes

- `/` - Belly Reset sales page
- `/thank-you` - purchase confirmation page

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm start
```

## Vercel

Push this folder to GitHub, import the repository in Vercel, and keep the default Next.js settings. Vercel will run `npm install` and `npm run build` automatically.

## Meta Conversions API

Set these environment variables in Vercel:

- `META_ACCESS_TOKEN` - required server-side Conversions API access token from Meta Events Manager.
- `META_PIXEL_ID` - optional; defaults to `1351506237081523`.
- `META_GRAPH_VERSION` - optional; defaults to `v21.0`.
- `META_TEST_EVENT_CODE` - optional; use only while testing in Meta Events Manager.

The sales page sends `PageView`. CTA clicks send `AddToCart`. The thank-you page sends `Purchase` with `currency: USD` and `value: 7.00`. Browser Pixel and Conversions API use the same `event_id` for deduplication.

Conversions API match fields:

- `external_id` is sent raw when available, from `external_id`, `externalId`, `externalid`, or `eid` URL params, then persisted in browser storage. Purchase uses a raw Stripe customer ID, Stripe client reference ID, or Stripe session ID.
- `fb_login_id` is sent raw when available, from `fb_login_id`, `fbLoginId`, or `fbloginid` URL params, then persisted in browser storage.
- `em` and `ph` are accepted as raw email/phone values from `email`/`em` and `phone`/`ph` URL params or Stripe checkout details, then normalized and SHA-256 hashed server-side before sending to Meta.
