'use client'

import { useState } from 'react'
import { LinkData } from '../types'
import { ExternalLink, MoreHorizontal } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'

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

// Función para obtener un color aleatorio de las variantes
const getRandomBadgeVariant = () => {
	const randomIndex = Math.floor(Math.random() * badgeVariants.length)
	return badgeVariants[randomIndex]
}

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

interface RecentLinksProps {
	links: LinkData[]
	onEdit?: (link: LinkData) => void
	onDelete?: (id: string) => void
	onView?: (link: LinkData) => void
}

export function RecentLinks({
	links,
	onEdit,
	onDelete,
	onView,
}: RecentLinksProps) {
	// Estado para manejar el menú de acciones
	const [activeMenu, setActiveMenu] = useState<string | null>(null)

	const toggleMenu = (id: string | undefined) => {
		if (!id) return
		setActiveMenu(activeMenu === id ? null : id)
	}

	const handleEdit = (link: LinkData) => {
		if (onEdit) {
			onEdit(link)
			setActiveMenu(null)
		}
	}

	const handleDelete = (id: string | undefined) => {
		if (id && onDelete) {
			onDelete(id)
			setActiveMenu(null)
		}
	}

	const handleView = (link: LinkData) => {
		if (onView) {
			onView(link)
		}
	}

	// Función para formatear la fecha relativa
	const formatDate = (date: Date | undefined) => {
		if (!date) return ''
		return formatDistanceToNow(date, { addSuffix: true, locale: es })
	}

	return (
		<div className='w-full'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-xl font-semibold'>Recent Links</h2>
				<button className='text-sm text-primary hover:underline'>
					View All
				</button>
			</div>

			<div className='space-y-4'>
				{links.length === 0 ? (
					<div className='p-8 text-center text-muted-foreground'>
						No hay enlaces guardados recientemente.
					</div>
				) : (
					links.map((link) => (
						<div
							key={link.id}
							className='p-4 rounded-lg border border-border bg-card hover:bg-card/80 transition-colors'
						>
							<div className='flex items-start justify-between'>
								<div className='flex-1'>
									<h3 className='font-medium'>
										<a
											href={link.url}
											target='_blank'
											rel='noopener noreferrer'
											className='hover:underline inline-flex items-center gap-1'
										>
											{link.title}
											<ExternalLink className='h-3.5 w-3.5' />
										</a>
									</h3>

									{link.description && (
										<p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
											{link.description}
										</p>
									)}

									<div className='flex flex-wrap gap-2 mt-2'>
										{link.category && (
											<span className='px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary'>
												{link.category}
											</span>
										)}

										{link.tags &&
											link.tags.map((tag, index) => (
												<Badge
													key={index}
													variant={getBadgeVariantFromTag(tag)}
												>
													{tag}
												</Badge>
											))}
									</div>

									<div className='flex items-center gap-3 mt-3 text-xs text-muted-foreground'>
										{link.createdAt && (
											<span>Guardado {formatDate(link.createdAt)}</span>
										)}

										{link.source && (
											<>
												<span>•</span>
												<span>{link.source}</span>
											</>
										)}

										{link.author && (
											<>
												<span>•</span>
												<span>Por {link.author}</span>
											</>
										)}
									</div>
								</div>

								<div className='relative'>
									<button
										onClick={() => toggleMenu(link.id)}
										className='p-1.5 rounded-full hover:bg-muted transition-colors'
									>
										<MoreHorizontal className='h-4 w-4' />
									</button>

									{activeMenu === link.id && (
										<div className='absolute right-0 top-8 w-36 rounded-md border border-border bg-popover shadow-md p-1 z-10'>
											<button
												onClick={() => handleView(link)}
												className='w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors'
											>
												Ver detalles
											</button>
											<button
												onClick={() => handleEdit(link)}
												className='w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors'
											>
												Editar
											</button>
											<button
												onClick={() => handleDelete(link.id)}
												className='w-full text-left px-2 py-1.5 text-sm rounded text-destructive hover:bg-destructive/10 transition-colors'
											>
												Eliminar
											</button>
										</div>
									)}
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	)
}
