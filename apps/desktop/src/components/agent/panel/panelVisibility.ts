import type { AgentPromptSeed } from './model'

/** The panel is on screen unless its host says otherwise; a page defaults to shown. */
export function panelVisible(variant: 'page' | 'panel', open: boolean | undefined): boolean {
  return open ?? variant === 'page'
}

/** The home is what the user sees: an on-screen panel not showing a conversation. */
export function homeVisible(panelOnScreen: boolean, showingConversationPage: boolean): boolean {
  return panelOnScreen && !showingConversationPage
}

/**
 * A seed waits for the tab it is meant for: a new chat for Home, an Inbox
 * reply for its own conversation. Sent anywhere else it would answer the
 * wrong chat.
 */
export function seedForTab(
  seed: AgentPromptSeed | null | undefined,
  activeId: string,
  activeSessionId: string | undefined,
  homeTabId: string,
): AgentPromptSeed | null | undefined {
  if (seed?.newChat && activeId !== homeTabId) return null
  if (seed?.sessionId && seed.sessionId !== activeSessionId) return null

  return seed
}
