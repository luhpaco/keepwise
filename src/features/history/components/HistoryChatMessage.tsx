import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { ChatMessage } from '../types'

// Message component similar to the one in /chat
export function HistoryChatMessage({ message }: { message: ChatMessage }) {
	const isUser = message.role === 'user'

	return (
		<div
			className={cn(
				'group relative mb-4 flex items-start',
				isUser ? 'justify-end' : 'justify-start'
			)}
		>
			{!isUser && (
				<div className='mr-3 flex-shrink-0'>
					<Avatar className='h-8 w-8 border bg-primary/10'>
						<AvatarFallback className='text-primary'>
							<Bot className='h-4 w-4' />
						</AvatarFallback>
						{/* TODO: Replace with actual bot avatar if available */}
						{/* <AvatarImage src="/silvia-avatar.png" alt="SilvIA" /> */}
					</Avatar>
				</div>
			)}

			<div
				className={cn(
					'flex max-w-[85%] flex-col gap-2',
					isUser ? 'items-end' : 'items-start'
				)}
			>
				<div className='flex items-center gap-2'>
					<span className='text-sm font-medium text-muted-foreground'>
						{isUser ? 'You' : 'SilvIA'}
						{/* TODO: Make bot name configurable */}
					</span>
					<span className='text-xs text-muted-foreground'>
						{format(
							typeof message.timestamp === 'string'
								? new Date(message.timestamp)
								: message.timestamp,
							'h:mm a'
						)}
					</span>
				</div>

				<div
					className={cn(
						'rounded-xl px-4 py-3 text-sm',
						isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
					)}
				>
					{/* TODO: Add syntax highlighting for code blocks */}
					<ReactMarkdown
						components={{
							p: ({ children }) => <p className='mb-2 last:mb-0'>{children}</p>,
							ul: ({ children }) => (
								<ul className='mb-2 list-disc pl-4 last:mb-0'>{children}</ul>
							),
							ol: ({ children }) => (
								<ol className='mb-2 list-decimal pl-4 last:mb-0'>{children}</ol>
							),
							li: ({ children }) => (
								<li className='mb-1 last:mb-0'>{children}</li>
							),
							h1: ({ children }) => (
								<h1 className='mb-2 text-lg font-bold last:mb-0'>{children}</h1>
							),
							h2: ({ children }) => (
								<h2 className='mb-2 text-base font-bold last:mb-0'>
									{children}
								</h2>
							),
							h3: ({ children }) => (
								<h3 className='mb-2 text-sm font-bold last:mb-0'>{children}</h3>
							),
							strong: ({ children }) => (
								<strong className='font-bold'>{children}</strong>
							),
							em: ({ children }) => <em className='italic'>{children}</em>,
							code: ({ children }) => (
								<code className='rounded bg-muted-foreground/20 px-1 py-0.5 font-mono text-sm'>
									{children}
								</code>
							),
							a: ({ href, children }) => (
								<a
									href={href}
									className='text-primary underline'
									target='_blank'
									rel='noopener noreferrer'
								>
									{children}
								</a>
							),
							// Add more components as needed, e.g., for code blocks
						}}
					>
						{message.content}
					</ReactMarkdown>
				</div>
			</div>

			{isUser && (
				<div className='ml-3 flex-shrink-0'>
					<Avatar className='h-8 w-8 border'>
						{/* TODO: Replace with actual user avatar */}
						<AvatarFallback>
							<User className='h-4 w-4' />
						</AvatarFallback>
					</Avatar>
				</div>
			)}
		</div>
	)
}
