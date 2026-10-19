import { useEffect, useState } from 'react'

import { api } from '../../api'

import { inboxItems } from './inboxItems'

import type { AgentConversation } from '../../api/agent-types'

export const INBOX_POLL_MS = 15_000

/** The viewer's own conversations waiting on them; `null` until the first load. */
export function useInbox(teamId: string, refreshKey = 0): AgentConversation[] | null {
  const [items, setItems] = useState<AgentConversation[] | null>(null)

  useEffect(() => {
    if (!teamId) return
    let live = true
    const load = () =>
      api
        .agentListConversations(teamId, { pendingDecision: true, archived: 'exclude', limit: 100 })
        .then(
          (page) => {
            if (live) setItems(inboxItems(page.conversations))
          },
          () => {
            // Best effort: keep what is already shown.
          },
        )

    void load()
    const interval = setInterval(() => void load(), INBOX_POLL_MS)

    return () => {
      live = false
      clearInterval(interval)
    }
  }, [teamId, refreshKey])

  return items
}
