import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import wishlistRouter, { resetWishlist } from './wishlist';
import { wishlistItems as seedWishlistItems, users as seedUsers, products as seedProducts } from '../seedData';

let app: express.Express;

describe('Wishlist API', () => {
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/wishlist', wishlistRouter);
        resetWishlist();
    });

    it('should get wishlist items for a user', async () => {
        const userId = seedUsers[0].userId;
        const response = await request(app).get(`/wishlist/${userId}`);
        expect(response.status).toBe(200);
        const expected = seedWishlistItems.filter(item => item.userId === userId);
        expect(response.body.length).toBe(expected.length);
        response.body.forEach((item: { userId: number; productId: number }) => {
            expect(item.userId).toBe(userId);
        });
    });

    it('should return 404 for non-existing user when getting wishlist', async () => {
        const response = await request(app).get('/wishlist/999');
        expect(response.status).toBe(404);
    });

    it('should add a product to the wishlist', async () => {
        const userId = seedUsers[0].userId;
        const productId = seedProducts[1].productId; // product not yet in user 1's wishlist
        // Find a product not already in user 1's wishlist
        const existingProductIds = seedWishlistItems
            .filter(item => item.userId === userId)
            .map(item => item.productId);
        const newProductId = seedProducts.find(p => !existingProductIds.includes(p.productId))!.productId;

        const response = await request(app)
            .post('/wishlist')
            .send({ userId, productId: newProductId });

        expect(response.status).toBe(201);
        expect(response.body.userId).toBe(userId);
        expect(response.body.productId).toBe(newProductId);
        expect(response.body.wishlistId).toBeDefined();
        expect(response.body.dateAdded).toBeDefined();
    });

    it('should return 404 when adding item with non-existing user', async () => {
        const response = await request(app)
            .post('/wishlist')
            .send({ userId: 999, productId: seedProducts[0].productId });
        expect(response.status).toBe(404);
    });

    it('should return 404 when adding item with non-existing product', async () => {
        const response = await request(app)
            .post('/wishlist')
            .send({ userId: seedUsers[0].userId, productId: 999 });
        expect(response.status).toBe(404);
    });

    it('should return 409 when adding a duplicate item to the wishlist', async () => {
        const existingItem = seedWishlistItems[0];
        const response = await request(app)
            .post('/wishlist')
            .send({ userId: existingItem.userId, productId: existingItem.productId });
        expect(response.status).toBe(409);
    });

    it('should remove a product from the wishlist', async () => {
        const existingItem = seedWishlistItems[0];
        const response = await request(app)
            .delete(`/wishlist/${existingItem.userId}/${existingItem.productId}`);
        expect(response.status).toBe(204);

        // Verify it's gone
        const checkResponse = await request(app)
            .get(`/wishlist/${existingItem.userId}/check/${existingItem.productId}`);
        expect(checkResponse.body.inWishlist).toBe(false);
    });

    it('should return 404 when removing non-existing wishlist item', async () => {
        const response = await request(app).delete('/wishlist/999/999');
        expect(response.status).toBe(404);
    });

    it('should clear all wishlist items for a user', async () => {
        const userId = seedUsers[0].userId;
        const response = await request(app).delete(`/wishlist/${userId}`);
        expect(response.status).toBe(204);

        // Verify wishlist is empty
        const getResponse = await request(app).get(`/wishlist/${userId}`);
        expect(getResponse.status).toBe(200);
        expect(getResponse.body.length).toBe(0);
    });

    it('should return 404 when clearing wishlist for non-existing user', async () => {
        const response = await request(app).delete('/wishlist/999');
        expect(response.status).toBe(404);
    });

    it('should check if a product is in the wishlist (true)', async () => {
        const existingItem = seedWishlistItems[0];
        const response = await request(app)
            .get(`/wishlist/${existingItem.userId}/check/${existingItem.productId}`);
        expect(response.status).toBe(200);
        expect(response.body.inWishlist).toBe(true);
    });

    it('should check if a product is in the wishlist (false)', async () => {
        const userId = seedUsers[0].userId;
        const response = await request(app)
            .get(`/wishlist/${userId}/check/999`);
        expect(response.status).toBe(200);
        expect(response.body.inWishlist).toBe(false);
    });
});
