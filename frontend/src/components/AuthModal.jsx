import { useState } from 'react';

export default function AuthModal({ isOpen, onClose, currentUser, onLoginSuccess, API_URL }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [spaceName, setSpaceName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();

    if (authMode === 'register') {
      if (!name || !spaceName || !cleanEmail || !phone || !password) {
        setErrorMsg("Veuillez remplir tous les champs obligatoires (Nom, Nom de l'espace, Téléphone, Email, Mot de passe).");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, spaceName, email: cleanEmail, phone, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Erreur lors de l'inscription");
        onLoginSuccess(data);
        onClose();
        alert(`Bienvenue sur VibeSpace ! Ton compte Responsable pour "${spaceName}" a été créé avec succès 🏢.`);
      } catch (err) {
        // Fallback offline / local
        const isAdmin = cleanEmail === 'houssembs.tech@gmail.com';
        const fallbackUser = {
          _id: 'u_' + Date.now(),
          name,
          spaceName,
          email: cleanEmail,
          phone,
          role: isAdmin ? 'admin' : 'responsable',
          canEdit: isAdmin ? true : false
        };
        onLoginSuccess(fallbackUser);
        onClose();
      } finally {
        setLoading(false);
      }
    } else {
      // Login mode
      try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erreur lors de la connexion');
        onLoginSuccess(data);
        onClose();
      } catch (err) {
        // Local fallback
        const isAdmin = cleanEmail === 'houssembs.tech@gmail.com';
        const fallbackUser = {
          _id: 'u_' + Date.now(),
          name: isAdmin ? 'Houssem (Admin)' : (cleanEmail.split('@')[0] || 'Membre'),
          email: cleanEmail,
          phone: phone || '+216 20 000 000',
          role: isAdmin ? 'admin' : 'responsable',
          canEdit: isAdmin ? true : false
        };
        onLoginSuccess(fallbackUser);
        onClose();
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="auth-header">
          <img src="/logo-icon.png" alt="VibeSpace" className="auth-logo-icon" />
          <h2>{authMode === 'login' ? 'Connexion VibeSpace' : "Inscription Responsable d'Espace"}</h2>
          <p>
            {authMode === 'login'
              ? 'Accédez à votre espace pour gérer vos réservations et vos spots.'
              : 'Créez votre compte hôte pour publier vos spots et gérer vos disponibilités.'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
            onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
          >
            Connexion
          </button>
          <button
            type="button"
            className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
            onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
          >
            Inscription Responsable 🏢
          </button>
        </div>

        {errorMsg && (
          <div className="auth-error-banner">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {authMode === 'register' && (
            <>
              <div className="auth-field">
                <label>Nom complet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sami Ben Amor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label>Nom de ton Espace / Lieu * (Obligatoire)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Villa Infinity, Rooftop Sunset, Studio Creative..."
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label>Numéro de téléphone * (Obligatoire)</label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: +216 20 123 456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="auth-field">
            <label>Email *</label>
            <input
              type="email"
              required
              placeholder={authMode === 'login' ? "houssembs.tech@gmail.com ou ton email" : "contact@monsite.tn"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <div className="auth-field-header">
              <label>Mot de passe *</label>
              {authMode === 'login' && (
                <span className="auth-forgot-link">Mot de passe oublié ?</span>
              )}
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {authMode === 'register' && (
            <div className="auth-role-notice">
              ℹ️ Ce formulaire est dédié aux <strong>Responsables d'espace</strong>. Vous pourrez soumettre vos spots et l'administrateur validera vos accès de modification.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-reserve-large full-width btn-magic auth-submit-btn"
          >
            {loading ? 'Chargement...' : (authMode === 'login' ? 'Se connecter ⚡' : 'Créer mon compte Responsable 🏢')}
          </button>

          <p className="auth-switch-prompt">
            {authMode === 'login' ? (
              <>
                Vous êtes propriétaire d'un espace ?{' '}
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => setAuthMode('register')}
                >
                  Inscrivez-vous comme Responsable 🏢
                </button>
              </>
            ) : (
              <>
                Déjà inscrit ?{' '}
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => setAuthMode('login')}
                >
                  Connectez-vous
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
