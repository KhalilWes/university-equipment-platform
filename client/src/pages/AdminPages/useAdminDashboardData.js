import { useCallback, useEffect, useMemo, useState } from 'react'

const MOCK_STUDENTS = [
  { id: 'E2024001', name: 'Sophie Martin' },
  { id: 'E2024002', name: 'Lucas Dubois' },
  { id: 'E2024003', name: 'Emma Bernard' },
  { id: 'E2024004', name: 'Thomas Petit' },
]

const MOCK_EQUIPMENT = [
  { id: 1, status: 'Available' },
  { id: 2, status: 'Reserved' },
  { id: 3, status: 'Available' },
  { id: 4, status: 'Available' },
  { id: 5, status: 'Maintenance' },
  { id: 6, status: 'Available' },
  { id: 7, status: 'Broken' },
  { id: 8, status: 'Available' },
]

const MOCK_RESERVATIONS = [
  {
    id: 1,
    equipmentName: 'Salle Laboratoire Physique A',
    studentName: 'Thomas Petit',
    status: 'approved',
  },
  {
    id: 2,
    equipmentName: 'Videoprojecteur Epson EB-2250U',
    studentName: 'Sophie Martin',
    status: 'pending',
  },
  {
    id: 3,
    equipmentName: 'Oscilloscope Numerique Tektronix',
    studentName: 'Lucas Dubois',
    status: 'approved',
  },
  {
    id: 4,
    equipmentName: 'Dell XPS 15',
    studentName: 'Sophie Martin',
    status: 'approved',
  },
]

const MOCK_PENALTIES = [{ id: 1 }, { id: 2 }]

function toArray(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

function normalizeReservationStatus(value) {
  const raw = (value || '').toString().toLowerCase()
  if (raw.includes('approv') || raw.includes('approuv')) return 'approved'
  if (raw.includes('refus')) return 'refused'
  return 'pending'
}

function normalizeEquipmentStatus(item) {
  const raw = (item?.status || item?.condition || '').toString().toLowerCase()
  if (raw.includes('brok') || raw.includes('panne')) return 'broken'
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

  const [usersData, equipmentData, reservationsData, penaltiesData] =
    await Promise.all([
      fetchOptionalList('http://localhost:5000/api/auth/users', headers),
      fetchOptionalList('http://localhost:5000/api/equipment', headers),
      fetchOptionalList('http://localhost:5000/api/reservations', headers),
      fetchOptionalList('http://localhost:5000/api/penalties', headers),
    ])

  const successCount = [
    usersData,
    equipmentData,
    reservationsData,
    penaltiesData,
  ].filter(Boolean).length

  return {
    usersData,
    equipmentData,
    reservationsData,
    penaltiesData,
    successCount,
  }
}

function deriveDataSource(successCount) {
  if (successCount === 0) return 'mock'
  if (successCount < 4) return 'mixed'
  return 'api'
}

function deriveWarning(successCount) {
  if (successCount === 0) {
    return 'Endpoints indisponibles: affichage des donnees de demonstration.'
  }
  if (successCount < 4) {
    return 'Certaines sources API sont indisponibles: dashboard partiellement alimente par des donnees de demonstration.'
  }
  return ''
}

export function useAdminDashboardData() {
  const [loading, setLoading] = useState(true)
  const [warning, setWarning] = useState('')
  const [dataSource, setDataSource] = useState('mock')
  const [students, setStudents] = useState(MOCK_STUDENTS)
  const [equipment, setEquipment] = useState(MOCK_EQUIPMENT)
  const [reservations, setReservations] = useState(MOCK_RESERVATIONS)
  const [penalties, setPenalties] = useState(MOCK_PENALTIES)

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    setWarning('')
    const {
      usersData,
      equipmentData,
      reservationsData,
      penaltiesData,
      successCount,
    } = await fetchDashboardLists()

    if (usersData) setStudents(usersData)
    if (equipmentData) setEquipment(equipmentData)
    if (reservationsData) setReservations(reservationsData)
    if (penaltiesData) setPenalties(penaltiesData)

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
        successCount,
      } = await fetchDashboardLists()

      if (!isMounted) return

      if (usersData) setStudents(usersData)
      if (equipmentData) setEquipment(equipmentData)
      if (reservationsData) setReservations(reservationsData)
      if (penaltiesData) setPenalties(penaltiesData)

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

    return {
      studentsCount: students.length,
      materialsCount: equipment.length,
      activeReservationsCount: normalizedReservations.filter(
        (status) => status === 'approved' || status === 'pending'
      ).length,
      penaltiesCount: penalties.length,
    }
  }, [students, equipment, reservations, penalties])

  const equipmentStatus = useMemo(() => {
    const counts = {
      available: 0,
      reserved: 0,
      maintenance: 0,
      broken: 0,
    }

    equipment.forEach((item) => {
      counts[normalizeEquipmentStatus(item)] += 1
    })

    return [
      { id: 'available', label: 'Disponible', value: counts.available },
      { id: 'reserved', label: 'Reserve', value: counts.reserved },
      { id: 'maintenance', label: 'En maintenance', value: counts.maintenance },
      { id: 'broken', label: 'En panne', value: counts.broken },
    ]
  }, [equipment])

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
