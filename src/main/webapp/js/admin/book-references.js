/**
 * PAHANA EDU - BOOK REFERENCES & QR MANAGEMENT
 * Complete solution with QR code integration, sticker printing, and inventory management
 */

// Global variables
let allBooks = [];
let filteredBooks = [];
let categories = [];
let currentPrintBook = null;
let qrCodeCache = new Map();

// ==============================================================================
// INITIALIZATION
// ==============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📚 Book References System initializing...');
    initializeSystem();
});

function initializeSystem() {
    loadBooksData();
    loadCategoriesData();
    setupEventListeners();
    console.log('✅ Book References System initialized');
}

// ==============================================================================
// DATA LOADING
// ==============================================================================

function loadBooksData() {
    console.log('📊 Loading books data...');
    
    fetch('admin?action=getBooks')
        .then(response => response.json())
        .then(data => {
            console.log('📚 Books data received:', data);
            
            // Handle different response formats
            if (Array.isArray(data)) {
                allBooks = data;
            } else if (data.success && Array.isArray(data.data)) {
                allBooks = data.data;
            } else if (data.data && Array.isArray(data.data)) {
                allBooks = data.data;
            } else {
                allBooks = [];
            }
            
            filteredBooks = [...allBooks];
            displayBooks();
            console.log(`✅ Loaded ${allBooks.length} books`);
        })
        .catch(error => {
            console.error('❌ Failed to load books:', error);
            showNotification('Failed to load books data', 'error');
            displayNoBooks('Failed to load books. Please refresh the page.');
        });
}

function loadCategoriesData() {
    fetch('admin?action=getCategories')
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data)) {
                categories = data;
            } else if (data.success && Array.isArray(data.data)) {
                categories = data.data;
            } else if (data.data && Array.isArray(data.data)) {
                categories = data.data;
            }
            
            populateCategoryFilter();
        })
        .catch(error => {
            console.error('❌ Failed to load categories:', error);
        });
}

// ==============================================================================
// DISPLAY FUNCTIONS
// ==============================================================================

function displayBooks() {
    const container = document.getElementById('booksContainer');
    
    if (!container) {
        console.error('booksContainer element not found');
        return;
    }
    
    if (filteredBooks.length === 0) {
        displayNoBooks('No books found matching your search criteria.');
        return;
    }
    
    const grid = document.createElement('div');
    grid.className = 'references-grid';
    
    filteredBooks.forEach(book => {
        const card = createBookCard(book);
        grid.appendChild(card);
    });
    
    container.innerHTML = '';
    container.appendChild(grid);
    
    // Generate QR codes after DOM is updated
    setTimeout(() => {
        filteredBooks.forEach(book => generateQRCode(book));
    }, 100);
}

function displayNoBooks(message) {
    const container = document.getElementById('booksContainer');
    
    if (!container) {
        console.error('booksContainer element not found');
        return;
    }
    
    container.innerHTML = `
        <div class="no-books">
            <i class="fas fa-search"></i>
            <h3>${message}</h3>
            <p>Try adjusting your search criteria or add new books to the inventory.</p>
        </div>
    `;
}

