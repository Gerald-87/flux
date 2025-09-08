-- =====================================================
-- FLUX POS SYSTEM - COMPREHENSIVE SQL DATABASE SCHEMA
-- =====================================================
-- This schema supports a multi-tenant POS system with:
-- - Multi-vendor architecture
-- - Role-based access (superadmin, vendor, cashier)
-- - Time-based cashier access control
-- - Complete inventory management
-- - Sales and purchase tracking
-- - Customer loyalty programs
-- - Stock management and auditing
-- =====================================================

-- Create database
CREATE DATABASE flux_pos;
USE flux_pos;

-- =====================================================
-- CORE USER & AUTHENTICATION TABLES
-- =====================================================

-- Vendors table (business owners)
CREATE TABLE vendors (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    business_type VARCHAR(100),
    subscription_plan ENUM('trial', 'basic', 'standard', 'premium') DEFAULT 'trial',
    subscription_status ENUM('trialing', 'active', 'inactive', 'suspended') DEFAULT 'trialing',
    subscription_expiry DATETIME,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vendor_email (email),
    INDEX idx_vendor_status (subscription_status)
);

-- Vendor settings
CREATE TABLE vendor_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    vendor_id VARCHAR(36) NOT NULL,
    tax_rate DECIMAL(5,4) DEFAULT 0.0800,
    currency VARCHAR(3) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'UTC',
    receipt_header VARCHAR(255),
    receipt_footer VARCHAR(255),
    loyalty_enabled BOOLEAN DEFAULT TRUE,
    loyalty_points_per_dollar DECIMAL(5,2) DEFAULT 1.00,
    loyalty_redemption_rate DECIMAL(5,4) DEFAULT 0.0100,
    loyalty_minimum_points INT DEFAULT 100,
    low_stock_alert BOOLEAN DEFAULT TRUE,
    low_stock_threshold INT DEFAULT 10,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    daily_reports BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    UNIQUE KEY unique_vendor_settings (vendor_id)
);

-- Users table (superadmin, vendors, cashiers)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('superadmin', 'vendor', 'cashier') NOT NULL,
    vendor_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    terminal_id VARCHAR(100),
    assigned_locations JSON, -- Array of location names
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    INDEX idx_user_email (email),
    INDEX idx_user_vendor (vendor_id),
    INDEX idx_user_role (role)
);

-- Cashier work schedules (time-based access control)
CREATE TABLE cashier_schedules (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    check_in_time TIME NOT NULL,
    check_out_time TIME NOT NULL,
    work_days JSON NOT NULL, -- Array of numbers 0-6 (Sunday-Saturday)
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_schedule (user_id)
);

-- =====================================================
-- PRODUCT & INVENTORY MANAGEMENT
-- =====================================================

-- Products table
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    vendor_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) NOT NULL,
    barcode VARCHAR(100),
    category VARCHAR(100),
    brand VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    total_stock INT DEFAULT 0,
    min_stock INT DEFAULT 10,
    max_stock INT DEFAULT 1000,
    unit VARCHAR(50) DEFAULT 'piece',
    images JSON, -- Array of image URLs
    is_active BOOLEAN DEFAULT TRUE,
    expiry_date DATE NULL,
    track_expiry BOOLEAN DEFAULT FALSE,
    track_serial BOOLEAN DEFAULT FALSE,
    tags JSON, -- Array of tag strings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    UNIQUE KEY unique_vendor_sku (vendor_id, sku),
    INDEX idx_product_vendor (vendor_id),
    INDEX idx_product_sku (sku),
    INDEX idx_product_barcode (barcode),
    INDEX idx_product_category (category),
    INDEX idx_product_active (is_active)
);

-- Product variants (sizes, colors, etc.)
CREATE TABLE product_variants (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL, -- e.g., "Size", "Color"
    value VARCHAR(100) NOT NULL, -- e.g., "M", "Red"
    price_modifier DECIMAL(10,2) DEFAULT 0.00,
    stock INT DEFAULT 0,
    sku VARCHAR(100) NOT NULL,
    barcode VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_variant_sku (product_id, sku),
    INDEX idx_variant_product (product_id),
    INDEX idx_variant_sku (sku)
);

