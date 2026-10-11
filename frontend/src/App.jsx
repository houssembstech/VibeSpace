import { useState, useEffect } from 'react';
import AuthModal from './components/AuthModal';
import AdminModal from './components/AdminModal';
import MySpotsModal from './components/MySpotsModal';
import EditSpotModal from './components/EditSpotModal';

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

const INITIAL_SPOTS = [
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
    idealFor: ['Jouer', 'Se retrouver', 'Se détendre'],
    status: 'approved',
    hostEmail: 'houssembs.tech@gmail.com',
    hostPhone: '+216 20 000 000'
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
    idealFor: ['Célébrer', 'Se retrouver', 'Jouer', 'Se détendre', 'Shooting', 'Étudier', 'Travailler'],
    status: 'approved',
    hostEmail: 'sami.resp@vibespace.tn',
    hostPhone: '+216 98 123 456'
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
    idealFor: ['Se détendre', 'Se retrouver', 'Célébrer'],
    status: 'approved',
    hostEmail: 'nour.k@vibespace.tn',
    hostPhone: '+216 55 987 654'
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
    idealFor: ['Regarder', 'Se détendre', 'Se retrouver'],
    status: 'approved',
    hostEmail: 'houssembs.tech@gmail.com',
    hostPhone: '+216 20 000 000'
  }
];

const getDeletedSpotIds = () => {
  try {
    return JSON.parse(localStorage.getItem('vibespace_deleted_spots') || '[]');
  } catch {
    return [];
  }
};

