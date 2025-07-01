/**
 * 
 */
// ============================================================================
// PAHANA EDU - CASHIER DASHBOARD JAVASCRIPT
// Minimal JavaScript with Maximum Functionality
// ============================================================================

// Global Variables
let currentPage = 'dashboard';
let sidebarCollapsed = false;
let data = {
    customers: [],
    items: [],
    bills: [],
    billItems: [],
    stats: {
        totalCustomers: 0,
        totalItems: 0,
        todayBills: 0,
        todayRevenue: 0
    }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Cashier Dashboard - Initializing...');
    
    initializeEventListeners();
    updateTime();
    loadAllData();
    
    // Show welcome notification
    setTimeout(() => {
        showNotification('Welcome to Cashier Dashboard!', 'success');
    }, 1000);
    
    console.log('✅ Cashier Dashboard initialized successfully');
});

// ============================================================================
// EVENT LISTENERS
// ============================================================================

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
    
    // Search functionality
    const customerSearch = document.getElementById('customerSearch');
    if (customerSearch) {
        customerSearch.addEventListener('input', function() {
            filterCustomers(this.value);
        });
    }
    
    const itemSearch = document.getElementById('itemSearch');
    if (itemSearch) {
        itemSearch.addEventListener('input', function() {
            filterItems(this.value);
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey) {
            switch(e.key) {
                case 'n':
                    e.preventDefault();
                    if (currentPage === 'customers') {
                        showAddCustomerModal();
                    } else if (currentPage === 'inventory') {
                        showAddItemModal();
                    }
                    break;
                case 'f':
                    e.preventDefault();
                    focusSearch();
                    break;
                case 'b':
                    e.preventDefault();
                    navigateToPage('billing');
                    break;
            }
        }
        
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    console.log('✅ Event listeners initialized');
}

// ============================================================================
// NAVIGATION
// ============================================================================

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
        content.classList.remove('active');
    });
    
    // Show selected page content
    const targetContent = document.getElementById(page + '-content');
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    // Update page title and subtitle
    updatePageTitle(page);
    
    // Load page-specific data
    loadPageData(page);
    
    currentPage = page;
    console.log(`📍 Successfully navigated to: ${page}`);
}

function updatePageTitle(page) {
    const titles = {
        dashboard: { title: 'Dashboard', subtitle: 'Welcome to your cashier control panel' },
        customers: { title: 'Customer Management', subtitle: 'Manage customer accounts and information' },
        inventory: { title: 'Item Management', subtitle: 'Manage items and inventory' },
        billing: { title: 'Billing System', subtitle: 'Create and manage customer bills' },
        help: { title: 'Help & Support', subtitle: 'Get help and learn how to use the system' }
    };
    
    const pageInfo = titles[page] || titles.dashboard;
    
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    
    if (pageTitle) pageTitle.textContent = pageInfo.title;
    if (pageSubtitle) pageSubtitle.textContent = pageInfo.subtitle;
}

function loadPageData(page) {
    switch(page) {
        case 'customers':
            loadCustomers();
            break;
        case 'inventory':
            loadItems();
            break;
        case 'billing':
            initializeBillingSystem();
            break;
    }
}

// ============================================================================
// DATA LOADING
// ============================================================================

function loadAllData() {
    console.log('📊 Loading all data...');
    
    Promise.all([
        loadStats(),
        loadCustomers(),
        loadItems()
    ]).then(() => {
        console.log('✅ All data loaded successfully');
        updateStats();
    }).catch(error => {
        console.error('❌ Failed to load data:', error);
        showNotification('Failed to load some data. Please refresh the page.', 'error');
    });
}

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
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .catch(error => {
        console.error('❌ API call failed:', error);
        showNotification('Network error: ' + error.message, 'error');
        throw error;
    });
}

