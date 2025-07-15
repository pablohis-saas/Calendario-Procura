'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="p-6">
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-800">Error al cargar el dashboard</h2>
        <p className="mt-2 text-sm text-red-600">
          {error.message || 'Ha ocurrido un error inesperado'}
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-200"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
} 