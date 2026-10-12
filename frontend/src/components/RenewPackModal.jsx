import React, { useState } from 'react';

export default function RenewPackModal({
  isOpen,
  onClose,
  currentUser,
  onSuccessRenewRequest,
  API_URL
}) {
  const currentPending = currentUser?.renewalRequest?.status === 'pending';
  const initialPack = currentUser?.renewalRequest?.requestedPack || currentUser?.pack || 'pack_1';
  
  const [selectedPack, setSelectedPack] = useState(initialPack);
  const [paymentMethod, setPaymentMethod] = useState('Virement / Espèces');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !currentUser) return null;

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_URL}/api/auth/request-renewal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          pack: selectedPack,
          paymentMethod,
          note
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de l\'envoi de la demande');
      }

      setSuccessMsg(data.message || 'Votre demande de renouvellement a été envoyée à l\'administrateur !');
      if (onSuccessRenewRequest && data.user) {
        onSuccessRenewRequest(data.user);
      }
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedPrice = selectedPack === 'pack_2' ? 120 : 70;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal-box renew-pack-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="auth-header">
          <div className="auth-logo-badge">📩</div>
          <h2>Demande de Renouvellement Annuel</h2>
          <p>
            Espace : <strong>{currentUser.spaceName || currentUser.name}</strong> ({currentUser.email})
          </p>
        </div>

        {errorMsg && <div className="auth-error-banner">⚠️ {errorMsg}</div>}
        {successMsg && <div className="auth-success-banner">🎉 {successMsg}</div>}

        {currentPending && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1.5px solid #f59e0b',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            margin: '0.8rem 0',
            fontSize: '0.85rem',
            color: '#fef3c7'
          }}>
            ⏳ <strong>Demande en cours d'examen :</strong> Vous avez déjà envoyé une demande pour le{' '}
            <strong>{currentUser.renewalRequest.requestedPack === 'pack_2' ? 'Pack Pro (120 DT)' : 'Pack 01 (70 DT)'}</strong>. 
            L'administrateur vérifie le règlement. Vous pouvez ajuster votre choix ci-dessous si nécessaire.
          </div>
        )}

        <div className="pack-motivation-banner" style={{ marginTop: '0.5rem' }}>
          <div className="motivation-icon">🛡️</div>
          <div className="motivation-text">
            <strong>Validation administrative requise après paiement</strong>
            <p>
              Pour garantir la conformité, le renouvellement est activé dès que l'administrateur 
              valide la réception de votre règlement (<strong>70 DT</strong> pour Pack 01 ou <strong>120 DT</strong> pour Pack Pro).
            </p>
          </div>
        </div>

        <form onSubmit={handleSendRequest}>
          <div className="packs-selection-grid" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            {/* PACK 01 */}
            <div 
              className={`pack-card ${selectedPack === 'pack_1' ? 'selected' : ''}`}
              onClick={() => setSelectedPack('pack_1')}
            >
              <div className="pack-card-header">
                <h4 className="pack-name">Pack 01 · Visibilité Directe</h4>
              </div>
              <div className="pack-price-tag">
                70 <span className="currency">DT</span> <span className="pack-period">/ an</span>
              </div>
              <p className="pack-subdesc">L'essentiel pour être visible et recevoir les réservations sans commission.</p>
              
              <ul className="pack-features-list">
                <li>✅ <strong>Publication de votre espace</strong> sur VibeSpace</li>
                <li>💬 <strong>Réservations directes</strong> par WhatsApp & Email</li>
                <li>💰 <strong>0% de commission</strong> sur tous vos gains</li>
                <li>🔒 Fiche fixe certifiée</li>
                <li>📅 <strong>Valable 1 an renouvelable</strong></li>
              </ul>

              <div className="pack-radio-indicator">
                <div className="pack-radio-circle"></div>
                <span>{selectedPack === 'pack_1' ? '✓ Pack 01 Sélectionné' : 'Choisir Pack 01'}</span>
              </div>
            </div>

            {/* PACK 02 */}
            <div 
              className={`pack-card pro ${selectedPack === 'pack_2' ? 'selected' : ''}`}
              onClick={() => setSelectedPack('pack_2')}
            >
              <div className="pack-badge-top">⭐ RECOMMANDÉ · FLEXIBILITÉ MAX</div>
              <div className="pack-card-header">
                <h4 className="pack-name">Pack 02 · Flex Pro & Contrôle</h4>
              </div>
              <div className="pack-price-tag pro">
                120 <span className="currency">DT</span> <span className="pack-period">/ an</span>
              </div>
              <p className="pack-subdesc">Modifications illimitées de vos tarifs, photos et équipements toute l'année.</p>
              
              <ul className="pack-features-list">
                <li className="highlight-feature">🚀 <strong>Tous les avantages du Pack 01 inclus</strong></li>
                <li className="highlight-feature">✏️ <strong>Modifications & Mises à jour illimitées</strong> toute l'année</li>
                <li>📸 Changement de photos, tarifs & description</li>
                <li>⚙️ Ajustement des options et capacités</li>
                <li>💬 Réservations directes WhatsApp & Email</li>
                <li>📅 <strong>Valable 1 an renouvelable</strong></li>
              </ul>

              <div className="pack-radio-indicator">
                <div className="pack-radio-circle"></div>
                <span>{selectedPack === 'pack_2' ? '✓ Pack Pro Sélectionné' : 'Choisir Pack Pro'}</span>
              </div>
            </div>
          </div>

          {/* Details & Payment reference */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem', marginBottom: '1.2rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                Mode de règlement prévu :
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  color: '#fff',
                  padding: '0.65rem 0.8rem',
                  fontSize: '0.88rem'
                }}
              >
                <option value="Virement bancaire" style={{ background: '#1e1e2f' }}>Virement bancaire</option>
                <option value="Versement / Espèces" style={{ background: '#1e1e2f' }}>Versement / Espèces</option>
                <option value="D17 / Mandat minute" style={{ background: '#1e1e2f' }}>D17 / Mandat minute</option>
                <option value="Chèque" style={{ background: '#1e1e2f' }}>Chèque</option>
                <option value="Autre accord avec l'admin" style={{ background: '#1e1e2f' }}>Autre accord avec l'admin</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                Référence ou message (facultatif) :
              </label>
              <input
                type="text"
                placeholder="Ex: Virement effectué réf #1234..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  color: '#fff',
                  padding: '0.65rem 0.8rem',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-reserve-large full-width btn-magic"
            disabled={loading}
          >
            {loading ? 'Envoi en cours...' : `Envoyer la demande de renouvellement (${selectedPrice} DT) 📩`}
          </button>
        </form>
      </div>
    </div>
  );
}
