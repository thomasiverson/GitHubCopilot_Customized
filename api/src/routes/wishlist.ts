/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: API endpoints for managing wishlists and collections
 */

/**
 * @swagger
 * /api/wishlist/{userId}/collections:
 *   get:
 *     summary: Get all collections for a user
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
 *         description: List of collections
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WishlistCollection'
 *   post:
 *     summary: Create a new collection
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Collection created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WishlistCollection'
 *
 * /api/wishlist/{userId}/collections/{collectionId}:
 *   put:
 *     summary: Update a collection
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: collectionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Collection updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WishlistCollection'
 *       404:
 *         description: Collection not found
 *   delete:
 *     summary: Delete a collection (items moved to default)
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: collectionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Collection deleted
 *       404:
 *         description: Collection not found
 *
 * /api/wishlist/shared/{token}:
 *   get:
 *     summary: Get a public wishlist collection by share token
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Share token
 *     responses:
 *       200:
 *         description: Collection with items
 *       404:
 *         description: Collection not found or not public
 *
 * /api/wishlist/{userId}/collections/{collectionId}/items:
 *   get:
 *     summary: Get items in a collection
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: collectionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of wishlist items
 *
 * /api/wishlist/{userId}/collections/{collectionId}/share:
 *   post:
 *     summary: Generate a share token for a collection
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: collectionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Share token generated
 *       404:
 *         description: Collection not found
 *   delete:
 *     summary: Revoke sharing for a collection
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: collectionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sharing revoked
 *       404:
 *         description: Collection not found
 *
 * /api/wishlist/{userId}/items:
 *   post:
 *     summary: Add an item to a collection
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *               collectionId:
 *                 type: integer
 *               notes:
 *                 type: string
 *               notifyOnPriceDrop:
 *                 type: boolean
 *               notifyOnStockAvailable:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Item added
 *
 * /api/wishlist/{userId}/items/{itemId}:
 *   put:
 *     summary: Update a wishlist item
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WishlistItem'
 *     responses:
 *       200:
 *         description: Item updated
 *       404:
 *         description: Item not found
 *   delete:
 *     summary: Remove a wishlist item
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Item removed
 *       404:
 *         description: Item not found
 *
 * /api/wishlist/{userId}/notifications:
 *   get:
 *     summary: Get pending notifications for a user
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of notifications
 *
 * /api/wishlist/{userId}/notifications/{notificationId}/dismiss:
 *   post:
 *     summary: Dismiss a notification
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification dismissed
 *       404:
 *         description: Notification not found
 */

import express from 'express';
import { WishlistCollection } from '../models/wishlistCollection';
import { WishlistItem } from '../models/wishlistItem';
import { Notification } from '../models/notification';
import {
    wishlistCollections as seedCollections,
    wishlistItems as seedItems,
    notifications as seedNotifications,
    products as seedProducts
} from '../seedData';

const router = express.Router();

let collections: WishlistCollection[] = [...seedCollections];
let items: WishlistItem[] = [...seedItems];
let notificationsList: Notification[] = [...seedNotifications];
let collectionIdCounter = seedCollections.length + 1;
let itemIdCounter = seedItems.length + 1;

// Reset function for testing
export const resetWishlist = () => {
    collections = [...seedCollections];
    items = [...seedItems];
    notificationsList = [...seedNotifications];
    collectionIdCounter = seedCollections.length + 1;
    itemIdCounter = seedItems.length + 1;
};

// GET /shared/:token - public access, must come before /:userId routes
router.get('/shared/:token', (req, res) => {
    const collection = collections.find(
        c => c.sharedToken === req.params.token && c.isPublic
    );
    if (!collection) {
        res.status(404).json({ error: 'Collection not found or not public' });
    } else {
        const collectionItems = items.filter(i => i.collectionId === collection.collectionId);
        const products = seedProducts.filter(p =>
            collectionItems.some(i => i.productId === p.productId)
        );
        res.json({ collection, items: collectionItems, products });
    }
});

// GET /:userId/collections
router.get('/:userId/collections', (req, res) => {
    const userId = parseInt(req.params.userId);
    const userCollections = collections.filter(c => c.userId === userId);
    res.json(userCollections);
});

// POST /:userId/collections
router.post('/:userId/collections', (req, res) => {
    const userId = parseInt(req.params.userId);
    const { name, description, isPublic } = req.body;
    const newCollection: WishlistCollection = {
        collectionId: collectionIdCounter++,
        userId,
        name: name || 'New Collection',
        description: description || '',
        isPublic: isPublic || false,
        createdAt: new Date().toISOString()
    };
    collections.push(newCollection);
    res.status(201).json(newCollection);
});

// PUT /:userId/collections/:collectionId
router.put('/:userId/collections/:collectionId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const collectionId = parseInt(req.params.collectionId);
    const index = collections.findIndex(
        c => c.collectionId === collectionId && c.userId === userId
    );
    if (index === -1) {
        res.status(404).json({ error: 'Collection not found' });
    } else {
        collections[index] = { ...collections[index], ...req.body, collectionId, userId };
        res.json(collections[index]);
    }
});

