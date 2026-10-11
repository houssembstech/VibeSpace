import { useState } from 'react';

const COURSES_CATEGORIES = ['✨ Célébrer', '🌿 Se détendre', '📸 Shooting', '🎬 Regarder', '🎮 Jouer', '⛺ Camping'];

export default function EditSpotModal({
  spot,
  onClose,
  onSaveSpot,
  addonsList
}) {
  if (!spot) return null;

  const [title, setTitle] = useState(spot.title || '');
  const [description, setDescription] = useState(spot.description || '');
  const [category, setCategory] = useState(spot.category || '✨ Célébrer');
  const [location, setLocation] = useState(spot.location || '');
  const [pricePerHour, setPricePerHour] = useState(spot.price || spot.pricePerHour || 50);
  const [maxCapacity, setMaxCapacity] = useState(spot.capacity || spot.maxCapacity || 10);
  const [hostEmail, setHostEmail] = useState(spot.hostEmail || '');
  const [hostPhone, setHostPhone] = useState(spot.hostPhone || '');
  const [hostWhatsapp, setHostWhatsapp] = useState(spot.hostWhatsapp || '');
  const [newFiles, setNewFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Addons setup
  const initialAddons = spot.addons || addonsList || [];
  const [configuredAddons, setConfiguredAddons] = useState(initialAddons);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updatedData = {
      ...spot,
      title,
      description,
      category,
      location,
      price: Number(pricePerHour),
      pricePerHour: Number(pricePerHour),
      capacity: Number(maxCapacity),
      maxCapacity: Number(maxCapacity),
      hostEmail,
      hostPhone,
      hostWhatsapp,
      addons: configuredAddons
    };

    try {
      await onSaveSpot(updatedData, newFiles);
      alert('Espace mis à jour avec succès ! ✨');
      onClose();
    } catch (err) {
      alert('Erreur lors de la mise à jour : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content host-modal-box edit-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header-section">
          <h2>✏️ Modifier l'Espace</h2>
          <p>Mettez à jour les photos, coordonnées, description et services de votre spot.</p>
        </div>

        <form onSubmit={handleSubmit} className="host-flow-form">
          {/* Identité */}
          <div className="host-section">
            <h3><span className="step-num">1</span> Informations Générales</h3>
            <div className="host-grid">
              <div className="bb-col">
                <label>NOM DU SPOT *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="bb-col">
                <label>ADRESSE COMPLÈTE *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="bb-col mt-input">
              <label>CATÉGORIE *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="category-select"
              >
                {COURSES_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Coordonnées */}
          <div className="host-section">
            <h3><span className="step-num">2</span> Coordonnées de Contact</h3>
            <div className="host-grid-3">
              <div className="bb-col">
                <label>EMAIL DE CONTACT *</label>
                <input
                  type="email"
                  required
                  value={hostEmail}
                  onChange={(e) => setHostEmail(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.8rem', borderRadius: '8px' }}
                />
              </div>
              <div className="bb-col">
                <label>N° TÉLÉPHONE *</label>
                <input
                  type="tel"
                  required
                  value={hostPhone}
                  onChange={(e) => setHostPhone(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.8rem', borderRadius: '8px' }}
                />
              </div>
              <div className="bb-col">
                <label>WHATSAPP</label>
                <input
                  type="tel"
                  value={hostWhatsapp}
                  onChange={(e) => setHostWhatsapp(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.8rem', borderRadius: '8px' }}
                />
              </div>
            </div>
          </div>

          {/* Tarification & Capacité */}
          <div className="host-section">
            <h3><span className="step-num">3</span> Tarifs & Capacité</h3>
            <div className="host-grid">
              <div className="bb-col">
                <label>PRIX / HEURE (DT) *</label>
                <input
                  type="number"
                  required
                  min="5"
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(e.target.value)}
                />
              </div>
              <div className="bb-col">
                <label>CAPACITÉ MAX (PERSONNES) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="host-section">
            <h3><span className="step-num">4</span> Description Détaillée</h3>
            <div className="bb-col">
              <label>DESCRIPTION COMPLÈTE *</label>
              <textarea
                rows="4"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez l'ambiance, les équipements, les règles..."
              />
            </div>
          </div>

          {/* Photos */}
          <div className="host-section">
            <h3><span className="step-num">5</span> Photos de l'espace</h3>
            <p className="sub-hint">Vous pouvez importer de nouvelles photos pour remplacer les actuelles (Max 5 photos).</p>
            <div className="file-drop-area">
              {newFiles.length > 0 ? (
                <div style={{ color: 'var(--accent-1)' }}>
                  <h4>{newFiles.length} nouvelle(s) photo(s) sélectionnée(s) ! ✨</h4>
                  <p>Elles remplaceront les photos actuelles lors de la sauvegarde.</p>
                </div>
              ) : (
                <>
                  <div className="current-photo-preview">
                    <img src={spot.img || spot.imageUrl || (spot.images && spot.images[0])} alt="Actuelle" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', margin: '0 auto 0.5rem auto' }} />
                    <p>Photo actuelle en ligne</p>
                  </div>
                  <h4>Cliquez pour changer les photos</h4>
                </>
              )}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setNewFiles(Array.from(e.target.files))}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-reserve-large full-width btn-magic"
          >
            {loading ? 'Sauvegarde en cours... ⏳' : 'Enregistrer les modifications 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}
