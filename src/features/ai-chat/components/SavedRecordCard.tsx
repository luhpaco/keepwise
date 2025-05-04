'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	LinkIcon,
	Lightbulb,
	ExternalLink,
	Paperclip,
	Clock,
	Twitter,
	Linkedin,
	Facebook,
} from 'lucide-react' // Using lucide-react icons for platforms

// TODO: Move to a shared types file (e.g., src/shared/types.ts or src/features/ai-chat/types.ts)
interface RecordData {
	id: number | string // Use string if IDs are UUIDs
	type: 'link' | 'idea' // Use discriminated union if more types exist
	title: string
	description: string
	url?: string
	platform?: string // Consider specific platform names like 'twitter', 'linkedin', etc.
	source?: string
	tags?: string[]
	createdAt: string | Date // Use Date object if possible
	category: string // Consider a specific set of categories
	hasAudio?: boolean
	hasAttachments?: boolean
	attachmentCount?: number
}

interface SavedRecordCardProps {
	record: RecordData
}

// Helper function to format date
const formatDate = (dateInput: string | Date): string => {
	const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
	// Check if date is valid before formatting
	if (isNaN(date.getTime())) {
		return 'Invalid Date'
	}
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(date)
}

// Helper function to get platform icon
const PlatformIcon = ({ platform }: { platform?: string }) => {
	switch (platform?.toLowerCase()) {
		case 'twitter':
			return <Twitter className='h-4 w-4' />
		case 'linkedin':
			return <Linkedin className='h-4 w-4' />
		case 'facebook':
			return <Facebook className='h-4 w-4' />
		default:
			return <LinkIcon className='h-4 w-4' />
	}
}

export function SavedRecordCard({ record }: SavedRecordCardProps) {
	return (
		<Card className='w-full overflow-hidden border border-border/50 hover:border-border transition-colors'>
			{/* Type Indicator Bar */}
			<div
				className={`h-1 ${
					record.type === 'link' ? 'bg-blue-500' : 'bg-emerald-500'
				}`}
			/>
			<CardContent className='p-4'>
				<div className='flex items-start gap-3'>
					{/* Icon based on type */}
					<div
						className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
							record.type === 'link'
								? 'bg-blue-100 text-blue-500 dark:bg-blue-900/30'
								: 'bg-emerald-100 text-emerald-500 dark:bg-emerald-900/30'
						}`}
					>
						{record.type === 'link' ? (
							<PlatformIcon platform={record.platform} />
						) : (
							<Lightbulb className='h-4 w-4' />
						)}
					</div>

					{/* Main Content */}
					<div className='flex-1 min-w-0'>
						<div className='flex items-start justify-between gap-2'>
							<h3 className='font-medium text-sm truncate' title={record.title}>
								{record.title}
							</h3>
							{record.type === 'link' && record.url && (
								<Button
									size='icon'
									variant='ghost'
									className='h-6 w-6 shrink-0 text-muted-foreground'
									asChild
								>
									<a
										href={record.url}
										target='_blank'
										rel='noopener noreferrer'
										aria-label={`Open link to ${record.title}`}
									>
										<ExternalLink className='h-3 w-3' />
									</a>
								</Button>
							)}
						</div>

						<p
							className='text-xs text-muted-foreground mt-1 line-clamp-2'
							title={record.description}
						>
							{record.description}
						</p>

						{/* Metadata Footer */}
						<div className='flex items-center flex-wrap gap-x-3 gap-y-1 mt-3 text-xs text-muted-foreground'>
							<Badge
								variant='outline'
								className='text-xs capitalize px-1.5 py-0.5 font-normal'
							>
								{record.category}
							</Badge>

							<div className='flex items-center'>
								<Clock className='h-3 w-3 mr-1 flex-shrink-0' />
								<span>{formatDate(record.createdAt)}</span>
							</div>

							{record.type === 'idea' &&
								record.hasAttachments &&
								record.attachmentCount &&
								record.attachmentCount > 0 && (
									<div className='flex items-center'>
										<Paperclip className='h-3 w-3 mr-1 flex-shrink-0' />
										<span>
											{record.attachmentCount}{' '}
											{record.attachmentCount === 1 ? 'file' : 'files'}
										</span>
									</div>
								)}
						</div>
					</div>
				</div>
			</CardContent>

			{/* Tags Footer */}
			{record.tags && record.tags.length > 0 && (
				<CardFooter className='px-4 py-2 border-t bg-muted/30 flex flex-wrap gap-1'>
					{record.tags.map((tag, index) => (
						<Badge
							key={index}
							variant='secondary'
							className='text-xs px-1.5 py-0.5 font-normal'
						>
							{tag}
						</Badge>
					))}
				</CardFooter>
			)}
		</Card>
	)
}
