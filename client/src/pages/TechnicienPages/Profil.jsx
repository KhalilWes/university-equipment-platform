import { useEffect, useMemo, useState } from 'react';
import { Briefcase, Mail, PenLine, User, UserRound } from 'lucide-react';
import './Profil.css';

const PROFILE_API = 'http://localhost:5000/api/auth/me';

function roleLabel(role) {
    if (role === 'Admin') return 'Administrateur';
    if (role === 'Student') return 'Etudiant';
    return 'Technicien';
}

function getDisplayName(profile) {
    const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    return fullName || profile.username || 'Technicien';
}

function buildNameDefaults(profile) {
    const username = (profile?.username || '').trim();
    const firstName = (profile?.firstName || '').trim();
    const lastName = (profile?.lastName || '').trim();

    if (firstName || lastName) {
        return { firstName, lastName };
    }

    if (!username) {
        return { firstName: '', lastName: '' };
    }

    const parts = username.split(/\s+/).filter(Boolean);
    if (parts.length > 1) {
        return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
    }

    return { firstName: username, lastName: username };
}

export default function Profil() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        specialization: '',
        username: '',
        password: ''
    });

    const loadProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(PROFILE_API, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Impossible de charger le profil technicien.');
            }

            const user = result.user;
            const defaults = buildNameDefaults(user);
            setProfile(user);
            setForm({
                firstName: defaults.firstName,
                lastName: defaults.lastName,
                email: user.email || '',
                specialization: user.specialization || 'Informatique et Électronique',
                username: user.username || '',
                password: ''
            });
        } catch (fetchError) {
            setError(fetchError.message || 'Erreur de chargement du profil.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const profileName = useMemo(() => {
        if (!profile) return 'Technicien';
        return getDisplayName(profile);
    }, [profile]);

    const displayNames = useMemo(() => {
        if (!profile) {
            return { firstName: '-', lastName: '-' };
        }
        const defaults = buildNameDefaults(profile);
        return {
            firstName: defaults.firstName || '-',
            lastName: defaults.lastName || '-'
        };
    }, [profile]);

    const cancelEdit = () => {
        if (!profile) return;
        const defaults = buildNameDefaults(profile);
        setForm({
            firstName: defaults.firstName,
            lastName: defaults.lastName,
            email: profile.email || '',
            specialization: profile.specialization || 'Informatique et Électronique',
            username: profile.username || '',
            password: ''
        });
        setEditing(false);
        setError('');
    };

    const handleSave = async () => {
        if (!form.email.trim()) {
            setError('Email requis.');
            return;
        }
        if (!form.username.trim()) {
            setError('Nom utilisateur requis.');
            return;
        }

        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const token = localStorage.getItem('token');
            const payload = {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim(),
                specialization: form.specialization.trim(),
                username: form.username.trim()
            };
            if (form.password.trim()) {
                payload.password = form.password.trim();
            }

            const response = await fetch(PROFILE_API, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Mise a jour impossible.');
            }

            const updatedUser = result.user;
            setProfile(updatedUser);
            setForm((prev) => ({ ...prev, password: '' }));
            setEditing(false);
            setSuccess('Profil mis a jour avec succes.');

            const previousUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...previousUser, ...updatedUser }));
            window.dispatchEvent(new Event('user-updated'));
        } catch (saveError) {
            setError(saveError.message || 'Erreur serveur lors de la mise a jour.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <section className="tech-profile-page">
                <h2 className="tech-profile-title">Mon Profil</h2>
                <p className="tech-profile-subtitle">Chargement...</p>
            </section>
        );
    }

    if (!profile) {
        return (
            <section className="tech-profile-page">
                <h2 className="tech-profile-title">Mon Profil</h2>
                <p className="tech-profile-error">Impossible de charger le profil technicien. Veuillez vous reconnecter.</p>
            </section>
        );
    }

    return (
        <section className="tech-profile-page">
            <h2 className="tech-profile-title">Mon Profil</h2>
            <p className="tech-profile-subtitle">Gerez vos informations personnelles</p>

            {success && <p className="tech-profile-success">{success}</p>}
            {error && <p className="tech-profile-error">{error}</p>}

            <article className="tech-profile-card">
                <header className="tech-profile-header">
                    <div className="tech-profile-head-left">
                        <span className="tech-avatar">
                            <UserRound size={34} />
                        </span>
                        <div>
                            <h3>{profileName}</h3>
                            <p>{roleLabel(profile.role)}</p>
                        </div>
                    </div>

                    {!editing ? (
                        <button type="button" className="tech-btn-edit" onClick={() => setEditing(true)}>
                            <PenLine size={16} /> Modifier
                        </button>
                    ) : (
                        <div className="tech-edit-actions">
                            <button type="button" className="tech-btn-cancel" onClick={cancelEdit} disabled={saving}>
                                Annuler
                            </button>
                            <button type="button" className="tech-btn-save" onClick={handleSave} disabled={saving}>
                                {saving ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    )}
                </header>

                <div className="tech-profile-grid">
                    <div className="tech-field-group">
                        <label>Prenom</label>
                        <div className="tech-field-box">
                            <User size={16} />
                            {editing ? (
                                <input
                                    className="tech-field-input"
                                    value={form.firstName}
                                    onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                                    placeholder="Prenom"
                                    disabled={saving}
                                />
                            ) : (
                                <span>{displayNames.firstName}</span>
                            )}
                        </div>
                    </div>

                    <div className="tech-field-group">
                        <label>Nom</label>
                        <div className="tech-field-box">
                            <User size={16} />
                            {editing ? (
                                <input
                                    className="tech-field-input"
                                    value={form.lastName}
                                    onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                                    placeholder="Nom"
                                    disabled={saving}
                                />
                            ) : (
                                <span>{displayNames.lastName}</span>
                            )}
                        </div>
                    </div>

                    <div className="tech-field-group">
                        <label>Email</label>
                        <div className="tech-field-box">
                            <Mail size={16} />
                            {editing ? (
                                <input
                                    type="email"
                                    className="tech-field-input"
                                    value={form.email}
                                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                                    placeholder="Email"
                                    disabled={saving}
                                />
                            ) : (
                                <span>{profile.email || '-'}</span>
                            )}
                        </div>
                    </div>

                    <div className="tech-field-group">
                        <label>Specialisation</label>
                        <div className="tech-field-box">
                            <Briefcase size={16} />
                            {editing ? (
                                <input
                                    className="tech-field-input"
                                    value={form.specialization}
                                    onChange={(event) => setForm((prev) => ({ ...prev, specialization: event.target.value }))}
                                    placeholder="Specialisation"
                                    disabled={saving}
                                />
                            ) : (
                                <span>{profile.specialization || 'Informatique et Électronique'}</span>
                            )}
                        </div>
                    </div>

                    {editing && (
                        <>
                            <div className="tech-field-group">
                                <label>Nom utilisateur</label>
                                <div className="tech-field-box">
                                    <UserRound size={16} />
                                    <input
                                        className="tech-field-input"
                                        value={form.username}
                                        onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                                        placeholder="Nom utilisateur"
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            <div className="tech-field-group">
                                <label>Nouveau mot de passe (optionnel)</label>
                                <div className="tech-field-box">
                                    <PenLine size={16} />
                                    <input
                                        type="password"
                                        className="tech-field-input"
                                        value={form.password}
                                        onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                                        placeholder="Laisser vide pour ne pas changer"
                                        disabled={saving}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </article>

            <article className="tech-role-info">
                <div className="tech-role-icon">
                    <Briefcase size={20} />
                </div>
                <div>
                    <h4>Role : {roleLabel(profile.role)}</h4>
                    <p>
                        En tant que technicien, vous avez acces a la gestion de la maintenance du materiel universitaire.
                        Vous pouvez suivre les interventions et marquer les reparations comme terminees.
                    </p>
                </div>
            </article>
        </section>
    );
}
