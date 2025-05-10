import { useState, useEffect } from 'react'

/**
 * Hook personalizado para debounce de valores
 * Espera el tiempo especificado antes de actualizar el valor
 */
export function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value)

	useEffect(() => {
		// Configurar el timeout para actualizar el valor después del delay
		const timer = setTimeout(() => {
			setDebouncedValue(value)
		}, delay)

		// Limpiar el timeout si el valor cambia antes del delay
		return () => {
			clearTimeout(timer)
		}
	}, [value, delay])

	return debouncedValue
}
