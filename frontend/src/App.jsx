import { useState, useEffect } from 'react';

const COURSES_CATEGORIES = ['🔥 Tout', '✨ Célébrer', '🌿 Se détendre', '📸 Shooting', '🎬 Regarder', '🎮 Jouer', '⛺ Camping'];

const SPOTS = [
  {
    id: 1,
    title: 'Neon Bunker 90s',
    category: '🎮 Jouer',
    img: 'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=800&q=80',
    location: 'Tunis, Lac 2',
    capacity: 8,
    price: 45,
    rating: 4.9,
    description: "Une salle de gaming 100% rétro avec bornes d'arcade, PS5, et jeux de société. L'endroit parfait pour t'isoler de la réalité avec tes potes, sous les néons synthwave."
  },
  {
    id: 2,
    title: 'Villa Sunset Horizon',
    category: '✨ Célébrer',
    img: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80',
    location: 'La Marsa',
    capacity: 20,
    price: 120,
    rating: 4.8,
    description: "Maison d'architecte luxueuse avec piscine à débordement donnant sur la Méditerranée. Idéale pour les fêtes privées, anniversaires, ou après-midi entre amis."
  },
  {
    id: 3,
    title: 'Secret Forest Camp',
    category: '⛺ Camping',
    img: 'https://images.unsplash.com/photo-1504280650220-41315b493774?auto=format&fit=crop&w=800&q=80',
    location: 'Zaghouan',
    capacity: 12,
    price: 25,
    rating: 5.0,
    description: "Un spot secret privatisé en plein cœur de la forêt de Zaghouan avec feu de camp préparé et tentes suspendues. Idéal pour être coupé du monde."
  },
  {
    id: 4,
    title: 'Chill Room 4K🍿',
    category: '🎬 Regarder',
    img: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80',
    location: "L'Aouina",
    capacity: 6,
    price: 30,
    rating: 4.7,
    description: "Salle insonorisée avec un projecteur 4K géant, son Dolby Atmos, fauteuils relaxants et une machine à pop-corn incluse. La soirée Netflix ultime."
  }
];

function App() {
  const [activeCategory, setActiveCategory] = useState('🔥 Tout');
  const [likedSpots, setLikedSpots] = useState({});
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpot, setSelectedSpot] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleLike = (e, id) => {
    e.stopPropagation();
    setLikedSpots(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredSpots = SPOTS.filter(spot => {
    const matchCategory = activeCategory === '🔥 Tout' || spot.category === activeCategory;
    const matchSearch = spot.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        spot.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <>
      <div 
        className="bg-glow top-glow"
        style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)` }}
      ></div>
      <div 
        className="bg-glow bottom-glow"
        style={{ transform: `translate(-${mousePos.x * 30}px, -${mousePos.y * 30}px)` }}
      ></div>

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
          <button className="btn-search">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
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

      <div className="bottom-nav">
        <a href="#explore" className="nav-item active">
          <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span>Explorer</span>
        </a>
        <a href="#wishlist" className="nav-item">
          <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          <span>Wishlist</span>
        </a>
        <a href="#messages" className="nav-item">
          <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          <span>Messages</span>
        </a>
      </div>

      {/* Spot Detail Modal */}
      {selectedSpot && (
        <div className="modal-overlay" onClick={() => setSelectedSpot(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedSpot(null)}>✕</button>
            <div className="modal-image">
              <img src={selectedSpot.img} alt={selectedSpot.title} />
              <div className="modal-badge">{selectedSpot.category}</div>
            </div>
            
            <div className="modal-body">
              <div className="modal-header">
                <h2>{selectedSpot.title}</h2>
                <div className="spot-rating">★ {selectedSpot.rating}</div>
              </div>
              
              <p className="modal-location">📍 {selectedSpot.location}</p>
              
              <div className="modal-tags">
                <span className="tag">👥 Jusqu'à {selectedSpot.capacity} pers.</span>
                <span className="tag">Wi-Fi Haut Débit</span>
                <span className="tag">Assurance Incluse</span>
              </div>
              
              <div className="modal-description">
                <h3>À propos du spot</h3>
                <p>{selectedSpot.description}</p>
              </div>

              <div className="modal-footer">
                <div className="modal-price">
                  <strong className="price-gradient">{selectedSpot.price} DT</strong> / heure
                </div>
                <button className="btn-reserve-large">Réserver le Spot</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
