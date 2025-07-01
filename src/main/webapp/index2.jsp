<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<%
    // Check if user is logged in, redirect to login if not
    if (session.getAttribute("user") == null) {
        response.sendRedirect("login.jsp");
        return;
    }
    
    String userName = (String) session.getAttribute("userName");
    String userEmail = (String) session.getAttribute("userEmail");
    String firstName = userName.split(" ")[0]; // Get first name only
%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Dashboard - Pahana Edu</title>
    <!-- External CSS Links -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="css/customerdashbord.css" rel="stylesheet">
</head>
<body>
    <!-- Header - Modified for Logged In User -->
    <header class="header" id="header">
        <nav class="nav-container">
            <a href="#" class="logo">
                <i class="fas fa-book-open"></i>
                Pahana Edu
            </a>

            <ul class="nav-menu">
                <li><a href="#dashboard">Dashboard</a></li>
                <li><a href="#books">Books</a></li>
                <li><a href="#orders">My Orders</a></li>
                <li><a href="#profile">Profile</a></li>
            </ul>

            <div class="nav-actions logged-in">
                <div class="user-info">
                    <div class="user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-details">
                        <span class="user-name">Hello, <%= firstName %></span>
                        <span class="user-email"><%= userEmail %></span>
                    </div>
                </div>
                <div class="user-menu">
                    <button class="user-menu-toggle" id="userMenuToggle">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="user-dropdown" id="userDropdown">
                        <a href="#profile" class="dropdown-item">
                            <i class="fas fa-user-cog"></i>
                            Account Settings
                        </a>
                        <a href="#orders" class="dropdown-item">
                            <i class="fas fa-shopping-bag"></i>
                            My Orders
                        </a>
                        <a href="#help" class="dropdown-item">
                            <i class="fas fa-question-circle"></i>
                            Help & Support
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="logout.jsp" class="dropdown-item logout">
                            <i class="fas fa-sign-out-alt"></i>
                            Logout
                        </a>
                    </div>
                </div>
            </div>

            <div class="mobile-menu-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav>
    </header>

    <!-- Dashboard Hero Section -->
    <section class="dashboard-hero" id="dashboard">
        <div class="dashboard-hero-container">
            <div class="welcome-section">
                <h1 class="welcome-title">Welcome back, <%= firstName %>!</h1>
                <p class="welcome-subtitle">Ready to explore our latest collection of books and manage your orders.</p>
                <div class="quick-stats">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-number">0</span>
                            <span class="stat-label">Cart Items</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-heart"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-number">0</span>
                            <span class="stat-label">Wishlist</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-box"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-number">0</span>
                            <span class="stat-label">Orders</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="dashboard-image">
                <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Your Personal Library">
            </div>
        </div>
    </section>

    <!-- Quick Actions Section -->
    <section class="quick-actions">
        <div class="quick-actions-container">
            <h2 class="section-title">Quick Actions</h2>
            <div class="actions-grid">
                <div class="action-card">
                    <div class="action-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>Browse Books</h3>
                    <p>Explore our vast collection of educational and academic books</p>
                    <a href="#books" class="action-btn">Browse Now</a>
                </div>
                
                <div class="action-card">
                    <div class="action-icon">
                        <i class="fas fa-shopping-bag"></i>
                    </div>
                    <h3>My Orders</h3>
                    <p>Track your orders and view purchase history</p>
                    <a href="#orders" class="action-btn">View Orders</a>
                </div>
                
                <div class="action-card">
                    <div class="action-icon">
                        <i class="fas fa-user-edit"></i>
                    </div>
                    <h3>Profile Settings</h3>
                    <p>Update your personal information and preferences</p>
                    <a href="#profile" class="action-btn">Edit Profile</a>
                </div>
                
                <div class="action-card">
                    <div class="action-icon">
                        <i class="fas fa-headset"></i>
                    </div>
                    <h3>Support</h3>
                    <p>Get help with your account or contact our support team</p>
                    <a href="#support" class="action-btn">Get Help</a>
                </div>
            </div>
        </div>
    </section>

    <!-- Featured Books Section -->
    <section class="featured-books" id="books">
        <div class="featured-books-container">
            <div class="section-header">
                <h2 class="section-title">Featured Books</h2>
                <p class="section-description">Discover the latest additions to our collection</p>
            </div>
            
            <div class="books-grid">
                <div class="book-card">
                    <div class="book-image">
                        <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Programming Book">
                        <div class="book-overlay">
                            <button class="btn-quick-view">Quick View</button>
                        </div>
                    </div>
                    <div class="book-info">
                        <h4>Advanced Programming Concepts</h4>
                        <p class="book-author">by John Smith</p>
                        <p class="book-price">₨ 2,500.00</p>
                        <div class="book-actions">
                            <button class="btn-add-cart">Add to Cart</button>
                            <button class="btn-wishlist"><i class="fas fa-heart"></i></button>
                        </div>
                    </div>
                </div>
                
                <div class="book-card">
                    <div class="book-image">
                        <img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Mathematics Book">
                        <div class="book-overlay">
                            <button class="btn-quick-view">Quick View</button>
                        </div>
                    </div>
                    <div class="book-info">
                        <h4>Higher Mathematics</h4>
                        <p class="book-author">by Sarah Johnson</p>
                        <p class="book-price">₨ 1,800.00</p>
                        <div class="book-actions">
                            <button class="btn-add-cart">Add to Cart</button>
                            <button class="btn-wishlist"><i class="fas fa-heart"></i></button>
                        </div>
                    </div>
                </div>
                
                <div class="book-card">
                    <div class="book-image">
                        <img src="https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Science Book">
                        <div class="book-overlay">
                            <button class="btn-quick-view">Quick View</button>
                        </div>
                    </div>
                    <div class="book-info">
                        <h4>Modern Physics</h4>
                        <p class="book-author">by Dr. Michael Brown</p>
                        <p class="book-price">₨ 3,200.00</p>
                        <div class="book-actions">
                            <button class="btn-add-cart">Add to Cart</button>
                            <button class="btn-wishlist"><i class="fas fa-heart"></i></button>
                        </div>
                    </div>
                </div>
                
                <div class="book-card">
                    <div class="book-image">
                        <img src="https://images.unsplash.com/photo-1592496431122-2349e0fbc666?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Literature Book">
                        <div class="book-overlay">
                            <button class="btn-quick-view">Quick View</button>
                        </div>
                    </div>
                    <div class="book-info">
                        <h4>English Literature</h4>
                        <p class="book-author">by Emily Davis</p>
                        <p class="book-price">₨ 1,500.00</p>
                        <div class="book-actions">
                            <button class="btn-add-cart">Add to Cart</button>
                            <button class="btn-wishlist"><i class="fas fa-heart"></i></button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="books-actions">
                <a href="#" class="btn-primary">View All Books</a>
            </div>
        </div>
    </section>

    <!-- Recent Activity Section -->
    <section class="recent-activity">
        <div class="activity-container">
            <h2 class="section-title">Recent Activity</h2>
            <div class="activity-list">
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-user-plus"></i>
                    </div>
                    <div class="activity-content">
                        <h4>Welcome to Pahana Edu!</h4>
                        <p>Your account has been successfully created. Start exploring our book collection.</p>
                        <span class="activity-time">Just now</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-container">
            <div class="footer-content">
                <div class="footer-brand">
                    <h3>Pahana Edu</h3>
                    <p>
                        Your trusted partner in academic excellence. Serving students and educators 
                        with quality books and reliable service since 2020.
                    </p>
                    <div class="social-links">
                        <a href="#" title="Facebook"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" title="Twitter"><i class="fab fa-twitter"></i></a>
                        <a href="#" title="Instagram"><i class="fab fa-instagram"></i></a>
                        <a href="#" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                    </div>
                </div>

                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="#books">Browse Books</a></li>
                        <li><a href="#orders">My Orders</a></li>
                        <li><a href="#profile">Account Settings</a></li>
                        <li><a href="#support">Support</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h4>Categories</h4>
                    <ul>
                        <li><a href="#">Academic Books</a></li>
                        <li><a href="#">Programming</a></li>
                        <li><a href="#">Mathematics</a></li>
                        <li><a href="#">Science</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h4>Support</h4>
                    <ul>
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">Returns</a></li>
                        <li><a href="#">Shipping Info</a></li>
                    </ul>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; 2024 Pahana Edu. All rights reserved. | Your trusted educational partner.</p>
            </div>
        </div>
    </footer>

    <!-- Custom JavaScript -->
    <script src="js/customer-script.js"></script>

</body>
</html>