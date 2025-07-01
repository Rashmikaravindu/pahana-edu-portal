/**
 * PAHANA EDU - ADMIN DASHBOARD STATISTICS MODULE
 * Statistics loading, updating, and dashboard data management
 */

// Create adminStats namespace
window.adminStats = (function() {
    'use strict';

    // ==============================================================================
    // LOAD STATISTICS
    // ==============================================================================

    function loadStats() {
        console.log('📊 Loading stats...');
        
        return Promise.all([
            window.adminCore.makeApiCall('admin?action=getStats'),
            window.adminCore.makeApiCall('admin?action=getOutOfStockBooks'),
            window.adminCore.makeApiCall('admin?action=getLowStockBooks')
        ])
        .then(([statsResponse, outOfStockResponse, lowStockResponse]) => {
            console.log('📊 Stats response:', statsResponse);
            console.log('📊 Out of stock response:', outOfStockResponse);
            console.log('📊 Low stock response:', lowStockResponse);
            
            // Handle stats response
            if (statsResponse.totalCustomers !== undefined) {
                window.adminCore.data.stats = {
                    totalCustomers: statsResponse.totalCustomers || 0,
                    totalCashiers: statsResponse.totalCashiers || 0,
                    totalUsers: statsResponse.totalUsers || 0,
                    totalBooks: statsResponse.totalBooks || 0,
                    totalRevenue: 125000,
                    totalOrders: 48
                };
            } else if (statsResponse.success && statsResponse.data) {
                window.adminCore.data.stats = {
                    totalCustomers: statsResponse.data.totalCustomers || 0,
                    totalCashiers: statsResponse.data.totalCashiers || 0,
                    totalUsers: statsResponse.data.totalUsers || 0,
                    totalBooks: statsResponse.data.totalBooks || 0,
                    totalRevenue: 125000,
                    totalOrders: 48
                };
            }
            
            // Handle out of stock books
            let outOfStockBooks = [];
            if (Array.isArray(outOfStockResponse)) {
                outOfStockBooks = outOfStockResponse;
            } else if (outOfStockResponse.success && Array.isArray(outOfStockResponse.data)) {
                outOfStockBooks = outOfStockResponse.data;
            }
            
            // Handle low stock books
            let lowStockBooks = [];
            if (Array.isArray(lowStockResponse)) {
                lowStockBooks = lowStockResponse;
            } else if (lowStockResponse.success && Array.isArray(lowStockResponse.data)) {
                lowStockBooks = lowStockResponse.data;
            }
            
            // Update inventory stats
            window.adminCore.data.stats.outOfStockBooks = outOfStockBooks.length;
            window.adminCore.data.stats.lowStockBooks = lowStockBooks.length;
            
            console.log('✅ All stats loaded:', window.adminCore.data.stats);
            updateStats();
            updateInventoryStats();
            
            return window.adminCore.data.stats;
        })
        .catch(error => {
            console.error('❌ Failed to load stats:', error);
            window.adminCore.data.stats = {
                totalCustomers: 0,
                totalCashiers: 0,
                totalUsers: 0,
                totalBooks: 0,
                totalRevenue: 0,
                totalOrders: 0,
                outOfStockBooks: 0,
                lowStockBooks: 0
            };
            updateStats();
            updateInventoryStats();
            return window.adminCore.data.stats;
        });
    }

    // ==============================================================================
    // UPDATE STATISTICS DISPLAY
    // ==============================================================================

    function updateStats() {
        console.log('📊 Updating stats display...');
        
        const totalCustomers = document.getElementById('totalCustomers');
        const totalBooks = document.getElementById('totalBooks');
        const totalRevenue = document.getElementById('totalRevenue');
        const totalOrders = document.getElementById('totalOrders');
        
        if (totalCustomers) {
            totalCustomers.textContent = window.adminCore.data.stats.totalCustomers || 0;
        }
        if (totalBooks) {
            totalBooks.textContent = window.adminCore.data.stats.totalBooks || 0;
        }
        if (totalRevenue) {
            totalRevenue.textContent = '₨ ' + (window.adminCore.data.stats.totalRevenue || 0).toLocaleString();
        }
        if (totalOrders) {
            totalOrders.textContent = window.adminCore.data.stats.totalOrders || 0;
        }
    }

    function updateInventoryStats() {
        console.log('📊 Updating inventory stats display...');
        
        const inventoryTotalBooks = document.getElementById('inventoryTotalBooks');
        const inventoryOutOfStock = document.getElementById('inventoryOutOfStock');
        const inventoryLowStock = document.getElementById('inventoryLowStock');
        
        if (inventoryTotalBooks) {
            inventoryTotalBooks.textContent = window.adminCore.data.stats.totalBooks || 0;
        }
        
        if (inventoryOutOfStock) {
            inventoryOutOfStock.textContent = window.adminCore.data.stats.outOfStockBooks || 0;
        }
        
        if (inventoryLowStock) {
            inventoryLowStock.textContent = window.adminCore.data.stats.lowStockBooks || 0;
        }
        
        console.log('✅ Inventory stats updated');
    }

    function updateInventoryStatsFromBooks(books) {
        if (!books || books.length === 0) return;
        
        const totalBooks = books.length;
        const outOfStockBooks = books.filter(book => book.stock <= 0 || book.status === 'out_of_stock').length;
        const lowStockBooks = books.filter(book => book.stock > 0 && book.stock <= 5 && book.status === 'active').length;
        
        // Update data.stats
        window.adminCore.data.stats.totalBooks = totalBooks;
        window.adminCore.data.stats.outOfStockBooks = outOfStockBooks;
        window.adminCore.data.stats.lowStockBooks = lowStockBooks;
        
        // Update the display
        updateInventoryStats();
    }

    // ==============================================================================
    // REPORTS FUNCTIONS
    // ==============================================================================

    function viewReports() {
        window.adminCore.navigateToPage('reports');
    }

    // ==============================================================================
    // PUBLIC API
    // ==============================================================================

    return {
        loadStats,
        updateStats,
        updateInventoryStats,
        updateInventoryStatsFromBooks,
        viewReports
    };

})();

// Console logging for debugging
console.log('📊 Admin Stats Module loaded:');
console.log('├── loadStats()');
console.log('├── updateStats()');
console.log('├── updateInventoryStats()');
console.log('├── updateInventoryStatsFromBooks(books)');
console.log('└── viewReports()');