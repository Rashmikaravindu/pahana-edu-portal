<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<%
    String token = request.getParameter("token");
    if (token == null || token.trim().isEmpty()) {
        response.sendRedirect("forgot-password.jsp");
        return;
    }
%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Pahana Edu - Reset Password</title>
<link rel="stylesheet" href="css/login.css">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
.reset-container {
    max-width: 450px;
    margin: 80px auto;
    padding: 40px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}

.reset-header {
    text-align: center;
    margin-bottom: 30px;
}

.reset-header i {
    font-size: 48px;
    color: #27AE60;
    margin-bottom: 20px;
}

.reset-header h2 {
    color: #2C3E50;
    font-size: 24px;
    margin-bottom: 10px;
}

.reset-header p {
    color: #7F8C8D;
    font-size: 14px;
}

.password-requirements {
    background: #F8F9FA;
    border-radius: 8px;
    padding: 15px;
    margin: 20px 0;
    font-size: 14px;
}

.password-requirements h4 {
    color: #2C3E50;
    margin-bottom: 10px;
    font-size: 14px;
}

.password-requirements ul {
    margin: 0;
    padding-left: 20px;
    color: #7F8C8D;
}

.password-requirements li {
    margin-bottom: 5px;
}

.server-error-message {
    background: #FFE6E6;
    border: 1px solid #FF6B6B;
    border-radius: 8px;
    padding: 15px;
    margin: 20px 0;
    color: #C92A2A;
    font-size: 14px;
}

.server-success-message {
    background: #E8F5E8;
    border: 1px solid #27AE60;
    border-radius: 8px;
    padding: 15px;
    margin: 20px 0;
    color: #27AE60;
    font-size: 14px;
}

.server-error-message i,
.server-success-message i {
    margin-right: 8px;
}
</style>
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

    <div class="reset-container">
        <div class="reset-header">
            <i class="fas fa-lock"></i>
            <h2>Set New Password</h2>
            <p>Enter your new password below</p>
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

        <form action="reset-password" method="post" class="auth-form">
            <input type="hidden" name="token" value="<c:out value='${param.token}'/>" />

            <div class="input-group">
                <div class="input-container">
                    <i class="fas fa-lock input-icon"></i>
                    <input type="password" id="password" name="password" required minlength="6">
                    <label for="password">New Password</label>
                    <button type="button" class="toggle-password" onclick="togglePassword('password')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <div class="input-underline"></div>
                </div>
            </div>

            <div class="input-group">
                <div class="input-container">
                    <i class="fas fa-lock input-icon"></i>
                    <input type="password" id="confirmPassword" name="confirmPassword" required minlength="6">
                    <label for="confirmPassword">Confirm New Password</label>
                    <button type="button" class="toggle-password" onclick="togglePassword('confirmPassword')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <div class="input-underline"></div>
                </div>
            </div>

            <div class="password-requirements">
                <h4><i class="fas fa-info-circle"></i> Password Requirements:</h4>
                <ul>
                    <li>At least 6 characters long</li>
                    <li>Use a mix of letters and numbers</li>
                    <li>Avoid common passwords</li>
                </ul>
            </div>

            <button type="submit" class="submit-btn">
                <i class="fas fa-check-circle"></i>
                Update Password
            </button>
        </form>

        <div style="text-align: center; margin-top: 20px;">
            <a href="login.jsp" style="color: #3498DB; text-decoration: none; font-size: 14px;">
                <i class="fas fa-arrow-left"></i>
                Back to Login
            </a>
        </div>
    </div>
</div>

<script>
// Password toggle function
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggleBtn = input.parentNode.querySelector('.toggle-password');
    const icon = toggleBtn.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Simple form validation and animation
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    
    // Input animations
    const inputs = document.querySelectorAll('input[type="password"]');
    inputs.forEach(input => {
        const container = input.closest('.input-container');
        const label = container?.querySelector('label');
        
        input.addEventListener('focus', () => {
            container?.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            container?.classList.remove('focused');
        });
        
        input.addEventListener('input', () => {
            if (input.value) {
                label?.classList.add('active');
            } else {
                label?.classList.remove('active');
            }
        });
    });
    
    // Form validation
    form.addEventListener('submit', function(e) {
        if (password.value !== confirmPassword.value) {
            e.preventDefault();
            alert('Passwords do not match!');
            return false;
        }
        
        if (password.value.length < 6) {
            e.preventDefault();
            alert('Password must be at least 6 characters long!');
            return false;
        }
    });
});
</script>
</body>
</html>