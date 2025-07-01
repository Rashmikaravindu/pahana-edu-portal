<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<%
    if (session.getAttribute("user") != null) {
        response.sendRedirect("index2.jsp");
        return;
    }
%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Pahana Edu - Forgot Password</title>
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
                <i class="fas fa-key logo-icon"></i>
                <h1 class="brand-name">Password Reset</h1>
            </div>
            <p class="brand-tagline">Secure & Easy Recovery</p>
            <div class="stats-container">
                <div class="stat-item">
                    <i class="fas fa-shield-alt"></i>
                    <span>Secure Token Based</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-clock"></i>
                    <span>1 Hour Validity</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-check-circle"></i>
                    <span>Instant Access</span>
                </div>
            </div>
        </div>
        <div class="illustration">
            <i class="fas fa-unlock-alt main-icon"></i>
            <div class="floating-books">
                <i class="fas fa-key book-1"></i>
                <i class="fas fa-envelope book-2"></i>
                <i class="fas fa-lock book-3"></i>
            </div>
        </div>
    </div>

    <!-- Right Panel - Reset Form -->
    <div class="right-panel">
        <div class="form-container">
            <!-- Back to Login Link -->
            <div style="margin-bottom: 1rem;">
                <a href="login.jsp" class="forgot-password" style="display: inline-flex; align-items: center; gap: 8px;">
                    <i class="fas fa-arrow-left"></i>
                    Back to Login
                </a>
            </div>

            <!-- Form Header -->
            <div class="form-header">
                <h2>Reset Your Password</h2>
                <p>Enter your email address and we'll send you a reset link</p>
            </div>

            <!-- Server Messages -->
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

            <!-- Reset Link Display -->
            <c:if test="${not empty resetLink}">
                <div class="reset-link-container">
                    <div class="reset-link-header">
                        <i class="fas fa-link"></i>
                        <h3>Password Reset Link Generated</h3>
                    </div>
                    
                    <div class="reset-link-details">
                        <div class="detail-item">
                            <strong><i class="fas fa-envelope"></i> Email:</strong>
                            <span>${userEmail}</span>
                        </div>
                        <div class="detail-item">
                            <strong><i class="fas fa-clock"></i> Expires:</strong>
                            <span>1 hour from now</span>
                        </div>
                    </div>
                    
                    <div class="reset-link-url">
                        <label><i class="fas fa-link"></i> Reset Link:</label>
                        <div class="link-display">${resetLink}</div>
                    </div>
                    
                    <div class="reset-link-actions">
                        <a href="${resetLink}" class="submit-btn">
                            <i class="fas fa-key"></i>
                            Reset Password Now
                        </a>
                        
                        <button type="button" onclick="copyToClipboard('${resetLink}')" class="copy-btn">
                            <i class="fas fa-copy"></i>
                            Copy Link
                        </button>
                    </div>
                    
                    <div class="reset-link-note">
                        <i class="fas fa-info-circle"></i>
                        <small>In production, this link would be sent to your email instead of being displayed here.</small>
                    </div>
                </div>
            </c:if>

            <!-- Email Form (Hidden when reset link is shown) -->
            <c:if test="${empty resetLink}">
                <form action="forgot-password" method="post" class="auth-form">
                    <div class="input-group">
                        <div class="input-container">
                            <i class="fas fa-envelope input-icon"></i>
                            <input type="email" id="email" name="email" required 
                                   value="<c:out value='${param.email}'/>"
                                   placeholder=" ">
                            <label for="email">Email Address</label>
                            <div class="input-underline"></div>
                        </div>
                    </div>

                    <div class="info-note">
                        <i class="fas fa-shield-alt"></i>
                        <p>We'll generate a secure link to reset your password. The link will expire in 1 hour for your security.</p>
                    </div>

                    <button type="submit" class="submit-btn">
                        <i class="fas fa-paper-plane"></i>
                        Send Reset Link
                    </button>
                </form>

                <div class="form-footer">
                    <p>Remember your password? 
                        <a href="login.jsp" class="forgot-password">Login here</a>
                    </p>
                </div>
            </c:if>

            <!-- Try Another Email (Shown when reset link is displayed) -->
            <c:if test="${not empty resetLink}">
                <div class="alternate-actions">
                    <a href="forgot-password.jsp" class="forgot-password">
                        <i class="fas fa-envelope"></i>
                        Try Another Email
                    </a>
                    <span class="separator">|</span>
                    <a href="login.jsp" class="forgot-password">
                        <i class="fas fa-sign-in-alt"></i>
                        Back to Login
                    </a>
                </div>
            </c:if>

            <!-- Message Container -->
            <div class="message-container" id="messageContainer"></div>
        </div>
    </div>
</div>

<!-- Loading Overlay -->
<div class="loading-overlay" id="loadingOverlay">
    <div class="loading-spinner">
        <i class="fas fa-key"></i>
    </div>
    <p>Generating reset link...</p>
</div>

<script>
// Form enhancement
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        const container = input.closest('.input-container');
        const label = container?.querySelector('label');
        
        // Initial state
        if (input.value && input.value.trim() !== '') {
            label?.classList.add('active');
        }
        
        input.addEventListener('focus', () => {
            container?.classList.add('focused');
            label?.classList.add('active');
        });
        
        input.addEventListener('blur', () => {
            container?.classList.remove('focused');
            if (!input.value || input.value.trim() === '') {
                label?.classList.remove('active');
            }
        });
        
        input.addEventListener('input', () => {
            if (input.value && input.value.trim() !== '') {
                label?.classList.add('active');
            } else {
                label?.classList.remove('active');
            }
        });
    });
});

// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        showMessage('Reset link copied to clipboard!', 'success');
    }, function(err) {
        console.error('Could not copy text: ', err);
        showMessage('Failed to copy link. Please copy manually.', 'error');
    });
}

// Show message function
function showMessage(message, type) {
    const messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        messageContainer.textContent = message;
        messageContainer.className = `message-container show ${type}`;
        
        setTimeout(() => {
            messageContainer.classList.remove('show', 'success', 'error');
        }, 5000);
    }
}
</script>
</body>
</html>