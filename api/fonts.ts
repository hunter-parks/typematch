import type { IncomingMessage, ServerResponse } from 'node:http'
import { fetchCatalog } from '../server/fontCatalog.ts'

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    response.statusCode = 405
    response.end(JSON.stringify({ error: 'Use GET' }))
    return
  }
  try {
    const catalog = await fetchCatalog()
    response.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400')
    response.end(JSON.stringify(catalog))
  } catch {
    response.statusCode = 503
    response.setHeader('Cache-Control', 'no-store')
    response.end(JSON.stringify({ error: 'Catalog refresh unavailable. Use the saved catalog.' }))
  }
}
