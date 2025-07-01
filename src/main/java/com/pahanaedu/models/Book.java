// File: src/main/java/com/pahanaedu/models/Book.java
// Updated Book Model with Reference Number and QR Code Support
package com.pahanaedu.models;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

public class Book {
    // Constants for status
    public static final String STATUS_ACTIVE = "active";
    public static final String STATUS_INACTIVE = "inactive";
    public static final String STATUS_OUT_OF_STOCK = "out_of_stock";
    
    private int id;
    private String title;
    private String author;
    private int categoryId;
    private String categoryName; // For joined queries
    private BigDecimal price;
    private BigDecimal offerPrice; // Offer price field
    private int stock;
    private String description;
    private String details; // Additional details
    private String imageUrls; // Comma-separated image URLs
    private String status;
    private List<String> images; // For multiple images
    private String referenceNo; // Auto-generated reference number
    private String qrCode; // QR code data
    private Timestamp createdAt;
    private Timestamp updatedAt;
    
    // Constructors
    public Book() {
        this.status = STATUS_ACTIVE;
        this.stock = 0;
    }
    
    public Book(String title, String author, int categoryId, 
                BigDecimal price, int stock, String description) {
        this();
        this.title = title;
        this.author = author;
        this.categoryId = categoryId;
        this.price = price;
        this.stock = stock;
        this.description = description;
    }
    
    // Auto-update status based on stock
    public void updateStatusBasedOnStock() {
        if (this.stock <= 0) {
            this.status = STATUS_OUT_OF_STOCK;
        } else if (STATUS_OUT_OF_STOCK.equals(this.status) && this.stock > 0) {
            this.status = STATUS_ACTIVE;
        }
    }
    
    // Check if book has offer
    public boolean hasOffer() {
        return offerPrice != null && offerPrice.compareTo(BigDecimal.ZERO) > 0 
               && offerPrice.compareTo(price) < 0;
    }
    
    // Get discount percentage
    public int getDiscountPercentage() {
        if (!hasOffer()) return 0;
        BigDecimal discount = price.subtract(offerPrice);
        return discount.multiply(BigDecimal.valueOf(100)).divide(price, 0, BigDecimal.ROUND_HALF_UP).intValue();
    }
    
    // Get effective price (offer price if available, otherwise regular price)
    public BigDecimal getEffectivePrice() {
        return hasOffer() ? offerPrice : price;
    }
    
    // Generate QR code URL (for external QR generation service)
    public String getQrCodeImageUrl() {
        if (referenceNo == null || referenceNo.isEmpty()) {
            return null;
        }
        // Using Google Charts API for QR code generation
        return "https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=" + 
               java.net.URLEncoder.encode(referenceNo, java.nio.charset.StandardCharsets.UTF_8);
    }
    
    // Get formatted display reference
    public String getFormattedReference() {
        return referenceNo != null ? referenceNo : "Not Generated";
    }
    
    // Getters and Setters
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getAuthor() {
        return author;
    }
    
    public void setAuthor(String author) {
        this.author = author;
    }
    
    public int getCategoryId() {
        return categoryId;
    }
    
    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }
    
    public String getCategoryName() {
        return categoryName;
    }
    
    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public BigDecimal getOfferPrice() {
        return offerPrice;
    }
    
    public void setOfferPrice(BigDecimal offerPrice) {
        this.offerPrice = offerPrice;
    }
    
    public int getStock() {
        return stock;
    }
    
    public void setStock(int stock) {
        this.stock = stock;
        updateStatusBasedOnStock(); // Auto-update status
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getDetails() {
        return details;
    }
    
    public void setDetails(String details) {
        this.details = details;
    }
    
    public String getImageUrls() {
        return imageUrls;
    }
    
    public void setImageUrls(String imageUrls) {
        this.imageUrls = imageUrls;
    }
    
    public List<String> getImages() {
        return images;
    }
    
    public void setImages(List<String> images) {
        this.images = images;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    // New getters and setters for reference system
    public String getReferenceNo() {
        return referenceNo;
    }
    
    public void setReferenceNo(String referenceNo) {
        this.referenceNo = referenceNo;
    }
    
    public String getQrCode() {
        return qrCode;
    }
    
    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
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
        return "Book{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", author='" + author + '\'' +
                ", referenceNo='" + referenceNo + '\'' +
                ", categoryId=" + categoryId +
                ", price=" + price +
                ", offerPrice=" + offerPrice +
                ", stock=" + stock +
                ", status='" + status + '\'' +
                '}';
    }
}