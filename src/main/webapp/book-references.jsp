<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<%
    // Security Check
    if (session.getAttribute("user") == null) {
        response.sendRedirect("login.jsp");
        return;
    }
    
    String userRole = (String) session.getAttribute("userRole");
    if (!"ADMIN".equals(userRole) && !"CASHIER".equals(userRole)) {
        response.sendRedirect("login.jsp");
        return;
    }
    
    String userName = (String) session.getAttribute("userName");
    String firstName = (String) session.getAttribute("userFirstName");
    String lastName = (String) session.getAttribute("userLastName");
    
    if (firstName == null) firstName = "User";
    if (lastName == null) lastName = "";
%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pahana Edu - Book References & QR Management</title>
    
    <!-- External CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- QR Code Library -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>
    
    <!-- Custom CSS -->
    <link href="css/book-reference.css" rel="stylesheet">
    
    <style>
        .book-references-container {
            background: #f8fafc;
            min-height: 100vh;
            padding: 20px;
        }
        
        .references-header {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .references-title {
            margin: 0;
            color: #1e293b;
            font-size: 28px;
            font-weight: 700;
        }
        
        .references-subtitle {
            color: #64748b;
            margin: 5px 0 0 0;
        }
        
        .header-actions {
            display: flex;
            gap: 10px;
        }
        
        .search-section {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 25px;
        }
        
        .search-form {
            display: flex;
            gap: 15px;
            align-items: end;
            flex-wrap: wrap;
        }
        
        .search-group {
            flex: 1;
            min-width: 200px;
        }
        
        .search-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #374151;
        }
        
        .search-input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
        }
        
        .references-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .book-reference-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .book-reference-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .book-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 15px;
        }
        
        .book-info h3 {
            margin: 0 0 5px 0;
            color: #1e293b;
            font-size: 18px;
            font-weight: 600;
        }
        
        .book-author {
            color: #64748b;
            font-size: 14px;
            margin: 0;
        }
        
        .stock-badge {
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .stock-badge.normal-stock {
            background: #dcfce7;
            color: #166534;
        }
        
        .stock-badge.low-stock {
            background: #fef3c7;
            color: #92400e;
        }
        
        .stock-badge.out-of-stock {
            background: #fee2e2;
            color: #dc2626;
        }
        
        .reference-details {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        
        .reference-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .reference-item:last-child {
            margin-bottom: 0;
        }
        
        .reference-label {
            font-weight: 500;
            color: #374151;
            font-size: 14px;
        }
        
        .reference-value {
            font-family: 'Courier New', monospace;
            font-weight: 600;
            color: #1e293b;
            padding: 2px 6px;
            background: white;
            border-radius: 4px;
            font-size: 13px;
        }
        
        .qr-section {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
            border: 2px dashed #e5e7eb;
            margin: 15px 0;
        }
        
        .qr-code {
            width: 100px;
            height: 100px;
            margin: 0 auto 10px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
        }
        
        .price-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 15px 0;
        }
        
        .price-item {
            text-align: center;
        }
        
        .price-label {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 2px;
        }
        
        .price-value {
            font-weight: 600;
            font-size: 16px;
        }
        
        .regular-price {
            color: #6b7280;
        }
        
        .offer-price {
            color: #dc2626;
        }
        
        .discount-badge {
            background: #dc2626;
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
        }
        
        .card-actions {
            display: flex;
            gap: 8px;
            margin-top: 15px;
        }
        
        .btn-sm {
            padding: 6px 12px;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.2s;
        }
        
        .btn-primary {
            background: #2563eb;
            color: white;
        }
        
        .btn-success {
            background: #059669;
            color: white;
        }
        
        .btn-info {
            background: #0891b2;
            color: white;
        }
        
        .btn-secondary {
            background: #6b7280;
            color: white;
        }
        
        .btn-sm:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .no-books {
            text-align: center;
            padding: 60px 20px;
            color: #64748b;
        }
        
        .no-books i {
            font-size: 4em;
            margin-bottom: 20px;
            display: block;
            color: #d1d5db;
        }
        
        /* Print Modal Styles */
        .print-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
        }
        
        .print-modal.show {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .print-modal-content {
            background: white;
            padding: 30px;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 15px;
        }
        
        .modal-header h3 {
            margin: 0;
            color: #1e293b;
            font-size: 20px;
            font-weight: 600;
        }
        
        .close-btn {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #6b7280;
            padding: 5px;
            border-radius: 4px;
            transition: background 0.2s;
        }
        
        .close-btn:hover {
            background: #f3f4f6;
        }
        
        .print-preview {
            border: 1px solid #e5e7eb;
            padding: 20px;
            margin: 20px 0;
            background: #f9fafb;
            text-align: center;
            border-radius: 8px;
        }
        
        .sticker-preview {
            width: 200px;
            margin: 0 auto;
            padding: 15px;
            border: 2px dashed #9ca3af;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .preview-qr {
            width: 80px !important;
            height: 80px !important;
            margin: 10px auto;
            border: 1px solid #d1d5db;
            border-radius: 4px;
        }
        
        .quantity-section {
            margin: 20px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .quantity-input {
            width: 80px;
            padding: 8px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            text-align: center;
            font-weight: 500;
        }
        
        .modal-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: #64748b;
        }
        
        .loading i {
            font-size: 2em;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Print Styles */
        @media print {
            .no-print {
                display: none !important;
            }
            
            .book-reference-card {
                break-inside: avoid;
                margin-bottom: 20px;
                box-shadow: none;
                border: 1px solid #000;
            }
            
            .references-grid {
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            }
        }
        
        /* Notification Styles */
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            animation: slideInRight 0.3s ease;
            color: white;
            font-weight: 500;
        }
        
        .notification.success { background: #10b981; }
        .notification.error { background: #ef4444; }
        .notification.warning { background: #f59e0b; }
        .notification.info { background: #06b6d4; }
        
        .notification button {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            margin-left: 10px;
        }
        
        .notification button:hover {
            background: rgba(255,255,255,0.2);
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    </style>
</head>
<body>
    <div class="book-references-container">
        <!-- Header -->
        <div class="references-header no-print">
            <div>
                <h1 class="references-title">
                    <i class="fas fa-qrcode"></i>
                    Book References & QR Management
                </h1>
                <p class="references-subtitle">Manage book reference numbers, QR codes, and print stickers</p>
            </div>
            <div class="header-actions">
				<button class="btn-secondary" onclick="window.location.href='admin-dashboard.jsp#inventory'">		
                    <i class="fas fa-arrow-left"></i> Back to Admin
                </button>
                <button class="btn-info" onclick="refreshReferences()">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
            </div>
        </div>
        
        <!-- Search Section -->
        <div class="search-section no-print">
            <div class="search-form">
                <div class="search-group">
                    <label>Search Books</label>
                    <input type="text" id="searchInput" class="search-input" placeholder="Search by title, author, or reference no..." onkeyup="searchBooks()">
                </div>
                <div class="search-group">
                    <label>Category</label>
                    <select id="categoryFilter" class="search-input" onchange="filterBooks()">
                        <option value="">All Categories</option>
                    </select>
                </div>
                <div class="search-group">
                    <label>Stock Status</label>
                    <select id="stockFilter" class="search-input" onchange="filterBooks()">
                        <option value="">All Stock</option>
                        <option value="normal">Normal Stock</option>
                        <option value="low">Low Stock</option>
                        <option value="out">Out of Stock</option>
                    </select>
                </div>
                <div class="search-group">
                    <label>&nbsp;</label>
                    <button class="btn-primary search-input" onclick="printAllStickers()">
                        <i class="fas fa-print"></i> Print All Stickers
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Books Grid -->
        <div id="booksContainer">
            <div class="loading">
                <i class="fas fa-spinner"></i>
                <p>Loading books...</p>
            </div>
        </div>
    </div>
    
    <!-- Print Modal -->
    <div id="printModal" class="print-modal">
        <div class="print-modal-content">
            <div class="modal-header">
                <h3>Print Book Stickers</h3>
                <button class="close-btn" onclick="closePrintModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="print-preview">
                <div class="sticker-preview" id="stickerPreview">
                    <!-- Sticker preview will be generated here -->
                </div>
            </div>
            
            <div class="quantity-section">
                <label for="stickerQuantity">Number of Stickers:</label>
                <input type="number" id="stickerQuantity" class="quantity-input" value="1" min="1" max="100">
            </div>
            
            <div class="modal-actions">
                <button class="btn-secondary" onclick="closePrintModal()">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button class="btn-success" onclick="printStickers()">
                    <i class="fas fa-print"></i> Print Stickers
                </button>
            </div>
        </div>
    </div>
    
    <!-- Book References Script -->
    <script src="js/admin/book-references.js"></script>
</body>
</html>