import type { UserConfig as VitePressUserConfig } from 'vitepress'
import type { DefaultTheme } from 'vitepress/theme'

export interface VitePressAssetsBaseOptions {
  assetsBase?: string
}

export type VitePressAssetsBaseConfig<ThemeConfig = DefaultTheme.Config> = VitePressUserConfig<ThemeConfig>
  & VitePressAssetsBaseOptions

export interface VitePressAssetsBaseRuntimeConfig extends VitePressAssetsBaseOptions {
  [key: string]: unknown
  base?: string
  themeConfig?: unknown
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

export interface TransformContext {
  /**
   * Reports a fatal transform error through Vite.
   * 通过 Vite 报告一个致命转换错误。
   */
  error: (message: string) => never
}

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
