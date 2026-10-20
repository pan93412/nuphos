import type { AgentConversation } from '../../api/agent-types'

/** One listing of the Inbox: whose it is, and which request produced it. */
export type InboxListing = { teamId: string; count: number; requestNo: number }

/** Another team's listing is no answer for this one: show nothing until this team's arrives. */
export function listingFor(listing: InboxListing | null, teamId: string): InboxListing | null {
  return listing?.teamId === teamId ? listing : null
}

/**
 * The conversation the Inbox shows after a listing. The open one stays open
 * while it still waits; once answered it leaves the list, and the row that
 * took its place — the next one — opens, the way a mail reader moves on.
 */
export function nextSelection(
  selected: { sessionId: string; index: number } | null,
  items: AgentConversation[],
): string | null {
  if (items.length === 0) return null
  if (selected && items.some((item) => item.sessionId === selected.sessionId)) {
    return selected.sessionId
  }
  // Opened from beyond the listed rows: nothing here says it was answered.
  if (selected?.index === -1) return selected.sessionId

  return items[Math.min(selected?.index ?? 0, items.length - 1)]!.sessionId
}
