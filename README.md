# vitepress-assets-base

Separate VitePress page `base` from static resource `assetsBase`.

This package is useful when pages are served from one path, while generated assets are served from another path, such as an object storage bucket, static gateway, CDN, or internal `/static/...` prefix.

## Usage

```ts
import { defineConfig } from 'vitepress'
import { withVitePressAssetsBase } from 'vitepress-assets-base'

export default defineConfig(withVitePressAssetsBase({
  base: '/',
  assetsBase: '/static/site/',
  spaFallback: true,
}))
```

With the config above, page routes keep using VitePress `base`, while built assets are loaded from `assetsBase`.

```text
/components/button/
/static/site/assets/app.xxxxx.js
/static/site/hashmap.json
```

When `spaFallback` is enabled, the generated `index.html` is converted into an empty SPA fallback shell:

```html
<div id="app"></div>
```

This is useful when a server such as nginx always falls back refresh requests to the site entry `index.html`. Without the empty shell, refreshing a deep route may hydrate the home page SSR HTML against the current route and produce hydration mismatches.

## Options

```ts
interface VitePressAssetsBaseConfig {
  assetsBase?: string
  spaFallback?: boolean
}
```

- `assetsBase`: Base URL for static resources. Empty values disable all rewrites.
- `spaFallback`: Whether to turn `outDir/index.html` into an empty SPA fallback shell. Defaults to `false`.

## Rewrite Scope

This package applies four kinds of rewrites:

- HTML output: rewrites root-relative static resource URLs in `href` and `src`.
- Vite build assets: rewrites client asset paths through `experimental.renderBuiltUrl`.
- VitePress runtime: rewrites page chunk loading paths and the `hashmap.json` fallback request path.
- Theme config: rewrites `themeConfig.logo`.

If `spaFallback` is enabled, it also rewrites only `outDir/index.html` after the VitePress build finishes. Other generated page HTML files are left unchanged.

## When to Use `spaFallback`

Enable `spaFallback` when all deep-link refreshes are served by the same fallback `index.html`, for example:

```nginx
try_files $uri $uri/ /index.html;
```

Keep it disabled when your server can serve each generated VitePress page HTML directly, for example `/components/button/index.html`.
