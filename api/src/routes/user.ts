/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for managing users
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Returns all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
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

// Add reset function for testing
export const resetUsers = () => {
  users = [...seedUsers];
};

// Get all users
router.get('/', (req, res) => {
  res.json(users);
});

// Get a user by ID
router.get('/:id', (req, res) => {
  const user = users.find(u => u.userId === parseInt(req.params.id));
  if (user) {
    res.json(user);
  } else {
    res.status(404).send('User not found');
  }
});

// Create a new user
router.post('/', (req, res) => {
  const { userId, email, name } = req.body as Partial<User>;
  if (!userId || !email || !name) {
    res.status(400).send('Missing required fields: userId, email, name');
    return;
  }
  if (users.some(u => u.userId === userId)) {
    res.status(409).send('User with this userId already exists');
    return;
  }
  const newUser: User = {
    userId,
    email,
    name,
    createdAt: (req.body as Partial<User>).createdAt || new Date().toISOString()
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

export default router;
