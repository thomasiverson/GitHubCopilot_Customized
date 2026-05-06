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
 *     summary: Get wishlist items for a user
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
 *         description: List of wishlist items for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WishlistItem'
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Clear all wishlist items for a user
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
 *                 type: integer
 *                 description: The user's ID
 *               productId:
 *                 type: integer
 *                 description: The product's ID
 *     responses:
 *       201:
 *         description: Item added to wishlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WishlistItem'
 *       404:
 *         description: User or product not found
 *       409:
 *         description: Item already in wishlist
 *
 * /api/wishlist/{userId}/{productId}:
 *   delete:
 *     summary: Remove a product from the wishlist
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
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Item removed from wishlist
 *       404:
 *         description: Wishlist item not found
 *
 * /api/wishlist/{userId}/check/{productId}:
 *   get:
 *     summary: Check if a product is in the user's wishlist
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
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inWishlist:
 *                   type: boolean
 *                   description: Whether the product is in the wishlist
 */

import express from 'express';
import { WishlistItem } from '../models/wishlist';
import { wishlistItems as seedWishlistItems, users as seedUsers, products as seedProducts } from '../seedData';

const router = express.Router();

let wishlistItems: WishlistItem[] = [...seedWishlistItems];
let nextWishlistId = wishlistItems.length + 1;

// Add reset function for testing
export const resetWishlist = () => {
  wishlistItems = [...seedWishlistItems];
  nextWishlistId = wishlistItems.length + 1;
};

// GET /api/wishlist/:userId - Get user's wishlist items
router.get('/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = seedUsers.find(u => u.userId === userId);
  if (!user) {
    res.status(404).send('User not found');
    return;
  }
  const items = wishlistItems.filter(item => item.userId === userId);
  res.json(items);
});

// POST /api/wishlist - Add item to wishlist
router.post('/', (req, res) => {
  const { userId, productId } = req.body as { userId: number; productId: number };

  const user = seedUsers.find(u => u.userId === userId);
  if (!user) {
    res.status(404).send('User not found');
    return;
  }

  const product = seedProducts.find(p => p.productId === productId);
  if (!product) {
    res.status(404).send('Product not found');
    return;
  }

  const existing = wishlistItems.find(
    item => item.userId === userId && item.productId === productId
  );
  if (existing) {
    res.status(409).send('Item already in wishlist');
    return;
  }

  const newItem: WishlistItem = {
    wishlistId: nextWishlistId++,
    userId,
    productId,
    dateAdded: new Date().toISOString()
  };
  wishlistItems.push(newItem);
  res.status(201).json(newItem);
});

// DELETE /api/wishlist/:userId/:productId - Remove item from wishlist
router.delete('/:userId/:productId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const productId = parseInt(req.params.productId);

  const index = wishlistItems.findIndex(
    item => item.userId === userId && item.productId === productId
  );
  if (index !== -1) {
    wishlistItems.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).send('Wishlist item not found');
  }
});

// DELETE /api/wishlist/:userId - Clear entire wishlist
router.delete('/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = seedUsers.find(u => u.userId === userId);
  if (!user) {
    res.status(404).send('User not found');
    return;
  }
  wishlistItems = wishlistItems.filter(item => item.userId !== userId);
  res.status(204).send();
});

// GET /api/wishlist/:userId/check/:productId - Check if product in wishlist
router.get('/:userId/check/:productId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const productId = parseInt(req.params.productId);
  const inWishlist = wishlistItems.some(
    item => item.userId === userId && item.productId === productId
  );
  res.json({ inWishlist });
});

export default router;
