/**
 * PAHANA EDU - ADMIN DASHBOARD INVENTORY MODULE
 * Book and inventory management functionality - enhanced with images and offers
 */

// Create adminInventory namespace
window.adminInventory = (function() {
    'use strict';

    // ==============================================================================
    // BOOK LOADING
    // ==============================================================================

    function loadBooks() {
        console.log('📚 Loading books...');
        
        return window.adminCore.makeApiCall('admin?action=getBooks')
            .then(response => {
                console.log('📚 Books response:', response);
                
                // Handle different response formats
                let books = [];
                if (Array.isArray(response)) {
                    books = response;
                } else if (response.success && Array.isArray(response.data)) {
                    books = response.data;
                } else if (response.data && Array.isArray(response.data)) {
                    books = response.data;
                }
                
                window.adminCore.data.books = books;
                console.log(`✅ Loaded ${books.length} books`);
                
                // Update inventory stats from loaded books data
                if (window.adminStats) {
                    window.adminStats.updateInventoryStatsFromBooks(books);
                }
                
                if (window.adminCore.currentPage === 'inventory') {
                    displayBooks();
                }
                
                return books;
            })
            .catch(error => {
                console.error('❌ Failed to load books:', error);
                window.adminCore.data.books = [];
                if (window.adminCore.currentPage === 'inventory') {
                    displayBooks();
                }
                return [];
            });
    }

    // ==============================================================================
    // CATEGORY LOADING
    // ==============================================================================

    function loadCategories() {
        console.log('📂 Loading categories...');
        
        return window.adminCore.makeApiCall('admin?action=getCategories')
            .then(response => {
                console.log('📂 Categories response:', response);
                
                // Handle different response formats
                let categories = [];
                if (Array.isArray(response)) {
                    categories = response;
                } else if (response.success && Array.isArray(response.data)) {
                    categories = response.data;
                } else if (response.data && Array.isArray(response.data)) {
                    categories = response.data;
                }
                
                window.adminCore.data.categories = categories;
                console.log(`✅ Loaded ${categories.length} categories`);
                
                return categories;
            })
            .catch(error => {
                console.error('❌ Failed to load categories:', error);
                window.adminCore.data.categories = [];
                return [];
            });
    }

    // ==============================================================================
    // BOOK DISPLAY
    // ==============================================================================

    function displayBooks() {
        console.log('🎨 Displaying books...');
        
        const tableBody = document.querySelector('#booksTable tbody');
        if (!tableBody) {
            console.error('❌ Books table body not found');
            return;
        }
        
        tableBody.innerHTML = '';
        
        if (window.adminCore.data.books.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="8" style="text-align: center; padding: 20px; color: #64748b;">
                    <i class="fas fa-book" style="font-size: 2em; margin-bottom: 10px; display: block;"></i>
                    No books found. <a href="#" onclick="window.adminInventory.showAddBookModal()" style="color: #2563eb;">Add the first book</a>
                </td>
            `;
            tableBody.appendChild(row);
        } else {
            window.adminCore.data.books.forEach((book, index) => {
                const row = document.createElement('tr');
                const hasOffer = book.offerPrice && book.offerPrice > 0 && book.offerPrice < book.price;
                const discountPercent = hasOffer ? Math.round(((book.price - book.offerPrice) / book.price) * 100) : 0;
                
                row.innerHTML = `
                    <td>${book.id}</td>
                    <td>
                        <div class="book-title-cell">
                            ${book.images && book.images.length > 0 ? 
                                `<img src="${book.images[0]}" alt="${book.title}" class="book-thumbnail" onerror="this.style.display='none'">` 
                                : '<div class="book-no-image"><i class="fas fa-book"></i></div>'
                            }
                            <span>${book.title}</span>
                        </div>
                    </td>
                    <td>${book.author}</td>
                    <td>${book.categoryName || 'No Category'}</td>
                    <td>
                        <div class="price-cell">
                            ${hasOffer ? 
                                `<span class="original-price">₨ ${parseFloat(book.price).toLocaleString()}</span>
                                 <span class="offer-price">₨ ${parseFloat(book.offerPrice).toLocaleString()}</span>
                                 <span class="discount-badge">${discountPercent}% OFF</span>` 
                                : `<span class="current-price">₨ ${parseFloat(book.price).toLocaleString()}</span>`
                            }
                        </div>
                    </td>
                    <td>
                        <span class="stock-badge ${getStockStatus(book.stock)}">
                            ${book.stock}
                        </span>
                    </td>
                    <td class="status-cell">
                        <span class="book-status-badge ${getBookStatusClass(book.status, book.stock)}">
                            ${getBookStatusText(book.status, book.stock)}
                        </span>
                    </td>
                    <td>
                        <button class="btn-sm btn-info" onclick="window.adminInventory.viewBookDetails(${book.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-sm btn-info" onclick="window.adminInventory.editBook(${book.id})" title="Edit Book">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-sm btn-danger" onclick="window.adminInventory.deleteBook(${book.id})" title="Delete Book">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
        
        console.log(`✅ Displayed ${window.adminCore.data.books.length} books`);
    }

    // ==============================================================================
    // HELPER FUNCTIONS FOR STOCK AND STATUS
    // ==============================================================================

    function getStockStatus(stock) {
        if (stock <= 0) return 'out-of-stock';
        if (stock <= 5) return 'low-stock';
        return 'normal-stock';
    }

    function getBookStatusClass(status, stock) {
        if (stock <= 0) return 'out-of-stock';
        return status === 'active' ? 'active' : 'inactive';
    }

    function getBookStatusText(status, stock) {
        if (stock <= 0) return 'Out of Stock';
        return status === 'active' ? 'Active' : 'Inactive';
    }

    // ==============================================================================
    // VIEW BOOK DETAILS MODAL
    // ==============================================================================

    function viewBookDetails(id) {
        const book = window.adminCore.data.books.find(b => b.id === id);
        if (!book) {
            window.adminCore.showNotification('Book not found', 'error');
            return;
        }
        
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        const hasOffer = book.offerPrice && book.offerPrice > 0 && book.offerPrice < book.price;
        const discountPercent = hasOffer ? Math.round(((book.price - book.offerPrice) / book.price) * 100) : 0;
        
        modalTitle.textContent = 'Book Details';
        modalBody.innerHTML = `
            <div class="book-details-view">
                <div class="book-images-gallery">
                    ${book.images && book.images.length > 0 ? 
                        `<div class="main-image">
                            <img src="${book.images[0]}" alt="${book.title}" id="mainBookImage">
                        </div>
                        ${book.images.length > 1 ? 
                            `<div class="thumbnail-images">
                                ${book.images.map((img, index) => 
                                    `<img src="${img}" alt="Image ${index + 1}" 
                                         onclick="window.adminInventory.changeMainImage('${img}')" 
                                         class="thumbnail ${index === 0 ? 'active' : ''}">`
                                ).join('')}
                            </div>` : ''
                        }` : 
                        `<div class="no-image-placeholder">
                            <i class="fas fa-book"></i>
                            <p>No images available</p>
                        </div>`
                    }
                </div>
                
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p class="book-author">by ${book.author}</p>
                    
                    <div class="book-meta">
                        <div class="meta-item">
                            <label>Category:</label>
                            <span>${book.categoryName || 'No Category'}</span>
                        </div>
                        
                        <div class="meta-item">
                            <label>Price:</label>
                            <div class="price-display">
                                ${hasOffer ? 
                                    `<span class="original-price">Rs ${parseFloat(book.price).toLocaleString()}</span>
                                     <span class="offer-price">Rs ${parseFloat(book.offerPrice).toLocaleString()}</span>
                                     <span class="discount-badge">${discountPercent}% OFF</span>` 
                                    : `<span class="current-price">Rs ${parseFloat(book.price).toLocaleString()}</span>`
                                }
                            </div>
                        </div>
                        
                        <div class="meta-item">
                            <label>Stock:</label>
                            <span class="stock-badge ${getStockStatus(book.stock)}">
                                ${book.stock} ${book.stock === 1 ? 'copy' : 'copies'}
                            </span>
                        </div>
                        
                        <div class="meta-item">
                            <label>Status:</label>
                            <span class="book-status-badge ${getBookStatusClass(book.status, book.stock)}">
                                ${getBookStatusText(book.status, book.stock)}
                            </span>
                        </div>
                    </div>
                    
                    ${book.description ? 
                        `<div class="book-description">
                            <label>Description:</label>
                            <p>${book.description}</p>
                        </div>` : ''
                    }
                    
                    ${book.details ? 
                        `<div class="book-details">
                            <label>Additional Details:</label>
                            <p>${book.details}</p>
                        </div>` : ''
                    }
                    
                    <div class="modal-actions">
                        <button class="btn-primary" onclick="window.adminCore.closeModal(); window.adminInventory.editBook(${book.id})">
                            <i class="fas fa-edit"></i> Edit Book
                        </button>
                        <button class="btn-secondary" onclick="window.adminCore.closeModal()">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        window.adminCore.showModal();
    }

    // Change main image in gallery
    function changeMainImage(imageSrc) {
        const mainImage = document.getElementById('mainBookImage');
        const thumbnails = document.querySelectorAll('.thumbnail');
        
        if (mainImage) {
            mainImage.src = imageSrc;
        }
        
        thumbnails.forEach(thumb => {
            thumb.classList.remove('active');
            if (thumb.src === imageSrc) {
                thumb.classList.add('active');
            }
        });
    }

    // ==============================================================================
    // ADD BOOK MODAL
    // ==============================================================================

    function showAddBookModal() {
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Add New Book';
        modalBody.innerHTML = `
            <form id="bookForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>Title *</label>
                        <input type="text" id="bookTitle" required>
                    </div>
                    <div class="form-group">
                        <label>Author *</label>
                        <input type="text" id="bookAuthor" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Category</label>
                    <select id="bookCategory">
                        <option value="">Select Category</option>
                        ${window.adminCore.data.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Or Add New Category</label>
                    <input type="text" id="newCategoryName" placeholder="Enter new category name">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Regular Price (₨) *</label>
                        <input type="number" id="bookPrice" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label>Offer Price (₨)</label>
                        <input type="number" id="bookOfferPrice" step="0.01" min="0" placeholder="Optional">
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Stock Quantity *</label>
                    <input type="number" id="bookStock" min="0" required>
                </div>
                
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="bookDescription" rows="2" placeholder="Brief description"></textarea>
                </div>
                
                <div class="form-group">
                    <label>Additional Details</label>
                    <textarea id="bookDetails" rows="3" placeholder="Detailed information about the book"></textarea>
                </div>
                
                <div class="form-group">
                    <label>Book Images</label>
                    <input type="file" id="bookImages" multiple accept="image/*" class="file-input">
                    <div class="file-input-help">Select up to 5 images (JPG, PNG)</div>
                    <div id="imagePreview" class="image-preview"></div>
                </div>
                
                <div class="form-group">
                    <label>Status</label>
                    <select id="bookStatus">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="window.adminCore.closeModal()">Cancel</button>
                    <button type="submit" class="btn-primary">Add Book</button>
                </div>
            </form>
        `;
        
        window.adminCore.showModal();
        initializeBookForm();
    }

    // ==============================================================================
    // EDIT BOOK MODAL
    // ==============================================================================

    function editBook(id) {
        const book = window.adminCore.data.books.find(b => b.id === id);
        if (!book) {
            window.adminCore.showNotification('Book not found', 'error');
            return;
        }
        
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Edit Book';
        modalBody.innerHTML = `
            <form id="bookForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>Title *</label>
                        <input type="text" id="bookTitle" value="${book.title}" required>
                    </div>
                    <div class="form-group">
                        <label>Author *</label>
                        <input type="text" id="bookAuthor" value="${book.author}" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Category</label>
                    <select id="bookCategory">
                        <option value="">Select Category</option>
                        ${window.adminCore.data.categories.map(cat => 
                            `<option value="${cat.id}" ${cat.id === book.categoryId ? 'selected' : ''}>${cat.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Or Add New Category</label>
                    <input type="text" id="newCategoryName" placeholder="Enter new category name" value="${book.categoryId ? '' : book.categoryName || ''}">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Regular Price (₨) *</label>
                        <input type="number" id="bookPrice" step="0.01" min="0" value="${book.price}" required>
                    </div>
                    <div class="form-group">
                        <label>Offer Price (₨)</label>
                        <input type="number" id="bookOfferPrice" step="0.01" min="0" value="${book.offerPrice || ''}" placeholder="Optional">
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Stock Quantity *</label>
                    <input type="number" id="bookStock" min="0" value="${book.stock}" required>
                </div>
                
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="bookDescription" rows="2" placeholder="Brief description">${book.description || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label>Additional Details</label>
                    <textarea id="bookDetails" rows="3" placeholder="Detailed information">${book.details || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label>Book Images</label>
                    <input type="file" id="bookImages" multiple accept="image/*" class="file-input">
                    <div class="file-input-help">Select up to 5 images (JPG, PNG)</div>
                    ${book.images && book.images.length > 0 ? 
                        `<div class="current-images">
                            <label>Current Images:</label>
                            <div class="current-images-grid">
                                ${book.images.map((img, index) => 
                                    `<div class="current-image-item">
                                        <img src="${img}" alt="Book image ${index + 1}">
                                        <span>Image ${index + 1}</span>
                                    </div>`
                                ).join('')}
                            </div>
                        </div>` : ''
                    }
                    <div id="imagePreview" class="image-preview"></div>
                </div>
                
                <div class="form-group">
                    <label>Status</label>
                    <select id="bookStatus">
                        <option value="active" ${book.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${book.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="window.adminCore.closeModal()">Cancel</button>
                    <button type="submit" class="btn-primary">Update Book</button>
                </div>
            </form>
        `;
        
        window.adminCore.showModal();
        initializeBookForm(book);
    }

    // ==============================================================================
    // INITIALIZE BOOK FORM
    // ==============================================================================

    function initializeBookForm(book = null) {
        const categorySelect = document.getElementById('bookCategory');
        const newCategoryInput = document.getElementById('newCategoryName');
        const priceInput = document.getElementById('bookPrice');
        const offerPriceInput = document.getElementById('bookOfferPrice');
        const fileInput = document.getElementById('bookImages');
        const imagePreview = document.getElementById('imagePreview');
        
        // Category selection logic
        if (categorySelect) {
            categorySelect.addEventListener('change', function() {
                if (this.value) {
                    newCategoryInput.disabled = true;
                    newCategoryInput.value = '';
                } else {
                    newCategoryInput.disabled = false;
                }
            });
        }
        
        if (newCategoryInput) {
            newCategoryInput.addEventListener('input', function() {
                if (this.value.trim()) {
                    categorySelect.disabled = true;
                    categorySelect.value = '';
                } else {
                    categorySelect.disabled = false;
                }
            });
        }
        
        // Price validation
        if (offerPriceInput) {
            offerPriceInput.addEventListener('input', function() {
                const regularPrice = parseFloat(priceInput.value) || 0;
                const offerPrice = parseFloat(this.value) || 0;
                
                if (offerPrice > 0 && offerPrice >= regularPrice) {
                    this.setCustomValidity('Offer price must be less than regular price');
                } else {
                    this.setCustomValidity('');
                }
            });
        }
        
        // Image preview
        if (fileInput) {
            fileInput.addEventListener('change', function() {
                handleImagePreview(this.files);
            });
        }
        
        // Form submission
        document.getElementById('bookForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData();
            formData.append('action', book ? 'updateBook' : 'addBook');
            if (book) formData.append('id', book.id);
            
            formData.append('title', document.getElementById('bookTitle').value);
            formData.append('author', document.getElementById('bookAuthor').value);
            formData.append('categoryId', document.getElementById('bookCategory').value);
            formData.append('newCategoryName', document.getElementById('newCategoryName').value);
            formData.append('price', document.getElementById('bookPrice').value);
            formData.append('offerPrice', document.getElementById('bookOfferPrice').value);
            formData.append('stock', document.getElementById('bookStock').value);
            formData.append('description', document.getElementById('bookDescription').value);
            formData.append('details', document.getElementById('bookDetails').value);
            formData.append('status', document.getElementById('bookStatus').value);
            
            // Add images
            const files = document.getElementById('bookImages').files;
            for (let i = 0; i < files.length && i < 5; i++) {
                formData.append('bookImages', files[i]);
            }
            
            submitBookForm(formData);
        });
    }

    // ==============================================================================
    // HANDLE IMAGE PREVIEW
    // ==============================================================================

    function handleImagePreview(files) {
        const imagePreview = document.getElementById('imagePreview');
        if (!imagePreview) return;
        
        imagePreview.innerHTML = '';
        
        if (files.length > 5) {
            window.adminCore.showNotification('Maximum 5 images allowed', 'warning');
            return;
        }
        
        Array.from(files).forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imageItem = document.createElement('div');
                    imageItem.className = 'image-preview-item';
                    imageItem.innerHTML = `
                        <img src="${e.target.result}" alt="Preview ${index + 1}">
                        <span>Image ${index + 1}</span>
                    `;
                    imagePreview.appendChild(imageItem);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // ==============================================================================
    // SUBMIT BOOK FORM
    // ==============================================================================

    function submitBookForm(formData) {
        fetch('admin', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.adminCore.showNotification(data.message, 'success');
                window.adminCore.closeModal();
                loadBooks();
                loadCategories();
                if (window.adminStats) {
                    window.adminStats.loadStats();
                }
                if (window.adminCharts) {
                    window.adminCharts.loadCategoriesWithBookCount();
                }
            } else {
                window.adminCore.showNotification(data.message, 'error');
            }
        })
        .catch(error => {
            window.adminCore.showNotification('Failed to save book', 'error');
            console.error('Error:', error);
        });
    }

    // ==============================================================================
    // DELETE BOOK
    // ==============================================================================

    function deleteBook(id) {
        if (confirm('Are you sure you want to delete this book?')) {
            const formData = new URLSearchParams();
            formData.append('action', 'deleteBook');
            formData.append('id', id);
            
            window.adminCore.makeApiCall('admin', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.success) {
                    window.adminCore.showNotification(response.message, 'success');
                    loadBooks();
                    if (window.adminStats) {
                        window.adminStats.loadStats();
                    }
                    if (window.adminCharts) {
                        window.adminCharts.loadCategoriesWithBookCount();
                    }
                } else {
                    window.adminCore.showNotification(response.message, 'error');
                }
            })
            .catch(error => {
                window.adminCore.showNotification('Failed to delete book', 'error');
            });
        }
    }

    // ==============================================================================
    // PUBLIC API
    // ==============================================================================

    return {
        loadBooks,
        loadCategories,
        displayBooks,
        viewBookDetails,
        showAddBookModal,
        editBook,
        deleteBook,
        changeMainImage
    };

})();

// Console logging for debugging
console.log('📚 Admin Inventory Module loaded:');
console.log('├── loadBooks()');
console.log('├── loadCategories()');
console.log('├── displayBooks()');
console.log('├── viewBookDetails(id)');
console.log('├── showAddBookModal()');
console.log('├── editBook(id)');
console.log('├── deleteBook(id)');
console.log('└── changeMainImage(imageSrc)');