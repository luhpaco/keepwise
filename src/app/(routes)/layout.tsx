import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { ModeToggle } from '@/components/theme-toogle'
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar'

export default function RoutesLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className='flex  h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
					<div className='flex items-center gap-2 px-4'>
						<SidebarTrigger className='-ml-1' />
					</div>
					<div className='flex items-center gap-2 px-4'>
						<ModeToggle />
					</div>
				</header>
				<div className='flex flex-1 flex-col gap-4 max-h-[calc(100vh-64px)] overflow-hidden'>
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
