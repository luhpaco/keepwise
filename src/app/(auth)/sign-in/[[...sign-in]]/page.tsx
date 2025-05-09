import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
	// TODO: Improve UI for sign in page
	return (
		<div className='w-full flex min-h-screen items-center justify-center'>
			<SignIn />
		</div>
	)
}
