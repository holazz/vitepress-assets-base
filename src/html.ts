import type { TransformHtml } from './types'
import { ASSET_EXTENSIONS, withAssetsBaseFromPageBase } from './assets-url'

/**
 * Rewrites root-relative HTML asset URLs to use the configured assets base.
 * 将 HTML 中的根路径静态资源 URL 改写为使用配置的 assetsBase。
 */
export function rewriteHtmlAssetUrls(html: string, assetsBase: string, pageBase: string): string {
  const htmlAssetRE = new RegExp(`\\b(href|src)=("|')(/(?!/)[^"'?#]+\\.(?:${ASSET_EXTENSIONS})(?:[?#][^"']*)?)\\2`, 'g')

  // Preserves the original attribute and quote style while replacing the URL.
  // 替换 URL 时保留原始属性名和引号风格。
  return html.replace(htmlAssetRE, (_match, attr: string, quote: string, path: string) => {
    return `${attr}=${quote}${withAssetsBaseFromPageBase(path, assetsBase, pageBase)}${quote}`
  })
}

/**
 * Runs the original VitePress transformHtml hook when one is configured.
 * 如果用户配置了原始 VitePress transformHtml 钩子，则先执行它。
 */
export async function callTransformHtml(
  transformHtml: TransformHtml | undefined,
  args: Parameters<TransformHtml>,
): Promise<string | void> {
  if (!transformHtml) {
    return
  }

  return transformHtml(...args)
}
