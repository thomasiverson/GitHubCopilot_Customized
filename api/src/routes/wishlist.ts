/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: API endpoints for managing user wishlists
 */

/**
 * @swagger
 * /api/wishlist/{userId}:
 *   get:
 *     summary: Get a user's wishlist
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User's wishlist items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WishlistItem'
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Clear a user's wishlist
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       204:
 *         description: Wishlist cleared successfully
 *       404:
 *         description: User not found
 *
 * /api/wishlist:
 *   post:
 *     summary: Add an item to a user's wishlist
 *     tags: [Wishlist]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - productId
 *             properties:
 *               userId:
 *                 type: integer
 *               productId:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item added to wishlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WishlistItem'
 *       400:
 *         description: userId and productId are required, or item already in wishlist
 *       404:
 *         description: User not found
 *
 * /api/wishlist/{userId}/merge:
 *   post:
 *     summary: Merge an anonymous wishlist into a user's wishlist
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productIds
 *             properties:
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Product IDs from the anonymous wishlist
 *     responses:
 *       200:
 *         description: Merged wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WishlistItem'
 *       400:
 *         description: productIds array is required
 *       404:
 *         description: User not found
 *
 * /api/wishlist/{userId}/{productId}:
 *   delete:
 *     summary: Remove a specific item from a user's wishlist
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID to remove
 *     responses:
 *       204:
 *         description: Item removed successfully
 *       404:
 *         description: User or wishlist item not found
 */

import express from 'express';
import { WishlistItem } from '../models/wishlist';
import { users as seedUsers } from '../seedData';
import { wishlistItems as seedWishlistItems } from '../seedData';

const router = express.Router();

let wishlistItems: WishlistItem[] = [...seedWishlistItems];
const users = [...seedUsers];

export const resetWishlist = () => {
    wishlistItems = [...seedWishlistItems];
};

// Helper to check if a user exists
const userExists = (userId: number): boolean => {
    return users.some(u => u.userId === userId);
};

// Helper to get next wishlistId
const nextId = (): number => {
    return wishlistItems.length > 0 ? Math.max(...wishlistItems.map(w => w.wishlistId)) + 1 : 1;
};

// GET /api/wishlist/:userId - Get user wishlist
router.get('/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    if (!userExists(userId)) {
        return res.status(404).json({ error: 'User not found' });
    }
    const items = wishlistItems.filter(w => w.userId === userId);
    return res.json(items);
});

// POST /api/wishlist - Add item to wishlist
router.post('/', (req, res) => {
    const { userId, productId, notes } = req.body as { userId?: number; productId?: number; notes?: string };
    if (userId === undefined || productId === undefined) {
        return res.status(400).json({ error: 'userId and productId are required' });
    }
    if (!userExists(userId)) {
        return res.status(404).json({ error: 'User not found' });
    }
    const alreadyExists = wishlistItems.some(w => w.userId === userId && w.productId === productId);
    if (alreadyExists) {
        return res.status(400).json({ error: 'Item already in wishlist' });
    }
    const newItem: WishlistItem = {
        wishlistId: nextId(),
        userId,
        productId,
        dateAdded: new Date().toISOString(),
        ...(notes !== undefined && { notes })
    };
    wishlistItems.push(newItem);
    return res.status(201).json(newItem);
});

// POST /api/wishlist/:userId/merge - Merge anonymous wishlist
router.post('/:userId/merge', (req, res) => {
    const userId = parseInt(req.params.userId);
    const { productIds } = req.body as { productIds?: number[] };

    if (!Array.isArray(productIds)) {
        return res.status(400).json({ error: 'productIds array is required' });
    }
    if (!userExists(userId)) {
        return res.status(404).json({ error: 'User not found' });
    }

    const existingProductIds = new Set(
        wishlistItems.filter(w => w.userId === userId).map(w => w.productId)
    );

    for (const productId of productIds) {
        if (!existingProductIds.has(productId)) {
            wishlistItems.push({
                wishlistId: nextId(),
                userId,
                productId,
                dateAdded: new Date().toISOString()
            });
            existingProductIds.add(productId);
        }
    }

    const merged = wishlistItems.filter(w => w.userId === userId);
    return res.json(merged);
});

// DELETE /api/wishlist/:userId/:productId - Remove specific item
router.delete('/:userId/:productId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const productId = parseInt(req.params.productId);

    if (!userExists(userId)) {
        return res.status(404).json({ error: 'User not found' });
    }

    const index = wishlistItems.findIndex(w => w.userId === userId && w.productId === productId);
    if (index === -1) {
        return res.status(404).json({ error: 'Wishlist item not found' });
    }
    wishlistItems.splice(index, 1);
    return res.status(204).send();
});

// DELETE /api/wishlist/:userId - Clear wishlist
router.delete('/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    if (!userExists(userId)) {
        return res.status(404).json({ error: 'User not found' });
    }
    wishlistItems = wishlistItems.filter(w => w.userId !== userId);
    return res.status(204).send();
});

export default router;
