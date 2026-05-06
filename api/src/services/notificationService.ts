import { WishlistItem } from '../models/wishlistItem';
import { Product } from '../models/product';
import { Notification } from '../models/notification';

let notificationIdCounter = 100;

/**
 * Check for price drops on wishlist items.
 * Triggers if current product price < priceWhenAdded * 0.9 (10% drop)
 */
export function checkPriceDrops(
    items: WishlistItem[],
    products: Product[],
    existingNotifications: Notification[]
): Notification[] {
    const newNotifications: Notification[] = [];

    for (const item of items) {
        if (!item.notifyOnPriceDrop) continue;

        const product = products.find(p => p.productId === item.productId);
        if (!product) continue;

        const threshold = item.priceWhenAdded * 0.9;
        if (product.price < threshold) {
            // Only create notification if one doesn't already exist for this item
            const alreadyNotified = existingNotifications.some(
                n => n.wishlistItemId === item.wishlistItemId && n.type === 'price_drop' && !n.isRead
            );
            if (!alreadyNotified) {
                const notification: Notification = {
                    notificationId: ++notificationIdCounter,
                    userId: item.userId,
                    type: 'price_drop',
                    productId: product.productId,
                    wishlistItemId: item.wishlistItemId,
                    message: `Price dropped on ${product.name}! Was $${item.priceWhenAdded.toFixed(2)}, now $${product.price.toFixed(2)}`,
                    isRead: false,
                    createdAt: new Date().toISOString(),
                    oldPrice: item.priceWhenAdded,
                    newPrice: product.price
                };
                newNotifications.push(notification);
                console.log(`[NotificationService] Price drop notification: ${notification.message}`);
            }
        }
    }

    return newNotifications;
}

/**
 * Check for stock availability on wishlist items.
 * Triggers if product stockLevel was 0 and is now > 0
 */
export function checkStockAlerts(
    items: WishlistItem[],
    products: (Product & { stockLevel?: number })[],
    existingNotifications: Notification[]
): Notification[] {
    const newNotifications: Notification[] = [];

    for (const item of items) {
        if (!item.notifyOnStockAvailable) continue;

        const product = products.find(p => p.productId === item.productId);
        if (!product) continue;

        // Consider a product in stock if stockLevel > 0 or stockLevel is not defined (assume available)
        const isInStock = product.stockLevel === undefined || product.stockLevel > 0;
        if (isInStock) {
            const alreadyNotified = existingNotifications.some(
                n => n.wishlistItemId === item.wishlistItemId && n.type === 'stock_available' && !n.isRead
            );
            if (!alreadyNotified) {
                const notification: Notification = {
                    notificationId: ++notificationIdCounter,
                    userId: item.userId,
                    type: 'stock_available',
                    productId: product.productId,
                    wishlistItemId: item.wishlistItemId,
                    message: `${product.name} is back in stock!`,
                    isRead: false,
                    createdAt: new Date().toISOString()
                };
                newNotifications.push(notification);
                console.log(`[NotificationService] Stock alert notification: ${notification.message}`);
            }
        }
    }

    return newNotifications;
}

/**
 * Generate notifications by checking both price drops and stock alerts.
 */
export function generateNotifications(
    items: WishlistItem[],
    products: Product[],
    existingNotifications: Notification[]
): Notification[] {
    const priceDropNotifications = checkPriceDrops(items, products, existingNotifications);
    const stockNotifications = checkStockAlerts(items, products, [
        ...existingNotifications,
        ...priceDropNotifications
    ]);
    return [...priceDropNotifications, ...stockNotifications];
}

/**
 * Simulate sending an email notification (mock implementation).
 */
export function sendMockEmail(userId: number, message: string): void {
    console.log(`[MockEmail] Sending to user ${userId}: ${message}`);
}
