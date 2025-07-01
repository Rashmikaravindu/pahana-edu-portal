/**
 * ==============================================================================
 * PAHANA EDU - DASHBOARD JAVASCRIPT
 * ==============================================================================
 * Additional functionality for logged-in user dashboard
 * Complements the existing script.js
 * ==============================================================================
 */

// ==============================================================================
// DOCUMENT READY STATE
// ==============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Pahana Edu Dashboard - JavaScript Loaded Successfully');
    
    // Initialize dashboard functionality
    initUserDropdown();
    initBookActions();
    initActivityAnimations();
    initStatsCounter();
    initResponsiveFeatures();
});

// ==============================================================================
// USER DROPDOWN FUNCTIONALITY
// ==============================================================================

function initUserDropdown() {
    const userMenuToggle = document.getElementById('userMenuToggle');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuToggle && userDropdown) {
        // Toggle dropdown on click
        userMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
            
            // Rotate chevron icon
            const chevron = this.querySelector('i');
            if (userDropdown.classList.contains('show')) {
                chevron.style.transform = 'rotate(180deg)';
            } else {
                chevron.style.transform = 'rotate(0deg)';
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userMenuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
                const chevron = userMenuToggle.querySelector('i');
                chevron.style.transform = 'rotate(0deg)';
            }
        });
        
        // Close dropdown on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && userDropdown.classList.contains('show')) {
                userDropdown.classList.remove('show');
                const chevron = userMenuToggle.querySelector('i');
                chevron.style.transform = 'rotate(0deg)';
                userMenuToggle.focus();
            }
        });
        
        // Handle keyboard navigation in dropdown
        const dropdownItems = userDropdown.querySelectorAll('.dropdown-item');
        dropdownItems.forEach((item, index) => {
            item.addEventListener('keydown', function(e) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextIndex = (index + 1) % dropdownItems.length;
                    dropdownItems[nextIndex].focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevIndex = (index - 1 + dropdownItems.length) % dropdownItems.length;
                    dropdownItems[prevIndex].focus();
                }
            });
        });
    }
}

// ==============================================================================
// BOOK ACTIONS FUNCTIONALITY
// ==============================================================================

function initBookActions() {
    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.btn-add-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookCard = this.closest('.book-card');
            const bookTitle = bookCard.querySelector('h4').textContent;
            
            // Add loading state
            const originalText = this.textContent;
            this.textContent = 'Adding...';
            this.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                this.textContent = 'Added!';
                this.style.background = 'var(--success-color)';
                
                // Show success message
                showNotification(`"${bookTitle}" added to cart!`, 'success');
                
                // Update cart counter (if exists)
                updateCartCounter();
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = '';
                    this.disabled = false;
                }, 2000);
            }, 1000);
        });
    });
    
    // Wishlist functionality
    const wishlistButtons = document.querySelectorAll('.btn-wishlist');
    wishlistButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookCard = this.closest('.book-card');
            const bookTitle = bookCard.querySelector('h4').textContent;
            const icon = this.querySelector('i');
            
            // Toggle wishlist state
            if (icon.classList.contains('fas')) {
                // Remove from wishlist
                icon.classList.remove('fas');
                icon.classList.add('far');
                this.style.background = '';
                this.style.color = '';
                this.style.borderColor = '';
                showNotification(`"${bookTitle}" removed from wishlist`, 'info');
            } else {
                // Add to wishlist
                icon.classList.remove('far');
                icon.classList.add('fas');
                this.style.background = 'var(--alert-color)';
                this.style.color = 'var(--white)';
                this.style.borderColor = 'var(--alert-color)';
                showNotification(`"${bookTitle}" added to wishlist!`, 'success');
                updateWishlistCounter();
            }
        });
    });
    
    // Quick view functionality
    const quickViewButtons = document.querySelectorAll('.btn-quick-view');
    quickViewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookCard = this.closest('.book-card');
            const bookTitle = bookCard.querySelector('h4').textContent;
            
            // For now, just show a notification
            // In a real app, this would open a modal
            showNotification(`Quick view for "${bookTitle}" - Feature coming soon!`, 'info');
        });
    });
}

