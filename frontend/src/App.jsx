import { useState, useEffect } from 'react';

const COURSES_CATEGORIES = ['🔥 Tout', '✨ Célébrer', '🌿 Se détendre', '📸 Shooting', '🎬 Regarder', '🎮 Jouer', '⛺ Camping'];

const ADDONS_LIST = [
  { id: 'frigo', name: 'Réfrigérateur', price: 29 },
  { id: 'cuisine', name: 'Cuisine', price: 89 },
  { id: 'bbq', name: 'Barbecue équipé', price: 59 },
  { id: 'pingpong', name: 'Ping-pong', price: 26 },
  { id: 'enceinte', name: 'Enceinte Bluetooth', price: 39 },
  { id: 'brassards', name: 'Brassards bébé', price: 19 },
  { id: 'cafe', name: 'Café', price: 6 },
  { id: 'soda', name: 'Canette de soda', price: 4 },
  { id: 'eau', name: 'Eau 1,5 L', price: 3 },
  { id: 'serviettes', name: 'Serviettes supplémentaires', price: 5 },
  { id: 'jus', name: 'Jus frais 1 L', price: 6 },
  { id: 'glaciere', name: 'Glacière', price: 24 },
  { id: 'bouee', name: 'Bouée', price: 15 },
  { id: 'jeux', name: 'Jeux de société', price: 29 },
  { id: 'projecteur', name: 'Projecteur & écran', price: 55 },
  { id: 'couverts', name: 'Couverts & vaisselle', price: 21 },
  { id: 'salon', name: 'Salon privé', price: 195 },
];

const SPOTS = [
  {
    id: 1,
    title: 'Neon Bunker 90s',
    category: '🎮 Jouer',
    img: 'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=800&q=80',
    location: 'Tunis, Lac 2',
    capacity: 8,
    includedGuests: 4,
    extraGuestPrice: 5,
    price: 45,
    rating: 4.9,
    description: "L'espace parfait pour vos gaming sessions & potes. Cet espace est entièrement privé et sans vis-à-vis.",
    idealFor: ['Jouer', 'Se retrouver', 'Se détendre']
  },
  {
    id: 2,
    title: 'Rooftop private dinner & shooting',
    category: '✨ Célébrer',
    img: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80',
    location: 'Sidi Bou Saïd',
    capacity: 15,
    includedGuests: 7,
    extraGuestPrice: 7,
    price: 69,
    rating: 4.8,
    description: "Cet espace est entièrement privé et sans vis-à-vis. L'espace parfait pour vos dates & shootings.",
    idealFor: ['Célébrer', 'Se retrouver', 'Jouer', 'Se détendre', 'Shooting', 'Étudier', 'Travailler']
  },
  {
    id: 3,
    title: 'Secret Forest Camp',
    category: '⛺ Camping',
    img: 'https://images.unsplash.com/photo-1504280650220-41315b493774?auto=format&fit=crop&w=800&q=80',
    location: 'Zaghouan',
    capacity: 12,
    includedGuests: 6,
    extraGuestPrice: 10,
    price: 25,
    rating: 5.0,
    description: "Spot de camping isolé et privé. Cet espace est entièrement privé et sans vis-à-vis.",
    idealFor: ['Se détendre', 'Se retrouver', 'Célébrer']
  },
  {
    id: 4,
    title: 'Chill Room 4K🍿',
    category: '🎬 Regarder',
    img: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80',
    location: "L'Aouina",
    capacity: 6,
    includedGuests: 4,
    extraGuestPrice: 6,
    price: 30,
    rating: 4.7,
    description: "Home cinéma entièrement privatisé. Cet espace est entièrement privé et sans vis-à-vis.",
    idealFor: ['Regarder', 'Se détendre', 'Se retrouver']
  }
];

