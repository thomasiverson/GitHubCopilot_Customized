/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: API endpoints for managing user wishlists
 */

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Get wishlist items for a user
 *     tags: [Wishlist]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's email address
 *     responses:
 *       200:
 *         description: List of wishlist items for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WishlistItem'
 *       400:
 *         description: Missing userId query parameter
 *   post:
 *     summary: Add a product to the wishlist
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
 *                 type: string
 *                 description: The user's email address
 *               productId:
 *                 type: integer
 *                 description: The product ID to add
 *     responses:
 *       201:
 *         description: Wishlist item added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WishlistItem'
 *       409:
 *         description: Item already exists in wishlist
 *
 * /api/wishlist/{productId}:
 *   delete:
 *     summary: Remove a product from the wishlist
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The product ID to remove
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's email address
 *     responses:
 *       204:
 *         description: Wishlist item removed successfully
 *       404:
 *         description: Wishlist item not found
 */

import express from 'express';
import { WishlistItem } from '../models/wishlist';

const router = express.Router();

let wishlistItems: WishlistItem[] = [];

export const resetWishlist = () => {
  wishlistItems = [];
};

// Get wishlist items for a user
router.get('/', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    res.status(400).json({ error: 'Missing userId query parameter' });
  } else {
    const items = wishlistItems.filter(item => item.userId === userId);
    res.json(items);
  }
});

// Add a product to the wishlist
router.post('/', (req, res) => {
  const { userId, productId } = req.body;
  const existing = wishlistItems.find(
    item => item.userId === userId && item.productId === productId
  );
  if (existing) {
    res.status(409).json({ error: 'Item already exists in wishlist' });
  } else {
    const newItem: WishlistItem = {
      userId,
      productId,
      addedAt: new Date().toISOString(),
    };
    wishlistItems.push(newItem);
    res.status(201).json(newItem);
  }
});

// Remove a product from the wishlist
router.delete('/:productId', (req, res) => {
  const { userId } = req.query;
  const productId = parseInt(req.params.productId);
  const index = wishlistItems.findIndex(
    item => item.userId === userId && item.productId === productId
  );
  if (index !== -1) {
    wishlistItems.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Wishlist item not found' });
  }
});

export default router;