function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-reference-card';
    card.dataset.id = book.id;
    
    // Calculate offer details
    const hasOffer = book.offerPrice && book.offerPrice > 0 && book.offerPrice < book.price;
    const discountPercent = hasOffer ? Math.round(((book.price - book.offerPrice) / book.price) * 100) : 0;
    
    // Determine stock status
    const stockStatus = getStockStatus(book.stock);
    
    // Ensure reference number exists
    const referenceNo = book.referenceNo || generateReferenceNumber(book.id);
    
    card.innerHTML = `
        <div class="book-header">
            <div class="book-info">
                <h3>${escapeHtml(book.title)}</h3>
                <p class="book-author">by ${escapeHtml(book.author)}</p>
            </div>
            <span class="stock-badge ${stockStatus}">
                ${book.stock} in stock
            </span>
        </div>
        
        <div class="reference-details">
            <div class="reference-item">
                <span class="reference-label">Reference No:</span>
                <span class="reference-value">${referenceNo}</span>
            </div>
            <div class="reference-item">
                <span class="reference-label">Book ID:</span>
                <span class="reference-value">BK-${String(book.id).padStart(4, '0')}</span>
            </div>
            <div class="reference-item">
                <span class="reference-label">Category:</span>
                <span class="reference-value">${book.categoryName || 'No Category'}</span>
            </div>
        </div>
        
        <div class="qr-section">
            <div id="qr-${book.id}" class="qr-code"></div>
            <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                QR Code: ${referenceNo}
            </div>
        </div>
        
        <div class="price-section">
            <div class="price-item">
                <div class="price-label">Regular Price</div>
                <div class="price-value regular-price">₨ ${parseFloat(book.price).toLocaleString()}</div>
            </div>
            ${hasOffer ? `
                <div class="price-item">
                    <div class="price-label">Offer Price</div>
                    <div class="price-value offer-price">₨ ${parseFloat(book.offerPrice).toLocaleString()}</div>
                </div>
                <div class="price-item">
                    <span class="discount-badge">${discountPercent}% OFF</span>
                </div>
            ` : ''}
        </div>
        
        <div class="card-actions">
            <button class="btn-sm btn-primary print-btn" data-id="${book.id}">
                <i class="fas fa-print"></i> Print Sticker
            </button>
            <button class="btn-sm btn-info copy-btn" data-ref="${referenceNo}">
                <i class="fas fa-copy"></i> Copy Ref
            </button>
            <button class="btn-sm btn-success download-btn" data-id="${book.id}">
                <i class="fas fa-download"></i> Download QR
            </button>
        </div>
    `;
    
    return card;
}

// ==============================================================================
// QR CODE GENERATION
// ==============================================================================

function generateQRCode(book) {
    const container = document.getElementById(`qr-${book.id}`);
    if (!container) {
        console.warn(`Container element for book ${book.id} not found`);
        return;
    }
    
    // Clear any existing content
    container.innerHTML = '';
    
    const referenceNo = book.referenceNo || generateReferenceNumber(book.id);
    
    // Check if QR code is already cached
    if (qrCodeCache.has(referenceNo)) {
        container.innerHTML = qrCodeCache.get(referenceNo);
        return;
    }
    
    try {
        // Generate QR code using qrcode-generator
        const typeNumber = 0; // auto detect type
        const errorCorrectionLevel = 'M'; // Medium error correction
        const qr = qrcode(typeNumber, errorCorrectionLevel);
        qr.addData(referenceNo);
        qr.make();
        
        // Create QR code as SVG
        const svg = qr.createSvgTag({
            scalable: true,
            margin: 1,
            color: "#000000",
            background: "#ffffff"
        });
        
        // Cache the generated QR code
        qrCodeCache.set(referenceNo, svg);
        container.innerHTML = svg;
        console.log('✅ QR Code generated for:', referenceNo);
    } catch (error) {
        console.error('QR Code generation failed for book', book.id, ':', error);
        container.innerHTML = '<div style="color: red; font-size: 12px;">QR Generation Failed</div>';
    }
}

