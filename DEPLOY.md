# Deploying AutoHub

AutoHub is a static Vite/React SPA — there's no server to run, just static files
served by nginx. It's deployed on **Google Cloud Run**.

## Live URL

https://autohub-xhgcy2euza-uc.a.run.app

## Deploy / redeploy (Google Cloud Run)

Prerequisites (one-time):
- `gcloud` CLI installed and authenticated (`gcloud auth login`)
- A GCP project selected (`gcloud config set project <PROJECT_ID>`)
- APIs enabled: `run.googleapis.com`, `cloudbuild.googleapis.com`
- The Cloud Build service account needs the **Cloud Build Builder** role, e.g.:
  ```bash
  gcloud projects add-iam-policy-binding <PROJECT_ID> \
    --member="serviceAccount:<PROJECT_NUMBER>-compute@developer.gserviceaccount.com" \
    --role="roles/cloudbuild.builds.builder" --condition=None
  ```

Deploy from the repo root:

```bash
gcloud run deploy autohub \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 10 \
  --memory 256Mi \
  --timeout 90
```

Cloud Build reads the `Dockerfile` (Node build stage → nginx serve stage),
builds the image, and rolls out a new revision. No env vars are required — the
app is fully client-side.

## How it works

- **`Dockerfile`** — stage 1 runs `npm ci && npm run build`; stage 2 copies
  `dist/` into `nginx:alpine` and serves it on `$PORT` (Cloud Run injects 8080).
- **`nginx.conf`** — SPA fallback (`try_files $uri $uri/ /index.html`) so React
  Router client routes (`/cars/:slug`, `/compare`, …) resolve on direct loads
  and refreshes; hashed `/assets/*` are cached for a year.
- **`public/robots.txt` & `public/sitemap.xml`** — copied verbatim into `dist/`
  at build time. Update the URLs in them if the deployed domain changes.

## SEO / Search Console

1. Go to <https://search.google.com/search-console>.
2. Add a **URL prefix** property for the live URL above.
3. Verify ownership via the **HTML tag** method — add the
   `<meta name="google-site-verification" …>` tag to `index.html`, redeploy,
   then click Verify.
4. Under **Sitemaps**, submit `sitemap.xml`.

> A `*.run.app` URL can't use DNS/domain verification (you don't own that
> domain), so use the HTML-tag method.

## Custom domain (optional)

Cloud Run supports custom domains via **Cloud Run → Manage Custom Domains**
(or `gcloud run domain-mappings create`). You map your domain to the `autohub`
service, add the DNS records Google provides at your registrar, and Cloud Run
provisions a managed TLS certificate once DNS resolves.

## Alternative static hosts

Because the production artifact is just `dist/`, any static host works
(Netlify, Firebase Hosting, Cloudflare Pages, GitHub Pages). Build with
`npm run build` and serve `dist/` with an SPA fallback to `index.html`.
