/**
 * @swagger
 * components:
 *   schemas:
 *     UserPreferences:
 *       type: object
 *       properties:
 *         emailNotifications:
 *           type: boolean
 *           description: Whether to send email notifications
 *         priceAlerts:
 *           type: boolean
 *           description: Whether to send price drop alerts
 *         stockAlerts:
 *           type: boolean
 *           description: Whether to send stock availability alerts
 *     User:
 *       type: object
 *       required:
 *         - userId
 *         - email
 *         - name
 *       properties:
 *         userId:
 *           type: integer
 *           description: The unique identifier for the user
 *         email:
 *           type: string
 *           description: User email address
 *         name:
 *           type: string
 *           description: User display name
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the user was created
 *         preferences:
 *           $ref: '#/components/schemas/UserPreferences'
 */
export interface UserPreferences {
    emailNotifications: boolean;
    priceAlerts: boolean;
    stockAlerts: boolean;
}

export interface User {
    userId: number;
    email: string;
    name: string;
    createdAt: string;
    preferences: UserPreferences;
}