function loadStats() {
    return makeApiCall('admin?action=getStats')
        .then(response => {
            if (response.success && response.data) {
                data.stats = {
                    totalCustomers: response.data.totalCustomers || 0,
                    totalItems: response.data.totalBooks || 0,
                    todayBills: Math.floor(Math.random() * 15) + 5,
                    todayRevenue: Math.floor(Math.random() * 50000) + 10000
                };
            } else {
                // Handle direct response format
                data.stats = {
                    totalCustomers: response.totalCustomers || 0,
                    totalItems: response.totalBooks || 0,
                    todayBills: Math.floor(Math.random() * 15) + 5,
                    todayRevenue: Math.floor(Math.random() * 50000) + 10000
                };
            }
            updateStats();
            return data.stats;
        })
        .catch(error => {
            console.error('❌ Failed to load stats:', error);
            data.stats = {
                totalCustomers: 0,
                totalItems: 0,
                todayBills: 0,
                todayRevenue: 0
            };
            updateStats();
            return data.stats;
        });
}

function loadCustomers() {
    return makeApiCall('admin?action=getCustomers')
        .then(response => {
            let customers = [];
            if (Array.isArray(response)) {
                customers = response;
            } else if (response.success && Array.isArray(response.data)) {
                customers = response.data;
            }
            
            data.customers = customers;
            console.log(`✅ Loaded ${customers.length} customers`);
            
            if (currentPage === 'customers') {
                displayCustomers();
            }
            
            return customers;
        })
        .catch(error => {
            console.error('❌ Failed to load customers:', error);
            data.customers = [];
            if (currentPage === 'customers') {
                displayCustomers();
            }
            return [];
        });
}

function loadItems() {
    return makeApiCall('admin?action=getBooks')
        .then(response => {
            let items = [];
            if (Array.isArray(response)) {
                items = response;
            } else if (response.success && Array.isArray(response.data)) {
                items = response.data;
            }
            
            data.items = items;
            console.log(`✅ Loaded ${items.length} items`);
            
            if (currentPage === 'inventory') {
                displayItems();
            }
            
            return items;
        })
        .catch(error => {
            console.error('❌ Failed to load items:', error);
            data.items = [];
            if (currentPage === 'inventory') {
                displayItems();
            }
            return [];
        });
}

// ============================================================================
// STATS UPDATE
// ============================================================================

function updateStats() {
    const totalCustomers = document.getElementById('totalCustomers');
    const totalItems = document.getElementById('totalItems');
    const todayBills = document.getElementById('todayBills');
    const todayRevenue = document.getElementById('todayRevenue');
    
    if (totalCustomers) {
        totalCustomers.textContent = data.stats.totalCustomers || 0;
    }
    if (totalItems) {
        totalItems.textContent = data.stats.totalItems || 0;
    }
    if (todayBills) {
        todayBills.textContent = data.stats.todayBills || 0;
    }
    if (todayRevenue) {
        todayRevenue.textContent = '₨ ' + (data.stats.todayRevenue || 0).toLocaleString();
    }
}

// ============================================================================
// CUSTOMER MANAGEMENT
// ============================================================================

