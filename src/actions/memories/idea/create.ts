'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { MemoryType, UsageProbability } from '@/app/generated/prisma'
import { z } from 'zod'
import { redirect } from 'next/navigation'

// Esquema de validación para la creación de una idea
const createIdeaSchema = z.object({
	title: z
		.string()
		.min(1, 'El título es requerido')
		.max(255, 'El título es demasiado largo'),
	content: z.string().min(1, 'El contenido es requerido'),
	category: z.string().optional(),
	tags: z.string().optional(),
	priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
})

export type CreateIdeaInput = z.infer<typeof createIdeaSchema>

/**
 * Crea una nueva memoria de tipo IDEA
 */
export async function createIdea(formData: FormData) {
	// Verificar autenticación
	const { userId } = await auth()

	if (!userId) {
		throw new Error('Debe iniciar sesión para guardar una idea')
	}

	// Validar y parsear los datos del formulario
	const validatedData = createIdeaSchema.parse({
		title: formData.get('title'),
		content: formData.get('content'),
		category: formData.get('category'),
		tags: formData.get('tags'),
		priority: formData.get('priority') || 'MEDIUM',
	})

	// Procesar las etiquetas
	const tagNames = validatedData.tags
		? validatedData.tags
				.split(',')
				.map((tag: string) => tag.trim())
				.filter(Boolean)
		: []

	try {
		// Crear la categoría si es necesario
		let categoryId: string | undefined = undefined

		if (validatedData.category) {
			const category = await prisma.category.upsert({
				where: {
					name_userId: {
						name: validatedData.category,
						userId,
					},
				},
				update: {},
				create: {
					name: validatedData.category,
					userId,
				},
			})

			categoryId = category.id
		}

		// Crear la memoria y la idea en una transacción
		const result = await prisma.$transaction(async (tx) => {
			// Crear la memoria principal
			const memory = await tx.memory.create({
				data: {
					title: validatedData.title,
					type: MemoryType.IDEA,
					usageProbability: validatedData.priority as UsageProbability,
					userId,
					categoryId,
					// Crear las relaciones con las etiquetas
					tags: {
						connectOrCreate: tagNames.map((name: string) => ({
							where: { name },
							create: { name },
						})),
					},
				},
			})

			// Crear la idea asociada a la memoria
			const idea = await tx.idea.create({
				data: {
					content: validatedData.content,
					memoryId: memory.id,
				},
			})

			return { memory, idea }
		})

		// Revalidar solo la ruta /save
		revalidatePath('/save')

		return { success: true, data: result }
	} catch (error) {
		console.error('Error al crear la idea:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Error desconocido',
		}
	}
}

/**
 * Versión alternativa para usar con los componentes de react-hook-form
 */
export async function createIdeaAction(data: CreateIdeaInput) {
	// Verificar autenticación
	const { userId } = await auth()

	if (!userId) {
		throw new Error('Debe iniciar sesión para guardar una idea')
	}

	// Procesar las etiquetas
	const tagNames = data.tags
		? data.tags
				.split(',')
				.map((tag: string) => tag.trim())
				.filter(Boolean)
		: []

	try {
		// Crear la categoría si es necesario
		let categoryId: string | undefined = undefined

		if (data.category) {
			const category = await prisma.category.upsert({
				where: {
					name_userId: {
						name: data.category,
						userId,
					},
				},
				update: {},
				create: {
					name: data.category,
					userId,
				},
			})

			categoryId = category.id
		}

		// Crear la memoria y la idea en una transacción
		const result = await prisma.$transaction(async (tx) => {
			// Crear la memoria principal
			const memory = await tx.memory.create({
				data: {
					title: data.title,
					type: MemoryType.IDEA,
					usageProbability: data.priority as UsageProbability,
					userId,
					categoryId,
					// Crear las relaciones con las etiquetas
					tags: {
						connectOrCreate: tagNames.map((name: string) => ({
							where: { name },
							create: { name },
						})),
					},
				},
			})

			// Crear la idea asociada a la memoria
			const idea = await tx.idea.create({
				data: {
					content: data.content,
					memoryId: memory.id,
				},
			})

			return { memory, idea }
		})

		// Revalidar solo la ruta /save
		revalidatePath('/save')

		return { success: true, data: result }
	} catch (error) {
		console.error('Error al crear la idea:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Error desconocido',
		}
	}
}
