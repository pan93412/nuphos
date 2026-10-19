import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { ChoiceCard } from '../components/agent/panel/ChoiceCard'
import { ConnectCardContext } from '../components/agent/panel/connectCardContext'
import { relativeTimeFromNow } from '../components/agent/panel/textUtils'
import { EmptyState } from '../components/EmptyState'
import { Button } from '../components/ui/button'

import { useInbox } from './inbox/useInbox'

type Props = {
  teamId: string
  refreshKey: number
  onCount?: (n: number) => void
  onLoading?: (loading: boolean) => void
  onOpenConversation: (sessionId: string) => void
  /** Sends the answer into the asking conversation as the owner's message. */
  onReply: (sessionId: string, text: string) => void
}

/** Every decision an agent is waiting on, one at a time; an answer is a normal reply. */
export function InboxView({
  teamId,
  refreshKey,
  onCount,
  onLoading,
  onOpenConversation,
  onReply,
}: Props) {
  const loaded = useInbox(teamId, refreshKey)
  // Answered here, until the next listing no longer has them.
  const [answered, setAnswered] = useState<ReadonlySet<string>>(() => new Set())
  const items = useMemo(
    () => (loaded ?? []).filter((item) => !answered.has(item.sessionId)),
    [loaded, answered],
  )
  const [index, setIndex] = useState(0)
  const [draft, setDraft] = useState('')
  const current = items[Math.min(index, items.length - 1)]
  const decision = current?.pendingDecision

  useEffect(() => onLoading?.(loaded === null), [loaded, onLoading])
  useEffect(() => onCount?.(items.length), [items.length, onCount])

  const reply = useMemo(
    () =>
      current && {
        send: (text: string) => {
          onReply(current.sessionId, text)
          setAnswered((prev) => new Set(prev).add(current.sessionId))
          setDraft('')
        },
      },
    [current, onReply],
  )

  if (loaded === null) return null
  if (!current || !decision || !reply) {
    return (
      <EmptyState
        icon={Inbox}
        title="Nothing waiting on you"
        description="When an agent needs you to decide something, it shows up here, one at a time. Your answer goes back to its chat as your reply."
      />
    )
  }

  const position = items.indexOf(current)

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-6 pt-4 selectable">
      <div className="mx-auto w-full max-w-[640px] space-y-3">
        <div className="flex items-center gap-2 text-[12px] text-tertiary">
          <button
            type="button"
            className="min-w-0 truncate text-left text-[13px] font-medium text-main hover:underline"
            onClick={() => onOpenConversation(current.sessionId)}
          >
            {current.title || current.firstMessage || 'Untitled chat'}
          </button>
          <span className="flex-shrink-0">{relativeTimeFromNow(decision.askedAt)}</span>
          <span className="ml-auto flex-shrink-0 tabular-nums">
            {position + 1} of {items.length}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous"
            disabled={position === 0}
            onClick={() => setIndex(position - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next"
            disabled={position === items.length - 1}
            onClick={() => setIndex(position + 1)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        <ConnectCardContext.Provider value={reply}>
          <ChoiceCard
            key={decision.toolCallId}
            category={decision.category}
            question={decision.question}
            options={decision.options ?? []}
            canAct
          />
        </ConnectCardContext.Provider>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Or reply in your own words"
          rows={3}
          className="w-full resize-y rounded-md border border-zGray-800 bg-zGray-850 px-2.5 py-1.5 text-[12.5px] text-main outline-none transition-colors placeholder:text-quaternary focus:border-zGray-600"
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenConversation(current.sessionId)}
          >
            Open chat
          </Button>
          <Button size="sm" disabled={!draft.trim()} onClick={() => reply.send(draft.trim())}>
            Send reply
          </Button>
        </div>
      </div>
    </div>
  )
}
