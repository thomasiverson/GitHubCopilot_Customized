/**
 * @swagger
 * components:
 *   schemas:
 *     WishlistItem:
 *       type: object
 *       required:
 *         - userId
 *         - productId
 *         - addedAt
 *       properties:
 *         userId:
 *           type: string
 *           description: The user's email address
 *         productId:
 *           type: integer
 *           description: The unique identifier of the product
 *         addedAt:
 *           type: string
 *           format: date-time
 *           description: ISO date string when the item was added
 */
export interface WishlistItem {
  userId: string;
  productId: number;
  addedAt: string;
}
