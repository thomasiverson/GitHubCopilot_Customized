-- OctoCAT Supply Chain Database Schema
-- Databricks SQL / Delta Lake Script
-- Created: 2026-05-19

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS OrderDetailDelivery;
DROP TABLE IF EXISTS OrderDetail;
DROP TABLE IF EXISTS Delivery;
DROP TABLE IF EXISTS `Order`;
DROP TABLE IF EXISTS Product;
DROP TABLE IF EXISTS Supplier;
DROP TABLE IF EXISTS Branch;
DROP TABLE IF EXISTS Headquarters;

-- =============================================
-- Headquarters Table
-- =============================================
CREATE TABLE Headquarters (
    headquarters_id BIGINT GENERATED ALWAYS AS IDENTITY,
    name STRING NOT NULL,
    address STRING,
    city STRING,
    state STRING,
    postal_code STRING,
    country STRING,
    phone STRING,
    email STRING,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    CONSTRAINT pk_headquarters PRIMARY KEY(headquarters_id)
) USING DELTA
COMMENT 'Headquarters locations table';

-- =============================================
-- Branch Table
-- =============================================
CREATE TABLE Branch (
    branch_id BIGINT GENERATED ALWAYS AS IDENTITY,
    headquarters_id BIGINT NOT NULL,
    name STRING NOT NULL,
    address STRING,
    city STRING,
    state STRING,
    postal_code STRING,
    country STRING,
    phone STRING,
    email STRING,
    manager_name STRING,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    CONSTRAINT pk_branch PRIMARY KEY(branch_id),
    CONSTRAINT fk_branch_headquarters FOREIGN KEY(headquarters_id) REFERENCES Headquarters(headquarters_id)
) USING DELTA
COMMENT 'Branch offices linked to headquarters';

-- =============================================
-- Supplier Table
-- =============================================
CREATE TABLE Supplier (
    supplier_id BIGINT GENERATED ALWAYS AS IDENTITY,
    name STRING NOT NULL,
    contact_name STRING,
    address STRING,
    city STRING,
    state STRING,
    postal_code STRING,
    country STRING,
    phone STRING,
    email STRING,
    website STRING,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    CONSTRAINT pk_supplier PRIMARY KEY(supplier_id)
) USING DELTA
COMMENT 'Supplier information table';

-- =============================================
-- Product Table
-- =============================================
CREATE TABLE Product (
    product_id BIGINT GENERATED ALWAYS AS IDENTITY,
    supplier_id BIGINT NOT NULL,
    name STRING NOT NULL,
    description STRING,
    sku STRING,
    price DECIMAL(18, 2) NOT NULL,
    unit_of_measure STRING,
    category STRING,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    CONSTRAINT pk_product PRIMARY KEY(product_id),
    CONSTRAINT fk_product_supplier FOREIGN KEY(supplier_id) REFERENCES Supplier(supplier_id),
    CONSTRAINT ck_product_price CHECK (price >= 0)
) USING DELTA
COMMENT 'Product catalog with pricing information';

-- =============================================
-- Order Table (Note: 'Order' is a reserved keyword, using backticks)
-- =============================================
CREATE TABLE `Order` (
    order_id BIGINT GENERATED ALWAYS AS IDENTITY,
    headquarters_id BIGINT NOT NULL,
    order_date TIMESTAMP NOT NULL,
    order_number STRING,
    status STRING NOT NULL DEFAULT 'Pending',
    total_amount DECIMAL(18, 2),
    notes STRING,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    CONSTRAINT pk_order PRIMARY KEY(order_id),
    CONSTRAINT fk_order_headquarters FOREIGN KEY(headquarters_id) REFERENCES Headquarters(headquarters_id),
    CONSTRAINT ck_order_status CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'))
) USING DELTA
COMMENT 'Orders placed by headquarters';

