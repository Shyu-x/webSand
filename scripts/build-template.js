/**
 * WebContainer-compatible build script using esbuild
 * Pure JavaScript - no native bindings
 */

import * as esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const template = process.argv[2] || 'react'
const mode = process.argv[3] || 'development'

const config = {
  react: {
    entry: 'src/main.jsx',
    outdir: 'dist',
    define: { 'process.env.NODE_ENV': '"development"' }
  },
  vue: {
    entry: 'src/main.js',
    outdir: 'dist',
    define: { 'process.env.NODE_ENV': '"development"' }
  }
}

const cfg = config[template]
if (!cfg) {
  console.error(`Unknown template: ${template}`)
  process.exit(1)
}

const ctx = await esbuild.context({
  entryPoints: [cfg.entry],
  bundle: true,
  outdir: cfg.outdir,
  format: 'esm',
  platform: 'browser',
  target: ['es2020'],
  loader: {
    '.js': 'jsx',
    '.jsx': 'jsx',
    '.vue': 'jsx'
  },
  define: cfg.define,
  sourcemap: true,
  minify: mode === 'production'
})

if (mode === 'development') {
  await ctx.watch()
  console.log(`Watching ${template}...`)
} else {
  await ctx.rebuild()
  await ctx.dispose()
  console.log(`Built ${template}`)
}