function generateReferenceNumber(bookId) {
    const prefix = 'BKREF';
    const timestamp = new Date().getFullYear().toString().slice(-2);
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${bookId}-${timestamp}${randomPart}`;
}

// ==============================================================================
// SEARCH AND FILTER
// ==============================================================================

function searchBooks() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter');
    const stockFilter = document.getElementById('stockFilter');
    
    const categoryValue = categoryFilter ? categoryFilter.value : '';
    const stockValue = stockFilter ? stockFilter.value : '';
    
    filteredBooks = allBooks.filter(book => {
        // Text search
        const matchesSearch = !searchTerm || 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            (book.referenceNo && book.referenceNo.toLowerCase().includes(searchTerm));
        
        // Category filter
        const matchesCategory = !categoryValue || 
            book.categoryId == categoryValue;
        
        // Stock filter
        const matchesStock = !stockValue || 
            (stockValue === 'normal' && book.stock > 5) ||
            (stockValue === 'low' && book.stock > 0 && book.stock <= 5) ||
            (stockValue === 'out' && book.stock === 0);
        
        return matchesSearch && matchesCategory && matchesStock;
    });
    
    displayBooks();
}

function filterBooks() {
    searchBooks(); // Reuse the search function for filtering
}

function populateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    // Clear existing options except "All Categories"
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categoryFilter.appendChild(option);
    });
}

// ==============================================================================
// UTILITY FUNCTIONS
// ==============================================================================

function getStockStatus(stock) {
    if (stock <= 0) return 'out-of-stock';
    if (stock <= 5) return 'low-stock';
    return 'normal-stock';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function refreshReferences() {
    console.log('🔄 Refreshing references...');
    showNotification('Refreshing data...', 'info');
    qrCodeCache.clear(); // Clear QR cache
    loadBooksData();
    loadCategoriesData();
}

function copyReference(referenceNo) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(referenceNo).then(() => {
            showNotification(`Reference number "${referenceNo}" copied to clipboard!`, 'success');
        }).catch(() => {
            fallbackCopyTextToClipboard(referenceNo);
        });
    } else {
        fallbackCopyTextToClipboard(referenceNo);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification(`Reference number "${text}" copied to clipboard!`, 'success');
    } catch (err) {
        showNotification('Failed to copy reference number', 'error');
    }
    
    document.body.removeChild(textArea);
}

function downloadQR(bookId) {
    const container = document.getElementById(`qr-${bookId}`);
    if (!container) {
        showNotification('QR code not found', 'error');
        return;
    }
    
    const book = allBooks.find(b => b.id === bookId);
    if (!book) return;
    
    try {
        const referenceNo = book.referenceNo || generateReferenceNumber(book.id);
        const svgContent = container.innerHTML;
        
        // Create a Blob with the SVG content
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.download = `QR_${referenceNo}.svg`;
        link.href = url;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        showNotification('QR code downloaded successfully!', 'success');
    } catch (error) {
        console.error('Download failed:', error);
        showNotification('Failed to download QR code', 'error');
    }
}

// ==============================================================================
// PRINT MODAL FUNCTIONS
// ==============================================================================

function openPrintModal(bookId) {
    const book = allBooks.find(b => b.id === bookId);
    if (!book) {
        showNotification('Book not found', 'error');
        return;
    }
    
    currentPrintBook = book;
    generateStickerPreview(book);
    
    const printModal = document.getElementById('printModal');
    if (printModal) {
        printModal.classList.add('show');
    }
    
    // Set focus to quantity input
    setTimeout(() => {
        const quantityInput = document.getElementById('stickerQuantity');
        if (quantityInput) {
            quantityInput.focus();
        }
    }, 100);
}

function closePrintModal() {
    const printModal = document.getElementById('printModal');
    if (printModal) {
        printModal.classList.remove('show');
    }
    
    currentPrintBook = null;
    
    // Clear preview
    const preview = document.getElementById('stickerPreview');
    if (preview) {
        preview.innerHTML = '';
    }
}

function generateStickerPreview(book) {
    const preview = document.getElementById('stickerPreview');
    if (!preview) return;
    
    const hasOffer = book.offerPrice && book.offerPrice > 0 && book.offerPrice < book.price;
    const discountPercent = hasOffer ? Math.round(((book.price - book.offerPrice) / book.price) * 100) : 0;
    const referenceNo = book.referenceNo || generateReferenceNumber(book.id);
    
    // Create title with proper length handling
    const displayTitle = book.title.length > 30 ? book.title.substring(0, 30) + '...' : book.title;
    const displayAuthor = book.author.length > 25 ? book.author.substring(0, 25) + '...' : book.author;
    
    // Generate QR code for sticker
    let qrSvg = '';
    try {
        const typeNumber = 0;
        const errorCorrectionLevel = 'M';
        const qr = qrcode(typeNumber, errorCorrectionLevel);
        qr.addData(referenceNo);
        qr.make();
        qrSvg = qr.createSvgTag({
            scalable: true,
            margin: 1,
            color: "#000000",
            background: "#ffffff"
        });
    } catch (error) {
        console.error('Preview QR generation failed:', error);
        qrSvg = '<div style="color: red; font-size: 12px;">QR Generation Failed</div>';
    }
    
    preview.innerHTML = `
        <div style="text-align: center; font-family: Arial, sans-serif; padding: 5px;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; line-height: 1.2; color: #1e293b;">
                ${escapeHtml(displayTitle)}
            </div>
            <div style="font-size: 11px; color: #666; margin-bottom: 8px;">
                by ${escapeHtml(displayAuthor)}
            </div>
            <div style="margin: 8px 0;">
                <div class="preview-qr">
                    ${qrSvg}
                </div>
            </div>
            <div style="font-size: 10px; font-family: 'Courier New', monospace; margin-bottom: 8px; background: #f3f4f6; padding: 4px; border-radius: 4px; color: #374151;">
                ${referenceNo}
            </div>
            <div style="font-size: 12px; font-weight: bold;">
                ${hasOffer ? 
                    `<div style="text-decoration: line-through; color: #999; font-size: 10px;">₨${parseFloat(book.price).toLocaleString()}</div>
                     <div style="color: #dc2626; font-size: 14px; font-weight: bold;">₨${parseFloat(book.offerPrice).toLocaleString()}</div>
                     <div style="background: #dc2626; color: white; padding: 2px 6px; font-size: 8px; border-radius: 3px; margin-top: 4px; display: inline-block;">${discountPercent}% OFF</div>` 
                    : `<div style="color: #1e293b; font-size: 14px; font-weight: bold;">₨${parseFloat(book.price).toLocaleString()}</div>`
                }
            </div>
        </div>
    `;
}

function printStickers() {
    if (!currentPrintBook) {
        showNotification('No book selected for printing', 'error');
        return;
    }
    
    const quantityInput = document.getElementById('stickerQuantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
    
    if (quantity < 1 || quantity > 100) {
        showNotification('Please enter a valid quantity (1-100)', 'warning');
        return;
    }
    
    // Show loading state
    const printBtn = document.querySelector('.modal-actions .btn-success');
    if (printBtn) {
        const originalText = printBtn.innerHTML;
        printBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
        printBtn.disabled = true;
        
        // Generate print window
        setTimeout(() => {
            createPrintWindow(currentPrintBook, quantity);
            
            // Reset button
            printBtn.innerHTML = originalText;
            printBtn.disabled = false;
            
            closePrintModal();
            showNotification(`${quantity} sticker(s) sent to printer!`, 'success');
        }, 500);
    } else {
        createPrintWindow(currentPrintBook, quantity);
        closePrintModal();
    }
}

function createPrintWindow(book, quantity) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        showNotification('Please allow popups for printing', 'warning');
        return;
    }
    
    const hasOffer = book.offerPrice && book.offerPrice > 0 && book.offerPrice < book.price;
    const discountPercent = hasOffer ? Math.round(((book.price - book.offerPrice) / book.price) * 100) : 0;
    const referenceNo = book.referenceNo || generateReferenceNumber(book.id);
    
    // Generate QR code for sticker
    let qrSvg = '';
    try {
        const typeNumber = 0;
        const errorCorrectionLevel = 'M';
        const qr = qrcode(typeNumber, errorCorrectionLevel);
        qr.addData(referenceNo);
        qr.make();
        qrSvg = qr.createSvgTag({
            scalable: true,
            margin: 1,
            color: "#000000",
            background: "#ffffff"
        });
    } catch (error) {
        qrSvg = '<div style="color: red;">QR Error</div>';
    }
    
    // Create title and author with proper length handling
    const displayTitle = book.title.length > 25 ? book.title.substring(0, 25) + '...' : book.title;
    const displayAuthor = book.author.length > 20 ? book.author.substring(0, 20) + '...' : book.author;
    
    // Generate stickers HTML
    let stickersHTML = '';
    for (let i = 0; i < quantity; i++) {
        stickersHTML += `
            <div class="sticker-item">
                <div class="sticker-content">
                    <div class="book-title">${escapeHtml(displayTitle)}</div>
                    <div class="book-author">by ${escapeHtml(displayAuthor)}</div>
                    <div class="qr-container">
                        ${qrSvg}
                    </div>
                    <div class="reference-no">${referenceNo}</div>
                    <div class="price-info">
                        ${hasOffer ? 
                            `<span class="original-price">₨${parseFloat(book.price).toLocaleString()}</span>
                             <span class="offer-price">₨${parseFloat(book.offerPrice).toLocaleString()}</span>
                             <span class="discount">${discountPercent}% OFF</span>` 
                            : `<span class="current-price">₨${parseFloat(book.price).toLocaleString()}</span>`
                        }
                    </div>
                </div>
            </div>
        `;
    }
    
    const printHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Book Stickers - ${escapeHtml(book.title)}</title>
            <style>
                @page {
                    margin: 10mm;
                    size: A4;
                }
                
                * {
                    box-sizing: border-box;
                }
                
                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    background: white;
                    color: black;
                }
                
                .stickers-container {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8mm;
                    padding: 5mm;
                }
                
                .sticker-item {
                    width: 60mm;
                    height: 80mm;
                    border: 2px solid #000;
                    border-radius: 3mm;
                    padding: 3mm;
                    box-sizing: border-box;
                    break-inside: avoid;
                    page-break-inside: avoid;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .sticker-content {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between;
                    text-align: center;
                }
                
                .book-title {
                    font-weight: bold;
                    font-size: 11px;
                    line-height: 1.2;
                    margin-bottom: 2mm;
                    word-wrap: break-word;
                    hyphens: auto;
                    color: #000;
                }
                
                .book-author {
                    font-size: 9px;
                    color: #555;
                    margin-bottom: 3mm;
                    line-height: 1.1;
                }
                
                .qr-container {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 2mm 0;
                }
                
                .qr-container svg {
                    width: 25mm;
                    height: 25mm;
                    border: 1px solid #ccc;
                    background: white;
                }
                
                .reference-no {
                    font-family: 'Courier New', monospace;
                    font-size: 8px;
                    font-weight: bold;
                    margin: 2mm 0;
                    background: #f0f0f0;
                    padding: 1mm 2mm;
                    border-radius: 1mm;
                    color: #000;
                    border: 1px solid #ccc;
                }
                
                .price-info {
                    font-weight: bold;
                    font-size: 10px;
                    line-height: 1.2;
                }
                
                .original-price {
                    text-decoration: line-through;
                    color: #999;
                    font-size: 8px;
                    display: block;
                    margin-bottom: 1px;
                }
                
                .offer-price {
                    color: #d63384;
                    font-size: 12px;
                    display: block;
                    font-weight: bold;
                }
                
                .current-price {
                    color: #000;
                    font-size: 12px;
                    font-weight: bold;
                }
                
                .discount {
                    background: #d63384;
                    color: white;
                    padding: 1px 3px;
                    font-size: 7px;
                    border-radius: 2px;
                    margin-top: 1mm;
                    display: inline-block;
                    font-weight: bold;
                }
                
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                    }
                    
                    .stickers-container {
                        gap: 5mm;
                    }
                    
                    .sticker-item {
                        border: 2px solid #000 !important;
                    }
                    
                    .qr-container svg {
                        border: 1px solid #000 !important;
                    }
                }
            </style>
        </head>
        <body>
            <div class="stickers-container">
                ${stickersHTML}
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => {
                        window.close();
                    }, 1000);
                };
                
                window.addEventListener('afterprint', function() {
                    setTimeout(() => {
                        window.close();
                    }, 500);
                });
            </script>
        </body>
        </html>
    `;
    
    printWindow.document.write(printHTML);
    printWindow.document.close();
}

