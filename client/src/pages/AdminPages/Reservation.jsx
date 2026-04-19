import React, { useState, useEffect } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '../../components/ui'
import { StatusBadge } from '../../components/StatusBadge'
import { Search, ChevronDown } from 'lucide-react'

export default function Reservation() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('tous')
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  // Dialog state for approve/refuse/return actions
  const [showDialog, setShowDialog] = useState(false)
  const [dialogAction, setDialogAction] = useState(null) // 'approve' | 'refuse' | 'return'
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch reservations on mount
  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/reservations', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`)
      }

      const data = await res.json()
      if (data.success) {
        setReservations(data.data || [])
      } else {
        setError(data.message || 'Erreur lors du chargement des réservations')
        setReservations([])
      }
    } catch (err) {
      console.error('Fetch error:', err)
      // If API doesn't exist yet, show helpful message
      if (err.message.includes('Failed to fetch')) {
        setError(
          'API des réservations non disponible. Les endpoints sont en cours de développement.'
        )
      } else {
        setError(err.message || 'Erreur lors du chargement')
      }
      setReservations([])
    } finally {
      setLoading(false)
    }
  }

  const handleApproveClick = (reservation) => {
    setSelectedReservation(reservation)
    setDialogAction('approve')
    setShowDialog(true)
  }

  const handleRefuseClick = (reservation) => {
    setSelectedReservation(reservation)
    setDialogAction('refuse')
    setShowDialog(true)
  }

  const handleReturnClick = (reservation) => {
    setSelectedReservation(reservation)
    setDialogAction('return')
    setShowDialog(true)
  }

  const confirmAction = async () => {
    if (!selectedReservation || !dialogAction) return

    setActionLoading(true)
    try {
      const token = localStorage.getItem('token')
      const newStatus =
        dialogAction === 'approve'
          ? 'approved'
          : dialogAction === 'refuse'
            ? 'refused'
            : 'returned'

      const res = await fetch(
        `http://localhost:5000/api/reservations/${selectedReservation._id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      )

      const data = await res.json()
      if (data.success) {
        // Update the reservation in the list
        setReservations((current) =>
          current.map((r) =>
            r._id === selectedReservation._id
              ? {
                  ...r,
                  ...(data.data || {}),
                  status: newStatus,
                }
              : r
          )
        )
        setShowDialog(false)
        setSelectedReservation(null)
      } else {
        setError(data.message || 'Erreur lors de la mise à jour')
      }
    } catch (err) {
      console.error('Action error:', err)
      setError('Erreur lors de l\'exécution de l\'action')
    } finally {
      setActionLoading(false)
    }
  }

  // Filter and search
  const filteredReservations = reservations.filter((res) => {
    const matchesSearch =
      !searchTerm ||
      res.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.equipmentName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      filterStatus === 'tous' ||
      res.status?.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const statusFilterOptions = ['tous', 'pending', 'approved', 'returned', 'refused']

  return (
    <div className="p-8 min-h-screen bg-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestion des réservations
        </h1>
        <p className="text-gray-500">
          {filteredReservations.length} réservation
          {filteredReservations.length !== 1 ? 's' : ''} au total
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="mb-6 flex gap-4 items-end">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher une réservation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm font-medium text-gray-700"
          >
            Tous les status
            <ChevronDown size={16} />
          </button>

          {showFilterMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {statusFilterOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setFilterStatus(option)
                    setShowFilterMenu(false)
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                    filterStatus === option
                      ? 'bg-teal-50 text-teal-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option === 'tous'
                    ? 'Tous les statuts'
                    : option === 'pending'
                      ? 'En attente'
                      : option === 'approved'
                        ? 'Approuvées'
                      : option === 'returned'
                        ? 'Terminées'
                        : 'Refusées'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
          <p className="mt-4 text-gray-600">Chargement des réservations...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredReservations.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Aucune réservation trouvée</p>
          <Button
            onClick={fetchReservations}
            variant="secondary"
            size="sm"
          >
            Actualiser
          </Button>
        </div>
      )}

      {/* Table */}
      {!loading && filteredReservations.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ÉTUDIANT</TableHead>
                <TableHead>MATÉRIEL</TableHead>
                <TableHead>DATE DÉBUT</TableHead>
                <TableHead>DATE FIN</TableHead>
                <TableHead>STATUT</TableHead>
                <TableHead className="text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((reservation) => (
                <TableRow key={reservation._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">
                        {reservation.studentName || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {reservation.studentId || 'N/A'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-900 font-medium">
                    {reservation.equipmentName || 'N/A'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {formatDate(reservation.startDate)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {formatDate(reservation.endDate)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={reservation.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {reservation.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveClick(reservation)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded hover:bg-green-50 text-green-600 transition-colors"
                            title="Approuver"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleRefuseClick(reservation)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded hover:bg-red-50 text-red-600 transition-colors"
                            title="Refuser"
                          >
                            ✕
                          </button>
                        </>
                      )}
                      {reservation.status === 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleReturnClick(reservation)}
                          className="text-teal-600 text-sm font-medium hover:underline"
                          title="Marquer comme terminée"
                        >
                          Marquer comme terminée
                        </button>
                      )}
                      {reservation.status === 'returned' && (
                        <span className="text-emerald-600 text-sm">Terminée</span>
                      )}
                      {reservation.status === 'refused' && (
                        <span className="text-gray-400 text-sm">Refusée</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'approve'
                ? 'Confirmer l\'approbation'
                : dialogAction === 'refuse'
                  ? 'Confirmer le refus'
                  : 'Confirmer la finalisation'}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-gray-600 mb-4">
              {dialogAction === 'approve'
                ? 'Êtes-vous sûr de vouloir approuver cette réservation ?'
                : dialogAction === 'refuse'
                  ? 'Êtes-vous sûr de vouloir refuser cette réservation ?'
                  : 'Confirmez-vous que le matériel a été rendu et que la réservation doit être marquée comme terminée ?'}
            </p>
            {selectedReservation && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-900">
                  {selectedReservation.studentName}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedReservation.equipmentName}
                </p>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={actionLoading}
            >
              Annuler
            </Button>
            <Button
              variant={dialogAction === 'refuse' ? 'destructive' : 'default'}
              onClick={confirmAction}
              disabled={actionLoading}
            >
              {actionLoading ? 'Traitement...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}