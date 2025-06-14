# OBL Handbook Monorepo

[![Deploy Environments](https://github.com/flobobot/OBL-handbook/actions/workflows/deploy.yml/badge.svg)](https://github.com/flobobot/OBL-handbook/actions/workflows/deploy.yml)

This is the unified codebase for The Old Blue Last's training system and related venues.

## Structure
- `core-components/` – Shared UI and modules
- `envs/` – Environment folders for each venue (OBL, A&E, OEM, etc.)
- `patches/` – Patch configs and logic
- `scripts/` – Backup logic and automation
- `.github/workflows/` – CI/CD pipelines

## Automation
- On push to `main`, patches are applied and deployments are triggered.
- Drive backups can be manually run via `backup_and_upload.py`.
- GitHub Actions supports patch + deploy workflows.

## Deployment (example Netlify CLI)
To deploy a venue via Netlify CLI:

```bash
# Example for old-blue-last
cd envs/old-blue-last
netlify deploy --prod --dir=. --site=$NETLIFY_SITE_ID_OBL

# Example for adam-and-eve
cd envs/adam-and-eve
netlify deploy --prod --dir=. --site=$NETLIFY_SITE_ID_AE
```

Set these environment variables in your GitHub repo or locally:
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID_OBL`
- `NETLIFY_SITE_ID_AE`
