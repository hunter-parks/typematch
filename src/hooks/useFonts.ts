import { useEffect, useState } from 'react'
import { cssFamily, type FontSelection } from '../data/fonts'
import { googleFontsUrl } from '../lib/fontExport'

interface FontRequest { promise: Promise<void>; link: HTMLLinkElement; users: number; settled: boolean }
const requests = new Map<string, FontRequest>()
const MAX_STYLESHEETS = 8
function prune() {
  for (const [url, request] of requests) {
    if (requests.size <= MAX_STYLESHEETS) break
    if (request.users === 0 && request.settled) { request.link.remove(); requests.delete(url) }
  }
}
function acquireFonts(url: string, fonts: FontSelection[]) {
  let entry = requests.get(url)
  if (!entry) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    link.dataset.typematchFont = 'true'
    entry = { link, users: 0, settled: false, promise: Promise.resolve() }
    const request = entry
    request.promise = new Promise<void>((resolve, reject) => {
      let finished = false
      const finish = (failed: boolean) => {
        if (finished) return
        finished = true
        clearTimeout(timeout)
        request.settled = true
        link.onload = link.onerror = null
        if (failed) { link.remove(); requests.delete(url); reject(new Error('Fonts could not be loaded.')) } else resolve()
        prune()
      }
      const timeout = window.setTimeout(() => finish(true), 15000)
      link.onerror = () => finish(true)
      link.onload = () => {
        if (!document.fonts) { finish(false); return }
        Promise.all(fonts.map(font => document.fonts.load(`${font.style} ${font.weight} 16px ${cssFamily(font.family)}`)))
          .then(() => finish(false), () => finish(true))
      }
      document.head.append(link)
    })
    requests.set(url, request)
  } else { requests.delete(url); requests.set(url, entry) }
  entry.users++
  const acquired = entry
  return { promise: acquired.promise, release: () => { acquired.users--; prune() } }
}
export function useFonts(fonts: FontSelection[]) {
  const url = googleFontsUrl(fonts)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ key: '', status: 'loading' as 'loading' | 'ready' | 'error' })
  const key = `${url}:${attempt}`
  useEffect(() => {
    let current = true
    let release: (() => void) | undefined
    // Coalesce quick keyboard changes before requesting another font file.
    const timer = window.setTimeout(() => {
      const request = acquireFonts(url, fonts)
      release = request.release
      request.promise.then(
        () => { if (current) setResult({ key, status: 'ready' }) },
        () => { if (current) setResult({ key, status: 'error' }) },
      )
    }, 120)
    return () => { current = false; clearTimeout(timer); release?.() }
    // The URL fully describes the requested faces, independent of object identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return { status: result.key === key ? result.status : 'loading', retry: () => setAttempt(value => value + 1) }
}
