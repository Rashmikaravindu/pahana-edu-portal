//src/main/java/com/pahanaedu/webapp/js/cashier-scan.js
// Complete Updated Cashier Scanning JavaScript with Real Database Integration

// Global variables
let html5QrCode;
let currentProduct = null;
let billItems = [];
let isScanning = false;
let debugMode = false;

// DOM elements
const startScannerBtn = document.getElementById('startScannerBtn');
const stopScannerBtn = document.getElementById('stopScannerBtn');
const resetBtn = document.getElementById('resetBtn');
const scannerContainer = document.getElementById('scannerContainer');
const scannerOverlay = document.getElementById('scannerOverlay');
const qrReader = document.getElementById('qrReader');
const manualRefInput = document.getElementById('manualRefInput');
const manualSearchBtn = document.getElementById('manualSearchBtn');
const productInfo = document.getElementById('productInfo');
const newBillBtn = document.getElementById('newBillBtn');
const billItemsContainer = document.getElementById('billItems');
const printBillBtn = document.getElementById('printBillBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const subtotalEl = document.getElementById('subtotal');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');

// Initialize scanner
function initScanner() {
    console.log('🚀 Initializing QR Scanner...');
    
    try {
        html5QrCode = new Html5Qrcode("qrReader");
        console.log('✅ QR Scanner initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize QR Scanner:', error);
        showNotification('Failed to initialize QR Scanner. Please refresh the page.', 'error');
        return;
    }
    
    // Event listeners
    startScannerBtn.addEventListener('click', startScanner);
    stopScannerBtn.addEventListener('click', stopScanner);
    resetBtn.addEventListener('click', resetScanner);
    manualSearchBtn.addEventListener('click', searchByReference);
    newBillBtn.addEventListener('click', createNewBill);
    printBillBtn.addEventListener('click', printBill);
    checkoutBtn.addEventListener('click', checkout);
    
    // Enhanced manual input
    manualRefInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchByReference();
        }
    });
    
    // Auto-focus manual input
    manualRefInput.focus();
    
    // Hide product info initially
    productInfo.classList.remove('visible');
    
    // Initialize bill display
    updateBillDisplay();
    
    // Check system status
    checkSystemStatus();
    
    console.log('✅ Scanner initialization complete');
}

// Check system status and debug info
function checkSystemStatus() {
    console.log('🔍 Checking system status...');
    
    fetch('productSearch?action=debug')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('📊 System Status:', data.data);
                const stats = data.data.statistics;
                const refs = data.data.sampleReferences;
                
                console.log(`📚 Books: ${stats.totalBooks} total, ${stats.booksInStock} in stock, ${stats.booksWithReferences} with references`);
                
                if (refs && refs.length > 0) {
                    console.log('📋 Sample reference numbers:', refs.slice(0, 3));
                } else {
                    console.warn('⚠️ No reference numbers found in database');
                    showNotification('Warning: No reference numbers found in database. You may need to generate them.', 'warning');
                }
                
                if (stats.booksWithoutReferences > 0) {
                    console.log(`⚠️ ${stats.booksWithoutReferences} books without reference numbers`);
                }
            }
        })
        .catch(error => {
            console.error('❌ Error checking system status:', error);
        });
}

// Start QR scanner
function startScanner() {
    if (isScanning) {
        console.log('⚠️ Scanner is already running');
        return;
    }
    
    console.log('📸 Starting QR scanner...');
    
    const config = { 
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false
    };
    
    Html5Qrcode.getCameras().then(cameras => {
        console.log('📷 Available cameras:', cameras.length);
        
        if (cameras && cameras.length) {
            const cameraId = cameras[0].id;
            console.log('📷 Using camera:', cameraId);
            
            html5QrCode.start(
                cameraId,
                config,
                onScanSuccess,
                onScanError
            ).then(() => {
                isScanning = true;
                scannerOverlay.classList.add('hidden');
                startScannerBtn.classList.add('hidden');
                stopScannerBtn.classList.remove('hidden');
                showNotification('Scanner started successfully', 'success');
                console.log('✅ Scanner started successfully');
            }).catch(err => {
                console.error('❌ Scanner start error:', err);
                showNotification('Failed to start scanner: ' + err, 'error');
                isScanning = false;
            });
        } else {
            console.error('❌ No cameras found');
            showNotification('No cameras found on your device', 'error');
        }
    }).catch(err => {
        console.error('❌ Camera access error:', err);
        showNotification('Failed to access camera. Please check permissions.', 'error');
    });
}

