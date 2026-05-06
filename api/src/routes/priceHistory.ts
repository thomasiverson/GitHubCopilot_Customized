/**
 * @swagger
 * tags:
 *   name: PriceHistory
 *   description: API endpoints for tracking product price history
 */

/**
 * @swagger
 * /api/price-history/{productId}:
 *   get:
 *     summary: Get price history for a product
 *     tags: [PriceHistory]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: List of price records for the product
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PriceHistory'
 *
 * /api/price-history:
 *   post:
 *     summary: Add a price record (background job simulation)
 *     tags: [PriceHistory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - price
 *             properties:
 *               productId:
 *                 type: integer
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Price record added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PriceHistory'
 */

import express from 'express';
import { PriceHistory } from '../models/priceHistory';
import { priceHistory as seedPriceHistory } from '../seedData';

const router = express.Router();

let priceHistoryRecords: PriceHistory[] = [...seedPriceHistory];
let priceHistoryIdCounter = seedPriceHistory.length + 1;

// Reset function for testing
export const resetPriceHistory = () => {
    priceHistoryRecords = [...seedPriceHistory];
    priceHistoryIdCounter = seedPriceHistory.length + 1;
};

// GET /:productId - Get price history for a product
router.get('/:productId', (req, res) => {
    const productId = parseInt(req.params.productId);
    const history = priceHistoryRecords
        .filter(h => h.productId === productId)
        .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
    res.json(history);
});

// POST / - Add a price record
router.post('/', (req, res) => {
    const { productId, price } = req.body;
    if (!productId || price === undefined) {
        return res.status(400).json({ error: 'productId and price are required' });
    }
    const newRecord: PriceHistory = {
        priceHistoryId: priceHistoryIdCounter++,
        productId,
        price,
        recordedAt: new Date().toISOString()
    };
    priceHistoryRecords.push(newRecord);
    return res.status(201).json(newRecord);
});

export default router;
