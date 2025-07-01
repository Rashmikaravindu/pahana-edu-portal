// LOGIN.JS - Pahana Edu Customer Portal Interactive Functions

// Global Variables
let currentForm = 'login';
let passwordStrengthShown = false;

// DOM Elements
const loginToggle = document.getElementById('loginToggle');
const signupToggle = document.getElementById('signupToggle');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginFormElement = document.getElementById('loginFormElement');
const signupFormElement = document.getElementById('signupFormElement');
const messageContainer = document.getElementById('messageContainer');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pahana Edu Customer Portal - Initializing...');
    
    // Check if all required elements exist
    if (!validateDOMElements()) {
        console.error('Required DOM elements not found');
        return;
    }
    
    initializeEventListeners();
    setupInputAnimations();
    setupPasswordStrength();
    addFormAnimations();
    enhanceAutocomplete();
    enhanceAccessibility();
    
    // Add entrance animations
    setTimeout(() => {
        const formContainer = document.querySelector('.form-container');
        if (formContainer) {
            formContainer.classList.add('slide-in');
        }
    }, 300);
    
    console.log('Pahana Edu Customer Portal - JavaScript Loaded Successfully');
});

// Validate DOM Elements
function validateDOMElements() {
    const requiredElements = [
        'loginToggle', 'signupToggle', 'loginForm', 'signupForm',
        'loginFormElement', 'signupFormElement', 'messageContainer', 'loadingOverlay'
    ];
    
    for (const elementId of requiredElements) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Required element not found: ${elementId}`);
            return false;
        }
    }
    return true;
}

// Event Listeners Setup
function initializeEventListeners() {
    try {
        // Form toggle buttons
        loginToggle.addEventListener('click', () => switchForm('login'));
        signupToggle.addEventListener('click', () => switchForm('signup'));
        
        // Form submissions
        loginFormElement.addEventListener('submit', handleLogin);
        signupFormElement.addEventListener('submit', handleSignup);
        
        // Input focus animations
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', handleInputFocus);
            input.addEventListener('blur', handleInputBlur);
            input.addEventListener('input', handleInputChange);
        });
        
        // Password strength monitoring
        const signupPassword = document.getElementById('signupPassword');
        if (signupPassword) {
            signupPassword.addEventListener('input', debouncedPasswordStrength);
        }
        
        // Confirm password validation
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', validatePasswordMatch);
        }
        
        // Email validation
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', validateEmail);
        });
        
        // Phone validation
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('blur', validatePhoneInput);
            phoneInput.addEventListener('input', formatPhoneInput);
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
        
    } catch (error) {
        console.error('Error initializing event listeners:', error);
    }
}

// Form Switching
function switchForm(formType) {
    if (currentForm === formType) return;
    
    try {
        // Update toggle buttons
        loginToggle.classList.toggle('active', formType === 'login');
        signupToggle.classList.toggle('active', formType === 'signup');
        
        // Switch forms with animation
        if (formType === 'login') {
            signupForm.style.transform = 'translateX(100%)';
            signupForm.style.opacity = '0';
            
            setTimeout(() => {
                signupForm.classList.add('hidden');
                loginForm.classList.remove('hidden');
                loginForm.style.transform = 'translateX(-100%)';
                loginForm.style.opacity = '0';
                
                setTimeout(() => {
                    loginForm.style.transform = 'translateX(0)';
                    loginForm.style.opacity = '1';
                }, 50);
            }, 300);
        } else {
            loginForm.style.transform = 'translateX(-100%)';
            loginForm.style.opacity = '0';
            
            setTimeout(() => {
                loginForm.classList.add('hidden');
                signupForm.classList.remove('hidden');
                signupForm.style.transform = 'translateX(100%)';
                signupForm.style.opacity = '0';
                
                setTimeout(() => {
                    signupForm.style.transform = 'translateX(0)';
                    signupForm.style.opacity = '1';
                }, 50);
            }, 300);
        }
        
        currentForm = formType;
        clearMessages();
        resetFormValidation();
        
        // Focus first input of active form
        setTimeout(() => {
            const activeForm = formType === 'login' ? loginForm : signupForm;
            const firstInput = activeForm.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 350);
        
    } catch (error) {
        console.error('Error switching forms:', error);
    }
}

// Input Animations and Validation
function setupInputAnimations() {
    const inputContainers = document.querySelectorAll('.input-container');
    
    inputContainers.forEach(container => {
        const input = container.querySelector('input');
        const label = container.querySelector('label');
        
        if (input && label) {
            // Initial state check
            if (input.value) {
                label.classList.add('active');
            }
        }
    });
}

function handleInputFocus(event) {
    const container = event.target.closest('.input-container');
    if (container) {
        container.classList.add('focused');
        addRippleEffect(container);
    }
}

function handleInputBlur(event) {
    const container = event.target.closest('.input-container');
    if (container) {
        container.classList.remove('focused');
    }
    
    // Validate input on blur
    validateInput(event.target);
}

function handleInputChange(event) {
    const input = event.target;
    const container = input.closest('.input-container');
    
    if (container) {
        const label = container.querySelector('label');
        
        // Handle label animation
        if (label) {
            if (input.value) {
                label.classList.add('active');
            } else {
                label.classList.remove('active');
            }
        }
        
        // Real-time validation for touched inputs
        if (input.dataset.touched) {
            validateInput(input);
        }
    }
}

function addRippleEffect(container) {
    try {
        const ripple = document.createElement('div');
        ripple.className = 'input-ripple';
        container.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple && ripple.parentNode) {
                ripple.remove();
            }
        }, 600);
    } catch (error) {
        console.warn('Error adding ripple effect:', error);
    }
}

// Validation Functions
function validateInput(input) {
    if (!input) return false;
    
    input.dataset.touched = 'true';
    let isValid = true;
    let errorMessage = '';
    
    // Remove previous validation classes
    input.classList.remove('valid', 'invalid');
    clearFieldError(input);
    
    // Required field validation
    if (input.hasAttribute('required') && !input.value.trim()) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Email validation
    else if (input.type === 'email' && input.value) {
        isValid = validateEmailFormat(input.value);
        if (!isValid) errorMessage = 'Please enter a valid email address';
    }
    
    // Password validation
    else if (input.type === 'password' && input.value) {
        if (input.id === 'confirmPassword') {
            const password = document.getElementById('signupPassword');
            isValid = password && input.value === password.value;
            if (!isValid) errorMessage = 'Passwords do not match';
        } else if (input.id === 'signupPassword') {
            isValid = input.value.length >= 6;
            if (!isValid) errorMessage = 'Password must be at least 6 characters';
        } else if (input.id === 'loginPassword') {
            isValid = input.value.length > 0;
            if (!isValid) errorMessage = 'Password is required';
        }
    }
    
    // Name validation
    else if ((input.id === 'firstName' || input.id === 'lastName') && input.value) {
        isValid = input.value.length >= 2 && /^[a-zA-Z\s]+$/.test(input.value);
        if (!isValid) errorMessage = 'Name must be at least 2 characters and contain only letters';
    }
    
    // Phone validation
    else if (input.id === 'phone' && input.value) {
        isValid = validatePhoneNumber(input.value);
        if (!isValid) errorMessage = 'Please enter a valid 10-digit phone number';
    }
    
    // Apply validation styles
    input.classList.add(isValid ? 'valid' : 'invalid');
    
    // Show error message if invalid
    if (!isValid && errorMessage) {
        showFieldError(input, errorMessage);
    }
    
    return isValid;
}

function validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateEmail(event) {
    const input = event.target;
    if (input.value) {
        const isValid = validateEmailFormat(input.value);
        input.classList.toggle('valid', isValid);
        input.classList.toggle('invalid', !isValid);
        
        if (!isValid) {
            showFieldError(input, 'Please enter a valid email address');
        } else {
            clearFieldError(input);
        }
    }
}

// Phone Number Validation
function validatePhoneNumber(phone) {
    // Remove any non-digit characters
    const cleanedPhone = phone.replace(/\D/g, '');
    
    // Check if phone number has exactly 10 digits
    return cleanedPhone.length === 10;
}

function formatPhoneInput(event) {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    
    // Limit to 10 digits
    value = value.substring(0, 10);
    
    // Format as 077-123-4567 if more than 3 digits
    if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d{3})/, '$1-$2');
    }
    
    input.value = value;
}

function validatePhoneInput(event) {
    const input = event.target;
    if (input.value) {
        const isValid = validatePhoneNumber(input.value);
        input.classList.toggle('valid', isValid);
        input.classList.toggle('invalid', !isValid);
        
        if (!isValid) {
            showFieldError(input, 'Please enter a valid 10-digit phone number');
        } else {
            clearFieldError(input);
        }
    }
}

function validatePasswordMatch() {
    const password = document.getElementById('signupPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (confirmPassword && confirmPassword.value && password) {
        const isValid = password.value === confirmPassword.value;
        confirmPassword.classList.toggle('valid', isValid);
        confirmPassword.classList.toggle('invalid', !isValid);
        
        if (!isValid) {
            showFieldError(confirmPassword, 'Passwords do not match');
        } else {
            clearFieldError(confirmPassword);
        }
    }
}

// Password Strength Checker
function setupPasswordStrength() {
    const strengthContainer = document.querySelector('.password-strength');
    if (strengthContainer) {
        strengthContainer.style.display = 'none';
    }
}

function checkPasswordStrength(event) {
    const password = event.target.value;
    const strengthContainer = document.querySelector('.password-strength');
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthContainer || !strengthFill || !strengthText) return;
    
    if (!password) {
        strengthContainer.style.display = 'none';
        return;
    }
    
    strengthContainer.style.display = 'block';
    
    // Calculate strength
    let strength = 0;
    let strengthLabel = 'Very Weak';
    
    // Length checks
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Determine strength level
    strengthFill.className = 'strength-fill';
    
    if (strength <= 2) {
        strengthFill.classList.add('weak');
        strengthLabel = 'Weak';
    } else if (strength <= 3) {
        strengthFill.classList.add('fair');
        strengthLabel = 'Fair';
    } else if (strength <= 4) {
        strengthFill.classList.add('good');
        strengthLabel = 'Good';
    } else {
        strengthFill.classList.add('strong');
        strengthLabel = 'Strong';
    }
    
    strengthText.textContent = `Password strength: ${strengthLabel}`;
    
    // Validate password
    validateInput(event.target);
}

// Password Toggle
function togglePassword(inputId) {
    try {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        const toggleBtn = input.parentNode.querySelector('.toggle-password');
        if (!toggleBtn) return;
        
        const icon = toggleBtn.querySelector('i');
        if (!icon) return;
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
        
        // Add animation
        toggleBtn.style.transform = 'scale(0.8)';
        setTimeout(() => {
            toggleBtn.style.transform = 'scale(1)';
        }, 150);
        
    } catch (error) {
        console.error('Error toggling password:', error);
    }
}

// Make togglePassword globally available
window.togglePassword = togglePassword;

// Form Submission Handlers
async function handleLogin(event) {
    event.preventDefault();
    
    try {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Basic validation
        if (!email || !password) {
            showMessage('Please fill in all required fields', 'error');
            return;
        }
        
        // Validate form
        const isValid = validateLoginForm();
        if (!isValid) {
            showMessage('Please fill in all required fields correctly', 'error');
            return;
        }
        
        // Show loading
        showLoading();
        
        // Create URL encoded form data
        const params = new URLSearchParams();
        params.append('email', email);
        params.append('password', password);
        params.append('rememberMe', rememberMe ? 'true' : 'false');
        
        console.log('Sending login request for:', email);
        
        // Make AJAX request to login servlet
        const response = await fetch('login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        });
        
        console.log('Login response status:', response.status);
        
        // Always try to parse JSON response, even for error status codes
        let result;
        try {
            result = await response.json();
            console.log('Login result:', result);
        } catch (jsonError) {
            console.error('Failed to parse JSON response:', jsonError);
            throw new Error(`Server communication error! Status: ${response.status}`);
        }
        
        if (result.success) {
            // Success - redirect based on role
            const userRole = result.role || 'CUSTOMER';
            const redirectUrl = result.redirectUrl || 'index2.jsp';
            
            showMessage(result.message || 'Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 2000);
        } else {
            // Show error message - this will handle inactive account messages properly
            const errorMessage = result.message || 'Login failed. Please check your credentials.';
            showMessage(errorMessage, 'error');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function handleSignup(event) {
    event.preventDefault();
    
    try {
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        // Basic validation
        if (!firstName || !lastName || !phone || !email || !password || !confirmPassword) {
            showMessage('Please fill in all required fields', 'error');
            return;
        }
        
        // Password match validation
        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }
        
        // Phone validation
        if (!validatePhoneNumber(phone)) {
            showMessage('Please enter a valid phone number (10 digits)', 'error');
            return;
        }
        
        // Terms agreement validation
        if (!agreeTerms) {
            showMessage('Please agree to terms and conditions', 'error');
            return;
        }
        
        // Validate entire form
        const isValid = validateSignupForm();
        if (!isValid) {
            showMessage('Please fill in all fields correctly and agree to terms', 'error');
            return;
        }
        
        // Show loading
        showLoading();
        
        // Create URL encoded form data
        const params = new URLSearchParams();
        params.append('firstName', firstName);
        params.append('lastName', lastName);
        params.append('phone', phone);
        params.append('email', email);
        params.append('password', password);
        params.append('confirmPassword', confirmPassword);
        
        console.log('Sending signup request for:', email);
        
        // Make AJAX request to signup servlet
        const response = await fetch('signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        });
        
        console.log('Signup response status:', response.status);
        
        // Always try to parse JSON response
        let result;
        try {
            result = await response.json();
            console.log('Signup result:', result);
        } catch (jsonError) {
            console.error('Failed to parse JSON response:', jsonError);
            throw new Error(`Server communication error! Status: ${response.status}`);
        }
        
        if (result.success) {
            // Success - redirect to customer dashboard
            const redirectUrl = result.redirectUrl || 'index2.jsp';
            showMessage(result.message || 'Account created successfully! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 2000);
        } else {
            // Show error message
            showMessage(result.message || 'Signup failed. Please try again.', 'error');
        }
        
    } catch (error) {
        console.error('Signup error:', error);
        showMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Form Validation
function validateLoginForm() {
    const email = document.getElementById('loginEmail');
    const password = document.getElementById('loginPassword');
    
    let isValid = true;
    
    if (!validateInput(email)) isValid = false;
    if (!validateInput(password)) isValid = false;
    
    return isValid;
}

function validateSignupForm() {
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const phone = document.getElementById('phone');
    const email = document.getElementById('signupEmail');
    const password = document.getElementById('signupPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const agreeTerms = document.getElementById('agreeTerms');
    
    let isValid = true;
    
    if (!validateInput(firstName)) isValid = false;
    if (!validateInput(lastName)) isValid = false;
    if (!validateInput(phone)) isValid = false;
    if (!validateInput(email)) isValid = false;
    if (!validateInput(password)) isValid = false;
    if (!validateInput(confirmPassword)) isValid = false;
    if (!agreeTerms || !agreeTerms.checked) isValid = false;
    
    return isValid;
}

function resetFormValidation() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.classList.remove('valid', 'invalid');
        delete input.dataset.touched;
        clearFieldError(input);
    });
}

// Message Display - Enhanced to handle multiline messages
function showMessage(message, type) {
    if (messageContainer) {
        // Handle multiline messages by converting \n to <br>
        const formattedMessage = message.replace(/\n/g, '<br>');
        messageContainer.innerHTML = formattedMessage;
        messageContainer.className = `message-container show ${type}`;
        
        // Auto hide after longer time for longer messages
        const hideDelay = message.length > 100 ? 10000 : 5000;
        setTimeout(() => {
            clearMessages();
        }, hideDelay);
    }
}

function clearMessages() {
    if (messageContainer) {
        messageContainer.classList.remove('show', 'success', 'error');
        messageContainer.innerHTML = '';
    }
}

function showFieldError(input, message) {
    if (!input) return;
    
    // Remove existing error
    clearFieldError(input);
    
    // Create error element
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #D00000;
        font-size: 12px;
        margin-top: 4px;
        animation: fadeIn 0.3s ease;
    `;
    
    // Insert after input container
    const container = input.closest('.input-group');
    if (container) {
        container.appendChild(errorElement);
    }
}

