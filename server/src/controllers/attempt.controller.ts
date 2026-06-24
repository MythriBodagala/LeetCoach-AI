import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { analyzeCode } from "../services/ai.service";
const prisma = new PrismaClient();

export const submitAttempt = async (req: Request, res: Response) => {
  const { problemSlug } = req.body; 
  
  if (!req.user) {
    return res.status(401).json({ message: "req.user is missing!" });
  }
  const userId = req.user.userId; 

  try {
    // Generate a pseudo-random numeric ID for leetcodeId required by the schema
    const simulatedLeetcodeId = Math.floor(Math.random() * 2000) + 1;

    // 1. Automatically find or upsert the problem so it always exists
    const problem = await prisma.problem.upsert({
      where: { id: problemSlug },
      update: {},
      create: {
        id: problemSlug,
        // Explicitly type 'w' as a string to clear the implicit any error
        title: problemSlug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        slug: problemSlug,
        difficulty: "Medium", 
        content: `Dynamic workspace context for LeetCode problem: ${problemSlug}`,
        // 🚀 ADDED MANDATORY SCHEMA FIELDS BELOW:
        leetcodeId: simulatedLeetcodeId, 
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)"
      }
    });

    // 2. Create the attempt linked to our guaranteed problem record
    const attempt = await prisma.attempt.create({
      data: {
        userId,
        problemId: problem.id,
        isSuccessful: false,
        timeSpentSec: 0,
        codeSnapshot: "",
      },
    });
    
    res.status(201).json({ 
      id: attempt.id,
      message: 'Dynamic attempt initialized successfully!' 
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ message: 'Error initializing dynamic attempt', error });
  }
};


export const getMyAttempts = async (req: Request, res: Response) => {
  const userId = req.user.userId;

  try {
    const attempts = await prisma.attempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }, // Shows the most recent attempts first
    });
    res.status(200).json(attempts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history', error });
  }
};


export const reviewAttempt = async (req: Request, res: Response) => {
  const { id } = req.params;
  // Read codeSnapshot from the body if the user is sending an updated version
  const { codeSnapshot: bodyCodeSnapshot } = req.body;

  try {
    // 1. Fetch the current attempt to get the baseline data
    const attempt = await prisma.attempt.findUnique({ where: { id } });
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    // Use the code from the body if provided; otherwise fall back to the DB record
    const codeToReview = bodyCodeSnapshot || attempt.codeSnapshot;
    if (!codeToReview) return res.status(400).json({ message: "No code to review" });

    // 2. CACHE CHECK: Look for ANY previous attempt matching this problem and this EXACT code snippet
    const existingCachedAttempt = await prisma.attempt.findFirst({
      where: {
        problemId: attempt.problemId,
        codeSnapshot: codeToReview,
        feedback: {
          not: "" 
        }
      }
    });

    // If we find a matching evaluation, reuse it instantly!
    if (existingCachedAttempt && existingCachedAttempt.feedback) {
      
      const updatedAttempt = await prisma.attempt.update({
        where: { id },
        data: { 
          codeSnapshot: codeToReview, // Keep DB synchronized
          feedback: existingCachedAttempt.feedback 
        },
      });

      return res.status(200).json(updatedAttempt);
    }

    // 3. CACHE MISS: If this specific code snippet hasn't been analyzed yet, call the AI
    const feedback = await analyzeCode(codeToReview);

    // 4. Save the new code state and fresh feedback to the database
    const updatedAttempt = await prisma.attempt.update({
      where: { id },
      data: { 
        codeSnapshot: codeToReview,
        feedback 
      },
    });

    res.status(200).json(updatedAttempt);
  } catch (error: any) {
    console.error("FULL ERROR:", error); 
    res.status(500).json({ message: "AI Review failed", error: error.message });
  }
};