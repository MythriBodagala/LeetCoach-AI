import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash: hashedPassword, name }
    });

    // Generate a JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'supersecret', {
      expiresIn: '7d',
    });

    res.status(201).json({ 
        message: 'User created successfully', 
        token, 
        userId: user.id 
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // 1. Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
  return res.status(401).json({ error: 'Invalid email or password' });
}

    // 2. Compare passwords (matching your database column passwordHash)
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 3. Generate the identical JWT token layout as your registration
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'supersecret', {
      expiresIn: '7d',
    });

    // 4. Return successful response
    return res.status(200).json({
      message: 'Login successful',
      token,
      userId: user.id
    });

  } catch (error) {
    return res.status(500).json({ error: 'Login failed' });
  }
};