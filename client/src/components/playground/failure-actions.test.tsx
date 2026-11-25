// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import { I18nProvider } from '@/i18n'
import { copyText } from '@/lib/clipboard'
import { FailureActions } from './failure-actions'

vi.mock('@/lib/clipboard', () => ({ copyText: vi.fn().mockResolvedValue(true) }))

it('copies the failure details and includes the question only after opt-in', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  const host = document.createElement('div')
  const root = createRoot(host)
  const onRetry = vi.fn()
  try {
    await act(() => root.render(<I18nProvider initialLocale="en">
      <FailureActions message={{ role: 'assistant', isError: true, content: 'Quota exceeded',
        diagnostic: { timestamp: '2026-11-25T09:00:00Z', requestedModel: 'auto', httpStatus: 429,
          route: 'provider/model', fallbackAttempts: 2 } }}
        question="Private question" disabled={false} onRetry={onRetry} />
    </I18nProvider>))
    const [retry, copy] = host.querySelectorAll('button')
    await act(async () => copy.click())
    const report = vi.mocked(copyText).mock.calls[0][0]
    for (const value of ['Quota exceeded', 'auto', '429', 'provider/model', '2026-11-25', 'Fallback attempts: 2']) {
      expect(report).toContain(value)
    }
    expect(report).not.toContain('Private question')
    await act(async () => host.querySelector('input')!.click())
    await act(async () => copy.click())
    expect(copyText).toHaveBeenLastCalledWith(expect.stringContaining('Private question'))
    retry.click()
    expect(onRetry).toHaveBeenCalledOnce()
  } finally {
    await act(() => root.unmount())
  }
})
