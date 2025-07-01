package com.pahanaedu.models;

public class User {
    private int id;
    private String firstName;
    private String lastName;
    private String phone;
    private String status;
    private String email;
    private String password;
    private String role;

    // Role constants
    public static final String ROLE_CUSTOMER = "CUSTOMER";
    public static final String ROLE_CASHIER = "CASHIER";
    public static final String ROLE_ADMIN = "ADMIN";

    // Status constants
    public static final String STATUS_ACTIVE = "active";
    public static final String STATUS_INACTIVE = "inactive";

    // Default constructor
    public User() {
        this.role = ROLE_CUSTOMER;
        this.status = STATUS_ACTIVE;
    }

    // Constructor for registration (with phone)
    public User(String firstName, String lastName, String phone, String email, String password) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.email = email;
        this.password = password;
        this.role = ROLE_CUSTOMER;
        this.status = STATUS_ACTIVE;
    }

    // Constructor for registration (without phone - for backward compatibility)
    public User(String firstName, String lastName, String email, String password) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = ROLE_CUSTOMER;
        this.status = STATUS_ACTIVE;
        this.phone = null; // Explicitly set to null
    }

    // Full constructor
    public User(String firstName, String lastName, String phone, String email, String password, String role, String status) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.email = email;
        this.password = password;
        this.role = role;
        this.status = status;
    }

    // Constructor with ID (for database operations)
    public User(int id, String firstName, String lastName, String phone, String email, String password, String role, String status) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.email = email;
        this.password = password;
        this.role = role;
        this.status = status;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    // Utility methods
    public boolean isCustomer() {
        return ROLE_CUSTOMER.equals(this.role);
    }

    public boolean isCashier() {
        return ROLE_CASHIER.equals(this.role);
    }

    public boolean isAdmin() {
        return ROLE_ADMIN.equals(this.role);
    }

    public boolean isActive() {
        return STATUS_ACTIVE.equals(this.status);
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    // Phone number validation utility method
    public boolean hasValidPhone() {
        return phone != null && !phone.trim().isEmpty();
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", phone='" + phone + '\'' +
                ", status='" + status + '\'' +
                ", email='" + email + '\'' +
                ", role='" + role + '\'' +
                '}';
    }
}