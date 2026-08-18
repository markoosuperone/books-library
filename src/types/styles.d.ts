// Next's bundled types declare `*.module.css` / `*.module.scss` (see
// next/types/global.d.ts) but not plain stylesheets, so a global
// `import "./globals.css"` has no declaration to resolve to once side-effect
// imports are type-checked.
//
// Only `*.css` is declared here on purpose: TypeScript picks between competing
// wildcard modules by longest prefix, and `*.scss` would tie with Next's
// `*.module.scss`, which could silently widen our CSS module types to `any`.
declare module '*.css';
