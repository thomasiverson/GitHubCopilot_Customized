import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import wishlistRouter, { resetWishlist } from './wishlist';

let app: express.Express;

describe('Wishlist API', () => {
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/api/wishlist', wishlistRouter);
        resetWishlist();
    });

    it('should return 400 when userId is missing on GET', async () => {
        const response = await request(app).get('/api/wishlist');
        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
    });

    it('should return empty array for a user with no wishlist items', async () => {
        const response = await request(app).get('/api/wishlist?userId=test@example.com');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('should add a product to the wishlist', async () => {
        const response = await request(app)
            .post('/api/wishlist')
            .send({ userId: 'test@example.com', productId: 1 });
        expect(response.status).toBe(201);
        expect(response.body.userId).toBe('test@example.com');
        expect(response.body.productId).toBe(1);
        expect(response.body.addedAt).toBeDefined();
    });

    it('should return 409 when adding a duplicate wishlist item', async () => {
        await request(app)
            .post('/api/wishlist')
            .send({ userId: 'test@example.com', productId: 1 });
        const response = await request(app)
            .post('/api/wishlist')
            .send({ userId: 'test@example.com', productId: 1 });
        expect(response.status).toBe(409);
        expect(response.body.error).toBeDefined();
    });

    it('should retrieve wishlist items for a user', async () => {
        await request(app)
            .post('/api/wishlist')
            .send({ userId: 'test@example.com', productId: 1 });
        await request(app)
            .post('/api/wishlist')
            .send({ userId: 'test@example.com', productId: 2 });

        const response = await request(app).get('/api/wishlist?userId=test@example.com');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
    });

    it('should only return items for the specified user', async () => {
        await request(app)
            .post('/api/wishlist')
            .send({ userId: 'user1@example.com', productId: 1 });
        await request(app)
            .post('/api/wishlist')
            .send({ userId: 'user2@example.com', productId: 2 });

        const response = await request(app).get('/api/wishlist?userId=user1@example.com');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].userId).toBe('user1@example.com');
    });

    it('should delete a wishlist item', async () => {
        await request(app)
            .post('/api/wishlist')
            .send({ userId: 'test@example.com', productId: 1 });

        const response = await request(app)
            .delete('/api/wishlist/1?userId=test@example.com');
        expect(response.status).toBe(204);
    });

    it('should return 404 when deleting a non-existing wishlist item', async () => {
        const response = await request(app)
            .delete('/api/wishlist/999?userId=test@example.com');
        expect(response.status).toBe(404);
        expect(response.body.error).toBeDefined();
    });
});
