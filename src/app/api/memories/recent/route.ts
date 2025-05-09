import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

export const GET = async (req: Request) => {
	try {
		// Obtener el usuario autenticado usando Clerk
		const user = await currentUser()

		if (!user) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}

		// Obtener el límite de items a retornar desde query params (opcional)
		const { searchParams } = new URL(req.url)
		const limit = Number(searchParams.get('limit')) || 10

		// Obtener las memorias más recientes con sus relaciones
		const memories = await prisma.memory.findMany({
			where: {
				userId: user.id,
			},
			include: {
				tags: true,
				category: true,
				link: true,
				idea: {
					include: {
						files: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
			take: limit,
		})

		// Transformar los datos para devolverlos en un formato más adecuado para el cliente
		const formattedMemories = memories.map((memory) => ({
			id: memory.id,
			title: memory.title,
			type: memory.type,
			tags: memory.tags.map((tag) => tag.name),
			category: memory.category?.name,
			createdAt: memory.createdAt,
			updatedAt: memory.updatedAt,
			// Datos específicos según el tipo
			...(memory.type === 'LINK' && memory.link
				? {
						url: memory.link.url,
						description: memory.link.description,
						author: memory.link.author,
						source: memory.link.source,
						personalNotes: memory.link.personalNotes,
				  }
				: {}),
			...(memory.type === 'IDEA' && memory.idea
				? {
						content: memory.idea.content,
						attachments: memory.idea.files.map((file) => ({
							name: file.name,
							url: file.url,
							type: file.type,
							size: file.size,
						})),
				  }
				: {}),
		}))

		return NextResponse.json(formattedMemories)
	} catch (error) {
		console.error('Error al obtener memorias recientes:', error)
		return NextResponse.json(
			{ error: 'Error al obtener memorias recientes' },
			{ status: 500 }
		)
	}
}
