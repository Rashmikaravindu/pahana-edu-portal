<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<%
    // Enhanced Security check - only cashiers and admins can access
    if (session.getAttribute("user") == null) {
        response.sendRedirect("login.jsp");
        return;
    }
    
    String userRole = (String) session.getAttribute("userRole");
    if (!"CASHIER".equals(userRole) && !"ADMIN".equals(userRole)) {
        response.sendRedirect("login.jsp");
        return;
    }
    
    String firstName = (String) session.getAttribute("userFirstName");
    String lastName = (String) session.getAttribute("userLastName");
    String userEmail = (String) session.getAttribute("userEmail");
    if (firstName == null) firstName = "Cashier";
    if (lastName == null) lastName = "";
    
    // Get context path for proper resource loading
    String contextPath = request.getContextPath();
    
    // Debug information for development
    boolean isDevelopment = "development".equals(getServletContext().getInitParameter("environment"));
%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pahana Edu - QR Scanning & Billing System</title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="<%= contextPath %>/favicon.ico">
    
    <!-- External Libraries -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- QR Code Scanner Library -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js"></script>
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="<%= contextPath %>/css/cashier-scan.css">
    
    <!-- Meta tags for better mobile experience -->
    <meta name="theme-color" content="#667eea">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="Pahana Edu Scanner">
    
    <!-- Preload critical resources -->
    <link rel="preload" href="<%= contextPath %>/js/cashier-scan.js" as="script">
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    
    <% if (isDevelopment) { %>
    <!-- Development Mode Styles -->
    <style>
        .dev-info {
            position: fixed;
            top: 0;
            right: 0;
            background: rgba(255, 0, 0, 0.8);
            color: white;
            padding: 5px 10px;
            font-size: 12px;
            z-index: 10000;
        }
    </style>
    <% } %>
