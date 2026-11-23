import { useState } from 'react';

const COURSES_CATEGORIES = ['✨ Célébrer', '🌿 Se détendre', '📸 Shooting', '🎬 Regarder', '🎮 Jouer', '⛺ Camping'];
const AUDIENCE_OPTIONS = ['Famille', 'Couple', 'Adultes (+18)', 'Enfants', 'Animaux (Chien/Chat)'];

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
  const [pricingType, setPricingType] = useState(
    spot.pricingType || (spot.priceFullDay > 0 && (!spot.pricePerHour || spot.pricePerHour === 0) ? 'day' : 'hour')
  );
  const [pricePerHour, setPricePerHour] = useState(
    spot.pricePerHour !== undefined && spot.pricePerHour !== null
      ? spot.pricePerHour
      : (spot.pricingType === 'day' ? '' : (spot.price || 50))
  );
  const [priceHalfDay, setPriceHalfDay] = useState(spot.priceHalfDay || '');
  const [priceFullDay, setPriceFullDay] = useState(
    spot.priceFullDay || (spot.pricingType === 'day' || (spot.priceFullDay > 0 && !spot.pricePerHour) ? (spot.price || spot.pricePerHour || '') : '')
  );
  const [includedGuests, setIncludedGuests] = useState(spot.includedGuests || spot.capacity || spot.maxCapacity || 10);
  const [isUnlimitedCapacity, setIsUnlimitedCapacity] = useState(Boolean(spot.isUnlimitedCapacity));
  const [isPremium, setIsPremium] = useState(Boolean(spot.isPremium));
  const [rating, setRating] = useState(spot.rating !== undefined ? spot.rating : 5.0);
  const [maxCapacity, setMaxCapacity] = useState(spot.maxCapacity && spot.maxCapacity < 9000 ? spot.maxCapacity : (spot.capacity || 10));
  const [extraGuestPrice, setExtraGuestPrice] = useState(spot.extraGuestPrice || 0);
  const [hostEmail, setHostEmail] = useState(spot.hostEmail || '');
  const [hostPhone, setHostPhone] = useState(spot.hostPhone || '');
  const [hostWhatsapp, setHostWhatsapp] = useState(spot.hostWhatsapp || '');
  const [newFiles, setNewFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Audiences (Qui peut venir)
  const [allowedAudiences, setAllowedAudiences] = useState(() => {
    if (spot.allowedAudiences && Array.isArray(spot.allowedAudiences) && spot.allowedAudiences.length > 0) {
      return spot.allowedAudiences;
    }
    return ['Famille', 'Couple', 'Adultes (+18)'];
  });
  const [animalFee, setAnimalFee] = useState(spot.animalFee !== undefined ? spot.animalFee : 13);

  const toggleAudience = (aud) => {
    if (allowedAudiences.includes(aud)) {
      setAllowedAudiences(allowedAudiences.filter(a => a !== aud));
    } else {
      setAllowedAudiences([...allowedAudiences, aud]);
    }
  };

  // Addons setup (Ajoutez une touche personnelle)
  const [activeAddons, setActiveAddons] = useState(() => {
    const map = {};
    const baseList = addonsList || [];
    baseList.forEach(a => {
      const existing = (spot.addons || []).find(sa => sa.id === a.id);
      map[a.id] = {
        enabled: Boolean(existing),
        price: existing ? existing.price : a.price,
        name: a.name
      };
    });
    return map;
  });

  const toggleAddon = (id) => {
    setActiveAddons(prev => ({
      ...prev,
      [id]: { ...prev[id], enabled: !prev[id]?.enabled }
    }));
  };

  const updateAddonPrice = (id, newPrice) => {
    setActiveAddons(prev => ({
      ...prev,
      [id]: { ...prev[id], price: Math.max(0, parseFloat(newPrice) || 0) }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const parsedIncludedGuests = Number(includedGuests || 10);
    const parsedMax = isUnlimitedCapacity ? 99999 : Math.max(parsedIncludedGuests, Number(maxCapacity || parsedIncludedGuests));

    const effectivePriceFullDay = Number(priceFullDay || 0);
    const effectivePricePerHour = Number(pricePerHour || 0);
    const mainPrice = pricingType === 'day' ? (effectivePriceFullDay || effectivePricePerHour) : (effectivePricePerHour || effectivePriceFullDay);

    const finalAddons = (addonsList || [])
      .filter(a => activeAddons[a.id]?.enabled)
      .map(a => ({
        id: a.id,
        name: a.name,
        price: Number(activeAddons[a.id]?.price || a.price)
      }));

    const updatedData = {
      ...spot,
      title,
      description,
      category,
      location,
      pricingType,
      price: mainPrice,
      pricePerHour: effectivePricePerHour,
      priceHalfDay: Number(priceHalfDay || 0),
      priceFullDay: effectivePriceFullDay,
      includedGuests: parsedIncludedGuests,
      isUnlimitedCapacity: isUnlimitedCapacity,
      maxCapacity: parsedMax,
      capacity: parsedMax,
      extraGuestPrice: Number(extraGuestPrice || 0),
      hostEmail,
      hostPhone,
      hostWhatsapp,
      isPremium,
      rating: Math.min(5.0, Math.max(1.0, parseFloat(rating) || 5.0)),
      allowedAudiences,
      animalFee: Number(animalFee || 13),
      addons: finalAddons
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
      <div className="modal-content host-modal-box edit-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px', maxHeight: '92vh', overflowY: 'auto' }}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header-section">
          <h2>✏️ Modifier l'Espace</h2>
          <p>Mettez à jour les photos, coordonnées, tarifs, public autorisé, touches personnelles et services de votre spot.</p>
        </div>

        <form onSubmit={handleSubmit} className="host-flow-form">
          {/* Section 1: Informations Générales */}
          <div className="host-section">
            <h3><span className="step-num">1</span> Informations Générales</h3>
            <div className="host-grid">
              <div className="bb-col">
                <label>NOM DU SPOT (🔒 Certifié & Fixe)</label>
                <input
                  type="text"
                  required
                  value={title}
                  readOnly
                  disabled
                  title="Le nom de l'espace est certifié et ne peut pas être modifié."
                  style={{ opacity: 0.75, cursor: 'not-allowed', background: 'rgba(255, 255, 255, 0.05)' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🔒 Le nom de votre espace est certifié et reste immuable.</span>
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

            <div className="host-grid-3 mt-input">
              <div className="bb-col">
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

              <div className="bb-col">
                <label>ÉVALUATION / NOTE (★ 1.0 à 5.0)</label>
                <div className="val-input-wrapper">
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  />
                  <span className="val-unit">★</span>
                </div>
              </div>

              <div className="bb-col" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', padding: '0.65rem 0.9rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '10px', width: '100%', boxSizing: 'border-box' }}>
                  <input 
                    type="checkbox" 
                    checked={isPremium} 
                    onChange={(e) => setIsPremium(e.target.checked)} 
                    style={{ width: '18px', height: '18px', accentColor: '#f59e0b', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: '700' }}>
                    👑 Sélection Premium (Carrousel)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Coordonnées de Contact */}
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
                />
              </div>
              <div className="bb-col">
                <label>N° TÉLÉPHONE *</label>
                <input
                  type="tel"
                  required
                  value={hostPhone}
                  onChange={(e) => setHostPhone(e.target.value)}
                />
              </div>
              <div className="bb-col">
                <label>WHATSAPP</label>
                <input
                  type="tel"
                  value={hostWhatsapp}
                  onChange={(e) => setHostWhatsapp(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Tarification & Capacité */}
          <div className="host-section">
            <h3><span className="step-num">3</span> Tarifs & Capacité</h3>

            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
                FORMULE PRINCIPALE DU PACK *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setPricingType('hour')}
                  style={{
                    padding: '0.65rem 0.9rem',
                    borderRadius: '8px',
                    border: pricingType === 'hour' ? '2px solid var(--accent-1, #00f2fe)' : '1px solid rgba(255,255,255,0.15)',
                    background: pricingType === 'hour' ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255,255,255,0.04)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  ⏱️ Par Heure (DT/h)
                </button>
                <button
                  type="button"
                  onClick={() => setPricingType('day')}
                  style={{
                    padding: '0.65rem 0.9rem',
                    borderRadius: '8px',
                    border: pricingType === 'day' ? '2px solid var(--accent-1, #00f2fe)' : '1px solid rgba(255,255,255,0.15)',
                    background: pricingType === 'day' ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255,255,255,0.04)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  📅 Par Jour (DT/j)
                </button>
              </div>
            </div>

            <div className="host-grid-3">
              <div className="bb-col">
                <label>
                  {pricingType === 'day' ? 'PRIX / HEURE (OPTIONNEL)' : 'PRIX / HEURE (DT) *'}
                </label>
                <div className="val-input-wrapper">
                  <input
                    type="number"
                    required={pricingType === 'hour'}
                    min={pricingType === 'hour' ? '1' : '0'}
                    placeholder={pricingType === 'day' ? 'Optionnel' : 'Ex: 60'}
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(e.target.value)}
                  />
                  <span className="val-unit">DT</span>
                </div>
              </div>
              <div className="bb-col">
                <label>DEMI-JOURNÉE (DT)</label>
                <div className="val-input-wrapper">
                  <input
                    type="number"
                    min="0"
                    placeholder="Ex: 150"
                    value={priceHalfDay}
                    onChange={(e) => setPriceHalfDay(e.target.value)}
                  />
                  <span className="val-unit">DT</span>
                </div>
              </div>
              <div className="bb-col">
                <label>
                  {pricingType === 'day' ? 'PRIX / JOURNÉE (DT) *' : 'JOURNÉE (DT)'}
                </label>
                <div className="val-input-wrapper">
                  <input
                    type="number"
                    required={pricingType === 'day'}
                    min={pricingType === 'day' ? '1' : '0'}
                    placeholder="Ex: 280"
                    value={priceFullDay}
                    onChange={(e) => setPriceFullDay(e.target.value)}
                  />
                  <span className="val-unit">DT</span>
                </div>
              </div>
            </div>

            <div className="host-grid mt-input">
              <div className="bb-col">
                <label>CAPACITÉ DU PACK (PERSONNES INCLUSES) *</label>
                <div className="val-input-wrapper">
                  <input
                    type="number"
                    required
                    min="1"
                    value={includedGuests}
                    onChange={(e) => setIncludedGuests(e.target.value)}
                  />
                  <span className="val-unit">Pers</span>
                </div>
                <span className="sub-hint" style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>
                  Invités inclus dans le tarif de base sans aucun supplément
                </span>
              </div>

              <div className="bb-col">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>CAPACITÉ MAX DE L'ESPACE *</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--accent-1)' }}>
                    <input
                      type="checkbox"
                      checked={isUnlimitedCapacity}
                      onChange={(e) => setIsUnlimitedCapacity(e.target.checked)}
                    />
                    <span>♾️ Illimitée</span>
                  </label>
                </div>
                <div className="val-input-wrapper">
                  <input
                    type="number"
                    disabled={isUnlimitedCapacity}
                    required={!isUnlimitedCapacity}
                    min={includedGuests || 1}
                    value={isUnlimitedCapacity ? '' : maxCapacity}
                    placeholder={isUnlimitedCapacity ? '♾️ Capacité illimitée' : 'Ex: 30'}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                    style={{ opacity: isUnlimitedCapacity ? 0.6 : 1 }}
                  />
                  <span className="val-unit">Pers</span>
                </div>
              </div>
            </div>

            <div className="bb-col mt-input">
              <label>FRAIS PAR INVITÉ SUPPLÉMENTAIRE (AU-DELÀ DU PACK)</label>
              <div className="val-input-wrapper" style={{ maxWidth: '280px' }}>
                <input
                  type="number"
                  min="0"
                  value={extraGuestPrice}
                  onChange={(e) => setExtraGuestPrice(e.target.value)}
                  placeholder="0"
                />
                <span className="val-unit">DT / invité</span>
              </div>
            </div>
          </div>

          {/* Section 4: Qui peut venir ? (Public Autorisé) */}
          <div className="host-section">
            <h3><span className="step-num">4</span> Qui peut venir ? (Public Cible Autorisé)</h3>
            <p className="sm-info mb-info" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.9rem' }}>
              Sélectionnez les publics acceptés dans votre espace.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              {AUDIENCE_OPTIONS.map(aud => {
                const isSelected = allowedAudiences.includes(aud);
                return (
                  <label
                    key={aud}
                    onClick={() => toggleAudience(aud)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1rem',
                      borderRadius: '10px',
                      border: isSelected ? '1.5px solid var(--accent-1, #00f2fe)' : '1px solid rgba(255,255,255,0.15)',
                      background: isSelected ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255,255,255,0.04)',
                      color: isSelected ? '#fff' : '#cbd5e1',
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      fontWeight: isSelected ? '600' : 'normal',
                      userSelect: 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Controlled by label click
                      style={{ accentColor: 'var(--accent-1, #00f2fe)', cursor: 'pointer' }}
                    />
                    <span>{aud}</span>
                  </label>
                );
              })}
            </div>

            {allowedAudiences.includes('Animaux (Chien/Chat)') && (
              <div className="bb-col" style={{ maxWidth: '280px', marginTop: '0.5rem' }}>
                <label>FRAIS POUR ANIMAUX (DT)</label>
                <div className="val-input-wrapper">
                  <input
                    type="number"
                    min="0"
                    value={animalFee}
                    onChange={(e) => setAnimalFee(e.target.value)}
                    placeholder="13"
                  />
                  <span className="val-unit">DT</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Services Optionnels Extras (Ajoutez une touche personnelle) */}
          <div className="host-section">
            <h3><span className="step-num">5</span> Ajoutez une touche personnelle (Services Optionnels)</h3>
            <p className="sm-info mb-info" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.9rem' }}>
              Activez les options proposées aux invités et ajustez votre tarif pour chacune.
            </p>
            <div className="host-addons-grid">
              {(addonsList || []).map(addon => {
                const current = activeAddons[addon.id] || { enabled: false, price: addon.price, name: addon.name };
                return (
                  <div key={addon.id} className={`host-addon-card ${current.enabled ? 'active' : ''}`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: current.enabled ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    border: current.enabled ? '1.5px solid var(--accent-1, #00f2fe)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    gap: '0.8rem',
                    transition: 'all 0.2s ease'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', flex: 1, margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={current.enabled}
                        onChange={() => toggleAddon(addon.id)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-1, #00f2fe)', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.9rem', fontWeight: current.enabled ? 600 : 400, color: current.enabled ? '#fff' : '#cbd5e1' }}>
                        {addon.name}
                      </span>
                    </label>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      opacity: current.enabled ? 1 : 0.4,
                      pointerEvents: current.enabled ? 'auto' : 'none'
                    }}>
                      <input
                        type="number"
                        min="0"
                        value={current.price}
                        onChange={(e) => updateAddonPrice(addon.id, e.target.value)}
                        style={{
                          width: '72px',
                          padding: '0.4rem 0.5rem',
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '6px',
                          color: '#fff',
                          textAlign: 'right',
                          fontSize: '0.88rem'
                        }}
                      />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DT</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 6: Description */}
          <div className="host-section">
            <h3><span className="step-num">6</span> Description Détaillée</h3>
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

          {/* Section 7: Photos */}
          <div className="host-section">
            <h3><span className="step-num">7</span> Photos de l'espace</h3>
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
