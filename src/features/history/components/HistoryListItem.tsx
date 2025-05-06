import Link from 'next/link'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
	MoreHorizontal,
	Pencil,
	Trash,
	Calendar,
	MessageCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import type { ChatHistoryItem } from '../types'

interface HistoryListItemProps {
	chat: ChatHistoryItem
	onEditClick: () => void
	onDeleteClick: () => void
}

export function HistoryListItem({
	chat,
	onEditClick,
	onDeleteClick,
}: HistoryListItemProps) {
	return (
		<Card className='hover:bg-muted/50 transition-colors border border-border py-0 gap-2'>
			<CardHeader className='p-4 pb-2'>
				<div className='flex items-start justify-between'>
					<Link href={`/history/${chat.id}`} className='flex-grow'>
						<div className='space-y-1'>
							<CardTitle className='text-base line-clamp-1'>
								{chat.title}
							</CardTitle>
							<CardDescription className='line-clamp-2'>
								{chat.preview}
							</CardDescription>
						</div>
					</Link>
					<div className='flex items-center gap-2 ml-4'>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant='ghost' className='h-8 w-8 p-0'>
									<span className='sr-only'>Open menu</span>
									<MoreHorizontal className='h-4 w-4' />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<DropdownMenuItem onClick={onEditClick}>
									<Pencil className='mr-2 h-4 w-4' />
									Edit
								</DropdownMenuItem>
								<DropdownMenuItem onClick={onDeleteClick}>
									<Trash className='mr-2 h-4 w-4' />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</CardHeader>
			<CardContent className='p-4 pt-0'>
				<div className='flex flex-wrap gap-2 mb-3'>
					{chat.tags.map((tag, index) => (
						<Badge key={index} variant='secondary' className='text-xs'>
							{tag}
						</Badge>
					))}
				</div>
				<div className='flex items-center justify-between text-xs text-muted-foreground mt-2'>
					<div className='flex items-center gap-1'>
						<Calendar className='h-3.5 w-3.5' />
						{/* Ensure date is a Date object before formatting */}
						<span>
							{format(
								typeof chat.date === 'string' ? new Date(chat.date) : chat.date,
								'MMM d, yyyy'
							)}
						</span>
					</div>
					<div className='flex items-center gap-1'>
						<MessageCircle className='h-3.5 w-3.5' />
						<span>{chat.messages} messages</span>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
