# Deployment note

This repository is a static HTML/CSS/JS website and is intended to be deployed as static assets through Cloudflare's Workers & Pages interface in Pages-style hosting mode.

It is not a Cloudflare Worker project. There is no Wrangler configuration, no `functions/` directory, no `workers/` directory, and no worker entrypoint code. The site files in the repository root are the public-facing static assets and should be served directly.

If you are creating a Cloudflare project, select the static site / Pages-style flow instead of creating a Worker project.
