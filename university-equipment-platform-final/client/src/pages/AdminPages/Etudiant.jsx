import { useEffect, useMemo, useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import './Etudiant.css';

function getUserId(value) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value._id || value.id || '';
}

export default function Etudiant() {
    const [students, setStudents] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [penalties, setPenalties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [editingStudent, setEditingStudent] = useState(null);
    const [editFormData, setEditFormData] = useState({ username: '', email: '', password: '' });
    const [deletingStudent, setDeletingStudent] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const [usersRes, reservationsRes, penaltiesRes] = await Promise.all([
                    fetch('http://localhost:5000/api/auth/users', { headers }),
                    fetch('http://localhost:5000/api/reservations', { headers }),
                    fetch('http://localhost:5000/api/penalties', { headers })
                ]);

                const [usersData, reservationsData, penaltiesData] = await Promise.all([
                    usersRes.json(),
                    reservationsRes.json(),
                    penaltiesRes.json()
                ]);

                if (!usersData.success) {
                    throw new Error(usersData.message || 'Impossible de charger les étudiants');
                }

                if (!reservationsData.success) {
                    throw new Error(reservationsData.message || 'Impossible de charger les réservations');
                }

                if (!penaltiesData.success) {
                    throw new Error(penaltiesData.message || 'Impossible de charger les pénalités');
                }

                const studentUsers = (usersData.data || []).filter((item) => item.role === 'Student');
                setStudents(studentUsers);
                setReservations(reservationsData.data || []);
                setPenalties(penaltiesData.data || []);
            } catch (fetchError) {
                setError(fetchError.message || 'Erreur de chargement');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const reservationCountByStudent = useMemo(() => {
        const counts = {};
        reservations.forEach((item) => {
            const userId = getUserId(item.userId || item.studentId);
            if (!userId) return;
            counts[userId] = (counts[userId] || 0) + 1;
        });
        return counts;
    }, [reservations]);

    const penaltyCountByStudent = useMemo(() => {
        const counts = {};
        penalties.forEach((item) => {
            const userId = getUserId(item.userId);
            if (!userId) return;
            counts[userId] = (counts[userId] || 0) + 1;
        });
        return counts;
    }, [penalties]);

    const filteredStudents = useMemo(() => {
        const term = search.toLowerCase().trim();
        if (!term) return students;
        return students.filter((item) => {
            const username = (item.username || '').toLowerCase();
            const email = (item.email || '').toLowerCase();
            const id = (item._id || '').toLowerCase();
            return username.includes(term) || email.includes(term) || id.includes(term);
        });
    }, [students, search]);

    const selectedStudentPenalties = useMemo(() => {
        if (!selectedStudent) return [];
        return penalties.filter((item) => getUserId(item.userId) === selectedStudent._id);
    }, [penalties, selectedStudent]);

    const handleMarkPenaltyPaid = async (penaltyId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/penalties/${penaltyId}/mark-paid`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Mise à jour impossible');
            }

            setPenalties((prev) => prev.map((item) => (
                item._id === penaltyId ? { ...item, status: 'paid', markedPaidAt: new Date().toISOString() } : item
            )));
        } catch (updateError) {
            setError(updateError.message || 'Erreur de mise à jour');
        }
    };

    const handleEditStudent = (student) => {
        setEditingStudent(student);
        setEditFormData({
            username: student.username || '',
            email: student.email || '',
            password: ''
        });
        setActionError('');
    };

    const handleSaveEdit = async () => {
        try {
            setActionLoading(true);
            setActionError('');

            // Validation
            if (!editFormData.username.trim()) {
                setActionError('Le nom d\'utilisateur est requis.');
                setActionLoading(false);
                return;
            }
            if (!editFormData.email.trim()) {
                setActionError('L\'email est requis.');
                setActionLoading(false);
                return;
            }

            const token = localStorage.getItem('token');
            const updateData = {
                username: editFormData.username.trim(),
                email: editFormData.email.trim()
            };
            if (editFormData.password.trim()) {
                updateData.password = editFormData.password.trim();
            }

            const response = await fetch(`http://localhost:5000/api/auth/users/${editingStudent._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Échec de la mise à jour');
            }

            // Mettre à jour la liste des étudiants
            setStudents((prev) =>
                prev.map((item) =>
                    item._id === editingStudent._id ? { ...item, ...result.user } : item
                )
            );

            setEditingStudent(null);
            setEditFormData({ username: '', email: '', password: '' });
        } catch (err) {
            setActionError(err.message || 'Erreur lors de la mise à jour.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteStudent = async () => {
        try {
            setActionLoading(true);
            setActionError('');

            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/auth/users/${deletingStudent._id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Échec de la suppression');
            }

            // Retirer l'étudiant de la liste
            setStudents((prev) => prev.filter((item) => item._id !== deletingStudent._id));
            setDeletingStudent(null);
        } catch (err) {
            setActionError(err.message || 'Erreur lors de la suppression.');
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (value) => {
        if (!value) return 'N/A';
        return new Date(value).toLocaleDateString('fr-FR');
    };

    return (
        <div className="etudiant-container">
            <div className="etudiant-header">
                <div>
                    <h2 className="etudiant-title">Gestion des étudiants</h2>
                    <p className="etudiant-subtitle">{students.length} étudiant(s)</p>
                </div>
            </div>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Rechercher un étudiant..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="search-input"
                />
            </div>

            {error && <p className="error-text">{error}</p>}

            {loading ? (
                <p className="loading-text">Chargement des données...</p>
            ) : (
                <div className="table-container">
                    <table className="etudiant-table">
                        <thead>
                            <tr className="table-header-row">
                                <th className="table-th">Étudiant</th>
                                <th className="table-th">Email</th>
                                <th className="table-th-center">Réservations</th>
                                <th className="table-th-center">Pénalités</th>
                                <th className="table-th-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student) => (
                                <tr key={student._id} className="table-row">
                                    <td className="table-td-bold">{student.username || '-'}</td>
                                    <td className="table-td-muted">{student.email || '-'}</td>
                                    <td className="table-td-center">{reservationCountByStudent[student._id] || 0}</td>
                                    <td className="table-td-center">{penaltyCountByStudent[student._id] || 0}</td>
                                    <td className="table-td-center">
                                        <div className="action-buttons-group">
                                            <button
                                                type="button"
                                                className="action-btn-icon action-btn-view"
                                                title="Voir pénalités"
                                                onClick={() => setSelectedStudent(student)}
                                            >
                                                📑
                                            </button>
                                            <button
                                                type="button"
                                                className="action-btn-icon action-btn-edit"
                                                title="Modifier"
                                                onClick={() => handleEditStudent(student)}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                className="action-btn-icon action-btn-delete"
                                                title="Supprimer"
                                                onClick={() => setDeletingStudent(student)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td className="table-td-center" colSpan={5}>Aucun étudiant trouvé.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedStudent && (
                <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
                    <div className="modal-content-lg" onClick={(event) => event.stopPropagation()}>
                        <h3 className="modal-title">Pénalités de {selectedStudent.username}</h3>
                        {selectedStudentPenalties.length === 0 ? (
                            <p className="loading-text">Aucune pénalité pour cet étudiant.</p>
                        ) : (
                            <div className="penalty-list">
                                {selectedStudentPenalties.map((item) => (
                                    <div key={item._id} className="penalty-item">
                                        <div className="penalty-item-row">
                                            <div>
                                                <p className="penalty-label">Montant</p>
                                                <p className="penalty-value">{item.penaltyAmount} DT</p>
                                            </div>
                                            <StatusBadge status={item.status} />
                                        </div>
                                        <p className="penalty-meta">Créée le {formatDate(item.createdAt)}</p>
                                        {item.status === 'unpaid' && (
                                            <button
                                                type="button"
                                                className="action-btn action-btn-pay"
                                                onClick={() => handleMarkPenaltyPaid(item._id)}
                                            >
                                                Marquer payée
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={() => setSelectedStudent(null)}>
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editingStudent && (
                <div className="modal-overlay" onClick={() => !actionLoading && setEditingStudent(null)}>
                    <div className="modal-content" onClick={(event) => event.stopPropagation()}>
                        <h3 className="modal-title">Modifier l'étudiant: {editingStudent.username}</h3>
                        
                        {actionError && (
                            <div className="error-message">
                                {actionError}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="edit-username" className="form-label">Nom d'utilisateur</label>
                            <input
                                id="edit-username"
                                type="text"
                                className="form-input"
                                value={editFormData.username}
                                onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                                disabled={actionLoading}
                                placeholder="Entrez le nom d'utilisateur"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="edit-email" className="form-label">Email</label>
                            <input
                                id="edit-email"
                                type="email"
                                className="form-input"
                                value={editFormData.email}
                                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                disabled={actionLoading}
                                placeholder="Entrez l'email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="edit-password" className="form-label">Mot de passe (laisser vide pour ne pas modifier)</label>
                            <input
                                id="edit-password"
                                type="password"
                                className="form-input"
                                value={editFormData.password}
                                onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                                disabled={actionLoading}
                                placeholder="Entrez le nouveau mot de passe"
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() => {
                                    setEditingStudent(null);
                                    setEditFormData({ username: '', email: '', password: '' });
                                    setActionError('');
                                }}
                                disabled={actionLoading}
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                className="btn-save"
                                onClick={handleSaveEdit}
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deletingStudent && (
                <div className="modal-overlay" onClick={() => !actionLoading && setDeletingStudent(null)}>
                    <div className="modal-content-sm" onClick={(event) => event.stopPropagation()}>
                        <h3 className="modal-title modal-title-warning">Confirmation de suppression</h3>
                        
                        <p className="delete-warning">
                            Êtes-vous sûr de vouloir supprimer l'étudiant <strong>{deletingStudent.username}</strong> ({deletingStudent.email})?
                        </p>
                        <p className="delete-warning-sub">
                            Cette action est irréversible et supprimera toutes les données associées à ce compte.
                        </p>

                        {actionError && (
                            <div className="error-message">
                                {actionError}
                            </div>
                        )}

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() => {
                                    setDeletingStudent(null);
                                    setActionError('');
                                }}
                                disabled={actionLoading}
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                className="btn-delete"
                                onClick={handleDeleteStudent}
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Suppression...' : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
