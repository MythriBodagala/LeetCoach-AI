import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Add this interface to tell TypeScript about 'user' on Request
declare global {
  namespace Express {
    interface Request {
      user: any; 
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
       
    req.user = decoded; // This MUST be here!
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};