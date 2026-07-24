import assert from 'node:assert/strict'

process.env.NODE_ENV = 'production'
const { default: app } = await import('./index.js')

const server = app.listen(0, '127.0.0.1')
await new Promise((resolve) => server.once('listening', resolve))

const { port } = server.address()
const baseUrl = `http://127.0.0.1:${port}`

try {
  const health = await fetch(`${baseUrl}/api/health`)
  assert.equal(health.status, 200)
  assert.ok(health.headers.get('content-security-policy'))
  assert.equal(health.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(health.headers.get('x-frame-options'), 'SAMEORIGIN')

  const allowedCors = await fetch(`${baseUrl}/api/health`, {
    method: 'OPTIONS',
    headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'GET' },
  })
  assert.equal(allowedCors.headers.get('access-control-allow-origin'), 'http://localhost:5173')

  const invalidInput = await fetch(`${baseUrl}/api/legal/advice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ situation: 'short', category: 'General' }),
  })
  assert.equal(invalidInput.status, 400)

  const unknownField = await fetch(`${baseUrl}/api/legal/advice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ situation: 'This situation is sufficiently detailed', category: 'General', admin: true }),
  })
  assert.equal(unknownField.status, 400)

  const oversizedBody = await fetch(`${baseUrl}/api/legal/advice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ situation: 'a'.repeat(11_000), category: 'General' }),
  })
  assert.equal(oversizedBody.status, 413)
  assert.deepEqual(await oversizedBody.json(), { error: 'Request payload is too large.' })

  const fakePdf = new FormData()
  fakePdf.append('document', new Blob(['<svg>not a pdf</svg>'], { type: 'application/pdf' }), 'fake.pdf')
  const fakePdfResponse = await fetch(`${baseUrl}/api/document/scan`, { method: 'POST', body: fakePdf })
  assert.equal(fakePdfResponse.status, 400)
  assert.match((await fakePdfResponse.json()).error, /does not match/i)

  const limitedStatuses = []
  for (let index = 0; index < 10; index += 1) {
    const response = await fetch(`${baseUrl}/api/legal/advice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ situation: 'short', category: 'General' }),
    })
    limitedStatuses.push(response.status)
  }
  assert.ok(limitedStatuses.includes(429))

  console.log('Security smoke test passed:', {
    helmet: true,
    cors: true,
    validation: true,
    strictSchemas: true,
    requestSizeLimit: true,
    fileSignatures: true,
    rateLimiting: true,
  })
} finally {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
}