-- Stock by location tracking
CREATE TABLE product_stock_locations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id VARCHAR(36) NOT NULL,
    variant_id VARCHAR(36) NULL,
    location_name VARCHAR(100) NOT NULL,
    quantity INT DEFAULT 0,
    reserved_quantity INT DEFAULT 0, -- For pending orders
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_location (product_id, variant_id, location_name),
    INDEX idx_stock_product (product_id),
    INDEX idx_stock_location (location_name)
);

-- Cashier product assignments
CREATE TABLE cashier_product_assignments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cashier_product (user_id, product_id),
    INDEX idx_assignment_user (user_id),
    INDEX idx_assignment_product (product_id)
);

-- =====================================================
-- CUSTOMER MANAGEMENT
-- =====================================================

-- Customers table
CREATE TABLE customers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    vendor_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    date_of_birth DATE,
    loyalty_points INT DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0.00,
    visit_count INT DEFAULT 0,
    last_visit TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    INDEX idx_customer_vendor (vendor_id),
    INDEX idx_customer_email (email),
    INDEX idx_customer_phone (phone),
    INDEX idx_customer_loyalty (loyalty_points)
);

-- =====================================================
-- SALES & TRANSACTIONS
-- =====================================================

-- Sales table
CREATE TABLE sales (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    vendor_id VARCHAR(36) NOT NULL,
    cashier_id VARCHAR(36) NOT NULL,
    terminal_id VARCHAR(100) NOT NULL,
    customer_id VARCHAR(36) NULL,
    receipt_number VARCHAR(100) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    tax DECIMAL(12,2) DEFAULT 0.00,
    discount DECIMAL(12,2) DEFAULT 0.00,
    total DECIMAL(12,2) NOT NULL,
    paid DECIMAL(12,2) NOT NULL,
    change_amount DECIMAL(12,2) DEFAULT 0.00,
    payment_method ENUM('cash', 'card', 'mobile', 'loyalty') NOT NULL,
    status ENUM('completed', 'refunded', 'partial_refund') DEFAULT 'completed',
    refund_amount DECIMAL(12,2) DEFAULT 0.00,
    loyalty_points_earned INT DEFAULT 0,
    loyalty_points_used INT DEFAULT 0,
    notes TEXT,
    receipt_data JSON, -- Complete receipt information
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (cashier_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    UNIQUE KEY unique_receipt_number (vendor_id, receipt_number),
    INDEX idx_sale_vendor (vendor_id),
    INDEX idx_sale_cashier (cashier_id),
    INDEX idx_sale_customer (customer_id),
    INDEX idx_sale_date (created_at),
    INDEX idx_sale_status (status),
    INDEX idx_sale_payment_method (payment_method)
);

-- Sale items table
CREATE TABLE sale_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    sale_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    variant_id VARCHAR(36) NULL,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    INDEX idx_sale_item_sale (sale_id),
    INDEX idx_sale_item_product (product_id)
);

-- =====================================================
-- SUPPLIER & PURCHASE MANAGEMENT
-- =====================================================

-- Suppliers table
CREATE TABLE suppliers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    vendor_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    payment_terms VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    INDEX idx_supplier_vendor (vendor_id),
    INDEX idx_supplier_active (is_active)
);

-- Purchase orders table
CREATE TABLE purchases (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    vendor_id VARCHAR(36) NOT NULL,
    supplier_id VARCHAR(36) NOT NULL,
    purchase_number VARCHAR(100) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    tax DECIMAL(12,2) DEFAULT 0.00,
    total DECIMAL(12,2) NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    delivery_date DATE NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_purchase_number (vendor_id, purchase_number),
    INDEX idx_purchase_vendor (vendor_id),
    INDEX idx_purchase_supplier (supplier_id),
    INDEX idx_purchase_status (status),
    INDEX idx_purchase_date (created_at)
);

-- Purchase items table
CREATE TABLE purchase_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    purchase_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    variant_id VARCHAR(36) NULL,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    INDEX idx_purchase_item_purchase (purchase_id),
    INDEX idx_purchase_item_product (product_id)
);

-- =====================================================
-- STOCK MANAGEMENT & TRACKING
-- =====================================================

