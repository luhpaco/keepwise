import { ChatInterface } from '@/features/ai-chat/components/ChatInterface'

/**
 * Main chat page entry point.
 * Renders the primary chat interface.
 * TODO: Future enhancement could involve redirecting to /chat/new or loading the most recent chat automatically.
 */
export default function ChatPage() {
	return (
		// Ensure the container takes full viewport height for the chat interface
		<div className='h-[100dvh] bg-background'>
			<ChatInterface />
		</div>
	)
}
