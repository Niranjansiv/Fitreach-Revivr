import { Router, Request, Response } from "express";
import axios from "axios";
import prisma from "../lib/prisma";
import { Channel, ChurnRisk, MembershipType } from "@prisma/client";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: { segment: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(campaigns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, segmentId, message, channel } = req.body as {
      name: string;
      segmentId: string;
      message: string;
      channel: Channel;
    };

    if (!name || !segmentId || !message || !channel) {
      res.status(400).json({ error: "name, segmentId, message, and channel are required" });
      return;
    }

    const campaign = await prisma.campaign.create({
      data: { name, segmentId, message, channel },
      include: { segment: true },
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create campaign" });
  }
});

router.post("/:id/send", async (req: Request, res: Response) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: { segment: true },
    });

    if (!campaign) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    const rules = campaign.segment.rules as {
      churnRisk?: ChurnRisk;
      membershipType?: MembershipType;
    };

    const memberWhere: { churnRisk?: ChurnRisk; membershipType?: MembershipType } = {};
    if (rules.churnRisk) memberWhere.churnRisk = rules.churnRisk;
    if (rules.membershipType) memberWhere.membershipType = rules.membershipType;

    const members = await prisma.member.findMany({ where: memberWhere });

    const logs = await Promise.all(
      members.map((member) =>
        prisma.communicationLog.create({
          data: {
            campaignId: campaign.id,
            memberId: member.id,
            status: "SENT",
          },
        })
      )
    );

    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: "RUNNING",
        totalSent: logs.length,
      },
    });

    await prisma.segment.update({
      where: { id: campaign.segmentId },
      data: { memberCount: members.length },
    });

    const channelServiceUrl = process.env.CHANNEL_SERVICE_URL ?? "http://localhost:4001";

    await Promise.allSettled(
      members.map((member, idx) =>
        axios.post(`${channelServiceUrl}/send`, {
          communicationLogId: logs[idx].id,
          channel: campaign.channel,
          to: member.phone,
          message: campaign.message,
          memberName: member.name,
        })
      )
    );

    res.json({ message: "Campaign launched", sent: logs.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send campaign" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: {
        segment: true,
        logs: {
          include: { member: true },
          orderBy: { sentAt: "desc" },
        },
      },
    });

    if (!campaign) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    res.json(campaign);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch campaign" });
  }
});

export default router;
