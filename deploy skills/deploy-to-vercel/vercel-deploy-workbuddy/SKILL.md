---
name: vercel-deploy-workbuddy
description: General Vercel deployment helper for WorkBuddy and other AI agents. Use when deploying, publishing, creating previews, production releases, handling Vercel CLI login/token setup, linking projects, configuring environment variables, preparing Vercel Blob storage, inspecting deployments, or returning Vercel URLs without a dedicated Vercel MCP/plugin.
---

# Vercel Deploy WorkBuddy

Use this skill as a portable Vercel deployment toolbox. It is intentionally generic: inspect the project, choose the right deploy path, and only ask the user for credentials or approvals the agent cannot safely obtain.

## Bundled Scripts

Run setup when the project may need auth, linking, env vars, or Blob:

```bash
bash "deploy skills/deploy-to-vercel/vercel-deploy-workbuddy/scripts/setup-vercel-project.sh"
```

Useful setup options:

```bash
# Open Vercel login/token setup and start CLI login
bash "deploy skills/deploy-to-vercel/vercel-deploy-workbuddy/scripts/setup-vercel-project.sh" --login-only

# Create/setup Blob, require read-write token when the app code needs it, and generate ADMIN_PASSWORD
bash "deploy skills/deploy-to-vercel/vercel-deploy-workbuddy/scripts/setup-vercel-project.sh" --generate-admin-password

# Use a supplied admin password
bash "deploy skills/deploy-to-vercel/vercel-deploy-workbuddy/scripts/setup-vercel-project.sh" --admin-password "<password>"

# If the user provides a Vercel Blob read-write token, set it on the Vercel project
bash "deploy skills/deploy-to-vercel/vercel-deploy-workbuddy/scripts/setup-vercel-project.sh" --blob-read-write-token "<token>"
```

Run deployment after setup:

```bash
# Preview deployment
bash "deploy skills/deploy-to-vercel/vercel-deploy-workbuddy/scripts/deploy-vercel.sh"

# Production deployment
bash "deploy skills/deploy-to-vercel/vercel-deploy-workbuddy/scripts/deploy-vercel.sh" --prod

# Deploy a different local project path
bash "deploy skills/deploy-to-vercel/vercel-deploy-workbuddy/scripts/deploy-vercel.sh" --path /path/to/project --prod
```

## Operating Principles

- Prefer existing `VERCEL_TOKEN`, then existing `vercel login`, then opening login/token setup.
- Prefer Vercel CLI automation before dashboard instructions.
- After `vercel link`, create a public Blob store with `vercel blob create-store <name> --access public --yes --environment production --environment preview --environment development`. The linked-project flow connects the store and injects `BLOB_READ_WRITE_TOKEN` into those environments.
- Prefer that CLI flow before asking the user to create Blob manually. If the store already exists or token verification fails, use the Blob project's connection settings as the fallback.
- If app source references `BLOB_READ_WRITE_TOKEN`, do not rewrite the app to OIDC automatically. Confirm or set `BLOB_READ_WRITE_TOKEN` instead.
- `BLOB_STORE_ID` and `VERCEL_OIDC_TOKEN` alone are not enough for apps that explicitly require `BLOB_READ_WRITE_TOKEN`.
- Read `.vercel/project.json` instead of asking the user for project IDs.
- Default to preview deployments unless the user explicitly asks for production/live.
- Return the deployment URL and the status from `vercel inspect`.
- Never print or expose user-provided tokens.
