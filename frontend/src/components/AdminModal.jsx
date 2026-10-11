import { useState } from 'react';

export default function AdminModal({
  isOpen,
  onClose,
  spotsList,
  usersList,
  onUpdateSpotStatus,
  onDeleteSpot,
  onToggleCanEdit,
  onCreateUser
}) {
  const [activeTab, setActiveTab] = useState('spots'); // 'spots' | 'users'
  const [spotsFilter, setSpotsFilter] = useState('all'); // 'all' | 'pending' | 'approved'
  const [showCreateUser, setShowCreateUser] = useState(false);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('responsable');
  const [newCanEdit, setNewCanEdit] = useState(false);

  if (!isOpen) return null;

  // Spots counts
  const pendingSpots = spotsList.filter(s => s.status === 'pending');
  const approvedSpots = spotsList.filter(s => !s.status || s.status === 'approved');

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
      email: newEmail.trim().toLowerCase(),
      phone: newPhone,
      password: newPassword || '123456',
      role: newRole,
      canEdit: newCanEdit || newRole === 'admin'
    });

    setShowCreateUser(false);
    setNewName('');
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
              <p>Gestion globale des demandes de spots et des comptes responsables</p>
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
                        <p className="admin-spot-loc">📍 {spot.location}</p>
                        <p className="admin-spot-price">{spot.price} DT/heure • Max {spot.capacity} pers</p>

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

        {/* TAB 2: Users & Managers */}
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
                    <th>Droit de modification</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map(u => {
                    const userId = u._id || u.id;
                    const isAdmin = u.role === 'admin';
                    const canEdit = u.canEdit || isAdmin;

                    return (
                      <tr key={userId}>
                        <td>
                          <div className="user-cell">
                            <strong>{u.name}</strong>
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
                          <span className={`edit-access-badge ${canEdit ? 'allowed' : 'locked'}`}>
                            {canEdit ? '🟢 Autorisé à modifier' : '🔴 Modification bloquée'}
                          </span>
                        </td>
                        <td>
                          {isAdmin ? (
                            <span className="admin-immutable">Accès complet</span>
                          ) : (
                            <button
                              className={`btn-access-toggle ${canEdit ? 'revoke' : 'grant'}`}
                              onClick={() => onToggleCanEdit(userId, canEdit)}
                            >
                              {canEdit ? "Bloquer l'accès 🔒" : "Donner l'accès 🔓"}
                            </button>
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
