/**
 * @swagger
 * components:
 *   schemas:
 *     WishlistCollection:
 *       type: object
 *       required:
 *         - collectionId
 *         - userId
 *         - name
 *       properties:
 *         collectionId:
 *           type: integer
 *           description: The unique identifier for the collection
 *         userId:
 *           type: integer
 *           description: The ID of the user who owns this collection
 *         name:
 *           type: string
 *           description: Name of the collection
 *         description:
 *           type: string
 *           description: Optional description of the collection
 *         isPublic:
 *           type: boolean
 *           description: Whether the collection is publicly accessible
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the collection was created
 *         sharedToken:
 *           type: string
 *           description: Token used for sharing the collection publicly
 */
export interface WishlistCollection {
    collectionId: number;
    userId: number;
    name: string;
    description: string;
    isPublic: boolean;
    createdAt: string;
    sharedToken?: string;
}
