import { ChatInterface } from '@/features/ai-chat/components/ChatInterface'

interface DynamicChatPageProps {
	params: {
		chatId: string // From the route segment [chatId]
	}
	// searchParams might be useful later for things like initial prompts
	// searchParams: { [key: string]: string | string[] | undefined };
}

/**
 * Renders the chat interface for a specific conversation identified by `chatId`.
 * TODO: Implement data fetching using `chatId` to load the specific conversation history.
 */
export default function DynamicChatPage({ params }: DynamicChatPageProps) {
	// const { chatId } = params; // Available for data fetching

	return (
		// Ensure the container takes full viewport height for the chat interface
		<div className='h-[100dvh] bg-background'>
			{/* TODO: Pass fetched chat data (based on chatId) to ChatInterface */}
			<ChatInterface />
		</div>
	)
}