function clearFieldError(input) {
    if (!input) return;
    
    const container = input.closest('.input-group');
    if (container) {
        const existingError = container.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
}

// Loading Functions
function showLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.add('show');
    }
}

function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.remove('show');
    }
}

// Animation Functions
function addFormAnimations() {
    try {
        // Add entrance animations to form elements
        const animatedElements = document.querySelectorAll('.input-group, .form-options, .submit-btn');
        
        animatedElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.5s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 100 * (index + 1));
        });
    } catch (error) {
        console.warn('Error adding form animations:', error);
    }
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(event) {
    // Enter key submission
    if (event.key === 'Enter' && !event.shiftKey) {
        const activeForm = currentForm === 'login' ? loginFormElement : signupFormElement;
        const submitBtn = activeForm?.querySelector('.submit-btn');
        
        if (document.activeElement.tagName === 'INPUT' && submitBtn) {
            event.preventDefault();
            submitBtn.click();
        }
    }
    
    // Escape key to clear messages
    if (event.key === 'Escape') {
        clearMessages();
    }
    
    // Tab between login/signup forms (Ctrl+1 for login, Ctrl+2 for signup)
    if (event.ctrlKey) {
        if (event.key === '1') {
            event.preventDefault();
            switchForm('login');
        } else if (event.key === '2') {
            event.preventDefault();
            switchForm('signup');
        }
    }
}

