'use client'

import { useState, useEffect } from 'react'
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import {
	createIdeaAction,
	updateIdeaAction,
	deleteIdeaAction,
} from '@/actions/memories/idea'
import {
	createLinkAction,
	updateLinkAction,
	deleteLinkAction,
} from '@/actions/memories/link'

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
	const [ideaSubmitting, setIdeaSubmitting] = useState(false)
	const [linkSubmitting, setLinkSubmitting] = useState(false)

	// Estado para el diálogo de confirmación de eliminación
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [itemToDelete, setItemToDelete] = useState<{
		id: string
		type: 'link' | 'idea'
		title: string
	} | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)

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

	// Función para recargar datos
	const refreshData = async () => {
		setIsLoading(true)
		setError(null)

		console.log('Iniciando recarga de datos...')

		try {
			// Agregar timestamp para evitar caché del navegador
			const timestamp = new Date().getTime()
			const response = await fetch(
				`/api/memories/recent?limit=20&t=${timestamp}`,
				{
					cache: 'no-store',
					headers: {
						'Cache-Control': 'no-cache, no-store, must-revalidate',
						Pragma: 'no-cache',
						Expires: '0',
					},
				}
			)

			if (!response.ok) {
				throw new Error(`Error: ${response.status}`)
			}

			const data = (await response.json()) as ServerMemory[]
			console.log(`Datos recibidos: ${data.length} elementos`)

			const parsedData = parseServerData(data)
			const linkItems = parsedData.filter(
				(item) => 'url' in item
			) as (LinkData & { type: 'link' })[]
			const ideaItems = parsedData.filter(
				(item) => 'content' in item
			) as (IdeaData & { type: 'idea' })[]

			// Limpiar estados de edición
			setEditingLink(null)
			setEditingIdea(null)

			// Actualizar estados
			setLinks(linkItems)
			setIdeas(ideaItems)
			setSavedItems(prepareSavedItems(linkItems, ideaItems))

			console.log(
				`Datos procesados: ${linkItems.length} enlaces, ${ideaItems.length} ideas`
			)

			toast.success('Datos actualizados', {
				description: 'Se han cargado los datos más recientes.',
			})
		} catch (err) {
			console.error('Error al cargar datos recientes:', err)
			setError('No se pudieron cargar los datos recientes')
			toast.error('Error al cargar datos', {
				description:
					'No se pudieron cargar los datos recientes. Intente de nuevo más tarde.',
			})
		} finally {
			setIsLoading(false)
			console.log('Finalizada recarga de datos')
		}
	}

	// Manejadores para Link
	const handleSaveLink = async (data: SaveLinkFormData) => {
		try {
			setLinkSubmitting(true)

			// Si estamos editando, actualizar el link existente
			if (editingLink && editingLink.id) {
				// Actualizar enlace existente usando server action
				const result = await updateLinkAction({
					id: editingLink.id,
					...data,
					priority: 'MEDIUM', // Por defecto
				})

				if (result.success) {
					// Cerrar el diálogo después de una operación exitosa
					setLinkDialogOpen(false)

					toast.success('Enlace actualizado', {
						description: `El enlace "${data.title}" ha sido actualizado correctamente.`,
					})

					// Limpiar el estado de edición antes de recargar
					setEditingLink(null)
					// Recargar los datos sin refrescar la página
					await refreshData()
				} else {
					toast.error('Error al actualizar el enlace', {
						description: result.error || 'Ocurrió un error inesperado.',
					})
				}
			} else {
				// Crear nuevo enlace usando server action
				const result = await createLinkAction({
					...data,
					priority: 'MEDIUM', // Por defecto
				})

				if (result.success) {
					// Cerrar el diálogo después de una operación exitosa
					setLinkDialogOpen(false)

					toast.success('Enlace guardado', {
						description: `El enlace "${data.title}" ha sido guardado correctamente.`,
					})

					// Recargar los datos sin refrescar la página
					await refreshData()
				} else {
					toast.error('Error al guardar el enlace', {
						description: result.error || 'Ocurrió un error inesperado.',
					})
				}
			}
		} catch (error) {
			console.error('Error en la acción del servidor:', error)
			toast.error('Error', {
				description:
					'Ocurrió un error al procesar el enlace. Inténtelo de nuevo más tarde.',
			})
		} finally {
			setLinkSubmitting(false)
			setEditingLink(null)
		}
	}

	// Manejadores para Idea
	const handleSaveIdea = async (data: SaveIdeaFormData) => {
		try {
			setIdeaSubmitting(true)

			if (editingIdea && editingIdea.id) {
				// Actualizar idea existente usando server action
				const result = await updateIdeaAction({
					id: editingIdea.id,
					title: data.title,
					content: data.content || '',
					category: data.category,
					tags: data.tags || '',
					priority: 'MEDIUM', // Por defecto
				})

				if (result.success) {
					// Cerrar el diálogo después de una operación exitosa
					setIdeaDialogOpen(false)

					toast.success('Idea actualizada', {
						description: `La idea "${data.title}" ha sido actualizada correctamente.`,
					})

					// Limpiar el estado de edición antes de recargar
					setEditingIdea(null)
					// Recargar los datos sin refrescar la página
					await refreshData()
				} else {
					toast.error('Error al actualizar la idea', {
						description: result.error || 'Ocurrió un error inesperado.',
					})
				}
			} else {
				// Crear nueva idea usando server action
				const result = await createIdeaAction({
					title: data.title,
					content: data.content || '',
					category: data.category,
					tags: data.tags || '',
					priority: 'MEDIUM', // Por defecto
				})

				if (result.success) {
					// Cerrar el diálogo después de una operación exitosa
					setIdeaDialogOpen(false)

					toast.success('Idea guardada', {
						description: `La idea "${data.title}" ha sido guardada correctamente.`,
					})

					// Recargar los datos sin refrescar la página
					await refreshData()
				} else {
					toast.error('Error al guardar la idea', {
						description: result.error || 'Ocurrió un error inesperado.',
					})
				}
			}
		} catch (error) {
			console.error('Error en la acción del servidor:', error)
			toast.error('Error', {
				description:
					'Ocurrió un error al procesar la idea. Inténtelo de nuevo más tarde.',
			})
		} finally {
			setIdeaSubmitting(false)
			setEditingIdea(null)
		}
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

	// Método para mostrar el diálogo de confirmación
	const confirmDelete = (id: string, type: 'link' | 'idea', title: string) => {
		setItemToDelete({ id, type, title })
		setDeleteDialogOpen(true)
	}

	// Método para ejecutar la eliminación después de la confirmación
	const executeDelete = async () => {
		if (!itemToDelete) return

		setIsDeleting(true)

		try {
			const { id, type, title } = itemToDelete

			if (type === 'link') {
				// Usar server action para eliminar link
				const result = await deleteLinkAction(id)

				if (result.success) {
					// Actualizar UI optimísticamente
					const updatedLinks = links.filter((link) => link.id !== id)
					setLinks(updatedLinks)
					setSavedItems(prepareSavedItems(updatedLinks, ideas))

					toast.success('Enlace eliminado', {
						description: `El enlace "${title}" ha sido eliminado.`,
					})
				} else {
					toast.error('Error al eliminar el enlace', {
						description: result.error || 'Ocurrió un error inesperado.',
					})
				}
			} else {
				// Usar server action para eliminar idea
				const result = await deleteIdeaAction(id)

				if (result.success) {
					// Actualizar UI optimísticamente
					const updatedIdeas = ideas.filter((idea) => idea.id !== id)
					setIdeas(updatedIdeas)
					setSavedItems(prepareSavedItems(links, updatedIdeas))

					toast.success('Idea eliminada', {
						description: `La idea "${title}" ha sido eliminada.`,
					})
				} else {
					toast.error('Error al eliminar la idea', {
						description: result.error || 'Ocurrió un error inesperado.',
					})
				}
			}
		} catch (error) {
			console.error('Error al eliminar:', error)
			toast.error('Error', {
				description:
					'Ocurrió un error al eliminar el elemento. Inténtelo de nuevo más tarde.',
			})
		} finally {
			setIsDeleting(false)
			setDeleteDialogOpen(false)
			setItemToDelete(null)
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
										onClick={() =>
											confirmDelete(item.id || '', item.type, item.title)
										}
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

	const handleRefreshClick = () => {
		refreshData()
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
							isSubmitting={linkSubmitting}
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
							isSubmitting={ideaSubmitting}
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
						onClick={handleRefreshClick}
						className='text-sm text-primary hover:underline'
					>
						Refresh
					</Button>
				</div>

				<ScrollArea className='h-[calc(100vh-48%)] md:h-[calc(100vh-300px)] pb-2'>
					<div className='space-y-4 pr-4'>{renderRecentSaves()}</div>
				</ScrollArea>
			</div>

			{/* Diálogo de confirmación de eliminación */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
						<AlertDialogDescription>
							{itemToDelete?.type === 'link'
								? `El enlace "${itemToDelete?.title}" se eliminará permanentemente.`
								: `La idea "${itemToDelete?.title}" se eliminará permanentemente.`}
							Esta acción no se puede deshacer.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>
							Cancelar
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={executeDelete}
							disabled={isDeleting}
							className='bg-destructive hover:bg-destructive/90'
						>
							{isDeleting ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Eliminando...
								</>
							) : (
								'Eliminar'
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
