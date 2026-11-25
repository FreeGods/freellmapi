import type { ChatMessage } from './playground-conversations'

export function prepareTurn(messages: ChatMessage[], question: ChatMessage, retryIndex?: number) {
  const previous = retryIndex === undefined ? messages : messages.slice(0, retryIndex)
  const history = previous.filter(message => !message.isError)
  const retryingLatest = retryIndex !== undefined && !messages.slice(retryIndex + 1).some(m => m.role === 'user')
  return {
    history,
    promptMessages: [...history, question],
    newMessages: [...(retryingLatest ? previous : messages), question],
  }
}
