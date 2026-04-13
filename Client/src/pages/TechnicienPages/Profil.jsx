import { useMemo } from 'react';

function safeReadUser() {
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch (_error) {
        return null;
    }
}

export default function Profil() {
    const user = useMemo(() => safeReadUser(), []);
    const token = localStorage.getItem('token');

    if (!user) {
        return (
            <section>
                <h2>Mon profil</h2>
                <p style={{ color: '#b42318' }}>
                    Impossible de charger le profil technicien. Veuillez vous reconnecter.
                </p>
            </section>
        );
    }

    const details = [
        { label: 'Nom utilisateur', value: user.username || 'Non renseigne' },
        { label: 'Email', value: user.email || 'Non renseigne' },
        { label: 'Role', value: user.role || 'Technician' },
        { label: 'Identifiant', value: user.id || user._id || 'Non renseigne' },
        { label: 'Token actif', value: token ? 'Oui' : 'Non' }
    ];

    return (
        <section>
            <h2 style={{ marginBottom: '6px' }}>Mon profil</h2>
            <p style={{ color: '#475467', marginTop: 0, marginBottom: '18px' }}>
                Informations du compte technicien connecte.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {details.map((item) => (
                    <article key={item.label} style={{ background: '#fff', border: '1px solid #e4e7ec', borderRadius: '12px', padding: '14px' }}>
                        <p style={{ margin: 0, color: '#667085', fontSize: '0.83rem' }}>{item.label}</p>
                        <p style={{ margin: '8px 0 0 0', fontWeight: 700 }}>{item.value}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