</head>
<body>
    <% if (isDevelopment) { %>
    <div class="dev-info">DEV MODE</div>
    <% } %>
    
    <!-- Header -->
    <header class="cashier-header">
        <div class="logo">
            <i class="fas fa-cash-register"></i>
            <h1>Pahana Edu - QR Scanning System</h1>
        </div>
        <div class="cashier-info">
            <div class="cashier-name">
                <h3><%= firstName %> <%= lastName %></h3>
                <span><%= userRole.toLowerCase() %></span>
                <small style="display: block; color: #718096; font-size: 0.8rem;"><%= userEmail %></small>
            </div>
            <div class="cashier-avatar">
                <i class="fas fa-user"></i>
            </div>
        </div>
    </header>
    
    <!-- Main Content -->
    <div class="main-container">
        <!-- QR Scanning Section -->
        <section class="scan-section">
            <h2 class="section-title">
                <i class="fas fa-qrcode"></i>
                QR Code Scanner
            </h2>
            
            <!-- Scanner Controls -->
            <div class="scanner-controls">
                <button id="startScannerBtn" class="btn btn-primary" title="Start QR Scanner (F1)">
                    <i class="fas fa-camera"></i> Start Scanner
                </button>
                <button id="stopScannerBtn" class="btn btn-secondary hidden" title="Stop QR Scanner (F2)">
                    <i class="fas fa-stop"></i> Stop Scanner
                </button>
                <button id="resetBtn" class="btn btn-danger" title="Reset Scanner (ESC)">
                    <i class="fas fa-redo"></i> Reset
                </button>
            </div>
            
            <!-- QR Scanner Container -->
            <div class="qr-scanner-container" id="scannerContainer">
                <div class="scanner-overlay" id="scannerOverlay">
                    <i class="fas fa-camera fa-3x" style="margin-bottom: 1rem; color: #667eea;"></i>
                    <h3>QR Code Scanner Ready</h3>
                    <p>Click "Start Scanner" to begin scanning book reference QR codes</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem; color: #a0aec0;">
                        <strong>Shortcuts:</strong> F1 to start, F2 to stop, ESC to reset, F9 for debug
                    </p>
                </div>
                <div id="qrReader" style="width: 100%;"></div>
            </div>
            
            <!-- Manual Reference Input -->
            <div class="manual-scan">
                <input 
                    type="text" 
                    id="manualRefInput" 
                    placeholder="Enter reference number manually (e.g., BK202500001)" 
                    title="Enter reference number and press Enter"
                    autocomplete="off"
                    spellcheck="false"
                    maxlength="50"
                >
                <button id="manualSearchBtn" class="btn btn-primary">
                    <i class="fas fa-search"></i> Search
                </button>
            </div>
            
            <!-- Product Information Display -->
            <div class="product-info" id="productInfo">
                <!-- Product info will be loaded here dynamically -->
            </div>
            
            <!-- Scanning Tips and Help -->
            <div style="background: #f7fafc; border-radius: 10px; padding: 1rem; margin-top: 1rem; border-left: 4px solid #667eea;">
                <h4 style="color: #4a5568; margin-bottom: 0.5rem;">
                    <i class="fas fa-lightbulb" style="color: #667eea;"></i> Scanning Tips
                </h4>
                <ul style="color: #718096; font-size: 0.9rem; margin-left: 1rem; margin-bottom: 0;">
                    <li>Hold the QR code steady and ensure good lighting</li>
                    <li>Keep the QR code within the scanning area</li>
                    <li>Use manual input if scanning fails</li>
                    <li>Press ESC to reset if scanner gets stuck</li>
                    <li>Reference numbers are case-insensitive</li>
                </ul>
            </div>
        </section>
        
        <!-- Billing Section -->
        <section class="billing-section">
            <div class="bill-header">
                <h2 class="bill-title">
                    <i class="fas fa-receipt"></i>
                    Current Bill
                </h2>
                <button id="newBillBtn" class="btn btn-secondary" title="Start New Bill (Ctrl+N)">
                    <i class="fas fa-file-invoice"></i> New Bill
                </button>
            </div>
            
            <!-- Bill Items Container -->
            <div class="bill-items" id="billItems">
                <div class="empty-state">
                    <i class="fas fa-receipt" style="font-size: 3rem; color: #cbd5e1; display: block; text-align: center; margin: 2rem 0;"></i>
                    <p style="text-align: center; color: #94a3b8; font-weight: 500;">No items added to bill</p>
                    <p style="text-align: center; color: #94a3b8; font-size: 0.9em; margin-top: 0.5rem;">
                        Scan a QR code or enter a reference number to start
                    </p>
                </div>
            </div>
            
            <!-- Bill Summary -->
            <div class="bill-summary">
                <div class="summary-row">
                    <span><i class="fas fa-list-alt"></i> Subtotal:</span>
                    <span id="subtotal">₨ 0.00</span>
                </div>
                <div class="summary-row">
                    <span><i class="fas fa-percentage"></i> Tax (10%):</span>
                    <span id="tax">₨ 0.00</span>
                </div>
                <div class="summary-row total">
                    <span><i class="fas fa-calculator"></i> <strong>Total:</strong></span>
                    <span id="total"><strong>₨ 0.00</strong></span>
                </div>
            </div>
            
            <!-- Bill Actions -->
            <div class="bill-actions">
                <button id="printBillBtn" class="btn btn-success" disabled title="Print Bill (Ctrl+P)">
                    <i class="fas fa-print"></i> Print Bill
                </button>
                <button id="checkoutBtn" class="btn btn-primary" disabled>
                    <i class="fas fa-credit-card"></i> Checkout
                </button>
            </div>
            
            <!-- Quick Actions Info -->
            <div style="background: #f7fafc; border-radius: 10px; padding: 1rem; margin-top: 1rem; border-left: 4px solid #38a169;">
                <h4 style="color: #4a5568; margin-bottom: 0.5rem;">
                    <i class="fas fa-keyboard" style="color: #38a169;"></i> Keyboard Shortcuts
                </h4>
                <div style="color: #718096; font-size: 0.9rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem;">
                    <div><strong>F1:</strong> Start Scanner</div>
                    <div><strong>F2:</strong> Stop Scanner</div>
                    <div><strong>ESC:</strong> Reset</div>
                    <div><strong>Enter:</strong> Search</div>
                    <div><strong>Ctrl+N:</strong> New Bill</div>
                    <div><strong>Ctrl+P:</strong> Print</div>
                    <div><strong>F9:</strong> Debug Mode</div>
                </div>
            </div>
        </section>
    </div>
    
    <!-- Loading Overlay (Hidden by default) -->
    <div id="loadingOverlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 9999;">
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: white;">
            <i class="fas fa-spinner fa-spin fa-3x"></i>
            <p style="margin-top: 1rem; font-size: 1.2rem;">Processing...</p>
        </div>
    </div>
    
    <!-- Error Boundary (for handling JavaScript errors gracefully) -->
    <div id="errorBoundary" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); max-width: 400px; text-align: center; z-index: 10001;">
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e53e3e; margin-bottom: 1rem;"></i>
        <h3 style="color: #2d3748; margin-bottom: 1rem;">System Error</h3>
        <p style="color: #718096; margin-bottom: 1.5rem;">An unexpected error occurred. Please refresh the page to continue.</p>
        <button onclick="location.reload()" class="btn btn-primary">
            <i class="fas fa-refresh"></i> Refresh Page
        </button>
    </div>
    
    <!-- Hidden elements for system information -->
    <div id="systemInfo" style="display: none;">
        <span id="contextPath"><%= contextPath %></span>
        <span id="userRole"><%= userRole %></span>
        <span id="isDevelopment"><%= isDevelopment %></span>
    </div>
    
    <!-- Browser Compatibility Check -->
    <script>
        // Check for required features
        (function() {
            const requiredFeatures = [
                'fetch',
                'Promise',
                'addEventListener',
                'querySelector'
            ];
            
            const missingFeatures = requiredFeatures.filter(feature => 
                typeof window[feature] === 'undefined'
            );
            
            if (missingFeatures.length > 0) {
                alert('Your browser is not compatible with this application. Please use a modern browser like Chrome, Firefox, or Safari.');
                return;
            }
            
            // Check for camera access
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.warn('Camera access is not supported in this browser.');
            }
            
            // Check for QR scanner library
            let qrLibraryCheckCount = 0;
            const checkQrLibrary = setInterval(function() {
                qrLibraryCheckCount++;
                if (typeof Html5Qrcode !== 'undefined') {
                    clearInterval(checkQrLibrary);
                    console.log('✅ QR Scanner library loaded successfully');
                } else if (qrLibraryCheckCount > 50) { // 5 second timeout
                    clearInterval(checkQrLibrary);
                    console.error('❌ QR Scanner library failed to load');
                    alert('QR Scanner library failed to load. Please check your internet connection and refresh the page.');
                }
            }, 100);
        })();
    </script>
    
    <!-- Error handling for resource loading -->
    <script>
        window.addEventListener('error', function(e) {
            if (e.target !== window) {
                // Resource loading error
                console.error('Resource loading error:', e.target.src || e.target.href);
                
                if (e.target.tagName === 'SCRIPT' && e.target.src.includes('html5-qrcode')) {
                    alert('Failed to load QR Scanner library. Please check your internet connection and refresh the page.');
                }
            }
        });
        
        // Global error handler
        window.addEventListener('unhandledrejection', function(e) {
            console.error('Unhandled promise rejection:', e.reason);
        });
    </script>
    
    <!-- Network status monitoring -->
    <script>
        window.addEventListener('load', function() {
            // Monitor network status
            if ('onLine' in navigator) {
                if (!navigator.onLine) {
                    console.warn('⚠️ Application loaded while offline');
                }
            }
        });
    </script>
    
    <!-- Main JavaScript -->
    <script src="<%= contextPath %>/js/cashier-scan.js"></script>
    
    <!-- Development tools (only in development mode) -->
    <% if (isDevelopment) { %>
    <script>
        console.log('🛠️ Development mode enabled');
        console.log('📍 Context path:', '<%= contextPath %>');
        console.log('👤 User role:', '<%= userRole %>');
        console.log('📧 User email:', '<%= userEmail %>');
        
        // Add development helper functions
        window.devTools = {
            clearBill: () => {
                if (window.cashierSystem) {
                    window.cashierSystem.billItems.length = 0;
                    console.log('🗑️ Bill cleared');
                }
            },
            testNotification: (type) => {
                if (window.showNotification) {
                    window.showNotification(`Test ${type} notification`, type || 'info');
                }
            },
            getSystemStatus: () => {
                if (window.cashierSystem) {
                    return window.cashierSystem.performanceData;
                }
            }
        };
        
        console.log('🔧 Development tools available in window.devTools');
    </script>
    <% } %>
    
    <!-- Analytics or tracking code can be added here -->
    
    <!-- Service Worker Registration (optional - for offline capabilities) -->
    <script>
        // Register service worker for offline capabilities (optional enhancement)
        if ('serviceWorker' in navigator && '<%= userRole %>' === 'CASHIER') {
            window.addEventListener('load', function() {
                // Uncomment the following lines to enable service worker
                // navigator.serviceWorker.register('<%= contextPath %>/sw.js')
                //     .then(function(registration) {
                //         console.log('✅ ServiceWorker registration successful');
                //     })
                //     .catch(function(err) {
                //         console.log('❌ ServiceWorker registration failed');
                //     });
            });
        }
    </script>
    
</body>
</html>