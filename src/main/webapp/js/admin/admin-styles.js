/**
 * 
 *//**
 * PAHANA EDU - ADMIN DASHBOARD DYNAMIC STYLES
 * CSS animations, styles, and UI enhancements
 */

// ==============================================================================
// DYNAMIC STYLES INJECTION
// ==============================================================================

function injectAdminStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* ==============================================================================
           ADMIN DASHBOARD DYNAMIC STYLES
           ============================================================================== */
        
        /* Animations */
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.02); }
        }
        
        @keyframes bounce {
            0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
            40%, 43% { transform: translate3d(0, -8px, 0); }
            70% { transform: translate3d(0, -4px, 0); }
            90% { transform: translate3d(0, -2px, 0); }
        }
        
        /* Notification Styles */
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 4px;
            margin-left: 15px;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        
        .notification-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        /* Badge Styles */
        .badge {
            padding: 6px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: inline-block;
            line-height: 1;
        }
        
        .badge.active {
            background: #10b981;
            color: white;
        }
        
        .badge.inactive {
            background: #ef4444;
            color: white;
        }
        
        /* Stock Badge Styles */
        .stock-badge {
            padding: 6px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            color: white;
            display: inline-block;
            text-align: center;
            min-width: 60px;
            line-height: 1;
        }
        
        .stock-badge.normal-stock {
            background: #10b981;
        }
        
        .stock-badge.low-stock {
            background: #f59e0b;
            animation: pulse 2s infinite;
        }
        
        .stock-badge.out-of-stock {
            background: #64748b;
        }
        
        /* Book Status Badge */
        .book-status-badge {
            padding: 6px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
            text-align: center;
            min-width: 80px;
            line-height: 1;
        }
        
        .book-status-badge.active {
            background: #10b981;
            color: white;
        }
        
        .book-status-badge.inactive {
            background: #64748b;
            color: white;
        }
        
        .book-status-badge.out-of-stock {
            background: #ef4444;
            color: white;
        }
        
        /* Button Styles */
        .btn-sm {
            padding: 8px 12px;
            margin: 0 2px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 36px;
            height: 36px;
        }
        
        .btn-info {
            background: #06b6d4;
            color: white;
        }
        
        .btn-info:hover {
            background: #0891b2;
            transform: translateY(-1px);
        }
        
        .btn-danger {
            background: #ef4444;
            color: white;
        }
        
        .btn-danger:hover {
            background: #dc2626;
            transform: translateY(-1px);
        }
        
        .btn-success {
            background: #10b981;
            color: white;
        }
        
        .btn-success:hover {
            background: #059669;
            transform: translateY(-1px);
        }
        
        /* Action Buttons */
        .action-buttons {
            display: flex;
            gap: 4px;
            justify-content: center;
            align-items: center;
        }
        
        .action-btn {
            padding: 8px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            font-size: 12px;
        }
        
        .action-btn.edit {
            background: #3b82f6;
            color: white;
        }
        
        .action-btn.edit:hover {
            background: #2563eb;
            transform: translateY(-1px);
        }
        
        .action-btn.delete {
            background: #ef4444;
            color: white;
        }
        
        .action-btn.delete:hover {
            background: #dc2626;
            transform: translateY(-1px);
        }
        
        .action-btn.view {
            background: #10b981;
            color: white;
        }
        
        .action-btn.view:hover {
            background: #059669;
            transform: translateY(-1px);
        }
        
        /* Form Styles */
        .form-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        
        .btn-secondary {
            background: #64748b;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
        }
        
        .btn-secondary:hover {
            background: #475569;
            transform: translateY(-1px);
        }
        
        .btn-primary {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
        }
        
        .btn-primary:hover {
            background: #2563eb;
            transform: translateY(-1px);
        }
        
        .form-group {
            margin-bottom: 16px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 6px;
            font-weight: 500;
            color: #374151;
        }
        
        .form-group input, 
        .form-group select, 
        .form-group textarea {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            box-sizing: border-box;
            font-size: 14px;
            transition: all 0.2s;
        }
        
        .form-group input:focus, 
        .form-group select:focus, 
        .form-group textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .form-group textarea {
            resize: vertical;
            font-family: inherit;
            min-height: 80px;
        }
        
        .form-row {
            display: flex;
            gap: 16px;
        }
        
        .form-row .form-group {
            flex: 1;
        }
        
        /* Book Display Styles */
        .book-title-cell {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 200px;
        }
        
        .book-thumbnail {
            width: 40px;
            height: 40px;
            object-fit: cover;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            flex-shrink: 0;
        }
        
        .book-no-image {
            width: 40px;
            height: 40px;
            background: #f3f4f6;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #9ca3af;
            border: 1px solid #e5e7eb;
            flex-shrink: 0;
        }
        
        .book-title {
            font-weight: 500;
            color: #1f2937;
            line-height: 1.3;
        }
        
        .author-cell {
            color: #6b7280;
            font-style: italic;
        }
        
        .category-cell {
            color: #374151;
            font-weight: 500;
        }
        
        .stock-cell {
            text-align: center;
        }
        
        .status-cell {
            text-align: center;
        }
        
        /* Price Display */
        .price-cell {
            display: flex;
            flex-direction: column;
            gap: 4px;
            min-width: 120px;
        }
        
        .original-price {
            text-decoration: line-through;
            color: #9ca3af;
            font-size: 13px;
        }
        
        .offer-price {
            color: #ef4444;
            font-weight: 700;
            font-size: 15px;
        }
        
        .current-price {
            font-weight: 700;
            font-size: 15px;
            color: #1f2937;
        }
        
        .discount-badge {
            background: #fef2f2;
            color: #ef4444;
            padding: 2px 6px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            align-self: flex-start;
            line-height: 1;
            border: 1px solid #fecaca;
        }
        
        /* Book Details View */
        .book-details-view {
            display: flex;
            gap: 24px;
            max-height: 80vh;
            overflow: auto;
        }
        
        .book-images-gallery {
            flex: 1;
            max-width: 50%;
        }
        
        .main-image {
            margin-bottom: 12px;
        }
        
        .main-image img {
            width: 100%;
            max-height: 400px;
            object-fit: contain;
            border-radius: 12px;
            background: #f8fafc;
            padding: 20px;
            border: 1px solid #e5e7eb;
        }
        
        .thumbnail-images {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            padding: 8px;
        }
        
        .thumbnail {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 6px;
            cursor: pointer;
            opacity: 0.7;
            border: 2px solid transparent;
            transition: all 0.2s;
            flex-shrink: 0;
        }
        
        .thumbnail:hover {
            opacity: 1;
            transform: scale(1.05);
        }
        
        .thumbnail.active {
            opacity: 1;
            border-color: #3b82f6;
            box-shadow: 0 0 0 1px #3b82f6;
        }
        
        .no-image-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 250px;
            background: #f8fafc;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            color: #6b7280;
        }
        
        .no-image-placeholder i {
            font-size: 48px;
            margin-bottom: 12px;
        }
        
        .book-info {
            flex: 1;
        }
        
        .book-info h3 {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 8px;
            line-height: 1.2;
        }
        
        .book-author {
            color: #6b7280;
            font-size: 16px;
            margin-bottom: 20px;
            font-style: italic;
        }
        
        .book-meta {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid #e5e7eb;
        }
        
        .meta-item {
            display: flex;
            margin-bottom: 12px;
            align-items: flex-start;
        }
        
        .meta-item:last-child {
            margin-bottom: 0;
        }
        
        .meta-item label {
            width: 120px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0;
            flex-shrink: 0;
        }
        
        .meta-item span {
            flex: 1;
            color: #6b7280;
        }
        
        .price-display {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .book-description, .book-details {
            margin-bottom: 20px;
        }
        
        .book-description label, .book-details label {
            font-weight: 600;
            color: #374151;
            display: block;
            margin-bottom: 8px;
            font-size: 16px;
        }
        
        .book-description p, .book-details p {
            color: #6b7280;
            line-height: 1.6;
            margin: 0;
            font-size: 14px;
        }
        
        .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        
        /* Image Preview */
        .image-preview {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 12px;
        }
        
        .image-preview-item {
            position: relative;
            width: 80px;
            text-align: center;
        }
        
        .image-preview-item img {
            width: 100%;
            height: 80px;
            object-fit: cover;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
        }
        
        .image-preview-item span {
            display: block;
            text-align: center;
            font-size: 11px;
            color: #6b7280;
            margin-top: 4px;
        }
        
        .current-images {
            margin-top: 12px;
        }
        
        .current-images label {
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
            display: block;
            font-size: 14px;
        }
        
        .current-images-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
        }
        
        .current-image-item {
            position: relative;
            width: 80px;
            text-align: center;
        }
        
        .current-image-item img {
            width: 100%;
            height: 80px;
            object-fit: cover;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
        }
        
        .current-image-item span {
            display: block;
            text-align: center;
            font-size: 11px;
            color: #6b7280;
            margin-top: 4px;
        }
        
        /* File Input */
        .file-input {
            padding: 20px !important;
            border: 2px dashed #d1d5db !important;
            background: #f9fafb !important;
            cursor: pointer;
            text-align: center;
            transition: all 0.2s;
            border-radius: 8px !important;
        }
        
        .file-input:hover {
            border-color: #3b82f6 !important;
            background: #eff6ff !important;
        }
        
        .file-input-help {
            font-size: 12px;
            color: #6b7280;
            margin-top: 6px;
            text-align: center;
        }
        
        /* Billing Styles */
        .bill-items-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .bill-items-header h4 {
            margin: 0;
            color: #374151;
            font-weight: 600;
        }
        
        .bill-items-list {
            min-height: 100px;
        }
        
        .empty-bill-message {
            text-align: center;
            color: #6b7280;
            padding: 40px 20px;
        }
        
        .empty-bill-message i {
            font-size: 32px;
            margin-bottom: 12px;
            display: block;
        }
        
        .bill-item {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
            background: #f9fafb;
        }
        
        .bill-item-content .form-row {
            align-items: end;
        }
        
        .bill-item-content .form-group:last-child {
            display: flex;
            align-items: end;
        }
        
        /* Table Responsive */
        @media (max-width: 768px) {
            .book-details-view {
                flex-direction: column;
            }
            
            .book-images-gallery {
                max-width: 100%;
            }
            
            .form-row {
                flex-direction: column;
            }
            
            .action-buttons {
                flex-direction: column;
                gap: 2px;
            }
            
            .book-title-cell {
                min-width: auto;
            }
        }
        
        /* Animation Classes */
        .animate-fadeInUp {
            animation: fadeInUp 0.5s ease-out;
        }
        
        .animate-pulse {
            animation: pulse 2s infinite;
        }
        
        .animate-bounce {
            animation: bounce 1s infinite;
        }
        
        /* Loading States */
        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
        }
        
        .loading-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #e5e7eb;
            border-radius: 50%;
            border-top-color: #3b82f6;
            animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    
    document.head.appendChild(style);
    console.log('🎨 Admin dashboard styles injected');
}

