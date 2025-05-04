'use client'

import { Button } from '@/components/ui/button'
import { PlusCircle, Settings, Bot } from 'lucide-react'
// import { MindVaultLogo } from "../MindVaultLogo" // Assuming this would be in shared components later

export function ChatHeader() {
	return (
		<header className='border-b border-border sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
			<div className='flex items-center justify-between h-14 px-4'>
				<div className='flex items-center gap-2'>
					<div className='flex items-center gap-2 font-semibold'>
						{/* TODO: Replace with actual MindVaultLogo component */}
						<div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary'>
							<Bot className='h-5 w-5' />
						</div>
						<span>SilvIA</span>
					</div>
				</div>
				<div className='flex items-center gap-2'>
					<Button variant='ghost' size='icon'>
						<Settings className='h-4 w-4' />
						<span className='sr-only'>Settings</span>
					</Button>
					{/* TODO: Add functionality to start a new chat */}
					<Button size='sm' className='gap-1'>
						<PlusCircle className='h-4 w-4' />
						<span>New Chat</span>
					</Button>
				</div>
			</div>
		</header>
	)
}
