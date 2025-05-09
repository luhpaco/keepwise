// prisma/seed.ts
import {
	PrismaClient,
	Prisma,
	MemoryType,
	UsageProbability,
} from '../src/app/generated/prisma'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient().$extends(withAccelerate())

// ClerkID de prueba (reemplazar con uno real si es necesario)
const testUserId = 'user_2wkihM7oZQxzyYWleQ8OdoAr52k'

// Categorías de ejemplo
const categoryData: Prisma.CategoryCreateInput[] = [
	{
		name: 'Programming',
		userId: testUserId,
	},
	{
		name: 'Technology',
		userId: testUserId,
	},
	{
		name: 'Business',
		userId: testUserId,
	},
	{
		name: 'Personal',
		userId: testUserId,
	},
	{
		name: 'Research',
		userId: testUserId,
	},
]

// Tags de ejemplo
const createTags = async () => {
	const tags = [
		'javascript',
		'react',
		'nextjs',
		'prisma',
		'typescript',
		'productivity',
		'health',
		'learning',
		'business',
		'technology',
	]

	for (const tagName of tags) {
		await prisma.tag.upsert({
			where: { name: tagName },
			update: {},
			create: {
				name: tagName,
			},
		})
	}
}

export async function main() {
	try {
		// Crear categorías
		for (const category of categoryData) {
			await prisma.category.create({
				data: category,
			})
		}
		console.log('✅ Categorías creadas')

		// Crear tags
		await createTags()
		console.log('✅ Tags creados')

		// Obtener IDs de categorías creadas
		const categories = await prisma.category.findMany()

		// Obtener IDs de tags creados
		const tags = await prisma.tag.findMany()

		// Crear ideas
		const programmingCategory = categories.find((c) => c.name === 'Programming')
		const technologyCategory = categories.find((c) => c.name === 'Technology')
		const businessCategory = categories.find((c) => c.name === 'Business')
		const personalCategory = categories.find((c) => c.name === 'Personal')

		// Tags relacionados
		const jsTag = tags.find((t) => t.name === 'javascript')
		const reactTag = tags.find((t) => t.name === 'react')
		const nextjsTag = tags.find((t) => t.name === 'nextjs')
		const prismaTag = tags.find((t) => t.name === 'prisma')
		const typescriptTag = tags.find((t) => t.name === 'typescript')
		const productivityTag = tags.find((t) => t.name === 'productivity')
		const businessTag = tags.find((t) => t.name === 'business')
		const technologyTag = tags.find((t) => t.name === 'technology')

		// Crear memorias de tipo IDEA
		await prisma.memory.create({
			data: {
				title: 'Implementar autenticación con Clerk',
				type: MemoryType.IDEA,
				usageProbability: UsageProbability.HIGH,
				userId: testUserId,
				categoryId: programmingCategory?.id,
				tags: {
					connect: [{ id: reactTag?.id }, { id: nextjsTag?.id }].filter(
						Boolean
					),
				},
				idea: {
					create: {
						content:
							'Investigar la integración de Clerk con Next.js para implementar autenticación sin necesidad de gestionar usuarios manualmente.',
					},
				},
			},
		})

		await prisma.memory.create({
			data: {
				title: 'Patrones de diseño en React',
				type: MemoryType.IDEA,
				usageProbability: UsageProbability.MEDIUM,
				userId: testUserId,
				categoryId: programmingCategory?.id,
				tags: {
					connect: [{ id: reactTag?.id }, { id: jsTag?.id }].filter(Boolean),
				},
				idea: {
					create: {
						content:
							'Estudiar y documentar los patrones de diseño más comunes en React: Container/Presentational, Render Props, HOCs y Hooks.',
					},
				},
			},
		})

		await prisma.memory.create({
			data: {
				title: 'Plan de negocio para startup',
				type: MemoryType.IDEA,
				usageProbability: UsageProbability.HIGH,
				userId: testUserId,
				categoryId: businessCategory?.id,
				tags: {
					connect: [
						{ id: businessTag?.id },
						{ id: productivityTag?.id },
					].filter(Boolean),
				},
				idea: {
					create: {
						content:
							'Desarrollar un plan de negocio para una startup enfocada en soluciones de IA para pequeñas empresas. Incluir análisis de mercado, modelo de ingresos y estrategia de crecimiento.',
					},
				},
			},
		})

		// Crear memorias de tipo LINK
		await prisma.memory.create({
			data: {
				title: 'Guía completa de TypeScript',
				type: MemoryType.LINK,
				usageProbability: UsageProbability.HIGH,
				userId: testUserId,
				categoryId: programmingCategory?.id,
				tags: {
					connect: [{ id: typescriptTag?.id }, { id: jsTag?.id }].filter(
						Boolean
					),
				},
				link: {
					create: {
						url: 'https://www.typescriptlang.org/docs/',
						description: 'Documentación oficial de TypeScript',
						author: 'Microsoft',
						source: 'TypeScript',
						personalNotes:
							'Excelente recurso para aprender TypeScript desde cero. Revisar especialmente la sección de tipos avanzados.',
					},
				},
			},
		})

		await prisma.memory.create({
			data: {
				title: 'Construyendo aplicaciones con Prisma',
				type: MemoryType.LINK,
				usageProbability: UsageProbability.MEDIUM,
				userId: testUserId,
				categoryId: programmingCategory?.id,
				tags: {
					connect: [{ id: prismaTag?.id }, { id: nextjsTag?.id }].filter(
						Boolean
					),
				},
				link: {
					create: {
						url: 'https://www.prisma.io/docs/getting-started',
						description: 'Documentación de Prisma para principiantes',
						author: 'Prisma Team',
						source: 'Prisma',
						personalNotes:
							'Tutorial muy completo sobre cómo usar Prisma con Next.js. Contiene ejemplos prácticos.',
					},
				},
			},
		})

		await prisma.memory.create({
			data: {
				title: 'Últimas tendencias tecnológicas 2023',
				type: MemoryType.LINK,
				usageProbability: UsageProbability.LOW,
				userId: testUserId,
				categoryId: technologyCategory?.id,
				tags: {
					connect: [{ id: technologyTag?.id }].filter(Boolean),
				},
				link: {
					create: {
						url: 'https://example.com/tech-trends-2023',
						description: 'Artículo sobre tendencias tecnológicas',
						author: 'Tech Magazine',
						source: 'TechInsights',
						personalNotes:
							'Buen resumen de las tecnologías emergentes. Interesante la sección sobre IA generativa.',
					},
				},
			},
		})

		console.log('✅ Memorias (Ideas y Links) creadas')

		// Crear un archivo adjunto para una idea
		const ideaMemory = await prisma.memory.findFirst({
			where: {
				type: MemoryType.IDEA,
				title: 'Plan de negocio para startup',
			},
			include: {
				idea: true,
			},
		})

		if (ideaMemory?.idea) {
			await prisma.file.create({
				data: {
					name: 'business_plan_template.pdf',
					url: 'https://example.com/files/business_plan_template.pdf',
					type: 'application/pdf',
					size: 1024000, // 1MB aproximadamente
					ideaId: ideaMemory.idea.id,
				},
			})
			console.log('✅ Archivo adjunto creado')
		}

		console.log('✅ Seed completado exitosamente')
	} catch (error) {
		console.error('❌ Error durante el seed:', error)
		throw error
	} finally {
		await prisma.$disconnect()
	}
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})
