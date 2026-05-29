import type { TransformContext } from './types'
import { withAssetsBase } from './assets-url'

/**
 * Creates a Vite plugin that rewrites VitePress runtime asset lookups.
 * 创建 Vite 插件，用于改写 VitePress 运行时的静态资源查找逻辑。
 */
export function createVitePressRuntimeAssetsBasePlugin(assetsBase: string) {
  const { pageChunkPath, assetsPageChunkPath } = createPageChunkReplacements()

  return {
    name: 'vitepress-assets-base',
    enforce: 'pre' as const,
    // Rewrites selected VitePress client modules before the normal Vite transform pipeline runs.
    // 在常规 Vite 转换流程前改写指定的 VitePress 客户端模块。
    transform(this: TransformContext, code: string, id: string): string | undefined {
      const normalizedId = id.replace(/\\/g, '/')

      if (normalizedId.includes('/vitepress/dist/client/app/utils.js')) {
        let next = code
        // Share the configured assetsBase across withBase() and pathToFile().
        // 在 withBase() 和 pathToFile() 之间共享配置的 assetsBase。
        next = replaceOrReport(
          this,
          next,
          'export { escapeHtml as _escapeHtml, inBrowser } from \'../shared\';',
          `export { escapeHtml as _escapeHtml, inBrowser } from '../shared';\nconst assetsBase = ${JSON.stringify(assetsBase)};`,
          'failed to inject assetsBase into VitePress utils runtime',
        )
        // withBase() is also used by theme components such as VPImage.
        // withBase() 也会被 VPImage 这类主题组件调用。
        // Keep already rewritten asset URLs from being prefixed by the page base again.
        // 避免已经改写到 assetsBase 下的资源 URL 再次被页面 base 前缀污染。
        next = replaceOrReport(
          this,
          next,
          'return EXTERNAL_URL_RE.test(path) || !path.startsWith(\'/\')',
          'return EXTERNAL_URL_RE.test(path) || !path.startsWith(\'/\') || path.startsWith(assetsBase)',
          'failed to keep assetsBase URLs unchanged in VitePress withBase runtime',
        )
        // pathToFile() resolves markdown chunks after in-site navigation and normally follows base.
        // pathToFile() 负责站内跳转后的 markdown chunk 地址，默认跟随 base。
        next = replaceOrReport(
          this,
          next,
          pageChunkPath,
          assetsPageChunkPath,
          'failed to rewrite VitePress dynamic page chunk path',
        )
        return next
      }

      if (normalizedId.includes('/vitepress/dist/client/app/router.js')) {
        // VitePress refetches hashmap.json after route load failures and normally follows base.
        // 路由加载失败后 VitePress 会重新请求 hashmap.json，默认也跟随 base。
        // Use assetsBase so the fallback request does not hit the page route root.
        // 改用 assetsBase，避免 fallback 请求打到页面路由根路径。
        return replaceOrReport(
          this,
          code,
          /fetch\(\s*siteDataRef\.value\.base\s*\+\s*['"]hashmap\.json['"]\s*\)/,
          `fetch(${JSON.stringify(withAssetsBase('/hashmap.json', assetsBase))})`,
          'failed to rewrite VitePress hashmap.json fallback request',
        )
      }
    },
  }
}

/**
 * Builds the VitePress page chunk template strings used for runtime replacement.
 * 构造运行时替换需要用到的 VitePress 页面 chunk 模板字符串。
 */
function createPageChunkReplacements(): {
  pageChunkPath: string
  assetsPageChunkPath: string
} {
  // Build template literals from VitePress source without triggering interpolation here.
  // 构造 VitePress 源码中的模板字符串字面量，避免在本插件代码里直接触发模板插值。
  // Creates placeholders like ${pagePath} as plain strings.
  // 以普通字符串形式创建类似 ${pagePath} 的占位符。
  const templateVar = (name: string) => ['$', '{', name, '}'].join('')
  const pageChunkPath = [
    '`',
    templateVar('base'),
    templateVar('__ASSETS_DIR__'),
    '/',
    templateVar('pagePath'),
    '.',
    templateVar('pageHash'),
    '.js',
    '`',
  ].join('')
  const assetsPageChunkPath = [
    '`',
    templateVar('assetsBase'),
    templateVar('__ASSETS_DIR__'),
    '/',
    templateVar('pagePath'),
    '.',
    templateVar('pageHash'),
    '.js',
    '`',
  ].join('')

  return {
    assetsPageChunkPath,
    pageChunkPath,
  }
}

/**
 * Replaces code when possible and reports a build error when it fails.
 * 尽可能替换代码；失败时报告构建错误。
 */
function replaceOrReport(
  context: TransformContext,
  code: string,
  search: string | RegExp,
  replacement: string,
  message: string,
): string {
  const next = code.replace(search, replacement)
  if (next !== code) {
    return next
  }

  const pluginMessage = `[vitepress-assets-base] ${message}`
  context.error(pluginMessage)
  return code
}
