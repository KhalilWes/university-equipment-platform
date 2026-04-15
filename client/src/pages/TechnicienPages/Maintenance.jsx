import { useEffect, useMemo, useState } from 'react';
import './Maintenance.css';

const API_URL = 'http://localhost:5000/api/maintenance';

function formatDate(value) {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString('fr-FR');
}

export default function Maintenance() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState('');
    const [updatingId, setUpdatingId] = useState('');

    const fetchTickets = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Impossible de charger les tickets maintenance');
            }
            setTickets(result.data || []);
        } catch (fetchError) {
            setError(fetchError.message || 'Erreur serveur');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const openTickets = useMemo(() => tickets.filter((item) => item.status === 'open'), [tickets]);
    const completedTickets = useMemo(() => tickets.filter((item) => item.status === 'completed'), [tickets]);

    const handleComplete = async (ticketId) => {
        setUpdatingId(ticketId);
        setError('');
        setFeedback('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/${ticketId}/complete`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Finalisation impossible');
            }

            setTickets((current) =>
                current.map((item) => (item._id === ticketId ? result.data : item))
            );
            setFeedback('Maintenance marquee terminee. Les stocks sont fusionnes automatiquement.');
        } catch (completeError) {
            setError(completeError.message || 'Erreur serveur');
        } finally {
            setUpdatingId('');
        }
    };

    return (
        <section className="tech-maintenance-page">
            <h2 className="tech-title">Interventions maintenance</h2>
            <p className="tech-subtitle">{openTickets.length} ticket(s) a traiter</p>

            {feedback && <p className="tech-feedback">{feedback}</p>}
            {error && <p className="tech-error">Erreur: {error}</p>}

            {loading ? (
                <p className="tech-loading">Chargement...</p>
            ) : (
                <>
                    <h3 className="tech-section-title">En cours</h3>
                    {openTickets.length === 0 ? (
                        <div className="tech-empty">Aucun ticket en attente.</div>
                    ) : (
                        <div className="tech-table-wrap">
                            <table className="tech-table">
                                <thead>
                                    <tr>
                                        <th>Materiel</th>
                                        <th>Panne</th>
                                        <th>Quantite</th>
                                        <th>Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {openTickets.map((ticket) => {
                                        const isBusy = updatingId === ticket._id;
                                        return (
                                            <tr key={ticket._id}>
                                                <td>{ticket.equipmentId?.name || 'Materiel inconnu'}</td>
                                                <td>{ticket.issue}</td>
                                                <td>{ticket.quantity}</td>
                                                <td>{formatDate(ticket.createdAt)}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn-fix"
                                                        onClick={() => handleComplete(ticket._id)}
                                                        disabled={isBusy}
                                                    >
                                                        {isBusy ? 'Traitement...' : 'Marquer corrige'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <h3 className="tech-section-title">Historique</h3>
                    {completedTickets.length === 0 ? (
                        <div className="tech-empty">Aucune maintenance terminee.</div>
                    ) : (
                        <ul className="tech-history-list">
                            {completedTickets.map((ticket) => (
                                <li key={ticket._id}>
                                    {ticket.equipmentId?.name || 'Materiel inconnu'} · Qty {ticket.quantity} · termine le {formatDate(ticket.completedAt)}
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </section>
    );
}
