'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { MemoryType, UsageProbability } from '@/app/generated/prisma'
import { z } from 'zod'

// Esquema de validación para la creación de un link
const createLinkSchema = z.object({
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

export type CreateLinkInput = z.infer<typeof createLinkSchema>

/**
 * Crea una nueva memoria de tipo LINK
 */
export async function createLink(formData: FormData) {
	// Verificar autenticación
	const { userId } = await auth()

	if (!userId) {
		throw new Error('Debe iniciar sesión para guardar un enlace')
	}

	// Validar y parsear los datos del formulario
	const validatedData = createLinkSchema.parse({
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

		// Crear la memoria y el link en una transacción
		const result = await prisma.$transaction(async (tx) => {
			// Crear la memoria principal
			const memory = await tx.memory.create({
				data: {
					title: validatedData.title,
					type: MemoryType.LINK,
					usageProbability: validatedData.priority as UsageProbability,
					userId,
					categoryId,
					createdAt: new Date(), // Asegurar fecha de creación explícita
					updatedAt: new Date(), // Asegurar fecha de actualización explícita
					// Crear las relaciones con las etiquetas
					tags: {
						connectOrCreate: tagNames.map((name: string) => ({
							where: { name },
							create: { name },
						})),
					},
				},
			})

			// Crear el link asociado a la memoria
			const link = await tx.link.create({
				data: {
					url: validatedData.url,
					description: validatedData.description || null,
					author: validatedData.author || null,
					source: validatedData.source || null,
					personalNotes: validatedData.personalNotes || null,
					memoryId: memory.id,
				},
			})

			return { memory, link }
		})

		// Revalidar rutas clave
		revalidatePath('/save')
		revalidatePath('/api/memories/recent')

		return { success: true, data: result }
	} catch (error) {
		console.error('Error al crear el enlace:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Error desconocido',
		}
	}
}

/**
 * Versión alternativa para usar con los componentes de react-hook-form
 */
export async function createLinkAction(data: CreateLinkInput) {
	// Verificar autenticación
	const { userId } = await auth()

	if (!userId) {
		throw new Error('Debe iniciar sesión para guardar un enlace')
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

		// Crear la memoria y el link en una transacción
		const result = await prisma.$transaction(async (tx) => {
			// Crear la memoria principal
			const memory = await tx.memory.create({
				data: {
					title: data.title,
					type: MemoryType.LINK,
					usageProbability: data.priority as UsageProbability,
					userId,
					categoryId,
					createdAt: new Date(), // Asegurar fecha de creación explícita
					updatedAt: new Date(), // Asegurar fecha de actualización explícita
					// Crear las relaciones con las etiquetas
					tags: {
						connectOrCreate: tagNames.map((name: string) => ({
							where: { name },
							create: { name },
						})),
					},
				},
			})

			// Crear el link asociado a la memoria
			const link = await tx.link.create({
				data: {
					url: data.url,
					description: data.description || null,
					author: data.author || null,
					source: data.source || null,
					personalNotes: data.personalNotes || null,
					memoryId: memory.id,
				},
			})

			return { memory, link }
		})

		// Revalidar rutas clave
		revalidatePath('/save')
		revalidatePath('/api/memories/recent')

		return { success: true, data: result }
	} catch (error) {
		console.error('Error al crear el enlace:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Error desconocido',
		}
	}
}
