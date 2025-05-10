'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Esquema de validación para la actualización de una idea
const updateIdeaSchema = z.object({
	id: z.string().min(1, 'El ID es requerido'),
	title: z
		.string()
		.min(1, 'El título es requerido')
		.max(255, 'El título es demasiado largo'),
	content: z.string().min(1, 'El contenido es requerido'),
	category: z.string().optional(),
	tags: z.string().optional(),
	priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
})

export type UpdateIdeaInput = z.infer<typeof updateIdeaSchema>

/**
 * Actualiza una memoria existente de tipo IDEA
 */
export async function updateIdea(formData: FormData) {
	// Verificar autenticación
	const { userId } = await auth()

	if (!userId) {
		throw new Error('Debe iniciar sesión para actualizar una idea')
	}

	// Validar y parsear los datos del formulario
	const validatedData = updateIdeaSchema.parse({
		id: formData.get('id'),
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
		// Verificar que la memoria exista y pertenezca al usuario
		const existingMemory = await prisma.memory.findUnique({
			where: {
				id: validatedData.id,
				userId,
			},
			include: {
				idea: true,
			},
		})

		if (!existingMemory) {
			return {
				success: false,
				error: 'Idea no encontrada o no tiene permisos para editarla',
			}
		}

		if (existingMemory.type !== 'IDEA' || !existingMemory.idea) {
			return {
				success: false,
				error: 'La memoria no es de tipo IDEA',
			}
		}

		// Crear o actualizar la categoría si es necesario
		let categoryId: string | undefined = existingMemory.categoryId || undefined

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

		// Actualizar la memoria y la idea en una transacción
		const result = await prisma.$transaction(async (tx) => {
			// Desconectar etiquetas existentes
			await tx.memory.update({
				where: { id: validatedData.id },
				data: {
					tags: {
						set: [], // Desconectar todas las etiquetas existentes
					},
				},
			})

			// Actualizar la memoria principal
			const memory = await tx.memory.update({
				where: { id: validatedData.id },
				data: {
					title: validatedData.title,
					usageProbability: validatedData.priority,
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

			// Actualizar la idea asociada a la memoria
			const idea = await tx.idea.update({
				where: { memoryId: memory.id },
				data: {
					content: validatedData.content,
				},
			})

			return { memory, idea }
		})

		// Revalidar solo la ruta /save
		revalidatePath('/save')

		return { success: true, data: result }
	} catch (error) {
		console.error('Error al actualizar la idea:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Error desconocido',
		}
	}
}

/**
 * Versión alternativa para usar con los componentes de react-hook-form
 */
export async function updateIdeaAction(data: UpdateIdeaInput) {
	// Verificar autenticación
	const { userId } = await auth()

	if (!userId) {
		throw new Error('Debe iniciar sesión para actualizar una idea')
	}

	// Procesar las etiquetas
	const tagNames = data.tags
		? data.tags
				.split(',')
				.map((tag: string) => tag.trim())
				.filter(Boolean)
		: []

	try {
		// Verificar que la memoria exista y pertenezca al usuario
		const existingMemory = await prisma.memory.findUnique({
			where: {
				id: data.id,
				userId,
			},
			include: {
				idea: true,
			},
		})

		if (!existingMemory) {
			return {
				success: false,
				error: 'Idea no encontrada o no tiene permisos para editarla',
			}
		}

		if (existingMemory.type !== 'IDEA' || !existingMemory.idea) {
			return {
				success: false,
				error: 'La memoria no es de tipo IDEA',
			}
		}

		// Crear o actualizar la categoría si es necesario
		let categoryId: string | undefined = existingMemory.categoryId || undefined

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

		// Actualizar la memoria y la idea en una transacción
		const result = await prisma.$transaction(async (tx) => {
			// Desconectar etiquetas existentes
			await tx.memory.update({
				where: { id: data.id },
				data: {
					tags: {
						set: [], // Desconectar todas las etiquetas existentes
					},
				},
			})

			// Actualizar la memoria principal
			const memory = await tx.memory.update({
				where: { id: data.id },
				data: {
					title: data.title,
					usageProbability: data.priority,
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

			// Actualizar la idea asociada a la memoria
			const idea = await tx.idea.update({
				where: { memoryId: memory.id },
				data: {
					content: data.content,
				},
			})

			return { memory, idea }
		})

		// Revalidar solo la ruta /save
		revalidatePath('/save')

		return { success: true, data: result }
	} catch (error) {
		console.error('Error al actualizar la idea:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Error desconocido',
		}
	}
}
