/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - notificationId
 *         - userId
 *         - type
 *         - message
 *       properties:
 *         notificationId:
 *           type: integer
 *           description: The unique identifier for the notification
 *         userId:
 *           type: integer
 *           description: The ID of the user this notification is for
 *         type:
 *           type: string
 *           enum: [price_drop, stock_available]
 *           description: The type of notification
 *         productId:
 *           type: integer
 *           description: The product this notification is about
 *         wishlistItemId:
 *           type: integer
 *           description: The wishlist item this notification is about
 *         message:
 *           type: string
 *           description: The notification message
 *         isRead:
 *           type: boolean
 *           description: Whether the notification has been read
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the notification was created
 *         oldPrice:
 *           type: number
 *           format: float
 *           description: The old price (for price drop notifications)
 *         newPrice:
 *           type: number
 *           format: float
 *           description: The new price (for price drop notifications)
 */
export type NotificationType = 'price_drop' | 'stock_available';

export interface Notification {
    notificationId: number;
    userId: number;
    type: NotificationType;
    productId: number;
    wishlistItemId: number;
    message: string;
    isRead: boolean;
    createdAt: string;
    oldPrice?: number;
    newPrice?: number;
}
