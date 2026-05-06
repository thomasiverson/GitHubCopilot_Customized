/**
 * @swagger
 * components:
 *   schemas:
 *     WishlistItem:
 *       type: object
 *       required:
 *         - wishlistId
 *         - userId
 *         - productId
 *       properties:
 *         wishlistId:
 *           type: integer
 *           description: The unique identifier for the wishlist item
 *         userId:
 *           type: integer
 *           description: The ID of the user who owns this wishlist item
 *         productId:
 *           type: integer
 *           description: The ID of the product added to the wishlist
 *         dateAdded:
 *           type: string
 *           format: date-time
 *           description: The date and time the item was added to the wishlist
 */
export interface WishlistItem {
    wishlistId: number;
    userId: number;
    productId: number;
    dateAdded: string;
}
