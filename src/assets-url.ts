export const ASSET_EXTENSIONS = 'css|js|mjs|json|svg|png|jpe?g|gif|webp|ico|woff2?|ttf|otf|eot'

/**
 * Normalizes an assets base path so it is empty or always ends with a slash.
 * 规范化静态资源基础路径，确保它为空或以斜杠结尾。
 */
export function normalizeAssetsBase(assetsBase: string): string {
  const normalized = assetsBase.trim()
  if (!normalized) {
    return ''
  }

  return normalized.endsWith('/') ? normalized : `${normalized}/`
}

/**
 * Normalizes the VitePress page base so it can be stripped from generated asset URLs.
 * 规范化 VitePress 页面 base，便于从生成的资源 URL 中剥离。
 */
export function normalizePageBase(pageBase: string | undefined): string {
  const normalized = pageBase?.trim() ?? ''
  if (!normalized || normalized === '/') {
    return '/'
  }

  if (isExternalUrl(normalized)) {
    return normalizeAssetsBase(normalized)
  }

  return `/${normalized.replace(/^\/+/, '').replace(/\/+$/, '')}/`
}

/**
 * Prefixes a root-relative asset path with the configured assets base.
 * 给根路径静态资源加上配置的 assetsBase 前缀。
 */
export function withAssetsBase(path: string, assetsBase: string): string {
  const normalizedAssetsBase = normalizeAssetsBase(assetsBase)
  if (!normalizedAssetsBase || isExternalUrl(path) || path.startsWith(normalizedAssetsBase)) {
    return path
  }

  return `${normalizedAssetsBase}${path.replace(/^\/+/, '')}`
}

/**
 * Prefixes an asset path with assetsBase after removing the VitePress page base.
 * 从资源路径中移除 VitePress 页面 base 后，再加上 assetsBase 前缀。
 */
export function withAssetsBaseFromPageBase(path: string, assetsBase: string, pageBase: string): string {
  const normalizedPageBase = normalizePageBase(pageBase)
  if (normalizedPageBase !== '/' && !isExternalUrl(normalizedPageBase) && path.startsWith(normalizedPageBase)) {
    return withAssetsBase(`/${path.slice(normalizedPageBase.length)}`, assetsBase)
  }

  return withAssetsBase(path, assetsBase)
}

/**
 * Checks whether a path points to a root-relative static asset.
 * 判断路径是否指向根路径下的静态资源。
 */
export function isRootAssetPath(path: string): boolean {
  const rootAssetRE = new RegExp(`^/(?!/).+\\.(?:${ASSET_EXTENSIONS})(?:[?#].*)?$`)
  return rootAssetRE.test(path)
}

/**
 * Checks whether a path is already an absolute external URL.
 * 判断路径是否已经是绝对外部 URL。
 */
function isExternalUrl(path: string): boolean {
  return /^[a-z][a-z\d+\-.]*:/i.test(path) || path.startsWith('//')
}
