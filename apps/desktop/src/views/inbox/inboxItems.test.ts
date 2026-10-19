import assert from 'node:assert/strict'
import test from 'node:test'

import { inboxItems, listingFor, unansweredItems } from './inboxItems.ts'

import type { AgentConversation } from '../../api/agent-types.ts'

const chat = (sessionId: string, askedAt?: string, toolCallId = sessionId) =>
  ({
    sessionId,
    ...(askedAt
      ? { pendingDecision: { category: 'approval', question: '?', toolCallId, askedAt } }
      : {}),
  }) as AgentConversation

const ids = (items: AgentConversation[]) => items.map((item) => item.pendingDecision!.toolCallId)

test('the Inbox lists only waiting conversations, the oldest question first', () => {
  const items = inboxItems([
    chat('newer', '2026-10-19T12:00:00.000Z'),
    chat('answered'),
    chat('older', '2026-10-19T09:00:00.000Z'),
  ])

  assert.deepEqual(ids(items), ['older', 'newer'])
})

test('an answered decision hides until a listing requested after the reply', () => {
  const a = chat('s1', '2026-10-19T09:00:00.000Z', 'decision-a')
  const answeredAt = new Map([['decision-a', 4]])

  // Listings requested before or with the reply still carry it: keep it hidden.
  assert.deepEqual(ids(unansweredItems({ teamId: 't', items: [a], requestNo: 4 }, answeredAt)), [])
  // A later listing that still has it means the reply did not land: show it again.
  assert.deepEqual(ids(unansweredItems({ teamId: 't', items: [a], requestNo: 5 }, answeredAt)), [
    'decision-a',
  ])
})

test('a new question from the same chat shows even though the last one was answered', () => {
  const b = chat('s1', '2026-10-19T10:00:00.000Z', 'decision-b')

  assert.deepEqual(
    ids(unansweredItems({ teamId: 't', items: [b], requestNo: 4 }, new Map([['decision-a', 4]]))),
    ['decision-b'],
  )
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
