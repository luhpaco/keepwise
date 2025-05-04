'use client'

// import { useChat } from "ai/react" // Removed for now, UI focus first
import { useState, useRef, useEffect, useCallback } from 'react'
import { ChatHeader } from './ChatHeader'
import { ChatInput } from './ChatInput'
import { ChatMessages } from './ChatMessages'
import type { ChatMessageWithRecords } from './ChatMessage' // Import the extended type

// Mock data for UI preview (replace with actual data/API calls)
const initialMockMessages: ChatMessageWithRecords[] = [
	{
		id: '1',
		role: 'assistant',
		content:
			"Hello! I'm SilvIA, your personal AI assistant. How can I help you today?",
	},
	// Add more mock messages if needed for layout testing
]

export function ChatInterface() {
	// State managed locally for now (will be replaced by useChat or similar)
	const [messages, setMessages] =
		useState<ChatMessageWithRecords[]>(initialMockMessages)
	const [input, setInput] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	const messagesEndRef = useRef<HTMLDivElement>(null)

	// Mock handlers (will be replaced by useChat handlers)
	const handleInputChange = (
		e:
			| React.ChangeEvent<HTMLTextAreaElement>
			| React.ChangeEvent<HTMLInputElement>
	) => {
		setInput(e.target.value)
	}

	// Mock handlers (will be replaced by useChat handlers)
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!input.trim()) return

		const userMessage: ChatMessageWithRecords = {
			id: Date.now().toString(),
			role: 'user',
			content: input,
		}
		setMessages((prev) => [...prev, userMessage])
		setInput('')
		setIsLoading(true)

		// Simulate assistant response
		setTimeout(() => {
			const assistantMessage: ChatMessageWithRecords = {
				id: Date.now().toString(),
				role: 'assistant',
				content: `Thinking about \"${userMessage.content}\" ... (mock response)`,
				// TODO: Add mock records here if needed for testing SavedRecordCard layout
				// records: [{ id: 123, type: 'idea', title: 'Mock Idea', description: 'Mock desc', createdAt: new Date(), category: 'mock' }]
			}
			setMessages((prev) => [...prev, assistantMessage])
			setIsLoading(false)
		}, 1500)
	}

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [])

	useEffect(() => {
		scrollToBottom()
	}, [messages, scrollToBottom])

	return (
		// Use flex-col and h-full to ensure the interface takes full height
		<div className='flex flex-col h-full'>
			<ChatHeader />
			<ChatMessages
				messages={messages}
				isLoading={isLoading}
				messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
			/>
			<ChatInput
				input={input}
				handleInputChange={handleInputChange}
				handleSubmit={handleSubmit}
				isLoading={isLoading}
			/>
		</div>
	)
}
