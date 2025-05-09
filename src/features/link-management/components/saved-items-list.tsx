'use client'

import { SavedItem, SavedItemCard } from './saved-item'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SavedItemsListProps {
	items: SavedItem[]
	onEdit: (item: SavedItem) => void
	onDelete: (id: string, type: 'link' | 'idea') => void
}

export function SavedItemsList({
	items,
	onEdit,
	onDelete,
}: SavedItemsListProps) {
	if (items.length === 0) {
		return (
			<div className='p-8 text-center text-muted-foreground'>
				No hay elementos guardados recientemente.
			</div>
		)
	}

	return (
		<ScrollArea className='h-[calc(100vh-300px)]'>
			<div className='space-y-4 pr-4'>
				{items.map((item) => (
					<SavedItemCard
						key={`${item.type}-${item.id}`}
						item={item}
						onEdit={onEdit}
						onDelete={onDelete}
					/>
				))}
			</div>
		</ScrollArea>
	)
}
