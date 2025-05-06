'use client'

import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Search, MessageCircle } from 'lucide-react'
import { EditHistoryDialog } from '@/features/history/components/EditHistoryDialog'
import { HistoryListItem } from '@/features/history/components/HistoryListItem'
import type { ChatHistoryItem } from '@/features/history/types'

// TODO: Replace with actual data fetching from the backend
const initialChatHistory: ChatHistoryItem[] = [
	{
		id: 1,
		title: 'React Server Components Discussion',
		preview: 'What are the benefits of using React Server Components?',
		date: '2024-01-23',
		messages: 12,
		tags: ['React', 'Next.js', 'Frontend'],
	},
	{
		id: 2,
		title: 'Next.js App Router Migration',
		preview: 'How do I migrate from pages to app router?',
		date: '2024-01-22',
		messages: 8,
		tags: ['Next.js', 'Migration', 'Frontend'],
	},
	{
		id: 3,
		title: 'Database Schema Design',
		preview: 'Help me design a schema for a blog',
		date: '2024-01-21',
		messages: 15,
		tags: ['Database', 'Schema', 'Backend'],
	},
	{
		id: 4,
		title: 'Tailwind CSS Best Practices',
		preview:
			'What are some best practices when using Tailwind CSS in a large project?',
		date: '2024-01-20',
		messages: 10,
		tags: ['CSS', 'Tailwind', 'Frontend'],
	},
	{
		id: 5,
		title: 'TypeScript Type Inference',
		preview: 'How does TypeScript infer types from JavaScript code?',
		date: '2024-01-19',
		messages: 7,
		tags: ['TypeScript', 'JavaScript', 'Programming'],
	},
]

export default function HistoryPage() {
	// TODO: Replace useState with server-side data fetching and potentially server actions for mutations
	const [chatHistory, setChatHistory] =
		useState<ChatHistoryItem[]>(initialChatHistory)
	const [editingChat, setEditingChat] = useState<ChatHistoryItem | null>(null)
	const [deletingChatId, setDeletingChatId] = useState<number | string | null>(
		null
	)
	const [searchQuery, setSearchQuery] = useState('')

	// TODO: Implement actual edit logic (e.g., call API)
	const handleEditChat = (editedChat: ChatHistoryItem) => {
		setChatHistory(
			chatHistory.map((chat) => (chat.id === editedChat.id ? editedChat : chat))
		)
		setEditingChat(null)
		// Add toast notification
	}

	// TODO: Implement actual delete logic (e.g., call API)
	const handleDeleteChat = (chatId: number | string) => {
		setChatHistory(chatHistory.filter((chat) => chat.id !== chatId))
		setDeletingChatId(null)
		// Add toast notification
	}

	const filteredChats = chatHistory.filter(
		(chat) =>
			chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			chat.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
			chat.tags.some((tag) =>
				tag.toLowerCase().includes(searchQuery.toLowerCase())
			)
	)

	return (
		<div className='h-full flex flex-col bg-background'>
			<div className='flex-1 overflow-hidden'>
				<div className='h-full flex flex-col max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
					<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4'>
						{/* TODO: Make title dynamic or move to layout */}
						<h1 className='text-2xl font-bold'>Chat History</h1>
						<div className='relative w-full sm:w-auto'>
							<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
							<Input
								type='search'
								placeholder='Search conversations...'
								className='pl-8 w-full sm:w-[250px]'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>

					<ScrollArea className='flex-1 h-[calc(100vh-200px)] pr-4'>
						{' '}
						{/* Adjust height calculation as needed */}
						{filteredChats.length === 0 ? (
							<div className='flex flex-col items-center justify-center h-64 text-center'>
								<MessageCircle className='h-12 w-12 text-muted-foreground mb-4 opacity-50' />
								<h3 className='text-lg font-medium'>No conversations found</h3>
								<p className='text-muted-foreground mt-2'>
									{searchQuery
										? 'Try a different search term or clear your search'
										: 'Start a new chat to begin your conversation history'}
								</p>
							</div>
						) : (
							<div className='space-y-4'>
								{filteredChats.map((chat) => (
									<HistoryListItem
										key={chat.id}
										chat={chat}
										onEditClick={() => setEditingChat(chat)}
										onDeleteClick={() => setDeletingChatId(chat.id)}
									/>
								))}
							</div>
						)}
					</ScrollArea>
				</div>
			</div>

			{/* Dialogs */}
			<EditHistoryDialog
				chat={editingChat}
				onClose={() => setEditingChat(null)}
				onSave={handleEditChat}
			/>

			<AlertDialog
				open={deletingChatId !== null}
				onOpenChange={() => setDeletingChatId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Are you sure you want to delete this chat?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							chat from your history.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => deletingChatId && handleDeleteChat(deletingChatId)}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
