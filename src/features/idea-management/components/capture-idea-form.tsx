'use client'

import { useState } from 'react'
import { IdeaCategory, SaveIdeaFormData } from '../types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Lightbulb, Loader2 } from 'lucide-react'

interface CaptureIdeaFormProps {
	onSubmit: (data: SaveIdeaFormData) => void
	onCancel: () => void
	initialData?: Partial<SaveIdeaFormData>
	isSubmitting?: boolean
}

const CATEGORIES: IdeaCategory[] = [
	'Work',
	'Personal',
	'Research',
	'Learning',
	'Ideas',
	'Reference',
]

export function CaptureIdeaForm({
	onSubmit,
	onCancel,
	initialData,
	isSubmitting = false,
}: CaptureIdeaFormProps) {
	const [formData, setFormData] = useState<SaveIdeaFormData>({
		title: initialData?.title || '',
		content: initialData?.content || '',
		category: initialData?.category,
		tags: initialData?.tags || '',
	})

	const [attachments, setAttachments] = useState<File[]>([])

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	const handleCategoryChange = (value: string) => {
		setFormData((prev) => ({ ...prev, category: value as IdeaCategory }))
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		try {
			onSubmit({
				...formData,
				attachments: attachments.length > 0 ? attachments : undefined,
			})
		} catch (error) {
			console.error('Error saving idea:', error)
		}
	}

	// Manejo de archivos adjuntos
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const newFiles = Array.from(e.target.files)
			setAttachments((prev) => [...prev, ...newFiles])
		}
	}

	// Simulación de arrastrar y soltar archivos
	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault()
	}

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()
		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			const newFiles = Array.from(e.dataTransfer.files)
			setAttachments((prev) => [...prev, ...newFiles])
		}
	}

	return (
		<div className='w-full max-w-2xl bg-background rounded-lg border border-border'>
			<div className='flex items-center justify-between p-4 border-b border-border'>
				<div className='flex items-center gap-2'>
					<Lightbulb className='h-5 w-5' />
					<h2 className='text-lg font-semibold'>Capture Idea</h2>
				</div>
			</div>

			<form onSubmit={handleSubmit} className='p-4 space-y-4'>
				{/* Category Field */}
				<div className='space-y-2'>
					<label htmlFor='category' className='block text-sm font-medium'>
						Category
					</label>
					<Select
						value={formData.category}
						onValueChange={handleCategoryChange}
						disabled={isSubmitting}
					>
						<SelectTrigger>
							<SelectValue placeholder='Select category' />
						</SelectTrigger>
						<SelectContent>
							{CATEGORIES.map((category) => (
								<SelectItem key={category} value={category}>
									{category}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Title Field */}
				<div className='space-y-2'>
					<label htmlFor='title' className='block text-sm font-medium'>
						Title
					</label>
					<Input
						id='title'
						name='title'
						placeholder='Give your idea a title...'
						value={formData.title}
						onChange={handleChange}
						required
						disabled={isSubmitting}
					/>
				</div>

				{/* Content Field */}
				<div className='space-y-2'>
					<label htmlFor='content' className='block text-sm font-medium'>
						Content
					</label>
					<Textarea
						id='content'
						name='content'
						placeholder='Describe your idea in detail...'
						value={formData.content}
						onChange={handleChange}
						rows={5}
						disabled={isSubmitting}
					/>
				</div>

				{/* Tags Field */}
				<div className='space-y-2'>
					<div className='flex items-center justify-between'>
						<label htmlFor='tags' className='block text-sm font-medium'>
							Tags
						</label>
						<span className='text-xs text-muted-foreground'>
							Separate tags with commas
						</span>
					</div>
					<Input
						id='tags'
						name='tags'
						placeholder='e.g., work, project, idea, important'
						value={formData.tags}
						onChange={handleChange}
						disabled={isSubmitting}
					/>
					<p className='text-xs text-muted-foreground'>
						Tags help organize your ideas and make them easier to find later
					</p>
				</div>

				{/* Attachments */}
				<div className='space-y-2'>
					<label className='block text-sm font-medium'>Attachments</label>
					<div
						className={`border-2 border-dashed border-border rounded-md p-6 text-center ${
							isSubmitting
								? 'opacity-50 cursor-not-allowed'
								: 'cursor-pointer hover:bg-muted/50'
						} transition-colors`}
						onDragOver={handleDragOver}
						onDrop={handleDrop}
						onClick={() =>
							!isSubmitting && document.getElementById('file-upload')?.click()
						}
					>
						<input
							type='file'
							id='file-upload'
							multiple
							className='hidden'
							onChange={handleFileChange}
							disabled={isSubmitting}
						/>
						<div className='flex flex-col items-center justify-center'>
							<svg
								className='mb-2 h-8 w-8 text-muted-foreground'
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242'></path>
								<path d='M12 12v9'></path>
								<path d='m16 16-4-4-4 4'></path>
							</svg>
							<p className='text-sm text-muted-foreground'>
								Drag and drop files here or click to browse
							</p>
							<p className='text-xs text-muted-foreground mt-1'>
								Support for images, documents, audio, and video files
							</p>
						</div>
					</div>

					{/* Lista de archivos adjuntos */}
					{attachments.length > 0 && (
						<div className='mt-2 space-y-2'>
							{attachments.map((file, index) => (
								<div
									key={index}
									className='flex items-center justify-between p-2 bg-muted rounded-md'
								>
									<span className='text-sm truncate'>{file.name}</span>
									<Button
										variant='ghost'
										size='sm'
										onClick={() =>
											setAttachments(attachments.filter((_, i) => i !== index))
										}
										disabled={isSubmitting}
									>
										<svg
											width='15'
											height='15'
											viewBox='0 0 15 15'
											fill='none'
											xmlns='http://www.w3.org/2000/svg'
										>
											<path
												d='M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z'
												fill='currentColor'
											></path>
										</svg>
									</Button>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Actions */}
				<div className='flex justify-end gap-2 pt-2'>
					<Button
						type='button'
						variant='outline'
						onClick={onCancel}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button type='submit' disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Saving...
							</>
						) : (
							'Save Idea'
						)}
					</Button>
				</div>
			</form>
		</div>
	)
}
