/**
 * She Can Foundation - Main Interactive Script
 * Hand-coded with vanilla JS to demonstrate clean DOM manipulation and API usage.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initPremiumBackground();
    initStickyHeader();
    initMobileNav();
    initScrollReveals();
    initStatsCounter();
    initTestimonialsSlider();
    initInitiativesFilter();
    initGalleryLightbox();
});

/* ==========================================================================
   1. THEME SWITCHER (Light / Dark Mode)
   ========================================================================== */
function initTheme() {
    const themeToggleBtn = document.getElementById('themeToggle');
    if (!themeToggleBtn) return;
    
    // Check if on admin page to set appropriate default theme and storage keys
    const isAdminPage = document.body && (document.body.classList.contains('admin-page') || window.location.pathname.includes('admin'));
    const defaultTheme = isAdminPage ? 'light' : 'dark';
    const storageKey = isAdminPage ? 'admin-theme' : 'theme';
    
    const savedTheme = localStorage.getItem(storageKey) || defaultTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem(storageKey, newTheme);
    });
}

/* ==========================================================================
   2. STICKY HEADER
   ========================================================================== */
function initStickyHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    
    const handleScroll = () => {
        if (window.scrollY > 30) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check immediately on load
}

/* ==========================================================================
   3. MOBILE NAVIGATION MENU
   ========================================================================== */
function initMobileNav() {
    const mobileToggle = document.getElementById('mobileNavToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (!mobileToggle || !navLinks) return;
    
    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        // Animate toggle lines
        const lines = mobileToggle.querySelectorAll('span');
        if (navLinks.classList.contains('active')) {
            lines[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
            lines[1].style.opacity = '0';
            lines[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
        } else {
            lines[0].style.transform = 'none';
            lines[1].style.opacity = '1';
            lines[2].style.transform = 'none';
        }
    });
    
    // Close menu when a link is clicked
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const lines = mobileToggle.querySelectorAll('span');
            lines[0].style.transform = 'none';
            lines[1].style.opacity = '1';
            lines[2].style.transform = 'none';
        });
    });
}

/* ==========================================================================
   4. SCROLL REVEAL (Intersection Observer API)
   ========================================================================== */
function initScrollReveals() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null, // use viewport
            rootMargin: '0px',
            threshold: 0.15 // trigger when 15% visible
        };
        
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Run only once
                }
            });
        }, observerOptions);
        
        revealElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers
        revealElements.forEach(el => el.classList.add('active'));
    }
}

/* ==========================================================================
   5. IMPACT STATISTICS COUNTER
   ========================================================================== */
function initStatsCounter() {
    const counterElements = document.querySelectorAll('.counter-val');
    if (counterElements.length === 0) return;
    
    const runCounter = (el) => {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const duration = 2000; // 2 seconds
        const stepTime = Math.max(Math.floor(duration / target), 15);
        let current = 0;
        
        const timer = setInterval(() => {
            current += Math.ceil(target / (duration / stepTime));
            if (current >= target) {
                el.textContent = target.toLocaleString() + '+';
                clearInterval(timer);
            } else {
                el.textContent = current.toLocaleString() + '+';
            }
        }, stepTime);
    };
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    runCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        counterElements.forEach(el => observer.observe(el));
    } else {
        counterElements.forEach(el => runCounter(el));
    }
}

/* ==========================================================================
   6. TESTIMONIALS SLIDER (Reviews Carousel)
   ========================================================================== */
function initTestimonialsSlider() {
    const track = document.getElementById('sliderTrack');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const slides = document.querySelectorAll('.slide');
    
    if (!track || slides.length === 0) return;
    
    let currentIndex = 0;
    const totalSlides = slides.length;
    
    const updateSlider = () => {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
    };
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlider();
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateSlider();
        });
    }
    
    // Auto slide every 8 seconds
    let autoSlideInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlider();
    }, 8000);
    
    // Pause auto slide on hover/interact
    const container = document.querySelector('.slider-container');
    if (container) {
        container.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
        container.addEventListener('mouseleave', () => {
            autoSlideInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % totalSlides;
                updateSlider();
            }, 8000);
        });
    }
}

/* ==========================================================================
   7. INITIATIVES CATEGORY FILTER (Gallery Filter)
   ========================================================================== */
