import { useEffect, useState } from 'react'
import type { FontFamily } from '../data/fonts'
import { googleFontsUrl } from '../lib/fontExport'

const requests = new Map<string, Promise<void>>()

function loadFonts(url: string, fonts: FontFamily[]): Promise<void> {
  const existing = requests.get(url)
  if (existing) return existing
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  const request = new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => fail(), 15000)
    const fail = () => {
      clearTimeout(timeout)
      link.remove()
      requests.delete(url)
      reject(new Error('Fonts could not be loaded.'))
    }
    link.onerror = fail
    link.onload = () => {
      if (!document.fonts) { clearTimeout(timeout); resolve(); return }
      Promise.all(fonts.flatMap(font => font.weights.map(weight => document.fonts.load(`${weight} 16px "${font.family}"`))))
        .then(() => { clearTimeout(timeout); resolve() }, fail)
    }
    document.head.append(link)
  })
  requests.set(url, request)
  return request
}

export function useFonts(fonts: FontFamily[]) {
  const url = googleFontsUrl(fonts)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ url: '', status: 'loading' as 'loading' | 'ready' | 'error' })
  useEffect(() => {
    let current = true
    loadFonts(url, fonts).then(
      () => { if (current) setResult({ url, status: 'ready' }) },
      () => { if (current) setResult({ url, status: 'error' }) },
    )
    return () => { current = false }
    // The URL includes every family and weight; equivalent font objects need no reload.
  }, [url, attempt])
  return { status: result.url === url ? result.status : 'loading', retry: () => setAttempt(value => value + 1) }
}
