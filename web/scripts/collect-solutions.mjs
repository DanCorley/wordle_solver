import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const dataDir = join(import.meta.dirname, '..', '..', 'data')
const cacheDir = join(dataDir, 'wordle')
const output = join(dataDir, 'solutions.txt')

const words = new Set(
  (await readFile(output, 'utf8').catch(() => ''))
    .trim()
    .split(/\s+/)
    .filter(Boolean),
)

const files = (await readdir(cacheDir).catch(() => [])).filter((file) =>
  file.endsWith('.json'),
)

for (const file of files) {
  try {
    const { solution } = JSON.parse(await readFile(join(cacheDir, file), 'utf8'))
    if (typeof solution === 'string' && /^[a-z]{5}$/.test(solution)) words.add(solution)
  } catch {
    console.warn(`collect-solutions: skipped ${file}`)
  }
}

const body = words.size ? `${[...words].sort().join('\n')}\n` : ''
const current = await readFile(output, 'utf8').catch(() => '')

if (current !== body) {
  await writeFile(output, body)
  console.log(`collect-solutions: wrote ${words.size} words`)
}
