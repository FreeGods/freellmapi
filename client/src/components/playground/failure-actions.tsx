import { useState } from 'react'
import { useI18n } from '@/i18n'
import { copyText } from '@/lib/clipboard'
import { toast } from '@/lib/toast'
import type { ChatMessage } from '@/lib/playground-conversations'

export function FailureActions({ message, question, disabled, onRetry }: {
  message: ChatMessage
  question?: string
  disabled: boolean
  onRetry: () => void
}) {
  const { t } = useI18n()
  const [includeQuestion, setIncludeQuestion] = useState(false)

  async function copyDiagnostic() {
    const info = message.diagnostic
    const report = [
      '## ' + t('playground.diagnosticTitle'),
      info && t('playground.timeLabel') + ': ' + info.timestamp,
      info && t('playground.requestedModelLabel') + ': ' + info.requestedModel,
      info?.httpStatus && 'HTTP: ' + info.httpStatus,
      info?.route && t('playground.routeLabel') + ': ' + info.route,
      info?.fallbackAttempts != null && t('playground.fallbackLabel') + ': ' + info.fallbackAttempts,
      t('playground.errorLabel') + ': ' + message.content,
      includeQuestion && question && t('playground.questionLabel') + ': ' + question,
    ].filter(Boolean).join('\n\n')
    if (await copyText(report)) toast.success(t('common.copied'))
    else toast.error(t('common.copyFailed'))
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
      <button type="button" className="underline disabled:opacity-50" disabled={disabled} onClick={onRetry}>
        {t('playground.retryFailed')}
      </button>
      <button type="button" className="underline" onClick={copyDiagnostic}>{t('playground.copyDiagnostic')}</button>
      {question && <label className="flex items-center gap-1">
        <input type="checkbox" checked={includeQuestion} onChange={e => setIncludeQuestion(e.target.checked)} />
        {t('playground.includeQuestion')}
      </label>}
    </div>
  )
}
