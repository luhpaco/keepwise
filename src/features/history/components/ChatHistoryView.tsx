'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
	ArrowLeft,
	Calendar,
	MessageCircle,
	Download,
	Pencil,
	Share2,
	BookmarkPlus,
	Copy,
	Loader2,
	ArrowUp,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { HistoryChatMessage } from './HistoryChatMessage'
import type { ChatConversation } from '../types'

interface ChatHistoryViewProps {
	initialConversation: ChatConversation | null
	isLoading: boolean
	error: string | null
}

export function ChatHistoryView({
	initialConversation,
	isLoading,
	error,
}: ChatHistoryViewProps) {
	const router = useRouter()
	const [conversation, setConversation] = useState<ChatConversation | null>(
		initialConversation
	)
	const [isEditingTitle, setIsEditingTitle] = useState(false)
	const [editedTitle, setEditedTitle] = useState(
		initialConversation?.title || ''
	)
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const scrollAreaRef = useRef<HTMLDivElement>(null) // Ref for ScrollArea viewport
	const [showScrollTopButton, setShowScrollTopButton] = useState(false)

	useEffect(() => {
		// Update state if initial props change (e.g., after server fetch)
		setConversation(initialConversation)
		setEditedTitle(initialConversation?.title || '')
	}, [initialConversation])

	useEffect(() => {
		// Scroll to bottom when messages load
		if (!isLoading && !error && conversation) {
			// Use timeout to ensure rendering is complete before scrolling
			setTimeout(() => {
				messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
			}, 0)
		}
	}, [isLoading, error, conversation])

	// Effect to handle scroll detection for the scroll-to-top button
	useEffect(() => {
		const scrollViewport = scrollAreaRef.current?.querySelector(
			'[data-radix-scroll-area-viewport]'
		)

		if (!scrollViewport) return

		const handleScroll = () => {
			const scrollTop = scrollViewport.scrollTop
			setShowScrollTopButton(scrollTop > 300) // Show button after scrolling 300px
		}

		// Initial check in case the page loads scrolled
		handleScroll()

		scrollViewport.addEventListener('scroll', handleScroll)

		// Cleanup listener on component unmount
		return () => {
			scrollViewport.removeEventListener('scroll', handleScroll)
		}
	}, [isLoading]) // Re-run if loading state changes, ensuring viewport exists

	const handleSaveTitle = () => {
		if (conversation && editedTitle.trim()) {
			setConversation({
				...conversation,
				title: editedTitle.trim(),
			})
			setIsEditingTitle(false)
			toast('Title updated', {
				description: 'The conversation title has been updated successfully.',
			})
			// TODO: Persist the change here (e.g., call API/Server Action)
		}
	}

	const handleExport = () => {
		if (!conversation) return

		const content =
			`# ${conversation.title}\n\n` +
			`Date: ${format(new Date(conversation.date), 'MMMM d, yyyy')}\n\n` +
			conversation.messages
				.map(
					(msg) =>
						`## ${msg.role === 'user' ? 'You' : 'SilvIA'}\n${msg.content}\n`
				)
				.join('\n')

		const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		const filename = `${
			conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() ||
			'conversation'
		}.md`
		a.download = filename
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)

		toast('Conversation exported', {
			description: 'The conversation has been exported as a Markdown file.',
		})
		// TODO: Implement actual export logic if different from download
	}

	const copyConversationLink = () => {
		if (typeof window !== 'undefined') {
			navigator.clipboard.writeText(window.location.href)
			toast('Link copied', {
				description: 'Conversation link copied to clipboard.',
			})
		}
	}

	const saveToDatabase = () => {
		toast('Saved to database (Simulation)', {
			description:
				'This conversation has been saved to your knowledge database.',
		})
		// TODO: Implement actual save to database logic (e.g., call API/Server Action)
	}

	const scrollToTop = () => {
		const scrollViewport = scrollAreaRef.current?.querySelector(
			'[data-radix-scroll-area-viewport]'
		)
		scrollViewport?.scrollTo({ top: 0, behavior: 'smooth' })
	}

	return (
		<div className='flex flex-col h-full bg-background text-foreground'>
			{/* Sticky Top Bar */}
			<div className='sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
				<div className='max-w-5xl mx-auto py-4 px-4 sm:px-6 lg:px-8'>
					<div className='flex items-center justify-between'>
						<Button
							variant='ghost'
							onClick={() => router.push('/history')}
							className='flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors'
						>
							<ArrowLeft className='h-4 w-4' />
							Back to History
						</Button>
						{!isLoading && !error && conversation && (
							<div className='flex items-center gap-2'>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant='outline' size='sm'>
											<Share2 className='h-4 w-4 mr-2' />
											Share
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align='end'>
										<DropdownMenuItem onClick={copyConversationLink}>
											<Copy className='h-4 w-4 mr-2' />
											Copy Link
										</DropdownMenuItem>
										<DropdownMenuItem onClick={handleExport}>
											<Download className='h-4 w-4 mr-2' />
											Export as Markdown
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
								<Button variant='outline' size='sm' onClick={saveToDatabase}>
									<BookmarkPlus className='h-4 w-4 mr-2' />
									Save to Database
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Non-Sticky Title Area */}
			{!isLoading && !error && conversation && (
				<div className='border-b'>
					<div className='max-w-5xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center'>
						{isEditingTitle ? (
							<div className='flex items-center justify-center gap-2'>
								<input
									type='text'
									value={editedTitle}
									onChange={(e) => setEditedTitle(e.target.value)}
									className='text-xl font-bold bg-background border border-input rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-ring w-auto max-w-md'
									autoFocus
									onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
								/>
								<Button
									size='sm'
									onClick={handleSaveTitle}
									disabled={!editedTitle.trim()}
								>
									Save
								</Button>
								<Button
									size='sm'
									variant='ghost'
									onClick={() => {
										setEditedTitle(conversation.title)
										setIsEditingTitle(false)
									}}
								>
									Cancel
								</Button>
							</div>
						) : (
							<div className='flex items-center justify-center'>
								<h1 className='text-2xl font-bold line-clamp-1 px-8'>
									{conversation.title}
								</h1>
								<Button
									variant='ghost'
									size='icon'
									className='ml-2 h-8 w-8 flex-shrink-0'
									onClick={() => setIsEditingTitle(true)}
								>
									<Pencil className='h-4 w-4' />
									<span className='sr-only'>Edit title</span>
								</Button>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Scrollable Content Area */}
			<ScrollArea className='flex-1 relative' ref={scrollAreaRef}>
				<div className='max-w-3xl mx-auto space-y-6 pb-10'>
					{/* Loading / Error State inside Scroll Area if preferred */}
					{isLoading && (
						<div className='flex-1 flex flex-col items-center justify-center pt-10'>
							<Loader2 className='h-8 w-8 animate-spin text-primary mb-4' />
							<p className='text-muted-foreground'>Loading conversation...</p>
						</div>
					)}
					{error && (
						<div className='flex-1 flex flex-col items-center justify-center text-center px-4 pt-10'>
							<p className='text-destructive mb-4'>{error}</p>
							<Button onClick={() => router.back()}>Go Back</Button>
						</div>
					)}
					{/* Message List (Scrolls) - Should come first */}
					{!isLoading && !error && conversation && (
						<div className='px-4 pt-6'>
							{conversation.messages.map((message) => (
								<HistoryChatMessage key={message.id} message={message} />
							))}
						</div>
					)}
					<div ref={messagesEndRef} />{' '}
					{/* Ref should be after messages for scroll to bottom */}
				</div>
				{/* Summary Section (Scrolls) - Positioned at the bottom */}
				{!isLoading && !error && conversation && (
					<div className='border-t bg-muted/20 px-4 py-8 w-full'>
						<Card className='bg-card border-border max-w-3xl mx-auto'>
							<CardHeader className='pb-2'>
								<CardTitle className='text-lg flex items-center gap-2'>
									<MessageCircle className='h-5 w-5' />
									Conversation Summary
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='flex flex-wrap gap-2 mb-4'>
									{conversation.tags.map((tag, index) => (
										<Badge key={index} variant='secondary'>
											{tag}
										</Badge>
									))}
								</div>
								<div className='flex items-center gap-2 text-sm text-muted-foreground mb-3'>
									<Calendar className='h-4 w-4' />
									<span>
										{format(new Date(conversation.date), 'MMMM d, yyyy')}
									</span>
									<span className='mx-2'>•</span>
									<MessageCircle className='h-4 w-4' />
									<span>{conversation.messages.length} messages</span>
								</div>
								<Separator className='my-3' />
								<p className='text-sm text-muted-foreground'>
									{conversation.summary}
								</p>
							</CardContent>
						</Card>
					</div>
				)}
			</ScrollArea>

			{/* Scroll to Top Button */}
			{showScrollTopButton && (
				<Button
					variant='outline'
					size='icon'
					className='fixed bottom-6 right-6 z-20 h-10 w-10 rounded-full shadow-lg animate-bounce'
					onClick={scrollToTop}
					aria-label='Scroll to top'
				>
					<ArrowUp className='h-5 w-5' />
				</Button>
			)}
		</div>
	)
}
