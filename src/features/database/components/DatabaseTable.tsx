'use client'

import { useState, useMemo } from 'react'
import { AnyDatabaseItem, DatabaseItem } from '../types' // Importar tipos
import { initialItems } from '../data' // Import data from the new file

// Componentes UI de Shadcn (Asegúrate de tenerlos instalados y configurados)
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuCheckboxItem,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Iconos (Asegúrate de tener lucide-react instalado)
import {
	Search,
	SlidersHorizontal,
	RotateCcw,
	MoreHorizontal,
	Pencil,
	Trash,
	Calendar,
	ChevronDown,
	Filter,
	ArrowUpDown,
	LinkIcon,
	FileText,
	Lightbulb,
	ExternalLink,
} from 'lucide-react'

// Utils
import { format, isAfter, isBefore, isEqual, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// Tipos específicos para el estado de la tabla
type VisibleColumns = {
	name: boolean
	tags: boolean
	type: boolean
	url: boolean
	usageProbability: boolean
	date: boolean
	notes: boolean
}

type SortConfig = {
	key: keyof DatabaseItem | null
	direction: 'asc' | 'desc'
}

type DateRange = {
	from: Date | undefined
	to?: Date | undefined
}

// Props del componente (si necesitamos pasar datos iniciales o configuraciones)
interface DatabaseTableProps {
	// Podríamos pasar los items iniciales como prop en lugar de tenerlos hardcodeados
	// initialData?: AnyDatabaseItem[];
}

export function DatabaseTable({}: /* initialData = initialItems */ DatabaseTableProps) {
	// TODO: Reemplazar initialItems con fetch de datos reales
	const [items, setItems] = useState<AnyDatabaseItem[]>(initialItems)

	// Estado para filtros
	const [search, setSearch] = useState('')
	const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
		name: true,
		tags: true,
		type: true,
		url: true,
		usageProbability: true,
		date: true,
		notes: false, // Notas ocultas por defecto como en el diseño
	})
	const [typeFilter, setTypeFilter] = useState<string | null>(null)
	const [usageProbabilityFilter, setUsageProbabilityFilter] = useState<
		string | null
	>(null)
	const [tagFilter, setTagFilter] = useState<string | null>(null)
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined) // Use undefined for initial state

	// Estado para selección
	const [selectedItems, setSelectedItems] = useState<number[]>([]) // Usaremos los IDs numéricos de ejemplo

	// Estado para ordenación
	const [sortConfig, setSortConfig] = useState<SortConfig>({
		key: null,
		direction: 'asc',
	})

	// Estado para modales/diálogos (simplificado por ahora)
	const [editingItem, setEditingItem] = useState<AnyDatabaseItem | null>(null)
	const [deletingItemId, setDeletingItemId] = useState<number | null>(null)

	// --- Lógica de Filtros, Ordenación y Selección ---

	const allTags = useMemo(() => {
		const tags = new Set<string>()
		items.forEach((item) => item.tags?.forEach((tag) => tags.add(tag)))
		return Array.from(tags)
	}, [items])

	const filteredItems = useMemo(() => {
		return items
			.filter((item) => {
				const searchLower = search.toLowerCase()
				const matchesSearch =
					item.name.toLowerCase().includes(searchLower) ||
					item.notes?.toLowerCase().includes(searchLower) || // Asegurarse que notes existe
					item.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) // Buscar también en tags

				const matchesType = !typeFilter || item.type === typeFilter
				const matchesUsageProbability =
					!usageProbabilityFilter ||
					item.usageProbability === usageProbabilityFilter
				const matchesTag = !tagFilter || item.tags?.includes(tagFilter)

				let matchesDateRange = true
				if (dateRange?.from || dateRange?.to) {
					try {
						const itemDate = parseISO(item.createdAt)
						if (dateRange.from && dateRange.to) {
							matchesDateRange =
								(isEqual(itemDate, dateRange.from) ||
									isAfter(itemDate, dateRange.from)) &&
								(isEqual(itemDate, dateRange.to) ||
									isBefore(itemDate, dateRange.to))
						} else if (dateRange.from) {
							matchesDateRange =
								isEqual(itemDate, dateRange.from) ||
								isAfter(itemDate, dateRange.from)
						} else if (dateRange.to) {
							matchesDateRange =
								isEqual(itemDate, dateRange.to) ||
								isBefore(itemDate, dateRange.to)
						}
					} catch (e) {
						// Manejar fechas inválidas si es necesario
						console.error('Invalid date format for item:', item)
						matchesDateRange = false
					}
				}

				return (
					matchesSearch &&
					matchesType &&
					matchesUsageProbability &&
					matchesTag &&
					matchesDateRange
				)
			})
			.sort((a, b) => {
				if (!sortConfig.key) return 0

				// Asegurarse de que la clave exista en ambos objetos antes de comparar
				const aValue = a[sortConfig.key as keyof AnyDatabaseItem]
				const bValue = b[sortConfig.key as keyof AnyDatabaseItem]

				// Manejar casos donde el valor puede ser undefined o null
				if (aValue == null && bValue == null) return 0
				if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1
				if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1

				// Comparación normal (asumiendo string o number)
				if (aValue < bValue) {
					return sortConfig.direction === 'asc' ? -1 : 1
				}
				if (aValue > bValue) {
					return sortConfig.direction === 'asc' ? 1 : -1
				}
				return 0
			})
	}, [
		items,
		search,
		typeFilter,
		usageProbabilityFilter,
		tagFilter,
		dateRange,
		sortConfig,
	])

	const resetFilters = () => {
		setSearch('')
		setTypeFilter(null)
		setUsageProbabilityFilter(null)
		setTagFilter(null)
		setDateRange(undefined) // Reset date range
		setSortConfig({ key: null, direction: 'asc' }) // Resetear ordenación también
	}

	const handleSort = (key: keyof DatabaseItem) => {
		setSortConfig({
			key,
			direction:
				sortConfig.key === key && sortConfig.direction === 'asc'
					? 'desc'
					: 'asc',
		})
	}

	const toggleSelectAll = () => {
		if (
			selectedItems.length === filteredItems.length &&
			filteredItems.length > 0
		) {
			setSelectedItems([])
		} else {
			setSelectedItems(filteredItems.map((item) => item.id))
		}
	}

	const toggleSelectItem = (itemId: number) => {
		setSelectedItems((prevSelected) =>
			prevSelected.includes(itemId)
				? prevSelected.filter((id) => id !== itemId)
				: [...prevSelected, itemId]
		)
	}

	const handleDeleteSelected = () => {
		// TODO: Implementar llamada a API para borrar
		setItems(items.filter((item) => !selectedItems.includes(item.id)))
		setSelectedItems([])
	}

	const handleDeleteItem = (itemId: number) => {
		// TODO: Implementar llamada a API para borrar
		setItems(items.filter((item) => item.id !== itemId))
		setDeletingItemId(null)
	}

	const handleEditItem = (editedItem: AnyDatabaseItem) => {
		// TODO: Implementar llamada a API para editar
		setItems(
			items.map((item) => (item.id === editedItem.id ? editedItem : item))
		)
		setEditingItem(null)
	}

	// --- Helpers de UI ---

	const getTypeIcon = (type: string) => {
		switch (type) {
			case 'Link':
				return <LinkIcon className='h-4 w-4 text-blue-500' />
			case 'Note':
				return <FileText className='h-4 w-4 text-purple-500' />
			case 'Idea':
				return <Lightbulb className='h-4 w-4 text-amber-500' />
			default:
				return null
		}
	}

	const getUsageProbabilityColor = (probability: string) => {
		switch (probability) {
			case 'High':
				return 'bg-green-500/20 text-green-500 border-green-500/50'
			case 'Medium':
				return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
			case 'Low':
				return 'bg-blue-500/20 text-blue-500 border-blue-500/50'
			default:
				return 'bg-gray-500/20 text-gray-500 border-gray-500/50'
		}
	}

	const activeFiltersCount = [
		search,
		typeFilter,
		usageProbabilityFilter,
		tagFilter,
		dateRange?.from, // Check optional properties
		dateRange?.to,
	].filter(Boolean).length

	// --- Renderizado --- TODO: Descomponer en subcomponentes

	return (
		<div className='h-full flex flex-col space-y-4 p-4 md:p-6 lg:p-8'>
			{' '}
			{/* Add padding */}
			{/* --- Barra de Filtros --- */}
			<div className='flex flex-wrap items-center gap-3'>
				{/* Search Input */}
				<div className='relative flex-1 min-w-[200px]'>
					<Search className='absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
					<Input
						placeholder='Search items...'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className='pl-9' // Adjust padding for icon
					/>
				</div>

				{/* Filter Popover */}
				<Popover>
					<PopoverTrigger asChild>
						<Button variant='outline' className='gap-1.5'>
							{' '}
							{/* Adjusted gap */}
							<Filter className='h-4 w-4' />
							Filters
							{activeFiltersCount > 0 && (
								<Badge
									variant='secondary'
									className='ml-1.5 h-5 w-5 rounded-full p-0 flex items-center justify-center'
								>
									{activeFiltersCount}
								</Badge>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className='w-80' align='end'>
						<div className='space-y-4 p-4'>
							{/* Type Filter */}
							<div className='space-y-2'>
								<h4 className='font-medium text-sm mb-1'>Type</h4>{' '}
								{/* Added margin */}
								<Select
									value={typeFilter ?? 'all'}
									onValueChange={(value) =>
										setTypeFilter(value === 'all' ? null : value)
									}
								>
									<SelectTrigger onClick={(e) => e.stopPropagation()}>
										<SelectValue placeholder='All Types' />
									</SelectTrigger>
									<SelectContent onClick={(e) => e.stopPropagation()}>
										<SelectItem value='all'>All Types</SelectItem>
										<SelectItem value='Link'>Link</SelectItem>
										<SelectItem value='Note'>Note</SelectItem>
										<SelectItem value='Idea'>Idea</SelectItem>
									</SelectContent>
								</Select>
							</div>
							{/* Usage Probability Filter */}
							<div className='space-y-2'>
								<h4 className='font-medium text-sm mb-1'>Usage Probability</h4>{' '}
								{/* Added margin */}
								<Select
									value={usageProbabilityFilter ?? 'all'}
									onValueChange={(value) =>
										setUsageProbabilityFilter(value === 'all' ? null : value)
									}
								>
									<SelectTrigger onClick={(e) => e.stopPropagation()}>
										<SelectValue placeholder='All Probabilities' />
									</SelectTrigger>
									<SelectContent onClick={(e) => e.stopPropagation()}>
										<SelectItem value='all'>All Probabilities</SelectItem>
										<SelectItem value='High'>High</SelectItem>
										<SelectItem value='Medium'>Medium</SelectItem>
										<SelectItem value='Low'>Low</SelectItem>
									</SelectContent>
								</Select>
							</div>
							{/* Tag Filter */}
							<div className='space-y-2'>
								<h4 className='font-medium text-sm mb-1'>Tag</h4>{' '}
								{/* Added margin */}
								<Select
									value={tagFilter ?? 'all'}
									onValueChange={(value) =>
										setTagFilter(value === 'all' ? null : value)
									}
								>
									<SelectTrigger onClick={(e) => e.stopPropagation()}>
										<SelectValue placeholder='All Tags' />
									</SelectTrigger>
									<SelectContent onClick={(e) => e.stopPropagation()}>
										<SelectItem value='all'>All Tags</SelectItem>
										{allTags.map((tag) => (
											<SelectItem key={tag} value={tag}>
												{tag}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							{/* Date Range Filter */}
							<div className='space-y-2'>
								<h4 className='font-medium text-sm mb-1'>Date Range</h4>{' '}
								{/* Added margin */}
								<Popover>
									<PopoverTrigger asChild>
										<Button
											id='date'
											variant={'outline'}
											className={cn(
												'w-full justify-start text-left font-normal',
												!dateRange?.from &&
													!dateRange?.to &&
													'text-muted-foreground'
											)}
										>
											<Calendar className='mr-2 h-4 w-4' />
											{dateRange?.from ? (
												dateRange.to ? (
													<>
														{format(dateRange.from, 'LLL dd, y')} -{' '}
														{format(dateRange.to, 'LLL dd, y')}
													</>
												) : (
													format(dateRange.from, 'LLL dd, y')
												)
											) : (
												<span>Pick a date range</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className='w-auto p-0' align='start'>
										<CalendarComponent
											initialFocus
											mode='range'
											defaultMonth={dateRange?.from}
											selected={dateRange}
											onSelect={setDateRange} // Simplified selection handler
											numberOfMonths={2}
										/>
									</PopoverContent>
								</Popover>
								{(dateRange?.from || dateRange?.to) && (
									<Button
										variant='ghost'
										size='sm'
										className='w-full justify-center mt-2'
										onClick={() => setDateRange(undefined)}
									>
										Clear dates
									</Button>
								)}
							</div>

							<div className='flex justify-between pt-4 border-t mt-4'>
								{' '}
								{/* Added padding top */}
								<Button variant='ghost' size='sm' onClick={resetFilters}>
									Reset all
								</Button>
								{/* Apply button might not be needed if filters apply instantly */}
								{/* <Button size="sm">Apply</Button> */}
							</div>
						</div>
					</PopoverContent>
				</Popover>

				{/* Column Visibility Toggle */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant='outline' size='icon' title='Toggle Columns'>
							<SlidersHorizontal className='h-4 w-4' />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end' className='w-56'>
						<DropdownMenuItem className='font-medium' disabled>
							Toggle Columns
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						{Object.entries(visibleColumns).map(([key, checked]) => (
							<DropdownMenuCheckboxItem
								key={key}
								className='capitalize'
								checked={checked}
								onCheckedChange={(isChecked) =>
									setVisibleColumns((prev) => ({ ...prev, [key]: !!isChecked }))
								}
							>
								{/* Mejorar nombres de columna si es necesario */}
								{key
									.replace(/([A-Z])/g, ' $1')
									.replace(/^./, (str) => str.toUpperCase())}
							</DropdownMenuCheckboxItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>

				{/* Reset Filters Button */}
				<Button
					variant='outline'
					size='icon'
					onClick={resetFilters}
					title='Reset Filters'
				>
					<RotateCcw className='h-4 w-4' />
				</Button>
			</div>
			{/* --- Active Filters Display --- */}
			{activeFiltersCount > 0 && (
				<div className='flex items-center gap-2 flex-wrap text-sm text-muted-foreground'>
					<span>Active filters:</span>
					{/* TODO: Componentizar la visualización de filtros activos */}
					{search && (
						<Badge variant='secondary' className='flex items-center gap-1'>
							Search: "{search}"{' '}
							<Button
								variant='ghost'
								size='icon'
								className='h-4 w-4 p-0'
								onClick={() => setSearch('')}
							>
								<Trash className='h-3 w-3' />
							</Button>
						</Badge>
					)}
					{typeFilter && (
						<Badge variant='secondary' className='flex items-center gap-1'>
							Type: {typeFilter}{' '}
							<Button
								variant='ghost'
								size='icon'
								className='h-4 w-4 p-0'
								onClick={() => setTypeFilter(null)}
							>
								<Trash className='h-3 w-3' />
							</Button>
						</Badge>
					)}
					{usageProbabilityFilter && (
						<Badge variant='secondary' className='flex items-center gap-1'>
							Usage: {usageProbabilityFilter}{' '}
							<Button
								variant='ghost'
								size='icon'
								className='h-4 w-4 p-0'
								onClick={() => setUsageProbabilityFilter(null)}
							>
								<Trash className='h-3 w-3' />
							</Button>
						</Badge>
					)}
					{tagFilter && (
						<Badge variant='secondary' className='flex items-center gap-1'>
							Tag: {tagFilter}{' '}
							<Button
								variant='ghost'
								size='icon'
								className='h-4 w-4 p-0'
								onClick={() => setTagFilter(null)}
							>
								<Trash className='h-3 w-3' />
							</Button>
						</Badge>
					)}
					{(dateRange?.from || dateRange?.to) && (
						<Badge variant='secondary' className='flex items-center gap-1'>
							Date: {dateRange.from ? format(dateRange.from, 'MMM d') : '...'} -{' '}
							{dateRange.to ? format(dateRange.to, 'MMM d') : '...'}{' '}
							<Button
								variant='ghost'
								size='icon'
								className='h-4 w-4 p-0'
								onClick={() => setDateRange(undefined)}
							>
								<Trash className='h-3 w-3' />
							</Button>
						</Badge>
					)}
					<Button
						variant='ghost'
						size='sm'
						onClick={resetFilters}
						className='h-auto px-2 py-1 text-xs underline'
					>
						Reset all
					</Button>
				</div>
			)}
			{/* --- Tabla --- */}
			<div className='rounded-lg border overflow-hidden flex-1'>
				<div className='relative w-full overflow-auto'>
					{' '}
					{/* Necesario para scroll horizontal si hay muchas columnas */}
					<Table>
						<TableHeader className='sticky top-0 z-10 bg-background'>
							{/* Header fijo */}
							<TableRow className='bg-muted/50 hover:bg-muted/50'>
								{/* Select All Checkbox */}
								<TableHead className='w-[50px] px-3'>
									<Checkbox
										checked={
											filteredItems.length > 0 &&
											selectedItems.length === filteredItems.length
										}
										onCheckedChange={toggleSelectAll}
										aria-label='Select all'
									/>
								</TableHead>
								{/* Column Headers (dinámicos) */}
								{visibleColumns.name && (
									<TableHead className='min-w-[250px]'>
										<Button
											variant='ghost'
											className='p-0 font-medium flex items-center gap-1 hover:bg-transparent data-[state=open]:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0'
											onClick={() => handleSort('name')}
										>
											Name{' '}
											{sortConfig.key === 'name' &&
												(sortConfig.direction === 'asc' ? (
													<ArrowUpDown className='h-3 w-3' />
												) : (
													<ArrowUpDown className='h-3 w-3' />
												))}
										</Button>
									</TableHead>
								)}
								{visibleColumns.type && (
									<TableHead className='w-[120px]'>
										<Button
											variant='ghost'
											className='p-0 font-medium flex items-center gap-1 hover:bg-transparent data-[state=open]:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0'
											onClick={() => handleSort('type')}
										>
											Type{' '}
											{sortConfig.key === 'type' &&
												(sortConfig.direction === 'asc' ? (
													<ArrowUpDown className='h-3 w-3' />
												) : (
													<ArrowUpDown className='h-3 w-3' />
												))}
										</Button>
									</TableHead>
								)}
								{visibleColumns.tags && (
									<TableHead className='min-w-[200px]'>Tags</TableHead>
								)}
								{visibleColumns.url && (
									<TableHead className='w-[150px]'>URL</TableHead>
								)}
								{visibleColumns.usageProbability && (
									<TableHead className='w-[160px]'>
										<Button
											variant='ghost'
											className='p-0 font-medium flex items-center gap-1 hover:bg-transparent data-[state=open]:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0'
											onClick={() => handleSort('usageProbability')}
										>
											Usage Probability{' '}
											{sortConfig.key === 'usageProbability' &&
												(sortConfig.direction === 'asc' ? (
													<ArrowUpDown className='h-3 w-3' />
												) : (
													<ArrowUpDown className='h-3 w-3' />
												))}
										</Button>
									</TableHead>
								)}
								{visibleColumns.date && (
									<TableHead className='w-[130px]'>
										<Button
											variant='ghost'
											className='p-0 font-medium flex items-center gap-1 hover:bg-transparent data-[state=open]:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0'
											onClick={() => handleSort('createdAt')}
										>
											Created At{' '}
											{sortConfig.key === 'createdAt' &&
												(sortConfig.direction === 'asc' ? (
													<ArrowUpDown className='h-3 w-3' />
												) : (
													<ArrowUpDown className='h-3 w-3' />
												))}
										</Button>
									</TableHead>
								)}
								{visibleColumns.notes && (
									<TableHead className='min-w-[200px]'>Notes</TableHead>
								)}
								<TableHead className='w-[80px] text-right pr-3'>
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredItems.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={
											Object.values(visibleColumns).filter(Boolean).length + 2
										}
										className='h-24 text-center'
									>
										No items found.
									</TableCell>
								</TableRow>
							) : (
								filteredItems.map((item) => (
									<TableRow
										key={item.id}
										data-state={
											selectedItems.includes(item.id) ? 'selected' : ''
										}
										className='hover:bg-muted/50'
									>
										{/* Select Row Checkbox */}
										<TableCell className='px-3'>
											<Checkbox
												checked={selectedItems.includes(item.id)}
												onCheckedChange={() => toggleSelectItem(item.id)}
												aria-label={`Select item ${item.id}`}
											/>
										</TableCell>
										{/* Cells (dinámicas) */}
										{visibleColumns.name && (
											<TableCell className='font-medium'>
												<Link
													href={`/database/${item.id}`}
													className='hover:underline text-primary'
												>
													{item.name}
												</Link>
											</TableCell>
										)}
										{visibleColumns.type && (
											<TableCell>
												<div className='flex items-center gap-2'>
													{getTypeIcon(item.type)}
													<span>{item.type}</span>
												</div>
											</TableCell>
										)}
										{visibleColumns.tags && (
											<TableCell>
												<div className='flex gap-1 flex-wrap'>
													{item.tags.map((tag) => (
														<Badge
															key={tag}
															variant='secondary'
															className='font-normal'
														>
															{tag}
														</Badge>
													))}
												</div>
											</TableCell>
										)}
										{visibleColumns.url && (
											<TableCell className='text-xs'>
												{item.url ? (
													<Button
														variant='link'
														size='sm'
														className='h-auto p-0 text-xs'
														asChild
													>
														<a
															href={item.url}
															target='_blank'
															rel='noopener noreferrer'
															className='inline-flex items-center gap-1 truncate max-w-[130px]'
														>
															<span>
																{new URL(item.url).hostname.replace('www.', '')}
															</span>
															<ExternalLink className='h-3 w-3 shrink-0' />
														</a>
													</Button>
												) : (
													<span className='text-muted-foreground'>—</span>
												)}
											</TableCell>
										)}
										{visibleColumns.usageProbability && (
											<TableCell>
												<Badge
													variant='outline'
													className={cn(
														'border text-xs font-normal',
														getUsageProbabilityColor(item.usageProbability)
													)}
												>
													{item.usageProbability}
												</Badge>
											</TableCell>
										)}
										{visibleColumns.date && (
											<TableCell className='text-muted-foreground text-xs'>
												{format(parseISO(item.createdAt), 'MMM d, yyyy')}
											</TableCell>
										)}
										{visibleColumns.notes && (
											<TableCell className='text-muted-foreground max-w-[200px] truncate text-xs'>
												{item.notes}
											</TableCell>
										)}
										{/* Actions Menu */}
										<TableCell className='text-right pr-3'>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant='ghost'
														className='h-8 w-8 p-0 data-[state=open]:bg-muted focus-visible:ring-0 focus-visible:ring-offset-0'
													>
														<span className='sr-only'>Open menu</span>
														<MoreHorizontal className='h-4 w-4' />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align='end'>
													{/* TODO: Implementar Edit Dialog */}
													<DropdownMenuItem
														onClick={() => alert(`Edit item ${item.id}`)}
													>
														<Pencil className='mr-2 h-4 w-4' />
														Edit
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => setDeletingItemId(item.id)}
														className='text-destructive focus:bg-destructive/10 focus:text-destructive'
													>
														<Trash className='mr-2 h-4 w-4' />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</div>
			{/* --- Paginación y Acciones Globales --- */}
			{/* TODO: Refactorizar en un componente DataTablePagination */}
			<div className='flex items-center justify-between pt-2'>
				{' '}
				{/* Added padding top */}
				<div className='text-sm text-muted-foreground flex-1'>
					{selectedItems.length > 0 ? (
						<div className='flex items-center gap-2'>
							<span>
								{selectedItems.length} of {filteredItems.length} row(s)
								selected.
							</span>
							<Button
								variant='outline'
								size='sm'
								onClick={handleDeleteSelected}
								className='h-8 text-destructive border-destructive hover:bg-destructive/10'
							>
								<Trash className='h-3.5 w-3.5 mr-1.5' />
								Delete Selected
							</Button>
						</div>
					) : (
						<span>Total {items.length} items</span>
					)}
				</div>
				{/* TODO: Implementar Paginación real (funcionalidad y UI) */}
				<div className='flex items-center space-x-6 lg:space-x-8'>
					<div className='flex items-center space-x-2'>
						<p className='text-sm font-medium'>Rows per page</p>
						<Select
							value={`${10}`} // TODO: Usar estado real de paginación
							onValueChange={(value) => {
								// TODO: setPageSize(Number(value))
							}}
						>
							<SelectTrigger className='h-8 w-[70px]'>
								<SelectValue placeholder={`${10}`} />{' '}
								{/* TODO: Usar estado real */}
							</SelectTrigger>
							<SelectContent side='top'>
								{[10, 20, 30, 40, 50].map((pageSize) => (
									<SelectItem key={pageSize} value={`${pageSize}`}>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className='flex w-[100px] items-center justify-center text-sm font-medium'>
						Page 1 of 1 {/* TODO: Usar estado real */}
					</div>
					<div className='flex items-center space-x-2'>
						<Button
							variant='outline'
							className='hidden h-8 w-8 p-0 lg:flex'
							// onClick={() => table.setPageIndex(0)}
							disabled={true} // TODO: Usar estado real
						>
							<span className='sr-only'>Go to first page</span>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width='15'
								height='15'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<polyline points='11 17 6 12 11 7' />
								<polyline points='18 17 13 12 18 7' />
							</svg>
						</Button>
						<Button
							variant='outline'
							className='h-8 w-8 p-0'
							// onClick={() => table.previousPage()}
							disabled={true} // TODO: Usar estado real
						>
							<span className='sr-only'>Go to previous page</span>
							<ChevronDown className='h-4 w-4 rotate-90' />
						</Button>
						<Button
							variant='outline'
							className='h-8 w-8 p-0'
							// onClick={() => table.nextPage()}
							disabled={true} // TODO: Usar estado real
						>
							<span className='sr-only'>Go to next page</span>
							<ChevronDown className='h-4 w-4 -rotate-90' />
						</Button>
						<Button
							variant='outline'
							className='hidden h-8 w-8 p-0 lg:flex'
							// onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={true} // TODO: Usar estado real
						>
							<span className='sr-only'>Go to last page</span>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width='15'
								height='15'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<polyline points='13 17 18 12 13 7' />
								<polyline points='6 17 11 12 6 7' />
							</svg>
						</Button>
					</div>
				</div>
			</div>
			{/* --- Diálogos --- */}
			{/* TODO: Implementar EditItemDialog component */}
			{/* <EditItemDialog item={editingItem} onClose={() => setEditingItem(null)} onSave={handleEditItem} /> */}
			<AlertDialog
				open={deletingItemId !== null}
				onOpenChange={() => setDeletingItemId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							item.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
							onClick={() => deletingItemId && handleDeleteItem(deletingItemId)}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
