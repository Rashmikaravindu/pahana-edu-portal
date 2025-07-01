// File: src/main/java/com/pahanaedu/servlets/ProductSearchServlet.java
// Complete Product Search Servlet with Enhanced Error Handling and Logging
package com.pahanaedu.servlets;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;
import com.pahanaedu.dao.BookDAO;
import com.pahanaedu.models.Book;

@WebServlet("/productSearch")
public class ProductSearchServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private BookDAO bookDAO;
    private Gson gson;
    
    @Override
    public void init() throws ServletException {
        try {
            bookDAO = new BookDAO();
            gson = new Gson();
            System.out.println("✅ ProductSearchServlet initialized successfully");
            
            // Print some debug info
            int bookCount = bookDAO.getTotalBooksCount();
            System.out.println("📊 Total books in database: " + bookCount);
            
            // Print sample reference numbers
            java.util.List<String> refs = bookDAO.getAllReferenceNumbers();
            if (!refs.isEmpty()) {
                System.out.println("📋 Sample reference numbers:");
                for (int i = 0; i < Math.min(5, refs.size()); i++) {
                    System.out.println("   - " + refs.get(i));
                }
            } else {
                System.out.println("⚠️ No reference numbers found in database");
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error initializing ProductSearchServlet: " + e.getMessage());
            e.printStackTrace();
            throw new ServletException("Failed to initialize ProductSearchServlet", e);
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        System.out.println("🔍 ProductSearchServlet GET request received");
        
        // Check cashier session
        if (!isCashierLoggedIn(request)) {
            System.out.println("❌ Unauthorized access attempt");
            sendErrorResponse(response, "Unauthorized access - Cashier login required");
            return;
        }
        
        String referenceNo = request.getParameter("reference");
        String action = request.getParameter("action");
        
        System.out.println("📝 Search parameters - Reference: '" + referenceNo + "', Action: '" + action + "'");
        
        // Handle different actions
        if ("debug".equals(action)) {
            handleDebugRequest(response);
            return;
        } else if ("stats".equals(action)) {
            handleStatsRequest(response);
            return;
        } else if ("generateRefs".equals(action)) {
            handleGenerateReferencesRequest(response);
            return;
        }
        
        // Validation
        if (isEmpty(referenceNo)) {
            System.out.println("❌ Empty reference number provided");
            sendErrorResponse(response, "Reference number is required");
            return;
        }
        
        try {
            System.out.println("🔍 Searching for reference: '" + referenceNo + "'");
            
            // Search by reference number first
            Book book = bookDAO.getBookByReferenceNo(referenceNo.trim());
            
            // If not found by reference, try by QR code
            if (book == null) {
                System.out.println("🔍 Not found by reference, trying QR code search...");
                book = bookDAO.getBookByQrCode(referenceNo.trim());
            }
            
            if (book != null) {
                System.out.println("✅ Book found: " + book.getTitle() + " (ID: " + book.getId() + ")");
                System.out.println("📊 Book details - Stock: " + book.getStock() + ", Status: " + book.getStatus());
                
                // Check if book is available
                if ("active".equals(book.getStatus()) && book.getStock() > 0) {
                    sendSuccessResponse(response, "Product found", book);
                } else if (book.getStock() <= 0) {
                    System.out.println("⚠️ Book is out of stock");
                    // Still send the book data but with out of stock message
                    sendSuccessResponse(response, "Product found but out of stock", book);
                } else {
                    System.out.println("⚠️ Book status is: " + book.getStatus());
                    sendErrorResponse(response, "Product is not available (Status: " + book.getStatus() + ")");
                }
            } else {
                System.out.println("❌ No book found with reference: '" + referenceNo + "'");
                sendErrorResponse(response, "Product not found with reference: " + referenceNo);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error searching for product: " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error searching for product: " + e.getMessage());
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        System.out.println("🔍 ProductSearchServlet POST request received");
        
        // Check cashier session
        if (!isCashierLoggedIn(request)) {
            sendErrorResponse(response, "Unauthorized access - Cashier login required");
            return;
        }
        
        String action = request.getParameter("action");
        System.out.println("📝 POST Action: " + action);
        
        switch (action != null ? action : "") {
            case "searchMultiple":
                searchMultipleProducts(request, response);
                break;
            case "updateStock":
                updateBookStock(request, response);
                break;
            case "createSamples":
                createSampleBooks(request, response);
                break;
            default:
                sendErrorResponse(response, "Invalid action: " + action);
        }
    }
    
    // Handle debug information request
    private void handleDebugRequest(HttpServletResponse response) throws IOException {
        try {
            BookDAO.BookStatistics stats = bookDAO.getBookStatistics();
            java.util.List<String> sampleRefs = bookDAO.getAllReferenceNumbers();
            
            DebugInfo debugInfo = new DebugInfo();
            debugInfo.statistics = stats;
            debugInfo.sampleReferences = sampleRefs.subList(0, Math.min(10, sampleRefs.size()));
            debugInfo.totalReferences = sampleRefs.size();
            debugInfo.booksWithoutReferences = bookDAO.getBooksWithoutReferences().size();
            
            sendSuccessResponse(response, "Debug information", debugInfo);
        } catch (Exception e) {
            sendErrorResponse(response, "Error getting debug info: " + e.getMessage());
        }
    }
    
    // Handle statistics request
    private void handleStatsRequest(HttpServletResponse response) throws IOException {
        try {
            BookDAO.BookStatistics stats = bookDAO.getBookStatistics();
            sendSuccessResponse(response, "Book statistics", stats);
        } catch (Exception e) {
            sendErrorResponse(response, "Error getting statistics: " + e.getMessage());
        }
    }
    
    // Handle generate references request
    private void handleGenerateReferencesRequest(HttpServletResponse response) throws IOException {
        try {
            int generated = bookDAO.generateReferencesForBooksWithoutThem();
            GenerateRefsResult result = new GenerateRefsResult();
            result.generatedCount = generated;
            result.message = "Successfully generated " + generated + " reference numbers";
            
            sendSuccessResponse(response, "References generated", result);
        } catch (Exception e) {
            sendErrorResponse(response, "Error generating references: " + e.getMessage());
        }
    }
    
    // Search multiple products (for batch operations)
    private void searchMultipleProducts(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String[] references = request.getParameterValues("references[]");
        
        if (references == null || references.length == 0) {
            sendErrorResponse(response, "No reference numbers provided");
            return;
        }
        
        try {
            java.util.List<Book> foundProducts = new java.util.ArrayList<>();
            java.util.List<String> notFoundReferences = new java.util.ArrayList<>();
            
            for (String ref : references) {
                if (!isEmpty(ref)) {
                    Book book = bookDAO.getBookByReferenceNo(ref.trim());
                    if (book == null) {
                        book = bookDAO.getBookByQrCode(ref.trim());
                    }
                    
                    if (book != null && "active".equals(book.getStatus()) && book.getStock() > 0) {
                        foundProducts.add(book);
                    } else {
                        notFoundReferences.add(ref.trim());
                    }
                }
            }
            
            // Create response object
            MultiSearchResponse result = new MultiSearchResponse();
            result.foundProducts = foundProducts;
            result.notFoundReferences = notFoundReferences;
            result.totalSearched = references.length;
            result.totalFound = foundProducts.size();
            
            sendSuccessResponse(response, "Multi-search completed", result);
            
        } catch (Exception e) {
            System.err.println("❌ Error in multi-search: " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error searching products: " + e.getMessage());
        }
    }
    
    // Update book stock after sale
    private void updateBookStock(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String bookIdParam = request.getParameter("bookId");
        String quantityParam = request.getParameter("quantity");
        
        if (isEmpty(bookIdParam) || isEmpty(quantityParam)) {
            sendErrorResponse(response, "Book ID and quantity are required");
            return;
        }
        
        try {
            int bookId = Integer.parseInt(bookIdParam);
            int quantity = Integer.parseInt(quantityParam);
            
            if (bookDAO.updateBookStock(bookId, quantity)) {
                StockUpdateResult result = new StockUpdateResult();
                result.bookId = bookId;
                result.quantitySold = quantity;
                result.message = "Stock updated successfully";
                
                sendSuccessResponse(response, "Stock updated", result);
            } else {
                sendErrorResponse(response, "Failed to update stock - insufficient quantity or book not found");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid book ID or quantity format");
        } catch (Exception e) {
            sendErrorResponse(response, "Error updating stock: " + e.getMessage());
        }
    }
    
    // Create sample books for testing
    private void createSampleBooks(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        try {
            boolean success = bookDAO.createSampleBooksWithReferences();
            
            if (success) {
                sendSuccessResponse(response, "Sample books created successfully", null);
            } else {
                sendErrorResponse(response, "Failed to create sample books");
            }
            
        } catch (Exception e) {
            sendErrorResponse(response, "Error creating sample books: " + e.getMessage());
        }
    }
    
    // ========== UTILITY METHODS ==========
    
    private boolean isCashierLoggedIn(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            System.out.println("❌ No session found");
            return false;
        }
        
        String userRole = (String) session.getAttribute("userRole");
        String userEmail = (String) session.getAttribute("userEmail");
        
        System.out.println("👤 Session check - Role: '" + userRole + "', Email: '" + userEmail + "'");
        
        boolean isAuthorized = "CASHIER".equals(userRole) || "ADMIN".equals(userRole);
        
        if (!isAuthorized) {
            System.out.println("❌ User role '" + userRole + "' is not authorized");
        }
        
        return isAuthorized;
    }
    
    private boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }
    
    private void sendJsonResponse(HttpServletResponse response, Object data) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Cache-Control", "no-cache");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        
        PrintWriter out = response.getWriter();
        String jsonResponse = gson.toJson(data);
        
        System.out.println("📤 Sending JSON response: " + 
            (jsonResponse.length() > 200 ? jsonResponse.substring(0, 200) + "..." : jsonResponse));
        
        out.print(jsonResponse);
        out.flush();
    }
    
    private void sendSuccessResponse(HttpServletResponse response, String message, Object data) throws IOException {
        response.setStatus(HttpServletResponse.SC_OK);
        ApiResponse apiResponse = new ApiResponse(true, message, data);
        sendJsonResponse(response, apiResponse);
    }
    
    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        ApiResponse apiResponse = new ApiResponse(false, message, null);
        sendJsonResponse(response, apiResponse);
    }
    
    // ========== INNER CLASSES FOR JSON RESPONSES ==========
    
    public static class ApiResponse {
        public boolean success;
        public String message;
        public Object data;
        public long timestamp;
        
        public ApiResponse(boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.timestamp = System.currentTimeMillis();
        }
    }
    
    public static class MultiSearchResponse {
        public java.util.List<Book> foundProducts;
        public java.util.List<String> notFoundReferences;
        public int totalSearched;
        public int totalFound;
    }
    
    public static class DebugInfo {
        public BookDAO.BookStatistics statistics;
        public java.util.List<String> sampleReferences;
        public int totalReferences;
        public int booksWithoutReferences;
    }
    
    public static class StockUpdateResult {
        public int bookId;
        public int quantitySold;
        public String message;
    }
    
    public static class GenerateRefsResult {
        public int generatedCount;
        public String message;
    }
}