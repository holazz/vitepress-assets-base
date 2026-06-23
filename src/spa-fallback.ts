import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const APP_START = '<div id="app">'
const HASH_MAP_SCRIPT = '<script>window.__VP_HASH_MAP__'

/**
 * Converts VitePress index.html into a client-rendered fallback shell.
 * 将 VitePress 首页转换为客户端渲染的 fallback shell。
 */
export async function createSpaFallbackShell(outDir: string): Promise<void> {
  const indexFile = join(outDir, 'index.html')
  const html = await readFile(indexFile, 'utf8')
  const shell = createSpaFallbackShellHtml(html)

  if (shell !== html) {
    await writeFile(indexFile, shell)
  }
}

function createSpaFallbackShellHtml(html: string): string {
  const appStart = html.indexOf(APP_START)
  if (appStart < 0) {
    return html
  }

  const stateScriptStart = html.indexOf(HASH_MAP_SCRIPT, appStart)
  if (stateScriptStart < 0) {
    return html
  }

  const lineStart = html.lastIndexOf('\n', stateScriptStart)
  const replaceEnd = lineStart >= appStart ? lineStart + 1 : stateScriptStart

  return `${html.slice(0, appStart)}${APP_START}</div>\n${html.slice(replaceEnd)}`
}
