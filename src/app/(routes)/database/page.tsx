import { DatabaseTable } from '@/features/database/components/DatabaseTable'

export default function DatabasePage() {
	return (
		<div className='h-full flex flex-col'>
			{/* El título principal podría ir en el layout si es común, o aquí si es específico */}
			{/* <h1 className="text-2xl font-bold mb-6 px-4 sm:px-6 lg:px-8 pt-8">Knowledge Database</h1> */}

			{/* El componente DatabaseTable ya incluye padding y el manejo del layout interno */}
			<DatabaseTable />
		</div>
	)
}
