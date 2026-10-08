import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import WebSocket from 'ws'

test('one server serves the frontend, API, and WebSocket', { timeout: 20000 }, async (t) => {
  const server = spawn(process.execPath, [fileURLToPath(new URL('../server/dist/index.js', import.meta.url))], {
    // Deliberately start outside the repository to exercise path resolution.
    cwd: '/tmp',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: '0',
      FINNHUB_API_KEY: '',
      FRED_API_KEY: '',
      ALPHA_VANTAGE_API_KEY: '',
      HUD_USER_TOKEN: '',
      CENSUS_API_KEY: '',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  t.after(async () => {
    if (server.exitCode === null && server.signalCode === null) {
      const exited = once(server, 'exit')
      server.kill('SIGTERM')
      await exited
    }
  })
  const port = await new Promise((resolve, reject) => {
    let output = ''
    const timer = setTimeout(() => reject(new Error('Server startup timed out')), 10000)
    server.on('error', error => { clearTimeout(timer); reject(error) })
    server.on('exit', () => { clearTimeout(timer); reject(new Error('Server exited before startup')) })
    server.stdout.on('data', chunk => {
      output += chunk
      const match = output.match(/Server running on port (\d+)/)
      if (match) { clearTimeout(timer); resolve(match[1]) }
    })
  })
  const base = `http://127.0.0.1:${port}`
  const home = await fetch(base)
  assert.equal(home.status, 200)
  assert.match(home.headers.get('content-type'), /text\/html/)
  assert.equal(home.headers.get('cache-control'), 'no-cache')
  const html = await home.text()
  assert.match(html, /id="root"/)

  const assetPath = html.match(/src="(\/assets\/[^" ]+\.js)"/)?.[1]
  assert.ok(assetPath, 'HTML references a compiled JavaScript asset')
  const asset = await fetch(base + assetPath)
  assert.equal(asset.status, 200)
  assert.match(asset.headers.get('content-type'), /javascript/)
  assert.match(asset.headers.get('cache-control'), /immutable/)

  const navigation = await fetch(base + '/dashboard/saved', { headers: { accept: 'text/html' } })
  assert.equal(navigation.status, 200)
  assert.equal(await navigation.text(), html)
  const health = await fetch(base + '/api/health')
  assert.equal(health.status, 200)
  assert.equal((await health.json()).status, 'ok')
  const unknownApi = await fetch(base + '/api/not-a-route', { headers: { accept: 'text/html' } })
  assert.equal(unknownApi.status, 404)
  assert.match(unknownApi.headers.get('content-type'), /json/)

  for (const path of ['/assets/missing.js', '/missing.png', '/ws', '/.env']) {
    const response = await fetch(base + path, { headers: { accept: 'text/html' } })
    assert.equal(response.status, 404, path)
    assert.notEqual(await response.text(), html, path)
  }
  assert.equal((await fetch(base + '/dashboard', { method: 'POST' })).status, 404)
  for (const path of ['/sw.js', '/manifest.webmanifest']) {
    const response = await fetch(base + path)
    assert.equal(response.status, 200, path)
    assert.equal(response.headers.get('cache-control'), 'no-cache', path)
  }

  const socket = new WebSocket(`ws://127.0.0.1:${port}/ws`)
  t.after(() => socket.terminate())
  await once(socket, 'open')
  const closed = once(socket, 'close')
  socket.close()
  await closed
})
