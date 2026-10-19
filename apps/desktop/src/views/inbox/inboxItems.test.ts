import assert from 'node:assert/strict'
import test from 'node:test'

import { inboxItems } from './inboxItems.ts'

import type { AgentConversation } from '../../api/agent-types.ts'

const chat = (sessionId: string, askedAt?: string) =>
  ({
    sessionId,
    ...(askedAt
      ? { pendingDecision: { category: 'approval', question: '?', toolCallId: sessionId, askedAt } }
      : {}),
  }) as AgentConversation

test('the Inbox lists only waiting conversations, the oldest question first', () => {
  const items = inboxItems([
    chat('newer', '2026-10-19T12:00:00.000Z'),
    chat('answered'),
    chat('older', '2026-10-19T09:00:00.000Z'),
  ])

  assert.deepEqual(
    items.map((item) => item.sessionId),
    ['older', 'newer'],
  )
})
