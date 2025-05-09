'use client'

import { useState, useEffect } from 'react'
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SaveLinkForm } from '@/features/link-management/components/save-link-form'
import { RecentLinks } from '@/features/link-management/components/recent-links'
import { LinkData, SaveLinkFormData } from '@/features/link-management/types'
import { CaptureIdeaForm } from '@/features/idea-management/components/capture-idea-form'
import { IdeaData, SaveIdeaFormData } from '@/features/idea-management/types'
import { Link, Lightbulb, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'

// Array de variantes de colores para las badges
const badgeVariants = [
	'default',
	'secondary',
	'destructive',
	'outline',
] as const

// Función para obtener un color consistente basado en el texto de la etiqueta
const getBadgeVariantFromTag = (tag: string) => {
	// Simple hash function para obtener un número basado en el texto
	const hash = tag.split('').reduce((acc, char) => {
		return acc + char.charCodeAt(0)
	}, 0)

	// Usamos el módulo para obtener un índice dentro del rango del array
	const index = hash % badgeVariants.length
	return badgeVariants[index]
}

// Tipo para datos que vienen del servidor
type ServerMemory = {
	id: string
	title: string
	type: 'LINK' | 'IDEA'
	tags: string[]
	category?: string
	createdAt: string
	updatedAt: string
	url?: string
	description?: string
	author?: string
	source?: string
	personalNotes?: string
	content?: string
	attachments?: {
		name: string
		url: string
		type: string
		size: number
	}[]
}

// Función para convertir las fechas de string a Date
const parseServerData = (data: ServerMemory[]): (LinkData | IdeaData)[] => {
	return data.map((item) => {
		const base = {
			id: item.id,
			title: item.title,
			category: item.category,
			tags: item.tags,
			createdAt: new Date(item.createdAt),
			updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
		}

		if (item.type === 'LINK') {
			return {
				...base,
				url: item.url!,
				description: item.description,
				author: item.author,
				source: item.source,
				personalNotes: item.personalNotes,
				type: 'link' as const,
			} as LinkData & { type: 'link' }
		} else {
			return {
				...base,
				content: item.content,
				attachments: item.attachments,
				type: 'idea' as const,
			} as IdeaData & { type: 'idea' }
		}
	})
}

// Función para convertir los datos a un formato unificado
const prepareSavedItems = (
	links: (LinkData & { type: 'link' })[],
	ideas: (IdeaData & { type: 'idea' })[]
) => {
	// Combinar y ordenar por fecha (más recientes primero)
	return [...links, ...ideas].sort((a, b) => {
		const dateA = a.createdAt || new Date()
		const dateB = b.createdAt || new Date()
		return dateB.getTime() - dateA.getTime()
	})
}

export default function SavePage() {
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [links, setLinks] = useState<(LinkData & { type: 'link' })[]>([])
	const [ideas, setIdeas] = useState<(IdeaData & { type: 'idea' })[]>([])
	const [savedItems, setSavedItems] = useState<
		((LinkData & { type: 'link' }) | (IdeaData & { type: 'idea' }))[]
	>([])

	const [linkDialogOpen, setLinkDialogOpen] = useState(false)
	const [ideaDialogOpen, setIdeaDialogOpen] = useState(false)
	const [editingLink, setEditingLink] = useState<
		(LinkData & { type: 'link' }) | null
	>(null)
	const [editingIdea, setEditingIdea] = useState<
		(IdeaData & { type: 'idea' }) | null
	>(null)

	// Cargar datos recientes del servidor
	useEffect(() => {
		const fetchRecentData = async () => {
			setIsLoading(true)
			setError(null)

			try {
				const response = await fetch('/api/memories/recent?limit=20')

				if (!response.ok) {
					throw new Error(`Error: ${response.status}`)
				}

				const data = (await response.json()) as ServerMemory[]

				const parsedData = parseServerData(data)
				const linkItems = parsedData.filter(
					(item) => 'url' in item
				) as (LinkData & { type: 'link' })[]
				const ideaItems = parsedData.filter(
					(item) => 'content' in item
				) as (IdeaData & { type: 'idea' })[]

				setLinks(linkItems)
				setIdeas(ideaItems)
				setSavedItems(prepareSavedItems(linkItems, ideaItems))
			} catch (err) {
				console.error('Error al cargar datos recientes:', err)
				setError('No se pudieron cargar los datos recientes')
				toast.error('Error al cargar datos', {
					description:
						'No se pudieron cargar los datos recientes. Intente de nuevo más tarde.',
				})
			} finally {
				setIsLoading(false)
			}
		}

		fetchRecentData()
	}, [])

	// Manejadores para Link
	const handleSaveLink = (data: SaveLinkFormData) => {
		// Si estamos editando, actualizar el link existente
		if (editingLink && editingLink.id) {
			const updatedLinks = links.map((link) =>
				link.id === editingLink.id
					? {
							...link,
							...data,
							tags: data.tags
								? data.tags.split(',').map((tag) => tag.trim())
								: [],
							updatedAt: new Date(),
					  }
					: link
			)
			setLinks(updatedLinks)
			setSavedItems(prepareSavedItems(updatedLinks, ideas))
			toast.success('Enlace actualizado', {
				description: `El enlace "${data.title}" ha sido actualizado correctamente.`,
			})
		} else {
			// Si es un nuevo link, añadirlo a la lista
			const newLink: LinkData & { type: 'link' } = {
				id: Date.now().toString(),
				...data,
				tags: data.tags ? data.tags.split(',').map((tag) => tag.trim()) : [],
				createdAt: new Date(),
				type: 'link',
			}
			const updatedLinks = [newLink, ...links]
			setLinks(updatedLinks)
			setSavedItems(prepareSavedItems(updatedLinks, ideas))
			toast.success('Enlace guardado', {
				description: `El enlace "${data.title}" ha sido guardado correctamente.`,
			})
		}

		// Cerrar el diálogo y resetear el estado de edición
		setLinkDialogOpen(false)
		setEditingLink(null)
	}

	// Manejadores para Idea
	const handleSaveIdea = (data: SaveIdeaFormData) => {
		// Si estamos editando, actualizar la idea existente
		if (editingIdea && editingIdea.id) {
			const updatedIdeas = ideas.map((idea) =>
				idea.id === editingIdea.id
					? {
							...idea,
							...data,
							tags: data.tags
								? data.tags.split(',').map((tag) => tag.trim())
								: [],
							// Convertir los Files a formato de almacenamiento si es necesario
							attachments: data.attachments
								? data.attachments.map((file) => ({
										name: file.name,
										type: file.type,
										url: URL.createObjectURL(file),
								  }))
								: idea.attachments,
							updatedAt: new Date(),
					  }
					: idea
			)
			setIdeas(updatedIdeas)
			setSavedItems(prepareSavedItems(links, updatedIdeas))
			toast.success('Idea actualizada', {
				description: `La idea "${data.title}" ha sido actualizada correctamente.`,
			})
		} else {
			// Si es una nueva idea, añadirla a la lista
			const newIdea: IdeaData & { type: 'idea' } = {
				id: Date.now().toString(),
				title: data.title,
				content: data.content,
				category: data.category,
				tags: data.tags ? data.tags.split(',').map((tag) => tag.trim()) : [],
				// Convertir los Files a formato de almacenamiento
				attachments: data.attachments
					? data.attachments.map((file) => ({
							name: file.name,
							type: file.type,
							url: URL.createObjectURL(file),
					  }))
					: undefined,
				createdAt: new Date(),
				type: 'idea',
			}
			const updatedIdeas = [newIdea, ...ideas]
			setIdeas(updatedIdeas)
			setSavedItems(prepareSavedItems(links, updatedIdeas))
			toast.success('Idea guardada', {
				description: `La idea "${data.title}" ha sido guardada correctamente.`,
			})
		}

		// Cerrar el diálogo y resetear el estado de edición
		setIdeaDialogOpen(false)
		setEditingIdea(null)
	}

	const handleEditItem = (
		item: (LinkData & { type: 'link' }) | (IdeaData & { type: 'idea' })
	) => {
		if (item.type === 'link') {
			setEditingLink(item as LinkData & { type: 'link' })
			setLinkDialogOpen(true)
		} else {
			setEditingIdea(item as IdeaData & { type: 'idea' })
			setIdeaDialogOpen(true)
		}
	}

	const handleDeleteItem = (id: string, type: 'link' | 'idea') => {
		if (type === 'link') {
			const linkToDelete = links.find((link) => link.id === id)
			const updatedLinks = links.filter((link) => link.id !== id)
			setLinks(updatedLinks)
			setSavedItems(prepareSavedItems(updatedLinks, ideas))
			toast.success('Enlace eliminado', {
				description: linkToDelete
					? `El enlace "${linkToDelete.title}" ha sido eliminado.`
					: 'El enlace ha sido eliminado.',
			})
		} else {
			const ideaToDelete = ideas.find((idea) => idea.id === id)
			const updatedIdeas = ideas.filter((idea) => idea.id !== id)
			setIdeas(updatedIdeas)
			setSavedItems(prepareSavedItems(links, updatedIdeas))
			toast.success('Idea eliminada', {
				description: ideaToDelete
					? `La idea "${ideaToDelete.title}" ha sido eliminada.`
					: 'La idea ha sido eliminada.',
			})
		}
	}

	// Renderizar la lista de enlaces recientes
	const renderRecentSaves = () => {
		if (isLoading) {
			return (
				<div className='flex justify-center items-center p-12'>
					<Loader2 className='h-8 w-8 animate-spin text-primary' />
					<span className='ml-2 text-muted-foreground'>
						Cargando elementos guardados...
					</span>
				</div>
			)
		}

		if (error) {
			return (
				<Alert variant='destructive' className='my-4'>
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)
		}

		if (savedItems.length === 0) {
			return (
				<Alert className='my-4'>
					<AlertTitle>No hay elementos guardados</AlertTitle>
					<AlertDescription>
						No hay elementos guardados recientemente. ¡Comienza guardando un
						enlace o una idea utilizando las opciones de arriba!
					</AlertDescription>
				</Alert>
			)
		}

		return savedItems.map((item) => {
			const isLink = item.type === 'link'

			return (
				<div
					key={`${item.type}-${item.id}`}
					className='p-4 rounded-lg border border-border bg-card hover:bg-card/80 transition-colors'
				>
					<div className='flex items-start gap-3'>
						<div className='mt-0.5 p-2 rounded-md bg-muted'>
							{isLink ? (
								<Link className='h-4 w-4 text-primary' />
							) : (
								<Lightbulb className='h-4 w-4 text-primary' />
							)}
						</div>

						<div className='flex-1'>
							<div className='flex items-start justify-between'>
								<div>
									<h3 className='font-medium'>
										{isLink ? (
											<a
												href={(item as LinkData & { type: 'link' }).url}
												target='_blank'
												rel='noopener noreferrer'
												className='hover:underline inline-flex items-center gap-1.5'
											>
												{item.title}
												<svg
													className='h-3.5 w-3.5'
													xmlns='http://www.w3.org/2000/svg'
													viewBox='0 0 24 24'
													fill='none'
													stroke='currentColor'
													strokeWidth='2'
													strokeLinecap='round'
													strokeLinejoin='round'
												>
													<path d='M7 7h10v10' />
													<path d='M7 17 17 7' />
												</svg>
											</a>
										) : (
											<span>{item.title}</span>
										)}
									</h3>

									<div className='flex flex-wrap gap-1.5 mt-1'>
										{item.category && (
											<span className='px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary'>
												{item.category}
											</span>
										)}

										{item.tags &&
											item.tags.map((tag, index) => (
												<Badge
													key={index}
													variant={getBadgeVariantFromTag(tag)}
												>
													{tag}
												</Badge>
											))}
									</div>
								</div>

								<div className='flex gap-1'>
									<button
										onClick={() => handleEditItem(item)}
										className='p-1.5 rounded-md hover:bg-muted transition-colors'
										title='Edit'
									>
										<svg
											className='h-4 w-4'
											xmlns='http://www.w3.org/2000/svg'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
										>
											<path d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'></path>
											<path d='m15 5 4 4'></path>
										</svg>
									</button>
									<button
										onClick={() => handleDeleteItem(item.id || '', item.type)}
										className='p-1.5 rounded-md hover:bg-muted transition-colors'
										title='Delete'
									>
										<svg
											className='h-4 w-4'
											xmlns='http://www.w3.org/2000/svg'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
										>
											<path d='M3 6h18'></path>
											<path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6'></path>
											<path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'></path>
										</svg>
									</button>
								</div>
							</div>

							{(isLink
								? (item as LinkData & { type: 'link' }).description
								: (item as IdeaData & { type: 'idea' }).content) && (
								<p className='text-sm text-muted-foreground mt-2 line-clamp-2'>
									{isLink
										? (item as LinkData & { type: 'link' }).description
										: (item as IdeaData & { type: 'idea' }).content}
								</p>
							)}

							<div className='flex items-center gap-3 mt-3 text-xs text-muted-foreground'>
								{item.createdAt && (
									<span>
										{isLink ? 'Saved' : 'Created'} {formatDate(item.createdAt)}
									</span>
								)}

								{isLink && (item as LinkData & { type: 'link' }).source && (
									<>
										<span>•</span>
										<span>{(item as LinkData & { type: 'link' }).source}</span>
									</>
								)}

								{isLink && (item as LinkData & { type: 'link' }).author && (
									<>
										<span>•</span>
										<span>
											By {(item as LinkData & { type: 'link' }).author}
										</span>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			)
		})
	}

	// Función para formatear la fecha (simplificada)
	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		}).format(date)
	}

	return (
		<div className='container mx-auto py-8 px-4 sm:px-6 max-w-7xl flex flex-col gap-4 md:gap-8 h-full'>
			{/* Cards para las acciones principales */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				{/* Save Link Card */}
				<Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
					<DialogTrigger asChild>
						<div className='flex flex-col cursor-pointer p-6 rounded-xl border border-border bg-card hover:bg-card/80 transition-colors'>
							<div className='flex items-center gap-2 mb-2'>
								<div className='p-2 rounded-md bg-primary/10'>
									<Link className='h-5 w-5 text-primary' />
								</div>
								<h2 className='text-lg font-semibold'>Save Link</h2>
							</div>
							<p className='text-sm text-muted-foreground'>
								Bookmark important websites, articles, and resources
							</p>
						</div>
					</DialogTrigger>
					<DialogContent className='sm:max-w-2xl px-0 py-0 border-none bg-transparent'>
						<DialogTitle className='sr-only'>Save Link</DialogTitle>
						<DialogDescription className='sr-only'>
							Form to save a link with details such as URL, title, description,
							and more.
						</DialogDescription>
						<SaveLinkForm
							onSubmit={handleSaveLink}
							onCancel={() => {
								setLinkDialogOpen(false)
								setEditingLink(null)
							}}
							initialData={
								editingLink
									? {
											url: editingLink.url,
											title: editingLink.title,
											description: editingLink.description || '',
											category: editingLink.category,
											author: editingLink.author || '',
											source: editingLink.source || '',
											tags: editingLink.tags?.join(', ') || '',
											personalNotes: editingLink.personalNotes || '',
									  }
									: undefined
							}
						/>
					</DialogContent>
				</Dialog>

				{/* Capture Idea Card */}
				<Dialog open={ideaDialogOpen} onOpenChange={setIdeaDialogOpen}>
					<DialogTrigger asChild>
						<div className='flex flex-col cursor-pointer p-6 rounded-xl border border-border bg-card hover:bg-card/80 transition-colors'>
							<div className='flex items-center gap-2 mb-2'>
								<div className='p-2 rounded-md bg-primary/10'>
									<Lightbulb className='h-5 w-5 text-primary' />
								</div>
								<h2 className='text-lg font-semibold'>Capture Idea</h2>
							</div>
							<p className='text-sm text-muted-foreground'>
								Document your creative sparks, thoughts, and insights
							</p>
						</div>
					</DialogTrigger>
					<DialogContent className='sm:max-w-2xl px-0 py-0 border-none bg-transparent'>
						<DialogTitle className='sr-only'>Capture Idea</DialogTitle>
						<DialogDescription className='sr-only'>
							Form to capture an idea with fields for title, content, category,
							tags, and attachments.
						</DialogDescription>
						<CaptureIdeaForm
							onSubmit={handleSaveIdea}
							onCancel={() => {
								setIdeaDialogOpen(false)
								setEditingIdea(null)
							}}
							initialData={
								editingIdea
									? {
											title: editingIdea.title,
											content: editingIdea.content || '',
											category: editingIdea.category,
											tags: editingIdea.tags?.join(', ') || '',
									  }
									: undefined
							}
						/>
					</DialogContent>
				</Dialog>
			</div>

			{/* Recent Saves Section */}
			<div className='flex-1 h-full gap-4'>
				<div className='flex items-center justify-between mb-4'>
					<h2 className='text-xl font-semibold'>Recent Saves</h2>
					<Button
						variant='ghost'
						size='sm'
						disabled={isLoading}
						onClick={() => window.location.reload()}
						className='text-sm text-primary hover:underline'
					>
						Refresh
					</Button>
				</div>

				<ScrollArea className='h-[calc(100vh-48%)] md:h-[calc(100vh-300px)] pb-2'>
					<div className='space-y-4 pr-4'>{renderRecentSaves()}</div>
				</ScrollArea>
			</div>
		</div>
	)
}
