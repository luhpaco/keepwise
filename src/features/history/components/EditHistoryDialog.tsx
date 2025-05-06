'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ChatHistoryItem } from '../types'

interface EditHistoryDialogProps {
	chat: ChatHistoryItem | null
	onClose: () => void
	onSave: (editedChat: ChatHistoryItem) => void
}

export function EditHistoryDialog({
	chat,
	onClose,
	onSave,
}: EditHistoryDialogProps) {
	const [title, setTitle] = useState('')

	useEffect(() => {
		if (chat) {
			setTitle(chat.title)
		}
	}, [chat])

	const handleSave = () => {
		if (chat && title.trim()) {
			onSave({ ...chat, title: title.trim() })
		}
	}

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			onClose()
		}
	}

	return (
		<Dialog open={chat !== null} onOpenChange={handleOpenChange}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Edit Chat Title</DialogTitle>
					<DialogDescription>
						Make changes to the chat title here. Click save when you're done.
					</DialogDescription>
				</DialogHeader>
				<div className='grid gap-4 py-4'>
					<div className='grid grid-cols-4 items-center gap-4'>
						<Label htmlFor='title' className='text-right'>
							Title
						</Label>
						<Input
							id='title'
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className='col-span-3'
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant='outline' onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleSave}>Save changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
