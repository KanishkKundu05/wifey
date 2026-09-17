# Wedding invitation

A small Vite page backed by Convex. Email submissions are saved before the pink thank-you screen appears. Guests can then optionally save a mailing address for a physical invitation.

## Local development

```sh
npm install
npx convex dev
```

In a second terminal, run `npm run dev`. Convex writes the development URL to the ignored `.env.local` file.

## Production

The default frontend URL points to the production Convex deployment at `https://quixotic-dogfish-922.convex.cloud`. Set `VITE_CONVEX_URL` to override it. This URL is public; never put a Convex deploy key in a `VITE_` variable.

For static hosting, use `npm run build` and publish `dist`. To deploy backend changes and build against the production URL together:

```sh
npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name VITE_CONVEX_URL
```

View submissions in the `invitations` table in the [Convex dashboard](https://dashboard.convex.dev/t/kk5241/wedding-invitation/quixotic-dogfish-922). No public query exposes guest data. Each submission receives a random token that authorizes its optional address update; email addresses alone cannot authorize an update. Repeated requests with the same token are idempotent; separate visits can create separate submissions.

## Checks

```sh
npm test
npx playwright install chromium
npm run test:browser
npm run build
```

The browser tests mock Convex responses; database tests exercise the actual mutation handlers with `convex-test`.
