package com.pahanaedu.servlets;

import java.io.IOException;
import java.security.SecureRandom;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.pahanaedu.dao.UserDAO;
import com.pahanaedu.utils.DatabaseConnection;

@WebServlet("/forgot-password")
public class ForgotPasswordServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private UserDAO userDAO;
    
    @Override
    public void init() throws ServletException {
        try {
            userDAO = new UserDAO();
            System.out.println("ForgotPasswordServlet: Initialized successfully");
        } catch (Exception e) {
            throw new ServletException("Failed to initialize UserDAO", e);
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String email = request.getParameter("email");
        
        System.out.println("ForgotPasswordServlet: POST request received");
        System.out.println("ForgotPasswordServlet: Email parameter: " + email);
        
        if (email == null || email.trim().isEmpty()) {
            System.out.println("ForgotPasswordServlet: Email is empty");
            request.setAttribute("errorMessage", "Please enter your email address");
            request.getRequestDispatcher("forgot-password.jsp").forward(request, response);
            return;
        }
        
        email = email.trim().toLowerCase();
        System.out.println("ForgotPasswordServlet: Processing reset request for: " + email);
        
        try {
            // Check if user exists
            boolean userExists = userDAO.emailExists(email);
            System.out.println("ForgotPasswordServlet: User exists: " + userExists);
            
            if (userExists) {
                // Generate token and link only for existing users
                String token = generateSecureToken();
                System.out.println("ForgotPasswordServlet: Generated token: " + token.substring(0, 8) + "...");
                
                // Save token to database
                saveResetToken(email, token);
                System.out.println("ForgotPasswordServlet: Token saved to database");
                
                // Create reset link
                String resetLink = request.getScheme() + "://" + 
                                 request.getServerName() + ":" + 
                                 request.getServerPort() + 
                                 request.getContextPath() + 
                                 "/reset-password.jsp?token=" + token;
                
                System.out.println("ForgotPasswordServlet: Generated reset link: " + resetLink);
                
                // Set attributes for JSP
                request.setAttribute("resetLink", resetLink);
                request.setAttribute("userEmail", email);
                request.setAttribute("successMessage", 
                    "Reset link generated successfully! Click the link below to reset your password.");
                request.setAttribute("showResetLink", true);
                
                // Console output for demo
                System.out.println("=== PASSWORD RESET LINK ===");
                System.out.println("Email: " + email);
                System.out.println("Reset Link: " + resetLink);
                System.out.println("Token expires in 1 hour");
                System.out.println("===========================");
                
                System.out.println("ForgotPasswordServlet: All attributes set successfully");
                
            } else {
                // User doesn't exist - show error message
                System.out.println("ForgotPasswordServlet: User not found, showing error message");
                request.setAttribute("errorMessage", 
                    "No account found with this email address. Please check your email and try again.");
                request.setAttribute("showResetLink", false);
            }
            
        } catch (Exception e) {
            System.err.println("ForgotPasswordServlet: Error processing reset: " + e.getMessage());
            e.printStackTrace();
            request.setAttribute("errorMessage", 
                "An error occurred while processing your request. Please try again later.");
        }
        
        System.out.println("ForgotPasswordServlet: Forwarding to JSP");
        request.getRequestDispatcher("forgot-password.jsp").forward(request, response);
    }
    
    private String generateSecureToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        
        StringBuilder token = new StringBuilder();
        for (byte b : bytes) {
            token.append(String.format("%02x", b));
        }
        
        return token.toString();
    }
    
    private void saveResetToken(String email, String token) throws Exception {
        System.out.println("ForgotPasswordServlet: Attempting to save token for: " + email);
        
        // First, delete any existing tokens for this email
        String deleteQuery = "DELETE FROM password_reset_tokens WHERE email = ?";
        
        // Then insert new token
        String insertQuery = "INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)";
        
        try (Connection conn = DatabaseConnection.getConnection()) {
            System.out.println("ForgotPasswordServlet: Database connection obtained");
            
            // Delete old tokens
            try (PreparedStatement deleteStmt = conn.prepareStatement(deleteQuery)) {
                deleteStmt.setString(1, email);
                int deletedCount = deleteStmt.executeUpdate();
                System.out.println("ForgotPasswordServlet: Deleted " + deletedCount + " old tokens");
            }
            
            // Insert new token
            try (PreparedStatement insertStmt = conn.prepareStatement(insertQuery)) {
                insertStmt.setString(1, email);
                insertStmt.setString(2, token);
                
                // Token expires in 1 hour
                Timestamp expiryTime = new Timestamp(System.currentTimeMillis() + (60 * 60 * 1000));
                insertStmt.setTimestamp(3, expiryTime);
                
                int insertCount = insertStmt.executeUpdate();
                System.out.println("ForgotPasswordServlet: Inserted " + insertCount + " new token");
                
                if (insertCount > 0) {
                    System.out.println("ForgotPasswordServlet: Reset token saved successfully for: " + email);
                } else {
                    System.err.println("ForgotPasswordServlet: Failed to insert token");
                }
            }
        } catch (Exception e) {
            System.err.println("ForgotPasswordServlet: Database error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        System.out.println("ForgotPasswordServlet: GET request - redirecting to JSP");
        response.sendRedirect("forgot-password.jsp");
    }
}