-- =============================================
-- OrderDetail Table
-- =============================================
CREATE TABLE OrderDetail (
    order_detail_id BIGINT GENERATED ALWAYS AS IDENTITY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_quantity INT NOT NULL,
    unit_price DECIMAL(18, 2) NOT NULL,
    line_total DECIMAL(18, 2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    CONSTRAINT pk_orderdetail PRIMARY KEY(order_detail_id),
    CONSTRAINT fk_orderdetail_order FOREIGN KEY(order_id) REFERENCES `Order`(order_id),
    CONSTRAINT fk_orderdetail_product FOREIGN KEY(product_id) REFERENCES Product(product_id),
    CONSTRAINT ck_orderdetail_quantity CHECK (product_quantity > 0),
    CONSTRAINT ck_orderdetail_unitprice CHECK (unit_price >= 0)
) USING DELTA
COMMENT 'Line items for each order';

-- =============================================
-- Delivery Table
-- =============================================
CREATE TABLE Delivery (
    delivery_id BIGINT GENERATED ALWAYS AS IDENTITY,
    supplier_id BIGINT NOT NULL,
    delivery_date TIMESTAMP NOT NULL,
    delivery_number STRING,
    status STRING NOT NULL DEFAULT 'Scheduled',
    tracking_number STRING,
    carrier STRING,
    notes STRING,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    CONSTRAINT pk_delivery PRIMARY KEY(delivery_id),
    CONSTRAINT fk_delivery_supplier FOREIGN KEY(supplier_id) REFERENCES Supplier(supplier_id),
    CONSTRAINT ck_delivery_status CHECK (status IN ('Scheduled', 'In Transit', 'Delivered', 'Cancelled', 'Delayed'))
) USING DELTA
COMMENT 'Delivery shipments from suppliers';

-- =============================================
-- OrderDetailDelivery Junction Table
-- =============================================
CREATE TABLE OrderDetailDelivery (
    order_detail_delivery_id BIGINT GENERATED ALWAYS AS IDENTITY,
    delivery_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    order_detail_id BIGINT NOT NULL,
    quantity_delivered INT NOT NULL,
    delivery_status STRING NOT NULL DEFAULT 'Pending',
    delivered_at TIMESTAMP,
    notes STRING,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    CONSTRAINT pk_orderdetaildelivery PRIMARY KEY(order_detail_delivery_id),
    CONSTRAINT fk_orderdetaildelivery_delivery FOREIGN KEY(delivery_id) REFERENCES Delivery(delivery_id),
    CONSTRAINT fk_orderdetaildelivery_order FOREIGN KEY(order_id) REFERENCES `Order`(order_id),
    CONSTRAINT fk_orderdetaildelivery_orderdetail FOREIGN KEY(order_detail_id) REFERENCES OrderDetail(order_detail_id),
    CONSTRAINT ck_orderdetaildelivery_quantity CHECK (quantity_delivered > 0)
) USING DELTA
COMMENT 'Junction table linking deliveries to order details';

-- =============================================
-- Create Views for Common Queries
-- =============================================

-- View: Order Summary with Details
CREATE OR REPLACE VIEW vw_OrderSummary AS
SELECT 
    o.order_id,
    o.order_number,
    o.order_date,
    o.status AS order_status,
    h.name AS headquarters_name,
    h.city AS headquarters_city,
    COUNT(DISTINCT od.order_detail_id) AS total_line_items,
    SUM(od.product_quantity) AS total_quantity,
    SUM(od.line_total) AS order_total
FROM `Order` o
INNER JOIN Headquarters h ON o.headquarters_id = h.headquarters_id
LEFT JOIN OrderDetail od ON o.order_id = od.order_id
GROUP BY 
    o.order_id,
    o.order_number,
    o.order_date,
    o.status,
    h.name,
    h.city;

-- View: Product Inventory
CREATE OR REPLACE VIEW vw_ProductInventory AS
SELECT 
    p.product_id,
    p.name AS product_name,
    p.sku,
    p.price,
    p.category,
    p.is_active,
    s.name AS supplier_name,
    s.contact_name AS supplier_contact,
    s.phone AS supplier_phone
FROM Product p
INNER JOIN Supplier s ON p.supplier_id = s.supplier_id;

-- View: Delivery Tracking
CREATE OR REPLACE VIEW vw_DeliveryTracking AS
SELECT 
    d.delivery_id,
    d.delivery_number,
    d.delivery_date,
    d.status AS delivery_status,
    d.tracking_number,
    d.carrier,
    s.name AS supplier_name,
    COUNT(DISTINCT odd.order_id) AS total_orders,
    COUNT(DISTINCT odd.order_detail_id) AS total_order_details
FROM Delivery d
INNER JOIN Supplier s ON d.supplier_id = s.supplier_id
LEFT JOIN OrderDetailDelivery odd ON d.delivery_id = odd.delivery_id
GROUP BY 
    d.delivery_id,
    d.delivery_number,
    d.delivery_date,
    d.status,
    d.tracking_number,
    d.carrier,
    s.name;

-- =============================================
-- Optimize Tables (Delta Lake specific)
-- =============================================

-- Optimize tables for better query performance
OPTIMIZE Headquarters;
OPTIMIZE Branch;
OPTIMIZE Supplier;
OPTIMIZE Product;
OPTIMIZE `Order`;
OPTIMIZE OrderDetail;
OPTIMIZE Delivery;
OPTIMIZE OrderDetailDelivery;

-- Collect statistics for query optimization
ANALYZE TABLE Headquarters COMPUTE STATISTICS FOR ALL COLUMNS;
ANALYZE TABLE Branch COMPUTE STATISTICS FOR ALL COLUMNS;
ANALYZE TABLE Supplier COMPUTE STATISTICS FOR ALL COLUMNS;
ANALYZE TABLE Product COMPUTE STATISTICS FOR ALL COLUMNS;
ANALYZE TABLE `Order` COMPUTE STATISTICS FOR ALL COLUMNS;
ANALYZE TABLE OrderDetail COMPUTE STATISTICS FOR ALL COLUMNS;
ANALYZE TABLE Delivery COMPUTE STATISTICS FOR ALL COLUMNS;
ANALYZE TABLE OrderDetailDelivery COMPUTE STATISTICS FOR ALL COLUMNS;

-- Display completion message
SELECT 'Database schema created successfully!' AS message;
SELECT 'Tables: Headquarters, Branch, Supplier, Product, Order, OrderDetail, Delivery, OrderDetailDelivery' AS tables;
SELECT 'Views: vw_OrderSummary, vw_ProductInventory, vw_DeliveryTracking' AS views;
