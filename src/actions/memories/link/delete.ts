'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * Elimina una memoria de tipo LINK
 * @param id El ID de la memoria a eliminar
 */
export async function deleteLink(id: string) {
	// Verificar autenticación
	const { userId } = await auth()

	if (!userId) {
		throw new Error('Debe iniciar sesión para eliminar un enlace')
	}

	try {
		// Verificar que la memoria exista y pertenezca al usuario
		const existingMemory = await prisma.memory.findUnique({
			where: { id },
			include: { link: true },
		})

		if (!existingMemory) {
			return {
				success: false,
				error: 'El enlace que intenta eliminar no existe',
			}
		}

		if (existingMemory.userId !== userId) {
			return {
				success: false,
				error: 'No tiene permisos para eliminar este enlace',
			}
		}

		// Eliminar la memoria en cascada (esto también eliminará el link asociado)
		await prisma.memory.delete({
			where: { id },
		})

		// Revalidar solo la ruta /save
		revalidatePath('/save')

		return { success: true }
	} catch (error) {
		console.error('Error al eliminar el enlace:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Error desconocido',
		}
	}
}

/**
 * Versión alternativa para usar con los componentes del cliente
 */
export async function deleteLinkAction(id: string) {
	return deleteLink(id)
}
