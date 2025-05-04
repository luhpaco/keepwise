'use client'

import type React from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { PaperclipIcon, SendIcon, Mic } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'

interface ChatInputProps {
	input: string
	handleInputChange: (
		e:
			| React.ChangeEvent<HTMLTextAreaElement>
			| React.ChangeEvent<HTMLInputElement>
	) => void
	handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
	isLoading: boolean
}

export function ChatInput({
	input,
	handleInputChange,
	handleSubmit,
	isLoading,
}: ChatInputProps) {
	const [isFocused, setIsFocused] = useState(false)
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const autoResizeTextarea = useCallback(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto'
			const scrollHeight = textareaRef.current.scrollHeight
			textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`
		}
	}, [])

	useEffect(() => {
		autoResizeTextarea()
	}, [input, autoResizeTextarea])

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			if (input.trim() && !isLoading) {
				const form = e.currentTarget.closest('form')
				if (form) {
					handleSubmit(
						new Event('submit', {
							cancelable: true,
							bubbles: true,
						}) as unknown as React.FormEvent<HTMLFormElement>
					)
				}
			}
		}
	}

	return (
		<div className='sticky bottom-0 w-full bg-gradient-to-t from-background via-background to-transparent pt-2 pb-4 md:pb-8 z-10'>
			<div className='max-w-3xl mx-auto px-4'>
				<form
					onSubmit={handleSubmit}
					className={`relative flex items-end rounded-lg border bg-background transition-shadow focus-within:ring-1 focus-within:ring-ring ${
						isFocused ? 'shadow-md' : ''
					}`}
				>
					<Button
						type='button'
						size='icon'
						variant='ghost'
						className='absolute left-2 bottom-2.5 h-8 w-8 text-muted-foreground hover:text-foreground'
						aria-label='Attach file'
					>
						<PaperclipIcon className='h-5 w-5' />
					</Button>

					<Textarea
						ref={textareaRef}
						value={input}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						placeholder='Message SilvIA...'
						className='min-h-[56px] max-h-[200px] resize-none border-0 shadow-none pl-12 pr-20 py-3.5 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent'
						rows={1}
						aria-label='Chat message input'
					/>

					<div className='absolute right-2 bottom-2.5 flex gap-1'>
						<Button
							type='button'
							size='icon'
							variant='ghost'
							className='h-8 w-8 text-muted-foreground hover:text-foreground'
							aria-label='Use voice input'
						>
							<Mic className='h-5 w-5' />
						</Button>
						<Button
							type='submit'
							size='icon'
							disabled={!input.trim() || isLoading}
							className='h-8 w-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground'
							aria-label='Send message'
						>
							<SendIcon className='h-4 w-4' />
						</Button>
					</div>
				</form>

				<div className='mt-2 text-center text-xs text-muted-foreground px-4'>
					SilvIA can access your saved information to help you find and recall
					what you need.
				</div>
			</div>
		</div>
	)
}
