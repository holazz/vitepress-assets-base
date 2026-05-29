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
}))
```

With the config above, page routes keep using VitePress `base`, while built assets are loaded from `assetsBase`.

```text
/components/button/
/static/site/assets/app.xxxxx.js
/static/site/hashmap.json
```

## Options

```ts
interface VitePressAssetsBaseConfig {
  assetsBase?: string
}
```

- `assetsBase`: Base URL for static resources. Empty values disable all rewrites.

## Rewrite Scope

This package applies four kinds of rewrites:

- HTML output: rewrites root-relative static resource URLs in `href` and `src`.
- Vite build assets: rewrites client asset paths through `experimental.renderBuiltUrl`.
- VitePress runtime: rewrites page chunk loading paths and the `hashmap.json` fallback request path.
- Theme config: rewrites `themeConfig.logo`.
