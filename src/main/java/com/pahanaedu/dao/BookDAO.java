// File: src/main/java/com/pahanaedu/dao/BookDAO.java
// Complete Updated BookDAO with Reference Number, QR Code Support and Enhanced Search
package com.pahanaedu.dao;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import com.pahanaedu.models.Book;
import com.pahanaedu.utils.DatabaseConnection;

public class BookDAO {
    
    // Get all books with category names and reference data
    public List<Book> getAllBooks() {
        List<Book> books = new ArrayList<>();
        String sql = "SELECT b.*, c.name as category_name FROM books b " +
                    "LEFT JOIN categories c ON b.category_id = c.id " +
                    "ORDER BY b.id DESC";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                Book book = extractBookFromResultSet(rs);
                books.add(book);
            }
        } catch (SQLException e) {
            System.err.println("❌ Error fetching all books: " + e.getMessage());
            e.printStackTrace();
        }
        
        return books;
    }
    
    // Get book by ID with all reference data
    public Book getBookById(int id) {
        String sql = "SELECT b.*, c.name as category_name FROM books b " +
                    "LEFT JOIN categories c ON b.category_id = c.id " +
                    "WHERE b.id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Book book = extractBookFromResultSet(rs);
                    System.out.println("✅ Found book by ID: " + book.getTitle());
                    return book;
                }
            }
        } catch (SQLException e) {
            System.err.println("❌ Error fetching book by ID " + id + ": " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
    
    // Search book by reference number (Enhanced with better error handling)
    public Book getBookByReferenceNo(String referenceNo) {
        if (referenceNo == null || referenceNo.trim().isEmpty()) {
            System.out.println("❌ Empty reference number provided");
            return null;
        }
        
        String sql = "SELECT b.*, c.name as category_name FROM books b " +
                    "LEFT JOIN categories c ON b.category_id = c.id " +
                    "WHERE UPPER(TRIM(b.reference_no)) = UPPER(TRIM(?))";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            String cleanRef = referenceNo.trim();
            stmt.setString(1, cleanRef);
            
            System.out.println("🔍 Searching for reference: '" + cleanRef + "'");
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Book book = extractBookFromResultSet(rs);
                    System.out.println("✅ Found book: " + book.getTitle() + " (ID: " + book.getId() + ")");
                    return book;
                } else {
                    System.out.println("❌ No book found with reference: '" + cleanRef + "'");
                    
                    // Debug: Check if any books exist with similar reference
                    checkSimilarReferences(cleanRef);
                    return null;
                }
            }
        } catch (SQLException e) {
            System.err.println("❌ Database error searching for reference '" + referenceNo + "': " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    
    // Search book by QR code (Enhanced)
    public Book getBookByQrCode(String qrCode) {
        if (qrCode == null || qrCode.trim().isEmpty()) {
            System.out.println("❌ Empty QR code provided");
            return null;
        }
        
        String sql = "SELECT b.*, c.name as category_name FROM books b " +
                    "LEFT JOIN categories c ON b.category_id = c.id " +
                    "WHERE UPPER(TRIM(b.qr_code)) = UPPER(TRIM(?)) OR UPPER(TRIM(b.reference_no)) = UPPER(TRIM(?))";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            String cleanQr = qrCode.trim();
            stmt.setString(1, cleanQr);
            stmt.setString(2, cleanQr); // Also search reference_no field
            
            System.out.println("🔍 Searching for QR/Reference: '" + cleanQr + "'");
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Book book = extractBookFromResultSet(rs);
                    System.out.println("✅ Found book via QR: " + book.getTitle() + " (ID: " + book.getId() + ")");
                    return book;
                } else {
                    System.out.println("❌ No book found with QR code: '" + cleanQr + "'");
                    return null;
                }
            }
        } catch (SQLException e) {
            System.err.println("❌ Database error searching for QR code '" + qrCode + "': " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    
    // Debug method to check similar references
    private void checkSimilarReferences(String searchRef) {
        String sql = "SELECT reference_no FROM books WHERE reference_no IS NOT NULL AND reference_no != '' LIMIT 10";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            System.out.println("📋 Sample reference numbers in database:");
            int count = 0;
            while (rs.next() && count < 5) {
                String ref = rs.getString("reference_no");
                System.out.println("   - " + ref);
                count++;
            }
            
            // Check for case-insensitive partial matches
            checkPartialMatches(searchRef);
            
        } catch (SQLException e) {
            System.err.println("Error checking similar references: " + e.getMessage());
        }
    }
    
    // Check for partial matches
    private void checkPartialMatches(String searchRef) {
        String sql = "SELECT reference_no, title FROM books WHERE reference_no LIKE ? LIMIT 5";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, "%" + searchRef + "%");
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    System.out.println("🔍 Similar references found:");
                    do {
                        System.out.println("   - " + rs.getString("reference_no") + " (" + rs.getString("title") + ")");
                    } while (rs.next());
                }
            }
        } catch (SQLException e) {
            System.err.println("Error checking partial matches: " + e.getMessage());
        }
    }
    
    // Generate next reference number
    public String generateReferenceNumber() {
        String sql = "SELECT generate_reference_no() as ref_no";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            if (rs.next()) {
                return rs.getString("ref_no");
            }
        } catch (SQLException e) {
            System.out.println("📝 Using fallback reference generation (stored function not available)");
            // Fallback to manual generation if function doesn't exist
            return generateReferenceNumberFallback();
        }
        
        return generateReferenceNumberFallback();
    }
    
    // Fallback reference number generation
    private String generateReferenceNumberFallback() {
        String sql = "SELECT COUNT(*) as count FROM books";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            if (rs.next()) {
                int count = rs.getInt("count") + 1;
                String refNo = String.format("BK%d%06d", 
                    java.time.Year.now().getValue(), count);
                System.out.println("📝 Generated reference number: " + refNo);
                return refNo;
            }
        } catch (SQLException e) {
            System.err.println("Error generating reference number: " + e.getMessage());
            e.printStackTrace();
        }
        
        // Final fallback
        String finalRef = "BK" + System.currentTimeMillis();
        System.out.println("📝 Using timestamp-based reference: " + finalRef);
        return finalRef;
    }
    
    // Create new book with auto-generated reference
    public boolean createBook(Book book, List<String> imageUrls) {
        String sql = "INSERT INTO books (title, author, category_id, price, offer_price, stock, " +
                    "description, details, status, reference_no, qr_code) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        Connection conn = null;
        PreparedStatement stmt = null;
        PreparedStatement imgStmt = null;
        ResultSet generatedKeys = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false);
            
            // Generate reference number if not provided
            if (book.getReferenceNo() == null || book.getReferenceNo().isEmpty()) {
                book.setReferenceNo(generateReferenceNumber());
            }
            
            // Set QR code data (same as reference number)
            book.setQrCode(book.getReferenceNo());
            
            // Auto-set status based on stock
            if (book.getStock() <= 0) {
                book.setStatus("out_of_stock");
            } else if (book.getStatus() == null || book.getStatus().isEmpty()) {
                book.setStatus("active");
            }
            
            // Insert book
            stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            stmt.setString(1, book.getTitle());
            stmt.setString(2, book.getAuthor());
            
            if (book.getCategoryId() > 0) {
                stmt.setInt(3, book.getCategoryId());
            } else {
                stmt.setNull(3, Types.INTEGER);
            }
            
            stmt.setBigDecimal(4, book.getPrice());
            
            if (book.getOfferPrice() != null && book.getOfferPrice().compareTo(BigDecimal.ZERO) > 0) {
                stmt.setBigDecimal(5, book.getOfferPrice());
            } else {
                stmt.setNull(5, Types.DECIMAL);
            }
            
            stmt.setInt(6, book.getStock());
            stmt.setString(7, book.getDescription());
            stmt.setString(8, book.getDetails());
            stmt.setString(9, book.getStatus());
            stmt.setString(10, book.getReferenceNo());
            stmt.setString(11, book.getQrCode());
            
            int affectedRows = stmt.executeUpdate();
            
            if (affectedRows > 0) {
                generatedKeys = stmt.getGeneratedKeys();
                if (generatedKeys.next()) {
                    int bookId = generatedKeys.getInt(1);
                    book.setId(bookId);
                    
                    // Save images if provided
                    if (imageUrls != null && !imageUrls.isEmpty()) {
                        String imgSql = "INSERT INTO book_images (book_id, image_url, is_primary) VALUES (?, ?, ?)";
                        imgStmt = conn.prepareStatement(imgSql);
                        
                        for (int i = 0; i < imageUrls.size() && i < 5; i++) {
                            imgStmt.setInt(1, bookId);
                            imgStmt.setString(2, imageUrls.get(i));
                            imgStmt.setBoolean(3, i == 0);
                            imgStmt.executeUpdate();
                        }
                    }
                    
                    conn.commit();
                    System.out.println("✅ Successfully created book: " + book.getTitle() + " (Ref: " + book.getReferenceNo() + ")");
                    return true;
                }
            }
            
            conn.rollback();
            System.out.println("❌ Failed to create book: " + book.getTitle());
            return false;
            
        } catch (SQLException e) {
            System.err.println("❌ Error creating book: " + e.getMessage());
            e.printStackTrace();
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException rollbackEx) {
                    rollbackEx.printStackTrace();
                }
            }
            return false;
        } finally {
            try {
                if (generatedKeys != null) generatedKeys.close();
                if (imgStmt != null) imgStmt.close();
                if (stmt != null) stmt.close();
                if (conn != null) {
                    conn.setAutoCommit(true);
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
    
    // Update book (preserving reference number)
    public boolean updateBook(Book book, List<String> imageUrls) {
        String sql = "UPDATE books SET title = ?, author = ?, category_id = ?, " +
                    "price = ?, offer_price = ?, stock = ?, description = ?, details = ?, status = ? " +
                    "WHERE id = ?";
        
        Connection conn = null;
        PreparedStatement stmt = null;
        PreparedStatement deleteImgStmt = null;
        PreparedStatement insertImgStmt = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false);
            
            // Auto-set status based on stock
            if (book.getStock() <= 0) {
                book.setStatus("out_of_stock");
            } else if ("out_of_stock".equals(book.getStatus()) && book.getStock() > 0) {
                book.setStatus("active");
            }
            
            // Update book (reference_no and qr_code are preserved)
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, book.getTitle());
            stmt.setString(2, book.getAuthor());
            
            if (book.getCategoryId() > 0) {
                stmt.setInt(3, book.getCategoryId());
            } else {
                stmt.setNull(3, Types.INTEGER);
            }
            
            stmt.setBigDecimal(4, book.getPrice());
            
            if (book.getOfferPrice() != null && book.getOfferPrice().compareTo(BigDecimal.ZERO) > 0) {
                stmt.setBigDecimal(5, book.getOfferPrice());
            } else {
                stmt.setNull(5, Types.DECIMAL);
            }
            
            stmt.setInt(6, book.getStock());
            stmt.setString(7, book.getDescription());
            stmt.setString(8, book.getDetails());
            stmt.setString(9, book.getStatus());
            stmt.setInt(10, book.getId());
            
            int affectedRows = stmt.executeUpdate();
            
            if (affectedRows > 0) {
                // Update images if provided
                if (imageUrls != null) {
                    // Delete old images
                    deleteImgStmt = conn.prepareStatement("DELETE FROM book_images WHERE book_id = ?");
                    deleteImgStmt.setInt(1, book.getId());
                    deleteImgStmt.executeUpdate();
                    
                    // Insert new images
                    if (!imageUrls.isEmpty()) {
                        insertImgStmt = conn.prepareStatement("INSERT INTO book_images (book_id, image_url, is_primary) VALUES (?, ?, ?)");
                        
                        for (int i = 0; i < imageUrls.size() && i < 5; i++) {
                            insertImgStmt.setInt(1, book.getId());
                            insertImgStmt.setString(2, imageUrls.get(i));
                            insertImgStmt.setBoolean(3, i == 0);
                            insertImgStmt.executeUpdate();
                        }
                    }
                }
                
                conn.commit();
                System.out.println("✅ Successfully updated book: " + book.getTitle());
                return true;
            }
            
            conn.rollback();
            System.out.println("❌ Failed to update book: " + book.getTitle());
            return false;
            
        } catch (SQLException e) {
            System.err.println("❌ Error updating book: " + e.getMessage());
            e.printStackTrace();
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException rollbackEx) {
                    rollbackEx.printStackTrace();
                }
            }
            return false;
        } finally {
            try {
                if (insertImgStmt != null) insertImgStmt.close();
                if (deleteImgStmt != null) deleteImgStmt.close();
                if (stmt != null) stmt.close();
                if (conn != null) {
                    conn.setAutoCommit(true);
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
    
    // Search books by multiple criteria
    public List<Book> searchBooks(String searchTerm, String category, String status) {
        List<Book> books = new ArrayList<>();
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT b.*, c.name as category_name FROM books b ");
        sql.append("LEFT JOIN categories c ON b.category_id = c.id WHERE 1=1 ");
        
        List<Object> params = new ArrayList<>();
        
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            sql.append("AND (b.title LIKE ? OR b.author LIKE ? OR b.reference_no LIKE ?) ");
            String searchPattern = "%" + searchTerm.trim() + "%";
            params.add(searchPattern);
            params.add(searchPattern);
            params.add(searchPattern);
        }
        
        if (category != null && !category.trim().isEmpty() && !"all".equals(category)) {
            sql.append("AND c.name = ? ");
            params.add(category);
        }
        
        if (status != null && !status.trim().isEmpty() && !"all".equals(status)) {
            sql.append("AND b.status = ? ");
            params.add(status);
        }
        
        sql.append("ORDER BY b.title");
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    books.add(extractBookFromResultSet(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("❌ Error searching books: " + e.getMessage());
            e.printStackTrace();
        }
        
        return books;
    }
    
    // Delete book with all related data
    public boolean deleteBook(int id) {
        Connection conn = null;
        PreparedStatement deleteImgStmt = null;
        PreparedStatement deleteBookStmt = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false);
            
            // Delete images first
            deleteImgStmt = conn.prepareStatement("DELETE FROM book_images WHERE book_id = ?");
            deleteImgStmt.setInt(1, id);
            deleteImgStmt.executeUpdate();
            
            // Delete book
            deleteBookStmt = conn.prepareStatement("DELETE FROM books WHERE id = ?");
            deleteBookStmt.setInt(1, id);
            int affectedRows = deleteBookStmt.executeUpdate();
            
            if (affectedRows > 0) {
                conn.commit();
                System.out.println("✅ Successfully deleted book with ID: " + id);
                return true;
            }
            
            conn.rollback();
            System.out.println("❌ Failed to delete book with ID: " + id);
            return false;
            
        } catch (SQLException e) {
            System.err.println("❌ Error deleting book: " + e.getMessage());
            e.printStackTrace();
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException rollbackEx) {
                    rollbackEx.printStackTrace();
                }
            }
            return false;
        } finally {
            try {
                if (deleteBookStmt != null) deleteBookStmt.close();
                if (deleteImgStmt != null) deleteImgStmt.close();
                if (conn != null) {
                    conn.setAutoCommit(true);
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
    
    // Get total books count
    public int getTotalBooksCount() {
        String sql = "SELECT COUNT(*) FROM books WHERE status != 'out_of_stock'";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            System.err.println("❌ Error getting total books count: " + e.getMessage());
            e.printStackTrace();
        }
        
        return 0;
    }
    
    // Get out of stock books
    public List<Book> getOutOfStockBooks() {
        List<Book> books = new ArrayList<>();
        String sql = "SELECT b.*, c.name as category_name FROM books b " +
                    "LEFT JOIN categories c ON b.category_id = c.id " +
                    "WHERE b.stock = 0 OR b.status = 'out_of_stock' " +
                    "ORDER BY b.title";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                books.add(extractBookFromResultSet(rs));
            }
        } catch (SQLException e) {
            System.err.println("❌ Error getting out of stock books: " + e.getMessage());
            e.printStackTrace();
        }
        
        return books;
    }
    
    // Get low stock books
    public List<Book> getLowStockBooks(int threshold) {
        List<Book> books = new ArrayList<>();
        String sql = "SELECT b.*, c.name as category_name FROM books b " +
                    "LEFT JOIN categories c ON b.category_id = c.id " +
                    "WHERE b.stock > 0 AND b.stock <= ? AND b.status = 'active' " +
                    "ORDER BY b.stock ASC, b.title";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, threshold);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    books.add(extractBookFromResultSet(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("❌ Error getting low stock books: " + e.getMessage());
            e.printStackTrace();
        }
        
        return books;
    }
    
    // Get book images
    public List<String> getBookImages(int bookId) {
        List<String> images = new ArrayList<>();
        String sql = "SELECT image_url FROM book_images WHERE book_id = ? ORDER BY is_primary DESC, id";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, bookId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    images.add(rs.getString("image_url"));
                }
            }
        } catch (SQLException e) {
            System.err.println("❌ Error getting book images: " + e.getMessage());
            e.printStackTrace();
        }
        
        return images;
    }
    
    // Update book reference only
    public boolean updateBookReference(Book book) {
        String sql = "UPDATE books SET reference_no = ?, qr_code = ? WHERE id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, book.getReferenceNo());
            stmt.setString(2, book.getQrCode());
            stmt.setInt(3, book.getId());
            
            boolean success = stmt.executeUpdate() > 0;
            if (success) {
                System.out.println("✅ Updated reference for book ID " + book.getId() + " to: " + book.getReferenceNo());
            }
            return success;
        } catch (SQLException e) {
            System.err.println("❌ Error updating book reference: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    // Get books without reference numbers
    public List<Book> getBooksWithoutReferences() {
        List<Book> books = new ArrayList<>();
        String sql = "SELECT b.*, c.name as category_name FROM books b " +
                    "LEFT JOIN categories c ON b.category_id = c.id " +
                    "WHERE b.reference_no IS NULL OR b.reference_no = '' " +
                    "ORDER BY b.id";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                books.add(extractBookFromResultSet(rs));
            }
            System.out.println("📊 Found " + books.size() + " books without reference numbers");
        } catch (SQLException e) {
            System.err.println("❌ Error getting books without references: " + e.getMessage());
            e.printStackTrace();
        }
        
        return books;
    }
    
    // Check if reference number exists
    public boolean referenceNumberExists(String referenceNo) {
        String sql = "SELECT COUNT(*) FROM books WHERE reference_no = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, referenceNo);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        } catch (SQLException e) {
            System.err.println("❌ Error checking reference number existence: " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    // Update stock after sale
    public boolean updateBookStock(int bookId, int quantitySold) {
        String sql = "UPDATE books SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND stock >= ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, quantitySold);
            stmt.setInt(2, bookId);
            stmt.setInt(3, quantitySold);
            
            int affected = stmt.executeUpdate();
            
            if (affected > 0) {
                // Check if book is now out of stock and update status
                updateBookStatusBasedOnStock(bookId);
                System.out.println("✅ Updated stock for book ID " + bookId + " (sold: " + quantitySold + ")");
                return true;
            } else {
                System.out.println("❌ Could not update stock - insufficient quantity or book not found");
                return false;
            }
            
        } catch (SQLException e) {
            System.err.println("❌ Error updating book stock: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    // Update book status based on current stock
    private void updateBookStatusBasedOnStock(int bookId) {
        String sql = "UPDATE books SET status = CASE " +
                    "WHEN stock <= 0 THEN 'out_of_stock' " +
                    "WHEN stock > 0 AND status = 'out_of_stock' THEN 'active' " +
                    "ELSE status END " +
                    "WHERE id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, bookId);
            stmt.executeUpdate();
            
        } catch (SQLException e) {
            System.err.println("❌ Error updating book status: " + e.getMessage());
        }
    }
    
    // Get books with offers for references
    public List<Book> getBooksWithOffersForReferences() {
        List<Book> books = new ArrayList<>();
        String sql = "SELECT b.*, c.name as category_name FROM books b " +
                    "LEFT JOIN categories c ON b.category_id = c.id " +
                    "WHERE b.offer_price IS NOT NULL AND b.offer_price > 0 AND b.offer_price < b.price " +
                    "ORDER BY b.reference_no, b.title";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                books.add(extractBookFromResultSet(rs));
            }
        } catch (SQLException e) {
            System.err.println("❌ Error getting books with offers: " + e.getMessage());
            e.printStackTrace();
        }
        
        return books;
    }
    
    // Get all reference numbers for debugging
    public List<String> getAllReferenceNumbers() {
        List<String> references = new ArrayList<>();
        String sql = "SELECT reference_no FROM books WHERE reference_no IS NOT NULL AND reference_no != '' ORDER BY reference_no";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                references.add(rs.getString("reference_no"));
            }
            
            System.out.println("📊 Total reference numbers in database: " + references.size());
            
        } catch (SQLException e) {
            System.err.println("❌ Error fetching reference numbers: " + e.getMessage());
            e.printStackTrace();
        }
        
        return references;
    }
    
    // Create sample books with reference numbers (for testing)
    public boolean createSampleBooksWithReferences() {
        String[] sampleBooks = {
            "Advanced Mathematics for Grade 12|Dr. S. Perera|1250.00|15",
            "Physics Concepts and Applications|Prof. R. Silva|1100.00|8", 
            "English Literature Anthology|Dr. M. Fernando|980.00|12",
            "Chemistry Practical Guide|Dr. A. Jayasinghe|1350.00|6",
            "Biology for Advanced Level|Prof. N. Gunawardena|1200.00|10"
        };
        
        try {
            for (int i = 0; i < sampleBooks.length; i++) {
                String[] parts = sampleBooks[i].split("\\|");
                
                Book book = new Book();
                book.setTitle(parts[0]);
                book.setAuthor(parts[1]);
                book.setCategoryId(1); // Default category
                book.setPrice(new BigDecimal(parts[2]));
                book.setStock(Integer.parseInt(parts[3]));
                book.setDescription("Sample book for testing QR scanning system");
                book.setStatus("active");
                
                // Generate reference number
                String refNo = String.format("BK%d%06d", 
                    java.time.Year.now().getValue(), i + 1);
                book.setReferenceNo(refNo);
                book.setQrCode(refNo);
                
                if (createBook(book, new ArrayList<>())) {
                    System.out.println("✅ Created sample book: " + book.getTitle() + " (Ref: " + refNo + ")");
                } else {
                    System.out.println("❌ Failed to create sample book: " + book.getTitle());
                }
            }
            return true;
        } catch (Exception e) {
            System.err.println("❌ Error creating sample books: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    // Batch update references for books without them
    public int generateReferencesForBooksWithoutThem() {
        List<Book> booksWithoutRefs = getBooksWithoutReferences();
        int updated = 0;
        
        System.out.println("🔄 Generating references for " + booksWithoutRefs.size() + " books...");
        
        for (Book book : booksWithoutRefs) {
            String newRef = generateReferenceNumber();
            book.setReferenceNo(newRef);
            book.setQrCode(newRef);
            
            if (updateBookReference(book)) {
                updated++;
                System.out.println("✅ Generated reference " + newRef + " for: " + book.getTitle());
            } else {
                System.out.println("❌ Failed to generate reference for: " + book.getTitle());
            }
        }
        
        System.out.println("📊 Successfully generated " + updated + " reference numbers");
        return updated;
    }
    
    // Get book statistics
    public BookStatistics getBookStatistics() {
        BookStatistics stats = new BookStatistics();
        
        String sql = "SELECT " +
                    "COUNT(*) as total_books, " +
                    "SUM(CASE WHEN stock > 0 THEN 1 ELSE 0 END) as in_stock, " +
                    "SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as out_of_stock, " +
                    "SUM(CASE WHEN stock > 0 AND stock <= 5 THEN 1 ELSE 0 END) as low_stock, " +
                    "SUM(CASE WHEN reference_no IS NOT NULL AND reference_no != '' THEN 1 ELSE 0 END) as with_references, " +
                    "SUM(CASE WHEN offer_price IS NOT NULL AND offer_price > 0 THEN 1 ELSE 0 END) as with_offers " +
                    "FROM books";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            if (rs.next()) {
                stats.totalBooks = rs.getInt("total_books");
                stats.booksInStock = rs.getInt("in_stock");
                stats.booksOutOfStock = rs.getInt("out_of_stock");
                stats.booksLowStock = rs.getInt("low_stock");
                stats.booksWithReferences = rs.getInt("with_references");
                stats.booksWithOffers = rs.getInt("with_offers");
            }
            
        } catch (SQLException e) {
            System.err.println("❌ Error getting book statistics: " + e.getMessage());
            e.printStackTrace();
        }
        
        return stats;
    }
    
    // Extract book from result set with reference data (Enhanced)
    private Book extractBookFromResultSet(ResultSet rs) throws SQLException {
        Book book = new Book();
        book.setId(rs.getInt("id"));
        book.setTitle(rs.getString("title"));
        book.setAuthor(rs.getString("author"));
        book.setCategoryId(rs.getInt("category_id"));
        book.setCategoryName(rs.getString("category_name"));
        book.setPrice(rs.getBigDecimal("price"));
        book.setOfferPrice(rs.getBigDecimal("offer_price"));
        book.setStock(rs.getInt("stock"));
        book.setDescription(rs.getString("description"));
        book.setDetails(rs.getString("details"));
        book.setStatus(rs.getString("status"));
        book.setReferenceNo(rs.getString("reference_no"));
        book.setQrCode(rs.getString("qr_code"));
        
        // Handle timestamps safely
        try {
            book.setCreatedAt(rs.getTimestamp("created_at"));
            book.setUpdatedAt(rs.getTimestamp("updated_at"));
        } catch (SQLException e) {
            // Ignore if columns don't exist
        }
        
        // Load images for this book
        book.setImages(getBookImages(book.getId()));
        
        return book;
    }
    
    // Inner class for book statistics
    public static class BookStatistics {
        public int totalBooks;
        public int booksInStock;
        public int booksOutOfStock;
        public int booksLowStock;
        public int booksWithReferences;
        public int booksWithOffers;
        
        @Override
        public String toString() {
            return String.format(
                "Book Statistics:\n" +
                "  Total Books: %d\n" +
                "  In Stock: %d\n" +
                "  Out of Stock: %d\n" +
                "  Low Stock: %d\n" +
                "  With References: %d\n" +
                "  With Offers: %d",
                totalBooks, booksInStock, booksOutOfStock, booksLowStock, booksWithReferences, booksWithOffers
            );
        }
    }
}