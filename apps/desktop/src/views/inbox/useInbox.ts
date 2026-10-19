import { useCallback, useEffect, useRef, useState } from 'react'

import { api } from '../../api'

import { inboxItems, listingFor } from './inboxItems'

import type { InboxListing } from './inboxItems'

export const INBOX_POLL_MS = 15_000

/**
 * The viewer's own conversations waiting on them in this team; `listing` is
 * `null` until this team's first answer, never another team's items.
 */
export function useInbox(teamId: string, refreshKey = 0) {
  const [listing, setListing] = useState<InboxListing | null>(null)
  const requested = useRef(0)
  const [nudge, setNudge] = useState(0)

  useEffect(() => {
    if (!teamId) return
    let live = true
    const load = () => {
      const requestNo = ++requested.current

      api
        .agentListConversations(teamId, { pendingDecision: true, archived: 'exclude', limit: 100 })
        .then(
          (page) => {
            if (!live) return
            const next = { teamId, items: inboxItems(page.conversations), requestNo }

            // A slow older request must not replace a newer listing.
            setListing((prev) => (prev && prev.requestNo > requestNo ? prev : next))
          },
          () => {
            // Best effort: keep what is already shown.
          },
        )
    }

    load()
    const interval = setInterval(load, INBOX_POLL_MS)

    return () => {
      live = false
      clearInterval(interval)
    }
  }, [teamId, refreshKey, nudge])

  return {
    listing: listingFor(listing, teamId),
    /** The newest request so far: a reply sent now is judged by listings after it. */
    lastRequestNo: useCallback(() => requested.current, []),
    refresh: useCallback(() => setNudge((n) => n + 1), []),
  }
}
