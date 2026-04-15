import React, { useEffect, useMemo, useState } from 'react';
import {
    Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Button
} from '../../components/ui';
import { StatusBadge } from '../../components/StatusBadge';
import { Plus, Search } from 'lucide-react';
import './Penalite.css';

const PENALTIES_API = 'http://localhost:5000/api/penalties';
const USERS_API = 'http://localhost:5000/api/auth/users';

const TYPE_LABELS = {
    retard: 'Retard',
    casse: 'Casse',
    autre: 'Autre'
};

function formatDate(value) {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Penalite() {
    const [penalties, setPenalties] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [checkLoading, setCheckLoading] = useState(false);
    const [checkResult, setCheckResult] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [form, setForm] = useState({
        userId: '',
        type: 'retard',
        penaltyAmount: '',
        description: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [penaltiesRes, usersRes] = await Promise.all([
                fetch(PENALTIES_API, { headers }),
                fetch(USERS_API, { headers })
            ]);

            const [penaltiesData, usersData] = await Promise.all([
                penaltiesRes.json(),
                usersRes.json()
            ]);

            if (!penaltiesRes.ok || !penaltiesData.success) {
                throw new Error(penaltiesData.message || 'Erreur lors du chargement des pénalités');
            }

            if (!usersRes.ok || !usersData.success) {
                throw new Error(usersData.message || 'Erreur lors du chargement des étudiants');
            }

            const allUsers = usersData.data || [];
            const studentUsers = allUsers.filter((user) => user.role === 'Student');

            setPenalties(penaltiesData.data || []);
            setStudents(studentUsers);
        } catch (fetchError) {
            setError(fetchError.message || 'Impossible de contacter le serveur.');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPaid = async (id) => {
        try {
            setError('');
            const token = localStorage.getItem('token');
            const res = await fetch(`${PENALTIES_API}/${id}/mark-paid`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setPenalties((prev) =>
                    prev.map((item) => (
                        item._id === id
                            ? { ...item, status: 'paid', markedPaidAt: data.data?.markedPaidAt || new Date().toISOString() }
                            : item
                    ))
                );
            } else {
                setError(data.message || 'Erreur lors de la mise à jour');
            }
        } catch {
            setError('Erreur serveur lors de la mise à jour.');
        }
    };

    const handleCheckOverdue = async () => {
        setCheckLoading(true);
        setCheckResult(null);
        try {
            setError('');
            const token = localStorage.getItem('token');
            const res = await fetch(`${PENALTIES_API}/check-overdue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setCheckResult(data.data);
                await fetchInitialData();
            } else {
                setError(data.message || 'Erreur lors de la vérification');
            }
        } catch {
            setError('Erreur serveur lors de la vérification.');
        } finally {
            setCheckLoading(false);
        }
    };

    const resetForm = () => {
        setForm({ userId: '', type: 'retard', penaltyAmount: '', description: '' });
    };

    const handleCreatePenalty = async (event) => {
        event.preventDefault();

        const amount = Number(form.penaltyAmount);
        if (!form.userId) {
            setError('Veuillez sélectionner un étudiant.');
            return;
        }
        if (!Number.isFinite(amount) || amount <= 0) {
            setError('Le montant doit être supérieur à 0.');
            return;
        }

        try {
            setCreateLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            const response = await fetch(PENALTIES_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: form.userId,
                    type: form.type,
                    penaltyAmount: amount,
                    description: form.description.trim()
                })
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Création impossible');
            }

            setPenalties((prev) => [result.data, ...prev]);
            setShowModal(false);
            resetForm();
        } catch (createError) {
            setError(createError.message || 'Erreur serveur lors de la création');
        } finally {
            setCreateLoading(false);
        }
    };

    const filteredPenalties = useMemo(() => {
        return penalties.filter((item) => {
            const q = searchTerm.toLowerCase().trim();
            const username = (item.userId?.username || '').toLowerCase();
            const email = (item.userId?.email || '').toLowerCase();
            const matchesSearch = !q || username.includes(q) || email.includes(q);
            const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [penalties, searchTerm, filterStatus]);

    const stats = useMemo(() => {
        const total = penalties.length;
        const totalAmount = penalties.reduce((sum, item) => sum + Number(item.penaltyAmount || 0), 0);
        const studentsCount = new Set(penalties.map((item) => item.userId?._id).filter(Boolean)).size;
        return { total, totalAmount, studentsCount };
    }, [penalties]);

    return (
        <div className="penalite-container">
            <div className="penalite-header">
                <div>
                    <h1 className="penalite-title">Gestion des pénalités</h1>
                    <p className="penalite-subtitle">{stats.total} pénalité{stats.total !== 1 ? 's' : ''} enregistrée{stats.total !== 1 ? 's' : ''}</p>
                </div>
                <div className="header-actions">
                    <Button onClick={handleCheckOverdue} disabled={checkLoading} variant="outline">
                        {checkLoading ? 'Vérification...' : '⚡ Vérifier les retards'}
                    </Button>
                    <button className="add-penalty-btn" type="button" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Ajouter une pénalité
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <p className="stat-title">Total des pénalités</p>
                    <p className="stat-value">{stats.total}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-title">Montant total</p>
                    <p className="stat-value amount">{stats.totalAmount.toFixed(0)} DT</p>
                </div>
                <div className="stat-card">
                    <p className="stat-title">Étudiants concernés</p>
                    <p className="stat-value">{stats.studentsCount}</p>
                </div>
            </div>

            {checkResult && (
                <div className="check-result-banner">
                    Vérification terminée: {checkResult.created} nouvelle(s) pénalité(s), {checkResult.skipped} ignorée(s), {checkResult.checked} réservation(s) analysée(s).
                </div>
            )}

            {error && (
                <div className="error-banner">
                    <p className="error-text">{error}</p>
                </div>
            )}

            <div className="controls-container">
                <div className="search-wrapper">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher par étudiant..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="search-input"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(event) => setFilterStatus(event.target.value)}
                    className="status-filter"
                >
                    <option value="all">Tous les statuts</option>
                    <option value="unpaid">Non payées</option>
                    <option value="paid">Payées</option>
                </select>
            </div>

            {loading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Chargement...</p>
                </div>
            )}

            {!loading && filteredPenalties.length === 0 && !error && (
                <div className="empty-container">
                    <p className="empty-text">Aucune pénalité trouvée.</p>
                </div>
            )}

            {!loading && filteredPenalties.length > 0 && (
                <div className="table-wrapper">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ÉTUDIANT</TableHead>
                                <TableHead>TYPE</TableHead>
                                <TableHead>DESCRIPTION</TableHead>
                                <TableHead>MONTANT</TableHead>
                                <TableHead>DATE</TableHead>
                                <TableHead>STATUT</TableHead>
                                <TableHead className="col-action">ACTION</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPenalties.map((penalty) => (
                                <TableRow key={penalty._id}>
                                    <TableCell>
                                        <p className="student-name">{penalty.userId?.username || 'N/A'}</p>
                                        <p className="student-email">{penalty.userId?.email || ''}</p>
                                    </TableCell>
                                    <TableCell>{TYPE_LABELS[penalty.type] || 'Autre'}</TableCell>
                                    <TableCell className="description-cell">{penalty.description || `${penalty.daysLate || 0} jour(s) de retard`}</TableCell>
                                    <TableCell className="amount">{Number(penalty.penaltyAmount || 0).toFixed(0)} DT</TableCell>
                                    <TableCell className="date-text">{formatDate(penalty.createdAt)}</TableCell>
                                    <TableCell><StatusBadge status={penalty.status} /></TableCell>
                                    <TableCell className="col-action">
                                        {penalty.status === 'unpaid' ? (
                                            <button
                                                onClick={() => handleMarkPaid(penalty._id)}
                                                className="action-btn"
                                            >
                                                Marquer payée
                                            </button>
                                        ) : (
                                            <span className="paid-date">Payée le {formatDate(penalty.markedPaidAt)}</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => !createLoading && setShowModal(false)}>
                    <div className="modal-content" onClick={(event) => event.stopPropagation()}>
                        <h3>Ajouter une pénalité</h3>
                        <form onSubmit={handleCreatePenalty}>
                            <label htmlFor="studentId" className="form-label">Étudiant</label>
                            <select
                                id="studentId"
                                className="form-input"
                                value={form.userId}
                                onChange={(event) => setForm((prev) => ({ ...prev, userId: event.target.value }))}
                                required
                                disabled={createLoading}
                            >
                                <option value="">Sélectionnez un étudiant</option>
                                {students.map((student) => (
                                    <option key={student._id} value={student._id}>
                                        {student.username} ({student.email})
                                    </option>
                                ))}
                            </select>

                            <label htmlFor="penaltyType" className="form-label">Type de pénalité</label>
                            <select
                                id="penaltyType"
                                className="form-input"
                                value={form.type}
                                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                                required
                                disabled={createLoading}
                            >
                                <option value="retard">Retard</option>
                                <option value="casse">Casse</option>
                                <option value="autre">Autre</option>
                            </select>

                            <label htmlFor="penaltyAmount" className="form-label">Montant (DT)</label>
                            <input
                                id="penaltyAmount"
                                type="number"
                                min="1"
                                step="1"
                                className="form-input"
                                value={form.penaltyAmount}
                                onChange={(event) => setForm((prev) => ({ ...prev, penaltyAmount: event.target.value }))}
                                required
                                disabled={createLoading}
                            />

                            <label htmlFor="penaltyDescription" className="form-label">Description</label>
                            <textarea
                                id="penaltyDescription"
                                className="form-input"
                                rows={3}
                                placeholder="Ex: Retour du matériel avec 2 jours de retard"
                                value={form.description}
                                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                                required
                                disabled={createLoading}
                            />

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    disabled={createLoading}
                                >
                                    Annuler
                                </button>
                                <button type="submit" className="btn-save" disabled={createLoading}>
                                    {createLoading ? 'Ajout...' : 'Ajouter'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
