import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllProblems = async (req: Request, res: Response) => {
  try {
    const problems = await prisma.problem.findMany();
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching problems', error });
  }
};