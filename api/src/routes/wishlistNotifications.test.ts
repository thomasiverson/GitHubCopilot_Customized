import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import wishlistRouter, { resetWishlist } from './wishlist';
import { notifications as seedNotifications } from '../seedData';
import { checkPriceDrops, checkStockAlerts, generateNotifications } from '../services/notificationService';
import { WishlistItem } from '../models/wishlistItem';
import { Product } from '../models/product';
import { Notification } from '../models/notification';

let app: express.Express;

describe('Wishlist Notifications API', () => {
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/wishlist', wishlistRouter);
        resetWishlist();
    });

    it('should get pending notifications for a user', async () => {
        const response = await request(app).get('/wishlist/1/notifications');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        const expectedCount = seedNotifications.filter(n => n.userId === 1 && !n.isRead).length;
        expect(response.body.length).toBe(expectedCount);
    });

    it('should return empty array when user has no notifications', async () => {
        const response = await request(app).get('/wishlist/999/notifications');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('should dismiss a notification', async () => {
        const notificationId = seedNotifications[0].notificationId;
        const userId = seedNotifications[0].userId;
        const response = await request(app)
            .post(`/wishlist/${userId}/notifications/${notificationId}/dismiss`);
        expect(response.status).toBe(200);
        expect(response.body.isRead).toBe(true);
    });

    it('should not return dismissed notifications', async () => {
        const notificationId = seedNotifications[0].notificationId;
        const userId = seedNotifications[0].userId;

        // Dismiss the notification
        await request(app).post(`/wishlist/${userId}/notifications/${notificationId}/dismiss`);

        // It should no longer appear in pending notifications
        const response = await request(app).get(`/wishlist/${userId}/notifications`);
        const dismissed = response.body.find((n: { notificationId: number }) => n.notificationId === notificationId);
        expect(dismissed).toBeUndefined();
    });

    it('should return 404 when dismissing non-existent notification', async () => {
        const response = await request(app).post('/wishlist/1/notifications/999/dismiss');
        expect(response.status).toBe(404);
    });
});

describe('Price Drop Detection', () => {
    const baseItem: WishlistItem = {
        wishlistItemId: 100,
        userId: 1,
        productId: 1,
        collectionId: null,
        dateAdded: new Date().toISOString(),
        notes: '',
        priceWhenAdded: 100.00,
        notifyOnPriceDrop: true,
        notifyOnStockAvailable: false
    };

    const baseProduct: Product = {
        productId: 1,
        supplierId: 1,
        name: 'Test Product',
        description: 'A test product',
        price: 100.00,
        sku: 'TEST-001',
        unit: 'piece',
        imgName: 'test.png'
    };

    it('should detect a price drop of more than 10%', () => {
        const item = { ...baseItem, priceWhenAdded: 100.00 };
        const product = { ...baseProduct, price: 85.00 }; // 15% drop
        const notifications = checkPriceDrops([item], [product], []);
        expect(notifications.length).toBe(1);
        expect(notifications[0].type).toBe('price_drop');
        expect(notifications[0].oldPrice).toBe(100.00);
        expect(notifications[0].newPrice).toBe(85.00);
    });

    it('should not detect a price drop of less than 10%', () => {
        const item = { ...baseItem, priceWhenAdded: 100.00 };
        const product = { ...baseProduct, price: 95.00 }; // 5% drop
        const notifications = checkPriceDrops([item], [product], []);
        expect(notifications.length).toBe(0);
    });

    it('should not notify if notifyOnPriceDrop is false', () => {
        const item = { ...baseItem, priceWhenAdded: 100.00, notifyOnPriceDrop: false };
        const product = { ...baseProduct, price: 50.00 }; // 50% drop
        const notifications = checkPriceDrops([item], [product], []);
        expect(notifications.length).toBe(0);
    });

    it('should not create duplicate notifications', () => {
        const item = { ...baseItem, priceWhenAdded: 100.00 };
        const product = { ...baseProduct, price: 80.00 };
        const existing: Notification[] = [{
            notificationId: 1,
            userId: 1,
            type: 'price_drop',
            productId: 1,
            wishlistItemId: 100,
            message: 'Price dropped',
            isRead: false,
            createdAt: new Date().toISOString()
        }];
        const notifications = checkPriceDrops([item], [product], existing);
        expect(notifications.length).toBe(0);
    });

    it('should check stock alerts correctly', () => {
        const item = { ...baseItem, notifyOnPriceDrop: false, notifyOnStockAvailable: true };
        const product = { ...baseProduct, stockLevel: 5 };
        const notifications = checkStockAlerts([item], [product], []);
        expect(notifications.length).toBe(1);
        expect(notifications[0].type).toBe('stock_available');
    });

    it('should not notify stock when notifyOnStockAvailable is false', () => {
        const item = { ...baseItem, notifyOnStockAvailable: false };
        const product = { ...baseProduct, stockLevel: 5 };
        const notifications = checkStockAlerts([item], [product], []);
        expect(notifications.length).toBe(0);
    });

    it('should generate all notifications combined', () => {
        const priceItem = { ...baseItem, wishlistItemId: 200, priceWhenAdded: 100, notifyOnPriceDrop: true, notifyOnStockAvailable: false };
        const stockItem = { ...baseItem, wishlistItemId: 201, notifyOnPriceDrop: false, notifyOnStockAvailable: true };
        const product = { ...baseProduct, price: 80.00, stockLevel: 5 };
        const notifications = generateNotifications([priceItem, stockItem], [product], []);
        expect(notifications.length).toBe(2);
        const types = notifications.map(n => n.type);
        expect(types).toContain('price_drop');
        expect(types).toContain('stock_available');
    });
});
