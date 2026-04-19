import { useCallback, useEffect, useMemo, useState } from 'react'

function toArray(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

function normalizeReservationStatus(value) {
  const raw = (value || '').toString().toLowerCase()
  if (raw.includes('approv') || raw.includes('approuv')) return 'approved'
  if (raw.includes('refus')) return 'refused'
  if (raw.includes('return')) return 'returned'
  return 'pending'
}

function normalizeEquipmentStatus(item) {
  const raw = (item?.status || item?.condition || '').toString().toLowerCase()
  if (raw.includes('brok') || raw.includes('panne') || raw.includes('poor')) return 'broken'
  if (raw.includes('maint')) return 'maintenance'
  if (raw.includes('reserv')) return 'reserved'
  return 'available'
}

async function fetchOptionalList(url, headers) {
  try {
    const response = await fetch(url, { headers })
    if (!response.ok) return null
    const payload = await response.json()
    return toArray(payload)
  } catch {
    return null
  }
}

async function fetchDashboardLists() {
  const token = localStorage.getItem('token')
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  const [usersData, equipmentData, reservationsData, penaltiesData, maintenanceData] =
    await Promise.all([
      fetchOptionalList('http://localhost:5000/api/auth/users', headers),
      fetchOptionalList('http://localhost:5000/api/equipment', headers),
      fetchOptionalList('http://localhost:5000/api/reservations', headers),
      fetchOptionalList('http://localhost:5000/api/penalties', headers),
      fetchOptionalList('http://localhost:5000/api/maintenance', headers),
    ])

  const successCount = [
    usersData,
    equipmentData,
    reservationsData,
    penaltiesData,
    maintenanceData,
  ].filter(Boolean).length

  return {
    usersData,
    equipmentData,
    reservationsData,
    penaltiesData,
    maintenanceData,
    successCount,
  }
}

function deriveDataSource(successCount) {
  if (successCount === 0) return 'mock'
  if (successCount < 5) return 'mixed'
  return 'api'
}

function deriveWarning(successCount) {
  if (successCount === 0) {
    return 'Serveur injoignable : aucune donnée ne peut être affichée.'
  }
  if (successCount < 5) {
    return 'Certaines sources API sont indisponibles : données partielles.'
  }
  return ''
}

export function useAdminDashboardData() {
  const [loading, setLoading] = useState(true)
  const [warning, setWarning] = useState('')
  const [dataSource, setDataSource] = useState('mock')
  const [students, setStudents] = useState([])
  const [equipment, setEquipment] = useState([])
  const [reservations, setReservations] = useState([])
  const [penalties, setPenalties] = useState([])
  const [maintenanceTickets, setMaintenanceTickets] = useState([])

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    setWarning('')
    const {
      usersData,
      equipmentData,
      reservationsData,
      penaltiesData,
      maintenanceData,
      successCount,
    } = await fetchDashboardLists()

    if (usersData) setStudents(usersData)
    if (equipmentData) setEquipment(equipmentData)
    if (reservationsData) setReservations(reservationsData)
    if (penaltiesData) setPenalties(penaltiesData)
    if (maintenanceData) setMaintenanceTickets(maintenanceData)

    setDataSource(deriveDataSource(successCount))
    setWarning(deriveWarning(successCount))

    setLoading(false)
  }, [])

  useEffect(() => {
    let isMounted = true

    const runInitialLoad = async () => {
      const {
        usersData,
        equipmentData,
        reservationsData,
        penaltiesData,
        maintenanceData,
        successCount,
      } = await fetchDashboardLists()

      if (!isMounted) return

      if (usersData) setStudents(usersData)
      if (equipmentData) setEquipment(equipmentData)
      if (reservationsData) setReservations(reservationsData)
      if (penaltiesData) setPenalties(penaltiesData)
      if (maintenanceData) setMaintenanceTickets(maintenanceData)

      setDataSource(deriveDataSource(successCount))
      setWarning(deriveWarning(successCount))
      setLoading(false)
    }

    runInitialLoad()

    return () => {
      isMounted = false
    }
  }, [])

  const stats = useMemo(() => {
    const normalizedReservations = reservations.map((item) =>
      normalizeReservationStatus(item.status)
    )

    const actualStudents = students.filter(user => 
      !user.role || 
      user.role.toLowerCase() === 'student' || 
      user.role.toLowerCase() === 'etudiant'
    )

    let availableAndBrokenCopies = 0;
    equipment.forEach(item => {
        availableAndBrokenCopies += (item.quantity || 0);
    });

    const activeReservationsCount = normalizedReservations.filter(
        (status) => status === 'approved' // Each approved currently holds a copy
    ).length;

    let maintenanceCopies = 0;
    maintenanceTickets.forEach(t => {
        if (t.status === 'open') {
            maintenanceCopies += (t.quantity || 0);
        }
    });

    const totalMaterials = availableAndBrokenCopies + activeReservationsCount + maintenanceCopies;

    return {
      studentsCount: actualStudents.length,
      materialsCount: totalMaterials,
      activeReservationsCount: normalizedReservations.filter(
        (status) => status === 'approved' || status === 'pending'
      ).length,
      penaltiesCount: penalties.length,
    }
  }, [students, equipment, reservations, penalties, maintenanceTickets])

  const equipmentStatus = useMemo(() => {
    const counts = {
      available: 0,
      reserved: 0,
      maintenance: 0,
      broken: 0,
    }

    // 1) Quantities currently in the equipment catalog
    equipment.forEach((item) => {
      const statusRaw = normalizeEquipmentStatus(item);
      const qty = item.quantity || 0;
      if (statusRaw === 'broken') counts.broken += qty;
      else if (statusRaw === 'maintenance') counts.maintenance += qty;
      else if (statusRaw === 'reserved') counts.reserved += qty;
      else counts.available += qty;
    })

    // 2) Quantities currently in open maintenance tickets
    maintenanceTickets.forEach((ticket) => {
        if (ticket.status === 'open') {
            counts.maintenance += (ticket.quantity || 0);
        }
    })

    // 3) Quantities currently reserved
    reservations.forEach((reservation) => {
        if (normalizeReservationStatus(reservation.status) === 'approved') {
            counts.reserved += 1;
        }
    })

    return [
      { id: 'available', label: 'Disponible', value: counts.available },
      { id: 'reserved', label: 'Reserve', value: counts.reserved },
      { id: 'maintenance', label: 'En maintenance', value: counts.maintenance },
      { id: 'broken', label: 'En panne', value: counts.broken },
    ]
  }, [equipment, reservations, maintenanceTickets])

  const recentReservations = useMemo(() => {
    return reservations.slice(0, 4).map((item, index) => ({
      id: item._id || item.id || index,
      equipmentName:
        item.equipmentName || item.equipment?.name || item.equipmentId?.name || 'Materiel',
      studentName: item.studentName || item.userName || item.userId?.username || 'Etudiant',
      status: normalizeReservationStatus(item.status),
    }))
  }, [reservations])

  return {
    loading,
    warning,
    dataSource,
    stats,
    equipmentStatus,
    recentReservations,
    refresh: loadDashboardData,
  }
}
