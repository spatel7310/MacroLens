import express, { type Express } from 'express'
import { existsSync } from 'node:fs'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from './config.js'

// src/ and dist/ sit at the same depth, so this also works outside the repo cwd.
const clientDirectory = fileURLToPath(new URL('../../client/dist/', import.meta.url))
const indexFile = resolve(clientDirectory, 'index.html')

export function serveFrontend(app: Express) {
  if (!existsSync(indexFile)) {
    if (config.nodeEnv === 'production') {
      throw new Error('Frontend build is missing. Run npm run build from the repository root before starting MacroLens.')
    }
    // Development uses Vite and its API/WebSocket proxy.
    return
  }

  app.use(express.static(clientDirectory, {
    index: false,
    setHeaders(res, filePath) {
      // Only Vite's fingerprinted assets get a long lifetime. HTML and the
      // service worker must revalidate so browsers can discover deployments.
      const fingerprinted = dirname(filePath) === resolve(clientDirectory, 'assets')
      res.setHeader('Cache-Control', fingerprinted
        ? 'public, max-age=31536000, immutable'
        : 'no-cache')
    },
  }))

  app.get('/{*path}', (req, res, next) => {
    // Missing assets and plain HTTP requests to /ws remain real 404s.
    if (req.path === '/ws' || req.path.startsWith('/ws/') ||
        req.path.startsWith('/assets/') ||
        req.path.split('/').some(segment => segment.startsWith('.')) ||
        extname(req.path) || !req.accepts('html')) {
      next()
      return
    }
    res.setHeader('Cache-Control', 'no-cache')
    res.sendFile(indexFile)
  })
}
