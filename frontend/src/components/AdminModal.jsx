import { useState, useEffect } from 'react';
import { computeSubscription } from './MySpotsModal';

export const isSpotMarkedPremium = (spot, usersList) => {
  if (spot.isPremium === false || spot.isPremium === 'false') return false;
  if (spot.isPremium === true || spot.isPremium === 'true') return true;
  const hostUser = usersList?.find(u => u.email && spot.hostEmail && u.email.toLowerCase() === spot.hostEmail.toLowerCase());
  return Boolean(hostUser && (hostUser.pack === 'pack_2' || hostUser.pack === 'pack_3'));
};

export default function AdminModal({
  isOpen,
  onClose,
  spotsList,
  usersList,
  onUpdateSpotStatus,
  onDeleteSpot,
  onToggleSpotPremium,
  onUpdateSpotRating,
  onEditSpot,
  onToggleCanEdit,
  onCreateUser,
  onRenewPackAdmin,
  onApproveRenewal,
  onRejectRenewal,
  packsConfig,
  onSavePacksConfig
}) {
  const [activeTab, setActiveTab] = useState('spots'); // 'spots' | 'renewals' | 'users' | 'packs'
  const [spotsFilter, setSpotsFilter] = useState('all'); // 'all' | 'pending' | 'approved'
  const [showCreateUser, setShowCreateUser] = useState(false);

  const [editingPacks, setEditingPacks] = useState(() => packsConfig || {
    pack_1: { name: 'Pack 01 · Bronze', subtitle: 'Visibilité Directe', price: 70, durationMonths: 12, graceDays: 7, description: 'Idéal pour lancer votre espace simplement avec une présence active.' },
    pack_2: { name: 'Pack 02 · Silver', subtitle: 'Flex Pro & Contrôle', price: 120, durationMonths: 12, graceDays: 7, description: 'La solution complète pour ajuster vos tarifs et maximiser votre taux d\'occupation.' },
    pack_3: { name: 'Pack 03 · Gold', subtitle: 'Expérience VIP & Création Reel', price: 250, durationMonths: 12, graceDays: 7, description: 'L\'offre d\'excellence avec création de Reel professionnel et visibilité maximale.' }
  });

  useEffect(() => {
    if (packsConfig) {
      setEditingPacks(packsConfig);
    }
  }, [packsConfig]);

  const p1Price = editingPacks?.pack_1?.price ?? 70;
  const p2Price = editingPacks?.pack_2?.price ?? 120;
  const p3Price = editingPacks?.pack_3?.price ?? 250;
  const p1Duration = editingPacks?.pack_1?.durationMonths ?? 12;
  const p2Duration = editingPacks?.pack_2?.durationMonths ?? 12;
  const p3Duration = editingPacks?.pack_3?.durationMonths ?? 12;
  const p1Name = editingPacks?.pack_1?.name || 'Pack 01 · Bronze';
  const p2Name = editingPacks?.pack_2?.name || 'Pack 02 · Silver';
  const p3Name = editingPacks?.pack_3?.name || 'Pack 03 · Gold';

  // New user form state
  const [newName, setNewName] = useState('');
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('responsable');
  const [newPack, setNewPack] = useState('pack_1');
  const [newCanEdit, setNewCanEdit] = useState(false);

  if (!isOpen) return null;

  // Spots counts
  const pendingSpots = spotsList.filter(s => s.status === 'pending');
  const approvedSpots = spotsList.filter(s => !s.status || s.status === 'approved');
  const pendingRenewals = usersList.filter(u => u.renewalRequest?.status === 'pending');

  const displayedSpots = spotsList.filter(s => {
    if (spotsFilter === 'pending') return s.status === 'pending';
    if (spotsFilter === 'approved') return !s.status || s.status === 'approved';
    return true;
  });

  const handleCreateUserSubmit = (e) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPhone) return;

    onCreateUser({
      name: newName,
      spaceName: newSpaceName,
      email: newEmail.trim().toLowerCase(),
      phone: newPhone,
      password: newPassword || '123456',
      role: newRole,
      pack: newRole === 'admin' ? 'pack_2' : newPack,
      canEdit: newRole === 'admin' ? true : (newCanEdit || newPack === 'pack_2' || newPack === 'pack_3')
    });

    setShowCreateUser(false);
    setNewName('');
    setNewSpaceName('');
    setNewEmail('');
    setNewPhone('');
    setNewPassword('');
    setNewPack('pack_1');
    setNewCanEdit(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content admin-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Header */}
        <div className="admin-header">
          <div className="admin-header-title">
            <span className="admin-badge-icon">🛡️</span>
            <div>
              <h2>Panneau d'Administration</h2>
              <p>Gestion globale des spots, vérification des paiements et renouvellements</p>
            </div>
          </div>
          <div className="admin-current-badge">
            Admin connecté : <strong>houssembs.tech@gmail.com</strong>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-nav-tabs">
          <button
            className={`admin-nav-tab ${activeTab === 'spots' ? 'active' : ''}`}
            onClick={() => setActiveTab('spots')}
          >
            📥 Demandes de spots
            {pendingSpots.length > 0 && (
              <span className="badge-count-pending">{pendingSpots.length}</span>
            )}
          </button>
          <button
            className={`admin-nav-tab ${activeTab === 'renewals' ? 'active' : ''}`}
            onClick={() => setActiveTab('renewals')}
          >
            🔔 Renouvellements de pack
            {pendingRenewals.length > 0 && (
              <span className="badge-count-pending" style={{ background: '#f59e0b', color: '#fff' }}>{pendingRenewals.length}</span>
            )}
          </button>
          <button
            className={`admin-nav-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Responsables d'espace & Comptes ({usersList.length})
          </button>
          <button
            className={`admin-nav-tab ${activeTab === 'packs' ? 'active' : ''}`}
            onClick={() => setActiveTab('packs')}
          >
            ⚙️ Packs & Tarifs ({editingPacks?.pack_1?.price || 70}DT / {editingPacks?.pack_2?.price || 120}DT)
          </button>
        </div>

        {/* TAB 1: Spots Requests */}
        {activeTab === 'spots' && (
          <div className="admin-tab-content">
            <div className="admin-sub-header">
              <div className="admin-filters">
                <button
                  className={`filter-pill ${spotsFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setSpotsFilter('all')}
                >
                  Tous ({spotsList.length})
                </button>
                <button
                  className={`filter-pill pill-warning ${spotsFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setSpotsFilter('pending')}
                >
                  ⏳ En attente ({pendingSpots.length})
                </button>
                <button
                  className={`filter-pill pill-success ${spotsFilter === 'approved' ? 'active' : ''}`}
                  onClick={() => setSpotsFilter('approved')}
                >
                  ✅ Approuvés ({approvedSpots.length})
                </button>
              </div>
            </div>

            <div className="admin-spots-list">
              {displayedSpots.length === 0 ? (
                <div className="admin-empty-state">
                  <p>Aucun spot dans cette catégorie.</p>
                </div>
              ) : (
                displayedSpots.map(spot => {
                  const isPending = spot.status === 'pending';
                  const isApproved = !spot.status || spot.status === 'approved';
                  const isSpotPremium = isSpotMarkedPremium(spot, usersList);

                  return (
                    <div key={spot.id || spot._id} className="admin-spot-card">
                      <div className="admin-spot-img-wrap">
                        <img src={spot.img || spot.imageUrl || (spot.images && spot.images[0])} alt={spot.title} />
                        <span className={`admin-status-tag ${isPending ? 'pending' : 'approved'}`}>
                          {isPending ? '⏳ En attente' : '✅ En ligne'}
                        </span>
                        {isSpotPremium && (
                          <span 
                            className="admin-status-tag" 
                            style={{ 
                              left: 'auto', 
                              right: '8px', 
                              background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                              color: '#fff', 
                              border: 'none', 
                              fontWeight: '700',
                              boxShadow: '0 2px 6px rgba(245, 158, 11, 0.4)'
                            }}
                          >
                            👑 Premium
                          </span>
                        )}
                      </div>

                      <div className="admin-spot-info">
                        <div className="admin-spot-title-row">
                          <h4>{spot.title}</h4>
                          <span className="admin-spot-cat">{spot.category}</span>
                        </div>
                        <p className="admin-spot-price">
                          {spot.pricingType === 'day' 
                            ? `${spot.priceFullDay || spot.price || spot.pricePerHour} DT/jour` 
                            : `${spot.price || spot.pricePerHour} DT/heure`}
                          {spot.priceHalfDay > 0 && ` • ${spot.priceHalfDay} DT/½j`}
                          {spot.pricingType === 'day' && spot.pricePerHour > 0 && ` • ${spot.pricePerHour} DT/h`}
                          {spot.pricingType !== 'day' && spot.priceFullDay > 0 && ` • ${spot.priceFullDay} DT/j`}
                          {` • Max ${spot.capacity || spot.maxCapacity} pers`}
                        </p>

                        <div className="admin-host-contacts">
                          <span>👤 Hôte : <strong>{spot.hostEmail || 'Non spécifié'}</strong></span>
                          {spot.hostPhone && <span>📞 Tél : {spot.hostPhone}</span>}
                          {spot.hostWhatsapp && <span>💬 WA : {spot.hostWhatsapp}</span>}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.45rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.88rem', color: '#fbbf24', fontWeight: '700' }}>
                            ★ {spot.rating !== undefined ? spot.rating : '5.0'} / 5.0
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const current = spot.rating !== undefined ? spot.rating : 5.0;
                              const val = prompt(`Définir l'évaluation de "${spot.title}" (note de 1.0 à 5.0 étoiles) :`, current);
                              if (val !== null) {
                                const num = parseFloat(val);
                                if (!isNaN(num) && num >= 1.0 && num <= 5.0) {
                                  onUpdateSpotRating && onUpdateSpotRating(spot.id || spot._id, num);
                                } else {
                                  alert("Veuillez saisir un nombre valide entre 1.0 et 5.0 (ex: 4.8)");
                                }
                              }
                            }}
                            className="btn-admin-action"
                            style={{ padding: '0.18rem 0.55rem', fontSize: '0.75rem', background: 'rgba(251, 191, 36, 0.15)', borderColor: '#fbbf24', color: '#fbbf24', cursor: 'pointer' }}
                            title="Modifier la note du spot (étoiles)"
                          >
                            ⭐ Modifier note
                          </button>
                        </div>
                      </div>

                      <div className="admin-spot-actions">
                        <button
                          className={`btn-admin-action ${isSpotPremium ? 'btn-premium-active' : 'btn-premium-toggle'}`}
                          onClick={() => onToggleSpotPremium && onToggleSpotPremium(spot.id || spot._id, isSpotPremium)}
                          style={isSpotPremium ? {
                            background: 'rgba(245, 158, 11, 0.2)',
                            borderColor: '#f59e0b',
                            color: '#fbbf24',
                            fontWeight: '600'
                          } : {
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            color: '#e2e8f0'
                          }}
                          title={isSpotPremium ? "Retirer de la sélection Premium (Carrousel)" : "Mettre en avant dans la sélection Premium (Carrousel)"}
                        >
                          {isSpotPremium ? '★ Retirer Premium' : '👑 Passer en Premium'}
                        </button>

                        {onEditSpot && (
                          <button
                            className="btn-admin-action"
                            onClick={() => onEditSpot(spot)}
                            title="Modifier la fiche complète (tarifs, public, services, photos...)"
                            style={{ background: 'rgba(0, 242, 254, 0.12)', borderColor: 'rgba(0, 242, 254, 0.4)', color: 'var(--accent-1, #00f2fe)' }}
                          >
                            ✏️ Modifier
                          </button>
                        )}

                        {isPending ? (
                          <button
                            className="btn-admin-action btn-approve"
                            onClick={() => onUpdateSpotStatus(spot.id || spot._id, 'approved')}
                            title="Accepter et publier sur le site"
                          >
                            Accepter ✅
                          </button>
                        ) : (
                          <button
                            className="btn-admin-action btn-pending"
                            onClick={() => onUpdateSpotStatus(spot.id || spot._id, 'pending')}
                            title="Retirer du public et mettre en attente"
                          >
                            Mettre en attente ⏳
                          </button>
                        )}

                        <button
                          className="btn-admin-action btn-delete"
                          onClick={() => onDeleteSpot(spot.id || spot._id)}
                          title="Supprimer définitivement"
                        >
                          Supprimer 🗑️
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Renewals & Payment Verification */}
        {activeTab === 'renewals' && (
          <div className="admin-tab-content">
            <div className="admin-users-header">
              <div>
                <h3>Demandes de Renouvellement de Pack ({pendingRenewals.length})</h3>
                <p>Vérifiez la réception du règlement ({p1Price} DT, {p2Price} DT ou {p3Price} DT) avant de valider l'abonnement du responsable.</p>
              </div>
            </div>

            {pendingRenewals.length === 0 ? (
              <div className="admin-empty-state" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.8rem' }}>✨</span>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Aucune demande de renouvellement en attente</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tous les paiements et renouvellements de packs ont été traités.</p>
              </div>
            ) : (
              <div className="renewals-requests-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingRenewals.map(u => {
                  const req = u.renewalRequest;
                  const reqPack = req.requestedPack;
                  const isPack3 = reqPack === 'pack_3';
                  const isPack2 = reqPack === 'pack_2';
                  const sub = computeSubscription(u);
                  const dateStr = req.requestedAt ? new Date(req.requestedAt).toLocaleString('fr-FR') : 'Récemment';
                  const reqName = isPack3 ? p3Name : (isPack2 ? p2Name : p1Name);
                  const reqPrice = req.requestedPackPrice || (isPack3 ? p3Price : (isPack2 ? p2Price : p1Price));
                  const reqDuration = isPack3 ? p3Duration : (isPack2 ? p2Duration : p1Duration);

                  return (
                    <div key={u._id || u.id} className="renewal-request-card" style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: isPack3 ? '1.5px solid rgba(236, 72, 153, 0.5)' : (isPack2 ? '1.5px solid rgba(245, 158, 11, 0.4)' : '1.5px solid rgba(217, 119, 6, 0.4)'),
                      borderRadius: '16px',
                      padding: '1.2rem 1.4rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1.2rem'
                    }}>
                      <div style={{ flex: '1 1 340px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                          <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{u.name}</h4>
                          {u.spaceName && <span className="user-space-tag">🏢 {u.spaceName}</span>}
                          <span className={`my-spot-badge ${sub.badgeClass}`} style={{ fontSize: '0.72rem' }}>
                            {sub.statusLabel}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
                          <span>📧 {u.email}</span> • <span>📞 {u.phone}</span>
                        </div>
                        <div style={{
                          background: 'rgba(245, 158, 11, 0.1)',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                          borderRadius: '10px',
                          padding: '0.7rem 0.95rem',
                          fontSize: '0.86rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                              Formule demandée : <strong>{isPack3 ? `🥇 ${p3Name}` : (isPack2 ? `🥈 ${p2Name}` : `🥉 ${p1Name}`)}</strong>
                            </div>
                            <span style={{ fontWeight: 800, color: isPack3 ? '#ec4899' : (isPack2 ? '#fbbf24' : '#f59e0b'), fontSize: '1rem' }}>
                              Montant à vérifier : {reqPrice} DT
                            </span>
                          </div>
                          <div style={{ marginTop: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                            <span>Mode prévu : <strong style={{ color: '#fff' }}>{req.paymentMethod || 'Virement / Espèces'}</strong></span>
                            {req.note && <span> • Référence/Note : <em style={{ color: '#fde68a' }}>"{req.note}"</em></span>}
                            <span> • Soumis le : {dateStr}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minWidth: '220px' }}>
                        <button
                          className="btn-reserve-large btn-magic"
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            padding: '0.65rem 1rem',
                            fontSize: '0.86rem',
                            fontWeight: 700,
                            width: '100%'
                          }}
                          onClick={() => onApproveRenewal(u.email, req.requestedPack)}
                        >
                          ✅ Valider Paiement & Activer ({reqDuration} mois)
                        </button>
                        <button
                          className="btn-admin-action btn-delete"
                          style={{
                            padding: '0.55rem 1rem',
                            fontSize: '0.82rem',
                            width: '100%',
                            textAlign: 'center',
                            justifyContent: 'center',
                            background: 'rgba(239, 68, 68, 0.15)',
                            borderColor: '#ef4444',
                            color: '#ef4444'
                          }}
                          onClick={() => {
                            const reason = window.prompt("Motif du refus (optionnel) :", "Paiement non confirmé");
                            if (reason !== null) {
                              onRejectRenewal(u.email, reason);
                            }
                          }}
                        >
                          ❌ Refuser la Demande
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Users & Managers */}
        {activeTab === 'users' && (
          <div className="admin-tab-content">
            <div className="admin-users-header">
              <div>
                <h3>Comptes Responsables d'espace</h3>
                <p>Contrôlez l'accès de chaque responsable pour modifier ses photos, coordonnées, description et services.</p>
              </div>
              <button
                className="btn-reserve-large btn-magic btn-create-user-trigger"
                onClick={() => setShowCreateUser(true)}
              >
                + Créer un compte ✨
              </button>
            </div>

            <div className="admin-users-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Téléphone</th>
                    <th>Rôle</th>
                    <th>Formule / Pack</th>
                    <th>Validité Abonnement</th>
                    <th>Droit de modification</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map(u => {
                    const userId = u._id || u.id;
                    const isAdmin = u.role === 'admin';
                    const canEdit = u.canEdit || isAdmin;
                    const isPack3 = u.pack === 'pack_3';
                    const isPack2 = u.pack === 'pack_2';
                    const sub = computeSubscription(u);
                    const hasPendingRenewal = u.renewalRequest?.status === 'pending';

                    return (
                      <tr key={userId} style={hasPendingRenewal ? { background: 'rgba(245, 158, 11, 0.05)' } : {}}>
                        <td>
                          <div className="user-cell">
                            <strong>{u.name}</strong>
                            {u.spaceName && <span className="user-space-tag">🏢 {u.spaceName}</span>}
                            <span>{u.email}</span>
                          </div>
                        </td>
                        <td>{u.phone || '—'}</td>
                        <td>
                          <span className={`role-badge ${u.role}`}>
                            {isAdmin ? '🛡️ Admin' : '🏢 Responsable'}
                          </span>
                        </td>
                        <td>
                          {isAdmin ? (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>👑 Admin</span>
                          ) : (
                            <div>
                              <span className={`my-spot-badge ${isPack3 ? 'gold' : (isPack2 ? 'approved' : 'pending')}`} style={{
                                fontSize: '0.75rem',
                                padding: '0.2rem 0.55rem',
                                background: isPack3 ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.25), rgba(139, 92, 246, 0.25))' : undefined,
                                borderColor: isPack3 ? '#ec4899' : undefined,
                                color: isPack3 ? '#f472b6' : undefined
                              }}>
                                {isPack3 ? `🥇 ${p3Name} (${p3Price} DT)` : (isPack2 ? `🥈 ${p2Name} (${p2Price} DT)` : `🥉 ${p1Name} (${p1Price} DT)`)}
                              </span>
                              {hasPendingRenewal && (
                                <div style={{ marginTop: '4px' }}>
                                  <span style={{
                                    background: 'rgba(245, 158, 11, 0.2)',
                                    color: '#f59e0b',
                                    border: '1px solid rgba(245, 158, 11, 0.4)',
                                    borderRadius: '6px',
                                    fontSize: '0.68rem',
                                    padding: '2px 6px',
                                    display: 'inline-block',
                                    fontWeight: 700
                                  }}>
                                    ⏳ Demande: {u.renewalRequest.requestedPack === 'pack_3' ? `Gold ${p3Price}DT` : (u.renewalRequest.requestedPack === 'pack_2' ? `Silver ${p2Price}DT` : `Bronze ${p1Price}DT`)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          {isAdmin ? (
                            <span style={{ fontSize: '0.8rem', color: '#10b981' }}>🟢 Permanent</span>
                          ) : (
                            <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <span className={`my-spot-badge ${sub.badgeClass}`} style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', alignSelf: 'flex-start' }}>
                                {sub.statusLabel}
                              </span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                Échéance: {sub.expiresDateStr}
                              </span>
                              <span style={{ color: sub.isSuspended ? '#ef4444' : 'var(--text-muted)', fontSize: '0.72rem' }}>
                                Grâce (+7j): {sub.graceDateStr}
                              </span>
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`edit-access-badge ${canEdit ? 'allowed' : 'locked'}`}>
                            {canEdit ? '🟢 Autorisé à modifier' : '🔴 Modification bloquée'}
                          </span>
                        </td>
                        <td>
                          {isAdmin ? (
                            <span className="admin-immutable">Accès complet</span>
                          ) : (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                              {hasPendingRenewal ? (
                                <>
                                  <button
                                    className="btn-admin-action"
                                    style={{ background: '#10b981', color: '#fff', padding: '0.3rem 0.55rem', fontSize: '0.72rem', fontWeight: 700 }}
                                    title="Valider le paiement et activer le pack"
                                    onClick={() => onApproveRenewal(u.email, u.renewalRequest.requestedPack)}
                                  >
                                    ✅ Valider ({u.renewalRequest.requestedPackPrice ? `${u.renewalRequest.requestedPackPrice}DT` : (u.renewalRequest.requestedPack === 'pack_2' ? `${p2Price}DT` : `${p1Price}DT`)})
                                  </button>
                                  <button
                                    className="btn-admin-action btn-delete"
                                    style={{ padding: '0.3rem 0.45rem', fontSize: '0.72rem' }}
                                    title="Refuser la demande"
                                    onClick={() => {
                                      const reason = window.prompt("Motif du refus (optionnel) :", "Paiement non confirmé");
                                      if (reason !== null) {
                                        onRejectRenewal(u.email, reason);
                                      }
                                    }}
                                  >
                                    ❌ Refuser
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className={`btn-access-toggle ${canEdit ? 'revoke' : 'grant'}`}
                                    onClick={() => onToggleCanEdit(userId, canEdit)}
                                  >
                                    {canEdit ? "Bloquer 🔒" : "Débloquer 🔓"}
                                  </button>
                                  {onRenewPackAdmin && (
                                    <button
                                      className="btn-admin-action"
                                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.72rem' }}
                                      title={`Renouveler pour ${isPack2 ? `${p2Duration} mois` : `${p1Duration} mois`}`}
                                      onClick={() => onRenewPackAdmin(u.email)}
                                    >
                                      🔄 +{isPack2 ? `${p2Duration}m` : `${p1Duration}m`}
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBMODAL: Create User */}
        {showCreateUser && (
          <div className="submodal-overlay" onClick={() => setShowCreateUser(false)}>
            <div className="submodal-box" onClick={(e) => e.stopPropagation()}>
              <div className="submodal-header">
                <h3>Créer un nouveau compte</h3>
                <button className="modal-close" onClick={() => setShowCreateUser(false)}>✕</button>
              </div>

              <form onSubmit={handleCreateUserSubmit} className="auth-form mt-form">
                <div className="auth-field">
                  <label>Rôle du compte</label>
                  <div className="role-selector-btns">
                    <button
                      type="button"
                      className={`role-select-btn ${newRole === 'responsable' ? 'active' : ''}`}
                      onClick={() => setNewRole('responsable')}
                    >
                      🏢 Responsable d'espace
                    </button>
                    <button
                      type="button"
                      className={`role-select-btn ${newRole === 'admin' ? 'active' : ''}`}
                      onClick={() => setNewRole('admin')}
                    >
                      🛡️ Administrateur
                    </button>
                  </div>
                </div>

                <div className="auth-field">
                  <label>Nom complet *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Yassine Trabelsi"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>

                {newRole === 'responsable' && (
                  <div className="auth-field">
                    <label>Nom de l'Espace / Lieu</label>
                    <input
                      type="text"
                      placeholder="Ex: Villa Infinity, Rooftop Sunset..."
                      value={newSpaceName}
                      onChange={(e) => setNewSpaceName(e.target.value)}
                    />
                  </div>
                )}

                <div className="auth-field">
                  <label>Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="email@domaine.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>

                <div className="auth-field">
                  <label>Numéro de téléphone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+216 22 345 678"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                </div>

                <div className="auth-field">
                  <label>Mot de passe</label>
                  <input
                    type="password"
                    placeholder="Par défaut: 123456"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                {newRole === 'responsable' && (
                  <div className="auth-field">
                    <label>Formule / Pack initial</label>
                    <select
                      value={newPack}
                      onChange={(e) => {
                        setNewPack(e.target.value);
                        if (e.target.value === 'pack_2' || e.target.value === 'pack_3') {
                          setNewCanEdit(true);
                        } else {
                          setNewCanEdit(false);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '10px',
                        color: '#f8fafc',
                        fontSize: '0.9rem'
                      }}
                    >
                      <option value="pack_1" style={{ background: '#18181b', color: '#fff' }}>🥉 {p1Name} — {p1Price} DT ({p1Duration} mois, fiche fixe)</option>
                      <option value="pack_2" style={{ background: '#18181b', color: '#fff' }}>🥈 {p2Name} — {p2Price} DT ({p2Duration} mois, modifiable)</option>
                      <option value="pack_3" style={{ background: '#18181b', color: '#fff' }}>🥇 {p3Name} — {p3Price} DT ({p3Duration} mois, VIP Reel)</option>
                    </select>
                  </div>
                )}

                {newRole === 'responsable' && (
                  <div className="auth-checkbox-field">
                    <label>
                      <input
                        type="checkbox"
                        checked={newCanEdit}
                        onChange={(e) => setNewCanEdit(e.target.checked)}
                      />
                      <span>Donner immédiatement l'accès de modification à ce responsable</span>
                    </label>
                  </div>
                )}

                <button type="submit" className="btn-reserve-large full-width btn-magic mt-btn">
                  Créer le compte ✨
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: Dynamic Packs & Fees Configuration */}
        {activeTab === 'packs' && (
          <div className="admin-tab-content">
            <div className="admin-users-header">
              <div>
                <h3>⚙️ Gestion Dynamique des Tarifs & Durées des Packs</h3>
                <p>Ajustez les frais d'abonnement (prix en DT), la durée de validité (en mois) et le délai de grâce. Les modifications s'appliquent immédiatement pour toutes les inscriptions et renouvellements.</p>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              onSavePacksConfig && onSavePacksConfig(editingPacks);
              alert("Tarifs et durées des packs enregistrés avec succès ! 🎉");
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {/* PACK 1 CONFIG */}
                <div style={{ background: 'rgba(217, 119, 6, 0.05)', border: '1.5px solid rgba(217, 119, 6, 0.3)', borderRadius: '14px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, color: '#f59e0b', fontSize: '1.1rem' }}>🥉 Pack 01 (Bronze · Visibilité Directe)</h4>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(217, 119, 6, 0.2)', color: '#f59e0b', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>Pack Bronze</span>
                  </div>

                  <div className="auth-field">
                    <label>Nom complet du Pack</label>
                    <input
                      type="text"
                      required
                      value={editingPacks?.pack_1?.name || ''}
                      onChange={(e) => setEditingPacks(prev => ({ ...prev, pack_1: { ...prev.pack_1, name: e.target.value } }))}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <div className="auth-field">
                      <label>Frais / Tarif (DT) *</label>
                      <div className="val-input-wrapper">
                        <input
                          type="number"
                          min="0"
                          required
                          value={editingPacks?.pack_1?.price !== undefined ? editingPacks.pack_1.price : 70}
                          onChange={(e) => setEditingPacks(prev => ({ ...prev, pack_1: { ...prev.pack_1, price: Math.max(0, parseFloat(e.target.value) || 0) } }))}
                        />
                        <span className="val-unit">DT</span>
                      </div>
                    </div>

                    <div className="auth-field">
                      <label>Durée d'abonnement (Mois) *</label>
                      <div className="val-input-wrapper">
                        <input
                          type="number"
                          min="1"
                          required
                          value={editingPacks?.pack_1?.durationMonths !== undefined ? editingPacks.pack_1.durationMonths : 12}
                          onChange={(e) => setEditingPacks(prev => ({ ...prev, pack_1: { ...prev.pack_1, durationMonths: Math.max(1, parseInt(e.target.value) || 12) } }))}
                        />
                        <span className="val-unit">Mois</span>
                      </div>
                    </div>
                  </div>

                  <div className="auth-field">
                    <label>Délai de grâce après expiration (Jours)</label>
                    <div className="val-input-wrapper">
                      <input
                        type="number"
                        min="0"
                        value={editingPacks?.pack_1?.graceDays !== undefined ? editingPacks.pack_1.graceDays : 7}
                        onChange={(e) => setEditingPacks(prev => ({ ...prev, pack_1: { ...prev.pack_1, graceDays: Math.max(0, parseInt(e.target.value) || 0) } }))}
                      />
                      <span className="val-unit">Jours</span>
                    </div>
                  </div>

                  <div className="auth-field">
                    <label>Description du Pack</label>
                    <textarea
                      rows="2"
                      value={editingPacks?.pack_1?.description || ''}
                      onChange={(e) => setEditingPacks(prev => ({ ...prev, pack_1: { ...prev.pack_1, description: e.target.value } }))}
                    />
                  </div>
                </div>

                {/* PACK 2 CONFIG */}
                <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1.5px solid rgba(56, 189, 248, 0.3)', borderRadius: '14px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, color: '#38bdf8', fontSize: '1.1rem' }}>🥈 Pack 02 (Silver · Flex Pro & Contrôle)</h4>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>Pack Silver ⭐</span>
                  </div>

                  <div className="auth-field">
                    <label>Nom complet du Pack</label>
                    <input
                      type="text"
                      required
                      value={editingPacks?.pack_2?.name || ''}
                      onChange={(e) => setEditingPacks(prev => ({ ...prev, pack_2: { ...prev.pack_2, name: e.target.value } }))}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <div className="auth-field">
                      <label>Frais / Tarif (DT) *</label>
                      <div className="val-input-wrapper">
                        <input
                          type="number"
                          min="0"
                          required
                          value={editingPacks?.pack_2?.price !== undefined ? editingPacks.pack_2.price : 120}
                          onChange={(e) => setEditingPacks(prev => ({ ...prev, pack_2: { ...prev.pack_2, price: Math.max(0, parseFloat(e.target.value) || 0) } }))}
                        />
                        <span className="val-unit">DT</span>
                      </div>
                    </div>

                    <div className="auth-field">
                      <label>Durée d'abonnement (Mois) *</label>
                      <div className="val-input-wrapper">
                        <input
                          type="number"
                          min="1"
                          required
                          value={editingPacks?.pack_2?.durationMonths !== undefined ? editingPacks.pack_2.durationMonths : 12}
                          onChange={(e) => setEditingPacks(prev => ({ ...prev, pack_2: { ...prev.pack_2, durationMonths: Math.max(1, parseInt(e.target.value) || 12) } }))}
                        />
                        <span className="val-unit">Mois</span>
                      </div>
                    </div>
                  </div>

                  <div className="auth-field">
                    <label>Délai de grâce après expiration (Jours)</label>
                    <div className="val-input-wrapper">
                      <input
                        type="number"
                        min="0"
                        value={editingPacks?.pack_2?.graceDays !== undefined ? editingPacks.pack_2.graceDays : 7}
                        onChange={(e) => setEditingPacks(prev => ({ ...prev, pack_2: { ...prev.pack_2, graceDays: Math.max(0, parseInt(e.target.value) || 0) } }))}
                      />
                      <span className="val-unit">Jours</span>
                    </div>
                  </div>

                  <div className="auth-field">
                    <label>Description du Pack</label>
                    <textarea
                      rows="2"
                      value={editingPacks?.pack_2?.description || ''}
                      onChange={(e) => setEditingPacks(prev => ({ ...prev, pack_2: { ...prev.pack_2, description: e.target.value } }))}
                    />
                  </div>
                </div>

                {/* PACK 3 CONFIG */}
                <div style={{ background: 'rgba(236, 72, 153, 0.05)', border: '1.5px solid rgba(236, 72, 153, 0.4)', borderRadius: '14px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, color: '#f472b6', fontSize: '1.1rem' }}>🥇 Pack 03 (Gold VIP & Création Reel)</h4>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>Pack Gold 👑</span>
                  </div>

                  <div className="auth-field">
                    <label>Nom complet du Pack</label>
                    <input
                      type="text"
                      required
                      value={editingPacks?.pack_3?.name || ''}
                      onChange={(e) => setEditingPacks(prev => ({ ...prev, pack_3: { ...prev.pack_3, name: e.target.value } }))}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <div className="auth-field">
                      <label>Frais / Tarif (DT) *</label>
                      <div className="val-input-wrapper">
                        <input
                          type="number"
                          min="0"
                          required
                          value={editingPacks?.pack_3?.price !== undefined ? editingPacks.pack_3.price : 250}
                          onChange={(e) => setEditingPacks(prev => ({ ...prev, pack_3: { ...prev.pack_3, price: Math.max(0, parseFloat(e.target.value) || 0) } }))}
                        />
                        <span className="val-unit">DT</span>
                      </div>
                    </div>

                    <div className="auth-field">
                      <label>Durée d'abonnement (Mois) *</label>
                      <div className="val-input-wrapper">
                        <input
                          type="number"
                          min="1"
                          required
                          value={editingPacks?.pack_3?.durationMonths !== undefined ? editingPacks.pack_3.durationMonths : 12}
                          onChange={(e) => setEditingPacks(prev => ({ ...prev, pack_3: { ...prev.pack_3, durationMonths: Math.max(1, parseInt(e.target.value) || 12) } }))}
                        />
                        <span className="val-unit">Mois</span>
                      </div>
                    </div>
                  </div>

                  <div className="auth-field">
                    <label>Délai de grâce après expiration (Jours)</label>
                    <div className="val-input-wrapper">
                      <input
                        type="number"
                        min="0"
                        value={editingPacks?.pack_3?.graceDays !== undefined ? editingPacks.pack_3.graceDays : 7}
                        onChange={(e) => setEditingPacks(prev => ({ ...prev, pack_3: { ...prev.pack_3, graceDays: Math.max(0, parseInt(e.target.value) || 0) } }))}
                      />
                      <span className="val-unit">Jours</span>
                    </div>
                  </div>

                  <div className="auth-field">
                    <label>Description du Pack</label>
                    <textarea
                      rows="2"
                      value={editingPacks?.pack_3?.description || ''}
                      onChange={(e) => setEditingPacks(prev => ({ ...prev, pack_3: { ...prev.pack_3, description: e.target.value } }))}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-reserve-large full-width btn-magic" style={{ padding: '0.85rem' }}>
                💾 Enregistrer les Tarifs & Durées des Packs
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
