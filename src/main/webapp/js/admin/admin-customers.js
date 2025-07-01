/**
 * PAHANA EDU - ADMIN DASHBOARD CUSTOMERS MODULE
 * Customer management functionality - loading, displaying, adding, editing, deleting
 */

// Create adminCustomers namespace
window.adminCustomers = (function() {
    'use strict';

    // ==============================================================================
    // CUSTOMER LOADING
    // ==============================================================================

    function loadCustomers() {
        console.log('👥 Loading customers...');
        
        return window.adminCore.makeApiCall('admin?action=getCustomers')
            .then(response => {
                console.log('👥 Customers response:', response);
                
                // Handle different response formats
                let customers = [];
                if (Array.isArray(response)) {
                    customers = response;
                } else if (response.success && Array.isArray(response.data)) {
                    customers = response.data;
                } else if (response.data && Array.isArray(response.data)) {
                    customers = response.data;
                }
                
                window.adminCore.data.customers = customers;
                console.log(`✅ Loaded ${customers.length} customers`);
                
                if (window.adminCore.currentPage === 'customers') {
                    displayCustomers();
                }
                
                return customers;
            })
            .catch(error => {
                console.error('❌ Failed to load customers:', error);
                window.adminCore.data.customers = [];
                if (window.adminCore.currentPage === 'customers') {
                    displayCustomers();
                }
                return [];
            });
    }

    // ==============================================================================
    // CUSTOMER DISPLAY
    // ==============================================================================

    function displayCustomers() {
        console.log('🎨 Displaying customers...');
        
        const tableBody = document.querySelector('#customersTable tbody');
        if (!tableBody) {
            console.error('❌ Customers table body not found');
            return;
        }
        
        tableBody.innerHTML = '';
        
        if (window.adminCore.data.customers.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6" style="text-align: center; padding: 20px; color: #64748b;">
                    <i class="fas fa-users" style="font-size: 2em; margin-bottom: 10px; display: block;"></i>
                    No customers found. <a href="#" onclick="window.adminCustomers.showAddCustomerModal()" style="color: #2563eb;">Add the first customer</a>
                </td>
            `;
            tableBody.appendChild(row);
        } else {
            window.adminCore.data.customers.forEach((customer, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${customer.id}</td>
                    <td>${customer.firstName} ${customer.lastName}</td>
                    <td>${customer.email}</td>
                    <td>${customer.phone || '-'}</td>
                    <td>
                        <span class="badge ${customer.status === 'active' ? 'active' : 'inactive'}">
                            ${customer.status || 'active'}
                        </span>
                    </td>
                    <td>
                        <button class="btn-sm btn-info" onclick="window.adminCustomers.editCustomer(${customer.id})" title="Edit Customer">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-sm btn-danger" onclick="window.adminCustomers.deleteCustomer(${customer.id})" title="Delete Customer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
        
        console.log(`✅ Displayed ${window.adminCore.data.customers.length} customers`);
    }

    // ==============================================================================
    // CUSTOMER MODAL FUNCTIONS
    // ==============================================================================

    function showAddCustomerModal() {
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Add New Customer';
        modalBody.innerHTML = `
            <form id="customerForm">
                <div class="form-group">
                    <label>First Name</label>
                    <input type="text" id="customerFirstName" required>
                </div>
                <div class="form-group">
                    <label>Last Name</label>
                    <input type="text" id="customerLastName" required>
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="customerEmail" required>
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" id="customerPhone">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="customerStatus">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="customerPassword" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="window.adminCore.closeModal()">Cancel</button>
                    <button type="submit" class="btn-primary">Add Customer</button>
                </div>
            </form>
        `;
        
        window.adminCore.showModal();
        
        // Handle form submission
        document.getElementById('customerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new URLSearchParams();
            formData.append('action', 'addCustomer');
            formData.append('firstName', document.getElementById('customerFirstName').value);
            formData.append('lastName', document.getElementById('customerLastName').value);
            formData.append('email', document.getElementById('customerEmail').value);
            formData.append('phone', document.getElementById('customerPhone').value);
            formData.append('status', document.getElementById('customerStatus').value);
            formData.append('password', document.getElementById('customerPassword').value);
            
            window.adminCore.makeApiCall('admin', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.success) {
                    window.adminCore.showNotification(response.message, 'success');
                    window.adminCore.closeModal();
                    loadCustomers();
                    if (window.adminStats) {
                        window.adminStats.loadStats();
                    }
                } else {
                    window.adminCore.showNotification(response.message, 'error');
                }
            })
            .catch(error => {
                window.adminCore.showNotification('Failed to add customer', 'error');
            });
        });
    }

    function editCustomer(id) {
        const customer = window.adminCore.data.customers.find(c => c.id === id);
        if (!customer) {
            window.adminCore.showNotification('Customer not found', 'error');
            return;
        }
        
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Edit Customer';
        modalBody.innerHTML = `
            <form id="customerForm">
                <div class="form-group">
                    <label>First Name</label>
                    <input type="text" id="customerFirstName" value="${customer.firstName}" required>
                </div>
                <div class="form-group">
                    <label>Last Name</label>
                    <input type="text" id="customerLastName" value="${customer.lastName}" required>
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="customerEmail" value="${customer.email}" required>
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" id="customerPhone" value="${customer.phone || ''}">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="customerStatus">
                        <option value="active" ${customer.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${customer.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="window.adminCore.closeModal()">Cancel</button>
                    <button type="submit" class="btn-primary">Update Customer</button>
                </div>
            </form>
        `;
        
        window.adminCore.showModal();
        
        // Handle form submission
        document.getElementById('customerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new URLSearchParams();
            formData.append('action', 'updateUser');
            formData.append('id', id);
            formData.append('firstName', document.getElementById('customerFirstName').value);
            formData.append('lastName', document.getElementById('customerLastName').value);
            formData.append('email', document.getElementById('customerEmail').value);
            formData.append('phone', document.getElementById('customerPhone').value);
            formData.append('status', document.getElementById('customerStatus').value);
            
            window.adminCore.makeApiCall('admin', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.success) {
                    window.adminCore.showNotification(response.message, 'success');
                    window.adminCore.closeModal();
                    loadCustomers();
                } else {
                    window.adminCore.showNotification(response.message, 'error');
                }
            })
            .catch(error => {
                window.adminCore.showNotification('Failed to update customer', 'error');
            });
        });
    }

    function deleteCustomer(id) {
        if (confirm('Are you sure you want to delete this customer?')) {
            const formData = new URLSearchParams();
            formData.append('action', 'deleteUser');
            formData.append('id', id);
            
            window.adminCore.makeApiCall('admin', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.success) {
                    window.adminCore.showNotification(response.message, 'success');
                    loadCustomers();
                    if (window.adminStats) {
                        window.adminStats.loadStats();
                    }
                } else {
                    window.adminCore.showNotification(response.message, 'error');
                }
            })
            .catch(error => {
                window.adminCore.showNotification('Failed to delete customer', 'error');
            });
        }
    }

    // ==============================================================================
    // PUBLIC API
    // ==============================================================================

    return {
        loadCustomers,
        displayCustomers,
        showAddCustomerModal,
        editCustomer,
        deleteCustomer
    };

})();

// Console logging for debugging
console.log('👥 Admin Customers Module loaded:');
console.log('├── loadCustomers()');
console.log('├── displayCustomers()');
console.log('├── showAddCustomerModal()');
console.log('├── editCustomer(id)');
console.log('└── deleteCustomer(id)');