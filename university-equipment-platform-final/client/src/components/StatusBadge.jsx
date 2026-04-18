import { Badge } from './ui'

/**
 * Status badge component that maps reservation status to visual representation
 */
export function StatusBadge({ status, className }) {
  const statusMap = {
    'approuvée': { variant: 'success', label: 'approuvée' },
    'approved': { variant: 'success', label: 'Approuvée' },
    'en_attente': { variant: 'warning', label: 'en attente' },
    'pending': { variant: 'warning', label: 'En attente' },
    'refusée': { variant: 'danger', label: 'refusée' },
    'refused': { variant: 'danger', label: 'Refusée' },
    'maintenance': { variant: 'warning', label: 'En maintenance' },
    'disponible': { variant: 'success', label: 'Disponible' },
    'réservé': { variant: 'danger', label: 'Réservé' },
  }

  const config = statusMap[status?.toLowerCase()] || {
    variant: 'default',
    label: status || 'N/A',
  }

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}

/**
 * Action buttons set for common table actions
 */
export function ActionButtons({ onApprove, onRefuse, onEdit, onDelete, showApproveRefuse = true, showEditDelete = true }) {
  return (
    <div className="flex items-center gap-2">
      {showApproveRefuse && (
        <>
          {onApprove && (
            <button
              onClick={onApprove}
              className="inline-flex items-center justify-center h-8 w-8 rounded hover:bg-green-50 text-green-600 transition-colors"
              title="Approuver"
            >
              ✓
            </button>
          )}
          {onRefuse && (
            <button
              onClick={onRefuse}
              className="inline-flex items-center justify-center h-8 w-8 rounded hover:bg-red-50 text-red-600 transition-colors"
              title="Refuser"
            >
              ✕
            </button>
          )}
        </>
      )}
      {showEditDelete && (
        <>
          {onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex items-center justify-center h-8 w-8 rounded hover:bg-teal-50 text-teal-600 transition-colors"
              title="Modifier"
            >
              ✎
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="inline-flex items-center justify-center h-8 w-8 rounded hover:bg-red-50 text-red-600 transition-colors"
              title="Supprimer"
            >
              🗑
            </button>
          )}
        </>
      )}
    </div>
  )
}
