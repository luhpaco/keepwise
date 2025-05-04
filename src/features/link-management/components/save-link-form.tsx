'use client'

import { useState } from 'react'
import { LinkCategory, SaveLinkFormData } from '../types'
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
import { Link } from 'lucide-react'

interface SaveLinkFormProps {
	onSubmit: (data: SaveLinkFormData) => void
	onCancel: () => void
	initialData?: Partial<SaveLinkFormData>
}

const CATEGORIES: LinkCategory[] = [
	'Work',
	'Personal',
	'Research',
	'Learning',
	'Reference',
]

export function SaveLinkForm({
	onSubmit,
	onCancel,
	initialData,
}: SaveLinkFormProps) {
	const [formData, setFormData] = useState<SaveLinkFormData>({
		url: initialData?.url || '',
		title: initialData?.title || '',
		description: initialData?.description || '',
		category: initialData?.category,
		author: initialData?.author || '',
		source: initialData?.source || '',
		tags: initialData?.tags || '',
		personalNotes: initialData?.personalNotes || '',
	})

	const [isLoading, setIsLoading] = useState(false)
	const [isLoadingPreview, setIsLoadingPreview] = useState(false)
	const [previewData, setPreviewData] = useState<{
		title?: string
		description?: string
		image?: string
	} | null>(null)

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	const handleCategoryChange = (value: string) => {
		setFormData((prev) => ({ ...prev, category: value as LinkCategory }))
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)

		try {
			onSubmit(formData)
		} catch (error) {
			console.error('Error saving link:', error)
		} finally {
			setIsLoading(false)
		}
	}

	// Simulación de carga de vista previa (en un proyecto real, esto llamaría a una API)
	const fetchPreview = async () => {
		if (!formData.url) return

		setIsLoadingPreview(true)
		try {
			// Aquí iría una llamada a la API para obtener la vista previa
			// Por ahora simulamos un resultado después de un tiempo
			setTimeout(() => {
				setPreviewData({
					title: 'Example Website Article',
					description:
						"This is a preview of the content you're trying to save. The article discusses important developments in technology and design.",
					image: '/placeholder-image.jpg',
				})

				// Auto-rellenar título y descripción si están vacíos
				if (!formData.title) {
					setFormData((prev) => ({ ...prev, title: 'Example Website Article' }))
				}
				if (!formData.description) {
					setFormData((prev) => ({
						...prev,
						description:
							"This is a preview of the content you're trying to save. The article discusses important developments in technology and design.",
					}))
				}

				setIsLoadingPreview(false)
			}, 1000)
		} catch (error) {
			console.error('Error fetching preview:', error)
			setIsLoadingPreview(false)
		}
	}

	return (
		<div className='w-full max-w-2xl bg-background rounded-lg border border-border'>
			<div className='flex items-center justify-between p-4 border-b border-border'>
				<div className='flex items-center gap-2'>
					<Link className='h-5 w-5' />
					<h2 className='text-lg font-semibold'>Save Link</h2>
				</div>
			</div>

			<form onSubmit={handleSubmit} className='p-4 space-y-4'>
				{/* URL Field */}
				<div className='space-y-2'>
					<label htmlFor='url' className='block text-sm font-medium'>
						URL
					</label>
					<div className='flex gap-2'>
						<div className='flex-1 relative'>
							<div className='absolute left-3 top-1/2 transform -translate-y-1/2'>
								<Link className='h-4 w-4 text-muted-foreground' />
							</div>
							<Input
								id='url'
								name='url'
								placeholder='Paste a link to save...'
								value={formData.url}
								onChange={handleChange}
								className='pl-9'
								required
							/>
						</div>
						<Button
							type='button'
							variant='secondary'
							onClick={fetchPreview}
							disabled={!formData.url || isLoadingPreview}
						>
							{isLoadingPreview ? 'Loading...' : 'Preview'}
						</Button>
					</div>
				</div>

				{/* Preview Display (only shown when preview data exists) */}
				{previewData && (
					<div className='p-4 border border-border rounded-md bg-muted/30'>
						<div className='flex gap-4'>
							{previewData.image && (
								<div className='w-24 h-24 bg-muted rounded flex items-center justify-center'>
									<svg
										className='w-8 h-8 text-muted-foreground'
										xmlns='http://www.w3.org/2000/svg'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
									>
										<rect width='18' height='18' x='3' y='3' rx='2' ry='2' />
										<circle cx='9' cy='9' r='2' />
										<path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' />
									</svg>
								</div>
							)}
							<div className='flex-1'>
								<h3 className='font-medium text-primary'>
									{previewData.title}
								</h3>
								<p className='text-sm text-muted-foreground mt-1'>
									{previewData.description}
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Category Field */}
				<div className='space-y-2'>
					<label htmlFor='category' className='block text-sm font-medium'>
						Category
					</label>
					<Select
						value={formData.category}
						onValueChange={handleCategoryChange}
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
						placeholder='Enter title...'
						value={formData.title}
						onChange={handleChange}
						required
					/>
				</div>

				{/* Description Field */}
				<div className='space-y-2'>
					<label htmlFor='description' className='block text-sm font-medium'>
						Description
					</label>
					<Textarea
						id='description'
						name='description'
						placeholder='Enter description...'
						value={formData.description}
						onChange={handleChange}
						rows={3}
					/>
				</div>

				{/* Author and Source Fields */}
				<div className='grid grid-cols-2 gap-4'>
					<div className='space-y-2'>
						<label htmlFor='author' className='block text-sm font-medium'>
							Author
						</label>
						<Input
							id='author'
							name='author'
							placeholder='Enter author...'
							value={formData.author}
							onChange={handleChange}
						/>
					</div>
					<div className='space-y-2'>
						<label htmlFor='source' className='block text-sm font-medium'>
							Source
						</label>
						<Input
							id='source'
							name='source'
							placeholder='Enter source...'
							value={formData.source}
							onChange={handleChange}
						/>
					</div>
				</div>

				{/* Tags Field */}
				<div className='space-y-2'>
					<label htmlFor='tags' className='block text-sm font-medium'>
						Tags
					</label>
					<Input
						id='tags'
						name='tags'
						placeholder='Enter tags separated by commas...'
						value={formData.tags}
						onChange={handleChange}
					/>
				</div>

				{/* Personal Notes Field */}
				<div className='space-y-2'>
					<label htmlFor='personalNotes' className='block text-sm font-medium'>
						Personal Notes
					</label>
					<Textarea
						id='personalNotes'
						name='personalNotes'
						placeholder='Add your personal notes about this link...'
						value={formData.personalNotes}
						onChange={handleChange}
						rows={4}
					/>
				</div>

				{/* Actions */}
				<div className='flex justify-end gap-2 pt-2'>
					<Button type='button' variant='outline' onClick={onCancel}>
						Cancel
					</Button>
					<Button type='submit' disabled={isLoading}>
						{isLoading ? 'Saving...' : 'Save Link'}
					</Button>
				</div>
			</form>
		</div>
	)
}
