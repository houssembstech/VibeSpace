export default function MySpotsModal({
  isOpen,
  onClose,
  spotsList,
  currentUser,
  onEditSpot,
  onAddNewSpot,
  onDeleteSpot
}) {
  if (!isOpen || !currentUser) return null;

  const isAdmin = currentUser.role === 'admin';
  const mySpots = spotsList.filter(s => {
    if (isAdmin) return true;
    return s.hostEmail && s.hostEmail.toLowerCase() === currentUser.email.toLowerCase();
  });

  const canEdit = currentUser.canEdit || isAdmin;

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

        {/* Edit Permission Status Banner */}
        <div className={`permission-banner ${canEdit ? 'granted' : 'locked'}`}>
          {canEdit ? (
            <p>
              ✨ <strong>Droit de modification actif :</strong> Vous pouvez mettre à jour les photos, coordonnées, descriptions et services de vos espaces.
            </p>
          ) : (
            <p>
              🔒 <strong>Modification en attente :</strong> L'administrateur n'a pas encore validé vos droits d'édition. Contactez l'admin (<strong>houssembs.tech@gmail.com</strong>) pour activer la modification de vos fiches.
            </p>
          )}
        </div>

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
                <div key={spot.id || spot._id} className="my-spot-item-card">
                  <div className="my-spot-item-img">
                    <img src={spot.img || spot.imageUrl || (spot.images && spot.images[0])} alt={spot.title} />
                    <span className={`my-spot-badge ${isPending ? 'pending' : 'approved'}`}>
                      {isPending ? '⏳ En attente de validation' : '✅ En ligne & Réservable'}
                    </span>
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
                        <button className="btn-edit-spot-action disabled" disabled title="Modification verrouillée par l'administrateur">
                          🔒 Modification bloquée
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