function App() {
  const [activeCategory, setActiveCategory] = useState('🔥 Tout');
  const [likedSpots, setLikedSpots] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpot, setSelectedSpot] = useState(null);

  // Booking details state
  const [date, setDate] = useState('2026-10-09');
  const [startTime, setStartTime] = useState('23:00');
  const [endTime, setEndTime] = useState('00:00');
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [dogs, setDogs] = useState(0);
  const [addons, setAddons] = useState(
    ADDONS_LIST.reduce((acc, addon) => ({ ...acc, [addon.id]: 0 }), {})
  );

  const toggleLike = (e, id) => {
    e.stopPropagation();
    setLikedSpots(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const updateAddon = (id, delta) => {
    setAddons(prev => ({
      ...prev,
      [id]: Math.max(0, prev[id] + delta)
    }));
  };

  // Calculations
  const durationHours = 1; // Simplified for UI, normaly derived from startTime and endTime
  const totalPeople = adults + kids;
  
  let extraGuestsCost = 0;
  if (selectedSpot && totalPeople > selectedSpot.includedGuests) {
    extraGuestsCost = (totalPeople - selectedSpot.includedGuests) * selectedSpot.extraGuestPrice * durationHours;
  }
  
  const spotBaseCost = selectedSpot ? selectedSpot.price * durationHours : 0;
  const dogsCost = dogs * 13 * durationHours;
  const addonsCost = ADDONS_LIST.reduce((total, addon) => total + (addons[addon.id] * addon.price), 0);
  const finalTotal = spotBaseCost + extraGuestsCost + dogsCost + addonsCost;

  const filteredSpots = SPOTS.filter(spot => {
    const matchCategory = activeCategory === '🔥 Tout' || spot.category === activeCategory;
    const matchSearch = spot.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        spot.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <>
      {/* Background glow and Navigation ... */}
      <nav className="navbar">
        <div className="logo">VibeSpace.</div>
        <div className="nav-right">
          <button className="btn-host">Ajouter ton spot ⚡</button>
          <div className="profile-pic">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Profile" />
          </div>
        </div>
      </nav>

      <header className="hero">
        <h1 className="glitch-text">Quel est le <span className="text-gradient">vibe</span> d'aujourd'hui ?</h1>
        <p>Réserve des espaces privés pour quelques heures. Zéro prise de tête.</p>
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Où veux-tu te poser (ex: Tunis, Sunset...) ?" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <section className="categories-section">
        <div className="categories-scroll">
          {COURSES_CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <main className="spots-container">
        {filteredSpots.map(spot => (
          <article className="spot-card" key={spot.id} onClick={() => setSelectedSpot(spot)} style={{cursor: 'pointer'}}>
            <div className="spot-image">
              <img src={spot.img} alt={spot.title} />
              <div className="spot-badge">{spot.category}</div>
              <button 
                className={`btn-like ${likedSpots[spot.id] ? 'liked' : ''}`}
                onClick={(e) => toggleLike(e, spot.id)}
              >
                <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </button>
            </div>
            <div className="spot-info">
              <div className="spot-header">
                <h2>{spot.title}</h2>
                <div className="spot-rating">★ {spot.rating}</div>
              </div>
              <p className="spot-location">📍 {spot.location}</p>
              <div className="spot-details">
                <span className="spot-capacity">👥 Jusqu'à {spot.capacity} pers.</span>
                <span className="spot-price"><strong className="price-gradient">{spot.price} DT</strong> / h</span>
              </div>
              <button className="btn-book">Consulter</button>
            </div>
          </article>
        ))}
      </main>

      {/* Spot Detail Booking Modal */}
      {selectedSpot && (
        <div className="modal-overlay" onClick={() => setSelectedSpot(null)}>
          <div className="modal-content booking-flow" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedSpot(null)}>✕</button>
            <div className="modal-image">
              <img src={selectedSpot.img} alt={selectedSpot.title} />
            </div>
            
            <div className="modal-body">
              <p className="modal-category-location">{selectedSpot.category.split(' ')[1].toUpperCase()} · {selectedSpot.location.toUpperCase()}</p>
              <h2 className="modal-big-title">{selectedSpot.title}</h2>
              <p className="modal-description-sub">{selectedSpot.description}</p>
              
              <div className="ideal-for-section">
                <h3>IDÉAL POUR</h3>
                <div className="modal-tags">
                  {selectedSpot.idealFor.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="booking-price-header">
                <span className="b-price"><strong className="price-gradient">{selectedSpot.price} DT</strong> /HR</span>
                <span className="b-spots-remaining">🔔 few spots remaining</span>
              </div>

              <div className="booking-box">
                <div className="bb-row">
                  <div className="bb-col">
                    <label>DATE</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                  </div>
                </div>
                <div className="bb-row">
                   <div className="bb-col">
                    <label>CRÉNEAU</label>
                    <div className="time-selects">
                      <select value={startTime} onChange={e => setStartTime(e.target.value)}>
                        <option>22:00</option>
                        <option>23:00</option>
                      </select>
                      <span>–</span>
                      <select value={endTime} onChange={e => setEndTime(e.target.value)}>
                        <option>23:00</option>
                        <option>00:00</option>
                      </select>
                      <span className="duration-pill">{durationHours} H</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="guests-section">
                <h3>QUI VIENT ?</h3>
                <div className="counter-row">
                  <div>Adultes</div>
                  <div className="counter-controls">
                    <button onClick={() => setAdults(Math.max(1, adults - 1))}>-</button>
                    <span>{adults}</span>
                    <button onClick={() => setAdults(adults + 1)}>+</button>
                  </div>
                </div>
                <div className="counter-row">
                  <div>Enfants</div>
                  <div className="counter-controls">
                    <button onClick={() => setKids(Math.max(0, kids - 1))}>-</button>
                    <span>{kids}</span>
                    <button onClick={() => setKids(kids + 1)}>+</button>
                  </div>
                </div>
                <div className="counter-row">
                  <div>
                    Chiens
                    <div className="sm-info">13 DT / chien / heure</div>
                  </div>
                  <div className="counter-controls">
                    <button onClick={() => setDogs(Math.max(0, dogs - 1))}>-</button>
                    <span>{dogs}</span>
                    <button onClick={() => setDogs(dogs + 1)}>+</button>
                  </div>
                </div>
                <p className="capacity-warning">
                  Prix pour {selectedSpot.includedGuests} personnes ; au-delà, {selectedSpot.extraGuestPrice} DT / heure / personne, jusqu'à {selectedSpot.capacity} personnes maximum.
                </p>
              </div>

              <div className="addons-section">
                <h3>Ajoutez une touche personnelle</h3>
                <p className="sm-info">Optionnel — améliorez votre expérience.</p>
                
                {ADDONS_LIST.map(addon => (
                  <div className="counter-row addon-row" key={addon.id}>
                    <div>
                      {addon.name}
                      <div className="sm-info">{addon.price} DT / unité</div>
                    </div>
                    <div className="counter-controls">
                      <button onClick={() => updateAddon(addon.id, -1)}>-</button>
                      <span>{addons[addon.id]}</span>
                      <button onClick={() => updateAddon(addon.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="recap-section">
                <h3>RÉCAPITULATIF</h3>
                <div className="recap-row">
                  <span>Créneau · {startTime} – {endTime}</span>
                  <span>{date}</span>
                </div>
                <div className="recap-row">
                  <span>Heures · {durationHours} × {selectedSpot.price} DT</span>
                  <span>{spotBaseCost} DT</span>
                </div>
                {extraGuestsCost > 0 && (
                  <div className="recap-row">
                    <span>Invités suppl. ({totalPeople - selectedSpot.includedGuests})</span>
                    <span>{extraGuestsCost} DT</span>
                  </div>
                )}
                {dogsCost > 0 && (
                  <div className="recap-row">
                    <span>Chiens ({dogs})</span>
                    <span>{dogsCost} DT</span>
                  </div>
                )}
                {addonsCost > 0 && (
                  <div className="recap-row">
                    <span>Options supplémentaires</span>
                    <span>{addonsCost} DT</span>
                  </div>
                )}
                <div className="recap-total">
                  <span>Total</span>
                  <span className="price-gradient">{finalTotal} DT</span>
                </div>
                <div className="recap-summary-tags">
                  <span>Jusqu'à {selectedSpot.capacity} invités</span>
                  <span>{selectedSpot.location}</span>
                </div>
              </div>

              <br />
              <button className="btn-reserve-large full-width">Confirmer ma demande</button>
              <p className="warning-text">Aucun paiement en ligne — le paiement s'effectue sur place à l'arrivée.</p>

              <div className="rules-section">
                <h3>DISPONIBILITÉS</h3>
                <p>Tous les jours</p>

                <h3>BON À SAVOIR</h3>
                <ul className="rules-list">
                  <li><strong>Paiement</strong> · Le prix affiché vous donne accès à l'espace privé dans son intégralité par heure — ce n'est pas un prix par personne, et le paiement s'effectue sur place dés l'arrivée.</li>
                  <li><strong>Capacité</strong> · Au-delà de la capacité incluse, un supplément s'applique.</li>
                  <li><strong>Règle d'or & intimité</strong> · La réservation est limitée uniquement à l'espace sélectionné. Il est interdit d'accéder aux autres espaces non inclus. 100% privé sans vis-à-vis.</li>
                  <li><strong>Ponctualité</strong> · En cas de retard, la durée et le prix du créneau ne changent pas.</li>
                  <li><strong>Nourriture & Hygiène</strong> · Vous êtes autorisés à apporter vos propres boissons et nourriture. Le maintien d'une hygiène irréprochable est obligatoire.</li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
