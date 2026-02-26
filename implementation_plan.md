# Implementation Plan

[Overview]
Implement a full repository-wide Chakra UI v3 color migration to semantic tokens and centralized palette contracts so all component/page color usage becomes consistent, token-driven, and light/dark mode safe.

The current codebase already uses Chakra UI v3 and has a reusable component architecture, but color usage is fragmented across `src/components` and `src/app` with direct palette shades (`gray.600`, `blue.500`), hard-coded values (`#0077B5`, `dodgerblue`), and mixed patterns (`colorScheme`, `colorPalette`, `useColorModeValue`). This increases maintenance burden because visual updates require touching many files and weakens confidence that dark/light mode parity is preserved everywhere.

This implementation introduces an app-level color domain in theme configuration with semantic tokens for surfaces, text, borders, accents, status, prose, and brand colors. Existing primitives and page components will be migrated to consume semantic token keys rather than direct shade literals, while preserving intentional dynamic palette behavior (e.g., CV section accent palettes and badge palettes). The approach keeps current visual identity but replaces “where colors come from” with a centralized token source.

Because scope is confirmed as full repo-wide migration, this plan includes all practical color-literal consumers in `src/components` and `src/app` in one pass. The migration will be staged: theme/token foundation first, then shared primitives, then feature/page components (including CV, blogs, projects, home, feature flags, wrappers), then article prose and final literal sweeps. Output will be validated by build/lint and light/dark manual checks.

[Types]
Introduce explicit app color types and token contracts that enforce safe palette usage and typed semantic-token references.

1. New type definitions:
   - File: `src/theme/colors/types.ts`
   - `export type AppAccentPalette = "blue" | "purple" | "green" | "orange" | "yellow" | "red";`
   - `export type AppNeutralPalette = "gray";`
   - `export type AppPalette = AppNeutralPalette | AppAccentPalette;`
   - `export type CvSectionId = "about" | "open-to" | "experience" | "projects" | "skills" | "education" | "volunteering" | "certifications" | "languages" | "courses" | "honors" | "organizations" | "contact";`

2. Semantic token key unions:
   - File: `src/theme/colors/types.ts`
   - `export type SemanticColorTokenKey =` union including:
     - Background/surface: `app.bg.canvas`, `app.bg.surface`, `app.bg.surfaceMuted`, `app.bg.card`, `app.bg.cardHeader`, `app.bg.overlay`
     - Foreground/text: `app.fg.default`, `app.fg.muted`, `app.fg.subtle`, `app.fg.link`, `app.fg.linkHover`, `app.fg.icon`, `app.fg.inverse`
     - Border/divider: `app.border.default`, `app.border.muted`, `app.border.strong`, `app.border.accent`
     - Status: `app.status.info.bg`, `app.status.info.fg`, `app.status.success.bg`, `app.status.success.fg`, `app.status.warning.bg`, `app.status.warning.fg`, `app.status.danger.bg`, `app.status.danger.fg`, `app.status.neutral.bg`, `app.status.neutral.fg`
     - Prose: `app.prose.heading`, `app.prose.body`, `app.prose.subtle`, `app.prose.link`, `app.prose.linkHover`, `app.prose.codeBg`, `app.prose.preBg`, `app.prose.inlineCodeBg`, `app.prose.inlineCodeFg`, `app.prose.border`
     - Brand: `app.brand.linkedin.solid`, `app.brand.linkedin.soft`, `app.brand.linkedin.contrast`
     - Chart/code-highlight tones: `app.syntax.comment`, `app.syntax.keyword`, `app.syntax.string`, `app.syntax.number`, `app.syntax.function`

3. Token object contracts:
   - File: `src/theme/colors/semanticTokens.ts`
   - `export interface AppSemanticTokenDefinition { value: { _light: string; _dark: string } }`
   - `export type AppSemanticTokens = Record<SemanticColorTokenKey, AppSemanticTokenDefinition>`

4. Palette mappings/contracts:
   - File: `src/theme/colors/palettes.ts`
   - `export const CV_SECTION_ACCENTS: Record<CvSectionId, AppAccentPalette>`
   - `export function getCvSectionPalette(sectionId: CvSectionId): AppAccentPalette`
   - Optional safe fallback helper:
     - `export function getCvSectionPaletteUnsafe(sectionId: string): AppAccentPalette`

5. Validation constraints:
   - Shared palette maps only accept `AppPalette`.
   - CV section mapping must be exact `Record<CvSectionId, AppAccentPalette>`.
   - For `bg`, `color`, `borderColor`, use semantic token keys by default.
   - Palette interpolation (`${palette}.500`) remains only for intentionally dynamic palette components.

[Files]
Create a dedicated color-system module and migrate all discovered color literal usage across the repository.

