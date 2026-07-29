# Newsletter + reference-data setup

Signup is built and deployed but switched **off** at `lib/site.ts` →
`NEWSLETTER_ENABLED = false`. That switch hides both forms *and* closes the
subscribe endpoint (unsubscribe stays open regardless — nobody should ever be
unable to get off a list).

Do the steps in this order. **Start with step 1** — it's the only one that involves
waiting on something outside your control.

---

## 1. Start DNS verification for the email provider (do this first)

DNS propagation is the long pole; everything else is minutes. Starting it first
means it's verified by the time you need it in step 6.

1. Create a [Resend](https://resend.com) account (free tier covers 3,000
   emails/month, which is well beyond the current list size).
2. Add the domain `eu-ua.com` and copy the SPF, DKIM and DMARC records it gives you.
3. Add those records at your DNS host.
4. Leave it to verify — usually minutes, occasionally hours.

> Resend is a suggestion, not a requirement. Postmark or Mailgun work the same way;
> only the SDK call in step 6 changes.

## 2. Apply the two SQL files (~2 min)

Supabase Dashboard → **SQL Editor** → **New query** → paste → **Run**. Either order,
both idempotent, neither deletes anything.

- `supabase/schema-newsletter.sql` — creates `newsletter_subscribers`
- `supabase/schema-reference-data.sql` — widens `eu_chapters` / `cities` /
  `quiz_questions`, and creates `timeline_events`, `cultural_sites`,
  `diaspora_heritage`

## 3. Load the reference data into the database (~1 min)

```sh
npm run check-data   # see the drift before
npm run sync-data    # upsert data/*.json into Supabase
npm run check-data   # every line should now read "in sync"
```

Expected to close: cities 12→30, myths 6→12, quiz 5→67, plus timeline (58),
cultural sites (61) and diaspora heritage (18) from nothing.

## 4. Point the app at the database

`lib/data.ts` still reads `data/*.json`. Once step 3 reports everything in sync,
`getChapters` / `getCities` / `getMyths` / `getQuizQuestions` / `getEUData` switch
back to Supabase reads, and `getCulturalSites` / `getAllQuizCategories` /
`timeline` gain DB reads they never had.

Do **not** do this before step 3 passes: reading from tables that are empty or
partial is what made the site serve 6 myths instead of 12 in the first place.

After this, editing `data/*.json` no longer changes the site — run `npm run sync-data`,
or manage the content in the CMS once admin pages exist for it.

## 5. Cookie consent gating analytics (required before promoting)

GA4 currently loads for every visitor and sets cookies with no consent. Under
ePrivacy as applied in Belgium, analytics cookies need prior consent. This is
independent of the newsletter and is the site's largest compliance gap today.

- Add a consent banner; do not load the GA4 `<Script>` until consent is given.
- Store the choice in `localStorage`, and offer a way to change it (a link in the
  footer is enough).

Expect reported traffic to drop 20–50% once visitors can decline. That's the real
number, not a regression.

## 6. Wire up sending + double opt-in

The schema already supports it: `status = 'pending'`, a `token` column, and a
`confirmed_at` timestamp.

1. Put the Resend API key in Vercel env as `RESEND_API_KEY` (and `.env.local`).
2. In `lib/supabase/newsletter.ts`, change `subscribe()` to write
   `status: 'pending'` instead of `'confirmed'`.
3. Send a confirmation email containing
   `https://www.eu-ua.com/api/newsletter/confirm?token=<token>`.
4. Add `app/api/newsletter/confirm/route.ts` — set `status = 'confirmed'` and
   `confirmed_at = now()`, then redirect to a short "you're in" page.

Germany in particular treats single opt-in as weak proof of consent, and a large
share of the diaspora audience is in Germany and Poland — worth doing properly.

## 7. Unsubscribe headers on every send

Set these so Gmail and Outlook show a native unsubscribe button:

```
List-Unsubscribe: <https://www.eu-ua.com/api/newsletter/unsubscribe?token=TOKEN>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```

The endpoint already exists and works. Without these headers, unsubscribes come
through as spam complaints instead, which damages deliverability.

## 8. Turn it on

In `lib/site.ts`, set `NEWSLETTER_ENABLED = true`, commit, push. Vercel redeploys;
the forms reappear and the endpoint opens.

## 9. Test end to end

- Subscribe with a real address → row appears with `status = 'pending'`
- Confirmation email arrives → click the link → `status = 'confirmed'`
- Subscribe the same address again → still one row, no error shown
- Click unsubscribe → `status = 'unsubscribed'`, lands on `/newsletter/unsubscribed`
- Subscribe again after unsubscribing → returns to `confirmed` with fresh consent
- Submit an invalid address → inline error, nothing written

## 10. Housekeeping

- Sign the data processing agreements Supabase and Vercel both offer — they process
  EU personal data on your behalf.
- Decide a retention period for unsubscribed rows. They're kept today so you can't
  accidentally re-mail someone; that's the standard approach, but write it down in
  `/privacy` if you keep them indefinitely.
- Consider an admin page listing subscribers with a CSV export, reusing the
  patterns in `app/admin`.

---

## Reading the list

There is no UI for the list yet. Until there is:

```sh
node -e "
require('dotenv').config({path:'.env.local'});
const {createClient}=require('@supabase/supabase-js');
const c=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
c.from('newsletter_subscribers').select('email,status,created_at').order('created_at',{ascending:false})
 .then(({data,error}) => console.log(error ? error.message : data));
"
```
