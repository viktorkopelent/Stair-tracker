# The Ascent — Stair-Climb Floor Tracker

A shared mountain leaderboard. Participants log floors they climbed instead of
taking the elevator; everyone rises up a mountain by their floor count. An admin
adds and removes climbers and can reset all floors.

- **Frontend:** `index.html` (plain HTML/JS, no build step)
- **Backend:** three serverless functions in `api/` backed by **Upstash Redis**
- **Hosting:** Vercel + your custom domain (e.g. `stairs.koplab.cz`)

Logging is **open** — anyone can add floors to any climber (trust-based).

---

## File layout

```
.
├── index.html          # the UI everyone sees
├── api/
│   ├── _redis.js       # shared Redis helper (not a public route)
│   ├── state.js        # GET  /api/state   → all players + floors
│   ├── log.js          # POST /api/log     → add floors to a player
│   └── admin.js        # POST /api/admin   → add/remove/reset (PIN-checked)
├── package.json
└── .gitignore
```

Push all of this to the **root** of your public GitHub repo.

---

## Setup — do these once, in order

### 1. Create a free Upstash Redis database
1. Go to **https://upstash.com** → sign up / log in (GitHub login works).
2. **Create Database** → name it anything (e.g. `stairs`) → pick the region
   closest to your users → **Create**.
3. On the database page, scroll to **REST API**. Copy these two values:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

   Keep them handy for step 3.

### 2. Import the repo into Vercel
1. Go to **https://vercel.com** → **Add New… → Project**.
2. **Import** your GitHub repo (authorize GitHub if asked).
3. Framework Preset: **Other**. Leave build/output settings empty — there is
   no build step.
4. **Before** clicking Deploy, expand **Environment Variables** (or add them
   right after, under Settings → Environment Variables) — see step 3.

### 3. Add three environment variables in Vercel
Project → **Settings → Environment Variables**. Add each for the
**Production** (and Preview, if you like) environment:

| Name | Value |
|------|-------|
| `UPSTASH_REDIS_REST_URL`   | (paste from Upstash) |
| `UPSTASH_REDIS_REST_TOKEN` | (paste from Upstash) |
| `ADMIN_PIN`                | a secret number/word only you know, e.g. `7391` |

> The admin PIN lives **only on the server**. It is never written in the HTML,
> so visitors can't read it from the page source.

After adding variables, trigger a redeploy (Deployments → ⋯ → Redeploy, or just
push a commit) so the functions pick them up.

### 4. Connect your domain
1. Project → **Settings → Domains** → type `stairs.koplab.cz` → **Add**.
2. Vercel shows a DNS record to create. For a subdomain it's normally:

   | Type  | Name     | Value (use exactly what Vercel shows) |
   |-------|----------|----------------------------------------|
   | CNAME | `stairs` | `cname.vercel-dns.com`                 |

3. Add that record in whatever manages DNS for `koplab.cz` (same place you set
   up `cc.koplab.cz`).
4. Wait a few minutes — Vercel verifies the domain and issues HTTPS
   automatically.

Done. Visit `https://stairs.koplab.cz`.

---

## Using it

- **Add climbers:** click **⚙ admin** (top-right of the climbers card), enter
  your `ADMIN_PIN`, then add each participant by name.
- **Log floors:** anyone taps a quick button (+1/+2/+5/+10) or types a number
  and hits **＋ Add** on a climber's card.
- **The mountain:** each climber's icon sits at a height proportional to their
  floors; the leader glows gold near the 🚩 summit. The board auto-refreshes
  every 10 seconds.
- **Reset for a new round:** admin → **reset all floors to zero** (keeps the
  roster).

---

## Local testing (optional)

```bash
npm install -g vercel       # one time
vercel login
vercel env pull             # pulls your env vars into .env.local
vercel dev                  # runs the site + API locally at localhost:3000
```

---

## Notes & limits

- Upstash and Vercel free tiers comfortably handle 10–20 people. You won't get
  near the request limits with occasional button clicks.
- Vercel's free **Hobby** plan is intended for **personal / non-commercial**
  use. An internal team challenge with no revenue fits; just be aware of the
  rule if this ever becomes a paid/commercial thing.
- All data lives under a single Redis key (`ascent:state`). To wipe everything
  including the roster, delete that key in the Upstash console.
- Want each participant locked to only their own card (personal codes instead
  of open logging)? That's a small change to `api/log.js` and the frontend —
  ask and it can be added.
