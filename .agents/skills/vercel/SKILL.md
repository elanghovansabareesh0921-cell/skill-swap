---
name: vercel
description: >-
  Use this skill when performing tasks related to Vercel deployment, managing environment variables on Vercel, or checking the status of Vercel builds via the Vercel CLI.
---

# Vercel Integration Skill

This skill provides instructions for managing and debugging Vercel deployments using the Vercel CLI within this project.

## Workflow

1.  **Vercel CLI Usage**:
    - Use `npx vercel` (or `npx vercel --cwd .`) to run Vercel CLI commands.
    - Example: `npx vercel env ls` to list environment variables.
    - Example: `npx vercel ls` to list recent deployments.
    - **Note:** Vercel CLI commands may require authentication. If a command hangs or prompts for a browser login, you must cancel the task and instruct the user to run `npx vercel login` manually in their terminal.

2.  **Managing Environment Variables**:
    - Changes to `.env.local` ONLY affect the local development environment (`localhost`).
    - To sync variables from Vercel to your local machine, use `npx vercel env pull .env.local`.
    - To add new variables to production, use the Vercel Dashboard or `npx vercel env add`.

3.  **Applying Changes**:
    - If environment variables are updated in Vercel, a **new deployment** is required for those changes to take effect on the live site.
    - This can be triggered by pushing a new commit to the main branch (`git push`), or by using the Vercel Dashboard to trigger a redeployment.
