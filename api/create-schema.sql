-- OctoCAT Supply Chain Database Schema
-- SQL Server T-SQL Script
-- Created: 2026-05-19

-- Drop existing tables if they exist (in reverse dependency order)
IF OBJECT_ID('dbo.OrderDetailDelivery', 'U') IS NOT NULL DROP TABLE dbo.OrderDetailDelivery;
IF OBJECT_ID('dbo.OrderDetail', 'U') IS NOT NULL DROP TABLE dbo.OrderDetail;
IF OBJECT_ID('dbo.Delivery', 'U') IS NOT NULL DROP TABLE dbo.Delivery;
IF OBJECT_ID('dbo.[Order]', 'U') IS NOT NULL DROP TABLE dbo.[Order];
IF OBJECT_ID('dbo.Product', 'U') IS NOT NULL DROP TABLE dbo.Product;
IF OBJECT_ID('dbo.Supplier', 'U') IS NOT NULL DROP TABLE dbo.Supplier;
IF OBJECT_ID('dbo.Branch', 'U') IS NOT NULL DROP TABLE dbo.Branch;
IF OBJECT_ID('dbo.Headquarters', 'U') IS NOT NULL DROP TABLE dbo.Headquarters;
GO

-- =============================================
-- Headquarters Table
-- =============================================
CREATE TABLE dbo.Headquarters (
    headquarters_id INT IDENTITY(1,1) NOT NULL,
    name NVARCHAR(200) NOT NULL,
    address NVARCHAR(500) NULL,
    city NVARCHAR(100) NULL,
    state NVARCHAR(50) NULL,
    postal_code NVARCHAR(20) NULL,
    country NVARCHAR(100) NULL,
    phone NVARCHAR(20) NULL,
    email NVARCHAR(100) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Headquarters PRIMARY KEY CLUSTERED (headquarters_id ASC)
);
GO