-- Stock movements table (all inventory changes)
CREATE TABLE stock_movements (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    vendor_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    variant_id VARCHAR(36) NULL,
    movement_type ENUM('sale', 'purchase', 'adjustment', 'transfer', 'return') NOT NULL,
    quantity INT NOT NULL, -- Can be negative for outgoing movements
    reference_type VARCHAR(50), -- 'sale', 'purchase', 'adjustment', etc.
    reference_id VARCHAR(36), -- ID of the related record
    reference_number VARCHAR(100), -- Human-readable reference
    location_from VARCHAR(100),
    location_to VARCHAR(100),
    notes TEXT,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_movement_vendor (vendor_id),
    INDEX idx_movement_product (product_id),
    INDEX idx_movement_type (movement_type),
    INDEX idx_movement_date (created_at),
    INDEX idx_movement_reference (reference_type, reference_id)
);

-- Stock takes table
CREATE TABLE stock_takes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    vendor_id VARCHAR(36) NOT NULL,
    location VARCHAR(100) NOT NULL,
    status ENUM('in_progress', 'completed', 'cancelled') DEFAULT 'in_progress',
    notes TEXT,
    created_by VARCHAR(36) NOT NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_stock_take_vendor (vendor_id),
    INDEX idx_stock_take_location (location),
    INDEX idx_stock_take_status (status)
);

-- Stock take items table
CREATE TABLE stock_take_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    stock_take_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    variant_id VARCHAR(36) NULL,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    expected_quantity INT NOT NULL,
    counted_quantity INT NOT NULL,
    variance INT GENERATED ALWAYS AS (counted_quantity - expected_quantity) STORED,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_take_id) REFERENCES stock_takes(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    INDEX idx_stock_take_item_stock_take (stock_take_id),
    INDEX idx_stock_take_item_product (product_id),
    INDEX idx_stock_take_item_variance (variance)
);

-- =====================================================
-- NOTIFICATIONS & AUDIT LOGS
-- =====================================================

-- Notifications table
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    vendor_id VARCHAR(36) NOT NULL,
    type ENUM('low_stock', 'purchase_received', 'stock_take_complete', 'system', 'transfer_complete') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    INDEX idx_notification_vendor (vendor_id),
    INDEX idx_notification_type (type),
    INDEX idx_notification_read (is_read),
    INDEX idx_notification_date (created_at)
);

-- Audit logs table
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    vendor_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    action VARCHAR(100) NOT NULL, -- e.g., 'CREATE_PRODUCT', 'UPDATE_SALE'
    resource VARCHAR(100) NOT NULL, -- e.g., 'Product', 'Sale'
    resource_id VARCHAR(36) NOT NULL,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_audit_vendor (vendor_id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_resource (resource, resource_id),
    INDEX idx_audit_date (created_at)
);

-- Support tickets table
CREATE TABLE support_tickets (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    vendor_id VARCHAR(36) NOT NULL,
    vendor_name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'closed') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    INDEX idx_ticket_vendor (vendor_id),
    INDEX idx_ticket_status (status),
    INDEX idx_ticket_priority (priority)
);

-- Reports table (generated reports)
CREATE TABLE reports (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    vendor_id VARCHAR(36) NOT NULL,
    type ENUM('sales', 'inventory', 'customer', 'profit') NOT NULL,
    period ENUM('daily', 'weekly', 'monthly', 'yearly', 'custom') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    data JSON NOT NULL, -- Report data and calculations
    generated_by VARCHAR(36) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_report_vendor (vendor_id),
    INDEX idx_report_type (type),
    INDEX idx_report_period (period),
    INDEX idx_report_date_range (start_date, end_date)
);

-- =====================================================
-- SYSTEM CONFIGURATION
-- =====================================================

-- System settings table
CREATE TABLE system_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC CALCULATIONS
-- =====================================================

-- Trigger to update product total stock when stock locations change
DELIMITER //
CREATE TRIGGER update_product_total_stock 
AFTER INSERT ON product_stock_locations
FOR EACH ROW
BEGIN
    UPDATE products 
    SET total_stock = (
        SELECT COALESCE(SUM(quantity), 0) 
        FROM product_stock_locations 
        WHERE product_id = NEW.product_id
    )
    WHERE id = NEW.product_id;
END//

