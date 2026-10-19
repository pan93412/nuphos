import type { AgentConversation } from '../../api/agent-types'

/** One listing of the Inbox: whose it is, and which request produced it. */
export type InboxListing = { teamId: string; items: AgentConversation[]; requestNo: number }

/** The conversations waiting on a decision, oldest question first. */
export function inboxItems(conversations: AgentConversation[]): AgentConversation[] {
  return conversations
    .filter((conversation) => conversation.pendingDecision)
    .sort((a, b) => a.pendingDecision!.askedAt.localeCompare(b.pendingDecision!.askedAt))
}

/** Another team's listing is no answer for this one: show nothing until this team's arrives. */
export function listingFor(listing: InboxListing | null, teamId: string): InboxListing | null {
  return listing?.teamId === teamId ? listing : null
}