function App() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [spotsList, setSpotsList] = useState(() => {
    const deleted = getDeletedSpotIds();
    return INITIAL_SPOTS.filter(s => !deleted.includes(s.id) && !deleted.includes(s._id) && !deleted.includes(String(s.id)));
  });
  const [activeCategory, setActiveCategory] = useState('🔥 Tout');
  const [likedSpots, setLikedSpots] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [showHostModal, setShowHostModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vibespace_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.email && u.email.toLowerCase() === 'houssembs.tech@gmail.com') {
          return { ...u, role: 'admin', canEdit: true };
        }
        return u;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showMySpotsModal, setShowMySpotsModal] = useState(false);
  const [editingSpot, setEditingSpot] = useState(null);
  const [usersList, setUsersList] = useState([
    {
      _id: 'u_admin',
      name: 'Houssem (Admin)',
      email: 'houssembs.tech@gmail.com',
      phone: '+216 20 000 000',
      role: 'admin',
      canEdit: true
    },
    {
      _id: 'u_sami',
      name: 'Sami Ben Amor',
      email: 'sami.resp@vibespace.tn',
      phone: '+216 98 123 456',
      role: 'responsable',
      canEdit: true
    },
    {
      _id: 'u_nour',
      name: 'Nour Khelil',
      email: 'nour.k@vibespace.tn',
      phone: '+216 55 987 654',
      role: 'responsable',
      canEdit: false
    }
  ]);

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedDays, setSelectedDays] = useState(['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']);

  const toggleDay = (d) => {
    if(selectedDays.includes(d)) setSelectedDays(selectedDays.filter(day => day !== d));
    else setSelectedDays([...selectedDays, d]);
  };

  // Booking details state
  const [bookingMode, setBookingMode] = useState('hour'); // 'hour' | 'halfday' | 'day'
  const [bookingDays, setBookingDays] = useState(1);
  const [halfDaySlot, setHalfDaySlot] = useState('14:00 – 19:00');
  const [date, setDate] = useState('2026-10-09');
  const [startTime, setStartTime] = useState('20:00');
  const [endTime, setEndTime] = useState('22:00');
  const [adults, setAdults] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [kids, setKids] = useState(0);
  const [dogs, setDogs] = useState(0);
  const [addons, setAddons] = useState(
    ADDONS_LIST.reduce((acc, addon) => ({ ...acc, [addon.id]: 0 }), {})
  );

  useEffect(() => {
    if (selectedSpot) {
      const activeAddons = selectedSpot.addons || ADDONS_LIST;
      setAddons(activeAddons.reduce((acc, addon) => ({ ...acc, [addon.id]: 0 }), {}));
      setActiveImageIndex(0);
      setBookingMode('hour');
      setBookingDays(1);
      setAdults(1);
      setKids(0);
      setDogs(0);
    }
  }, [selectedSpot]);

  const fetchAllData = () => {
    fetch(`${API_URL}/api/spots?all=true`)
      .then(res => res.json())
      .then(data => {
        if(data && Array.isArray(data)) {
          const deleted = getDeletedSpotIds();
          const dbSpots = data
            .filter(s => !deleted.includes(s._id) && !deleted.includes(s.id) && !deleted.includes(String(s._id)))
            .map(s => ({
              ...s,
              id: s._id,
              price: s.pricePerHour,
              pricePerHour: s.pricePerHour,
              priceHalfDay: s.priceHalfDay || 0,
              priceFullDay: s.priceFullDay || 0,
              capacity: s.maxCapacity || s.capacity || 10,
              maxCapacity: s.maxCapacity || s.capacity || 10,
              status: s.status || 'approved',
              img: s.images && s.images.length > 0 ? s.images[0] : (s.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e')
            }));

          if (dbSpots.length > 0) {
            setSpotsList(dbSpots);
          } else {
            const initials = INITIAL_SPOTS.filter(s => !deleted.includes(s.id) && !deleted.includes(s._id) && !deleted.includes(String(s.id)));
            setSpotsList(initials);
          }
        }
      })
      .catch(err => console.error("Spots API Fetch Error:", err));

    fetch(`${API_URL}/api/auth/users`)
      .then(res => res.json())
      .then(data => {
        if(data && Array.isArray(data) && data.length > 0) {
          setUsersList(data);
        }
      })
      .catch(err => console.error("Users API Fetch Error:", err));
  };

  useEffect(() => {
    fetchAllData();
  }, [API_URL]);

  const handleLoginSuccess = (user) => {
    const isHoussemAdmin = user.email && user.email.toLowerCase() === 'houssembs.tech@gmail.com';
    const finalUser = isHoussemAdmin ? { ...user, role: 'admin', canEdit: true } : user;
    localStorage.setItem('vibespace_user', JSON.stringify(finalUser));
    setCurrentUser(finalUser);
  };

  const handleUpdateSpotStatus = async (spotId, newStatus) => {
    setSpotsList(prev => prev.map(s => (s.id === spotId || s._id === spotId) ? { ...s, status: newStatus } : s));
    if (selectedSpot && (selectedSpot.id === spotId || selectedSpot._id === spotId)) {
      setSelectedSpot(prev => ({ ...prev, status: newStatus }));
    }
    try {
      await fetch(`${API_URL}/api/spots/${spotId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.warn("Backend offline, status updated locally:", e);
    }
  };

  const handleDeleteSpot = async (spotId) => {
    if (!window.confirm("Confirmer la suppression définitive de ce spot ?")) return;

    // Immediately persist deletion in localStorage so it never reappears on refresh
    try {
      const currentDeleted = getDeletedSpotIds();
      const nextDeleted = Array.from(new Set([...currentDeleted, spotId, String(spotId)]));
      localStorage.setItem('vibespace_deleted_spots', JSON.stringify(nextDeleted));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }

    setSpotsList(prev => prev.filter(s => s.id !== spotId && s._id !== spotId && String(s.id) !== String(spotId) && String(s._id) !== String(spotId)));
    if (selectedSpot && (selectedSpot.id === spotId || selectedSpot._id === spotId || String(selectedSpot.id) === String(spotId) || String(selectedSpot._id) === String(spotId))) {
      setSelectedSpot(null);
    }
    try {
      await fetch(`${API_URL}/api/spots/${spotId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn("Backend offline, spot deleted locally:", e);
    }
  };

  const handleToggleCanEdit = async (userId, currentCanEdit) => {
    const nextVal = !currentCanEdit;
    setUsersList(prev => prev.map(u => (u._id === userId || u.id === userId) ? { ...u, canEdit: nextVal } : u));
    if (currentUser && (currentUser._id === userId || currentUser.id === userId || currentUser.email === usersList.find(u => (u._id === userId || u.id === userId))?.email)) {
      const updatedUser = { ...currentUser, canEdit: nextVal };
      setCurrentUser(updatedUser);
      localStorage.setItem('vibespace_user', JSON.stringify(updatedUser));
    }
    try {
      await fetch(`${API_URL}/api/auth/users/${userId}/can-edit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canEdit: nextVal })
      });
    } catch (e) {
      console.warn("Backend offline, permission updated locally:", e);
    }
  };

  const handleCreateUser = async (newUserData) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur création utilisateur');
      setUsersList([data, ...usersList]);
    } catch (e) {
      setUsersList([{ ...newUserData, _id: 'u_' + Date.now() }, ...usersList]);
    }
    alert(`Compte ${newUserData.role === 'admin' ? 'Administrateur' : 'Responsable'} créé pour ${newUserData.name} ! 🎉`);
  };

  const handleSaveEditedSpot = async (updatedData, newFiles) => {
    const spotId = updatedData.id || updatedData._id;
    const formData = new FormData();
    formData.append('title', updatedData.title);
    formData.append('location', updatedData.location);
    formData.append('description', updatedData.description);
    formData.append('category', updatedData.category);
    formData.append('pricePerHour', updatedData.pricePerHour);
    formData.append('priceHalfDay', updatedData.priceHalfDay || 0);
    formData.append('priceFullDay', updatedData.priceFullDay || 0);
    formData.append('maxCapacity', updatedData.maxCapacity);
    formData.append('hostEmail', updatedData.hostEmail);
    formData.append('hostPhone', updatedData.hostPhone);
    formData.append('hostWhatsapp', updatedData.hostWhatsapp || '');
    if (updatedData.addons) formData.append('addons', JSON.stringify(updatedData.addons));

    if (newFiles && newFiles.length > 0) {
      newFiles.slice(0, 5).forEach(f => formData.append('images', f));
    }

    try {
      const res = await fetch(`${API_URL}/api/spots/${spotId}`, {
        method: 'PUT',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la mise à jour');
      const savedSpot = {
        ...data,
        id: data._id,
        price: data.pricePerHour,
        pricePerHour: data.pricePerHour,
        priceHalfDay: data.priceHalfDay || updatedData.priceHalfDay || 0,
        priceFullDay: data.priceFullDay || updatedData.priceFullDay || 0,
        capacity: data.maxCapacity,
        maxCapacity: data.maxCapacity,
        img: data.images && data.images.length > 0 ? data.images[0] : (data.imageUrl || updatedData.img)
      };
      setSpotsList(prev => prev.map(s => (s.id === spotId || s._id === spotId) ? savedSpot : s));
      if (selectedSpot && (selectedSpot.id === spotId || selectedSpot._id === spotId)) setSelectedSpot(savedSpot);
    } catch (err) {
      setSpotsList(prev => prev.map(s => (s.id === spotId || s._id === spotId) ? updatedData : s));
      if (selectedSpot && (selectedSpot.id === spotId || selectedSpot._id === spotId)) setSelectedSpot(updatedData);
    }
  };

  const toggleLike = (e, id) => {
    e.stopPropagation();
    setLikedSpots(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const updateAddon = (id, delta) => {
    setAddons(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  // Derive duration in hours
  let durationHours = 1;
  if (startTime && endTime) {
    const sH = parseInt(startTime.split(':')[0], 10);
    const eH = parseInt(endTime.split(':')[0], 10);
    let diff = eH - sH;
    if (diff <= 0) diff += 24;
    durationHours = Math.max(1, diff);
  }

  const maxCap = selectedSpot ? (selectedSpot.capacity || selectedSpot.maxCapacity || 10) : 10;
  const totalPeople = adults + kids;

  const hourlyRate = selectedSpot ? (selectedSpot.pricePerHour || selectedSpot.price || 0) : 0;
  const halfDayRate = selectedSpot ? (selectedSpot.priceHalfDay > 0 ? selectedSpot.priceHalfDay : Math.round(hourlyRate * 4 * 0.85)) : 0;
  const fullDayRate = selectedSpot ? (selectedSpot.priceFullDay > 0 ? selectedSpot.priceFullDay : Math.round(hourlyRate * 8 * 0.8)) : 0;

  let spotBaseCost = 0;
  let baseUnitLabel = '';

  if (bookingMode === 'hour') {
    spotBaseCost = hourlyRate * durationHours;
    baseUnitLabel = `${durationHours}h × ${hourlyRate} DT`;
  } else if (bookingMode === 'halfday') {
    spotBaseCost = halfDayRate;
    baseUnitLabel = `Demi-journée · ${halfDayRate} DT`;
  } else if (bookingMode === 'day') {
    spotBaseCost = fullDayRate * bookingDays;
    baseUnitLabel = `${bookingDays} jour(s) × ${fullDayRate} DT`;
  }

  const includedGuests = selectedSpot ? (selectedSpot.includedGuests || Math.floor(maxCap / 2) || 1) : 1;
  let extraGuestsCost = 0;
  if (selectedSpot && totalPeople > includedGuests) {
    const guestFactor = bookingMode === 'day' ? bookingDays : (bookingMode === 'halfday' ? 2 : durationHours);
    extraGuestsCost = (totalPeople - includedGuests) * (selectedSpot.extraGuestPrice || 0) * guestFactor;
  }

  const animalCostPerHr = selectedSpot?.animalFee !== undefined ? selectedSpot.animalFee : 13;
  const animalFactor = bookingMode === 'day' ? bookingDays : (bookingMode === 'halfday' ? 2 : durationHours);
  const animalsCostTemp = dogs * animalCostPerHr * animalFactor;

  const activeSpotAddons = selectedSpot?.addons || ADDONS_LIST;
  const addonsCost = activeSpotAddons.reduce((total, addon) => total + ((addons[addon.id] || 0) * addon.price), 0);
  const finalTotal = spotBaseCost + extraGuestsCost + animalsCostTemp + addonsCost;

  const filteredSpots = spotsList.filter(spot => {
    // Only approved spots on public explore page (or legacy mock spots without status)
    const isApproved = !spot.status || spot.status === 'approved';
    if (!isApproved) return false;
    const matchCategory = activeCategory === '🔥 Tout' 
                          || spot.category === activeCategory 
                          || (spot.idealFor && spot.idealFor.some(tag => activeCategory.includes(tag)));
    const matchSearch = spot.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        spot.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <>
      {/* Background glow and Navigation ... */}
      <nav className="navbar">
        <div className="brand-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/logo-icon.png" alt="VibeSpace Logo" className="navbar-logo-img" />
          <span className="logo-text">Vibe<span className="text-gradient">Space</span></span>
        </div>
        <div className="nav-right">
          {currentUser?.role === 'admin' && (
            <button className="btn-admin-nav" onClick={() => setShowAdminModal(true)}>
              🛡️ Admin
            </button>
          )}
          <div className="profile-btn-wrapper">
            <button 
              className="profile-pic-btn" 
              onClick={() => {
                if (currentUser) {
                  setShowUserMenu(prev => !prev);
                } else {
                  setShowAuthModal(true);
                }
              }}
              title={currentUser ? currentUser.name : "Se connecter / Inscription Responsable"}
              aria-label="Profil et Connexion"
            >
              {currentUser ? (
                <div className="user-avatar-badge">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              ) : (
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Connexion" />
              )}
              <span className={`status-indicator ${currentUser ? 'online' : ''}`}></span>
            </button>

            {showUserMenu && currentUser && (
              <div className="user-dropdown-menu">
                <div className="user-dropdown-header">
                  <div className="user-dropdown-title-row">
                    <p className="ud-name">👋 {currentUser.name}</p>
                    <span className={`ud-role-badge ${currentUser.role}`}>
                      {currentUser.role === 'admin' ? '🛡️ Admin' : '🏢 Responsable'}
                    </span>
                  </div>
                  {currentUser.spaceName && (
                    <p className="ud-space" style={{ color: 'var(--accent-1)', fontSize: '0.82rem', fontWeight: 600, marginTop: '2px' }}>
                      🏢 {currentUser.spaceName}
                    </p>
                  )}
                  <p className="ud-email">{currentUser.email}</p>
                  {currentUser.phone && <p className="ud-phone">📞 {currentUser.phone}</p>}
                </div>
                <div className="user-dropdown-divider"></div>
                
                {currentUser.role === 'admin' && (
                  <button className="user-dropdown-item admin-link" onClick={() => { setShowAdminModal(true); setShowUserMenu(false); }}>
                    🛡️ Administration (Spots & Comptes)
                  </button>
                )}

                <button className="user-dropdown-item" onClick={() => { setShowMySpotsModal(true); setShowUserMenu(false); }}>
                  🏢 Mes Espaces & Fiches
                </button>

                <button className="user-dropdown-item" onClick={() => { setShowHostModal(true); setShowUserMenu(false); }}>
                  ⚡ Ajouter un nouveau spot
                </button>

                <button className="user-dropdown-item logout" onClick={() => {
                  localStorage.removeItem('vibespace_user');
                  setCurrentUser(null);
                  setShowUserMenu(false);
                }}>
                  🚪 Se déconnecter
                </button>
              </div>
            )}
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
                <span className="spot-capacity">👥 Jusqu'à {spot.capacity || spot.maxCapacity} pers.</span>
                <span className="spot-price">
                  <strong className="price-gradient">{spot.price || spot.pricePerHour} DT</strong>/h
                  {spot.priceHalfDay > 0 && <span className="price-badge-extra"> · {spot.priceHalfDay} DT/½j</span>}
                  {spot.priceFullDay > 0 && <span className="price-badge-extra"> · {spot.priceFullDay} DT/j</span>}
                </span>
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
            <div className="modal-image-carousel">
              <img 
                src={selectedSpot.images && selectedSpot.images.length > 0 ? selectedSpot.images[activeImageIndex] : selectedSpot.img} 
                alt="" 
                className="carousel-backdrop" 
              />
              {selectedSpot.images && selectedSpot.images.length > 1 && (
                <>
                  <button className="carousel-btn prev" onClick={() => setActiveImageIndex(prev => prev === 0 ? selectedSpot.images.length - 1 : prev - 1)}>❮</button>
                  <button className="carousel-btn next" onClick={() => setActiveImageIndex(prev => prev === selectedSpot.images.length - 1 ? 0 : prev + 1)}>❯</button>
                  <div className="carousel-indicators">
                    {selectedSpot.images.map((_, i) => (
                      <span key={i} className={`indicator ${i === activeImageIndex ? 'active' : ''}`} />
                    ))}
                  </div>
                </>
              )}
              <img 
                src={selectedSpot.images && selectedSpot.images.length > 0 ? selectedSpot.images[activeImageIndex] : selectedSpot.img} 
                alt={`${selectedSpot.title} view`} 
                className="carousel-main-img" 
              />
            </div>
            
            <div className="modal-body">
              <p className="modal-category-location">{((selectedSpot.category || '').split(' ')[1] || selectedSpot.category || 'NOUVEAU').toUpperCase()} · {(selectedSpot.location || 'LIEU MYSTÈRE').toUpperCase()}</p>
              <h2 className="modal-big-title">{selectedSpot.title}</h2>
              <p className="modal-description-sub">{selectedSpot.description}</p>
              
              <div className="ideal-for-section">
                <h3>IDÉAL POUR</h3>
                <div className="modal-tags">
                  {selectedSpot.idealFor && Array.isArray(selectedSpot.idealFor) ? selectedSpot.idealFor.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  )) : null}
                </div>
              </div>

              <div className="booking-price-header">
                <div className="b-price-group">
                  <span className="b-price"><strong className="price-gradient">{selectedSpot.price || selectedSpot.pricePerHour} DT</strong> /HR</span>
                  <div className="b-price-sub">
                    {selectedSpot.priceHalfDay > 0 && <span>☀️ <strong>{selectedSpot.priceHalfDay} DT</strong> Demi-journée </span>}
                    {selectedSpot.priceFullDay > 0 && <span>📅 <strong>{selectedSpot.priceFullDay} DT</strong> Journée entière</span>}
                  </div>
                </div>
                <span className="b-spots-remaining">👥 Jusqu'à {maxCap} personnes max</span>
              </div>

              {/* Booking Mode Selector Tabs */}
              <div className="booking-mode-tabs">
                <button
                  type="button"
                  className={`mode-tab-btn ${bookingMode === 'hour' ? 'active' : ''}`}
                  onClick={() => setBookingMode('hour')}
                >
                  <span>⏱️ Par Heure</span>
                  <span className="mode-tab-sub">{selectedSpot.price || selectedSpot.pricePerHour} DT/h</span>
                </button>
                <button
                  type="button"
                  className={`mode-tab-btn ${bookingMode === 'halfday' ? 'active' : ''}`}
                  onClick={() => setBookingMode('halfday')}
                >
                  <span>☀️ Demi-Journée</span>
                  <span className="mode-tab-sub">{selectedSpot.priceHalfDay > 0 ? `${selectedSpot.priceHalfDay} DT` : `${halfDayRate} DT`}</span>
                </button>
                <button
                  type="button"
                  className={`mode-tab-btn ${bookingMode === 'day' ? 'active' : ''}`}
                  onClick={() => setBookingMode('day')}
                >
                  <span>📅 Par Journée</span>
                  <span className="mode-tab-sub">{selectedSpot.priceFullDay > 0 ? `${selectedSpot.priceFullDay} DT/j` : `${fullDayRate} DT/j`}</span>
                </button>
              </div>

              <div className="booking-box">
                {bookingMode === 'hour' && (
                  <>
                    <div className="bb-row">
                      <div className="bb-col">
                        <label>DATE DE RÉSERVATION</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                      </div>
                    </div>
                    <div className="bb-row">
                      <div className="bb-col">
                        <label>CRÉNEAU HORAIRE</label>
                        <div className="time-selects">
                          <select value={startTime} onChange={e => setStartTime(e.target.value)}>
                            <option>08:00</option>
                            <option>10:00</option>
                            <option>14:00</option>
                            <option>18:00</option>
                            <option>20:00</option>
                            <option>22:00</option>
                          </select>
                          <span>–</span>
                          <select value={endTime} onChange={e => setEndTime(e.target.value)}>
                            <option>12:00</option>
                            <option>16:00</option>
                            <option>20:00</option>
                            <option>22:00</option>
                            <option>23:00</option>
                            <option>00:00</option>
                          </select>
                          <span className="duration-pill">{durationHours} H</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {bookingMode === 'halfday' && (
                  <>
                    <div className="bb-row">
                      <div className="bb-col">
                        <label>DATE</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                      </div>
                    </div>
                    <div className="bb-row">
                      <div className="bb-col">
                        <label>CRÉNEAU DEMI-JOURNÉE</label>
                        <div className="slot-selection-grid">
                          {[
                            { label: '🌅 Matinée', time: '08:00 – 13:00' },
                            { label: '🌇 Après-midi', time: '14:00 – 19:00' },
                            { label: '🌙 Soirée', time: '20:00 – 01:00' }
                          ].map(slot => (
                            <button
                              key={slot.time}
                              type="button"
                              className={`slot-pill-btn ${halfDaySlot === slot.time ? 'active' : ''}`}
                              onClick={() => setHalfDaySlot(slot.time)}
                            >
                              <strong>{slot.label}</strong>
                              <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>{slot.time}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {bookingMode === 'day' && (
                  <>
                    <div className="bb-row">
                      <div className="bb-col">
                        <label>DATE D'ARRIVÉE</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                      </div>
                    </div>
                    <div className="counter-row" style={{ padding: '0.5rem 0', borderBottom: 'none' }}>
                      <div>
                        <strong>NOMBRE DE JOURS</strong>
                        <div className="sm-info">Tarif journalier ({fullDayRate} DT / jour)</div>
                      </div>
                      <div className="counter-controls">
                        <button type="button" onClick={() => setBookingDays(Math.max(1, bookingDays - 1))}>-</button>
                        <span style={{ minWidth: '40px', textAlign: 'center', fontWeight: 'bold' }}>{bookingDays} jour{bookingDays > 1 ? 's' : ''}</span>
                        <button type="button" onClick={() => setBookingDays(bookingDays + 1)}>+</button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="guests-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>QUI VIENT ?</h3>
                  <span style={{ fontSize: '0.85rem', color: totalPeople >= maxCap ? '#f87171' : 'var(--text-muted)' }}>
                    Total : {totalPeople} / {maxCap} pers.
                  </span>
                </div>

                {totalPeople >= maxCap && (
                  <div className="capacity-alert-banner">
                    ⚠️ Capacité maximale de cet espace ({maxCap} personnes) atteinte.
                  </div>
                )}

                {(!selectedSpot.allowedAudiences || selectedSpot.allowedAudiences.includes('Adultes (+18)') || selectedSpot.allowedAudiences.includes('Famille') || selectedSpot.allowedAudiences.includes('Couple')) && (
                  <div className="counter-row">
                    <div>Adultes</div>
                    <div className="counter-controls">
                      <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))}>-</button>
                      <span>{adults}</span>
                      <button 
                        type="button" 
                        disabled={totalPeople >= maxCap}
                        onClick={() => totalPeople < maxCap && setAdults(adults + 1)}
                        style={{ opacity: totalPeople >= maxCap ? 0.35 : 1, cursor: totalPeople >= maxCap ? 'not-allowed' : 'pointer' }}
                      >+</button>
                    </div>
                  </div>
                )}
                {(!selectedSpot.allowedAudiences || selectedSpot.allowedAudiences.includes('Enfants') || selectedSpot.allowedAudiences.includes('Famille')) && (
                  <div className="counter-row">
                    <div>Enfants</div>
                    <div className="counter-controls">
                      <button type="button" onClick={() => setKids(Math.max(0, kids - 1))}>-</button>
                      <span>{kids}</span>
                      <button 
                        type="button" 
                        disabled={totalPeople >= maxCap}
                        onClick={() => totalPeople < maxCap && setKids(kids + 1)}
                        style={{ opacity: totalPeople >= maxCap ? 0.35 : 1, cursor: totalPeople >= maxCap ? 'not-allowed' : 'pointer' }}
                      >+</button>
                    </div>
                  </div>
                )}
                {(!selectedSpot.allowedAudiences || selectedSpot.allowedAudiences.includes('Animaux (Chien/Chat)')) && (
                  <div className="counter-row">
                    <div>
                      Animaux
                      <div className="sm-info">{(selectedSpot.animalFee !== undefined ? selectedSpot.animalFee : 13)} DT / animal</div>
                    </div>
                    <div className="counter-controls">
                      <button type="button" onClick={() => setDogs(Math.max(0, dogs - 1))}>-</button>
                      <span>{dogs}</span>
                      <button type="button" onClick={() => setDogs(dogs + 1)}>+</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="addons-section">
                <h3>Ajoutez une touche personnelle</h3>
                <p className="sm-info">Optionnel — améliorez votre expérience.</p>
                
                {(selectedSpot.addons || ADDONS_LIST).map(addon => (
                  <div className="counter-row addon-row" key={addon.id}>
                    <div>
                      {addon.name}
                      <div className="sm-info">{addon.price} DT / unité</div>
                    </div>
                    <div className="counter-controls">
                      <button type="button" onClick={() => updateAddon(addon.id, -1)}>-</button>
                      <span>{addons[addon.id] || 0}</span>
                      <button type="button" onClick={() => updateAddon(addon.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="recap-section">
                <h3>RÉCAPITULATIF</h3>
                <div className="recap-row">
                  <span>
                    {bookingMode === 'hour' && `Créneau · ${startTime} – ${endTime}`}
                    {bookingMode === 'halfday' && `Demi-journée · ${halfDaySlot}`}
                    {bookingMode === 'day' && `Séjour · ${bookingDays} jour(s)`}
                  </span>
                  <span>{date}</span>
                </div>
                <div className="recap-row">
                  <span>Base · {baseUnitLabel}</span>
                  <span>{spotBaseCost} DT</span>
                </div>
                {extraGuestsCost > 0 && (
                  <div className="recap-row">
                    <span>Invités suppl. ({totalPeople - includedGuests})</span>
                    <span>{extraGuestsCost} DT</span>
                  </div>
                )}
                {animalsCostTemp > 0 && (
                  <div className="recap-row">
                    <span>Animaux ({dogs})</span>
                    <span>{animalsCostTemp} DT</span>
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
                  <span>👥 Capacité max : {maxCap} invités</span>
                  <span>📍 {selectedSpot.location}</span>
                </div>
              </div>

              {/* Host Contact Details */}
              {(selectedSpot.hostEmail || selectedSpot.hostPhone || selectedSpot.hostWhatsapp) && (
                <div className="host-contact-card">
                  <div className="hc-header">
                    <img src="https://ui-avatars.com/api/?name=Host&background=8b5cf6&color=fff" alt="Host Avatar" />
                    <div>
                      <h3>Réserver via l'Hôte</h3>
                      <p>Contactez le propriétaire pour confirmer cette demande :</p>
                    </div>
                  </div>
                  <div className="hc-channels">
                    {selectedSpot.hostPhone && (
                      <a href={`tel:${selectedSpot.hostPhone}`} className="hc-btn phone">
                        📞 {selectedSpot.hostPhone}
                      </a>
                    )}
                    {selectedSpot.hostWhatsapp && (
                      <a href={`https://wa.me/${selectedSpot.hostWhatsapp}`} target="_blank" rel="noreferrer" className="hc-btn whatsapp">
                        💬 WhatsApp
                      </a>
                    )}
                    {selectedSpot.hostEmail && (
                      <a href={`mailto:${selectedSpot.hostEmail}`} className="hc-btn email">
                        ✉️ Email
                      </a>
                    )}
                  </div>
                </div>
              )}

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
      {/* Host Modal */}
      {showHostModal && (
        <div className="modal-overlay" onClick={() => setShowHostModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowHostModal(false)}>✕</button>
            <div className="modal-body" style={{paddingTop: '3rem'}}>
              <h2 className="modal-big-title">Deviens Hôte</h2>
              <p className="modal-description-sub">Transforme ton espace privé en revenus. Tu gardes 100% le contrôle de tes réservations et de tes règles.</p>
              
              <form className="host-premium-form" onSubmit={(e) => { 
                e.preventDefault(); 
                const form = e.target;
                
                const fileInput = form.querySelector('input[type="file"]');
                let imgUrl = 'https://images.unsplash.com/photo-1564013799912-2cae38eb41e6?auto=format&fit=crop&w=800&q=80';
                if (fileInput && fileInput.files.length > 0) {
                  imgUrl = URL.createObjectURL(fileInput.files[0]);
                }

                // Extract checked categories
                const idealCats = Array.from(form.querySelectorAll('.ideal-chip input:checked')).map(cb => cb.value);
                const audienceNodes = Array.from(form.querySelectorAll('.audience-chip input:checked')).map(cb => cb.value);

                // Extract checked addons
                const configuredAddons = [];
                const addonCards = form.querySelectorAll('.host-addon-card');
                addonCards.forEach(card => {
                  const check = card.querySelector('input[type="checkbox"]');
                  if (check && check.checked) {
                    const name = card.querySelector('.toggle-label').innerText;
                    const id = card.querySelector('.addon-price-hover').id.replace('price-', '');
                    const originalPrice = ADDONS_LIST.find(a => a.id === id)?.price || 0;
                    const customPrice = parseFloat(card.querySelector('.addon-price-hover input').value) || originalPrice;
                    configuredAddons.push({ id, name, price: customPrice });
                  }
                });

                const spotTitle = form.querySelector('input[name="title"]')?.value || form.querySelector('input[placeholder*="Sunset Rooftop"]')?.value;
                const spotLocation = form.querySelector('input[name="location"]')?.value || form.querySelector('input[placeholder*="Sidi Bou Saïd"]')?.value;
                const spotDesc = form.querySelector('textarea[name="description"]')?.value || form.querySelector('textarea')?.value;
                const spotPrice = parseFloat(form.querySelector('input[name="pricePerHour"]')?.value) || 50;
                const priceHalfDay = parseFloat(form.querySelector('input[name="priceHalfDay"]')?.value) || 0;
                const priceFullDay = parseFloat(form.querySelector('input[name="priceFullDay"]')?.value) || 0;
                const cap = parseInt(form.querySelector('input[name="maxCapacity"]')?.value, 10) || 10;
                const extraGuest = parseFloat(form.querySelector('input[name="extraGuestPrice"]')?.value) || 5;
                const animalFee = parseFloat(form.querySelector('#animal-fee-input')?.value || '13');

                const spotCategory = idealCats.length > 0 ? idealCats[0] : '✨ Nouveauté';
                const spotIdealFor = idealCats.length > 0 ? idealCats.map(c => c.split(' ')[1] || c) : ['Nouveauté', 'Célébrer'];

                const submitBtn = form.querySelector('button[type="submit"]');
                const origBtnText = submitBtn.innerText;
                submitBtn.innerText = 'Création en cours... ⏳';
                submitBtn.disabled = true;

                const formData = new FormData();
                formData.append('title', spotTitle);
                formData.append('location', spotLocation);
                formData.append('description', spotDesc);
                formData.append('category', spotCategory);
                formData.append('pricePerHour', spotPrice);
                formData.append('priceHalfDay', priceHalfDay);
                formData.append('priceFullDay', priceFullDay);
                formData.append('maxCapacity', cap);
                formData.append('includedGuests', Math.floor(cap / 2) || 5);
                formData.append('extraGuestPrice', extraGuest);
                formData.append('idealFor', JSON.stringify(spotIdealFor));
                formData.append('addons', JSON.stringify(configuredAddons));
                formData.append('allowedAudiences', JSON.stringify(audienceNodes.length > 0 ? audienceNodes : []));
                formData.append('animalFee', isNaN(animalFee) ? 13 : animalFee);
                const inputHostEmail = form.querySelector('input[name="hostEmail"]')?.value || currentUser?.email || '';
                const inputHostPhone = form.querySelector('input[name="hostPhone"]')?.value || currentUser?.phone || '';
                const inputHostWa = form.querySelector('input[name="hostWhatsapp"]')?.value || '';
                const isAutoApproved = currentUser?.role === 'admin' || inputHostEmail.toLowerCase() === 'houssembs.tech@gmail.com';
                const spotInitialStatus = isAutoApproved ? 'approved' : 'pending';

                formData.append('hostEmail', inputHostEmail);
                formData.append('hostPhone', inputHostPhone);
                formData.append('hostWhatsapp', inputHostWa);
                formData.append('status', spotInitialStatus);
                formData.append('hostUserId', currentUser?._id || currentUser?.id || '');

                if (uploadedFiles.length > 0) {
                  uploadedFiles.slice(0, 5).forEach(f => formData.append('images', f));
                }

                fetch(`${API_URL}/api/spots`, {
                  method: 'POST',
                  body: formData
                })
                .then(async res => {
                  const data = await res.json();
                  if(!res.ok) throw new Error(data.error || data.message || "Erreur Backend inconnue");
                  return data;
                })
                .then(savedSpot => {
                  const finalSpot = {
                    ...savedSpot,
                    id: savedSpot._id || ('spot_' + Date.now()),
                    price: savedSpot.pricePerHour || spotPrice,
                    pricePerHour: savedSpot.pricePerHour || spotPrice,
                    priceHalfDay: savedSpot.priceHalfDay || priceHalfDay,
                    priceFullDay: savedSpot.priceFullDay || priceFullDay,
                    capacity: savedSpot.maxCapacity || cap,
                    maxCapacity: savedSpot.maxCapacity || cap,
                    status: savedSpot.status || spotInitialStatus,
                    hostEmail: savedSpot.hostEmail || inputHostEmail,
                    hostPhone: savedSpot.hostPhone || inputHostPhone,
                    hostWhatsapp: savedSpot.hostWhatsapp || inputHostWa,
                    img: savedSpot.images && savedSpot.images.length > 0 ? savedSpot.images[0] : (savedSpot.imageUrl || imgUrl)
                  };
                  setSpotsList([finalSpot, ...spotsList]);
                  setUploadedFiles([]);
                  if (spotInitialStatus === 'approved') {
                    alert('Félicitations ! Ton espace a été publié et est maintenant en ligne sur VibeSpace 🚀');
                  } else {
                    alert("Demande transmise avec succès ! ⏳ Votre spot a été envoyé à l'administrateur et est en attente de validation.");
                  }
                  setShowHostModal(false); 
                })
                .catch(err => {
                  console.error(err);
                  alert('Échec de la sauvegarde : ' + err.message);
                })
                .finally(() => {
                  submitBtn.innerText = origBtnText;
                  submitBtn.disabled = false;
                });
              }}>
                
                <div className="host-section">
                  <h3><span className="step-num">1</span> L'Identité du Spot</h3>
                  <div className="host-grid">
                    <div className="bb-col">
                      <label>NOM DU SPOT</label>
                      <input type="text" name="title" placeholder="Ex: Sunset Rooftop..." defaultValue={currentUser?.spaceName || ''} required />
                    </div>
                    <div className="bb-col">
                      <label>ADRESSE COMPLÈTE</label>
                      <input type="text" name="location" placeholder="Ex: Sidi Bou Saïd, Rue des Arts" required />
                    </div>
                  </div>

                  <div className="host-grid-3 mt-input">
                    <div className="bb-col">
                      <label>EMAIL</label>
                      <input type="email" name="hostEmail" defaultValue={currentUser?.email || ''} placeholder="ton-email@vibe.com" required style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', padding:'0.8rem', borderRadius:'8px'}} />
                    </div>
                    <div className="bb-col">
                      <label>N° TÉLÉPHONE</label>
                      <input type="tel" name="hostPhone" defaultValue={currentUser?.phone || ''} placeholder="Ex: 55 123 456" required style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', padding:'0.8rem', borderRadius:'8px'}} />
                    </div>
                    <div className="bb-col">
                      <label>WHATSAPP (Optionnel)</label>
                      <input type="tel" name="hostWhatsapp" defaultValue={currentUser?.phone || ''} placeholder="Ex: 55 123 456" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', padding:'0.8rem', borderRadius:'8px'}} />
                    </div>
                  </div>

                  <div className="bb-col mt-input">
                    <label>IDÉAL POUR</label>
                    <div className="host-chip-group">
                      {COURSES_CATEGORIES.filter(c => c !== '🔥 Tout').map(cat => (
                         <label key={cat} className="host-chip ideal-chip">
                           <input type="checkbox" value={cat} /> 
                           <span>{cat}</span>
                         </label>
                      ))}
                    </div>
                  </div>

                  <div className="bb-col mt-input">
                    <label>QUI VIENT ? (PUBLIC CIBLE)</label>
                    <div className="host-chip-group">
                      {['Famille', 'Couple', 'Adultes (+18)', 'Enfants', 'Animaux (Chien/Chat)'].map(aud => (
                         <label key={aud} className="host-chip audience-chip">
                           <input type="checkbox" value={aud} onChange={(e) => {
                              if (aud === 'Animaux (Chien/Chat)') {
                                const inp = document.getElementById('animal-fee-input');
                                if (inp) inp.style.display = e.target.checked ? 'inline-block' : 'none';
                              }
                           }}/>
                           <span>{aud}</span>
                         </label>
                      ))}
                      <input id="animal-fee-input" type="number" placeholder="Frais / animal (DT)" style={{display: 'none', width: '160px', padding: '0.4rem 0.8rem', borderRadius: '50px', border: '1px solid var(--accent-1)', background: 'transparent', color: 'white', fontSize: '0.85rem'}} />
                    </div>
                  </div>

                  <div className="bb-col mt-input">
                    <label>DESCRIPTION IMMERSIVE</label>
                    <textarea name="description" rows="3" placeholder="Parlez de l'ambiance, de la vue, du vibe global..." required></textarea>
                  </div>
                </div>

                <div className="host-section">
                  <h3><span className="step-num">2</span> Tarifs & Capacité</h3>
                  <div className="host-grid-3">
                    <div className="bb-col">
                      <label>PRIX / HEURE *</label>
                      <div className="val-input-wrapper">
                        <input type="number" name="pricePerHour" placeholder="60" min="1" required />
                        <span className="val-unit">DT</span>
                      </div>
                    </div>
                    <div className="bb-col">
                      <label>DEMI-JOURNÉE</label>
                      <div className="val-input-wrapper">
                        <input type="number" name="priceHalfDay" placeholder="150" min="0" />
                        <span className="val-unit">DT</span>
                      </div>
                    </div>
                    <div className="bb-col">
                      <label>JOURNÉE ENTIÈRE</label>
                      <div className="val-input-wrapper">
                        <input type="number" name="priceFullDay" placeholder="280" min="0" />
                        <span className="val-unit">DT</span>
                      </div>
                    </div>
                  </div>

                  <div className="host-grid mt-input">
                    <div className="bb-col">
                      <label>CAPACITÉ MAX (PERSONNES) *</label>
                      <div className="val-input-wrapper">
                        <input type="number" name="maxCapacity" placeholder="24" min="1" required />
                        <span className="val-unit">Pers</span>
                      </div>
                    </div>
                    <div className="bb-col">
                      <label>FRAIS SUPPLÉM. / INVITÉ</label>
                      <div className="val-input-wrapper">
                        <input type="number" name="extraGuestPrice" placeholder="7" min="0" />
                        <span className="val-unit">DT/p</span>
                      </div>
                    </div>
                  </div>
                  <div className="bb-col mt-input">
                    <label>JOURS ET HORAIRES</label>
                    <div className="days-pills-group">
                      {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map(d => (
                        <div key={d} className={`day-pill ${selectedDays.includes(d) ? 'active' : ''}`} onClick={() => toggleDay(d)}>
                          {d}
                        </div>
                      ))}
                    </div>
                    <div className="time-inputs-row">
                      <div className="val-input-wrapper" style={{flex: 1, maxWidth: '180px'}}>
                        <span className="val-unit" style={{borderLeft: 'none', borderRight: '1px solid var(--glass-border)'}}>De</span>
                        <input type="time" defaultValue="08:00" />
                      </div>
                      <div className="val-input-wrapper" style={{flex: 1, maxWidth: '180px'}}>
                        <span className="val-unit" style={{borderLeft: 'none', borderRight: '1px solid var(--glass-border)'}}>À</span>
                        <input type="time" defaultValue="23:00" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="host-section">
                  <h3><span className="step-num">3</span> Services Optionnels Extras</h3>
                  <p className="sm-info mb-info">Active les options et fixe ton tarif pour maximiser tes revenus.</p>
                  <div className="host-addons-grid">
                    {ADDONS_LIST.map(addon => (
                      <div key={addon.id} className="host-addon-card">
                        <label className="toggle-switch">
                          <input type="checkbox" onChange={(e) => {
                            const input = document.getElementById(`price-${addon.id}`);
                            if(input) input.style.opacity = e.target.checked ? '1' : '0';
                            if(input) input.style.pointerEvents = e.target.checked ? 'auto' : 'none';
                          }} />
                          <span className="toggle-slider"></span>
                          <span className="toggle-label">{addon.name}</span>
                        </label>
                        <div id={`price-${addon.id}`} className="addon-price-hover" style={{opacity: 0, pointerEvents: 'none', transition: '0.3s'}}>
                          <input type="number" placeholder="0" />
                          <span>DT</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="host-section">
                  <h3><span className="step-num">4</span> Médias (3 Photos Max)</h3>
                  <div className="file-drop-area">
                    {uploadedFiles.length > 0 ? (
                      <div style={{color: 'var(--accent-1)'}}>
                        <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" style={{width: 48, height: 48, margin: '0 auto 1rem auto'}}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                        <h4>{uploadedFiles.length} photo(s) importée(s) avec succès ! ✨</h4>
                        <p>Tu peux sectionner d'autres images pour remplacer cette sélection.</p>
                      </div>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        <h4>Glisse tes meilleures photos</h4>
                        <p>Qualité Premium uniquement (Max 5MB)</p>
                      </>
                    )}
                    <input type="file" multiple accept="image/*" onChange={(e) => setUploadedFiles(Array.from(e.target.files))} />
                  </div>
                </div>

                <button type="submit" className="btn-reserve-large full-width btn-magic">
                  Lancer mon Espace 🚀
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        API_URL={API_URL}
      />

      {/* Admin Panel Modal */}
      <AdminModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        spotsList={spotsList}
        usersList={usersList}
        onUpdateSpotStatus={handleUpdateSpotStatus}
        onDeleteSpot={handleDeleteSpot}
        onToggleCanEdit={handleToggleCanEdit}
        onCreateUser={handleCreateUser}
      />

      {/* Responsable - My Spots Modal */}
      <MySpotsModal
        isOpen={showMySpotsModal}
        onClose={() => setShowMySpotsModal(false)}
        spotsList={spotsList}
        currentUser={currentUser}
        onEditSpot={(spot) => setEditingSpot(spot)}
        onAddNewSpot={() => setShowHostModal(true)}
        onDeleteSpot={handleDeleteSpot}
      />

      {/* Edit Spot Modal */}
      <EditSpotModal
        spot={editingSpot}
        onClose={() => setEditingSpot(null)}
        onSaveSpot={handleSaveEditedSpot}
        addonsList={ADDONS_LIST}
      />
    </>
  );
}

export default App;
