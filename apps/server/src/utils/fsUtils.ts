import { readFileSync } from 'node:fs'

export function readJsonSync<T = unknown>(file: string): T {
   const raw = readFileSync(file, 'utf8')
   return JSON.parse(raw) as T
}
