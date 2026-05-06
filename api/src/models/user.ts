/**
 * @swagger
 * components:
 *   schemas:
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
 *           format: email
 *           description: The user's email address
 *         name:
 *           type: string
 *           description: The user's display name
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the user was created
 */
export interface User {
    userId: number;
    email: string;
    name: string;
    createdAt: string;
}
