/**
 * PAHANA EDU - ADMIN DASHBOARD CASHIERS MODULE
 * Cashier management functionality - loading, displaying, adding, editing, deleting
 */

// Create adminCashiers namespace
window.adminCashiers = (function() {
    'use strict';

    // ==============================================================================
    // CASHIER LOADING
    // ==============================================================================

    function loadCashiers() {
        console.log('👔 Loading cashiers...');
        
        return window.adminCore.makeApiCall('admin?action=getCashiers')
            .then(response => {
                console.log('👔 Cashiers response:', response);
                
                // Handle different response formats
                let cashiers = [];
                if (Array.isArray(response)) {
                    cashiers = response;
                } else if (response.success && Array.isArray(response.data)) {
                    cashiers = response.data;
                } else if (response.data && Array.isArray(response.data)) {
                    cashiers = response.data;
                }
                
                window.adminCore.data.cashiers = cashiers;
                console.log(`✅ Loaded ${cashiers.length} cashiers`);
                
                if (window.adminCore.currentPage === 'cashiers') {
                    displayCashiers();
                }
                
                return cashiers;
            })
            .catch(error => {
                console.error('❌ Failed to load cashiers:', error);
                window.adminCore.data.cashiers = [];
                if (window.adminCore.currentPage === 'cashiers') {
                    displayCashiers();
                }
                return [];
            });
    }

    // ==============================================================================
    // CASHIER DISPLAY
    // ==============================================================================

    function displayCashiers() {
        console.log('🎨 Displaying cashiers...');
        
        const tableBody = document.querySelector('#cashiersTable tbody');
        if (!tableBody) {
            console.error('❌ Cashiers table body not found');
            return;
        }
        
        tableBody.innerHTML = '';
        
        if (window.adminCore.data.cashiers.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6" style="text-align: center; padding: 20px; color: #64748b;">
                    <i class="fas fa-user-tie" style="font-size: 2em; margin-bottom: 10px; display: block;"></i>
                    No cashiers found. <a href="#" onclick="window.adminCashiers.showAddCashierModal()" style="color: #2563eb;">Add the first cashier</a>
                </td>
            `;
            tableBody.appendChild(row);
        } else {
            window.adminCore.data.cashiers.forEach((cashier, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${cashier.id}</td>
                    <td>${cashier.firstName} ${cashier.lastName}</td>
                    <td>${cashier.email}</td>
                    <td>${cashier.phone || '-'}</td>
                    <td>
                        <span class="badge ${cashier.status === 'active' ? 'active' : 'inactive'}">
                            ${cashier.status || 'active'}
                        </span>
                    </td>
                    <td>
                        <button class="btn-sm btn-info" onclick="window.adminCashiers.editCashier(${cashier.id})" title="Edit Cashier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-sm btn-danger" onclick="window.adminCashiers.deleteCashier(${cashier.id})" title="Delete Cashier">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
        
        console.log(`✅ Displayed ${window.adminCore.data.cashiers.length} cashiers`);
    }

    // ==============================================================================
    // CASHIER MODAL FUNCTIONS
    // ==============================================================================

    function showAddCashierModal() {
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Add New Cashier';
        modalBody.innerHTML = `
            <form id="cashierForm">
                <div class="form-group">
                    <label>First Name</label>
                    <input type="text" id="cashierFirstName" required>
                </div>
                <div class="form-group">
                    <label>Last Name</label>
                    <input type="text" id="cashierLastName" required>
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="cashierEmail" required>
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" id="cashierPhone">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="cashierStatus">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="cashierPassword" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="window.adminCore.closeModal()">Cancel</button>
                    <button type="submit" class="btn-primary">Add Cashier</button>
                </div>
            </form>
        `;
        
        window.adminCore.showModal();
        
        // Handle form submission
        document.getElementById('cashierForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new URLSearchParams();
            formData.append('action', 'addCashier');
            formData.append('firstName', document.getElementById('cashierFirstName').value);
            formData.append('lastName', document.getElementById('cashierLastName').value);
            formData.append('email', document.getElementById('cashierEmail').value);
            formData.append('phone', document.getElementById('cashierPhone').value);
            formData.append('status', document.getElementById('cashierStatus').value);
            formData.append('password', document.getElementById('cashierPassword').value);
            
            window.adminCore.makeApiCall('admin', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.success) {
                    window.adminCore.showNotification(response.message, 'success');
                    window.adminCore.closeModal();
                    loadCashiers();
                    if (window.adminStats) {
                        window.adminStats.loadStats();
                    }
                } else {
                    window.adminCore.showNotification(response.message, 'error');
                }
            })
            .catch(error => {
                window.adminCore.showNotification('Failed to add cashier', 'error');
            });
        });
    }

    function editCashier(id) {
        const cashier = window.adminCore.data.cashiers.find(c => c.id === id);
        if (!cashier) {
            window.adminCore.showNotification('Cashier not found', 'error');
            return;
        }
        
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Edit Cashier';
        modalBody.innerHTML = `
            <form id="cashierForm">
                <div class="form-group">
                    <label>First Name</label>
                    <input type="text" id="cashierFirstName" value="${cashier.firstName}" required>
                </div>
                <div class="form-group">
                    <label>Last Name</label>
                    <input type="text" id="cashierLastName" value="${cashier.lastName}" required>
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="cashierEmail" value="${cashier.email}" required>
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" id="cashierPhone" value="${cashier.phone || ''}">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="cashierStatus">
                        <option value="active" ${cashier.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${cashier.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="window.adminCore.closeModal()">Cancel</button>
                    <button type="submit" class="btn-primary">Update Cashier</button>
                </div>
            </form>
        `;
        
        window.adminCore.showModal();
        
        // Handle form submission
        document.getElementById('cashierForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new URLSearchParams();
            formData.append('action', 'updateUser');
            formData.append('id', id);
            formData.append('firstName', document.getElementById('cashierFirstName').value);
            formData.append('lastName', document.getElementById('cashierLastName').value);
            formData.append('email', document.getElementById('cashierEmail').value);
            formData.append('phone', document.getElementById('cashierPhone').value);
            formData.append('status', document.getElementById('cashierStatus').value);
            
            window.adminCore.makeApiCall('admin', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.success) {
                    window.adminCore.showNotification(response.message, 'success');
                    window.adminCore.closeModal();
                    loadCashiers();
                } else {
                    window.adminCore.showNotification(response.message, 'error');
                }
            })
            .catch(error => {
                window.adminCore.showNotification('Failed to update cashier', 'error');
            });
        });
    }

    function deleteCashier(id) {
        if (confirm('Are you sure you want to delete this cashier?')) {
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
                    loadCashiers();
                    if (window.adminStats) {
                        window.adminStats.loadStats();
                    }
                } else {
                    window.adminCore.showNotification(response.message, 'error');
                }
            })
            .catch(error => {
                window.adminCore.showNotification('Failed to delete cashier', 'error');
            });
        }
    }

    // ==============================================================================
    // PUBLIC API
    // ==============================================================================

    return {
        loadCashiers,
        displayCashiers,
        showAddCashierModal,
        editCashier,
        deleteCashier
    };

})();

// Console logging for debugging
console.log('👔 Admin Cashiers Module loaded:');
console.log('├── loadCashiers()');
console.log('├── displayCashiers()');
console.log('├── showAddCashierModal()');
console.log('├── editCashier(id)');
console.log('└── deleteCashier(id)');