New files to be created:
- `src/theme/colors/types.ts`
  - Type aliases for palettes, section ids, semantic token keys.
- `src/theme/colors/semanticTokens.ts`
  - Full semantic token map for light/dark mode.
- `src/theme/colors/palettes.ts`
  - CV section accent mapping and typed palette helpers.
- `src/theme/colors/index.ts`
  - Barrel exports for color theme modules.

Existing files to be modified:
- Theme/config:
  - `src/chakra-config.tsx`
    - Register semantic tokens inside `createSystem` config.
    - Keep existing font tokens; merge color tokens.

- Core/shared UI primitives:
  - `src/components/ui/color-mode.tsx`
    - Remove `colorScheme` usage in `LightMode`/`DarkMode`.
    - Ensure Chakra v3-compliant color props (`colorPalette` / tokenized props only).
  - `src/components/core/Buttons.tsx`
    - Replace `dodgerblue` default with semantic tokenized button background/foreground.
  - `src/components/core/Cards.tsx`
    - Replace gray/white direct shades with semantic surface and border tokens.
  - `src/components/core/Badges.tsx`
    - Keep `colorPalette` API but move neutral text/bg to semantic where static.
  - `src/components/core/Texts.tsx`
    - Replace default/paragraph/subtitle/link tone literals with semantic text tokens.
  - `src/components/core/Tiles.tsx`
    - Replace tile divider/description/avatar/link icon literals with semantic tokens.
  - `src/components/core/Images.tsx`
    - Replace border/background literals with semantic tokens.

- Page common + wrapper components:
  - `src/components/page/common/HighlightedSection.tsx`
  - `src/components/page/common/LinkedInPrimaryButton.tsx`
  - `src/components/page/common/Header.tsx`
  - `src/components/page/common/header/HeaderNavIconButton.tsx`
  - `src/components/page/common/header/HeaderMobileTrigger.tsx`
  - `src/components/page/common/CopyLinkSecondaryButton.tsx`
  - `src/components/page/common/SocialCard.tsx`
  - `src/components/page/common/Footer.tsx`
  - `src/components/page/wrapper/WithBackground.tsx`
  - `src/components/page/home/HomepageAvatar.tsx`
  - Replace all direct color literals with semantic tokens while preserving intent.

- CV modules:
  - `src/components/page/cv/cvRenderUtils.ts`
    - Move/replace section accent constants to theme palette module.
  - `src/app/(home)/cv/page.tsx`
    - Consume centralized palette mapping and tighten section ID typing.
  - `src/components/page/cv/CvSection.tsx`
  - `src/components/page/cv/CvHero.tsx`
  - `src/components/page/cv/CvContactSection.tsx`
  - `src/components/page/cv/CvCoursesSection.tsx`
  - `src/components/page/cv/CvLanguagesSection.tsx`
  - `src/components/page/cv/CvTimelineSection.tsx`
  - `src/components/page/cv/CvSkillsSection.tsx`
  - `src/components/page/cv/CvProjectsSection.tsx`
  - `src/components/page/cv/CvAccomplishmentsSection.tsx`
  - `src/components/page/cv/CvJumpNav.tsx`

- Article/blog + app pages:
  - `src/components/article/proseStyles.ts`
    - Migrate prose and syntax styles to semantic prose/syntax tokens.
  - `src/app/(home)/page.tsx`
  - `src/app/(home)/projects/page.tsx`
  - `src/app/(home)/blogs/BlogsClient.tsx`
  - `src/app/(home)/blogs/[id]/Client.tsx`
  - `src/app/features/page.tsx`
  - Replace icon/text neutral literals with semantic tokens.

Files moved/cleaned up:
- Remove duplicated CV section accent map definitions from `src/components/page/cv/cvRenderUtils.ts` and/or `src/app/(home)/cv/page.tsx`, centralizing in `src/theme/colors/palettes.ts`.

Configuration updates:
- No dependency changes.
- Theme token configuration only in `src/chakra-config.tsx` and new `src/theme/colors/*` files.

[Functions]
Introduce token/palette helper functions and update existing color-resolving component logic to semantic-token contracts.

New functions:
- `getCvSectionPalette(sectionId: CvSectionId): AppAccentPalette`
  - File: `src/theme/colors/palettes.ts`
  - Purpose: canonical typed CV accent lookup.
- `getCvSectionPaletteUnsafe(sectionId: string): AppAccentPalette` (optional)
  - File: `src/theme/colors/palettes.ts`
  - Purpose: compatibility bridge where runtime string ids are unavoidable.
- `getSemanticColor(path: SemanticColorTokenKey): string` (optional helper)
  - File: `src/theme/colors/semanticTokens.ts`
  - Purpose: safely reuse token keys in style objects.

