import { notFound } from 'next/navigation'
import { ChatHistoryView } from '@/features/history/components/ChatHistoryView'
import type { ChatConversation } from '@/features/history/types'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// TODO: Replace with actual data fetching logic from your database (e.g., Prisma)
async function getConversationData(
	id: string
): Promise<ChatConversation | null> {
	console.log(`Fetching conversation data for ID: ${id}`)
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 1000))

	// --- Mock Data ---
	const mockConversation: ChatConversation = {
		id: 1,
		title: 'React Server Components Discussion',
		messages: [
			{
				id: 1,
				role: 'user',
				content: 'What are the benefits of using React Server Components?',
				timestamp: '2024-01-23T10:15:00Z',
			},
			{
				id: 2,
				role: 'assistant',
				content:
					'React Server Components offer several benefits:\n\n1. Improved performance: They reduce the amount of JavaScript sent to the client, resulting in faster page loads.\n\n2. Automatic code splitting: Server components are not included in the client-side JavaScript bundle, reducing its size.\n\n3. Access to backend resources: They can directly access databases, APIs, and file systems without additional API layers.\n\n4. Simplified data fetching: Data fetching can be done on the server, eliminating the need for useEffect or similar client-side data fetching methods.\n\n5. Better SEO: Server-rendered content is more easily indexable by search engines.\n\n6. Improved security: Sensitive operations can be kept on the server, reducing exposure of API keys and other secrets.\n\n7. Seamless integration with existing React apps: They can be gradually adopted alongside traditional React components.',
				timestamp: '2024-01-23T10:15:30Z',
			},
			{
				id: 3,
				role: 'user',
				content:
					'How do Server Components differ from traditional server-side rendering?',
				timestamp: '2024-01-23T10:16:45Z',
			},
			{
				id: 4,
				role: 'assistant',
				content:
					"Server Components differ from traditional server-side rendering (SSR) in several ways:\n\n1. Granularity: Server Components allow rendering specific components on the server, while SSR typically renders the entire page.\n\n2. Interactivity: Server Components can be mixed with client-side interactive components, providing a more flexible approach to building UIs.\n\n3. Streaming: Server Components support streaming, allowing parts of the page to be sent to the client as they're ready, improving perceived performance.\n\n4. Updates: Server Components can be re-rendered on the server without affecting the client-side state, enabling more efficient updates.\n\n5. Data fetching: With Server Components, data fetching is more integrated into the component lifecycle, simplifying the process compared to traditional SSR approaches.\n\n6. Bundle size: Server Components are not included in the client-side bundle, potentially reducing the overall JavaScript sent to the client more effectively than SSR alone.\n\n7. Development experience: Server Components provide a more unified development model, allowing developers to write components that can run on either the server or the client with minimal changes.",
				timestamp: '2024-01-23T10:17:30Z',
			},
		],
		date: '2024-01-23',
		tags: ['React', 'Server Components', 'Next.js', 'Frontend'],
		summary:
			'This conversation explores the benefits and differences of React Server Components compared to traditional server-side rendering approaches. It covers performance improvements, code splitting, backend access, data fetching, SEO benefits, security advantages, and integration capabilities.',
	}
	// --- End Mock Data ---

	// In a real app, query your DB based on the id.
	// Example: const conversation = await prisma.conversation.findUnique({ where: { id: parseInt(id) } });
	if (id === String(mockConversation.id)) {
		// Simulate finding the mock data
		return mockConversation
	}

	return null // Return null if not found
}

// Loading Skeleton Component
function ChatHistoryLoadingSkeleton() {
	return (
		<div className='flex flex-col h-full bg-background text-foreground'>
			{/* Simplified Header during load */}
			<header className='border-b sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
				<div className='max-w-5xl mx-auto py-4 px-4 sm:px-6 lg:px-8'>
					<div className='flex items-center justify-between h-[72px]'>
						{' '}
						{/* Match height */}
						{/* Placeholder for back button */}
						<div className='h-8 w-32 bg-muted rounded animate-pulse'></div>
						{/* Placeholder for action buttons */}
						<div className='flex items-center gap-2'>
							<div className='h-8 w-24 bg-muted rounded animate-pulse'></div>
							<div className='h-8 w-36 bg-muted rounded animate-pulse'></div>
						</div>
					</div>
				</div>
			</header>
			{/* Loading state body */}
			<div className='flex-1 flex flex-col items-center justify-center'>
				<Loader2 className='h-8 w-8 animate-spin text-primary mb-4' />
				<p className='text-muted-foreground'>Loading conversation...</p>
			</div>
		</div>
	)
}

export default async function ChatHistoryDetailPage({
	params,
}: {
	params: { id: string }
}) {
	const { id } = await params
	const conversation = await getConversationData(id)

	// If conversation not found, show 404
	if (!conversation) {
		notFound()
	}

	// Render the client component with fetched data
	// Wrap the view in Suspense for better loading states if needed internally
	return (
		<ChatHistoryView
			initialConversation={conversation}
			isLoading={false}
			error={null}
		/>
	)
}

// Optional: Add Suspense boundary at the page level
export function ChatHistoryDetailPageWrapper({
	params,
}: {
	params: { id: string }
}) {
	return (
		<Suspense fallback={<ChatHistoryLoadingSkeleton />}>
			<ChatHistoryDetailPage params={params} />
		</Suspense>
	)
}
