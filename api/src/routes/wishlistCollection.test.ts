import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import wishlistRouter, { resetWishlist } from './wishlist';
import { wishlistCollections as seedCollections } from '../seedData';

let app: express.Express;

describe('Wishlist Collection API', () => {
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/wishlist', wishlistRouter);
        resetWishlist();
    });

    it('should get collections for a user', async () => {
        const response = await request(app).get('/wishlist/1/collections');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        const userCollections = seedCollections.filter(c => c.userId === 1);
        expect(response.body.length).toBe(userCollections.length);
    });

    it('should return empty array for user with no collections', async () => {
        const response = await request(app).get('/wishlist/999/collections');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('should create a new collection', async () => {
        const newCollection = {
            name: 'My New Collection',
            description: 'A test collection',
            isPublic: false
        };
        const response = await request(app)
            .post('/wishlist/1/collections')
            .send(newCollection);
        expect(response.status).toBe(201);
        expect(response.body.name).toBe('My New Collection');
        expect(response.body.description).toBe('A test collection');
        expect(response.body.isPublic).toBe(false);
        expect(response.body.userId).toBe(1);
        expect(response.body.collectionId).toBeDefined();
    });

    it('should update a collection', async () => {
        const update = {
            name: 'Updated Tech Gadgets',
            description: 'Updated description',
            isPublic: true
        };
        const response = await request(app)
            .put('/wishlist/1/collections/1')
            .send(update);
        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Updated Tech Gadgets');
        expect(response.body.collectionId).toBe(1);
        expect(response.body.userId).toBe(1);
    });

    it('should return 404 when updating non-existent collection', async () => {
        const response = await request(app)
            .put('/wishlist/1/collections/999')
            .send({ name: 'Test' });
        expect(response.status).toBe(404);
    });

    it('should delete a collection and move items to default', async () => {
        const response = await request(app).delete('/wishlist/1/collections/1');
        expect(response.status).toBe(204);

        // Collection should no longer exist
        const collectionsResponse = await request(app).get('/wishlist/1/collections');
        const deleted = collectionsResponse.body.find((c: { collectionId: number }) => c.collectionId === 1);
        expect(deleted).toBeUndefined();

        // Items from the deleted collection should still be accessible (moved to null)
        const itemsResponse = await request(app).get('/wishlist/1/collections/1/items');
        expect(itemsResponse.body.items).toEqual([]);
    });

    it('should return 404 when deleting non-existent collection', async () => {
        const response = await request(app).delete('/wishlist/1/collections/999');
        expect(response.status).toBe(404);
    });

    it('should get items in a collection', async () => {
        const response = await request(app).get('/wishlist/1/collections/1/items');
        expect(response.status).toBe(200);
        expect(response.body.items).toBeDefined();
        expect(Array.isArray(response.body.items)).toBe(true);
        expect(response.body.products).toBeDefined();
    });

    it('should add an item to a collection', async () => {
        const newItem = {
            productId: 3,
            collectionId: 1,
            notes: 'Test notes',
            notifyOnPriceDrop: true,
            notifyOnStockAvailable: false
        };
        const response = await request(app)
            .post('/wishlist/1/items')
            .send(newItem);
        expect(response.status).toBe(201);
        expect(response.body.productId).toBe(3);
        expect(response.body.collectionId).toBe(1);
        expect(response.body.notes).toBe('Test notes');
        expect(response.body.notifyOnPriceDrop).toBe(true);
    });

    it('should update a wishlist item', async () => {
        const update = {
            notes: 'Updated notes',
            notifyOnPriceDrop: false
        };
        const response = await request(app)
            .put('/wishlist/1/items/1')
            .send(update);
        expect(response.status).toBe(200);
        expect(response.body.notes).toBe('Updated notes');
        expect(response.body.notifyOnPriceDrop).toBe(false);
    });

    it('should return 404 when updating non-existent item', async () => {
        const response = await request(app)
            .put('/wishlist/1/items/999')
            .send({ notes: 'Test' });
        expect(response.status).toBe(404);
    });

    it('should delete a wishlist item', async () => {
        const response = await request(app).delete('/wishlist/1/items/1');
        expect(response.status).toBe(204);

        // Item should no longer be in the collection
        const itemsResponse = await request(app).get('/wishlist/1/collections/1/items');
        const deleted = itemsResponse.body.items.find((i: { wishlistItemId: number }) => i.wishlistItemId === 1);
        expect(deleted).toBeUndefined();
    });

    it('should return 404 when deleting non-existent item', async () => {
        const response = await request(app).delete('/wishlist/1/items/999');
        expect(response.status).toBe(404);
    });
});