// DELETE /:userId/collections/:collectionId
router.delete('/:userId/collections/:collectionId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const collectionId = parseInt(req.params.collectionId);
    const index = collections.findIndex(
        c => c.collectionId === collectionId && c.userId === userId
    );
    if (index === -1) {
        res.status(404).json({ error: 'Collection not found' });
    } else {
        // Move items from this collection to default (null)
        items = items.map(item =>
            item.collectionId === collectionId && item.userId === userId
                ? { ...item, collectionId: null }
                : item
        );
        collections.splice(index, 1);
        res.status(204).send();
    }
});

// GET /:userId/collections/:collectionId/items
router.get('/:userId/collections/:collectionId/items', (req, res) => {
    const userId = parseInt(req.params.userId);
    const collectionId = parseInt(req.params.collectionId);
    const collectionItems = items.filter(
        i => i.collectionId === collectionId && i.userId === userId
    );
    const products = seedProducts.filter(p =>
        collectionItems.some(i => i.productId === p.productId)
    );
    res.json({ items: collectionItems, products });
});

// POST /:userId/collections/:collectionId/share - Generate share token
router.post('/:userId/collections/:collectionId/share', (req, res) => {
    const userId = parseInt(req.params.userId);
    const collectionId = parseInt(req.params.collectionId);
    const index = collections.findIndex(
        c => c.collectionId === collectionId && c.userId === userId
    );
    if (index === -1) {
        res.status(404).json({ error: 'Collection not found' });
    } else {
        const token = `share-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        collections[index] = { ...collections[index], isPublic: true, sharedToken: token };
        res.json({ sharedToken: token, collection: collections[index] });
    }
});

// DELETE /:userId/collections/:collectionId/share - Revoke sharing
router.delete('/:userId/collections/:collectionId/share', (req, res) => {
    const userId = parseInt(req.params.userId);
    const collectionId = parseInt(req.params.collectionId);
    const index = collections.findIndex(
        c => c.collectionId === collectionId && c.userId === userId
    );
    if (index === -1) {
        res.status(404).json({ error: 'Collection not found' });
    } else {
        collections[index] = { ...collections[index], isPublic: false, sharedToken: undefined };
        res.json({ collection: collections[index] });
    }
});

// POST /:userId/items - Add item to wishlist
router.post('/:userId/items', (req, res) => {
    const userId = parseInt(req.params.userId);
    const { productId, collectionId, notes, notifyOnPriceDrop, notifyOnStockAvailable } = req.body;

    // Get current price from products
    const product = seedProducts.find(p => p.productId === productId);
    const priceWhenAdded = product ? product.price : 0;

    const newItem: WishlistItem = {
        wishlistItemId: itemIdCounter++,
        userId,
        productId: productId || 0,
        collectionId: collectionId || null,
        dateAdded: new Date().toISOString(),
        notes: notes || '',
        priceWhenAdded,
        notifyOnPriceDrop: notifyOnPriceDrop || false,
        notifyOnStockAvailable: notifyOnStockAvailable || false
    };
    items.push(newItem);
    res.status(201).json(newItem);
});

// PUT /:userId/items/:itemId - Update a wishlist item
router.put('/:userId/items/:itemId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const itemId = parseInt(req.params.itemId);
    const index = items.findIndex(
        i => i.wishlistItemId === itemId && i.userId === userId
    );
    if (index === -1) {
        res.status(404).json({ error: 'Item not found' });
    } else {
        items[index] = { ...items[index], ...req.body, wishlistItemId: itemId, userId };
        res.json(items[index]);
    }
});

// DELETE /:userId/items/:itemId - Remove a wishlist item
router.delete('/:userId/items/:itemId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const itemId = parseInt(req.params.itemId);
    const index = items.findIndex(
        i => i.wishlistItemId === itemId && i.userId === userId
    );
    if (index === -1) {
        res.status(404).json({ error: 'Item not found' });
    } else {
        items.splice(index, 1);
        res.status(204).send();
    }
});

// GET /:userId/notifications - Get pending notifications
router.get('/:userId/notifications', (req, res) => {
    const userId = parseInt(req.params.userId);
    const userNotifications = notificationsList.filter(
        n => n.userId === userId && !n.isRead
    );
    res.json(userNotifications);
});

// POST /:userId/notifications/:notificationId/dismiss
router.post('/:userId/notifications/:notificationId/dismiss', (req, res) => {
    const userId = parseInt(req.params.userId);
    const notificationId = parseInt(req.params.notificationId);
    const index = notificationsList.findIndex(
        n => n.notificationId === notificationId && n.userId === userId
    );
    if (index === -1) {
        res.status(404).json({ error: 'Notification not found' });
    } else {
        notificationsList[index] = { ...notificationsList[index], isRead: true };
        res.json(notificationsList[index]);
    }
});

export default router;
