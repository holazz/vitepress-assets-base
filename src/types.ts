import type { UserConfig as VitePressUserConfig } from 'vitepress'

export interface VitePressAssetsBaseOptions {
  assetsBase?: string
  spaFallback?: boolean
}

export type VitePressAssetsBaseConfig<ThemeConfig = any>
  = Omit<VitePressUserConfig<ThemeConfig>, 'vite'> & VitePressAssetsBaseOptions & {
    vite?: VitePressAssetsBaseViteConfig
  }

export interface VitePressAssetsBaseRuntimeConfig extends VitePressAssetsBaseOptions {
  [key: string]: unknown
  base?: string
  themeConfig?: unknown
  buildEnd?: BuildEnd
  transformHtml?: TransformHtml
  vite?: {
    experimental?: {
      renderBuiltUrl?: RenderBuiltUrl
      [key: string]: unknown
    }
    plugins?: unknown[]
    [key: string]: unknown
  }
}

export interface VitePressAssetsBaseViteConfig {
  css?: {
    postcss?: {
      plugins?: unknown[]
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  define?: Record<string, unknown>
  experimental?: {
    renderBuiltUrl?: RenderBuiltUrl
    [key: string]: unknown
  }
  plugins?: VitePressAssetsBaseVitePlugin[]
  resolve?: {
    alias?: VitePressAssetsBaseAlias[]
    [key: string]: unknown
  }
  server?: {
    allowedHosts?: boolean | string[]
    fs?: {
      allow?: string[]
      [key: string]: unknown
    }
    host?: string | boolean
    [key: string]: unknown
  }
}

export type VitePressAssetsBaseAlias
  = | {
    find: string | RegExp
    replacement: string
  }
  | {
    [find: string]: string
  }

export interface VitePressAssetsBaseVitePlugin {
  [key: string]: unknown
  name?: string
  configureServer?: (server: VitePressAssetsBaseDevServer) => void | Promise<void>
}

export interface VitePressAssetsBaseDevServer {
  [key: string]: unknown
  watcher: {
    add: (path: string | string[]) => void
  }
}

export interface VitePressAssetsBaseMarkdownConfig {
  [key: string]: unknown
  config?: (md: VitePressAssetsBaseMarkdownIt) => void
}

export interface VitePressAssetsBaseMarkdownIt {
  [key: string]: unknown
  use: (plugin: unknown, ...params: unknown[]) => VitePressAssetsBaseMarkdownIt
}

export interface VitePressAssetsBasePageData {
  [key: string]: unknown
  frontmatter: Record<string, unknown>
}

export interface TransformContext {
  /**
   * Reports a fatal transform error through Vite.
   * 通过 Vite 报告一个致命转换错误。
   */
  error: (message: string) => never
}

/**
 * Matches VitePress buildEnd hooks.
 * 匹配 VitePress buildEnd 钩子。
 */
export type BuildEnd = (siteConfig: { outDir: string, [key: string]: unknown }) => void | Promise<void>

/**
 * Matches VitePress transformHtml hooks that can return rewritten HTML.
 * 匹配可以返回改写后 HTML 的 VitePress transformHtml 钩子。
 */
export type TransformHtml = (code: string, id: string, ctx: unknown) => string | void | Promise<string | void>

/**
 * Matches Vite's experimental renderBuiltUrl hook signature used by VitePress builds.
 * 匹配 VitePress 构建中使用的 Vite experimental.renderBuiltUrl 钩子签名。
 */
export type RenderBuiltUrl = (
  filename: string,
  context: RenderBuiltUrlContext,
) => string | { runtime: string } | { relative: boolean } | undefined

interface RenderBuiltUrlContext {
  ssr: boolean
  [key: string]: unknown
}
