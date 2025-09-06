#!/usr/bin/env node
// save as: scripts/collect-types.ts
// usage: npx tsx scripts/collect-types.ts ./src [--format=json] [--includePrivate]

import fs from 'node:fs'
import path from 'node:path'
import * as ts from 'typescript'

type Format = 'md' | 'json';

const args = process.argv.slice(2)
if (args.length === 0) {
   console.error('Provide a directory, e.g. npx tsx scripts/collect-types.ts ./src')
   process.exit(1)
}
const rootDir = path.resolve(args[0])
const format: Format = (args.includes('--format=json') ? 'json' : 'md')
const includePrivate = args.includes('--includePrivate')

const EXT = new Set(['.ts', '.tsx', '.d.ts'])
const IGNORE_DIRS = new Set([
   'node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.turbo', '.output',
])

type TypeDef = {
   file: string;
   kind: 'type' | 'interface' | 'enum';
   name: string;
   exported: boolean;
   text: string;
   line: number;
   column: number;
};

function* walk(dir: string): Generator<string> {
   const entries = fs.readdirSync(dir, { withFileTypes: true })
   for (const e of entries) {
      if (e.isDirectory()) {
         if (!IGNORE_DIRS.has(e.name)) yield* walk(path.join(dir, e.name))
      } else {
         const ext = path.extname(e.name)
         if (EXT.has(ext)) yield path.join(dir, e.name)
      }
   }
}

function isExported(node: ts.Node): boolean {
   return !!node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
}

function srcKind(node: ts.Node): TypeDef['kind'] | null {
   if (ts.isTypeAliasDeclaration(node)) return 'type'
   if (ts.isInterfaceDeclaration(node)) return 'interface'
   if (ts.isEnumDeclaration(node)) return 'enum'
   return null
}

function nameOf(node: ts.Node): string {
   // All handled nodes have a name
   // @ts-expect-error TS can't refine here easily
   return node.name?.getText() ?? '(anonymous)'
}

function collectFromFile(file: string): TypeDef[] {
   const text = fs.readFileSync(file, 'utf8')
   const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)

   const defs: TypeDef[] = []
   const visit = (node: ts.Node) => {
      const k = srcKind(node)
      if (k) {
         const exported = isExported(node)
         if (exported || includePrivate) {
            const start = node.getStart(sf)
            const end = node.getEnd()
            const snippet = text.slice(start, end)
            const { line, character } = sf.getLineAndCharacterOfPosition(start)
            defs.push({
               file,
               kind: k,
               name: nameOf(node),
               exported,
               text: snippet,
               line: line + 1,
               column: character + 1,
            })
         }
      }
      ts.forEachChild(node, visit)
   }
   visit(sf)
   return defs
}

function run() {
   const all: TypeDef[] = []
   for (const f of walk(rootDir)) {
      all.push(...collectFromFile(f))
   }

   if (format === 'json') {
      console.log(JSON.stringify(all, null, 2))
      return
   }

   // markdown
   let out = `# Type definitions in \`${path.relative(process.cwd(), rootDir) || rootDir}\`\n\n`
   const byFile = new Map<string, TypeDef[]>()
   for (const d of all) {
      const list = byFile.get(d.file) ?? []
      list.push(d)
      byFile.set(d.file, list)
   }
   for (const [file, defs] of [...byFile.entries()].sort()) {
      out += `## ${path.relative(process.cwd(), file)}\n\n`
      for (const d of defs.sort((a, b) => a.line - b.line)) {
         const exportTag = d.exported ? 'exported' : 'local'
         out += `- \`${d.kind}\` **${d.name}** (${exportTag}) @ ${d.line}:${d.column}\n\n`
         out += '```ts\n' + d.text + '\n```\n\n'
      }
   }
   console.log(out)
}

run()
