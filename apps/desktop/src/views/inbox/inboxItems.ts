import type { AgentConversation } from '../../api/agent-types'

/** The conversations waiting on a decision, oldest question first. */
export function inboxItems(conversations: AgentConversation[]): AgentConversation[] {
  return conversations
    .filter((conversation) => conversation.pendingDecision)
    .sort((a, b) => a.pendingDecision!.askedAt.localeCompare(b.pendingDecision!.askedAt))
}
