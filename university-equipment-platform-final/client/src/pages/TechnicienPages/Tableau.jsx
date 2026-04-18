import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:5000/api/maintenance/technician-dashboard';

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

export default function Tableau() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
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
                    throw new Error(result.message || 'Chargement impossible');
                }

                setDashboardData(result.data);
            } catch (fetchError) {
                setError(fetchError.message || 'Erreur serveur');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return <p>Chargement du tableau de bord technicien...</p>;
    }

    if (error) {
        return <p style={{ color: '#b42318' }}>Erreur: {error}</p>;
    }

    if (!dashboardData) return null;

    const { stats, maintenanceFocusList } = dashboardData;

    return (
        <section>
            <h2 style={{ marginBottom: '6px' }}>Tableau de bord technique</h2>
            <p style={{ color: '#475467', marginTop: 0, marginBottom: '20px' }}>
                Vue rapide des equipements en maintenance ou en etat critique.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '22px' }}>
                <article style={{ background: '#ffffff', borderRadius: '12px', padding: '14px', border: '1px solid #e4e7ec' }}>
                    <p style={{ margin: 0, color: '#475467', fontSize: '0.85rem' }}>Total equipements</p>
                    <p style={{ margin: '6px 0 0 0', fontSize: '1.5rem', fontWeight: 700 }}>{stats.total}</p>
                </article>
                <article style={{ background: '#fff7ed', borderRadius: '12px', padding: '14px', border: '1px solid #fed7aa' }}>
                    <p style={{ margin: 0, color: '#9a3412', fontSize: '0.85rem' }}>En maintenance</p>
                    <p style={{ margin: '6px 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#9a3412' }}>{stats.maintenance}</p>
                </article>
                <article style={{ background: '#fef2f2', borderRadius: '12px', padding: '14px', border: '1px solid #fecaca' }}>
                    <p style={{ margin: 0, color: '#991b1b', fontSize: '0.85rem' }}>Etat critique</p>
                    <p style={{ margin: '6px 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#991b1b' }}>{stats.brokenLike}</p>
                </article>
                <article style={{ background: '#ecfdf3', borderRadius: '12px', padding: '14px', border: '1px solid #abefc6' }}>
                    <p style={{ margin: 0, color: '#05603a', fontSize: '0.85rem' }}>Disponibles</p>
                    <p style={{ margin: '6px 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#05603a' }}>{stats.available}</p>
                </article>
            </div>

            {!maintenanceFocusList || maintenanceFocusList.length === 0 ? (
                <p>Aucun equipement en maintenance ou en etat critique pour le moment.</p>
            ) : (
                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e4e7ec', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>Equipement</th>
                                <th style={{ padding: '12px' }}>Categorie</th>
                                <th style={{ padding: '12px' }}>Etat</th>
                                <th style={{ padding: '12px' }}>Statut</th>
                                <th style={{ padding: '12px' }}>Quantite</th>
                            </tr>
                        </thead>
                        <tbody>
                            {maintenanceFocusList.map((item) => (
                                <tr key={item._id} style={{ borderTop: '1px solid #e4e7ec' }}>
                                    <td style={{ padding: '12px', fontWeight: 600 }}>{item.name}</td>
                                    <td style={{ padding: '12px' }}>{formatCategory(item.category)}</td>
                                    <td style={{ padding: '12px' }}>{item.condition}</td>
                                    <td style={{ padding: '12px' }}>{item.status}</td>
                                    <td style={{ padding: '12px' }}>{item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
