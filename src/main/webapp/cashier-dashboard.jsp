<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<%
    // Check if user is logged in and is a cashier
    if (session.getAttribute("user") == null) {
        response.sendRedirect("login.jsp");
        return;
    }
    
    String userRole = (String) session.getAttribute("userRole");
    if (!"CASHIER".equals(userRole)) {
        response.sendRedirect("login.jsp");
        return;
    }
    
    String userName = (String) session.getAttribute("userName");
    String userEmail = (String) session.getAttribute("userEmail");
    String firstName = (String) session.getAttribute("userFirstName");
    String lastName = (String) session.getAttribute("userLastName");
    
    if (firstName == null) firstName = "Cashier";
    if (lastName == null) lastName = "User";
%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pahana Edu - Cashier Dashboard</title>
    
    <!-- External CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Custom CSS -->
    <link href="css/cashier-dashboard.css" rel="stylesheet">
</head>
<body>
    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <div class="logo">
                <i class="fas fa-cash-register"></i>
                <span class="logo-text">Pahana Edu</span>
            </div>
            <button class="sidebar-toggle" id="sidebarToggle">
                <i class="fas fa-bars"></i>
            </button>
        </div>
        
        <div class="cashier-profile">
            <div class="profile-avatar">
                <i class="fas fa-user-tie"></i>
            </div>
            <div class="profile-info">
                <h4><%= firstName %> <%= lastName %></h4>
                <span>Cashier</span>
            </div>
        </div>
        
        <nav class="sidebar-nav">
            <ul>
                <li class="nav-item active">
                    <a href="#" class="nav-link" data-page="dashboard">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>Dashboard</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link" data-page="customers">
                        <i class="fas fa-users"></i>
                        <span>Customer Management</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link" data-page="inventory">
                        <i class="fas fa-boxes"></i>
                        <span>Item Management</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link" data-page="billing">
                        <i class="fas fa-calculator"></i>
                        <span>Billing System</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link" data-page="help">
                        <i class="fas fa-question-circle"></i>
                        <span>Help & Support</span>
                    </a>
                </li>
                <li class="nav-item logout">
                    <a href="logout.jsp" class="nav-link" onclick="return confirm('Are you sure you want to logout?')">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </a>
                </li>
            </ul>
        </nav>
    </aside>
    
    <!-- Main Content -->
    <main class="main-content">
        <!-- Header -->
        <header class="header">
            <div class="header-left">
                <h1 id="pageTitle">Dashboard</h1>
                <p id="pageSubtitle">Welcome to your cashier control panel</p>
            </div>
            <div class="header-right">
                <div class="current-time" id="currentTime"></div>
                <div class="cashier-info">
                    <span><%= userEmail %></span>
                    <div class="cashier-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                </div>
            </div>
        </header>
        
        <!-- Content Area -->
        <div class="content" id="mainContent">
            <!-- Dashboard Content -->
            <div class="page-content active" id="dashboard-content">
                <!-- Quick Stats -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="totalCustomers">0</h3>
                            <p>Total Customers</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-boxes"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="totalItems">0</h3>
                            <p>Available Items</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-receipt"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="todayBills">0</h3>
                            <p>Today's Bills</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="todayRevenue">₨ 0</h3>
                            <p>Today's Revenue</p>
                        </div>
                    </div>
                </div>
                
               <!-- Quick Actions -->
				<div class="quick-actions">
				    <h3>Quick Actions</h3>
				    <div class="action-grid">
				        <button class="action-btn" onclick="navigateToPage('customers')">
				            <i class="fas fa-user-plus"></i>
				            <span>Add Customer</span>
				        </button>
				        <button class="action-btn" onclick="navigateToPage('inventory')">
				            <i class="fas fa-plus-circle"></i>
				            <span>Add Item</span>
				        </button>
				        <button class="action-btn" onclick="navigateToPage('billing')">
				            <i class="fas fa-calculator"></i>
				            <span>Create Bill</span>
				        </button>
				        <button class="action-btn" onclick="showCustomerSearch()">
				            <i class="fas fa-search"></i>
				            <span>Find Customer</span>
				        </button>
				        <!-- ✅ Newly added Scan Item button -->
				        <button class="action-btn" onclick="window.location.href='cashier-scan.jsp'">
				            <i class="fas fa-barcode"></i>
				            <span>Scan Item</span>
				        </button>
				    </div>
				</div>

                
                <!-- Recent Activities -->
                <div class="recent-activities">
                    <h3>Recent Activities</h3>
                    <div class="activity-list" id="activityList">
                        <div class="activity-item">
                            <div class="activity-icon">
                                <i class="fas fa-user-plus"></i>
                            </div>
                            <div class="activity-content">
                                <p>New customer registered</p>
                                <span class="activity-time">Just now</span>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-icon">
                                <i class="fas fa-receipt"></i>
                            </div>
                            <div class="activity-content">
                                <p>Bill generated for Customer #001</p>
                                <span class="activity-time">5 minutes ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Customer Management Content -->
            <div class="page-content" id="customers-content">
                <div class="content-header">
                    <h2>Customer Management</h2>
                    <button class="btn-primary" onclick="showAddCustomerModal()">
                        <i class="fas fa-plus"></i> Add New Customer
                    </button>
                </div>
                
                <div class="search-section">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="customerSearch" placeholder="Search customers by name, email, or phone...">
                    </div>
                </div>
                
                <div class="table-container">
                    <table class="data-table" id="customersTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Customer data will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Inventory Management Content -->
            <div class="page-content" id="inventory-content">
                <div class="content-header">
                    <h2>Item Management</h2>
                    <button class="btn-primary" onclick="showAddItemModal()">
                        <i class="fas fa-plus"></i> Add New Item
                    </button>
                </div>
                
                <div class="search-section">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="itemSearch" placeholder="Search items by title, author, or category...">
                    </div>
                </div>
                
                <div class="table-container">
                    <table class="data-table" id="itemsTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Item data will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Billing System Content -->
            <div class="page-content" id="billing-content">
                <div class="billing-container">
                    <div class="billing-header">
                        <h2>Billing System</h2>
                        <button class="btn-secondary" onclick="clearBill()">
                            <i class="fas fa-trash"></i> Clear Bill
                        </button>
                    </div>
                    
                    <div class="billing-form">
                        <div class="customer-selection">
                            <h3>Customer Information</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Select Customer</label>
                                    <select id="billingCustomer" onchange="loadCustomerInfo()">
                                        <option value="">Select a customer...</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Bill Date</label>
                                    <input type="date" id="billingDate">
                                </div>
                            </div>
                        </div>
                        
                        <div class="items-selection">
                            <h3>Add Items</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Select Item</label>
                                    <select id="itemSelect">
                                        <option value="">Select an item...</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Quantity</label>
                                    <input type="number" id="itemQuantity" min="1" value="1">
                                </div>
                                <div class="form-group">
                                    <button type="button" class="btn-primary" onclick="addItemToBill()">
                                        <i class="fas fa-plus"></i> Add Item
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bill-items" id="billItems">
                            <h3>Bill Items</h3>
                            <table class="bill-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Price</th>
                                        <th>Qty</th>
                                        <th>Total</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody id="billItemsList">
                                    <tr class="no-items">
                                        <td colspan="5">No items added to bill</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="bill-summary">
                            <div class="summary-row">
                                <span>Subtotal:</span>
                                <span id="billSubtotal">₨ 0.00</span>
                            </div>
                            <div class="summary-row">
                                <span>Tax (18%):</span>
                                <span id="billTax">₨ 0.00</span>
                            </div>
                            <div class="summary-row total">
                                <span>Total:</span>
                                <span id="billTotal">₨ 0.00</span>
                            </div>
                        </div>
                        
                        <div class="billing-actions">
                            <button class="btn-success" onclick="generateBill()" id="generateBillBtn" disabled>
                                <i class="fas fa-receipt"></i> Generate Bill
                            </button>
                            <button class="btn-primary" onclick="printBill()" id="printBillBtn" disabled>
                                <i class="fas fa-print"></i> Print Bill
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Help Content -->
            <div class="page-content" id="help-content">
                <div class="help-container">
                    <h2>Help & Support</h2>
                    
                    <div class="help-sections">
                        <div class="help-card">
                            <div class="help-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="help-content">
                                <h3>Customer Management</h3>
                                <ul>
                                    <li>Click "Add New Customer" to register new customers</li>
                                    <li>Use the search box to find existing customers</li>
                                    <li>Click the edit icon to update customer information</li>
                                    <li>View complete customer details by clicking the view icon</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="help-card">
                            <div class="help-icon">
                                <i class="fas fa-boxes"></i>
                            </div>
                            <div class="help-content">
                                <h3>Item Management</h3>
                                <ul>
                                    <li>Add new items using the "Add New Item" button</li>
                                    <li>Update item details by clicking the edit icon</li>
                                    <li>Remove items using the delete button (use carefully)</li>
                                    <li>Search items by title, author, or category</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="help-card">
                            <div class="help-icon">
                                <i class="fas fa-calculator"></i>
                            </div>
                            <div class="help-content">
                                <h3>Billing System</h3>
                                <ul>
                                    <li>Select customer and date before adding items</li>
                                    <li>Add items one by one with required quantities</li>
                                    <li>Review bill summary before generating</li>
                                    <li>Print bills for customer records</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="help-card">
                            <div class="help-icon">
                                <i class="fas fa-keyboard"></i>
                            </div>
                            <div class="help-content">
                                <h3>Keyboard Shortcuts</h3>
                                <ul>
                                    <li><kbd>Ctrl + N</kbd> - Add new customer/item</li>
                                    <li><kbd>Ctrl + F</kbd> - Focus search box</li>
                                    <li><kbd>Ctrl + B</kbd> - Go to billing</li>
                                    <li><kbd>Esc</kbd> - Close modals</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
    
    <!-- Modal -->
    <div class="modal" id="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modalTitle">Modal Title</h3>
                <button class="modal-close" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body" id="modalBody">
                <!-- Modal content will be loaded here -->
            </div>
        </div>
    </div>
    
    <!-- Notification Container -->
    <div class="notification-container" id="notificationContainer"></div>
    
    <!-- Scripts -->
    <script src="js/cashier-dashboard.js"></script>
</body>
</html>