'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Esquema de validación para la eliminación de una idea
const deleteIdeaSchema = z.object({
	id: z.string().min(1, 'El ID es requerido'),
})

export type DeleteIdeaInput = z.infer<typeof deleteIdeaSchema>

/**
 * Elimina una memoria existente de tipo IDEA
 */
export async function deleteIdea(formData: FormData) {
	// Verificar autenticación
	const { userId } = await auth()

	if (!userId) {
		throw new Error('Debe iniciar sesión para eliminar una idea')
	}

	// Validar y parsear los datos del formulario
	const validatedData = deleteIdeaSchema.parse({
		id: formData.get('id'),
	})

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
				error: 'Idea no encontrada o no tiene permisos para eliminarla',
			}
		}

		if (existingMemory.type !== 'IDEA' || !existingMemory.idea) {
			return {
				success: false,
				error: 'La memoria no es de tipo IDEA',
			}
		}

		// Eliminar la memoria (esto eliminará cascada la idea y sus relaciones)
		await prisma.memory.delete({
			where: {
				id: validatedData.id,
			},
		})

		// Revalidar solo la ruta /save
		revalidatePath('/save')

		return { success: true }
	} catch (error) {
		console.error('Error al eliminar la idea:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Error desconocido',
		}
	}
}

/**
 * Versión alternativa para usar con componentes directamente
 */
export async function deleteIdeaAction(id: string) {
	// Verificar autenticación
	const { userId } = await auth()

	if (!userId) {
		throw new Error('Debe iniciar sesión para eliminar una idea')
	}

	try {
		// Verificar que la memoria exista y pertenezca al usuario
		const existingMemory = await prisma.memory.findUnique({
			where: {
				id,
				userId,
			},
			include: {
				idea: true,
			},
		})

		if (!existingMemory) {
			return {
				success: false,
				error: 'Idea no encontrada o no tiene permisos para eliminarla',
			}
		}

		if (existingMemory.type !== 'IDEA' || !existingMemory.idea) {
			return {
				success: false,
				error: 'La memoria no es de tipo IDEA',
			}
		}

		// Eliminar la memoria (esto eliminará cascada la idea y sus relaciones)
		await prisma.memory.delete({
			where: {
				id,
			},
		})

		// Revalidar solo la ruta /save
		revalidatePath('/save')

		return { success: true }
	} catch (error) {
		console.error('Error al eliminar la idea:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Error desconocido',
		}
	}
}
