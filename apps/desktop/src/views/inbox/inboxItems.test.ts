import assert from 'node:assert/strict'
import test from 'node:test'

import { listingFor, nextSelection } from './inboxItems.ts'

import type { AgentConversation } from '../../api/agent-types.ts'

const chats = (...ids: string[]) => ids.map((sessionId) => ({ sessionId }) as AgentConversation)

test('the first listing opens the top conversation; an empty Inbox opens nothing', () => {
  assert.equal(nextSelection(null, chats('a', 'b')), 'a')
  assert.equal(nextSelection(null, []), null)
})

test('the open conversation stays open while it still waits', () => {
  assert.equal(nextSelection({ sessionId: 'b', index: 1 }, chats('a', 'b', 'c')), 'b')
})

test('once answered it leaves the list and the next one opens', () => {
  assert.equal(nextSelection({ sessionId: 'b', index: 1 }, chats('a', 'c')), 'c')
  // The last one answered: the one above it opens.
  assert.equal(nextSelection({ sessionId: 'c', index: 2 }, chats('a', 'b')), 'b')
})

test("after a team switch the last team's count is not shown", () => {
  const listing = { teamId: 'team-a', count: 2, requestNo: 1 }

  assert.equal(listingFor(listing, 'team-b'), null)
  assert.equal(listingFor(listing, 'team-a'), listing)
})
