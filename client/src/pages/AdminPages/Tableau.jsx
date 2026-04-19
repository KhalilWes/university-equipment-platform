import { lazy, Suspense } from 'react'
import {
    Users,
    Package,
    CalendarDays,
    AlertTriangle,
    TrendingUp,
    Clock3,
} from 'lucide-react'
import { StatusBadge } from '../../components/StatusBadge'
import { useAdminDashboardData } from './useAdminDashboardData'

const EquipmentStatusChart = lazy(() => import('./EquipmentStatusChart'))

const statsCardsMeta = [
    {
        id: 'students',
        label: 'Etudiants',
        valueKey: 'studentsCount',
        icon: Users,
        iconWrapClass: 'bg-teal-500',
    },
    {
        id: 'materials',
        label: 'Materiel total',
        valueKey: 'materialsCount',
        icon: Package,
        iconWrapClass: 'bg-cyan-500',
    },
    {
        id: 'active',
        label: 'Reservations actives',
        valueKey: 'activeReservationsCount',
        icon: CalendarDays,
        iconWrapClass: 'bg-violet-500',
    },
    {
        id: 'penalties',
        label: 'Penalites',
        valueKey: 'penaltiesCount',
        icon: AlertTriangle,
        iconWrapClass: 'bg-rose-500',
    },
]

const equipmentStatusStyles = [
    {
        id: 'available',
        rowClass: 'bg-green-50 text-green-800',
        countClass: 'text-green-600',
    },
    {
        id: 'reserved',
        rowClass: 'bg-amber-50 text-amber-800',
        countClass: 'text-amber-600',
    },
    {
        id: 'maintenance',
        rowClass: 'bg-orange-50 text-orange-800',
        countClass: 'text-orange-600',
    },
    {
        id: 'broken',
        rowClass: 'bg-rose-50 text-rose-800',
        countClass: 'text-rose-600',
    },
]

export default function Tableau() {
    const { loading, warning, dataSource, stats, equipmentStatus, recentReservations, refresh } =
        useAdminDashboardData()

    const totalEquipmentCount = equipmentStatus.reduce(
        (sum, item) => sum + (Number(item.value) || 0),
        0
    )

    return (
        <div className="min-h-full bg-[#f0f4ff] p-4 sm:p-6 lg:p-8">
            <header className="mb-6 sm:mb-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                    Tableau de bord
                </h1>
                <p className="mt-2 text-base sm:text-lg text-slate-500">
                    {loading
                        ? 'Chargement des statistiques...'
                        : "Vue d'ensemble de la plateforme"}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-400">
                    Source: {dataSource === 'api' ? 'API' : dataSource === 'mixed' ? 'API + demo' : 'Demo'}
                </p>
                {warning && (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        {warning}
                    </div>
                )}
            </header>

            <section className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
                {statsCardsMeta.map((card) => {
                    const Icon = card.icon
                    return (
                        <article
                            key={card.id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div
                                className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-white ${card.iconWrapClass}`}
                            >
                                <Icon size={26} />
                            </div>
                            <p className="text-4xl font-extrabold text-slate-900">
                                {stats[card.valueKey] ?? 0}
                            </p>
                            <p className="mt-1 text-lg text-slate-500">{card.label}</p>
                        </article>
                    )
                })}
            </section>

            <section className="mt-6 sm:mt-8 grid gap-6 xl:grid-cols-2">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-3">
                        <TrendingUp className="text-emerald-600" size={22} />
                        <h2 className="text-3xl font-extrabold text-slate-900">Etat du materiel</h2>
                    </div>

                    <div className="mb-5 h-48 rounded-xl border border-slate-100 bg-slate-50 p-3">
                        {totalEquipmentCount > 0 ? (
                            <Suspense
                                fallback={
                                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                                        Chargement du graphique...
                                    </div>
                                }
                            >
                                <EquipmentStatusChart data={equipmentStatus} />
                            </Suspense>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-slate-500">
                                Aucune donnee materiel a afficher.
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        {equipmentStatus.map((item) => {
                            const style = equipmentStatusStyles.find(
                                (entry) => entry.id === item.id
                            )
                            return (
                            <div
                                key={item.id}
                                className={`flex items-center justify-between rounded-xl px-4 py-3 ${style?.rowClass || 'bg-slate-100 text-slate-700'}`}
                            >
                                <span className="text-xl font-semibold">{item.label}</span>
                                <span className={`text-3xl font-black ${style?.countClass || 'text-slate-700'}`}>{item.value}</span>
                            </div>
                            )
                        })}
                    </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-3">
                        <Clock3 className="text-teal-600" size={22} />
                        <h2 className="text-3xl font-extrabold text-slate-900">
                            Reservations recentes
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {recentReservations.length > 0 ? (
                            recentReservations.map((reservation) => (
                                <div
                                    key={reservation.id}
                                    className="flex flex-col gap-2 rounded-xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900">{reservation.equipmentName}</p>
                                        <p className="text-lg text-slate-500">{reservation.studentName}</p>
                                    </div>
                                    <StatusBadge status={reservation.status} className="w-fit" />
                                </div>
                            ))
                        ) : (
                            <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                                Aucune reservation recente.
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={refresh}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                            Actualiser
                        </button>
                    </div>
                </article>
            </section>
        </div>
    )
}
