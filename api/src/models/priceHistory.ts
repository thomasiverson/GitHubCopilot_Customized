/**
 * @swagger
 * components:
 *   schemas:
 *     PriceHistory:
 *       type: object
 *       required:
 *         - priceHistoryId
 *         - productId
 *         - price
 *         - recordedAt
 *       properties:
 *         priceHistoryId:
 *           type: integer
 *           description: The unique identifier for this price history record
 *         productId:
 *           type: integer
 *           description: The ID of the product
 *         price:
 *           type: number
 *           format: float
 *           description: The price at this point in time
 *         recordedAt:
 *           type: string
 *           format: date-time
 *           description: When this price was recorded
 */
export interface PriceHistory {
    priceHistoryId: number;
    productId: number;
    price: number;
    recordedAt: string;
}
