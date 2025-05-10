'use client'

import { useState, useEffect } from 'react'
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
import { Link, Loader2 } from 'lucide-react'
import { createLinkAction, updateLinkAction } from '@/actions/memories/link'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

// Ya no necesitamos el hook de debounce porque no usaremos extracción automática
interface SaveLinkFormProps {
	onSubmit: (data: SaveLinkFormData) => void
	onCancel: () => void
	initialData?: Partial<SaveLinkFormData & { id?: string }>
	isSubmitting?: boolean
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
	isSubmitting = false,
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

	const [isLocalSubmitting, setIsLocalSubmitting] = useState(false)
	const [isLoadingPreview, setIsLoadingPreview] = useState(false)
	const [previewData, setPreviewData] = useState<{
		title?: string
		description?: string
		author?: string
		source?: string
		image?: string
		success?: boolean
	} | null>(null)

	// Variable para saber si estamos en modo edición
	const isEditMode = !!initialData?.id

	// Eliminamos useEffect para la extracción automática de metadatos
	// Ahora solo se extraerán metadatos cuando el usuario haga clic en el botón

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	const handleCategoryChange = (value: string) => {
		setFormData((prev) => ({ ...prev, category: value as LinkCategory }))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLocalSubmitting(true)

		try {
			// Pasar la información al componente padre y dejar que él maneje la lógica de servidor
			await onSubmit(formData)
		} catch (error) {
			console.error('Error al procesar el enlace:', error)
			toast.error('Error', {
				description:
					'Ocurrió un error al procesar el enlace. Inténtelo de nuevo más tarde.',
			})
		} finally {
			setIsLocalSubmitting(false)
		}
	}

	// Extraer metadatos de la URL - Solo se activa con el botón
	const fetchPreview = async () => {
		if (!formData.url) return

		console.log(
			'Extrayendo metadatos para URL:',
			formData.url,
			'Modo edición:',
			isEditMode
		)

		setIsLoadingPreview(true)
		setPreviewData(null)

		try {
			const response = await fetch('/api/extract-metadata', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ url: formData.url }),
			})

			if (!response.ok) {
				throw new Error('Error al obtener metadatos')
			}

			const data = await response.json()
			console.log('Metadatos recibidos:', data)

			if (data.success) {
				setPreviewData(data)

				// Solo auto-rellenar campos si estamos creando un nuevo enlace
				// NUNCA modificar datos en modo edición para evitar conflictos
				if (!isEditMode) {
					setFormData((prev) => ({
						...prev,
						title: prev.title || data.title || '',
						description: prev.description || data.description || '',
						author: prev.author || data.author || '',
						source: prev.source || data.source || '',
					}))

					console.log('Metadatos aplicados al formulario (modo creación)')

					toast.success('Metadatos extraídos y aplicados', {
						description: 'Se han extraído y aplicado los metadatos de la URL.',
					})
				} else {
					console.log('Metadatos NO aplicados (modo edición)')
					toast.success('Metadatos extraídos (solo vista previa)', {
						description:
							'Se han extraído los metadatos de la URL pero no se han aplicado para preservar tus cambios actuales.',
					})
				}
			} else {
				toast.error('No se pudieron extraer metadatos', {
					description:
						'No se pudieron extraer los metadatos. Complete los campos manualmente.',
				})
			}
		} catch (error) {
			console.error('Error al obtener metadatos:', error)
			toast.error('Error de conexión', {
				description:
					'No se pudo conectar con el servidor para extraer metadatos.',
			})
		} finally {
			setIsLoadingPreview(false)
			console.log('Finalizada extracción de metadatos')
		}
	}

	// Usar el estado externo cuando se proporciona
	const isFormSubmitting = isSubmitting || isLocalSubmitting || isLoadingPreview

	return (
		<div className='w-full max-w-2xl bg-background rounded-lg border border-border flex flex-col max-h-[85vh]'>
			<div className='flex items-center justify-between p-4 border-b border-border'>
				<div className='flex items-center gap-2'>
					<Link className='h-5 w-5' />
					<h2 className='text-lg font-semibold'>Save Link</h2>
				</div>
			</div>

			<ScrollArea className='flex-1 overflow-auto'>
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
									disabled={isFormSubmitting}
								/>
							</div>
							<Button
								type='button'
								variant='secondary'
								onClick={fetchPreview}
								disabled={!formData.url || isFormSubmitting}
							>
								{isLoadingPreview ? (
									<div className='flex items-center gap-2'>
										<Loader2 className='h-4 w-4 animate-spin' />
										<span>Cargando...</span>
									</div>
								) : (
									'Extraer metadatos'
								)}
							</Button>
						</div>
						<p className='text-xs text-muted-foreground'>
							Pega una URL y presiona "Extraer metadatos" para obtener
							información automáticamente.
						</p>
					</div>

					{/* Preview Display (only shown when preview data exists) */}
					{previewData && previewData.image && (
						<div className='p-4 border border-border rounded-md bg-muted/30'>
							<div className='flex gap-4'>
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
								<div className='flex-1'>
									<h3 className='font-medium text-primary'>
										{previewData.title || 'Vista previa'}
									</h3>
									<p className='text-sm text-muted-foreground mt-1'>
										{previewData.description || 'Sin descripción disponible'}
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
						<p className='text-xs text-muted-foreground'>
							Ingresa etiquetas separadas por comas (ej: "tecnología, noticias,
							programación")
						</p>
					</div>

					{/* Personal Notes Field */}
					<div className='space-y-2'>
						<label
							htmlFor='personalNotes'
							className='block text-sm font-medium'
						>
							Personal Notes
						</label>
						<Textarea
							id='personalNotes'
							name='personalNotes'
							placeholder='Add your personal notes about this link...'
							value={formData.personalNotes}
							onChange={handleChange}
							rows={4}
							disabled={isFormSubmitting}
						/>
					</div>

					{/* Actions */}
					<div className='flex justify-end gap-2 pt-2'>
						<Button
							type='button'
							variant='outline'
							onClick={onCancel}
							disabled={isFormSubmitting}
						>
							Cancelar
						</Button>
						<Button type='submit' disabled={isFormSubmitting}>
							{isFormSubmitting ? (
								<div className='flex items-center gap-2'>
									<Loader2 className='h-4 w-4 animate-spin' />
									<span>
										{isEditMode
											? 'Actualizando enlace...'
											: 'Guardando enlace...'}
									</span>
								</div>
							) : isEditMode ? (
								'Actualizar enlace'
							) : (
								'Guardar enlace'
							)}
						</Button>
					</div>
				</form>
			</ScrollArea>
		</div>
	)
}
