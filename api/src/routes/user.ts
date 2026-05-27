/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for managing users
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Email is required
 *
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */

import express from 'express';
import { User } from '../models/user';
import { users as seedUsers } from '../seedData';

const router = express.Router();

let users: User[] = [...seedUsers];

export const resetUsers = () => {
    users = [...seedUsers];
};

// Get a user by ID
router.get('/:id', (req, res) => {
    const user = users.find(u => u.userId === parseInt(req.params.id));
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// Create a new user
router.post('/', (req, res) => {
    const { email, name } = req.body as Partial<User>;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    const newUser: User = {
        userId: users.length > 0 ? Math.max(...users.map(u => u.userId)) + 1 : 1,
        email,
        name: name ?? email,
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    return res.status(201).json(newUser);
});

export default router;
