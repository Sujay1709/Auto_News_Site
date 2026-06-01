# Deploying AutoHub publicly

Get the site to a URL you (and your phone) can hit from anywhere.

## Quick answer: Render.com free tier, ~5 minutes

The repo ships with a `render.yaml` that turns Render into a one-click
deployment target.

1. **Push the branch** (this branch already lives on origin if you've
   been following along).
2. Go to <https://render.com>, sign in with GitHub.
3. Click **New → Blueprint**.
4. Pick the `Auto_News_Site` repo. Render auto-detects `render.yaml`
   and proposes the `autohub` service. Click **Apply**.
5. (Optional) Set `TRIPO_API_KEY` and `NEWS_API_KEY` in the service's
   **Environment** tab. Without them, generation routes return clear
   error messages but `/cars`, `/cars/<slug>`, `/news`, `/info` all work.
6. Wait ~3-5 minutes for the first build to finish.
7. Your URL is `https://autohub.onrender.com` (or `autohub-<random>` if
   the name is taken; rename in the dashboard).

That URL works on your phone. Open Safari → type it → done.

### Free tier limits

- Sleeps after 15 minutes of no traffic. First request after sleep
  takes ~30 sec to wake up. After that it's fast until the next idle.
- 750 service-hours / month free (enough to keep one app available
  24/7).
- Build minutes: 500/month free.
- No persistent disk — `static/models/generated/` is ephemeral, so any
  AI-generated GLBs get wiped on restart. The committed GLBs in
  `static/models/community/` and `static/models/community-cars/` are
  part of the repo and survive restarts.

## Alternative free hosts

All work with the existing `Dockerfile` or `Procfile`:

### Fly.io
```bash
brew install flyctl                          # macOS
fly auth signup
fly launch --no-deploy --name autohub        # autodetects Dockerfile
fly deploy
fly open                                     # opens https://autohub.fly.dev
```
3 small VMs free, no sleep, ~5 sec cold-start when scaled to zero.

### Railway.app
1. <https://railway.app> → **New Project** → **Deploy from GitHub**
2. Pick the repo. Railway auto-detects Python + the `Procfile`.
3. Set env vars in the **Variables** tab.
4. Generate a public domain in **Settings → Networking → Generate Domain**.
5. You get `autohub-production.up.railway.app`.

$5/month of usage credits free; one always-on Flask app fits inside that.

### Hugging Face Spaces (Docker)
Cheaper than a custom domain if you mostly want a public URL.
1. Create a Space at <https://huggingface.co/new-space> → SDK: **Docker**.
2. `git remote add hf https://huggingface.co/spaces/<your-username>/autohub`
3. `git push hf feat/real-3d-car-models:main`
4. URL: `https://<your-username>-autohub.hf.space`.

## About the name "AutoHub.com"

`autohub.com`, `autohub.io`, and `autohub.app` are all owned by other
companies. Three options:

1. **Use a free subdomain** — `autohub.onrender.com`, `autohub.fly.dev`, etc.
   No cost, no DNS setup, works on phones immediately.
2. **Register a similar domain** ($10-30/year):
   - Namecheap, Cloudflare Registrar, Porkbun
   - Available variants worth checking: `autohub.tech`, `autohub.dev`,
     `autohub-cars.com`, `myautohub.app`, `<yourname>autohub.com`
3. **Pay for `autohub.com` itself** — current owners may sell;
   negotiated prices for short generic .com names usually run
   $5K-$50K+. Not recommended for a personal project.

### Pointing a custom domain at Render

Once you own a domain (let's say `autohub.tech`):

1. In Render dashboard → your service → **Settings → Custom Domains** →
   **Add Custom Domain**. Enter `autohub.tech`.
2. Render shows you two DNS records to add at your registrar:
   - `CNAME` for `www.autohub.tech` → `autohub.onrender.com`
   - `ANAME`/`ALIAS` for `autohub.tech` apex → `autohub.onrender.com`
3. Add those at your registrar's DNS panel. Propagation: 5 min - 24 hrs.
4. Render auto-provisions a Let's Encrypt TLS cert once DNS resolves.

After that, typing `autohub.tech` on your phone hits your site.

### Getting indexed by Google ("if I search for AutoHub on my phone")

Just registering the domain doesn't make it findable in search results.
You need:

1. Add a `<meta name="description">` tag in `templates/base.html`.
2. Add a `sitemap.xml` listing every `/cars/<slug>` URL.
3. Submit the sitemap at <https://search.google.com/search-console>.
4. Wait 1-4 weeks for Google to crawl + index.
5. Eventually your site appears for queries like `autohub.tech` directly,
   and over time for `autohub` if there's enough link traffic.

A new personal site rarely ranks for the bare term "AutoHub" since
established companies own that name. Type the full domain on phone
to reach the site; relying on search alone is a months-long process.
