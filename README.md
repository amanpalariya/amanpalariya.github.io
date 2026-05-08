# Website

This repository contains code for a personal website.

## Features

- Home, About, CV, Blogs, Projects, and Tools sections
- Blog posts authored in Markdown (`src/data/blogs/markdown`)
- Project detail pages authored in Markdown (`src/data/projects/markdown`)
- Dedicated tools area for utility pages

## Stack

Built with [Next.js](https://nextjs.org/) 16, [React](https://react.dev/) 19, [Chakra UI](https://chakra-ui.com/) v3, and TypeScript.

## Architecture

The main code lives in:

- `src/app`: Next.js routes, layouts, and pages
- `src/components`: Reusable UI and page components
  - `src/components/ui` contains Chakra UI snippet-based components
- `src/data`: Website content (personal info, projects, blogs, etc.)
- `src/utils`: Utility helpers

## Testing

Run static checks before opening a PR:

```bash
yarn typecheck
yarn lint
```

Run unit tests:

```bash
yarn test:unit
```

Run functional Playwright tests:

```bash
yarn test:functional
```

Functional test runs always generate an HTML report. Open the latest report with:

```bash
yarn test:functional:report
```

Functional tests retain trace and video artifacts for failures by default. To record trace and video for every functional test, including passing tests, run:

```bash
yarn test:functional:record
```

Run accessibility tests:

```bash
yarn test:a11y
```

Clean Playwright reports and run artifacts:

```bash
yarn test:clean
```

## Deployment

`next.config.ts` is configured for static export (`output: "export"`).
Running `next build` generates static files that can be hosted on any static file server.

This repo deploys to GitHub Pages via GitHub Actions (`.github/workflows/nextjs.yml`):

- Trigger: pushes to `main` (and manual `workflow_dispatch`)
- Build: install dependencies and run `next build`
- Publish: upload `./out` as Pages artifact and deploy with `actions/deploy-pages`

## Design

The design is inspired by [SubtleFolio](https://subtle.framer.website/) with custom tweaks.
