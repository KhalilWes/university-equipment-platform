import { useEffect, useMemo, useState } from 'react';

const API_URL = 'http://localhost:5000/api/equipment';

function requiresMaintenance(item) {
    return item.status === 'Maintenance' || item.condition === 'Poor' || item.condition === 'Under Maintenance';
}

function formatCategory(category) {
    const map = {
        computers: 'Ordinateurs',
        projectors: 'Projecteurs',
        electronics: 'Electronique',
        informatique: 'Informatique',
        other: 'Autre'
    };

    return map[category] || category;
}

export default function Maintenance() {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState('');
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        const fetchEquipment = async () => {
            setLoading(true);
            setError('');

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(API_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const result = await response.json();
                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Impossible de charger la maintenance');
                }

                setEquipment(result.data || []);
            } catch (fetchError) {
                setError(fetchError.message || 'Erreur serveur');
            } finally {
                setLoading(false);
            }
        };

        fetchEquipment();
    }, []);

    const maintenanceItems = useMemo(
        () => equipment.filter((item) => !item.isDeleted && requiresMaintenance(item)),
        [equipment]
    );

    const handleStatusUpdate = async (equipmentId, status) => {
        setUpdatingId(equipmentId);
        setError('');
        setFeedback('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/${equipmentId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Mise a jour impossible');
            }

            setEquipment((current) =>
                current.map((item) => (item._id === equipmentId ? { ...item, status } : item))
            );
            setFeedback(`Statut mis a jour: ${status}`);
        } catch (updateError) {
            setError(updateError.message || 'Erreur serveur');
        } finally {
            setUpdatingId('');
        }
    };

    return (
        <section>
            <h2 style={{ marginBottom: '6px' }}>Suivi maintenance</h2>
            <p style={{ color: '#475467', marginTop: 0, marginBottom: '20px' }}>
                Gere les equipements defectueux et bascule leur statut depuis cette page.
            </p>

            {feedback && <p style={{ color: '#05603a' }}>{feedback}</p>}
            {error && <p style={{ color: '#b42318' }}>Erreur: {error}</p>}

            {loading ? (
                <p>Chargement des equipements en maintenance...</p>
            ) : maintenanceItems.length === 0 ? (
                <p>Aucun equipement a traiter actuellement.</p>
            ) : (
                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e4e7ec', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>Nom</th>
                                <th style={{ padding: '12px' }}>Categorie</th>
                                <th style={{ padding: '12px' }}>Etat</th>
                                <th style={{ padding: '12px' }}>Statut actuel</th>
                                <th style={{ padding: '12px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {maintenanceItems.map((item) => {
                                const isBusy = updatingId === item._id;
                                const nextStatus = item.status === 'Maintenance' ? 'Available' : 'Maintenance';
                                const actionLabel = item.status === 'Maintenance' ? 'Remettre disponible' : 'Passer en maintenance';

                                return (
                                    <tr key={item._id} style={{ borderTop: '1px solid #e4e7ec' }}>
                                        <td style={{ padding: '12px', fontWeight: 600 }}>{item.name}</td>
                                        <td style={{ padding: '12px' }}>{formatCategory(item.category)}</td>
                                        <td style={{ padding: '12px' }}>{item.condition}</td>
                                        <td style={{ padding: '12px' }}>{item.status}</td>
                                        <td style={{ padding: '12px' }}>
                                            <button
                                                type="button"
                                                onClick={() => handleStatusUpdate(item._id, nextStatus)}
                                                disabled={isBusy}
                                                style={{
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    padding: '8px 10px',
                                                    cursor: isBusy ? 'not-allowed' : 'pointer',
                                                    background: nextStatus === 'Available' ? '#d1fadf' : '#fee4e2',
                                                    color: nextStatus === 'Available' ? '#05603a' : '#912018',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {isBusy ? 'Mise a jour...' : actionLabel}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
