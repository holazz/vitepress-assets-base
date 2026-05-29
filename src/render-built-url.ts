import type { RenderBuiltUrl } from './types'
import { withAssetsBase } from './assets-url'

/**
 * Creates a Vite renderBuiltUrl hook that serves client assets from assetsBase.
 * 创建 Vite renderBuiltUrl 钩子，让客户端资源从 assetsBase 加载。
 */
export function createRenderBuiltUrl(assetsBase: string, originalRenderBuiltUrl?: RenderBuiltUrl): RenderBuiltUrl {
  // Preserves SSR URLs and any explicit result from the original hook.
  // 保留 SSR URL 以及原始钩子明确返回的结果。
  return (filename: string, context: Parameters<RenderBuiltUrl>[1]) => {
    const originalResult = originalRenderBuiltUrl?.(filename, context)
    if (context.ssr) {
      return originalResult
    }

    return originalResult ?? withAssetsBase(`/${filename}`, assetsBase)
  }
}
