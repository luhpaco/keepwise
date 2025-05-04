export type IdeaCategory =
	| 'Work'
	| 'Personal'
	| 'Research'
	| 'Learning'
	| 'Ideas'
	| 'Reference'

export interface IdeaData {
	id?: string
	title: string
	content?: string
	category?: IdeaCategory
	tags?: string[]
	attachments?: {
		name: string
		type: string
		url: string
	}[]
	createdAt?: Date
	updatedAt?: Date
}

export interface SaveIdeaFormData {
	title: string
	content: string
	category?: IdeaCategory
	tags?: string
	attachments?: File[]
}