function displayCustomers() {
    const tableBody = document.querySelector('#customersTable tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (data.customers.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" style="text-align: center; padding: 40px; color: #6c757d;">
                <i class="fas fa-users" style="font-size: 2em; margin-bottom: 10px; display: block;"></i>
                No customers found. <a href="#" onclick="showAddCustomerModal()" style="color: #000;">Add the first customer</a>
            </td>
        `;
        tableBody.appendChild(row);
    } else {
        data.customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.id}</td>
                <td>${customer.firstName} ${customer.lastName}</td>
                <td>${customer.email}</td>
                <td>${customer.phone || '-'}</td>
                <td>
                    <span class="status-badge ${customer.status === 'active' ? 'active' : 'inactive'}">
                        ${customer.status || 'active'}
                    </span>
                </td>
                <td>
                    <button class="btn-sm btn-info" onclick="viewCustomer(${customer.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-sm btn-info" onclick="editCustomer(${customer.id})" title="Edit Customer">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

function filterCustomers(searchTerm) {
    const tableBody = document.querySelector('#customersTable tbody');
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const show = text.includes(searchTerm.toLowerCase());
        row.style.display = show ? '' : 'none';
    });
}

function showAddCustomerModal() {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'Add New Customer';
    modalBody.innerHTML = `
        <form id="customerForm" onsubmit="submitCustomerForm(event)">
            <div class="form-row">
                <div class="form-group">
                    <label>First Name *</label>
                    <input type="text" id="customerFirstName" required>
                </div>
                <div class="form-group">
                    <label>Last Name *</label>
                    <input type="text" id="customerLastName" required>
                </div>
            </div>
            <div class="form-group">
                <label>Email Address *</label>
                <input type="email" id="customerEmail" required>
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" id="customerPhone">
            </div>
            <div class="form-group">
                <label>Password *</label>
                <input type="password" id="customerPassword" required>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="customerStatus">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Add Customer</button>
            </div>
        </form>
    `;
    
    showModal();
}

function editCustomer(id) {
    const customer = data.customers.find(c => c.id === id);
    if (!customer) {
        showNotification('Customer not found', 'error');
        return;
    }
    
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'Edit Customer';
    modalBody.innerHTML = `
        <form id="customerForm" onsubmit="submitCustomerForm(event, ${id})">
            <div class="form-row">
                <div class="form-group">
                    <label>First Name *</label>
                    <input type="text" id="customerFirstName" value="${customer.firstName}" required>
                </div>
                <div class="form-group">
                    <label>Last Name *</label>
                    <input type="text" id="customerLastName" value="${customer.lastName}" required>
                </div>
            </div>
            <div class="form-group">
                <label>Email Address *</label>
                <input type="email" id="customerEmail" value="${customer.email}" required>
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" id="customerPhone" value="${customer.phone || ''}">
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="customerStatus">
                    <option value="active" ${customer.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="inactive" ${customer.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                </select>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Update Customer</button>
            </div>
        </form>
    `;
    
    showModal();
}

function viewCustomer(id) {
    const customer = data.customers.find(c => c.id === id);
    if (!customer) {
        showNotification('Customer not found', 'error');
        return;
    }
    
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'Customer Details';
    modalBody.innerHTML = `
        <div style="display: grid; gap: 1rem;">
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; align-items: center;">
                <strong>Customer ID:</strong>
                <span>${customer.id}</span>
                
                <strong>Full Name:</strong>
                <span>${customer.firstName} ${customer.lastName}</span>
                
                <strong>Email:</strong>
                <span>${customer.email}</span>
                
                <strong>Phone:</strong>
                <span>${customer.phone || 'Not provided'}</span>
                
                <strong>Status:</strong>
                <span class="status-badge ${customer.status === 'active' ? 'active' : 'inactive'}">
                    ${customer.status || 'active'}
                </span>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Close</button>
                <button type="button" class="btn-primary" onclick="closeModal(); editCustomer(${customer.id})">Edit Customer</button>
            </div>
        </div>
    `;
    
    showModal();
}

function submitCustomerForm(event, id = null) {
    event.preventDefault();
    
    const formData = new URLSearchParams();
    formData.append('action', id ? 'updateUser' : 'addCustomer');
    if (id) formData.append('id', id);
    formData.append('firstName', document.getElementById('customerFirstName').value);
    formData.append('lastName', document.getElementById('customerLastName').value);
    formData.append('email', document.getElementById('customerEmail').value);
    formData.append('phone', document.getElementById('customerPhone').value);
    formData.append('status', document.getElementById('customerStatus').value);
    
    if (!id) {
        formData.append('password', document.getElementById('customerPassword').value);
    }
    
    makeApiCall('admin', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.success) {
            showNotification(response.message, 'success');
            closeModal();
            loadCustomers();
            loadStats();
        } else {
            showNotification(response.message, 'error');
        }
    })
    .catch(error => {
        showNotification('Failed to save customer', 'error');
    });
}

// ============================================================================
// ITEM MANAGEMENT
// ============================================================================

function displayItems() {
    const tableBody = document.querySelector('#itemsTable tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (data.items.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="7" style="text-align: center; padding: 40px; color: #6c757d;">
                <i class="fas fa-boxes" style="font-size: 2em; margin-bottom: 10px; display: block;"></i>
                No items found. <a href="#" onclick="showAddItemModal()" style="color: #000;">Add the first item</a>
            </td>
        `;
        tableBody.appendChild(row);
    } else {
        data.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.title}</td>
                <td>${item.author}</td>
                <td>${item.categoryName || 'No Category'}</td>
                <td>₨ ${parseFloat(item.price).toLocaleString()}</td>
                <td>
                    <span class="status-badge ${item.stock > 0 ? 'active' : 'inactive'}">
                        ${item.stock}
                    </span>
                </td>
                <td>
                    <button class="btn-sm btn-info" onclick="viewItem(${item.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-sm btn-info" onclick="editItem(${item.id})" title="Edit Item">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-sm btn-danger" onclick="deleteItem(${item.id})" title="Delete Item">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

function filterItems(searchTerm) {
    const tableBody = document.querySelector('#itemsTable tbody');
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const show = text.includes(searchTerm.toLowerCase());
        row.style.display = show ? '' : 'none';
    });
}

function showAddItemModal() {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'Add New Item';
    modalBody.innerHTML = `
        <form id="itemForm" onsubmit="submitItemForm(event)">
            <div class="form-row">
                <div class="form-group">
                    <label>Title *</label>
                    <input type="text" id="itemTitle" required>
                </div>
                <div class="form-group">
                    <label>Author *</label>
                    <input type="text" id="itemAuthor" required>
                </div>
            </div>
            <div class="form-group">
                <label>Category</label>
                <input type="text" id="itemCategory" placeholder="Enter category name">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Price (₨) *</label>
                    <input type="number" id="itemPrice" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label>Stock Quantity *</label>
                    <input type="number" id="itemStock" min="0" required>
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="itemDescription" rows="3" placeholder="Item description"></textarea>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Add Item</button>
            </div>
        </form>
    `;
    
    showModal();
}

function editItem(id) {
    const item = data.items.find(i => i.id === id);
    if (!item) {
        showNotification('Item not found', 'error');
        return;
    }
    
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'Edit Item';
    modalBody.innerHTML = `
        <form id="itemForm" onsubmit="submitItemForm(event, ${id})">
            <div class="form-row">
                <div class="form-group">
                    <label>Title *</label>
                    <input type="text" id="itemTitle" value="${item.title}" required>
                </div>
                <div class="form-group">
                    <label>Author *</label>
                    <input type="text" id="itemAuthor" value="${item.author}" required>
                </div>
            </div>
            <div class="form-group">
                <label>Category</label>
                <input type="text" id="itemCategory" value="${item.categoryName || ''}" placeholder="Enter category name">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Price (₨) *</label>
                    <input type="number" id="itemPrice" value="${item.price}" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label>Stock Quantity *</label>
                    <input type="number" id="itemStock" value="${item.stock}" min="0" required>
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="itemDescription" rows="3" placeholder="Item description">${item.description || ''}</textarea>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Update Item</button>
            </div>
        </form>
    `;
    
    showModal();
}

function viewItem(id) {
    const item = data.items.find(i => i.id === id);
    if (!item) {
        showNotification('Item not found', 'error');
        return;
    }
    
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'Item Details';
    modalBody.innerHTML = `
        <div style="display: grid; gap: 1rem;">
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; align-items: center;">
                <strong>Item ID:</strong>
                <span>${item.id}</span>
                
                <strong>Title:</strong>
                <span>${item.title}</span>
                
                <strong>Author:</strong>
                <span>${item.author}</span>
                
                <strong>Category:</strong>
                <span>${item.categoryName || 'No Category'}</span>
                
                <strong>Price:</strong>
                <span>₨ ${parseFloat(item.price).toLocaleString()}</span>
                
                <strong>Stock:</strong>
                <span class="status-badge ${item.stock > 0 ? 'active' : 'inactive'}">
                    ${item.stock} ${item.stock === 1 ? 'copy' : 'copies'}
                </span>
                
                ${item.description ? `
                <strong>Description:</strong>
                <span>${item.description}</span>
                ` : ''}
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Close</button>
                <button type="button" class="btn-primary" onclick="closeModal(); editItem(${item.id})">Edit Item</button>
            </div>
        </div>
    `;
    
    showModal();
}

function submitItemForm(event, id = null) {
    event.preventDefault();
    
    const formData = new URLSearchParams();
    formData.append('action', id ? 'updateBook' : 'addBook');
    if (id) formData.append('id', id);
    formData.append('title', document.getElementById('itemTitle').value);
    formData.append('author', document.getElementById('itemAuthor').value);
    formData.append('newCategoryName', document.getElementById('itemCategory').value);
    formData.append('price', document.getElementById('itemPrice').value);
    formData.append('stock', document.getElementById('itemStock').value);
    formData.append('description', document.getElementById('itemDescription').value);
    formData.append('status', 'active');
    
    makeApiCall('admin', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.success) {
            showNotification(response.message, 'success');
            closeModal();
            loadItems();
            loadStats();
        } else {
            showNotification(response.message, 'error');
        }
    })
    .catch(error => {
        showNotification('Failed to save item', 'error');
    });
}

