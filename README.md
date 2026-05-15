# Mechanic Frank

AI-powered used-car listing analyser for Australian buyers. The whole product is a single-page chat with **Frank**, a 25-year Australian workshop mechanic. Free teaser, then **A$4.75** for a full report via Stripe Embedded Checkout.

**Privacy:** listings and images are never stored. They live in memory only long enough to be sent to Anthropic, then they're discarded.

## Local development

```bash
npm install
cp .env.example .env
# fill in ANTHROPIC_API_KEY, Stripe TEST keys, and VITE_STRIPE_PUBLISHABLE_KEY
npm run dev          # netlify dev — frontend + functions on :8888
# or
npm run dev:vite     # vite only on :5173 (functions won't run)
```

## Stack

- React 18 + Vite 5, single page, no router
- Tailwind CSS
- Netlify Functions (Node 20)
- Anthropic Claude API (`claude-sonnet-4-5` by default, vision-capable)
- Stripe Embedded Checkout, **test mode** unless explicitly switched
- No database. Listings never persisted.

## Project structure

```
mechanicfrank/
  public/                      static assets (favicon, Frank's photo)
  src/
    main.jsx                   React entry
    App.jsx                    chat-only page
    index.css                  Tailwind + animations
    components/
      ChatWindow.jsx           message list + auto-scroll
      Message.jsx              one chat bubble
      ChatInput.jsx            sticky input, paste / drop / camera
      StripeCheckout.jsx       inline Embedded Checkout modal
      Disclaimer.jsx           sticky legal footer
    lib/
      chat-state.js            teaser → paywall → paid → followup state machine
      api.js                   fetch wrappers for the Netlify functions
  netlify/functions/
    frank-chat.js              Anthropic call for free teaser + follow-up
    frank-report.js            Anthropic call for the structured paid report
    create-checkout-session.js Stripe Embedded Checkout session
    stripe-webhook.js          checkout.session.completed handler
  netlify.toml
  index.html
  vite.config.js
  tailwind.config.js
  postcss.config.js
  .env.example
  LICENSE                      MIT
```

## Environment variables

Copy `.env.example` to `.env` for local dev, and add the same keys in **Netlify → Site settings → Environment variables** for deploy.

| Key | Notes |
|---|---|
| `ANTHROPIC_API_KEY` | server-side only |
| `ANTHROPIC_MODEL` | defaults to `claude-sonnet-4-5` |
| `STRIPE_SECRET_KEY` | **test** key (`sk_test_…`) for now |
| `STRIPE_PUBLISHABLE_KEY` | **test** key, mirrors `VITE_STRIPE_PUBLISHABLE_KEY` |
| `STRIPE_WEBHOOK_SECRET` | from `stripe listen` or Netlify webhook config |
| `STRIPE_PRICE_AMOUNT_CENTS` | defaults to `475` (A$4.75) |
| `STRIPE_CURRENCY` | defaults to `aud` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | exposed to the browser |

Never commit a real key.

## Deploy

1. Push `main` to GitHub.
2. Connect the repo in Netlify. Build settings come from `netlify.toml`.
3. Add the env vars above in Netlify.
4. Configure the Stripe webhook endpoint at `https://<your-netlify-site>/api/stripe-webhook` and copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
5. Custom domain `mechanicfrank.com` — point DNS once Netlify is happy.

## Disclaimer

Frank's reports are general guidance only. Always inspect the vehicle in person and consult a qualified mechanic before purchasing. Mechanic Frank is not a licensed motor dealer or inspector.
