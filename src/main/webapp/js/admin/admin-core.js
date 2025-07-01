/**
 * PAHANA EDU - ADMIN DASHBOARD CORE FUNCTIONALITY
 * Core initialization, navigation, API calls, and modal management
 */

// Create adminCore namespace
window.adminCore = (function() {
    'use strict';

    // Global Variables
    let currentPage = 'dashboard';
    let sidebarCollapsed = false;
    let data = {
        customers: [],
        cashiers: [],
        books: [],
        categories: [],
        bills: [],
        stats: {
            totalCustomers: 0,
            totalCashiers: 0,
            totalBooks: 0,
            totalRevenue: 0,
            totalOrders: 0,
            outOfStockBooks: 0,
            lowStockBooks: 0
        }
    };

    // ==============================================================================
    // INITIALIZATION
    // ==============================================================================

    function initialize() {
        console.log('🎯 Pahana Edu Admin Dashboard - Core Initializing...');
        
        initializeEventListeners();
        
        // Load all data on initial load
        loadAllData();
        
        // Show welcome notification
        setTimeout(() => {
            showNotification('Admin Dashboard loaded successfully!', 'success');
        }, 1000);
        
        console.log('✅ Admin Dashboard Core initialized successfully');
    }

    // ==============================================================================
    // LOAD ALL DATA FUNCTION
    // ==============================================================================

    function loadAllData() {
        console.log('📊 Loading all initial data...');
        
        // Load all data simultaneously
        Promise.all([
            window.adminStats ? window.adminStats.loadStats() : Promise.resolve(),
            window.adminCustomers ? window.adminCustomers.loadCustomers() : Promise.resolve(),
            window.adminCashiers ? window.adminCashiers.loadCashiers() : Promise.resolve(),
            window.adminInventory ? window.adminInventory.loadBooks() : Promise.resolve(),
            window.adminInventory ? window.adminInventory.loadCategories() : Promise.resolve()
        ]).then(() => {
            console.log('✅ All data loaded successfully');
            updateAllDisplays();
        }).catch(error => {
            console.error('❌ Failed to load initial data:', error);
            showNotification('Failed to load some data. Please refresh the page.', 'error');
        });
    }

    // ==============================================================================
    // UPDATE ALL DISPLAYS AFTER DATA LOAD
    // ==============================================================================

    function updateAllDisplays() {
        if (window.adminStats) {
            window.adminStats.updateStats();
            window.adminStats.updateInventoryStats();
        }
        
        if (window.adminCharts) {
            window.adminCharts.updateCategoryChart();
        }
        
        // Update displays if we're on the respective pages
        if (currentPage === 'customers' && window.adminCustomers) {
            window.adminCustomers.displayCustomers();
        }
        if (currentPage === 'cashiers' && window.adminCashiers) {
            window.adminCashiers.displayCashiers();
        }
        if (currentPage === 'inventory' && window.adminInventory) {
            window.adminInventory.displayBooks();
        }
    }

    // ==============================================================================
    // NAVIGATION
    // ==============================================================================

    function navigateToPage(page) {
        console.log(`🔄 Navigating to: ${page}`);
        
        // Update active navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            const link = item.querySelector('.nav-link');
            if (link && link.getAttribute('data-page') === page) {
                item.classList.add('active');
            }
        });
        
        // Hide all page contents
        const pageContents = document.querySelectorAll('.page-content');
        pageContents.forEach(content => {
            content.style.display = 'none';
        });
        
        // Show selected page content
        const targetContent = document.getElementById(page + '-content');
        if (targetContent) {
            targetContent.style.display = 'block';
        }
        
        // Update page title and subtitle
        updatePageTitle(page);
        
        // Load page-specific data and ensure display
        loadPageData(page);
        
        currentPage = page;
        console.log(`📍 Successfully navigated to: ${page}`);
    }

    function loadPageData(page) {
        console.log(`📊 Loading data for page: ${page}`);
        
        switch(page) {
            case 'customers':
                if (data.customers.length > 0 && window.adminCustomers) {
                    window.adminCustomers.displayCustomers();
                } else if (window.adminCustomers) {
                    window.adminCustomers.loadCustomers();
                }
                break;
            case 'cashiers':
                if (data.cashiers.length > 0 && window.adminCashiers) {
                    window.adminCashiers.displayCashiers();
                } else if (window.adminCashiers) {
                    window.adminCashiers.loadCashiers();
                }
                break;
            case 'inventory':
                if (data.books.length > 0 && window.adminInventory) {
                    window.adminInventory.displayBooks();
                    if (window.adminStats) {
                        window.adminStats.updateInventoryStatsFromBooks(data.books);
                    }
                } else if (window.adminInventory) {
                    window.adminInventory.loadBooks();
                }
                break;
            case 'billing':
                if (window.adminBilling) {
                    window.adminBilling.initializeBillingSystem();
                }
                break;
            case 'reports':
                loadReports();
                break;
            case 'dashboard':
                if (window.adminStats) {
                    window.adminStats.updateStats();
                    window.adminStats.updateInventoryStats();
                }
                break;
        }
    }

    // ==============================================================================
    // BACKEND API CALLS
    // ==============================================================================

    function makeApiCall(url, options = {}) {
        console.log(`🌐 Making API call to: ${url}`);
        
        return fetch(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                ...options.headers
            },
            body: options.body
        })
        .then(response => {
            console.log(`📡 API Response status: ${response.status}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('📦 API Response data:', data);
            return data;
        })
        .catch(error => {
            console.error('❌ API call failed:', error);
            showNotification('Network error: ' + error.message, 'error');
            throw error;
        });
    }

    // ==============================================================================
    // EVENT LISTENERS
    // ==============================================================================

    function initializeEventListeners() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', toggleSidebar);
        }
        
        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                if (!this.getAttribute('href') || this.getAttribute('href') === '#') {
                    e.preventDefault();
                    const page = this.getAttribute('data-page');
                    if (page) {
                        navigateToPage(page);
                    }
                }
            });
        });
        
        // Modal close on overlay click
        const modal = document.getElementById('modal');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal();
                }
            });
        }
        
        // Sales period change
        const salesPeriod = document.getElementById('salesPeriod');
        if (salesPeriod) {
            salesPeriod.addEventListener('change', function() {
                if (window.adminCharts) {
                    window.adminCharts.updateSalesChart(this.value);
                }
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.altKey) {
                switch(e.key) {
                    case 'd':
                    case 'D':
                        e.preventDefault();
                        navigateToPage('dashboard');
                        break;
                    case 'c':
                    case 'C':
                        e.preventDefault();
                        navigateToPage('customers');
                        break;
                    case 'i':
                    case 'I':
                        e.preventDefault();
                        navigateToPage('inventory');
                        break;
                    case 'b':
                    case 'B':
                        e.preventDefault();
                        navigateToPage('billing');
                        break;
                    case 'r':
                    case 'R':
                        e.preventDefault();
                        navigateToPage('reports');
                        break;
                }
            }
        });
        
        console.log('✅ Event listeners initialized');
    }

    // ==============================================================================
    // SIDEBAR FUNCTIONS
    // ==============================================================================

    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');
        sidebarCollapsed = !sidebarCollapsed;
        
        // Update charts on sidebar toggle
        setTimeout(() => {
            if (window.adminCharts && window.adminCharts.charts) {
                if (window.adminCharts.charts.salesChart) {
                    window.adminCharts.charts.salesChart.resize();
                }
                if (window.adminCharts.charts.categoryChart) {
                    window.adminCharts.charts.categoryChart.resize();
                }
            }
        }, 300);
    }

    function updatePageTitle(page) {
        const titles = {
            dashboard: { title: 'Dashboard', subtitle: 'Welcome to your admin control panel' },
            customers: { title: 'Customer Management', subtitle: 'Manage customer accounts and information' },
            cashiers: { title: 'Cashier Management', subtitle: 'Manage cashier accounts and permissions' },
            inventory: { title: 'Inventory Management', subtitle: 'Manage books and stock levels' },
            billing: { title: 'Billing System', subtitle: 'Create and manage customer bills' },
            reports: { title: 'Reports & Analytics', subtitle: 'View business reports and analytics' },
            settings: { title: 'System Settings', subtitle: 'Configure system preferences' }
        };
        
        const pageInfo = titles[page] || titles.dashboard;
        
        const pageTitle = document.getElementById('pageTitle');
        const pageSubtitle = document.getElementById('pageSubtitle');
        
        if (pageTitle) pageTitle.textContent = pageInfo.title;
        if (pageSubtitle) pageSubtitle.textContent = pageInfo.subtitle;
    }

    // ==============================================================================
    // REPORTS
    // ==============================================================================

    function loadReports() {
        console.log('📊 Loading reports...');
    }

    // ==============================================================================
    // MODAL MANAGEMENT
    // ==============================================================================

    function showModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    function closeModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    // ==============================================================================
    // NOTIFICATIONS
    // ==============================================================================

    function showNotification(message, type = 'info') {
        console.log(`🔔 Notification: ${message} (${type})`);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            animation: slideInRight 0.3s ease;
        `;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    function getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    function getNotificationColor(type) {
        switch(type) {
            case 'success': return '#10b981';
            case 'error': return '#ef4444';
            case 'warning': return '#f59e0b';
            default: return '#06b6d4';
        }
    }

    // ==============================================================================
    // DEBUGGING FUNCTIONS
    // ==============================================================================

    function debugDataState() {
        console.log('🐛 Current Data State:');
        console.log('├── Customers:', data.customers.length);
        console.log('├── Cashiers:', data.cashiers.length);
        console.log('├── Books:', data.books.length);
        console.log('├── Categories:', data.categories.length);
        console.log('├── Stats:', data.stats);
        console.log('└── Current Page:', currentPage);
    }

    function refreshAllData() {
        console.log('🔄 Refreshing all data...');
        loadAllData();
    }

    // ==============================================================================
    // INITIALIZATION ON DOM LOADED
    // ==============================================================================

    document.addEventListener('DOMContentLoaded', function() {
        initialize();
    });

    // ==============================================================================
    // PUBLIC API
    // ==============================================================================

    return {
        // Core functions
        initialize,
        navigateToPage,
        loadAllData,
        updateAllDisplays,
        makeApiCall,
        
        // Modal functions
        showModal,
        closeModal,
        
        // Notifications
        showNotification,
        
        // Debug functions
        debugDataState,
        refreshAllData,
        
        // Data access
        get data() { return data; },
        set data(newData) { data = newData; },
        get currentPage() { return currentPage; },
        set currentPage(page) { currentPage = page; }
    };

})();

// Console logging for debugging
console.log('🎯 Admin Core Functions Available:');
console.log('├── Navigation: adminCore.navigateToPage(page)');
console.log('├── Data Loading: adminCore.loadAllData()');
console.log('├── API Calls: adminCore.makeApiCall(url, options)');
console.log('├── Modals: adminCore.showModal(), adminCore.closeModal()');
console.log('├── Notifications: adminCore.showNotification(message, type)');
console.log('└── Debug: adminCore.debugDataState(), adminCore.refreshAllData()');