# Website

This repository contains code for a personal website.

## Stack

Built with [Next.js](https://nextjs.org/) 16, [React](https://react.dev/) 19, [Chakra UI](https://chakra-ui.com/) v3, and TypeScript.

## Architecture

The main code lives in:

- `src/app`: Next.js routes, layouts, and pages
- `src/components`: Reusable UI and page components
  - `src/components/ui` contains Chakra UI snippet-based components
- `src/data`: Website content (personal info, projects, blogs, etc.)
- `src/utils`: Utility helpers

## Deployment

`next.config.ts` is configured for static export (`output: "export"`).
Running `next build` generates static files that can be hosted on any static file server.

## Design

The design is inspired by [SubtleFolio](https://subtle.framer.website/) with custom tweaks.
