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
 *         - dateAdded
 *       properties:
 *         wishlistId:
 *           type: integer
 *           description: The unique identifier for the wishlist item
 *         userId:
 *           type: integer
 *           description: The ID of the user who owns this wishlist item
 *         productId:
 *           type: integer
 *           description: The ID of the product in the wishlist
 *         dateAdded:
 *           type: string
 *           format: date-time
 *           description: When the item was added to the wishlist
 *         notes:
 *           type: string
 *           description: Optional notes about the wishlist item
 */
export interface WishlistItem {
    wishlistId: number;
    userId: number;
    productId: number;
    dateAdded: string;
    notes?: string;
}
