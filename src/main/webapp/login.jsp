<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<%
    // Check if user is already logged in, redirect to index.jsp
    if (session.getAttribute("user") != null) {
        response.sendRedirect("index2.jsp");
        return;
    }
%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Pahana Edu - Customer Login & Registration</title>
 	<link rel="stylesheet" href="css/login.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
<div class="container">
        <!-- Background Animation -->
        <div class="background-animation">
            <div class="floating-shape shape-1"></div>
            <div class="floating-shape shape-2"></div>
            <div class="floating-shape shape-3"></div>
            <div class="floating-shape shape-4"></div>
        </div>

        <!-- Left Panel - Branding -->
        <div class="left-panel">
            <div class="brand-section">
                <div class="logo-container">
                    <i class="fas fa-book-open logo-icon"></i>
                    <h1 class="brand-name">Pahana Edu</h1>
                </div>
                <p class="brand-tagline">Leading Bookshop in Colombo City</p>
                <div class="stats-container">
                    <div class="stat-item">
                        <i class="fas fa-users"></i>
                        <span>500+ Happy Customers</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-book"></i>
                        <span>10,000+ Books Available</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-award"></i>
                        <span>Trusted Since 2010</span>
                    </div>
                </div>
            </div>
            <div class="illustration">
                <i class="fas fa-graduation-cap main-icon"></i>
                <div class="floating-books">
                    <i class="fas fa-book book-1"></i>
                    <i class="fas fa-book-reader book-2"></i>
                    <i class="fas fa-bookmark book-3"></i>
                </div>
            </div>
        </div>

        <!-- Right Panel - Forms -->
        <div class="right-panel">
            <div class="form-container">
                <!-- Toggle Buttons -->
                <div class="form-toggle">
                    <button class="toggle-btn active" id="loginToggle">
                        <i class="fas fa-sign-in-alt"></i>
                        Login
                    </button>
                    <button class="toggle-btn" id="signupToggle">
                        <i class="fas fa-user-plus"></i>
                        Sign Up
                    </button>
                </div>

                <!-- Server Error Messages (if any) -->
                <c:if test="${not empty errorMessage}">
                    <div class="server-error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        ${errorMessage}
                    </div>
                </c:if>

                <c:if test="${not empty successMessage}">
                    <div class="server-success-message">
                        <i class="fas fa-check-circle"></i>
                        ${successMessage}
                    </div>
                </c:if>

                <!-- Password Reset Success Message -->
                <c:if test="${not empty sessionScope.loginSuccessMessage}">
                    <div class="server-success-message">
                        <i class="fas fa-check-circle"></i>
                        ${sessionScope.loginSuccessMessage}
                    </div>
                    <c:remove var="loginSuccessMessage" scope="session" />
                </c:if>

                <!-- Login Form -->
                <div class="form-section" id="loginForm">
                    <div class="form-header">
                        <h2>Welcome Back!</h2>
                        <p>Access your customer account</p>
                    </div>
                    
                    <!-- Form without action - handled by JavaScript -->
                    <form class="auth-form" id="loginFormElement" onsubmit="return false;">
                        <div class="input-group">
                            <div class="input-container">
                                <i class="fas fa-envelope input-icon"></i>
                                <input type="email" id="loginEmail" name="email" required>
                                <label for="loginEmail">Email Address</label>
                                <div class="input-underline"></div>
                            </div>
                        </div>

                        <div class="input-group">
                            <div class="input-container">
                                <i class="fas fa-lock input-icon"></i>
                                <input type="password" id="loginPassword" name="password" required>
                                <label for="loginPassword">Password</label>
                                <button type="button" class="toggle-password" onclick="togglePassword('loginPassword')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <div class="input-underline"></div>
                            </div>
                        </div>

                        <div class="form-options">
                            <label class="remember-me">
                                <input type="checkbox" id="rememberMe" name="rememberMe">
                                <span class="checkmark"></span>
                                Remember me
                            </label>
                            <a href="forgot-password.jsp" class="forgot-password">Forgot Password?</a>
                        </div>

                        <button type="submit" class="submit-btn">
                            <i class="fas fa-arrow-right"></i>
                            Login to Account
                        </button>
                    </form>
                </div>

                <!-- Signup Form -->
                <div class="form-section hidden" id="signupForm">
                    <div class="form-header">
                        <h2>Create Account</h2>
                        <p>Join Pahana Edu family today</p>
                    </div>
                    
                    <!-- Form without action - handled by JavaScript -->
                    <form class="auth-form" id="signupFormElement" onsubmit="return false;">
                        <div class="name-row">
                            <div class="input-group">
                                <div class="input-container">
                                    <i class="fas fa-user input-icon"></i>
                                    <input type="text" id="firstName" name="firstName" required>
                                    <label for="firstName">First Name</label>
                                    <div class="input-underline"></div>
                                </div>
                            </div>

                            <div class="input-group">
                                <div class="input-container">
                                    <i class="fas fa-user input-icon"></i>
                                    <input type="text" id="lastName" name="lastName" required>
                                    <label for="lastName">Last Name</label>
                                    <div class="input-underline"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Phone Number Field -->
                        <div class="input-group">
                            <div class="input-container">
                                <i class="fas fa-phone input-icon"></i>
                                <input type="tel" id="phone" name="phone" required>
                                <label for="phone">Phone Number (10 digits)</label>
                                <div class="input-underline"></div>
                            </div>
                        </div>

                        <div class="input-group">
                            <div class="input-container">
                                <i class="fas fa-envelope input-icon"></i>
                                <input type="email" id="signupEmail" name="email" required>
                                <label for="signupEmail">Email Address</label>
                                <div class="input-underline"></div>
                            </div>
                        </div>

                        <div class="input-group">
                            <div class="input-container">
                                <i class="fas fa-lock input-icon"></i>
                                <input type="password" id="signupPassword" name="password" required>
                                <label for="signupPassword">Password</label>
                                <button type="button" class="toggle-password" onclick="togglePassword('signupPassword')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <div class="input-underline"></div>
                            </div>
                            <div class="password-strength">
                                <div class="strength-bar">
                                    <div class="strength-fill"></div>
                                </div>
                                <span class="strength-text">Password strength</span>
                            </div>
                        </div>

                        <div class="input-group">
                            <div class="input-container">
                                <i class="fas fa-lock input-icon"></i>
                                <input type="password" id="confirmPassword" name="confirmPassword" required>
                                <label for="confirmPassword">Confirm Password</label>
                                <button type="button" class="toggle-password" onclick="togglePassword('confirmPassword')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <div class="input-underline"></div>
                            </div>
                        </div>

                        <div class="form-options">
                            <label class="terms-agreement">
                                <input type="checkbox" id="agreeTerms" name="agreeTerms" required>
                                <span class="checkmark"></span>
                                I agree to the <a href="#" class="terms-link">Terms & Conditions</a>
                            </label>
                        </div>

                        <button type="submit" class="submit-btn">
                            <i class="fas fa-user-plus"></i>
                            Create Account
                        </button>
                    </form>
                </div>

                <!-- Success/Error Messages -->
                <div class="message-container" id="messageContainer"></div>
            </div>
        </div>
    </div>

    <!-- Loading Overlay -->
    <div class="loading-overlay" id="loadingOverlay">
        <div class="loading-spinner">
            <i class="fas fa-book-open"></i>
        </div>
        <p>Processing your request...</p>
    </div>

    <script src="js/login.js"></script>

</body>
</html>