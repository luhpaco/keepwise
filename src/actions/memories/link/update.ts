'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UsageProbability } from '@/app/generated/prisma'
import { z } from 'zod'

// Esquema de validación para la actualización de un link
const updateLinkSchema = z.object({
	id: z.string().min(1, 'El ID es requerido'),
	title: z
		.string()
		.min(1, 'El título es requerido')
		.max(255, 'El título es demasiado largo'),
	url: z.string().url('La URL no es válida').min(1, 'La URL es requerida'),
	description: z.string().optional(),
	category: z.string().optional(),
	tags: z.string().optional(),
	author: z.string().optional(),
	source: z.string().optional(),
	personalNotes: z.string().optional(),
	priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
})

export type UpdateLinkInput = z.infer<typeof updateLinkSchema>

/**
 * Actualiza una memoria existente de tipo LINK
 */
export async function updateLink(formData: FormData) {
	// Verificar autenticación
	const { userId } = await auth()

	if (!userId) {
		throw new Error('Debe iniciar sesión para actualizar un enlace')
	}

	// Validar y parsear los datos del formulario
	const validatedData = updateLinkSchema.parse({
		id: formData.get('id'),
		title: formData.get('title'),
		url: formData.get('url'),
		description: formData.get('description'),
		category: formData.get('category'),
		tags: formData.get('tags'),
		author: formData.get('author'),
		source: formData.get('source'),
		personalNotes: formData.get('personalNotes'),
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
			where: { id: validatedData.id },
			include: { link: true },
		})

		if (!existingMemory) {
			return {
				success: false,
				error: 'El enlace que intenta actualizar no existe',
			}
		}

		if (existingMemory.userId !== userId) {
			return {
				success: false,
				error: 'No tiene permisos para actualizar este enlace',
			}
		}

		// Verificar que la memoria sea de tipo LINK
		if (existingMemory.type !== 'LINK' || !existingMemory.link) {
			return {
				success: false,
				error: 'La memoria no es de tipo LINK',
			}
		}

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

		// Actualizar la memoria y el link en una transacción
		const result = await prisma.$transaction(async (tx) => {
			// Desconectar todas las etiquetas existentes
			await tx.memory.update({
				where: { id: validatedData.id },
				data: {
					tags: {
						set: [], // Eliminar todas las relaciones existentes
					},
				},
			})

			// Actualizar la memoria principal
			const memory = await tx.memory.update({
				where: { id: validatedData.id },
				data: {
					title: validatedData.title,
					usageProbability: validatedData.priority as UsageProbability,
					categoryId,
					updatedAt: new Date(), // Forzar actualización de la fecha
					// Crear las nuevas relaciones con las etiquetas
					tags: {
						connectOrCreate: tagNames.map((name: string) => ({
							where: { name },
							create: { name },
						})),
					},
				},
			})

			// Actualizar el link asociado a la memoria
			const link = await tx.link.update({
				where: { memoryId: validatedData.id },
				data: {
					url: validatedData.url,
					description: validatedData.description || null,
					author: validatedData.author || null,
					source: validatedData.source || null,
					personalNotes: validatedData.personalNotes || null,
				},
			})

			return { memory, link }
		})

		// Revalidar rutas clave
		revalidatePath('/save')
		revalidatePath('/api/memories/recent')

		return { success: true, data: result }
	} catch (error) {
		console.error('Error al actualizar el enlace:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Error desconocido',
		}
	}
}

/**
 * Versión alternativa para usar con los componentes de react-hook-form
 */
export async function updateLinkAction(data: UpdateLinkInput) {
	// Verificar autenticación
	const { userId } = await auth()

	if (!userId) {
		throw new Error('Debe iniciar sesión para actualizar un enlace')
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
			where: { id: data.id },
			include: { link: true },
		})

		if (!existingMemory) {
			return {
				success: false,
				error: 'El enlace que intenta actualizar no existe',
			}
		}

		if (existingMemory.userId !== userId) {
			return {
				success: false,
				error: 'No tiene permisos para actualizar este enlace',
			}
		}

		// Verificar que la memoria sea de tipo LINK
		if (existingMemory.type !== 'LINK' || !existingMemory.link) {
			return {
				success: false,
				error: 'La memoria no es de tipo LINK',
			}
		}

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

		// Actualizar la memoria y el link en una transacción
		const result = await prisma.$transaction(async (tx) => {
			// Desconectar todas las etiquetas existentes
			await tx.memory.update({
				where: { id: data.id },
				data: {
					tags: {
						set: [], // Eliminar todas las relaciones existentes
					},
				},
			})

			// Actualizar la memoria principal
			const memory = await tx.memory.update({
				where: { id: data.id },
				data: {
					title: data.title,
					usageProbability: data.priority as UsageProbability,
					categoryId,
					updatedAt: new Date(), // Forzar actualización de la fecha
					// Crear las nuevas relaciones con las etiquetas
					tags: {
						connectOrCreate: tagNames.map((name: string) => ({
							where: { name },
							create: { name },
						})),
					},
				},
			})

			// Actualizar el link asociado a la memoria
			const link = await tx.link.update({
				where: { memoryId: data.id },
				data: {
					url: data.url,
					description: data.description || null,
					author: data.author || null,
					source: data.source || null,
					personalNotes: data.personalNotes || null,
				},
			})

			return { memory, link }
		})

		// Revalidar rutas clave
		revalidatePath('/save')
		revalidatePath('/api/memories/recent')

		return { success: true, data: result }
	} catch (error) {
		console.error('Error al actualizar el enlace:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Error desconocido',
		}
	}
}
