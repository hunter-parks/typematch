import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { selected } from '../test/catalogFixture'
import { useFonts } from './useFonts'

afterEach(() => vi.useRealTimers())
it('ignores obsolete responses, retries failures and bounds retained stylesheets', async () => {
  vi.useFakeTimers()
  const { result, rerender, unmount } = renderHook(({ weight }) => useFonts([selected('Roboto Flex', weight)]), { initialProps: { weight: 400 } })
  const latest = () => [...document.querySelectorAll<HTMLLinkElement>('link[data-typematch-font]')].at(-1)!
  await act(async () => vi.advanceTimersByTime(125))
  const old = latest()
  rerender({ weight: 500 })
  await act(async () => vi.advanceTimersByTime(125))
  act(() => old.dispatchEvent(new Event('load')))
  expect(result.current.status).toBe('loading')
  await act(async () => latest().dispatchEvent(new Event('error')))
  expect(result.current.status).toBe('error')
  act(() => result.current.retry())
  expect(result.current.status).toBe('loading')
  await act(async () => vi.advanceTimersByTime(125))
  await act(async () => latest().dispatchEvent(new Event('load')))
  expect(result.current.status).toBe('ready')
  for (const weight of [600, 700, 800, 900, 1000, 300, 200, 100, 450]) {
    rerender({ weight })
    await act(async () => vi.advanceTimersByTime(125))
    await act(async () => latest().dispatchEvent(new Event('load')))
  }
  expect(document.querySelectorAll('link[data-typematch-font]').length).toBeLessThanOrEqual(8)
  unmount()
})
