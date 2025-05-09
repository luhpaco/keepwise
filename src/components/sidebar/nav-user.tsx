'use client'

import {
	SidebarMenu,
	SidebarMenuItem,
	useSidebar,
} from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'

export function NavUser() {
	const { state } = useSidebar()

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<UserButton showName={state === 'expanded' ? true : false} />
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