Modified functions:
- `getSectionTheme(sectionId: string)` → typed and centralized palette source
  - File: `src/app/(home)/cv/page.tsx`
- `getCvSectionAccentPalette(sectionId: string)`
  - File: `src/components/page/cv/cvRenderUtils.ts`
  - Change: deprecate local constant and delegate/import centralized map helper.
- `PrimaryActionButton(...)`
  - File: `src/components/core/Buttons.tsx`
  - Change: semantic default background/foreground.
- `StatusBadge(...)`, `CategoryBadge(...)`
  - File: `src/components/core/Badges.tsx`
  - Change: semantic-friendly backgrounds/foregrounds for static parts.
- `useTileColors()`
  - File: `src/components/core/Tiles.tsx`
  - Change: semantic token values only.
- `useProseStyles()`
  - File: `src/components/article/proseStyles.ts`
  - Change: semantic prose/syntax tokens; remove direct shades.
- `HighlightedSection(...)`
  - File: `src/components/page/common/HighlightedSection.tsx`
  - Change: semantic neutral colors + palette-aware accents.
- `ColorModeToggleIconButton()`, `Header()`, nav helper color variables
  - File: `src/components/page/common/Header.tsx`
  - Change: semantic nav/menu colors.
- `ContactItem(...)`, `SkillLevel(...)`, timeline item color helpers
  - Files: CV section components listed above.

Removed functions:
- None mandatory.
- Local color-map constants in CV utilities are removed/replaced by centralized module exports.

[Classes]
No new classes are introduced because this migration is a theme-token and functional-component refactor.

Detailed breakdown:
- New classes: None.
- Modified classes: None.
- Removed classes: None.

[Dependencies]
No package additions or version upgrades are required because Chakra UI v3 and existing tooling already support semantic tokens and `colorPalette` patterns.

Details:
- Keep all current entries in `package.json` unchanged.
- Continue using existing `@chakra-ui/react` v3 APIs.
- Use internal TypeScript contracts for stronger token typing instead of external token libraries.

[Testing]
Validate migration via static checks, targeted literal sweeps, and end-to-end visual verification in both color modes.

Static checks:
- Run `yarn build` (type safety + production build).
- Run `npx eslint src --max-warnings=0` (or repo lint command if added later).
- Run grep sweeps to confirm reduction/removal of direct color literals and `colorScheme=` usage:
  - `grep -r "colorScheme=" --include='*.ts' --include='*.tsx' src | cat`
  - `grep -rE "#[0-9a-fA-F]{3,8}|dodgerblue|gray\.[0-9]{2,3}|blue\.[0-9]{2,3}|purple\.[0-9]{2,3}|green\.[0-9]{2,3}|orange\.[0-9]{2,3}|yellow\.[0-9]{2,3}|red\.[0-9]{2,3}" --include='*.ts' --include='*.tsx' src | cat`

Manual functional validation pages:
- `/` (home)
- `/about`
- `/projects`
- `/blogs`
- `/blogs/[id]`
- `/cv`
- `/features`

Validation targets:
- Card backgrounds/borders, header/nav states, badge variants, button colors, link styling, icon-muted states.
- CV section accent differentiation and timeline rails/dots.
- Prose headings/body/links/blockquote/code/pre/syntax colors.
- LinkedIn primary/small button contrast and visual parity in both modes.

[Implementation Order]
Implement in dependency-safe layers so theme contracts land first, then shared primitives, then all page consumers, followed by verification and cleanup.

1. Create `src/theme/colors` module (`types.ts`, `semanticTokens.ts`, `palettes.ts`, `index.ts`).
2. Wire semantic tokens into `src/chakra-config.tsx`.
3. Resolve Chakra compatibility cleanup (`src/components/ui/color-mode.tsx`), remove `colorScheme` usage.
4. Migrate core primitives (`Buttons`, `Cards`, `Badges`, `Texts`, `Tiles`, `Images`).
5. Migrate shared wrappers/common components (`WithBackground`, `Header*`, `HighlightedSection`, `LinkedInPrimaryButton`, `Footer`, `SocialCard`, `CopyLinkSecondaryButton`, `HomepageAvatar`).
6. Centralize CV palette mapping and update CV render orchestration (`cvRenderUtils.ts`, `src/app/(home)/cv/page.tsx`).
7. Migrate all CV section components to semantic tokens while preserving accent dynamics.
8. Migrate prose/article styling (`src/components/article/proseStyles.ts`) to semantic prose/syntax tokens.
9. Migrate app-level page literals in `src/app/(home)` and `src/app/features`.
10. Run build/lint/literal sweeps, fix leftovers, then execute final dark/light manual verification.
