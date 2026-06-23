import type {
  BuildEnd,
  TransformHtml,
  VitePressAssetsBaseConfig,
  VitePressAssetsBaseOptions,
  VitePressAssetsBaseRuntimeConfig,
} from './types'
import { normalizeAssetsBase } from './assets-url'
import { callTransformHtml, rewriteHtmlAssetUrls } from './html'
import { createRenderBuiltUrl } from './render-built-url'
import { createVitePressRuntimeAssetsBasePlugin } from './runtime-plugin'
import { createSpaFallbackShell } from './spa-fallback'
import { rewriteThemeConfigAssets } from './theme'

/**
 * Wraps a VitePress config so generated assets can be served from a separate base URL.
 * 包装 VitePress 配置，让生成的静态资源可以从独立的基础路径加载。
 */
export function withVitePressAssetsBase(config: VitePressAssetsBaseConfig): any
export function withVitePressAssetsBase(config: VitePressAssetsBaseOptions): unknown {
  const sourceConfig = config as VitePressAssetsBaseRuntimeConfig
  const { assetsBase: rawAssetsBase, spaFallback = false, ...vitePressConfig } = sourceConfig
  const assetsBase = normalizeAssetsBase(rawAssetsBase ?? '')
  const pageBase = typeof sourceConfig.base === 'string' ? sourceConfig.base : '/'
  const originalBuildEnd = sourceConfig.buildEnd
  const originalTransformHtml = sourceConfig.transformHtml
  const originalRenderBuiltUrl = sourceConfig.vite?.experimental?.renderBuiltUrl

  const baseConfig = {
    ...vitePressConfig,
    buildEnd: async (...args: Parameters<BuildEnd>): Promise<void> => {
      const [siteConfig] = args
      await originalBuildEnd?.(...args)
      if (spaFallback) {
        await createSpaFallbackShell(siteConfig.outDir)
      }
    },
  }

  if (!assetsBase) {
    return baseConfig
  }

  return {
    ...baseConfig,
    themeConfig: rewriteThemeConfigAssets(sourceConfig.themeConfig, assetsBase),
    // Runs the original hook first, then rewrites any root-relative asset URLs it returns.
    // 先执行原始钩子，再改写它返回内容中的根路径静态资源 URL。
    transformHtml: async (...args: Parameters<TransformHtml>): Promise<string | void> => {
      const [code] = args
      const transformed = await callTransformHtml(originalTransformHtml, args)
      return rewriteHtmlAssetUrls(transformed ?? code, assetsBase, pageBase)
    },
    vite: {
      ...sourceConfig.vite,
      experimental: {
        ...sourceConfig.vite?.experimental,
        renderBuiltUrl: createRenderBuiltUrl(assetsBase, originalRenderBuiltUrl),
      },
      plugins: [
        createVitePressRuntimeAssetsBasePlugin(assetsBase, { spaFallback }),
        ...(sourceConfig.vite?.plugins ?? []),
      ],
    },
  }
}

export type { VitePressAssetsBaseOptions }
