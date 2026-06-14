import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/stats", async (_req, res) => {
  console.log("GET /stats called");
  try {
    const [
      totalMembers,
      atRisk,
      goldMembers,
      silverMembers,
      basicMembers,
      highRisk,
      mediumRisk,
      lowRisk,
      engagementData,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { churnRisk: "HIGH" } }),
      prisma.member.count({ where: { membershipType: "GOLD" } }),
      prisma.member.count({ where: { membershipType: "SILVER" } }),
      prisma.member.count({ where: { membershipType: "BASIC" } }),
      prisma.member.count({ where: { churnRisk: "HIGH" } }),
      prisma.member.count({ where: { churnRisk: "MEDIUM" } }),
      prisma.member.count({ where: { churnRisk: "LOW" } }),
      prisma.member.aggregate({ _avg: { engagementScore: true } }),
    ]);

    const result = {
      totalMembers,
      atRisk,
      goldMembers,
      silverMembers,
      basicMembers,
      highRisk,
      mediumRisk,
      lowRisk,
      avgEngagement: Math.round(engagementData._avg.engagementScore || 0),
    };

    console.log("Stats result:", { totalMembers, atRisk });
    res.json(result);
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/at-risk", async (_req, res) => {
  try {
    const members = await prisma.member.findMany({
      where: { churnRisk: "HIGH" },
      orderBy: { lastVisit: "asc" },
      take: 10,
    });
    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { churnRisk, membershipType, search } = req.query;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (churnRisk) where.churnRisk = churnRisk;
    if (membershipType) where.membershipType = membershipType;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const members = await prisma.member.findMany({
      where,
      orderBy: { engagementScore: "asc" },
      include: {
        _count: { select: { visits: true } },
      },
    });

    res.json(members);
  } catch (error) {
    console.error("Members error:", error);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.params.id },
      include: {
        visits: {
          orderBy: { date: "desc" },
          take: 10,
        },
        logs: {
          include: { campaign: true },
          orderBy: { sentAt: "desc" },
          take: 10,
        },
      },
    });

    if (!member) {
      res.status(404).json({ error: "Member not found" });
      return;
    }

    res.json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed" });
  }
});

export default router;
