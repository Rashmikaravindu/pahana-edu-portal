package com.pahanaedu.servlets;

import java.io.IOException;
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

@WebServlet("/reset-password")
public class ResetPasswordServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private UserDAO userDAO;
    
    @Override
    public void init() throws ServletException {
        try {
            userDAO = new UserDAO();
            System.out.println("ResetPasswordServlet: Initialized successfully");
        } catch (Exception e) {
            throw new ServletException("Failed to initialize UserDAO", e);
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String token = request.getParameter("token");
        
        if (token == null || token.trim().isEmpty()) {
            response.sendRedirect("forgot-password.jsp");
            return;
        }
        
        try {
            // Validate token
            if (!isValidToken(token)) {
                request.setAttribute("errorMessage", 
                    "Invalid or expired reset link. Please request a new one.");
                request.getRequestDispatcher("forgot-password.jsp").forward(request, response);
                return;
            }
            
            // Token is valid, show reset form
            request.getRequestDispatcher("reset-password.jsp").forward(request, response);
            
        } catch (Exception e) {
            System.err.println("Error validating token: " + e.getMessage());
            request.setAttribute("errorMessage", "An error occurred. Please try again.");
            request.getRequestDispatcher("forgot-password.jsp").forward(request, response);
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String token = request.getParameter("token");
        String password = request.getParameter("password");
        String confirmPassword = request.getParameter("confirmPassword");
        
        // Validation
        if (token == null || token.trim().isEmpty()) {
            request.setAttribute("errorMessage", "Invalid reset token");
            request.getRequestDispatcher("reset-password.jsp").forward(request, response);
            return;
        }
        
        if (password == null || password.trim().isEmpty()) {
            request.setAttribute("errorMessage", "Password is required");
            request.getRequestDispatcher("reset-password.jsp").forward(request, response);
            return;
        }
        
        if (password.length() < 6) {
            request.setAttribute("errorMessage", "Password must be at least 6 characters long");
            request.getRequestDispatcher("reset-password.jsp").forward(request, response);
            return;
        }
        
        if (!password.equals(confirmPassword)) {
            request.setAttribute("errorMessage", "Passwords do not match");
            request.getRequestDispatcher("reset-password.jsp").forward(request, response);
            return;
        }
        
        try {
            // Get email from token
            String email = getEmailFromToken(token);
            
            if (email == null) {
                request.setAttribute("errorMessage", "Invalid or expired reset token");
                request.getRequestDispatcher("reset-password.jsp").forward(request, response);
                return;
            }
            
            // Update password
            boolean success = userDAO.updatePassword(email, password);
            
            if (success) {
                // Mark token as used
                markTokenAsUsed(token);
                
                System.out.println("Password reset successful for: " + email);
                
                // Redirect to login with success message
                request.getSession().setAttribute("loginSuccessMessage", 
                    "Password updated successfully! Please login with your new password.");
                response.sendRedirect("login.jsp");
                
            } else {
                request.setAttribute("errorMessage", "Failed to update password. Please try again.");
                request.getRequestDispatcher("reset-password.jsp").forward(request, response);
            }
            
        } catch (Exception e) {
            System.err.println("Error resetting password: " + e.getMessage());
            e.printStackTrace();
            request.setAttribute("errorMessage", "An error occurred. Please try again.");
            request.getRequestDispatcher("reset-password.jsp").forward(request, response);
        }
    }
    
    private boolean isValidToken(String token) throws Exception {
        String query = "SELECT email FROM password_reset_tokens WHERE token = ? AND expires_at > NOW() AND used = FALSE";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            
            stmt.setString(1, token);
            
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next();
            }
        }
    }
    
    private String getEmailFromToken(String token) throws Exception {
        String query = "SELECT email FROM password_reset_tokens WHERE token = ? AND expires_at > NOW() AND used = FALSE";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            
            stmt.setString(1, token);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("email");
                }
            }
        }
        
        return null;
    }
    
    private void markTokenAsUsed(String token) throws Exception {
        String query = "UPDATE password_reset_tokens SET used = TRUE WHERE token = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            
            stmt.setString(1, token);
            stmt.executeUpdate();
            
            System.out.println("Token marked as used: " + token.substring(0, 8) + "...");
        }
    }
}