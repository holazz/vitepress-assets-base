import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { isExternalUrl, normalizePageBase } from './assets-url'

interface HtmlSnapshot {
  content: Uint8Array
  relativePath: string
}

/**
 * Mirrors generated HTML files under the configured VitePress base path.
 * 将生成的 HTML 页面镜像到 VitePress base 对应目录下。
 */
export async function mirrorHtmlToBase(outDir: string, pageBase: string): Promise<void> {
  const normalizedPageBase = normalizePageBase(pageBase)
  if (normalizedPageBase === '/' || isExternalUrl(normalizedPageBase)) {
    return
  }

  const mountPath = normalizedPageBase.replace(/^\/+|\/+$/g, '')
  if (!mountPath) {
    return
  }

  const root = resolve(outDir)
  const mountDir = resolve(root, mountPath)
  const snapshots = await collectHtmlSnapshots(root)

  await removeHtmlFiles(mountDir)

  await Promise.all(snapshots.map(async (snapshot) => {
    const target = resolve(mountDir, snapshot.relativePath)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, snapshot.content)
  }))
}

/**
 * Reads generated HTML files before rewriting the base directory.
 * 在重写 base 目录前读取所有 HTML 文件快照。
 */
async function collectHtmlSnapshots(root: string): Promise<HtmlSnapshot[]> {
  const files = await walkHtmlFiles(root)

  return Promise.all(files.map(async file => ({
    content: await readFile(file),
    relativePath: relative(root, file).replace(/\\/g, '/'),
  })))
}

/**
 * Walks the output directory and returns HTML files.
 * 遍历输出目录并返回 HTML 文件。
 */
async function walkHtmlFiles(dir: string): Promise<string[]> {
  const entries = await readDirSafe(dir)
  const files = await Promise.all(entries.map(async (entry) => {
    const file = join(dir, entry.name)

    if (entry.isDirectory()) {
      return walkHtmlFiles(file)
    }

    if (entry.isFile() && file.endsWith('.html')) {
      return [file]
    }

    return []
  }))

  return files.flat()
}

/**
 * Removes stale HTML files from the base directory while keeping other assets.
 * 清理 base 目录下旧的 HTML 文件，同时保留其他静态资源。
 */
async function removeHtmlFiles(dir: string): Promise<void> {
  const entries = await readDirSafe(dir)

  await Promise.all(entries.map(async (entry) => {
    const file = join(dir, entry.name)

    if (entry.isDirectory()) {
      await removeHtmlFiles(file)
      return
    }

    if (entry.isFile() && file.endsWith('.html')) {
      await rm(file, { force: true })
    }
  }))
}

async function readDirSafe(dir: string) {
  try {
    return await readdir(dir, { withFileTypes: true })
  } catch (error) {
    if (isNotFoundError(error)) {
      return []
    }

    throw error
  }
}

function isNotFoundError(error: unknown): boolean {
  return isErrorWithCode(error) && error.code === 'ENOENT'
}

function isErrorWithCode(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error
}
