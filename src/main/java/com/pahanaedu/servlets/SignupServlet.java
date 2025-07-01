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

@WebServlet("/signup")
public class SignupServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private UserDAO userDAO;
    
    @Override
    public void init() throws ServletException {
        userDAO = new UserDAO();
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        // Redirect to login page when accessed directly
        response.sendRedirect("login.jsp");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Set response content type
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            // Get form parameters
            String firstName = request.getParameter("firstName");
            String lastName = request.getParameter("lastName");
            String phone = request.getParameter("phone");
            String email = request.getParameter("email");
            String password = request.getParameter("password");
            String confirmPassword = request.getParameter("confirmPassword");
            
            // Debug logging
            System.out.println("Customer signup attempt - FirstName: " + firstName + ", LastName: " + lastName + 
                             ", Phone: " + phone + ", Email: " + email + ", Password: " + (password != null ? "***" : "null"));
            
            // Basic validation
            if (firstName == null || firstName.trim().isEmpty() ||
                lastName == null || lastName.trim().isEmpty() ||
                phone == null || phone.trim().isEmpty() ||
                email == null || email.trim().isEmpty() ||
                password == null || password.trim().isEmpty() ||
                confirmPassword == null || confirmPassword.trim().isEmpty()) {
                
                System.out.println("Signup validation failed - empty fields");
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"success\": false, \"message\": \"All fields are required!\"}");
                return;
            }
            
            // Validate phone number format (10 digits)
            String cleanPhone = phone.replaceAll("\\D", ""); // Remove non-digits
            if (cleanPhone.length() != 10) {
                System.out.println("Signup validation failed - invalid phone: " + phone);
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"success\": false, \"message\": \"Please enter a valid 10-digit phone number!\"}");
                return;
            }
            
            // Check if passwords match
            if (!password.equals(confirmPassword)) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"success\": false, \"message\": \"Passwords do not match!\"}");
                return;
            }
            
            // Check if email already exists
            if (userDAO.emailExists(email)) {
                response.setStatus(HttpServletResponse.SC_CONFLICT);
                out.print("{\"success\": false, \"message\": \"Email already exists!\"}");
                return;
            }
            
            // Create new customer user (role is set automatically in UserDAO)
            User newUser = new User(firstName.trim(), lastName.trim(), email.trim(), password);
            newUser.setPhone(cleanPhone); // Set the phone number
            
            if (userDAO.createUser(newUser)) {
                // Success - Create session for immediate login
                HttpSession session = request.getSession();
                newUser.setRole(User.ROLE_CUSTOMER); // Ensure role is set
                session.setAttribute("user", newUser);
                session.setAttribute("userEmail", newUser.getEmail());
                session.setAttribute("userName", newUser.getFullName());
                session.setAttribute("userRole", newUser.getRole());
                session.setAttribute("userFirstName", newUser.getFirstName());
                session.setAttribute("userPhone", newUser.getPhone());
                
                // Set session timeout (30 minutes)
                session.setMaxInactiveInterval(30 * 60);
                
                response.setStatus(HttpServletResponse.SC_OK);
                out.print("{\"success\": true, \"message\": \"Account created successfully!\", \"role\": \"" + User.ROLE_CUSTOMER + "\", \"redirectUrl\": \"index2.jsp\"}");
            } else {
                // Database error
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print("{\"success\": false, \"message\": \"Failed to create account. Please try again.\"}");
            }
            
        } catch (Exception e) {
            System.err.println("Signup error: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"success\": false, \"message\": \"Server error occurred!\"}");
        } finally {
            out.close();
        }
    }
}