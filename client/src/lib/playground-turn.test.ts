import { expect, it } from 'vitest'
import { prepareTurn } from './playground-turn'
import type { ChatMessage } from './playground-conversations'

const first: ChatMessage = { role: 'user', content: 'Inspect this', images: ['data:image/png;base64,abc'] }
const failure: ChatMessage = { role: 'assistant', content: 'HTTP 429', isError: true }
const followup: ChatMessage = { role: 'user', content: 'Another question' }

it('keeps errors visible while excluding them from subsequent requests', () => {
  const turn = prepareTurn([first, failure], followup)
  expect(turn.newMessages).toEqual([first, failure, followup])
  expect(turn.promptMessages).toEqual([first, followup])
})

it('retries the original image turn without duplicating the latest question', () => {
  const turn = prepareTurn([first, failure], first, 0)
  expect(turn.promptMessages).toEqual([first])
  expect(turn.newMessages).toEqual([first])
})

it('keeps later exchanges visible while replaying only the original context', () => {
  const turn = prepareTurn([first, failure, followup], first, 0)
  expect(turn.promptMessages).toEqual([first])
  expect(turn.newMessages).toEqual([first, failure, followup, first])
})
