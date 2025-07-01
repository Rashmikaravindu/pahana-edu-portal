// File: src/main/java/com/pahanaedu/models/Category.java
package com.pahanaedu.models;

import java.sql.Timestamp;

public class Category {
    // Constants for status
    public static final String STATUS_ACTIVE = "active";
    public static final String STATUS_INACTIVE = "inactive";
    
    private int id;
    private String name;
    private String description;
    private String status;
    private int bookCount; // For statistics
    private Timestamp createdAt;
    private Timestamp updatedAt;
    
    // Constructors
    public Category() {
        this.status = STATUS_ACTIVE;
    }
    
    public Category(String name, String description) {
        this();
        this.name = name;
        this.description = description;
    }
    
    // Getters and Setters
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public int getBookCount() {
        return bookCount;
    }
    
    public void setBookCount(int bookCount) {
        this.bookCount = bookCount;
    }
    
    public Timestamp getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
    
    public Timestamp getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @Override
    public String toString() {
        return "Category{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", status='" + status + '\'' +
                ", bookCount=" + bookCount +
                '}';
    }
}