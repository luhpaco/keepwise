import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'

// Esquema de validación para la solicitud
const metadataRequestSchema = z.object({
	url: z.string().url('La URL proporcionada no es válida'),
})

export async function POST(request: NextRequest) {
	try {
		// Verificar autenticación
		const { userId } = await auth()
		if (!userId) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}

		// Validar la solicitud
		const body = await request.json()
		const { url } = metadataRequestSchema.parse(body)

		// Obtener los metadatos de la URL
		const metadata = await fetchMetadata(url)

		return NextResponse.json(metadata)
	} catch (error) {
		console.error('Error al extraer metadatos:', error)

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Datos de solicitud inválidos', details: error.errors },
				{ status: 400 }
			)
		}

		return NextResponse.json(
			{ error: 'Error al procesar la solicitud' },
			{ status: 500 }
		)
	}
}

/**
 * Función para extraer metadatos de una URL
 */
async function fetchMetadata(url: string) {
	try {
		// Intentar obtener la página
		const response = await fetch(url, {
			headers: {
				// Simular un navegador para evitar bloqueos
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
			},
		})

		if (!response.ok) {
			throw new Error(`Error al obtener la página: ${response.statusText}`)
		}

		const html = await response.text()

		// Extraer metadatos usando expresiones regulares
		const metadata = {
			title:
				extractMetaTag(html, 'title') ||
				extractOgTag(html, 'title') ||
				extractTag(html, 'title'),
			description:
				extractMetaTag(html, 'description') ||
				extractOgTag(html, 'description'),
			author: extractMetaTag(html, 'author'),
			image: extractOgTag(html, 'image'),
			site_name: extractOgTag(html, 'site_name'),
		}

		// Para redes sociales específicas
		const isSocialMedia =
			/facebook\.com|twitter\.com|instagram\.com|linkedin\.com/i.test(url)
		let source = ''

		if (isSocialMedia) {
			if (/facebook\.com/i.test(url)) source = 'Facebook'
			if (/twitter\.com/i.test(url) || /x\.com/i.test(url)) source = 'Twitter'
			if (/instagram\.com/i.test(url)) source = 'Instagram'
			if (/linkedin\.com/i.test(url)) source = 'LinkedIn'
		} else {
			source = metadata.site_name || new URL(url).hostname.replace(/^www\./, '')
		}

		return {
			title: metadata.title || '',
			description: metadata.description || '',
			author: metadata.author || '',
			image: metadata.image || '',
			source,
			success: true,
		}
	} catch (error) {
		console.error('Error al extraer metadatos:', error)
		return {
			title: '',
			description: '',
			author: '',
			image: '',
			source: '',
			success: false,
			error: error instanceof Error ? error.message : 'Error desconocido',
		}
	}
}

// Funciones auxiliares para extraer metadatos

function extractMetaTag(html: string, name: string): string | null {
	const regex = new RegExp(
		`<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)["']`,
		'i'
	)
	const match = html.match(regex)
	return match ? match[1] : null
}

function extractOgTag(html: string, property: string): string | null {
	const regex = new RegExp(
		`<meta\\s+property=["']og:${property}["']\\s+content=["']([^"']*)["']`,
		'i'
	)
	const match = html.match(regex)
	return match ? match[1] : null
}

function extractTag(html: string, tag: string): string | null {
	const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i')
	const match = html.match(regex)
	return match ? match[1].trim() : null
}