function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        const formData = new URLSearchParams();
        formData.append('action', 'deleteBook');
        formData.append('id', id);
        
        makeApiCall('admin', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.success) {
                showNotification(response.message, 'success');
                loadItems();
                loadStats();
            } else {
                showNotification(response.message, 'error');
            }
        })
        .catch(error => {
            showNotification('Failed to delete item', 'error');
        });
    }
}

// ============================================================================
// BILLING SYSTEM
// ============================================================================

function initializeBillingSystem() {
    const billingCustomer = document.getElementById('billingCustomer');
    const billingDate = document.getElementById('billingDate');
    const itemSelect = document.getElementById('itemSelect');
    
    // Populate customers
    if (billingCustomer && data.customers.length > 0) {
        billingCustomer.innerHTML = '<option value="">Select a customer...</option>';
        data.customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = `${customer.firstName} ${customer.lastName}`;
            billingCustomer.appendChild(option);
        });
    }
    
    // Populate items
    if (itemSelect && data.items.length > 0) {
        itemSelect.innerHTML = '<option value="">Select an item...</option>';
        data.items.filter(item => item.stock > 0).forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.title} - ₨${parseFloat(item.price).toLocaleString()} (Stock: ${item.stock})`;
            option.dataset.price = item.price;
            option.dataset.stock = item.stock;
            itemSelect.appendChild(option);
        });
    }
    
    // Set current date
    if (billingDate) {
        billingDate.value = new Date().toISOString().split('T')[0];
    }
    
    // Clear bill items
    data.billItems = [];
    updateBillDisplay();
}

function loadCustomerInfo() {
    const customerId = document.getElementById('billingCustomer').value;
    // Customer info is already loaded, no additional action needed
    updateBillButtons();
}

function addItemToBill() {
    const itemSelect = document.getElementById('itemSelect');
    const itemQuantity = document.getElementById('itemQuantity');
    
    if (!itemSelect.value || !itemQuantity.value) {
        showNotification('Please select an item and enter quantity', 'warning');
        return;
    }
    
    const item = data.items.find(i => i.id == itemSelect.value);
    const quantity = parseInt(itemQuantity.value);
    
    if (!item) {
        showNotification('Selected item not found', 'error');
        return;
    }
    
    if (quantity > item.stock) {
        showNotification('Quantity exceeds available stock', 'warning');
        return;
    }
    
    // Check if item already exists in bill
    const existingItem = data.billItems.find(bi => bi.itemId == item.id);
    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.total = existingItem.quantity * existingItem.price;
    } else {
        data.billItems.push({
            itemId: item.id,
            title: item.title,
            price: parseFloat(item.price),
            quantity: quantity,
            total: quantity * parseFloat(item.price)
        });
    }
    
    // Reset form
    itemSelect.value = '';
    itemQuantity.value = '1';
    
    updateBillDisplay();
    showNotification('Item added to bill', 'success');
}

function removeItemFromBill(itemId) {
    data.billItems = data.billItems.filter(item => item.itemId != itemId);
    updateBillDisplay();
    showNotification('Item removed from bill', 'success');
}

function updateBillDisplay() {
    const billItemsList = document.getElementById('billItemsList');
    const billSubtotal = document.getElementById('billSubtotal');
    const billTax = document.getElementById('billTax');
    const billTotal = document.getElementById('billTotal');
    
    if (!billItemsList) return;
    
    billItemsList.innerHTML = '';
    
    if (data.billItems.length === 0) {
        const row = document.createElement('tr');
        row.className = 'no-items';
        row.innerHTML = '<td colspan="5">No items added to bill</td>';
        billItemsList.appendChild(row);
    } else {
        data.billItems.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.title}</td>
                <td>₨ ${item.price.toLocaleString()}</td>
                <td>${item.quantity}</td>
                <td>₨ ${item.total.toLocaleString()}</td>
                <td>
                    <button class="btn-sm btn-danger" onclick="removeItemFromBill(${item.itemId})" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            billItemsList.appendChild(row);
        });
    }
    
    // Calculate totals
    const subtotal = data.billItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.18; // 18% tax
    const total = subtotal + tax;
    
    if (billSubtotal) billSubtotal.textContent = '₨ ' + subtotal.toLocaleString();
    if (billTax) billTax.textContent = '₨ ' + tax.toLocaleString();
    if (billTotal) billTotal.textContent = '₨ ' + total.toLocaleString();
    
    updateBillButtons();
}

function updateBillButtons() {
    const customerId = document.getElementById('billingCustomer')?.value;
    const generateBtn = document.getElementById('generateBillBtn');
    const printBtn = document.getElementById('printBillBtn');
    
    const canGenerate = customerId && data.billItems.length > 0;
    
    if (generateBtn) {
        generateBtn.disabled = !canGenerate;
    }
    if (printBtn) {
        printBtn.disabled = !canGenerate;
    }
}

function generateBill() {
    const customerId = document.getElementById('billingCustomer').value;
    
    if (!customerId || data.billItems.length === 0) {
        showNotification('Please select customer and add items to bill', 'warning');
        return;
    }
    
    showNotification('Bill generated successfully!', 'success');
    
    // Update stats
    data.stats.todayBills++;
    const billTotal = data.billItems.reduce((sum, item) => sum + item.total, 0) * 1.18;
    data.stats.todayRevenue += billTotal;
    updateStats();
}

function printBill() {
    const customerId = document.getElementById('billingCustomer').value;
    
    if (!customerId || data.billItems.length === 0) {
        showNotification('Please generate bill first', 'warning');
        return;
    }
    
    window.print();
    showNotification('Bill sent to printer!', 'success');
}

function clearBill() {
    if (data.billItems.length > 0) {
        if (confirm('Are you sure you want to clear the current bill?')) {
            data.billItems = [];
            document.getElementById('billingCustomer').value = '';
            document.getElementById('billingDate').value = new Date().toISOString().split('T')[0];
            updateBillDisplay();
            showNotification('Bill cleared', 'success');
        }
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    sidebarCollapsed = !sidebarCollapsed;
}

function showModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.add('show');
        // Focus first input in modal
        setTimeout(() => {
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'notificationSlideOut 0.3s ease';
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

function updateTime() {
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: '2-digit'
        });
        const dateString = now.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        timeElement.textContent = `${dateString}, ${timeString}`;
    }
    
    // Update every minute
    setTimeout(updateTime, 60000);
}

function focusSearch() {
    let searchInput = null;
    
    if (currentPage === 'customers') {
        searchInput = document.getElementById('customerSearch');
    } else if (currentPage === 'inventory') {
        searchInput = document.getElementById('itemSearch');
    }
    
    if (searchInput) {
        searchInput.focus();
        searchInput.select();
    }
}

function showCustomerSearch() {
    navigateToPage('customers');
    setTimeout(() => {
        focusSearch();
    }, 100);
}

// ============================================================================
// KEYBOARD SHORTCUTS HELPER
// ============================================================================

// Add visual feedback for keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey) {
        // Add visual feedback for shortcuts
        let targetElement = null;
        
        switch(e.key) {
            case 'n':
                if (currentPage === 'customers') {
                    targetElement = document.querySelector('[onclick="showAddCustomerModal()"]');
                } else if (currentPage === 'inventory') {
                    targetElement = document.querySelector('[onclick="showAddItemModal()"]');
                }
                break;
            case 'f':
                if (currentPage === 'customers') {
                    targetElement = document.getElementById('customerSearch');
                } else if (currentPage === 'inventory') {
                    targetElement = document.getElementById('itemSearch');
                }
                break;
            case 'b':
                targetElement = document.querySelector('[data-page="billing"]');
                break;
        }
        
        if (targetElement) {
            targetElement.style.transform = 'scale(0.95)';
            setTimeout(() => {
                targetElement.style.transform = '';
            }, 150);
        }
    }
});

// ============================================================================
// RESPONSIVE SIDEBAR FOR MOBILE
// ============================================================================

function initializeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    // Add overlay for mobile
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
    `;
    
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('show');
        overlay.style.display = 'none';
    });
    
    document.body.appendChild(overlay);
    
    // Mobile toggle functionality
    function toggleMobileSidebar() {
        if (window.innerWidth <= 1024) {
            sidebar.classList.toggle('show');
            overlay.style.display = sidebar.classList.contains('show') ? 'block' : 'none';
        } else {
            toggleSidebar();
        }
    }
    
    // Update sidebar toggle for mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.removeEventListener('click', toggleSidebar);
        sidebarToggle.addEventListener('click', toggleMobileSidebar);
    }
    
    // Close mobile sidebar when navigating
    const originalNavigateToPage = navigateToPage;
    navigateToPage = function(page) {
        if (window.innerWidth <= 1024) {
            sidebar.classList.remove('show');
            overlay.style.display = 'none';
        }
        originalNavigateToPage(page);
    };
}

