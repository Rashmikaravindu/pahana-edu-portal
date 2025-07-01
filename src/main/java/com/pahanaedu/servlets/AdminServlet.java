// File: src/main/java/com/pahanaedu/servlets/AdminServlet.java
// Complete Enhanced AdminServlet with Images, Offers, and File Upload Support
package com.pahanaedu.servlets;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.Part;

import com.google.gson.Gson;
import com.pahanaedu.dao.UserDAO;
import com.pahanaedu.dao.BookDAO;
import com.pahanaedu.dao.CategoryDAO;
import com.pahanaedu.models.User;
import com.pahanaedu.models.Book;
import com.pahanaedu.models.Category;

@WebServlet("/admin")
@MultipartConfig(
    fileSizeThreshold = 1024 * 1024 * 1, // 1 MB
    maxFileSize = 1024 * 1024 * 10,      // 10 MB
    maxRequestSize = 1024 * 1024 * 50    // 50 MB
)
public class AdminServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private UserDAO userDAO;
    private BookDAO bookDAO;
    private CategoryDAO categoryDAO;
    private Gson gson;
    
    // Image upload configuration
    private static final String UPLOAD_DIR = "images" + File.separator + "books";
    private static final String[] ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif"};
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    
    @Override
    public void init() throws ServletException {
        userDAO = new UserDAO();
        bookDAO = new BookDAO();
        categoryDAO = new CategoryDAO();
        gson = new Gson();
        
        // Create upload directory if it doesn't exist
        createUploadDirectory();
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check admin session
        if (!isAdminLoggedIn(request)) {
            sendErrorResponse(response, "Unauthorized access");
            return;
        }
        
        String action = request.getParameter("action");
        
        switch (action != null ? action : "") {
            case "getCustomers":
                getCustomers(response);
                break;
            case "getCashiers":
                getCashiers(response);
                break;
            case "getUser":
                getUser(request, response);
                break;
            case "getStats":
                getStats(response);
                break;
            // Enhanced Inventory Management GET actions
            case "getBooks":
                getBooks(response);
                break;
            case "getBook":
                getBook(request, response);
                break;
            case "getCategories":
                getCategories(response);
                break;
            case "getCategoriesWithBookCount":
                getCategoriesWithBookCount(response);
                break;
            case "getCategory":
                getCategory(request, response);
                break;
            case "getOutOfStockBooks":
                getOutOfStockBooks(response);
                break;
            case "getLowStockBooks":
                getLowStockBooks(response);
                break;
            default:
                sendErrorResponse(response, "Invalid action");
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check admin session
        if (!isAdminLoggedIn(request)) {
            sendErrorResponse(response, "Unauthorized access");
            return;
        }
        
        String action = request.getParameter("action");
        
        switch (action != null ? action : "") {
            case "addCustomer":
                addCustomer(request, response);
                break;
            case "addCashier":
                addCashier(request, response);
                break;
            case "updateUser":
                updateUser(request, response);
                break;
            case "deleteUser":
                deleteUser(request, response);
                break;
            // Enhanced Inventory Management POST actions
            case "addBook":
                addBookWithImages(request, response);
                break;
            case "updateBook":
                updateBookWithImages(request, response);
                break;
            case "deleteBook":
                deleteBook(request, response);
                break;
            case "addCategory":
                addCategory(request, response);
                break;
            case "updateCategory":
                updateCategory(request, response);
                break;
            case "deleteCategory":
                deleteCategory(request, response);
                break;
            default:
                sendErrorResponse(response, "Invalid action");
        }
    }
    
    // ========== CUSTOMER OPERATIONS ==========
    
    private void getCustomers(HttpServletResponse response) throws IOException {
        List<User> customers = userDAO.getUsersByRole(User.ROLE_CUSTOMER);
        sendJsonResponse(response, customers);
    }
    
    private void addCustomer(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String firstName = request.getParameter("firstName");
        String lastName = request.getParameter("lastName");
        String phone = request.getParameter("phone");
        String status = request.getParameter("status");
        String email = request.getParameter("email");
        String password = request.getParameter("password");
        
        // Validation
        if (isEmpty(firstName) || isEmpty(lastName) || isEmpty(email) || isEmpty(password)) {
            sendErrorResponse(response, "All required fields must be provided");
            return;
        }
        
        if (userDAO.emailExists(email)) {
            sendErrorResponse(response, "Email already exists");
            return;
        }
        
        // Create customer
        User customer = new User();
        customer.setFirstName(firstName);
        customer.setLastName(lastName);
        customer.setPhone(phone);
        customer.setStatus(status != null ? status : User.STATUS_ACTIVE);
        customer.setEmail(email);
        customer.setPassword(password);
        customer.setRole(User.ROLE_CUSTOMER);
        
        if (userDAO.createUserByAdmin(customer)) {
            sendSuccessResponse(response, "Customer added successfully");
        } else {
            sendErrorResponse(response, "Failed to add customer");
        }
    }
    
    // ========== CASHIER OPERATIONS ==========
    
    private void getCashiers(HttpServletResponse response) throws IOException {
        List<User> cashiers = userDAO.getUsersByRole(User.ROLE_CASHIER);
        sendJsonResponse(response, cashiers);
    }
    
    private void addCashier(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String firstName = request.getParameter("firstName");
        String lastName = request.getParameter("lastName");
        String phone = request.getParameter("phone");
        String status = request.getParameter("status");
        String email = request.getParameter("email");
        String password = request.getParameter("password");
        
        // Validation
        if (isEmpty(firstName) || isEmpty(lastName) || isEmpty(email) || isEmpty(password)) {
            sendErrorResponse(response, "All required fields must be provided");
            return;
        }
        
        if (userDAO.emailExists(email)) {
            sendErrorResponse(response, "Email already exists");
            return;
        }
        
        // Create cashier
        User cashier = new User();
        cashier.setFirstName(firstName);
        cashier.setLastName(lastName);
        cashier.setPhone(phone);
        cashier.setStatus(status != null ? status : User.STATUS_ACTIVE);
        cashier.setEmail(email);
        cashier.setPassword(password);
        cashier.setRole(User.ROLE_CASHIER);
        
        if (userDAO.createUserByAdmin(cashier)) {
            sendSuccessResponse(response, "Cashier added successfully");
        } else {
            sendErrorResponse(response, "Failed to add cashier");
        }
    }
    
    // ========== GENERAL USER OPERATIONS ==========
    
    private void getUser(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String idParam = request.getParameter("id");
        if (isEmpty(idParam)) {
            sendErrorResponse(response, "User ID is required");
            return;
        }
        
        try {
            int id = Integer.parseInt(idParam);
            User user = userDAO.getUserById(id);
            
            if (user != null) {
                sendJsonResponse(response, user);
            } else {
                sendErrorResponse(response, "User not found");
            }
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid user ID");
        }
    }
    
    private void updateUser(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String idParam = request.getParameter("id");
        String firstName = request.getParameter("firstName");
        String lastName = request.getParameter("lastName");
        String phone = request.getParameter("phone");
        String status = request.getParameter("status");
        String email = request.getParameter("email");
        
        // Validation
        if (isEmpty(idParam) || isEmpty(firstName) || isEmpty(lastName) || isEmpty(email)) {
            sendErrorResponse(response, "All required fields must be provided");
            return;
        }
        
        try {
            int id = Integer.parseInt(idParam);
            
            // Check if email exists for other users
            if (userDAO.emailExistsExcluding(email, id)) {
                sendErrorResponse(response, "Email already exists");
                return;
            }
            
            User user = new User();
            user.setId(id);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setPhone(phone);
            user.setStatus(status != null ? status : User.STATUS_ACTIVE);
            user.setEmail(email);
            
            if (userDAO.updateUser(user)) {
                sendSuccessResponse(response, "User updated successfully");
            } else {
                sendErrorResponse(response, "Failed to update user");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid user ID");
        }
    }
    
    private void deleteUser(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String idParam = request.getParameter("id");
        if (isEmpty(idParam)) {
            sendErrorResponse(response, "User ID is required");
            return;
        }
        
        try {
            int id = Integer.parseInt(idParam);
            
            if (userDAO.deleteUser(id)) {
                sendSuccessResponse(response, "User deleted successfully");
            } else {
                sendErrorResponse(response, "Failed to delete user");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid user ID");
        }
    }
    
    // ========== ENHANCED BOOK OPERATIONS WITH IMAGES AND OFFERS ==========
    
    private void getBooks(HttpServletResponse response) throws IOException {
        List<Book> books = bookDAO.getAllBooks();
        sendJsonResponse(response, books);
    }
    
    private void getBook(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String idParam = request.getParameter("id");
        if (isEmpty(idParam)) {
            sendErrorResponse(response, "Book ID is required");
            return;
        }
        
        try {
            int id = Integer.parseInt(idParam);
            Book book = bookDAO.getBookById(id);
            
            if (book != null) {
                sendJsonResponse(response, book);
            } else {
                sendErrorResponse(response, "Book not found");
            }
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid book ID");
        }
    }
    
    private void getOutOfStockBooks(HttpServletResponse response) throws IOException {
        List<Book> outOfStockBooks = bookDAO.getOutOfStockBooks();
        sendJsonResponse(response, outOfStockBooks);
    }
    
    private void getLowStockBooks(HttpServletResponse response) throws IOException {
        List<Book> lowStockBooks = bookDAO.getLowStockBooks(5); // 5 or less in stock
        sendJsonResponse(response, lowStockBooks);
    }
    
 // Clean addBookWithImages method for AdminServlet - No Debug Messages
 // Replace your addBookWithImages method with this:

 private void addBookWithImages(HttpServletRequest request, HttpServletResponse response) 
         throws IOException, ServletException {
     
     String title = request.getParameter("title");
     String author = request.getParameter("author");
     String categoryIdParam = request.getParameter("categoryId");
     String newCategoryName = request.getParameter("newCategoryName");
     String priceParam = request.getParameter("price");
     String offerPriceParam = request.getParameter("offerPrice");
     String stockParam = request.getParameter("stock");
     String description = request.getParameter("description");
     String details = request.getParameter("details");
     String status = request.getParameter("status");
     
     // Validation
     if (isEmpty(title) || isEmpty(author) || isEmpty(priceParam) || isEmpty(stockParam)) {
         sendErrorResponse(response, "Title, author, price, and stock are required");
         return;
     }
     
     try {
         BigDecimal price = new BigDecimal(priceParam);
         BigDecimal offerPrice = null;
         
         // Validate offer price
         if (!isEmpty(offerPriceParam)) {
             offerPrice = new BigDecimal(offerPriceParam);
             if (offerPrice.compareTo(price) >= 0) {
                 sendErrorResponse(response, "Offer price must be less than regular price");
                 return;
             }
         }
         
         int stock = Integer.parseInt(stockParam);
         int categoryId = 0;
         
         // Handle category - either existing or new
         if (!isEmpty(newCategoryName)) {
             Category existingCategory = categoryDAO.getCategoryByName(newCategoryName);
             if (existingCategory != null) {
                 categoryId = existingCategory.getId();
             } else {
                 // Create new category
                 Category newCategory = new Category();
                 newCategory.setName(newCategoryName);
                 newCategory.setDescription("Auto-created category");
                 newCategory.setStatus("active");
                 
                 categoryId = categoryDAO.createCategoryAndGetId(newCategory);
                 if (categoryId == -1) {
                     sendErrorResponse(response, "Failed to create new category");
                     return;
                 }
             }
         } else if (!isEmpty(categoryIdParam)) {
             categoryId = Integer.parseInt(categoryIdParam);
         }
         
         // Handle image uploads
         List<String> imageUrls = new ArrayList<>();
         try {
             if (hasImageUploads(request)) {
                 imageUrls = handleImageUploads(request);
             }
         } catch (Exception imgEx) {
             // Continue without images if upload fails
             imageUrls = new ArrayList<>();
         }
         
         // Create book
         Book book = new Book();
         book.setTitle(title);
         book.setAuthor(author);
         book.setCategoryId(categoryId);
         book.setPrice(price);
         book.setOfferPrice(offerPrice);
         book.setStock(stock);
         book.setDescription(description);
         book.setDetails(details);
         book.setStatus(status != null ? status : "active");
         
         // Auto-update status based on stock
         if (stock <= 0) {
             book.setStatus("out_of_stock");
         }
         
         if (bookDAO.createBook(book, imageUrls)) {
             sendSuccessResponse(response, "Book added successfully");
         } else {
             sendErrorResponse(response, "Failed to add book to database");
         }
         
     } catch (NumberFormatException e) {
         sendErrorResponse(response, "Invalid price, stock, or category ID format");
     } catch (Exception e) {
         sendErrorResponse(response, "Error processing request: " + e.getMessage());
     }
 }
    
    private void updateBookWithImages(HttpServletRequest request, HttpServletResponse response) 
            throws IOException, ServletException {
        
        String idParam = request.getParameter("id");
        String title = request.getParameter("title");
        String author = request.getParameter("author");
        String categoryIdParam = request.getParameter("categoryId");
        String newCategoryName = request.getParameter("newCategoryName");
        String priceParam = request.getParameter("price");
        String offerPriceParam = request.getParameter("offerPrice");
        String stockParam = request.getParameter("stock");
        String description = request.getParameter("description");
        String details = request.getParameter("details");
        String status = request.getParameter("status");
        
        // Validation
        if (isEmpty(idParam) || isEmpty(title) || isEmpty(author) || 
            isEmpty(priceParam) || isEmpty(stockParam)) {
            sendErrorResponse(response, "All required fields must be provided");
            return;
        }
        
        try {
            int id = Integer.parseInt(idParam);
            BigDecimal price = new BigDecimal(priceParam);
            BigDecimal offerPrice = null;
            
            // Validate offer price
            if (!isEmpty(offerPriceParam)) {
                offerPrice = new BigDecimal(offerPriceParam);
                if (offerPrice.compareTo(price) >= 0) {
                    sendErrorResponse(response, "Offer price must be less than regular price");
                    return;
                }
            }
            
            int stock = Integer.parseInt(stockParam);
            int categoryId = 0;
            
            // Handle category - either existing or new
            if (!isEmpty(newCategoryName)) {
                Category existingCategory = categoryDAO.getCategoryByName(newCategoryName);
                if (existingCategory != null) {
                    categoryId = existingCategory.getId();
                } else {
                    // Create new category
                    Category newCategory = new Category();
                    newCategory.setName(newCategoryName);
                    newCategory.setDescription("Auto-created category");
                    newCategory.setStatus(Category.STATUS_ACTIVE);
                    
                    categoryId = categoryDAO.createCategoryAndGetId(newCategory);
                    if (categoryId == -1) {
                        sendErrorResponse(response, "Failed to create new category");
                        return;
                    }
                }
            } else if (!isEmpty(categoryIdParam)) {
                categoryId = Integer.parseInt(categoryIdParam);
            }
            
            // Handle image uploads (only if new images are provided)
            List<String> imageUrls = null;
            if (hasImageUploads(request)) {
                imageUrls = handleImageUploads(request);
            }
            
            // Update book
            Book book = new Book();
            book.setId(id);
            book.setTitle(title);
            book.setAuthor(author);
            book.setCategoryId(categoryId);
            book.setPrice(price);
            book.setOfferPrice(offerPrice);
            book.setStock(stock);
            book.setDescription(description);
            book.setDetails(details);
            book.setStatus(status != null ? status : Book.STATUS_ACTIVE);
            
            // Auto-update status based on stock
            if (stock <= 0) {
                book.setStatus(Book.STATUS_OUT_OF_STOCK);
            }
            
            if (bookDAO.updateBook(book, imageUrls)) {
                sendSuccessResponse(response, "Book updated successfully");
            } else {
                sendErrorResponse(response, "Failed to update book");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid ID, price, stock, or category ID");
        } catch (Exception e) {
            sendErrorResponse(response, "Error processing request: " + e.getMessage());
        }
    }
    
    private void deleteBook(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String idParam = request.getParameter("id");
        if (isEmpty(idParam)) {
            sendErrorResponse(response, "Book ID is required");
            return;
        }
        
        try {
            int id = Integer.parseInt(idParam);
            
            if (bookDAO.deleteBook(id)) {
                sendSuccessResponse(response, "Book deleted successfully");
            } else {
                sendErrorResponse(response, "Failed to delete book");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid book ID");
        }
    }
    
    // ========== IMAGE UPLOAD HANDLING ==========
    
    private void createUploadDirectory() {
        try {
            String uploadPath = getServletContext().getRealPath("") + File.separator + UPLOAD_DIR;
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
                System.out.println("✅ Created upload directory: " + uploadPath);
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to create upload directory: " + e.getMessage());
        }
    }
    
    private boolean hasImageUploads(HttpServletRequest request) throws IOException, ServletException {
        try {
            return request.getParts().stream()
                    .anyMatch(part -> "bookImages".equals(part.getName()) && part.getSize() > 0);
        } catch (Exception e) {
            return false;
        }
    }
    
    private List<String> handleImageUploads(HttpServletRequest request) 
            throws IOException, ServletException {
        
        List<String> imageUrls = new ArrayList<>();
        String uploadPath = getServletContext().getRealPath("") + File.separator + UPLOAD_DIR;
        
        try {
            // Get all image parts
            for (Part part : request.getParts()) {
                if ("bookImages".equals(part.getName()) && part.getSize() > 0) {
                    
                    // Validate file
                    String fileName = getFileName(part);
                    if (!isValidImageFile(fileName, part.getSize())) {
                        continue; // Skip invalid files
                    }
                    
                    // Generate unique filename
                    String fileExtension = getFileExtension(fileName);
                    String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
                    
                    // Save file
                    String filePath = uploadPath + File.separator + uniqueFileName;
                    part.write(filePath);
                    
                    // Add relative URL to list
                    String imageUrl = UPLOAD_DIR.replace(File.separator, "/") + "/" + uniqueFileName;
                    imageUrls.add(imageUrl);
                    
                    // Limit to 5 images
                    if (imageUrls.size() >= 5) {
                        break;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error handling image uploads: " + e.getMessage());
        }
        
        return imageUrls;
    }
    
    private String getFileName(Part part) {
        String contentDisposition = part.getHeader("content-disposition");
        for (String content : contentDisposition.split(";")) {
            if (content.trim().startsWith("filename")) {
                return content.substring(content.indexOf('=') + 1).trim().replace("\"", "");
            }
        }
        return null;
    }
    
    private boolean isValidImageFile(String fileName, long fileSize) {
        if (fileName == null || fileSize > MAX_FILE_SIZE) {
            return false;
        }
        
        String lowerFileName = fileName.toLowerCase();
        for (String ext : ALLOWED_EXTENSIONS) {
            if (lowerFileName.endsWith(ext)) {
                return true;
            }
        }
        return false;
    }
    
    private String getFileExtension(String fileName) {
        if (fileName == null) return ".jpg";
        int lastDot = fileName.lastIndexOf('.');
        return lastDot > 0 ? fileName.substring(lastDot) : ".jpg";
    }
    
    // ========== CATEGORY OPERATIONS ==========
    
    private void getCategories(HttpServletResponse response) throws IOException {
        List<Category> categories = categoryDAO.getAllCategories();
        sendJsonResponse(response, categories);
    }
    
    private void getCategoriesWithBookCount(HttpServletResponse response) throws IOException {
        List<Category> categories = categoryDAO.getCategoriesWithBookCount();
        sendJsonResponse(response, categories);
    }
    
    private void getCategory(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String idParam = request.getParameter("id");
        if (isEmpty(idParam)) {
            sendErrorResponse(response, "Category ID is required");
            return;
        }
        
        try {
            int id = Integer.parseInt(idParam);
            Category category = categoryDAO.getCategoryById(id);
            
            if (category != null) {
                sendJsonResponse(response, category);
            } else {
                sendErrorResponse(response, "Category not found");
            }
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid category ID");
        }
    }
    
    private void addCategory(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String name = request.getParameter("name");
        String description = request.getParameter("description");
        String status = request.getParameter("status");
        
        // Validation
        if (isEmpty(name)) {
            sendErrorResponse(response, "Category name is required");
            return;
        }
        
        if (categoryDAO.categoryNameExists(name)) {
            sendErrorResponse(response, "Category name already exists");
            return;
        }
        
        // Create category
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setStatus(status != null ? status : Category.STATUS_ACTIVE);
        
        if (categoryDAO.createCategory(category)) {
            sendSuccessResponse(response, "Category added successfully");
        } else {
            sendErrorResponse(response, "Failed to add category");
        }
    }
    
    private void updateCategory(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String idParam = request.getParameter("id");
        String name = request.getParameter("name");
        String description = request.getParameter("description");
        String status = request.getParameter("status");
        
        // Validation
        if (isEmpty(idParam) || isEmpty(name)) {
            sendErrorResponse(response, "Category ID and name are required");
            return;
        }
        
        try {
            int id = Integer.parseInt(idParam);
            
            // Check if name exists for other categories
            if (categoryDAO.categoryNameExistsExcluding(name, id)) {
                sendErrorResponse(response, "Category name already exists");
                return;
            }
            
            Category category = new Category();
            category.setId(id);
            category.setName(name);
            category.setDescription(description);
            category.setStatus(status != null ? status : Category.STATUS_ACTIVE);
            
            if (categoryDAO.updateCategory(category)) {
                sendSuccessResponse(response, "Category updated successfully");
            } else {
                sendErrorResponse(response, "Failed to update category");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid category ID");
        }
    }
    
    private void deleteCategory(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String idParam = request.getParameter("id");
        if (isEmpty(idParam)) {
            sendErrorResponse(response, "Category ID is required");
            return;
        }
        
        try {
            int id = Integer.parseInt(idParam);
            
            if (categoryDAO.deleteCategory(id)) {
                sendSuccessResponse(response, "Category deleted successfully");
            } else {
                sendErrorResponse(response, "Cannot delete category. It may contain books or not exist.");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid category ID");
        }
    }
    
    // ========== ENHANCED STATISTICS ==========
    
    private void getStats(HttpServletResponse response) throws IOException {
        int customerCount = userDAO.getUserCountByRole(User.ROLE_CUSTOMER);
        int cashierCount = userDAO.getUserCountByRole(User.ROLE_CASHIER);
        int bookCount = bookDAO.getTotalBooksCount();
        int outOfStockCount = bookDAO.getOutOfStockBooks().size();
        int lowStockCount = bookDAO.getLowStockBooks(5).size();
        
        // Create enhanced stats object
        EnhancedAdminStats stats = new EnhancedAdminStats();
        stats.totalCustomers = customerCount;
        stats.totalCashiers = cashierCount;
        stats.totalUsers = customerCount + cashierCount;
        stats.totalBooks = bookCount;
        stats.outOfStockBooks = outOfStockCount;
        stats.lowStockBooks = lowStockCount;
        
        sendJsonResponse(response, stats);
    }
    
    // ========== UTILITY METHODS ==========
    
    private boolean isAdminLoggedIn(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return false;
        
        String userRole = (String) session.getAttribute("userRole");
        return "ADMIN".equals(userRole);
    }
    
    private boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }
    
    private void sendJsonResponse(HttpServletResponse response, Object data) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        out.print(gson.toJson(data));
        out.flush();
    }
    
    private void sendSuccessResponse(HttpServletResponse response, String message) throws IOException {
        ApiResponse apiResponse = new ApiResponse(true, message, null);
        sendJsonResponse(response, apiResponse);
    }
    
    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        ApiResponse apiResponse = new ApiResponse(false, message, null);
        sendJsonResponse(response, apiResponse);
    }
    
    // ========== INNER CLASSES FOR JSON RESPONSES ==========
    
    public static class ApiResponse {
        public boolean success;
        public String message;
        public Object data;
        
        public ApiResponse(boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }
    }
    
    public static class EnhancedAdminStats {
        public int totalCustomers;
        public int totalCashiers;
        public int totalUsers;
        public int totalBooks;
        public int outOfStockBooks;
        public int lowStockBooks;
    }
    
    // Legacy support for existing AdminStats
    public static class AdminStats {
        public int totalCustomers;
        public int totalCashiers;
        public int totalUsers;
        public int totalBooks;
    }
}