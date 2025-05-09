'use client'

import type { Message } from 'ai'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Bot } from 'lucide-react'
import { SavedRecordCard } from './SavedRecordCard'
import ReactMarkdown from 'react-markdown'
import type { ComponentProps, ReactNode } from 'react'
import { format } from 'date-fns'

// TODO: Move to a shared types file (e.g., src/features/ai-chat/types.ts)
// TODO: Refine 'records' type to use RecordData from SavedRecordCard
export interface ChatMessageWithRecords extends Message {
	records?: any[]
	timestamp?: string | Date
}

export interface BaseChatMessageProps {
	message: {
		role: string
		content: string
		timestamp?: string | Date
	}
	isLastMessage?: boolean
	showTimestamp?: boolean
	botName?: string
}

export interface ChatMessageProps {
	message: ChatMessageWithRecords
	isLastMessage?: boolean
	showTimestamp?: boolean
}

// Custom renderers for ReactMarkdown
export const markdownComponents: ComponentProps<
	typeof ReactMarkdown
>['components'] = {
	p: ({ children }: { children?: ReactNode }) => (
		<p className='mb-2 last:mb-0'>{children}</p>
	),
	ul: ({ children }: { children?: ReactNode }) => (
		<ul className='mb-2 list-disc pl-4 last:mb-0'>{children}</ul>
	),
	ol: ({ children }: { children?: ReactNode }) => (
		<ol className='mb-2 list-decimal pl-4 last:mb-0'>{children}</ol>
	),
	li: ({ children }: { children?: ReactNode }) => (
		<li className='mb-1 last:mb-0'>{children}</li>
	),
	h1: ({ children }: { children?: ReactNode }) => (
		<h1 className='mb-2 text-lg font-bold last:mb-0'>{children}</h1>
	),
	h2: ({ children }: { children?: ReactNode }) => (
		<h2 className='mb-2 text-base font-bold last:mb-0'>{children}</h2>
	),
	h3: ({ children }: { children?: ReactNode }) => (
		<h3 className='mb-2 text-sm font-bold last:mb-0'>{children}</h3>
	),
	strong: ({ children }: { children?: ReactNode }) => (
		<strong className='font-bold'>{children}</strong>
	),
	em: ({ children }: { children?: ReactNode }) => (
		<em className='italic'>{children}</em>
	),
	code: ({ children }: { children?: ReactNode }) => (
		<code className='rounded bg-muted-foreground/20 px-1 py-0.5 font-mono text-sm'>
			{children}
		</code>
	),
	a: ({ href, children }: { href?: string; children?: ReactNode }) => (
		<a
			href={href}
			className='text-primary underline hover:no-underline'
			target='_blank'
			rel='noopener noreferrer'
		>
			{children}
		</a>
	),
}

export function BaseChatMessage({
	message,
	isLastMessage = false,
	showTimestamp = false,
	botName = 'SilvIA',
}: BaseChatMessageProps) {
	const isUser = message.role === 'user'

	return (
		<div
			className={cn(
				'group relative mb-4 flex items-start w-full',
				isUser ? 'justify-end' : 'justify-start',
				isLastMessage && 'mb-0'
			)}
		>
			{!isUser && (
				<div className='mr-3 flex-shrink-0'>
					<Avatar className='h-8 w-8 border bg-primary/10'>
						<AvatarImage src='/silvia-avatar.png' alt={botName} />
						<AvatarFallback className='text-primary bg-transparent'>
							<Bot className='h-4 w-4' />
						</AvatarFallback>
					</Avatar>
				</div>
			)}

			<div
				className={cn(
					'flex max-w-[85%] flex-col gap-1.5',
					isUser ? 'items-end' : 'items-start'
				)}
			>
				{showTimestamp && (
					<div className='flex items-center gap-2'>
						<span className='text-sm font-medium text-muted-foreground'>
							{isUser ? 'You' : botName}
						</span>
						{message.timestamp && (
							<span className='text-xs text-muted-foreground'>
								{format(
									typeof message.timestamp === 'string'
										? new Date(message.timestamp)
										: message.timestamp,
									'h:mm a'
								)}
							</span>
						)}
					</div>
				)}

				<div
					className={cn(
						'rounded-xl px-4 py-3 text-sm shadow-sm',
						isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
					)}
				>
					<ReactMarkdown components={markdownComponents}>
						{message.content}
					</ReactMarkdown>
				</div>
			</div>

			{isUser && (
				<div className='ml-3 flex-shrink-0'>
					<Avatar className='h-8 w-8 border'>
						{/* TODO: Add AvatarImage if user images are available */}
						<AvatarFallback>
							<User className='h-4 w-4' />
						</AvatarFallback>
					</Avatar>
				</div>
			)}
		</div>
	)
}

export function ChatMessage({
	message,
	isLastMessage = false,
	showTimestamp = false,
}: ChatMessageProps) {
	const records = message.records // Access records directly from the message object

	return (
		<>
			<BaseChatMessage
				message={message}
				isLastMessage={!records || records.length === 0 ? isLastMessage : false}
				showTimestamp={showTimestamp}
			/>

			{records && records.length > 0 && (
				<div className='mt-2 w-full space-y-2 mb-4'>
					{/* TODO: Refine 'record' type when RecordData is shared */}
					{records.map((record: any) => (
						<SavedRecordCard key={record.id} record={record} />
					))}
				</div>
			)}
		</>
	)
}
