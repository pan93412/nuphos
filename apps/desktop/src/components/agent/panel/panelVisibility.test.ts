import assert from 'node:assert/strict'
import { test } from 'node:test'

import { homeVisible, panelVisible, seedForTab } from './panelVisibility.ts'

function entrances(frames: boolean[]): number {
  return frames.filter((shown, index) => shown && index > 0 && !frames[index - 1]).length
}

test('a page is on screen unless its host covers it; a panel only when opened', () => {
  assert.equal(panelVisible('page', undefined), true)
  assert.equal(panelVisible('page', true), true)
  assert.equal(panelVisible('page', false), false)
  assert.equal(panelVisible('panel', undefined), false)
  assert.equal(panelVisible('panel', true), true)
})

test('the home counts as shown only on an on-screen panel without a conversation', () => {
  assert.equal(homeVisible(true, false), true)
  assert.equal(homeVisible(true, true), false)
  assert.equal(homeVisible(false, false), false)
})

test('the home entrance replays however it comes back into view', () => {
  const fromConversation = [homeVisible(true, true), homeVisible(true, false)]
  const fromManagementPage = [homeVisible(false, false), homeVisible(true, false)]
  const fromManagementPageOverAChat = [homeVisible(false, true), homeVisible(true, false)]

  assert.equal(entrances(fromConversation), 1)
  assert.equal(entrances(fromManagementPage), 1)
  assert.equal(entrances(fromManagementPageOverAChat), 1)
})

test('a seed waits for its tab: a new chat for Home, an Inbox reply for its own chat', () => {
  const reply = { text: 'Merge', nonce: 1, autoSend: true, sessionId: 's1' }
  const fresh = { text: 'hi', nonce: 2, newChat: true }
  const plain = { text: 'link', nonce: 3 }

  assert.equal(seedForTab(reply, 'tab-0', 's0', 'home'), null)
  assert.equal(seedForTab(reply, 'tab-1', 's1', 'home'), reply)
  assert.equal(seedForTab(fresh, 'tab-1', 's1', 'home'), null)
  assert.equal(seedForTab(fresh, 'home', undefined, 'home'), fresh)
  assert.equal(seedForTab(plain, 'tab-0', 's0', 'home'), plain)
})
