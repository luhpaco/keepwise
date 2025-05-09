import type { Metadata } from 'next'
import { Inter, Raleway } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { Providers } from '@/providers/Providers'

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
})

const raleway = Raleway({
	variable: '--font-raleway',
	subsets: ['latin'],
	weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
	title: 'Keepwise',
	description: 'App to help you keep everything you want',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body className={`${inter.variable} ${raleway.variable} antialiased`}>
				<Providers>{children}</Providers>
				<Toaster />
			</body>
		</html>
	)
}
