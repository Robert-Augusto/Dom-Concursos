import { copyFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const candidates = [
  join(root, 'node_modules/react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs'),
  join(root, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs'),
]
const dest = join(root, 'public/pdf.worker.min.mjs')

const src = candidates.find((path) => existsSync(path))
if (!src) {
  console.warn('[copy-pdf-worker] pdf.worker.min.mjs not found; skip.')
  process.exit(0)
}

copyFileSync(src, dest)
console.log('[copy-pdf-worker] Copied worker to public/pdf.worker.min.mjs')
