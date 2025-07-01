package com.pahanaedu.servlets;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import com.pahanaedu.dao.UserDAO;
import com.pahanaedu.models.User;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    // Admin credentials configuration
    private static final String ADMIN_EMAIL = "admin@pahanaedu.lk";
    private static final String ADMIN_PASSWORD = "admin123";
    private static final String ADMIN_FIRST_NAME = "System";
    private static final String ADMIN_LAST_NAME = "Administrator";
    private static final String ADMIN_PHONE = "0112345678";
    
    private UserDAO userDAO;
    
    @Override
    public void init() throws ServletException {
        try {
            userDAO = new UserDAO();
            System.out.println("LoginServlet: UserDAO initialized successfully");
        } catch (Exception e) {
            System.err.println("LoginServlet: Failed to initialize UserDAO - " + e.getMessage());
            e.printStackTrace();
            throw new ServletException("Failed to initialize UserDAO", e);
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Set response headers for proper JSON handling
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");
        
        PrintWriter out = null;
        
        try {
            out = response.getWriter();
            
            // Extract and validate parameters
            String email = request.getParameter("email");
            String password = request.getParameter("password");
            String rememberMe = request.getParameter("rememberMe");
            
            System.out.println("LoginServlet: Processing login request");
            System.out.println("LoginServlet: Email received: " + (email != null ? email : "null"));
            System.out.println("LoginServlet: Password received: " + (password != null && !password.isEmpty() ? "[PROVIDED]" : "[EMPTY]"));
            System.out.println("LoginServlet: RememberMe: " + rememberMe);
            
            // Input validation
            if (email == null || email.trim().isEmpty()) {
                sendErrorResponse(response, out, HttpServletResponse.SC_BAD_REQUEST, 
                    "Email address is required");
                return;
            }
            
            if (password == null || password.trim().isEmpty()) {
                sendErrorResponse(response, out, HttpServletResponse.SC_BAD_REQUEST, 
                    "Password is required");
                return;
            }
            
            email = email.trim().toLowerCase();
            
            // Check if UserDAO is available
            if (userDAO == null) {
                System.err.println("LoginServlet: UserDAO is null - reinitializing");
                try {
                    userDAO = new UserDAO();
                } catch (Exception e) {
                    System.err.println("LoginServlet: Failed to reinitialize UserDAO - " + e.getMessage());
                    sendErrorResponse(response, out, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                        "Database connection error. Please try again later.");
                    return;
                }
            }
            
            // Admin authentication check
            if (ADMIN_EMAIL.equalsIgnoreCase(email)) {
                handleAdminLogin(email, password, request, response, out, rememberMe);
                return;
            }
            
            // Regular user authentication
            authenticateRegularUser(email, password, request, response, out, rememberMe);
            
        } catch (Exception e) {
            System.err.println("LoginServlet: Unexpected error during login");
            e.printStackTrace();
            
            if (out != null) {
                sendErrorResponse(response, out, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                    "An unexpected error occurred. Please try again later.");
            }
        } finally {
            if (out != null) {
                try {
                    out.close();
                } catch (Exception e) {
                    System.err.println("LoginServlet: Error closing PrintWriter - " + e.getMessage());
                }
            }
        }
    }
    
    private void handleAdminLogin(String email, String password, 
                                  HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  PrintWriter out,
                                  String rememberMe) throws IOException {
        
        System.out.println("LoginServlet: Processing admin login attempt");
        
        if (!ADMIN_PASSWORD.equals(password)) {
            System.out.println("LoginServlet: Admin login failed - incorrect password");
            sendErrorResponse(response, out, HttpServletResponse.SC_UNAUTHORIZED, 
                "Invalid email or password");
            return;
        }
        
        try {
            // Create admin user object
            User adminUser = new User();
            adminUser.setId(-1);
            adminUser.setFirstName(ADMIN_FIRST_NAME);
            adminUser.setLastName(ADMIN_LAST_NAME);
            adminUser.setEmail(ADMIN_EMAIL);
            adminUser.setPhone(ADMIN_PHONE);
            adminUser.setRole(User.ROLE_ADMIN);
            adminUser.setStatus(User.STATUS_ACTIVE);
            
            // Configure session
            configureSession(request, adminUser, true, rememberMe);
            
            System.out.println("LoginServlet: Admin login successful for: " + email);
            
            // Send success response
            sendSuccessResponse(response, out, "Admin login successful!", 
                "ADMIN", "admin-dashboard.jsp");
                
        } catch (Exception e) {
            System.err.println("LoginServlet: Error during admin login - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, out, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                "Login processing error. Please try again.");
        }
    }
    
    private void authenticateRegularUser(String email, String password, 
                                        HttpServletRequest request, 
                                        HttpServletResponse response, 
                                        PrintWriter out,
                                        String rememberMe) throws IOException {
        
        System.out.println("LoginServlet: Processing regular user login for: " + email);
        
        try {
            // Validate user credentials
            User user = userDAO.validateLogin(email, password);
            
            if (user == null) {
                System.out.println("LoginServlet: User authentication failed for: " + email);
                sendErrorResponse(response, out, HttpServletResponse.SC_UNAUTHORIZED, 
                    "Invalid email or password");
                return;
            }
            
            // ENHANCED STATUS CHECK - This is the main update
            if (!isUserAccountActive(user)) {
                System.out.println("LoginServlet: User account is inactive - Email: " + email + ", Status: " + user.getStatus());
                
                // Send customized message based on role and status
                String message;
                
                if ("CASHIER".equalsIgnoreCase(user.getRole())) {
                    message = "🔒 Your Cashier Account is Deactivated!\n\n" +
                             "Your account has been deactivated by system administrator. " +
                             "Please contact the administrator to reactivate your account.\n\n" +
                             "📞 Support: admin@pahanaedu.lk";
                } else {
                    message = "🔒 Your Customer Account is Deactivated!\n\n" +
                             "Your account has been temporarily deactivated. " +
                             "Please contact our support team to reactivate your account.\n\n" +
                             "📞 Support: 0112345678 | admin@pahanaedu.lk";
                }
                
                sendErrorResponse(response, out, HttpServletResponse.SC_FORBIDDEN, message);
                return;
            }
            
            // Configure session
            configureSession(request, user, false, rememberMe);
            
            // Determine redirect URL based on role
            String redirectUrl = determineRedirectUrl(user.getRole());
            
            System.out.println("LoginServlet: User login successful - Email: " + email + 
                             ", Role: " + user.getRole() + ", Status: " + user.getStatus() + 
                             ", Redirect: " + redirectUrl);
            
            // Send success response with role-based message
            String successMessage;
            
            if ("CASHIER".equalsIgnoreCase(user.getRole())) {
                successMessage = "Cashier login successful! Redirecting to dashboard...";
            } else {
                successMessage = "Login successful! Redirecting to dashboard...";
            }
            
            sendSuccessResponse(response, out, successMessage, user.getRole(), redirectUrl);
                
        } catch (Exception e) {
            System.err.println("LoginServlet: Error during user authentication - " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, out, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                "Authentication error. Please try again later.");
        }
    }
    
    /**
     * Enhanced method to check if user account is active
     * Checks both the status field and user active state
     */
    private boolean isUserAccountActive(User user) {
        if (user == null) {
            return false;
        }
        
        // Check database status field (primary check)
        String status = user.getStatus();
        if (status == null || !"active".equalsIgnoreCase(status.trim())) {
            System.out.println("LoginServlet: User account inactive - Status: " + status);
            return false;
        }
        
        // Check user's isActive method (secondary check for backward compatibility)
        if (!user.isActive()) {
            System.out.println("LoginServlet: User account inactive - isActive() returned false");
            return false;
        }
        
        return true;
    }
    
    private String determineRedirectUrl(String role) {
        if (role == null) {
            return "index2.jsp";
        }
        
        switch (role.toUpperCase()) {
            case "ADMIN":
                return "admin-dashboard.jsp";
            case "CASHIER":
                return "cashier-dashboard.jsp";
            case "CUSTOMER":
            default:
                return "index2.jsp";
        }
    }
    
    private void configureSession(HttpServletRequest request, User user, 
                                 boolean isAdmin, String rememberMe) {
        
        System.out.println("LoginServlet: Configuring session for user: " + user.getEmail());
        
        try {
            // Get current session and invalidate if exists
            HttpSession oldSession = request.getSession(false);
            if (oldSession != null) {
                oldSession.invalidate();
            }
            
            // Create new session
            HttpSession session = request.getSession(true);
            
            // Set user information in session
            session.setAttribute("user", user);
            session.setAttribute("userId", user.getId());
            session.setAttribute("userEmail", user.getEmail());
            session.setAttribute("userName", user.getFullName());
            session.setAttribute("userRole", user.getRole());
            session.setAttribute("userFirstName", user.getFirstName());
            session.setAttribute("userLastName", user.getLastName());
            session.setAttribute("userPhone", user.getPhone());
            session.setAttribute("userStatus", user.getStatus());
            session.setAttribute("isAdmin", isAdmin);
            session.setAttribute("isLoggedIn", true);
            session.setAttribute("loginTime", System.currentTimeMillis());
            
            // Handle remember me functionality
            boolean rememberMeEnabled = "on".equals(rememberMe) || 
                                      "true".equals(rememberMe) || 
                                      "1".equals(rememberMe);
            
            if (rememberMeEnabled) {
                // Extended session (7 days)
                session.setMaxInactiveInterval(7 * 24 * 60 * 60);
                session.setAttribute("rememberMe", true);
                System.out.println("LoginServlet: Extended session configured (7 days)");
            } else {
                // Standard session (30 minutes)
                session.setMaxInactiveInterval(30 * 60);
                session.setAttribute("rememberMe", false);
                System.out.println("LoginServlet: Standard session configured (30 minutes)");
            }
            
            System.out.println("LoginServlet: Session configured successfully");
            System.out.println("LoginServlet: Session ID: " + session.getId());
            System.out.println("LoginServlet: Session timeout: " + session.getMaxInactiveInterval() + " seconds");
            
        } catch (Exception e) {
            System.err.println("LoginServlet: Error configuring session - " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Session configuration failed", e);
        }
    }
    
    /**
     * Simple success response method - English only
     */
    private void sendSuccessResponse(HttpServletResponse response, PrintWriter out, 
                                   String message, String role, String redirectUrl) {
        response.setStatus(HttpServletResponse.SC_OK);
        
        String jsonResponse = String.format(
            "{\"success\": true, \"message\": \"%s\", \"role\": \"%s\", \"redirectUrl\": \"%s\"}",
            escapeJsonString(message),
            escapeJsonString(role),
            escapeJsonString(redirectUrl)
        );
        
        out.print(jsonResponse);
        out.flush();
        
        System.out.println("LoginServlet: Success response sent - " + jsonResponse);
    }
    
    /**
     * Simple error response method - English only
     */
    private void sendErrorResponse(HttpServletResponse response, PrintWriter out, 
                                 int statusCode, String message) {
        response.setStatus(statusCode);
        
        String jsonResponse = String.format(
            "{\"success\": false, \"message\": \"%s\", \"statusCode\": %d}",
            escapeJsonString(message),
            statusCode
        );
        
        out.print(jsonResponse);
        out.flush();
        
        System.out.println("LoginServlet: Error response sent - " + jsonResponse);
    }
    
    private String escapeJsonString(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                 .replace("\"", "\\\"")
                 .replace("\n", "\\n")
                 .replace("\r", "\\r")
                 .replace("\t", "\\t");
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        System.out.println("LoginServlet: GET request received");
        
        try {
            // Check if user is already logged in
            HttpSession session = request.getSession(false);
            if (session != null && Boolean.TRUE.equals(session.getAttribute("isLoggedIn"))) {
                String userRole = (String) session.getAttribute("userRole");
                String redirectUrl = determineRedirectUrl(userRole);
                
                System.out.println("LoginServlet: User already logged in, redirecting to: " + redirectUrl);
                response.sendRedirect(redirectUrl);
                return;
            }
            
            // Redirect to login page
            System.out.println("LoginServlet: No active session, redirecting to login page");
            response.sendRedirect("login.jsp");
            
        } catch (Exception e) {
            System.err.println("LoginServlet: Error in doGet - " + e.getMessage());
            e.printStackTrace();
            response.sendRedirect("login.jsp");
        }
    }
    
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = null;
        
        try {
            out = response.getWriter();
            
            HttpSession session = request.getSession(false);
            if (session != null) {
                String userEmail = (String) session.getAttribute("userEmail");
                System.out.println("LoginServlet: User logging out: " + userEmail);
                session.invalidate();
            }
            
            sendSuccessResponse(response, out, 
                "Logged out successfully!", "", "login.jsp");
            
        } catch (Exception e) {
            System.err.println("LoginServlet: Error during logout - " + e.getMessage());
            e.printStackTrace();
            
            if (out != null) {
                sendErrorResponse(response, out, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                    "Logout error occurred");
            }
        } finally {
            if (out != null) {
                try {
                    out.close();
                } catch (Exception e) {
                    System.err.println("LoginServlet: Error closing PrintWriter during logout - " + e.getMessage());
                }
            }
        }
    }
    
    @Override
    public void destroy() {
        System.out.println("LoginServlet: Servlet being destroyed");
        userDAO = null;
        super.destroy();
    }
}