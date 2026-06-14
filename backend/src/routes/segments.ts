import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const segments = await prisma.segment.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(segments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch segments" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, description, rules } = req.body as {
      name: string;
      description: string;
      rules: Record<string, unknown>;
    };

    if (!name || !description || !rules) {
      res.status(400).json({ error: "name, description, and rules are required" });
      return;
    }

    const segment = await prisma.segment.create({
      data: { name, description, rules: rules as any },
    });

    res.status(201).json(segment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create segment" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.segment.delete({ where: { id: req.params.id } });
    res.json({ message: "Segment deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete segment" });
  }
});

export default router;