function printAllStickers() {
    if (filteredBooks.length === 0) {
        showNotification('No books to print', 'warning');
        return;
    }
    
    if (filteredBooks.length > 50) {
        if (!confirm(`This will print stickers for ${filteredBooks.length} books. This may take some time. Continue?`)) {
            return;
        }
    } else if (!confirm(`This will print stickers for ${filteredBooks.length} books. Continue?`)) {
        return;
    }
    
    // Show loading notification
    showNotification(`Preparing ${filteredBooks.length} stickers for printing...`, 'info');
    
    setTimeout(() => {
        createBulkPrintWindow(filteredBooks);
        showNotification(`${filteredBooks.length} stickers sent to printer!`, 'success');
    }, 1000);
}

function createBulkPrintWindow(books) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        showNotification('Please allow popups for printing', 'warning');
        return;
    }
    
    let allStickersHTML = '';
    
    books.forEach((book, index) => {
        const hasOffer = book.offerPrice && book.offerPrice > 0 && book.offerPrice < book.price;
        const discountPercent = hasOffer ? Math.round(((book.price - book.offerPrice) / book.price) * 100) : 0;
        const referenceNo = book.referenceNo || generateReferenceNumber(book.id);
        
        // Generate QR code for sticker
        let qrSvg = '';
        try {
            const typeNumber = 0;
            const errorCorrectionLevel = 'M';
            const qr = qrcode(typeNumber, errorCorrectionLevel);
            qr.addData(referenceNo);
            qr.make();
            qrSvg = qr.createSvgTag({
                scalable: true,
                margin: 1,
                color: "#000000",
                background: "#ffffff"
            });
        } catch (error) {
            qrSvg = '<div style="color: red;">QR Error</div>';
        }
        
        // Create title and author with proper length handling
        const displayTitle = book.title.length > 25 ? book.title.substring(0, 25) + '...' : book.title;
        const displayAuthor = book.author.length > 20 ? book.author.substring(0, 20) + '...' : book.author;
        
        allStickersHTML += `
            <div class="sticker-item">
                <div class="sticker-content">
                    <div class="book-title">${escapeHtml(displayTitle)}</div>
                    <div class="book-author">by ${escapeHtml(displayAuthor)}</div>
                    <div class="qr-container">
                        ${qrSvg}
                    </div>
                    <div class="reference-no">${referenceNo}</div>
                    <div class="price-info">
                        ${hasOffer ? 
                            `<span class="original-price">₨${parseFloat(book.price).toLocaleString()}</span>
                             <span class="offer-price">₨${parseFloat(book.offerPrice).toLocaleString()}</span>
                             <span class="discount">${discountPercent}% OFF</span>` 
                            : `<span class="current-price">₨${parseFloat(book.price).toLocaleString()}</span>`
                        }
                    </div>
                </div>
            </div>
        `;
    });
    
    const bulkPrintHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>All Book Stickers - Pahana Edu</title>
            <style>
                @page {
                    margin: 10mm;
                    size: A4;
                }
                
                * {
                    box-sizing: border-box;
                }
                
                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    background: white;
                    color: black;
                }
                
                .stickers-container {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 6mm;
                    padding: 5mm;
                }
                
                .sticker-item {
                    width: 60mm;
                    height: 80mm;
                    border: 2px solid #000;
                    border-radius: 3mm;
                    padding: 3mm;
                    box-sizing: border-box;
                    break-inside: avoid;
                    page-break-inside: avoid;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .sticker-content {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between;
                    text-align: center;
                }
                
                .book-title {
                    font-weight: bold;
                    font-size: 11px;
                    line-height: 1.2;
                    margin-bottom: 2mm;
                    word-wrap: break-word;
                    hyphens: auto;
                    color: #000;
                }
                
                .book-author {
                    font-size: 9px;
                    color: #555;
                    margin-bottom: 3mm;
                    line-height: 1.1;
                }
                
                .qr-container {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 2mm 0;
                }
                
                .qr-container svg {
                    width: 25mm;
                    height: 25mm;
                    border: 1px solid #ccc;
                    background: white;
                }
                
                .reference-no {
                    font-family: 'Courier New', monospace;
                    font-size: 8px;
                    font-weight: bold;
                    margin: 2mm 0;
                    background: #f0f0f0;
                    padding: 1mm 2mm;
                    border-radius: 1mm;
                    color: #000;
                    border: 1px solid #ccc;
                }
                
                .price-info {
                    font-weight: bold;
                    font-size: 10px;
                    line-height: 1.2;
                }
                
                .original-price {
                    text-decoration: line-through;
                    color: #999;
                    font-size: 8px;
                    display: block;
                    margin-bottom: 1px;
                }
                
                .offer-price {
                    color: #d63384;
                    font-size: 12px;
                    display: block;
                    font-weight: bold;
                }
                
                .current-price {
                    color: #000;
                    font-size: 12px;
                    font-weight: bold;
                }
                
                .discount {
                    background: #d63384;
                    color: white;
                    padding: 1px 3px;
                    font-size: 7px;
                    border-radius: 2px;
                    margin-top: 1mm;
                    display: inline-block;
                    font-weight: bold;
                }
                
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                    }
                    
                    .stickers-container {
                        gap: 5mm;
                    }
                    
                    .sticker-item {
                        border: 2px solid #000 !important;
                    }
                    
                    .qr-container svg {
                        border: 1px solid #000 !important;
                    }
                }
            </style>
        </head>
        <body>
            <div class="stickers-container">
                ${allStickersHTML}
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => {
                        window.close();
                    }, 1000);
                };
            </script>
        </body>
        </html>
    `;
    
    printWindow.document.write(bulkPrintHTML);
    printWindow.document.close();
}

// ==============================================================================
// EVENT LISTENERS
// ==============================================================================

function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchBooks, 300));
    }
    
    // Filter dropdowns
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterBooks);
    }
    
    const stockFilter = document.getElementById('stockFilter');
    if (stockFilter) {
        stockFilter.addEventListener('change', filterBooks);
    }
    
    // Print modal buttons
    const closeModalBtn = document.getElementById('closeModal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closePrintModal);
    }
    
    const confirmPrintBtn = document.getElementById('confirmPrint');
    if (confirmPrintBtn) {
        confirmPrintBtn.addEventListener('click', printStickers);
    }
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshButton');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshReferences);
    }
    
    // Print all stickers button
    const printAllBtn = document.getElementById('printAllButton');
    if (printAllBtn) {
        printAllBtn.addEventListener('click', printAllStickers);
    }
    
    // Use event delegation for dynamic buttons
    document.addEventListener('click', function(e) {
        // Print buttons
        if (e.target.closest('.print-btn')) {
            const bookId = e.target.closest('.print-btn').dataset.id;
            openPrintModal(parseInt(bookId));
        }
        
        // Copy buttons
        if (e.target.closest('.copy-btn')) {
            const referenceNo = e.target.closest('.copy-btn').dataset.ref;
            copyReference(referenceNo);
        }
        
        // Download buttons
        if (e.target.closest('.download-btn')) {
            const bookId = e.target.closest('.download-btn').dataset.id;
            downloadQR(parseInt(bookId));
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + P for print all stickers
    if ((e.ctrlKey || e.metaKey) && e.key === 'p' && !document.getElementById('printModal').classList.contains('show')) {
        e.preventDefault();
        printAllStickers();
    }
    
    // Escape to close modal
    if (e.key === 'Escape' && document.getElementById('printModal').classList.contains('show')) {
        closePrintModal();
    }
    
    // Enter in search to trigger search
    if (e.key === 'Enter' && e.target.id === 'searchInput') {
        searchBooks();
    }
    
    // Enter in quantity input to print
    if (e.key === 'Enter' && e.target.id === 'stickerQuantity') {
        printStickers();
    }
}

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
// NOTIFICATIONS
// ==============================================================================

function showNotification(message, type = 'info') {
    console.log(`🔔 Notification: ${message} (${type})`);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${escapeHtml(message)}</span>
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; padding: 4px; border-radius: 4px;">
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
    
    // Auto remove after delay based on type
    const delay = type === 'error' ? 8000 : type === 'warning' ? 6000 : 5000;
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, delay);
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
// CONSOLE LOGGING AND DEBUG INFO
// ==============================================================================

console.log('📚 Book References System loaded successfully!');