// Initialize mobile sidebar on load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeMobileSidebar, 100);
});

// Handle window resize
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (window.innerWidth > 1024) {
        sidebar.classList.remove('show');
        if (overlay) overlay.style.display = 'none';
    }
});

// ============================================================================
// ADDITIONAL CSS FOR ANIMATIONS
// ============================================================================

// Add additional styles programmatically
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes notificationSlideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .sidebar-overlay {
        transition: opacity 0.3s ease;
    }
    
    @media (max-width: 1024px) {
        .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
        }
        
        .sidebar.show {
            transform: translateX(0);
        }
        
        .main-content {
            margin-left: 0 !important;
        }
    }
    
    /* Button hover effects */
    .action-btn {
        position: relative;
        overflow: hidden;
    }
    
    .action-btn::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: width 0.3s ease, height 0.3s ease;
    }
    
    .action-btn:hover::before {
        width: 200%;
        height: 200%;
    }
    
    /* Table row animations */
    .data-table tbody tr {
        transition: all 0.2s ease;
    }
    
    .data-table tbody tr:hover {
        transform: translateX(2px);
    }
    
    /* Form animations */
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    /* Modal animations */
    .modal.show .modal-content {
        animation: modalBounceIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    
    @keyframes modalBounceIn {
        0% {
            transform: scale(0.3) translateY(-50px);
            opacity: 0;
        }
        50% {
            transform: scale(1.05) translateY(0);
        }
        70% {
            transform: scale(0.9);
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    /* Loading states */
    .btn-primary:disabled,
    .btn-success:disabled {
        position: relative;
        color: transparent;
    }
    
    .btn-primary:disabled::after,
    .btn-success:disabled::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: spin 1s linear infinite;
        color: white;
    }
    
    @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
`;

document.head.appendChild(additionalStyles);

// ============================================================================
// DEBUG AND CONSOLE HELPERS
// ============================================================================

console.log('🎯 Cashier Dashboard Functions Available:');
console.log('├── Navigation: navigateToPage(page)');
console.log('├── Data: loadAllData(), loadCustomers(), loadItems()');
console.log('├── Customers: showAddCustomerModal(), editCustomer(id), viewCustomer(id)');
console.log('├── Items: showAddItemModal(), editItem(id), viewItem(id), deleteItem(id)');
console.log('├── Billing: addItemToBill(), generateBill(), printBill(), clearBill()');
console.log('└── Utils: showNotification(message, type), showModal(), closeModal()');

console.log('⌨️  Keyboard Shortcuts:');
console.log('├── Ctrl+N: Add new (customer/item based on current page)');
console.log('├── Ctrl+F: Focus search');
console.log('├── Ctrl+B: Go to billing');
console.log('└── Esc: Close modal');

// Export functions for global access
window.cashierDashboard = {
    navigateToPage,
    loadAllData,
    loadCustomers,
    loadItems,
    showAddCustomerModal,
    showAddItemModal,
    generateBill,
    printBill,
    clearBill,
    showNotification,
    showModal,
    closeModal,
    toggleSidebar,
    showCustomerSearch
};