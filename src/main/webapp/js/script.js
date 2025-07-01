/**
 * ==============================================================================
 * PAHANA EDU - HOMEPAGE JAVASCRIPT
 * ==============================================================================
 * Interactive functionality for the homepage including:
 * - Header scroll effects
 * - Smooth scrolling navigation
 * - Scroll animations
 * - Mobile menu toggle
 * - Counter animations
 * - Interactive hover effects
 * ==============================================================================
 */

// ==============================================================================
// DOCUMENT READY STATE
// ==============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Pahana Edu Homepage - JavaScript Loaded Successfully');
    
    // Initialize all functionality
    initHeaderEffects();
    initSmoothScrolling();
    initScrollAnimations();
    initMobileMenu();
    initCounterAnimations();
    initInteractiveEffects();
    initFormValidation();
    initAccessibility();
});

// ==============================================================================
// HEADER SCROLL EFFECTS
// ==============================================================================

function initHeaderEffects() {
    const header = document.getElementById('header');
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateHeader() {
        const scrollY = window.scrollY;
        
        // Add scrolled class when scrolled down
        if (scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Update last scroll position
        lastScrollY = scrollY;
        ticking = false;
    }

    function requestHeaderUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }

    // Listen for scroll events
    window.addEventListener('scroll', requestHeaderUpdate, { passive: true });
}

// ==============================================================================
// SMOOTH SCROLLING NAVIGATION
// ==============================================================================

function initSmoothScrolling() {
    // Handle navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                const navMenu = document.querySelector('.nav-menu');
                const mobileToggle = document.querySelector('.mobile-menu-toggle');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    mobileToggle.classList.remove('active');
                }
            }
        });
    });
}

// ==============================================================================
// SCROLL ANIMATIONS (INTERSECTION OBSERVER)
// ==============================================================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Trigger counter animation for stats
                if (entry.target.classList.contains('hero')) {
                    triggerCounterAnimations();
                }
            }
        });
    }, observerOptions);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // Observe hero section for counter animation
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        observer.observe(heroSection);
    }
}

// ==============================================================================
// MOBILE MENU FUNCTIONALITY
// ==============================================================================

function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navActions = document.querySelector('.nav-actions');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            // Toggle menu visibility
            navMenu.classList.toggle('active');
            navActions.classList.toggle('active');
            this.classList.toggle('active');

            // Animate hamburger lines
            const spans = this.querySelectorAll('span');
            if (this.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }

            // Prevent body scroll when menu is open
            document.body.style.overflow = this.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navActions.classList.remove('active');
                mobileToggle.classList.remove('active');
                document.body.style.overflow = '';
                
                // Reset hamburger animation
                const spans = mobileToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }
}

// ==============================================================================
// COUNTER ANIMATIONS
// ==============================================================================

function initCounterAnimations() {
    // This will be called when hero section becomes visible
}

function triggerCounterAnimations() {
    const statNumbers = document.querySelectorAll('.stat-number');
    const targets = [500, 50, 99.9];
    const suffixes = ['+', 'k+', '%'];

    statNumbers.forEach((stat, index) => {
        if (targets[index] !== undefined) {
            setTimeout(() => {
                animateCounter(stat, targets[index], suffixes[index]);
            }, index * 200);
        }
    });
}

function animateCounter(element, target, suffix = '') {
    let current = 0;
    const increment = target / 100;
    const duration = 2000; // 2 seconds
    const stepTime = duration / 100;

    const timer = setInterval(() => {
        current += increment;
        
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        let displayValue;
        if (suffix === 'k+') {
            displayValue = (current / 1000).toFixed(1) + 'k+';
        } else if (suffix === '%') {
            displayValue = current.toFixed(1) + '%';
        } else {
            displayValue = Math.floor(current) + '+';
        }
        
        element.textContent = displayValue;
    }, stepTime);
}

// ==============================================================================
// INTERACTIVE HOVER EFFECTS
// ==============================================================================

function initInteractiveEffects() {
    // Feature cards hover effects
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(0, 119, 182, 0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '';
        });
    });

    // Contact items hover effects
    document.querySelectorAll('.contact-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });

    // Button ripple effects
    document.querySelectorAll('.btn-primary, .btn-secondary, .cta-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// ==============================================================================
// FORM VALIDATION (FOR FUTURE FORMS)
// ==============================================================================

function initFormValidation() {
    // Newsletter signup form (if exists)
    const newsletterForm = document.querySelector('#newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            if (validateEmail(email)) {
                showSuccessMessage('Thank you for subscribing!');
                this.reset();
            } else {
                showErrorMessage('Please enter a valid email address.');
            }
        });
    }

    // Contact form validation (if exists)
    const contactForm = document.querySelector('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const isValid = validateContactForm(formData);
            
            if (isValid) {
                showSuccessMessage('Message sent successfully! We will get back to you soon.');
                this.reset();
            }
        });
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateContactForm(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    if (!name || name.length < 2) {
        showErrorMessage('Please enter a valid name.');
        return false;
    }
    
    if (!validateEmail(email)) {
        showErrorMessage('Please enter a valid email address.');
        return false;
    }
    
    if (!message || message.length < 10) {
        showErrorMessage('Please enter a message with at least 10 characters.');
        return false;
    }
    
    return true;
}

function showSuccessMessage(message) {
    showToast(message, 'success');
}

function showErrorMessage(message) {
    showToast(message, 'error');
}

function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add styles
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        background: ${type === 'success' ? 'var(--success-color)' : 'var(--alert-color)'};
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// ==============================================================================
// ACCESSIBILITY ENHANCEMENTS
// ==============================================================================

function initAccessibility() {
    // Keyboard navigation for mobile menu
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    }

    // Focus management for modals and dropdowns
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close mobile menu on escape
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu && navMenu.classList.contains('active')) {
                const mobileToggle = document.querySelector('.mobile-menu-toggle');
                mobileToggle.click();
            }
        }
    });

    // Announce dynamic content changes to screen readers
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
    `;
    document.body.appendChild(announcer);

    // Store announcer globally for use in other functions
    window.screenReaderAnnouncer = announcer;
}

// ==============================================================================
// UTILITY FUNCTIONS
// ==============================================================================

// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ==============================================================================
// PERFORMANCE MONITORING
// ==============================================================================

// Monitor page load performance
window.addEventListener('load', function() {
    const loadTime = performance.now();
    console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
    
    // Report Web Vitals if available
    if ('web-vital' in window) {
        // Implementation for Core Web Vitals tracking
        console.log('Web Vitals tracking initialized');
    }
});

// ==============================================================================
// ERROR HANDLING
// ==============================================================================

window.addEventListener('error', function(e) {
    console.error('JavaScript error occurred:', e.error);
    
    // Could send error reports to analytics service
    // analytics.reportError(e.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
});

// ==============================================================================
// CUSTOM ANIMATIONS
// ==============================================================================

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==============================================================================
// EXPORT FOR MODULE USAGE (IF NEEDED)
// ==============================================================================

// If using modules, export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initHeaderEffects,
        initSmoothScrolling,
        initScrollAnimations,
        initMobileMenu,
        initCounterAnimations,
        initInteractiveEffects,
        debounce,
        throttle,
        isInViewport
    };
}