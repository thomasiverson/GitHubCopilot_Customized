import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import productRouter, { resetProducts } from './product';
import { products as seedProducts } from '../seedData';

let app: express.Express;

describe('Product API', () => {
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/products', productRouter);
        resetProducts();
    });

    it('should create a new product with valid fields', async () => {
        const newProduct = {
            productId: 99,
            supplierId: 1,
            name: 'Test Product',
            description: 'A test product',
            price: 49.99,
            sku: 'TEST-001',
            unit: 'piece',
            imgName: 'test.png',
        };
        const response = await request(app).post('/products').send(newProduct);
        expect(response.status).toBe(201);
        expect(response.body).toEqual(newProduct);
    });

    it('should return 400 when name is missing', async () => {
        const invalidProduct = {
            productId: 99,
            supplierId: 1,
            price: 49.99,
        };
        const response = await request(app).post('/products').send(invalidProduct);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 when price is missing', async () => {
        const invalidProduct = {
            productId: 99,
            supplierId: 1,
            name: 'Test Product',
        };
        const response = await request(app).post('/products').send(invalidProduct);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 when supplierId is missing', async () => {
        const invalidProduct = {
            productId: 99,
            name: 'Test Product',
            price: 49.99,
        };
        const response = await request(app).post('/products').send(invalidProduct);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 when price is not a positive number', async () => {
        const invalidProduct = {
            productId: 99,
            supplierId: 1,
            name: 'Test Product',
            price: -10,
        };
        const response = await request(app).post('/products').send(invalidProduct);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should get all products', async () => {
        const response = await request(app).get('/products');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(seedProducts.length);
    });

    it('should get a product by ID', async () => {
        const response = await request(app).get('/products/1');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(seedProducts[0]);
    });

    it('should return 404 for non-existing product', async () => {
        const response = await request(app).get('/products/999');
        expect(response.status).toBe(404);
    });
});
