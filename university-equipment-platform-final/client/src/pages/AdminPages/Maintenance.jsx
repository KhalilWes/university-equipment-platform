import { useEffect, useMemo, useState } from 'react';
import './Maintenance.css';

const EQUIPMENT_API = 'http://localhost:5000/api/equipment';
const MAINTENANCE_API = 'http://localhost:5000/api/maintenance';

function formatDate(value) {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString('fr-FR');
}

export default function Maintenance() {
    const [tickets, setTickets] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ equipmentId: '', quantity: 1, issue: '' });

    const fetchAll = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [ticketRes, equipmentRes] = await Promise.all([
                fetch(MAINTENANCE_API, { headers }),
                fetch(EQUIPMENT_API, { headers })
            ]);

            const [ticketData, equipmentData] = await Promise.all([
                ticketRes.json(),
                equipmentRes.json()
            ]);

            if (!ticketRes.ok || !ticketData.success) {
                throw new Error(ticketData.message || 'Impossible de charger les tickets maintenance');
            }

            if (!equipmentRes.ok || !equipmentData.success) {
                throw new Error(equipmentData.message || 'Impossible de charger les equipements');
            }

            setTickets(ticketData.data || []);
            setEquipment((equipmentData.data || []).filter((item) => !item.isDeleted));
        } catch (fetchError) {
            setError(fetchError.message || 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const openTickets = useMemo(() => tickets.filter((item) => item.status === 'open'), [tickets]);
    const completedTickets = useMemo(() => tickets.filter((item) => item.status === 'completed'), [tickets]);

    const availableMaterials = useMemo(
        () => equipment.filter((item) => Number(item.quantity || 0) > 0),
        [equipment]
    );

    const selectedEquipment = useMemo(
        () => availableMaterials.find((item) => item._id === form.equipmentId),
        [availableMaterials, form.equipmentId]
    );

    const handleReport = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        setFeedback('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${MAINTENANCE_API}/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    equipmentId: form.equipmentId,
                    quantity: Number(form.quantity),
                    issue: form.issue
                })
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Signalement impossible');
            }

            setFeedback('Panne signalee avec succes.');
            setShowModal(false);
            setForm({ equipmentId: '', quantity: 1, issue: '' });
            await fetchAll();
        } catch (reportError) {
            setError(reportError.message || 'Erreur serveur');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="admin-maintenance-page">
            <div className="maintenance-topbar">
                <div>
                    <h2 className="maintenance-title">Suivi de la maintenance</h2>
                    <p className="maintenance-subtitle">{openTickets.length} en cours · {completedTickets.length} terminee</p>
                </div>
                <button
                    type="button"
                    className="btn-report"
                    onClick={() => setShowModal(true)}
                >
                    + Signaler une panne
                </button>
            </div>

            <div className="maintenance-alert">
                En tant qu'administrateur, vous pouvez signaler une panne. La resolution des interventions est geree par les techniciens.
            </div>

            {feedback && <p className="maintenance-feedback">{feedback}</p>}
            {error && <p className="maintenance-error">Erreur: {error}</p>}

            {loading ? (
                <p className="maintenance-loading">Chargement des maintenances...</p>
            ) : (
                <>
                    <h3 className="maintenance-section-title">Maintenances en cours <span>{openTickets.length}</span></h3>
                    {openTickets.length === 0 ? (
                        <div className="maintenance-empty">Aucune maintenance en cours.</div>
                    ) : (
                        <div className="maintenance-card-grid">
                            {openTickets.map((ticket) => (
                                <article key={ticket._id} className="maintenance-card in-progress">
                                    <div className="maintenance-card-head">
                                        <h4>{ticket.equipmentId?.name || 'Materiel inconnu'}</h4>
                                        <span className="badge in-progress">En cours</span>
                                    </div>
                                    <p className="issue-text">{ticket.issue}</p>
                                    <p className="ticket-meta">Quantite: {ticket.quantity}</p>
                                    <p className="ticket-meta">Signale le {formatDate(ticket.createdAt)}</p>
                                    <p className="ticket-foot">En attente d'intervention du technicien</p>
                                </article>
                            ))}
                        </div>
                    )}

                    <h3 className="maintenance-section-title done">Maintenances terminees <span>{completedTickets.length}</span></h3>
                    {completedTickets.length === 0 ? (
                        <div className="maintenance-empty">Aucune maintenance terminee pour l'instant</div>
                    ) : (
                        <div className="maintenance-card-grid">
                            {completedTickets.map((ticket) => (
                                <article key={ticket._id} className="maintenance-card done">
                                    <div className="maintenance-card-head">
                                        <h4>{ticket.equipmentId?.name || 'Materiel inconnu'}</h4>
                                        <span className="badge done">Terminee</span>
                                    </div>
                                    <p className="issue-text">{ticket.issue}</p>
                                    <p className="ticket-meta">Quantite: {ticket.quantity}</p>
                                    <p className="ticket-meta">Terminee le {formatDate(ticket.completedAt)}</p>
                                </article>
                            ))}
                        </div>
                    )}
                </>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => !submitting && setShowModal(false)}>
                    <div className="modal-content" onClick={(event) => event.stopPropagation()}>
                        <h3>Signaler une panne</h3>
                        <form onSubmit={handleReport}>
                            <label htmlFor="equipment" className="form-label">Materiel disponible</label>
                            <select
                                id="equipment"
                                className="form-input"
                                value={form.equipmentId}
                                onChange={(event) => setForm((prev) => ({ ...prev, equipmentId: event.target.value, quantity: 1 }))}
                                required
                                disabled={submitting}
                            >
                                <option value="">Selectionnez un materiel</option>
                                {availableMaterials.map((item) => (
                                    <option key={item._id} value={item._id}>
                                        {item.name} (Disponible: {item.quantity})
                                    </option>
                                ))}
                            </select>

                            <label htmlFor="quantity" className="form-label">Quantite a envoyer en maintenance</label>
                            <input
                                id="quantity"
                                type="number"
                                min="1"
                                max={selectedEquipment ? selectedEquipment.quantity : 1}
                                className="form-input"
                                value={form.quantity}
                                onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
                                required
                                disabled={submitting || !form.equipmentId}
                            />

                            <label htmlFor="issue" className="form-label">Description de la panne</label>
                            <textarea
                                id="issue"
                                className="form-input"
                                value={form.issue}
                                onChange={(event) => setForm((prev) => ({ ...prev, issue: event.target.value }))}
                                rows={4}
                                required
                                disabled={submitting}
                            />

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowModal(false)}
                                    disabled={submitting}
                                >
                                    Annuler
                                </button>
                                <button type="submit" className="btn-save" disabled={submitting}>
                                    {submitting ? 'Envoi...' : 'Signaler'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
