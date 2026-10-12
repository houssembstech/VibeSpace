import React, { useState } from 'react';

export const computeSubscription = (currentUser) => {
  if (!currentUser || currentUser.role === 'admin') {
    return {
      status: 'active',
      isGrace: false,
      isSuspended: false,
      purchasedDateStr: 'Permanent (Admin)',
      expiresDateStr: 'Illimité',
      graceDateStr: 'Illimité',
      daysRemaining: 999,
      graceDaysRemaining: 7,
      statusLabel: '🟢 Actif (Administrateur)',
      badgeClass: 'approved'
    };
  }

  const now = new Date();
  const purchased = currentUser.packPurchasedAt 
    ? new Date(currentUser.packPurchasedAt) 
    : (currentUser.createdAt ? new Date(currentUser.createdAt) : now);

  const expires = currentUser.packExpiresAt 
    ? new Date(currentUser.packExpiresAt) 
    : new Date(new Date(purchased).setFullYear(purchased.getFullYear() + 1));

  const grace = currentUser.packGraceEndsAt 
    ? new Date(currentUser.packGraceEndsAt) 
    : new Date(new Date(expires).getTime() + 7 * 24 * 60 * 60 * 1000);

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const msToDays = (ms) => Math.ceil(ms / (1000 * 60 * 60 * 24));

  if (now < expires) {
    const days = msToDays(expires - now);
    return {
      status: 'active',
      isGrace: false,
      isSuspended: false,
      purchasedDateStr: formatDate(purchased),
      expiresDateStr: formatDate(expires),
      graceDateStr: formatDate(grace),
      daysRemaining: days,
      graceDaysRemaining: 7,
      statusLabel: `🟢 Actif (${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''})`,
      badgeClass: 'approved'
    };
  } else if (now >= expires && now < grace) {
    const graceDays = Math.max(0, msToDays(grace - now));
    return {
      status: 'expired_grace',
      isGrace: true,
      isSuspended: false,
      purchasedDateStr: formatDate(purchased),
      expiresDateStr: formatDate(expires),
      graceDateStr: formatDate(grace),
      daysRemaining: 0,
      graceDaysRemaining: graceDays,
      statusLabel: `⚠️ Alerte Échéance · Période de grâce (${graceDays}j restant${graceDays > 1 ? 's' : ''})`,
      badgeClass: 'pending'
    };
  } else {
    return {
      status: 'suspended',
      isGrace: false,
      isSuspended: true,
      purchasedDateStr: formatDate(purchased),
      expiresDateStr: formatDate(expires),
      graceDateStr: formatDate(grace),
      daysRemaining: 0,
      graceDaysRemaining: 0,
      statusLabel: `🔴 Masqué du Public · Échéance + 7j dépassée`,
      badgeClass: 'rejected'
    };
  }
};