// Stop scanner
function stopScanner() {
    if (!isScanning) {
        console.log('⚠️ Scanner is not running');
        return;
    }
    
    console.log('⏹️ Stopping QR scanner...');
    
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            isScanning = false;
            scannerOverlay.classList.remove('hidden');
            startScannerBtn.classList.remove('hidden');
            stopScannerBtn.classList.add('hidden');
            showNotification('Scanner stopped', 'info');
            console.log('✅ Scanner stopped successfully');
        }).catch(err => {
            console.error('❌ Scanner stop error:', err);
            showNotification('Failed to stop scanner: ' + err, 'error');
        });
    }
}

// Reset scanner
function resetScanner() {
    console.log('🔄 Resetting scanner...');
    stopScanner();
    currentProduct = null;
    productInfo.classList.remove('visible');
    manualRefInput.value = '';
    manualRefInput.focus();
    showNotification('Scanner reset', 'info');
}

// Handle successful scan
function onScanSuccess(referenceNo) {
    console.log('📱 QR Code scanned:', referenceNo);
    
    // Stop scanner after successful scan
    stopScanner();
    
    // Clear manual input and set scanned value
    manualRefInput.value = referenceNo;
    
    // Provide haptic feedback if available
    if (navigator.vibrate) {
        navigator.vibrate(100);
    }
    
    // Look up product by reference number
    fetchProduct(referenceNo);
}

// Handle scan error (silent - common during scanning)
function onScanError(error) {
    // Silently ignore scan errors as they're common during scanning process
    // Only log in debug mode
    if (debugMode) {
        console.log('Scan error (normal):', error);
    }
}

// Search by manual reference input
function searchByReference() {
    const referenceNo = manualRefInput.value.trim();
    if (!referenceNo) {
        showNotification('Please enter a reference number', 'warning');
        manualRefInput.focus();
        return;
    }
    
    console.log('🔍 Manual search for:', referenceNo);
    fetchProduct(referenceNo);
}

