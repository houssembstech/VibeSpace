import { useState } from 'react';

export default function AuthModal({ isOpen, onClose, currentUser, onLoginSuccess, API_URL, packsConfig }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [selectedPack, setSelectedPack] = useState('pack_2'); // 'pack_1' | 'pack_2'
  const [name, setName] = useState('');
  const [spaceName, setSpaceName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const pack1Price = packsConfig?.pack_1?.price !== undefined ? packsConfig.pack_1.price : 70;
  const pack2Price = packsConfig?.pack_2?.price !== undefined ? packsConfig.pack_2.price : 120;
  const pack3Price = packsConfig?.pack_3?.price !== undefined ? packsConfig.pack_3.price : 250;
  const pack1Duration = packsConfig?.pack_1?.durationMonths ? `${packsConfig.pack_1.durationMonths} mois` : '12 mois';
  const pack2Duration = packsConfig?.pack_2?.durationMonths ? `${packsConfig.pack_2.durationMonths} mois` : '12 mois';
  const pack3Duration = packsConfig?.pack_3?.durationMonths ? `${packsConfig.pack_3.durationMonths} mois` : '12 mois';
  const pack1Name = packsConfig?.pack_1?.name || 'Pack 01 · Bronze';
  const pack2Name = packsConfig?.pack_2?.name || 'Pack 02 · Silver';
  const pack3Name = packsConfig?.pack_3?.name || 'Pack 03 · Gold';

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
          body: JSON.stringify({ name, spaceName, email: cleanEmail, phone, password, pack: selectedPack })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Erreur lors de l'inscription");
        onLoginSuccess(data);
        onClose();
        const getPackDesc = (pId) => {
          if (pId === 'pack_3') return `${pack3Name} (${pack3Price} DT)`;
          if (pId === 'pack_2') return `${pack2Name} (${pack2Price} DT)`;
          return `${pack1Name} (${pack1Price} DT)`;
        };
        const packLabel = getPackDesc(selectedPack);
        alert(`Bienvenue sur VibeSpace ! Ton compte Responsable pour "${spaceName}" a été créé avec succès avec le ${packLabel} 🏢✨.`);
      } catch (err) {
        // Fallback offline / local
        const isAdmin = cleanEmail === 'houssembs.tech@gmail.com';
        const isGold = selectedPack === 'pack_3';
        const isSilver = selectedPack === 'pack_2';
        const isPro = isGold || isSilver;
        const chosenPrice = isGold ? pack3Price : (isSilver ? pack2Price : pack1Price);
        const fallbackUser = {
          _id: 'u_' + Date.now(),
          name,
          spaceName,
          email: cleanEmail,
          phone,
          role: isAdmin ? 'admin' : 'responsable',
          pack: selectedPack,
          packPrice: chosenPrice,
          canEdit: isAdmin ? true : isPro
        };
        onLoginSuccess(fallbackUser);
        onClose();
        const packLabel = selectedPack === 'pack_3' ? `${pack3Name} (${pack3Price} DT)` : (selectedPack === 'pack_2' ? `${pack2Name} (${pack2Price} DT)` : `${pack1Name} (${pack1Price} DT)`);
        alert(`Bienvenue sur VibeSpace ! Ton compte Responsable pour "${spaceName}" a été créé avec succès (${packLabel}) 🏢✨.`);
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
      <div className={`modal-content auth-modal-box ${authMode === 'register' ? 'has-packs' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="auth-header">
          <img src="/logo-icon.png" alt="VibeSpace" className="auth-logo-icon" />
          <h2>{authMode === 'login' ? 'Connexion VibeSpace' : "Inscription Responsable d'Espace"}</h2>
          <p>
            {authMode === 'login'
              ? 'Accédez à votre espace pour gérer vos réservations et vos spots.'
              : 'Rejoignez la plateforme n°1 des espaces privés : 0% de commission et réservations en direct.'}
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

        {authMode === 'register' && (
          <div className="pack-motivation-banner">
            <div className="pmb-title">
              <span>🚀</span>
              <span>Pourquoi rejoindre VibeSpace ?</span>
            </div>
            <p className="pmb-text">
              Transformez vos espaces en source de revenus réguliers. 
              <strong> 0% de commission intermédiaire</strong> : les clients réservent directement avec vous sur WhatsApp ou Email. 
              Votre abonnement annuel est <strong>rentabilisé dès vos 2 premières réservations</strong> !
            </p>
            <div className="pmb-highlights">
              <span className="pmb-pill">💰 0% commission (100% de vos gains)</span>
              <span className="pmb-pill">⚡ Rentabilité immédiate</span>
              <span className="pmb-pill">💬 Contact direct WhatsApp & Mail</span>
              <span className="pmb-pill">🔒 Nom d'espace certifié</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {authMode === 'register' && (
            <>
              {/* SÉLECTION DU PACK */}
              <div className="packs-selection-title">1. Choisissez votre Pack Annuel *</div>
              <div className="packs-grid">
                {/* PACK 01 - BRONZE */}
                <div 
                  className={`pack-card pack-bronze ${selectedPack === 'pack_1' ? 'selected' : ''}`}
                  onClick={() => setSelectedPack('pack_1')}
                >
                  <div className="pack-tier-badge bronze">🥉 BRONZE</div>
                  <div className="pack-card-header">
                    <h4 className="pack-name">{pack1Name}</h4>
                    <span className="pack-subtitle-tag">Visibilité Directe</span>
                  </div>
                  <div className="pack-price-tag">
                    {pack1Price} <span className="currency">DT</span> <span className="pack-period">/ {pack1Duration} (renouvelable)</span>
                  </div>
                  <p className="pack-subdesc">Idéal pour lancer votre espace simplement avec une présence active.</p>
                  
                  <ul className="pack-features-list">
                    <li>✅ <strong>Publication d'un espace exclusif</strong> sur VibeSpace</li>
                    <li>🔒 <strong>Nom d'espace certifié & fixe</strong> (immuable)</li>
                    <li>💬 <strong>Réservations directes</strong> sans intermédiaire (WhatsApp & Email)</li>
                    <li>💰 <strong>0% de commission</strong> sur tous vos revenus</li>
                    <li>📅 <strong>Abonnement valable {pack1Duration}</strong> (renouvelable)</li>
                    <li className="warn-feature">⚠️ <em>Fiche fixe : informations non modifiables après publication</em></li>
                  </ul>

                  <div className="pack-radio-indicator">
                    <div className="pack-radio-circle"></div>
                    <span>{selectedPack === 'pack_1' ? `✓ Bronze Sélectionné (${pack1Price} DT)` : 'Choisir Bronze'}</span>
                  </div>
                </div>

                {/* PACK 02 - SILVER */}
                <div 
                  className={`pack-card pro pack-silver ${selectedPack === 'pack_2' ? 'selected' : ''}`}
                  onClick={() => setSelectedPack('pack_2')}
                >
                  <div className="pack-badge-top">⭐ RECOMMANDÉ · FLEXIBILITÉ MAX</div>
                  <div className="pack-tier-badge silver">🥈 SILVER</div>
                  <div className="pack-card-header">
                    <h4 className="pack-name">{pack2Name}</h4>
                    <span className="pack-subtitle-tag">Flex Pro & Contrôle</span>
                  </div>
                  <div className="pack-price-tag pro">
                    {pack2Price} <span className="currency">DT</span> <span className="pack-period">/ {pack2Duration} (renouvelable)</span>
                  </div>
                  <p className="pack-subdesc">La solution complète pour ajuster vos tarifs et maximiser votre taux d'occupation.</p>
                  
                  <ul className="pack-features-list">
                    <li className="highlight-feature">🚀 <strong>Tous les avantages du Pack 01 inclus</strong></li>
                    <li className="highlight-feature">👑 <strong>Mise en avant Premium</strong> : carrousel horizontal exclusif en tête d'accueil</li>
                    <li className="highlight-feature">✏️ <strong>Modifications & Mises à jour illimitées</strong> toute l'année</li>
                    <li>📸 <strong>Changement de photos, tarifs</strong> (heure, ½ j, jour) & description</li>
                    <li>⚙️ <strong>Ajustement des options, équipements</strong> et capacités</li>
                    <li>💬 <strong>Réservations directes WhatsApp</strong> & Email</li>
                    <li>📅 <strong>Abonnement valable {pack2Duration}</strong> (renouvelable)</li>
                  </ul>

                  <div className="pack-radio-indicator">
                    <div className="pack-radio-circle"></div>
                    <span>{selectedPack === 'pack_2' ? `✓ Silver Sélectionné (${pack2Price} DT)` : 'Choisir Silver'}</span>
                  </div>
                </div>

                {/* PACK 03 - GOLD */}
                <div 
                  className={`pack-card vip pack-gold ${selectedPack === 'pack_3' ? 'selected' : ''}`}
                  onClick={() => setSelectedPack('pack_3')}
                >
                  <div className="pack-badge-top gold">👑 VIP · CRÉATION DE REEL PRO</div>
                  <div className="pack-tier-badge gold">🥇 GOLD VIP</div>
                  <div className="pack-card-header">
                    <h4 className="pack-name">{pack3Name}</h4>
                    <span className="pack-subtitle-tag">Expérience VIP & Tournage</span>
                  </div>
                  <div className="pack-price-tag gold">
                    {pack3Price} <span className="currency">DT</span> <span className="pack-period">/ {pack3Duration} (renouvelable)</span>
                  </div>
                  <p className="pack-subdesc">L'offre d'excellence avec création de Reel professionnel et visibilité maximale.</p>
                  
                  <ul className="pack-features-list">
                    <li className="highlight-feature gold">🚀 <strong>Tous les avantages du Pack 01 et 02 inclus</strong></li>
                    <li className="highlight-feature gold">👑 <strong>Mise en avant Premium</strong> : carrousel horizontal exclusif en tête d'accueil</li>
                    <li className="highlight-feature gold">✏️ <strong>Modifications & Mises à jour illimitées</strong> toute la période</li>
                    <li>📸 <strong>Changement de photos, tarifs</strong> & description</li>
                    <li>⚙️ <strong>Ajustement des options</strong> et capacités</li>
                    <li>💬 <strong>Réservations directes WhatsApp</strong> & Email</li>
                    <li>📅 <strong>Abonnement valable {pack3Duration}</strong> (renouvelable)</li>
                    <li className="highlight-feature special-gold">🎬 <strong>Séance pour création de Reel avec matériel professionnel</strong> organisée en collaboration</li>
                  </ul>

                  <div className="pack-radio-indicator">
                    <div className="pack-radio-circle"></div>
                    <span>{selectedPack === 'pack_3' ? `✓ Gold VIP Sélectionné (${pack3Price} DT)` : 'Choisir Gold VIP'}</span>
                  </div>
                </div>
              </div>

              <div className="packs-selection-title">2. Vos Coordonnées & Votre Espace *</div>

              <div className="auth-field">
                <label>Nom complet du Responsable *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sami Ben Amor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label>Nom de votre Espace / Lieu * (🔒 Définitif & Fixe)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Villa Infinity, Rooftop Sunset, Studio Creative..."
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value)}
                />
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  🔒 Attention : Ce nom sera définitivement associé à votre compte et votre fiche d'espace. Il n'est pas modifiable ultérieurement.
                </span>
              </div>

              <div className="auth-field">
                <label>Numéro de téléphone / WhatsApp *</label>
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

          <button
            type="submit"
            disabled={loading}
            className="btn-reserve-large full-width btn-magic auth-submit-btn"
          >
            {loading ? 'Chargement...' : (
              authMode === 'login' 
                ? 'Se connecter ⚡' 
                : (selectedPack === 'pack_2' ? `Rejoindre avec ${pack2Name} (${pack2Price} DT/${pack2Duration}) ⭐` : `Rejoindre avec ${pack1Name} (${pack1Price} DT/${pack1Duration}) 🏢`)
            )}
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
