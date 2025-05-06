export type DatabaseItemType = 'Link' | 'Note' | 'Idea'
export type UsageProbability = 'High' | 'Medium' | 'Low'

export interface DatabaseItem {
	id: number // Usaremos string si los IDs vienen de la base de datos como UUIDs
	name: string
	tags: string[]
	url?: string // Opcional, ya que 'Note' y 'Idea' podrían no tener URL
	type: DatabaseItemType
	usageProbability: UsageProbability
	createdAt: string // O podríamos usar Date
	notes: string
	// Añadir otros campos si son necesarios, como 'updatedAt', 'userId', etc.
}

// Podríamos definir tipos más específicos si es necesario
export interface LinkItem extends DatabaseItem {
	type: 'Link'
	url: string
}

export interface NoteItem extends DatabaseItem {
	type: 'Note'
	url?: undefined
}

export interface IdeaItem extends DatabaseItem {
	type: 'Idea'
	url?: undefined
}

// Un tipo unión discriminada podría ser útil
export type AnyDatabaseItem = LinkItem | NoteItem | IdeaItem
