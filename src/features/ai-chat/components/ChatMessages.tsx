'use client'

import type React from 'react'
import { ChatMessage, type ChatMessageWithRecords } from './ChatMessage'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface ChatMessagesProps {
	messages: ChatMessageWithRecords[]
	isLoading: boolean
	messagesEndRef: React.RefObject<HTMLDivElement>
}

export function ChatMessages({
	messages,
	isLoading,
	messagesEndRef,
}: ChatMessagesProps) {
	const [mounted, setMounted] = useState(false)

	// Prevent hydration mismatch by ensuring component only renders on client
	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) return null

	return (
		<div className='flex-1 overflow-y-auto py-4 px-4 md:px-8'>
			<div className='max-w-3xl mx-auto space-y-6 pb-4'>
				{messages.map((message, index) => (
					<ChatMessage
						key={message.id}
						message={message}
						isLastMessage={index === messages.length - 1}
					/>
				))}
				{isLoading && (
					<div className='flex items-center justify-center py-6'>
						<div className='flex items-center gap-2 text-muted-foreground bg-muted/50 px-4 py-2 rounded-full'>
							<Loader2 className='h-4 w-4 animate-spin' />
							<span className='text-sm'>SilvIA is thinking...</span>
						</div>
					</div>
				)}
				{/* Scroll anchor */}
				<div ref={messagesEndRef} />
			</div>
		</div>
	)
}
