# vitepress-assets-base

将 VitePress 的页面 `base` 和静态资源 `assetsBase` 分开。

这个包适用于页面路由和静态资源部署在不同路径的场景，例如页面走 `/`，而构建产物中的 JS、CSS、字体、图片、`hashmap.json` 等资源走对象存储、静态网关、CDN，或内部的 `/static/...` 前缀。

## 使用方式

```ts
import { defineConfig } from 'vitepress'
import { withVitePressAssetsBase } from 'vitepress-assets-base'

export default defineConfig(withVitePressAssetsBase({
  base: '/',
  assetsBase: '/static/site/',
}))
```

上面的配置会保持页面路由继续使用 VitePress `base`，同时让构建后的静态资源从 `assetsBase` 加载。

```text
/components/button/
/static/site/assets/app.xxxxx.js
/static/site/hashmap.json
```

## 配置项

```ts
interface VitePressAssetsBaseConfig {
  assetsBase?: string
}
```

- `assetsBase`：静态资源基础路径。为空时不做任何改写。

## 改写范围

这个包主要做四类改写：

- HTML 产物：改写 `href`、`src` 中的根路径静态资源 URL。
- Vite 构建资源：通过 `experimental.renderBuiltUrl` 改写客户端资源路径。
- VitePress 运行时：改写页面 chunk 加载路径和 `hashmap.json` fallback 请求路径。
- 主题配置：改写 `themeConfig.logo`。
