import assert from 'node:assert/strict'
import test from 'node:test'

import { inboxItems, listingFor } from './inboxItems.ts'

import type { AgentConversation } from '../../api/agent-types.ts'

const chat = (sessionId: string, askedAt?: string, toolCallId = sessionId) =>
  ({
    sessionId,
    ...(askedAt
      ? { pendingDecision: { category: 'approval', question: '?', toolCallId, askedAt } }
      : {}),
  }) as AgentConversation

const ids = (items: AgentConversation[]) => items.map((item) => item.pendingDecision!.toolCallId)

test('the Inbox shows exactly what the server lists: a new question in an answered chat shows', () => {
  const items = inboxItems([
    chat('s1', '2026-10-19T10:00:00.000Z', 'decision-b'),
    chat('s2', '2026-10-19T09:00:00.000Z', 'decision-a'),
  ])

  assert.deepEqual(ids(items), ['decision-a', 'decision-b'])
})

test('the Inbox lists only waiting conversations, the oldest question first', () => {
  const items = inboxItems([
    chat('newer', '2026-10-19T12:00:00.000Z'),
    chat('answered'),
    chat('older', '2026-10-19T09:00:00.000Z'),
  ])

  assert.deepEqual(ids(items), ['older', 'newer'])
})

test("after a team switch the last team's items and badge are not shown", () => {
  const listing = {
    teamId: 'team-a',
    items: [chat('s1', '2026-10-19T09:00:00.000Z')],
    requestNo: 1,
  }

  assert.equal(listingFor(listing, 'team-b'), null)
  assert.equal(listingFor(listing, 'team-a'), listing)
})