// Fetch product details from server (Real API Integration)
function fetchProduct(referenceNo) {
    console.log('🌐 Fetching product from server:', referenceNo);
    
    // Show loading state
    productInfo.classList.add('visible');
    productInfo.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Searching for product...</p>
            <p style="font-size: 0.9rem; color: #718096;">Reference: ${referenceNo}</p>
        </div>
    `;
    
    // Make API call to productSearch servlet
    const searchUrl = `productSearch?reference=${encodeURIComponent(referenceNo)}`;
    console.log('📡 API URL:', searchUrl);
    
    fetch(searchUrl)
        .then(response => {
            console.log('📥 Response status:', response.status);
            console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
            return response.json();
        })
        .then(data => {
            console.log('📦 API Response:', data);
            
            if (data.success && data.data) {
                currentProduct = data.data;
                displayProductInfo(data.data);
                showNotification('Product found: ' + data.data.title, 'success');
                console.log('✅ Product found successfully');
            } else {
                currentProduct = null;
                productInfo.classList.remove('visible');
                showNotification(data.message || 'Product not found', 'error');
                console.log('❌ Product not found:', data.message);
                
                // Clear manual input on error and focus for next search
                manualRefInput.value = '';
                manualRefInput.focus();
            }
        })
        .catch(error => {
            console.error('❌ Fetch error:', error);
            currentProduct = null;
            productInfo.classList.remove('visible');
            showNotification('Network error. Please check connection and try again.', 'error');
            
            // Clear manual input on error
            manualRefInput.value = '';
            manualRefInput.focus();
        });
}

// Display product information (Enhanced with better formatting)
function displayProductInfo(product) {
    console.log('📄 Displaying product info:', product.title);
    
    // Calculate effective price and discount
    const hasOffer = product.offerPrice && product.offerPrice > 0 && product.offerPrice < product.price;
    const effectivePrice = hasOffer ? product.offerPrice : product.price;
    const discountPercentage = hasOffer ? Math.round(((product.price - product.offerPrice) / product.price) * 100) : 0;
    
    // Determine stock status
    const stockStatus = product.stock <= 0 ? 'out' : (product.stock <= 5 ? 'low' : 'good');
    const stockClass = `stock-${stockStatus}`;
    
    productInfo.innerHTML = `
        <div class="product-header">
            <h3 class="product-title">${product.title}</h3>
            <div class="product-price-section">
                ${hasOffer ? `
                    <div class="original-price">₨ ${parseFloat(product.price).toFixed(2)}</div>
                    <div class="offer-price">₨ ${parseFloat(product.offerPrice).toFixed(2)}</div>
                    <div class="discount-badge">${discountPercentage}% OFF</div>
                ` : `
                    <div class="product-price">₨ ${parseFloat(product.price).toFixed(2)}</div>
                `}
            </div>
        </div>
        
        <div class="product-details">
            <div class="detail-item">
                <div class="detail-label">Reference Number</div>
                <div class="detail-value">${product.referenceNo || 'Not Available'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Author</div>
                <div class="detail-value">${product.author}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Category</div>
                <div class="detail-value">${product.categoryName || 'Uncategorized'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Stock</div>
                <div class="detail-value ${stockClass}">
                    ${product.stock} units
                    ${stockStatus === 'low' ? ' (Low Stock)' : ''}
                    ${stockStatus === 'out' ? ' (Out of Stock)' : ''}
                </div>
            </div>
            ${product.description ? `
                <div class="detail-item full-width">
                    <div class="detail-label">Description</div>
                    <div class="detail-value">${product.description}</div>
                </div>
            ` : ''}
        </div>
        
        <div class="scanner-controls" style="margin-top: 1.5rem;">
            <button id="addToBillBtn" class="btn btn-success" ${product.stock <= 0 ? 'disabled' : ''}>
                <i class="fas fa-cart-plus"></i> 
                ${product.stock <= 0 ? 'Out of Stock' : 'Add to Bill'}
            </button>
            <button id="continueScanning" class="btn btn-secondary">
                <i class="fas fa-qrcode"></i> Continue Scanning
            </button>
        </div>
    `;
    
    // Reattach event listeners
    const addToBillBtn = document.getElementById('addToBillBtn');
    const continueScanningBtn = document.getElementById('continueScanning');
    
    if (addToBillBtn && product.stock > 0) {
        addToBillBtn.addEventListener('click', addToBill);
    }
    
    if (continueScanningBtn) {
        continueScanningBtn.addEventListener('click', () => {
            resetScanner();
            startScanner();
        });
    }
}

// Add product to bill (Enhanced with better validation)
function addToBill() {
    if (!currentProduct) {
        showNotification('No product selected', 'warning');
        return;
    }
    
    if (currentProduct.stock <= 0) {
        showNotification('Product is out of stock', 'error');
        return;
    }
    
    console.log('🛒 Adding to bill:', currentProduct.title);
    
    // Check if product already in bill
    const existingItem = billItems.find(item => item.id === currentProduct.id);
    
    if (existingItem) {
        // Check if we can increase quantity
        if (existingItem.quantity >= currentProduct.stock) {
            showNotification(`Cannot add more. Only ${currentProduct.stock} units available.`, 'warning');
            return;
        }
        // Increase quantity
        existingItem.quantity++;
        console.log('📈 Increased quantity for existing item');
    } else {
        // Add new item with effective price (considering offers)
        const effectivePrice = (currentProduct.offerPrice && currentProduct.offerPrice > 0 && currentProduct.offerPrice < currentProduct.price) 
            ? currentProduct.offerPrice : currentProduct.price;
        
        billItems.push({
            id: currentProduct.id,
            title: currentProduct.title,
            referenceNo: currentProduct.referenceNo,
            price: parseFloat(effectivePrice),
            originalPrice: parseFloat(currentProduct.price),
            offerPrice: currentProduct.offerPrice ? parseFloat(currentProduct.offerPrice) : null,
            quantity: 1,
            maxStock: currentProduct.stock
        });
        console.log('➕ Added new item to bill');
    }
    
    // Update bill display
    updateBillDisplay();
    
    showNotification('Added to bill: ' + currentProduct.title, 'success');
    
    // Show success animation
    showSuccessAnimation();
    
    // Reset for next scan
    resetScanner();
    
    // Auto-start scanner for quick consecutive scans
    setTimeout(() => {
        if (!isScanning) {
            startScanner();
        }
    }, 1500);
}

// Show success animation
function showSuccessAnimation() {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-flash';
    successDiv.innerHTML = '<i class="fas fa-check-circle"></i>';
    
    successDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(72, 187, 120, 0.95);
        color: white;
        padding: 2rem;
        border-radius: 50%;
        font-size: 3rem;
        z-index: 10000;
        animation: successPulse 1s ease-in-out;
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 1000);
}

// Update bill display (Enhanced with better formatting)
function updateBillDisplay() {
    if (billItems.length === 0) {
        billItemsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt" style="font-size: 3rem; color: #cbd5e1; display: block; text-align: center; margin: 2rem 0;"></i>
                <p style="text-align: center; color: #94a3b8; font-weight: 500;">No items added to bill</p>
                <p style="text-align: center; color: #94a3b8; font-size: 0.9em; margin-top: 0.5rem;">
                    Scan a QR code or enter a reference number to start
                </p>
            </div>
        `;
        
        // Update totals
        subtotalEl.textContent = '₨ 0.00';
        taxEl.textContent = '₨ 0.00';
        totalEl.textContent = '₨ 0.00';
        
        // Disable action buttons
        printBillBtn.disabled = true;
        checkoutBtn.disabled = true;
        
        return;
    }
    
    // Enable action buttons
    printBillBtn.disabled = false;
    checkoutBtn.disabled = false;
    
    // Generate bill items
    let itemsHTML = '';
    let subtotal = 0;
    
    billItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const hasOffer = item.offerPrice && item.offerPrice > 0 && item.offerPrice < item.originalPrice;
        
        itemsHTML += `
            <div class="bill-item">
                <div class="item-info">
                    <div class="item-name">${item.title}</div>
                    <div class="item-ref">${item.referenceNo}</div>
                    ${hasOffer ? `<div class="item-offer">Special Offer Applied!</div>` : ''}
                </div>
                <div class="item-quantity">
                    <button class="quantity-btn decrease" data-id="${item.id}" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn increase" data-id="${item.id}" ${item.quantity >= item.maxStock ? 'disabled' : ''}>+</button>
                </div>
                <div class="item-pricing">
                    ${hasOffer ? `
                        <div class="original-price-small">₨ ${item.originalPrice.toFixed(2)}</div>
                    ` : ''}
                    <div class="item-price">₨ ${itemTotal.toFixed(2)}</div>
                </div>
                <button class="remove-item" data-id="${item.id}" title="Remove item">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    billItemsContainer.innerHTML = itemsHTML;
    
    // Add event listeners for quantity buttons and remove buttons
    document.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
        btn.addEventListener('click', () => adjustQuantity(btn.dataset.id, -1));
    });
    
    document.querySelectorAll('.quantity-btn.increase').forEach(btn => {
        btn.addEventListener('click', () => adjustQuantity(btn.dataset.id, 1));
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => removeItem(btn.dataset.id));
    });
    
    // Calculate totals
    const tax = subtotal * 0.10; // 10% tax
    const total = subtotal + tax;
    
    // Update totals with animation
    updateTotalWithAnimation(subtotalEl, subtotal);
    updateTotalWithAnimation(taxEl, tax);
    updateTotalWithAnimation(totalEl, total);
    
    console.log('💰 Bill updated - Items:', billItems.length, 'Total: ₨', total.toFixed(2));
}

// Update total with animation
function updateTotalWithAnimation(element, newValue) {
    element.style.transform = 'scale(1.1)';
    element.style.color = '#667eea';
    
    setTimeout(() => {
        element.textContent = '₨ ' + newValue.toFixed(2);
        element.style.transform = 'scale(1)';
        element.style.color = '';
    }, 150);
}

// Adjust item quantity
function adjustQuantity(productId, change) {
    const item = billItems.find(item => item.id == productId);
    
    if (item) {
        const newQuantity = item.quantity + change;
        
        // Validate quantity limits
        if (newQuantity <= 0) {
            removeItem(productId);
            return;
        }
        
        if (newQuantity > item.maxStock) {
            showNotification(`Cannot add more. Only ${item.maxStock} units available.`, 'warning');
            return;
        }
        
        item.quantity = newQuantity;
        updateBillDisplay();
        
        showNotification(`Updated quantity for ${item.title}`, 'info');
        console.log('📝 Quantity adjusted for:', item.title, 'New qty:', newQuantity);
    }
}

// Remove item from bill
function removeItem(productId) {
    const item = billItems.find(item => item.id == productId);
    
    if (item) {
        if (confirm(`Remove "${item.title}" from the bill?`)) {
            billItems = billItems.filter(i => i.id != productId);
            updateBillDisplay();
            showNotification(`Removed ${item.title} from bill`, 'info');
            console.log('🗑️ Removed item:', item.title);
        }
    }
}

// Create new bill
function createNewBill() {
    if (billItems.length > 0) {
        if (!confirm('Are you sure you want to start a new bill? The current bill will be cleared.')) {
            return;
        }
    }
    
    console.log('📄 Creating new bill');
    billItems = [];
    currentProduct = null;
    updateBillDisplay();
    resetScanner();
    showNotification('New bill created', 'success');
}

// Print bill (Enhanced)
function printBill() {
    if (billItems.length === 0) {
        showNotification('No items in the bill to print', 'warning');
        return;
    }
    
    console.log('🖨️ Printing bill...');
    
    const currentDate = new Date();
    const billId = 'BILL-' + currentDate.getFullYear() + '-' + 
                   String(currentDate.getMonth() + 1).padStart(2, '0') + '-' +
                   String(currentDate.getDate()).padStart(2, '0') + '-' +
                   Math.floor(100000 + Math.random() * 900000);
    
    const cashierName = document.querySelector('.cashier-name h3').textContent;
    
    // Calculate totals
    let subtotal = 0;
    billItems.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    const tax = subtotal * 0.10;
    const total = subtotal + tax;
    
    // Prepare bill content for printing
    let billContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Pahana Edu - Receipt</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.4; }
                .receipt-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .receipt-title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
                .receipt-subtitle { font-size: 16px; color: #666; }
                .receipt-info { margin-bottom: 15px; font-size: 14px; }
                .receipt-info div { margin-bottom: 5px; }
                .receipt-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .receipt-table th, .receipt-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .receipt-table th { background-color: #f2f2f2; font-weight: bold; }
                .receipt-table .text-right { text-align: right; }
                .receipt-table .text-center { text-align: center; }
                .receipt-totals { text-align: right; font-size: 16px; margin-top: 15px; }
                .receipt-totals div { margin-bottom: 5px; }
                .receipt-totals .total { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 5px; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
                .offer-indicator { color: #e74c3c; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="receipt-header">
                <div class="receipt-title">Pahana Edu</div>
                <div class="receipt-subtitle">Educational Materials & Books</div>
            </div>
            
            <div class="receipt-info">
                <div><strong>Date:</strong> ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}</div>
                <div><strong>Cashier:</strong> ${cashierName}</div>
                <div><strong>Bill ID:</strong> ${billId}</div>
            </div>
            
            <table class="receipt-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Reference</th>
                        <th class="text-right">Price</th>
                        <th class="text-center">Qty</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    billItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const hasOffer = item.offerPrice && item.offerPrice > 0 && item.offerPrice < item.originalPrice;
        
        billContent += `
            <tr>
                <td>
                    ${item.title}
                    ${hasOffer ? '<br><span class="offer-indicator">* Special Offer</span>' : ''}
                </td>
                <td>${item.referenceNo}</td>
                <td class="text-right">
                    ${hasOffer ? `<s>₨ ${item.originalPrice.toFixed(2)}</s><br>` : ''}
                    ₨ ${item.price.toFixed(2)}
                </td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">₨ ${itemTotal.toFixed(2)}</td>
            </tr>
        `;
    });
    
    billContent += `
                </tbody>
            </table>
            
            <div class="receipt-totals">
                <div>Subtotal: ₨ ${subtotal.toFixed(2)}</div>
                <div>Tax (10%): ₨ ${tax.toFixed(2)}</div>
                <div class="total">Total: ₨ ${total.toFixed(2)}</div>
            </div>
            
            <div class="footer">
                <p><strong>Thank you for your purchase!</strong></p>
                <p>Pahana Edu - Quality Educational Materials</p>
                <p>For any inquiries, please contact us with your Bill ID</p>
            </div>
        </body>
        </html>
    `;
    
    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(billContent);
    printWindow.document.close();
    
    // Wait for content to load before printing
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
    
    showNotification('Bill sent to printer', 'success');
}

// Checkout process (Enhanced)
function checkout() {
    if (billItems.length === 0) {
        showNotification('No items in the bill to checkout', 'warning');
        return;
    }
    
    console.log('💳 Starting checkout process...');
    
    // Calculate total
    const subtotal = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10;
    const total = subtotal + tax;
    
    // Show payment modal (simple prompt for now - can be enhanced with modal)
    const paymentConfirmation = confirm(
        `Complete checkout for ₨ ${total.toFixed(2)}?\n\n` +
        `Subtotal: ₨ ${subtotal.toFixed(2)}\n` +
        `Tax (10%): ₨ ${tax.toFixed(2)}\n` +
        `Total: ₨ ${total.toFixed(2)}\n\n` +
        `Click OK to process payment or Cancel to return.`
    );
    
    if (!paymentConfirmation) return;
    
    // Payment method selection
    const paymentMethod = prompt(
        'Select payment method (enter number):\n' +
        '1. Cash\n' +
        '2. Credit Card\n' +
        '3. Debit Card\n' +
        '4. Mobile Payment'
    );
    
    if (!paymentMethod) return;
    
    let methodName = '';
    switch(paymentMethod.trim()) {
        case '1': methodName = 'Cash'; break;
        case '2': methodName = 'Credit Card'; break;
        case '3': methodName = 'Debit Card'; break;
        case '4': methodName = 'Mobile Payment'; break;
        default: methodName = 'Cash';
    }
    
    // Simulate payment processing
    showNotification('Processing payment...', 'info');
    
    setTimeout(() => {
        // Success notification
        showNotification(
            `Payment of ₨ ${total.toFixed(2)} processed successfully via ${methodName}!`, 
            'success'
        );
        
        console.log('✅ Payment processed successfully');
        
        // Auto-print receipt after checkout
        setTimeout(() => {
            printBill();
        }, 1000);
        
        // Clear bill after successful checkout
        setTimeout(() => {
            billItems = [];
            updateBillDisplay();
            resetScanner();
            showNotification('Ready for next customer', 'info');
            console.log('🏁 Checkout completed, ready for next customer');
        }, 2000);
    }, 1500);
}

// Show notification (Enhanced with better styling)
function showNotification(message, type) {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = '';
    switch(type) {
        case 'success': icon = 'fas fa-check-circle'; break;
        case 'error': icon = 'fas fa-exclamation-circle'; break;
        case 'warning': icon = 'fas fa-exclamation-triangle'; break;
        case 'info': icon = 'fas fa-info-circle'; break;
        default: icon = 'fas fa-bell';
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="close-btn" title="Close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    const autoRemoveTimer = setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
    
    // Close button
    notification.querySelector('.close-btn').addEventListener('click', () => {
        clearTimeout(autoRemoveTimer);
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
    
    // Add click to dismiss
    notification.addEventListener('click', (e) => {
        if (e.target.classList.contains('notification') || e.target.classList.contains('notification-content')) {
            clearTimeout(autoRemoveTimer);
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    });
    
    console.log(`📢 Notification [${type}]: ${message}`);
}

// Add keyboard shortcuts and enhanced controls
document.addEventListener('keydown', function(e) {
    // ESC to reset scanner
    if (e.key === 'Escape') {
        e.preventDefault();
        resetScanner();
    }
    
    // Enter to search when manual input is focused
    if (e.key === 'Enter' && document.activeElement === manualRefInput) {
        e.preventDefault();
        searchByReference();
    }
    
    // F1 to start scanner
    if (e.key === 'F1') {
        e.preventDefault();
        if (startScannerBtn && !startScannerBtn.classList.contains('hidden')) {
            startScanner();
        }
    }
    
    // F2 to stop scanner
    if (e.key === 'F2') {
        e.preventDefault();
        if (stopScannerBtn && !stopScannerBtn.classList.contains('hidden')) {
            stopScanner();
        }
    }
    
    // Ctrl+N for new bill
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        createNewBill();
    }
    
    // Ctrl+P to print
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        if (billItems.length > 0) {
            printBill();
        }
    }
    
    // F9 for debug mode toggle
    if (e.key === 'F9') {
        e.preventDefault();
        debugMode = !debugMode;
        showNotification(`Debug mode ${debugMode ? 'enabled' : 'disabled'}`, 'info');
        console.log('🐛 Debug mode:', debugMode);
    }
});

// Add focus management and helpful tooltips
document.addEventListener('DOMContentLoaded', function() {
    // Focus manual input for immediate use
    if (manualRefInput) {
        manualRefInput.focus();
    }
    
    // Add helpful tooltips
    if (startScannerBtn) {
        startScannerBtn.title = 'Start QR Scanner (F1)';
    }
    if (stopScannerBtn) {
        stopScannerBtn.title = 'Stop QR Scanner (F2)';
    }
    if (resetBtn) {
        resetBtn.title = 'Reset Scanner (ESC)';
    }
    if (manualRefInput) {
        manualRefInput.title = 'Enter reference number and press Enter';
        manualRefInput.placeholder = 'Enter reference number (e.g., BK202500001)';
    }
    if (newBillBtn) {
        newBillBtn.title = 'Start New Bill (Ctrl+N)';
    }
    if (printBillBtn) {
        printBillBtn.title = 'Print Bill (Ctrl+P)';
    }
    
    console.log('💡 Tooltips and shortcuts configured');
});

// Add CSS animations for success feedback
const style = document.createElement('style');
style.textContent = `
    @keyframes successPulse {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification {
        animation: slideIn 0.4s ease !important;
    }
    
    .success-flash {
        pointer-events: none;
    }
`;
document.head.appendChild(style);

// Enhanced error handling and recovery
window.addEventListener('error', function(e) {
    console.error('❌ Global error:', e.error);
    showNotification('An unexpected error occurred. Please refresh if problems persist.', 'error');
});

// Handle network status
window.addEventListener('online', function() {
    showNotification('Connection restored', 'success');
    console.log('🌐 Network connection restored');
});

window.addEventListener('offline', function() {
    showNotification('No internet connection. Some features may not work.', 'warning');
    console.log('📴 Network connection lost');
});

// Performance monitoring
let performanceData = {
    scanCount: 0,
    searchCount: 0,
    successfulScans: 0,
    startTime: Date.now()
};

// Track scanning performance
function trackScanPerformance(success) {
    performanceData.scanCount++;
    if (success) {
        performanceData.successfulScans++;
    }
    
    if (debugMode) {
        console.log('📊 Scan Performance:', {
            totalScans: performanceData.scanCount,
            successful: performanceData.successfulScans,
            successRate: (performanceData.successfulScans / performanceData.scanCount * 100).toFixed(1) + '%'
        });
    }
}

// Enhanced initialization check
function verifySystemReadiness() {
    const requiredElements = [
        'startScannerBtn', 'stopScannerBtn', 'resetBtn', 'manualRefInput',
        'manualSearchBtn', 'productInfo', 'billItems', 'subtotal', 'tax', 'total'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('❌ Missing required elements:', missingElements);
        showNotification('System initialization error. Please refresh the page.', 'error');
        return false;
    }
    
    // Check for required libraries
    if (typeof Html5Qrcode === 'undefined') {
        console.error('❌ QR Scanner library not loaded');
        showNotification('QR Scanner library failed to load. Please refresh the page.', 'error');
        return false;
    }
    
    console.log('✅ System readiness check passed');
    return true;
}

// Main initialization function
function initializeSystem() {
    console.log('🚀 Starting Pahana Edu Cashier Scanning System...');
    
    if (!verifySystemReadiness()) {
        return;
    }
    
    // Initialize scanner
    initScanner();
    
    // Show welcome message
    setTimeout(() => {
        showNotification('Cashier Scanning System ready! Press F9 for debug mode.', 'info');
    }, 1000);
    
    console.log('✅ System initialization complete');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeSystem);

// Export functions for debugging (if needed)
if (debugMode) {
    window.cashierSystem = {
        fetchProduct,
        checkSystemStatus,
        performanceData,
        billItems,
        resetScanner,
        startScanner,
        stopScanner
    };
}