-- =============================================
-- Branch Table
-- =============================================
CREATE TABLE dbo.Branch (
    branch_id INT IDENTITY(1,1) NOT NULL,
    headquarters_id INT NOT NULL,
    name NVARCHAR(200) NOT NULL,
    address NVARCHAR(500) NULL,
    city NVARCHAR(100) NULL,
    state NVARCHAR(50) NULL,
    postal_code NVARCHAR(20) NULL,
    country NVARCHAR(100) NULL,
    phone NVARCHAR(20) NULL,
    email NVARCHAR(100) NULL,
    manager_name NVARCHAR(200) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Branch PRIMARY KEY CLUSTERED (branch_id ASC),
    CONSTRAINT FK_Branch_Headquarters FOREIGN KEY (headquarters_id)
        REFERENCES dbo.Headquarters (headquarters_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
GO

-- =============================================
-- Supplier Table
-- =============================================
CREATE TABLE dbo.Supplier (
    supplier_id INT IDENTITY(1,1) NOT NULL,
    name NVARCHAR(200) NOT NULL,
    contact_name NVARCHAR(200) NULL,
    address NVARCHAR(500) NULL,
    city NVARCHAR(100) NULL,
    state NVARCHAR(50) NULL,
    postal_code NVARCHAR(20) NULL,
    country NVARCHAR(100) NULL,
    phone NVARCHAR(20) NULL,
    email NVARCHAR(100) NULL,
    website NVARCHAR(255) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Supplier PRIMARY KEY CLUSTERED (supplier_id ASC)
);
GO

-- =============================================
-- Product Table
-- =============================================
CREATE TABLE dbo.Product (
    product_id INT IDENTITY(1,1) NOT NULL,
    supplier_id INT NOT NULL,
    name NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX) NULL,
    sku NVARCHAR(50) NULL,
    price DECIMAL(18, 2) NOT NULL,
    unit_of_measure NVARCHAR(50) NULL,
    category NVARCHAR(100) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Product PRIMARY KEY CLUSTERED (product_id ASC),
    CONSTRAINT FK_Product_Supplier FOREIGN KEY (supplier_id)
        REFERENCES dbo.Supplier (supplier_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT CK_Product_Price CHECK (price >= 0)
);
GO

-- =============================================
-- Order Table (Note: 'Order' is a reserved keyword, using brackets)
-- =============================================
CREATE TABLE dbo.[Order] (
    order_id INT IDENTITY(1,1) NOT NULL,
    headquarters_id INT NOT NULL,
    order_date DATETIME2 NOT NULL,
    order_number NVARCHAR(50) NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    total_amount DECIMAL(18, 2) NULL,
    notes NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Order PRIMARY KEY CLUSTERED (order_id ASC),
    CONSTRAINT FK_Order_Headquarters FOREIGN KEY (headquarters_id)
        REFERENCES dbo.Headquarters (headquarters_id)
        ON DELETE NO ACTION
        ON UPDATE CASCADE,
    CONSTRAINT CK_Order_Status CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'))
);
GO

-- =============================================
-- OrderDetail Table
-- =============================================
CREATE TABLE dbo.OrderDetail (
    order_detail_id INT IDENTITY(1,1) NOT NULL,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_quantity INT NOT NULL,
    unit_price DECIMAL(18, 2) NOT NULL,
    line_total DECIMAL(18, 2) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_OrderDetail PRIMARY KEY CLUSTERED (order_detail_id ASC),
    CONSTRAINT FK_OrderDetail_Order FOREIGN KEY (order_id)
        REFERENCES dbo.[Order] (order_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT FK_OrderDetail_Product FOREIGN KEY (product_id)
        REFERENCES dbo.Product (product_id)
        ON DELETE NO ACTION
        ON UPDATE CASCADE,
    CONSTRAINT CK_OrderDetail_Quantity CHECK (product_quantity > 0),
    CONSTRAINT CK_OrderDetail_UnitPrice CHECK (unit_price >= 0)
);
GO

-- =============================================
-- Delivery Table
-- =============================================
CREATE TABLE dbo.Delivery (
    delivery_id INT IDENTITY(1,1) NOT NULL,
    supplier_id INT NOT NULL,
    delivery_date DATETIME2 NOT NULL,
    delivery_number NVARCHAR(50) NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'Scheduled',
    tracking_number NVARCHAR(100) NULL,
    carrier NVARCHAR(100) NULL,
    notes NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Delivery PRIMARY KEY CLUSTERED (delivery_id ASC),
    CONSTRAINT FK_Delivery_Supplier FOREIGN KEY (supplier_id)
        REFERENCES dbo.Supplier (supplier_id)
        ON DELETE NO ACTION
        ON UPDATE CASCADE,
    CONSTRAINT CK_Delivery_Status CHECK (status IN ('Scheduled', 'In Transit', 'Delivered', 'Cancelled', 'Delayed'))
);
GO

-- =============================================
-- OrderDetailDelivery Junction Table
-- =============================================
CREATE TABLE dbo.OrderDetailDelivery (
    order_detail_delivery_id INT IDENTITY(1,1) NOT NULL,
    delivery_id INT NOT NULL,
    order_id INT NOT NULL,
    order_detail_id INT NOT NULL,
    quantity_delivered INT NOT NULL,
    delivery_status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    delivered_at DATETIME2 NULL,
    notes NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_OrderDetailDelivery PRIMARY KEY CLUSTERED (order_detail_delivery_id ASC),
    CONSTRAINT FK_OrderDetailDelivery_Delivery FOREIGN KEY (delivery_id)
        REFERENCES dbo.Delivery (delivery_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT FK_OrderDetailDelivery_Order FOREIGN KEY (order_id)
        REFERENCES dbo.[Order] (order_id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT FK_OrderDetailDelivery_OrderDetail FOREIGN KEY (order_detail_id)
        REFERENCES dbo.OrderDetail (order_detail_id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT CK_OrderDetailDelivery_Quantity CHECK (quantity_delivered > 0)
);
GO

-- =============================================
-- Create Indexes for Foreign Keys and Common Queries
-- =============================================

-- Branch indexes
CREATE NONCLUSTERED INDEX IX_Branch_HeadquartersId 
    ON dbo.Branch(headquarters_id);
GO

-- Product indexes
CREATE NONCLUSTERED INDEX IX_Product_SupplierId 
    ON dbo.Product(supplier_id);
CREATE NONCLUSTERED INDEX IX_Product_SKU 
    ON dbo.Product(sku);
GO

-- Order indexes
CREATE NONCLUSTERED INDEX IX_Order_HeadquartersId 
    ON dbo.[Order](headquarters_id);
CREATE NONCLUSTERED INDEX IX_Order_OrderDate 
    ON dbo.[Order](order_date DESC);
CREATE NONCLUSTERED INDEX IX_Order_Status 
    ON dbo.[Order](status);
GO

-- OrderDetail indexes
CREATE NONCLUSTERED INDEX IX_OrderDetail_OrderId 
    ON dbo.OrderDetail(order_id);
CREATE NONCLUSTERED INDEX IX_OrderDetail_ProductId 
    ON dbo.OrderDetail(product_id);
GO

-- Delivery indexes
CREATE NONCLUSTERED INDEX IX_Delivery_SupplierId 
    ON dbo.Delivery(supplier_id);
CREATE NONCLUSTERED INDEX IX_Delivery_DeliveryDate 
    ON dbo.Delivery(delivery_date DESC);
CREATE NONCLUSTERED INDEX IX_Delivery_Status 
    ON dbo.Delivery(status);
GO

-- OrderDetailDelivery indexes
CREATE NONCLUSTERED INDEX IX_OrderDetailDelivery_DeliveryId 
    ON dbo.OrderDetailDelivery(delivery_id);
CREATE NONCLUSTERED INDEX IX_OrderDetailDelivery_OrderId 
    ON dbo.OrderDetailDelivery(order_id);
CREATE NONCLUSTERED INDEX IX_OrderDetailDelivery_OrderDetailId 
    ON dbo.OrderDetailDelivery(order_detail_id);
GO

-- =============================================
-- Create Views for Common Queries
-- =============================================

-- View: Order Summary with Details
CREATE VIEW dbo.vw_OrderSummary AS
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
FROM dbo.[Order] o
INNER JOIN dbo.Headquarters h ON o.headquarters_id = h.headquarters_id
LEFT JOIN dbo.OrderDetail od ON o.order_id = od.order_id
GROUP BY 
    o.order_id,
    o.order_number,
    o.order_date,
    o.status,
    h.name,
    h.city;
GO

-- View: Product Inventory
CREATE VIEW dbo.vw_ProductInventory AS
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
FROM dbo.Product p
INNER JOIN dbo.Supplier s ON p.supplier_id = s.supplier_id;
GO

-- View: Delivery Tracking
CREATE VIEW dbo.vw_DeliveryTracking AS
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
FROM dbo.Delivery d
INNER JOIN dbo.Supplier s ON d.supplier_id = s.supplier_id
LEFT JOIN dbo.OrderDetailDelivery odd ON d.delivery_id = odd.delivery_id
GROUP BY 
    d.delivery_id,
    d.delivery_number,
    d.delivery_date,
    d.status,
    d.tracking_number,
    d.carrier,
    s.name;
GO

PRINT 'Database schema created successfully!';
PRINT 'Tables: Headquarters, Branch, Supplier, Product, Order, OrderDetail, Delivery, OrderDetailDelivery';
PRINT 'Views: vw_OrderSummary, vw_ProductInventory, vw_DeliveryTracking';
GO
