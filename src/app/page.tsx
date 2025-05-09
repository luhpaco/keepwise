import Link from 'next/link'

export default function Home() {
	// TODO: Create a landing page for the app that redirects to /save
	return (
		<div className='flex flex-col items-center justify-center h-screen gap-10'>
			<h1 className='text-4xl font-bold'>Home Page</h1>
			<p className='text-lg'>Welcome to the home page</p>
			<div className='flex gap-4'>
				<Link href='/save'>Go to app</Link>
			</div>
		</div>
	)
}