CREATE TRIGGER update_product_total_stock_on_update
AFTER UPDATE ON product_stock_locations
FOR EACH ROW
BEGIN
    UPDATE products 
    SET total_stock = (
        SELECT COALESCE(SUM(quantity), 0) 
        FROM product_stock_locations 
        WHERE product_id = NEW.product_id
    )
    WHERE id = NEW.product_id;
END//

CREATE TRIGGER update_product_total_stock_on_delete
AFTER DELETE ON product_stock_locations
FOR EACH ROW
BEGIN
    UPDATE products 
    SET total_stock = (
        SELECT COALESCE(SUM(quantity), 0) 
        FROM product_stock_locations 
        WHERE product_id = OLD.product_id
    )
    WHERE id = OLD.product_id;
END//

-- Trigger to update customer stats after sales
CREATE TRIGGER update_customer_stats_after_sale
AFTER INSERT ON sales
FOR EACH ROW
BEGIN
    IF NEW.customer_id IS NOT NULL THEN
        UPDATE customers 
        SET 
            total_spent = total_spent + NEW.total,
            visit_count = visit_count + 1,
            last_visit = NEW.created_at,
            loyalty_points = loyalty_points + NEW.loyalty_points_earned - NEW.loyalty_points_used
        WHERE id = NEW.customer_id;
    END IF;
END//

DELIMITER ;

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('app_name', 'Flux POS', 'Application name'),
('app_version', '1.0.0', 'Current application version'),
('default_currency', 'USD', 'Default system currency'),
('default_tax_rate', '0.0800', 'Default tax rate (8%)'),
('max_vendors', '1000', 'Maximum number of vendors allowed'),
('trial_period_days', '30', 'Trial period duration in days');

-- Create default superadmin user (password: 'admin123' hashed with MD5)
INSERT INTO users (id, email, password_hash, role, name, is_active) VALUES
('superadmin-001', 'admin@flux.com', MD5('admin123'), 'superadmin', 'System Administrator', TRUE);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for low stock products
CREATE VIEW low_stock_products AS
SELECT 
    p.id,
    p.vendor_id,
    p.name,
    p.sku,
    p.total_stock,
    p.min_stock,
    vs.low_stock_threshold,
    p.category,
    p.brand
FROM products p
JOIN vendor_settings vs ON p.vendor_id = vs.vendor_id
WHERE p.is_active = TRUE 
AND p.total_stock <= GREATEST(p.min_stock, vs.low_stock_threshold);

-- View for sales analytics
CREATE VIEW sales_analytics AS
SELECT 
    s.vendor_id,
    DATE(s.created_at) as sale_date,
    COUNT(*) as transaction_count,
    SUM(s.total) as total_sales,
    SUM(s.tax) as total_tax,
    SUM(s.discount) as total_discount,
    AVG(s.total) as average_sale,
    s.payment_method,
    u.name as cashier_name
FROM sales s
JOIN users u ON s.cashier_id = u.id
WHERE s.status = 'completed'
GROUP BY s.vendor_id, DATE(s.created_at), s.payment_method, s.cashier_id;

-- View for product performance
CREATE VIEW product_performance AS
SELECT 
    p.id as product_id,
    p.vendor_id,
    p.name,
    p.sku,
    p.category,
    COUNT(si.id) as times_sold,
    SUM(si.quantity) as total_quantity_sold,
    SUM(si.total) as total_revenue,
    AVG(si.price) as average_selling_price,
    p.cost_price,
    (AVG(si.price) - p.cost_price) as profit_per_unit
FROM products p
LEFT JOIN sale_items si ON p.id = si.product_id
LEFT JOIN sales s ON si.sale_id = s.id AND s.status = 'completed'
WHERE p.is_active = TRUE
GROUP BY p.id, p.vendor_id, p.name, p.sku, p.category, p.cost_price;

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_sales_vendor_date ON sales(vendor_id, created_at);
CREATE INDEX idx_sales_cashier_date ON sales(cashier_id, created_at);
CREATE INDEX idx_products_vendor_category ON products(vendor_id, category);
CREATE INDEX idx_products_vendor_active ON products(vendor_id, is_active);
CREATE INDEX idx_stock_movements_product_date ON stock_movements(product_id, created_at);
CREATE INDEX idx_customers_vendor_active ON customers(vendor_id, is_active);

-- =====================================================
-- END OF SCHEMA
-- =====================================================