// Auto-complete enhancements
function enhanceAutocomplete() {
    try {
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.setAttribute('autocomplete', 'email');
        });
        
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            if (input.id.includes('signup') || input.id.includes('new')) {
                input.setAttribute('autocomplete', 'new-password');
            } else {
                input.setAttribute('autocomplete', 'current-password');
            }
        });
        
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const phoneInput = document.getElementById('phone');
        
        if (firstNameInput) firstNameInput.setAttribute('autocomplete', 'given-name');
        if (lastNameInput) lastNameInput.setAttribute('autocomplete', 'family-name');
        if (phoneInput) phoneInput.setAttribute('autocomplete', 'tel');
        
    } catch (error) {
        console.warn('Error enhancing autocomplete:', error);
    }
}

// Accessibility enhancements
function enhanceAccessibility() {
    try {
        // Add ARIA labels
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            const label = input.parentNode.querySelector('label');
            if (label) {
                input.setAttribute('aria-describedby', `${input.id}-label`);
                label.id = `${input.id}-label`;
            }
        });
        
        // Add focus management for toggle buttons
        const toggleBtns = document.querySelectorAll('.toggle-btn');
        toggleBtns.forEach(btn => {
            btn.setAttribute('role', 'tab');
            btn.setAttribute('aria-selected', btn.classList.contains('active'));
        });
        
        // Add form role attributes
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => {
            form.setAttribute('role', 'form');
        });
        
    } catch (error) {
        console.warn('Error enhancing accessibility:', error);
    }
}

// Utility Functions
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

// Apply debouncing to password strength check
const debouncedPasswordStrength = debounce(checkPasswordStrength, 300);

// Error handling for uncaught errors
window.addEventListener('error', function(event) {
    console.error('Uncaught error:', event.error);
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});

console.log('Pahana Edu Customer Portal - JavaScript Loaded Successfully');