import { isRootAssetPath, withAssetsBase } from './assets-url'

/**
 * Rewrites supported VitePress theme asset paths to use the configured assets base.
 * 改写支持的 VitePress 主题资源路径，让它们使用配置的 assetsBase。
 */
export function rewriteThemeConfigAssets<ThemeConfig>(themeConfig: ThemeConfig, assetsBase: string): ThemeConfig {
  if (!isRecord(themeConfig)) {
    return themeConfig
  }

  const nextThemeConfig: Record<string, unknown> = { ...themeConfig }
  nextThemeConfig.logo = rewriteThemeImage(nextThemeConfig.logo, assetsBase)
  return nextThemeConfig as ThemeConfig
}

/**
 * Rewrites string and object forms of the VitePress theme logo image.
 * 改写 VitePress 主题 logo 的字符串形式和对象形式。
 */
function rewriteThemeImage(image: unknown, assetsBase: string): unknown {
  if (typeof image === 'string') {
    return rewriteRootAssetPath(image, assetsBase)
  }

  if (!isRecord(image)) {
    return image
  }

  const nextImage: Record<string, unknown> = { ...image }
  for (const key of ['src', 'light', 'dark']) {
    if (typeof nextImage[key] === 'string') {
      nextImage[key] = rewriteRootAssetPath(nextImage[key], assetsBase)
    }
  }
  return nextImage
}

/**
 * Rewrites a path only when it is a root-relative asset path.
 * 仅在路径是根路径静态资源时进行改写。
 */
function rewriteRootAssetPath(path: string, assetsBase: string): string {
  return isRootAssetPath(path) ? withAssetsBase(path, assetsBase) : path
}

/**
 * Checks whether a value is a plain object-like record.
 * 判断一个值是否是普通对象形式的记录。
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
