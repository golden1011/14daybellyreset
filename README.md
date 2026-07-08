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
- `META_PIXEL_ID` - optional; defaults to `1343158414610855`.
- `META_GRAPH_VERSION` - optional; defaults to `v21.0`.
- `META_TEST_EVENT_CODE` - optional; use only while testing in Meta Events Manager.

The sales page sends `PageView`. The thank-you page sends `Purchase` with `currency: USD` and `value: 7.00`. Browser Pixel and Conversions API use the same `event_id` for deduplication.
