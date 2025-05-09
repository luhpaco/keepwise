import { ChatMessage } from '../types'
import { BaseChatMessage } from '@/features/ai-chat/components/ChatMessage'

// Message component similar to the one in /chat
export function HistoryChatMessage({ message }: { message: ChatMessage }) {
	return <BaseChatMessage message={message} showTimestamp={true} />
}
