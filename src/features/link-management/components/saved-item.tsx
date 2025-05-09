'use client'

import { Link, Lightbulb } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { LinkData } from '@/features/link-management/types'
import { IdeaData } from '@/features/idea-management/types'

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

// Función para formatear la fecha (simplificada)
const formatDate = (date: Date) => {
	return new Intl.DateTimeFormat('es-ES', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	}).format(date)
}

// Combinamos los dos tipos para el feed de Recent Saves
export type SavedItem = (LinkData | IdeaData) & { type: 'link' | 'idea' }

interface SavedItemProps {
	item: SavedItem
	onEdit: (item: SavedItem) => void
	onDelete: (id: string, type: 'link' | 'idea') => void
}

export function SavedItemCard({ item, onEdit, onDelete }: SavedItemProps) {
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
										<Badge key={index} variant={getBadgeVariantFromTag(tag)}>
											{tag}
										</Badge>
									))}
							</div>
						</div>

						<div className='flex gap-1'>
							<button
								onClick={() => onEdit(item)}
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
								onClick={() => onDelete(item.id || '', item.type)}
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
}
