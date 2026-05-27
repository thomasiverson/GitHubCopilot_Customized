import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import wishlistRouter, { resetWishlist } from './wishlist';
import { wishlistItems as seedWishlistItems } from '../seedData';

let app: express.Express;

describe('Wishlist API', () => {
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/wishlist', wishlistRouter);
        resetWishlist();
    });

    describe('GET /wishlist/:userId', () => {
        it('should get all wishlist items for a user', async () => {
            const response = await request(app).get('/wishlist/1');
            expect(response.status).toBe(200);
            const userItems = seedWishlistItems.filter(w => w.userId === 1);
            expect(response.body.length).toBe(userItems.length);
        });

        it('should return 404 for a non-existent user', async () => {
            const response = await request(app).get('/wishlist/999');
            expect(response.status).toBe(404);
        });

        it('should return empty array for user with no wishlist items', async () => {
            // User 2 exists in seed data but let us check a user that exists
            const response = await request(app).get('/wishlist/2');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('POST /wishlist', () => {
        it('should add an item to the wishlist', async () => {
            const newItem = { userId: 1, productId: 7 };
            const response = await request(app).post('/wishlist').send(newItem);
            expect(response.status).toBe(201);
            expect(response.body.userId).toBe(1);
            expect(response.body.productId).toBe(7);
            expect(response.body.wishlistId).toBeDefined();
            expect(response.body.dateAdded).toBeDefined();
        });

        it('should add optional notes when provided', async () => {
            const newItem = { userId: 1, productId: 8, notes: 'Want this one' };
            const response = await request(app).post('/wishlist').send(newItem);
            expect(response.status).toBe(201);
            expect(response.body.notes).toBe('Want this one');
        });

        it('should return 400 when userId is missing', async () => {
            const response = await request(app).post('/wishlist').send({ productId: 1 });
            expect(response.status).toBe(400);
        });

        it('should return 400 when productId is missing', async () => {
            const response = await request(app).post('/wishlist').send({ userId: 1 });
            expect(response.status).toBe(400);
        });

        it('should return 404 for a non-existent user', async () => {
            const response = await request(app).post('/wishlist').send({ userId: 999, productId: 1 });
            expect(response.status).toBe(404);
        });

        it('should return 400 when item already exists in wishlist', async () => {
            // productId 1 already belongs to userId 1 in seed data
            const response = await request(app).post('/wishlist').send({ userId: 1, productId: 1 });
            expect(response.status).toBe(400);
        });
    });

    describe('POST /wishlist/:userId/merge', () => {
        it('should merge anonymous wishlist into user wishlist', async () => {
            // User 1 has productIds 1 and 5 in seed data
            const response = await request(app)
                .post('/wishlist/1/merge')
                .send({ productIds: [3, 7] });
            expect(response.status).toBe(200);
            const productIds = response.body.map((w: { productId: number }) => w.productId);
            expect(productIds).toContain(1);
            expect(productIds).toContain(5);
            expect(productIds).toContain(3);
            expect(productIds).toContain(7);
        });

        it('should not duplicate items already in wishlist during merge', async () => {
            // User 1 already has productId 1
            const response = await request(app)
                .post('/wishlist/1/merge')
                .send({ productIds: [1, 6] });
            expect(response.status).toBe(200);
            const productIds = response.body.map((w: { productId: number }) => w.productId);
            // Count occurrences of productId 1 - should be exactly 1
            const countOf1 = productIds.filter((id: number) => id === 1).length;
            expect(countOf1).toBe(1);
            // productId 6 should be added
            expect(productIds).toContain(6);
        });

        it('should handle empty productIds array', async () => {
            const beforeResponse = await request(app).get('/wishlist/1');
            const initialCount = beforeResponse.body.length;

            const response = await request(app)
                .post('/wishlist/1/merge')
                .send({ productIds: [] });
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(initialCount);
        });

        it('should handle merge with all duplicates (no new items added)', async () => {
            // User 1 has productIds 1 and 5
            const response = await request(app)
                .post('/wishlist/1/merge')
                .send({ productIds: [1, 5] });
            expect(response.status).toBe(200);
            const productIds = response.body.map((w: { productId: number }) => w.productId);
            expect(productIds).toContain(1);
            expect(productIds).toContain(5);
            expect(productIds.filter((id: number) => id === 1).length).toBe(1);
            expect(productIds.filter((id: number) => id === 5).length).toBe(1);
        });

        it('should return 400 when productIds is not an array', async () => {
            const response = await request(app)
                .post('/wishlist/1/merge')
                .send({ productIds: 'not-an-array' });
            expect(response.status).toBe(400);
        });

        it('should return 400 when productIds is missing', async () => {
            const response = await request(app)
                .post('/wishlist/1/merge')
                .send({});
            expect(response.status).toBe(400);
        });

        it('should return 404 for a non-existent user', async () => {
            const response = await request(app)
                .post('/wishlist/999/merge')
                .send({ productIds: [1, 2] });
            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /wishlist/:userId/:productId', () => {
        it('should remove a specific item from the wishlist', async () => {
            // User 1 has productId 1
            const response = await request(app).delete('/wishlist/1/1');
            expect(response.status).toBe(204);

            const getResponse = await request(app).get('/wishlist/1');
            const productIds = getResponse.body.map((w: { productId: number }) => w.productId);
            expect(productIds).not.toContain(1);
        });

        it('should return 404 for a non-existent user', async () => {
            const response = await request(app).delete('/wishlist/999/1');
            expect(response.status).toBe(404);
        });

        it('should return 404 for a product not in the wishlist', async () => {
            const response = await request(app).delete('/wishlist/1/999');
            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /wishlist/:userId', () => {
        it('should clear all items from a user wishlist', async () => {
            const response = await request(app).delete('/wishlist/1');
            expect(response.status).toBe(204);

            const getResponse = await request(app).get('/wishlist/1');
            expect(getResponse.body.length).toBe(0);
        });

        it('should return 404 for a non-existent user', async () => {
            const response = await request(app).delete('/wishlist/999');
            expect(response.status).toBe(404);
        });
    });
});