// ==============================================================================
// NOTIFICATION SYSTEM
// ==============================================================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Set notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        font-size: 14px;
        z-index: 10000;
        max-width: 350px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    // Set background color based on type
    const colors = {
        success: 'var(--success-color)',
        error: 'var(--alert-color)',
        info: 'var(--primary-color)',
        warning: '#FFA500'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    // Add icon based on type
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-triangle'
    };
    
    const icon = document.createElement('i');
    icon.className = icons[type] || icons.info;
    notification.appendChild(icon);
    
    const messageText = document.createElement('span');
    messageText.textContent = message;
    notification.appendChild(messageText);
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        margin-left: auto;
        font-size: 12px;
    `;
    closeBtn.addEventListener('click', () => {
        removeNotification(notification);
    });
    notification.appendChild(closeBtn);
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        removeNotification(notification);
    }, 5000);
}

function removeNotification(notification) {
    if (notification && notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// ==============================================================================
// COUNTER UPDATES
// ==============================================================================

function updateCartCounter() {
    const cartCounter = document.querySelector('.stat-card .stat-number');
    if (cartCounter) {
        let currentCount = parseInt(cartCounter.textContent) || 0;
        currentCount++;
        animateCounterUpdate(cartCounter, currentCount);
    }
}

function updateWishlistCounter() {
    const wishlistCounters = document.querySelectorAll('.stat-card .stat-number');
    if (wishlistCounters.length > 1) {
        const wishlistCounter = wishlistCounters[1]; // Second counter is wishlist
        let currentCount = parseInt(wishlistCounter.textContent) || 0;
        currentCount++;
        animateCounterUpdate(wishlistCounter, currentCount);
    }
}

function animateCounterUpdate(element, newValue) {
    element.style.transform = 'scale(1.2)';
    element.style.color = 'var(--success-color)';
    
    setTimeout(() => {
        element.textContent = newValue;
        element.style.transform = 'scale(1)';
        element.style.color = '';
    }, 150);
}

// ==============================================================================
// STATS COUNTER ANIMATION
// ==============================================================================

function initStatsCounter() {
    // This function can be called to animate the stats when they come into view
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const statsSection = document.querySelector('.quick-stats');
    if (statsSection) {
        observer.observe(statsSection);
    }
}

function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach((stat, index) => {
        setTimeout(() => {
            stat.style.transform = 'scale(1.1)';
            setTimeout(() => {
                stat.style.transform = 'scale(1)';
            }, 200);
        }, index * 100);
    });
}

// ==============================================================================
// ACTIVITY ANIMATIONS
// ==============================================================================

function initActivityAnimations() {
    const activityItems = document.querySelectorAll('.activity-item');
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }
        });
    }, { threshold: 0.1 });
    
    activityItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        item.style.transition = 'all 0.6s ease';
        item.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(item);
    });
}

// ==============================================================================
// RESPONSIVE FEATURES
// ==============================================================================

function initResponsiveFeatures() {
    // Mobile menu integration with existing functionality
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const userDropdown = document.getElementById('userDropdown');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            // Close user dropdown when opening mobile menu
            if (userDropdown && userDropdown.classList.contains('show')) {
                userDropdown.classList.remove('show');
                const userMenuToggle = document.getElementById('userMenuToggle');
                if (userMenuToggle) {
                    const chevron = userMenuToggle.querySelector('i');
                    if (chevron) {
                        chevron.style.transform = 'rotate(0deg)';
                    }
                }
            }
        });
    }
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Close dropdowns on resize
            if (userDropdown && userDropdown.classList.contains('show')) {
                userDropdown.classList.remove('show');
                const userMenuToggle = document.getElementById('userMenuToggle');
                if (userMenuToggle) {
                    const chevron = userMenuToggle.querySelector('i');
                    if (chevron) {
                        chevron.style.transform = 'rotate(0deg)';
                    }
                }
            }
        }, 250);
    });
}

// ==============================================================================
// UTILITY FUNCTIONS
// ==============================================================================

// Smooth scroll to section (extends existing functionality)
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.getElementById('header').offsetHeight;
        const targetPosition = section.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Format price for display
function formatPrice(price) {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR'
    }).format(price);
}

// Debounce function for search
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

// ==============================================================================
// ADD CUSTOM ANIMATIONS
// ==============================================================================

// Add notification animations to document
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// ==============================================================================
// CONSOLE LOGGING
// ==============================================================================

console.log('Dashboard Features Initialized:');
console.log('- User dropdown menu');
console.log('- Book actions (cart, wishlist, quick view)');
console.log('- Notification system');
console.log('- Stats counter animation');
console.log('- Activity animations');
console.log('- Responsive features');