function initInitiativesFilter() {
    const filterContainer = document.getElementById('galleryFilters');
    if (!filterContainer) return;
    
    const filterBtns = filterContainer.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const galleryGrid = document.getElementById('galleryGrid');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active to current
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            if (galleryGrid) {
                if (filterValue === 'trust') {
                    galleryGrid.classList.add('centered-grid');
                } else {
                    galleryGrid.classList.remove('centered-grid');
                }
            }
            
            galleryItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                if (filterValue === 'all') {
                    // Hide the certificate (category 'trust') under "All Media"
                    if (itemCategory === 'trust') {
                        item.classList.add('hidden');
                    } else {
                        item.classList.remove('hidden');
                    }
                } else if (itemCategory === filterValue) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });
    
    // Trigger on load for the active filter button
    const activeBtn = filterContainer.querySelector('.filter-btn.active');
    if (activeBtn) {
        activeBtn.click();
    }
}

/* ==========================================================================
   8. GALLERY LIGHTBOX MODAL (Split Layout Card Modal)
   ========================================================================== */
function initGalleryLightbox() {
    const galleryContainer = document.getElementById('galleryGrid');
    if (!galleryContainer) return;
    
    // Create lightbox container dynamically
    let lightbox = document.getElementById('lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.className = 'lightbox';
        document.body.appendChild(lightbox);
    }
    
    // Close handler
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    // Zoom button click bindings
    const zoomButtons = document.querySelectorAll('.gallery-zoom-btn');
    zoomButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = btn.closest('.gallery-item');
            const img = item.querySelector('.gallery-img');
            const tagEl = item.querySelector('.card-tag');
            const titleEl = item.querySelector('h3');
            const descEl = item.querySelector('p');
            const metaEl = item.querySelector('.gallery-action span');
            
            // Build the split layout HTML inside the lightbox dynamically
            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <button class="lightbox-close" id="lightboxClose" aria-label="Close modal">&times;</button>
                    <div class="lightbox-left">
                        <img src="${img.src}" alt="${titleEl.textContent}" class="lightbox-img">
                    </div>
                    <div class="lightbox-right">
                        <span class="${tagEl.className} lightbox-tag">${tagEl.textContent}</span>
                        <h3 class="lightbox-title">${titleEl.textContent}</h3>
                        <p class="lightbox-desc">${descEl.textContent}</p>
                        <div class="lightbox-meta">
                            <span>${metaEl.textContent}</span>
                        </div>
                    </div>
                </div>
            `;
            
            // Re-attach close button listener since we re-created the content
            const lightboxClose = document.getElementById('lightboxClose');
            if (lightboxClose) {
                lightboxClose.addEventListener('click', closeLightbox);
            }
            
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Lock page scroll
        });
    });
    
    // Close click handlers for overlay and escape key
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
    });
}

/* ==========================================================================
   9. PREMIUM ANIMATED BACKGROUND SYSTEM (Gold particles & Glitter)
   ========================================================================== */
function initPremiumBackground() {
    const premiumBg = document.querySelector('.blob-container');
    if (!premiumBg) return;
    
    // Change class to premium-bg
    premiumBg.className = 'premium-bg';
    
    // Clear static blobs and create premium layers
    premiumBg.innerHTML = `
        <div class="light-rays"></div>
        <div class="bg-blob-new blob-gold"></div>
        <div class="bg-blob-new blob-blush"></div>
        <div class="bg-blob-new blob-cream"></div>
        <div class="particle-container" id="particleContainer"></div>
    `;
    
    const container = document.getElementById('particleContainer');
    if (!container) return;
    
    // Create floating gold particles
    const particleCount = 18;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'gold-particle';
        
        // Random size from 3px to 8px
        const size = Math.random() * 5 + 3;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random horizontal position
        particle.style.left = `${Math.random() * 100}%`;
        
        // Random speed (animation duration)
        const duration = Math.random() * 15 + 15; // 15s to 30s
        particle.style.animationDuration = `${duration}s`;
        
        // Random delay
        particle.style.animationDelay = `${Math.random() * -20}s`;
        
        // Random initial vertical position (so they start spread out on load)
        particle.style.top = `${Math.random() * 100}%`;
        
        container.appendChild(particle);
    }
    
    // Create glitter sparkles
    const sparkleCount = 8;
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'glitter-sparkle';
        
        // Random positioning
        sparkle.style.left = `${Math.random() * 90 + 5}%`;
        sparkle.style.top = `${Math.random() * 90 + 5}%`;
        
        // Random animation duration and delay
        sparkle.style.animationDuration = `${Math.random() * 4 + 4}s`; // 4s to 8s
        sparkle.style.animationDelay = `${Math.random() * -8}s`;
        
        container.appendChild(sparkle);
    }
}
