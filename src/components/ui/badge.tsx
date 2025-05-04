import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
	'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
	{
		variants: {
			variant: {
				default:
					'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
				secondary:
					'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
				destructive:
					'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
				outline: 'text-foreground',
				success:
					'border-transparent bg-green-500/20 text-green-700 hover:bg-green-500/30',
				warning:
					'border-transparent bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30',
				info: 'border-transparent bg-blue-500/20 text-blue-700 hover:bg-blue-500/30',
				purple:
					'border-transparent bg-purple-500/20 text-purple-700 hover:bg-purple-500/30',
				pink: 'border-transparent bg-pink-500/20 text-pink-700 hover:bg-pink-500/30',
				orange:
					'border-transparent bg-orange-500/20 text-orange-700 hover:bg-orange-500/30',
				indigo:
					'border-transparent bg-indigo-500/20 text-indigo-700 hover:bg-indigo-500/30',
				teal: 'border-transparent bg-teal-500/20 text-teal-700 hover:bg-teal-500/30',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	}
)

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	)
}

export { Badge, badgeVariants }