export default function MySpotsModal({
  isOpen,
  onClose,
  spotsList,
  currentUser,
  onEditSpot,
  onAddNewSpot,
  onDeleteSpot,
  onOpenRenewModal,
  onSimulatePackDate
}) {
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simMessage, setSimMessage] = useState('');

  if (!isOpen || !currentUser) return null;

  const isAdmin = currentUser.role === 'admin';
  const mySpots = spotsList.filter(s => {
    if (isAdmin) return true;
    return s.hostEmail && s.hostEmail.toLowerCase() === currentUser.email.toLowerCase();
  });

  const canEdit = currentUser.canEdit || isAdmin;
  const sub = computeSubscription(currentUser);

  const handleRunSimulation = async (mode) => {
    if (!onSimulatePackDate) return;
    setSimulationLoading(true);
    setSimMessage('');
    try {
      const res = await onSimulatePackDate(mode);
      setSimMessage(res || `Simulation ${mode} appliquée !`);
      setTimeout(() => setSimMessage(''), 4000);
    } catch (err) {
      setSimMessage(`Erreur simulation: ${err.message}`);
    } finally {
      setSimulationLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content my-spots-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="my-spots-header">
          <div className="my-spots-title-group">
            <span className="my-spots-icon">🏢</span>
            <div>
              <h2>Mes Espaces & Fiches</h2>
              <p>
                Responsable : <strong>{currentUser.name}</strong> ({currentUser.email})
              </p>
            </div>
          </div>
          <button
            className="btn-reserve-large btn-magic btn-sm"
            onClick={() => { onClose(); onAddNewSpot(); }}
          >
            + Nouveau Spot ⚡
          </button>
        </div>

        {/* --- PENDING OR REJECTED RENEWAL REQUEST BANNER --- */}
        {currentUser.renewalRequest?.status === 'pending' && (
          <div className="renewal-pending-banner" style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.4))',
            border: '1.5px solid #f59e0b',
            borderRadius: '16px',
            padding: '1.1rem 1.3rem',
            marginBottom: '1.2rem',
            boxShadow: '0 6px 20px rgba(245, 158, 11, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: '#fde68a', margin: '0 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                  ⏳ <span>DEMANDE DE RENOUVELLEMENT EN ATTENTE DE L'ADMINISTRATEUR</span>
                </h4>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#fff', lineHeight: 1.45 }}>
                  Vous avez sollicité le <strong>{currentUser.renewalRequest.requestedPack === 'pack_2' ? '⭐ Pack 02 Flex Pro (120 DT)' : '📦 Pack 01 Visibilité (70 DT)'}</strong>
                  {currentUser.renewalRequest.requestedAt && ` le ${new Date(currentUser.renewalRequest.requestedAt).toLocaleDateString('fr-FR')}`}. 
                  L'administrateur procède actuellement à la vérification de votre paiement. Dès validation, votre pack sera actif pour 1 an et vos espaces réactivés.
                </p>
              </div>
              {onOpenRenewModal && (
                <button
                  className="btn-reserve-large btn-magic"
                  style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', padding: '0.55rem 1rem', fontSize: '0.82rem', whiteSpace: 'nowrap', alignSelf: 'center' }}
                  onClick={() => onOpenRenewModal()}
                >
                  ✏️ Modifier ma demande
                </button>
              )}
            </div>
          </div>
        )}

        {currentUser.renewalRequest?.status === 'rejected' && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1.5px solid #ef4444',
            borderRadius: '14px',
            padding: '0.9rem 1.2rem',
            marginBottom: '1.2rem',
            fontSize: '0.86rem',
            color: '#fca5a5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div>
              <strong>❌ Demande précédente refusée :</strong> {currentUser.renewalRequest.note || 'Paiement non confirmé par l\'administrateur'}.
            </div>
            {onOpenRenewModal && (
              <button
                className="btn-admin-action"
                style={{ background: '#ef4444', color: '#fff', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                onClick={() => onOpenRenewModal()}
              >
                🔄 Soumettre à nouveau
              </button>
            )}
          </div>
        )}

        {/* --- CRITICAL ALERT BANNER IF EXPIRED OR GRACE --- */}
        {sub.isSuspended && (
          <div className="subscription-alert-box suspended" style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.35))',
            border: '1.5px solid #ef4444',
            borderRadius: '16px',
            padding: '1.2rem 1.4rem',
            marginBottom: '1.2rem',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: '#ef4444', margin: '0 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
                  🔴 <span>ESPACE MASQUÉ DU PUBLIC !</span>
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#fca5a5', lineHeight: 1.5 }}>
                  Votre pack annuel est arrivé à échéance le <strong>{sub.expiresDateStr}</strong> et la <strong>période de grâce de 7 jours est expirée</strong>. 
                  Vos espaces sont actuellement <strong>masqués aux visiteurs</strong>. 
                  Envoyez une demande de renouvellement pour que l'administrateur valide votre règlement et réactive immédiatement vos espaces !
                </p>
              </div>
              <button
                className="btn-reserve-large btn-magic"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', alignSelf: 'center', whiteSpace: 'nowrap', padding: '0.7rem 1.3rem', fontSize: '0.9rem' }}
                onClick={() => { if (onOpenRenewModal) onOpenRenewModal(); }}
              >
                {currentUser.renewalRequest?.status === 'pending' ? '⏳ Demande en attente admin' : '⚡ Demander le Renouvellement'}
              </button>
            </div>
          </div>
        )}

        {sub.isGrace && (
          <div className="subscription-alert-box grace" style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.35))',
            border: '1.5px solid #f59e0b',
            borderRadius: '16px',
            padding: '1.2rem 1.4rem',
            marginBottom: '1.2rem',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: '#f59e0b', margin: '0 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
                  ⚠️ <span>ALERTE ÉCHÉANCE : RENOUVELLEMENT REQUIS !</span>
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#fde68a', lineHeight: 1.5 }}>
                  Votre abonnement d'1 an a expiré le <strong>{sub.expiresDateStr}</strong>. 
                  Il vous reste <strong style={{ color: '#fff', textDecoration: 'underline' }}>{sub.graceDaysRemaining} jour(s) de grâce</strong> (jusqu'au {sub.graceDateStr}) pour racheter un pack, 
                  sinon <strong>votre espace sera automatiquement masqué</strong> aux visiteurs.
                </p>
              </div>
              <button
                className="btn-reserve-large btn-magic"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', alignSelf: 'center', whiteSpace: 'nowrap', padding: '0.7rem 1.3rem', fontSize: '0.9rem' }}
                onClick={() => { if (onOpenRenewModal) onOpenRenewModal(); }}
              >
                {currentUser.renewalRequest?.status === 'pending' ? '⏳ Demande en attente admin' : '🔄 Demander le Renouvellement ⚡'}
              </button>
            </div>
          </div>
        )}

        {/* --- SUBSCRIPTION TIMELINE & STATUS CARD --- */}
        <div className="subscription-status-card" style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '1rem 1.2rem',
          marginBottom: '1.2rem',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.6rem', marginBottom: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>📅</span>
              <strong style={{ fontSize: '0.95rem' }}>Abonnement Annuel & Validité</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className={`my-spot-badge ${sub.badgeClass}`}>
                {sub.statusLabel}
              </span>
              {!isAdmin && onOpenRenewModal && (
                <button
                  className="btn-admin-action"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.08)' }}
                  onClick={() => onOpenRenewModal()}
                >
                  {currentUser.renewalRequest?.status === 'pending' ? '⏳ Demande en attente' : '🔄 Demander Renouvellement'}
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Formule souscrite :</span>
              <strong>{currentUser.pack === 'pack_2' ? '⭐ Pack 02 Flex Pro (120 DT)' : '📦 Pack 01 Visibilité (70 DT)'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Date de souscription :</span>
              <strong>{sub.purchasedDateStr}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Échéance (1 an) :</span>
              <strong style={{ color: sub.isGrace || sub.isSuspended ? '#ef4444' : 'var(--accent-1)' }}>{sub.expiresDateStr}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Limite période de grâce (+7j) :</span>
              <strong style={{ color: sub.isSuspended ? '#ef4444' : 'var(--text-secondary)' }}>{sub.graceDateStr}</strong>
            </div>
          </div>
        </div>

        {/* Edit Permission & Pack Status Banner */}
        <div className={`permission-banner ${canEdit ? 'granted' : 'locked'}`} style={{ marginBottom: '1.2rem' }}>
          {canEdit ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
              <div>
                <p style={{ margin: 0 }}>
                  👑 <strong>Pack Flex Pro (120 DT/an) · Modifications illimitées actives</strong>
                </p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', opacity: 0.9 }}>
                  Vous pouvez mettre à jour photos, tarifs, équipements, capacités et descriptions à tout moment. (Le nom de l'espace reste fixe et certifié 🔒).
                </p>
              </div>
              <span className="my-spot-badge approved" style={{ alignSelf: 'flex-start' }}>👑 Pack Pro (120 DT)</span>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
              <div>
                <p style={{ margin: 0 }}>
                  📦 <strong>Pack 01 Visibilité Directe (70 DT/an) · Fiche Fixe</strong>
                </p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', opacity: 0.9 }}>
                  Votre espace est en ligne et reçoit 100% des réservations sans intermédiaire. La modification des fiches est réservée au <strong>Pack Flex Pro (120 DT/an)</strong>.
                </p>
              </div>
              <span className="my-spot-badge pending" style={{ alignSelf: 'flex-start' }}>📦 Pack 01 (70 DT)</span>
            </div>
          )}
        </div>

        {/* --- TESTING / SIMULATION PANEL --- */}
        {!isAdmin && onSimulatePackDate && (
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px dashed rgba(99, 102, 241, 0.4)',
            borderRadius: '12px',
            padding: '0.8rem 1rem',
            marginBottom: '1.2rem',
            fontSize: '0.82rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: '#818cf8' }}>
                🧪 Outil de Test & Simulation (Vérification automatique sans attendre 1 an) :
              </span>
              {simMessage && <span style={{ color: '#34d399', fontWeight: 600 }}>{simMessage}</span>}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className="btn-admin-action"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.7rem', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', color: '#fde68a' }}
                disabled={simulationLoading}
                onClick={() => handleRunSimulation('grace')}
              >
                1. Simuler 1 an passé (Alerte Grâce 7j)
              </button>
              <button
                className="btn-admin-action"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.7rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5' }}
                disabled={simulationLoading}
                onClick={() => handleRunSimulation('suspended')}
              >
                2. Simuler +7 jours passés (Espace Masqué)
              </button>
              <button
                className="btn-admin-action"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.7rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#6ee7b7' }}
                disabled={simulationLoading}
                onClick={() => handleRunSimulation('reset')}
              >
                🔄 Réinitialiser (Actif dès aujourd'hui)
              </button>
            </div>
          </div>
        )}

        {/* Spots list */}
        <div className="my-spots-grid">
          {mySpots.length === 0 ? (
            <div className="my-spots-empty">
              <h4>Vous n'avez pas encore publié d'espace</h4>
              <p>Cliquez sur le bouton ci-dessous pour lancer votre premier spot sur VibeSpace.</p>
              <button
                className="btn-reserve-large btn-magic mt-btn"
                onClick={() => { onClose(); onAddNewSpot(); }}
              >
                Ajouter mon premier spot 🚀
              </button>
            </div>
          ) : (
            mySpots.map(spot => {
              const isPending = spot.status === 'pending';

              return (
                <div key={spot.id || spot._id} className="my-spot-item-card" style={{
                  opacity: sub.isSuspended ? 0.75 : 1,
                  filter: sub.isSuspended ? 'grayscale(0.2)' : 'none'
                }}>
                  <div className="my-spot-item-img">
                    <img src={spot.img || spot.imageUrl || (spot.images && spot.images[0])} alt={spot.title} />
                    
                    {sub.isSuspended ? (
                      <span className="my-spot-badge rejected" style={{ background: '#ef4444' }}>
                        🔴 Masqué du Public (Abonnement expiré)
                      </span>
                    ) : (
                      <span className={`my-spot-badge ${isPending ? 'pending' : 'approved'}`}>
                        {isPending ? '⏳ En attente de validation' : '✅ En ligne & Réservable'}
                      </span>
                    )}
                  </div>

                  <div className="my-spot-item-content">
                    <h4>{spot.title}</h4>
                    <p className="my-spot-item-loc">📍 {spot.location}</p>
                    <p className="my-spot-item-details">
                      <strong>{spot.price || spot.pricePerHour} DT/h</strong>
                      {spot.priceHalfDay > 0 && <span> • {spot.priceHalfDay} DT/½j</span>}
                      {spot.priceFullDay > 0 && <span> • {spot.priceFullDay} DT/j</span>}
                      <span> • Capacité max: {spot.capacity || spot.maxCapacity} pers</span>
                    </p>
                    <div className="my-spot-contacts-preview">
                      <span>Email: {spot.hostEmail || currentUser.email}</span>
                      {spot.hostPhone && <span>Tél: {spot.hostPhone}</span>}
                    </div>

                    <div className="my-spot-actions-row">
                      {canEdit ? (
                        <button
                          className="btn-edit-spot-action"
                          onClick={() => { onClose(); onEditSpot(spot); }}
                        >
                          ✏️ Modifier mon espace
                        </button>
                      ) : (
                        <button className="btn-edit-spot-action disabled" disabled title="Les modifications sont réservées aux membres Pack Flex Pro (120 DT/an). Contactez l'admin pour activer l'option.">
                          🔒 Modification (Pack Pro 120 DT)
                        </button>
                      )}
                      {canEdit && onDeleteSpot && (
                        <button
                          className="btn-admin-action btn-delete"
                          onClick={() => onDeleteSpot(spot.id || spot._id)}
                          title="Supprimer définitivement cet espace"
                          style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
                        >
                          🗑️ Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
