import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import wishlistRouter, { resetWishlist } from './wishlist';

let app: express.Express;

describe('Wishlist Sharing API', () => {
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/wishlist', wishlistRouter);
        resetWishlist();
    });

    it('should get a public collection by share token', async () => {
        const response = await request(app).get('/wishlist/shared/share-token-abc123');
        expect(response.status).toBe(200);
        expect(response.body.collection).toBeDefined();
        expect(response.body.collection.name).toBe('Tech Gadgets');
        expect(response.body.collection.isPublic).toBe(true);
        expect(response.body.items).toBeDefined();
        expect(response.body.products).toBeDefined();
    });

    it('should return 404 for invalid share token', async () => {
        const response = await request(app).get('/wishlist/shared/invalid-token');
        expect(response.status).toBe(404);
    });

    it('should generate a share token for a collection', async () => {
        // Start with a private collection (collectionId 2)
        const response = await request(app)
            .post('/wishlist/1/collections/2/share');
        expect(response.status).toBe(200);
        expect(response.body.sharedToken).toBeDefined();
        expect(response.body.collection.isPublic).toBe(true);
        expect(response.body.collection.sharedToken).toBe(response.body.sharedToken);
    });

    it('should return 404 when generating share token for non-existent collection', async () => {
        const response = await request(app).post('/wishlist/1/collections/999/share');
        expect(response.status).toBe(404);
    });

    it('should be accessible via share token after generating', async () => {
        // Generate token for collection 2
        const shareResponse = await request(app).post('/wishlist/1/collections/2/share');
        expect(shareResponse.status).toBe(200);
        const token = shareResponse.body.sharedToken;

        // Access via token
        const accessResponse = await request(app).get(`/wishlist/shared/${token}`);
        expect(accessResponse.status).toBe(200);
        expect(accessResponse.body.collection.collectionId).toBe(2);
    });

    it('should revoke sharing for a collection', async () => {
        // Collection 1 has sharedToken set
        const response = await request(app)
            .delete('/wishlist/1/collections/1/share');
        expect(response.status).toBe(200);
        expect(response.body.collection.isPublic).toBe(false);
        expect(response.body.collection.sharedToken).toBeUndefined();
    });

    it('should return 404 when accessing revoked shared collection', async () => {
        // Revoke sharing for collection 1
        await request(app).delete('/wishlist/1/collections/1/share');

        // Old token should no longer work
        const response = await request(app).get('/wishlist/shared/share-token-abc123');
        expect(response.status).toBe(404);
    });

    it('should return 404 when revoking sharing for non-existent collection', async () => {
        const response = await request(app).delete('/wishlist/1/collections/999/share');
        expect(response.status).toBe(404);
    });

    it('should not allow access to private collection without valid token', async () => {
        // Collection 2 is private and has no sharedToken
        const response = await request(app).get('/wishlist/shared/share-token-for-private');
        expect(response.status).toBe(404);
    });
});
