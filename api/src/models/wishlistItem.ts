/**
 * @swagger
 * components:
 *   schemas:
 *     WishlistItem:
 *       type: object
 *       required:
 *         - wishlistItemId
 *         - userId
 *         - productId
 *       properties:
 *         wishlistItemId:
 *           type: integer
 *           description: The unique identifier for the wishlist item
 *         userId:
 *           type: integer
 *           description: The ID of the user who owns this item
 *         productId:
 *           type: integer
 *           description: The ID of the product
 *         collectionId:
 *           type: integer
 *           description: The ID of the collection this item belongs to (null for default)
 *         dateAdded:
 *           type: string
 *           format: date-time
 *           description: When the item was added to the wishlist
 *         notes:
 *           type: string
 *           description: Optional notes about the item
 *         priceWhenAdded:
 *           type: number
 *           format: float
 *           description: The price of the product when it was added
 *         notifyOnPriceDrop:
 *           type: boolean
 *           description: Whether to notify the user when the price drops
 *         notifyOnStockAvailable:
 *           type: boolean
 *           description: Whether to notify the user when back in stock
 */
export interface WishlistItem {
    wishlistItemId: number;
    userId: number;
    productId: number;
    collectionId: number | null;
    dateAdded: string;
    notes: string;
    priceWhenAdded: number;
    notifyOnPriceDrop: boolean;
    notifyOnStockAvailable: boolean;
}
