<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
    <%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>   
    
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>PahanaColombo</title>
    <!-- External CSS Links -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="css/style.css" rel="stylesheet">
</head>
<body>
 <!-- Header -->
    <header class="header" id="header">
        <nav class="nav-container">
            <a href="#" class="logo">
                <i class="fas fa-book-open"></i>
                Pahana Edu
            </a>

            <ul class="nav-menu">
                <li><a href="#home">Home</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>

            <div class="nav-actions">
                <a href="login.jsp" class="login-btn">Sign In</a>
                <a href="login.jsp" class="cta-btn">Get Started</a>
            </div>

            <div class="mobile-menu-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav>
    </header>

    <!-- Hero Section -->
    <section class="hero" id="home">
        <div class="hero-container">
            <div class="hero-content fade-in">
                <div class="hero-badge">
                    <i class="fas fa-award"></i>
                    Trusted by 500+ Customers
                </div>
                
                <h1 class="hero-title">
                    Smart Billing System<br>
                    for <span class="highlight">Modern Bookshops</span>
                </h1>

                <p class="hero-subtitle">
                    Transform your bookshop operations with our professional billing and customer management system. 
                    Designed for reliability, efficiency, and ease of use.
                </p>

                <div class="hero-actions">
                    <a href="trial.html" class="btn-primary">
                        <i class="fas fa-rocket"></i>
                        Start Free Trial
                    </a>
                    <a href="demo.html" class="btn-secondary">
                        <i class="fas fa-play"></i>
                        Watch Demo
                    </a>
                </div>

                <div class="hero-stats">
                    <div class="stat">
                        <span class="stat-number">500+</span>
                        <span class="stat-label">Active Customers</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">50k+</span>
                        <span class="stat-label">Books Sold</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">99.9%</span>
                        <span class="stat-label">System Uptime</span>
                    </div>
                </div>
            </div>

            <div class="hero-image fade-in">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Modern Bookshop Dashboard">
                
                <div class="floating-card card-1">
                    <h4 style="color: var(--text-primary); margin-bottom: 8px; font-size: 16px;">Daily Sales</h4>
                    <p style="color: var(--primary-color); font-size: 24px; font-weight: 700;">₨ 45,230</p>
                    <span class="hint-text status-online">
                        <i class="fas fa-arrow-up"></i> +12% from yesterday
                    </span>
                </div>

                <div class="floating-card card-2">
                    <h4 style="color: var(--text-primary); margin-bottom: 8px; font-size: 16px;">Stock Status</h4>
                    <p style="color: var(--success-color); font-size: 24px; font-weight: 700;">12,847</p>
                    <span class="hint-text">
                        <i class="fas fa-check-circle status-online"></i> All systems operational
                    </span>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="features" id="features">
        <div class="features-container">
            <div class="section-header fade-in">
                <div class="section-badge">Core Features</div>
                <h2 class="section-title">Professional Tools for Your Business</h2>
                <p class="section-description">
                    Everything you need to manage your bookshop efficiently and professionally, 
                    with medical-grade reliability and security.
                </p>
            </div>

            <div class="features-grid">
                <div class="feature-card fade-in">
                    <div class="feature-icon">
                        <i class="fas fa-cash-register"></i>
                    </div>
                    <h3 class="feature-title">Smart Billing System</h3>
                    <p class="feature-description">
                        Process transactions with confidence using our reliable billing interface. 
                        Generate professional invoices and track all sales in real-time.
                    </p>
                    <a href="billing.html" class="feature-link">
                        Learn More <i class="fas fa-arrow-right"></i>
                    </a>
                </div>

                <div class="feature-card fade-in">
                    <div class="feature-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3 class="feature-title">Customer Management</h3>
                    <p class="feature-description">
                        Maintain comprehensive customer profiles with purchase history and preferences. 
                        Build stronger relationships with personalized service.
                    </p>
                    <a href="customers.html" class="feature-link">
                        Learn More <i class="fas fa-arrow-right"></i>
                    </a>
                </div>

                <div class="feature-card fade-in">
                    <div class="feature-icon">
                        <i class="fas fa-boxes"></i>
                    </div>
                    <h3 class="feature-title">Inventory Control</h3>
                    <p class="feature-description">
                        Monitor your book inventory with precision. Set automated alerts for low stock 
                        and manage suppliers with ease.
                    </p>
                    <a href="inventory.html" class="feature-link">
                        Learn More <i class="fas fa-arrow-right"></i>
                    </a>
                </div>

                <div class="feature-card fade-in">
                    <div class="feature-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <h3 class="feature-title">Analytics & Reports</h3>
                    <p class="feature-description">
                        Make data-driven decisions with comprehensive business analytics. 
                        Professional reports for better business insights.
                    </p>
                    <a href="reports.html" class="feature-link">
                        Learn More <i class="fas fa-arrow-right"></i>
                    </a>
                </div>

                <div class="feature-card fade-in">
                    <div class="feature-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h3 class="feature-title">Secure & Reliable</h3>
                    <p class="feature-description">
                        Enterprise-grade security with 99.9% uptime guarantee. 
                        Your data is protected with medical-grade encryption standards.
                    </p>
                    <a href="security.html" class="feature-link">
                        Learn More <i class="fas fa-arrow-right"></i>
                    </a>
                </div>

                <div class="feature-card fade-in">
                    <div class="feature-icon">
                        <i class="fas fa-mobile-alt"></i>
                    </div>
                    <h3 class="feature-title">Mobile Responsive</h3>
                    <p class="feature-description">
                        Access your system anywhere, anytime. Fully responsive design 
                        optimized for desktop, tablet, and mobile devices.
                    </p>
                    <a href="mobile.html" class="feature-link">
                        Learn More <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section class="about" id="about">
        <div class="about-container">
            <div class="about-image fade-in">
                <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Pahana Edu Bookshop">
                <div class="about-badge">Established 2020</div>
            </div>

            <div class="about-content fade-in">
                <h2>Leading Bookshop in Colombo City</h2>
                <p class="about-description">
                    For over three years, Pahana Edu has been the trusted partner for students and book enthusiasts 
                    in Colombo. We combine traditional service excellence with modern technology solutions.
                </p>

                <ul class="about-features">
                    <li>
                        <i class="fas fa-check-circle"></i>
                        Serving 500+ satisfied customers monthly
                    </li>
                    <li>
                        <i class="fas fa-check-circle"></i>
                        15,000+ books across all categories
                    </li>
                    <li>
                        <i class="fas fa-check-circle"></i>
                        Academic and professional literature
                    </li>
                    <li>
                        <i class="fas fa-check-circle"></i>
                        Competitive pricing with member discounts
                    </li>
                    <li>
                        <i class="fas fa-check-circle"></i>
                        Expert consultation and recommendations
                    </li>
                </ul>

                <a href="#contact" class="btn-primary">
                    <i class="fas fa-phone"></i>
                    Contact Us Today
                </a>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section class="contact" id="contact">
        <div class="contact-container">
            <h2 class="fade-in">Get Professional Support</h2>
            <p class="contact-description fade-in">
                Ready to upgrade your bookshop operations? Our professional team is here to help you succeed.
            </p>

            <div class="contact-info">
                <div class="contact-item fade-in">
                    <i class="fas fa-map-marker-alt"></i>
                    <h3>Visit Our Location</h3>
                    <p>123 Galle Road, Colombo 03<br>Sri Lanka</p>
                </div>

                <div class="contact-item fade-in">
                    <i class="fas fa-phone"></i>
                    <h3>Call Our Support</h3>
                    <p>+94 11 234 5678<br>+94 77 123 4567</p>
                </div>

                <div class="contact-item fade-in">
                    <i class="fas fa-envelope"></i>
                    <h3>Email Support</h3>
                    <p>info@pahanaedu.lk<br>support@pahanaedu.lk</p>
                </div>

                <div class="contact-item fade-in">
                    <i class="fas fa-clock"></i>
                    <h3>Business Hours</h3>
                    <p>Mon - Sat: 9:00 AM - 8:00 PM<br>Sunday: 10:00 AM - 6:00 PM</p>
                </div>
            </div>

            <a href="contact.html" class="btn-primary">
                <i class="fas fa-calendar-check"></i>
                Schedule Consultation
            </a>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-container">
            <div class="footer-content">
                <div class="footer-brand">
                    <h3>Pahana Edu</h3>
                    <p>
                        Professional bookshop solutions with medical-grade reliability. 
                        Serving Colombo's academic community with trust and excellence since 2020.
                    </p>
                    <div class="social-links">
                        <a href="#" title="Facebook"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" title="Twitter"><i class="fab fa-twitter"></i></a>
                        <a href="#" title="Instagram"><i class="fab fa-instagram"></i></a>
                        <a href="#" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                    </div>
                </div>

                <div class="footer-section">
                    <h4>Professional Services</h4>
                    <ul>
                        <li><a href="billing.html">Billing Management</a></li>
                        <li><a href="inventory.html">Inventory Control</a></li>
                        <li><a href="analytics.html">Customer Analytics</a></li>
                        <li><a href="reports.html">Business Reports</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h4>Company</h4>
                    <ul>
                        <li><a href="about.html">About Pahana Edu</a></li>
                        <li><a href="mission.html">Our Mission</a></li>
                        <li><a href="careers.html">Career Opportunities</a></li>
                        <li><a href="news.html">News & Updates</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h4>Professional Support</h4>
                    <ul>
                        <li><a href="help.html">Help Center</a></li>
                        <li><a href="docs.html">System Documentation</a></li>
                        <li><a href="support.html">Technical Support</a></li>
                        <li><a href="status.html">System Status</a></li>
                    </ul>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; 2024 Pahana Edu. All rights reserved. | Professional bookshop solutions you can trust.</p>
            </div>
        </div>
    </footer>

    <!-- Custom JavaScript -->
    <script src="js/script.js"></script>

</body>
</html>