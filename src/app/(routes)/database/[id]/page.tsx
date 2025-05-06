import Link from 'next/link'
import {
	ArrowLeft,
	Calendar,
	ExternalLink,
	LinkIcon,
	FileText,
	Lightbulb,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { AnyDatabaseItem } from '@/features/database/types' // Importamos el tipo
import { format, parseISO } from 'date-fns'
import { notFound } from 'next/navigation'

// --- Placeholder para obtener datos ---
// En una aplicación real, esta función buscaría en la base de datos
// Usaremos los datos de ejemplo temporalmente
import { initialItems } from '@/features/database/data' // Updated import path

async function getItemData(id: number): Promise<AnyDatabaseItem | undefined> {
	// Simulación de búsqueda
	// TODO: Reemplazar con llamada a la base de datos/API real usando el id
	await new Promise((resolve) => setTimeout(resolve, 100)) // Simular delay
	const item = initialItems.find((i: AnyDatabaseItem) => i.id === id)
	return item
}
// --- Fin Placeholder ---

interface DatabaseItemPageProps {
	params: {
		id: string // El ID vendrá como string desde la URL
	}
}

export default async function DatabaseItemPage({
	params,
}: DatabaseItemPageProps) {
	const { id } = await params
	const itemId = parseInt(id, 10) // Convertir ID a número

	if (isNaN(itemId)) {
		notFound() // Si el ID no es un número válido
	}

	const item = await getItemData(itemId)

	if (!item) {
		notFound() // Si no se encuentra el item con ese ID
	}

	// Helper para obtener el icono del tipo
	const getTypeIcon = (type: string) => {
		switch (type) {
			case 'Link':
				return <LinkIcon className='h-4 w-4 text-blue-500 mr-1.5' />
			case 'Note':
				return <FileText className='h-4 w-4 text-purple-500 mr-1.5' />
			case 'Idea':
				return <Lightbulb className='h-4 w-4 text-amber-500 mr-1.5' />
			default:
				return null
		}
	}

	// Helper para obtener el color de la probabilidad de uso
	const getUsageProbabilityColor = (probability: string) => {
		switch (probability) {
			case 'High':
				return 'bg-green-500/20 text-green-500 border-green-500/50'
			case 'Medium':
				return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
			case 'Low':
				return 'bg-blue-500/20 text-blue-500 border-blue-500/50'
			default:
				return 'bg-gray-500/20 text-gray-500 border-gray-500/50'
		}
	}

	return (
		<div className='h-full flex flex-col p-4 md:p-6 lg:p-8'>
			<div className='max-w-3xl w-full mx-auto'>
				<Button
					variant='ghost'
					asChild
					className='mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-0 hover:bg-transparent'
				>
					<Link href='/database'>
						<ArrowLeft className='h-4 w-4' />
						Back to Database
					</Link>
				</Button>

				<Card>
					<CardHeader>
						<div className='flex justify-between items-start'>
							<div>
								<CardTitle className='text-2xl'>{item.name}</CardTitle>
								<CardDescription className='mt-2 flex items-center gap-2 text-sm'>
									<Calendar className='h-4 w-4' />
									{format(parseISO(item.createdAt), 'MMMM d, yyyy')}
								</CardDescription>
							</div>
							{/* Omitimos botones de Edit/Delete por ahora */}
						</div>
					</CardHeader>

					<CardContent className='space-y-6'>
						{/* Information Section */}
						<div>
							<h3 className='text-base font-semibold mb-2 text-muted-foreground'>
								Information
							</h3>
							<div className='grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-4 p-4 bg-muted/40 rounded-lg border'>
								<div>
									<h4 className='text-xs font-medium text-muted-foreground mb-1'>
										Type
									</h4>
									<p className='flex items-center text-sm'>
										{getTypeIcon(item.type)}
										{item.type}
									</p>
								</div>
								<div>
									<h4 className='text-xs font-medium text-muted-foreground mb-1'>
										Created
									</h4>
									<p className='flex items-center gap-1.5 text-sm'>
										<Calendar className='h-4 w-4' />
										{format(parseISO(item.createdAt), 'MMMM d, yyyy')}
									</p>
								</div>
								<div>
									<h4 className='text-xs font-medium text-muted-foreground mb-1'>
										Usage Probability
									</h4>
									<Badge
										variant='outline'
										className={`text-xs font-normal ${getUsageProbabilityColor(
											item.usageProbability
										)}`}
									>
										{item.usageProbability}
									</Badge>
								</div>
							</div>
						</div>

						{/* Tags Section */}
						<div>
							<h3 className='text-base font-semibold mb-2 text-muted-foreground'>
								Tags
							</h3>
							<div className='flex flex-wrap gap-2 p-4 bg-muted/40 rounded-lg border'>
								{item.tags.map((tag) => (
									<Badge key={tag} variant='secondary' className='font-normal'>
										{tag}
									</Badge>
								))}
								{item.tags.length === 0 && (
									<p className='text-sm text-muted-foreground'>
										No tags added.
									</p>
								)}
							</div>
						</div>

						{/* Source Section (Conditional) */}
						{item.url && (
							<div>
								<h3 className='text-base font-semibold mb-2 text-muted-foreground'>
									Source
								</h3>
								<div className='p-4 bg-muted/40 rounded-lg border space-y-1'>
									<a
										href={item.url}
										target='_blank'
										rel='noopener noreferrer'
										className='flex items-center gap-1.5 text-sm text-primary hover:underline break-all'
									>
										<ExternalLink className='h-4 w-4 shrink-0' />
										{item.url}
									</a>
									<p className='text-xs text-muted-foreground'>
										{new URL(item.url).hostname.replace('www.', '')}
									</p>
								</div>
							</div>
						)}

						{/* Notes Section */}
						<div>
							<h3 className='text-base font-semibold mb-2 text-muted-foreground'>
								Notes
							</h3>
							<div className='p-4 bg-muted/40 rounded-lg border'>
								{item.notes ? (
									<p className='text-sm text-foreground whitespace-pre-wrap'>
										{item.notes}
									</p>
								) : (
									<p className='text-sm text-muted-foreground'>
										No notes added.
									</p>
								)}
							</div>
						</div>
					</CardContent>
					{/* Omitimos CardFooter con botones de acción por ahora */}
				</Card>
			</div>
		</div>
	)
}
