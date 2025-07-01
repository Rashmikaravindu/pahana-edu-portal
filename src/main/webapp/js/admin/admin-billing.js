/**
 * PAHANA EDU - ADMIN DASHBOARD BILLING MODULE
 * Billing system functionality - bill generation, calculation, and management
 */

// Create adminBilling namespace
window.adminBilling = (function() {
    'use strict';

    // Billing state
    let billItems = [];
    let billTotal = 0;

    // ==============================================================================
    // BILLING SYSTEM INITIALIZATION
    // ==============================================================================

    function initializeBillingSystem() {
        const billingCustomer = document.getElementById('billingCustomer');
        const billingDate = document.getElementById('billingDate');
        
        if (billingCustomer && window.adminCore.data.customers.length > 0) {
            billingCustomer.innerHTML = '<option value="">Select Customer</option>';
            window.adminCore.data.customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = `${customer.firstName} ${customer.lastName}`;
                billingCustomer.appendChild(option);
            });
        }
        
        if (billingDate) {
            billingDate.value = new Date().toISOString().split('T')[0];
        }

        // Initialize bill items area
        initializeBillItems();
        
        console.log('💰 Billing system initialized');
    }

    function initializeBillItems() {
        const billItemsContainer = document.getElementById('billItems');
        if (!billItemsContainer) return;

        billItemsContainer.innerHTML = `
            <div class="bill-items-header">
                <h4>Bill Items</h4>
                <button type="button" class="btn-sm btn-primary" onclick="window.adminBilling.addBillItem()">
                    <i class="fas fa-plus"></i> Add Item
                </button>
            </div>
            <div class="bill-items-list" id="billItemsList">
                <!-- Bill items will be added here -->
            </div>
        `;

        // Add initial item
        addBillItem();
    }

    // ==============================================================================
    // BILL ITEMS MANAGEMENT
    // ==============================================================================

    function addBillItem() {
        const billItemsList = document.getElementById('billItemsList');
        if (!billItemsList) return;

        const itemIndex = billItems.length;
        const itemId = `item_${Date.now()}_${itemIndex}`;

        const billItem = {
            id: itemId,
            bookId: '',
            bookTitle: '',
            price: 0,
            quantity: 1,
            total: 0
        };

        billItems.push(billItem);

        const itemElement = document.createElement('div');
        itemElement.className = 'bill-item';
        itemElement.id = itemId;
        itemElement.innerHTML = `
            <div class="bill-item-row">
                <div class="form-group bill-item-book">
                    <label>Book</label>
                    <select onchange="window.adminBilling.updateBillItemPrice('${itemId}', this.value)">
                        <option value="">Select Book</option>
                        ${window.adminCore.data.books.map(book => 
                            `<option value="${book.id}" data-price="${book.offerPrice || book.price}" data-title="${book.title}">
                                ${book.title} - ₨${(book.offerPrice || book.price).toLocaleString()}
                            </option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group bill-item-quantity">
                    <label>Quantity</label>
                    <input type="number" min="1" value="1" onchange="window.adminBilling.updateBillItemTotal('${itemId}')">
                </div>
                <div class="form-group bill-item-price">
                    <label>Unit Price</label>
                    <input type="number" step="0.01" min="0" value="0" readonly>
                </div>
                <div class="form-group bill-item-total">
                    <label>Total</label>
                    <div class="bill-item-total-display">₨ 0.00</div>
                </div>
                <div class="form-group bill-item-actions">
                    <label>&nbsp;</label>
                    <button type="button" class="btn-sm btn-danger" onclick="window.adminBilling.removeBillItem('${itemId}')" title="Remove Item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        billItemsList.appendChild(itemElement);
        updateBillTotal();
    }

    function removeBillItem(itemId) {
        const itemElement = document.getElementById(itemId);
        if (itemElement) {
            itemElement.remove();
        }

        // Remove from billItems array
        billItems = billItems.filter(item => item.id !== itemId);
        updateBillTotal();
    }

    function updateBillItemPrice(itemId, bookId) {
        const book = window.adminCore.data.books.find(b => b.id == bookId);
        const itemElement = document.getElementById(itemId);
        if (!book || !itemElement) return;

        const priceInput = itemElement.querySelector('.bill-item-price input');
        const price = book.offerPrice || book.price;
        
        if (priceInput) {
            priceInput.value = price;
        }

        // Update billItems array
        const billItem = billItems.find(item => item.id === itemId);
        if (billItem) {
            billItem.bookId = bookId;
            billItem.bookTitle = book.title;
            billItem.price = price;
        }

        updateBillItemTotal(itemId);
    }

    function updateBillItemTotal(itemId) {
        const itemElement = document.getElementById(itemId);
        if (!itemElement) return;

        const quantityInput = itemElement.querySelector('.bill-item-quantity input');
        const priceInput = itemElement.querySelector('.bill-item-price input');
        const totalDisplay = itemElement.querySelector('.bill-item-total-display');

        const quantity = parseInt(quantityInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const total = quantity * price;

        if (totalDisplay) {
            totalDisplay.textContent = `₨ ${total.toLocaleString()}`;
        }

        // Update billItems array
        const billItem = billItems.find(item => item.id === itemId);
        if (billItem) {
            billItem.quantity = quantity;
            billItem.total = total;
        }

        updateBillTotal();
    }

    function updateBillTotal() {
        const total = billItems.reduce((sum, item) => sum + (item.total || 0), 0);
        billTotal = total;

        const billTotalElement = document.getElementById('billTotal');
        if (billTotalElement) {
            billTotalElement.textContent = `₨ ${total.toLocaleString()}`;
        }
    }

    // ==============================================================================
    // BILL GENERATION AND CALCULATION
    // ==============================================================================

    function generateBill() {
        const customerId = document.getElementById('billingCustomer').value;
        const date = document.getElementById('billingDate').value;
        
        if (!customerId || !date) {
            window.adminCore.showNotification('Please select customer and date', 'warning');
            return;
        }

        if (billItems.length === 0 || billItems.every(item => !item.bookId)) {
            window.adminCore.showNotification('Please add at least one book to the bill', 'warning');
            return;
        }

        // Validate all items have books selected
        const incompleteItems = billItems.filter(item => !item.bookId || item.quantity <= 0);
        if (incompleteItems.length > 0) {
            window.adminCore.showNotification('Please complete all bill items', 'warning');
            return;
        }

        calculateBill();
    }

    function calculateBill() {
        const customerId = document.getElementById('billingCustomer').value;
        const date = document.getElementById('billingDate').value;

        if (!customerId || !date) {
            window.adminCore.showNotification('Please select customer and date', 'warning');
            return;
        }

        // Recalculate total
        updateBillTotal();

        if (billTotal > 0) {
            window.adminCore.showNotification('Bill calculated successfully!', 'success');
            
            // Update stats
            if (window.adminCore.data.stats) {
                window.adminCore.data.stats.totalRevenue = (window.adminCore.data.stats.totalRevenue || 0) + billTotal;
                window.adminCore.data.stats.totalOrders = (window.adminCore.data.stats.totalOrders || 0) + 1;
                
                if (window.adminStats) {
                    window.adminStats.updateStats();
                }
            }
        } else {
            window.adminCore.showNotification('Bill total is zero. Please add items.', 'warning');
        }
    }

    function printBill() {
        const customerId = document.getElementById('billingCustomer').value;
        const customerName = document.getElementById('billingCustomer').selectedOptions[0]?.textContent;
        const date = document.getElementById('billingDate').value;

        if (!customerId || billTotal <= 0) {
            window.adminCore.showNotification('Please generate a bill first', 'warning');
            return;
        }

        // Create printable bill
        const printContent = generatePrintableBill(customerName, date);
        
        // Open print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();

        window.adminCore.showNotification('Bill sent to printer!', 'success');
        
        // Clear bill after printing
        setTimeout(() => {
            if (confirm('Bill printed successfully. Do you want to clear the current bill?')) {
                clearBill();
            }
        }, 1000);
    }

    function generatePrintableBill(customerName, date) {
        const billItemsHtml = billItems
            .filter(item => item.bookId)
            .map(item => `
                <tr>
                    <td>${item.bookTitle}</td>
                    <td>${item.quantity}</td>
                    <td>₨ ${item.price.toLocaleString()}</td>
                    <td>₨ ${item.total.toLocaleString()}</td>
                </tr>
            `).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bill - Pahana Edu</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .bill-info { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .total { text-align: right; font-weight: bold; font-size: 1.2em; }
                    .footer { margin-top: 30px; text-align: center; font-size: 0.9em; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Pahana Edu</h1>
                    <h2>Bill Invoice</h2>
                </div>
                
                <div class="bill-info">
                    <p><strong>Customer:</strong> ${customerName}</p>
                    <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                    <p><strong>Bill #:</strong> ${Date.now()}</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Book Title</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${billItemsHtml}
                    </tbody>
                </table>
                
                <div class="total">
                    <p>Total Amount: ₨ ${billTotal.toLocaleString()}</p>
                </div>
                
                <div class="footer">
                    <p>Thank you for your business!</p>
                    <p>Pahana Edu - Your Education Partner</p>
                </div>
            </body>
            </html>
        `;
    }

    function clearBill() {
        // Reset bill items
        billItems = [];
        billTotal = 0;

        // Clear form
        const billingCustomer = document.getElementById('billingCustomer');
        const billingDate = document.getElementById('billingDate');
        
        if (billingCustomer) billingCustomer.value = '';
        if (billingDate) billingDate.value = new Date().toISOString().split('T')[0];

        // Reinitialize bill items
        initializeBillItems();
        
        window.adminCore.showNotification('Bill cleared successfully', 'info');
    }

    // ==============================================================================
    // ADVANCED BILLING FEATURES
    // ==============================================================================

    function saveBillAsDraft() {
        const customerId = document.getElementById('billingCustomer').value;
        const date = document.getElementById('billingDate').value;

        if (!customerId) {
            window.adminCore.showNotification('Please select a customer', 'warning');
            return;
        }

        const billData = {
            customerId,
            date,
            items: billItems.filter(item => item.bookId),
            total: billTotal,
            status: 'draft',
            timestamp: new Date().toISOString()
        };

        // Save to localStorage as draft (in a real app, this would go to server)
        const drafts = JSON.parse(localStorage.getItem('billDrafts') || '[]');
        drafts.push(billData);
        localStorage.setItem('billDrafts', JSON.stringify(drafts));

        window.adminCore.showNotification('Bill saved as draft', 'success');
    }

    function loadBillDrafts() {
        const drafts = JSON.parse(localStorage.getItem('billDrafts') || '[]');
        
        if (drafts.length === 0) {
            window.adminCore.showNotification('No drafts found', 'info');
            return;
        }

        // Show drafts in modal
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Bill Drafts';
        modalBody.innerHTML = `
            <div class="drafts-list">
                ${drafts.map((draft, index) => `
                    <div class="draft-item">
                        <div class="draft-info">
                            <strong>Customer ID:</strong> ${draft.customerId}<br>
                            <strong>Date:</strong> ${new Date(draft.date).toLocaleDateString()}<br>
                            <strong>Total:</strong> ₨ ${draft.total.toLocaleString()}<br>
                            <strong>Items:</strong> ${draft.items.length}
                        </div>
                        <div class="draft-actions">
                            <button class="btn-sm btn-primary" onclick="window.adminBilling.loadDraft(${index})">Load</button>
                            <button class="btn-sm btn-danger" onclick="window.adminBilling.deleteDraft(${index})">Delete</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="window.adminCore.closeModal()">Close</button>
            </div>
        `;
        
        window.adminCore.showModal();
    }

    function loadDraft(index) {
        const drafts = JSON.parse(localStorage.getItem('billDrafts') || '[]');
        const draft = drafts[index];
        
        if (!draft) {
            window.adminCore.showNotification('Draft not found', 'error');
            return;
        }

        // Load draft data
        document.getElementById('billingCustomer').value = draft.customerId;
        document.getElementById('billingDate').value = draft.date;
        
        billItems = [...draft.items];
        billTotal = draft.total;

        // Rebuild UI
        initializeBillItems();
        
        // Populate items
        const billItemsList = document.getElementById('billItemsList');
        billItemsList.innerHTML = '';
        
        billItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'bill-item';
            itemElement.id = item.id;
            itemElement.innerHTML = `
                <div class="bill-item-row">
                    <div class="form-group bill-item-book">
                        <label>Book</label>
                        <select onchange="window.adminBilling.updateBillItemPrice('${item.id}', this.value)">
                            <option value="">Select Book</option>
                            ${window.adminCore.data.books.map(book => 
                                `<option value="${book.id}" ${book.id == item.bookId ? 'selected' : ''} data-price="${book.offerPrice || book.price}" data-title="${book.title}">
                                    ${book.title} - ₨${(book.offerPrice || book.price).toLocaleString()}
                                </option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group bill-item-quantity">
                        <label>Quantity</label>
                        <input type="number" min="1" value="${item.quantity}" onchange="window.adminBilling.updateBillItemTotal('${item.id}')">
                    </div>
                    <div class="form-group bill-item-price">
                        <label>Unit Price</label>
                        <input type="number" step="0.01" min="0" value="${item.price}" readonly>
                    </div>
                    <div class="form-group bill-item-total">
                        <label>Total</label>
                        <div class="bill-item-total-display">₨ ${item.total.toLocaleString()}</div>
                    </div>
                    <div class="form-group bill-item-actions">
                        <label>&nbsp;</label>
                        <button type="button" class="btn-sm btn-danger" onclick="window.adminBilling.removeBillItem('${item.id}')" title="Remove Item">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            billItemsList.appendChild(itemElement);
        });

        updateBillTotal();
        window.adminCore.closeModal();
        window.adminCore.showNotification('Draft loaded successfully', 'success');
    }

    function deleteDraft(index) {
        if (confirm('Are you sure you want to delete this draft?')) {
            const drafts = JSON.parse(localStorage.getItem('billDrafts') || '[]');
            drafts.splice(index, 1);
            localStorage.setItem('billDrafts', JSON.stringify(drafts));
            
            // Reload drafts modal
            loadBillDrafts();
            window.adminCore.showNotification('Draft deleted', 'success');
        }
    }

    // ==============================================================================
    // PUBLIC API
    // ==============================================================================

    return {
        initializeBillingSystem,
        addBillItem,
        removeBillItem,
        updateBillItemPrice,
        updateBillItemTotal,
        updateBillTotal,
        generateBill,
        calculateBill,
        printBill,
        clearBill,
        saveBillAsDraft,
        loadBillDrafts,
        loadDraft,
        deleteDraft
    };

})();

// Console logging for debugging
console.log('💰 Admin Billing Module loaded:');
console.log('├── initializeBillingSystem()');
console.log('├── addBillItem()');
console.log('├── removeBillItem(itemId)');
console.log('├── updateBillItemPrice(itemId, bookId)');
console.log('├── updateBillItemTotal(itemId)');
console.log('├── generateBill()');
console.log('├── calculateBill()');
console.log('├── printBill()');
console.log('├── clearBill()');
console.log('├── saveBillAsDraft()');
console.log('├── loadBillDrafts()');
console.log('└── deleteDraft(index)');