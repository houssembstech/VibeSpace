import { useState } from 'react';
import { computeSubscription } from './MySpotsModal';

export default function AdminModal({
  isOpen,
  onClose,
  spotsList,
  usersList,
  onUpdateSpotStatus,
  onDeleteSpot,
  onToggleCanEdit,
  onCreateUser,
  onRenewPackAdmin,
  onApproveRenewal,
  onRejectRenewal
}) {
  const [activeTab, setActiveTab] = useState('spots'); // 'spots' | 'renewals' | 'users'
  const [spotsFilter, setSpotsFilter] = useState('all'); // 'all' | 'pending' | 'approved'
  const [showCreateUser, setShowCreateUser] = useState(false);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('responsable');
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
      canEdit: newCanEdit || newRole === 'admin'
    });

    setShowCreateUser(false);
    setNewName('');
    setNewSpaceName('');
    setNewEmail('');
    setNewPhone('');
    setNewPassword('');
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

                  return (
                    <div key={spot.id || spot._id} className="admin-spot-card">
                      <div className="admin-spot-img-wrap">
                        <img src={spot.img || spot.imageUrl || (spot.images && spot.images[0])} alt={spot.title} />
                        <span className={`admin-status-tag ${isPending ? 'pending' : 'approved'}`}>
                          {isPending ? '⏳ En attente' : '✅ En ligne'}
                        </span>
                      </div>

                      <div className="admin-spot-info">
                        <div className="admin-spot-title-row">
                          <h4>{spot.title}</h4>
                          <span className="admin-spot-cat">{spot.category}</span>
                        </div>
                        <p className="admin-spot-price">
                          {spot.price || spot.pricePerHour} DT/heure
                          {spot.priceHalfDay > 0 && ` • ${spot.priceHalfDay} DT/½j`}
                          {spot.priceFullDay > 0 && ` • ${spot.priceFullDay} DT/j`}
                          {` • Max ${spot.capacity || spot.maxCapacity} pers`}
                        </p>

                        <div className="admin-host-contacts">
                          <span>👤 Hôte : <strong>{spot.hostEmail || 'Non spécifié'}</strong></span>
                          {spot.hostPhone && <span>📞 Tél : {spot.hostPhone}</span>}
                          {spot.hostWhatsapp && <span>💬 WA : {spot.hostWhatsapp}</span>}
                        </div>
                      </div>

                      <div className="admin-spot-actions">
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
                <p>Vérifiez la réception du règlement (70 DT ou 120 DT) avant de valider l'abonnement annuel du responsable.</p>
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
                  const isPack2 = req.requestedPack === 'pack_2';
                  const sub = computeSubscription(u);
                  const dateStr = req.requestedAt ? new Date(req.requestedAt).toLocaleString('fr-FR') : 'Récemment';

                  return (
                    <div key={u._id || u.id} className="renewal-request-card" style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1.5px solid rgba(245, 158, 11, 0.4)',
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
                              Formule demandée : <strong>{isPack2 ? '⭐ Pack 02 Flex Pro' : '📦 Pack 01 Visibilité Directe'}</strong>
                            </div>
                            <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: '1rem' }}>
                              Montant à vérifier : {isPack2 ? '120 DT' : '70 DT'}
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
                          ✅ Valider Paiement & Activer (1 an)
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
                    <th>Validité Abonnement (1 an)</th>
                    <th>Droit de modification</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map(u => {
                    const userId = u._id || u.id;
                    const isAdmin = u.role === 'admin';
                    const canEdit = u.canEdit || isAdmin;
                    const isPack2 = u.pack === 'pack_2' || (u.packPrice === 120);
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
                              <span className={`my-spot-badge ${isPack2 ? 'approved' : 'pending'}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}>
                                {isPack2 ? '👑 Pack Pro (120 DT)' : '📦 Pack 01 (70 DT)'}
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
                                    ⏳ Demande: {u.renewalRequest.requestedPack === 'pack_2' ? 'Pro 120DT' : '01 70DT'}
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
                                    title="Valider le paiement et activer pour 1 an"
                                    onClick={() => onApproveRenewal(u.email, u.renewalRequest.requestedPack)}
                                  >
                                    ✅ Valider ({u.renewalRequest.requestedPack === 'pack_2' ? '120DT' : '70DT'})
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
                                      title="Renouveler directement pour 1 an"
                                      onClick={() => onRenewPackAdmin(u.email)}
                                    >
                                      🔄 +1 an
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
      </div>
    </div>
  );
}