// ==============================================================================
// UTILITY FUNCTIONS
// ==============================================================================

function addAnimationClass(element, animationClass) {
    if (element) {
        element.classList.add(animationClass);
        
        // Remove animation class after animation completes
        element.addEventListener('animationend', function() {
            element.classList.remove(animationClass);
        }, { once: true });
    }
}

function showLoadingOverlay(container) {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    
    if (container) {
        container.style.position = 'relative';
        container.appendChild(overlay);
    }
    
    return overlay;
}

function hideLoadingOverlay(overlay) {
    if (overlay && overlay.parentElement) {
        overlay.remove();
    }
}

// ==============================================================================
// THEME FUNCTIONS
// ==============================================================================

function applyDarkTheme() {
    document.body.classList.add('dark-theme');
    localStorage.setItem('admin-theme', 'dark');
}

function applyLightTheme() {
    document.body.classList.remove('dark-theme');
    localStorage.setItem('admin-theme', 'light');
}

function toggleTheme() {
    if (document.body.classList.contains('dark-theme')) {
        applyLightTheme();
    } else {
        applyDarkTheme();
    }
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme === 'dark') {
        applyDarkTheme();
    }
}

// ==============================================================================
// INITIALIZATION
// ==============================================================================

// Inject styles when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectAdminStyles);
} else {
    injectAdminStyles();
}

// Load saved theme
loadSavedTheme();

// ==============================================================================
// EXPORT FUNCTIONS
// ==============================================================================

// Export style functions for global access
window.adminStyles = {
    injectAdminStyles,
    addAnimationClass,
    showLoadingOverlay,
    hideLoadingOverlay,
    applyDarkTheme,
    applyLightTheme,
    toggleTheme,
    loadSavedTheme
};