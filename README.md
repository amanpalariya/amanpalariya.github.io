# Website

This repository contain code for a personal website.

## Code

This website is built using [Next.js](https://nextjs.org/) and [Chakra UI](https://chakra-ui.com/) using TypeScript.

> Note: This project uses Next.js 13's apps router which may cause some issues with Chakra UI.

### Architecture

The code is split into four directories

- `app`: Next.js-specific directory, contains route information and the high-level layout of pages
- `components`: Contains code for reusable components (both generic and page-specific)
- `data`: Contains the content of the website (personal information, projects, work details, etc.)
- `utils`: Contains utility functions

### Deployment

The `next.config.js` file is configured to export a static website on build (`next build`). The static site can be served using any file server.

## Design

The design is a slightly tweaked version of [SubtleFolio](https://subtle.framer.website/).
The overall design of the website is clean, responsive, and accessible.
