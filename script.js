// Interactive elements
document.addEventListener('DOMContentLoaded', () => {
    
    // Category pills selection
    const pills = document.querySelectorAll('.category-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Remove active class from all
            pills.forEach(p => p.classList.remove('active'));
            // Add active class to clicked
            pill.classList.add('active');
            
            // In a real app, this would filter the content below
            console.log(`Filtering for: ${pill.textContent}`);
        });
    });

    // Like button toggle
    const likeBtns = document.querySelectorAll('.btn-like');
    likeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // prevent navigation if it was a link
            btn.classList.toggle('liked');
            
            // Optional: add a small pop animation
            btn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Ambient glow follows mouse slightly (subtle parallax effect)
    const topGlow = document.querySelector('.top-glow');
    const bottomGlow = document.querySelector('.bottom-glow');
    
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        if (topGlow) {
            topGlow.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
        }
        if (bottomGlow) {
            bottomGlow.style.transform = `translate(-${x * 30}px, -${y * 30}px)`;
        }
    });

    // Search input interaction
    const searchInput = document.querySelector('.search-bar input');
    const searchBtn = document.querySelector('.btn-search');
    
    searchBtn.addEventListener('click', () => {
        if(searchInput.value.trim() !== '') {
            alert(`Recherche des spots à: ${searchInput.value}`);
        } else {
            searchInput.focus();
        }
    });
});
