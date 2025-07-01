package com.pahanaedu.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.mindrot.jbcrypt.BCrypt;

import com.pahanaedu.models.User;
import com.pahanaedu.utils.DatabaseConnection;

public class UserDAO {
    
    /**
     * Create new user account with hashed password (CUSTOMER role only)
     * @param user User object with user details
     * @return true if user created successfully, false otherwise
     */
    public boolean createUser(User user) {
        // Only customers can signup through the website
        user.setRole(User.ROLE_CUSTOMER);
        
        String query = "INSERT INTO users (first_name, last_name, email, password, role, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {
            
            // Hash the password before storing
            String hashedPassword = hashPassword(user.getPassword());
            
            statement.setString(1, user.getFirstName());
            statement.setString(2, user.getLastName());
            statement.setString(3, user.getEmail());
            statement.setString(4, hashedPassword);
            statement.setString(5, user.getRole());
            statement.setString(6, user.getPhone());
            statement.setString(7, user.getStatus() != null ? user.getStatus() : User.STATUS_ACTIVE);
            
            int rowsAffected = statement.executeUpdate();
            
            System.out.println("Customer created: " + user.getEmail() + " (Role: " + user.getRole() + ")");
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            System.err.println("Error creating user: " + e.getMessage());
            return false;
        }
    }
    
    // ========== ADMIN DASHBOARD METHODS ==========
    
    /**
     * Create new user by admin (can be CUSTOMER or CASHIER)
     * @param user User object with user details
     * @return true if user created successfully, false otherwise
     */
    public boolean createUserByAdmin(User user) {
        String query = "INSERT INTO users (first_name, last_name, email, password, role, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {
            
            // Hash the password before storing
            String hashedPassword = hashPassword(user.getPassword());
            
            statement.setString(1, user.getFirstName());
            statement.setString(2, user.getLastName());
            statement.setString(3, user.getEmail());
            statement.setString(4, hashedPassword);
            statement.setString(5, user.getRole());
            statement.setString(6, user.getPhone());
            statement.setString(7, user.getStatus() != null ? user.getStatus() : User.STATUS_ACTIVE);
            
            int rowsAffected = statement.executeUpdate();
            
            System.out.println("User created by admin: " + user.getEmail() + 
                               " (Role: " + user.getRole() + 
                               ", Status: " + user.getStatus() + ")");
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            System.err.println("Error creating user by admin: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Get all users by role
     * @param role User role (CUSTOMER or CASHIER)
     * @return List of users with specified role
     */
    public List<User> getUsersByRole(String role) {
        List<User> users = new ArrayList<>();
        String query = "SELECT * FROM users WHERE role = ? ORDER BY created_at DESC";
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {
            
            statement.setString(1, role);
            ResultSet resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                User user = extractUserFromResultSet(resultSet);
                users.add(user);
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting users by role: " + e.getMessage());
        }
        
        return users;
    }
    
    /**
     * Get user by ID
     * @param id User ID
     * @return User object if found, null otherwise
     */
    public User getUserById(int id) {
        String query = "SELECT * FROM users WHERE id = ?";
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {
            
            statement.setInt(1, id);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return extractUserFromResultSet(resultSet);
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting user by ID: " + e.getMessage());
        }
        
        return null;
    }
    
    /**
     * Update user information
     * @param user User object with updated information
     * @return true if update successful, false otherwise
     */
    public boolean updateUser(User user) {
        String query = "UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, status = ? WHERE id = ?";
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {
            
            statement.setString(1, user.getFirstName());
            statement.setString(2, user.getLastName());
            statement.setString(3, user.getEmail());
            statement.setString(4, user.getPhone());
            statement.setString(5, user.getStatus());
            statement.setInt(6, user.getId());
            
            int rowsAffected = statement.executeUpdate();
            
            System.out.println("User updated: " + user.getEmail() + 
                              " (Phone: " + user.getPhone() + 
                              ", Status: " + user.getStatus() + ")");
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            System.err.println("Error updating user: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Delete user by ID
     * @param id User ID to delete
     * @return true if deletion successful, false otherwise
     */
    public boolean deleteUser(int id) {
        String query = "DELETE FROM users WHERE id = ?";
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {
            
            statement.setInt(1, id);
            int rowsAffected = statement.executeUpdate();
            
            System.out.println("User deleted with ID: " + id);
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            System.err.println("Error deleting user: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Get count of users by role
     * @param role User role
     * @return Count of users
     */
    public int getUserCountByRole(String role) {
        String query = "SELECT COUNT(*) FROM users WHERE role = ?";
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {
            
            statement.setString(1, role);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt(1);
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting user count: " + e.getMessage());
        }
        
        return 0;
    }
    
    // ========== HELPER METHOD TO EXTRACT USER ==========
    
    /**
     * Extract user from result set
     * @param resultSet SQL result set
     * @return User object
     * @throws SQLException
     */
    private User extractUserFromResultSet(ResultSet resultSet) throws SQLException {
        User user = new User();
        user.setId(resultSet.getInt("id"));
        user.setFirstName(resultSet.getString("first_name"));
        user.setLastName(resultSet.getString("last_name"));
        user.setEmail(resultSet.getString("email"));
        user.setRole(resultSet.getString("role"));
        user.setPhone(resultSet.getString("phone"));
        user.setStatus(resultSet.getString("status"));
        return user;
    }
    
    // ========== LOGIN & VALIDATION METHODS ==========
    
    /**
     * Validate user login credentials with hashed password and role
     * @param email User email
     * @param password Plain text password
     * @return User object if credentials are valid, null otherwise
     */
    public User validateLogin(String email, String password) {
        String query = "SELECT * FROM users WHERE email = ?";
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {
            
            statement.setString(1, email);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                String storedHashedPassword = resultSet.getString("password");
                
                // For cashier accounts that might have plain text passwords initially
                boolean passwordValid = false;
                if (storedHashedPassword.startsWith("$2a$") || storedHashedPassword.startsWith("$2b$")) {
                    // Hashed password - use BCrypt verification
                    passwordValid = verifyPassword(password, storedHashedPassword);
                } else {
                    // Plain text password (for initial cashier accounts) - compare directly and then hash
                    if (password.equals(storedHashedPassword)) {
                        passwordValid = true;
                        // Update to hashed password
                        updatePasswordHash(resultSet.getInt("id"), password);
                    }
                }
                
                if (passwordValid) {
                    User user = extractUserFromResultSet(resultSet);
                    
                    System.out.println("Login successful for: " + email + 
                                      " (Role: " + user.getRole() + 
                                      ", Status: " + user.getStatus() + ")");
                    return user;
                } else {
                    System.out.println("Password verification failed for: " + email);
                }
            } else {
                System.out.println("User not found: " + email);
            }
            
        } catch (SQLException e) {
            System.err.println("Error validating login: " + e.getMessage());
        }
        
        return null; // Invalid credentials
    }
    
    /**
     * Update plain text password to hashed password
     * @param userId User ID
     * @param plainTextPassword Plain text password
     */
    private void updatePasswordHash(int userId, String plainTextPassword) {
        String query = "UPDATE users SET password = ? WHERE id = ?";
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {
            
            String hashedPassword = hashPassword(plainTextPassword);
            statement.setString(1, hashedPassword);
            statement.setInt(2, userId);
            
            statement.executeUpdate();
            System.out.println("Password updated to hashed version for user ID: " + userId);
            
        } catch (SQLException e) {
            System.err.println("Error updating password hash: " + e.getMessage());
        }
    }
    
    /**
     * Check if email already exists
     * @param email Email to check
     * @return true if email exists, false otherwise
     */
    public boolean emailExists(String email) {
        String query = "SELECT COUNT(*) FROM users WHERE email = ?";
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {
            
            statement.setString(1, email);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt(1) > 0;
            }
            
        } catch (SQLException e) {
            System.err.println("Error checking email existence: " + e.getMessage());
        }
        
        return false;
    }
    
    /**
     * Check if email already exists excluding current user ID
     * @param email Email to check
     * @param excludeId User ID to exclude from check
     * @return true if email exists, false otherwise
     */
    public boolean emailExistsExcluding(String email, int excludeId) {
        String query = "SELECT COUNT(*) FROM users WHERE email = ? AND id != ?";
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {
            
            statement.setString(1, email);
            statement.setInt(2, excludeId);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt(1) > 0;
            }
            
        } catch (SQLException e) {
            System.err.println("Error checking email existence: " + e.getMessage());
        }
        
        return false;
    }
    
    /**
     * Check if user has specific role
     * @param email User email
     * @param role User role
     * @return true if user has specified role, false otherwise
     */
    public boolean isUserRole(String email, String role) {
        String query = "SELECT COUNT(*) FROM users WHERE email = ? AND role = ?";
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {
            
            statement.setString(1, email);
            statement.setString(2, role);
            ResultSet resultSet = statement.executeQuery();
            
            if (resultSet.next()) {
                return resultSet.getInt(1) > 0;
            }
            
        } catch (SQLException e) {
            System.err.println("Error checking user role: " + e.getMessage());
        }
        
        return false;
    }
    
    // ========== PASSWORD RESET METHODS ==========
    
    /**
     * Update user password (for password reset functionality)
     * @param email User's email address
     * @param newPassword New password (will be hashed)
     * @return true if password updated successfully, false otherwise
     */
    public boolean updatePassword(String email, String newPassword) {
        String query = "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?";
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {
            
            // Hash the new password using existing method
            String hashedPassword = hashPassword(newPassword);
            
            statement.setString(1, hashedPassword);
            statement.setString(2, email.toLowerCase().trim());
            
            int rowsAffected = statement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("UserDAO: Password updated successfully for - " + email);
                return true;
            } else {
                System.out.println("UserDAO: No user found to update password - " + email);
                return false;
            }
            
        } catch (SQLException e) {
            System.err.println("UserDAO: Error updating password - " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    // ========== PASSWORD HASHING METHODS ==========
    
    /**
     * Hash password using BCrypt
     * @param plainTextPassword Plain text password
     * @return Hashed password
     */
    private String hashPassword(String plainTextPassword) {
        // Generate salt and hash password
        // Cost factor 12 is recommended for production
        return BCrypt.hashpw(plainTextPassword, BCrypt.gensalt(12));
    }
    
    /**
     * Verify password against stored hash
     * @param plainTextPassword Plain text password from user input
     * @param hashedPassword Stored hashed password from database
     * @return true if password matches, false otherwise
     */
    private boolean verifyPassword(String plainTextPassword, String hashedPassword) {
        try {
            return BCrypt.checkpw(plainTextPassword, hashedPassword);
        } catch (Exception e) {
            System.err.println("Error verifying password: " + e.getMessage());
            return false;
        }
    }
}