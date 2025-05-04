export type LinkCategory =
	| 'Work'
	| 'Personal'
	| 'Research'
	| 'Learning'
	| 'Reference'

export interface LinkData {
	id?: string
	url: string
	title: string
	description?: string
	category?: LinkCategory
	author?: string
	source?: string
	tags?: string[]
	personalNotes?: string
	createdAt?: Date
	updatedAt?: Date
	imageUrl?: string
	preview?: {
		title?: string
		description?: string
		image?: string
	}
}

export interface SaveLinkFormData {
	url: string
	title: string
	description: string
	category?: LinkCategory
	author?: string
	source?: string
	tags?: string
	personalNotes?: string
}
