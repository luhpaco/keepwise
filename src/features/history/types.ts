import { type } from 'os'

export type ChatHistoryItem = {
	id: number | string // Allow string for potential DB IDs
	title: string
	preview: string
	date: string | Date
	messages: number
	tags: string[]
}

export type ChatMessage = {
	id: number | string
	role: 'user' | 'assistant'
	content: string
	timestamp: string | Date
}

export type ChatConversation = {
	id: number | string
	title: string
	messages: ChatMessage[]
	date: string | Date
	tags: string[]
	summary: string
}
