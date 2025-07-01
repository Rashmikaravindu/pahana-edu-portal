/**
 * PAHANA EDU - ADMIN DASHBOARD CHARTS MODULE
 * Charts initialization and data visualization management
 */

// Create adminCharts namespace
window.adminCharts = (function() {
    'use strict';

    // Chart instances storage
    let charts = {};

    // ==============================================================================
    // CHARTS INITIALIZATION
    // ==============================================================================

    function initializeCharts() {
        initializeSalesChart();
        initializeCategoryChart();
        console.log('📊 Charts initialized');
    }

    function initializeSalesChart() {
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;
        
        const salesData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label: 'Sales',
                data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        };
        
        charts.salesChart = new Chart(ctx, {
            type: 'line',
            data: salesData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f1f5f9'
                        },
                        ticks: {
                            callback: function(value) {
                                return '₨ ' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 6,
                        hoverRadius: 8
                    }
                }
            }
        });
    }

    function initializeCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;
        
        const categoryData = {
            labels: ['Programming', 'Mathematics', 'Science', 'Literature', 'History'],
            datasets: [{
                data: [30, 25, 20, 15, 10],
                backgroundColor: [
                    '#2563eb',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6'
                ],
                borderWidth: 0
            }]
        };
        
        charts.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: categoryData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
        
        // Load real category data
        loadCategoriesWithBookCount();
    }

    // ==============================================================================
    // CHART UPDATE FUNCTIONS
    // ==============================================================================

    function updateCategoryChart(categories = null) {
        if (!charts.categoryChart) return;
        
        if (categories && categories.length > 0) {
            const colors = [
                '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
            ];
            
            const labels = categories.map(cat => cat.name);
            const data = categories.map(cat => cat.bookCount);
            const backgroundColors = categories.map((cat, index) => colors[index % colors.length]);
            
            charts.categoryChart.data.labels = labels;
            charts.categoryChart.data.datasets[0].data = data;
            charts.categoryChart.data.datasets[0].backgroundColor = backgroundColors;
            charts.categoryChart.update();
        }
    }

    function updateSalesChart(period) {
        if (!charts.salesChart) return;
        
        // Simulate different data based on period
        let newData;
        switch(period) {
            case '7':
                newData = [5000, 7000, 6000, 8000, 9000, 7500, 8500];
                charts.salesChart.data.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                break;
            case '30':
                newData = [12000, 19000, 15000, 25000, 22000, 30000, 28000];
                charts.salesChart.data.labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                newData = newData.slice(0, 4);
                break;
            case '90':
                newData = [45000, 55000, 48000, 62000, 58000, 70000];
                charts.salesChart.data.labels = ['Month 1', 'Month 2', 'Month 3'];
                newData = newData.slice(0, 3);
                break;
            default:
                newData = [12000, 19000, 15000, 25000, 22000, 30000, 28000];
                charts.salesChart.data.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
        }
        
        charts.salesChart.data.datasets[0].data = newData;
        charts.salesChart.update();
    }

    // ==============================================================================
    // CATEGORY DATA LOADING
    // ==============================================================================

    function loadCategoriesWithBookCount() {
        console.log('📂 Loading categories with book count...');
        
        return window.adminCore.makeApiCall('admin?action=getCategoriesWithBookCount')
            .then(response => {
                console.log('📂 Categories with book count response:', response);
                
                // Handle different response formats
                let categories = [];
                if (Array.isArray(response)) {
                    categories = response;
                } else if (response.success && Array.isArray(response.data)) {
                    categories = response.data;
                } else if (response.data && Array.isArray(response.data)) {
                    categories = response.data;
                }
                
                // Update category chart
                updateCategoryChart(categories);
                
                return categories;
            })
            .catch(error => {
                console.error('❌ Failed to load categories with book count:', error);
                return [];
            });
    }

    // ==============================================================================
    // INITIALIZATION ON DOM LOADED
    // ==============================================================================

    document.addEventListener('DOMContentLoaded', function() {
        // Wait a bit to ensure Chart.js is loaded
        setTimeout(() => {
            initializeCharts();
        }, 500);
    });

    // ==============================================================================
    // PUBLIC API
    // ==============================================================================

    return {
        initializeCharts,
        updateCategoryChart,
        updateSalesChart,
        loadCategoriesWithBookCount,
        get charts() { return charts; }
    };

})();

// Console logging for debugging
console.log('📊 Admin Charts Module loaded:');
console.log('├── initializeCharts()');
console.log('├── updateCategoryChart(categories)');
console.log('├── updateSalesChart(period)');
console.log('└── loadCategoriesWithBookCount()');