'use client'

import { useState } from 'react'
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
import { Link, Lightbulb } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

// Datos de ejemplo para desarrollo
const mockLinks: LinkData[] = [
	{
		id: '1',
		url: 'https://example.com/article1',
		title: 'Understanding Next.js App Router',
		description:
			'A comprehensive guide to the new App Router in Next.js 15 and how to leverage its features for better performance.',
		category: 'Learning',
		author: 'John Doe',
		source: 'Next.js Blog',
		tags: ['Next.js', 'React', 'Web Development'],
		createdAt: new Date('2023-07-15'),
	},
	{
		id: '2',
		url: 'https://example.com/article2',
		title: 'Building UI Components with Shadcn UI',
		description:
			'Learn how to use Shadcn UI to create beautiful, accessible, and customizable UI components for your React applications.',
		category: 'Research',
		tags: ['UI', 'Design', 'React'],
		createdAt: new Date('2023-07-10'),
	},
	{
		id: '3',
		url: 'https://example.com/article3',
		title: 'TypeScript Best Practices for 2023',
		description:
			'Discover the latest TypeScript patterns and practices that will help you write more maintainable code.',
		category: 'Work',
		author: 'Jane Smith',
		source: 'TypeScript Weekly',
		tags: ['TypeScript', 'JavaScript', 'Programming'],
		createdAt: new Date('2023-07-05'),
	},
]

// Datos de ejemplo para ideas
const mockIdeas: IdeaData[] = [
	{
		id: '1',
		title: 'Mobile App for Task Management',
		content:
			'Create a minimalist task management app with voice input and AI categorization',
		category: 'Ideas',
		tags: ['Mobile', 'Productivity', 'AI'],
		createdAt: new Date('2023-04-14'),
	},
	{
		id: '2',
		title: 'E-commerce Dashboard Redesign',
		content: 'Redesign the dashboard for better usability and visual hierarchy',
		category: 'Work',
		tags: ['UI/UX', 'Dashboard', 'E-commerce'],
		createdAt: new Date('2023-04-12'),
	},
	{
		id: '3',
		title: 'Mobile App for Task Management',
		content:
			'Create a minimalist task management app with voice input and AI categorization',
		category: 'Ideas',
		tags: ['Mobile', 'Productivity', 'AI'],
		createdAt: new Date('2023-04-10'),
	},
]

// Combinamos los dos tipos para el feed de Recent Saves
type SavedItem = (LinkData | IdeaData) & { type: 'link' | 'idea' }

// Array de variantes de colores para las badges
const badgeVariants = [
	'default',
	'secondary',
	'success',
	'warning',
	'info',
	'purple',
	'pink',
	'orange',
	'indigo',
	'teal',
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

// Función para convertir los datos a un formato unificado
const prepareSavedItems = (
	links: LinkData[],
	ideas: IdeaData[]
): SavedItem[] => {
	const linkItems = links.map((link) => ({ ...link, type: 'link' as const }))
	const ideaItems = ideas.map((idea) => ({ ...idea, type: 'idea' as const }))

	// Combinar y ordenar por fecha (más recientes primero)
	return [...linkItems, ...ideaItems].sort((a, b) => {
		const dateA = a.createdAt || new Date()
		const dateB = b.createdAt || new Date()
		return dateB.getTime() - dateA.getTime()
	})
}

export default function SavePage() {
	const [links, setLinks] = useState<LinkData[]>(mockLinks)
	const [ideas, setIdeas] = useState<IdeaData[]>(mockIdeas)
	const [savedItems, setSavedItems] = useState<SavedItem[]>(
		prepareSavedItems(mockLinks, mockIdeas)
	)

	const [linkDialogOpen, setLinkDialogOpen] = useState(false)
	const [ideaDialogOpen, setIdeaDialogOpen] = useState(false)
	const [editingLink, setEditingLink] = useState<LinkData | null>(null)
	const [editingIdea, setEditingIdea] = useState<IdeaData | null>(null)

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
		} else {
			// Si es un nuevo link, añadirlo a la lista
			const newLink: LinkData = {
				id: Date.now().toString(),
				...data,
				tags: data.tags ? data.tags.split(',').map((tag) => tag.trim()) : [],
				createdAt: new Date(),
			}
			const updatedLinks = [newLink, ...links]
			setLinks(updatedLinks)
			setSavedItems(prepareSavedItems(updatedLinks, ideas))
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
		} else {
			// Si es una nueva idea, añadirla a la lista
			const newIdea: IdeaData = {
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
			}
			const updatedIdeas = [newIdea, ...ideas]
			setIdeas(updatedIdeas)
			setSavedItems(prepareSavedItems(links, updatedIdeas))
		}

		// Cerrar el diálogo y resetear el estado de edición
		setIdeaDialogOpen(false)
		setEditingIdea(null)
	}

	const handleEditItem = (item: SavedItem) => {
		if (item.type === 'link') {
			setEditingLink(item as LinkData)
			setLinkDialogOpen(true)
		} else {
			setEditingIdea(item as IdeaData)
			setIdeaDialogOpen(true)
		}
	}

	const handleDeleteItem = (id: string, type: 'link' | 'idea') => {
		if (type === 'link') {
			const updatedLinks = links.filter((link) => link.id !== id)
			setLinks(updatedLinks)
			setSavedItems(prepareSavedItems(updatedLinks, ideas))
		} else {
			const updatedIdeas = ideas.filter((idea) => idea.id !== id)
			setIdeas(updatedIdeas)
			setSavedItems(prepareSavedItems(links, updatedIdeas))
		}
	}

	// Renderizar la lista de enlaces recientes
	const renderRecentSaves = () => {
		if (savedItems.length === 0) {
			return (
				<div className='p-8 text-center text-muted-foreground'>
					No hay elementos guardados recientemente.
				</div>
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
												href={(item as LinkData).url}
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
								? (item as LinkData).description
								: (item as IdeaData).content) && (
								<p className='text-sm text-muted-foreground mt-2 line-clamp-2'>
									{isLink
										? (item as LinkData).description
										: (item as IdeaData).content}
								</p>
							)}

							<div className='flex items-center gap-3 mt-3 text-xs text-muted-foreground'>
								{item.createdAt && (
									<span>
										{isLink ? 'Saved' : 'Created'} {formatDate(item.createdAt)}
									</span>
								)}

								{isLink && (item as LinkData).source && (
									<>
										<span>•</span>
										<span>{(item as LinkData).source}</span>
									</>
								)}

								{isLink && (item as LinkData).author && (
									<>
										<span>•</span>
										<span>By {(item as LinkData).author}</span>
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
					<button className='text-sm text-primary hover:underline'>
						View All
					</button>
				</div>

				<ScrollArea className='h-[calc(100vh-48%)] md:h-[calc(100vh-300px)] pb-2'>
					<div className='space-y-4 pr-4'>{renderRecentSaves()}</div>
				</ScrollArea>
			</div>
		</div>
	)
}
